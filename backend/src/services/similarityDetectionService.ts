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

// 数学题目预设关键字分类
interface MathKeywords {
  geometry: string[];
  algebra: string[];
  function: string[];
  calculus: string[];
  probability: string[];
  statistics: string[];
  trigonometry: string[];
  complex: string[];
  number_theory: string[];
  logic: string[];
}

export class SimilarityDetectionService {
  // 简单的内存缓存
  private cache = new Map<string, SimilarityResult[]>();
  private cacheTimeout = 5 * 60 * 1000; // 5分钟缓存
  
  // 数学题目关键字分类预设
  private readonly mathKeywords: MathKeywords = {
    geometry: [
      '几何', '图形', '三角形', '四边形', '圆形', '正方形', '长方形', '梯形', '平行四边形', '菱形',
      '面积', '周长', '体积', '表面积', '高', '底边', '半径', '直径', '角度', '垂直', '平行',
      '相似', '全等', '对称', '旋转', '平移', '立体几何', '空间', '坐标', '向量', '点线面',
      '直线', '射线', '线段', '交点', '切线', '弦', '弧', '扇形', '球', '圆锥', '圆柱',
      '正多边形', '内角', '外角', '中点', '重心', '外心', '内心', '垂心'
    ],
    algebra: [
      '代数', '方程', '不等式', '多项式', '因式分解', '配方', '二次函数', '一次函数',
      '系数', '常数', '变量', '解', '根', '判别式', '韦达定理', '展开', '合并同类项',
      '绝对值', '根式', '指数', '对数', '幂', '开方', '平方根', '立方根', '有理数',
      '无理数', '实数', '虚数', '复数', '分式', '约分', '通分', '最简分数', '倒数'
    ],
    function: [
      '函数', '定义域', '值域', '单调性', '奇偶性', '周期性', '对称性', '反函数',
      '复合函数', '分段函数', '反比例函数', '幂函数', '指数函数', '对数函数',
      '三角函数', '反三角函数', '最值', '零点', '极值', '渐近线', '图像', '性质'
    ],
    calculus: [
      '导数', '微分', '积分', '极限', '连续', '可导', '切线', '法线', '增减性',
      '凹凸性', '拐点', '最值', '优化', '变化率', '瞬时速度', '加速度', '牛顿',
      '莱布尼茨', '求导', '积分', '定积分', '不定积分', '微积分基本定理'
    ],
    probability: [
      '概率', '随机', '事件', '样本空间', '频率', '期望', '方差', '标准差',
      '独立', '互斥', '条件概率', '贝叶斯', '排列', '组合', '二项式', '正态分布',
      '均值', '中位数', '众数', '分布', '抽样', '估计', '检验', '置信区间'
    ],
    statistics: [
      '统计', '数据', '图表', '条形图', '折线图', '饼图', '直方图', '散点图',
      '平均数', '中位数', '众数', '极差', '方差', '标准差', '四分位数',
      '回归', '相关', '抽样', '调查', '频数', '频率', '累积频率', '总体', '样本'
    ],
    trigonometry: [
      '三角', '正弦', '余弦', '正切', '余切', '正割', '余割', 'sin', 'cos', 'tan',
      '弧度', '角度', '象限', '周期', '振幅', '相位', '和差化积', '积化和差',
      '倍角', '半角', '万能公式', '辅助角', '三角恒等式', '解三角形', '正弦定理', '余弦定理'
    ],
    complex: [
      '复数', '虚数', '实部', '虚部', '共轭', '模', '辐角', '极坐标', '代数形式',
      '三角形式', '指数形式', '复平面', '向量表示', 'i', '虚数单位'
    ],
    number_theory: [
      '数论', '整数', '质数', '合数', '因数', '倍数', '最大公约数', '最小公倍数',
      '互质', '同余', '模', '整除', '余数', '欧几里得算法', '费马小定理',
      '中国剩余定理', '哥德巴赫猜想', '完全数', '亲和数'
    ],
    logic: [
      '逻辑', '推理', '证明', '反证法', '数学归纳法', '充分', '必要', '充要',
      '且', '或', '非', '命题', '真假', '逆命题', '否命题', '逆否命题',
      '全称量词', '存在量词', '德摩根定律'
    ]
  };
  
  // 题目类别检测缓存
  private categoryCache = new Map<string, string[]>();

  /**
   * 检测题目的数学类别
   */
  private detectMathCategories(stem: string): string[] {
    // 检查缓存
    const cacheKey = stem.substring(0, 100);
    if (this.categoryCache.has(cacheKey)) {
      return this.categoryCache.get(cacheKey)!;
    }

    const cleanText = stem.toLowerCase();
    const detectedCategories: string[] = [];
    const categoryScores: { [key: string]: number } = {};

    // 为每个数学类别计算匹配分数
    Object.entries(this.mathKeywords).forEach(([category, keywords]) => {
      let score = 0;
      let matchedKeywords = 0;

      keywords.forEach((keyword: string) => {
        if (cleanText.includes(keyword.toLowerCase())) {
          score += keyword.length; // 关键字越长，权重越高
          matchedKeywords++;
        }
      });

      // 计算类别匹配度：匹配关键字数量 * 平均权重
      if (matchedKeywords > 0) {
        categoryScores[category] = score * Math.log(matchedKeywords + 1);
      }
    });

    // 选择得分最高的类别（至少要有一定分数）
    const sortedCategories = Object.entries(categoryScores)
      .sort(([,a], [,b]) => b - a)
      .filter(([,score]) => score >= 3); // 最低分数阈值

    // 取前3个最相关的类别
    const selectedCategories = sortedCategories.slice(0, 3).map(([category]) => category);
    
    // 缓存结果
    this.categoryCache.set(cacheKey, selectedCategories);
    
    return selectedCategories;
  }

  /**
   * 从检测到的类别生成相关标签
   */
  private generateTagsFromCategories(categories: string[]): string[] {
    const tags: string[] = [];
    
    categories.forEach(category => {
      // 为每个类别添加核心标签
      switch (category) {
        case 'geometry':
          tags.push('几何', '图形', '面积', '周长');
          break;
        case 'algebra':
          tags.push('代数', '方程', '不等式', '函数');
          break;
        case 'function':
          tags.push('函数', '定义域', '值域', '单调性');
          break;
        case 'calculus':
          tags.push('导数', '积分', '极限', '微分');
          break;
        case 'probability':
          tags.push('概率', '统计', '随机', '期望');
          break;
        case 'trigonometry':
          tags.push('三角函数', '正弦', '余弦', '正切');
          break;
        case 'complex':
          tags.push('复数', '虚数', '实部', '虚部');
          break;
        case 'number_theory':
          tags.push('数论', '整数', '质数', '因数');
          break;
        case 'logic':
          tags.push('逻辑', '推理', '证明', '命题');
          break;
      }
    });
    
    return [...new Set(tags)]; // 去重
  }

  /**
   * 检测相似题目
   */
  async detectSimilarQuestions(request: DetectionRequest, threshold: number = 0.8, excludeQuestionId?: string): Promise<SimilarityResult[]> {
    try {
      // 检查缓存
      const cacheKey = `${request.stem.substring(0, 100)}_${threshold}_${excludeQuestionId || 'none'}`;
      const cached = this.cache.get(cacheKey);
      if (cached) {
        console.log('使用缓存结果');
        return cached;
      }

      console.log('开始相似度检测:', { stem: request.stem.substring(0, 50) + '...', type: request.type, excludeId: excludeQuestionId });

      // 1. 智能分类和标签提取
      const detectedCategories = this.detectMathCategories(request.stem);
      const enhancedRequest = { ...request, detectedCategories };
      console.log('检测到的数学类别:', detectedCategories);

      // 2. 基于分类的智能过滤候选题目  
      const candidates = await this.getCandidateQuestions(enhancedRequest);
      console.log(`找到 ${candidates.length} 个候选题目`);

      // 3. 排除当前题目本身（如果提供了ID）
      const filteredCandidates = excludeQuestionId 
        ? candidates.filter(question => question._id?.toString() !== excludeQuestionId)
        : candidates;
      
      console.log(`排除当前题目后剩余 ${filteredCandidates.length} 个候选题目`);

      // 4. 计算相似度
      const similarityResults = filteredCandidates.map(question => {
        const similarityDetails = this.calculateSimilarityDetails(request, question);
        const totalScore = this.calculateTotalSimilarity(similarityDetails);
        
        return {
          question,
          similarityScore: totalScore,
          similarityDetails,
          reasons: this.generateSimilarityReasons(similarityDetails, totalScore)
        };
      });

      // 5. 筛选高相似度题目并限制返回数量
      const highSimilarityResults = similarityResults
        .filter(result => result.similarityScore >= threshold)
        .sort((a, b) => b.similarityScore - a.similarityScore)
        .slice(0, 10); // 最多返回10个相似题目

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
   * 获取候选题目（智能过滤）
   */
  private async getCandidateQuestions(request: DetectionRequest & { detectedCategories?: string[] }): Promise<any[]> {
    const query: any = {
      status: { $ne: 'deleted' }
    };

    // 优先使用检测到的类别生成标签进行筛选
    let targetTags: string[] = [];
    
    if (request.detectedCategories && request.detectedCategories.length > 0) {
      // 基于检测到的类别生成目标标签
      targetTags = this.generateTagsFromCategories(request.detectedCategories);
      console.log('基于分类生成的目标标签:', targetTags);
    }
    
    // 合并用户提供的标签
    if (request.tags && request.tags.length > 0) {
      targetTags = [...targetTags, ...request.tags];
    }
    
    // 去重标签
    targetTags = [...new Set(targetTags)];

    // 如果有目标标签，优先使用标签筛选
    if (targetTags.length > 0) {
      query.tags = { $in: targetTags };
    }

    // 如果没有标签，使用类别关键字进行内容匹配
    else if (request.detectedCategories && request.detectedCategories.length > 0) {
      const categoryKeywords: string[] = [];
      request.detectedCategories.forEach(category => {
        if (this.mathKeywords[category as keyof MathKeywords]) {
          categoryKeywords.push(...this.mathKeywords[category as keyof MathKeywords].slice(0, 5)); // 取前5个关键词
        }
      });
      
      if (categoryKeywords.length > 0) {
        // 使用$or进行内容匹配
        query.$or = categoryKeywords.map(keyword => ({
          'content.stem': { $regex: keyword, $options: 'i' }
        }));
      }
    }

    console.log('候选题目查询条件:', JSON.stringify(query, null, 2));

    // 获取候选题目，优化查询
    const candidates = await Question.find(query)
      .select('content tags category difficulty type _id') // 添加_id字段用于去重
      .sort({ createdAt: -1 })
      .limit(100); // 减少候选数量以提高性能

    console.log(`数据库查询返回 ${candidates.length} 个候选题目`);
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
  async detectSimilarityRealTime(stem: string, type: string, difficulty: number, excludeQuestionId?: string): Promise<{
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

      // 使用更高的阈值进行快速检测，避免推送不相关的题目
      const similarQuestions = await this.detectSimilarQuestions(request, 0.75, excludeQuestionId);
      
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