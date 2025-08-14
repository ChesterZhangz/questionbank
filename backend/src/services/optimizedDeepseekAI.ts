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
   * 根据题目类型生成处理提示
   */
  private generateProcessingPrompt(questionContent: string, expectedType: 'choice' | 'fill' | 'solution'): string {
    const baseInstructions = `
请对以下数学题目进行处理，完成以下任务：
1. 删除所有与画图、作图、绘制图形相关的内容
2. 将所有数学符号转换为标准LaTeX格式，用$...$包围，或者是用$$...$$包裹.
3. 矫正可能的LaTeX格式错误. 如果需要使用环境，不要使用cases环境，而是使用aligend环境；用\\dfrac表示分数，不要用\\frac（除上下标）. 
4. 保持题目的完整性和逻辑性（除题目文件内以外的文字不要出现）.

题目内容：
${questionContent}

`;

    let specificInstructions = '';
    let outputFormat = '';

    switch (expectedType) {
      case 'choice':
        specificInstructions = `
5. 这是一道选择题，请识别并提取所有选项（A、B、C、D等）
6. 确保选项内容完整且格式统一
`;
        outputFormat = `
请严格按照以下JSON格式返回：
{
  "processedContent": "处理后的题目内容（不包含选项）",
  "options": ["选项A内容", "选项B内容", "选项C内容", "选项D内容"]
}
`;
        break;

      case 'fill':
        specificInstructions = `
5. 如果这是填空题，那么用\\fill 表达需要填的空. 
`;
        outputFormat = `
请严格按照以下JSON格式返回：
{
  "processedContent": "处理后的完整题目内容",
  "blankCount": 填空数量（数字）
}
`;
        break;

      case 'solution':
        specificInstructions = `
5. 这是一道解答题，保持题目的完整结构
6. 如果有小题（1）、（2）、（3）等，用 \\subp 表示，小小问（i、ii、iii等或其他形式呈现的）用\\subsubp 表示. （将（1）、（2）、（3）等去掉）
7. 去掉题目中所有的分值区域，不要保存任何分值内容，也不要有\\section{}. 
`;
        outputFormat = `
请严格按照以下JSON格式返回：
{
  "processedContent": "处理后的完整题目内容"
}
`;
        break;
    }

    return baseInstructions + specificInstructions + outputFormat + `

重要提示：
- 只返回JSON格式，不要有任何其他文字
- 数学符号必须用$...$格式，如：$\\frac{1}{2}$、$x^2$、$\\sqrt{3}$
- 保持题目编号和结构完整
- 删除画图相关内容时要保持语句通顺

处理结果：`;
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
      // 尝试直接JSON解析
      const result = JSON.parse(content);
      
      const processedQuestion: OptimizedProcessedQuestion = {
        type: expectedType,
        number: questionNumber,
        content: result.processedContent || originalContent,
        rawContent: originalContent
      };

      // 根据题型添加特定字段
      if (expectedType === 'choice' && result.options && Array.isArray(result.options)) {
        processedQuestion.options = result.options;
      } else if (expectedType === 'fill' && result.blankCount && typeof result.blankCount === 'number') {
        // 生成填空位置数组
        processedQuestion.blanks = Array.from({ length: result.blankCount }, (_, i) => i + 1);
      }

      return processedQuestion;
    } catch (error) {
      console.error(`解析题目 ${questionNumber} 结果失败:`, error);
      
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
  
  const prompt = `你是一个专业的数学题目解析专家。请解析以下TeX文件内容，识别并提取所有题目。

解析规则：
1. 识别题目类型：
   - 题目有选项即为选择题
   - 题目有类似于\\underlines 或下划线便为填空题. 提取时去掉\\underlines，换成\\fill 
   - 有遇到小问，或者说求...值，证明之类的问题便为解答题. 
   - 其他格式的题目按内容判断类型

2. 题目提取要求：
   - 保留所有LaTeX公式和数学符号
   - \\choice 表示选择的括号，不代表选项的A，B，C，D（如：下列正确的是 \\choice ）
   - 选择题需要提取选项（A、B、C、D等）
   - 填空题的空需要用\\fill 表示（用 ___ 表示）
   - 解答题需要保留完整的题目内容，如果有分值，则去掉分值. 小问用\\subp 表示，小小问用\\subsubp 表示.
   - 不要添加图片引用（如\\\\includegraphics）
   - 不要包含网页不支持的环境（如\\\\begin{figure}、\\\\begin{table}等）

3. 输出格式：
   返回JSON数组，每个题目包含：
   {
     "type": "choice|fill|solution",
     "number": "题目编号",
     "content": "题目内容（包含LaTeX公式）",
     "options": ["选项A", "选项B", "选项C", "选项D"], // 仅选择题
     "blanks": [1, 2, 3] // 仅填空题，表示空白数量
   }

4. 特殊处理：
   - 不要使用cases环境，而是使用 \\left\{\\begin{aligned} \\end{aligned}\\right. 的环境.  
   - 分数严格使用\\dfrac，上标或下标可用 \\frac. 
   - 虚数用 \\mathbf{i}表示，自然底数用 \\mathbb{e}表示. 
   - 所有的数学环境用 $...$ 或 $$...$$ 包裹. 

TeX文件内容：
${preprocessedContent}

请严格按照上述规则解析，只返回JSON格式的题目数组，不要包含其他说明文字。`;

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
    try {
      const questions = JSON.parse(content);
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