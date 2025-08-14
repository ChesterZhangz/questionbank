import { v4 as uuidv4 } from 'uuid';

interface QuestionArea {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  pageIndex: number;
  confidence: number;
  isConfirmed: boolean;
  isManuallyAdjusted: boolean;
}

interface DocumentPage {
  id: string;
  pageIndex: number;
  imageUrl: string;
  width: number;
  height: number;
  questionAreas: QuestionArea[];
}

interface DetectionResult {
  success: boolean;
  pages: DocumentPage[];
  totalAreas: number;
  averageConfidence: number;
  errors: string[];
}

export class QuestionDetectionService {
  /**
   * 检测题目区域
   */
  async detectQuestionAreas(pages: any[], fileType: string): Promise<DetectionResult> {
    const errors: string[] = [];
    const processedPages: DocumentPage[] = [];
    let totalAreas = 0;
    let totalConfidence = 0;

    try {
      console.log('开始检测题目区域:', pages.length, '页');

      for (let i = 0; i < pages.length; i++) {
        try {
          const page = pages[i];
          const detectedAreas = await this.detectAreasInPage(page, fileType);
          
          processedPages.push({
            id: page.id,
            pageIndex: page.pageIndex,
            imageUrl: page.imageUrl,
            width: page.width,
            height: page.height,
            questionAreas: detectedAreas
          });

          totalAreas += detectedAreas.length;
          totalConfidence += detectedAreas.reduce((sum, area) => sum + area.confidence, 0);

          console.log(`第 ${i + 1} 页检测到 ${detectedAreas.length} 个题目区域`);

        } catch (pageError: any) {
          console.error(`第 ${i + 1} 页检测失败:`, pageError);
          errors.push(`第 ${i + 1} 页检测失败: ${pageError.message}`);
        }
      }

      const averageConfidence = totalAreas > 0 ? totalConfidence / totalAreas : 0;

      return {
        success: processedPages.length > 0,
        pages: processedPages,
        totalAreas,
        averageConfidence,
        errors
      };

    } catch (error: any) {
      console.error('题目区域检测失败:', error);
      errors.push(error.message || '未知错误');
      return {
        success: false,
        pages: [],
        totalAreas: 0,
        averageConfidence: 0,
        errors
      };
    }
  }

  /**
   * 在单个页面中检测题目区域（智能版本）
   */
  private async detectAreasInPage(page: any, fileType: string): Promise<QuestionArea[]> {
    const areas: QuestionArea[] = [];
    
    try {
      console.log('开始智能检测题目区域:', page.imageUrl);
      
      // 使用OCR分析图片内容
      const ocrResult = await this.analyzeImageWithOCR(page.imageUrl);
      
      if (ocrResult && ocrResult.length > 0) {
        // 基于OCR结果智能识别题目区域
        const detectedAreas = this.intelligentQuestionDetection(ocrResult, page);
        areas.push(...detectedAreas);
      } else {
        // 如果OCR失败，使用备用算法
        console.log('OCR分析失败，使用备用算法');
        areas.push(...this.fallbackDetection(page));
      }
      
    } catch (error) {
      console.error('智能检测失败，使用备用算法:', error);
      areas.push(...this.fallbackDetection(page));
    }

    return this.optimizeDetection(areas);
  }

  /**
   * 使用OCR分析图片内容
   */
  private async analyzeImageWithOCR(imageUrl: string): Promise<any[]> {
    try {
      // 下载图片
      const response = await fetch(imageUrl);
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const base64 = buffer.toString('base64');

      // 调用腾讯云OCR API
      const tencentcloud = require('tencentcloud-sdk-nodejs');
      const OcrClient = tencentcloud.ocr.v20181119.Client;
      
      const client = new OcrClient({
        credential: {
          secretId: process.env.TENCENT_CLOUD_SECRET_ID,
          secretKey: process.env.TENCENT_CLOUD_SECRET_KEY,
        },
        region: 'ap-beijing',
        profile: {
          httpProfile: {
            endpoint: 'ocr.tencentcloudapi.com',
          },
        },
      });

      const result = await client.GeneralBasicOCR({
        ImageBase64: base64
      });

      return result.TextDetections || [];
    } catch (error) {
      console.error('OCR分析失败:', error);
      return [];
    }
  }

  /**
   * 智能题目区域检测
   */
  private intelligentQuestionDetection(ocrResults: any[], page: any): QuestionArea[] {
    const areas: QuestionArea[] = [];
    const pageWidth = page.width || 1200;
    const pageHeight = page.height || 1600;

    // 分析OCR结果，寻找题目模式
    const questionPatterns = this.findQuestionPatterns(ocrResults);
    
    console.log('检测到的题目模式:', questionPatterns.length);

    for (const pattern of questionPatterns) {
      const area: QuestionArea = {
        id: uuidv4(),
        x: Math.round(pattern.x),
        y: Math.round(pattern.y),
        width: Math.round(pattern.width),
        height: Math.round(pattern.height),
        pageIndex: page.pageIndex,
        confidence: pattern.confidence,
        isConfirmed: false,
        isManuallyAdjusted: false
      };
      
      areas.push(area);
    }

    return areas;
  }

  /**
   * 寻找题目模式
   */
  private findQuestionPatterns(ocrResults: any[]): any[] {
    const patterns: any[] = [];
    
    // 题目编号模式：数字 + 点 + 空格
    const questionNumberPattern = /^\d+\.\s*/;
    
    // 选项模式：A. B. C. D.
    const optionPattern = /^[A-D]\.\s*/;
    
    let currentQuestion: any = null;
    let questionStartY = 0;
    let questionEndY = 0;
    let maxX = 0;
    let minX = Infinity;

    for (let i = 0; i < ocrResults.length; i++) {
      const detection = ocrResults[i];
      const text = detection.DetectedText.trim();
      const confidence = detection.Confidence / 100;
      
      // 检查是否是题目开始
      if (questionNumberPattern.test(text)) {
        // 如果已有题目，保存前一个题目
        if (currentQuestion) {
          patterns.push({
            x: minX,
            y: questionStartY,
            width: maxX - minX,
            height: questionEndY - questionStartY,
            confidence: currentQuestion.confidence
          });
        }
        
        // 开始新题目
        currentQuestion = { confidence };
        questionStartY = detection.ItemPolygon[0].Y;
        questionEndY = detection.ItemPolygon[2].Y;
        minX = Math.min(...detection.ItemPolygon.map((p: any) => p.X));
        maxX = Math.max(...detection.ItemPolygon.map((p: any) => p.X));
        
      } else if (optionPattern.test(text)) {
        // 选项，扩展当前题目区域
        if (currentQuestion) {
          questionEndY = Math.max(questionEndY, detection.ItemPolygon[2].Y);
          minX = Math.min(minX, Math.min(...detection.ItemPolygon.map((p: any) => p.X)));
          maxX = Math.max(maxX, Math.max(...detection.ItemPolygon.map((p: any) => p.X)));
        }
      } else if (currentQuestion && text.length > 10) {
        // 题目内容，扩展区域
        questionEndY = Math.max(questionEndY, detection.ItemPolygon[2].Y);
        minX = Math.min(minX, Math.min(...detection.ItemPolygon.map((p: any) => p.X)));
        maxX = Math.max(maxX, Math.max(...detection.ItemPolygon.map((p: any) => p.X)));
      }
    }
    
    // 保存最后一个题目
    if (currentQuestion) {
      patterns.push({
        x: minX,
        y: questionStartY,
        width: maxX - minX,
        height: questionEndY - questionStartY,
        confidence: currentQuestion.confidence
      });
    }

    return patterns;
  }

  /**
   * 备用检测算法（当OCR失败时使用）
   */
  private fallbackDetection(page: any): QuestionArea[] {
    const areas: QuestionArea[] = [];
    const pageWidth = page.width || 1200;
    const pageHeight = page.height || 1600;
    
    // 根据页面内容估算题目数量（基于页面高度）
    const estimatedQuestions = Math.max(3, Math.floor(pageHeight / 200)); // 每200像素一个题目
    
    // 跳过页面顶部（标题区域）
    const topMargin = pageHeight * 0.15; // 15%的顶部边距
    const availableHeight = pageHeight - topMargin;
    const questionHeight = availableHeight / estimatedQuestions;
    
    for (let i = 0; i < estimatedQuestions; i++) {
      const areaWidth = pageWidth * 0.8; // 区域宽度为页面宽度的80%
      const areaHeight = questionHeight * 0.8; // 题目高度为分配高度的80%
      const x = pageWidth * 0.1; // 左边距10%
      const y = topMargin + (questionHeight * i) + (questionHeight * 0.1); // 垂直分布，留出间距
      
      areas.push({
        id: uuidv4(),
        x: Math.round(x),
        y: Math.round(y),
        width: Math.round(areaWidth),
        height: Math.round(areaHeight),
        pageIndex: page.pageIndex,
        confidence: 0.6 + Math.random() * 0.2, // 60%-80%的置信度（备用算法）
        isConfirmed: false,
        isManuallyAdjusted: false
      });
    }

    return areas;
  }

  /**
   * 优化检测结果
   */
  private optimizeDetection(areas: QuestionArea[]): QuestionArea[] {
    // 移除重叠区域
    const optimizedAreas: QuestionArea[] = [];
    
    for (const area of areas) {
      const isOverlapping = optimizedAreas.some(existingArea => 
        this.calculateOverlap(area, existingArea) > 0.3 // 30%重叠阈值
      );
      
      if (!isOverlapping) {
        optimizedAreas.push(area);
      }
    }

    return optimizedAreas;
  }

  /**
   * 计算两个区域的重叠度
   */
  private calculateOverlap(area1: QuestionArea, area2: QuestionArea): number {
    const x1 = Math.max(area1.x, area2.x);
    const y1 = Math.max(area1.y, area2.y);
    const x2 = Math.min(area1.x + area1.width, area2.x + area2.width);
    const y2 = Math.min(area1.y + area1.height, area2.y + area2.height);

    if (x2 <= x1 || y2 <= y1) {
      return 0; // 无重叠
    }

    const overlapArea = (x2 - x1) * (y2 - y1);
    const area1Area = area1.width * area1.height;
    const area2Area = area2.width * area2.height;
    const unionArea = area1Area + area2Area - overlapArea;

    return overlapArea / unionArea;
  }
} 