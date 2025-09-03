import express, { Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth';
import { 
  libraryMemberMiddleware, 
  requireLibraryRole, 
  checkLibraryStatusAccess,
  checkLibraryEditPermission,
  checkLibraryPublishPermission,
  checkMemberManagementPermission,
  LibraryRequest
} from '../middleware/libraryPermissions';
import { Library } from '../models/Library';
import { Paper } from '../models/Paper';
import { User } from '../models/User';
import { Invitation } from '../models/Invitation';
import { emailService } from '../services/emailService';
import mongoose from 'mongoose';

const router = express.Router();

// 创建试题库
router.post('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const owner = (req as any).user._id;
    const { name, description, avatar, tags, price, status } = req.body;
    
    const lib = await Library.create({ 
      name, 
      description, 
      avatar,
      tags: tags || [],
      price: price || 0,
      status: status || 'draft',
      owner, 
      members: [{ user: owner, role: 'owner' }] 
    });
    
    return res.status(201).json({ success: true, data: lib });
  } catch (e) {
    return res.status(500).json({ success: false, error: '创建试题库失败' });
  }
});

// 我的试题库列表
router.get('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user._id;
    const { status, keyword } = req.query;
    
    // 基础权限过滤条件
    const permissionFilter = { $or: [{ owner: userId }, { 'members.user': userId }] };
    
    // 构建完整的查询条件
    let filter: any = { ...permissionFilter };
    
    if (status) {
      filter.status = status;
    }
    
    if (keyword) {
      const keywordStr = String(keyword);
      // 使用 $and 来组合权限过滤和关键词搜索
      filter = {
        $and: [
          permissionFilter,
          {
            $or: [
              { name: { $regex: keywordStr, $options: 'i' } },
              { description: { $regex: keywordStr, $options: 'i' } },
              { tags: { $in: [new RegExp(keywordStr, 'i')] } }
            ]
          }
        ]
      };
    }
    
    // 使用 lean() 提高性能，只返回普通对象而不是 Mongoose 文档
    const libs = await Library.find(filter)
      .lean()
      .sort({ createdAt: -1 })
      .select('name description avatar tags price status owner members publishedAt createdAt updatedAt');
    
    return res.json({ success: true, data: libs });
  } catch (e) {
    console.error('获取试题库失败:', e);
    return res.status(500).json({ success: false, error: '获取试题库失败' });
  }
});

// 获取单个试题库（需要成员权限）
router.get('/:id', authMiddleware, libraryMemberMiddleware, checkLibraryStatusAccess, async (req: LibraryRequest, res: Response) => {
  try {
    return res.json({ success: true, data: req.library });
  } catch (e) {
    return res.status(500).json({ success: false, error: '获取试题库失败' });
  }
});

// 更新试题库信息（只有拥有者可以）
router.put('/:id', authMiddleware, libraryMemberMiddleware, checkLibraryStatusAccess, async (req: LibraryRequest, res: Response) => {
  try {
    if (!checkLibraryEditPermission(req.userRole!)) {
      return res.status(403).json({ success: false, error: '只有拥有者可以编辑试卷集信息' });
    }

    const { name, description, avatar, tags, price } = req.body;
    const updates: any = {};
    
    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (avatar !== undefined) updates.avatar = avatar;
    if (tags !== undefined) updates.tags = tags;
    if (price !== undefined) updates.price = price;

    const lib = await Library.findByIdAndUpdate(req.params.id, updates, { new: true });
    return res.json({ success: true, data: lib });
  } catch (e) {
    return res.status(500).json({ success: false, error: '更新试题库失败' });
  }
});

// 发布试题库（只有拥有者可以）
router.post('/:id/publish', authMiddleware, libraryMemberMiddleware, async (req: LibraryRequest, res: Response) => {
  try {
    if (!checkLibraryPublishPermission(req.userRole!)) {
      return res.status(403).json({ success: false, error: '只有拥有者可以发布试卷集' });
    }

    const lib = await Library.findByIdAndUpdate(
      req.params.id, 
      { 
        status: 'published', 
        publishedAt: new Date() 
      }, 
      { new: true }
    );
    
    return res.json({ success: true, data: lib });
  } catch (e) {
    return res.status(500).json({ success: false, error: '发布试题库失败' });
  }
});

// 获取库成员
router.get('/:id/members', authMiddleware, libraryMemberMiddleware, checkLibraryStatusAccess, async (req: LibraryRequest, res: Response) => {
  try {
    if (!req.library) {
      return res.status(500).json({ success: false, error: '试卷集信息缺失' });
    }
    
    const memberIds = req.library.members.map((m: any) => m.user);
    const users = await User.find({ _id: { $in: memberIds } }, 'name email');
    const idToUser = new Map(users.map((u: any) => [String(u._id), u]));
    const result = req.library.members.map((m: any) => ({
      user: m.user,
      role: m.role,
      name: idToUser.get(String(m.user))?.name,
      email: idToUser.get(String(m.user))?.email,
      joinedAt: m.joinedAt
    }));
    return res.json({ success: true, data: result });
  } catch (e) {
    return res.status(500).json({ success: false, error: '获取成员失败' });
  }
});

// 批量邀请成员（通过邮箱添加已存在用户）
router.post('/:id/invites', authMiddleware, libraryMemberMiddleware, checkLibraryStatusAccess, async (req: LibraryRequest, res: Response) => {
  try {
    if (!req.library) {
      return res.status(500).json({ success: false, error: '试卷集信息缺失' });
    }
    
    if (!checkMemberManagementPermission(req.userRole!)) {
      return res.status(403).json({ success: false, error: '没有权限邀请成员' });
    }

    const { invites } = req.body as { invites: Array<{ email: string; role: 'owner'|'admin'|'collaborator'|'viewer' }> };
    let success = 0; let failed = 0;
    
    for (const inv of (invites || [])) {
      const user = await User.findOne({ email: inv.email });
      if (!user) { failed++; continue; }
      const exists = req.library!.members.some((m: any) => String(m.user) === String(user._id));
      if (exists) { failed++; continue; }
      req.library!.members.push({ user: user._id as mongoose.Types.ObjectId, role: inv.role || 'viewer', joinedAt: new Date() });
      success++;
    }
    
    await req.library!.save();
    return res.json({ success: true, data: { success, failed } });
  } catch (e) {
    return res.status(500).json({ success: false, error: '邀请成员失败' });
  }
});

// 更新成员角色
router.patch('/:id/members/:userId', authMiddleware, libraryMemberMiddleware, checkLibraryStatusAccess, async (req: LibraryRequest, res: Response) => {
  try {
    if (!checkMemberManagementPermission(req.userRole!)) {
      return res.status(403).json({ success: false, error: '没有权限管理成员' });
    }

    if (!req.library) {
      return res.status(500).json({ success: false, error: '试卷集信息缺失' });
    }

    const { role } = req.body as { role: 'owner'|'admin'|'collaborator'|'viewer' };
    const member = req.library.members.find((m: any) => String(m.user) === String(req.params.userId));
    if (!member) return res.status(404).json({ success: false, error: '成员不存在' });
    
    // 禁止将拥有者降级
    if (String(req.library.owner) === String(req.params.userId) && role !== 'owner') {
      return res.status(400).json({ success: false, error: '不能将拥有者降级' });
    }
    
    member.role = role;
    await req.library.save();
    return res.json({ success: true });
  } catch (e) {
    return res.status(500).json({ success: false, error: '更新成员失败' });
  }
});

// 移除成员
router.delete('/:id/members/:userId', authMiddleware, libraryMemberMiddleware, checkLibraryStatusAccess, async (req: LibraryRequest, res: Response) => {
  try {
    if (!checkMemberManagementPermission(req.userRole!)) {
      return res.status(403).json({ success: false, error: '没有权限移除成员' });
    }

    if (!req.library) {
      return res.status(500).json({ success: false, error: '试卷集信息缺失' });
    }

    // 禁止移除拥有者
    if (String(req.library.owner) === String(req.params.userId)) {
      return res.status(400).json({ success: false, error: '不能移除试卷集拥有者' });
    }
    
    req.library.members = req.library.members.filter((m: any) => String(m.user) !== String(req.params.userId));
    await req.library.save();
    return res.json({ success: true });
  } catch (e) {
    return res.status(500).json({ success: false, error: '移除成员失败' });
  }
});

// 库内试卷列表（根据权限过滤）
router.get('/:id/papers', authMiddleware, libraryMemberMiddleware, checkLibraryStatusAccess, async (req: LibraryRequest, res: Response) => {
  try {
    const page = Math.max(1, parseInt(String(req.query.page || '1')));
    const limit = Math.max(1, Math.min(50, parseInt(String(req.query.limit || '10'))));
    const keyword = String(req.query.keyword || '').trim();
    const status = req.query.status as string;
    
    const filter: any = { libraryId: req.params.id };
    
    if (keyword) {
      filter.$or = [
        { name: new RegExp(keyword, 'i') },
        { subject: new RegExp(keyword, 'i') },
        { grade: new RegExp(keyword, 'i') }
      ];
    }
    
    if (status) {
      filter.status = status;
    } else {
      // 查看者只能看到已发布和已修改的试卷
      if (req.userRole === 'viewer') {
        filter.status = { $in: ['published', 'modified'] };
      }
    }
    
    // 使用 lean() 提高性能，只返回普通对象
    const total = await Paper.countDocuments(filter);
    const items = await Paper.find(filter)
      .select('name subject grade status sections createdAt updatedAt owner')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();
    
    return res.json({ success: true, data: { items, total, page, pages: Math.ceil(total / limit) } });
  } catch (e) {
    console.error('获取试卷列表失败:', e);
    return res.status(500).json({ success: false, error: '获取试卷列表失败' });
  }
});

// 库统计
router.get('/:id/stats', authMiddleware, libraryMemberMiddleware, checkLibraryStatusAccess, async (req: LibraryRequest, res: Response) => {
  try {
    const libId = req.params.id;
    
    // 使用聚合查询一次性获取所有统计数据，提高性能
    const stats = await Paper.aggregate([
      { $match: { libraryId: new mongoose.Types.ObjectId(libId) } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          drafts: { $sum: { $cond: [{ $eq: ['$status', 'draft'] }, 1, 0] } },
          published: { $sum: { $cond: [{ $eq: ['$status', 'published'] }, 1, 0] } },
          modified: { $sum: { $cond: [{ $eq: ['$status', 'modified'] }, 1, 0] } }
        }
      }
    ]);
    
    const result = stats[0] || { total: 0, drafts: 0, published: 0, modified: 0 };
    
    // 获取最近30天的创建统计
    const since = new Date(); 
    since.setDate(since.getDate() - 30);
    const last30 = await Paper.aggregate([
      { 
        $match: { 
          libraryId: new mongoose.Types.ObjectId(libId), 
          createdAt: { $gte: since } 
        } 
      },
      { 
        $group: { 
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, 
          count: { $sum: 1 } 
        } 
      },
      { $sort: { _id: 1 } }
    ]);
    
    return res.json({ 
      success: true, 
      data: { 
        totalPapers: result.total, 
        drafts: result.drafts, 
        published: result.published, 
        modified: result.modified,
        createdLast30Days: last30.map((d: any) => ({ date: d._id, count: d.count })) 
      } 
    });
  } catch (e) {
    console.error('获取试题库统计失败:', e);
    return res.status(500).json({ success: false, error: '获取试题库统计失败' });
  }
});

// 发送邀请邮件
router.post('/:id/invitations', authMiddleware, libraryMemberMiddleware, checkLibraryStatusAccess, async (req: LibraryRequest, res: Response) => {
  try {
    if (!checkMemberManagementPermission(req.userRole!)) {
      return res.status(403).json({ success: false, error: '没有权限发送邀请' });
    }

    const { invitations } = req.body as { invitations: Array<{ email: string; role: 'owner'|'admin'|'collaborator'|'viewer' }> };
    
    // 获取邀请人信息
    const inviter = await User.findById((req as any).user._id);
    if (!inviter) {
      return res.status(400).json({ success: false, error: '邀请人信息不存在' });
    }

    let success = 0;
    let failed = 0;

    for (const invitation of invitations) {
      try {
        // 检查用户是否已经存在
        const existingUser = await User.findOne({ email: invitation.email });
        if (existingUser) {
          // 如果用户已存在，检查是否已经是成员
          const isAlreadyMember = req.library!.members.some((m: any) => String(m.user) === String(existingUser._id));
          if (isAlreadyMember) {
            failed++;
            continue;
          }
        }

        // 检查是否已有待处理的邀请
        const existingInvitation = await Invitation.findOne({
          libraryId: req.library!._id,
          email: invitation.email,
          status: 'pending'
        });
        
        if (existingInvitation) {
          failed++;
          continue;
        }

        // 生成接受邀请的链接
        const acceptUrl = `${process.env.FRONTEND_URL}/libraries/${req.library!._id}/accept-invitation?email=${encodeURIComponent(invitation.email)}&role=${invitation.role}`;
        
        // 发送邀请邮件
        const emailSent = await emailService.sendInvitationEmail({
          email: invitation.email,
          role: invitation.role,
          libraryName: req.library!.name,
          inviterName: inviter.name,
          acceptUrl: acceptUrl
        });

        if (emailSent) {
          // 创建邀请记录，设置7天后过期
          const expiresAt = new Date();
          expiresAt.setDate(expiresAt.getDate() + 7);
          
          await Invitation.create({
            libraryId: req.library!._id,
            email: invitation.email,
            role: invitation.role,
            inviterId: (req as any).user._id,
            status: 'pending',
            expiresAt: expiresAt
          });
          
          success++;
        } else {
          failed++;
        }
      } catch (error) {
        console.error(`处理邀请 ${invitation.email} 时出错:`, error);
        failed++;
      }
    }

    return res.json({ 
      success: true, 
      data: { success, failed },
      message: `成功发送 ${success} 个邀请，失败 ${failed} 个`
    });
  } catch (error) {
    console.error('发送邀请邮件失败:', error);
    return res.status(500).json({ success: false, error: '发送邀请邮件失败' });
  }
});

// 接受邀请 - 使用宽松的认证检查
router.post('/:id/accept-invitation', async (req: Request, res: Response) => {
  try {
    // 手动验证token，但不检查密码更改时间
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ success: false, error: '访问被拒绝，没有提供令牌' });
    }

    // 验证JWT token
    const decoded = require('jsonwebtoken').verify(token, process.env.JWT_SECRET!);
    if (!decoded || !decoded.userId) {
      return res.status(401).json({ success: false, error: '令牌无效' });
    }

    const currentUser = decoded.userId;
    const { email, role } = req.body as { email: string; role: string };
    
    // 验证当前用户的邮箱是否匹配邀请
    const user = await User.findById(currentUser);
    if (!user || user.email !== email) {
      return res.status(403).json({ success: false, error: '邮箱不匹配，无法接受邀请' });
    }

    const lib = await Library.findById(req.params.id);
    if (!lib) {
      return res.status(404).json({ success: false, error: '试卷集不存在' });
    }

    // 查找待处理的邀请
    const invitation = await Invitation.findOne({
      libraryId: lib._id,
      email: email,
      status: 'pending'
    });

    if (!invitation) {
      return res.status(404).json({ success: false, error: '邀请不存在或已过期' });
    }

    // 检查邀请是否过期
    if (invitation.expiresAt < new Date()) {
      await Invitation.findByIdAndUpdate(invitation._id, { status: 'expired' });
      return res.status(400).json({ success: false, error: '邀请已过期' });
    }

    // 检查用户是否已经是成员
    const isAlreadyMember = lib.members.some((m: any) => String(m.user) === String(currentUser));
    if (isAlreadyMember) {
      return res.status(400).json({ success: false, error: '您已经是该试卷集的成员' });
    }

    // 添加用户到成员列表
    lib.members.push({ user: currentUser, role: invitation.role as any, joinedAt: new Date() });
    await lib.save();

    // 更新邀请状态为已接受
    await Invitation.findByIdAndUpdate(invitation._id, { status: 'accepted' });

    return res.json({ 
      success: true, 
      message: '成功接受邀请，已加入试卷集',
      data: { role: invitation.role, libraryName: lib.name }
    });
  } catch (error) {
    console.error('接受邀请失败:', error);
    return res.status(500).json({ success: false, error: '接受邀请失败' });
  }
});

export default router;


