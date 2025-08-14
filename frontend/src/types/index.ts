// 企业相关类型
export interface Enterprise {
  _id: string;
  name: string;
  emailSuffix: string;
  creditCode: string;
  avatar?: string;
  description?: string;
  address?: string;
  phone?: string;
  website?: string;
  industry?: string;
  size?: 'small' | 'medium' | 'large' | 'enterprise';
  status: 'active' | 'inactive' | 'pending';
  maxMembers: number;
  currentMembers: number;
  departments: Department[];
  createdAt: string;
  updatedAt: string;
}

export interface Department {
  _id: string;
  name: string;
  code: string;
  description?: string;
  enterprise: string;
  parent?: string;
  level: number;
  path: string[];
  manager?: User;
  members: string[];
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EnterpriseMessage {
  _id: string;
  enterprise: string;
  sender: User;
  content: string;
  type: 'general' | 'announcement' | 'department' | 'mention';
  recipients: string[];
  mentionedUsers: User[];
  mentionedDepartments: Department[];
  isPinned: boolean;
  isRead: string[];
  attachments?: string[];
  createdAt: string;
  updatedAt: string;
}

// 用户相关类型
export interface User {
  _id: string;
  email: string;
  name: string;
  role: 'superadmin' | 'admin' | 'teacher' | 'student';
  enterpriseName?: string; // 企业名称（用于显示）
  avatar?: string;
  enterpriseId?: string; // 所属企业ID
  // 个性化信息
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
  isEmailVerified: boolean;
  lastLogin?: string;
  emailSuffix: string;
  // 社交功能
  followers?: string[]; // 粉丝列表（用户ID数组）
  following?: string[]; // 关注列表（用户ID数组）
  favorites?: string[]; // 收藏的题目（题目ID数组）
  createdAt: string;
  updatedAt: string;
}

// 题目相关类型
export interface Question {
  _id: string;
  id?: string; // 本地ID，用于拖拽等操作
  qid: string;
  bid: string; // 所属题库ID
  type: 'choice' | 'multiple-choice' | 'fill' | 'solution';
  content: {
    stem: string;
    options?: Array<{
      text: string;
      isCorrect: boolean;
    }>;
    answer: string;
    fillAnswers?: string[];
    solutionAnswers?: string[];
    solution?: string;
  };
  category?: string; // 小题型（最多三个，用逗号分隔）
  tags?: string[]; // 知识点标签（最多五个）
  source?: string; // 题目出处
  creator: User;
  questionBank: string; // 题库引用
  status: 'draft' | 'published' | 'archived';
  difficulty: number; // 1-5星难度
  views: number;
  favorites?: string[]; // 收藏用户ID列表
  createdAt: string;
  updatedAt: string;
  relevanceScore?: number; // 相关度分数（0-1）
  isSelected?: boolean; // 是否被选中
}

// API响应类型
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// 分页类型
export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// 认证相关类型
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  name: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// 表单类型
export interface QuestionFormData {
  type: 'choice' | 'multiple-choice' | 'fill' | 'solution';
  content: {
    stem: string;
    options?: Array<{
      text: string;
      isCorrect: boolean;
    }>;
    answer: string;
    fillAnswers?: string[];
    solutionAnswers?: string[];
    solution?: string;
  };
  category?: string;
  tags?: string[];
  source?: string;
  difficulty: number;
}

// 题库相关类型
export interface QuestionBank {
  _id: string;
  bid: string;
  name: string;
  description?: string;
  cover?: string;
  creator: User;
  managers: User[];
  collaborators: User[];
  isPublic: boolean;
  allowCollaboration: boolean;
  maxQuestions: number;
  questionCount: number;
  lastUpdated: string;
  tags: string[];
  category?: string;
  emailSuffix: string;
  status: 'active' | 'archived' | 'deleted';
  createdAt: string;
  updatedAt: string;
  userRole?: 'creator' | 'manager' | 'collaborator' | 'viewer';
  canCreateQuestions?: boolean;
}

export interface CreateQuestionBankRequest {
  name: string;
  description?: string;
  category?: string;
  tags?: string[];
  isPublic?: boolean;
  allowCollaboration?: boolean;
}

export interface UpdateQuestionBankRequest {
  name?: string;
  description?: string;
  category?: string;
  tags?: string[];
  isPublic?: boolean;
  allowCollaboration?: boolean;
}

export interface QuestionBankMember {
  email: string;
  role: 'manager' | 'collaborator';
}

// 题目相关类型更新
export interface CreateQuestionRequest {
  type: 'choice' | 'multiple-choice' | 'fill' | 'solution';
  content: {
    stem: string;
    options?: Array<{
      text: string;
      isCorrect: boolean;
    }>;
    answer: string;
    fillAnswers?: string[];
    solutionAnswers?: string[];
    solution?: string;
  };
  category?: string;
  tags?: string[];
  source?: string;
  difficulty?: number;
}

export interface UpdateQuestionRequest {
  type?: 'choice' | 'multiple-choice' | 'fill' | 'solution';
  content?: {
    stem?: string;
    options?: Array<{
      text: string;
      isCorrect: boolean;
    }>;
    answer?: string;
    fillAnswers?: string[];
    solutionAnswers?: string[];
    solution?: string;
  };
  category?: string;
  tags?: string[];
  source?: string;
  difficulty?: number;
  status?: 'draft' | 'published' | 'archived';
}

// API响应类型
export interface QuestionBankApiResponse {
  success: boolean;
  questionBank?: QuestionBank;
  questionBanks?: QuestionBank[];
  members?: {
    creator?: {
      _id: string;
      name: string;
      email: string;
    };
    managers?: Array<{
      _id: string;
      name: string;
      email: string;
    }>;
    collaborators?: Array<{
      _id: string;
      name: string;
      email: string;
    }>;
  };
  message?: string;
  error?: string;
}

// 企业相关API响应类型
export interface EnterpriseApiResponse {
  success: boolean;
  enterprise?: Enterprise;
  enterprises?: Enterprise[];
  message?: string;
  error?: string;
}

export interface DepartmentApiResponse {
  success: boolean;
  department?: Department;
  departments?: Department[];
  message?: string;
  error?: string;
}

export interface EnterpriseMessageApiResponse {
  success: boolean;
  messageData?: EnterpriseMessage;
  messages?: EnterpriseMessage[];
  data?: {
    messages: EnterpriseMessage[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
  message?: string;
  error?: string;
}

export interface EnterpriseMembersResponse {
  success: boolean;
  data: {
    members: User[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
  message?: string;
  error?: string;
}

export interface QuestionApiResponse {
  success: boolean;
  question?: Question;
  questions?: Question[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  message?: string;
  error?: string;
}

// 题目管理相关类型
export interface QuestionListResponse {
  success: boolean;
  data: {
    questions: Question[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
    statistics: {
      total: number;
      byType: Record<string, number>;
      byDifficulty: Record<string, number>;
      byBank: Record<string, number>;
      byStatus: Record<string, number>;
    };
    filters: {
      availableTags: string[];
      availableBanks: Array<{id: string, name: string}>;
      difficultyRange: {min: number, max: number};
    };
  };
  message?: string;
  error?: string;
}

export interface StatisticsResponse {
  success: boolean;
  data: {
    overview: {
      total: number;
      published: number;
      draft: number;
      archived: number;
    };
    trends: Array<{
      date: string;
      created: number;
      updated: number;
      used: number;
    }>;
    distribution: Record<string, number>;
    topQuestions: Array<{
      questionId: string;
      title: string;
      views: number;
      rating: number;
    }>;
  };
  message?: string;
  error?: string;
}

export interface BatchOperationResponse {
  success: boolean;
  data: {
    processed: number;
    success: number;
    failed: number;
    errors?: Array<{
      questionId: string;
      error: string;
    }>;
    downloadUrl?: string;
  };
  message?: string;
  error?: string;
}

// 相似度检测相关类型
export interface SimilarityResult {
  question: {
    _id: string;
    qid: string;
    content: {
      stem: string;
      options?: Array<{ text: string; isCorrect: boolean }>;
      answer: string;
    };
    type: string;
    difficulty: number;
    category?: string;
    tags?: string[];
    creator: any;
    createdAt: string;
    views: number;
    source?: string;
  };
  similarityScore: number;
  similarityDetails: {
    contentSimilarity: number;
    structureSimilarity: number;
    semanticSimilarity: number;
  };
  reasons: string[];
}

export interface SimilarityDetectionResponse {
  success: boolean;
  warning?: boolean;
  message?: string;
  similarQuestions: SimilarityResult[];
  total: number;
  threshold: number;
  detectionInfo: {
    contentWeight: number;
    structureWeight: number;
    semanticWeight: number;
  };
}

export interface RealTimeSimilarityResponse {
  success: boolean;
  hasSimilar: boolean;
  similarCount: number;
  maxSimilarity: number;
}

// AI分析结果类型
export interface AIAnalysisResult {
  category: string; // 小题型
  tags: string[]; // 知识点标签
  options?: string[]; // 选择题选项
  difficulty: number; // 难度等级 1-5
  questionType: 'choice' | 'multiple-choice' | 'fill' | 'solution'; // 题目类型
} 