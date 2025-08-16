import api from './api';

// 企业相关类型定义
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
  departments: string[];
  createdAt: string;
  updatedAt: string;
}

export interface EnterpriseMember {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  lastLogin?: string;
  createdAt: string;
  role: string;
  permissions: string[];
  departmentId?: string;
  position?: string;
  joinDate: string;
  status: string;
  enterpriseName: string;
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
  manager?: string;
  members: string[];
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EnterpriseMessage {
  _id: string;
  enterprise: string;
  sender: {
    _id: string;
    name: string;
    avatar?: string;
  };
  content: string;
  type: 'general' | 'announcement' | 'department' | 'mention' | 'group' | 'reply';
  recipients: string[];
  mentionedUsers: Array<{
    _id: string;
    name: string;
  }>;
  mentionedDepartments: Array<{
    _id: string;
    name: string;
  }>;
  isPinned: boolean;
  isRead: string[];
  attachments?: string[];
  // 回复相关字段
  replyTo?: string;
  replyChain?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface EnterpriseInfo {
  enterprise: {
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
    size?: string;
    status: string;
    maxMembers: number;
    currentMembers: number;
  };
  userRole: {
    isSuperAdmin: boolean;
    isAdmin: boolean;
    isMember: boolean;
    role: string;
    permissions: string[];
    departmentId?: string;
    position?: string;
    joinDate: string;
  };
  currentUser: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
  };
}

// 统一的企业服务
export const enterpriseService = {
  // ==================== 企业管理 (超级管理员) ====================
  
  // 获取所有企业列表
  getAllEnterprises: () => 
    api.get<{ success: boolean; enterprises: Enterprise[] }>('/enterprises'),
  
  // 获取企业详情
  getEnterprise: (enterpriseId: string) => 
    api.get<{ success: boolean; enterprise: Enterprise }>(`/enterprises/${enterpriseId}`),
  
  // 创建企业
  createEnterprise: (data: {
    name: string;
    emailSuffix: string;
    creditCode: string;
    maxMembers: number;
    description?: string;
    address?: string;
    phone?: string;
    website?: string;
    industry?: string;
    size?: 'small' | 'medium' | 'large' | 'enterprise';
  }) => 
    api.post<{ success: boolean; message: string; enterprise: Enterprise }>('/enterprises', data),
  
  // 更新企业信息
  updateEnterprise: (enterpriseId: string, data: {
    name?: string;
    maxMembers?: number;
    status?: 'active' | 'inactive' | 'pending';
    description?: string;
    address?: string;
    phone?: string;
    website?: string;
    industry?: string;
    size?: 'small' | 'medium' | 'large' | 'enterprise';
  }) => 
    api.put<{ success: boolean; message: string; enterprise: Enterprise }>(`/enterprises/${enterpriseId}`, data),
  
  // 上传企业头像
  uploadEnterpriseAvatar: (enterpriseId: string, formData: FormData) =>
    api.post<{ success: boolean; message: string; avatarUrl: string }>(`/enterprises/${enterpriseId}/avatar`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
  
  // 删除企业
  deleteEnterprise: (enterpriseId: string) => 
    api.delete<{ success: boolean; message: string }>(`/enterprises/${enterpriseId}`),

  // ==================== 我的企业 (企业成员) ====================
  
  // 获取当前用户的企业信息
  getMyEnterpriseInfo: () => 
    api.get<{ success: boolean } & EnterpriseInfo>('/my-enterprise/info'),
  
  // 获取企业成员列表
  getEnterpriseMembers: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    department?: string;
  }) => 
    api.get<{ 
      success: boolean; 
      data: {
        members: EnterpriseMember[];
        pagination: {
          page: number;
          limit: number;
          total: number;
          totalPages: number;
        };
      };
    }>('/my-enterprise/members', { params }),
  
  // 获取企业部门列表
  getEnterpriseDepartments: () => 
    api.get<{ 
      success: boolean; 
      data: Department[];
    }>('/my-enterprise/departments'),
  
  // 创建部门
  createDepartment: (data: {
    name: string;
    code: string;
    description?: string;
    parentId?: string;
    managerId?: string;
  }) => 
    api.post<{ success: boolean; message: string; department: Department }>('/my-enterprise/departments', data),
  
  // 更新部门
  updateDepartment: (departmentId: string, data: {
    name?: string;
    description?: string;
    managerId?: string;
    isActive?: boolean;
  }) => 
    api.put<{ success: boolean; message: string; department: Department }>(`/my-enterprise/departments/${departmentId}`, data),
  
  // 删除部门
  deleteDepartment: (departmentId: string) => 
    api.delete<{ success: boolean; message: string }>(`/my-enterprise/departments/${departmentId}`),
  
    // 发送企业消息
  sendMessage: (data: {
    content: string;
    type?: 'general' | 'announcement' | 'department' | 'mention' | 'group' | 'reply';
    recipients?: string[];
    departmentId?: string;
    mentionedUsers?: string[];
    mentionedDepartments?: string[];
    replyTo?: string;
  }) =>
    api.post<{ success: boolean; message: string; data: EnterpriseMessage }>('/my-enterprise/messages', data),
  
  // 获取企业消息列表
  getMessages: (params?: {
    page?: number;
    limit?: number;
    type?: string;
  }) => 
    api.get<{ 
      success: boolean; 
      data: {
        messages: (EnterpriseMessage & { replies?: EnterpriseMessage[] })[];
        pagination: {
          page: number;
          limit: number;
          total: number;
          totalPages: number;
        };
      };
    }>('/my-enterprise/messages', { params }),

  // 删除企业消息
  deleteMessage: (messageId: string) =>
    api.delete<{ success: boolean; message: string }>(`/my-enterprise/messages/${messageId}`),

  // 标记消息为已读
  markMessageAsRead: (messageId: string) =>
    api.put<{ success: boolean; message: string }>(`/my-enterprise/messages/${messageId}/read`),

  // 获取未读消息数量
  getUnreadMessageCount: () =>
    api.get<{ success: boolean; data: { unreadCount: number } }>('/my-enterprise/messages/unread-count'),

  // 获取成员详情
  getMemberDetail: (memberId: string) =>
    api.get<{ success: boolean; data: EnterpriseMember }>(`/my-enterprise/members/${memberId}`),

  // 更新成员职位
  updateMemberPosition: (memberId: string, data: {
    role?: 'member' | 'admin';
    position?: string;
    departmentId?: string;
    permissions?: string[];
  }) =>
    api.put<{ success: boolean; message: string; data: EnterpriseMember }>(`/my-enterprise/members/${memberId}/position`, data),

  // 转让超级管理员身份
  transferSuperAdmin: (newSuperAdminId: string) =>
    api.put<{ success: boolean; message: string; data: { oldSuperAdmin: string; newSuperAdmin: string } }>('/my-enterprise/transfer-super-admin', { newSuperAdminId }),

  // 设置管理员身份
  setAdminRole: (memberId: string, data: {
    role: 'admin' | 'member';
    position?: string;
    departmentId?: string;
  }) =>
    api.put<{ success: boolean; message: string; data: EnterpriseMember }>(`/my-enterprise/set-admin/${memberId}`, data),

  // 分配部门
  assignDepartment: (memberId: string, departmentId: string) =>
    api.put<{ success: boolean; message: string; data: EnterpriseMember }>(`/my-enterprise/assign-department/${memberId}`, { departmentId }),

  // ==================== 企业用户管理 ====================
  
  // 获取企业用户统计
  getEnterpriseUserStats: (enterpriseId: string) =>
    api.get<{ success: boolean; stats: { totalUsers: number; activeUsers: number; newUsersThisMonth: number } }>(`/enterprises/${enterpriseId}/user-stats`),
  
  // 获取企业部门统计
  getEnterpriseDepartmentStats: (enterpriseId: string) =>
    api.get<{ success: boolean; stats: { totalDepartments: number; activeDepartments: number } }>(`/enterprises/${enterpriseId}/department-stats`),
  
  // 获取企业活动统计
  getEnterpriseActivityStats: (enterpriseId: string) =>
    api.get<{ success: boolean; stats: { totalMessages: number; recentActivity: number } }>(`/enterprises/${enterpriseId}/activity-stats`),
};

// 为了向后兼容，保留原有的导出
export const enterpriseAPI = {
  getAllEnterprises: enterpriseService.getAllEnterprises,
  getEnterprise: enterpriseService.getEnterprise,
  createEnterprise: enterpriseService.createEnterprise,
  updateEnterprise: enterpriseService.updateEnterprise,
  uploadEnterpriseAvatar: enterpriseService.uploadEnterpriseAvatar,
  deleteEnterprise: enterpriseService.deleteEnterprise,
};

export const myEnterpriseAPI = {
  getEnterpriseInfo: enterpriseService.getMyEnterpriseInfo,
  getEnterpriseMembers: enterpriseService.getEnterpriseMembers,
  getEnterpriseDepartments: enterpriseService.getEnterpriseDepartments,
  createDepartment: enterpriseService.createDepartment,
  updateDepartment: enterpriseService.updateDepartment,
  deleteDepartment: enterpriseService.deleteDepartment,
  sendMessage: enterpriseService.sendMessage,
  getMessages: enterpriseService.getMessages,
};

export default enterpriseService;
