import express from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import QuestionBank from '../models/QuestionBank';
import { Question } from '../models/Question';
import { User } from '../models/User';
import PaperBank from '../models/PaperBank';

const router = express.Router();

// 获取仪表板统计数据
router.get('/stats', authMiddleware, async (req: AuthRequest, res: any) => {
  try {
    const userId = req.user._id;
    
    // 获取用户可访问的题库数量
    const user = await User.findById(userId);
    if (!user) {
      return res.status(401).json({ success: false, error: '用户不存在' });
    }

    const questionBanksCount = await QuestionBank.countDocuments({
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
    });

    // 获取题目总数 - 修复查询逻辑
    // 获取用户可访问的题库的bid（字符串ID）
    const accessibleBankBids = await QuestionBank.distinct('bid', {
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
    });

    const questionsCount = await Question.countDocuments({
      bid: { $in: accessibleBankBids }
    });

    // 获取试卷集（Paper Bank）统计
    const paperBanksCount = await PaperBank.countDocuments({
      $or: [
        { ownerId: userId },
        { status: 'published' } // 已发布的试卷集对所有用户可见
      ]
    });

    // 获取今日活动数 - 修复为实际的活动数量
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // 统计今日创建或更新的题目数量
    const todayQuestions = await Question.countDocuments({
      bid: { $in: accessibleBankBids },
      $or: [
        { createdAt: { $gte: today } },
        { updatedAt: { $gte: today } }
      ]
    });

    // 统计今日创建或更新的题库数量
    const todayBanks = await QuestionBank.countDocuments({
      $and: [
        {
          $or: [
            { creator: userId },
            { managers: userId },
            { collaborators: userId }
          ]
        },
        {
          $or: [
            { createdAt: { $gte: today } },
            { updatedAt: { $gte: today } }
          ]
        }
      ]
    });

    const recentActivity = todayQuestions + todayBanks;

    // 计算完成率 - 基于用户已完成的题目数量
    // 这里我们计算用户有权限的题库中，平均每个题库的题目完成情况
    // 假设每个题库的标准题目数量为10道，计算完成率
    const standardQuestionsPerBank = 1000;
    const expectedTotalQuestions = questionBanksCount * standardQuestionsPerBank;
    const completionRate = expectedTotalQuestions > 0 
      ? Math.min(100, Math.max(0, Math.floor((questionsCount / expectedTotalQuestions) * 100)))
      : 0;

    // 获取用户统计
    const userStats = {
      totalUsers: await User.countDocuments(),
      activeUsers: await User.countDocuments({ isActive: true }),
      newUsersThisMonth: await User.countDocuments({
        createdAt: { $gte: new Date(today.getFullYear(), today.getMonth(), 1) }
      })
    };

    // 系统状态（简化版本）
    const systemStats = {
      systemStatus: 'normal' as const,
      apiStatus: 'normal' as const,
      databaseStatus: 'normal' as const
    };

    const stats = {
      totalQuestionBanks: questionBanksCount,
      totalQuestions: questionsCount,
      totalPaperBanks: paperBanksCount, // 新增：试卷集总数
      recentActivity,
      completionRate,
      userStats,
      systemStats
    };

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('获取仪表板统计数据失败:', error);
    res.status(500).json({ success: false, error: '获取统计数据失败' });
  }
});

// 获取最近活动
router.get('/activities', authMiddleware, async (req: AuthRequest, res: any) => {
  try {
    const userId = req.user._id;
    const limit = parseInt(req.query.limit as string) || 10;

    // 获取用户相关的最近活动（简化版本）
    const activities = [];

    // 获取最近创建的题库
    const recentBanks = await QuestionBank.find({
      $or: [
        { creator: userId },
        { managers: userId },
        { collaborators: userId }
      ]
    })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('creator', 'name');

    for (const bank of recentBanks) {
      activities.push({
        id: (bank as any)._id.toString(),
        type: 'create' as const,
        title: '创建了新的题库',
        description: bank.name,
        timestamp: bank.createdAt,
        user: (bank.creator as any)?.name || '用户',
        targetId: (bank as any)._id.toString(),
        targetType: 'questionBank' as const
      });
    }

    // 获取最近更新的题目
    const recentQuestions = await Question.find({
      bid: { $in: await QuestionBank.distinct('_id', {
        $or: [
          { creator: userId },
          { managers: userId },
          { collaborators: userId }
        ]
      })}
    })
    .sort({ updatedAt: -1 })
    .limit(limit)
    .populate('bid', 'name');

    for (const question of recentQuestions) {
      activities.push({
        id: (question as any)._id.toString(),
        type: 'edit' as const,
        title: '编辑了题目',
        description: `${(question.bid as any)?.name || '题库'} - ${question.content?.stem?.substring(0, 50)}...`,
        timestamp: question.updatedAt,
        user: req.user.name,
        targetId: (question as any)._id.toString(),
        targetType: 'question' as const
      });
    }

    // 按时间排序并限制数量
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    activities.splice(limit);

    res.json({
      success: true,
      activities
    });
  } catch (error) {
    console.error('获取最近活动失败:', error);
    res.status(500).json({ success: false, error: '获取活动记录失败' });
  }
});

// 获取系统状态
router.get('/system-status', authMiddleware, async (req: AuthRequest, res: any) => {
  try {
    // 检查数据库连接
    let databaseStatus: 'normal' | 'warning' | 'error' = 'normal';
    try {
      await QuestionBank.findOne().limit(1);
    } catch (error) {
      databaseStatus = 'error';
    }

    // 检查API状态（简化版本）
    const apiStatus: 'normal' | 'warning' | 'error' = 'normal';

    // 检查系统状态
    const systemStatus: 'normal' | 'warning' | 'error' = 
      databaseStatus === 'error' ? 'error' : 'normal';

    const status = {
      systemStatus,
      apiStatus,
      databaseStatus
    };

    res.json({
      success: true,
      status
    });
  } catch (error) {
    console.error('获取系统状态失败:', error);
    res.status(500).json({ 
      success: true, 
      status: {
        systemStatus: 'error' as const,
        apiStatus: 'error' as const,
        databaseStatus: 'error' as const
      }
    });
  }
});

// 获取用户统计
router.get('/user-stats', authMiddleware, async (req: AuthRequest, res: any) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const stats = {
      totalUsers: await User.countDocuments(),
      activeUsers: await User.countDocuments({ isActive: true }),
      newUsersThisMonth: await User.countDocuments({
        createdAt: { $gte: new Date(today.getFullYear(), today.getMonth(), 1) }
      })
    };

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('获取用户统计失败:', error);
    res.status(500).json({ success: false, error: '获取用户统计失败' });
  }
});

// 获取热门题目
router.get('/top-questions', authMiddleware, async (req: AuthRequest, res: any) => {
  try {
    const userId = req.user._id;
    const limit = parseInt(req.query.limit as string) || 5;

    // 获取用户可访问的题库中的热门题目（简化版本）
    const user = await User.findById(userId);
    if (!user) {
      return res.status(401).json({ success: false, error: '用户不存在' });
    }

    const topQuestions = await Question.aggregate([
      {
        $match: {
          bid: { $in: await QuestionBank.distinct('_id', {
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
          })}
        }
      },
      {
        $lookup: {
          from: 'questionbanks',
          localField: 'bid',
          foreignField: '_id',
          as: 'bank'
        }
      },
      {
        $unwind: '$bank'
      },
      {
        $project: {
          id: '$_id',
          title: { $substr: ['$content.stem', 0, 50] },
          views: { $ifNull: ['$views', 0] },
          favorites: { $size: { $ifNull: ['$favorites', []] } },
          bankName: '$bank.name'
        }
      },
      {
        $sort: { views: -1 }
      },
      {
        $limit: limit
      }
    ]);

    res.json({
      success: true,
      questions: topQuestions
    });
  } catch (error) {
    console.error('获取热门题目失败:', error);
    res.status(500).json({ success: false, error: '获取热门题目失败' });
  }
});

export default router; 