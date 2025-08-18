import express from 'express';
import multer from 'multer';
import { authMiddleware } from '../middleware/auth';
import { 
  processOptimizedPDFDocument,
  processOptimizedTeXDocument
} from '../controllers/optimizedMathpixController';
import { getProgressEmitter } from '../utils/progress';
import { Request, Response } from 'express';
import { emitProgress } from '../utils/progress';
import { markCancelled, isCancelled } from '../utils/cancel';

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 限制50MB
  }
});

// 优化版PDF处理路由（注入docId）
router.post('/process-pdf-optimized', authMiddleware, (req, _res, next) => {
  const headerDocId = req.header('X-Doc-Id');
  if (headerDocId) (req as any).id = headerDocId;
  next();
}, upload.single('pdf'), processOptimizedPDFDocument);

// 测试路由 - 不需要认证
router.post('/test-pdf', upload.single('pdf'), processOptimizedPDFDocument);

// 优化版TeX处理路由（注入docId）
router.post('/process-tex', authMiddleware, (req, _res, next) => {
  const headerDocId = req.header('X-Doc-Id');
  if (headerDocId) (req as any).id = headerDocId;
  next();
}, upload.single('tex'), processOptimizedTeXDocument);

// 实时进度跟踪端点 - 支持Server-Sent Events
router.get('/progress/:docId', (req, res) => {
  const { docId } = req.params;

  // 设置CORS头，允许跨域SSE连接
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Cache-Control',
    'Access-Control-Allow-Methods': 'GET',
  });

  res.write(`data: ${JSON.stringify({ type: 'connected', docId })}\n\n`);

  const emitter = getProgressEmitter(docId);
  const listener = (data: unknown) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };
  emitter.on('progress', listener);

  req.on('close', () => {
    emitter.off('progress', listener);
    res.end();
  });
});

// 取消处理（标记取消，供长任务检查）
const cancelledDocs = new Set<string>();
router.post('/cancel/:docId', (req: Request, res: Response) => {
  const { docId } = req.params;
  markCancelled(docId);
  emitProgress(docId, { type: 'cancelled', docId });
  res.json({ success: true, cancelled: true });
});

export { isCancelled };


export default router;