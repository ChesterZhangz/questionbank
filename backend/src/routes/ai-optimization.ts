import express from 'express';
import { AIOptimizationService } from '../services/aiOptimizationService';

const router = express.Router();

/**
 * POST /api/ai-optimization/optimize-questions
 * 使用DeepSeek优化题目内容
 */
router.post('/optimize-questions', async (req, res) => {
  try {
    const { questions } = req.body;

    if (!questions || !Array.isArray(questions)) {
      return res.status(400).json({
        success: false,
        message: '请提供有效的题目数据'
      });
    }


    const optimizationService = new AIOptimizationService();
    const result = await optimizationService.optimizeQuestions(questions);

    if (result.success) {

      return res.json({
        success: true,
        questions: result.questions,
        statistics: {
          totalQuestions: questions.length,
          optimizedQuestions: result.questions.length,
          averageImprovement: result.averageImprovement
        }
      });
    } else {
      return res.status(500).json({
        success: false,
        message: 'AI优化失败',
        errors: result.errors
      });
    }

  } catch (error: any) {
    console.error('AI优化失败:', error);
    return res.status(500).json({
      success: false,
      message: 'AI优化失败',
      error: error.message || '未知错误'
    });
  }
});

export default router; 