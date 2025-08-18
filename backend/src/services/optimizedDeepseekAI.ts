import axios from 'axios';

interface DeepSeekResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// 优化后的题目处理结果接口
export interface OptimizedProcessedQuestion {
  type: 'choice' | 'fill' | 'solution';
  number: string;
  content: string;
  options?: string[];
  blanks?: number[];
  rawContent?: string; // 保留原始内容用于调试
  detectedType?: 'choice' | 'fill' | 'solution'; // 新增：AI检测到的题型
}

interface DeepSeekConfig {
  apiKey: string;
  baseURL?: string;
}

class OptimizedDeepSeekAIService {
  private config: DeepSeekConfig;
  private baseURL: string;

  constructor(config: DeepSeekConfig) {
    this.config = config;
    this.baseURL = config.baseURL || 'https://api.deepseek.com/v1';
  }

  /**
   * 并行处理单道题目的所有步骤
   * 一次API调用完成：过滤画图内容 + 识别题目类型 + 提取选项/空白 + LaTeX矫正
   */
  async processSingleQuestion(
    questionContent: string, 
    questionNumber: string, 
    expectedType: 'choice' | 'fill' | 'solution'
  ): Promise<OptimizedProcessedQuestion> {
    try {
      if (!this.config.apiKey || this.config.apiKey.trim() === '') {
        throw new Error('DeepSeek API密钥未配置');
      }

      const url = `${this.baseURL}/chat/completions`;

      // 根据预期题型生成不同的处理提示
      const prompt = this.generateProcessingPrompt(questionContent, expectedType);

      const response = await axios.post<DeepSeekResponse>(url, {
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1,
        max_tokens: 4000, // 减少token使用
        stream: false
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`
        },
        timeout: 60000 // 减少超时时间
      });

      if (response.data?.choices?.[0]?.message?.content) {
        const content = response.data.choices[0].message.content;
        return this.parseProcessedResult(content, questionNumber, expectedType, questionContent);
      }

      // 如果API调用失败，返回原始内容
      return {
        type: expectedType,
        number: questionNumber,
        content: questionContent,
        rawContent: questionContent
      };
    } catch (error: any) {
      console.error(`处理题目 ${questionNumber} 失败:`, error.response?.data || error.message);
      return {
        type: expectedType,
        number: questionNumber,
        content: questionContent,
        rawContent: questionContent
      };
    }
  }

  /**
   * 统一智能处理提示（所有题目都使用相同的处理方式）
   */
  private generateProcessingPrompt(questionContent: string, expectedType: 'choice' | 'fill' | 'solution'): string {
    const prompt = `
请智能识别并处理以下题目：

【处理规则】
- 清理：删除所有"画图/作图/绘图"等描述
- 数学：行内$...$，块级$$...$$；一律\\dfrac；\\displaystyle用于\\sum/\\prod；新定义用\\textit{...}；cases改为\\left\\{\\begin{aligned}...\\end{aligned}\\right.
- 语法：\\choice 选择括号；\\fill 表示填空（注意：\\fill 绝对不要用$...$包裹，直接使用\\fill），如果你遇到题目最后=\fill$，请把\fill提取出来；小问用\\subp，小小问用\\subsubp
- 其它：移除分值与题号；去除图片/\\tikz

【智能识别】
- 选择题：含A/B/C/D选项或"下列说法正确的是/选择正确选项"等
- 填空题：含下划线"_"、括号"()/[]"或"\\fill"（注意：填空题必须包含\\fill标记）
- 解答题：含"求…值/证明/计算/解"或"\\subp/\\subsubp"，每一小问都用\\subp 表示，小小问用\\subsubp 表示. 例如：（1）、（2）、（3）可以为 \\subp 、\\subp 、\\subp

题目：
${questionContent}

【输出格式】
仅返回JSON（按智能识别结果）：
// 选择题
{ "processedContent": "题干（不含选项）", "options": ["A","B","C","D"], "detectedType": "choice" }
// 填空题  
{ "processedContent": "题干（注意：填空题必须包含\\fill标记，且\\fill不要用$...$包裹）", "blankCount": 数字, "detectedType": "fill" }
// 解答题
{ "processedContent": "题干", "detectedType": "solution" }

重要：仅返回JSON；数学一律$...$/$$...$$、\\dfrac；\\fill绝对不要用$...$包裹；去掉分值与题号；无额外文本。

处理结果：`;

    return prompt;
  }

  /**
   * 解析处理结果
   */
    private parseProcessedResult(
    content: string,
    questionNumber: string,
    expectedType: 'choice' | 'fill' | 'solution',
    originalContent: string
  ): OptimizedProcessedQuestion {
    try {
      // 清理可能的Markdown代码块格式
      let cleanedContent = content.trim();
      
      // 移除可能的 ```json 和 ``` 标记
      if (cleanedContent.startsWith('```json')) {
        cleanedContent = cleanedContent.replace(/^```json\s*/, '');
      }
      if (cleanedContent.startsWith('```')) {
        cleanedContent = cleanedContent.replace(/^```\s*/, '');
      }
      if (cleanedContent.endsWith('```')) {
        cleanedContent = cleanedContent.replace(/\s*```$/, '');
      }
      
      // 尝试JSON解析
      const result = JSON.parse(cleanedContent);
      
      // 优先使用AI检测到的题型，如果没有则使用预期题型
      const finalType = result.detectedType || expectedType;
      
      const processedQuestion: OptimizedProcessedQuestion = {
        type: finalType,
        number: questionNumber,
        content: result.processedContent || originalContent,
        rawContent: originalContent,
        detectedType: result.detectedType
      };

      // 根据最终题型添加特定字段
      if (finalType === 'choice' && result.options && Array.isArray(result.options)) {
        processedQuestion.options = result.options;
      } else if (finalType === 'fill' && result.blankCount && typeof result.blankCount === 'number') {
        // 生成填空位置数组
        processedQuestion.blanks = Array.from({ length: result.blankCount }, (_, i) => i + 1);
      }

      return processedQuestion;
    } catch (error) {
      console.error(`解析题目 ${questionNumber} 结果失败:`, error);
      console.error('原始内容:', content);
      
      // 解析失败时，尝试提取处理后的内容
      const contentMatch = content.match(/"processedContent"\s*:\s*"([^"]*)"/);
      const processedContent = contentMatch ? contentMatch[1] : originalContent;
      
      return {
        type: expectedType,
        number: questionNumber,
        content: processedContent,
        rawContent: originalContent
      };
    }
  }

  /**
   * 并行处理多道题目
   * 这是核心优化：同时发送所有题目请求，充分利用并行处理
   */
  async processQuestionsInParallel(
    questions: Array<{ content: string; number: string; type: 'choice' | 'fill' | 'solution' }>
  ): Promise<OptimizedProcessedQuestion[]> {
    console.log(`开始并行处理 ${questions.length} 道题目...`);
    
    // 创建所有题目的处理Promise
    const processingPromises = questions.map(question => 
      this.processSingleQuestion(question.content, question.number, question.type)
    );

    try {
      // 并行执行所有请求
      const results = await Promise.all(processingPromises);
      console.log(`并行处理完成，成功处理 ${results.length} 道题目`);
      return results;
    } catch (error) {
      console.error('并行处理过程中出现错误:', error);
      
      // 如果并行处理失败，尝试逐个处理
      console.log('尝试逐个处理题目...');
      const results: OptimizedProcessedQuestion[] = [];
      
      for (const question of questions) {
        const result = await this.processSingleQuestion(question.content, question.number, question.type);
        results.push(result);
        
        // 添加小延迟避免API限制
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      
      return results;
    }
  }

  /**
   * 批处理模式：将题目分组处理，避免同时发送太多请求
   */
  async processBatchQuestions(
    questions: Array<{ content: string; number: string; type: 'choice' | 'fill' | 'solution' }>,
    batchSize: number = 15 // 每批处理10道题
  ): Promise<OptimizedProcessedQuestion[]> {
    console.log(`开始批处理 ${questions.length} 道题目，每批 ${batchSize} 道...`);
    
    const results: OptimizedProcessedQuestion[] = [];
    
    // 将题目分批处理
    for (let i = 0; i < questions.length; i += batchSize) {
      const batch = questions.slice(i, i + batchSize);
      console.log(`处理第 ${Math.floor(i / batchSize) + 1} 批，共 ${batch.length} 道题目...`);
      
      const batchResults = await this.processQuestionsInParallel(batch);
      results.push(...batchResults);
      
      // 批次间添加延迟
      if (i + batchSize < questions.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    console.log(`批处理完成，共处理 ${results.length} 道题目`);
    return results;
  }
}

// 获取DeepSeek配置
function getDeepSeekConfig(): DeepSeekConfig {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  
  if (!apiKey) {
    throw new Error('DeepSeek配置缺失：请设置DEEPSEEK_API_KEY');
  }
  
  return { apiKey };
}

// 创建优化版DeepSeek AI服务实例
let optimizedDeepseekAIService: OptimizedDeepSeekAIService | null = null;

export function getOptimizedDeepSeekAIService(): OptimizedDeepSeekAIService {
  if (!optimizedDeepseekAIService) {
    const config = getDeepSeekConfig();
    optimizedDeepseekAIService = new OptimizedDeepSeekAIService(config);
  }
  return optimizedDeepseekAIService;
}

// 导出优化版并行处理函数
export async function processQuestionsWithOptimizedDeepSeek(
  questions: Array<{ content: string; number: string; type: 'choice' | 'fill' | 'solution' }>
): Promise<OptimizedProcessedQuestion[]> {
  try {
    const service = getOptimizedDeepSeekAIService();
    return await service.processBatchQuestions(questions);
  } catch (error) {
    console.error('优化版DeepSeek AI服务初始化失败:', error);
    return questions.map(q => ({
      type: q.type,
      number: q.number,
      content: q.content,
      rawContent: q.content
    }));
  }
}

// TeX文件处理函数
export async function processTeXWithOptimizedDeepSeek(texContent: string): Promise<OptimizedProcessedQuestion[]> {
  const service = getOptimizedDeepSeekAIService();
  
  // 预处理LaTeX内容
  const preprocessedContent = preprocessTeXContent(texContent);
  console.log('预处理后的TeX内容长度:', preprocessedContent.length);
  
  const prompt = `请解析以下TeX文本，按最精简规则输出题目：

【题型识别】
- 选择题：含A/B/C/D或"下列说法正确的是/选择正确选项"等
- 填空题：含下划线"_"、括号"()/[]"或"\\fill"（注意：填空题必须包含\\fill标记）
- 解答题：含"求…值/证明/计算/解"或"\\subp/\\subsubp"

【语法与数学】
- \\choice 作为选择括号；\\fill 表示空（注意：\\fill 绝对不要用$...$包裹，直接使用\\fill）；小问 \\subp，小小问 \\subsubp
- 数学：$...$/$$...$$；一律\\dfrac；\\displaystyle用于\\sum/\\prod；新定义\\textit{...}；cases→\\left\\{\\begin{aligned}...\\end{aligned}\\right.
- 去除分值与题号；移除图片/\\tikz

【输出】
- 返回JSON数组：
  { "type": "choice|fill|solution", "number": "编号", "content": "题干", "options": [..], "blanks": [..] }

文本：
${preprocessedContent}

仅返回JSON数组，无额外文字。`;

  try {
    // 验证API密钥
    if (!service['config'].apiKey || service['config'].apiKey.trim() === '') {
      throw new Error('DeepSeek API密钥未配置');
    }

    const url = `${service['baseURL']}/chat/completions`;

    const response = await axios.post<DeepSeekResponse>(url, {
      model: 'deepseek-chat',
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.1,
      max_tokens: 8000,
      stream: false
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${service['config'].apiKey}`
      },
      timeout: 180000 // 3分钟超时
    });

    const content = response.data.choices[0].message.content;
    
    console.log('DeepSeek返回的原始内容:', content);
    
    // 尝试解析JSON
    let cleanedContent = content.trim();
    
    // 移除可能的 ```json 和 ``` 标记
    if (cleanedContent.startsWith('```json')) {
      cleanedContent = cleanedContent.replace(/^```json\s*/, '');
    }
    if (cleanedContent.startsWith('```')) {
      cleanedContent = cleanedContent.replace(/^```\s*/, '');
    }
    if (cleanedContent.endsWith('```')) {
      cleanedContent = cleanedContent.replace(/\s*```$/, '');
    }
    
    try {
      const questions = JSON.parse(cleanedContent);
      if (Array.isArray(questions)) {
        console.log('JSON解析成功，提取到题目数量:', questions.length);
        return questions.map((q, index) => ({
          type: q.type || 'solution',
          number: q.number || `T${index + 1}`,
          content: q.content || '',
          options: q.options || [],
          blanks: q.blanks || [],
          rawContent: q.content || ''
        }));
      }
    } catch (parseError) {
      console.error('JSON解析失败，尝试智能提取:', parseError);
      console.error('清理后的内容:', cleanedContent);
    }
    
    // 如果JSON解析失败，尝试智能提取题目
    console.log('开始智能提取题目...');
    const extractedQuestions = extractQuestionsFromText(content);
    
    if (extractedQuestions.length > 0) {
      console.log('智能提取成功，提取到题目数量:', extractedQuestions.length);
      return extractedQuestions;
    }
    
    // 如果智能提取也失败，尝试从原始TeX内容提取
    console.log('从原始TeX内容提取题目...');
    const texQuestions = extractQuestionsFromTeX(texContent);
    
    if (texQuestions.length > 0) {
      console.log('从TeX提取成功，提取到题目数量:', texQuestions.length);
      return texQuestions;
    }
    
    // 最后的fallback：返回原始内容作为单个题目
    console.log('所有提取方法都失败，返回原始内容');
    return [{
      type: 'solution',
      number: 'T1',
      content: texContent,
      rawContent: texContent
    }];
  } catch (error) {
    console.error('TeX处理失败:', error);
    throw new Error('TeX文件处理失败');
  }
}

// 智能提取函数：从DeepSeek返回的文本中提取题目
function extractQuestionsFromText(content: string): OptimizedProcessedQuestion[] {
  try {
    // 尝试从文本中提取JSON数组
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      try {
        const questions = JSON.parse(jsonMatch[0]);
        if (Array.isArray(questions)) {
          return questions.map((q, index) => ({
            type: q.type || 'solution',
            number: q.number || `T${index + 1}`,
            content: q.content || '',
            options: q.options || [],
            blanks: q.blanks || [],
            rawContent: q.content || ''
          }));
        }
      } catch (e) {
        console.log('JSON数组解析失败，尝试其他方法');
      }
    }
    
    // 尝试提取单个JSON对象
    const objectMatches = content.match(/\{[^{}]*"type"[^{}]*\}/g);
    if (objectMatches) {
      const questions: OptimizedProcessedQuestion[] = [];
      for (let i = 0; i < objectMatches.length; i++) {
        try {
          const question = JSON.parse(objectMatches[i]);
          questions.push({
            type: question.type || 'solution',
            number: question.number || `T${i + 1}`,
            content: question.content || '',
            options: question.options || [],
            blanks: question.blanks || [],
            rawContent: question.content || ''
          });
        } catch (e) {
          console.log(`解析第${i + 1}个对象失败`);
        }
      }
      if (questions.length > 0) {
        return questions;
      }
    }
    
    return [];
  } catch (error) {
    console.error('智能提取失败:', error);
    return [];
  }
}

// 从原始TeX内容中提取题目
function extractQuestionsFromTeX(texContent: string): OptimizedProcessedQuestion[] {
  try {
    const questions: OptimizedProcessedQuestion[] = [];
    let questionIndex = 1;
    
    // 移除文档设置
    let cleanContent = texContent
      .replace(/\\documentclass.*?\n/g, '')
      .replace(/\\usepackage.*?\n/g, '')
      .replace(/\\begin\{document\}.*?\n/g, '')
      .replace(/\\end\{document\}/g, '')
      .replace(/\\maketitle.*?\n/g, '')
      .replace(/\\title.*?\n/g, '')
      .replace(/\\author.*?\n/g, '')
      .replace(/\\date.*?\n/g, '')
      .replace(/\\begin\{abstract\}.*?\\end\{abstract\}/gs, '')
      .replace(/\\section\{.*?\}/g, '');
    
    // 提取选择题
    const choiceMatches = cleanContent.match(/\\begin\{choice\}[\s\S]*?\\end\{choice\}/g);
    if (choiceMatches) {
      choiceMatches.forEach(match => {
        const content = match.replace(/\\begin\{choice\}|\\end\{choice\}/g, '').trim();
        questions.push({
          type: 'choice',
          number: `T${questionIndex++}`,
          content: content,
          options: [],
          rawContent: content
        });
      });
    }
    
    // 提取填空题
    const fillMatches = cleanContent.match(/\\begin\{fill\}[\s\S]*?\\end\{fill\}/g);
    if (fillMatches) {
      fillMatches.forEach(match => {
        const content = match.replace(/\\begin\{fill\}|\\end\{fill\}/g, '').trim();
        questions.push({
          type: 'fill',
          number: `T${questionIndex++}`,
          content: content,
          blanks: [1],
          rawContent: content
        });
      });
    }
    
    // 提取解答题
    const solutionMatches = cleanContent.match(/\\begin\{solution\}[\s\S]*?\\end\{solution\}/g);
    if (solutionMatches) {
      solutionMatches.forEach(match => {
        const content = match.replace(/\\begin\{solution\}|\\end\{solution\}/g, '').trim();
        questions.push({
          type: 'solution',
          number: `T${questionIndex++}`,
          content: content,
          rawContent: content
        });
      });
    }
    
    return questions;
  } catch (error) {
    console.error('TeX内容提取失败:', error);
    return [];
  }
}

// LaTeX预处理函数：在发送给DeepSeek之前清理文档结构
function preprocessTeXContent(texContent: string): string {
  console.log('开始预处理LaTeX内容...');
  console.log('原始内容长度:', texContent.length);
  
  let processedContent = texContent;
  
  // 1. 移除文档类声明
  processedContent = processedContent.replace(/\\documentclass\[.*?\]\{.*?\}/g, '');
  processedContent = processedContent.replace(/\\documentclass\{.*?\}/g, '');
  
  // 2. 移除包导入
  processedContent = processedContent.replace(/\\usepackage\[.*?\]\{.*?\}/g, '');
  processedContent = processedContent.replace(/\\usepackage\{.*?\}/g, '');
  
  // 3. 移除标题设置
  processedContent = processedContent.replace(/\\title\{.*?\}/g, '');
  processedContent = processedContent.replace(/\\author\{.*?\}/g, '');
  processedContent = processedContent.replace(/\\date\{.*?\}/g, '');
  processedContent = processedContent.replace(/\\maketitle/g, '');
  
  // 4. 移除摘要
  processedContent = processedContent.replace(/\\begin\{abstract\}[\s\S]*?\\end\{abstract\}/g, '');
  
  // 5. 移除文档环境标记
  processedContent = processedContent.replace(/\\begin\{document\}/g, '');
  processedContent = processedContent.replace(/\\end\{document\}/g, '');
  
  // 6. 移除章节标题
  processedContent = processedContent.replace(/\\section\{.*?\}/g, '');
  processedContent = processedContent.replace(/\\subsection\{.*?\}/g, '');
  processedContent = processedContent.replace(/\\subsubsection\{.*?\}/g, '');
  
  // 7. 移除注释
  processedContent = processedContent.replace(/%.*$/gm, '');
  
  // 8. 移除多余的空行
  processedContent = processedContent.replace(/\n\s*\n\s*\n/g, '\n\n');
  
  // 9. 移除开头和结尾的空白
  processedContent = processedContent.trim();
  
  console.log('预处理完成，处理后内容长度:', processedContent.length);
  console.log('预处理后内容预览:', processedContent.substring(0, 200) + '...');
  
  return processedContent;
}