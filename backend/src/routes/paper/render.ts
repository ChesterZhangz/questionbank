// 渲染服务路由
import express from 'express';
import { authMiddleware } from '../../middleware/auth';

const router = express.Router();

// 渲染相关API端点
router.post('/latex', authMiddleware, (req, res) => {
  // LaTeX渲染
});

router.post('/pdf', authMiddleware, (req, res) => {
  // PDF生成
});

export default router;
