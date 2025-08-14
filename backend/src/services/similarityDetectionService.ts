import { Question } from '../models/Question';

interface SimilarityResult {
  question: any;
  similarityScore: number;
  similarityDetails: {
    contentSimilarity: number;
    structureSimilarity: number;
    semanticSimilarity: number;
  };
  reasons: string[];
}

interface DetectionRequest {
  stem: string;
  type: string;
  difficulty: number;
  category?: string;
  tags?: string[];
  options?: Array<{ text: string; isCorrect: boolean }>;
  answer?: string;
}

export class SimilarityDetectionService {
  // 简单的内存缓存
  private cache = new Map<string, SimilarityResult[]>();
  private cacheTimeout = 5 * 60 * 1000; // 5分钟缓存

  /**
   * 检测相似题目
   */
  async detectSimilarQuestions(request: DetectionRequest, threshold: number = 0.8): Promise<SimilarityResult[]> {
    try {
      // 检查缓存
      const cacheKey = `${request.stem.substring(0, 100)}_${threshold}`;
      const cached = this.cache.get(cacheKey);
      if (cached) {
        console.log('使用缓存结果');
        return cached;
      }

      console.log('开始相似度检测:', { stem: request.stem.substring(0, 50) + '...', type: request.type });

      // 1. 快速过滤候选题目
      const candidates = await this.getCandidateQuestions(request);
      console.log(`找到 ${candidates.length} 个候选题目`);

      // 2. 计算相似度
      const similarityResults = candidates.map(question => {
        const similarityDetails = this.calculateSimilarityDetails(request, question);
        const totalScore = this.calculateTotalSimilarity(similarityDetails);
        
        return {
          question,
          similarityScore: totalScore,
          similarityDetails,
          reasons: this.generateSimilarityReasons(similarityDetails, totalScore)
        };
      });

      // 3. 筛选高相似度题目
      const highSimilarityResults = similarityResults
        .filter(result => result.similarityScore >= threshold)
        .sort((a, b) => b.similarityScore - a.similarityScore);

      // 缓存结果
      this.cache.set(cacheKey, highSimilarityResults);
      setTimeout(() => this.cache.delete(cacheKey), this.cacheTimeout);

      console.log(`检测完成，找到 ${highSimilarityResults.length} 个高相似度题目`);
      return highSimilarityResults;

    } catch (error) {
      console.error('相似度检测失败:', error);
      throw new Error('相似度检测失败');
    }
  }

  /**
   * 获取候选题目（快速过滤）
   */
  private async getCandidateQuestions(request: DetectionRequest): Promise<any[]> {
    const query: any = {
      status: { $ne: 'deleted' }
    };

    // 移除题型、难度、分类过滤，只保留标签过滤
    // 基于标签过滤（如果有标签）
    if (request.tags && request.tags.length > 0) {
      query.tags = { $in: request.tags };
    }

    // 获取候选题目，减少数量并优化查询
    const candidates = await Question.find(query)
      .select('content tags category difficulty type') // 只选择需要的字段
      .sort({ createdAt: -1 })
      .limit(200); // 减少候选数量

    return candidates;
  }

  /**
   * 计算多维度相似度
   */
  private calculateSimilarityDetails(request: DetectionRequest, question: any): {
    contentSimilarity: number;
    structureSimilarity: number;
    semanticSimilarity: number;
  } {
    // 1. 内容相似度（90%权重）
    const contentSimilarity = this.calculateContentSimilarity(request.stem, question.content?.stem || '');

    // 2. 结构相似度（0%权重 - 移除）
    const structureSimilarity = 0;

    // 3. 语义相似度（10%权重 - 仅标签）
    const semanticSimilarity = this.calculateSemanticSimilarity(request, question);

    return {
      contentSimilarity,
      structureSimilarity,
      semanticSimilarity
    };
  }

  /**
   * 计算内容相似度
   */
  private calculateContentSimilarity(text1: string, text2: string): number {
    if (!text1 || !text2) return 0;
    if (text1 === text2) return 1;

    // 文本预处理
    const cleanText1 = this.preprocessText(text1);
    const cleanText2 = this.preprocessText(text2);

    if (cleanText1 === cleanText2) return 1;

    // 快速长度检查
    const len1 = cleanText1.length;
    const len2 = cleanText2.length;
    const maxLen = Math.max(len1, len2);
    const minLen = Math.min(len1, len2);
    
    // 如果长度差异太大，直接返回低相似度
    if (minLen / maxLen < 0.3) {
      return 0.1;
    }

    // 数学表达式相似度（新增）
    const mathSimilarity = this.calculateMathExpressionSimilarity(cleanText1, cleanText2);

    // 字符级相似度（Jaccard相似度）
    const chars1 = new Set(cleanText1.split(''));
    const chars2 = new Set(cleanText2.split(''));
    const charIntersection = new Set([...chars1].filter(x => chars2.has(x)));
    const charUnion = new Set([...chars1, ...chars2]);
    const charSimilarity = charUnion.size > 0 ? charIntersection.size / charUnion.size : 0;

    // 词级相似度
    const words1 = cleanText1.split(/\s+/).filter(word => word.length > 1);
    const words2 = cleanText2.split(/\s+/).filter(word => word.length > 1);
    const wordSimilarity = this.calculateWordSimilarity(words1, words2);

    // 如果数学表达式相似度很高，直接返回
    if (mathSimilarity > 0.8) {
      return mathSimilarity;
    }

    // 如果词级相似度已经很高，直接返回
    if (wordSimilarity > 0.8) {
      return wordSimilarity;
    }

    // 综合相似度（调整权重）
    return (mathSimilarity * 0.4 + charSimilarity * 0.2 + wordSimilarity * 0.4);
  }

  /**
   * 计算结构相似度
   */
  private calculateStructureSimilarity(request: DetectionRequest, question: any): number {
    let score = 0;
    let totalWeight = 0;

    // 题目类型匹配（权重40%）
    if (request.type === question.type) {
      score += 0.4;
    }
    totalWeight += 0.4;

    // 选项结构匹配（权重30%）
    if (request.options && question.content?.options) {
      const optionCount1 = request.options.length;
      const optionCount2 = question.content.options.length;
      const optionSimilarity = 1 - Math.abs(optionCount1 - optionCount2) / Math.max(optionCount1, optionCount2);
      score += optionSimilarity * 0.3;
    }
    totalWeight += 0.3;

    // 答案格式匹配（权重30%）
    if (request.answer && question.content?.answer) {
      const answerSimilarity = this.calculateAnswerSimilarity(request.answer, question.content.answer);
      score += answerSimilarity * 0.3;
    }
    totalWeight += 0.3;

    return totalWeight > 0 ? score / totalWeight : 0;
  }

  /**
   * 计算语义相似度（仅标签）
   */
  private calculateSemanticSimilarity(request: DetectionRequest, question: any): number {
    // 只考虑标签匹配
    if (request.tags && question.tags && request.tags.length > 0 && question.tags.length > 0) {
      const commonTags = request.tags.filter(tag => question.tags.includes(tag));
      const tagSimilarity = commonTags.length / Math.max(request.tags.length, question.tags.length);
      return tagSimilarity;
    }
    
    return 0;
  }

  /**
   * 计算总相似度
   */
  private calculateTotalSimilarity(details: {
    contentSimilarity: number;
    structureSimilarity: number;
    semanticSimilarity: number;
  }): number {
    // 如果语义相似度为0（没有标签），则只计算内容相似度
    if (details.semanticSimilarity === 0) {
      return details.contentSimilarity;
    }
    
    // 有标签时，内容90%，标签10%
    return (
      details.contentSimilarity * 0.9 +
      details.semanticSimilarity * 0.1
    );
  }

  /**
   * 文本预处理
   */
  private preprocessText(text: string): string {
    return text
      .toLowerCase()
      // 保留数学符号和表达式
      .replace(/\\\$/g, 'MATH_DELIMITER') // 保护LaTeX数学符号
      .replace(/\$/g, 'MATH_DELIMITER')   // 保护数学符号
      .replace(/[^\w\u4e00-\u9fff\s\+\-\*\/\=\<\>\(\)\[\]\{\}\.\,\!\?\:\;]/g, ' ') // 保留数学符号
      .replace(/MATH_DELIMITER/g, '$')    // 恢复数学符号
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * 计算数学表达式相似度
   */
  private calculateMathExpressionSimilarity(text1: string, text2: string): number {
    // 提取数学表达式
    const mathExpressions1 = this.extractMathExpressions(text1);
    const mathExpressions2 = this.extractMathExpressions(text2);

    // 如果没有数学表达式，返回0
    if (mathExpressions1.length === 0 && mathExpressions2.length === 0) {
      return 0;
    }

    // 如果只有一个有数学表达式，返回低相似度
    if (mathExpressions1.length === 0 || mathExpressions2.length === 0) {
      return 0.1;
    }

    // 计算数学表达式的相似度
    let totalSimilarity = 0;
    let totalWeight = 0;

    for (const expr1 of mathExpressions1) {
      for (const expr2 of mathExpressions2) {
        const similarity = this.calculateSingleMathExpressionSimilarity(expr1, expr2);
        const weight = Math.max(expr1.length, expr2.length); // 权重基于表达式长度
        totalSimilarity += similarity * weight;
        totalWeight += weight;
      }
    }

    return totalWeight > 0 ? totalSimilarity / totalWeight : 0;
  }

  /**
   * 提取数学表达式
   */
  private extractMathExpressions(text: string): string[] {
    const expressions: string[] = [];
    
    // 匹配$...$格式的数学表达式
    const dollarMatches = text.match(/\$([^$]+)\$/g);
    if (dollarMatches) {
      expressions.push(...dollarMatches.map(match => match.slice(1, -1)));
    }

    // 匹配包含数学符号的表达式
    const mathPattern = /[\+\-\*\/\=\<\>\(\)\[\]\{\}][\w\+\-\*\/\=\<\>\(\)\[\]\{\}\.\,\s]*[\+\-\*\/\=\<\>\(\)\[\]\{\}]/g;
    const mathMatches = text.match(mathPattern);
    if (mathMatches) {
      expressions.push(...mathMatches);
    }

    // 匹配数字和变量的组合
    const numberVarPattern = /\d+[xXyYzZ]\s*[\+\-\*\/\=]\s*\d+/g;
    const numberVarMatches = text.match(numberVarPattern);
    if (numberVarMatches) {
      expressions.push(...numberVarMatches);
    }

    return expressions.filter(expr => expr.trim().length > 0);
  }

  /**
   * 计算单个数学表达式的相似度
   */
  private calculateSingleMathExpressionSimilarity(expr1: string, expr2: string): number {
    // 标准化表达式
    const normalized1 = this.normalizeMathExpression(expr1);
    const normalized2 = this.normalizeMathExpression(expr2);

    // 完全匹配
    if (normalized1 === normalized2) {
      return 1;
    }

    // 字符级相似度
    const chars1 = new Set(normalized1.split(''));
    const chars2 = new Set(normalized2.split(''));
    const charIntersection = new Set([...chars1].filter(x => chars2.has(x)));
    const charUnion = new Set([...chars1, ...chars2]);
    const charSimilarity = charUnion.size > 0 ? charIntersection.size / charUnion.size : 0;

    // 数字和变量匹配
    const numbers1 = normalized1.match(/\d+/g) || [];
    const numbers2 = normalized2.match(/\d+/g) || [];
    const variables1 = normalized1.match(/[xXyYzZ]/g) || [];
    const variables2 = normalized2.match(/[xXyYzZ]/g) || [];

    const numberSimilarity = this.calculateArraySimilarity(numbers1, numbers2);
    const variableSimilarity = this.calculateArraySimilarity(variables1, variables2);

    // 综合计算
    return (charSimilarity * 0.4 + numberSimilarity * 0.3 + variableSimilarity * 0.3);
  }

  /**
   * 标准化数学表达式
   */
  private normalizeMathExpression(expr: string): string {
    return expr
      .toLowerCase()
      .replace(/\s+/g, '') // 移除空格
      .replace(/\\left/g, '') // 移除LaTeX命令
      .replace(/\\right/g, '')
      .replace(/\\frac/g, '/')
      .replace(/\{/g, '(')
      .replace(/\}/g, ')');
  }

  /**
   * 计算数组相似度
   */
  private calculateArraySimilarity(arr1: string[], arr2: string[]): number {
    if (arr1.length === 0 && arr2.length === 0) return 1;
    if (arr1.length === 0 || arr2.length === 0) return 0;

    const set1 = new Set(arr1);
    const set2 = new Set(arr2);
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);

    return intersection.size / union.size;
  }

  /**
   * 计算词级相似度
   */
  private calculateWordSimilarity(words1: string[], words2: string[]): number {
    if (words1.length === 0 && words2.length === 0) return 1;
    if (words1.length === 0 || words2.length === 0) return 0;

    const set1 = new Set(words1);
    const set2 = new Set(words2);
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);

    return intersection.size / union.size;
  }

  /**
   * 计算答案相似度
   */
  private calculateAnswerSimilarity(answer1: string, answer2: string): number {
    if (!answer1 || !answer2) return 0;

    const cleanAnswer1 = this.preprocessText(answer1);
    const cleanAnswer2 = this.preprocessText(answer2);

    if (cleanAnswer1 === cleanAnswer2) return 1;

    const words1 = cleanAnswer1.split(/\s+/);
    const words2 = cleanAnswer2.split(/\s+/);
    
    const commonWords = words1.filter(word => words2.includes(word));
    const totalWords = Math.max(words1.length, words2.length);

    return totalWords > 0 ? commonWords.length / totalWords : 0;
  }

  /**
   * 生成相似度原因
   */
  private generateSimilarityReasons(details: {
    contentSimilarity: number;
    structureSimilarity: number;
    semanticSimilarity: number;
  }, totalScore: number): string[] {
    const reasons: string[] = [];

    if (details.contentSimilarity > 0.8) {
      reasons.push('题目内容高度相似');
    } else if (details.contentSimilarity > 0.6) {
      reasons.push('题目内容较为相似');
    }

    if (details.semanticSimilarity > 0.5) {
      reasons.push('知识点标签匹配');
    }

    if (totalScore > 0.9) {
      reasons.push('可能是重复题目');
    } else if (totalScore > 0.8) {
      reasons.push('建议检查是否为重复题目');
    }

    return reasons;
  }

  /**
   * 实时检测相似度（优化版本）
   */
  async detectSimilarityRealTime(stem: string, type: string, difficulty: number): Promise<{
    hasSimilar: boolean;
    similarCount: number;
    maxSimilarity: number;
  }> {
    try {
      // 快速预检查：如果题目内容太短，直接返回
      if (!stem || stem.trim().length < 10) {
        return {
          hasSimilar: false,
          similarCount: 0,
          maxSimilarity: 0
        };
      }

      const request: DetectionRequest = {
        stem,
        type,
        difficulty,
        tags: [],
        category: ''
      };

      // 使用更低的阈值进行快速检测
      const similarQuestions = await this.detectSimilarQuestions(request, 0.7);
      
      return {
        hasSimilar: similarQuestions.length > 0,
        similarCount: similarQuestions.length,
        maxSimilarity: similarQuestions.length > 0 ? similarQuestions[0].similarityScore : 0
      };
    } catch (error) {
      console.error('实时相似度检测失败:', error);
      return {
        hasSimilar: false,
        similarCount: 0,
        maxSimilarity: 0
      };
    }
  }
} 