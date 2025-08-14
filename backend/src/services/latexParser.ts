import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

export interface LaTeXQuestion {
  _id: string;
  type: 'choice' | 'fill' | 'solution';
  content: {
    stem: string;
    options?: Array<{ text: string; isCorrect: boolean }>;
    answer?: string;
    analysis?: string;
  };
  subQuestions?: LaTeXSubQuestion[];
  difficulty?: number;
  category?: string;
  tags?: string[];
  source: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface LaTeXSubQuestion {
  id: string;
  type: 'numeric' | 'circle' | 'roman' | 'alphabetic' | 'custom';
  content: string;
  answer?: string;
  analysis?: string;
  order: number;
}

export interface LaTeXParseResult {
  questions: LaTeXQuestion[];
  subQuestions: LaTeXSubQuestion[];
  mathFormulas: number;
  images: number;
  tables: number;
  confidence: number;
  errors: Array<{
    id: string;
    type: 'parsing' | 'format' | 'content';
    message: string;
    line?: number;
    severity: 'error' | 'warning' | 'info';
  }>;
  warnings: Array<{
    id: string;
    type: 'format' | 'content' | 'quality';
    message: string;
    suggestion: string;
  }>;
}

export class LaTeXParser {
  private errors: LaTeXParseResult['errors'] = [];
  private warnings: LaTeXParseResult['warnings'] = [];
  private mathFormulas = 0;
  private images = 0;
  private tables = 0;

  /**
   * 解析LaTeX文档
   */
  async parseLaTeXDocument(filePath: string): Promise<LaTeXParseResult> {
    try {
      console.log('开始解析LaTeX文档:', filePath);
      
      const content = fs.readFileSync(filePath, 'utf-8');
      console.log('LaTeX文档内容长度:', content.length);
      
      // 预处理内容
      const preprocessedContent = this.preprocessContent(content);
      
      // 识别题目环境
      const questionEnvironments = this.identifyQuestionEnvironments(preprocessedContent);
      
      // 解析题目
      const questions: LaTeXQuestion[] = [];
      const allSubQuestions: LaTeXSubQuestion[] = [];
      
      for (const env of questionEnvironments) {
        try {
          const question = this.parseQuestionEnvironment(env, 'LaTeX文档');
          if (question) {
            questions.push(question);
            if (question.subQuestions) {
              allSubQuestions.push(...question.subQuestions);
            }
          }
        } catch (error) {
          console.error('解析题目环境失败:', error);
          this.errors.push({
            id: `env_${Date.now()}`,
            type: 'parsing',
            message: `解析题目环境失败: ${error}`,
            severity: 'error'
          });
        }
      }
      
      return {
        questions,
        subQuestions: allSubQuestions,
        mathFormulas: this.mathFormulas,
        images: this.images,
        tables: this.tables,
        confidence: this.calculateConfidence(questions.length, content.length),
        errors: this.errors,
        warnings: this.warnings
      };
      
    } catch (error: any) {
      console.error('LaTeX文档解析失败:', error);
      throw new Error(`LaTeX解析失败: ${error.message}`);
    }
  }

  /**
   * 预处理LaTeX内容
   */
  private preprocessContent(content: string): string {
    // 移除注释
    let processed = content.replace(/%.*$/gm, '');
    
    // 移除无关的LaTeX命令
    const irrelevantCommands = [
      /\\documentclass.*$/gm,
      /\\usepackage.*$/gm,
      /\\begin\{document\}/g,
      /\\end\{document\}/g,
      /\\title.*$/gm,
      /\\author.*$/gm,
      /\\date.*$/gm,
      /\\maketitle/g,
      /\\tableofcontents/g,
      /\\newpage/g,
      /\\clearpage/g,
      /\\pagebreak/g
    ];
    
    irrelevantCommands.forEach(cmd => {
      processed = processed.replace(cmd, '');
    });
    
    // 统计数学公式
    const mathPatterns = [
      /\$[^$]+\$/g,  // 行内公式
      /\\\[[^\]]*\\\]/g,  // 行间公式
      /\\begin\{equation\}[^]*?\\end\{equation\}/g,  // equation环境
      /\\begin\{align\}[^]*?\\end\{align\}/g,  // align环境
      /\\begin\{gather\}[^]*?\\end\{gather\}/g,  // gather环境
    ];
    
    mathPatterns.forEach(pattern => {
      const matches = processed.match(pattern);
      if (matches) {
        this.mathFormulas += matches.length;
      }
    });
    
    return processed;
  }

  /**
   * 识别题目环境
   */
  private identifyQuestionEnvironments(content: string): string[] {
    const environments: string[] = [];
    
    // 常见的题目环境
    const questionEnvs = [
      'exercise',
      'question', 
      'problem',
      'task',
      'assignment',
      'homework',
      'quiz',
      'test',
      'exam'
    ];
    
    questionEnvs.forEach(env => {
      const pattern = new RegExp(`\\\\begin\\{${env}\\}([^]*?)\\\\end\\{${env}\\}`, 'g');
      let match;
      while ((match = pattern.exec(content)) !== null) {
        environments.push(match[1]);
      }
    });
    
    // 如果没有找到标准环境，尝试识别题目模式
    if (environments.length === 0) {
      const questionPatterns = [
        /\\item\[[^\]]*\]/g,  // \item[题号]
        /\\item\s*[0-9]+[\.、]/g,  // \item 1.
        /\\item\s*[A-Z][\.、]/g,  // \item A.
        /\\item\s*[一二三四五六七八九十]+[\.、]/g,  // \item 一、
      ];
      
      // 分割内容为题目块
      const blocks = content.split(/(?=\\item)/);
      blocks.forEach(block => {
        if (questionPatterns.some(pattern => pattern.test(block))) {
          environments.push(block);
        }
      });
    }
    
    return environments;
  }

  /**
   * 解析题目环境
   */
  private parseQuestionEnvironment(envContent: string, source: string): LaTeXQuestion | null {
    try {
      // 清理环境内容
      const cleanContent = this.cleanEnvironmentContent(envContent);
      
      if (!cleanContent.trim()) {
        return null;
      }
      
      // 解析小问
      const subQuestions = this.parseSubQuestions(cleanContent);
      
      // 提取主题目内容
      const mainContent = this.extractMainQuestion(cleanContent, subQuestions);
      
      // 分析题型
      const questionType = this.analyzeQuestionType(mainContent);
      
      // 提取选项（如果是选择题）
      const options = questionType === 'choice' ? this.extractOptions(mainContent) : undefined;
      
      // 提取答案和解析
      const { answer, analysis } = this.extractAnswerAndAnalysis(mainContent);
      
      // 分析难度和分类
      const difficulty = this.estimateDifficulty(mainContent);
      const category = this.analyzeCategory(mainContent);
      const tags = this.extractTags(mainContent);
      
      return {
        _id: uuidv4(),
        type: questionType,
        content: {
          stem: mainContent,
          options,
          answer,
          analysis
        },
        subQuestions: subQuestions.length > 0 ? subQuestions : undefined,
        difficulty,
        category,
        tags,
        source,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
    } catch (error) {
      console.error('解析题目环境失败:', error);
      return null;
    }
  }

  /**
   * 解析小问
   */
  private parseSubQuestions(content: string): LaTeXSubQuestion[] {
    const subQuestions: LaTeXSubQuestion[] = [];
    
    // 小问模式定义
    const subQuestionPatterns = [
      {
        regex: /\\item\[\((\d+)\)\]/g,
        type: 'numeric' as const,
        extractor: (match: RegExpExecArray) => ({
          id: match[1],
          order: parseInt(match[1]),
          content: this.extractItemContent(match[0], content)
        })
      },
      {
        regex: /\\item\[\\textcircled\{(\d+)\}\]/g,
        type: 'circle' as const,
        extractor: (match: RegExpExecArray) => ({
          id: match[1],
          order: parseInt(match[1]),
          content: this.extractItemContent(match[0], content)
        })
      },
      {
        regex: /\\item\[\\roman\*\]/g,
        type: 'roman' as const,
        extractor: (match: RegExpExecArray, index: number) => ({
          id: this.numberToRoman(index + 1),
          order: index + 1,
          content: this.extractItemContent(match[0], content)
        })
      },
      {
        regex: /\\item\[\\alph\*\]/g,
        type: 'alphabetic' as const,
        extractor: (match: RegExpExecArray, index: number) => ({
          id: String.fromCharCode(97 + index), // a, b, c, ...
          order: index + 1,
          content: this.extractItemContent(match[0], content)
        })
      },
      {
        regex: /\\item\[([^\]]+)\]/g,
        type: 'custom' as const,
        extractor: (match: RegExpExecArray, index: number) => ({
          id: match[1],
          order: index + 1,
          content: this.extractItemContent(match[0], content)
        })
      }
    ];
    
    subQuestionPatterns.forEach(pattern => {
      let match;
      let index = 0;
      while ((match = pattern.regex.exec(content)) !== null) {
        const extracted = pattern.extractor(match, index);
        if (extracted.content.trim()) {
          const { answer, analysis } = this.extractAnswerAndAnalysis(extracted.content);
          
          subQuestions.push({
            id: extracted.id,
            type: pattern.type,
            content: extracted.content,
            answer,
            analysis,
            order: extracted.order
          });
        }
        index++;
      }
    });
    
    // 按顺序排序
    return subQuestions.sort((a, b) => a.order - b.order);
  }

  /**
   * 提取item内容
   */
  private extractItemContent(itemMatch: string, fullContent: string): string {
    const itemIndex = fullContent.indexOf(itemMatch);
    if (itemIndex === -1) return '';
    
    const afterItem = fullContent.substring(itemIndex + itemMatch.length);
    
    // 找到下一个item或环境结束
    const nextItemMatch = afterItem.match(/\\item\[/);
    const envEndMatch = afterItem.match(/\\end\{/);
    
    let endIndex = afterItem.length;
    if (nextItemMatch && (!envEndMatch || nextItemMatch.index! < envEndMatch.index!)) {
      endIndex = nextItemMatch.index!;
    } else if (envEndMatch) {
      endIndex = envEndMatch.index!;
    }
    
    return afterItem.substring(0, endIndex).trim();
  }

  /**
   * 提取主题目内容
   */
  private extractMainQuestion(content: string, subQuestions: LaTeXSubQuestion[]): string {
    let mainContent = content;
    
    // 移除所有小问内容
    subQuestions.forEach(subQ => {
      const subPattern = new RegExp(`\\\\item\\[.*?\\].*?${this.escapeRegex(subQ.content)}`, 's');
      mainContent = mainContent.replace(subPattern, '');
    });
    
    // 清理剩余内容
    mainContent = this.cleanQuestionText(mainContent);
    
    return mainContent;
  }

  /**
   * 清理环境内容
   */
  private cleanEnvironmentContent(content: string): string {
    return content
      .replace(/^\s*\\item\s*/, '')  // 移除开头的\item
      .replace(/\\end\{[^}]*\}$/, '')  // 移除环境结束标记
      .trim();
  }

  /**
   * 清理题目文本
   */
  private cleanQuestionText(text: string): string {
    return text
      .replace(/^\d+[\.、]\s*/, '')  // 移除题号
      .replace(/^[（\(]\d+[）\)]\s*/, '')  // 移除括号题号
      .replace(/^[一二三四五六七八九十]+[\.、]\s*/, '')  // 移除中文题号
      .trim();
  }

  /**
   * 分析题型
   */
  private analyzeQuestionType(text: string): 'choice' | 'fill' | 'solution' {
    const lowerText = text.toLowerCase();
    
    // 选择题特征
    if (lowerText.includes('选择') || 
        lowerText.includes('choose') || 
        lowerText.includes('select') ||
        /\\(a|b|c|d)[\.、]/.test(text) ||
        /[A-D][\.、]/.test(text)) {
      return 'choice';
    }
    
    // 填空题特征
    if (lowerText.includes('填空') || 
        lowerText.includes('fill') || 
        lowerText.includes('blank') ||
        /\\underline\{[^}]*\}/.test(text) ||
        /\\boxed\{[^}]*\}/.test(text)) {
      return 'fill';
    }
    
    // 默认解答题
    return 'solution';
  }

  /**
   * 提取选项
   */
  private extractOptions(text: string): Array<{ text: string; isCorrect: boolean }> {
    const options: Array<{ text: string; isCorrect: boolean }> = [];
    
    // 匹配选项模式
    const optionPatterns = [
      /\\(a|b|c|d)[\.、]\s*([^\\]+)/g,
      /[A-D][\.、]\s*([^\\]+)/g,
      /[A-D]\)\s*([^\\]+)/g
    ];
    
    optionPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        const optionText = match[2] || match[1];
        if (optionText.trim()) {
          options.push({
            text: this.cleanOptionText(optionText),
            isCorrect: false  // 默认不正确，需要进一步分析
          });
        }
      }
    });
    
    return options;
  }

  /**
   * 清理选项文本
   */
  private cleanOptionText(text: string): string {
    return text
      .replace(/^\s*[A-D][\.、\)]\s*/, '')  // 移除选项标记
      .trim();
  }

  /**
   * 提取答案和解析
   */
  private extractAnswerAndAnalysis(text: string): { answer?: string; analysis?: string } {
    let answer: string | undefined;
    let analysis: string | undefined;
    
    // 答案模式
    const answerPatterns = [
      /答案[：:]\s*([^\\]+)/,
      /answer[：:]\s*([^\\]+)/i,
      /解[：:]\s*([^\\]+)/,
      /solution[：:]\s*([^\\]+)/i
    ];
    
    answerPatterns.forEach(pattern => {
      const match = text.match(pattern);
      if (match) {
        answer = match[1].trim();
      }
    });
    
    // 解析模式
    const analysisPatterns = [
      /解析[：:]\s*([^\\]+)/,
      /analysis[：:]\s*([^\\]+)/i,
      /说明[：:]\s*([^\\]+)/
    ];
    
    analysisPatterns.forEach(pattern => {
      const match = text.match(pattern);
      if (match) {
        analysis = match[1].trim();
      }
    });
    
    return { answer, analysis };
  }

  /**
   * 估算难度
   */
  private estimateDifficulty(text: string): number {
    let score = 3; // 默认中等难度
    
    const lowerText = text.toLowerCase();
    
    // 根据关键词调整难度
    if (lowerText.includes('简单') || lowerText.includes('基础')) score -= 1;
    if (lowerText.includes('困难') || lowerText.includes('复杂')) score += 1;
    if (lowerText.includes('证明') || lowerText.includes('推导')) score += 1;
    if (lowerText.includes('计算') || lowerText.includes('运算')) score += 0.5;
    
    // 根据长度调整难度
    if (text.length > 200) score += 0.5;
    if (text.length > 500) score += 0.5;
    
    return Math.max(1, Math.min(5, Math.round(score)));
  }

  /**
   * 分析分类
   */
  private analyzeCategory(text: string): string {
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('函数') || lowerText.includes('f(x)')) return '函数';
    if (lowerText.includes('导数') || lowerText.includes('f\'(x)')) return '导数';
    if (lowerText.includes('积分') || lowerText.includes('∫')) return '积分';
    if (lowerText.includes('极限') || lowerText.includes('lim')) return '极限';
    if (lowerText.includes('方程') || lowerText.includes('=')) return '方程';
    if (lowerText.includes('不等式')) return '不等式';
    if (lowerText.includes('几何') || lowerText.includes('图形')) return '几何';
    if (lowerText.includes('代数')) return '代数';
    
    return '数学';
  }

  /**
   * 提取标签
   */
  private extractTags(text: string): string[] {
    const tags: string[] = [];
    const lowerText = text.toLowerCase();
    
    // 数学概念标签
    const mathConcepts = ['函数', '导数', '积分', '极限', '方程', '不等式', '几何', '代数'];
    for (const concept of mathConcepts) {
      if (lowerText.includes(concept.toLowerCase())) {
        tags.push(concept);
      }
    }
    
    return tags;
  }

  /**
   * 计算置信度
   */
  private calculateConfidence(questionCount: number, textLength: number): number {
    if (questionCount === 0) return 0;
    
    // 基于题目数量和文本长度的简单置信度计算
    const baseConfidence = Math.min(95, questionCount * 10);
    const lengthFactor = Math.min(100, textLength / 1000);
    
    return Math.round((baseConfidence + lengthFactor) / 2);
  }

  /**
   * 数字转罗马数字
   */
  private numberToRoman(num: number): string {
    const romanNumerals = [
      { value: 10, numeral: 'X' },
      { value: 9, numeral: 'IX' },
      { value: 5, numeral: 'V' },
      { value: 4, numeral: 'IV' },
      { value: 1, numeral: 'I' }
    ];
    
    let result = '';
    let remaining = num;
    
    for (const { value, numeral } of romanNumerals) {
      while (remaining >= value) {
        result += numeral;
        remaining -= value;
      }
    }
    
    return result;
  }

  /**
   * 转义正则表达式特殊字符
   */
  private escapeRegex(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}

export default LaTeXParser; 