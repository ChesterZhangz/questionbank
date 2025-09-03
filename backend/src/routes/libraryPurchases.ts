import express, { Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth';
import { libraryMemberMiddleware, checkLibraryPurchasePermission } from '../middleware/libraryPermissions';
import { Library } from '../models/Library';
import { LibraryPurchase } from '../models/LibraryPurchase';
import { LibraryRequest } from '../middleware/libraryPermissions';

const router = express.Router();

// 购买试卷集
router.post('/:libraryId/purchase', authMiddleware, async (req: Request, res: Response) => {
  try {
    const libraryId = req.params.libraryId;
    const userId = (req as any).user._id;
    const { paymentMethod, transactionId } = req.body;

    // 检查试卷集是否存在
    const library = await Library.findById(libraryId);
    if (!library) {
      return res.status(404).json({ success: false, error: '试卷集不存在' });
    }

    // 检查购买权限
    if (!checkLibraryPurchasePermission(library, userId)) {
      return res.status(403).json({ success: false, error: '无法购买此试卷集' });
    }

    // 检查是否已经购买过
    const existingPurchase = await LibraryPurchase.findOne({
      libraryId: library._id,
      userId: userId
    });

    if (existingPurchase) {
      if (existingPurchase.status === 'completed') {
        return res.status(400).json({ success: false, error: '您已经购买过此试卷集' });
      } else if (existingPurchase.status === 'pending') {
        return res.status(400).json({ success: false, error: '您有未完成的购买订单' });
      }
    }

    // 创建购买记录
    const purchase = new LibraryPurchase({
      libraryId: library._id,
      userId: userId,
      amount: library.price,
      paymentMethod,
      transactionId,
      status: 'completed', // 简化处理，直接设为完成
      purchaseDate: new Date()
    });

    await purchase.save();

    // 自动将用户添加为试卷集的查看者
    if (!library.members.some(m => m.user.toString() === userId.toString())) {
      library.members.push({
        user: userId,
        role: 'viewer',
        joinedAt: new Date()
      });
      await library.save();
    }

    return res.status(201).json({ 
      success: true, 
      data: purchase,
      message: '购买成功，您已成为该试卷集的查看者'
    });
  } catch (error) {
    console.error('Purchase library failed:', error);
    return res.status(500).json({ success: false, error: '购买失败' });
  }
});

// 获取用户的购买记录
router.get('/my-purchases', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user._id;
    const { page = 1, limit = 20 } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    
    const [purchases, total] = await Promise.all([
      LibraryPurchase.find({ userId, status: 'completed' })
        .populate('libraryId', 'name description avatar tags price status')
        .sort({ purchaseDate: -1 })
        .skip(skip)
        .limit(Number(limit)),
      LibraryPurchase.countDocuments({ userId, status: 'completed' })
    ]);

    return res.json({
      success: true,
      data: {
        items: purchases,
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Get my purchases failed:', error);
    return res.status(500).json({ success: false, error: '获取购买记录失败' });
  }
});

// 获取试卷集的购买记录（仅所有者和管理者可见）
router.get('/:libraryId/purchases', authMiddleware, libraryMemberMiddleware, async (req: LibraryRequest, res: Response) => {
  try {
    const { userRole } = req;
    
    // 只有所有者和管理者可以查看购买记录
    if (userRole !== 'owner' && userRole !== 'admin') {
      return res.status(403).json({ success: false, error: '权限不足' });
    }

    const libraryId = req.params.libraryId;
    const { page = 1, limit = 20 } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    
    const [purchases, total] = await Promise.all([
      LibraryPurchase.find({ libraryId, status: 'completed' })
        .populate('userId', 'name email')
        .sort({ purchaseDate: -1 })
        .skip(skip)
        .limit(Number(limit)),
      LibraryPurchase.countDocuments({ libraryId, status: 'completed' })
    ]);

    return res.json({
      success: true,
      data: {
        items: purchases,
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Get library purchases failed:', error);
    return res.status(500).json({ success: false, error: '获取购买记录失败' });
  }
});

export default router;
