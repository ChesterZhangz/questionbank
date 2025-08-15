import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { User } from '../models/User';
import { AuthRequest, authMiddleware } from '../middleware/auth';
import mongoose from 'mongoose';

const router = express.Router();

// 级联删除用户相关数据的函数
async function cascadeDeleteUser(userId: mongoose.Types.ObjectId, enterpriseId?: mongoose.Types.ObjectId) {
  console.log(`开始级联删除用户 ${userId} 的相关数据...`);
  
  try {
    // 1. 删除用户创建的题库
    const QuestionBank = require('../models/QuestionBank').default;
    const userQuestionBanks = await QuestionBank.find({ creator: userId });
    for (const bank of userQuestionBanks) {
      console.log(`删除用户创建的题库: ${bank.name} (${bank._id})`);
      
      // 删除题库中的所有题目
      const Question = require('../models/Question').default;
      await Question.deleteMany({ questionBank: bank._id });
      console.log(`删除题库 ${bank._id} 中的所有题目`);
      
      // 删除题库
      await QuestionBank.findByIdAndDelete(bank._id);
    }
    console.log(`删除了 ${userQuestionBanks.length} 个用户创建的题库`);

    // 2. 从其他题库中移除用户
    await QuestionBank.updateMany(
      { $or: [
        { managers: userId },
        { collaborators: userId },
        { viewers: userId }
      ]},
      { $pull: { 
        managers: userId,
        collaborators: userId,
        viewers: userId
      }}
    );
    console.log('从所有题库成员列表中移除用户');

    // 3. 删除用户创建的独立题目（不属于任何题库的题目）
    const Question = require('../models/Question').default;
    const deletedQuestions = await Question.deleteMany({ creator: userId });
    console.log(`删除了 ${deletedQuestions.deletedCount} 个用户创建的独立题目`);

    // 4. 删除用户创建的试卷
    const Paper = require('../models/Paper').default;
    const deletedPapers = await Paper.deleteMany({ owner: userId });
    console.log(`删除了 ${deletedPapers.deletedCount} 个用户创建的试卷`);

    // 5. 处理用户拥有的试题库
    const Library = require('../models/Library').default;
    const userLibraries = await Library.find({ owner: userId });
    for (const library of userLibraries) {
      console.log(`删除用户拥有的试题库: ${library.name} (${library._id})`);
      
      // 删除试题库的购买记录
      const LibraryPurchase = require('../models/LibraryPurchase').default;
      await LibraryPurchase.deleteMany({ libraryId: library._id });
      
      // 删除试题库
      await Library.findByIdAndDelete(library._id);
    }
    console.log(`删除了 ${userLibraries.length} 个用户拥有的试题库`);

    // 6. 从其他试题库中移除用户
    await Library.updateMany(
      { 'members.user': userId },
      { $pull: { members: { user: userId } } }
    );
    console.log('从所有试题库成员列表中移除用户');

    // 7. 删除用户的试题库购买记录
    const LibraryPurchase = require('../models/LibraryPurchase').default;
    const deletedPurchases = await LibraryPurchase.deleteMany({ userId: userId });
    console.log(`删除了 ${deletedPurchases.deletedCount} 个用户的购买记录`);

    // 8. 删除用户的登录历史
    const LoginHistory = require('../models/LoginHistory').default;
    const deletedHistory = await LoginHistory.deleteMany({ userId: userId });
    console.log(`删除了 ${deletedHistory.deletedCount} 条用户登录历史`);

    // 9. 删除用户的token黑名单记录
    const TokenBlacklist = require('../models/TokenBlacklist').default;
    const deletedTokens = await TokenBlacklist.deleteMany({ userId: userId });
    console.log(`删除了 ${deletedTokens.deletedCount} 条用户token黑名单记录`);

    // 10. 删除用户的游戏记录和统计
    try {
      const GameRecord = require('../models/Game').GameRecord;
      const UserGameStats = require('../models/Game').UserGameStats;
      const Leaderboard = require('../models/Game').Leaderboard;
      
      const deletedGameRecords = await GameRecord.deleteMany({ userId: userId });
      const deletedGameStats = await UserGameStats.deleteMany({ userId: userId });
      const deletedLeaderboard = await Leaderboard.deleteMany({ userId: userId });
      
      console.log(`删除了 ${deletedGameRecords.deletedCount} 条游戏记录`);
      console.log(`删除了 ${deletedGameStats.deletedCount} 条游戏统计`);
      console.log(`删除了 ${deletedLeaderboard.deletedCount} 条排行榜记录`);
    } catch (gameError) {
      console.error('删除游戏相关数据失败:', gameError);
    }

    // 11. 删除相关邀请记录
    try {
      const Invitation = require('../models/Invitation').default;
      const LibraryInvitation = require('../models/LibraryInvitation').default;
      
      const deletedInvitations = await Invitation.deleteMany({ 
        $or: [
          { inviterId: userId },
          { email: { $exists: true } } // 需要更精确的匹配，但这里简化处理
        ]
      });
      
      const deletedLibraryInvitations = await LibraryInvitation.deleteMany({ 
        inviterId: userId 
      });
      
      console.log(`删除了 ${deletedInvitations.deletedCount} 条邀请记录`);
      console.log(`删除了 ${deletedLibraryInvitations.deletedCount} 条试题库邀请记录`);
    } catch (invitationError) {
      console.error('删除邀请记录失败:', invitationError);
    }

    // 12. 删除企业成员记录
    if (enterpriseId) {
      try {
        const EnterpriseMember = require('../models/EnterpriseMember').default;
        await EnterpriseMember.findOneAndDelete({
          userId: userId,
          enterpriseId: enterpriseId
        });
        console.log(`删除企业成员记录成功: ${userId}`);
      } catch (memberError) {
        console.error('删除企业成员记录失败:', memberError);
      }
    }

    console.log(`用户 ${userId} 的所有相关数据级联删除完成`);
    
  } catch (error) {
    console.error('级联删除用户数据失败:', error);
    throw error; // 重新抛出错误，让调用方处理
  }
}

// 清理孤立数据的函数 - 删除所有引用不存在用户的数据
async function cleanupOrphanedData() {
  console.log('开始清理孤立数据...');
  const cleanupReport = {
    questionBanksProcessed: 0,
    questionBanksDeleted: 0,
    questionsDeleted: 0,
    papersDeleted: 0,
    librariesProcessed: 0,
    librariesDeleted: 0,
    libraryPurchasesDeleted: 0,
    loginHistoryDeleted: 0,
    tokenBlacklistDeleted: 0,
    gameRecordsDeleted: 0,
    gameStatsDeleted: 0,
    leaderboardDeleted: 0,
    invitationsDeleted: 0,
    libraryInvitationsDeleted: 0,
    enterpriseMembersDeleted: 0,
    membersRemovedFromQuestionBanks: 0,
    membersRemovedFromLibraries: 0
  };

  try {
    // 获取所有存在的用户ID
    const existingUsers = await User.find({}).select('_id');
    const existingUserIds = existingUsers.map(user => (user._id as mongoose.Types.ObjectId).toString());
    console.log(`当前系统中有 ${existingUserIds.length} 个用户`);

    // 1. 清理题库相关数据
    console.log('清理题库相关数据...');
    const QuestionBank = require('../models/QuestionBank').default;
    
    // 删除创建者不存在的题库
    const orphanedQuestionBanks = await QuestionBank.find({
      creator: { $nin: existingUsers.map(u => u._id) }
    });
    
    for (const bank of orphanedQuestionBanks) {
      console.log(`删除孤立题库: ${bank.name} (创建者已不存在)`);
      
      // 删除题库中的所有题目
      const Question = require('../models/Question').default;
      const deletedQuestions = await Question.deleteMany({ questionBank: bank._id });
      cleanupReport.questionsDeleted += deletedQuestions.deletedCount || 0;
      
      await QuestionBank.findByIdAndDelete(bank._id);
      cleanupReport.questionBanksDeleted++;
    }
    
    // 从现有题库中移除不存在的用户
    const questionBanksToUpdate = await QuestionBank.find({
      $or: [
        { managers: { $nin: existingUsers.map(u => u._id) } },
        { collaborators: { $nin: existingUsers.map(u => u._id) } },
        { viewers: { $nin: existingUsers.map(u => u._id) } }
      ]
    });
    
    for (const bank of questionBanksToUpdate) {
      const originalManagersCount = bank.managers ? bank.managers.length : 0;
      const originalCollaboratorsCount = bank.collaborators ? bank.collaborators.length : 0;
      const originalViewersCount = bank.viewers ? bank.viewers.length : 0;
      
      // 过滤掉不存在的用户
      bank.managers = bank.managers ? bank.managers.filter((id: any) => 
        existingUserIds.includes(id.toString())
      ) : [];
      bank.collaborators = bank.collaborators ? bank.collaborators.filter((id: any) => 
        existingUserIds.includes(id.toString())
      ) : [];
      bank.viewers = bank.viewers ? bank.viewers.filter((id: any) => 
        existingUserIds.includes(id.toString())
      ) : [];
      
      const removedCount = (originalManagersCount + originalCollaboratorsCount + originalViewersCount) - 
                          (bank.managers.length + bank.collaborators.length + bank.viewers.length);
      
      if (removedCount > 0) {
        await bank.save();
        cleanupReport.membersRemovedFromQuestionBanks += removedCount;
        console.log(`从题库 ${bank.name} 中移除了 ${removedCount} 个不存在的用户`);
      }
      cleanupReport.questionBanksProcessed++;
    }

    // 2. 删除创建者不存在的独立题目
    console.log('清理独立题目...');
    const Question = require('../models/Question').default;
    const orphanedQuestions = await Question.deleteMany({
      creator: { $nin: existingUsers.map(u => u._id) }
    });
    cleanupReport.questionsDeleted += orphanedQuestions.deletedCount || 0;

    // 3. 删除拥有者不存在的试卷
    console.log('清理试卷...');
    const Paper = require('../models/Paper').default;
    const orphanedPapers = await Paper.deleteMany({
      owner: { $nin: existingUsers.map(u => u._id) }
    });
    cleanupReport.papersDeleted = orphanedPapers.deletedCount || 0;

    // 4. 清理试题库相关数据
    console.log('清理试题库相关数据...');
    const Library = require('../models/Library').default;
    
    // 删除拥有者不存在的试题库
    const orphanedLibraries = await Library.find({
      owner: { $nin: existingUsers.map(u => u._id) }
    });
    
    for (const library of orphanedLibraries) {
      console.log(`删除孤立试题库: ${library.name} (拥有者已不存在)`);
      
      // 删除相关购买记录
      const LibraryPurchase = require('../models/LibraryPurchase').default;
      await LibraryPurchase.deleteMany({ libraryId: library._id });
      
      await Library.findByIdAndDelete(library._id);
      cleanupReport.librariesDeleted++;
    }
    
    // 从现有试题库中移除不存在的用户
    const librariesToUpdate = await Library.find({
      'members.user': { $nin: existingUsers.map(u => u._id) }
    });
    
    for (const library of librariesToUpdate) {
      const originalMembersCount = library.members ? library.members.length : 0;
      
      library.members = library.members ? library.members.filter((member: any) => 
        existingUserIds.includes(member.user.toString())
      ) : [];
      
      const removedCount = originalMembersCount - library.members.length;
      
      if (removedCount > 0) {
        await library.save();
        cleanupReport.membersRemovedFromLibraries += removedCount;
        console.log(`从试题库 ${library.name} 中移除了 ${removedCount} 个不存在的用户`);
      }
      cleanupReport.librariesProcessed++;
    }

    // 5. 删除用户不存在的购买记录
    console.log('清理购买记录...');
    const LibraryPurchase = require('../models/LibraryPurchase').default;
    const orphanedPurchases = await LibraryPurchase.deleteMany({
      userId: { $nin: existingUsers.map(u => u._id) }
    });
    cleanupReport.libraryPurchasesDeleted = orphanedPurchases.deletedCount || 0;

    // 6. 删除用户不存在的登录历史
    console.log('清理登录历史...');
    const LoginHistory = require('../models/LoginHistory').default;
    const orphanedHistory = await LoginHistory.deleteMany({
      userId: { $nin: existingUsers.map(u => u._id) }
    });
    cleanupReport.loginHistoryDeleted = orphanedHistory.deletedCount || 0;

    // 7. 删除用户不存在的token黑名单
    console.log('清理token黑名单...');
    const TokenBlacklist = require('../models/TokenBlacklist').default;
    const orphanedTokens = await TokenBlacklist.deleteMany({
      userId: { $nin: existingUsers.map(u => u._id) }
    });
    cleanupReport.tokenBlacklistDeleted = orphanedTokens.deletedCount || 0;

    // 8. 清理游戏相关数据
    console.log('清理游戏数据...');
    try {
      const GameRecord = require('../models/Game').GameRecord;
      const UserGameStats = require('../models/Game').UserGameStats;
      const Leaderboard = require('../models/Game').Leaderboard;
      
      const orphanedGameRecords = await GameRecord.deleteMany({
        userId: { $nin: existingUsers.map(u => u._id) }
      });
      const orphanedGameStats = await UserGameStats.deleteMany({
        userId: { $nin: existingUsers.map(u => u._id) }
      });
      const orphanedLeaderboard = await Leaderboard.deleteMany({
        userId: { $nin: existingUsers.map(u => u._id) }
      });
      
      cleanupReport.gameRecordsDeleted = orphanedGameRecords.deletedCount || 0;
      cleanupReport.gameStatsDeleted = orphanedGameStats.deletedCount || 0;
      cleanupReport.leaderboardDeleted = orphanedLeaderboard.deletedCount || 0;
    } catch (gameError) {
      console.error('清理游戏数据失败:', gameError);
    }

    // 9. 清理邀请记录
    console.log('清理邀请记录...');
    try {
      const Invitation = require('../models/Invitation').default;
      const LibraryInvitation = require('../models/LibraryInvitation').default;
      
      const orphanedInvitations = await Invitation.deleteMany({
        inviterId: { $nin: existingUsers.map(u => u._id) }
      });
      const orphanedLibraryInvitations = await LibraryInvitation.deleteMany({
        inviterId: { $nin: existingUsers.map(u => u._id) }
      });
      
      cleanupReport.invitationsDeleted = orphanedInvitations.deletedCount || 0;
      cleanupReport.libraryInvitationsDeleted = orphanedLibraryInvitations.deletedCount || 0;
    } catch (invitationError) {
      console.error('清理邀请记录失败:', invitationError);
    }

    // 10. 清理企业成员记录
    console.log('清理企业成员记录...');
    try {
      const EnterpriseMember = require('../models/EnterpriseMember').default;
      const orphanedEnterpriseMembers = await EnterpriseMember.deleteMany({
        userId: { $nin: existingUsers.map(u => u._id) }
      });
      cleanupReport.enterpriseMembersDeleted = orphanedEnterpriseMembers.deletedCount || 0;
    } catch (enterpriseError) {
      console.error('清理企业成员记录失败:', enterpriseError);
    }

    console.log('孤立数据清理完成!');
    console.log('清理报告:', cleanupReport);
    
    return cleanupReport;
    
  } catch (error) {
    console.error('清理孤立数据失败:', error);
    throw error;
  }
}

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

    // 执行级联删除
    await cascadeDeleteUser(user._id as mongoose.Types.ObjectId, user.enterpriseId);

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

        // 获取要删除的用户信息
        const usersToDelete = await User.find({ _id: { $in: userIds } });
        
        // 对每个用户执行级联删除
        for (const user of usersToDelete) {
          try {
            console.log(`开始级联删除用户: ${user.name} (${user._id})`);
            await cascadeDeleteUser(user._id as mongoose.Types.ObjectId, user.enterpriseId);
          } catch (error) {
            console.error(`级联删除用户 ${user._id} 失败:`, error);
            // 继续删除其他用户，不中断整个过程
          }
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

// 清理孤立数据的API端点（仅限超级管理员）
router.post('/cleanup-orphaned-data', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    // 检查权限 - 仅限超级管理员
    if (req.user?.role !== 'superadmin') {
      return res.status(403).json({ 
        success: false, 
        error: '只有超级管理员可以执行数据清理操作' 
      });
    }

    console.log(`超级管理员 ${req.user.name} (${req.user._id}) 开始执行孤立数据清理`);
    
    // 执行清理
    const cleanupReport = await cleanupOrphanedData();
    
    console.log('数据清理操作完成', cleanupReport);
    
    return res.json({
      success: true,
      message: '孤立数据清理完成',
      report: cleanupReport
    });
    
  } catch (error) {
    console.error('执行数据清理失败:', error);
    return res.status(500).json({ 
      success: false, 
      error: '数据清理执行失败',
      details: error instanceof Error ? error.message : '未知错误'
    });
  }
});

// 获取孤立数据统计的API端点（仅限管理员）
router.get('/orphaned-data-stats', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    // 检查权限 - 管理员和超级管理员可查看
    if (req.user?.role !== 'admin' && req.user?.role !== 'superadmin') {
      return res.status(403).json({ 
        success: false, 
        error: '权限不足' 
      });
    }

    // 获取所有存在的用户ID
    const existingUsers = await User.find({}).select('_id');
    const existingUserIds = existingUsers.map(user => user._id);
    
    const stats = {
      totalUsers: existingUsers.length,
      orphanedData: {
        questionBanks: 0,
        questions: 0,
        papers: 0,
        libraries: 0,
        libraryPurchases: 0,
        loginHistory: 0,
        tokenBlacklist: 0,
        gameRecords: 0,
        gameStats: 0,
        leaderboard: 0,
        invitations: 0,
        libraryInvitations: 0,
        enterpriseMembers: 0
      }
    };

    try {
      // 统计孤立数据数量
      const QuestionBank = require('../models/QuestionBank').default;
      const Question = require('../models/Question').default;
      const Paper = require('../models/Paper').default;
      const Library = require('../models/Library').default;
      const LibraryPurchase = require('../models/LibraryPurchase').default;
      const LoginHistory = require('../models/LoginHistory').default;
      const TokenBlacklist = require('../models/TokenBlacklist').default;
      
      stats.orphanedData.questionBanks = await QuestionBank.countDocuments({
        creator: { $nin: existingUserIds }
      });
      
      stats.orphanedData.questions = await Question.countDocuments({
        creator: { $nin: existingUserIds }
      });
      
      stats.orphanedData.papers = await Paper.countDocuments({
        owner: { $nin: existingUserIds }
      });
      
      stats.orphanedData.libraries = await Library.countDocuments({
        owner: { $nin: existingUserIds }
      });
      
      stats.orphanedData.libraryPurchases = await LibraryPurchase.countDocuments({
        userId: { $nin: existingUserIds }
      });
      
      stats.orphanedData.loginHistory = await LoginHistory.countDocuments({
        userId: { $nin: existingUserIds }
      });
      
      stats.orphanedData.tokenBlacklist = await TokenBlacklist.countDocuments({
        userId: { $nin: existingUserIds }
      });
      
      // 游戏相关数据统计
      try {
        const GameRecord = require('../models/Game').GameRecord;
        const UserGameStats = require('../models/Game').UserGameStats;
        const Leaderboard = require('../models/Game').Leaderboard;
        
        stats.orphanedData.gameRecords = await GameRecord.countDocuments({
          userId: { $nin: existingUserIds }
        });
        
        stats.orphanedData.gameStats = await UserGameStats.countDocuments({
          userId: { $nin: existingUserIds }
        });
        
        stats.orphanedData.leaderboard = await Leaderboard.countDocuments({
          userId: { $nin: existingUserIds }
        });
      } catch (gameError) {
        console.error('统计游戏数据失败:', gameError);
      }
      
      // 邀请记录统计
      try {
        const Invitation = require('../models/Invitation').default;
        const LibraryInvitation = require('../models/LibraryInvitation').default;
        
        stats.orphanedData.invitations = await Invitation.countDocuments({
          inviterId: { $nin: existingUserIds }
        });
        
        stats.orphanedData.libraryInvitations = await LibraryInvitation.countDocuments({
          inviterId: { $nin: existingUserIds }
        });
      } catch (invitationError) {
        console.error('统计邀请数据失败:', invitationError);
      }
      
      // 企业成员记录统计
      try {
        const EnterpriseMember = require('../models/EnterpriseMember').default;
        stats.orphanedData.enterpriseMembers = await EnterpriseMember.countDocuments({
          userId: { $nin: existingUserIds }
        });
      } catch (enterpriseError) {
        console.error('统计企业成员数据失败:', enterpriseError);
      }
      
    } catch (error) {
      console.error('统计孤立数据失败:', error);
    }
    
    return res.json({
      success: true,
      stats
    });
    
  } catch (error) {
    console.error('获取孤立数据统计失败:', error);
    return res.status(500).json({ 
      success: false, 
      error: '获取统计数据失败' 
    });
  }
});

export default router; 