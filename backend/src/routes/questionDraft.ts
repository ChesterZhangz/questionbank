import express from 'express';
import { authMiddleware } from '../middleware/auth';
import {
  getUserDrafts,
  getDraftById,
  createDraft,
  updateDraft,
  deleteDraft,
  batchDeleteDrafts,
  duplicateDraft,
  getPublicDrafts,
  getPublicDraftById
} from '../controllers/questionDraftController';

const router = express.Router();

// 需要认证的路由
router.use(authMiddleware);

// 用户草稿管理
router.get('/user', getUserDrafts); // 获取用户草稿列表
router.get('/user/:id', getDraftById); // 获取用户草稿详情
router.post('/user', createDraft); // 创建草稿
router.put('/user/:id', updateDraft); // 更新草稿
router.delete('/user/:id', deleteDraft); // 删除草稿
router.post('/user/batch-delete', batchDeleteDrafts); // 批量删除草稿
router.post('/user/:id/duplicate', duplicateDraft); // 复制草稿

// 公开草稿访问（不需要认证）
router.get('/public', getPublicDrafts); // 获取公开草稿列表
router.get('/public/:id', getPublicDraftById); // 获取公开草稿详情

export default router;
