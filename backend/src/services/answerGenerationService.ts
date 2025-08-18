import axios from 'axios';

interface AnswerGenerationRequest {
  content: string;
  type: 'choice' | 'multiple-choice' | 'fill' | 'solution';
  difficulty: number;
  category?: string;
  tags?: string[];
}

interface AnswerGenerationResult {
  answer: string;
  solution?: string;
  fillAnswers?: string[];
  solutionAnswers?: string[];
  reasoning?: string; // 新增：思维链内容
}

interface DeepSeekConfig {
  apiKey: string;
  baseURL?: string;
}

class AnswerGenerationService {
  private config: DeepSeekConfig;
  private baseURL: string;

  constructor() {
    this.config = {
      apiKey: process.env.DEEPSEEK_API_KEY || '',
      baseURL: process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com/v1'
    };
    this.baseURL = this.config.baseURL || 'https://api.deepseek.com/v1';
  }

  private validateApiKey() {
    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey || apiKey.trim() === '') {
      throw new Error('DeepSeek API密钥未配置，请在.env文件中设置DEEPSEEK_API_KEY');
    }
    return apiKey;
  }

  async generateAnswer(request: AnswerGenerationRequest): Promise<AnswerGenerationResult> {
    try {
      const apiKey = this.validateApiKey();
      
      const prompt = this.generatePrompt(request);
      
      const response = await axios.post(`${this.baseURL}/chat/completions`, {
        model: 'deepseek-reasoner', // 使用推理模型
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 8000, // 推理模型支持更大的token数，增加以处理长解析
        stream: false
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        timeout: 720000
      });

      if (response.data && response.data.choices && response.data.choices.length > 0) {
        const message = response.data.choices[0].message;
        const content = message.content;
        const reasoningContent = message.reasoning_content; // 获取思维链内容
        
        console.log('DeepSeek推理模型响应:');
        console.log('思维链内容长度:', reasoningContent?.length || 0);
        console.log('最终答案长度:', content?.length || 0);
        
        // 尝试从响应中提取JSON部分
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            const result = JSON.parse(jsonMatch[0]);
            console.log('DeepSeek答案生成结果:', result);
            return {
              answer: result.answer || '',
              solution: result.solution || '',
              fillAnswers: result.fillAnswers || [],
              solutionAnswers: result.solutionAnswers || [],
              reasoning: reasoningContent || '' // 保存思维链内容
            };
          } catch (parseError) {
            console.error('JSON解析失败，尝试智能提取:', parseError);
            console.error('原始内容:', content);
            
            // 智能提取答案和解析
            return this.extractAnswerFromContent(content, reasoningContent);
          }
        } else {
          console.error('未找到JSON格式的响应:', content);
          throw new Error('DeepSeek返回的响应格式不正确');
        }
      } else {
        throw new Error('DeepSeek返回结果为空');
      }
    } catch (error) {
      console.error('答案生成失败:', error);
      throw error;
    }
  }

  private generatePrompt(request: AnswerGenerationRequest): string {
    const { content, type, difficulty, category, tags } = request;
    
    let prompt = `你是一个专业的数学题目解答专家。请仔细分析以下数学题目，并在思维链中展示你的解题思路，最后生成准确的答案和解析。

题目内容：${content}
题目类型：${type}
难度等级：${difficulty}星
小题型：${category || '综合题'}
知识点：${tags?.join(', ') || '数学'}

## 解题要求：

### 1. 思维链分析（在思维链中展示）
- 仔细阅读题目，理解题目要求
- 识别题目类型和关键信息
- 分析解题思路和步骤
- 进行必要的计算和推理
- 验证答案的正确性

### 2. 答案格式要求
- 选择题：返回正确答案选项（如：A、B、C、D）
- 填空题：返回具体的数值或表达式，使用$...$格式
- 解答题：返回最终答案，使用$...$格式

### 3. 解析格式要求
- 使用标准的数学符号和LaTeX格式
- 行内公式使用$...$，块级公式使用$$...$$
- 将\\[和\\]转换为$$...$$
- 使用\\dfrac表示分数，不要使用\\frac
- 使用\\displaystyle用于\\sum、\\prod等大运算符
- 虚数单位使用\\mathbf{i}，自然底数使用\\mathbf{e}
- 数字集合使用\\mathbb{}，如\\mathbb{Z}、\\mathbb{R}等
- 新定义使用\\textit{}包裹

### 4. 解析内容要求
- 选择题：简要说明为什么选择该选项
- 填空题：提供简洁的解题步骤
- 解答题：直接解答问题，不要过于详细
- 解析要简洁明了，直接针对题目进行解答
- 解析中不使用句号，使用句点

### 5. 返回格式
请严格按照以下JSON格式返回：

{
  "answer": "答案内容",
  "solution": "详细解析内容（包含LaTeX公式）",
  "fillAnswers": ["填空1答案", "填空2答案"],
  "solutionAnswers": ["解答1答案", "解答2答案"]
}

注意：
- 在思维链中展示解题思路
- 只返回JSON格式，不要有任何其他文字
- 确保所有数学公式都使用正确的LaTeX格式，将\\[和\\]转换为$$...$$
- 答案使用$...$格式
- 解析要简洁明了，直接解答问题，使用句点而不是句号
- 如果题目有多个填空或解答，请分别填写在对应数组中

请开始分析题目：`;

    return prompt;
  }

  /**
   * 智能提取答案和解析（当JSON解析失败时使用）
   */
  private extractAnswerFromContent(content: string, reasoningContent: string): AnswerGenerationResult {
    console.log('开始智能提取答案和解析...');
    
    let answer = '';
    let solution = '';
    let fillAnswers: string[] = [];
    let solutionAnswers: string[] = [];

    // 尝试从内容中提取答案
    const answerMatch = content.match(/"answer":\s*"([^"]*)"/);
    if (answerMatch) {
      answer = answerMatch[1];
    }

    // 尝试从内容中提取解析
    const solutionMatch = content.match(/"solution":\s*"([^"]*)"/);
    if (solutionMatch) {
      solution = solutionMatch[1];
    }

    // 如果从JSON中提取失败，尝试从思维链中提取
    if (!answer && reasoningContent) {
      // 从思维链中寻找最终答案
      const finalAnswerMatch = reasoningContent.match(/最终答案[：:]\s*([^\n]+)/);
      if (finalAnswerMatch) {
        answer = finalAnswerMatch[1].trim();
      }
      
      // 从思维链中寻找答案
      const answerInReasoning = reasoningContent.match(/答案[：:]\s*([^\n]+)/);
      if (answerInReasoning && !answer) {
        answer = answerInReasoning[1].trim();
      }
    }

    // 如果还是没有答案，尝试从完整内容中提取
    if (!answer) {
      // 查找常见的答案格式
      const patterns = [
        /答案[：:]\s*([^\n]+)/,
        /最终答案[：:]\s*([^\n]+)/,
        /因此[，,]?\s*([^\n]+)/,
        /所以[，,]?\s*([^\n]+)/,
        /结果是[：:]\s*([^\n]+)/
      ];
      
      for (const pattern of patterns) {
        const match = content.match(pattern);
        if (match) {
          answer = match[1].trim();
          break;
        }
      }
    }

    // 如果解析为空，使用思维链作为解析
    if (!solution && reasoningContent) {
      solution = reasoningContent;
    }

    console.log('智能提取结果:', { answer, solution: solution.substring(0, 100) + '...' });

    return {
      answer,
      solution,
      fillAnswers,
      solutionAnswers,
      reasoning: reasoningContent || ''
    };
  }
}

export const answerGenerationService = new AnswerGenerationService();
