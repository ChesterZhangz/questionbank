import express from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import QuestionBank from '../models/QuestionBank';
import { Question } from '../models/Question';

const router = express.Router();

// 全局搜索接口
router.get('/', authMiddleware, async (req: AuthRequest, res: any) => {
  try {
    const { q: query, type, limit = 10 } = req.query;
    const userId = req.user._id;
    
    // 获取用户信息以确定邮箱后缀
    const { User } = require('../models/User');
    const user = await User.findById(userId);
    if (!user) {
      return res.status(401).json({ success: false, error: '用户不存在' });
    }

    if (!query || typeof query !== 'string') {
      return res.json({
        success: true,
        results: {
          questionBanks: [],
          questions: []
        }
      });
    }

    const searchLimit = parseInt(limit as string) || 10;
    const searchType = type as string;

    const results: any = {
      questionBanks: [],
      questions: []
    };

    // 搜索题库
    if (!searchType || searchType === 'questionBank') {
      const questionBanks = await QuestionBank.find({
        $and: [
          {
            $or: [
              { name: { $regex: query, $options: 'i' } },
              { description: { $regex: query, $options: 'i' } },
              { tags: { $in: [new RegExp(query, 'i')] } }
            ]
          },
          {
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
            ]
          },
          { status: 'active' }
        ]
      })
      .populate('creator', 'name email')
      .limit(searchLimit)
      .sort({ updatedAt: -1 });

      results.questionBanks = questionBanks.map(bank => ({
        id: (bank as any)._id.toString(),
        bid: (bank as any).bid,
        name: (bank as any).name,
        description: (bank as any).description || '',
        questionCount: (bank as any).questionCount || 0,
        tags: (bank as any).tags || [],
        creator: (bank as any).creator,
        lastUpdated: (bank as any).updatedAt,
        type: 'questionBank'
      }));
    }

    // 搜索题目
    if (!searchType || searchType === 'question') {
      const accessibleBanks = await QuestionBank.find({
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

      const bankIds = accessibleBanks.map(bank => (bank as any)._id.toString());
      const bankBids = accessibleBanks.map(bank => (bank as any).bid);

      const questions = await Question.find({
        $and: [
          {
            $or: [
              { 'content.stem': { $regex: query, $options: 'i' } },
              { 'content.solution': { $regex: query, $options: 'i' } },
              { tags: { $in: [new RegExp(query, 'i')] } },
              { category: { $regex: query, $options: 'i' } }
            ]
          },
          {
            $or: [
              { bid: { $in: bankIds } },
              { bid: { $in: bankBids } }
            ]
          }
        ]
      })
      .populate('questionBank', 'name bid')
      .limit(searchLimit)
      .sort({ updatedAt: -1 });

      results.questions = questions.map(question => ({
        id: (question as any)._id.toString(),
        qid: (question as any).qid,
        type: (question as any).type,
        content: {
          stem: (question as any).content.stem,
          solution: (question as any).content.solution
        },
        category: (question as any).category,
        tags: (question as any).tags || [],
        difficulty: (question as any).difficulty,
        questionBank: (question as any).questionBank,
        createdAt: (question as any).createdAt,
        updatedAt: (question as any).updatedAt
      }));
    }

    res.json({
      success: true,
      results
    });

  } catch (error) {
    console.error('搜索失败:', error);
    res.status(500).json({
      success: false,
      error: '搜索失败'
    });
  }
});

// 搜索建议接口（用于自动补全）
router.get('/suggestions', authMiddleware, async (req: AuthRequest, res: any) => {
  try {
    const { q: query, limit = 5 } = req.query;
    const userId = req.user._id;
    
    // 获取用户信息以确定邮箱后缀
    const { User } = require('../models/User');
    const user = await User.findById(userId);
    if (!user) {
      return res.status(401).json({ success: false, error: '用户不存在' });
    }

    if (!query || typeof query !== 'string') {
      return res.json({
        success: true,
        suggestions: []
      });
    }

    const searchLimit = parseInt(limit as string) || 5;

    // 获取题库建议
    const questionBanks = await QuestionBank.find({
      $and: [
        {
          $or: [
            { name: { $regex: query, $options: 'i' } },
            { description: { $regex: query, $options: 'i' } }
          ]
        },
        {
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
          ]
        },
        { status: 'active' }
      ]
    })
    .select('name description bid')
    .limit(searchLimit);

    // 获取题目建议
    const accessibleBanks = await QuestionBank.find({
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

    const bankIds = accessibleBanks.map(bank => (bank as any)._id.toString());
    const bankBids = accessibleBanks.map(bank => (bank as any).bid);

    const questions = await Question.find({
      $and: [
        { 'content.stem': { $regex: query, $options: 'i' } },
        {
          $or: [
            { bid: { $in: bankIds } },
            { bid: { $in: bankBids } }
          ]
        }
      ]
    })
    .select('qid content.stem type bid')
    .limit(searchLimit);

    const suggestions = [
      ...questionBanks.map(bank => ({
        type: 'questionBank' as const,
        id: (bank as any)._id.toString(),
        title: (bank as any).name,
        description: (bank as any).description || '',
        bid: (bank as any).bid
      })),
      ...questions.map(question => ({
        type: 'question' as const,
        id: (question as any)._id.toString(),
        title: (question as any).content.stem.substring(0, 50) + '...',
        description: `题目ID: ${(question as any).qid}`,
        qid: (question as any).qid,
        questionType: (question as any).type
      }))
    ];

    res.json({
      success: true,
      suggestions
    });

  } catch (error) {
    console.error('获取搜索建议失败:', error);
    res.status(500).json({
      success: false,
      error: '获取搜索建议失败'
    });
  }
});

export default router; 