import { Router, Request, Response } from 'express';
import { answerGenerationService } from '../services/answerGenerationService';

const router = Router();

interface AnswerGenerationRequest {
  content: string;
  type: 'choice' | 'multiple-choice' | 'fill' | 'solution';
  difficulty: number;
  category?: string;
  tags?: string[];
}

/**
 * 生成题目答案和解析
 * POST /api/answer-generation/generate
 */
router.post('/generate', async (req: Request, res: Response): Promise<Response> => {
  try {
    const { content, type, difficulty, category, tags } = req.body as AnswerGenerationRequest;

    // 验证必填字段
    if (!content || !type || !difficulty) {
      return res.status(400).json({
        success: false,
        error: '缺少必填字段：content、type、difficulty'
      });
    }

    // 验证题目类型
    const validTypes = ['choice', 'multiple-choice', 'fill', 'solution'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        error: '无效的题目类型'
      });
    }

    // 验证难度等级
    if (difficulty < 1 || difficulty > 5) {
      return res.status(400).json({
        success: false,
        error: '难度等级必须在1-5之间'
      });
    }

    // 调用答案生成服务
    const result = await answerGenerationService.generateAnswer({
      content,
      type,
      difficulty,
      category,
      tags
    });

    return res.json({
      success: true,
      data: result
    });
  } catch (error: any) {
    console.error('答案生成失败:', error);
    return res.status(500).json({
      success: false,
      error: error.message || '答案生成失败'
    });
  }
});

export default router;
