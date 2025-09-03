import express, { Request, Response } from 'express';
import { body, query, validationResult } from 'express-validator';
import PaperBank from '../models/PaperBank';
import PaperBankMember from '../models/PaperBankMember';
import { User } from '../models/User';
import { authMiddleware } from '../middleware/auth';
import { emailService } from '../services/emailService';

// 扩展Request类型以包含user属性
interface AuthRequest extends Request {
  user?: {
    _id: string;
    email: string;
    role: string;
  };
}

const router = express.Router();

// 获取试卷集列表
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const {
      search = '',
      category = '',
      difficulty = '',
      status = '',
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 20
    } = req.query;

    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({ success: false, error: '未授权访问' });
    }

    // 构建查询条件
    const query: any = { ownerId: userId };

    if (search && typeof search === 'string') {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { customTags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    if (category && category !== 'all') {
      query.category = category;
    }

    if (status && status !== 'all') {
      query.status = status;
    }

    // 构建排序条件
    const sort: any = {};
    sort[sortBy as string] = sortOrder === 'asc' ? 1 : -1;

    // 分页
    const skip = (Number(page) - 1) * Number(limit);

    // 执行查询
    const [paperBanks, total] = await Promise.all([
      PaperBank.find(query)
        .sort(sort)
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      PaperBank.countDocuments(query)
    ]);

    return res.json({
      success: true,
      data: {
        paperBanks,
        pagination: {
          currentPage: Number(page),
          totalPages: Math.ceil(total / Number(limit)),
          total,
          limit: Number(limit)
        }
      }
    });
  } catch (error: any) {
    console.error('获取试卷集列表失败:', error);
    return res.status(500).json({ success: false, error: '获取试卷集列表失败' });
  }
});

// 创建试卷集
router.post('/', authMiddleware, [
  body('name').trim().isLength({ min: 1, max: 100 }).withMessage('名称长度必须在1-100字符之间'),
  body('description').trim().isLength({ min: 1, max: 500 }).withMessage('描述长度必须在1-500字符之间'),
  body('category').trim().isLength({ min: 1 }).withMessage('分类不能为空'),
  body('customTags').optional().isArray().withMessage('自定义标签必须是数组')
], async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, error: errors.array()[0].msg });
    }

    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({ success: false, error: '未授权访问' });
    }

    const paperBankData = {
      ...req.body,
      ownerId: userId,
      memberCount: 1, // 创建者算作第一个成员
      paperCount: 0,
      rating: 0,
      purchaseCount: 0
    };

    const paperBank = new PaperBank(paperBankData);
    await paperBank.save();

    // 获取用户信息
    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({ success: false, error: '用户不存在' });
    }

    // 将创建者添加为成员（owner角色）
    const member = new PaperBankMember({
      paperBankId: paperBank._id,
      userId: userId,
      username: user.name,
      email: user.email,
      role: 'owner',
      joinedAt: new Date(),
      lastActiveAt: new Date()
    });

    await member.save();

    return res.status(201).json({
      success: true,
      data: paperBank
    });
  } catch (error: any) {
    console.error('创建试卷集失败:', error);
    return res.status(500).json({ success: false, error: '创建试卷集失败' });
  }
});

// 获取单个试卷集
router.get('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ success: false, error: '未授权访问' });
    }

    const paperBank = await PaperBank.findOne({ _id: id, ownerId: userId });
    if (!paperBank) {
      return res.status(404).json({ success: false, error: '试卷集不存在' });
    }

    return res.json({
      success: true,
      data: paperBank
    });
  } catch (error: any) {
    console.error('获取试卷集失败:', error);
    return res.status(500).json({ success: false, error: '获取试卷集失败' });
  }
});

// 更新试卷集
router.put('/:id', authMiddleware, [
  body('name').optional().trim().isLength({ min: 1, max: 100 }).withMessage('名称长度必须在1-100字符之间'),
  body('description').optional().trim().isLength({ min: 1, max: 500 }).withMessage('描述长度必须在1-500字符之间'),
  body('category').optional().trim().isLength({ min: 1 }).withMessage('分类不能为空'),
  body('customTags').optional().isArray().withMessage('自定义标签必须是数组')
], async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, error: errors.array()[0].msg });
    }

    const { id } = req.params;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ success: false, error: '未授权访问' });
    }

    const paperBank = await PaperBank.findOne({ _id: id, ownerId: userId });
    if (!paperBank) {
      return res.status(404).json({ success: false, error: '试卷集不存在' });
    }

    // 更新字段
    Object.assign(paperBank, req.body);
    await paperBank.save();

    return res.json({
      success: true,
      data: paperBank
    });
  } catch (error: any) {
    console.error('更新试卷集失败:', error);
    return res.status(500).json({ success: false, error: '更新试卷集失败' });
  }
});

// 发布试卷集
router.post('/:id/publish', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ success: false, error: '未授权访问' });
    }

    const paperBank = await PaperBank.findOne({ _id: id, ownerId: userId });
    if (!paperBank) {
      return res.status(404).json({ success: false, error: '试卷集不存在' });
    }

    paperBank.status = 'published';
    paperBank.publishedAt = new Date();
    await paperBank.save();

    return res.json({
      success: true,
      data: paperBank
    });
  } catch (error: any) {
    console.error('发布试卷集失败:', error);
    return res.status(500).json({ success: false, error: '发布试卷集失败' });
  }
});

// 取消发布试卷集
router.post('/:id/unpublish', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ success: false, error: '未授权访问' });
    }

    const paperBank = await PaperBank.findOne({ _id: id, ownerId: userId });
    if (!paperBank) {
      return res.status(404).json({ success: false, error: '试卷集不存在' });
    }

    paperBank.status = 'draft';
    paperBank.publishedAt = undefined;
    await paperBank.save();

    return res.json({
      success: true,
      data: paperBank
    });
  } catch (error: any) {
    console.error('取消发布试卷集失败:', error);
    return res.status(500).json({ success: false, error: '取消发布试卷集失败' });
  }
});

// 删除试卷集
router.delete('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ success: false, error: '未授权访问' });
    }

    const paperBank = await PaperBank.findOne({ _id: id, ownerId: userId });
    if (!paperBank) {
      return res.status(404).json({ success: false, error: '试卷集不存在' });
    }

    await PaperBank.deleteOne({ _id: id });

    return res.json({
      success: true,
      message: '试卷集删除成功'
    });
  } catch (error: any) {
    console.error('删除试卷集失败:', error);
    return res.status(500).json({ success: false, error: '删除试卷集失败' });
  }
});

// 发布试卷集
router.patch('/:id/publish', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ success: false, error: '未授权访问' });
    }

    const paperBank = await PaperBank.findOne({ _id: id, ownerId: userId });
    if (!paperBank) {
      return res.status(404).json({ success: false, error: '试卷集不存在' });
    }

    paperBank.status = 'published';
    paperBank.publishedAt = new Date();
    await paperBank.save();

    return res.json({
      success: true,
      data: paperBank
    });
  } catch (error: any) {
    console.error('发布试卷集失败:', error);
    return res.status(500).json({ success: false, error: '发布试卷集失败' });
  }
});

// 获取试卷集成员列表
router.get('/:id/members', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ success: false, error: '未授权访问' });
    }

    // 检查用户是否有权限访问这个试卷集
    const paperBank = await PaperBank.findOne({ _id: id, ownerId: userId });
    if (!paperBank) {
      return res.status(404).json({ success: false, error: '试卷集不存在或无权限访问' });
    }

    // 获取成员列表
    const members = await PaperBankMember.find({ paperBankId: id })
      .sort({ role: 1, joinedAt: 1 })
      .lean();

    return res.json({
      success: true,
      data: {
        members,
        total: members.length
      }
    });
  } catch (error: any) {
    console.error('获取试卷集成员失败:', error);
    return res.status(500).json({ success: false, error: '获取试卷集成员失败' });
  }
});

// 邀请成员加入试卷集
router.post('/:id/members', authMiddleware, [
  body('email').isEmail().withMessage('邮箱格式不正确'),
  body('role').isIn(['manager', 'collaborator', 'viewer']).withMessage('角色必须是manager、collaborator或viewer')
], async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, error: errors.array()[0].msg });
    }

    const { id } = req.params;
    const { email, role } = req.body;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ success: false, error: '未授权访问' });
    }

    // 检查用户是否有权限邀请成员
    const paperBank = await PaperBank.findOne({ _id: id, ownerId: userId });
    if (!paperBank) {
      return res.status(404).json({ success: false, error: '试卷集不存在或无权限访问' });
    }

    // 检查要邀请的用户是否存在
    const invitedUser = await User.findOne({ email });
    if (!invitedUser) {
      return res.status(404).json({ success: false, error: '用户不存在' });
    }

    // 检查用户是否已经是成员
    const existingMember = await PaperBankMember.findOne({ 
      paperBankId: id, 
      userId: invitedUser._id 
    });
    if (existingMember) {
      return res.status(400).json({ success: false, error: '用户已经是试卷集成员' });
    }

    // 获取邀请人信息
    const inviter = await User.findById(userId);
    if (!inviter) {
      return res.status(400).json({ success: false, error: '邀请人信息不存在' });
    }

    // 发送邀请邮件
    const acceptUrl = `${process.env.FRONTEND_URL}/paper-banks/${id}/accept-invitation?email=${encodeURIComponent(email)}&role=${role}`;
    const emailSent = await emailService.sendPaperBankInvitationEmail({
      email: email,
      role: role,
      paperBankName: paperBank.name,
      inviterName: inviter.name,
      acceptUrl: acceptUrl
    });

    if (emailSent) {
      // 创建新成员
      const member = new PaperBankMember({
        paperBankId: id,
        userId: invitedUser._id,
        username: invitedUser.name,
        email: invitedUser.email,
        role,
        joinedAt: new Date(),
        lastActiveAt: new Date()
      });

      await member.save();

      // 更新试卷集的成员数量
      await PaperBank.findByIdAndUpdate(id, { $inc: { memberCount: 1 } });

      return res.json({
        success: true,
        data: member,
        message: '邀请成功，邀请邮件已发送'
      });
    } else {
      return res.status(500).json({ success: false, error: '邀请邮件发送失败' });
    }
  } catch (error: any) {
    console.error('邀请成员失败:', error);
    return res.status(500).json({ success: false, error: '邀请成员失败' });
  }
});

export default router;
