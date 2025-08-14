import express from 'express';
import { QuestionDetectionService } from '../services/questionDetectionService';

const router = express.Router();

/**
 * POST /api/question-detection/detect-areas
 * 自动检测题目区域
 */
router.post('/detect-areas', async (req, res) => {
  try {
    const { pages, fileType } = req.body;

    if (!pages || !Array.isArray(pages)) {
      return res.status(400).json({
        success: false,
        message: '请提供有效的页面数据'
      });
    }

    console.log('开始检测题目区域:', pages.length, '页');

    const detectionService = new QuestionDetectionService();
    const result = await detectionService.detectQuestionAreas(pages, fileType);

    if (result.success) {
      console.log(`题目区域检测完成: ${result.totalAreas} 个区域`);

      return res.json({
        success: true,
        pages: result.pages,
        statistics: {
          totalPages: result.pages.length,
          totalAreas: result.totalAreas,
          averageConfidence: result.averageConfidence
        }
      });
    } else {
      return res.status(500).json({
        success: false,
        message: '题目区域检测失败',
        errors: result.errors
      });
    }

  } catch (error: any) {
    console.error('题目区域检测失败:', error);
    return res.status(500).json({
      success: false,
      message: '题目区域检测失败',
      error: error.message || '未知错误'
    });
  }
});

export default router; 