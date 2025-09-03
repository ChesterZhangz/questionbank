import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { VCount } from '../models/VCount';
import { AuthRequest, authMiddleware } from '../middleware/auth';

const router = express.Router();

// 获取用户VCount信息
router.get('/balance', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ success: false, error: '用户未认证' });
    }

    const vCount = await (VCount as any).getOrCreate(req.user._id);
    
    return res.json({
      success: true,
      data: {
        balance: vCount.balance,
        totalRecharged: vCount.totalRecharged,
        totalSpent: vCount.totalSpent,
        lastRechargeDate: vCount.lastRechargeDate,
        transactionCount: vCount.transactions.length
      }
    });
  } catch (error) {
    console.error('获取VCount余额失败:', error);
    return res.status(500).json({ success: false, error: '获取余额失败' });
  }
});

// 获取交易历史
router.get('/transactions', authMiddleware, [
  body('page').optional().isInt({ min: 1 }).withMessage('页码必须是正整数'),
  body('limit').optional().isInt({ min: 1, max: 100 }).withMessage('每页数量必须在1-100之间')
], async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ success: false, error: '用户未认证' });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        error: '输入验证失败',
        details: errors.array() 
      });
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;

    const vCount = await VCount.findOne({ userId: req.user._id });
    if (!vCount) {
      return res.json({
        success: true,
        data: {
          transactions: [],
          pagination: {
            page,
            limit,
            total: 0,
            totalPages: 0
          }
        }
      });
    }

    const transactions = (vCount as any).getTransactionHistory(limit, offset);
    const total = vCount.transactions.length;
    const totalPages = Math.ceil(total / limit);

    return res.json({
      success: true,
      data: {
        transactions: transactions.map((t: any) => ({
          id: t._id,
          type: t.type,
          amount: t.amount,
          description: t.description,
          relatedId: t.relatedId,
          relatedModel: t.relatedModel,
          createdAt: t.createdAt
        })),
        pagination: {
          page,
          limit,
          total,
          totalPages
        }
      }
    });
  } catch (error) {
    console.error('获取交易历史失败:', error);
    return res.status(500).json({ success: false, error: '获取交易历史失败' });
  }
});

// 充值VCount
router.post('/recharge', authMiddleware, [
  body('amount').isFloat({ min: 0.01 }).withMessage('充值金额必须大于0'),
  body('description').optional().trim().isLength({ max: 200 }).withMessage('描述不能超过200个字符')
], async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ success: false, error: '用户未认证' });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        error: '输入验证失败',
        details: errors.array() 
      });
    }

    const { amount, description = '充值' } = req.body;

    const vCount = await (VCount as any).getOrCreate(req.user._id);
    await vCount.recharge(amount, description);

    return res.json({
      success: true,
      message: '充值成功',
      data: {
        balance: vCount.balance,
        totalRecharged: vCount.totalRecharged,
        lastRechargeDate: vCount.lastRechargeDate
      }
    });
  } catch (error) {
    console.error('充值失败:', error);
    return res.status(500).json({ success: false, error: '充值失败' });
  }
});

// 消费VCount（用于购买题库、试卷等）
router.post('/spend', authMiddleware, [
  body('amount').isFloat({ min: 0.01 }).withMessage('消费金额必须大于0'),
  body('description').trim().isLength({ min: 1, max: 200 }).withMessage('描述不能为空且不能超过200个字符'),
  body('relatedId').optional().isMongoId().withMessage('相关ID格式无效'),
  body('relatedModel').optional().isIn(['QuestionBank', 'Paper', 'Library']).withMessage('相关模型无效')
], async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ success: false, error: '用户未认证' });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        error: '输入验证失败',
        details: errors.array() 
      });
    }

    const { amount, description, relatedId, relatedModel } = req.body;

    const vCount = await VCount.findOne({ userId: req.user._id });
    if (!vCount) {
      return res.status(404).json({ success: false, error: 'VCount记录不存在' });
    }

    await (vCount as any).spend(amount, description, relatedId, relatedModel);

    return res.json({
      success: true,
      message: '消费成功',
      data: {
        balance: vCount.balance,
        totalSpent: vCount.totalSpent
      }
    });
  } catch (error) {
    if ((error as any).message === '余额不足') {
      return res.status(400).json({ success: false, error: '余额不足' });
    }
    console.error('消费失败:', error);
    return res.status(500).json({ success: false, error: '消费失败' });
  }
});

// 退款VCount
router.post('/refund', authMiddleware, [
  body('amount').isFloat({ min: 0.01 }).withMessage('退款金额必须大于0'),
  body('description').trim().isLength({ min: 1, max: 200 }).withMessage('描述不能为空且不能超过200个字符'),
  body('relatedId').isMongoId().withMessage('相关ID格式无效'),
  body('relatedModel').isIn(['QuestionBank', 'Paper', 'Library']).withMessage('相关模型无效')
], async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ success: false, error: '用户未认证' });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        error: '输入验证失败',
        details: errors.array() 
      });
    }

    const { amount, description, relatedId, relatedModel } = req.body;

    const vCount = await VCount.findOne({ userId: req.user._id });
    if (!vCount) {
      return res.status(404).json({ success: false, error: 'VCount记录不存在' });
    }

    await (vCount as any).refund(amount, description, relatedId, relatedModel);

    return res.json({
      success: true,
      message: '退款成功',
      data: {
        balance: vCount.balance,
        totalSpent: vCount.totalSpent
      }
    });
  } catch (error) {
    console.error('退款失败:', error);
    return res.status(500).json({ success: false, error: '退款失败' });
  }
});

// 管理员：查看所有用户的VCount信息（仅管理员可访问）
router.get('/admin/all', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ success: false, error: '用户未认证' });
    }

    // 检查权限
    if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
      return res.status(403).json({ success: false, error: '权限不足' });
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;

    const total = await VCount.countDocuments();
    const vCounts = await VCount.find({})
      .populate('userId', 'email name role')
      .sort({ balance: -1 })
      .skip(offset)
      .limit(limit);

    const totalPages = Math.ceil(total / limit);

    return res.json({
      success: true,
      data: {
        vCounts: vCounts.map(vc => ({
          userId: vc.userId,
          balance: vc.balance,
          totalRecharged: vc.totalRecharged,
          totalSpent: vc.totalSpent,
          lastRechargeDate: vc.lastRechargeDate,
          transactionCount: vc.transactions.length,
          createdAt: vc.createdAt
        })),
        pagination: {
          page,
          limit,
          total,
          totalPages
        }
      }
    });
  } catch (error) {
    console.error('获取所有用户VCount信息失败:', error);
    return res.status(500).json({ success: false, error: '获取信息失败' });
  }
});

export default router;
