import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import AreaExtractionService from '../services/areaExtractionService';
import QuestionSplitOCRService from '../services/questionSplitOCRService';

const router = express.Router();

// 配置文件上传
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'temp', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB
  }
});

/**
 * POST /api/area-extraction/extract-and-ocr
 * 截取区域并进行OCR识别
 */
router.post('/extract-and-ocr', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: '请上传文件'
      });
    }

    const areas = JSON.parse(req.body.areas || '[]');
    if (areas.length === 0) {
      return res.status(400).json({
        success: false,
        message: '请选择至少一个区域'
      });
    }

    const fileType = req.body.fileType || getFileType(req.file.originalname);
    console.log('开始处理区域截取和OCR:', req.file.originalname, '区域数量:', areas.length);

    const areaExtractionService = new AreaExtractionService();
    const questionSplitOCRService = new QuestionSplitOCRService();
    
    const results = [];

    for (const area of areas) {
      try {
        console.log(`处理区域 ${area.id}:`, area);
        
        // 1. 截取区域图片
        let extractionResult;
        if (fileType === 'pdf') {
          extractionResult = await areaExtractionService.extractPDFArea(req.file.path, area);
        } else if (fileType === 'word') {
          extractionResult = await areaExtractionService.extractWordArea(req.file.path, area);
        } else {
          throw new Error(`不支持的文件类型: ${fileType}`);
        }

        if (!extractionResult.success) {
          results.push({
            areaId: area.id,
            success: false,
            error: extractionResult.error,
            questions: []
          });
          continue;
        }

        // 2. 使用腾讯OCR识别图片或直接处理文本
        let ocrResult;
        
        if (extractionResult.imagePath.endsWith('.txt')) {
          // 如果是文本文件，直接读取内容
          const textContent = fs.readFileSync(extractionResult.imagePath, 'utf-8');
          
          // 直接使用文本内容创建题目
          ocrResult = [{
            id: `text_${area.id}`,
            content: textContent,
            type: 'solution',
            options: [],
            answer: '',
            analysis: '',
            confidence: 0.9,
            coordinates: [],
            metadata: {
              difficulty: 3,
              knowledgePoints: [],
              tags: []
            }
          }];
        } else {
          // 如果是图片文件，使用OCR识别
          const imageBuffer = fs.readFileSync(extractionResult.imagePath);
          const imageBase64 = imageBuffer.toString('base64');
          
          ocrResult = await questionSplitOCRService.parseQuestions({
            imageBase64: imageBase64,
            returnText: true,
            returnCoord: true,
            returnType: 'auto'
          });
        }

        if (!ocrResult || ocrResult.length === 0) {
          results.push({
            areaId: area.id,
            success: false,
            error: 'OCR识别失败：未识别到内容',
            questions: []
          });
          continue;
        }

        // 3. 清理临时图片文件
        if (fs.existsSync(extractionResult.imagePath)) {
          fs.unlinkSync(extractionResult.imagePath);
        }

        // 4. 处理OCR结果
        const questions = ocrResult.map((q: any) => ({
          _id: `area_${area.id}_${Date.now()}_${Math.random()}`,
          content: {
            stem: q.content || '',
            options: q.options || [],
            answer: q.answer || '',
            analysis: q.analysis || ''
          },
          type: q.type || 'solution',
          difficulty: q.metadata?.difficulty || 3,
          tags: q.metadata?.tags || [],
          knowledgePoints: q.metadata?.knowledgePoints || [],
          source: `区域${area.id}`,
          createdAt: new Date(),
          updatedAt: new Date()
        }));

        results.push({
          areaId: area.id,
          success: true,
          questions,
          confidence: ocrResult.reduce((sum, q) => sum + q.confidence, 0) / ocrResult.length
        });

        console.log(`区域 ${area.id} 处理完成，识别到 ${questions.length} 道题目`);

      } catch (error: any) {
        console.error(`处理区域 ${area.id} 失败:`, error);
        results.push({
          areaId: area.id,
          success: false,
          error: error.message,
          questions: []
        });
      }
    }

    // 清理上传的原始文件
    try {
      fs.unlinkSync(req.file.path);
    } catch (error) {
      console.error('清理原始文件失败:', error);
    }

    // 统计结果
    const totalQuestions = results.reduce((sum, r) => sum + r.questions.length, 0);
    const successCount = results.filter(r => r.success).length;
    const errorCount = results.filter(r => !r.success).length;

    console.log(`区域处理完成: 成功${successCount}个，失败${errorCount}个，共识别${totalQuestions}道题目`);

    return res.json({
      success: true,
      results,
      statistics: {
        totalAreas: areas.length,
        successAreas: successCount,
        errorAreas: errorCount,
        totalQuestions,
        averageConfidence: results.length > 0 ? 
          results.reduce((sum, r) => sum + (r.confidence || 0), 0) / results.length : 0
      }
    });

  } catch (error: any) {
    console.error('区域截取和OCR处理失败:', error);
    return res.status(500).json({
      success: false,
      message: '区域处理失败',
      error: error.message || '未知错误'
    });
  }
});

// 获取文件类型
function getFileType(filename: string): string {
  const ext = path.extname(filename).toLowerCase();
  switch (ext) {
    case '.docx':
    case '.doc':
      return 'word';
    case '.pdf':
      return 'pdf';
    default:
      return 'unknown';
  }
}

export default router; 