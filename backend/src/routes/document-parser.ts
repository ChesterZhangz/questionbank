import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import DocumentParser from '../services/documentParser';
import { 
  handleDocumentParseError, 
  handleOCRError, 
  sendErrorResponse,
  asyncErrorHandler 
} from '../utils/errorHandler';

const router = express.Router();

// 配置文件上传
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/documents');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
      'application/msword', // .doc
      'application/pdf', // .pdf
      'text/plain', // .tex, .txt
      'text/x-tex', // .tex (另一种MIME类型)
      'application/x-tex', // .tex (另一种MIME类型)
    ];
    
    // 检查文件扩展名
    const fileExtension = path.extname(file.originalname).toLowerCase();
    const allowedExtensions = ['.docx', '.doc', '.pdf', '.tex', '.txt'];
    
    if (allowedTypes.includes(file.mimetype) || allowedExtensions.includes(fileExtension)) {
      cb(null, true);
    } else {
      cb(new Error('不支持的文件格式'));
    }
  }
});

// 解析文档
router.post('/parse', upload.single('file'), asyncErrorHandler(async (req: any, res: any) => {
  try {
    if (!req.file) {
      return sendErrorResponse(res, {
        message: '请上传文件',
        code: 'FILE_REQUIRED',
        statusCode: 400
      });
    }

    const { file } = req;
    const { areas } = req.body;
    const fileType = req.body.fileType || getFileType(file.originalname);
    
    console.log('文档解析请求:', {
      filename: file.originalname,
      size: file.size,
      fileType,
      areas: areas ? JSON.parse(areas) : null
    });

    const parser = new DocumentParser();
    let result;

    // 根据文件类型调用相应的解析方法
    switch (fileType) {
      case 'word':
        result = await parser.parseWordDocument(file.path);
        break;
      case 'latex':
        result = await parser.parseLaTeXDocument(file.path);
        break;
      case 'pdf':
        result = await parser.parsePDFDocument(file.path);
        break;
      default:
        throw new Error('不支持的文件类型');
    }

    res.json({
      success: true,
      questions: result.questions,
      metadata: {
        pages: result.pages,
        mathFormulas: result.mathFormulas,
        images: result.images,
        tables: result.tables,
        confidence: result.confidence
      },
      errors: result.errors,
      warnings: result.warnings,
      message: '文档解析成功'
    });

  } catch (error: any) {
    const apiError = handleDocumentParseError(error, '文档解析');
    sendErrorResponse(res, apiError);
  }
}));

/**
 * POST /api/document-parser/parse-areas
 * 解析用户选择的区域
 */
router.post('/parse-areas', upload.single('file'), async (req, res): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({
        success: false,
        message: '请上传文件'
      });
      return;
    }

    const areas = JSON.parse(req.body.areas || '[]');
    if (areas.length === 0) {
      res.status(400).json({
        success: false,
        message: '请选择至少一个区域'
      });
      return;
    }

    const startTime = Date.now();
    const file = req.file;
    const fileType = req.body.fileType || getFileType(file.originalname);

    console.log('开始解析选择区域:', file.originalname, '区域数量:', areas.length);

    // 创建文档解析器实例
    const parser = new DocumentParser();
    let parseResult;

    try {
      // 解析选择的区域
      parseResult = await parser.parseSelectedAreas(file.path, areas, fileType);
    } catch (parseError: any) {
      console.error('区域解析失败:', parseError);
      res.status(500).json({
        success: false,
        message: '区域解析失败',
        error: parseError.message || '未知错误'
      });
      return;
    }

    const parseTime = (Date.now() - startTime) / 1000;

    // 构建响应数据
    const result = {
      questions: parseResult.questions,
      metadata: {
        filename: file.originalname,
        fileType: fileType,
        fileSize: file.size,
        pages: parseResult.pages,
        parseTime: parseTime,
        extractedAt: new Date().toISOString(),
        areasProcessed: areas.length
      },
      statistics: {
        totalQuestions: parseResult.questions.length,
        choiceQuestions: parseResult.questions.filter((q: any) => q.type === 'choice').length,
        fillQuestions: parseResult.questions.filter((q: any) => q.type === 'fill').length,
        solutionQuestions: parseResult.questions.filter((q: any) => q.type === 'solution').length,
        mathFormulas: parseResult.mathFormulas,
        images: parseResult.images,
        tables: parseResult.tables,
        confidence: parseResult.confidence
      },
      errors: parseResult.errors,
      warnings: parseResult.warnings
    };

    res.json({
      success: true,
      result: result
    });

  } catch (error: any) {
    console.error('区域解析处理失败:', error);
    res.status(500).json({
      success: false,
      message: '区域解析处理失败',
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
    case '.txt':
      return 'word';
    case '.tex':
      return 'latex';
    case '.pdf':
      return 'pdf';
    default:
      return 'unknown';
  }
}

/**
 * POST /api/document-parser/cancel/:docId
 * 取消文档处理
 */
router.post('/cancel/:docId', async (req: any, res: any): Promise<void> => {
  try {
    const { docId } = req.params;
    
    console.log(`取消文档处理: ${docId}`);
    
    // 这里可以实现取消逻辑，比如：
    // 1. 停止正在进行的处理任务
    // 2. 清理临时文件
    // 3. 更新处理状态
    
    // 暂时返回成功响应
    res.json({
      success: true,
      message: '文档处理已取消',
      docId: docId
    });
    
  } catch (error: any) {
    console.error('取消文档处理失败:', error);
    res.status(500).json({
      success: false,
      message: '取消文档处理失败',
      error: error.message || '未知错误'
    });
  }
});

export default router; 