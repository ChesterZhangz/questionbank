import express from 'express';
import { authMiddleware } from '../middleware/auth';
import { questionAnalysisService } from '../services/questionAnalysisService';

const router = express.Router();

// 分析题目内容 - 设置更长的超时时间
router.post('/analyze', authMiddleware, async (req, res) => {
  // 设置请求超时时间为3分钟
  req.setTimeout(180000); // 3分钟 = 180000毫秒
  res.setTimeout(180000); // 3分钟 = 180000毫秒
  
  try {
    const { content } = req.body;

    if (!content || typeof content !== 'string') {
      return res.status(400).json({
        success: false,
        message: '题目内容不能为空'
      });
    }

    console.log('开始AI分析，内容长度:', content.length);
    console.log('设置超时时间: 3分钟');

    const analysis = await questionAnalysisService.analyzeQuestion(content);

    console.log('AI分析完成，返回结果');
    return res.json({
      success: true,
      analysis
    });
  } catch (error: any) {
    console.error('题目分析失败:', error);
    
    // 如果是超时错误，提供更友好的错误信息
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      return res.status(408).json({
        success: false,
        message: 'AI分析超时（超过3分钟），请稍后重试或尝试简化题目内容'
      });
    }
    
    // 其他错误
    return res.status(500).json({
      success: false,
      message: '题目分析失败，请重试'
    });
  }
});

export default router; 