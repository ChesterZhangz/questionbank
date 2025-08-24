import api from './api';
import type { 
  QuestionEvaluation, 
  CoreAbilities, 
} from '../types';

// 题目评价请求接口
export interface QuestionEvaluationRequest {
  content: string;           // 题目内容
  solution?: string;         // 解析内容
  solutionAnswers?: string[]; // 解答步骤
  tags: string[];            // 知识点标签
  difficulty: number;        // 难度等级
  category: string[];        // 题目分类
  questionType: string;      // 题目类型
}

// 题目评价结果接口
export interface QuestionEvaluationResult {
  overallRating: number;     // 综合评分（1-10）
  evaluationReasoning: string; // 评价理由
  lastUpdated: string;       // 最后更新时间
}

// 完整分析结果接口
export interface CompleteAnalysisResult {
  evaluation: QuestionEvaluationResult;
  coreAbilities: CoreAbilities;
  analysisTimestamp: string;
  analysisVersion: string;
}




// 批量评价结果接口
export interface BatchEvaluationResult {
  success: boolean;
  results: Array<{
    questionId: string;
    success: boolean;
    evaluation?: QuestionEvaluationResult;
    error?: string;
  }>;
}

class QuestionEvaluationAPI {
  // 生成题目评价
  async evaluateQuestion(request: QuestionEvaluationRequest): Promise<QuestionEvaluationResult> {
    try {
      const response = await api.post('question-evaluation/evaluate', request);
      return response.data.evaluation;
    } catch (error) {
      console.error('题目评价生成失败:', error);
      throw error;
    }
  }

  // 获取题目完整分析
  async getCompleteAnalysis(questionId: string, questionData: any): Promise<CompleteAnalysisResult> {
    try {
      const params = new URLSearchParams({
        content: questionData.content.stem,
        ...(questionData.content.solution && { solution: questionData.content.solution }),
        ...(questionData.content.solutionAnswers && { solutionAnswers: JSON.stringify(questionData.content.solutionAnswers) }),
        ...(questionData.tags && { tags: JSON.stringify(questionData.tags) }),
        difficulty: questionData.difficulty?.toString() || '3',
        category: JSON.stringify(questionData.category || ['综合题']),
        type: questionData.type || 'solution'
      });
      
      const response = await api.get(`question-evaluation/analysis/${questionId}?${params}`);
      return response.data.analysis;
    } catch (error) {
      console.error('获取题目完整分析失败:', error);
      throw error;
    }
  }

  // 批量评价题目
  async batchEvaluateQuestions(questions: any[]): Promise<BatchEvaluationResult> {
    try {
      const response = await api.post('question-evaluation/batch-evaluate', { questions });
      return response.data;
    } catch (error) {
      console.error('批量评价题目失败:', error);
      throw error;
    }
  }

  // 更新评价结果
  async updateEvaluation(questionId: string, evaluation: Partial<QuestionEvaluation>): Promise<void> {
    try {
      await api.put(`question-evaluation/evaluation/${questionId}`, evaluation);
    } catch (error) {
      console.error('更新评价结果失败:', error);
      throw error;
    }
  }

  // 获取已保存的AI分析结果
  async getSavedAnalysis(questionId: string): Promise<{ hasSavedAnalysis: boolean; analysis: CompleteAnalysisResult | null }> {
    try {
      const response = await api.get(`question-evaluation/saved-analysis/${questionId}`);
      return response.data;
    } catch (error) {
      console.error('获取已保存的AI分析结果失败:', error);
      throw error;
    }
  }

  // 保存AI分析结果到后端
  async saveAIAnalysis(questionId: string, analysis: CompleteAnalysisResult): Promise<void> {
    try {
      await api.post(`question-evaluation/save-analysis/${questionId}`, analysis);
    } catch (error) {
      console.error('保存AI分析结果失败:', error);
      throw error;
    }
  }
}

export const questionEvaluationAPI = new QuestionEvaluationAPI();
