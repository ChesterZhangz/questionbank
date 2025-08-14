import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { DocumentConverterService } from '../services/documentConverterService';

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
 * POST /api/document-converter/convert-to-images
 * 将文档转换为图片
 */
router.post('/convert-to-images', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: '请上传文件'
      });
    }

    const fileType = req.body.fileType || getFileType(req.file.originalname);
    console.log('开始转换文档为图片:', req.file.originalname, '类型:', fileType);

    const converterService = new DocumentConverterService();
    const result = await converterService.convertToImages(req.file.path, fileType);

    // 清理上传的原始文件
    try {
      fs.unlinkSync(req.file.path);
    } catch (error) {
      console.error('清理原始文件失败:', error);
    }

    if (result.success) {
      console.log(`文档转换完成: ${result.pages.length} 页`);

      return res.json({
        success: true,
        pages: result.pages,
        statistics: {
          totalPages: result.pages.length,
          totalSize: result.totalSize,
          conversionTime: result.conversionTime
        }
      });
    } else {
      return res.status(500).json({
        success: false,
        message: '文档转换失败',
        errors: result.errors
      });
    }

  } catch (error: any) {
    console.error('文档转换失败:', error);
    return res.status(500).json({
      success: false,
      message: '文档转换失败',
      error: error.message || '未知错误'
    });
  }
});

function getFileType(filename: string): string {
  const ext = filename.toLowerCase().split('.').pop();
  switch (ext) {
    case 'docx':
    case 'doc':
      return 'word';
    case 'pdf':
      return 'pdf';
    case 'tex':
      return 'latex';
    default:
      return 'unknown';
  }
}

export default router; 