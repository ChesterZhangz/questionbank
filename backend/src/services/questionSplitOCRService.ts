const tencentcloud = require('tencentcloud-sdk-nodejs');
import { config } from '../config';

// 导入腾讯云OCR SDK
const OcrClient = tencentcloud.ocr.v20181119.Client;

interface QuestionSplitOCRRequest {
  ImageBase64?: string;
  ImageUrl?: string;
  ReturnText?: boolean;
  ReturnCoord?: boolean;
  ReturnType?: string;
}

interface QuestionSplitOCRResponse {
  TextDetections: Array<{
    Text: string;
    Confidence: number;
    Polygon: Array<{ X: number; Y: number }>;
    AdvancedInfo: string;
    ItemPolygon: Array<{ X: number; Y: number }>;
    Words: Array<{
      Character: string;
      Confidence: number;
    }>;
  }>;
  RequestId: string;
}

interface ParsedQuestion {
  _id: string;  // 改为 _id 以保持一致性
  type: 'choice' | 'fill' | 'solution';  // 统一题型定义
  content: {
    stem: string;
    options?: Array<{ text: string; isCorrect: boolean }>;
    answer?: string;
  };
  difficulty?: number;
  category?: string;
  tags?: string[];
  source: string;
  confidence: number;
  coordinates: Array<{ x: number; y: number }>;
  metadata: {
    knowledgePoints?: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

export class QuestionSplitOCRService {
  private client: any;

  constructor() {
    this.client = new OcrClient({
      credential: {
        secretId: config.tencentCloud.secretId,
        secretKey: config.tencentCloud.secretKey,
      },
      region: 'ap-beijing',
      profile: {
        httpProfile: {
          endpoint: 'ocr.tencentcloudapi.com',
        },
      },
    });
  }

  /**
   * 使用QuestionSplitOCR API解析题目
   */
  async parseQuestions(params: {
    imageBase64?: string;
    imageUrl?: string;
    returnText?: boolean;
    returnCoord?: boolean;
    returnType?: string;
  }): Promise<ParsedQuestion[]> {
    try {
      const request: QuestionSplitOCRRequest = {
        // 只使用基本参数，避免腾讯云API的兼容性问题
      };

      if (params.imageBase64) {
        request.ImageBase64 = params.imageBase64;
      } else if (params.imageUrl) {
        request.ImageUrl = params.imageUrl;
      } else {
        throw new Error('必须提供图片数据（Base64或URL）');
      }

      console.log('调用腾讯云QuestionSplitOCR API...');
      const response = await this.client.QuestionSplitOCR(request);
      
      console.log('QuestionSplitOCR响应:', JSON.stringify(response, null, 2));
      
      return this.processOCRResponse(response);
    } catch (error: any) {
      console.error('QuestionSplitOCR解析失败:', error);
      throw new Error(`OCR解析失败: ${error?.message || '未知错误'}`);
    }
  }

  /**
   * 处理OCR响应，转换为结构化题目数据
   */
  private processOCRResponse(response: any): ParsedQuestion[] {
    const questions: ParsedQuestion[] = [];
    
    if (!response.QuestionInfo || response.QuestionInfo.length === 0) {
      console.warn('OCR未检测到任何题目');
      return questions;
    }

    console.log(`检测到 ${response.QuestionInfo.length} 个题目组`);

    // 收集所有题目
    const allQuestions: any[] = [];
    response.QuestionInfo.forEach((questionGroup: any, groupIndex: number) => {
      if (questionGroup.ResultList && questionGroup.ResultList.length > 0) {
        questionGroup.ResultList.forEach((result: any, resultIndex: number) => {
          const question = this.extractQuestionFromResult(result, groupIndex, resultIndex);
          if (question) {
            allQuestions.push(question);
          }
        });
      }
    });

    // 智能去重和合并
    const optimizedQuestions = this.optimizeQuestions(allQuestions);

    console.log(`原始题目数: ${allQuestions.length}, 优化后题目数: ${optimizedQuestions.length}`);
    return optimizedQuestions;
  }

  /**
   * 智能优化题目列表，去除重复和合并相关题目
   */
  private optimizeQuestions(questions: ParsedQuestion[]): ParsedQuestion[] {
    if (questions.length <= 1) {
      return questions;
    }

    console.log('开始智能题目优化...');

    // 1. 按题目编号排序
    const sortedQuestions = questions.sort((a, b) => {
      const aNumber = this.extractQuestionNumber(a.content.stem);
      const bNumber = this.extractQuestionNumber(b.content.stem);
      return (aNumber || 0) - (bNumber || 0);
    });

    // 2. 检测和合并连续的小题
    const mergedQuestions: ParsedQuestion[] = [];
    let currentGroup: ParsedQuestion[] = [];

    for (let i = 0; i < sortedQuestions.length; i++) {
      const current = sortedQuestions[i];
      const next = sortedQuestions[i + 1];

      currentGroup.push(current);

      // 检查是否应该结束当前组
      const shouldEndGroup = this.shouldEndQuestionGroup(current, next);

      if (shouldEndGroup) {
        // 合并当前组
        const mergedQuestion = this.mergeQuestionGroup(currentGroup);
        if (mergedQuestion) {
          mergedQuestions.push(mergedQuestion);
        }
        currentGroup = [];
      }
    }

    // 处理最后一组
    if (currentGroup.length > 0) {
      const mergedQuestion = this.mergeQuestionGroup(currentGroup);
      if (mergedQuestion) {
        mergedQuestions.push(mergedQuestion);
      }
    }

    console.log(`优化完成: ${questions.length} -> ${mergedQuestions.length} 道题目`);
    return mergedQuestions;
  }

  /**
   * 提取题目编号
   */
  private extractQuestionNumber(text: string): number | null {
    const match = text.match(/^(\d+)[\.、]/);
    return match ? parseInt(match[1]) : null;
  }

  /**
   * 判断是否应该结束题目组
   */
  private shouldEndQuestionGroup(current: ParsedQuestion, next?: ParsedQuestion): boolean {
    if (!next) {
      return true; // 最后一个题目
    }

    const currentNumber = this.extractQuestionNumber(current.content.stem);
    const nextNumber = this.extractQuestionNumber(next.content.stem);

    if (!currentNumber || !nextNumber) {
      return true; // 无法提取编号，保守处理
    }

    // 如果编号差距大于1，认为是不同的大题
    if (nextNumber - currentNumber > 1) {
      return true;
    }

    // 如果当前是解答题且下一题是选择题，认为是不同大题
    if (current.type === 'solution' && next.type === 'choice') {
      return true;
    }

    // 如果当前是填空题且下一题是选择题，认为是不同大题
    if (current.type === 'fill' && next.type === 'choice') {
      return true;
    }

    // 检查内容相似度，如果差异很大，认为是不同大题
    const similarity = this.calculateContentSimilarity(current.content.stem, next.content.stem);
    if (similarity < 0.3) {
      return true;
    }

    return false;
  }

  /**
   * 计算内容相似度
   */
  private calculateContentSimilarity(text1: string, text2: string): number {
    // 简单的相似度计算：共同字符数 / 总字符数
    const chars1 = new Set(text1.replace(/[^\w\u4e00-\u9fff]/g, ''));
    const chars2 = new Set(text2.replace(/[^\w\u4e00-\u9fff]/g, ''));
    
    const intersection = new Set([...chars1].filter(x => chars2.has(x)));
    const union = new Set([...chars1, ...chars2]);
    
    return intersection.size / union.size;
  }

  /**
   * 合并题目组
   */
  private mergeQuestionGroup(questions: ParsedQuestion[]): ParsedQuestion | null {
    if (questions.length === 0) {
      return null;
    }

    if (questions.length === 1) {
      return questions[0];
    }

    // 合并多个小题
    const firstQuestion = questions[0];
    const questionNumbers = questions.map(q => this.extractQuestionNumber(q.content.stem)).filter(n => n !== null);
    
    // 构建合并后的内容
    const mergedContent = questions.map((q, index) => {
      const number = this.extractQuestionNumber(q.content.stem);
      const content = q.content.stem.replace(/^\d+[\.、]/, '').trim();
      return `(${number}) ${content}`;
    }).join('\n');

    // 合并选项
    const mergedOptions: Array<{ text: string; isCorrect: boolean }> = [];
    questions.forEach(q => {
      if (q.content.options) {
        mergedOptions.push(...q.content.options);
      }
    });

    // 确定题目类型
    const types = [...new Set(questions.map(q => q.type))];
    const mergedType = types.length === 1 ? types[0] : 'solution';

    return {
      _id: `merged_${questionNumbers.join('_')}`,
      type: mergedType,
      content: {
        stem: mergedContent,
        options: mergedOptions.length > 0 ? mergedOptions : undefined,
        answer: questions.map(q => q.content.answer).filter(a => a).join('\n'),
      },
      difficulty: Math.max(...questions.map(q => q.difficulty || 0)),
      category: questions.map(q => q.category).filter(c => c)[0],
      tags: [...new Set(questions.flatMap(q => q.tags || []))],
      source: questions.map(q => q.source).filter(s => s)[0],
      confidence: Math.min(...questions.map(q => q.confidence)),
      coordinates: questions.flatMap(q => q.coordinates),
      metadata: {
        knowledgePoints: [...new Set(questions.flatMap(q => q.metadata.knowledgePoints || []))],
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  /**
   * 从腾讯云OCR结果中提取题目
   */
  private extractQuestionFromResult(result: any, groupIndex: number, resultIndex: number): ParsedQuestion | null {
    try {
      if (!result.Question || result.Question.length === 0) {
        return null;
      }

      const questionData = result.Question[0];
      const questionText = questionData.Text || '';
      const groupType = questionData.GroupType || 'unknown';

      // 提取选项（如果有）
      const options: Array<{ text: string; isCorrect: boolean }> = [];
      if (result.Option && result.Option.length > 0) {
        result.Option.forEach((option: any) => {
          if (option.Text) {
            options.push({ text: option.Text, isCorrect: false }); // 默认不是正确答案
          }
        });
      }

      // 分析题目内容
      const analysis = this.analyzeQuestionContent(questionText);

      // 构建题目对象
      const question: ParsedQuestion = {
        _id: `question_${groupIndex}_${resultIndex}`,
        type: this.mapGroupTypeToQuestionType(groupType),
        content: {
          stem: questionText,
          options: options.length > 0 ? options : undefined,
          answer: analysis.answer,
        },
        difficulty: analysis.difficulty,
        category: analysis.category,
        tags: analysis.tags,
        source: 'OCR', // 来源
        confidence: 0.8, // 腾讯云OCR的置信度
        coordinates: this.extractCoordinates(result.Coord),
        metadata: {
          knowledgePoints: analysis.knowledgePoints,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      return question;
    } catch (error) {
      console.error('提取题目失败:', error);
      return null;
    }
  }

  /**
   * 将腾讯云的GroupType映射到我们的题目类型
   */
  private mapGroupTypeToQuestionType(groupType: string): 'choice' | 'fill' | 'solution' {
    switch (groupType) {
      case 'multiple-choice':
        return 'choice';
      case 'fill-in-the-blank':
        return 'fill';
      case 'problem-solving':
        return 'solution';
      default:
        return 'solution'; // 默认解析为解答题
    }
  }

  /**
   * 提取坐标信息
   */
  private extractCoordinates(coord: any[]): Array<{ x: number; y: number }> {
    if (!coord || coord.length === 0) {
      return [];
    }

    const coordinates: Array<{ x: number; y: number }> = [];
    coord.forEach((point: any) => {
      if (point.LeftTop) {
        coordinates.push({ x: point.LeftTop.X, y: point.LeftTop.Y });
      }
      if (point.RightTop) {
        coordinates.push({ x: point.RightTop.X, y: point.RightTop.Y });
      }
      if (point.LeftBottom) {
        coordinates.push({ x: point.LeftBottom.X, y: point.LeftBottom.Y });
      }
      if (point.RightBottom) {
        coordinates.push({ x: point.RightBottom.X, y: point.RightBottom.Y });
      }
    });

    return coordinates;
  }

  /**
   * 将文本检测结果分组为题目
   */
  private groupTextDetections(detections: any[]): any[][] {
    const groups: any[][] = [];
    let currentGroup: any[] = [];

    detections.forEach((detection, index) => {
      const text = detection.Text.trim();
      
      // 检查是否是题目开始（序号、题目标识等）
      if (this.isQuestionStart(text)) {
        if (currentGroup.length > 0) {
          groups.push([...currentGroup]);
        }
        currentGroup = [detection];
      } else {
        currentGroup.push(detection);
      }
    });

    // 添加最后一组
    if (currentGroup.length > 0) {
      groups.push(currentGroup);
    }

    return groups;
  }

  /**
   * 判断文本是否是题目开始
   */
  private isQuestionStart(text: string): boolean {
    // 题目序号模式
    const questionPatterns = [
      /^\d+[\.、]/,           // 1. 1、 等
      /^[A-Z][\.、]/,         // A. A、 等
      /^[一二三四五六七八九十]+[\.、]/, // 一、 二、 等
      /^第\d+题/,             // 第1题
      /^题目\d+/,             // 题目1
      /^Question\s*\d+/i,     // Question 1
      /^[（\(]\d+[）\)]/,     // (1) （1）等
    ];

    return questionPatterns.some(pattern => pattern.test(text));
  }

  /**
   * 从文本组中提取题目信息
   */
  private extractQuestionFromGroup(group: any[], index: number): ParsedQuestion | null {
    if (group.length === 0) return null;

    // 合并所有文本
    const fullText = group.map(detection => detection.Text).join(' ');
    
    // 提取坐标信息
    const coordinates = group.flatMap(detection => 
      detection.Polygon?.map((point: any) => ({ x: point.X, y: point.Y })) || []
    );

    // 计算平均置信度
    const avgConfidence = group.reduce((sum, detection) => sum + detection.Confidence, 0) / group.length;

    // 智能识别题目类型和内容
    const questionInfo = this.analyzeQuestionContent(fullText);

    return {
      _id: `question_${index + 1}`,
      type: questionInfo.type,
      content: {
        stem: questionInfo.content,
        options: questionInfo.options,
        answer: questionInfo.answer,
      },
      difficulty: questionInfo.difficulty,
      category: questionInfo.category,
      tags: questionInfo.tags,
      source: 'OCR', // 来源
      confidence: avgConfidence,
      coordinates,
      metadata: {
        knowledgePoints: questionInfo.knowledgePoints,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  /**
   * 分析题目内容，提取结构化信息
   */
  private analyzeQuestionContent(text: string): {
    content: string;
    type: 'choice' | 'fill' | 'solution';
    options?: Array<{ text: string; isCorrect: boolean }>;
    answer?: string;
    analysis?: string;
    difficulty?: number;
    category?: string;
    tags?: string[];
    knowledgePoints?: string[];
  } {
    // 移除题目序号
    const cleanText = text.replace(/^[^\u4e00-\u9fa5a-zA-Z]*/, '');

    // 识别题目类型
    let type: 'choice' | 'fill' | 'solution' = 'solution';
    let options: Array<{ text: string; isCorrect: boolean }> = [];
    let answer = '';
    let analysis = '';

    // 选择题识别
    if (this.isChoiceQuestion(cleanText)) {
      type = 'choice';
      const choiceResult = this.extractChoiceQuestion(cleanText);
      options = choiceResult.options;
      answer = choiceResult.answer;
      analysis = choiceResult.analysis;
    }
    // 填空题识别
    else if (this.isFillQuestion(cleanText)) {
      type = 'fill';
      const fillResult = this.extractFillQuestion(cleanText);
      answer = fillResult.answer;
      analysis = fillResult.analysis;
    }
    // 解答题识别
    else if (this.isEssayQuestion(cleanText)) {
      type = 'solution';
      const essayResult = this.extractEssayQuestion(cleanText);
      answer = essayResult.answer;
      analysis = essayResult.analysis;
    }

    // 提取知识点和标签
    const knowledgePoints = this.extractKnowledgePoints(cleanText);
    const tags = this.extractTags(cleanText);
    const difficulty = this.estimateDifficulty(cleanText);

    return {
      content: cleanText,
      type,
      options,
      answer,
      analysis,
      difficulty,
      category: '数学', // 默认分类
      tags,
      knowledgePoints,
    };
  }

  /**
   * 判断是否是选择题
   */
  private isChoiceQuestion(text: string): boolean {
    const choicePatterns = [
      /[A-D][\.、]/g,
      /[①②③④]/g,
      /[（\(][A-D][）\)]/g,
      /答案[：:]\s*[A-D]/,
      /选择[：:]/,
    ];
    
    return choicePatterns.some(pattern => pattern.test(text));
  }

  /**
   * 提取选择题信息
   */
  private extractChoiceQuestion(text: string): {
    options: Array<{ text: string; isCorrect: boolean }>;
    answer: string;
    analysis: string;
  } {
    const options: Array<{ text: string; isCorrect: boolean }> = [];
    let answer = '';
    let analysis = '';

    // 提取选项
    const optionMatches = text.match(/[A-D][\.、]([^A-D]*?)(?=[A-D][\.、]|答案|$)/g);
    if (optionMatches) {
      options.push(...optionMatches.map(opt => {
        const text = opt.replace(/^[A-D][\.、]/, '').trim();
        return { text, isCorrect: false }; // 默认不是正确答案
      }));
    }

    // 提取答案
    const answerMatch = text.match(/答案[：:]\s*([A-D])/);
    if (answerMatch) {
      answer = answerMatch[1];
      // 将答案选项标记为正确
      options.forEach(opt => {
        if (opt.text === answer) {
          opt.isCorrect = true;
        }
      });
    }

    // 提取解析
    const analysisMatch = text.match(/解析[：:](.*?)(?=答案|$)/);
    if (analysisMatch) {
      analysis = analysisMatch[1].trim();
    }

    return { options, answer, analysis };
  }

  /**
   * 判断是否是填空题
   */
  private isFillQuestion(text: string): boolean {
    const fillPatterns = [
      /[＿_]{2,}/,
      /[（\(][\s]*[）\)]/,
      /填空/,
      /补充/,
    ];
    
    return fillPatterns.some(pattern => pattern.test(text));
  }

  /**
   * 提取填空题信息
   */
  private extractFillQuestion(text: string): {
    answer: string;
    analysis: string;
  } {
    let answer = '';
    let analysis = '';

    // 提取答案
    const answerMatch = text.match(/答案[：:](.*?)(?=解析|$)/);
    if (answerMatch) {
      answer = answerMatch[1].trim();
    }

    // 提取解析
    const analysisMatch = text.match(/解析[：:](.*?)(?=答案|$)/);
    if (analysisMatch) {
      analysis = analysisMatch[1].trim();
    }

    return { answer, analysis };
  }

  /**
   * 判断是否是解答题
   */
  private isEssayQuestion(text: string): boolean {
    const essayPatterns = [
      /解答/,
      /计算/,
      /证明/,
      /论述/,
      /分析/,
    ];
    
    return essayPatterns.some(pattern => pattern.test(text));
  }

  /**
   * 提取解答题信息
   */
  private extractEssayQuestion(text: string): {
    answer: string;
    analysis: string;
  } {
    let answer = '';
    let analysis = '';

    // 提取答案
    const answerMatch = text.match(/答案[：:](.*?)(?=解析|$)/);
    if (answerMatch) {
      answer = answerMatch[1].trim();
    }

    // 提取解析
    const analysisMatch = text.match(/解析[：:](.*?)(?=答案|$)/);
    if (analysisMatch) {
      analysis = analysisMatch[1].trim();
    }

    return { answer, analysis };
  }

  /**
   * 提取知识点
   */
  private extractKnowledgePoints(text: string): string[] {
    const knowledgePoints: string[] = [];
    
    // 数学知识点模式
    const mathPatterns = [
      /函数/,
      /导数/,
      /积分/,
      /极限/,
      /数列/,
      /概率/,
      /统计/,
      /几何/,
      /代数/,
      /三角/,
      /解析几何/,
    ];

    mathPatterns.forEach(pattern => {
      if (pattern.test(text)) {
        knowledgePoints.push(pattern.source);
      }
    });

    return knowledgePoints;
  }

  /**
   * 提取标签
   */
  private extractTags(text: string): string[] {
    const tags: string[] = [];
    
    // 难度标签
    if (/简单|基础|入门/.test(text)) tags.push('简单');
    if (/中等|一般/.test(text)) tags.push('中等');
    if (/困难|复杂|高级/.test(text)) tags.push('困难');

    // 题型标签
    if (/计算题/.test(text)) tags.push('计算题');
    if (/证明题/.test(text)) tags.push('证明题');
    if (/应用题/.test(text)) tags.push('应用题');

    return tags;
  }

  /**
   * 估算题目难度
   */
  private estimateDifficulty(text: string): number {
    let score = 3; // 默认中等难度

    // 根据关键词调整难度
    if (/简单|基础|入门/.test(text)) score -= 1;
    if (/困难|复杂|高级/.test(text)) score += 1;
    if (/证明|推导/.test(text)) score += 1;
    if (/计算|运算/.test(text)) score += 0.5;

    // 根据长度调整难度
    if (text.length > 200) score += 0.5;
    if (text.length > 500) score += 0.5;

    return Math.max(1, Math.min(5, Math.round(score)));
  }

  /**
   * 批量处理多个图片
   */
  async batchParseQuestions(images: Array<{ base64?: string; url?: string }>): Promise<ParsedQuestion[]> {
    const allQuestions: ParsedQuestion[] = [];
    
    for (let i = 0; i < images.length; i++) {
      try {
        console.log(`处理第 ${i + 1}/${images.length} 张图片...`);
        const questions = await this.parseQuestions({
          imageBase64: images[i].base64,
          imageUrl: images[i].url,
        });
        
        // 为题目添加批次标识
        questions.forEach(q => {
          q._id = `batch_${i + 1}_${q._id}`;
        });
        
        allQuestions.push(...questions);
      } catch (error) {
        console.error(`处理第 ${i + 1} 张图片失败:`, error);
        // 继续处理下一张图片
      }
    }

    return allQuestions;
  }
}

export default QuestionSplitOCRService;