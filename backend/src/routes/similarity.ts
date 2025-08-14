import express from 'express';
import { body, validationResult } from 'express-validator';
import { SimilarityDetectionService } from '../services/similarityDetectionService';
import { AuthRequest } from '../middleware/auth';

const router = express.Router();
const similarityService = new SimilarityDetectionService();

/**
 * GET /api/similarity/health
 * 健康检查（无需认证）
 */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: '相似度检测服务正常运行',
    timestamp: new Date().toISOString()
  });
});

/**
 * POST /api/similarity/detect
 * 检测相似题目
 */
router.post('/detect', [
  body('stem').notEmpty().withMessage('题目内容是必需的'),
  body('type').isIn(['choice', 'multiple-choice', 'fill', 'solution']).withMessage('题目类型无效'),
  body('difficulty').isInt({ min: 1, max: 5 }).withMessage('难度必须在1-5之间'),
  body('category').optional().isString().withMessage('小题型必须是字符串'),
  body('tags').optional().isArray().withMessage('知识点标签必须是数组'),
  body('options').optional().isArray().withMessage('选项必须是数组'),
  body('answer').optional().isString().withMessage('答案必须是字符串'),
  body('threshold').optional().isFloat({ min: 0, max: 1 }).withMessage('阈值必须在0-1之间')
], async (req: AuthRequest, res: any) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: '输入验证失败',
        details: errors.array()
      });
    }

    const {
      stem,
      type,
      difficulty,
      category,
      tags,
      options,
      answer,
      threshold = 0.8
    } = req.body;

    console.log('收到相似度检测请求:', { stem: stem.substring(0, 50) + '...', type, difficulty });

    const detectionRequest = {
      stem,
      type,
      difficulty,
      category,
      tags,
      options,
      answer
    };

    const similarQuestions = await similarityService.detectSimilarQuestions(detectionRequest, threshold);

    // 格式化返回数据
    const formattedResults = similarQuestions.map(result => ({
      question: {
        _id: result.question._id,
        qid: result.question.qid,
        content: result.question.content,
        type: result.question.type,
        difficulty: result.question.difficulty,
        category: result.question.category,
        tags: result.question.tags,
        creator: result.question.creator,
        createdAt: result.question.createdAt,
        updatedAt: result.question.updatedAt,
        views: result.question.views || 0,
        source: result.question.source,
        status: result.question.status
      },
      similarityScore: result.similarityScore,
      similarityDetails: result.similarityDetails,
      reasons: result.reasons
    }));

    return res.json({
      success: true,
      similarQuestions: formattedResults,
      total: formattedResults.length,
      threshold,
      detectionInfo: {
        contentWeight: 0.6,
        structureWeight: 0.3,
        semanticWeight: 0.1
      }
    });

  } catch (error: any) {
    console.error('相似度检测失败:', error);
    return res.status(500).json({
      success: false,
      error: '相似度检测失败',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * POST /api/similarity/detect-realtime
 * 实时检测相似度（轻量级，用于前端实时反馈）
 */
router.post('/detect-realtime', [
  body('stem').notEmpty().withMessage('题目内容是必需的'),
  body('type').isIn(['choice', 'multiple-choice', 'fill', 'solution']).withMessage('题目类型无效'),
  body('difficulty').isInt({ min: 1, max: 5 }).withMessage('难度必须在1-5之间')
], async (req: AuthRequest, res: any) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: '输入验证失败',
        details: errors.array()
      });
    }

    const { stem, type, difficulty } = req.body;

    const result = await similarityService.detectSimilarityRealTime(stem, type, difficulty);

    return res.json({
      success: true,
      ...result
    });

  } catch (error: any) {
    console.error('实时相似度检测失败:', error);
    return res.status(500).json({
      success: false,
      error: '实时相似度检测失败',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router; 