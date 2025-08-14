import fs from 'fs';
import path from 'path';
import mammoth from 'mammoth';
import pdfParse from 'pdf-parse';
import { v4 as uuidv4 } from 'uuid';
import LaTeXParser from './latexParser';
import { splitPDFIntoPages, extractContentFromArea } from '../utils/pdfUtils';
import { 
  ParsedQuestion, 
  DocumentParseResult, 
  Area, 
  FileType 
} from '../types/document';

export class DocumentParser {
  private errors: DocumentParseResult['errors'] = [];
  private warnings: DocumentParseResult['warnings'] = [];
  private mathFormulas = 0;
  private images = 0;
  private tables = 0;

  // Word文档解析器
  async parseWordDocument(filePath: string): Promise<DocumentParseResult> {
    try {
      console.log('开始解析Word文档:', filePath);
      
      // 检查文件扩展名
      const ext = path.extname(filePath).toLowerCase();
      
      if (ext === '.txt') {
        // 如果是txt文件，直接读取文本
        const content = fs.readFileSync(filePath, 'utf-8');
        console.log('文本文件内容长度:', content.length);
        const questions = this.extractQuestionsFromText(content, 'Word文档');
        
        return {
          questions,
          pages: this.estimatePages(content),
          mathFormulas: this.mathFormulas,
          images: this.images,
          tables: this.tables,
          confidence: this.calculateConfidence(questions.length, content.length),
          errors: this.errors,
          warnings: this.warnings
        };
      } else {
        // 使用mammoth解析Word文档
        const result = await mammoth.extractRawText({ path: filePath });
        const text = result.value;
        
        console.log('Word文档提取的文本长度:', text.length);
        
        // 分析文本内容
        const questions = this.extractQuestionsFromText(text, 'Word文档');
        
        return {
          questions,
          pages: this.estimatePages(text),
          mathFormulas: this.mathFormulas,
          images: this.images,
          tables: this.tables,
          confidence: this.calculateConfidence(questions.length, text.length),
          errors: this.errors,
          warnings: this.warnings
        };
      }
    } catch (error: any) {
      console.error('Word文档解析失败:', error);
      this.errors.push({
        id: uuidv4(),
        type: 'parsing',
        message: `Word文档解析失败: ${error.message}`,
        severity: 'error'
      });
      throw error;
    }
  }

  // PDF文档解析器
  async parsePDFDocument(filePath: string): Promise<DocumentParseResult> {
    try {
      console.log('开始解析PDF文档:', filePath);
      
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdfParse(dataBuffer);
      const text = data.text;
      
      console.log('PDF文档提取的文本长度:', text.length);
      console.log('PDF页数:', data.numpages);
      
      // 分析文本内容
      const questions = this.extractQuestionsFromText(text, 'PDF文档');
      
      return {
        questions,
        pages: data.numpages,
        mathFormulas: this.mathFormulas,
        images: this.images,
        tables: this.tables,
        confidence: this.calculateConfidence(questions.length, text.length),
        errors: this.errors,
        warnings: this.warnings
      };
    } catch (error: any) {
      console.error('PDF文档解析失败:', error);
      this.errors.push({
        id: uuidv4(),
        type: 'parsing',
        message: `PDF文档解析失败: ${error.message}`,
        severity: 'error'
      });
      throw error;
    }
  }

  // LaTeX文档解析器
  async parseLaTeXDocument(filePath: string): Promise<DocumentParseResult> {
    try {
      console.log('开始解析LaTeX文档:', filePath);
      
      // 使用增强的LaTeX解析器
      const latexParser = new LaTeXParser();
      const result = await latexParser.parseLaTeXDocument(filePath);
      
      // 转换为通用格式
      const questions: ParsedQuestion[] = result.questions.map(q => ({
        _id: q._id,
        type: q.type,
        content: {
          stem: q.content.stem,
          options: q.content.options,
          answer: q.content.answer
        },
        difficulty: q.difficulty,
        category: q.category,
        tags: q.tags,
        source: q.source,
        createdAt: q.createdAt,
        updatedAt: q.updatedAt
      }));
      
      return {
        questions,
        pages: this.estimatePages(result.questions.map(q => q.content.stem).join('')),
        mathFormulas: result.mathFormulas,
        images: result.images,
        tables: result.tables,
        confidence: result.confidence,
        errors: result.errors,
        warnings: result.warnings
      };
      
    } catch (error: any) {
      console.error('LaTeX文档解析失败:', error);
      this.errors.push({
        id: uuidv4(),
        type: 'parsing',
        message: `LaTeX文档解析失败: ${error.message}`,
        severity: 'error'
      });
      throw error;
    }
  }

  // 从文本中提取题目
  private extractQuestionsFromText(text: string, source: string): ParsedQuestion[] {
    const questions: ParsedQuestion[] = [];
    
    // 分割文本为段落
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
    
    console.log('检测到段落数:', paragraphs.length);
    
    let currentQuestion: Partial<ParsedQuestion> | null = null;
    let questionIndex = 0;
    
    for (let i = 0; i < paragraphs.length; i++) {
      const paragraph = paragraphs[i].trim();
      
      // 跳过太短的段落
      if (paragraph.length < 10) continue;
      
      // 检测题目编号模式
      const questionPatterns = [
        /^\d+[\.、]\s*/, // 1. 或 1、
        /^[（\(]\d+[）\)]\s*/, // (1) 或 （1）
        /^[一二三四五六七八九十]+[\.、]\s*/, // 一、 二、
        /^[ABCD][\.、]\s*/, // A. B.
      ];
      
      const isQuestionStart = questionPatterns.some(pattern => pattern.test(paragraph));
      
      if (isQuestionStart) {
        // 保存前一个题目
        if (currentQuestion && currentQuestion.content?.stem) {
          questions.push(this.finalizeQuestion(currentQuestion, source));
          questionIndex++;
        }
        
        // 开始新题目
        currentQuestion = {
          _id: uuidv4(),
          content: { stem: this.cleanQuestionText(paragraph) }
        };
        
        // 分析题目类型
        const questionType = this.analyzeQuestionType(paragraph);
        currentQuestion.type = questionType;
        
        // 如果是选择题，尝试从题干中提取选项
        if (questionType === 'choice' && currentQuestion.content) {
          const options = this.extractOptionsFromStem(paragraph);
          if (options.length > 0) {
            currentQuestion.content.options = options;
          }
        }
        
      } else if (currentQuestion && currentQuestion.content) {
        // 检查是否是选项
        const optionPattern = /^[ABCD][\.、]\s*/;
        if (optionPattern.test(paragraph)) {
          if (!currentQuestion.content.options) {
            currentQuestion.content.options = [];
          }
          
          const optionText = this.cleanQuestionText(paragraph);
          currentQuestion.content.options.push({
            text: optionText,
            isCorrect: false // 暂时设为false，后续可以通过AI分析
          });
        } else {
          // 可能是答案或解析
          if (paragraph.includes('答案') || paragraph.includes('答：')) {
            currentQuestion.content.answer = this.extractAnswer(paragraph);
          } else if (paragraph.includes('解：') || paragraph.includes('解析')) {
            // 将解析添加到题干
            currentQuestion.content.stem += '\n\n' + paragraph;
          }
        }
      }
    }
    
    // 保存最后一个题目
    if (currentQuestion && currentQuestion.content?.stem) {
      questions.push(this.finalizeQuestion(currentQuestion, source));
    }
    
    console.log('提取到题目数:', questions.length);
    return questions;
  }

  // 从题干中提取选项
  private extractOptionsFromStem(stem: string): Array<{ text: string; isCorrect: boolean }> {
    const options: Array<{ text: string; isCorrect: boolean }> = [];
    
    // 匹配选项模式
    const optionPatterns = [
      /[ABCD][\.、]\s*([^ABCD\n]+)/g,
      /[ABCD][）\)]\s*([^ABCD\n]+)/g,
    ];
    
    for (const pattern of optionPatterns) {
      const matches = stem.match(pattern);
      if (matches) {
        for (const match of matches) {
          const optionText = match.replace(/^[ABCD][\.、）\)]\s*/, '').trim();
          if (optionText.length > 0) {
            options.push({
              text: optionText,
              isCorrect: false // 暂时设为false
            });
          }
        }
      }
    }
    
    return options;
  }

  // 从LaTeX中提取题目
  private extractQuestionsFromLaTeX(content: string, source: string): ParsedQuestion[] {
    const questions: ParsedQuestion[] = [];
    
    // 统计数学公式
    this.mathFormulas = (content.match(/\$[^$]+\$/g) || []).length + 
                       (content.match(/\\\[[^\]]*\\\]/g) || []).length;
    
    // 提取题目环境
    const questionEnvironments = [
      /\\begin\{enumerate\}(.*?)\\end\{enumerate\}/gs,
      /\\begin\{itemize\}(.*?)\\end\{itemize\}/gs,
      /\\begin\{questions\}(.*?)\\end\{questions\}/gs,
    ];
    
    for (const pattern of questionEnvironments) {
      const matches = content.match(pattern);
      if (matches) {
        for (const match of matches) {
          const questionsInEnv = this.extractQuestionsFromLaTeXEnvironment(match, source);
          questions.push(...questionsInEnv);
        }
      }
    }
    
    // 如果没有找到题目环境，尝试从item中提取
    if (questions.length === 0) {
      const itemMatches = content.match(/\\item\s*(.*?)(?=\\item|$)/gs);
      if (itemMatches) {
        for (const item of itemMatches) {
          const questionText = item.replace(/\\item\s*/, '').trim();
          if (questionText.length > 10) {
            const question = this.createQuestionFromText(questionText, source);
            questions.push(question);
          }
        }
      }
    }
    
    console.log('从LaTeX提取到题目数:', questions.length);
    return questions;
  }

  // 从LaTeX环境中提取题目
  private extractQuestionsFromLaTeXEnvironment(envContent: string, source: string): ParsedQuestion[] {
    const questions: ParsedQuestion[] = [];
    
    // 提取item
    const items = envContent.match(/\\item\s*(.*?)(?=\\item|$)/gs);
    if (!items) return questions;
    
    for (const item of items) {
      const questionText = item.replace(/\\item\s*/, '').trim();
      if (questionText.length > 10) {
        const question = this.createQuestionFromText(questionText, source);
        questions.push(question);
      }
    }
    
    return questions;
  }

  // 从文本创建题目
  private createQuestionFromText(text: string, source: string): ParsedQuestion {
    const cleanText = this.cleanQuestionText(text);
    const questionType = this.analyzeQuestionType(cleanText);
    
    return {
      _id: uuidv4(),
      type: questionType,
      content: {
        stem: cleanText,
        options: questionType === 'choice' ? this.extractOptions(text) : undefined,
        answer: this.extractAnswer(text)
      },
      difficulty: this.estimateDifficulty(cleanText),
      category: this.analyzeCategory(cleanText),
      tags: this.extractTags(cleanText),
      source,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  // 分析题目类型
  private analyzeQuestionType(text: string): 'choice' | 'fill' | 'solution' {
    const lowerText = text.toLowerCase();
    
    // 选择题特征
    if (lowerText.includes('选择') || 
        lowerText.includes('a.') || lowerText.includes('b.') || 
        lowerText.includes('c.') || lowerText.includes('d.') ||
        lowerText.includes('a）') || lowerText.includes('b）') ||
        lowerText.includes('c）') || lowerText.includes('d）') ||
        /[ABCD][\.、）\)]\s/.test(text)) {
      return 'choice';
    }
    
    // 填空题特征
    if (lowerText.includes('填空') || 
        lowerText.includes('_____') || 
        lowerText.includes('\\fill') ||
        lowerText.includes('\\underline') ||
        /[（\(]\s*[）\)]/.test(text)) {
      return 'fill';
    }
    
    // 默认为解答题
    return 'solution';
  }

  // 提取选项
  private extractOptions(text: string): Array<{ text: string; isCorrect: boolean }> {
    const options: Array<{ text: string; isCorrect: boolean }> = [];
    
    // 匹配选项模式
    const optionPatterns = [
      /[ABCD][\.、]\s*([^ABCD\n]+)/g,
      /[ABCD][）\)]\s*([^ABCD\n]+)/g,
    ];
    
    for (const pattern of optionPatterns) {
      const matches = text.match(pattern);
      if (matches) {
        for (const match of matches) {
          const optionText = match.replace(/^[ABCD][\.、）\)]\s*/, '').trim();
          if (optionText.length > 0) {
            options.push({
              text: optionText,
              isCorrect: false // 暂时设为false
            });
          }
        }
      }
    }
    
    return options;
  }

  // 提取答案
  private extractAnswer(text: string): string | undefined {
    const answerPatterns = [
      /答案[：:]\s*(.+)/,
      /答[：:]\s*(.+)/,
      /参考答案[：:]\s*(.+)/,
    ];
    
    for (const pattern of answerPatterns) {
      const match = text.match(pattern);
      if (match) {
        return match[1].trim();
      }
    }
    
    return undefined;
  }

  // 清理题目文本
  private cleanQuestionText(text: string): string {
    return text
      .replace(/^\d+[\.、]\s*/, '') // 移除题号
      .replace(/^[（\(]\d+[）\)]\s*/, '') // 移除括号题号
      .replace(/^[一二三四五六七八九十]+[\.、]\s*/, '') // 移除中文题号
      .trim();
  }

  // 估算难度
  private estimateDifficulty(text: string): number {
    const lowerText = text.toLowerCase();
    
    // 简单题目特征
    if (lowerText.includes('简单') || lowerText.includes('基础')) {
      return 1;
    }
    
    // 中等题目特征
    if (lowerText.includes('中等') || lowerText.includes('一般')) {
      return 2;
    }
    
    // 困难题目特征
    if (lowerText.includes('困难') || lowerText.includes('复杂') || lowerText.includes('综合')) {
      return 4;
    }
    
    // 默认中等难度
    return 3;
  }

  // 分析分类
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

  // 提取标签
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

  // 估算页数
  private estimatePages(text: string): number {
    // 假设每页约2000字符
    return Math.max(1, Math.ceil(text.length / 2000));
  }

  // 计算置信度
  private calculateConfidence(questionCount: number, textLength: number): number {
    if (questionCount === 0) return 0;
    
    // 基于题目数量和文本长度的简单置信度计算
    const baseConfidence = Math.min(95, questionCount * 10);
    const lengthFactor = Math.min(100, textLength / 1000);
    
    return Math.round((baseConfidence + lengthFactor) / 2);
  }

  // 完成题目创建
  private finalizeQuestion(question: Partial<ParsedQuestion>, source: string): ParsedQuestion {
    return {
      _id: question._id || uuidv4(),
      type: question.type || 'solution',
      content: {
        stem: question.content?.stem || '',
        options: question.content?.options,
        answer: question.content?.answer
      },
      difficulty: question.difficulty || 3,
      category: question.category || '数学',
      tags: question.tags || [],
      source,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  /**
   * 解析用户选择的区域
   */
  async parseSelectedAreas(filePath: string, areas: Array<{
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
    pageNumber: number;
  }>, fileType: string): Promise<DocumentParseResult> {
    try {
      console.log('开始解析选择区域:', areas.length, '个区域');
      
      const allQuestions: ParsedQuestion[] = [];
      let totalMathFormulas = 0;
      let totalImages = 0;
      let totalTables = 0;
      let totalConfidence = 0;
      
      for (const area of areas) {
        try {
          console.log(`处理区域 ${area.id}:`, area);
          
          // 根据文件类型提取区域内容
          let areaContent = '';
          
          switch (fileType) {
            case 'pdf':
              areaContent = await this.extractPDFArea(filePath, area);
              break;
            case 'word':
              areaContent = await this.extractWordArea(filePath, area);
              break;
            case 'latex':
              areaContent = await this.extractLaTeXArea(filePath, area);
              break;
            default:
              throw new Error(`不支持的文件类型: ${fileType}`);
          }
          
          if (areaContent.trim()) {
            // 从区域内容中提取题目
            const questions = this.extractQuestionsFromText(areaContent, `区域${area.id}`);
            
            // 为题目添加区域信息
            questions.forEach(q => {
              q.source = `${q.source}·区域${area.id}`;
            });
            
            allQuestions.push(...questions);
            
            // 累计统计信息
            totalMathFormulas += this.mathFormulas;
            totalImages += this.images;
            totalTables += this.tables;
            totalConfidence += this.calculateConfidence(questions.length, areaContent.length);
          }
          
        } catch (error) {
          console.error(`处理区域 ${area.id} 失败:`, error);
          this.errors.push({
            id: `area_${area.id}`,
            type: 'parsing',
            message: `区域 ${area.id} 解析失败: ${error}`,
            severity: 'error'
          });
        }
      }
      
      const avgConfidence = areas.length > 0 ? totalConfidence / areas.length : 0;
      
      return {
        questions: allQuestions,
        pages: Math.max(...areas.map(a => a.pageNumber)),
        mathFormulas: totalMathFormulas,
        images: totalImages,
        tables: totalTables,
        confidence: avgConfidence,
        errors: this.errors,
        warnings: this.warnings
      };
      
    } catch (error: any) {
      console.error('区域解析失败:', error);
      throw new Error(`区域解析失败: ${error.message}`);
    }
  }

  /**
   * 从PDF中提取指定区域的内容
   */
  private async extractPDFArea(filePath: string, area: any): Promise<string> {
    try {
      console.log('PDF区域提取:', area);
      
      // 使用pdf-parse提取PDF文本内容
      const dataBuffer = fs.readFileSync(filePath);
      const fullText = (await pdfParse(dataBuffer)).text;
      
      // 分析PDF页面结构
      const pages = splitPDFIntoPages(fullText);
      
      // 获取指定页面的内容
      const targetPageIndex = area.pageNumber - 1; // 转换为0基索引
      if (targetPageIndex < 0 || targetPageIndex >= pages.length) {
        console.warn(`页面索引超出范围: ${targetPageIndex}, 总页数: ${pages.length}`);
        return '';
      }
      
      const pageContent = pages[targetPageIndex];
      console.log(`处理第${area.pageNumber}页，内容长度: ${pageContent.length}`);
      
      // 智能区域提取：基于页面内容的相对位置
      const extractedText = extractContentFromArea(pageContent, area);
      
      console.log('PDF区域提取结果:', extractedText.substring(0, 200) + '...');
      return extractedText.trim();
      
    } catch (error) {
      console.error('PDF区域提取失败:', error);
      return '';
    }
  }

  /**
   * 从Word文档中提取指定区域的内容
   */
  private async extractWordArea(filePath: string, area: any): Promise<string> {
    try {
      console.log('Word区域提取:', area);
      
      // 提取Word文档内容
      const result = await mammoth.extractRawText({ path: filePath });
      const fullText = result.value;
      
      // 分析Word文档结构
      const pages = this.splitWordIntoPages(fullText);
      
      // 获取指定页面的内容
      const targetPageIndex = area.pageNumber - 1;
      if (targetPageIndex < 0 || targetPageIndex >= pages.length) {
        console.warn(`页面索引超出范围: ${targetPageIndex}, 总页数: ${pages.length}`);
        return '';
      }
      
      const pageContent = pages[targetPageIndex];
      console.log(`处理第${area.pageNumber}页，内容长度: ${pageContent.length}`);
      
      // 智能区域提取
      const extractedText = extractContentFromArea(pageContent, area);
      
      console.log('Word区域提取结果:', extractedText.substring(0, 200) + '...');
      return extractedText.trim();
      
    } catch (error) {
      console.error('Word区域提取失败:', error);
      return '';
    }
  }

  /**
   * 从LaTeX文档中提取指定区域的内容
   */
  private async extractLaTeXArea(filePath: string, area: any): Promise<string> {
    try {
      console.log('LaTeX区域提取:', area);
      
      // 读取LaTeX文件内容
      const content = fs.readFileSync(filePath, 'utf-8');
      
      // 分析LaTeX文档结构
      const pages = this.splitLaTeXIntoPages(content);
      
      // 获取指定页面的内容
      const targetPageIndex = area.pageNumber - 1;
      if (targetPageIndex < 0 || targetPageIndex >= pages.length) {
        console.warn(`页面索引超出范围: ${targetPageIndex}, 总页数: ${pages.length}`);
        return '';
      }
      
      const pageContent = pages[targetPageIndex];
      console.log(`处理第${area.pageNumber}页，内容长度: ${pageContent.length}`);
      
      // 智能区域提取
      const extractedText = extractContentFromArea(pageContent, area);
      
      console.log('LaTeX区域提取结果:', extractedText.substring(0, 200) + '...');
      return extractedText.trim();
      
    } catch (error) {
      console.error('LaTeX区域提取失败:', error);
      return '';
    }
  }

  /**
   * 将Word文档分割为页面
   */
  private splitWordIntoPages(fullText: string): string[] {
    // Word文档通常有页面分隔符
    const pageSeparators = [
      /\f/g, // 换页符
      /\n\s*第\s*\d+\s*页\s*\n/g,
      /\n\s*Page\s*\d+\s*\n/g,
      /\n\s*-\s*\d+\s*-\s*\n/g
    ];
    
    let pages: string[] = [];
    
    for (const separator of pageSeparators) {
      const split = fullText.split(separator);
      if (split.length > 1) {
        pages = split.filter(page => page.trim().length > 0);
        console.log(`Word按分隔符分割得到 ${pages.length} 页`);
        break;
      }
    }
    
    // 如果没有找到页面分隔符，按段落分割
    if (pages.length <= 1) {
      const paragraphs = fullText.split(/\n\s*\n/);
      const paragraphsPerPage = Math.ceil(paragraphs.length / 3);
      pages = [];
      
      for (let i = 0; i < paragraphs.length; i += paragraphsPerPage) {
        const pageParagraphs = paragraphs.slice(i, i + paragraphsPerPage);
        pages.push(pageParagraphs.join('\n\n'));
      }
      
      console.log(`Word按段落分割得到 ${pages.length} 页，每页约 ${paragraphsPerPage} 段`);
    }
    
    return pages;
  }

  /**
   * 将LaTeX文档分割为页面
   */
  private splitLaTeXIntoPages(content: string): string[] {
    // LaTeX文档通常有章节或环境分隔
    const pageSeparators = [
      /\\chapter\{/g,
      /\\section\{/g,
      /\\newpage/g,
      /\\clearpage/g,
      /\\pagebreak/g
    ];
    
    let pages: string[] = [];
    
    for (const separator of pageSeparators) {
      const split = content.split(separator);
      if (split.length > 1) {
        pages = split.filter(page => page.trim().length > 0);
        console.log(`LaTeX按分隔符分割得到 ${pages.length} 页`);
        break;
      }
    }
    
    // 如果没有找到分隔符，按行数分割
    if (pages.length <= 1) {
      const lines = content.split('\n');
      const linesPerPage = Math.ceil(lines.length / 3);
      pages = [];
      
      for (let i = 0; i < lines.length; i += linesPerPage) {
        const pageLines = lines.slice(i, i + linesPerPage);
        pages.push(pageLines.join('\n'));
      }
      
      console.log(`LaTeX按行数分割得到 ${pages.length} 页，每页约 ${linesPerPage} 行`);
    }
    
    return pages;
  }
}

export default DocumentParser; 