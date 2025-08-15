import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { User } from '../models/User';
import { AuthRequest, authMiddleware } from '../middleware/auth';

const router = express.Router();

// 企业成员数量现在是动态计算的，不再需要手动更新

// 搜索用户（所有登录用户可访问）
router.get('/search', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { q, limit = '10' } = req.query;
    
    if (!q || typeof q !== 'string' || q.trim().length < 2) {
      return res.json({
        success: true,
        users: []
      });
    }

    const searchQuery = q.trim();
    const limitNum = Math.min(parseInt(limit as string) || 10, 50); // 最多50个结果

    // 搜索条件：用户名或邮箱包含搜索词，且邮箱已验证
    const users = await User.find({
      $and: [
        {
          $or: [
            { name: { $regex: searchQuery, $options: 'i' } },
            { email: { $regex: searchQuery, $options: 'i' } }
          ]
        },
        { isEmailVerified: true },
        { isActive: true }
      ]
    }, 'name email enterpriseName avatar')
      .limit(limitNum)
      .sort({ name: 1 });

    // 格式化用户数据
    const formattedUsers = users.map(user => ({
      _id: user._id,
      name: user.name,
      email: user.email,
      enterpriseName: user.enterpriseName,
      avatar: user.avatar
    }));

    return res.json({
      success: true,
      users: formattedUsers
    });
  } catch (error) {
    console.error('搜索用户失败:', error);
    return res.status(500).json({ success: false, error: '搜索用户失败' });
  }
});

// 获取所有用户（仅管理员可访问）
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    // 检查权限
    if (req.user?.role !== 'admin' && req.user?.role !== 'superadmin') {
      return res.status(403).json({ success: false, error: '权限不足' });
    }

    const users = await User.find({}, '-password -emailVerificationToken -emailVerificationExpires')
      .sort({ createdAt: -1 });

    // 转换数据格式
    const formattedUsers = users.map(user => ({
      _id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      enterpriseName: user.enterpriseName,
      isEmailVerified: user.isEmailVerified,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
      status: user.isActive ? 'active' : 'inactive'
    }));

    return res.json({
      success: true,
      users: formattedUsers
    });
  } catch (error) {
    console.error('获取用户列表失败:', error);
    return res.status(500).json({ success: false, error: '获取用户列表失败' });
  }
});

// 获取单个用户详情
router.get('/:userId', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    // 检查权限
    if (req.user?.role !== 'admin' && req.user?.role !== 'superadmin') {
      return res.status(403).json({ success: false, error: '权限不足' });
    }

    const user = await User.findById(req.params.userId, '-password -emailVerificationToken -emailVerificationExpires');
    
    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }

    return res.json({
      success: true,
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        enterpriseName: user.enterpriseName,
        isEmailVerified: user.isEmailVerified,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
        status: user.isActive ? 'active' : 'inactive'
      }
    });
  } catch (error) {
    console.error('获取用户详情失败:', error);
    return res.status(500).json({ success: false, error: '获取用户详情失败' });
  }
});

// 更新用户信息
router.put('/:userId', authMiddleware, [
  body('name').optional().trim().isLength({ min: 1, max: 50 }).withMessage('姓名不能为空且不能超过50个字符'),
  body('role').optional().isIn(['admin', 'teacher', 'student']).withMessage('无效的角色'),
  body('department').optional().trim(),
  body('isActive').optional().isBoolean().withMessage('状态必须是布尔值')
], async (req: AuthRequest, res: Response) => {
  try {
    // 检查权限
    if (req.user?.role !== 'admin' && req.user?.role !== 'superadmin') {
      return res.status(403).json({ error: '权限不足' });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        error: '输入验证失败',
        details: errors.array() 
      });
    }

    const { name, role, enterpriseName, isActive } = req.body;
    const updateData: any = {};

    if (name !== undefined) updateData.name = name;
    if (role !== undefined) updateData.role = role;
    if (enterpriseName !== undefined) updateData.enterpriseName = enterpriseName;
    if (isActive !== undefined) updateData.isActive = isActive;

    const user = await User.findByIdAndUpdate(
      req.params.userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password -emailVerificationToken -emailVerificationExpires');

    if (!user) {
      return res.status(404).json({ success: false, error: '用户不存在' });
    }

    return res.json({
      success: true,
      message: '用户信息更新成功',
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        enterpriseName: user.enterpriseName,
        isEmailVerified: user.isEmailVerified,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
        status: user.isActive ? 'active' : 'inactive'
      }
    });
  } catch (error) {
    console.error('更新用户信息失败:', error);
    return res.status(500).json({ success: false, error: '更新用户信息失败' });
  }
});

// 删除用户
router.delete('/:userId', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    // 检查权限
    if (req.user?.role !== 'admin' && req.user?.role !== 'superadmin') {
      return res.status(403).json({ success: false, error: '权限不足' });
    }

    // 防止删除自己
    if (req.params.userId === req.user?._id.toString()) {
      return res.status(400).json({ success: false, error: '不能删除自己的账号' });
    }

    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ success: false, error: '用户不存在' });
    }

    // 防止删除超级管理员
    if (user.role === 'superadmin') {
      return res.status(400).json({ success: false, error: '不能删除超级管理员账号' });
    }

    // 不再需要手动更新企业成员数量，因为现在是动态计算的
    // 企业成员数量会通过邮箱尾缀实时统计

    // 删除企业成员记录
    if (user.enterpriseId) {
      try {
        const EnterpriseMember = require('../models/EnterpriseMember').default;
        await EnterpriseMember.findOneAndDelete({
          userId: user._id,
          enterpriseId: user.enterpriseId
        });
        console.log(`企业成员记录删除成功: ${user._id}`);
      } catch (memberError) {
        console.error('删除企业成员记录失败:', memberError);
        // 即使成员记录删除失败，也要继续删除用户
      }
    }

    // 删除用户
    await User.findByIdAndDelete(req.params.userId);

    return res.json({
      success: true,
      message: '用户删除成功',
      enterpriseUpdated: !!user.enterpriseId
    });
  } catch (error) {
    console.error('删除用户失败:', error);
    return res.status(500).json({ success: false, error: '删除用户失败' });
  }
});

// 企业用户搜索（支持关键词搜索）
router.get('/search/enterprise', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { keyword } = req.query;
    
    if (!keyword || typeof keyword !== 'string') {
      return res.status(400).json({ 
        success: false, 
        error: '请提供搜索关键词' 
      });
    }

    // 直接根据关键词搜索，不需要验证企业邮箱后缀
    const searchConditions = {
      _id: { $ne: req.user?._id }, // 排除当前用户
      $or: [
        { name: { $regex: keyword, $options: 'i' } }, // 姓名匹配
        { email: { $regex: keyword, $options: 'i' } }, // 邮箱匹配
        { enterpriseName: { $regex: keyword, $options: 'i' } }, // 企业名称匹配
        { company: { $regex: keyword, $options: 'i' } }, // 公司匹配
        { position: { $regex: keyword, $options: 'i' } } // 职位匹配
      ]
    };

    // 搜索用户
    const users = await User.find(searchConditions, 'name email enterpriseName company position')
      .limit(20);

    return res.json({
      success: true,
      data: users.map(user => ({
        _id: user._id,
        name: user.name,
        email: user.email,
        enterpriseName: user.enterpriseName,
        company: user.company,
        position: user.position
      }))
    });
  } catch (error) {
    console.error('企业用户搜索失败:', error);
    return res.status(500).json({ 
      success: false, 
      error: '企业用户搜索失败' 
    });
  }
});

// 批量操作
router.post('/batch', authMiddleware, [
  body('operation').isIn(['delete', 'update', 'activate', 'deactivate']).withMessage('无效的操作类型'),
  body('userIds').isArray().withMessage('用户ID列表必须是数组'),
  body('updates').optional().isObject().withMessage('更新数据必须是对象')
], async (req: AuthRequest, res: Response) => {
  try {
    // 检查权限
    if (req.user?.role !== 'admin' && req.user?.role !== 'superadmin') {
      return res.status(403).json({ success: false, error: '权限不足' });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        error: '输入验证失败',
        details: errors.array() 
      });
    }

    const { operation, userIds, updates } = req.body;

    switch (operation) {
      case 'delete':
        // 防止删除自己
        if (userIds.includes(req.user?._id.toString())) {
          return res.status(400).json({ success: false, error: '不能删除自己的账号' });
        }
        
        // 防止删除超级管理员
        const superadmins = await User.find({ _id: { $in: userIds }, role: 'superadmin' });
        if (superadmins.length > 0) {
          return res.status(400).json({ success: false, error: '不能删除超级管理员账号' });
        }

        // 获取要删除的用户信息，用于更新企业成员数量
        const usersToDelete = await User.find({ _id: { $in: userIds } });
        
        // 按企业分组，统计每个企业需要减少的成员数量
        const enterpriseMemberCounts = new Map<string, number>();
        usersToDelete.forEach(user => {
          if (user.enterpriseId) {
            const currentCount = enterpriseMemberCounts.get(user.enterpriseId.toString()) || 0;
            enterpriseMemberCounts.set(user.enterpriseId.toString(), currentCount + 1);
          }
        });

        // 不再需要手动更新企业成员数量，因为现在是动态计算的
        // 企业成员数量会通过邮箱尾缀实时统计

        // 删除企业成员记录
        try {
          const EnterpriseMember = require('../models/EnterpriseMember').default;
          await EnterpriseMember.deleteMany({ userId: { $in: userIds } });
          console.log(`批量删除企业成员记录成功: ${userIds.length} 条`);
        } catch (memberError) {
          console.error('批量删除企业成员记录失败:', memberError);
          // 即使成员记录删除失败，也要继续删除用户
        }

        // 删除用户
        await User.deleteMany({ _id: { $in: userIds } });
        break;

      case 'update':
        if (!updates) {
          return res.status(400).json({ error: '更新操作需要提供更新数据' });
        }
        await User.updateMany({ _id: { $in: userIds } }, updates);
        break;

      case 'activate':
        await User.updateMany({ _id: { $in: userIds } }, { isActive: true });
        break;

      case 'deactivate':
        await User.updateMany({ _id: { $in: userIds } }, { isActive: false });
        break;
    }

    return res.json({
      success: true,
      message: `批量${operation}操作成功`
    });
  } catch (error) {
    console.error('批量操作失败:', error);
    return res.status(500).json({ error: '批量操作失败' });
  }
});

export default router; 