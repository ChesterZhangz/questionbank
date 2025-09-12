import React, { useState, useEffect} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2,
  Users,
  MessageSquare,
  Settings,
  Plus,
  Search,
  Edit3,
  Trash2,
  Send,
  AtSign,
  X,
  Crown,
  Shield,
  User,
} from 'lucide-react';
import { enterpriseService } from '../../services/enterpriseService';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { useModal } from '../../hooks/useModal';
import ConfirmModal from '../../components/ui/ConfirmModal';
import RightSlideModal from '../../components/ui/RightSlideModal';
import { FuzzySelect, MultiSelect } from '../../components/ui/menu';

import Avatar from '../../components/ui/Avatar';
import LoadingPage from '../../components/ui/LoadingPage';
import { useTranslation } from '../../hooks/useTranslation';


// 后端返回的企业信息接口
interface EnterpriseInfoResponse {
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

// 后端返回的成员数据类型
interface EnterpriseMemberData {
  _id: string; // 用户ID
  enterpriseMemberId?: string; // EnterpriseMember的ID（可选，用于向后兼容）
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

// 后端返回的部门数据类型
interface DepartmentData {
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

// 后端返回的消息数据类型
interface MessageData {
  _id: string;
  enterprise: string;
  sender: {
    _id: string;
    name: string;
    avatar?: string;
  };
  content: string;
  type: string;
  recipients: Array<{
    _id: string;
    name: string;
    avatar?: string;
  }>;
  mentionedUsers: Array<{
    _id: string;
    name: string;
  }>;
  mentionedDepartments: Array<{
    _id: string;
    name: string;
  }>;
  isPinned: boolean;
  isRead: Array<{
    _id: string;
    name: string;
    avatar?: string;
  }>;
  attachments?: string[];
  // 回复相关字段
  replyTo?: string;
  replyChain?: string[];
  replies?: MessageData[]; // 回复列表
  createdAt: string;
  updatedAt: string;
}

const MyEnterprisePage: React.FC = () => {
  // const { user } = useAuthStore();
  const { t } = useTranslation();
  
  // 弹窗状态管理
  const { 
    confirmModal,
    showConfirm,
    setConfirmLoading,
    showSuccess,
    closeConfirm,
    rightSlideModal,
    showSuccessRightSlide,
    showErrorRightSlide,
    closeRightSlide
  } = useModal();

  // 页面状态 - 使用后端返回的实际数据类型
  const [activeTab, setActiveTab] = useState<'overview' | 'members' | 'departments' | 'messages'>('overview');
  const [enterpriseInfo, setEnterpriseInfo] = useState<EnterpriseInfoResponse | null>(null);
  const [members, setMembers] = useState<EnterpriseMemberData[]>([]);
  const [departments, setDepartments] = useState<DepartmentData[]>([]);
  const [messages, setMessages] = useState<MessageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 搜索和筛选状态
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');

  // 分页状态
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // 模态框状态
  const [showCreateDepartmentModal, setShowCreateDepartmentModal] = useState(false);
  const [showSendMessageModal, setShowSendMessageModal] = useState(false);
  const [showEditMemberModal, setShowEditMemberModal] = useState(false);
  const [showEditDepartmentModal, setShowEditDepartmentModal] = useState(false);

  // 表单状态
  const [createDepartmentForm, setCreateDepartmentForm] = useState({
    name: '',
    code: '',
    description: ''
  });

  const [editDepartmentForm, setEditDepartmentForm] = useState({
    _id: '',
    name: '',
    code: '',
    description: ''
  });

  const [sendMessageForm, setSendMessageForm] = useState({
    content: '',
    type: 'general' as 'general' | 'announcement' | 'department' | 'reply',
    recipients: [] as string[],
    departmentId: '' as string | undefined,
    mentionedUsers: [] as string[],
    mentionedDepartments: [] as string[],
    replyTo: undefined as string | undefined
  });

  const [editMemberForm, setEditMemberForm] = useState({
    _id: '',
    name: '',
    role: 'member' as 'member' | 'admin',
    position: '',
    departmentId: '' as string | null
  });

  // 回复消息状态
  const [replyForm, setReplyForm] = useState({
    content: '',
    replyTo: ''
  });
  const [replyingToMessage, setReplyingToMessage] = useState<string | null>(null); // 正在回复的消息ID
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set()); // 展开的回复集合
  const [currentUserId, setCurrentUserId] = useState<string>(''); // 当前用户ID

  // 超级管理员转让状态
  const [showTransferSuperAdminModal, setShowTransferSuperAdminModal] = useState(false);
  const [transferSuperAdminForm, setTransferSuperAdminForm] = useState({
    newSuperAdminId: ''
  });

  // 发送消息状态
  const [sendingMessage, setSendingMessage] = useState(false);
  


  // 初始化数据
  useEffect(() => {
    const initializeData = async () => {
      try {
        setLoading(true);
        await fetchEnterpriseInfo();
      } catch (error) {
        // 错误日志已清理
      } finally {
        setLoading(false);
      }
    };
    
    initializeData();
  }, []);

  // 获取企业信息
  const fetchEnterpriseInfo = async () => {
    try {
      const response = await enterpriseService.getMyEnterpriseInfo();
      if (response.data.success) {
        setEnterpriseInfo(response.data);
        // 从企业信息中获取当前用户ID
        if (response.data.currentUser) {
          setCurrentUserId(response.data.currentUser._id);
        }
        
        // 优化：并行加载数据，提高加载速度
        const [membersResult, departmentsResult, messagesResult] = await Promise.allSettled([
          fetchMembers(),
          fetchDepartments(),
          fetchMessages()
        ]);
        
        // 处理加载结果
        if (membersResult.status === 'rejected') {
          // 错误日志已清理
        }
        if (departmentsResult.status === 'rejected') {
          // 错误日志已清理
        }
        if (messagesResult.status === 'rejected') {
          // 错误日志已清理
        }
      } else {
        setError(t('myEnterprise.errors.fetchEnterpriseFailed'));
      }
    } catch (error: any) {
      // 错误日志已清理
      setError(error.response?.data?.error || t('myEnterprise.errors.fetchEnterpriseFailed'));
    }
  };

  // 获取成员列表
  const fetchMembers = async (page: number = 1, forceRefresh: boolean = false) => {
    try {
      // 缓存机制：如果不是强制刷新且已有数据，则跳过请求
      if (!forceRefresh && members.length > 0 && page === 1) {
        return;
      }

      const params: any = { page, limit: 20 };
      if (searchTerm) params.search = searchTerm;
      if (selectedDepartment) params.department = selectedDepartment;

      const response = await enterpriseService.getEnterpriseMembers(params);
      if (response.data.success) {
        setMembers(response.data.data?.members || []);
        setTotalPages(response.data.data?.pagination?.totalPages || 1);
        setCurrentPage(page);
      } else {
        setMembers([]);
        setTotalPages(1);
      }
    } catch (error: any) {
      // 错误日志已清理
      setMembers([]);
      setTotalPages(1);
    }
  };

  // 获取部门列表
  const fetchDepartments = async (forceRefresh: boolean = false) => {
    try {
      // 缓存机制：如果不是强制刷新且已有数据，则跳过请求
      if (!forceRefresh && departments.length > 0) {
        return;
      }

      const response = await enterpriseService.getEnterpriseDepartments();
      if (response.data.success) {
        setDepartments(response.data.data || []);
      } else {
        setDepartments([]);
      }
    } catch (error: any) {
      // 错误日志已清理
      setDepartments([]);
    }
  };

  // 获取消息列表
  const fetchMessages = async (forceRefresh: boolean = false) => {
    try {
      // 缓存机制：如果不是强制刷新且已有数据，则跳过请求
      if (!forceRefresh && messages.length > 0) {
        return;
      }

      const response = await enterpriseService.getMessages({ page: 1, limit: 20 });
      if (response.data.success) {
        // 转换后端数据为前端期望的格式
        const convertedMessages = (response.data.data?.messages || []).map((msg: any) => ({
          ...msg,
          recipients: msg.recipients || [], // 确保recipients存在
          mentionedUsers: msg.mentionedUsers || [],
          mentionedDepartments: msg.mentionedDepartments || [],
          isRead: msg.isRead || [],
          replies: msg.replies || []
        }));
        setMessages(convertedMessages);
      } else {
        setMessages([]);
      }
    } catch (error: any) {
      // 错误日志已清理
      setMessages([]);
    }
  };

  // 处理搜索
  const handleSearch = () => {
    fetchMembers(1, true);
  };

  // 处理部门筛选
  const handleDepartmentFilter = (departmentId: string) => {
    setSelectedDepartment(departmentId);
    fetchMembers(1, true);
  };

  // 创建部门
  const handleCreateDepartment = async () => {
    try {
      // 设置创建中状态
      setConfirmLoading(true, t('myEnterprise.departmentManagement.create') + '...');
      const response = await enterpriseService.createDepartment(createDepartmentForm);
      if (response.data.success) {
        setShowCreateDepartmentModal(false);
        setCreateDepartmentForm({ name: '', code: '', description: '' });
        fetchDepartments(true);
        showSuccessRightSlide(t('myEnterprise.departmentManagement.createSuccess'), t('myEnterprise.departmentManagement.createSuccessMessage'));
      }
    } catch (error: any) {
      // 错误日志已清理
      showErrorRightSlide(t('myEnterprise.departmentManagement.createFailed'), error.response?.data?.error || t('myEnterprise.departmentManagement.createFailed'));
    } finally {
      setConfirmLoading(false);
    }
  };

  // 编辑部门
  const handleEditDepartment = async () => {
    try {
      // 设置保存中状态
      setConfirmLoading(true, t('myEnterprise.actions.save') + '...');
      const response = await enterpriseService.updateDepartment(editDepartmentForm._id, {
        name: editDepartmentForm.name,
        description: editDepartmentForm.description
      });
      if (response.data.success) {
        setShowEditDepartmentModal(false);
        fetchDepartments(true);
        showSuccessRightSlide(t('myEnterprise.departmentManagement.updateSuccess'), t('myEnterprise.departmentManagement.updateSuccessMessage'));
      }
    } catch (error: any) {
      // 错误日志已清理
      showErrorRightSlide(t('myEnterprise.departmentManagement.updateFailed'), error.response?.data?.error || t('myEnterprise.departmentManagement.updateFailed'));
    } finally {
      setConfirmLoading(false);
    }
  };

  // 删除部门
  const handleDeleteDepartment = async (departmentId: string) => {
    // 使用 ConfirmModal 替代 window.confirm
    showConfirm(
      t('myEnterprise.departmentManagement.confirmDelete'),
      t('myEnterprise.departmentManagement.deleteConfirmMessage'),
      async () => {
        try {
          setConfirmLoading(true, t('myEnterprise.actions.delete') + '...');
          const response = await enterpriseService.deleteDepartment(departmentId);
          if (response.data.success) {
            showSuccessRightSlide(t('myEnterprise.departmentManagement.deleteSuccess'), t('myEnterprise.departmentManagement.deleteSuccessMessage'));
            // 刷新部门列表
            fetchDepartments(true);
            // 删除成功后自动关闭确认弹窗
            closeConfirm();
          }
        } catch (error: any) {
          // 错误日志已清理
          showErrorRightSlide(t('myEnterprise.departmentManagement.deleteFailed'), error.response?.data?.error || t('myEnterprise.departmentManagement.deleteFailed'));
        } finally {
          setConfirmLoading(false);
        }
      },
      {
        type: 'danger',
        confirmText: t('myEnterprise.actions.delete'),
        cancelText: t('myEnterprise.actions.cancel'),
        confirmDanger: true
      }
    );
  };

  // 发送消息
  const handleSendMessage = async () => {
    try {
      // 验证表单
      if (!sendMessageForm.content.trim()) {
        showErrorRightSlide(t('myEnterprise.messageSystem.inputError'), t('myEnterprise.messageSystem.contentRequired'));
        return;
      }

      if (sendMessageForm.type === 'department' && !sendMessageForm.departmentId) {
        showErrorRightSlide(t('myEnterprise.messageSystem.inputError'), t('myEnterprise.messageSystem.departmentRequired'));
        return;
      }

      if (sendMessageForm.type === 'general' && sendMessageForm.recipients.length === 0) {
        showErrorRightSlide(t('myEnterprise.messageSystem.inputError'), t('myEnterprise.messageSystem.recipientRequired'));
        return;
      }

      // 检查是否给自己发消息
      if (sendMessageForm.type === 'general' && sendMessageForm.recipients.includes(currentUserId)) {
        showErrorRightSlide(t('myEnterprise.messageSystem.inputError'), t('myEnterprise.messageSystem.cannotSendToSelf'));
        return;
      }

      setSendingMessage(true);
      
      // 乐观更新：立即添加消息到UI
      const optimisticMessage: MessageData = {
        _id: `temp_${Date.now()}`,
        enterprise: enterpriseInfo?.enterprise?._id || '',
        content: sendMessageForm.content,
        type: sendMessageForm.type,
        sender: {
          _id: currentUserId,
          name: enterpriseInfo?.currentUser?.name || t('myEnterprise.enterpriseInfo.name'),
          avatar: enterpriseInfo?.currentUser?.avatar
        },
        recipients: sendMessageForm.recipients.map(id => ({ _id: id, name: '', avatar: undefined })),
        mentionedUsers: sendMessageForm.mentionedUsers.map(id => ({ _id: id, name: '' })),
        mentionedDepartments: sendMessageForm.mentionedDepartments.map(id => ({ _id: id, name: '' })),
        isPinned: false,
        isRead: [{ _id: currentUserId, name: '', avatar: undefined }],
        attachments: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        replies: []
      };
      
      setMessages(prev => [optimisticMessage, ...prev]);
      setShowSendMessageModal(false);
      setSendMessageForm({
        content: '',
        type: 'general',
        recipients: [],
        departmentId: undefined,
        mentionedUsers: [],
        mentionedDepartments: [],
        replyTo: undefined
      });
      
      // 异步发送消息
      enterpriseService.sendMessage(sendMessageForm).then((response) => {
        if (response.data.success) {
          showSuccessRightSlide(t('myEnterprise.messageSystem.sendSuccess'), t('myEnterprise.messageSystem.sendSuccessMessage'));
          // 更新乐观更新的消息为真实消息
          setMessages(prev => prev.map(m => 
            m._id === optimisticMessage._id 
              ? { ...m, _id: response.data.data?._id || m._id }
              : m
          ));
        } else {
          showErrorRightSlide(t('myEnterprise.messageSystem.sendFailed'), response.data.message || t('myEnterprise.messageSystem.sendFailed'));
          // 移除乐观更新的消息
          setMessages(prev => prev.filter(m => m._id !== optimisticMessage._id));
        }
      }).catch((error) => {
        // 错误日志已清理
        showErrorRightSlide(t('myEnterprise.messageSystem.sendFailed'), error.response?.data?.error || t('myEnterprise.messageSystem.sendFailed'));
        // 移除乐观更新的消息
        setMessages(prev => prev.filter(m => m._id !== optimisticMessage._id));
      }).finally(() => {
        setSendingMessage(false);
      });
    } catch (error: any) {
      // 错误日志已清理
      showErrorRightSlide(t('myEnterprise.messageSystem.sendFailed'), error.response?.data?.error || t('myEnterprise.messageSystem.sendFailed'));
      setSendingMessage(false);
    }
  };

  // 编辑成员职位
  const handleEditMember = async () => {
    try {
      // 找到要编辑的成员（使用用户ID查找）
      const memberToEdit = members.find(m => m.enterpriseMemberId === editMemberForm._id);
      
      if (!memberToEdit) {
        showErrorRightSlide(t('myEnterprise.enterpriseInfo.error'), t('myEnterprise.memberManagement.memberNotFound'));
        return;
      }

      // 设置加载状态
      setConfirmLoading(true, t('myEnterprise.actions.update') + '...');
      
      // 发送API请求
      const response = await enterpriseService.setAdminRole(editMemberForm._id, {
        role: editMemberForm.role,
        position: editMemberForm.position,
        departmentId: editMemberForm.departmentId || undefined
      });
      
      if (response.data.success) {
        setShowEditMemberModal(false);
        showSuccessRightSlide(t('myEnterprise.memberManagement.updateSuccess'), t('myEnterprise.memberManagement.updateSuccessMessage'));
        
        // 刷新数据
        fetchMembers();
      }
      
    } catch (error: any) {
      showErrorRightSlide(t('myEnterprise.memberManagement.updateFailed'), error.response?.data?.error || t('myEnterprise.memberManagement.updateFailed'));
    } finally {
      setConfirmLoading(false);
    }
  };

  // 回复消息
  const handleReplyMessage = async () => {
    try {
      if (!replyForm.content.trim()) {
        showErrorRightSlide(t('myEnterprise.messageSystem.inputError'), t('myEnterprise.messageSystem.replyContentRequired'));
        return;
      }

      const messageData = {
        content: replyForm.content,
        type: 'reply' as const,
        recipients: [], // 回复消息的接收者由后端自动确定
        replyTo: replyForm.replyTo
      };

      // 设置发送中状态
      setConfirmLoading(true, t('myEnterprise.messageSystem.send') + '...');
      const response = await enterpriseService.sendMessage(messageData);
      if (response.data.success) {
        setReplyingToMessage(null); // 关闭回复输入框
        setReplyForm({
          content: '',
          replyTo: ''
        });
        fetchMessages();
        showSuccessRightSlide(t('myEnterprise.messageSystem.sendSuccess'), t('myEnterprise.messageSystem.replySuccessMessage'));
      }
    } catch (error: any) {
      // 错误日志已清理
      showErrorRightSlide(t('myEnterprise.messageSystem.replyFailed'), error.response?.data?.error || error.message);
    } finally {
      setConfirmLoading(false);
    }
  };

  // 转让超级管理员身份
  const handleTransferSuperAdmin = async () => {
    try {
      // 设置处理中状态
      setConfirmLoading(true, t('myEnterprise.actions.transfer') + '...');
      const response = await enterpriseService.transferSuperAdmin(transferSuperAdminForm.newSuperAdminId);
      
      if (response.data.success) {
        setShowTransferSuperAdminModal(false);
        setTransferSuperAdminForm({ newSuperAdminId: '' });
        
        // 显示成功消息
        showSuccess(
          t('myEnterprise.actions.transferSuccess'),
          t('myEnterprise.actions.transferSuccessMessage'),
          {
            onConfirm: () => {
              // 转让成功后重定向到登录页面，因为当前用户身份已改变
              window.location.href = '/login';
            }
          }
        );
      }
    } catch (error: any) {
      // 错误日志已清理
      // 错误日志已清理
      
      // 显示详细的错误信息
      let errorMessage = t('myEnterprise.actions.transferFailed');
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      showErrorRightSlide(t('myEnterprise.actions.transferFailed'), errorMessage);
    } finally {
      setConfirmLoading(false);
    }
  };

  // 打开回复输入框
  const openReplyInput = (messageId: string) => {
    setReplyForm({
      content: '',
      replyTo: messageId
    });
    setReplyingToMessage(messageId);
  };

  // 取消回复
  const cancelReply = () => {
    setReplyingToMessage(null);
    setReplyForm({
      content: '',
      replyTo: ''
    });
  };

  // 删除消息状态
  const [showDeleteMessageModal, setShowDeleteMessageModal] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState<string | null>(null);
  const [deletingMessage, setDeletingMessage] = useState(false);

  // 打开删除消息确认弹窗
  const openDeleteMessageModal = (messageId: string) => {
    setMessageToDelete(messageId);
    setShowDeleteMessageModal(true);
  };

  // 确认删除消息
  const confirmDeleteMessage = async () => {
    if (!messageToDelete) return;
    
    try {
      setDeletingMessage(true);
      
      // 异步删除消息
      const response = await enterpriseService.deleteMessage(messageToDelete);
      if (response.data.success) {
        // 删除成功后，立即从UI中移除消息
        setMessages(prevMessages => {
          const newMessages = prevMessages.filter(msg => {
            // 如果是主消息，移除整个消息及其回复
            if (msg._id === messageToDelete) {
              return false;
            }
            // 如果是回复消息，从回复列表中移除
            return {
              ...msg,
              replies: msg.replies?.filter(reply => reply._id !== messageToDelete) || []
            };
          });
          return newMessages;
        });
        
        showSuccessRightSlide(t('myEnterprise.messageSystem.deleteSuccess'), t('myEnterprise.messageSystem.deleteSuccessMessage'));
        // 强制刷新消息列表，确保数据同步
        fetchMessages(true);
      } else {
        showErrorRightSlide(t('myEnterprise.messageSystem.deleteFailed'), response.data.message || t('myEnterprise.messageSystem.deleteFailed'));
      }
    } catch (error: any) {
      // 错误日志已清理
      const errorMessage = error.response?.data?.error || t('myEnterprise.messageSystem.deleteFailed');
      showErrorRightSlide(t('myEnterprise.messageSystem.deleteFailed'), errorMessage);
    } finally {
      setDeletingMessage(false);
      setShowDeleteMessageModal(false);
      setMessageToDelete(null);
    }
  };

  // 切换回复展开状态
  const toggleReplies = (messageId: string) => {
    const newExpanded = new Set(expandedReplies);
    if (newExpanded.has(messageId)) {
      newExpanded.delete(messageId);
    } else {
      newExpanded.add(messageId);
    }
    setExpandedReplies(newExpanded);
  };

  // 打开编辑成员模态框
  const openEditMemberModal = (member: EnterpriseMemberData) => {
    // 超级管理员不能被编辑
    if (member.role === 'superAdmin') {
      showErrorRightSlide(t('myEnterprise.errors.insufficientPermissions'), t('myEnterprise.errors.superAdminCannotEdit'));
      return;
    }
    
            // 权限检查：管理员可以编辑其他管理员的职位和部门，但不能修改角色
        // 角色修改权限在模态框中通过UI控制
    
    // 角色设置逻辑：
    // - 超级管理员：可以设置任何角色
    // - 管理员：可以将普通成员提升为管理员，但不能降级其他管理员
    let editableRole = member.role;
    if (userRole?.isSuperAdmin) {
      // 超级管理员可以设置任何角色
      editableRole = member.role;
    } else if (userRole?.isAdmin && member.role === 'member') {
      // 管理员可以将普通成员提升为管理员
      editableRole = member.role;
    }
    
    setEditMemberForm({
      _id: member.enterpriseMemberId || member._id, // 优先使用enterpriseMemberId，这是EnterpriseMember的ID
      name: member.name,
      role: editableRole as 'member' | 'admin',
      position: member.position || '',
      departmentId: member.departmentId || null
    });
    
    setShowEditMemberModal(true);
  };

  // 打开编辑部门模态框
  const openEditDepartmentModal = (dept: DepartmentData) => {
    setEditDepartmentForm({
      _id: dept._id,
      name: dept.name,
      code: dept.code,
      description: dept.description || ''
    });
    setShowEditDepartmentModal(true);
  };



  // 获取角色图标
  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'superAdmin':
        return <Crown className="w-4 h-4 text-yellow-600" />;
      case 'admin':
        return <Shield className="w-4 h-4 text-blue-600" />;
      default:
        return <User className="w-4 h-4 text-gray-600" />;
    }
  };

  // 获取消息类型名称
  const getMessageTypeName = (type: string) => {
    switch (type) {
      case 'general':
        return t('myEnterprise.messageTypes.general');
      case 'announcement':
        return t('myEnterprise.messageTypes.announcement');
      case 'department':
        return t('myEnterprise.messageTypes.department');
      case 'group':
        return t('myEnterprise.messageTypes.group');
      default:
        return t('myEnterprise.messageTypes.unknown');
    }
  };

  // 计算部门成员数量
  const getDepartmentMemberCount = (departmentId: string) => {
    const count = members?.filter(member => {
      const memberDeptId = member.departmentId?.toString();
      const deptId = departmentId?.toString();
      return memberDeptId === deptId;
    }).length || 0;
    
    return count;
  };

  // 标记消息为已读
  const markMessageAsRead = async (messageId: string) => {
    try {
      // 检查当前用户是否是消息的接收者
      const message = messages.find(msg => msg._id === messageId);
      if (!message || message.sender?._id === currentUserId) {
        return; // 发送者不能标记为已读
      }

      await enterpriseService.markMessageAsRead(messageId);
      // 更新本地消息状态
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg._id === messageId 
            ? { 
                ...msg, 
                isRead: [
                  ...(msg.isRead || []), 
                  {
                    _id: currentUserId,
                    name: enterpriseInfo?.currentUser?.name || t('myEnterprise.enterpriseInfo.currentUser'),
                    avatar: enterpriseInfo?.currentUser?.avatar
                  }
                ]
              }
            : msg
        )
      );
    } catch (error) {
      // 错误日志已清理
    }
  };

  // 处理消息点击
  const handleMessageClick = (messageId: string, isRead: boolean) => {
    // 只有接收者点击消息时才标记为已读，发送者点击不标记
    const message = messages.find(msg => msg._id === messageId);
    if (message && message.sender?._id !== currentUserId && !isRead) {
      markMessageAsRead(messageId);
    }
  };

  if (loading) {
    return (
      <LoadingPage
        type="loading"
        animation="shimmer"
        title={t('myEnterprise.loading.title')}
        description={t('myEnterprise.loading.description')}
        fullScreen={true}
      />
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-blue-900/20 dark:to-indigo-900/20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">{t('myEnterprise.errors.loadFailed')}</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <Button onClick={fetchEnterpriseInfo}>{t('myEnterprise.actions.retry')}</Button>
        </div>
      </div>
    );
  }

  if (!enterpriseInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-blue-900/20 dark:to-indigo-900/20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-8 h-8 text-gray-600 dark:text-gray-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">{t('myEnterprise.errors.notJoined')}</h2>
          <p className="text-gray-600 dark:text-gray-400">{t('myEnterprise.errors.notJoinedMessage')}</p>
        </div>
      </div>
    );
  }

  const { enterprise, userRole } = enterpriseInfo;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-blue-900/20 dark:to-indigo-900/20 p-6">
      <div className="max-w-7xl mx-auto">
        {/* 页面头部 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{enterprise?.name || t('myEnterprise.enterpriseInfo.enterprise')}</h1>
              <p className="text-gray-600 dark:text-gray-400">{t('myEnterprise.enterpriseInfo.managementCenter')}</p>
            </div>
          </div>

          {/* 企业信息卡片 */}
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl">
            <div className="p-6">
              <div className="flex items-start gap-6">
                <Avatar
                  src={enterprise?.avatar}
                  name={enterprise?.name}
                  size="2xl"
                  shape="rounded"
                />
                <div className="flex-1">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">{t('myEnterprise.overview.basicInfo')}</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500 dark:text-gray-400">{t('myEnterprise.overview.emailSuffix')}:</span>
                          <span className="font-medium">{enterprise?.emailSuffix || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500 dark:text-gray-400">{t('myEnterprise.overview.creditCode')}:</span>
                          <span className="font-medium">{enterprise?.creditCode || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500 dark:text-gray-400">{t('myEnterprise.overview.memberCount')}:</span>
                          <span className="font-medium">{enterprise?.currentMembers || 0}/{enterprise?.maxMembers || 0}</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">{t('myEnterprise.overview.detailedInfo')}</h3>
                      <div className="space-y-2 text-sm">
                        {enterprise?.description && (
                          <div className="flex items-center gap-2">
                            <span className="text-gray-500 dark:text-gray-400">{t('myEnterprise.overview.description')}:</span>
                            <span className="font-medium">{enterprise.description}</span>
                          </div>
                        )}
                        {enterprise?.address && (
                          <div className="flex items-center gap-2">
                            <span className="text-gray-500 dark:text-gray-400">{t('myEnterprise.overview.address')}:</span>
                            <span className="font-medium">{enterprise.address}</span>
                          </div>
                        )}
                        {enterprise?.industry && (
                          <div className="flex items-center gap-2">
                            <span className="text-gray-500 dark:text-gray-400">{t('myEnterprise.overview.industry')}:</span>
                            <span className="font-medium">{enterprise.industry}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* 导航标签 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <div className="flex space-x-1 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-1 shadow-lg">
            {[
              { id: 'overview', label: t('myEnterprise.tabs.overview'), icon: Building2 },
              { id: 'members', label: t('myEnterprise.tabs.members'), icon: Users },
              { id: 'departments', label: t('myEnterprise.tabs.departments'), icon: Settings },
              { id: 'messages', label: t('myEnterprise.tabs.messages'), icon: MessageSquare }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* 内容区域 */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* 统计卡片 */}
                <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl">
                  <div className="p-6 text-center">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                      {enterprise?.currentMembers || 0}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">{t('myEnterprise.overview.enterpriseMembers')}</p>
                  </div>
                </Card>

                <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl">
                  <div className="p-6 text-center">
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <Settings className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                      {departments?.length || 0}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">{t('myEnterprise.overview.departmentCount')}</p>
                  </div>
                </Card>

                <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl">
                  <div className="p-6 text-center">
                    <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <MessageSquare className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                      {messages?.length || 0}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">{t('myEnterprise.overview.messageCount')}</p>
                  </div>
                </Card>
              </div>
            )}

            {activeTab === 'members' && (
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl">
                <div className="p-6">
                  {/* 搜索和筛选 */}
                  <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="flex-1">
                      <Input
                        placeholder={t('myEnterprise.memberManagement.searchPlaceholder')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                        icon={<Search className="w-4 h-4" />}
                      />
                    </div>
                    <div className="flex gap-2">
                      <select
                        value={selectedDepartment}
                        onChange={(e) => handleDepartmentFilter(e.target.value)}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      >
                        <option value="">{t('myEnterprise.memberManagement.allDepartments')}</option>
                        {departments?.map(dept => (
                          <option key={dept._id} value={dept._id}>{dept.name}</option>
                        )) || []}
                      </select>
                      <Button onClick={handleSearch}>{t('myEnterprise.actions.search')}</Button>
                    </div>
                  </div>

                  {/* 成员列表 */}
                  <div className="space-y-4">
                    {members?.map((member) => {
                      // 查找部门名称
                      const department = departments?.find(dept => {
                        const deptId = dept._id?.toString();
                        const memberDeptId = member.departmentId?.toString();
                        return deptId === memberDeptId;
                      });
                      
                      return (
                        <div key={member._id} className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <Avatar
                          src={member.avatar}
                          name={member.name}
                          size="lg"
                          shape="circle"
                        />
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 dark:text-gray-100">{member.name || t('myEnterprise.enterpriseInfo.unknownUser')}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{member.email || 'N/A'}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full flex items-center gap-1">
                              {getRoleIcon(member.role)}
                              {member.role === 'superAdmin' ? t('myEnterprise.roles.superAdmin') : member.role === 'admin' ? t('myEnterprise.roles.admin') : t('myEnterprise.roles.member')}
                            </span>
                            {member.position && (
                              <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full">
                                {member.position}
                              </span>
                            )}
                            {member.departmentId && (
                              <span className="text-xs px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full">
                                {department?.name || t('myEnterprise.departmentManagement.unknownDepartment')}
                              </span>
                            )}
                            {member.enterpriseName && (
                              <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full">
                                {member.enterpriseName}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right text-sm text-gray-500 dark:text-gray-400">
                            <div>{t('myEnterprise.memberManagement.lastLogin')}</div>
                            <div>{member.lastLogin ? new Date(member.lastLogin).toLocaleDateString() : t('myEnterprise.memberManagement.neverLoggedIn')}</div>
                          </div>
                          <div className="flex gap-2">
                            {/* 超级管理员转让按钮 */}
                            {userRole?.isSuperAdmin && member.role !== 'superAdmin' && (
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="text-yellow-600 hover:text-yellow-700"
                                onClick={() => {
                                  if (member.enterpriseMemberId) {
          setTransferSuperAdminForm({ newSuperAdminId: member.enterpriseMemberId });
          setShowTransferSuperAdminModal(true);
        } else {
          showErrorRightSlide(t('myEnterprise.errors.fetchFailed'), t('myEnterprise.errors.memberInfoNotFound'));
        }
                                }}
                                title={t('myEnterprise.actions.transferSuperAdmin')}
                              >
                                <Crown className="w-4 h-4" />
                              </Button>
                            )}
                            
                            {/* 编辑成员按钮 */}
                            {(userRole?.isSuperAdmin || userRole?.isAdmin) && member.role !== 'superAdmin' && (
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => openEditMemberModal(member)}
                              >
                                <Edit3 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                    })}
                  </div>

                  {/* 分页 */}
                  {totalPages > 1 && (
                    <div className="flex justify-center mt-6">
                      <div className="flex space-x-2">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                          <button
                            key={page}
                            onClick={() => fetchMembers(page)}
                            className={`px-3 py-2 rounded-lg transition-colors ${
                              currentPage === page
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                            }`}
                          >
                            {page}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {activeTab === 'departments' && (
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{t('myEnterprise.departmentManagement.title')}</h3>
                    {(userRole?.isSuperAdmin || userRole?.isAdmin) && (
                      <Button 
                        className="bg-blue-600 hover:bg-blue-700"
                        onClick={() => setShowCreateDepartmentModal(true)}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        {t('myEnterprise.departmentManagement.createDepartment')}
                      </Button>
                    )}
                  </div>

                  <div className="space-y-4">
                    {departments?.map((dept) => {
                      const memberCount = getDepartmentMemberCount(dept._id);
                      
                      return (
                        <div key={dept._id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-xl flex items-center justify-center">
                            <Settings className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900 dark:text-gray-100">{dept.name || t('myEnterprise.departmentManagement.unnamedDepartment')}</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{dept.code || 'N/A'}</p>
                            {dept.description && (
                              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{dept.description}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right text-sm text-gray-500 dark:text-gray-400">
                            <div>{t('myEnterprise.departmentManagement.memberCount')}</div>
                            <div className="font-semibold">{memberCount}</div>
                          </div>
                          {(userRole?.isSuperAdmin || userRole?.isAdmin) && (
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => openEditDepartmentModal(dept)}
                              >
                                <Edit3 className="w-4 h-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="text-red-600 hover:text-red-700"
                                onClick={() => handleDeleteDepartment(dept._id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                    })}
                  </div>
                </div>
              </Card>
            )}

            {activeTab === 'messages' && (
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{t('myEnterprise.messageSystem.title')}</h3>
                    <motion.div
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      initial={{ opacity: 0, scale: 0.8, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{ 
                        duration: 0.6, 
                        ease: [0.25, 0.46, 0.45, 0.94],
                        delay: 0.3
                      }}
                    >
                      <Button 
                        className="bg-blue-600 hover:bg-blue-700 transition-all duration-200 relative overflow-hidden group"
                        onClick={() => setShowSendMessageModal(true)}
                      >
                        {/* 背景光效 */}
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-blue-600/20"
                          initial={{ x: "-100%" }}
                          animate={{ x: "100%" }}
                          transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
                        />
                        
                        {/* 图标微动画 */}
                        <motion.div
                          animate={{ 
                            rotate: [0, 5, -5, 0],
                            scale: [1, 1.1, 1]
                          }}
                          transition={{ 
                            duration: 2, 
                            repeat: Infinity, 
                            repeatDelay: 3,
                            ease: "easeInOut"
                          }}
                          className="relative z-10"
                        >
                          <Send className="w-4 h-4 mr-2" />
                        </motion.div>
                        
                        {/* 文字 */}
                        <span className="relative z-10">{t('myEnterprise.messageSystem.sendMessage')}</span>
                      </Button>
                    </motion.div>
                  </div>

                  <div className="space-y-4">
                    {messages?.filter(msg => {
                      // 权限过滤：用户只能看到发送给自己的消息或自己发送的消息
                      const isRecipient = msg.recipients?.some(recipient => 
                        recipient._id === currentUserId
                      );
                      const isSender = msg.sender?._id === currentUserId;
                      const isAnnouncement = msg.type === 'announcement';
                      
                      // 公告消息所有企业成员都可以看到
                      if (isAnnouncement) return true;
                      
                      // 其他消息：接收者可以看到，发送者也可以看到（用于查看已读状态）
                      return isRecipient || isSender;
                    }).map((msg) => (
                      <motion.div 
                        key={msg._id} 
                        className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg cursor-pointer transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-700/70 hover:shadow-md"
                        whileHover={{ y: -2, scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="flex items-start gap-4">
                          <Avatar
                            src={msg.sender?.avatar}
                            name={msg.sender?.name}
                            size="md"
                            shape="circle"
                          />
                          <div className="flex-1" onClick={() => handleMessageClick(msg._id, msg.isRead?.some(r => r._id === currentUserId) || false)}>
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <h4 className="font-semibold text-gray-900 dark:text-gray-100">{msg.sender?.name || t('myEnterprise.enterpriseInfo.unknownUser')}</h4>
                                <motion.span 
                                  className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full"
                                  whileHover={{ scale: 1.1, rotate: 5 }}
                                  whileTap={{ scale: 0.95 }}
                                  initial={{ scale: 0.8, opacity: 0 }}
                                  animate={{ scale: 1, opacity: 1 }}
                                  transition={{ duration: 0.2 }}
                                >
                                  {getMessageTypeName(msg.type)}
                                </motion.span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {msg.createdAt ? new Date(msg.createdAt).toLocaleString() : t('myEnterprise.enterpriseInfo.unknownTime')}
                                </span>
                                {/* 已读状态显示 - 只有发送者能看到 */}
                                {msg.isRead && msg.isRead.length > 0 && msg.sender?._id === currentUserId && (
                                  <div className="flex items-center gap-2">
                                    <motion.span 
                                      className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full"
                                      whileHover={{ scale: 1.05 }}
                                      initial={{ scale: 0.9, opacity: 0 }}
                                      animate={{ scale: 1, opacity: 1 }}
                                      transition={{ duration: 0.3, delay: 0.1 }}
                                    >
                                      {t('myEnterprise.messageSystem.read')} ({msg.isRead.length})
                                    </motion.span>
                                    {/* 发送者可以看到具体已读的人 */}
                                    <div className="flex items-center gap-1">
                                      <span className="text-xs text-gray-500 dark:text-gray-400">{t('myEnterprise.messageSystem.readBy')}:</span>
                                      {msg.isRead.map((reader, index) => (
                                        <span 
                                          key={reader._id || `reader-${index}`} 
                                          className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full"
                                        >
                                          {reader.name || t('myEnterprise.enterpriseInfo.unknownUser')}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                              {/* 删除按钮 - 只有发送者可以删除 */}
                              {msg.sender?._id === currentUserId && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => openDeleteMessageModal(msg._id)}
                                  className="text-red-600 hover:text-red-700"
                                  title={t('myEnterprise.actions.deleteMessage')}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                            <p className="text-gray-700 dark:text-gray-300">{msg.content || t('myEnterprise.messageSystem.noContent')}</p>
                            
                            {(msg.mentionedUsers?.length > 0 || msg.mentionedDepartments?.length > 0) && (
                              <div className="flex items-center gap-2 mt-2">
                                <AtSign className="w-4 h-4 text-gray-400" />
                                <div className="flex gap-2">
                                  {msg.mentionedUsers?.map((user, index) => (
                                    <motion.span 
                                      key={user._id} 
                                      className="text-xs px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded"
                                      whileHover={{ scale: 1.1, y: -2 }}
                                      initial={{ scale: 0.8, opacity: 0, y: 10 }}
                                      animate={{ scale: 1, opacity: 1, y: 0 }}
                                      transition={{ duration: 0.3, delay: index * 0.1 }}
                                    >
                                      @{user?.name || t('myEnterprise.enterpriseInfo.unknownUser')}
                                    </motion.span>
                                  )) || []}
                                  {msg.mentionedDepartments?.map((dept, index) => (
                                    <motion.span 
                                      key={dept._id} 
                                      className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded"
                                      whileHover={{ scale: 1.1, y: -2 }}
                                      initial={{ scale: 0.8, opacity: 0, y: 10 }}
                                      animate={{ scale: 1, opacity: 1, y: 0 }}
                                      transition={{ duration: 0.3, delay: index * 0.1 }}
                                    >
                                      @{dept.name || t('myEnterprise.departmentManagement.unknownDepartment')}
                                    </motion.span>
                                  )) || []}
                                </div>
                              </div>
                            )}
                            
                            {/* 回复统计和展开按钮 */}
                            {msg.replies && msg.replies.length > 0 && (
                              <div className="mt-3">
                                <motion.button
                                  onClick={() => toggleReplies(msg._id)}
                                  className="group flex items-center gap-2 px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95"
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                >
                                  <motion.div
                                    animate={{ rotate: expandedReplies.has(msg._id) ? 180 : 0 }}
                                    transition={{ duration: 0.3, ease: "easeInOut" }}
                                    className="w-4 h-4"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                  </motion.div>
                                  <span>{expandedReplies.has(msg._id) ? t('myEnterprise.messageSystem.collapseReplies') : t('myEnterprise.messageSystem.expandRepliesWithCount', { count: msg.replies.length })}</span>
                                  <motion.div
                                    animate={{ scale: [1, 1.2, 1] }}
                                    transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 2 }}
                                    className="w-2 h-2 bg-blue-400 rounded-full"
                                  />
                                </motion.button>
                              </div>
                            )}
                            
                            {/* 回复列表 */}
                            {msg.replies && msg.replies.length > 0 && expandedReplies.has(msg._id) && (
                              <div className="mt-3 space-y-2">
                                {msg.replies.map((reply) => (
                                  <div key={reply._id} className="ml-6 p-3 bg-white dark:bg-gray-600/50 rounded-lg border-l-4 border-blue-400">
                                    <div className="flex items-start gap-3">
                                      <Avatar
                                        src={reply.sender?.avatar}
                                        name={reply.sender?.name}
                                        size="sm"
                                        shape="circle"
                                      />
                                      <div className="flex-1">
                                        <div className="flex items-center justify-between mb-1">
                                          <div className="flex items-center gap-2">
                                            <h5 className="text-sm font-medium text-gray-900 dark:text-gray-100">{reply.sender?.name || t('myEnterprise.enterpriseInfo.unknownUser')}</h5>
                                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                              {reply.createdAt ? new Date(reply.createdAt).toLocaleString() : t('myEnterprise.enterpriseInfo.unknownTime')}
                                            </span>
                                          </div>
                                          {/* 删除回复按钮 - 只有发送者可以删除 */}
                                          {reply.sender?._id === currentUserId && (
                                            <Button
                                              size="sm"
                                              variant="outline"
                                              onClick={() => openDeleteMessageModal(reply._id)}
                                              className="text-red-600 hover:text-red-700"
                                              title={t('myEnterprise.actions.deleteReply')}
                                            >
                                              <Trash2 className="w-3 h-3" />
                                            </Button>
                                          )}
                                        </div>
                                        <p className="text-sm text-gray-700 dark:text-gray-300">{reply.content}</p>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                            
                            {/* 消息操作按钮 - 右侧透明设计 */}
                            <motion.div 
                              className="flex items-center justify-between mt-3"
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.3, delay: 0.2 }}
                            >
                              {/* 左侧占位，保持布局平衡 */}
                              <div className="flex-1"></div>
                              
                              {/* 右侧回复按钮 */}
                              <motion.div
                                whileHover={{ scale: 1.05, y: -2 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => openReplyInput(msg._id)}
                                  className="text-blue-600/80 hover:text-blue-700 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-all duration-200 backdrop-blur-sm"
                                >
                                  <MessageSquare className="w-4 h-4 mr-1" />
                                  {t('myEnterprise.messageSystem.reply')}
                                </Button>
                              </motion.div>
                            </motion.div>

                            {/* 内联回复输入框 */}
                            {replyingToMessage === msg._id && (
                              <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                                <div className="flex items-start gap-2">
                                  <div className="flex-1">
                                    <textarea
                                      value={replyForm.content}
                                      onChange={(e) => setReplyForm({ ...replyForm, content: e.target.value })}
                                      placeholder={t('myEnterprise.messageSystem.replyPlaceholder')}
                                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
                                      rows={2}
                                      autoFocus
                                    />
                                  </div>
                                  <div className="flex gap-2">
                                    <Button
                                      size="sm"
                                      onClick={handleReplyMessage}
                                      disabled={!replyForm.content.trim() || confirmModal.confirmLoading}
                                      className="bg-blue-600 hover:bg-blue-700 text-white"
                                    >
                                      {confirmModal.confirmLoading ? confirmModal.loadingText : t('myEnterprise.messageSystem.send')}
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={cancelReply}
                                      className="text-gray-600 hover:text-gray-700"
                                    >
                                      {t('myEnterprise.actions.cancel')}
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </Card>
            )}
          </motion.div>
        </AnimatePresence>

        {/* 模态框 */}
        
        {/* 创建部门模态框 */}
        {showCreateDepartmentModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('myEnterprise.departmentManagement.createDepartment')}</h3>
                <button
                  onClick={() => setShowCreateDepartmentModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('myEnterprise.departmentManagement.departmentName')}
                  </label>
                  <Input
                    value={createDepartmentForm.name}
                    onChange={(e) => setCreateDepartmentForm({ ...createDepartmentForm, name: e.target.value })}
                    placeholder={t('myEnterprise.departmentManagement.departmentNamePlaceholder')}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('myEnterprise.departmentManagement.departmentCode')}
                  </label>
                  <Input
                    value={createDepartmentForm.code}
                    onChange={(e) => setCreateDepartmentForm({ ...createDepartmentForm, code: e.target.value })}
                    placeholder={t('myEnterprise.departmentManagement.departmentCodePlaceholder')}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('myEnterprise.departmentManagement.departmentDescription')}
                  </label>
                  <textarea
                    value={createDepartmentForm.description}
                    onChange={(e) => setCreateDepartmentForm({ ...createDepartmentForm, description: e.target.value })}
                    placeholder={t('myEnterprise.departmentManagement.departmentDescriptionPlaceholder')}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    rows={3}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setShowCreateDepartmentModal(false)}
                >
                  {t('myEnterprise.actions.cancel')}
                </Button>
                <Button 
                  onClick={handleCreateDepartment}
                  disabled={confirmModal.confirmLoading}
                >
                  {confirmModal.confirmLoading ? confirmModal.loadingText : t('myEnterprise.actions.create')}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* 编辑部门模态框 */}
        {showEditDepartmentModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('myEnterprise.departmentManagement.editDepartment')}</h3>
                <button
                  onClick={() => setShowEditDepartmentModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('myEnterprise.departmentManagement.departmentName')}
                  </label>
                  <Input
                    value={editDepartmentForm.name}
                    onChange={(e) => setEditDepartmentForm({ ...editDepartmentForm, name: e.target.value })}
                    placeholder={t('myEnterprise.departmentManagement.departmentNamePlaceholder')}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('myEnterprise.departmentManagement.departmentCode')}
                  </label>
                  <Input
                    value={editDepartmentForm.code}
                    disabled
                    className="bg-gray-100 dark:bg-gray-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('myEnterprise.departmentManagement.departmentDescription')}
                  </label>
                  <textarea
                    value={editDepartmentForm.description}
                    onChange={(e) => setEditDepartmentForm({ ...editDepartmentForm, description: e.target.value })}
                    placeholder={t('myEnterprise.departmentManagement.departmentDescriptionPlaceholder')}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    rows={3}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setShowEditDepartmentModal(false)}
                >
                  {t('myEnterprise.actions.cancel')}
                </Button>
                <Button 
                  onClick={handleEditDepartment}
                  disabled={confirmModal.confirmLoading}
                >
                  {confirmModal.confirmLoading ? confirmModal.loadingText : t('myEnterprise.actions.save')}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* 发送消息模态框 */}
        {showSendMessageModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-lg">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('myEnterprise.messageSystem.sendMessage')}</h3>
                <button
                  onClick={() => setShowSendMessageModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
{t('myEnterprise.messageSystem.messageType')}
                  </label>
                  <FuzzySelect
                    options={[
                      { value: 'general', label: t('myEnterprise.messageTypes.general') },
                      { value: 'department', label: t('myEnterprise.messageTypes.department') },
                      ...(userRole?.isAdmin || userRole?.isSuperAdmin ? [{ value: 'announcement', label: t('myEnterprise.messageTypes.announcement') + '（' + t('myEnterprise.messageSystem.sendToAllMembers') + '）' }] : [])
                    ]}
                    value={sendMessageForm.type}
                    onChange={(value) => {
                      const newType = String(value) as any;
                      setSendMessageForm({ 
                        ...sendMessageForm, 
                        type: newType,
                        // 切换类型时清空相关字段
                        recipients: newType === 'general' ? sendMessageForm.recipients : [],
                        departmentId: newType === 'department' ? sendMessageForm.departmentId : undefined
                      });
                    }}
                    placeholder={t('myEnterprise.messageSystem.selectMessageType')}
                    className="w-full"
                  />
                </div>

                {/* 部门选择（仅部门消息显示） */}
                {sendMessageForm.type === 'department' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
{t('myEnterprise.messageSystem.selectDepartment')}
                    </label>
                    <FuzzySelect
                      options={departments?.map(dept => ({
                        value: dept._id,
                        label: dept.name
                      })) || []}
                      value={sendMessageForm.departmentId || ''}
                      onChange={(value) => setSendMessageForm({ ...sendMessageForm, departmentId: String(value) })}
                      placeholder={t('myEnterprise.messageSystem.selectDepartmentPlaceholder')}
                      className="w-full"
                    />
                  </div>
                )}

                {/* 用户选择（普通消息显示） */}
                {sendMessageForm.type === 'general' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
{t('myEnterprise.messageSystem.selectRecipient')}
                    </label>
                    
                    {/* 快速选择按钮 */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const allMemberIds = members?.map(m => m._id).filter(id => id !== currentUserId) || [];
                          setSendMessageForm({ ...sendMessageForm, recipients: allMemberIds });
                        }}
                        className="text-xs"
                      >
{t('myEnterprise.messageSystem.selectAllMembers')}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const adminIds = members?.filter(m => m.role === 'admin' || m.role === 'superAdmin').map(m => m._id) || [];
                          setSendMessageForm({ ...sendMessageForm, recipients: adminIds });
                        }}
                        className="text-xs"
                      >
{t('myEnterprise.messageSystem.selectAdmins')}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSendMessageForm({ ...sendMessageForm, recipients: [] });
                        }}
                        className="text-xs"
                      >
{t('myEnterprise.messageSystem.clearSelection')}
                      </Button>
                    </div>
                    
                    <MultiSelect
                      label={t('myEnterprise.messageSystem.selectRecipient')}
                      options={members?.map(member => ({
                        value: member._id,
                        label: `${member.name}${member.role === 'superAdmin' ? ' (' + t('myEnterprise.roles.superAdmin') + ')' : member.role === 'admin' ? ' (' + t('myEnterprise.roles.admin') + ')' : ''}`
                      })).filter(option => option.value !== currentUserId) || []}
                      value={sendMessageForm.recipients}
                      onChange={(value) => setSendMessageForm({ ...sendMessageForm, recipients: value.map(v => String(v)) })}
                      placeholder={t('myEnterprise.messageSystem.selectRecipientPlaceholder')}
                      className="w-full"
                    />
                    
                    {/* 已选择统计 */}
                    {sendMessageForm.recipients.length > 0 && (
                      <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <p className="text-xs text-blue-700 dark:text-blue-300">
{t('myEnterprise.messageSystem.selectedRecipients', { count: sendMessageForm.recipients.length })}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {sendMessageForm.recipients.map(recipientId => {
                            const member = members?.find(m => m._id === recipientId);
                            return member ? (
                              <span key={recipientId} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200">
                                {member.name}
                                <button
                                  type="button"
                                  onClick={() => setSendMessageForm({
                                    ...sendMessageForm,
                                    recipients: sendMessageForm.recipients.filter(id => id !== recipientId)
                                  })}
                                  className="ml-1 hover:bg-blue-200 dark:hover:bg-blue-700 rounded-full w-4 h-4 flex items-center justify-center"
                                >
                                  ×
                                </button>
                              </span>
                            ) : null;
                          })}
                        </div>
                      </div>
                    )}
                    
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
{t('myEnterprise.messageSystem.multiSelectHelp')}
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
{t('myEnterprise.messageSystem.messageContent')}
                  </label>
                  <textarea
                    value={sendMessageForm.content}
                    onChange={(e) => setSendMessageForm({ ...sendMessageForm, content: e.target.value })}
                    placeholder={t('myEnterprise.messageSystem.messageContentPlaceholder')}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={4}
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
{t('myEnterprise.messageSystem.messageContentHelp')}
                  </p>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setShowSendMessageModal(false)}
                >
                  {t('myEnterprise.actions.cancel')}
                </Button>
                <Button onClick={handleSendMessage} disabled={sendingMessage}>
{t('myEnterprise.messageSystem.send')}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* 编辑成员职位模态框 */}
        <AnimatePresence>
          {showEditMemberModal && (
            <motion.div 
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              <motion.div 
                className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md"
                initial={{ 
                  opacity: 0,
                  scale: 0.8,
                  y: 20,
                  rotateX: -15
                }}
                animate={{ 
                  opacity: 1,
                  scale: 1,
                  y: 0,
                  rotateX: 0
                }}
                exit={{ 
                  opacity: 0,
                  scale: 0.8,
                  y: 20,
                  rotateX: -15
                }}
                transition={{ 
                  duration: 0.3,
                  ease: [0.25, 0.46, 0.45, 0.94],
                  type: "spring",
                  stiffness: 300,
                  damping: 25
                }}
                style={{
                  transformOrigin: "center center",
                  perspective: "1000px"
                }}
              >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('myEnterprise.memberManagement.editMemberPosition')}</h3>
                <button
                  onClick={() => setShowEditMemberModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1, duration: 0.1, ease: "easeOut" }}
                >
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
{t('myEnterprise.memberManagement.memberName')}
                  </label>
                  <Input
                    value={editMemberForm.name}
                    disabled
                    className="bg-gray-100 dark:bg-gray-600"
                  />
                </motion.div>
                {/* 企业角色设置：只有超级管理员可以设置角色 */}
                {userRole?.isSuperAdmin && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.13, duration: 0.1, ease: "easeOut" }}
                  >
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
{t('myEnterprise.memberManagement.enterpriseRole')}
                    </label>
                    <select
                      value={editMemberForm.role}
                      onChange={(e) => setEditMemberForm({ ...editMemberForm, role: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    >
                      <option value="member">{t('myEnterprise.roles.member')}</option>
                      <option value="admin">{t('myEnterprise.roles.admin')}</option>
                    </select>
                  </motion.div>
                )}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.18, duration: 0.1, ease: "easeOut" }}
                >
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
{t('myEnterprise.memberManagement.positionDescription')}
                  </label>
                  <Input
                    value={editMemberForm.position}
                    onChange={(e) => setEditMemberForm({ ...editMemberForm, position: e.target.value })}
                    placeholder={t('myEnterprise.memberManagement.positionDescriptionPlaceholder')}
                  />
                </motion.div>
                {/* 部门选择：管理员不能编辑其他管理员的部门 */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.24, duration: 0.1, ease: "easeOut" }}
                >
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
{t('myEnterprise.memberManagement.department')}
                  </label>
                  {userRole?.isAdmin && !userRole?.isSuperAdmin && editMemberForm.role === 'admin' ? (
                    // 管理员编辑其他管理员时，部门选择被禁用
                    <div className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400">
                      {editMemberForm.departmentId ? 
                        departments?.find(d => d._id === editMemberForm.departmentId)?.name || t('myEnterprise.departmentManagement.unknownDepartment') : 
                        t('myEnterprise.memberManagement.noDepartment')
                      }
                    </div>
                  ) : (
                    <select
                      value={editMemberForm.departmentId || ''}
                      onChange={(e) => setEditMemberForm({ 
                        ...editMemberForm, 
                        departmentId: e.target.value === '' ? null : e.target.value 
                      })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    >
                      <option value="">{t('myEnterprise.memberManagement.noDepartment')}</option>
                      {departments?.map(dept => (
                        <option key={dept._id} value={dept._id}>{dept.name}</option>
                      )) || []}
                    </select>
                  )}
                  {userRole?.isAdmin && !userRole?.isSuperAdmin && editMemberForm.role === 'admin' && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
{t('myEnterprise.memberManagement.adminCannotEditOtherAdmin')}
                    </p>
                  )}
                </motion.div>
              </div>
              <motion.div 
                className="flex justify-end gap-3 mt-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.1, ease: "easeOut" }}
              >
                <Button
                  variant="outline"
                  onClick={() => setShowEditMemberModal(false)}
                  disabled={confirmModal.confirmLoading}
                  className="relative overflow-hidden"
                >
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    {t('myEnterprise.actions.cancel')}
                  </motion.span>
                </Button>
                <Button 
                  onClick={handleEditMember}
                  disabled={confirmModal.confirmLoading}
                  className="relative overflow-hidden"
                >
                  {confirmModal.confirmLoading ? (
                    <motion.div
                      className="flex items-center gap-2"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      <motion.div
                        className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                      <span>{t('myEnterprise.memberManagement.saving')}</span>
                    </motion.div>
                  ) : (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2 }}
                    >
{t('myEnterprise.memberManagement.save')}
                    </motion.span>
                  )}
                </Button>
              </motion.div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>



        {/* 超级管理员转让模态框 */}
        {showTransferSuperAdminModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('myEnterprise.actions.transferSuperAdminTitle')}</h3>
                <button
                  onClick={() => setShowTransferSuperAdminModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
                    <Crown className="w-5 h-5" />
                    <span className="font-medium">{t('myEnterprise.actions.importantNotice')}</span>
                  </div>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-2">
{t('myEnterprise.actions.transferWarning')}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
{t('myEnterprise.actions.selectNewSuperAdmin')}
                  </label>
                  <FuzzySelect
                    options={members?.filter(member => member.role !== 'superAdmin' && member.enterpriseMemberId).map(member => ({
                      value: member.enterpriseMemberId!,
                      label: `${member.name} (${member.role === 'admin' ? t('myEnterprise.roles.admin') : t('myEnterprise.roles.member')})`
                    })) || []}
                    value={transferSuperAdminForm.newSuperAdminId}
                    onChange={(value) => setTransferSuperAdminForm({ newSuperAdminId: String(value) })}
                    placeholder={t('myEnterprise.actions.selectNewSuperAdminPlaceholder')}
                    className="w-full"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setShowTransferSuperAdminModal(false)}
                >
                  {t('myEnterprise.actions.cancel')}
                </Button>
                <Button 
                  onClick={handleTransferSuperAdmin}
                  className="bg-yellow-600 hover:bg-yellow-700"
                  disabled={!transferSuperAdminForm.newSuperAdminId || confirmModal.confirmLoading}
                >
{confirmModal.confirmLoading ? confirmModal.loadingText : t('myEnterprise.actions.confirmTransfer')}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* 删除消息确认模态框 */}
        <ConfirmModal
          isOpen={showDeleteMessageModal}
          title={t('myEnterprise.messageSystem.deleteMessage')}
          message={t('myEnterprise.messageSystem.deleteMessageConfirm')}
          type="delete"
          confirmText={t('myEnterprise.actions.delete')}
          cancelText={t('myEnterprise.actions.cancel')}
          onConfirm={confirmDeleteMessage}
          onCancel={() => {
            setShowDeleteMessageModal(false);
            setMessageToDelete(null);
          }}
          confirmDanger={true}
          theme="glass"
          position="center"
          confirmLoading={deletingMessage}
          loadingText={t('myEnterprise.messageSystem.deleteMessageLoading')}
        />

        {/* 确认模态框 */}
        <ConfirmModal
          isOpen={confirmModal.isOpen}
          title={confirmModal.title}
          message={confirmModal.message}
          type={confirmModal.type}
          confirmText={confirmModal.confirmText}
          cancelText={confirmModal.cancelText}
          onConfirm={confirmModal.onConfirm}
          onCancel={closeConfirm}
          showCancel={confirmModal.showCancel}
          showConfirm={confirmModal.showConfirm}
          confirmDanger={confirmModal.confirmDanger}
          width={confirmModal.width}
          preventClose={confirmModal.preventClose}
        />

        {/* 右侧滑入通知 */}
        <RightSlideModal
          isOpen={rightSlideModal.isOpen}
          title={rightSlideModal.title}
          message={rightSlideModal.message}
          type={rightSlideModal.type}
          width={rightSlideModal.width}
          autoClose={rightSlideModal.autoClose}
          showProgress={rightSlideModal.showProgress}
          onClose={closeRightSlide}
        />
      </div>
    </div>
  );
};

export default MyEnterprisePage;
