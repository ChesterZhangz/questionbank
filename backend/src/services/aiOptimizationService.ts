import { getDeepSeekAIService } from './deepseekAI';

interface Question {
  _id: string;
  qid: string;
  bid: string;
  type: 'choice' | 'multiple-choice' | 'fill' | 'solution';
  content: {
    stem: string;
    options?: Array<{ text: string; isCorrect: boolean }>;
    answer: string;
    solution?: string;
    analysis?: string;
  };
  category?: string;
  tags?: string[];
  source?: string;
  difficulty: number;
  confidence?: number;
}

interface OptimizationResult {
  success: boolean;
  questions: Question[];
  averageImprovement: number;
  errors: string[];
}

export class AIOptimizationService {
  private deepSeekService: any;

  constructor() {
    this.deepSeekService = getDeepSeekAIService();
  }

  /**
   * 优化题目内容
   */
  async optimizeQuestions(questions: Question[]): Promise<OptimizationResult> {
    const errors: string[] = [];
    const optimizedQuestions: Question[] = [];
    let totalImprovement = 0;

    try {

      for (const question of questions) {
        try {
          const optimizedQuestion = await this.optimizeQuestion(question);
          if (optimizedQuestion) {
            optimizedQuestions.push(optimizedQuestion);
            totalImprovement += this.calculateImprovement(question, optimizedQuestion);
          }
        } catch (questionError: any) {
          console.error(`题目 ${question._id} 优化失败:`, questionError);
          errors.push(`题目 ${question._id} 优化失败: ${questionError.message}`);
          // 如果优化失败，保留原题目
          optimizedQuestions.push(question);
        }
      }

      const averageImprovement = optimizedQuestions.length > 0 ? totalImprovement / optimizedQuestions.length : 0;

      return {
        success: optimizedQuestions.length > 0,
        questions: optimizedQuestions,
        averageImprovement,
        errors
      };

    } catch (error: any) {
      console.error('AI优化失败:', error);
      errors.push(error.message || '未知错误');
      return {
        success: false,
        questions: [],
        averageImprovement: 0,
        errors
      };
    }
  }

  /**
   * 优化单个题目
   */
  private async optimizeQuestion(question: Question): Promise<Question | null> {
    try {
      // 根据题目类型选择不同的优化策略
      switch (question.type) {
        case 'choice':
          return await this.optimizeChoiceQuestion(question);
        case 'fill':
          return await this.optimizeFillQuestion(question);
        case 'solution':
          return await this.optimizeSolutionQuestion(question);
        default:
          return await this.optimizeGeneralQuestion(question);
      }
    } catch (error: any) {
      console.error('题目优化失败:', error);
      return question; // 返回原题目
    }
  }

  /**
   * 优化选择题
   */
  private async optimizeChoiceQuestion(question: Question): Promise<Question> {
    const prompt = `
请优化以下选择题，确保题目清晰、选项合理、答案正确：

题目：${question.content.stem}
选项：
${question.content.options?.map((opt: any, index: number) => `${String.fromCharCode(65 + index)}. ${opt.text}`).join('\n')}
正确答案：${question.content.answer}

请提供优化后的题目内容，包括：
1. 优化后的题目描述
2. 优化后的选项
3. 正确答案
4. 题目分析
5. 知识点标签
6. 难度评估（1-5）

请以JSON格式返回结果.
    `;

    try {
      const response = await this.deepSeekService.generateResponse(prompt);
      const optimizedData = this.parseOptimizationResponse(response);
      
      return {
        ...question,
        content: {
          ...question.content,
          stem: optimizedData.stem || question.content.stem,
          options: optimizedData.options || question.content.options,
          answer: optimizedData.answer || question.content.answer,
          analysis: optimizedData.analysis || ''
        },
        tags: optimizedData.tags || question.tags,
        difficulty: optimizedData.difficulty || question.difficulty,
        category: optimizedData.category || question.category
      };
    } catch (error) {
      console.error('选择题优化失败:', error);
      return question;
    }
  }

  /**
   * 优化填空题
   */
  private async optimizeFillQuestion(question: Question): Promise<Question> {
    const prompt = `
请优化以下填空题，确保题目清晰、答案准确：

题目：${question.content.stem}
答案：${question.content.answer}

请提供优化后的题目内容，包括：
1. 优化后的题目描述
2. 正确答案
3. 题目分析
4. 知识点标签
5. 难度评估（1-5）

请以JSON格式返回结果.
    `;

    try {
      const response = await this.deepSeekService.generateResponse(prompt);
      const optimizedData = this.parseOptimizationResponse(response);
      
      return {
        ...question,
        content: {
          ...question.content,
          stem: optimizedData.stem || question.content.stem,
          answer: optimizedData.answer || question.content.answer,
          analysis: optimizedData.analysis || ''
        },
        tags: optimizedData.tags || question.tags,
        difficulty: optimizedData.difficulty || question.difficulty,
        category: optimizedData.category || question.category
      };
    } catch (error) {
      console.error('填空题优化失败:', error);
      return question;
    }
  }

  /**
   * 优化解答题
   */
  private async optimizeSolutionQuestion(question: Question): Promise<Question> {
    const prompt = `
请优化以下解答题，确保题目清晰、解答详细：

题目：${question.content.stem}
答案：${question.content.answer}
解答：${question.content.solution || ''}

请提供优化后的题目内容，包括：
1. 优化后的题目描述
2. 正确答案
3. 详细解答步骤
4. 题目分析
5. 知识点标签
6. 难度评估（1-5）

请以JSON格式返回结果.
    `;

    try {
      const response = await this.deepSeekService.generateResponse(prompt);
      const optimizedData = this.parseOptimizationResponse(response);
      
      return {
        ...question,
        content: {
          ...question.content,
          stem: optimizedData.stem || question.content.stem,
          answer: optimizedData.answer || question.content.answer,
          solution: optimizedData.solution || question.content.solution,
          analysis: optimizedData.analysis || ''
        },
        tags: optimizedData.tags || question.tags,
        difficulty: optimizedData.difficulty || question.difficulty,
        category: optimizedData.category || question.category
      };
    } catch (error) {
      console.error('解答题优化失败:', error);
      return question;
    }
  }

  /**
   * 优化通用题目
   */
  private async optimizeGeneralQuestion(question: Question): Promise<Question> {
    const prompt = `
请优化以下题目，确保内容清晰、准确：

题目：${question.content.stem}
答案：${question.content.answer}

请提供优化后的题目内容，包括：
1. 优化后的题目描述
2. 正确答案
3. 题目分析
4. 知识点标签
5. 难度评估（1-5）

请以JSON格式返回结果.
    `;

    try {
      const response = await this.deepSeekService.generateResponse(prompt);
      const optimizedData = this.parseOptimizationResponse(response);
      
      return {
        ...question,
        content: {
          ...question.content,
          stem: optimizedData.stem || question.content.stem,
          answer: optimizedData.answer || question.content.answer,
          analysis: optimizedData.analysis || ''
        },
        tags: optimizedData.tags || question.tags,
        difficulty: optimizedData.difficulty || question.difficulty,
        category: optimizedData.category || question.category
      };
    } catch (error) {
      console.error('通用题目优化失败:', error);
      return question;
    }
  }

  /**
   * 解析优化响应
   */
  private parseOptimizationResponse(response: string): any {
    try {
      // 尝试解析JSON响应
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      // 如果无法解析JSON，返回空对象
      return {};
    } catch (error) {
      console.error('解析优化响应失败:', error);
      return {};
    }
  }

  /**
   * 计算改进程度
   */
  private calculateImprovement(original: Question, optimized: Question): number {
    // 简单的改进度计算，基于内容长度和复杂度
    const originalLength = JSON.stringify(original.content).length;
    const optimizedLength = JSON.stringify(optimized.content).length;
    
    // 改进度 = (优化后长度 - 原长度) / 原长度
    return originalLength > 0 ? (optimizedLength - originalLength) / originalLength : 0;
  }
} 