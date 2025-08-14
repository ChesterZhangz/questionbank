import express from 'express';
import { OCRRecognitionService } from '../services/ocrRecognitionService';

const router = express.Router();

/**
 * POST /api/ocr-recognition/recognize-areas
 * OCR识别确认的题目区域
 */
router.post('/recognize-areas', async (req, res) => {
  try {
    const { pages, confirmedAreas } = req.body;

    if (!pages || !Array.isArray(pages) || !confirmedAreas || !Array.isArray(confirmedAreas)) {
      return res.status(400).json({
        success: false,
        message: '请提供有效的页面和区域数据'
      });
    }

    console.log('开始OCR识别:', confirmedAreas.length, '个区域');

    const ocrService = new OCRRecognitionService();
    const result = await ocrService.recognizeAreas(pages, confirmedAreas);

    if (result.success) {
      console.log(`OCR识别完成: ${result.questions.length} 道题目`);

      return res.json({
        success: true,
        questions: result.questions,
        statistics: {
          totalAreas: confirmedAreas.length,
          recognizedQuestions: result.questions.length,
          averageConfidence: result.averageConfidence
        }
      });
    } else {
      return res.status(500).json({
        success: false,
        message: 'OCR识别失败',
        errors: result.errors
      });
    }

  } catch (error: any) {
    console.error('OCR识别失败:', error);
    return res.status(500).json({
      success: false,
      message: 'OCR识别失败',
      error: error.message || '未知错误'
    });
  }
});

export default router; 