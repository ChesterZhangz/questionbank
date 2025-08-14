import api from './api';
import type { 
  QuestionBankApiResponse, 
  StatisticsResponse 
} from '../types';

export interface DashboardStats {
  totalQuestionBanks: number;
  totalQuestions: number;
  recentActivity: number;
  completionRate: number;
  userStats: {
    totalUsers: number;
    activeUsers: number;
    newUsersThisMonth: number;
  };
  systemStats: {
    systemStatus: 'normal' | 'warning' | 'error';
    apiStatus: 'normal' | 'warning' | 'error';
    databaseStatus: 'normal' | 'warning' | 'error';
  };
}

export interface RecentActivity {
  id: string;
  type: 'create' | 'edit' | 'delete' | 'share' | 'login' | 'register';
  title: string;
  description: string;
  timestamp: Date;
  user: string;
  targetId?: string;
  targetType?: 'question' | 'questionBank' | 'user';
}

export interface DashboardQuestionBank {
  id: string;
  bid: string;
  name: string;
  description: string;
  questionCount: number;
  lastModified: Date;
  isPublic: boolean;
  tags: string[];
  creator: {
    _id: string;
    name: string;
    email: string;
  };
  status: 'active' | 'inactive' | 'archived' | 'deleted';
}

export interface DashboardData {
  stats: DashboardStats;
  recentActivities: RecentActivity[];
  questionBanks: DashboardQuestionBank[];
  topQuestions: Array<{
    id: string;
    title: string;
    views: number;
    favorites: number;
    bankName: string;
  }>;
  systemAlerts: Array<{
    id: string;
    type: 'info' | 'warning' | 'error';
    message: string;
    timestamp: Date;
  }>;
}

class DashboardAPI {
  // 获取仪表板完整数据
  async getDashboardData(): Promise<DashboardData> {
    try {
      const response = await api.get<{ success: boolean; data: DashboardData }>('/dashboard');
      return response.data.data;
    } catch (error) {
      console.error('获取仪表板数据失败:', error);
      throw error;
    }
  }

  // 获取快速统计数据
  async getQuickStats(): Promise<DashboardStats> {
    try {
      const response = await api.get<{ success: boolean; stats: DashboardStats }>('/dashboard/stats');
      return response.data.stats;
    } catch (error) {
      console.error('获取快速统计数据失败:', error);
      throw error;
    }
  }

  // 获取最近活动
  async getRecentActivities(limit: number = 10): Promise<RecentActivity[]> {
    try {
      const response = await api.get<{ success: boolean; activities: any[] }>('/dashboard/activities', {
        params: { limit }
      });
      // 确保timestamp字段被转换为Date对象
      return response.data.activities.map(activity => ({
        ...activity,
        timestamp: new Date(activity.timestamp)
      }));
    } catch (error) {
      console.error('获取最近活动失败:', error);
      throw error;
    }
  }

  // 获取用户题库列表
  async getUserQuestionBanks(): Promise<DashboardQuestionBank[]> {
    try {
      const response = await api.get<QuestionBankApiResponse>('/question-banks');
      return (response.data.questionBanks || []).map(bank => ({
        id: bank._id,
        bid: bank.bid,
        name: bank.name,
        description: bank.description || '',
        questionCount: bank.questionCount || 0,
        lastModified: new Date(bank.updatedAt),
        isPublic: bank.isPublic,
        tags: bank.tags || [],
        creator: bank.creator,
        status: bank.status
      }));
    } catch (error) {
      console.error('获取用户题库列表失败:', error);
      throw error;
    }
  }

  // 获取题目统计
  async getQuestionStatistics(params?: {
    timeRange?: 'day' | 'week' | 'month' | 'year' | 'all';
    bankId?: string;
  }): Promise<any> {
    try {
      const response = await api.get<StatisticsResponse>('/questions/statistics', { params });
      return response.data;
    } catch (error) {
      console.error('获取题目统计失败:', error);
      throw error;
    }
  }

  // 获取热门题目
  async getTopQuestions(limit: number = 5): Promise<Array<{
    id: string;
    title: string;
    views: number;
    favorites: number;
    bankName: string;
  }>> {
    try {
      const response = await api.get<{ success: boolean; questions: any[] }>('/questions/top', {
        params: { limit }
      });
      return response.data.questions;
    } catch (error) {
      console.error('获取热门题目失败:', error);
      throw error;
    }
  }

  // 获取系统状态
  async getSystemStatus(): Promise<{
    systemStatus: 'normal' | 'warning' | 'error';
    apiStatus: 'normal' | 'warning' | 'error';
    databaseStatus: 'normal' | 'warning' | 'error';
  }> {
    try {
      const response = await api.get<{ success: boolean; status: any }>('/dashboard/system-status');
      return response.data.status;
    } catch (error) {
      console.error('获取系统状态失败:', error);
      // 返回默认状态
      return {
        systemStatus: 'normal',
        apiStatus: 'normal',
        databaseStatus: 'normal'
      };
    }
  }

  // 获取用户统计
  async getUserStats(): Promise<{
    totalUsers: number;
    activeUsers: number;
    newUsersThisMonth: number;
  }> {
    try {
      const response = await api.get<{ success: boolean; stats: any }>('/dashboard/user-stats');
      return response.data.stats;
    } catch (error) {
      console.error('获取用户统计失败:', error);
      // 返回默认数据
      return {
        totalUsers: 0,
        activeUsers: 0,
        newUsersThisMonth: 0
      };
    }
  }
}

export const dashboardAPI = new DashboardAPI(); 