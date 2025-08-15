import express, { Request, Response } from 'express';
import { body, validationResult, query } from 'express-validator';
import { Question } from '../models/Question';
import QuestionBank from '../models/QuestionBank';
import { AuthRequest } from '../middleware/auth';
import { SimilarityDetectionService } from '../services/similarityDetectionService';
import { User } from '../models/User';

const router = express.Router();
const similarityService = new SimilarityDetectionService();

// 获取所有题目（支持筛选和分页）
router.get('/', async (req: Request, res: Response): Promise<any> => {
  try {
    const { search, bankId, type, difficulty, tags, status, creator, dateRange, views, sortBy = 'createdAt', sortOrder = 'desc', page = 1, limit = 10 } = req.query;

    // 获取当前用户信息（从请求头获取token）
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ success: false, error: '访问被拒绝，没有提供令牌' });
    }

    // 验证token并获取用户信息
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ success: false, error: '用户不存在' });
    }

    // 检查用户是否属于某个企业
    if (!user.enterpriseId) {
      return res.status(403).json({ success: false, error: '仅限企业人员访问' });
    }

    // 构建查询条件
    const query: any = {};
    
    // 企业权限过滤：只显示用户企业相关的题目
    // 1. 用户创建的题目
    // 2. 用户企业题库中的题目
    // 3. 允许协作的公开题库中的题目（如果用户企业匹配）
    
    // 获取用户企业相关的题库ID列表
    const userBanks = await QuestionBank.find({
      $or: [
        { creator: user._id }, // 用户创建的题库
        { managers: user._id }, // 用户管理的题库
        { collaborators: user._id }, // 用户协作的题库
        { 
          emailSuffix: user.emailSuffix, // 用户企业邮箱后缀匹配的题库
          allowCollaboration: true, // 允许协作
          status: 'active' // 题库状态为活跃
        }
      ]
    });
    
    const userBankIds = userBanks.map((bank: any) => bank._id.toString());
    const userBankBids = userBanks.map((bank: any) => bank.bid);
    
    // 限制题目查询范围 - 使用$and确保所有条件都生效
    query.$and = [
      {
        $or: [
          { bid: { $in: userBankIds } }, // 题目属于用户相关题库
          { bid: { $in: userBankBids } }, // 题目属于用户相关题库（bid字段）
          { creator: user._id } // 用户创建的题目
        ]
      }
    ];
    
    // 增强搜索功能 - 支持题目编号、标签、难度等多种搜索方式
    if (search && typeof search === 'string') {
      const searchTerm = search.trim();
      
      // 如果搜索词是纯数字，可能是题目编号
      if (/^\d+$/.test(searchTerm)) {
        // 添加搜索条件到$and数组
        query.$and.push({
          $or: [
            { qid: { $regex: searchTerm, $options: 'i' } },
            { 'content.stem': { $regex: searchTerm, $options: 'i' } },
            { 'content.solution': { $regex: searchTerm, $options: 'i' } },
            { tags: { $in: [new RegExp(searchTerm, 'i')] } }
          ]
        });
      } else {
        // 普通文本搜索，支持更智能的匹配
        const searchRegex = new RegExp(searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
        
        // 添加搜索条件到$and数组
        const searchConditions: any[] = [
          { qid: searchRegex }, // 题目编号
          { 'content.stem': searchRegex }, // 题目内容
          { 'content.solution': searchRegex }, // 解答
          { tags: { $in: [searchRegex] } }, // 标签
          { type: searchRegex }, // 题型
          { difficulty: { $eq: parseInt(searchTerm) || 0 } } // 难度（如果是数字）
        ];
        
        query.$and.push({ $or: searchConditions });
        
        // 如果搜索词包含难度关键词，进行智能匹配
        const difficultyKeywords = {
          '简单': 1, '容易': 1, '基础': 1,
          '中等': 3, '普通': 3, '一般': 3,
          '困难': 5, '难': 5, '复杂': 5
        };
        
        for (const [keyword, level] of Object.entries(difficultyKeywords)) {
          if (searchTerm.includes(keyword)) {
            // 添加难度条件到搜索条件
            searchConditions.push({ difficulty: { $eq: level } });
            break;
          }
        }
        
        // 如果搜索词包含题型关键词，进行智能匹配
        const typeKeywords = {
          '选择': 'choice', '单选': 'choice',
          '多选': 'multiple-choice', '多选题': 'multiple-choice',
          '填空': 'fill', '填空题': 'fill',
          '解答': 'solution', '解答题': 'solution', '计算': 'solution'
        };
        
        for (const [keyword, type] of Object.entries(typeKeywords)) {
          if (searchTerm.includes(keyword)) {
            // 添加题型条件到搜索条件
            searchConditions.push({ type: type });
            break;
          }
        }
      }
    }
    
    if (bankId && bankId !== 'all') {
      // 支持数组和字符串格式的bankId
      if (Array.isArray(bankId)) {
        // 先查找题库，支持通过_id或bid查找
        // 同时确保题库属于用户企业或用户有权限访问
        const banks = await QuestionBank.find({
          $and: [
            {
              $or: [
                { _id: { $in: bankId } },
                { bid: { $in: bankId } }
              ]
            },
            // 确保题库属于用户企业或用户有权限访问
            {
              $or: [
                { creator: user._id },
                { managers: user._id },
                { collaborators: user._id },
                { 
                  emailSuffix: user.emailSuffix,
                  allowCollaboration: true,
                  status: 'active'
                }
              ]
            }
          ]
        });
        const bankIds = banks.map(b => (b as any)._id.toString());
        const bankBids = banks.map(b => (b as any).bid);
        
        // 题目可能存储的是题库的_id或bid，所以需要匹配两种情况
        // 使用$and确保企业权限过滤和题库ID筛选都生效
        query.$and = [
          // 保持原有的企业权限过滤
          {
            $or: [
              { bid: { $in: userBankIds } },
              { bid: { $in: userBankBids } },
              { creator: user._id }
            ]
          },
          // 添加题库ID筛选
          {
            $or: [
              { bid: { $in: bankIds } },
              { bid: { $in: bankBids } }
            ]
          }
        ];
        // 清除原有的$or，因为现在使用$and
        delete query.$or;
        

      } else {
        // 单个bankId的情况
        const bank = await QuestionBank.findOne({
          $and: [
            {
              $or: [
                { _id: bankId },
                { bid: bankId }
              ]
            },
            // 确保题库属于用户企业或用户有权限访问
            {
              $or: [
                { creator: user._id },
                { managers: user._id },
                { collaborators: user._id },
                { 
                  emailSuffix: user.emailSuffix,
                  allowCollaboration: true,
                  status: 'active'
                }
              ]
            }
          ]
        });
        
        if (bank) {
          // 使用$and确保企业权限过滤和题库ID筛选都生效
          query.$and = [
            // 保持原有的企业权限过滤
            {
              $or: [
                { bid: { $in: userBankIds } },
                { bid: { $in: userBankBids } },
                { creator: user._id }
              ]
            },
            // 添加题库ID筛选
            {
              $or: [
                { bid: (bank as any)._id.toString() },
                { bid: (bank as any).bid }
              ]
            }
          ];
          // 清除原有的$or，因为现在使用$and
          delete query.$or;
        }
      }
    }
    
    if (type && type !== 'all') {
      // 支持数组和字符串格式的type
      if (Array.isArray(type)) {
        query.type = { $in: type };
      } else {
        query.type = type;
      }

    }
    
    if (difficulty && difficulty !== 'all') {
      // 支持数组和数字格式的difficulty
      if (Array.isArray(difficulty)) {
        query.difficulty = { $in: difficulty.map(d => parseInt(d as string)) };
      } else {
        query.difficulty = parseInt(difficulty as string);
      }

    }
    
    if (tags && Array.isArray(tags)) {
      query.tags = { $in: tags };
    }
    
    if (status && status !== 'all') {
      query.status = status;
    }
    
    if (creator) {
      query.creator = creator;
    }
    
    // 时间范围筛选
    if (dateRange) {
      const { start, end } = dateRange as any;
      if (start || end) {
        query.createdAt = {};
        if (start) query.createdAt.$gte = new Date(start);
        if (end) query.createdAt.$lte = new Date(end);
      }
    }
    
    // 访问量范围筛选
    if (views) {
      const { min, max } = views as any;
      if (min || max) {
        query.views = {};
        if (min) query.views.$gte = parseInt(min);
        if (max) query.views.$lte = parseInt(max);
      }
    }



    // 构建排序
    const sort: any = {};
    sort[sortBy as string] = sortOrder === 'asc' ? 1 : -1;

    // 执行查询 - 优化版本
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const limitNum = parseInt(limit as string);
    
    // 只选择需要的字段，减少数据传输 - 包含所有必要字段
    const questionsQuery = Question.find(query)
      .select('qid type difficulty tags status views createdAt bid content source category updatedAt')
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .populate('creator', 'name email')
      .populate('questionBank', 'name');
    
    const [questions, total] = await Promise.all([
      questionsQuery,
      Question.countDocuments(query)
    ]);
    


    // 计算统计数据 - 优化版本（只在需要时计算）
    let statistics = [{ total: 0, byType: [], byDifficulty: [], byBank: [], byStatus: [] }];
    
    // 只在第一页或需要统计数据时计算
    if (parseInt(page as string) === 1 || req.query.includeStats === 'true') {
      statistics = await Question.aggregate([
        { $match: query },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            byType: { $push: '$type' },
            byDifficulty: { $push: '$difficulty' },
            byBank: { $push: '$bid' },
            byStatus: { $push: '$status' }
          }
        }
      ]);
    }

    // 获取可用的筛选选项 - 优化版本（缓存和减少查询）
    let availableTags: string[] = [];
    let availableBanks: any[] = [];
    let difficultyRange: any[] = [];
    
    // 只在第一页时获取筛选选项，避免重复查询
    if (parseInt(page as string) === 1) {
      [availableTags, availableBanks, difficultyRange] = await Promise.all([
        Question.distinct('tags'),
        // 只获取用户企业相关的题库作为筛选选项
        QuestionBank.find({
          $or: [
            { creator: user._id },
            { managers: user._id },
            { collaborators: user._id },
            { 
              emailSuffix: user.emailSuffix,
              allowCollaboration: true,
              status: 'active'
            }
          ]
        }, 'bid name'),
        Question.aggregate([
          { $match: query },
          {
            $group: {
              _id: null,
              min: { $min: '$difficulty' },
              max: { $max: '$difficulty' }
            }
          }
        ])
      ]);
    }

    // 处理统计数据
    const stats = statistics[0] || { total: 0, byType: [], byDifficulty: [], byBank: [], byStatus: [] };
    
    const byType = stats.byType.reduce((acc: any, type: string) => {
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});
    
    const byDifficulty = stats.byDifficulty.reduce((acc: any, diff: number) => {
      acc[diff] = (acc[diff] || 0) + 1;
      return acc;
    }, {});
    
    const byBank = stats.byBank.reduce((acc: any, bankId: string) => {
      acc[bankId] = (acc[bankId] || 0) + 1;
      return acc;
    }, {});
    
    const byStatus = stats.byStatus.reduce((acc: any, status: string) => {
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    res.json({
      success: true,
      data: {
        questions,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total,
          totalPages: Math.ceil(total / parseInt(limit as string))
        },
        statistics: {
          total: stats.total,
          byType,
          byDifficulty,
          byBank,
          byStatus
        },
        filters: {
          availableTags,
          availableBanks: availableBanks.map(bank => ({ id: bank.bid, name: bank.name })),
          difficultyRange: difficultyRange[0] || { min: 1, max: 5 }
        }
      }
    });
  } catch (error) {
    console.error('获取题目列表失败:', error);
    res.status(500).json({
      success: false,
      error: '获取题目列表失败'
    });
  }
});

// 批量操作API
router.post('/batch', async (req: Request, res: Response): Promise<void> => {
  try {
    const { operation, questionIds, targetBankId, updates, exportFormat } = req.body;

    if (!questionIds || !Array.isArray(questionIds) || questionIds.length === 0) {
      res.status(400).json({
        success: false,
        error: '请选择要操作的题目'
      });
      return;
    }

    let processed = 0;
    let success = 0;
    let failed = 0;
    const errors: Array<{ questionId: string; error: string }> = [];

    switch (operation) {
      case 'delete':
        // 批量删除
        for (const questionId of questionIds) {
          try {
            await Question.findByIdAndDelete(questionId);
            success++;
          } catch (error) {
            failed++;
            errors.push({
              questionId,
              error: '删除失败'
            });
          }
          processed++;
        }
        break;

      case 'move':
        // 批量移动
        if (!targetBankId) {
          res.status(400).json({
            success: false,
            error: '请指定目标题库'
          });
          return;
        }

        for (const questionId of questionIds) {
          try {
            await Question.findByIdAndUpdate(questionId, {
              bid: targetBankId,
              updatedAt: new Date()
            });
            success++;
          } catch (error) {
            failed++;
            errors.push({
              questionId,
              error: '移动失败'
            });
          }
          processed++;
        }
        break;

      case 'update':
        // 批量更新
        if (!updates) {
          res.status(400).json({
            success: false,
            error: '请指定更新内容'
          });
          return;
        }

        for (const questionId of questionIds) {
          try {
            await Question.findByIdAndUpdate(questionId, {
              ...updates,
              updatedAt: new Date()
            });
            success++;
          } catch (error) {
            failed++;
            errors.push({
              questionId,
              error: '更新失败'
            });
          }
          processed++;
        }
        break;

      case 'export':
        // 批量导出
        const questions = await Question.find({ _id: { $in: questionIds } })
          .populate('creator', 'name email')
          .populate('questionBank', 'name');

        // 这里可以添加导出逻辑，生成Excel、PDF或LaTeX文件
        // 暂时返回成功状态
        success = questions.length;
        processed = questions.length;
        break;

      default:
        res.status(400).json({
          success: false,
          error: '不支持的操作类型'
        });
        return;
    }

    res.json({
      success: true,
      data: {
        processed,
        success,
        failed,
        errors: errors.length > 0 ? errors : undefined
      }
    });
  } catch (error) {
    console.error('批量操作失败:', error);
    res.status(500).json({
      success: false,
      error: '批量操作失败'
    });
  }
});

// 获取题目统计数据
router.get('/statistics', async (req: Request, res: Response) => {
  try {
    const { timeRange = 'all', bankId, groupBy = 'type' } = req.query;

    // 构建时间范围条件
    let dateFilter = {};
    if (timeRange !== 'all') {
      const now = new Date();
      let startDate = new Date();
      
      switch (timeRange) {
        case 'day':
          startDate.setDate(now.getDate() - 1);
          break;
        case 'week':
          startDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(now.getMonth() - 1);
          break;
        case 'year':
          startDate.setFullYear(now.getFullYear() - 1);
          break;
      }
      
      dateFilter = { createdAt: { $gte: startDate } };
    }

    // 构建查询条件
    const matchCondition: any = { ...dateFilter };
    if (bankId && bankId !== 'all') {
      matchCondition.bid = bankId;
    }

    // 获取概览统计
    const overview = await Question.aggregate([
      { $match: matchCondition },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          published: { $sum: { $cond: [{ $eq: ['$status', 'published'] }, 1, 0] } },
          draft: { $sum: { $cond: [{ $eq: ['$status', 'draft'] }, 1, 0] } },
          archived: { $sum: { $cond: [{ $eq: ['$status', 'archived'] }, 1, 0] } }
        }
      }
    ]);

    // 获取趋势数据
    const trends = await Question.aggregate([
      { $match: matchCondition },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          created: { $sum: 1 },
          updated: { $sum: { $cond: [{ $ne: ['$createdAt', '$updatedAt'] }, 1, 0] } },
          used: { $sum: '$views' }
        }
      },
      { $sort: { _id: 1 } },
      { $limit: 30 }
    ]);

    // 获取分布数据
    const distribution = await Question.aggregate([
      { $match: matchCondition },
      {
        $group: {
          _id: `$${groupBy}`,
          count: { $sum: 1 }
        }
      }
    ]);

    // 获取热门题目
    const topQuestions = await Question.find(matchCondition)
      .sort({ views: -1 })
      .limit(10)
      .select('_id content.stem views')
      .populate('creator', 'name');

    res.json({
      success: true,
      data: {
        overview: overview[0] || { total: 0, published: 0, draft: 0, archived: 0 },
        trends: trends.map(t => ({
          date: t._id,
          created: t.created,
          updated: t.updated,
          used: t.used
        })),
        distribution: distribution.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        topQuestions: topQuestions.map(q => ({
          questionId: q._id,
          title: q.content.stem.substring(0, 50) + '...',
          usageCount: q.views,
          rating: 4.5 // 暂时使用固定评分
        }))
      }
    });
  } catch (error) {
    console.error('获取统计数据失败:', error);
    res.status(500).json({
      success: false,
      error: '获取统计数据失败'
    });
  }
});

// 获取题库内的题目列表
router.get('/bank/:bid', [
  query('page').optional().isInt({ min: 1 }).withMessage('页码必须是正整数'),
  query('limit').optional().isInt({ min: 1, max: 1000 }).withMessage('每页数量必须在1-1000之间'),
  query('type').optional().isIn(['choice', 'multiple-choice', 'fill', 'solution']).withMessage('题目类型无效'),
  query('difficulty').optional().isInt({ min: 1, max: 5 }).withMessage('难度必须在1-5之间'),
  query('category').optional().isString().withMessage('分类必须是字符串'),
  query('search').optional().isString().withMessage('搜索关键词必须是字符串')
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { bid } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    // 构建查询条件
    const query: any = { bid, status: { $ne: 'deleted' } };

    if (req.query.type) query.type = req.query.type;
    if (req.query.difficulty) query.difficulty = parseInt(req.query.difficulty as string);
    if (req.query.category) query.category = req.query.category;

    // 文本搜索
    if (req.query.search) {
      query.$text = { $search: req.query.search as string };
    }

    const questions = await Question.find(query)
      .populate('creator', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Question.countDocuments(query);

    return res.json({
      success: true,
      questions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('获取题目列表失败:', error);
    return res.status(500).json({ success: false, error: '获取题目列表失败' });
  }
});

// 获取单个题目详情
router.get('/:qid', async (req: AuthRequest, res: Response) => {
  try {
    const { qid } = req.params;
    const userId = req.user!._id;

    const question = await Question.findOne({ qid })
      .populate('creator', 'name email')
      .populate('questionBank', 'name bid');

    if (!question) {
      return res.status(404).json({ success: false, error: '题目不存在' });
    }

    // 检查用户是否有权限查看此题目
    const questionBank = await QuestionBank.findOne({ bid: question.bid });
    if (!questionBank) {
      return res.status(404).json({ success: false, error: '题库不存在' });
    }

    // 检查权限
    const creatorId = questionBank.creator.toString();
    const isManager = questionBank.managers.some((m: any) => m.toString() === userId.toString());
    const isCollaborator = questionBank.collaborators.some((c: any) => c.toString() === userId.toString());

    if (creatorId !== userId.toString() && !isManager && !isCollaborator) {
      return res.status(403).json({ success: false, error: '权限不足' });
    }

    // 增加浏览量
    question.views = (question.views || 0) + 1;
    await question.save();

    return res.json({
      success: true,
      question
    });
  } catch (error) {
    console.error('获取题目详情失败:', error);
    return res.status(500).json({ success: false, error: '获取题目详情失败' });
  }
});

// 更新题目
router.put('/:qid', [
  body('type').optional().isIn(['choice', 'multiple-choice', 'fill', 'solution']).withMessage('题目类型无效'),
  body('content.stem').optional().notEmpty().withMessage('题目内容不能为空'),
  body('content.answer').optional().isString().withMessage('答案必须是字符串'),
  body('difficulty').optional().isInt({ min: 1, max: 5 }).withMessage('难度必须在1-5之间'),
  body('category').optional().isString().withMessage('小题型必须是字符串'),
  body('tags').optional().isArray().withMessage('知识点标签必须是数组'),
  body('source').optional().isString().withMessage('题目出处必须是字符串'),
  body('status').optional().isIn(['draft', 'published', 'archived']).withMessage('状态无效')
], async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, error: '输入验证失败', details: errors.array() });
    }

    const { qid } = req.params;
    const userId = req.user!._id;
    const updateData = req.body;

    const question = await Question.findOne({ qid });
    if (!question) {
      return res.status(404).json({ success: false, error: '题目不存在' });
    }

    // 检查用户是否有权限编辑此题目
    const questionBank = await QuestionBank.findOne({ bid: question.bid });
    if (!questionBank) {
      return res.status(404).json({ success: false, error: '题库不存在' });
    }

    // 检查权限
    const creatorId = questionBank.creator.toString();
    const isManager = questionBank.managers.some((m: any) => m.toString() === userId.toString());
    const isCollaborator = questionBank.collaborators.some((c: any) => c.toString() === userId.toString());

    if (creatorId !== userId.toString() && !isManager && !isCollaborator) {
      return res.status(403).json({ success: false, error: '权限不足' });
    }

    // 更新题目
    const updatedQuestion = await Question.findOneAndUpdate(
      { qid },
      { 
        ...updateData,
        updatedAt: new Date()
      },
      { new: true }
    ).populate('creator', 'name email');

    return res.json({
      success: true,
      question: updatedQuestion,
      message: '题目更新成功'
    });
  } catch (error) {
    console.error('更新题目失败:', error);
    return res.status(500).json({ success: false, error: '更新题目失败' });
  }
});

// 在题库内创建题目
router.post('/bank/:bid', [
  body('type').isIn(['choice', 'multiple-choice', 'fill', 'solution']).withMessage('题目类型无效'),
  body('content.stem').notEmpty().withMessage('题目内容是必需的'),
  body('content.answer').optional().isString().withMessage('答案必须是字符串'),
  body('difficulty').isInt({ min: 1, max: 5 }).withMessage('难度必须在1-5之间'),
  body('category').optional().isString().withMessage('小题型必须是字符串'),
  body('tags').optional().isArray().withMessage('知识点标签必须是数组'),
  body('source').optional().isString().withMessage('题目出处必须是字符串')
], async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, error: '输入验证失败', details: errors.array() });
    }

    const { bid } = req.params;
    const { type, content, category, tags, difficulty, source } = req.body;

    // 检查题库是否存在
    const questionBank = await QuestionBank.findOne({ bid, status: 'active' });
    if (!questionBank) {
      return res.status(404).json({ success: false, error: '题库不存在' });
    }

    // 检查用户权限
    const userId = req.user!._id.toString();
    const creatorId = questionBank.creator.toString();
    const isManager = questionBank.managers.some((m: any) => {
      const managerId = typeof m === 'object' && m._id 
        ? m._id.toString() 
        : m.toString();
      return managerId === userId;
    });
    const isCollaborator = questionBank.collaborators.some((c: any) => {
      const collaboratorId = typeof c === 'object' && c._id 
        ? c._id.toString() 
        : c.toString();
      return collaboratorId === userId;
    });

    if (creatorId !== userId && !isManager && !isCollaborator) {
      return res.status(403).json({ success: false, error: '权限不足' });
    }

    // 生成题目ID
    const timestamp = Date.now().toString().slice(-8); // 取最后8位数字
    
    // 生成3个大写字母（只使用A-Z）
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let randomStr = '';
    for (let i = 0; i < 3; i++) {
      randomStr += letters.charAt(Math.floor(Math.random() * letters.length));
    }
    
    // 生成4个大写字母或数字
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let randomEnd = '';
    for (let i = 0; i < 4; i++) {
      randomEnd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    const qid = `MT-${randomStr}-${timestamp}-${randomEnd}`;



    const question = new Question({
      qid,
      bid,
      questionBank: questionBank._id,
      type,
      content,
      category,
      tags,
      difficulty,
      source,
      creator: req.user!._id,
      status: 'published'
    });

    await question.save();

    // 更新题库的题目数量和最后更新时间
    questionBank.questionCount += 1;
    questionBank.lastUpdated = new Date();
    await questionBank.save();

    return res.status(201).json({
      success: true,
      question
    });
  } catch (error) {
    console.error('创建题目失败:', error);
    return res.status(500).json({ success: false, error: '创建题目失败' });
  }
});

// 获取单个题目
router.get('/questions/:id', async (req: Request, res: Response) => {
  try {
    const question = await Question.findById(req.params.id)
      .populate('creator', 'name email');

    if (!question) {
      return res.status(404).json({ error: '题目不存在' });
    }

    return res.json({
      success: true,
      data: question
    });
  } catch (error) {
    return res.status(500).json({ error: '获取题目失败' });
  }
});

// 更新题目
router.put('/questions/:id', [
  body('content.stem').optional().notEmpty().withMessage('题目内容不能为空'),
  body('difficulty').optional().isInt({ min: 1, max: 5 }).withMessage('难度必须在1-5之间')
], async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({ error: '题目不存在' });
    }

    // 检查权限
    if (question.creator.toString() !== req.user!._id.toString()) {
      return res.status(403).json({ error: '无权限修改此题目' });
    }

    const updatedQuestion = await Question.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('creator', 'name email');

    return res.json({
      success: true,
      data: updatedQuestion
    });
  } catch (error) {
    return res.status(500).json({ error: '更新题目失败' });
  }
});

// 删除题目
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({ error: '题目不存在' });
    }

    // 检查权限 - 允许题目创建者、题库创建者、管理者和协作者删除
    const isCreator = question.creator.toString() === req.user!._id.toString();
    const isAdmin = req.user!.role === 'admin' || req.user!.role === 'superadmin';
    
    // 检查题库权限
    const questionBank = await QuestionBank.findOne({ bid: question.bid });
    if (!questionBank) {
      return res.status(404).json({ error: '题库不存在' });
    }
    
    const bankCreatorId = questionBank.creator.toString();
    const isBankCreator = bankCreatorId === req.user!._id.toString();
    const isManager = questionBank.managers.some((m: any) => m.toString() === req.user!._id.toString());
    const isCollaborator = questionBank.collaborators.some((c: any) => c.toString() === req.user!._id.toString());
    
    if (!isCreator && !isAdmin && !isBankCreator && !isManager && !isCollaborator) {
      return res.status(403).json({ error: '无权限删除此题目' });
    }

    await Question.findByIdAndDelete(req.params.id);

    return res.json({
      success: true,
      message: '题目删除成功'
    });
  } catch (error) {
    console.error('删除题目失败:', error);
    return res.status(500).json({ error: '删除题目失败' });
  }
});

// 增加题目浏览量
router.post('/:qid/view', async (req: AuthRequest, res: Response) => {
  try {
    const { qid } = req.params;
    const userId = req.user!._id;

    const question = await Question.findOne({ qid });
    if (!question) {
      return res.status(404).json({ success: false, error: '题目不存在' });
    }

    // 增加浏览量
    question.views = (question.views || 0) + 1;
    await question.save();

    return res.json({ 
      success: true, 
      views: question.views,
      message: '浏览量更新成功' 
    });
  } catch (error) {
    console.error('更新浏览量失败:', error);
    return res.status(500).json({ success: false, error: '更新浏览量失败' });
  }
});

// 收藏/取消收藏题目
router.post('/:qid/favorite', async (req: AuthRequest, res: Response) => {
  try {
    const { qid } = req.params;
    const userId = req.user!._id;

    const question = await Question.findOne({ qid });
    if (!question) {
      return res.status(404).json({ success: false, error: '题目不存在' });
    }

    // 检查是否已收藏
    const isFavorited = question.favorites && question.favorites.includes(userId);
    
    if (isFavorited && question.favorites) {
      // 取消收藏
      question.favorites = question.favorites.filter((id: any) => id.toString() !== userId.toString());
    } else {
      // 添加收藏
      if (!question.favorites) {
        question.favorites = [];
      }
      question.favorites.push(userId);
    }

    await question.save();

    return res.json({ 
      success: true, 
      isFavorited: !isFavorited,
      favoritesCount: question.favorites.length,
      message: isFavorited ? '取消收藏成功' : '收藏成功' 
    });
  } catch (error) {
    console.error('收藏操作失败:', error);
    return res.status(500).json({ success: false, error: '收藏操作失败' });
  }
});

// 获取用户收藏的题目列表
router.get('/favorites', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!._id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const questions = await Question.find({
      favorites: userId,
      status: { $ne: 'deleted' }
    })
    .populate('creator', 'name email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

    const total = await Question.countDocuments({
      favorites: userId,
      status: { $ne: 'deleted' }
    });

    return res.json({
      success: true,
      questions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('获取收藏题目失败:', error);
    return res.status(500).json({ success: false, error: '获取收藏题目失败' });
  }
});

// 获取相关题目
router.get('/:qid/related', async (req: AuthRequest, res: Response) => {
  try {
    const { qid } = req.params;
    const limit = parseInt(req.query.limit as string) || 3;
    const excludeCurrent = req.query.excludeCurrent === 'true';

    const currentQuestion = await Question.findOne({ qid });
    if (!currentQuestion) {
      return res.status(404).json({ success: false, error: '题目不存在' });
    }

    // 计算题目关联度的函数 - 优化版：确保标签一致性为前提
    const calculateRelevanceScore = (question: any, currentQ: any): number => {
      // 前置条件：必须有共同的核心标签
      if (!hasRequiredTagMatch(currentQ.tags, question.tags)) {
        return 0; // 没有核心标签匹配，直接返回0
      }

      let score = 0;
      let totalWeight = 0;

      // 1. 强化标签匹配（权重40% - 提升权重）
      if (currentQ.tags && currentQ.tags.length > 0 && question.tags && question.tags.length > 0) {
        const tagScore = calculateAdvancedTagSimilarity(currentQ.tags, question.tags);
        score += tagScore * 0.4;
        totalWeight += 0.4;
      }

      // 2. 数学内容相似度（权重35% - 降低权重）
      if (currentQ.content?.stem && question.content?.stem) {
        const stem1 = currentQ.content.stem;
        const stem2 = question.content.stem;
        
        const mathSimilarityScore = calculateMathContentSimilarity(stem1, stem2);
        score += mathSimilarityScore * 0.35;
        totalWeight += 0.35;
      }

      // 3. 分类匹配（权重15%）
      if (currentQ.category && question.category && currentQ.category === question.category) {
        score += 0.15;
        totalWeight += 0.15;
      }

      // 4. 难度接近度（权重8%）
      const difficultyDiff = Math.abs(currentQ.difficulty - question.difficulty);
      const difficultyScore = Math.max(0, 1 - difficultyDiff / 5);
      score += difficultyScore * 0.08;
      totalWeight += 0.08;

      // 5. 题目类型匹配（权重2%）
      if (currentQ.type === question.type) {
        score += 0.02;
        totalWeight += 0.02;
      }

      // 返回标准化分数
      return totalWeight > 0 ? score / totalWeight : 0;
    };

    // 检查是否有必需的标签匹配
    const hasRequiredTagMatch = (tags1: string[], tags2: string[]): boolean => {
      if (!tags1 || !tags2 || tags1.length === 0 || tags2.length === 0) {
        return false; // 如果任一题目没有标签，则不匹配
      }

      // 定义核心数学概念关键词
      const coreKeywords = [
        '函数', '几何', '代数', '三角', '概率', '统计', '导数', '积分', '极限',
        '方程', '不等式', '图形', '面积', '周长', '体积', '角度', '直线', '圆',
        '多项式', '因式', '根式', '指数', '对数', '复数', '向量', '矩阵',
        '排列', '组合', '分布', '期望', '方差', '证明', '推理'
      ];

      // 检查是否有共同的核心关键词
      for (const tag1 of tags1) {
        for (const tag2 of tags2) {
          // 检查是否包含相同的核心关键词
          for (const keyword of coreKeywords) {
            if (tag1.includes(keyword) && tag2.includes(keyword)) {
              return true;
            }
          }
          // 或者标签完全相同
          if (tag1 === tag2) {
            return true;
          }
        }
      }

      return false;
    };

    // 高级标签相似度计算
    const calculateAdvancedTagSimilarity = (tags1: string[], tags2: string[]): number => {
      // 完全匹配的标签
      const exactMatches = tags1.filter(tag1 => tags2.includes(tag1));
      
      // 语义相似的标签（包含相同关键词）
      let semanticMatches = 0;
      const coreKeywords = [
        '函数', '几何', '代数', '三角', '概率', '统计', '导数', '积分', '极限',
        '方程', '不等式', '图形', '面积', '周长', '体积', '角度', '直线', '圆',
        '多项式', '因式', '根式', '指数', '对数', '复数', '向量', '矩阵'
      ];

      for (const tag1 of tags1) {
        for (const tag2 of tags2) {
          if (tag1 !== tag2) { // 不是完全匹配的情况下
            for (const keyword of coreKeywords) {
              if (tag1.includes(keyword) && tag2.includes(keyword)) {
                semanticMatches++;
                break; // 避免重复计算同一对标签
              }
            }
          }
        }
      }

      // 计算综合相似度
      const totalTags = Math.max(tags1.length, tags2.length);
      const exactScore = exactMatches.length / totalTags;
      const semanticScore = (semanticMatches * 0.7) / totalTags; // 语义匹配权重稍低

      return Math.min(1.0, exactScore + semanticScore);
    };

    // 数学内容相似度计算函数 - 多维度特征提取版
    const calculateMathContentSimilarity = (text1: string, text2: string): number => {
      // 预处理文本
      const clean1 = preprocessText(text1);
      const clean2 = preprocessText(text2);
      
      // 提取多维特征
      const features1 = extractFeatures(clean1);
      const features2 = extractFeatures(clean2);
      
      // 计算各维度相似度
      const similarities = {
        text: calculateTextSimilarity(clean1, clean2),
        structure: calculateStructureSimilarity(features1.structure, features2.structure),
        mathEntities: calculateSetSimilarity(features1.mathEntities, features2.mathEntities),
        operations: calculateOperationsSimilarity(features1.operations, features2.operations),
        numbers: calculateNumbersSimilarity(features1.numbers, features2.numbers),
        formulas: calculateFormulaSimilarity(text1, text2)
      };
      
      // 权重配置
      const weights = {
        text: 0.25,
        structure: 0.20,
        mathEntities: 0.15,
        operations: 0.15,
        numbers: 0.10,
        formulas: 0.15
      };
      
      // 加权综合相似度
      let totalSimilarity = 0;
      let totalWeight = 0;
      
      Object.entries(weights).forEach(([dimension, weight]) => {
        totalSimilarity += similarities[dimension as keyof typeof similarities] * weight;
        totalWeight += weight;
      });
      
      return totalWeight > 0 ? totalSimilarity / totalWeight : 0;
    };

    // LaTeX公式相似度计算
    const calculateFormulaSimilarity = (text1: string, text2: string): number => {
      // 提取$...$中的LaTeX内容
      const formulaRegex = /\$([^$]+)\$/g;
      const formulas1: string[] = [];
      const formulas2: string[] = [];
      
      let match;
      while ((match = formulaRegex.exec(text1)) !== null) {
        formulas1.push(match[1].trim());
      }
      while ((match = formulaRegex.exec(text2)) !== null) {
        formulas2.push(match[1].trim());
      }
      
      // 如果没有公式，返回中等分数
      if (formulas1.length === 0 && formulas2.length === 0) return 0.5;
      if (formulas1.length === 0 || formulas2.length === 0) return 0.2;
      
      // 计算公式相似度
      let commonFormulas = 0;
      formulas1.forEach(formula1 => {
        formulas2.forEach(formula2 => {
          if (isFormulaSimilar(formula1, formula2)) {
            commonFormulas++;
          }
        });
      });
      
      return commonFormulas / Math.max(formulas1.length, formulas2.length);
    };

    // 判断两个LaTeX公式是否相似
    const isFormulaSimilar = (formula1: string, formula2: string): boolean => {
      // 标准化公式（移除空格、统一符号）
      const clean1 = formula1.replace(/\s+/g, '')
        .replace(/\\text\{([^}]+)\}/g, '$1')  // 移除\text{}
        .replace(/\\mathrm\{([^}]+)\}/g, '$1') // 移除\mathrm{}
        .toLowerCase();
      const clean2 = formula2.replace(/\s+/g, '')
        .replace(/\\text\{([^}]+)\}/g, '$1')
        .replace(/\\mathrm\{([^}]+)\}/g, '$1')
        .toLowerCase();
      
      // 如果完全相同，返回true
      if (clean1 === clean2) return true;
      
      // 计算编辑距离
      const distance = calculateEditDistance(clean1, clean2);
      const maxLength = Math.max(clean1.length, clean2.length);
      
      // 如果编辑距离小于等于最大长度的25%，认为相似
      return distance / maxLength <= 0.25;
    };

    // 计算编辑距离（Levenshtein距离）
    const calculateEditDistance = (str1: string, str2: string): number => {
      const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
      
      for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
      for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
      
      for (let j = 1; j <= str2.length; j++) {
        for (let i = 1; i <= str1.length; i++) {
          const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
          matrix[j][i] = Math.min(
            matrix[j][i - 1] + 1,      // 删除
            matrix[j - 1][i] + 1,      // 插入
            matrix[j - 1][i - 1] + indicator // 替换
          );
        }
      }
      
      return matrix[str2.length][str1.length];
    };

    // 文本内容相似度计算（改进版）
    const calculateTextSimilarity = (text1: string, text2: string): number => {
      if (text1 === text2) return 1.0;
      if (text1.length === 0 || text2.length === 0) return 0.0;
      
      // 计算词汇重叠度
      const words1 = text1.split(/\s+/).filter((word: string) => word.length > 0);
      const words2 = text2.split(/\s+/).filter((word: string) => word.length > 0);
      
      if (words1.length === 0 || words2.length === 0) return 0.0;
      
      const commonWords = words1.filter((word: string) => words2.includes(word));
      const jaccardSimilarity = commonWords.length / (words1.length + words2.length - commonWords.length);
      
      return jaccardSimilarity;
    };

    // 文本预处理
    const preprocessText = (text: string): string => {
      return text
        .replace(/\s+/g, ' ')  // 统一空格
        .replace(/[^\w\s$+\-*/^=()。，！？；]/g, ' ')  // 保留关键字符
        .trim();
    };

    // 特征提取
    const extractFeatures = (text: string) => {
      const features = {
        structure: detectStructure(text),
        mathEntities: extractMathEntities(text),
        operations: extractOperations(text),
        numbers: extractNumbers(text)
      };
      return features;
    };

    // 检测题目结构模式
    const detectStructure = (text: string): string[] => {
      const patterns = [
        { name: 'equation', pattern: /[=]/g },
        { name: 'solve_for', pattern: /(求|解|计算|证明|判断|确定)/g },
        { name: 'derivative', pattern: /(导[数函]|微分)/g },
        { name: 'integral', pattern: /(积[分]|定积分|不定积分)/g },
        { name: 'limit', pattern: /(极限|趋近)/g },
        { name: 'word_problem', pattern: /(多少|比|率|面积|体积|周长|长度|角度)/g },
        { name: 'function', pattern: /(函数|f\(|g\(|h\()/g },
        { name: 'inequality', pattern: /(不等式|大于|小于|大于等于|小于等于)/g }
      ];
      
      const detected: string[] = [];
      patterns.forEach(({ name, pattern }) => {
        if (pattern.test(text)) {
          detected.push(name);
        }
      });
      
      return detected;
    };

    // 提取数学实体（变量、函数等）
    const extractMathEntities = (text: string): Set<string> => {
      const entities = new Set<string>();
      
      // 提取变量（单字母或双字母）
      const variables = text.match(/\b[a-zA-Z]{1,2}\b/g) || [];
      variables.forEach(v => entities.add(v.toLowerCase()));
      
      // 提取函数名
      const functions = text.match(/\b[a-zA-Z]\(/g) || [];
      functions.forEach(f => entities.add(f.slice(0, -1).toLowerCase()));
      
      return entities;
    };

    // 提取数学运算
    const extractOperations = (text: string): string[] => {
      const operations = text.match(/[\+\-\*/^=]/g) || [];
      return operations.map(op => {
        const mapping: { [key: string]: string } = {
          '+': 'add', '-': 'sub', '*': 'mul', '/': 'div', '^': 'pow', '=': 'eq'
        };
        return mapping[op] || op;
      });
    };

    // 提取数字特征
    const extractNumbers = (text: string) => {
      const numbers = text.match(/\d+\.?\d*/g) || [];
      return {
        count: numbers.length,
        types: classifyNumbers(numbers)
      };
    };

    // 分类数字类型
    const classifyNumbers = (numbers: string[]): Set<string> => {
      const types = new Set<string>();
      numbers.forEach(num => {
        if (num.includes('.')) {
          types.add('float');
        } else {
          const intNum = parseInt(num);
          if (intNum > 100) {
            types.add('large_int');
          } else {
            types.add('small_int');
          }
        }
      });
      return types;
    };

    // 结构相似度计算
    const calculateStructureSimilarity = (struct1: string[], struct2: string[]): number => {
      const set1 = new Set(struct1);
      const set2 = new Set(struct2);
      
      if (set1.size === 0 && set2.size === 0) return 1.0;
      if (set1.size === 0 || set2.size === 0) return 0.0;
      
      const intersection = new Set([...set1].filter(x => set2.has(x)));
      const union = new Set([...set1, ...set2]);
      
      return intersection.size / union.size;
    };

    // 集合相似度计算（Jaccard相似度）
    const calculateSetSimilarity = (set1: Set<string>, set2: Set<string>): number => {
      if (set1.size === 0 && set2.size === 0) return 1.0;
      if (set1.size === 0 || set2.size === 0) return 0.0;
      
      const intersection = new Set([...set1].filter(x => set2.has(x)));
      const union = new Set([...set1, ...set2]);
      
      return intersection.size / union.size;
    };

    // 运算相似度计算
    const calculateOperationsSimilarity = (ops1: string[], ops2: string[]): number => {
      if (ops1.length === 0 && ops2.length === 0) return 1.0;
      if (ops1.length === 0 || ops2.length === 0) return 0.0;
      
      const maxLen = Math.max(ops1.length, ops2.length);
      const distance = calculateEditDistance(ops1.join(''), ops2.join(''));
      
      return Math.max(0, 1 - distance / maxLen);
    };

    // 数字特征相似度计算
    const calculateNumbersSimilarity = (num1: any, num2: any): number => {
      const countSim = 1 - Math.abs(num1.count - num2.count) / (1 + Math.max(num1.count, num2.count));
      const typeSim = calculateSetSimilarity(num1.types, num2.types);
      
      return 0.7 * typeSim + 0.3 * countSim;
    };

    // 获取候选题目 - 优化版：基于标签智能筛选
    let candidateQuery: any = {
      _id: { $ne: currentQuestion._id },
      status: { $ne: 'deleted' }
    };

    // 如果当前题目有标签，使用标签进行预筛选
    if (currentQuestion.tags && currentQuestion.tags.length > 0) {
      // 提取当前题目标签中的核心关键词
      const coreKeywords = [
        '函数', '几何', '代数', '三角', '概率', '统计', '导数', '积分', '极限',
        '方程', '不等式', '图形', '面积', '周长', '体积', '角度', '直线', '圆',
        '多项式', '因式', '根式', '指数', '对数', '复数', '向量', '矩阵'
      ];
      
      const relevantKeywords: string[] = [];
      currentQuestion.tags.forEach((tag: string) => {
        coreKeywords.forEach(keyword => {
          if (tag.includes(keyword)) {
            relevantKeywords.push(keyword);
          }
        });
      });

      // 如果找到了相关关键词，使用它们筛选候选题目
      if (relevantKeywords.length > 0) {
        const tagFilterConditions = relevantKeywords.map(keyword => ({
          tags: { $regex: keyword, $options: 'i' }
        }));
        
        candidateQuery.$or = tagFilterConditions;
        console.log('使用标签预筛选，关键词:', relevantKeywords);
      } else {
        // 如果没有核心关键词，直接使用标签匹配
        candidateQuery.tags = { $in: currentQuestion.tags };
        console.log('使用直接标签匹配筛选');
      }
    } else {
      console.log('当前题目没有标签，获取所有候选题目');
    }

    console.log('候选题目查询条件:', JSON.stringify(candidateQuery, null, 2));

    const allCandidates = await Question.find(candidateQuery)
      .populate('creator', 'name email')
      .sort({ views: -1, createdAt: -1 })
      .limit(100); // 适当增加候选数量以获得更好的匹配

    // 计算每个候选题目的关联度
    const candidatesWithScores = allCandidates.map(question => ({
      question,
      relevanceScore: calculateRelevanceScore(question, currentQuestion)
    }));

    // 按关联度排序并筛选，确保标签一致性为前提
    const relevantQuestions = candidatesWithScores
      .filter(candidate => candidate.relevanceScore > 0) // 只保留有标签匹配的题目
      .sort((a, b) => b.relevanceScore - a.relevanceScore);

    console.log(`经过标签筛选后有 ${relevantQuestions.length} 个相关题目`);

    // 分层筛选：优先选择高质量匹配，如果不够再降低阈值
    let finalQuestions = relevantQuestions
      .filter(candidate => candidate.relevanceScore >= 0.6) // 提高质量要求
      .slice(0, limit)
      .map(candidate => candidate.question);

    // 如果高质量题目不够，适当降低阈值但保证标签匹配
    if (finalQuestions.length < limit) {
      const additionalQuestions = relevantQuestions
        .filter(candidate => candidate.relevanceScore >= 0.3 && candidate.relevanceScore < 0.6)
        .slice(0, limit - finalQuestions.length)
        .map(candidate => candidate.question);
      
      finalQuestions = [...finalQuestions, ...additionalQuestions];
      console.log(`补充了 ${additionalQuestions.length} 个中等质量的相关题目`);
    }

    // 格式化返回数据
    const formattedQuestions = finalQuestions.map(q => ({
      _id: q._id,
      qid: q.qid,
      content: q.content,
      type: q.type,
      difficulty: q.difficulty,
      category: q.category,
      tags: q.tags,
      creator: q.creator,
      createdAt: q.createdAt,
      updatedAt: q.updatedAt,
      usageCount: q.views || 0,
      views: q.views || 0,
      source: q.source,
      status: q.status,
      relevanceScore: calculateRelevanceScore(q, currentQuestion) // 添加关联度分数
    }));

    return res.json({
      success: true,
      questions: formattedQuestions,
      total: formattedQuestions.length,
      averageRelevance: formattedQuestions.length > 0 
        ? formattedQuestions.reduce((sum, q) => sum + (q.relevanceScore || 0), 0) / formattedQuestions.length 
        : 0
    });
  } catch (error: any) {
    console.error('获取相关题目失败:', error);
    return res.status(500).json({ 
      success: false, 
      error: '获取相关题目失败',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router; 