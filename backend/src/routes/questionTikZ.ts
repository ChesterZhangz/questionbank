import express, { Response } from 'express';
import { body, param, validationResult } from 'express-validator';
import { AuthRequest, authMiddleware } from '../middleware/auth';
import { Question } from '../models/Question';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// 获取题目的所有TikZ代码
router.get('/:questionId/tikz', [
  param('questionId').isMongoId().withMessage('无效的题目ID')
], authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, error: '参数验证失败', details: errors.array() });
    }

    const { questionId } = req.params;

    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({ success: false, error: '题目不存在' });
    }

    // 检查用户权限（简化版，可以根据需要扩展）
    const userId = req.user!._id.toString();
    if (question.creator.toString() !== userId) {
      return res.status(403).json({ success: false, error: '权限不足' });
    }

    return res.json({
      success: true,
      data: question.tikzCodes || []
    });
  } catch (error) {
    console.error('获取题目TikZ代码失败:', error);
    return res.status(500).json({ success: false, error: '获取题目TikZ代码失败' });
  }
});

// 创建TikZ代码
router.post('/:questionId/tikz', [
  param('questionId').isMongoId().withMessage('无效的题目ID'),
  body('code').notEmpty().withMessage('TikZ代码不能为空'),
  body('format').optional().isIn(['svg', 'png']).withMessage('格式必须是svg或png')
], authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, error: '参数验证失败', details: errors.array() });
    }

    const { questionId } = req.params;
    const { code, format = 'svg' } = req.body;

    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({ success: false, error: '题目不存在' });
    }

    // 检查用户权限
    const userId = req.user!._id.toString();
    if (question.creator.toString() !== userId) {
      return res.status(403).json({ success: false, error: '权限不足' });
    }

    // 检查TikZ代码数量限制
    if (question.tikzCodes && question.tikzCodes.length >= 3) {
      return res.status(400).json({ success: false, error: '每道题目最多只能有3个TikZ图形' });
    }

    // 计算新TikZ代码的顺序
    const maxOrder = question.tikzCodes && question.tikzCodes.length > 0 
      ? Math.max(...question.tikzCodes.map(tikz => tikz.order))
      : -1;

    // 创建TikZ代码对象
    const newTikZ = {
      id: uuidv4(),
      bid: question.bid,
      code: code,
      order: maxOrder + 1,
      format: format,
      createdAt: new Date(),
      createdBy: userId
    };

    // 更新题目
    question.tikzCodes = question.tikzCodes || [];
    question.tikzCodes.push(newTikZ);
    await question.save();

    return res.status(201).json({
      success: true,
      data: newTikZ,
      message: 'TikZ代码创建成功'
    });
  } catch (error) {
    console.error('创建TikZ代码失败:', error);
    return res.status(500).json({ success: false, error: '创建TikZ代码失败' });
  }
});

// 更新TikZ代码
router.put('/:questionId/tikz/:tikzId', [
  param('questionId').isMongoId().withMessage('无效的题目ID'),
  param('tikzId').notEmpty().withMessage('TikZ ID不能为空'),
  body('code').notEmpty().withMessage('TikZ代码不能为空'),
  body('format').optional().isIn(['svg', 'png']).withMessage('格式必须是svg或png')
], authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, error: '参数验证失败', details: errors.array() });
    }

    const { questionId, tikzId } = req.params;
    const { code, format } = req.body;

    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({ success: false, error: '题目不存在' });
    }

    // 检查用户权限
    const userId = req.user!._id.toString();
    if (question.creator.toString() !== userId) {
      return res.status(403).json({ success: false, error: '权限不足' });
    }

    // 查找TikZ代码
    const tikzIndex = question.tikzCodes?.findIndex(tikz => tikz.id === tikzId) ?? -1;
    if (tikzIndex === -1) {
      return res.status(404).json({ success: false, error: 'TikZ代码不存在' });
    }

    const tikzCode = question.tikzCodes![tikzIndex];

    // 更新TikZ代码
    tikzCode.code = code;
    if (format) {
      tikzCode.format = format;
    }

    await question.save();

    return res.json({
      success: true,
      data: tikzCode,
      message: 'TikZ代码更新成功'
    });
  } catch (error) {
    console.error('更新TikZ代码失败:', error);
    return res.status(500).json({ success: false, error: '更新TikZ代码失败' });
  }
});

// 删除TikZ代码
router.delete('/:questionId/tikz/:tikzId', [
  param('questionId').isMongoId().withMessage('无效的题目ID'),
  param('tikzId').notEmpty().withMessage('TikZ ID不能为空')
], authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, error: '参数验证失败', details: errors.array() });
    }

    const { questionId, tikzId } = req.params;

    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({ success: false, error: '题目不存在' });
    }

    // 检查用户权限
    const userId = req.user!._id.toString();
    if (question.creator.toString() !== userId) {
      return res.status(403).json({ success: false, error: '权限不足' });
    }

    // 查找TikZ代码
    const tikzIndex = question.tikzCodes?.findIndex(tikz => tikz.id === tikzId) ?? -1;
    if (tikzIndex === -1) {
      return res.status(404).json({ success: false, error: 'TikZ代码不存在' });
    }

    // 从数组中移除
    question.tikzCodes!.splice(tikzIndex, 1);
    await question.save();

    return res.json({
      success: true,
      message: 'TikZ代码删除成功'
    });
  } catch (error) {
    console.error('删除TikZ代码失败:', error);
    return res.status(500).json({ success: false, error: '删除TikZ代码失败' });
  }
});

// 调整TikZ代码顺序
router.put('/:questionId/tikz/order', [
  param('questionId').isMongoId().withMessage('无效的题目ID'),
  body('tikzOrders').isArray().withMessage('TikZ顺序必须是数组'),
  body('tikzOrders.*.id').notEmpty().withMessage('TikZ ID不能为空'),
  body('tikzOrders.*.order').isInt({ min: 0 }).withMessage('顺序必须是非负整数')
], authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, error: '参数验证失败', details: errors.array() });
    }

    const { questionId } = req.params;
    const { tikzOrders } = req.body;

    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({ success: false, error: '题目不存在' });
    }

    // 检查用户权限
    const userId = req.user!._id.toString();
    if (question.creator.toString() !== userId) {
      return res.status(403).json({ success: false, error: '权限不足' });
    }

    if (!question.tikzCodes || question.tikzCodes.length === 0) {
      return res.status(400).json({ success: false, error: '题目没有TikZ代码' });
    }

    // 更新TikZ代码顺序
    for (const orderItem of tikzOrders) {
      const tikzCode = question.tikzCodes.find(tikz => tikz.id === orderItem.id);
      if (tikzCode) {
        tikzCode.order = orderItem.order;
      }
    }

    await question.save();

    return res.json({
      success: true,
      data: question.tikzCodes,
      message: 'TikZ代码顺序更新成功'
    });
  } catch (error) {
    console.error('更新TikZ代码顺序失败:', error);
    return res.status(500).json({ success: false, error: '更新TikZ代码顺序失败' });
  }
});

export default router;
