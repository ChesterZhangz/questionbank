import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { PaperBankReview } from '../models/PaperBankReview';
import PaperBank from '../models/PaperBank';
import PaperBankMember from '../models/PaperBankMember';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = express.Router();

// 获取试卷集评价列表
router.get('/paper-bank/:id/reviews', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    
    const skip = (Number(page) - 1) * Number(limit);
    const sort: any = {};
    sort[sortBy as string] = sortOrder === 'desc' ? -1 : 1;
    
    const reviews = await PaperBankReview.find({ paperBankId: id })
      .populate('userId', 'username email avatar')
      .sort(sort)
      .skip(skip)
      .limit(Number(limit));
    
    const total = await PaperBankReview.countDocuments({ paperBankId: id });
    
    res.json({
      success: true,
      data: {
        reviews,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    console.error('获取评价列表失败:', error);
    res.status(500).json({ success: false, error: '获取评价列表失败' });
  }
});

// 创建评价
router.post('/paper-bank/:id/reviews', authMiddleware, [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('评分必须在1-5之间'),
  body('comment').isLength({ min: 1, max: 1000 }).withMessage('评价内容长度必须在1-1000字符之间'),
  body('isAnonymous').optional().isBoolean().withMessage('匿名标识必须是布尔值')
], async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, error: errors.array()[0].msg });
    }
    
    const { id } = req.params;
    const { rating, comment, isAnonymous = false } = req.body;
    const userId = req.user._id;
    
    // 检查试卷集是否存在
    const paperBank = await PaperBank.findById(id);
    if (!paperBank) {
      return res.status(404).json({ success: false, error: '试卷集不存在' });
    }
    
    // 检查用户是否已购买试卷集
    const member = await PaperBankMember.findOne({
      paperBankId: id,
      userId: userId
    });
    
    if (!member) {
      return res.status(403).json({ success: false, error: '只有购买过试卷集的用户才能评价' });
    }
    
    // 检查用户是否已经评价过
    const existingReview = await PaperBankReview.findOne({
      paperBankId: id,
      userId: userId
    });
    
    if (existingReview) {
      return res.status(400).json({ success: false, error: '您已经评价过此试卷集' });
    }
    
    // 创建评价
    const review = new PaperBankReview({
      paperBankId: id,
      userId: userId,
      rating,
      comment,
      isAnonymous
    });
    
    await review.save();
    
    // 更新试卷集平均评分
    await updatePaperBankRating(id);
    
    res.json({
      success: true,
      message: '评价提交成功',
      data: review
    });
    return;
  } catch (error) {
    console.error('创建评价失败:', error);
    res.status(500).json({ success: false, error: '评价提交失败' });
    return;
  }
});

// 更新评价
router.put('/paper-bank/:id/reviews/:reviewId', authMiddleware, [
  body('rating').optional().isInt({ min: 1, max: 5 }).withMessage('评分必须在1-5之间'),
  body('comment').optional().isLength({ min: 1, max: 1000 }).withMessage('评价内容长度必须在1-1000字符之间'),
  body('isAnonymous').optional().isBoolean().withMessage('匿名标识必须是布尔值')
], async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, error: errors.array()[0].msg });
    }
    
    const { id, reviewId } = req.params;
    const userId = req.user._id;
    
    // 查找评价
    const review = await PaperBankReview.findOne({
      _id: reviewId,
      paperBankId: id,
      userId: userId
    });
    
    if (!review) {
      return res.status(404).json({ success: false, error: '评价不存在或无权限修改' });
    }
    
    // 更新评价
    if (req.body.rating !== undefined) review.rating = req.body.rating;
    if (req.body.comment !== undefined) review.comment = req.body.comment;
    if (req.body.isAnonymous !== undefined) review.isAnonymous = req.body.isAnonymous;
    
    await review.save();
    
    // 更新试卷集平均评分
    await updatePaperBankRating(id);
    
    res.json({
      success: true,
      message: '评价更新成功',
      data: review
    });
    return;
  } catch (error) {
    console.error('更新评价失败:', error);
    res.status(500).json({ success: false, error: '评价更新失败' });
    return;
  }
});

// 删除评价
router.delete('/paper-bank/:id/reviews/:reviewId', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id, reviewId } = req.params;
    const userId = req.user._id;
    
    // 查找评价
    const review = await PaperBankReview.findOne({
      _id: reviewId,
      paperBankId: id,
      userId: userId
    });
    
    if (!review) {
      return res.status(404).json({ success: false, error: '评价不存在或无权限删除' });
    }
    
    await PaperBankReview.findByIdAndDelete(reviewId);
    
    // 更新试卷集平均评分
    await updatePaperBankRating(id);
    
    res.json({
      success: true,
      message: '评价删除成功'
    });
    return;
  } catch (error) {
    console.error('删除评价失败:', error);
    res.status(500).json({ success: false, error: '评价删除失败' });
    return;
  }
});

// 点赞评价
router.post('/paper-bank/:id/reviews/:reviewId/helpful', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { reviewId } = req.params;
    
    const review = await PaperBankReview.findById(reviewId);
    if (!review) {
      return res.status(404).json({ success: false, error: '评价不存在' });
    }
    
    // 增加有用评价数
    review.helpfulCount += 1;
    await review.save();
    
    res.json({
      success: true,
      message: '点赞成功',
      data: { helpfulCount: review.helpfulCount }
    });
    return;
  } catch (error) {
    console.error('点赞评价失败:', error);
    res.status(500).json({ success: false, error: '点赞失败' });
    return;
  }
});

// 更新试卷集平均评分的辅助函数
async function updatePaperBankRating(paperBankId: string) {
  try {
    const reviews = await PaperBankReview.find({ paperBankId });
    
    if (reviews.length === 0) {
      await PaperBank.findByIdAndUpdate(paperBankId, {
        rating: 0,
        reviewCount: 0
      });
      return;
    }
    
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviews.length;
    
    await PaperBank.findByIdAndUpdate(paperBankId, {
      rating: Math.round(averageRating * 10) / 10, // 保留一位小数
      reviewCount: reviews.length
    });
  } catch (error) {
    console.error('更新试卷集评分失败:', error);
  }
}

export default router;
