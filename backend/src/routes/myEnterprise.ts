import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import mongoose from 'mongoose';
import { Enterprise } from '../models/Enterprise';
import { Department } from '../models/Department';
import { User } from '../models/User';
import { EnterpriseMessage } from '../models/EnterpriseMessage';
import EnterpriseMember from '../models/EnterpriseMember';
import { AuthRequest, authMiddleware } from '../middleware/auth';

const router = express.Router();

// 获取当前用户的企业信息
router.get('/info', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user?._id);
    
    if (!user?.enterpriseId) {
      return res.status(404).json({ success: false, error: '您尚未加入任何企业' });
    }

    // 获取企业信息
    const enterprise = await Enterprise.findById(user.enterpriseId);
    if (!enterprise) {
      return res.status(404).json({ success: false, error: '企业不存在' });
    }

    // 获取用户在企业中的角色信息
    const enterpriseMember = await EnterpriseMember.findOne({
      userId: user._id,
      enterpriseId: enterprise._id
    });

    if (!enterpriseMember) {
      return res.status(404).json({ success: false, error: '您不是该企业的成员' });
    }

    return res.json({
      success: true,
      enterprise: {
        _id: enterprise._id,
        name: enterprise.name,
        emailSuffix: enterprise.emailSuffix,
        creditCode: enterprise.creditCode,
        avatar: enterprise.avatar,
        description: enterprise.description,
        address: enterprise.address,
        phone: enterprise.phone,
        website: enterprise.website,
        industry: enterprise.industry,
        size: enterprise.size,
        status: enterprise.status,
        maxMembers: enterprise.maxMembers,
        currentMembers: enterprise.currentMembers
      },
      userRole: {
        isSuperAdmin: enterpriseMember.role === 'superAdmin',
        isAdmin: enterpriseMember.role === 'admin',
        isMember: enterpriseMember.role === 'member',
        role: enterpriseMember.role,
        permissions: enterpriseMember.permissions,
        departmentId: enterpriseMember.departmentId,
        position: enterpriseMember.position,
        joinDate: enterpriseMember.joinDate
      },
      currentUser: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error('获取企业信息失败:', error);
    return res.status(500).json({ success: false, error: '获取企业信息失败' });
  }
});

// 获取企业成员列表
router.get('/members', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user?._id);
    
    if (!user?.enterpriseId) {
      return res.status(404).json({ success: false, error: '您尚未加入任何企业' });
    }

    const { page = 1, limit = 20, search = '', department = '' } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    // 获取企业信息
    const enterprise = await Enterprise.findById(user.enterpriseId);
    if (!enterprise) {
      return res.status(404).json({ success: false, error: '企业不存在' });
    }

    // 构建查询条件
    const query: any = { enterpriseId: user.enterpriseId };
    
    if (department) {
      query.departmentId = department;
    }

    // 获取企业成员总数
    const total = await EnterpriseMember.countDocuments(query);
    
    // 获取企业成员列表
    const enterpriseMembers = await EnterpriseMember.find(query)
      .populate('userId', 'name email avatar lastLogin createdAt')
      .sort({ joinDate: -1 })
      .skip(skip)
      .limit(Number(limit));

    // 格式化返回数据 - 将用户信息和企业角色信息合并
    const members = enterpriseMembers.map((member: any) => {
      const memberData = {
        _id: member.userId._id, // 用户ID（用于显示和编辑）
        enterpriseMemberId: member._id, // EnterpriseMember的ID（用于转让等操作）
        name: member.userId.name,
        email: member.userId.email,
        avatar: member.userId.avatar,
        lastLogin: member.userId.lastLogin,
        createdAt: member.userId.createdAt,
        // 企业相关字段
        role: member.role,
        permissions: member.permissions,
        departmentId: member.departmentId ? member.departmentId.toString() : null, // 确保是字符串格式
        position: member.position,
        joinDate: member.joinDate,
        status: member.status,
        // 企业名称（从企业信息获取）
        enterpriseName: enterprise.name
      };
      
      return memberData;
    });

    return res.json({
      success: true,
      data: {
        members,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    console.error('获取企业成员失败:', error);
    return res.status(500).json({ success: false, error: '获取企业成员失败' });
  }
});

// 获取企业部门列表
router.get('/departments', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user?._id);
    
    if (!user?.enterpriseId) {
      return res.status(404).json({ success: false, error: '您尚未加入任何企业' });
    }

    const departments = await Department.find({ enterprise: user.enterpriseId })
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      data: departments
    });
  } catch (error) {
    console.error('获取企业部门失败:', error);
    return res.status(500).json({ success: false, error: '获取企业部门失败' });
  }
});

// 创建部门（需要企业管理员权限）
router.post('/departments', authMiddleware, [
  body('name').trim().isLength({ min: 1, max: 100 }).withMessage('部门名称不能为空且不能超过100个字符'),
  body('code').trim().isLength({ min: 1, max: 20 }).withMessage('部门代码不能为空且不能超过20个字符'),
  body('description').optional().trim().isLength({ max: 500 }).withMessage('部门描述不能超过500个字符'),
  body('parentId').optional().isMongoId().withMessage('父部门ID格式无效')
], async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        error: '输入验证失败',
        details: errors.array() 
      });
    }

    const user = await User.findById(req.user?._id);
    if (!user?.enterpriseId) {
      return res.status(404).json({ success: false, error: '您尚未加入任何企业' });
    }

    // 检查用户权限
    const enterpriseMember = await EnterpriseMember.findOne({
      userId: user._id,
      enterpriseId: user.enterpriseId
    });

    if (!enterpriseMember || !enterpriseMember.permissions.includes('manage_departments')) {
      return res.status(403).json({ success: false, error: '权限不足' });
    }

    const { name, code, description, parentId } = req.body;

    // 检查部门代码是否已存在
    const existingDept = await Department.findOne({ 
      enterprise: user.enterpriseId,
      code 
    });
    if (existingDept) {
      return res.status(400).json({ success: false, error: '部门代码已存在' });
    }

    // 如果有父部门，验证父部门是否存在且属于同一企业
    if (parentId) {
      const parentDept = await Department.findById(parentId);
      if (!parentDept || parentDept.enterprise.toString() !== user.enterpriseId.toString()) {
        return res.status(400).json({ success: false, error: '父部门不存在或不属于同一企业' });
      }
    }

    const department = new Department({
      name,
      code,
      description,
      enterprise: user.enterpriseId,
      parentId: parentId || null
    });

    await department.save();

    return res.status(201).json({
      success: true,
      message: '部门创建成功',
      data: department
    });
  } catch (error) {
    console.error('创建部门失败:', error);
    return res.status(500).json({ success: false, error: '创建部门失败' });
  }
});

// 更新部门（需要企业管理员权限）
router.put('/departments/:departmentId', authMiddleware, [
  body('name').optional().trim().isLength({ min: 1, max: 100 }).withMessage('部门名称不能为空且不能超过100个字符'),
  body('code').optional().trim().isLength({ min: 1, max: 20 }).withMessage('部门代码不能为空且不能超过20个字符'),
  body('description').optional().trim().isLength({ max: 500 }).withMessage('部门描述不能超过500个字符')
], async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        error: '输入验证失败',
        details: errors.array() 
      });
    }

    const user = await User.findById(req.user?._id);
    if (!user?.enterpriseId) {
      return res.status(404).json({ success: false, error: '您尚未加入任何企业' });
    }

    // 检查用户权限
    const enterpriseMember = await EnterpriseMember.findOne({
      userId: user._id,
      enterpriseId: user.enterpriseId
    });

    if (!enterpriseMember || !enterpriseMember.permissions.includes('manage_departments')) {
      return res.status(403).json({ success: false, error: '权限不足' });
    }

    const { name, code, description } = req.body;
    const { departmentId } = req.params;

    // 检查部门是否存在且属于同一企业
    const department = await Department.findOne({
      _id: departmentId,
      enterprise: user.enterpriseId
    });

    if (!department) {
      return res.status(404).json({ success: false, error: '部门不存在' });
    }

    // 如果更新代码，检查是否与其他部门冲突
    if (code && code !== department.code) {
      const existingDept = await Department.findOne({ 
        enterprise: user.enterpriseId,
        code,
        _id: { $ne: departmentId }
      });
      if (existingDept) {
        return res.status(400).json({ success: false, error: '部门代码已存在' });
      }
    }

    // 更新部门
    const updatedDepartment = await Department.findByIdAndUpdate(
      departmentId,
      { name, code, description },
      { new: true, runValidators: true }
    );

    return res.json({
      success: true,
      message: '部门更新成功',
      data: updatedDepartment
    });
  } catch (error) {
    console.error('更新部门失败:', error);
    return res.status(500).json({ success: false, error: '更新部门失败' });
  }
});

// 删除部门（需要企业管理员权限）
router.delete('/departments/:departmentId', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user?._id);
    if (!user?.enterpriseId) {
      return res.status(404).json({ success: false, error: '您尚未加入任何企业' });
    }

    // 检查用户权限
    const enterpriseMember = await EnterpriseMember.findOne({
      userId: user._id,
      enterpriseId: user.enterpriseId
    });

    if (!enterpriseMember || !enterpriseMember.permissions.includes('manage_departments')) {
      return res.status(403).json({ success: false, error: '权限不足' });
    }

    const { departmentId } = req.params;

    // 检查部门是否存在且属于同一企业
    const department = await Department.findOne({
      _id: departmentId,
      enterprise: user.enterpriseId
    });

    if (!department) {
      return res.status(404).json({ success: false, error: '部门不存在' });
    }

    // 检查是否有子部门
    const hasChildren = await Department.exists({ parentId: departmentId });
    if (hasChildren) {
      return res.status(400).json({ success: false, error: '该部门下还有子部门，无法删除' });
    }

    // 检查是否有成员属于该部门
    const hasMembers = await EnterpriseMember.exists({ 
      enterpriseId: user.enterpriseId,
      departmentId 
    });
    if (hasMembers) {
      return res.status(400).json({ success: false, error: '该部门下还有成员，无法删除' });
    }

    await Department.findByIdAndDelete(departmentId);

    return res.json({
      success: true,
      message: '部门删除成功'
    });
  } catch (error) {
    console.error('删除部门失败:', error);
    return res.status(500).json({ success: false, error: '删除部门失败' });
  }
});

// 发送企业消息
router.post('/messages', authMiddleware, [
  body('content').trim().isLength({ min: 1, max: 2000 }).withMessage('消息内容不能为空且不能超过2000个字符'),
  body('type').isIn(['general', 'announcement', 'department', 'mention', 'group', 'reply']).withMessage('消息类型无效'),
  body('recipients').optional().isArray().withMessage('接收者必须是数组'),
  body('recipients.*').optional().isMongoId().withMessage('接收者ID格式无效'),
  body('departmentId').optional().isMongoId().withMessage('部门ID格式无效'),
  body('mentionedUsers').optional().isArray().withMessage('提及用户必须是数组'),
  body('mentionedUsers.*').optional().isMongoId().withMessage('提及用户ID格式无效'),
  body('mentionedDepartments').optional().isArray().withMessage('提及部门必须是数组'),
  body('mentionedDepartments.*').optional().isMongoId().withMessage('提及部门ID格式无效'),
  body('replyTo').optional().isMongoId().withMessage('回复消息ID格式无效')
], async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        error: '输入验证失败',
        details: errors.array() 
      });
    }

    const user = await User.findById(req.user?._id);
    if (!user?.enterpriseId) {
      return res.status(404).json({ success: false, error: '您尚未加入任何企业' });
    }

    // 检查用户在企业中的权限
    const userMember = await EnterpriseMember.findOne({
      userId: user._id,
      enterpriseId: user.enterpriseId
    });

    if (!userMember) {
      return res.status(403).json({ success: false, error: '您不是该企业的成员' });
    }

    const { 
      content, 
      type, 
      recipients = [], 
      departmentId, 
      mentionedUsers = [], 
      mentionedDepartments = [],
      replyTo
    } = req.body;

    // 验证消息类型和接收者的组合
    let finalRecipients: mongoose.Types.ObjectId[] = [];
    let messageType = type;

    try {
      if (type === 'department' && departmentId) {
        // 部门消息：验证权限和部门
        if (!userMember.permissions.includes('send_messages')) {
          return res.status(403).json({ success: false, error: '您没有发送消息的权限' });
        }

        const department = await Department.findOne({
          _id: departmentId,
          enterprise: user.enterpriseId
        });

        if (!department) {
          return res.status(400).json({ success: false, error: '指定的部门不存在' });
        }

        // 检查用户是否属于该部门或有管理权限
        const isInDepartment = userMember.departmentId?.toString() === departmentId;
        const hasManagePermission = userMember.permissions.includes('manage_departments');
        
        if (!isInDepartment && !hasManagePermission && userMember.role !== 'superAdmin') {
          return res.status(403).json({ success: false, error: '您只能向自己所属部门发送消息' });
        }

        const departmentMembers = await EnterpriseMember.find({
          enterpriseId: user.enterpriseId,
          departmentId: departmentId
        });
        finalRecipients = departmentMembers.map(member => new mongoose.Types.ObjectId(member.userId.toString()));
        messageType = 'department';
      } else if (type === 'announcement') {
        // 公告消息：只有管理员和超级管理员可以发送
        if (!['admin', 'superAdmin'].includes(userMember.role)) {
          return res.status(403).json({ success: false, error: '只有管理员可以发送公告' });
        }
        
        const allMembers = await EnterpriseMember.find({
          enterpriseId: user.enterpriseId
        });
        finalRecipients = allMembers.map(member => new mongoose.Types.ObjectId(member.userId.toString()));
        messageType = 'announcement';
      } else if (type === 'reply' && replyTo) {
        // 回复消息：验证原消息
        // 移除权限检查，让所有用户都能回复消息

        const originalMessage = await EnterpriseMessage.findById(replyTo);
        if (!originalMessage) {
          return res.status(400).json({ 
            success: false, 
            error: '回复的消息不存在' 
          });
        }

        // 验证原消息是否属于同一企业
        if (originalMessage.enterprise.toString() !== user.enterpriseId.toString()) {
          return res.status(403).json({ success: false, error: '无权回复此消息' });
        }
        
        // 回复消息的接收者包括原消息的发送者和所有接收者
        const replyRecipients = new Set([
          originalMessage.sender.toString(),
          ...originalMessage.recipients.map(r => r.toString())
        ]);
        finalRecipients = Array.from(replyRecipients).map(recipientId => new mongoose.Types.ObjectId(recipientId));
        messageType = 'reply';
      } else if (type === 'general') {
        // 普通消息：必须有接收者
        // 移除权限检查，让所有用户都能发送消息
        if (recipients.length === 0) {
          return res.status(400).json({ success: false, error: '请选择消息接收者' });
        }

        // 移除部门限制，让所有用户都能互相发送消息
        // 确保接收者是ObjectId类型
        finalRecipients = recipients.map((recipientId: string) => new mongoose.Types.ObjectId(recipientId));
        messageType = 'general';
      } else {
        return res.status(400).json({ success: false, error: '无效的消息类型或缺少必要参数' });
      }

      // 验证接收者是否都是有效的用户ID
      if (finalRecipients.length > 0) {
        const validUsers = await User.find({
          _id: { $in: finalRecipients },
          enterpriseId: user.enterpriseId
        });
        
        if (validUsers.length !== finalRecipients.length) {
          return res.status(400).json({ 
            success: false, 
            error: '部分接收者不存在或不属于同一企业' 
          });
        }
      }

      // 验证@提及的用户和部门
      if (mentionedUsers.length > 0) {
        const validMentionedUsers = await User.find({
          _id: { $in: mentionedUsers },
          enterpriseId: user.enterpriseId
        });
        
        if (validMentionedUsers.length !== mentionedUsers.length) {
          return res.status(400).json({ 
            success: false, 
            error: '部分提及的用户不存在或不属于同一企业' 
          });
        }
      }

      if (mentionedDepartments.length > 0) {
        const validMentionedDepts = await Department.find({
          _id: { $in: mentionedDepartments },
          enterprise: user.enterpriseId
        });
        
        if (validMentionedDepts.length !== mentionedDepartments.length) {
          return res.status(400).json({ 
            success: false, 
            error: '部分提及的部门不存在或不属于同一企业' 
          });
        }
      }
    } catch (error) {
      console.error('❌ 处理接收者时出错:', error);
      return res.status(500).json({ 
        success: false, 
        error: '处理接收者信息时出错' 
      });
    }

    // 处理回复链
    let replyChain: string[] = [];
    if (type === 'reply' && replyTo) {
      const originalMessage = await EnterpriseMessage.findById(replyTo);
      if (originalMessage) {
        // 构建回复链：原消息的回复链 + 原消息ID
        replyChain = [
          ...(originalMessage.replyChain || []),
          (originalMessage as any)._id.toString()
        ];
      }
    }

    // 创建企业消息
    const message = new EnterpriseMessage({
      sender: user._id,
      enterprise: user.enterpriseId,
      content,
      type: messageType,
      recipients: finalRecipients,
      departmentId: type === 'department' ? departmentId : undefined,
      mentionedUsers,
      mentionedDepartments,
      replyTo: type === 'reply' ? replyTo : undefined,
      replyChain: replyChain.length > 0 ? replyChain : undefined,
      isPinned: type === 'announcement', // 公告自动置顶
      isRead: [] // 初始状态：没有人已读
    });

    await message.save();

    return res.status(201).json({
      success: true,
      message: '消息发送成功',
      data: message
    });
  } catch (error) {
    console.error('发送企业消息失败:', error);
    return res.status(500).json({ success: false, error: '发送企业消息失败' });
  }
});

// 获取企业消息列表
router.get('/messages', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user?._id);
    if (!user?.enterpriseId) {
      return res.status(404).json({ success: false, error: '您尚未加入任何企业' });
    }

    const { page = 1, limit = 20, type = '' } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    // 构建查询条件 - 只获取主消息（非回复消息）
    const query: any = { 
      enterprise: user.enterpriseId,
      type: { $ne: 'reply' } // 排除回复消息，只获取主消息
    };
    if (type && type !== 'all') {
      query.type = type;
    }

    // 获取主消息总数
    const total = await EnterpriseMessage.countDocuments(query);
    
    // 获取主消息列表
    const mainMessages = await EnterpriseMessage.find(query)
      .populate('sender', 'name avatar')
      .populate('recipients', 'name avatar')
      .populate('isRead', 'name avatar') // 添加对isRead字段的populate
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    // 为每个主消息获取其回复
    const messagesWithReplies = await Promise.all(
      mainMessages.map(async (mainMessage) => {
        const replies = await EnterpriseMessage.find({
          replyTo: mainMessage._id
        })
        .populate('sender', 'name avatar')
        .populate('recipients', 'name avatar')
        .populate('isRead', 'name avatar') // 添加对isRead字段的populate
        .sort({ createdAt: 1 }); // 回复按时间正序排列

        return {
          ...mainMessage.toObject(),
          replies
        };
      })
    );

    return res.json({
      success: true,
      data: {
        messages: messagesWithReplies,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    console.error('获取企业消息失败:', error);
    return res.status(500).json({ success: false, error: '获取企业消息失败' });
  }
});

// 删除企业消息
router.delete('/messages/:messageId', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user?._id);
    if (!user?.enterpriseId) {
      return res.status(404).json({ success: false, error: '您尚未加入任何企业' });
    }

    // 检查用户在企业中的权限
    const userMember = await EnterpriseMember.findOne({
      userId: user._id,
      enterpriseId: user.enterpriseId
    });

    if (!userMember) {
      return res.status(403).json({ success: false, error: '您不是该企业的成员' });
    }

    const { messageId } = req.params;

    // 查找消息
    const message = await EnterpriseMessage.findById(messageId);
    if (!message) {
      return res.status(404).json({ success: false, error: '消息不存在' });
    }

    // 检查消息是否属于当前企业
    if (message.enterprise.toString() !== user.enterpriseId.toString()) {
      return res.status(403).json({ success: false, error: '无权删除此消息' });
    }

    // 检查删除权限：只有发送者可以删除
    const isSender = message.sender.toString() === (user._id as any).toString();

    if (!isSender) {
      return res.status(403).json({ success: false, error: '您只能删除自己发送的消息' });
    }

    // 如果是主消息，同时删除所有回复
    if (message.type !== 'reply') {
      await EnterpriseMessage.deleteMany({ replyTo: messageId });
    }

    // 删除消息本身
    await EnterpriseMessage.findByIdAndDelete(messageId);

    return res.json({
      success: true,
      message: '消息删除成功'
    });
  } catch (error) {
    console.error('删除企业消息失败:', error);
    return res.status(500).json({ success: false, error: '删除企业消息失败' });
  }
});

// 标记消息为已读
router.put('/messages/:messageId/read', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user?._id);
    if (!user?.enterpriseId) {
      return res.status(404).json({ success: false, error: '您尚未加入任何企业' });
    }

    const { messageId } = req.params;

    // 查找消息
    const message = await EnterpriseMessage.findById(messageId);
    if (!message) {
      return res.status(404).json({ success: false, error: '消息不存在' });
    }

    // 检查消息是否属于当前企业
    if (message.enterprise.toString() !== user.enterpriseId.toString()) {
      return res.status(403).json({ success: false, error: '无权访问此消息' });
    }

    // 检查用户是否是消息的接收者
    const isRecipient = message.recipients.some(recipient => 
      recipient.toString() === user._id?.toString()
    );

    // 只有接收者可以标记消息为已读，发送者不能标记
    if (!isRecipient) {
      return res.status(403).json({ success: false, error: '只有消息接收者可以标记为已读' });
    }

    // 标记为已读
    const userId = user._id;
    if (userId && !message.isRead.includes(userId as mongoose.Types.ObjectId)) {
      message.isRead.push(userId as mongoose.Types.ObjectId);
      await message.save();
    }

    return res.json({
      success: true,
      message: '消息已标记为已读'
    });
  } catch (error) {
    console.error('标记消息已读失败:', error);
    return res.status(500).json({ success: false, error: '标记消息已读失败' });
  }
});

// 获取未读消息数量
router.get('/messages/unread-count', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user?._id);
    if (!user?.enterpriseId) {
      return res.status(404).json({ success: false, error: '您尚未加入任何企业' });
    }

    const userIdStr = user._id;

    // 统计未读消息数量
    const unreadCount = await EnterpriseMessage.countDocuments({
      enterprise: user.enterpriseId,
      recipients: { $in: [user._id] },
      isRead: { $nin: [user._id] }
    });

    return res.json({
      success: true,
      data: { unreadCount }
    });
  } catch (error) {
    console.error('获取未读消息数量失败:', error);
    return res.status(500).json({ success: false, error: '获取未读消息数量失败' });
  }
});

// 更新成员职位（需要企业管理员权限）
router.put('/members/:memberId/position', authMiddleware, [
  body('role').isIn(['member', 'admin']).withMessage('角色必须是 member 或 admin'),
  body('position').optional().trim().isLength({ max: 100 }).withMessage('职位描述不能超过100个字符'),
  body('departmentId').optional().custom((value) => {
    if (value === '' || value === null || value === undefined) return true;
    if (typeof value === 'string' && /^[0-9a-fA-F]{24}$/.test(value)) return true;
    throw new Error('部门ID格式无效');
  }).withMessage('部门ID格式无效'),
  body('permissions').optional().isArray().withMessage('权限必须是数组'),
  body('permissions.*').optional().isIn([
    'manage_departments',
    'manage_members', 
    'send_messages',
    'view_statistics'
  ]).withMessage('权限值无效')
], async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        error: '输入验证失败',
        details: errors.array() 
      });
    }

    const user = await User.findById(req.user?._id);
    if (!user?.enterpriseId) {
      return res.status(404).json({ success: false, error: '您尚未加入任何企业' });
    }

    // 检查当前用户权限
    const currentUserMember = await EnterpriseMember.findOne({
      userId: user._id,
      enterpriseId: user.enterpriseId
    });

    if (!currentUserMember || !['admin', 'superAdmin'].includes(currentUserMember.role)) {
      return res.status(403).json({ success: false, error: '权限不足，只有企业管理员可以调配员工职位' });
    }

    const { memberId } = req.params;
    const { role, position, departmentId, permissions } = req.body;

    // 检查要更新的成员是否存在且属于同一企业
    const targetMember = await EnterpriseMember.findOne({
      _id: memberId,
      enterpriseId: user.enterpriseId
    });

    if (!targetMember) {
      return res.status(404).json({ success: false, error: '成员不存在' });
    }

    // 权限限制：管理员只能设置普通成员，不能设置其他管理员
    if (currentUserMember.role === 'admin' && role === 'admin') {
      return res.status(403).json({ success: false, error: '管理员无法设置其他管理员，只有超级管理员可以设置管理员' });
    }

    // 权限限制：不能修改自己的职位
    if (targetMember.userId.toString() === user._id?.toString()) {
      return res.status(403).json({ success: false, error: '不能修改自己的职位' });
    }

    // 如果指定了部门，验证部门是否存在且属于同一企业
    if (departmentId && departmentId !== '') {
      const department = await Department.findOne({
        _id: departmentId,
        enterprise: user.enterpriseId
      });
      if (!department) {
        return res.status(400).json({ success: false, error: '指定的部门不存在' });
      }
    }

    // 更新成员信息
    const updateData: any = { role };
    if (position !== undefined) updateData.position = position;
    if (departmentId !== undefined) {
      updateData.departmentId = departmentId === '' ? null : departmentId;
    }
    if (permissions !== undefined) updateData.permissions = permissions;

    const updatedMember = await EnterpriseMember.findByIdAndUpdate(
      memberId,
      updateData,
      { new: true, runValidators: true }
    ).populate('userId', 'name email avatar');

    return res.json({
      success: true,
      message: '成员职位更新成功',
      data: updatedMember
    });
  } catch (error) {
    console.error('更新成员职位失败:', error);
    return res.status(500).json({ success: false, error: '更新成员职位失败' });
  }
});

// 超级管理员身份转让（只有超级管理员可以调用）
router.put('/transfer-super-admin', authMiddleware, [
  body('newSuperAdminId').isMongoId().withMessage('新超级管理员ID格式无效')
], async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        error: '输入验证失败',
        details: errors.array() 
      });
    }

    const user = await User.findById(req.user?._id);
    if (!user?.enterpriseId) {
      return res.status(404).json({ success: false, error: '您尚未加入任何企业' });
    }

    // 检查当前用户是否为超级管理员
    const currentUserMember = await EnterpriseMember.findOne({
      userId: user._id,
      enterpriseId: user.enterpriseId
    });

    if (!currentUserMember || currentUserMember.role !== 'superAdmin') {
      return res.status(403).json({ success: false, error: '只有企业超级管理员可以转让身份' });
    }

    const { newSuperAdminId } = req.body;
    
    // 检查新超级管理员是否存在且属于同一企业
    const newSuperAdminMember = await EnterpriseMember.findOne({
      _id: newSuperAdminId,
      enterpriseId: user.enterpriseId
    });

    if (!newSuperAdminMember) {
      // 尝试查找所有企业成员，看看是否有数据
      const allMembers = await EnterpriseMember.find({ enterpriseId: user.enterpriseId });
      
      return res.status(404).json({ success: false, error: '新超级管理员不存在' });
    }

    // 不能转让给自己
    if (newSuperAdminMember.userId.toString() === user._id?.toString()) {
      return res.status(400).json({ success: false, error: '不能转让给自己' });
    }

    // 开始事务：转让超级管理员身份
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // 将当前用户降级为普通成员
      await EnterpriseMember.findByIdAndUpdate(
        currentUserMember._id,
        { 
          role: 'member',
          permissions: ['send_messages', 'view_statistics']
        },
        { session }
      );

      // 将新用户提升为超级管理员
      await EnterpriseMember.findByIdAndUpdate(
        newSuperAdminMember._id,
        { 
          role: 'superAdmin',
          permissions: [
            'manage_departments',
            'manage_members', 
            'send_messages',
            'view_statistics',
            'manage_enterprise'
          ]
        },
        { session }
      );

      await session.commitTransaction();
      session.endSession();

      return res.json({
        success: true,
        message: '超级管理员身份转让成功',
        data: {
          oldSuperAdmin: currentUserMember.userId,
          newSuperAdmin: newSuperAdminMember.userId
        }
      });
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  } catch (error) {
    console.error('转让超级管理员身份失败:', error);
    return res.status(500).json({ success: false, error: '转让超级管理员身份失败' });
  }
});

// 获取成员详情（包含职位信息）
router.get('/members/:memberId', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user?._id);
    if (!user?.enterpriseId) {
      return res.status(404).json({ success: false, error: '您尚未加入任何企业' });
    }

    const { memberId } = req.params;

    // 获取成员详细信息
    const member = await EnterpriseMember.findOne({
      _id: memberId,
      enterpriseId: user.enterpriseId
    }).populate('userId', 'name email avatar lastLogin createdAt')
      .populate('departmentId', 'name code');

    if (!member) {
      return res.status(404).json({ success: false, error: '成员不存在' });
    }

    return res.json({
      success: true,
      data: member
    });
  } catch (error) {
    console.error('获取成员详情失败:', error);
    return res.status(500).json({ success: false, error: '获取成员详情失败' });
  }
});

export default router;
