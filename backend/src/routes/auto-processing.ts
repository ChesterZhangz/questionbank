import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import AutoDocumentProcessingService from '../services/autoDocumentProcessingService';

const router = express.Router();

// 配置文件上传
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'temp', 'uploads');
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
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB
  }
});

/**
 * POST /api/auto-processing/process
 * 自动处理文档：截图每一页 → OCR识别 → DeepSeek优化
 */
router.post('/process', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: '请上传文件'
      });
    }

    const fileType = req.body.fileType || getFileType(req.file.originalname);
    console.log('开始自动处理文档:', req.file.originalname, '类型:', fileType);

    const autoProcessingService = new AutoDocumentProcessingService();
    const result = await autoProcessingService.processDocument(req.file.path, fileType);

    // 清理上传的原始文件
    try {
      fs.unlinkSync(req.file.path);
    } catch (error) {
      console.error('清理原始文件失败:', error);
    }

    if (result.success) {
      // 转换题目格式
      const questions = result.questions.map((q, index) => ({
        _id: `auto_${Date.now()}_${index}`,
        content: {
          stem: q.content.stem || '',
          options: q.content.options || [],
          answer: q.content.answer || ''
        },
        type: q.type || 'solution',
        difficulty: q.difficulty || 3,
        tags: q.tags || [],
        source: q.source || '自动处理',
        confidence: q.confidence || 0.8,
        metadata: q.metadata || {},
        createdAt: new Date(),
        updatedAt: new Date()
      }));

      console.log(`自动处理完成: ${questions.length} 道题目`);

      return res.json({
        success: true,
        questions,
        statistics: result.statistics,
        errors: result.errors
      });
    } else {
      return res.status(500).json({
        success: false,
        message: '自动处理失败',
        errors: result.errors
      });
    }

  } catch (error: any) {
    console.error('自动处理失败:', error);
    return res.status(500).json({
      success: false,
      message: '自动处理失败',
      error: error.message || '未知错误'
    });
  }
});

// 获取文件类型
function getFileType(filename: string): string {
  const ext = path.extname(filename).toLowerCase();
  switch (ext) {
    case '.docx':
    case '.doc':
      return 'word';
    case '.pdf':
      return 'pdf';
    case '.tex':
      return 'latex';
    case '.jpg':
    case '.jpeg':
    case '.png':
      return 'image';
    default:
      return 'unknown';
  }
}

export default router; 