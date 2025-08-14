import api from './api';

export interface QuestionAnalysis {
  category: string; // 小题型
  tags: string[]; // 知识点标签
  options?: string[]; // 选择题选项
  difficulty: number; // 难度等级 1-5
  questionType: 'choice' | 'multiple-choice' | 'fill' | 'solution'; // 题目类型
}

class QuestionAnalysisAPI {
  // 分析题目内容
  async analyzeQuestion(content: string): Promise<QuestionAnalysis> {
    try {
      const response = await api.post('/api/question-analysis/analyze', {
        content
      });
      return response.data.analysis;
    } catch (error) {
      console.error('题目分析失败:', error);
      throw error;
    }
  }
}

export const questionAnalysisAPI = new QuestionAnalysisAPI(); 