import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import QuestionSplitOCRService from '../services/questionSplitOCRService';

const router = express.Router();
const questionSplitOCRService = new QuestionSplitOCRService();

// 配置文件上传
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/ocr/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('不支持的文件类型'));
    }
  }
});

/**
 * POST /api/question-split-ocr/parse
 * 解析单张图片
 */
router.post('/parse', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: '请上传图片文件'
      });
    }

    console.log('开始解析图片:', req.file.filename);

    // 读取文件并转换为Base64
    const imageBuffer = fs.readFileSync(req.file.path);
    const imageBase64 = imageBuffer.toString('base64');

    // 调用OCR服务
    const questions = await questionSplitOCRService.parseQuestions({
      imageBase64,
      returnText: true,
      returnCoord: true,
      returnType: 'auto'
    });

    // 删除临时文件
    fs.unlinkSync(req.file.path);

    return res.json({
      success: true,
      data: {
        questions,
        total: questions.length,
        filename: req.file.originalname
      }
    });

  } catch (error: any) {
    console.error('解析图片失败:', error);
    
    // 清理临时文件
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    return res.status(500).json({
      success: false,
      error: error.message || '解析失败'
    });
  }
});

/**
 * GET /api/question-split-ocr/test
 * 测试API连接
 */
router.get('/test', async (req, res) => {
  try {
    const isConnected = await questionSplitOCRService.testConnection();
    
    return res.json({
      success: true,
      data: {
        connected: isConnected,
        message: isConnected ? 'API连接正常' : 'API连接失败'
      }
    });

  } catch (error: any) {
    console.error('API连接测试失败:', error);
    return res.status(500).json({
      success: false,
      error: error.message || '连接测试失败'
    });
  }
});

export default router; 