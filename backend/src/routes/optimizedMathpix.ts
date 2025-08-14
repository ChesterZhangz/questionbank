import express from 'express';
import multer from 'multer';
import { authMiddleware } from '../middleware/auth';
import { 
  processOptimizedPDFDocument,
  processOptimizedWordDocument,
  processOptimizedTeXDocument
} from '../controllers/optimizedMathpixController';

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 限制10MB
  }
});

// 优化版PDF处理路由
router.post('/process-pdf-optimized', authMiddleware, upload.single('pdf'), processOptimizedPDFDocument);

// 优化版Word处理路由
router.post('/process-word-optimized', authMiddleware, upload.single('word'), processOptimizedWordDocument);

// 优化版TeX处理路由
router.post('/process-tex', authMiddleware, upload.single('tex'), processOptimizedTeXDocument);

export default router;