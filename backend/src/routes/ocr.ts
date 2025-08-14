import express, { Request, Response } from 'express';
import multer from 'multer';
import { body, validationResult } from 'express-validator';
import { AuthRequest } from '../middleware/auth';
import { recognizeImage } from '../services/ocrService';

const router = express.Router();

// 配置文件上传
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    // 只允许图片文件
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('只允许上传图片文件'));
    }
  },
});

// OCR识别接口
router.post('/recognize', [
  upload.single('image'),
  body('image').custom((value, { req }) => {
    if (!req.file) {
      throw new Error('请上传图片文件');
    }
    return true;
  })
], async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: '输入验证失败',
        details: errors.array()
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: '请上传图片文件'
      });
    }

    // 检查文件大小
    if (req.file.size > 10 * 1024 * 1024) {
      return res.status(400).json({
        success: false,
        error: '图片文件大小不能超过10MB'
      });
    }

    // 调用OCR服务
    const result = await recognizeImage(req.file.buffer);

    return res.json({
      success: true,
      latex: result.latex,
      confidence: result.confidence,
      isChoiceQuestion: result.isChoiceQuestion,
      questionContent: result.questionContent,
      options: result.options,
      message: 'OCR识别成功'
    });

  } catch (error: any) {
    console.error('OCR识别失败:', error);
    console.error('错误类型:', error.constructor.name);
    console.error('错误消息:', error.message);
    console.error('错误代码:', error.code);
    
    // 处理不同类型的错误
    if (error.code === 'INVALID_IMAGE') {
      return res.status(400).json({
        success: false,
        error: '图片格式不支持或图片损坏'
      });
    }
    
    if (error.code === 'OCR_FAILED') {
      return res.status(500).json({
        success: false,
        error: error.message || 'OCR识别失败，请重试'
      });
    }

    // 返回原始错误信息，便于调试
    return res.status(500).json({
      success: false,
      error: error.message || 'OCR识别失败'
    });
  }
});

// 批量OCR识别接口
router.post('/recognize-batch', [
  upload.array('images', 5), // 最多5张图片
  body('images').custom((value, { req }) => {
    if (!req.files || req.files.length === 0) {
      throw new Error('请上传至少一张图片');
    }
    return true;
  })
], async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: '输入验证失败',
        details: errors.array()
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: '请上传图片文件'
      });
    }

    const files = Array.isArray(req.files) ? req.files : [req.files];
    
    // 检查文件数量
    if (files.length > 5) {
      return res.status(400).json({
        success: false,
        error: '一次最多只能上传5张图片'
      });
    }

    // 批量处理图片
    const results = await Promise.all(
      files.map(async (file, index) => {
        try {
          const result = await recognizeImage(file.buffer as Buffer);
          return {
            index,
            success: true,
            latex: result.latex,
            confidence: result.confidence,
            filename: file.originalname
          };
        } catch (error: any) {
          return {
            index,
            success: false,
            error: error.message,
            filename: file.originalname
          };
        }
      })
    );

    return res.json({
      success: true,
      results,
      message: '批量OCR识别完成'
    });

  } catch (error: any) {
    console.error('批量OCR识别失败:', error);
    return res.status(500).json({
      success: false,
      error: error.message || '批量OCR识别失败'
    });
  }
});

// OCR服务状态检查
router.get('/status', async (req: Request, res: Response) => {
  try {
    // 这里可以添加OCR服务的健康检查
    return res.json({
      success: true,
      status: 'healthy',
      message: 'OCR服务正常运行'
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      status: 'unhealthy',
      error: error.message || 'OCR服务异常'
    });
  }
});

export default router; 