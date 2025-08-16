import axios from 'axios';
import type { 
  ApiResponse,
  QuestionBankApiResponse, 
  QuestionApiResponse,
  CreateQuestionBankRequest,
  UpdateQuestionBankRequest,
  QuestionBankMember,
  CreateQuestionRequest,
  UpdateQuestionRequest,
  QuestionListResponse,
  StatisticsResponse,
  BatchOperationResponse,
  Question
} from '../types';

// 自定义弹窗函数，用于替代原生alert
const showCustomAlert = (message: string) => {
  // 创建一个简单的弹窗元素
  const alertDiv = document.createElement('div');
  alertDiv.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: white;
    border: 1px solid #ccc;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 10000;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    max-width: 400px;
    text-align: center;
  `;
  
  alertDiv.innerHTML = `
    <div style="margin-bottom: 15px; color: #333;">${message}</div>
    <button onclick="this.parentElement.remove()" style="
      background: #007bff;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
    ">确定</button>
  `;
  
  document.body.appendChild(alertDiv);
  
  // 3秒后自动移除
  setTimeout(() => {
    if (alertDiv.parentElement) {
      alertDiv.remove();
    }
  }, 3000);
};

// 创建axios实例
const api = axios.create({
  baseURL: import.meta.env.DEV ? '/api' : (import.meta.env.VITE_API_URL || 'https://www.mareate.com/api'),
  timeout: 30000, // 增加到30秒
  headers: {
    'Content-Type': 'application/json',
  },
});

// 创建专门用于AI分析的axios实例，超时时间设置为3分钟
const aiAnalysisApi = axios.create({
  baseURL: import.meta.env.DEV ? '/api' : (import.meta.env.VITE_API_URL || 'https://www.mareate.com/api'),
  timeout: 180000, // 3分钟 = 180000毫秒
  headers: {
    'Content-Type': 'application/json',
  },
});

// 创建专门用于OCR的axios实例，超时时间设置为3分钟（因为包含DeepSeek AI矫正）
const ocrApi = axios.create({
  baseURL: import.meta.env.DEV ? '/api' : (import.meta.env.VITE_API_URL || 'https://www.mareate.com/api'),
  timeout: 180000, // 3分钟 = 180000毫秒
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器 - 添加token
api.interceptors.request.use(
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

// AI分析API的请求拦截器 - 添加token
aiAnalysisApi.interceptors.request.use(
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

// OCR API的请求拦截器 - 添加token
ocrApi.interceptors.request.use(
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
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // 处理404错误 - 重定向到404页面
    if (error.response?.status === 404) {
      window.location.href = '/error/404';
      return Promise.reject(error);
    }
    
    // 处理401错误（包括密码更改后的token失效）
    if (error.response?.status === 401) {
      const errorMessage = error.response?.data?.error || '';
      const requestUrl = error.config?.url || '';
      
      // 如果是登出API，不进行特殊处理
      if (requestUrl.includes('/auth/logout')) {
        return Promise.reject(error);
      }
      
      // 如果是密码更改导致的token失效，显示特殊提示
      if (errorMessage.includes('密码已更改') || errorMessage.includes('请重新登录')) {
        // 清除认证状态
        localStorage.removeItem('auth-storage');
        // 显示提示并跳转到登录页
        showCustomAlert('密码已更改，请使用新密码重新登录');
        window.location.href = '/login';
        return Promise.reject(error);
      }
      
      // 其他401错误（token过期、无效等），但不包括认证相关的API
      if (!requestUrl.includes('/auth/')) {
        // 清除认证状态并重定向到登录页
        localStorage.removeItem('auth-storage');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// AI分析API的响应拦截器 - 统一错误处理
aiAnalysisApi.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // 处理404错误 - 重定向到404页面
    if (error.response?.status === 404) {
      window.location.href = '/error/404';
      return Promise.reject(error);
    }
    
    // 处理401错误（包括密码更改后的token失效）
    if (error.response?.status === 401) {
      const errorMessage = error.response?.data?.error || '';
      const requestUrl = error.config?.url || '';
      
      // 如果是登出API，不进行特殊处理
      if (requestUrl.includes('/auth/logout')) {
        return Promise.reject(error);
      }
      
      // 如果是密码更改导致的token失效，显示特殊提示
      if (errorMessage.includes('密码已更改') || errorMessage.includes('请重新登录')) {
        // 清除认证状态
        localStorage.removeItem('auth-storage');
        // 显示提示并跳转到登录页
        showCustomAlert('密码已更改，请使用新密码重新登录');
        window.location.href = '/login';
        return Promise.reject(error);
      }
      
      // 其他401错误（token过期、无效等），但不包括认证相关的API
      if (!requestUrl.includes('/auth/')) {
        // 清除认证状态并重定向到登录页
        localStorage.removeItem('auth-storage');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// OCR API的响应拦截器 - 统一错误处理
ocrApi.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // 处理404错误 - 重定向到404页面
    if (error.response?.status === 404) {
      window.location.href = '/error/404';
      return Promise.reject(error);
    }
    
    // 处理401错误（包括密码更改后的token失效）
    if (error.response?.status === 401) {
      const errorMessage = error.response?.data?.error || '';
      const requestUrl = error.config?.url || '';
      
      // 如果是登出API，不进行特殊处理
      if (requestUrl.includes('/auth/logout')) {
        return Promise.reject(error);
      }
      
      // 如果是密码更改导致的token失效，显示特殊提示
      if (errorMessage.includes('密码已更改') || errorMessage.includes('请重新登录')) {
        // 清除认证状态
        localStorage.removeItem('auth-storage');
        // 显示提示并跳转到登录页
        showCustomAlert('密码已更改，请使用新密码重新登录');
        window.location.href = '/login';
        return Promise.reject(error);
      }
      
      // 其他401错误（token过期、无效等），但不包括认证相关的API
      if (!requestUrl.includes('/auth/')) {
        // 清除认证状态并重定向到登录页
        localStorage.removeItem('auth-storage');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// API方法
export const authAPI = {
  login: (credentials: { email: string; password: string }) =>
    api.post<{ success: boolean; token?: string; user?: any; error?: string }>('/auth/login', credentials),
  
  register: (credentials: { email: string; password: string; name: string }) =>
    api.post<{ success: boolean; token?: string; user?: any; error?: string; message?: string }>('/auth/register', credentials),
  
  // 获取允许注册的企业
  getAllowedEnterprises: () =>
    api.get<{ success: boolean; enterprises?: any[]; error?: string }>('/auth/allowed-enterprises'),
  
  logout: () => api.post<ApiResponse>('/auth/logout'),
  
  getProfile: () => api.get<ApiResponse<any>>('/auth/profile'),
  
  resendVerification: (email: string) => 
    api.post<{ success: boolean; message?: string; error?: string }>('/auth/resend-verification', { email }),
  
  // 忘记密码
  forgotPassword: (data: { email: string }) =>
    api.post<{ success: boolean; message?: string; error?: string }>('/auth/forgot-password', data),
  
  // 重置密码
  resetPassword: (data: { token: string; password: string }) =>
    api.post<{ success: boolean; message?: string; error?: string }>('/auth/reset-password', data),
  
  // 个人信息相关API
  getCurrentUser: () =>
    api.get<{ success: boolean; user?: any; error?: string }>('/auth/me'),

  // 搜索用户
  searchUsers: (query: string, limit?: number) =>
    api.get<{ success: boolean; users?: any[]; error?: string }>(`/users/search?q=${encodeURIComponent(query)}&limit=${limit || 10}`),
  
  updateProfile: (data: {
    name?: string;
    enterpriseName?: string;
    avatar?: string;
    nickname?: string;
    bio?: string;
    phone?: string;
    location?: string;
    website?: string;
    birthday?: string;
    gender?: 'male' | 'female' | 'other' | 'prefer-not-to-say';
    interests?: string[];
    skills?: string[];
    education?: string;
    occupation?: string;
    company?: string;
    position?: string;
    socialLinks?: {
      github?: string;
      linkedin?: string;
      twitter?: string;
      wechat?: string;
    };
    preferences?: {
      theme?: 'light' | 'dark' | 'auto';
      language?: 'zh-CN' | 'en-US';
      timezone?: string;
      notifications?: {
        email?: boolean;
        push?: boolean;
        sms?: boolean;
      };
    };
  }) =>
    api.put<{ success: boolean; user?: any; message?: string; error?: string }>('/auth/profile', data),
  
  uploadAvatar: (formData: FormData) =>
    api.post<{ success: boolean; avatarUrl?: string; user?: any; message?: string; error?: string }>('/auth/upload-avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
  
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.put<{ success: boolean; message?: string; error?: string }>('/auth/change-password', data),
  
  exportUserData: () =>
    api.get<{ success: boolean; downloadUrl?: string; error?: string }>('/auth/export-data'),
  
  deleteAccount: () =>
    api.delete<{ success: boolean; message?: string; error?: string }>('/auth/account'),
  
  getLoginHistory: (params?: { page?: number; limit?: number }) =>
    api.get<{ success: boolean; data?: { history: any[]; pagination: any }; error?: string }>('/auth/login-history', { params }),
  
  // 社交功能API
  followUser: (userId: string) =>
    api.post<{ success: boolean; message?: string; isFollowing?: boolean; error?: string }>(`/auth/follow/${userId}`),
  
  getFollowStatus: (userId: string) =>
    api.get<{ success: boolean; isFollowing?: boolean; error?: string }>(`/auth/follow-status/${userId}`),
  
  getSocialList: (userId: string, type: 'followers' | 'following') =>
    api.get<{ success: boolean; data?: any[]; error?: string }>(`/auth/social/${userId}`, { params: { type } }),
  
  toggleFavorite: (questionId: string) =>
    api.post<{ success: boolean; message?: string; isFavorited?: boolean; error?: string }>(`/auth/favorites/${questionId}`),
  
  getFavorites: (params?: { page?: number; limit?: number }) =>
    api.get<{ success: boolean; data?: { favorites: any[]; pagination: any }; error?: string }>('/auth/favorites', { params }),
};

// 题库API
export const questionBankAPI = {
  // 获取题库列表
  getQuestionBanks: () => 
    api.get<QuestionBankApiResponse>('/question-banks'),
  
  // 创建题库
  createQuestionBank: (data: CreateQuestionBankRequest) => 
    api.post<QuestionBankApiResponse>('/question-banks', data),
  
  // 获取题库详情
  getQuestionBank: (bid: string) => 
    api.get<QuestionBankApiResponse>(`/question-banks/${bid}`),
  
  // 更新题库
  updateQuestionBank: (bid: string, data: UpdateQuestionBankRequest) => 
    api.put<QuestionBankApiResponse>(`/question-banks/${bid}`, data),
  
  // 删除题库
  deleteQuestionBank: (bid: string) => 
    api.delete<QuestionBankApiResponse>(`/question-banks/${bid}`),
  
  // 添加题库成员
  addMember: (bid: string, data: QuestionBankMember) => 
    api.post<QuestionBankApiResponse>(`/question-banks/${bid}/members`, data),
  
  // 移除题库成员
  removeMember: (bid: string, userId: string) => 
    api.delete<QuestionBankApiResponse>(`/question-banks/${bid}/members/${userId}`),
  
  // 获取题库成员列表
  getMembers: (bid: string) => 
    api.get<QuestionBankApiResponse>(`/question-banks/${bid}/members`),

  // 获取题库统计分析
  getStats: (bid: string) =>
    api.get<{ success: boolean; questionBank: any; stats: any }>(`/question-banks/${bid}/stats`),
  
  // 更新题库高级设置
  updateSettings: (bid: string, data: any) =>
    api.put<{ success: boolean; questionBank: any; message: string; error?: string }>(`/question-banks/${bid}/settings`, data),
};

// 题目API
export const questionAPI = {
  // 获取所有题目（支持筛选和分页）
  getAllQuestions: (params?: {
    search?: string;
    bankId?: string | string[];
    type?: string | string[];
    difficulty?: number | number[];
    tags?: string[];
    status?: string;
    creator?: string;
    dateRange?: { start: string; end: string };
    views?: { min: number; max: number };
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
  }) => 
    api.get<QuestionListResponse>('/questions', { params }),
  
  // 获取题目统计数据
  getQuestionStatistics: (params?: {
    timeRange?: 'day' | 'week' | 'month' | 'year' | 'all';
    bankId?: string;
    groupBy?: 'type' | 'difficulty' | 'bank' | 'creator' | 'date';
  }) => 
    api.get<StatisticsResponse>('/questions/statistics', { params }),
  
  // 批量操作
  batchOperation: (data: {
    operation: 'delete' | 'move' | 'update' | 'export';
    questionIds: string[];
    targetBankId?: string;
    updates?: Partial<Question>;
    exportFormat?: 'excel' | 'pdf' | 'latex';
  }) => 
    api.post<BatchOperationResponse>('/questions/batch', data),
  
  // 获取题库内的题目列表
  getQuestions: (bid: string, params?: {
    page?: number;
    limit?: number;
    status?: string;
    type?: string;
  }) => 
    api.get<QuestionApiResponse>(`/questions/bank/${bid}`, { params }),
  
  // 创建题目
  createQuestion: (bid: string, data: CreateQuestionRequest) => 
    api.post<QuestionApiResponse>(`/questions/bank/${bid}`, data),
  
  // 获取题目详情
  getQuestion: (qid: string) => 
    api.get<QuestionApiResponse>(`/questions/${qid}`),
  
  // 更新题目
  updateQuestion: (qid: string, data: UpdateQuestionRequest) => 
    api.put<QuestionApiResponse>(`/questions/${qid}`, data),
  
  // 删除题目
  deleteQuestion: (qid: string) => 
    api.delete<QuestionApiResponse>(`/questions/${qid}`),
  
  // 获取推荐题目
  getRecommendations: (bid: string, params?: {
    knowledge?: string;
    difficulty?: number;
    type?: string;
  }) => 
    api.get<QuestionApiResponse>(`/questions/bank/${bid}/recommend`, { params }),
  
  // 增加题目浏览量
  addView: (qid: string) =>
    api.post<{ success: boolean; views: number; message: string }>(`/questions/${qid}/view`),
  
  // 收藏/取消收藏题目
  toggleFavorite: (qid: string) =>
    api.post<{ success: boolean; isFavorited: boolean; favoritesCount: number; message: string }>(`/questions/${qid}/favorite`),
  
  // 获取用户收藏的题目列表
  getFavorites: (params?: {
    page?: number;
    limit?: number;
  }) =>
    api.get<QuestionApiResponse>('/questions/favorites', { params }),

  // 获取相关题目
  getRelatedQuestions: (qid: string, params?: {
    limit?: number;
    excludeCurrent?: boolean;
  }) => 
    api.get<QuestionApiResponse>(`/questions/${qid}/related`, { params }),

  // 相似度检测
  detectSimilarity: (data: {
    stem: string;
    type: string;
    difficulty: number;
    category?: string;
    tags?: string[];
    options?: Array<{ text: string; isCorrect: boolean }>;
    answer?: string;
    threshold?: number;
  }) => 
    api.post<{
      success: boolean;
      similarQuestions: any[];
      total: number;
      threshold: number;
      detectionInfo: any;
    }>('/similarity/detect', data),

  // 实时相似度检测
  detectSimilarityRealTime: (data: {
    stem: string;
    type: string;
    difficulty: number;
  }) => 
    api.post<{
      success: boolean;
      hasSimilar: boolean;
      similarCount: number;
      maxSimilarity: number;
    }>('/similarity/detect-realtime', data),
};

// 用户管理API
export const userAPI = {
  // 获取所有用户
  getAllUsers: () => 
    api.get<{ success: boolean; users: any[] }>('/users'),
  
  // 获取单个用户详情
  getUser: (userId: string) => 
    api.get<{ success: boolean; user: any }>(`/users/${userId}`),
  
  // 更新用户信息
  updateUser: (userId: string, data: {
    name?: string;
    role?: 'admin' | 'teacher' | 'student';
    department?: string;
    isActive?: boolean;
  }) => 
    api.put<{ success: boolean; message: string; user: any }>(`/users/${userId}`, data),
  
  // 删除用户
  deleteUser: (userId: string) => 
    api.delete<{ success: boolean; message: string }>(`/users/${userId}`),
  
  // 批量操作
  batchOperation: (data: {
    operation: 'delete' | 'update' | 'activate' | 'deactivate';
    userIds: string[];
    updates?: any;
  }) => 
    api.post<{ success: boolean; message: string }>('/users/batch', data),
};

// 企业管理API（仅superadmin可访问）
// 注意：企业相关API已迁移到 enterpriseService.ts，这里保留向后兼容的导出
export const enterpriseAPI = {
  // 这些方法现在从 enterpriseService 导入，保持向后兼容
  getAllEnterprises: () => import('./enterpriseService').then(m => m.enterpriseService.getAllEnterprises()),
  createEnterprise: (data: any) => import('./enterpriseService').then(m => m.enterpriseService.createEnterprise(data)),
  getEnterprise: (enterpriseId: string) => import('./enterpriseService').then(m => m.enterpriseService.getEnterprise(enterpriseId)),
  updateEnterprise: (enterpriseId: string, data: any) => import('./enterpriseService').then(m => m.enterpriseService.updateEnterprise(enterpriseId, data)),
  uploadEnterpriseAvatar: (enterpriseId: string, formData: FormData) => import('./enterpriseService').then(m => m.enterpriseService.uploadEnterpriseAvatar(enterpriseId, formData)),
  deleteEnterprise: (enterpriseId: string) => import('./enterpriseService').then(m => m.enterpriseService.deleteEnterprise(enterpriseId)),
};

// 我的企业API
// 注意：企业相关API已迁移到 enterpriseService.ts，这里保留向后兼容的导出
export const myEnterpriseAPI = {
  // 这些方法现在从 enterpriseService 导入，保持向后兼容
  getEnterpriseInfo: () => import('./enterpriseService').then(m => m.enterpriseService.getMyEnterpriseInfo()),
  getEnterpriseMembers: (params?: any) => import('./enterpriseService').then(m => m.enterpriseService.getEnterpriseMembers(params)),
  getEnterpriseDepartments: () => import('./enterpriseService').then(m => m.enterpriseService.getEnterpriseDepartments()),
  createDepartment: (data: any) => import('./enterpriseService').then(m => m.enterpriseService.createDepartment(data)),
  updateDepartment: (departmentId: string, data: any) => import('./enterpriseService').then(m => m.enterpriseService.updateDepartment(departmentId, data)),
  deleteDepartment: (departmentId: string) => import('./enterpriseService').then(m => m.enterpriseService.deleteDepartment(departmentId)),
  sendMessage: (data: any) => import('./enterpriseService').then(m => m.enterpriseService.sendMessage(data)),
  getMessages: (params?: any) => import('./enterpriseService').then(m => m.enterpriseService.getMessages(params)),
};

// OCR API
export const ocrAPI = {
  // 单张图片OCR识别 - 使用专门的OCR API实例，超时时间3分钟
  recognizeImage: async (imageFile: File) => {
    try {
      console.log('开始OCR识别，预计可能需要较长时间...');
      
      const formData = new FormData();
      formData.append('image', imageFile);
      
      // 使用专门的OCR API实例，超时时间3分钟
      const response = await ocrApi.post<{ 
        success: boolean; 
        latex: string; 
        confidence: number; 
        isChoiceQuestion?: boolean;
        questionContent?: string;
        options?: string[];
        message: string; 
        error?: string 
      }>('/ocr/recognize', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      console.log('OCR识别完成');
      return response;
    } catch (error: any) {
      // 如果是超时错误，提供更友好的错误信息
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        console.error('OCR识别超时（超过3分钟）:', error.message);
        throw new Error('OCR识别超时，请稍后重试或尝试上传更清晰的图片');
      }
      
      // 其他错误正常抛出
      console.error('OCR识别失败:', error.response?.data || error.message);
      throw error;
    }
  },

  // 批量图片OCR识别 - 使用专门的OCR API实例，超时时间3分钟
  recognizeImages: async (imageFiles: File[]) => {
    try {
      console.log('开始批量OCR识别，预计可能需要较长时间...');
      
      const formData = new FormData();
      imageFiles.forEach((file) => {
        formData.append('images', file);
      });
      
      // 使用专门的OCR API实例，超时时间3分钟
      const response = await ocrApi.post<{ success: boolean; results: any[]; message: string; error?: string }>('/ocr/recognize-batch', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      console.log('批量OCR识别完成');
      return response;
    } catch (error: any) {
      // 如果是超时错误，提供更友好的错误信息
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        console.error('批量OCR识别超时（超过3分钟）:', error.message);
        throw new Error('批量OCR识别超时，请稍后重试或减少图片数量');
      }
      
      // 其他错误正常抛出
      console.error('批量OCR识别失败:', error.response?.data || error.message);
      throw error;
    }
  },

  // 检查OCR服务状态
  checkStatus: () => ocrApi.get<{ success: boolean; status: string; message: string; error?: string }>('/ocr/status'),
};

// 题目分析API
export const questionAnalysisAPI = {
  // 分析题目内容 - 使用专门的AI分析API实例，超时时间3分钟
  analyzeQuestion: async (content: string) => {
    try {
      console.log('开始AI分析，预计可能需要较长时间...');
      
      // 使用专门的AI分析API实例，超时时间3分钟
      const response = await aiAnalysisApi.post<{ success: boolean; analysis: {
        category: string;
        tags: string[];
        options: string[];
        difficulty: number;
        questionType: 'choice' | 'multiple-choice' | 'fill' | 'solution';
      } }>('/question-analysis/analyze', { content });
      
      console.log('AI分析完成');
      return response;
    } catch (error: any) {
      // 如果是超时错误，提供更友好的错误信息
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        console.error('AI分析超时（超过3分钟）:', error.message);
        throw new Error('AI分析超时，请稍后重试或尝试简化题目内容');
      }
      
      // 其他错误正常抛出
      console.error('AI分析失败:', error.response?.data || error.message);
      throw error;
    }
  },

  // 文档解析 - 使用专门的AI分析API实例，超时时间5分钟
  parseDocument: async (formData: FormData) => {
    try {
      console.log('开始文档解析，预计可能需要较长时间...');
      
      // 使用专门的AI分析API实例，超时时间5分钟
      const response = await aiAnalysisApi.post<{ 
        success: boolean; 
        result: {
          questions: any[];
          metadata: {
            filename: string;
            fileType: 'word' | 'latex' | 'pdf';
            fileSize: number;
            pages: number;
            parseTime: number;
            extractedAt: string;
          };
          statistics: {
            totalQuestions: number;
            choiceQuestions: number;
            fillQuestions: number;
            solutionQuestions: number;
            mathFormulas: number;
            images: number;
            tables: number;
            confidence: number;
          };
          errors: Array<{
            id: string;
            type: 'parsing' | 'format' | 'content' | 'ai';
            message: string;
            line?: number;
            questionIndex?: number;
            severity: 'error' | 'warning' | 'info';
          }>;
          warnings: Array<{
            id: string;
            type: 'format' | 'content' | 'quality';
            message: string;
            suggestion: string;
            questionIndex?: number;
          }>;
        };
        message: string; 
        error?: string 
      }>('/document-parser/parse', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 300000, // 5分钟
      });
      
      console.log('文档解析完成');
      return response;
    } catch (error: any) {
      // 如果是超时错误，提供更友好的错误信息
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        console.error('文档解析超时（超过5分钟）:', error.message);
        throw new Error('文档解析超时，请稍后重试或尝试上传较小的文件');
      }
      
      // 其他错误正常抛出
      console.error('文档解析失败:', error.response?.data || error.message);
      throw error;
    }
  },
};

export default api; 