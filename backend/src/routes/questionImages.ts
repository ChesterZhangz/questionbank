import express, { Response } from 'express';
import { body, param, validationResult } from 'express-validator';
import { AuthRequest, authMiddleware } from '../middleware/auth';
import { uploadMultipleImages, uploadSingleImage, handleUploadError } from '../middleware/imageUpload';
import imageService from '../services/imageService';
import { Question } from '../models/Question';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// 获取题目的所有图片
router.get('/:questionId/images', [
  param('questionId').isMongoId().withMessage('无效的题目ID')
], authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, error: '参数验证失败', details: errors.array() });
    }

    const { questionId } = req.params;

    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({ success: false, error: '题目不存在' });
    }

    // 检查用户权限（简化版，可以根据需要扩展）
    const userId = req.user!._id.toString();
    if (question.creator.toString() !== userId) {
      return res.status(403).json({ success: false, error: '权限不足' });
    }

    return res.json({
      success: true,
      data: question.images || []
    });
  } catch (error) {
    console.error('获取题目图片失败:', error);
    return res.status(500).json({ success: false, error: '获取题目图片失败' });
  }
});

// 临时图片上传（用于创建题目时）
router.post('/upload', [
  body('bid').notEmpty().withMessage('题库ID是必需的')
], authMiddleware, uploadSingleImage, handleUploadError, async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, error: '参数验证失败', details: errors.array() });
    }

    const { bid } = req.body;
    const file = req.file;
    const userId = req.user!._id.toString();

    if (!file) {
      return res.status(400).json({ success: false, error: '没有上传文件' });
    }

    // 生成临时图片ID
    const tempImageId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // 保存到临时目录
    const tempDir = path.join(process.cwd(), 'temp', 'images');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    const tempFilePath = path.join(tempDir, `${tempImageId}.${file.originalname.split('.').pop()}`);
    await fs.promises.writeFile(tempFilePath, file.buffer);
    
    // 生成临时访问URL
    const tempUrl = `/temp/images/${tempImageId}.${file.originalname.split('.').pop()}`;
    
    // 创建临时图片对象
    const tempImage = {
      id: tempImageId,
      bid: bid,
      order: 0,
      format: file.originalname.split('.').pop() || 'unknown',
      uploadedAt: new Date(),
      uploadedBy: userId,
      filename: file.originalname,
      url: tempUrl,
      isTemp: true // 标记为临时图片
    };

    return res.json({
      success: true,
      data: tempImage
    });
  } catch (error) {
    console.error('临时图片上传失败:', error);
    return res.status(500).json({ success: false, error: '临时图片上传失败' });
  }
});

// 上传单个图片
router.post('/:questionId/images', [
  param('questionId').isMongoId().withMessage('无效的题目ID')
], authMiddleware, uploadSingleImage, handleUploadError, async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, error: '参数验证失败', details: errors.array() });
    }

    const { questionId } = req.params;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ success: false, error: '没有上传文件' });
    }

    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({ success: false, error: '题目不存在' });
    }

    // 检查用户权限
    const userId = req.user!._id.toString();
    if (question.creator.toString() !== userId) {
      return res.status(403).json({ success: false, error: '权限不足' });
    }

    // 检查图片数量限制
    if (question.images && question.images.length >= 5) {
      return res.status(400).json({ success: false, error: '每道题目最多只能上传5张图片' });
    }

    // 上传图片
    const uploadResult = await imageService.uploadImage(questionId, file, {
      maxWidth: 1200,
      maxHeight: 800,
      quality: 85
    });

    // 计算新图片的顺序
    const maxOrder = question.images && question.images.length > 0 
      ? Math.max(...question.images.map(img => img.order))
      : -1;

    // 创建图片对象
    const newImage = {
      id: uploadResult.id,
      bid: question.bid,
      order: maxOrder + 1,
      format: uploadResult.format,
      uploadedAt: new Date(),
      uploadedBy: userId,
      filename: uploadResult.filename,
      url: uploadResult.url
    };

    // 更新题目
    question.images = question.images || [];
    question.images.push(newImage);
    await question.save();

    return res.status(201).json({
      success: true,
      data: newImage,
      message: '图片上传成功'
    });
  } catch (error) {
    console.error('图片上传失败:', error);
    return res.status(500).json({ success: false, error: '图片上传失败' });
  }
});

// 批量上传图片
router.post('/:questionId/images/batch', [
  param('questionId').isMongoId().withMessage('无效的题目ID')
], authMiddleware, uploadMultipleImages, handleUploadError, async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, error: '参数验证失败', details: errors.array() });
    }

    const { questionId } = req.params;
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      return res.status(400).json({ success: false, error: '没有上传文件' });
    }

    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({ success: false, error: '题目不存在' });
    }

    // 检查用户权限
    const userId = req.user!._id.toString();
    if (question.creator.toString() !== userId) {
      return res.status(403).json({ success: false, error: '权限不足' });
    }

    // 检查图片数量限制
    const currentCount = question.images ? question.images.length : 0;
    if (currentCount + files.length > 5) {
      return res.status(400).json({ 
        success: false, 
        error: `图片数量超过限制，当前已有${currentCount}张，最多只能再上传${5 - currentCount}张` 
      });
    }

    // 计算起始顺序
    let maxOrder = question.images && question.images.length > 0 
      ? Math.max(...question.images.map(img => img.order))
      : -1;

    const uploadResults = [];
    const newImages = [];

    // 逐个处理文件
    for (const file of files) {
      try {
        const uploadResult = await imageService.uploadImage(questionId, file, {
          maxWidth: 1200,
          maxHeight: 800,
          quality: 85
        });

        const newImage = {
          id: uploadResult.id,
          bid: question.bid,
          order: ++maxOrder,
          format: uploadResult.format,
          uploadedAt: new Date(),
          uploadedBy: userId,
          filename: uploadResult.filename,
          url: uploadResult.url
        };

        newImages.push(newImage);
        uploadResults.push(uploadResult);
      } catch (error) {
        console.error(`文件 ${file.originalname} 上传失败:`, error);
        // 继续处理其他文件
      }
    }

    if (newImages.length === 0) {
      return res.status(400).json({ success: false, error: '所有文件上传失败' });
    }

    // 更新题目
    question.images = question.images || [];
    question.images.push(...newImages);
    await question.save();

    return res.status(201).json({
      success: true,
      data: newImages,
      message: `成功上传${newImages.length}张图片`
    });
  } catch (error) {
    console.error('批量图片上传失败:', error);
    return res.status(500).json({ success: false, error: '批量图片上传失败' });
  }
});

// 删除图片
router.delete('/:questionId/images/:imageId', [
  param('questionId').isMongoId().withMessage('无效的题目ID'),
  param('imageId').notEmpty().withMessage('图片ID不能为空')
], authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, error: '参数验证失败', details: errors.array() });
    }

    const { questionId, imageId } = req.params;

    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({ success: false, error: '题目不存在' });
    }

    // 检查用户权限
    const userId = req.user!._id.toString();
    if (question.creator.toString() !== userId) {
      return res.status(403).json({ success: false, error: '权限不足' });
    }

    // 查找图片
    const imageIndex = question.images?.findIndex(img => img.id === imageId) ?? -1;
    if (imageIndex === -1) {
      return res.status(404).json({ success: false, error: '图片不存在' });
    }

    const image = question.images![imageIndex];

    // 删除文件
    try {
      await imageService.deleteImage(questionId, image.filename);
    } catch (error) {
      console.warn('删除图片文件失败:', error);
      // 继续删除数据库记录
    }

    // 从数组中移除
    question.images!.splice(imageIndex, 1);
    await question.save();

    return res.json({
      success: true,
      message: '图片删除成功'
    });
  } catch (error) {
    console.error('删除图片失败:', error);
    return res.status(500).json({ success: false, error: '删除图片失败' });
  }
});

// 调整图片顺序
router.put('/:questionId/images/order', [
  param('questionId').isMongoId().withMessage('无效的题目ID'),
  body('imageOrders').isArray().withMessage('图片顺序必须是数组'),
  body('imageOrders.*.id').notEmpty().withMessage('图片ID不能为空'),
  body('imageOrders.*.order').isInt({ min: 0 }).withMessage('顺序必须是非负整数')
], authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, error: '参数验证失败', details: errors.array() });
    }

    const { questionId } = req.params;
    const { imageOrders } = req.body;

    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({ success: false, error: '题目不存在' });
    }

    // 检查用户权限
    const userId = req.user!._id.toString();
    if (question.creator.toString() !== userId) {
      return res.status(403).json({ success: false, error: '权限不足' });
    }

    if (!question.images || question.images.length === 0) {
      return res.status(400).json({ success: false, error: '题目没有图片' });
    }

    // 更新图片顺序
    for (const orderItem of imageOrders) {
      const image = question.images.find(img => img.id === orderItem.id);
      if (image) {
        image.order = orderItem.order;
      }
    }

    await question.save();

    return res.json({
      success: true,
      data: question.images,
      message: '图片顺序更新成功'
    });
  } catch (error) {
    console.error('更新图片顺序失败:', error);
    return res.status(500).json({ success: false, error: '更新图片顺序失败' });
  }
});

export default router;
