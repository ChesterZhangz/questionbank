import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { User } from '../models/User';
import { AuthRequest, authMiddleware } from '../middleware/auth';
import mongoose from 'mongoose';
import { UserCleanupService } from '../services/userCleanupService';

const router = express.Router();

// 级联删除用户相关数据的函数
async function cascadeDeleteUser(userId: mongoose.Types.ObjectId, enterpriseId?: mongoose.Types.ObjectId) {
  console.log(`开始级联删除用户 ${userId} 的相关数据...`);
  
  try {
    // 1. 删除用户创建的题库
    const QuestionBank = mongoose.model('QuestionBank');
    const Question = mongoose.model('Question');
    const userQuestionBanks = await QuestionBank.find({ creator: userId });
    for (const bank of userQuestionBanks) {
      console.log(`删除用户创建的题库: ${bank.name} (${bank._id})`);
      
      // 删除题库中的所有题目
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
    const deletedQuestions = await Question.deleteMany({ creator: userId });
    console.log(`删除了 ${deletedQuestions.deletedCount} 个用户创建的独立题目`);

    // 4. 删除用户创建的试卷
    const Paper = mongoose.model('Paper');
    const deletedPapers = await Paper.deleteMany({ owner: userId });
    console.log(`删除了 ${deletedPapers.deletedCount} 个用户创建的试卷`);

    // 5. 处理用户拥有的试题库
    const Library = mongoose.model('Library');
    const LibraryPurchase = mongoose.model('LibraryPurchase');
    const userLibraries = await Library.find({ owner: userId });
    for (const library of userLibraries) {
      console.log(`删除用户拥有的试题库: ${library.name} (${library._id})`);
      
      // 删除试题库的购买记录
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
    const deletedPurchases = await LibraryPurchase.deleteMany({ userId: userId });
    console.log(`删除了 ${deletedPurchases.deletedCount} 个用户的购买记录`);

    // 8. 删除用户的登录历史
    const LoginHistory = mongoose.model('LoginHistory');
    const deletedHistory = await LoginHistory.deleteMany({ userId: userId });
    console.log(`删除了 ${deletedHistory.deletedCount} 条用户登录历史`);

    // 9. 删除用户的token黑名单记录
    const TokenBlacklist = mongoose.model('TokenBlacklist');
    const deletedTokens = await TokenBlacklist.deleteMany({ userId: userId });
    console.log(`删除了 ${deletedTokens.deletedCount} 条用户token黑名单记录`);

    // 10. 删除用户的游戏记录和统计
    try {
      const GameRecord = mongoose.model('GameRecord');
      const UserGameStats = mongoose.model('UserGameStats');
      const Leaderboard = mongoose.model('Leaderboard');
      
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
      const Invitation = mongoose.model('Invitation');
      const LibraryInvitation = mongoose.model('LibraryInvitation');
      
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
    try {
      const EnterpriseMember = mongoose.model('EnterpriseMember');
      // 删除所有与该用户相关的企业成员记录（不限于特定企业）
      const deletedMembers = await EnterpriseMember.deleteMany({
        userId: userId
      });
      console.log(`删除企业成员记录成功: ${deletedMembers.deletedCount} 条记录`);
      
      // 13. 如果删除的是超级管理员，自动转让给最早注册的用户
      if (enterpriseId) {
        try {
          // 检查是否还有其他超级管理员
          const remainingSuperAdmins = await EnterpriseMember.find({
            enterpriseId: enterpriseId,
            role: 'superAdmin'
          });
          
          if (remainingSuperAdmins.length === 0) {
            console.log('检测到企业没有超级管理员，开始自动转让...');
            
            // 查找最早注册的企业成员
            const earliestMember = await EnterpriseMember.findOne({
              enterpriseId: enterpriseId
            }).sort({ joinDate: 1 });
            
            if (earliestMember) {
              // 将最早注册的成员提升为超级管理员
              await EnterpriseMember.findByIdAndUpdate(
                earliestMember._id,
                {
                  role: 'superAdmin',
                  permissions: [
                    'manage_members',
                    'manage_departments',
                    'manage_messages',
                    'view_statistics',
                    'invite_users',
                    'remove_users',
                    'edit_enterprise',
                    'manage_roles'
                  ]
                }
              );
              
              console.log(`自动转让超级管理员成功: 用户 ${earliestMember.userId} 成为新的超级管理员`);
            } else {
              console.log('企业中没有其他成员，无法自动转让超级管理员');
            }
          }
        } catch (transferError) {
          console.error('自动转让超级管理员失败:', transferError);
        }
      }
    } catch (memberError) {
      console.error('删除企业成员记录失败:', memberError);
    }

    // 14. 删除题目图片和TikZ代码
    try {
      const QuestionImage = mongoose.model('QuestionImage');
      const QuestionTikZ = mongoose.model('QuestionTikZ');
      
      const deletedImages = await QuestionImage.deleteMany({ uploadedBy: userId });
      const deletedTikZ = await QuestionTikZ.deleteMany({ createdBy: userId });
      
      console.log(`删除了 ${deletedImages.deletedCount} 个题目图片`);
      console.log(`删除了 ${deletedTikZ.deletedCount} 个TikZ代码`);
    } catch (mediaError) {
      console.error('删除题目媒体文件失败:', mediaError);
    }

    // 15. 删除题目草稿
    try {
      const QuestionDraft = mongoose.model('QuestionDraft');
      const deletedDrafts = await QuestionDraft.deleteMany({ creator: userId });
      console.log(`删除了 ${deletedDrafts.deletedCount} 个题目草稿`);
    } catch (draftError) {
      console.error('删除题目草稿失败:', draftError);
    }

    // 16. 删除题目评估和分析数据
    try {
      const QuestionEvaluation = mongoose.model('QuestionEvaluation');
      const QuestionAnalysis = mongoose.model('QuestionAnalysis');
      
      const deletedEvaluations = await QuestionEvaluation.deleteMany({ 
        $or: [
          { evaluator: userId },
          { questionCreator: userId }
        ]
      });
      const deletedAnalyses = await QuestionAnalysis.deleteMany({ 
        $or: [
          { analyst: userId },
          { questionCreator: userId }
        ]
      });
      
      console.log(`删除了 ${deletedEvaluations.deletedCount} 个题目评估`);
      console.log(`删除了 ${deletedAnalyses.deletedCount} 个题目分析`);
    } catch (analysisError) {
      console.error('删除题目评估分析失败:', analysisError);
    }

    // 17. 删除相似性检测数据
    try {
      const SimilarityDetection = mongoose.model('SimilarityDetection');
      const deletedSimilarities = await SimilarityDetection.deleteMany({ 
        $or: [
          { detector: userId },
          { questionCreator: userId }
        ]
      });
      console.log(`删除了 ${deletedSimilarities.deletedCount} 个相似性检测记录`);
    } catch (similarityError) {
      console.error('删除相似性检测数据失败:', similarityError);
    }

    // 18. 删除企业消息
    try {
      const EnterpriseMessage = mongoose.model('EnterpriseMessage');
      const deletedMessages = await EnterpriseMessage.deleteMany({ 
        $or: [
          { sender: userId },
          { recipients: userId }
        ]
      });
      console.log(`删除了 ${deletedMessages.deletedCount} 条企业消息`);
    } catch (messageError) {
      console.error('删除企业消息失败:', messageError);
    }

    console.log(`用户 ${userId} 的所有相关数据级联删除完成`);
    
  } catch (error) {
    console.error('级联删除用户数据失败:', error);
    throw error; // 重新抛出错误，让调用方处理
  }
}



// 企业成员数量现在是动态计算的，不再需要手动更新

// 搜索用户（所有登录用户可访问）
router.get('/search', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { q, limit = '10', excludeQuestionBank } = req.query;
    
    if (!q || typeof q !== 'string' || q.trim().length < 2) {
      return res.json({
        success: true,
        users: []
      });
    }

    const searchQuery = q.trim();
    const limitNum = Math.min(parseInt(limit as string) || 10, 50); // 最多50个结果

    // 基础搜索条件：用户名或邮箱包含搜索词，且邮箱已验证
    let searchConditions: any = {
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
    };

    // 如果指定了排除题库，则排除已经是该题库成员的用户
    if (excludeQuestionBank && typeof excludeQuestionBank === 'string') {
      try {
        const QuestionBank = mongoose.model('QuestionBank');
        const questionBank = await QuestionBank.findOne({ bid: excludeQuestionBank });
        if (questionBank) {
          const existingMemberIds = [
            questionBank.creator,
            ...questionBank.managers,
            ...questionBank.collaborators,
            ...(questionBank.viewers || [])
          ];
          
          if (existingMemberIds.length > 0) {
            searchConditions.$and.push({
              _id: { $nin: existingMemberIds }
            });
          }
        }
      } catch (error) {
        console.error('获取题库信息失败:', error);
        // 如果获取题库信息失败，继续执行搜索，不排除任何用户
      }
    }

    const users = await User.find(searchConditions, 'name email enterpriseName avatar')
      .limit(limitNum)
      .sort({ name: 1 });

    // 格式化用户数据
    const formattedUsers = users.map(user => ({
      _id: user._id,
      name: user.name,
      email: user.email,
      enterpriseName: user.enterpriseName,

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



export default router; 