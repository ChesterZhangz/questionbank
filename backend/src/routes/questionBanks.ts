import express from 'express';
import { body, param, query, validationResult } from 'express-validator';
import QuestionBank from '../models/QuestionBank';
import { Question } from '../models/Question';
import { User } from '../models/User';
import { Invitation } from '../models/Invitation';
import { emailService } from '../services/emailService';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = express.Router();

// 扩展请求类型
interface QuestionBankRequest extends AuthRequest {
  userRole?: string;
  questionBank?: any;
}

// 权限检查中间件
const checkQuestionBankPermission = async (req: QuestionBankRequest, res: any, next: any) => {
  try {
    const { bid } = req.params;
    const userId = req.user._id;
    
    const questionBank = await QuestionBank.findOne({ bid });
    if (!questionBank) {
      return res.status(404).json({ success: false, error: '题库不存在' });
    }

    // 检查用户权限
    const user = await User.findById(userId);
    if (!user) {
      return res.status(401).json({ success: false, error: '用户不存在' });
    }

    // 创建者拥有所有权限
    if (questionBank.creator.toString() === userId.toString()) {
      req.userRole = 'creator';
      req.questionBank = questionBank;
      return next();
    }

    // 管理者拥有管理权限
    if (questionBank.managers.includes(userId)) {
      req.userRole = 'manager';
      req.questionBank = questionBank;
      return next();
    }

    // 协作者拥有编辑权限
    if (questionBank.collaborators.includes(userId)) {
      req.userRole = 'collaborator';
      req.questionBank = questionBank;
      return next();
    }

    // 查看者拥有查看权限
    if (questionBank.viewers && questionBank.viewers.includes(userId)) {
      req.userRole = 'viewer';
      req.questionBank = questionBank;
      return next();
    }

    // 同企业用户默认拥有查看权限（隐式查看者）
    if (user.enterpriseId && 
        questionBank.emailSuffix === user.emailSuffix && 
        questionBank.allowCollaboration) {
      req.userRole = 'enterprise_viewer';
      req.questionBank = questionBank;
      return next();
    }

    // 公开题库允许查看
    if (questionBank.isPublic) {
      req.userRole = 'viewer';
      req.questionBank = questionBank;
      return next();
    }

    return res.status(403).json({ success: false, error: '权限不足' });
  } catch (error) {
    return res.status(500).json({ success: false, error: '服务器错误' });
  }
};

// 获取题库列表
router.get('/', authMiddleware, async (req: QuestionBankRequest, res: any) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(401).json({ success: false, error: '用户不存在' });
    }


    // 查找用户可访问的题库
    const questionBanks = await QuestionBank.find({
      $or: [
        { creator: userId },
        { managers: userId },
        { collaborators: userId },
        { 
          emailSuffix: user.emailSuffix, 
          allowCollaboration: true,
          status: 'active'
        },
        { 
          isPublic: true,
          status: 'active'
        }
      ],
      status: 'active'
    }).populate('creator', 'name email')
      .populate('managers', 'name email')
      .populate('collaborators', 'name email')
      .sort({ updatedAt: -1 });

    // 为每个题库添加用户权限信息
    const questionBanksWithPermissions = questionBanks.map(bank => {
      const bankObj = bank.toObject();
      
      // 确定用户权限
      let userRole = 'viewer';
      
      // 正确处理populate后的creator字段
      const creatorId = typeof bank.creator === 'object' && bank.creator._id 
        ? bank.creator._id.toString() 
        : bank.creator.toString();
      const userIdStr = userId.toString();
      
      if (creatorId === userIdStr) {
        userRole = 'creator';
      } else if (bank.managers.some(manager => {
        const managerId = typeof manager === 'object' && manager._id 
          ? manager._id.toString() 
          : manager.toString();
        return managerId === userIdStr;
      })) {
        userRole = 'manager';
      } else if (bank.collaborators.some(collaborator => {
        const collaboratorId = typeof collaborator === 'object' && collaborator._id 
          ? collaborator._id.toString() 
          : collaborator.toString();
        return collaboratorId === userIdStr;
      })) {
        userRole = 'collaborator';
      } else if (user.enterpriseId && 
                 bank.emailSuffix === user.emailSuffix && 
                 bank.allowCollaboration) {
        userRole = 'viewer';
      } else if (bank.isPublic) {
        userRole = 'viewer';
      }

      return {
        ...bankObj,
        userRole,
        canCreateQuestions: userRole === 'creator' || userRole === 'manager' || userRole === 'collaborator'
      };
    });

    return res.json({
      success: true,
      questionBanks: questionBanksWithPermissions
    });
  } catch (error) {
    console.error('获取题库列表失败:', error);
    return res.status(500).json({ success: false, error: '获取题库列表失败' });
  }
});

// 创建题库
router.post('/', authMiddleware, [
  body('name').trim().isLength({ min: 1, max: 50 }).withMessage('题库名称长度必须在1-50个字符之间'),
  body('description').optional().isLength({ max: 500 }).withMessage('题库描述不能超过500个字符'),
  body('category').optional().trim(),
  body('tags').optional().isArray(),
  body('isPublic').optional().isBoolean(),
  body('allowCollaboration').optional().isBoolean()
], async (req: QuestionBankRequest, res: any) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        error: '输入验证失败',
        details: errors.array()
      });
    }

    const userId = req.user._id;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(401).json({ success: false, error: '用户不存在' });
    }

    const { name, description, category, tags, isPublic, allowCollaboration } = req.body;

    // 提取邮箱后缀
    const emailSuffix = user.email.split('@')[1] ? `@${user.email.split('@')[1]}` : '@viquard.com';
    


    const questionBank = new QuestionBank({
      name,
      description,
      category,
      tags: tags || [],
      isPublic: isPublic || false,
      allowCollaboration: allowCollaboration !== false, // 默认允许协作
      creator: userId,
      emailSuffix
    });

    await questionBank.save();

    // 更新用户的emailSuffix字段（如果还没有设置）
    if (!user.emailSuffix) {
      user.emailSuffix = emailSuffix;
      await user.save();
    }

    // 返回创建的题库（包含关联数据）
    const populatedQuestionBank = await QuestionBank.findById(questionBank._id)
      .populate('creator', 'name email')
      .populate('managers', 'name email')
      .populate('collaborators', 'name email');

    return res.status(201).json({
      success: true,
      questionBank: populatedQuestionBank,
      message: '题库创建成功'
    });
  } catch (error) {
    console.error('创建题库失败:', error);
    return res.status(500).json({ success: false, error: '创建题库失败' });
  }
});

// 获取题库详情
router.get('/:bid', authMiddleware, checkQuestionBankPermission, async (req: QuestionBankRequest, res) => {
  try {
    const questionBank = req.questionBank;
    
    // 获取题库内的题目数量
    const questionCount = await Question.countDocuments({ 
      questionBank: questionBank._id,
      status: { $ne: 'deleted' }
    });

    // 更新题库的题目数量
    if (questionBank.questionCount !== questionCount) {
      questionBank.questionCount = questionCount;
      questionBank.lastUpdated = new Date();
      await questionBank.save();
    }

    // 重新获取题库信息并populate关联数据
    const populatedQuestionBank = await QuestionBank.findById(questionBank._id)
      .populate('creator', 'name email')
      .populate('managers', 'name email')
      .populate('collaborators', 'name email');

    return res.json({
      success: true,
      questionBank: populatedQuestionBank
    });
  } catch (error) {
    console.error('获取题库详情失败:', error);
    return res.status(500).json({ success: false, error: '获取题库详情失败' });
  }
});

// 更新题库
router.put('/:bid', authMiddleware, checkQuestionBankPermission, [
  body('name').optional().trim().isLength({ min: 1, max: 50 }).withMessage('题库名称长度必须在1-50个字符之间'),
  body('description').optional().isLength({ max: 500 }).withMessage('题库描述不能超过500个字符'),
  body('category').optional().trim(),
  body('tags').optional().isArray(),
  body('isPublic').optional().isBoolean(),
  body('allowCollaboration').optional().isBoolean()
], async (req: QuestionBankRequest, res: any) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        error: '输入验证失败',
        details: errors.array()
      });
    }

    const questionBank = req.questionBank;
    const userRole = req.userRole;

    // 只有创建者和管理者可以编辑题库
    if (userRole !== 'creator' && userRole !== 'manager') {
      return res.status(403).json({ success: false, error: '权限不足' });
    }

    const { name, description, category, tags, isPublic, allowCollaboration } = req.body;

    // 更新字段
    if (name !== undefined) questionBank.name = name;
    if (description !== undefined) questionBank.description = description;
    if (category !== undefined) questionBank.category = category;
    if (tags !== undefined) questionBank.tags = tags;
    if (isPublic !== undefined) questionBank.isPublic = isPublic;
    if (allowCollaboration !== undefined) questionBank.allowCollaboration = allowCollaboration;

    questionBank.lastUpdated = new Date();
    await questionBank.save();

    return res.json({
      success: true,
      questionBank,
      message: '题库更新成功'
    });
  } catch (error) {
    console.error('更新题库失败:', error);
    return res.status(500).json({ success: false, error: '更新题库失败' });
  }
});

// 删除题库
router.delete('/:bid', authMiddleware, checkQuestionBankPermission, async (req: QuestionBankRequest, res: any) => {
  try {
    const questionBank = req.questionBank;
    const userRole = req.userRole;

    // 只有创建者可以删除题库
    if (userRole !== 'creator') {
      return res.status(403).json({ success: false, error: '只有创建者可以删除题库' });
    }

    // 删除该题库下的所有题目
    const deleteResult = await Question.deleteMany({
      $or: [
        { questionBank: questionBank._id },
        { bid: questionBank.bid }
      ]
    });

    // 软删除：将状态设置为deleted
    questionBank.status = 'deleted';
    questionBank.questionCount = 0; // 重置题目数量
    await questionBank.save();

    return res.json({
      success: true,
      message: `题库删除成功，同时删除了 ${deleteResult.deletedCount} 道题目`
    });
  } catch (error) {
    console.error('删除题库失败:', error);
    return res.status(500).json({ success: false, error: '删除题库失败' });
  }
});



// 获取题库成员列表
router.get('/:bid/members', authMiddleware, checkQuestionBankPermission, async (req: QuestionBankRequest, res: any) => {
  try {
    const questionBank = req.questionBank;
    const userRole = req.userRole;

    // 只有创建者和管理者可以查看成员列表
    if (userRole !== 'creator' && userRole !== 'manager') {
      return res.status(403).json({ success: false, error: '权限不足' });
    }

    const members = {
      creator: await User.findById(questionBank.creator).select('name email'),
      managers: await User.find({ _id: { $in: questionBank.managers } }).select('name email'),
      collaborators: await User.find({ _id: { $in: questionBank.collaborators } }).select('name email'),
      viewers: questionBank.viewers ? await User.find({ _id: { $in: questionBank.viewers } }).select('name email') : []
    };

    return res.json({
      success: true,
      members
    });
  } catch (error) {
    console.error('获取成员列表失败:', error);
    return res.status(500).json({ success: false, error: '获取成员列表失败' });
  }
});

// 移除题库成员
// 添加成员
router.post('/:bid/members', authMiddleware, checkQuestionBankPermission, [
  body('email').isEmail().withMessage('请输入有效的邮箱地址'),
  body('role').isIn(['manager', 'collaborator', 'viewer']).withMessage('角色必须是manager、collaborator或viewer')
], async (req: QuestionBankRequest, res: any) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        error: '输入验证失败',
        details: errors.array()
      });
    }

    const questionBank = req.questionBank;
    const userRole = req.userRole;

    // 只有创建者和管理者可以添加成员
    if (userRole !== 'creator' && userRole !== 'manager') {
      return res.status(403).json({ success: false, error: '没有权限添加成员' });
    }

    const { email, role } = req.body;

    // 查找用户
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, error: '该邮箱用户不存在' });
    }

    // 检查是否已经是成员
    const isAlreadyMember = questionBank.managers.includes(user._id) || 
                          questionBank.collaborators.includes(user._id) ||
                          (questionBank.viewers && questionBank.viewers.includes(user._id)) ||
                          questionBank.creator.toString() === (user._id as any).toString();
    
    if (isAlreadyMember) {
      return res.status(400).json({ success: false, error: '该用户已经是题库成员' });
    }

    // 添加成员
    if (role === 'manager') {
      questionBank.managers.push(user._id);
    } else if (role === 'collaborator') {
      questionBank.collaborators.push(user._id);
    } else if (role === 'viewer') {
      questionBank.viewers = questionBank.viewers || [];
      questionBank.viewers.push(user._id);
    }
    
    await questionBank.save();

    // 发送成员添加通知邮件
    try {
      const inviter = await User.findById(req.user._id);
      await emailService.sendMemberAddedEmail({
        email: user.email,
        name: user.name,
        role: role,
        questionBankName: questionBank.name,
        inviterName: inviter?.name || '管理员',
        questionBankUrl: `${process.env.FRONTEND_URL}/question-banks/${questionBank.bid}`
      });
    } catch (emailError) {
      console.error('发送成员添加邮件失败:', emailError);
      // 不影响添加成员的主要功能
    }

    return res.json({ 
      success: true, 
      message: '成员添加成功'
    });
  } catch (error) {
    console.error('添加成员失败:', error);
    return res.status(500).json({ success: false, error: '添加成员失败' });
  }
});

router.delete('/:bid/members/:userId', authMiddleware, checkQuestionBankPermission, async (req: QuestionBankRequest, res: any) => {
  try {
    const questionBank = req.questionBank;
    const userRole = req.userRole;
    const { userId } = req.params;

    // 只有创建者可以移除成员
    if (userRole !== 'creator') {
      return res.status(403).json({ success: false, error: '只有创建者可以移除成员' });
    }

    // 检查用户是否存在
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: '用户不存在' });
    }

    // 移除成员
    questionBank.managers = questionBank.managers.filter((id: any) => id.toString() !== userId);
    questionBank.collaborators = questionBank.collaborators.filter((id: any) => id.toString() !== userId);
    if (questionBank.viewers) {
      questionBank.viewers = questionBank.viewers.filter((id: any) => id.toString() !== userId);
    }

    await questionBank.save();

    // 发送成员移除通知邮件
    try {
      const remover = await User.findById(req.user._id);
      await emailService.sendMemberRemovedEmail({
        email: user.email,
        name: user.name,
        questionBankName: questionBank.name,
        removerName: remover?.name || '管理员'
      });
    } catch (emailError) {
      console.error('发送成员移除邮件失败:', emailError);
      // 不影响移除成员的主要功能
    }

    return res.json({
      success: true,
      message: '成员移除成功'
    });
  } catch (error) {
    console.error('移除成员失败:', error);
    return res.status(500).json({ success: false, error: '移除成员失败' });
  }
});

// 统计分析API
router.get('/:bid/stats', authMiddleware, checkQuestionBankPermission, async (req: QuestionBankRequest, res: any) => {
  try {
    const questionBank = req.questionBank;
    
    // 重新获取题库信息并populate关联数据
    const populatedQuestionBank = await QuestionBank.findOne({ bid: questionBank.bid })
      .populate('creator', 'name email updatedAt createdAt')
      .populate('managers', 'name email updatedAt createdAt')
      .populate('collaborators', 'name email updatedAt createdAt');
    
    if (!populatedQuestionBank) {
      return res.status(404).json({ success: false, error: '题库不存在' });
    }
    
    // 题目类型分布 - 修复：包含多选题
    const [choiceCount, multipleChoiceCount, fillCount, solutionCount] = await Promise.all([
      Question.countDocuments({ questionBank: questionBank._id, type: 'choice', status: { $ne: 'deleted' } }),
      Question.countDocuments({ questionBank: questionBank._id, type: 'multiple-choice', status: { $ne: 'deleted' } }),
      Question.countDocuments({ questionBank: questionBank._id, type: 'fill', status: { $ne: 'deleted' } }),
      Question.countDocuments({ questionBank: questionBank._id, type: 'solution', status: { $ne: 'deleted' } })
    ]);
    // 难度分布
    const [easyCount, mediumCount, hardCount] = await Promise.all([
      Question.countDocuments({ questionBank: questionBank._id, difficulty: { $lte: 2 }, status: { $ne: 'deleted' } }),
      Question.countDocuments({ questionBank: questionBank._id, difficulty: 3, status: { $ne: 'deleted' } }),
      Question.countDocuments({ questionBank: questionBank._id, difficulty: { $gte: 4 }, status: { $ne: 'deleted' } })
    ]);
    // 总题数 - 修复：统计所有类型的题目
    const totalQuestions = await Question.countDocuments({ questionBank: questionBank._id, status: { $ne: 'deleted' } });
    
    // 平均难度 - 优化：添加数据验证和边界处理
    const agg = await Question.aggregate([
      { $match: { questionBank: questionBank._id, status: { $ne: 'deleted' } } },
      { $group: { _id: null, avg: { $avg: '$difficulty' } } }
    ]);
    

    // 获取难度分布详情
    const difficultyDetails = await Question.aggregate([
      { $match: { questionBank: questionBank._id, status: { $ne: 'deleted' } } },
      { $group: { _id: '$difficulty', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    const averageDifficulty = Math.max(0, Math.min(agg[0]?.avg || 0, 5)); // 限制在0-5范围内
    
    

    const tagQuestions = await Question.countDocuments({ 
      questionBank: questionBank._id, 
      tags: { $exists: true, $not: { $size: 0 } }, 
      status: { $ne: 'deleted' } 
    });
    
    
    const tagCoverage = totalQuestions > 0 ? Math.min(Math.round((tagQuestions / totalQuestions) * 100), 100) : 0;
    
    
    // 重复率（优化实现：同stem的题目数量>1）
    const duplicateAgg = await Question.aggregate([
      { $match: { questionBank: questionBank._id, status: { $ne: 'deleted' } } },
      { $group: { _id: '$content.stem', count: { $sum: 1 } } },
      { $match: { count: { $gt: 1 } } },
      { $group: { _id: null, total: { $sum: '$count' } } }
    ]);
    const duplicateRate = totalQuestions > 0 ? Math.min(Math.round(((duplicateAgg[0]?.total || 0) / totalQuestions) * 100), 100) : 0;
    // 热门题目（按views排序）
    const popularQuestions = await Question.find({ questionBank: questionBank._id, status: { $ne: 'deleted' } })
      .sort({ views: -1 })
      .limit(5)
      .select('qid content.stem views');
    // 成员活跃度（按题目数统计）
    const memberActivity = [];
    const allMembers = [
      { user: populatedQuestionBank.creator, role: '创建者' },
      ...populatedQuestionBank.managers.map((u: any) => ({ user: u, role: '管理者' })),
      ...populatedQuestionBank.collaborators.map((u: any) => ({ user: u, role: '协作者' }))
    ];
    
    console.log(`[统计分析] 成员数据:`, allMembers.map(m => ({
      userId: m.user?._id,
      name: m.user?.name,
      role: m.role,
      hasName: !!m.user?.name,
      updatedAt: m.user?.updatedAt,
      createdAt: m.user?.createdAt,
      lastActive: m.user?.updatedAt || m.user?.createdAt,
      userObject: m.user // 添加完整的用户对象用于调试
    })));
    
    for (const m of allMembers) {
      if (m.user && m.user._id) {
        const count = await Question.countDocuments({ questionBank: questionBank._id, 'creator': m.user._id, status: { $ne: 'deleted' } });
        const lastActive = m.user.updatedAt || m.user.createdAt;
        const memberData = {
          userId: m.user._id,
          name: m.user.name || '未知用户',
          role: m.role,
          lastActive: lastActive,
          questionCount: count
        };
        memberActivity.push(memberData);
        console.log(`[统计分析] 成员 ${memberData.name} (${memberData.role}): ${count} 题, lastActive: ${lastActive}, userObject:`, m.user);
      }
    }
    // 访问量（使用views字段）
    const totalViews = await Question.aggregate([
      { $match: { questionBank: questionBank._id, status: { $ne: 'deleted' } } },
      { $group: { _id: null, total: { $sum: '$views' } } }
    ]);
    // 月度访问量趋势（近6个月）
    const now = new Date();
    const monthlyViews = [];
    for (let i = 5; i >= 0; i--) {
      const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      const monthViews = await Question.aggregate([
        { $match: { questionBank: questionBank._id, status: { $ne: 'deleted' }, updatedAt: { $gte: start, $lt: end } } },
        { $group: { _id: null, total: { $sum: '$views' } } }
      ]);
      monthlyViews.push({
        month: `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}`,
        count: monthViews[0]?.total || 0
      });
    }
    res.json({
      success: true,
      questionBank: {
        _id: populatedQuestionBank._id,
        bid: populatedQuestionBank.bid,
        name: populatedQuestionBank.name,
        description: populatedQuestionBank.description,
        creator: populatedQuestionBank.creator,
        managers: populatedQuestionBank.managers,
        collaborators: populatedQuestionBank.collaborators,
        isPublic: populatedQuestionBank.isPublic,
        allowCollaboration: populatedQuestionBank.allowCollaboration,
        maxQuestions: populatedQuestionBank.maxQuestions,
        questionCount: populatedQuestionBank.questionCount,
        lastUpdated: populatedQuestionBank.lastUpdated,
        tags: populatedQuestionBank.tags,
        category: populatedQuestionBank.category,
        emailSuffix: populatedQuestionBank.emailSuffix,
        status: populatedQuestionBank.status,
        createdAt: populatedQuestionBank.createdAt,
        updatedAt: populatedQuestionBank.updatedAt
      },
      stats: {
        totalQuestions,
        questionTypes: {
          choice: choiceCount,
          'multiple-choice': multipleChoiceCount,
          fill: fillCount,
          solution: solutionCount
        },
        difficultyDistribution: {
          easy: easyCount,
          medium: mediumCount,
          hard: hardCount
        },
        totalViews: totalViews[0]?.total || 0,
        monthlyViews,
        popularQuestions: popularQuestions.map(q => ({
          qid: q.qid,
          title: q.content.stem,
          views: q.views
        })),
        memberActivity,
        averageDifficulty,
        tagCoverage,
        duplicateRate
      }
    });
  } catch (error) {
    console.error('统计分析失败:', error);
    res.status(500).json({ success: false, error: '统计分析失败' });
  }
});

// 更新题库高级设置
router.put('/:bid/settings', authMiddleware, checkQuestionBankPermission, [
  body('maxQuestions').optional().isInt({ min: 1 }).withMessage('题目数量限制必须是正整数'),
  body('exportTemplate').optional().isIn(['default', 'simple', 'detailed', 'custom']).withMessage('导出模板无效'),
  body('autoBackup').optional().isBoolean().withMessage('自动备份必须是布尔值'),
  body('backupFrequency').optional().isIn(['daily', 'weekly', 'monthly']).withMessage('备份频率无效'),
  body('notifications').optional().isObject().withMessage('通知设置必须是对象'),
  body('notifications.memberChange').optional().isBoolean().withMessage('成员变更通知必须是布尔值'),
  body('notifications.questionUpdate').optional().isBoolean().withMessage('题目更新通知必须是布尔值'),
  body('notifications.systemAlert').optional().isBoolean().withMessage('系统警告通知必须是布尔值')
], async (req: QuestionBankRequest, res: any) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        error: '输入验证失败',
        details: errors.array()
      });
    }

    const questionBank = req.questionBank;
    const userRole = req.userRole;

    // 只有创建者和管理者可以修改高级设置
    if (userRole !== 'creator' && userRole !== 'manager') {
      return res.status(403).json({ success: false, error: '权限不足' });
    }

    const { 
      maxQuestions, 
      exportTemplate, 
      autoBackup, 
      backupFrequency, 
      notifications 
    } = req.body;

    // 更新高级设置
    if (maxQuestions !== undefined) questionBank.maxQuestions = maxQuestions;
    if (exportTemplate !== undefined) questionBank.exportTemplate = exportTemplate;
    if (autoBackup !== undefined) questionBank.autoBackup = autoBackup;
    if (backupFrequency !== undefined) questionBank.backupFrequency = backupFrequency;
    if (notifications !== undefined) questionBank.notifications = notifications;

    questionBank.lastUpdated = new Date();
    await questionBank.save();

    return res.json({
      success: true,
      questionBank,
      message: '高级设置更新成功'
    });
  } catch (error) {
    console.error('更新高级设置失败:', error);
    return res.status(500).json({ success: false, error: '更新高级设置失败' });
  }
});

// 发送题库邀请邮件
router.post('/:bid/invitations', authMiddleware, checkQuestionBankPermission, [
  body('invitations').isArray().withMessage('邀请列表必须是数组'),
  body('invitations.*.email').isEmail().withMessage('请输入有效的邮箱地址'),
  body('invitations.*.role').isIn(['manager', 'collaborator']).withMessage('角色必须是manager或collaborator')
], async (req: QuestionBankRequest, res: any) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        error: '输入验证失败',
        details: errors.array()
      });
    }

    const questionBank = req.questionBank;
    const userRole = req.userRole;

    // 只有创建者和管理者可以发送邀请
    if (userRole !== 'creator' && userRole !== 'manager') {
      return res.status(403).json({ success: false, error: '没有权限发送邀请' });
    }

    const { invitations } = req.body;
    const currentUser = req.user._id;

    // 获取邀请人信息
    const inviter = await User.findById(currentUser);
    if (!inviter) {
      return res.status(400).json({ success: false, error: '邀请人信息不存在' });
    }

    let success = 0;
    let failed = 0;
    let failedDetails: Array<{ email: string; reason: string }> = [];

    for (const invitation of invitations) {
      try {
        const { email, role } = invitation;

        // 检查用户是否已经存在
        const existingUser = await User.findOne({ email });
        if (existingUser) {
          // 如果用户已存在，检查是否已经是成员
          const isAlreadyMember = questionBank.managers.includes(existingUser._id) || 
                                questionBank.collaborators.includes(existingUser._id);
          if (isAlreadyMember) {
            failed++;
            failedDetails.push({ email, reason: '该用户已经是题库成员' });
            continue;
          }
        }

        // 检查是否已有待处理的邀请
        const existingInvitation = await Invitation.findOne({
          questionBankId: questionBank._id,
          email: email,
          status: 'pending'
        });
        
        if (existingInvitation) {
          // 检查邀请是否在12小时内
          const twelveHoursAgo = new Date();
          twelveHoursAgo.setHours(twelveHoursAgo.getHours() - 12);
          
          if (existingInvitation.createdAt > twelveHoursAgo) {
            // 邀请在12小时内，返回错误信息
            failed++;
            failedDetails.push({ email, reason: '该用户已在12小时内被邀请过' });
            continue;
          } else {
            // 邀请超过12小时，删除旧邀请
            await Invitation.findByIdAndDelete(existingInvitation._id);
          }
        }

        // 生成接受邀请的链接
        const acceptUrl = `${process.env.FRONTEND_URL}/question-banks/${questionBank.bid}/accept-invitation?email=${encodeURIComponent(email)}&role=${role}`;
        
        // 发送邀请邮件
        const emailSent = await emailService.sendQuestionBankInvitationEmail({
          email: email,
          role: role,
          questionBankName: questionBank.name,
          inviterName: inviter.name,
          acceptUrl: acceptUrl
        });

        if (emailSent) {
          // 创建邀请记录，设置12小时后过期
          const expiresAt = new Date();
          expiresAt.setHours(expiresAt.getHours() + 12);
          
          await Invitation.create({
            type: 'questionBank',
            questionBankId: questionBank._id,
            email: email,
            role: role,
            inviterId: currentUser,
            status: 'pending',
            expiresAt: expiresAt
          });
          
          success++;
        } else {
          failed++;
          failedDetails.push({ email, reason: '邮件发送失败' });
        }
      } catch (error) {
        console.error(`处理邀请 ${invitation.email} 时出错:`, error);
        failed++;
        failedDetails.push({ email: invitation.email, reason: '处理邀请失败' });
      }
    }

    return res.json({ 
      success: true, 
      data: { success, failed },
      failedDetails,
      message: `成功发送 ${success} 个邀请，失败 ${failed} 个`
    });
  } catch (error) {
    console.error('发送邀请邮件失败:', error);
    return res.status(500).json({ success: false, error: '发送邀请邮件失败' });
  }
});

// 接受题库邀请
router.post('/:bid/accept-invitation', async (req: any, res: any) => {
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
    const { email, role } = req.body;
    
    // 验证当前用户的邮箱是否匹配邀请
    const user = await User.findById(currentUser);
    if (!user || user.email !== email) {
      return res.status(403).json({ success: false, error: '邮箱不匹配，无法接受邀请' });
    }

    const questionBank = await QuestionBank.findOne({ bid: req.params.bid });
    if (!questionBank) {
      return res.status(404).json({ success: false, error: '题库不存在' });
    }

    // 查找待处理的邀请
    const invitation = await Invitation.findOne({
      questionBankId: questionBank._id,
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
    const isAlreadyMember = questionBank.managers.includes(currentUser) || 
                           questionBank.collaborators.includes(currentUser);
    if (isAlreadyMember) {
      return res.status(400).json({ success: false, error: '您已经是该题库的成员' });
    }

    // 添加用户到成员列表
    if (role === 'manager') {
      questionBank.managers.push(currentUser);
    } else {
      questionBank.collaborators.push(currentUser);
    }

    await questionBank.save();

    // 更新邀请状态为已接受
    await Invitation.findByIdAndUpdate(invitation._id, { status: 'accepted' });

    return res.json({ 
      success: true, 
      message: '成功接受邀请，已加入题库',
      data: { role: role, questionBankName: questionBank.name }
    });
  } catch (error) {
    console.error('接受邀请失败:', error);
    return res.status(500).json({ success: false, error: '接受邀请失败' });
  }
});

export default router; 