import express from 'express';
import { getDeepSeekAIService } from '../services/deepseekAI';

const router = express.Router();

/**
 * POST /api/deepseek/optimize-question
 * 使用DeepSeek优化题目
 */
router.post('/optimize-question', async (req, res) => {
  try {
    const { question } = req.body;
    
    if (!question || !question.content) {
      return res.status(400).json({
        success: false,
        message: '请提供题目内容'
      });
    }

    console.log('开始使用DeepSeek优化题目:', question.content.substring(0, 100) + '...');

    const deepSeekService = getDeepSeekAIService();
    
    // 构建优化提示
    const prompt = `请优化以下题目，使其更加清晰、准确和规范：

题目内容：${question.content}
题目类型：${question.type || '未知'}
选项：${question.options ? question.options.join(', ') : '无'}
答案：${question.answer || '无'}
解析：${question.analysis || '无'}

请按照以下格式返回优化后的题目：
{
  "content": "优化后的题目内容",
  "answer": "优化后的答案",
  "analysis": "优化后的解析"
}`;

    // 使用correctLatex方法，但传入我们的优化提示
    const optimizedResult = await deepSeekService.correctLatex(prompt);
    
    if (optimizedResult && optimizedResult.trim()) {
      try {
        // 尝试解析JSON响应
        const parsed = JSON.parse(optimizedResult);
        
        return res.json({
          success: true,
          optimizedQuestion: {
            content: parsed.content || question.content,
            answer: parsed.answer || question.answer,
            analysis: parsed.analysis || question.analysis
          }
        });
      } catch (parseError) {
        // 如果JSON解析失败，直接使用文本结果
        return res.json({
          success: true,
          optimizedQuestion: {
            content: optimizedResult,
            answer: question.answer,
            analysis: question.analysis
          }
        });
      }
    } else {
      return res.status(500).json({
        success: false,
        message: 'DeepSeek优化失败：返回结果为空'
      });
    }

  } catch (error: any) {
    console.error('DeepSeek优化失败:', error);
    return res.status(500).json({
      success: false,
      message: `DeepSeek优化失败: ${error.message}`
    });
  }
});

export default router; 