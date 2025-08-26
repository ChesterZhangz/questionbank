import express, { Response } from 'express';
import { body, param, validationResult } from 'express-validator';
import { AuthRequest, authMiddleware } from '../middleware/auth';
import { uploadMultipleImages, uploadSingleImage, handleUploadError } from '../middleware/imageUpload';
import cosService from '../services/cosService';
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
router.post('/upload', authMiddleware, uploadSingleImage, handleUploadError, async (req: AuthRequest, res: Response) => {
  try {
    const { bid } = req.body;
    const file = req.file;
    const userId = req.user!._id.toString();

    if (!bid) {
      return res.status(400).json({ success: false, error: '题库ID是必需的' });
    }

    if (!file) {
      return res.status(400).json({ success: false, error: '没有上传文件' });
    }

    console.log('📁 临时图片上传 - 接收到的文件信息:', {
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      buffer: file.buffer ? `Buffer(${file.buffer.length} bytes)` : 'undefined'
    });

    // 获取自定义文件名
    const customName = req.body.customName || file.originalname;
    
    // 使用腾讯云COS上传临时图片，传入用户ID用于路径组织
    const tempQuestionId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const uploadResult = await cosService.uploadImage(tempQuestionId, file, {
      maxWidth: 1200,
      maxHeight: 800,
      quality: 85
    }, true, userId, customName); // 传入用户ID和自定义名称

    console.log('📤 临时图片上传结果:', {
      id: uploadResult.id,
      url: uploadResult.url,
      cosKey: uploadResult.cosKey,
      filename: uploadResult.filename
    });

    // 创建临时图片对象
    const tempImage = {
      id: uploadResult.id,
      bid: bid,
      order: 0,
      format: uploadResult.format,
      uploadedAt: new Date(),
      uploadedBy: userId,
      filename: customName || uploadResult.filename, // 优先使用自定义名称
      url: uploadResult.url,
      cosKey: uploadResult.cosKey,
      isTemp: true // 标记为临时图片
    };

    return res.json({
      success: true,
      data: tempImage
    });
  } catch (error) {
    console.error('临时图片上传失败:', error);
    return res.status(500).json({ 
      success: false, 
      error: '临时图片上传失败',
      details: error instanceof Error ? error.message : '未知错误'
    });
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

          // 上传图片到腾讯云COS
      const uploadResult = await cosService.uploadImage(questionId, file, {
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
        const uploadResult = await cosService.uploadImage(questionId, file, {
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

          // 删除COS中的图片文件
      try {
        if (image.cosKey) {
          await cosService.deleteImage(image.cosKey);
        }
      } catch (error) {
        console.warn('删除COS图片文件失败:', error);
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

// 修复图片URL（用于处理临时图片URL问题）
router.post('/fix-urls', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { images } = req.body;
    const userId = req.user!._id.toString();
    
    if (!images || !Array.isArray(images)) {
      return res.status(400).json({ success: false, error: '图片数据格式错误' });
    }
    
    const fixedImages = [];
    
    for (const image of images) {
      try {
        // 检查是否是临时图片URL
        if (image.url && image.url.includes('/temp/images/')) {
          // 尝试从临时URL中提取文件名
          const urlParts = image.url.split('/');
          const filename = urlParts[urlParts.length - 1];
          
          if (filename && filename.includes('.')) {
            // 检查临时文件是否存在
            const tempFilePath = path.join(process.cwd(), 'temp', 'images', filename);
            
            if (fs.existsSync(tempFilePath)) {
              // 生成新的临时URL（使用相对路径）
              const newTempUrl = `/temp/images/${filename}`;
              
              fixedImages.push({
                ...image,
                url: newTempUrl
              });
            } else {
              // 临时文件不存在，返回错误信息
              fixedImages.push({
                ...image,
                url: null,
                error: '临时文件不存在'
              });
            }
          } else {
            fixedImages.push(image);
          }
        } else {
          // 不是临时图片，直接返回
          fixedImages.push(image);
        }
      } catch (error) {
        console.error('修复图片URL失败:', error);
        fixedImages.push({
          ...image,
          url: null,
          error: 'URL修复失败'
        });
      }
    }
    
    return res.json({
      success: true,
      data: fixedImages
    });
  } catch (error) {
    console.error('批量修复图片URL失败:', error);
    return res.status(500).json({ success: false, error: '批量修复图片URL失败' });
  }
});

// 删除COS中的图片
router.delete('/cos/:cosKey', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { cosKey } = req.params;
    
    if (!cosKey) {
      return res.status(400).json({ success: false, error: 'COS键是必需的' });
    }

    // 从COS中删除图片
    await cosService.deleteImage(decodeURIComponent(cosKey));
    
    console.log('✅ COS图片删除成功:', cosKey);
    return res.json({ success: true, message: '图片删除成功' });
  } catch (error) {
    console.error('❌ 删除COS图片失败:', error);
    return res.status(500).json({ success: false, error: '删除COS图片失败' });
  }
});

// 删除题目中的图片（同时删除COS中的图片）
router.delete('/:questionId/images/:imageId', [
  param('questionId').isMongoId().withMessage('无效的题目ID'),
  param('imageId').notEmpty().withMessage('图片ID是必需的')
], authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, error: '参数验证失败', details: errors.array() });
    }

    const { questionId, imageId } = req.params;
    const userId = req.user!._id.toString();

    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({ success: false, error: '题目不存在' });
    }

    // 检查用户权限
    if (question.creator.toString() !== userId) {
      return res.status(403).json({ success: false, error: '权限不足' });
    }

    // 查找要删除的图片
    if (!question.images || question.images.length === 0) {
      return res.status(400).json({ success: false, error: '题目没有图片' });
    }

    const imageIndex = question.images.findIndex(img => img.id === imageId);
    if (imageIndex === -1) {
      return res.status(404).json({ success: false, error: '图片不存在' });
    }

    const imageToDelete = question.images[imageIndex];

    // 从COS中删除图片
    if (imageToDelete.cosKey) {
      try {
        await cosService.deleteImage(imageToDelete.cosKey);
        console.log('✅ COS图片删除成功:', imageToDelete.cosKey);
      } catch (error) {
        console.error('❌ 删除COS图片失败:', error);
        // 即使COS删除失败，也继续删除数据库记录
      }
    }

    // 从题目中删除图片
    question.images.splice(imageIndex, 1);
    await question.save();

    return res.json({
      success: true,
      message: '图片删除成功'
    });
  } catch (error) {
    console.error('删除题目图片失败:', error);
    return res.status(500).json({ success: false, error: '删除题目图片失败' });
  }
});

// 重命名COS中的图片
router.put('/cos/rename', [
  body('oldCosKey').notEmpty().withMessage('原COS键是必需的'),
  body('newFilename').notEmpty().withMessage('新文件名是必需的')
], authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, error: '参数验证失败', details: errors.array() });
    }

    const { oldCosKey, newFilename } = req.body;
    const userId = req.user!._id.toString();

    console.log('🔍 重命名请求参数:', { oldCosKey, newFilename, userId });

    // 验证文件名格式（放宽验证，允许更多字符）
    if (!/^[a-zA-Z0-9\u4e00-\u9fa5_\-\s]+\.(jpg|jpeg|png|gif|webp)$/i.test(newFilename)) {
      return res.status(400).json({ success: false, error: '文件名格式不正确，请确保包含有效的文件扩展名' });
    }

    // 从COS中重命名图片
    const newCosKey = await cosService.renameImage(oldCosKey, newFilename, userId);
    
    console.log('✅ COS图片重命名成功:', { oldCosKey, newCosKey, newFilename });
    
    return res.json({ 
      success: true, 
      message: '图片重命名成功',
      data: {
        oldCosKey,
        newCosKey,
        newFilename
      }
    });
  } catch (error) {
    console.error('❌ 重命名COS图片失败:', error);
    return res.status(500).json({ success: false, error: '重命名COS图片失败' });
  }
});

export default router;
