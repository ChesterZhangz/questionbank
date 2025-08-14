import express from 'express';
import { GameRecord, UserGameStats, IGameRecord, IUserGameStats } from '../models/Game';
import { User, IUser } from '../models/User';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = express.Router();

// 提交游戏记录
router.post('/record', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { gameType, score, difficulty, settings, gameData } = req.body;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ error: '用户未认证' });
    }

    // 验证游戏类型
    const validGameTypes = ['math', 'memory', 'puzzle', 'reaction'];
    if (!validGameTypes.includes(gameType)) {
      return res.status(400).json({ error: '无效的游戏类型' });
    }

    // 验证分数
    if (typeof score !== 'number' || score < 0) {
      return res.status(400).json({ error: '无效的分数' });
    }

    // 创建游戏记录
    const gameRecord = new GameRecord({
      userId,
      gameType,
      score,
      difficulty: difficulty || 'medium',
      settings,
      gameData
    });

    await gameRecord.save();

    // 更新或创建用户游戏统计
    let userStats = await UserGameStats.findOne({ userId });
    if (!userStats) {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: '用户不存在' });
      }

      userStats = new UserGameStats({
        userId,
        username: user.name, // 使用name字段而不是username
        totalGames: 0,
        totalScore: 0,
        averageScore: 0,
        bestScores: { math: 0, memory: 0, puzzle: 0, reaction: 0 },
        gameCounts: { math: 0, memory: 0, puzzle: 0, reaction: 0 },
        achievements: []
      });
    }

    // 检查每日游戏次数限制
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const lastGameDate = new Date(userStats.lastGameDate);
    lastGameDate.setHours(0, 0, 0, 0);

    // 如果是新的一天，重置计数器
    if (lastGameDate.getTime() !== today.getTime()) {
      userStats.dailyGameCount = 0;
      userStats.lastGameDate = new Date();
    }

    // 增加每日游戏次数
    userStats.dailyGameCount += 1;

    // 检查游戏限制
    if (userStats.dailyGameCount > 15) {
      // 禁用游戏功能24小时
      userStats.isGameDisabled = true;
      userStats.gameDisabledUntil = new Date(Date.now() + 24 * 60 * 60 * 1000);
    } else if (userStats.dailyGameCount > 5) {
      // 超过5次但未达到15次，保持启用状态，只显示警告
      userStats.isGameDisabled = false;
      userStats.gameDisabledUntil = undefined;
    } else {
      // 5次以下，正常状态
      userStats.isGameDisabled = false;
      userStats.gameDisabledUntil = undefined;
    }

    // 更新统计数据
    userStats.totalGames += 1;
    userStats.totalScore += score;
    userStats.averageScore = Math.round(userStats.totalScore / userStats.totalGames);
    userStats.gameCounts[gameType as keyof typeof userStats.gameCounts] += 1;
    userStats.lastPlayed = new Date();

    // 更新最佳分数
    if (score > userStats.bestScores[gameType as keyof typeof userStats.bestScores]) {
      userStats.bestScores[gameType as keyof typeof userStats.bestScores] = score;
    }

    // 检查成就
    const achievements = [];
    if (userStats.totalGames >= 10) achievements.push('游戏新手');
    if (userStats.totalGames >= 50) achievements.push('游戏达人');
    if (userStats.totalGames >= 100) achievements.push('游戏大师');
    if (userStats.totalScore >= 1000) achievements.push('分数收集者');
    if (userStats.totalScore >= 5000) achievements.push('高分玩家');
    if (userStats.totalScore >= 10000) achievements.push('分数王者');

    // 添加新成就
    achievements.forEach(achievement => {
      if (!userStats.achievements.includes(achievement)) {
        userStats.achievements.push(achievement);
      }
    });

    await userStats.save();

    return     res.json({
      success: true,
      message: '游戏记录保存成功',
      data: {
        gameRecord,
        userStats: {
          totalGames: userStats.totalGames,
          totalScore: userStats.totalScore,
          averageScore: userStats.averageScore,
          bestScores: userStats.bestScores,
          dailyGameCount: userStats.dailyGameCount,
          isGameDisabled: userStats.isGameDisabled,
          gameDisabledUntil: userStats.gameDisabledUntil,
          achievements: userStats.achievements
        }
      }
    });

  } catch (error) {
    console.error('保存游戏记录错误:', error);
    return res.status(500).json({ error: '保存游戏记录失败' });
  }
});

// 获取排行榜
router.get('/leaderboard/:gameType', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { gameType } = req.params;
    const { limit = 10, difficulty } = req.query;

    // 验证游戏类型
    const validGameTypes = ['math', 'memory', 'puzzle', 'reaction'];
    if (!validGameTypes.includes(gameType)) {
      return res.status(400).json({ error: '无效的游戏类型' });
    }

    // 构建查询条件
    const query: any = { gameType };
    if (difficulty && ['easy', 'medium', 'hard'].includes(difficulty as string)) {
      query.difficulty = difficulty;
    }

    // 从游戏记录中获取排行榜数据
    // 使用聚合管道获取每个用户的最高分数
    const leaderboard = await GameRecord.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$userId',
          maxScore: { $max: '$score' },
          gameType: { $first: '$gameType' },
          difficulty: { $first: '$difficulty' },
          settings: { $first: '$settings' },
          gameData: { $first: '$gameData' },
          createdAt: { $first: '$createdAt' }
        }
      },
      { $sort: { maxScore: -1, createdAt: -1 } },
      { $limit: Number(limit) },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $project: {
          _id: 0,
          userId: '$_id',
          username: '$user.name',
          avatar: '$user.avatar',
          score: '$maxScore',
          gameType: 1,
          difficulty: 1,
          settings: 1,
          gameData: 1,
          createdAt: 1
        }
      }
    ]);

    return res.json({
      success: true,
      data: leaderboard
    });

  } catch (error) {
    console.error('获取排行榜错误:', error);
    return res.status(500).json({ error: '获取排行榜失败' });
  }
});

// 获取用户游戏统计
router.get('/stats', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ error: '用户未认证' });
    }

    let userStats = await UserGameStats.findOne({ userId }).lean();
    if (!userStats) {
      // 如果用户没有统计记录，创建一个空的
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: '用户不存在' });
      }

      userStats = {
        userId: user._id,
        username: user.name,
        totalGames: 0,
        totalScore: 0,
        averageScore: 0,
        bestScores: { math: 0, memory: 0, puzzle: 0, reaction: 0 },
        gameCounts: { math: 0, memory: 0, puzzle: 0, reaction: 0 },
        achievements: [],
        lastPlayed: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      } as any;
    }

    // 获取最近的游戏记录
    const recentGames = await GameRecord.find({ userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    return res.json({
      success: true,
      data: {
        stats: userStats,
        recentGames
      }
    });

  } catch (error) {
    console.error('获取用户统计错误:', error);
    return res.status(500).json({ error: '获取用户统计失败' });
  }
});

// 获取用户在特定游戏中的排名
router.get('/rank/:gameType', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { gameType } = req.params;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ error: '用户未认证' });
    }

    // 验证游戏类型
    const validGameTypes = ['math', 'memory', 'puzzle', 'reaction'];
    if (!validGameTypes.includes(gameType)) {
      return res.status(400).json({ error: '无效的游戏类型' });
    }

    // 从游戏记录中计算用户排名
    const userBestScore = await GameRecord.findOne({ userId, gameType })
      .sort({ score: -1 })
      .lean();
    
    if (!userBestScore) {
      return res.json({
        success: true,
        data: {
          rank: null,
          score: 0,
          totalPlayers: 0
        }
      });
    }

    // 计算用户排名（有多少用户的最高分数比当前用户高）
    const betterPlayers = await GameRecord.aggregate([
      { $match: { gameType } },
      {
        $group: {
          _id: '$userId',
          maxScore: { $max: '$score' }
        }
      },
      { $match: { maxScore: { $gt: userBestScore.score } } },
      { $count: 'count' }
    ]);

    const rank = (betterPlayers[0]?.count || 0) + 1;

    // 获取总玩家数
    const totalPlayers = await GameRecord.distinct('userId', { gameType }).countDocuments();

    return res.json({
      success: true,
      data: {
        rank,
        score: userBestScore.score,
        totalPlayers
      }
    });

  } catch (error) {
    console.error('获取用户排名错误:', error);
    return res.status(500).json({ error: '获取用户排名失败' });
  }
});

// 获取游戏历史记录
router.get('/history', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?._id;
    const { gameType, page = 1, limit = 20 } = req.query;

    if (!userId) {
      return res.status(401).json({ error: '用户未认证' });
    }

    // 构建查询条件
    const query: any = { userId };
    if (gameType && ['math', 'memory', 'puzzle', 'reaction'].includes(gameType as string)) {
      query.gameType = gameType;
    }

    // 分页查询
    const skip = (Number(page) - 1) * Number(limit);
    const gameRecords = await GameRecord.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean();

    const total = await GameRecord.countDocuments(query);

    return res.json({
      success: true,
      data: {
        records: gameRecords,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });

  } catch (error) {
    console.error('获取游戏历史错误:', error);
    return res.status(500).json({ error: '获取游戏历史失败' });
  }
});

// 检查用户游戏状态
router.get('/status', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ error: '用户未认证' });
    }

    let userStats = await UserGameStats.findOne({ userId }).lean();
    if (!userStats) {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: '用户不存在' });
      }

      userStats = {
        userId: user._id,
        username: user.name,
        totalGames: 0,
        totalScore: 0,
        averageScore: 0,
        bestScores: { math: 0, memory: 0, puzzle: 0, reaction: 0 },
        gameCounts: { math: 0, memory: 0, puzzle: 0, reaction: 0 },
        dailyGameCount: 0,
        lastGameDate: new Date(),
        isGameDisabled: false,
        achievements: [],
        lastPlayed: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      } as any;
    }

    // 检查是否被禁用
    if (userStats && userStats.isGameDisabled && userStats.gameDisabledUntil) {
      const now = new Date();
      const disabledUntil = new Date(userStats.gameDisabledUntil);
      
      if (now < disabledUntil) {
        return res.json({
          success: true,
          data: {
            canPlay: false,
            reason: '游戏功能已被禁用',
            disabledUntil: userStats.gameDisabledUntil,
            dailyGameCount: userStats.dailyGameCount,
            message: '今日游戏次数过多，请明天再试'
          }
        });
      } else {
        // 禁用时间已过，重置状态
        await UserGameStats.updateOne(
          { userId },
          { 
            isGameDisabled: false,
            gameDisabledUntil: undefined,
            dailyGameCount: 0
          }
        );
        if (userStats) {
          userStats.isGameDisabled = false;
          userStats.gameDisabledUntil = undefined;
          userStats.dailyGameCount = 0;
        }
      }
    }

    // 检查每日游戏次数
    let warningMessage = null;
    if (userStats && userStats.dailyGameCount > 5 && userStats.dailyGameCount <= 15) {
      warningMessage = '今日游戏次数较多，请注意工作时间！';
    }

    return res.json({
      success: true,
      data: {
        canPlay: true,
        dailyGameCount: userStats?.dailyGameCount || 0,
        warningMessage,
        userStats: userStats ? {
          totalGames: userStats.totalGames,
          totalScore: userStats.totalScore,
          averageScore: userStats.averageScore,
          bestScores: userStats.bestScores,
          achievements: userStats.achievements
        } : null
      }
    });

  } catch (error) {
    console.error('检查游戏状态错误:', error);
    return res.status(500).json({ error: '检查游戏状态失败' });
  }
});

// 获取游戏统计概览
router.get('/overview', async (req, res) => {
  try {
    const { gameType } = req.query;

    // 构建查询条件
    const query: any = {};
    if (gameType && ['math', 'memory', 'puzzle', 'reaction'].includes(gameType as string)) {
      query.gameType = gameType;
    }

    // 获取统计数据
    const totalGames = await GameRecord.countDocuments(query);
    const totalPlayers = await GameRecord.distinct('userId', query).countDocuments();
    const averageScore = await GameRecord.aggregate([
      { $match: query },
      { $group: { _id: null, avgScore: { $avg: '$score' } } }
    ]);

    // 获取今日数据
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayQuery = { ...query, createdAt: { $gte: today } };
    const todayGames = await GameRecord.countDocuments(todayQuery);
    const todayPlayers = await GameRecord.distinct('userId', todayQuery).countDocuments();

    return res.json({
      success: true,
      data: {
        totalGames,
        totalPlayers,
        averageScore: averageScore[0]?.avgScore || 0,
        todayGames,
        todayPlayers
      }
    });

  } catch (error) {
    console.error('获取游戏概览错误:', error);
    return res.status(500).json({ error: '获取游戏概览失败' });
  }
});



export default router; 