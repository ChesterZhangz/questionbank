// 试卷路由入口
import express from 'express';
import paperRoutes from './papers';
import templateRoutes from './templates';
import renderRoutes from './render';

const router = express.Router();

router.use('/papers', paperRoutes);
router.use('/templates', templateRoutes);
router.use('/render', renderRoutes);

export default router;
