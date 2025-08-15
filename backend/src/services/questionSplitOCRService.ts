import axios from 'axios';
import { config } from '../config';

// Mathpix图片识别服务配置

interface MathpixImageRequest {
  imageBase64?: string;
  imageUrl?: string;
  returnText?: boolean;
  returnCoord?: boolean;
  returnType?: string;
}

interface MathpixImageResponse {
  text: string;
  confidence: number;
  latex?: string;
  html?: string;
  error?: string;
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
  private mathpixApiKey: string;
  private mathpixAppId: string;

  constructor() {
    this.mathpixApiKey = process.env.MATHPIX_API_KEY || '';
    this.mathpixAppId = process.env.MATHPIX_APP_ID || 'mareate_internal';
    
    if (!this.mathpixApiKey) {
      console.warn('Mathpix API密钥未配置，OCR功能可能无法正常工作');
    }
  }

  /**
   * 使用Mathpix API解析题目
   */
  async parseQuestions(params: {
    imageBase64?: string;
    imageUrl?: string;
    returnText?: boolean;
    returnCoord?: boolean;
    returnType?: string;
  }): Promise<ParsedQuestion[]> {
    try {
      if (!this.mathpixApiKey) {
        throw new Error('Mathpix API密钥未配置');
      }

      console.log('调用Mathpix图片识别API...');
      const response = await this.callMathpixImageAPI(params);
      
      console.log('Mathpix响应:', JSON.stringify(response, null, 2));
      
      return this.processMathpixResponse(response);
    } catch (error: any) {
      console.error('Mathpix图片识别失败:', error);
      throw new Error(`OCR解析失败: ${error?.message || '未知错误'}`);
    }
  }

  /**
   * 调用Mathpix图片识别API
   */
  private async callMathpixImageAPI(params: {
    imageBase64?: string;
    imageUrl?: string;
    returnText?: boolean;
    returnCoord?: boolean;
    returnType?: string;
  }): Promise<MathpixImageResponse> {
    const requestBody: any = {
      formats: ['text', 'latex_styled'],
      data_options: {
        include_line_data: true,
        include_word_data: true
      }
    };

    if (params.imageBase64) {
      requestBody.src = `data:image/jpeg;base64,${params.imageBase64}`;
    } else if (params.imageUrl) {
      requestBody.src = params.imageUrl;
    } else {
      throw new Error('必须提供图片数据（Base64或URL）');
    }

    const response = await axios.post('https://api.mathpix.com/v3/text', requestBody, {
      headers: {
        'app_id': this.mathpixAppId,
        'app_key': this.mathpixApiKey,
        'Content-Type': 'application/json'
      },
      timeout: 30000 // 30秒超时
    });

    if (response.data.error) {
      throw new Error(`Mathpix API错误: ${response.data.error}`);
    }

    return {
      text: response.data.text || '',
      confidence: response.data.confidence || 0.8,
      latex: response.data.latex_styled || '',
      html: response.data.html || ''
    };
  }

  /**
   * 处理Mathpix响应，转换为结构化题目数据
   */
  private processMathpixResponse(response: MathpixImageResponse): ParsedQuestion[] {
    const questions: ParsedQuestion[] = [];
    
    if (!response.text || response.text.trim().length === 0) {
      console.warn('Mathpix未识别到任何文本内容');
      return questions;
    }

    console.log(`Mathpix识别到文本内容，长度: ${response.text.length} 字符`);

    // 将识别的文本按题目分割
    const extractedQuestions = this.extractQuestionsFromText(response.text, response.confidence);
    
    // 智能去重和合并
    const optimizedQuestions = this.optimizeQuestions(extractedQuestions);

    console.log(`原始题目数: ${extractedQuestions.length}, 优化后题目数: ${optimizedQuestions.length}`);
    return optimizedQuestions;
  }

  /**
   * 从Mathpix识别的文本中提取题目
   */
  private extractQuestionsFromText(text: string, confidence: number): ParsedQuestion[] {
    const questions: ParsedQuestion[] = [];
    
    // 按行分割文本
    const lines = text.split('\n').filter(line => line.trim().length > 0);
    
    // 将文本按题目分组
    const questionGroups = this.groupLinesByQuestion(lines);
    
    questionGroups.forEach((group, index) => {
      const questionText = group.join('\n');
      if (questionText.trim().length > 10) { // 过滤过短的内容
        const questionInfo = this.analyzeQuestionContent(questionText);
        
        const question: ParsedQuestion = {
          _id: `mathpix_question_${index + 1}`,
          type: questionInfo.type,
          content: {
            stem: questionInfo.content,
            options: questionInfo.options,
            answer: questionInfo.answer,
          },
          difficulty: questionInfo.difficulty,
          category: questionInfo.category,
          tags: questionInfo.tags,
          source: 'Mathpix OCR',
          confidence: confidence,
          coordinates: [], // Mathpix图片识别不提供坐标信息
          metadata: {
            knowledgePoints: questionInfo.knowledgePoints,
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        
        questions.push(question);
      }
    });
    
    return questions;
  }

  /**
   * 将文本行按题目分组
   */
  private groupLinesByQuestion(lines: string[]): string[][] {
    const groups: string[][] = [];
    let currentGroup: string[] = [];

    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // 检查是否是题目开始
      if (this.isQuestionStart(trimmedLine)) {
        if (currentGroup.length > 0) {
          groups.push([...currentGroup]);
        }
        currentGroup = [trimmedLine];
      } else {
        currentGroup.push(trimmedLine);
      }
    }

    // 添加最后一组
    if (currentGroup.length > 0) {
      groups.push(currentGroup);
    }

    return groups;
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

  // 删除了腾讯云相关的方法，替换为Mathpix实现

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

  // 移除了旧的extractQuestionFromGroup方法，已被extractQuestionsFromText替代

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