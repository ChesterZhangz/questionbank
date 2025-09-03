// 试卷CRUD路由
import express from 'express';
import { authMiddleware } from '../../middleware/auth';

const router = express.Router();

// 试卷相关API端点
router.post('/', authMiddleware, (req, res) => {
  // 创建试卷
});

router.get('/', authMiddleware, (req, res) => {
  // 获取试卷列表
});

export default router;
