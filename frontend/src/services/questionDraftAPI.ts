import axios from 'axios';
const config = {
  apiUrl: import.meta.env.DEV 
    ? 'http://localhost:3001'
    : (import.meta.env.VITE_API_URL || 'https://www.mareate.com/api')
};
import type { Question } from '../types';

// 草稿接口类型
export interface QuestionDraft {
  _id: string;
  name: string;
  description?: string;
  questions: Question[];
  documentInfo?: {
    id: string;
    fileName: string;
    fileType: string;
    confidence?: number;
    processTime?: Date;
  };
  creator: string;
  isPublic: boolean;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

// 创建草稿请求参数
export interface CreateDraftRequest {
  name: string;
  description?: string;
  questions: Question[];
  documentInfo?: {
    id: string;
    fileName: string;
    fileType: string;
    confidence?: number;
    processTime?: Date;
  };
  tags?: string[];
  isPublic?: boolean;
}

// 更新草稿请求参数
export interface UpdateDraftRequest {
  name?: string;
  description?: string;
  questions?: Question[];
  documentInfo?: {
    id: string;
    fileName: string;
    fileType: string;
    confidence?: number;
    processTime?: Date;
  };
  tags?: string[];
  isPublic?: boolean;
}

// 草稿列表响应
export interface DraftListResponse {
  drafts: QuestionDraft[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// 创建axios实例
const questionDraftAPI = axios.create({
  baseURL: `${config.apiUrl}/api/question-drafts`,
  timeout: 15000, // 减少超时时间到15秒
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器 - 添加认证token
questionDraftAPI.interceptors.request.use(
  (config) => {
    // 从Zustand持久化数据中获取token
    const authStorage = localStorage.getItem('auth-storage');
    if (authStorage) {
      try {
        const authData = JSON.parse(authStorage);
        if (authData.state && authData.state.token) {
          config.headers.Authorization = `Bearer ${authData.state.token}`;
        }
      } catch (error) {
        console.error('Failed to parse auth storage:', error);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器 - 统一错误处理
questionDraftAPI.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('草稿API请求失败:', error);
    
    // 根据错误类型提供更友好的错误信息
    if (error.response?.status === 401) {
      console.error('认证失败，请重新登录');
    } else if (error.response?.status === 400) {
      console.error('请求参数错误:', error.response.data?.message);
    } else if (error.response?.status === 500) {
      console.error('服务器内部错误:', error.response.data?.message);
    }
    
    return Promise.reject(error);
  }
);

// 用户草稿管理API
export const userDraftAPI = {
  // 获取用户草稿列表
  getDrafts: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    tags?: string[];
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<DraftListResponse> => {
    try {
      const response = await questionDraftAPI.get('/user', { params });
      
      // 检查响应结构
      if (!response || !response.data) {
        console.error('草稿API响应结构异常:', response);
        throw new Error('API响应结构异常');
      }
      
      // 检查data字段
      if (!response.data.data) {
        console.error('草稿API data字段缺失:', response.data);
        throw new Error('API数据字段缺失');
      }
      
      // 检查drafts字段
      if (!response.data.data.drafts || !Array.isArray(response.data.data.drafts)) {
        console.error('草稿API drafts字段异常:', response.data.data);
        throw new Error('草稿数据格式异常');
      }
      
      return response.data.data;
    } catch (error) {
      console.error('获取草稿列表API调用失败:', error);
      throw error;
    }
  },

  // 获取单个草稿详情
  getDraftById: async (id: string): Promise<QuestionDraft> => {
    try {
      const response = await questionDraftAPI.get(`/user/${id}`);
      
      if (!response || !response.data || !response.data.data) {
        console.error('草稿详情API响应异常:', response);
        throw new Error('草稿详情获取失败');
      }
      
      return response.data.data;
    } catch (error) {
      console.error('获取草稿详情API调用失败:', error);
      throw error;
    }
  },

  // 创建草稿
  createDraft: async (data: CreateDraftRequest): Promise<QuestionDraft> => {
    const response = await questionDraftAPI.post('/user', data);
    return response.data.data;
  },

  // 更新草稿
  updateDraft: async (id: string, data: UpdateDraftRequest): Promise<QuestionDraft> => {
    const response = await questionDraftAPI.put(`/user/${id}`, data);
    return response.data.data;
  },

  // 删除草稿
  deleteDraft: async (id: string): Promise<void> => {
    await questionDraftAPI.delete(`/user/${id}`);
  },

  // 批量删除草稿
  batchDeleteDrafts: async (ids: string[]): Promise<{ deletedCount: number }> => {
    const response = await questionDraftAPI.post('/user/batch-delete', { ids });
    return response.data.data;
  },

  // 复制草稿
  duplicateDraft: async (id: string): Promise<QuestionDraft> => {
    const response = await questionDraftAPI.post(`/user/${id}/duplicate`);
    return response.data.data;
  },
};

// 公开草稿API
export const publicDraftAPI = {
  // 获取公开草稿列表
  getPublicDrafts: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    tags?: string[];
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<DraftListResponse> => {
    const response = await questionDraftAPI.get('/public', { params });
    return response.data.data;
  },

  // 获取公开草稿详情
  getPublicDraftById: async (id: string): Promise<QuestionDraft> => {
    const response = await questionDraftAPI.get(`/public/${id}`);
    return response.data.data;
  },
};

export default questionDraftAPI;
