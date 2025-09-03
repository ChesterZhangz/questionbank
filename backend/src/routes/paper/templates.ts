// 模板管理路由
import express from 'express';
import { authMiddleware } from '../../middleware/auth';

const router = express.Router();

// 模板相关API端点
router.get('/', authMiddleware, (req, res) => {
  // 获取模板列表
});

export default router;
