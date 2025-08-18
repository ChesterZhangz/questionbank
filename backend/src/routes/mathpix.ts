import express from 'express';
import multer from 'multer';
import { authMiddleware } from '../middleware/auth';
import { 
  processPDFDocument,
  processBatchContent,
  processTeXDocument
} from '../controllers/simplifiedMathpixController';

const router = express.Router();

// 配置multer存储
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 限制10MB
  }
});

// PDF文档处理API
router.post('/process-pdf', authMiddleware, upload.single('pdf'), processPDFDocument);

// TeX文档处理API
router.post('/process-tex', authMiddleware, upload.single('tex'), processTeXDocument);

router.post('/process-batch', authMiddleware, processBatchContent);

export default router;