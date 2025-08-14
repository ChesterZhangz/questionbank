import api from './api';

export interface SearchResult {
  questionBanks: QuestionBankResult[];
  questions: QuestionResult[];
}

export interface QuestionBankResult {
  id: string;
  bid: string;
  name: string;
  description: string;
  questionCount: number;
  tags: string[];
  creator: {
    _id: string;
    name: string;
    email: string;
  };
  lastUpdated: string;
  type: 'questionBank';
}

export interface QuestionResult {
  id: string;
  qid: string;
  type: 'choice' | 'multiple-choice' | 'fill' | 'solution';
  content: {
    stem: string;
    solution?: string;
  };
  category?: string;
  tags: string[];
  difficulty: number;
  questionBank: {
    _id: string;
    name: string;
    bid: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface SearchSuggestion {
  type: 'questionBank' | 'question';
  id: string;
  title: string;
  description: string;
  bid?: string;
  qid?: string;
  questionType?: string;
}

class SearchAPI {
  // 全局搜索
  async search(query: string, type?: string, limit: number = 10): Promise<SearchResult> {
    try {
      const params: any = { q: query, limit };
      if (type) {
        params.type = type;
      }

      const response = await api.get<{ success: boolean; results: SearchResult }>('/search', {
        params
      });

      return response.data.results;
    } catch (error) {
      console.error('搜索失败:', error);
      throw error;
    }
  }

  // 获取搜索建议
  async getSuggestions(query: string, limit: number = 5): Promise<SearchSuggestion[]> {
    try {
      const response = await api.get<{ success: boolean; suggestions: SearchSuggestion[] }>('/search/suggestions', {
        params: { q: query, limit }
      });

      return response.data.suggestions;
    } catch (error) {
      console.error('获取搜索建议失败:', error);
      throw error;
    }
  }

  // 搜索题库
  async searchQuestionBanks(query: string, limit: number = 10): Promise<QuestionBankResult[]> {
    try {
      const results = await this.search(query, 'questionBank', limit);
      return results.questionBanks;
    } catch (error) {
      console.error('搜索题库失败:', error);
      throw error;
    }
  }

  // 搜索题目
  async searchQuestions(query: string, limit: number = 10): Promise<QuestionResult[]> {
    try {
      const results = await this.search(query, 'question', limit);
      return results.questions;
    } catch (error) {
      console.error('搜索题目失败:', error);
      throw error;
    }
  }
}

export default new SearchAPI(); 