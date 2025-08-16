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
import FuzzySelect from '../../components/ui/FuzzySelect';
import MultiSelect from '../../components/ui/MultiSelect';
import LaTeXHighlightInput from '../../components/editor/latex/LaTeXHighlightInput';
import HoverTooltip from '../../components/editor/preview/HoverTooltip';
import Avatar from '../../components/ui/Avatar';


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
  
  // 弹窗状态管理
  const { 
    confirmModal,
    showDanger,
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
    fetchEnterpriseInfo();
  }, []);

  // 获取企业信息
  const fetchEnterpriseInfo = async () => {
    try {
      setLoading(true);
      const response = await enterpriseService.getMyEnterpriseInfo();
      if (response.data.success) {
        setEnterpriseInfo(response.data);
        // 从企业信息中获取当前用户ID
        if (response.data.currentUser) {
          setCurrentUserId(response.data.currentUser._id);
        }
        await Promise.all([
          fetchMembers(),
          fetchDepartments(),
          fetchMessages()
        ]);
      } else {
        setError('获取企业信息失败');
      }
    } catch (error: any) {
      console.error('获取企业信息失败:', error);
      setError(error.response?.data?.error || '获取企业信息失败');
    } finally {
      setLoading(false);
    }
  };

  // 获取成员列表
  const fetchMembers = async (page: number = 1) => {
    try {
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
      console.error('获取成员列表失败:', error);
      setMembers([]);
      setTotalPages(1);
    }
  };

  // 获取部门列表
  const fetchDepartments = async () => {
    try {
      const response = await enterpriseService.getEnterpriseDepartments();
      if (response.data.success) {
        setDepartments(response.data.data || []);
      } else {
        setDepartments([]);
      }
    } catch (error: any) {
      console.error('获取部门列表失败:', error);
      setDepartments([]);
    }
  };

  // 获取消息列表
  const fetchMessages = async () => {
    try {
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
      console.error('获取消息列表失败:', error);
      setMessages([]);
    }
  };

  // 处理搜索
  const handleSearch = () => {
    fetchMembers(1);
  };

  // 处理部门筛选
  const handleDepartmentFilter = (departmentId: string) => {
    setSelectedDepartment(departmentId);
    fetchMembers(1);
  };

  // 创建部门
  const handleCreateDepartment = async () => {
    try {
      const response = await enterpriseService.createDepartment(createDepartmentForm);
      if (response.data.success) {
        setShowCreateDepartmentModal(false);
        setCreateDepartmentForm({ name: '', code: '', description: '' });
        fetchDepartments();
        // 这里可以添加成功提示
      }
    } catch (error: any) {
      console.error('创建部门失败:', error);
      // 这里可以添加错误提示
    }
  };

  // 编辑部门
  const handleEditDepartment = async () => {
    try {
      const response = await enterpriseService.updateDepartment(editDepartmentForm._id, {
        name: editDepartmentForm.name,
        description: editDepartmentForm.description
      });
      if (response.data.success) {
        setShowEditDepartmentModal(false);
        fetchDepartments();
        // 这里可以添加成功提示
      }
    } catch (error: any) {
      console.error('更新部门失败:', error);
      // 这里可以添加错误提示
    }
  };

  // 删除部门
  const handleDeleteDepartment = async (departmentId: string) => {
    if (window.confirm('确定要删除这个部门吗？')) {
      try {
        const response = await enterpriseService.deleteDepartment(departmentId);
        if (response.data.success) {
          fetchDepartments();
          // 这里可以添加成功提示
        }
      } catch (error: any) {
        console.error('删除部门失败:', error);
        // 这里可以添加错误提示
      }
    }
  };

  // 发送消息
  const handleSendMessage = async () => {
    try {
      // 验证表单
      if (!sendMessageForm.content.trim()) {
        showErrorRightSlide('输入错误', '请输入消息内容');
        return;
      }

      if (sendMessageForm.type === 'department' && !sendMessageForm.departmentId) {
        showErrorRightSlide('输入错误', '请选择部门');
        return;
      }

      if (sendMessageForm.type === 'general' && sendMessageForm.recipients.length === 0) {
        showErrorRightSlide('输入错误', '请选择消息接收者');
        return;
      }

      // 检查是否给自己发消息
      if (sendMessageForm.type === 'general' && sendMessageForm.recipients.includes(currentUserId)) {
        showErrorRightSlide('输入错误', '不能给自己发消息');
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
          name: enterpriseInfo?.currentUser?.name || '我',
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
          showSuccessRightSlide('发送成功', '消息已发送');
          // 静默刷新，获取真实的消息ID
          fetchMessages();
        } else {
          showErrorRightSlide('发送失败', response.data.message || '发送失败');
          // 移除乐观更新的消息
          setMessages(prev => prev.filter(m => m._id !== optimisticMessage._id));
        }
      }).catch((error) => {
        console.error('发送消息失败:', error);
        showErrorRightSlide('发送失败', error.response?.data?.error || '发送失败');
        // 移除乐观更新的消息
        setMessages(prev => prev.filter(m => m._id !== optimisticMessage._id));
      }).finally(() => {
        setSendingMessage(false);
      });
    } catch (error: any) {
      console.error('发送消息失败:', error);
      showErrorRightSlide('发送失败', error.response?.data?.error || '发送失败');
      setSendingMessage(false);
    }
  };

  // 编辑成员职位
  const handleEditMember = async () => {
    try {
      console.log('🔍 调试信息 - editMemberForm:', editMemberForm);
      console.log('🔍 调试信息 - members:', members);
      
      // 找到要编辑的成员（使用用户ID查找）
      const memberToEdit = members.find(m => m.enterpriseMemberId === editMemberForm._id);
      console.log('🔍 调试信息 - memberToEdit:', memberToEdit);
      
      if (!memberToEdit) {
        console.error('❌ 找不到要编辑的成员，editMemberForm._id:', editMemberForm._id);
        console.error('❌ 所有成员的enterpriseMemberId:', members.map(m => ({ name: m.name, enterpriseMemberId: m.enterpriseMemberId })));
        showErrorRightSlide('错误', '找不到要编辑的成员');
        return;
      }

      // 乐观更新：立即更新UI
      const updatedMember: EnterpriseMemberData = {
        ...memberToEdit,
        role: editMemberForm.role,
        position: editMemberForm.position,
        departmentId: editMemberForm.departmentId || undefined
      };
      
      console.log('🔍 调试信息 - 准备更新成员:', updatedMember);
      
      setMembers(prev => prev.map(m => 
        m.enterpriseMemberId === editMemberForm._id ? updatedMember : m
      ));
      
      setShowEditMemberModal(false);
      showSuccessRightSlide('更新成功', '成员职位更新成功');
      
      console.log('🔍 调试信息 - 准备调用API，memberId:', editMemberForm._id);
      
      // 异步刷新数据（不阻塞UI）
      enterpriseService.setAdminRole(editMemberForm._id, {
        role: editMemberForm.role,
        position: editMemberForm.position,
        departmentId: editMemberForm.departmentId || undefined
      }).then((response) => {
        console.log('✅ API调用成功:', response);
        // 静默刷新，不显示加载状态
        fetchMembers();
      }).catch((error) => {
        console.error('❌ API调用失败:', error);
        console.error('❌ 错误详情:', error.response?.data);
        // 如果失败，回滚UI更改
        fetchMembers();
      });
      
    } catch (error: any) {
      console.error('❌ 更新成员职位失败:', error);
      console.error('❌ 错误详情:', error.response?.data);
      showErrorRightSlide('更新失败', error.response?.data?.error || '更新成员职位失败');
    }
  };

  // 回复消息
  const handleReplyMessage = async () => {
    try {
      if (!replyForm.content.trim()) {
        showErrorRightSlide('输入错误', '请输入回复内容');
        return;
      }

      const messageData = {
        content: replyForm.content,
        type: 'reply' as const,
        recipients: [], // 回复消息的接收者由后端自动确定
        replyTo: replyForm.replyTo
      };

      const response = await enterpriseService.sendMessage(messageData);
      if (response.data.success) {
        setReplyingToMessage(null); // 关闭回复输入框
        setReplyForm({
          content: '',
          replyTo: ''
        });
        fetchMessages();
        showSuccessRightSlide('发送成功', '回复已成功发送');
      }
    } catch (error: any) {
      console.error('回复消息失败:', error);
      showErrorRightSlide('回复失败', error.response?.data?.error || error.message);
    }
  };

  // 转让超级管理员身份
  const handleTransferSuperAdmin = async () => {
    try {
      const response = await enterpriseService.transferSuperAdmin(transferSuperAdminForm.newSuperAdminId);
      
      if (response.data.success) {
        setShowTransferSuperAdminModal(false);
        setTransferSuperAdminForm({ newSuperAdminId: '' });
        
        // 显示成功消息
        showSuccess(
          '转让成功',
          '超级管理员身份转让成功！您将被重定向到登录页面。',
          {
            onConfirm: () => {
              // 转让成功后重定向到登录页面，因为当前用户身份已改变
              window.location.href = '/login';
            }
          }
        );
      }
    } catch (error: any) {
      console.error('❌ 转让超级管理员身份失败:', error);
      console.error('❌ 错误详情:', error.response?.data);
      
      // 显示详细的错误信息
      let errorMessage = '转让失败';
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      showErrorRightSlide('转让失败', errorMessage);
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

  // 删除消息
  const handleDeleteMessage = async (messageId: string) => {
    showDanger(
      '删除消息',
      '确定要删除这条消息吗？删除后无法恢复。',
      async () => {
        try {
          const response = await enterpriseService.deleteMessage(messageId);
          if (response.data.success) {
            fetchMessages();
            showSuccessRightSlide('删除成功', '消息已成功删除');
          }
        } catch (error: any) {
          console.error('删除消息失败:', error);
          const errorMessage = error.response?.data?.error || '删除消息失败';
          showErrorRightSlide('删除失败', errorMessage);
        }
        // 关闭确认弹窗
        closeConfirm();
      }
    );
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
    console.log('🔍 调试信息 - 打开编辑模态框，member:', member);
    
    // 超级管理员不能被编辑
    if (member.role === 'superAdmin') {
      showErrorRightSlide('权限不足', '超级管理员身份不能通过此界面修改，请使用身份转让功能');
      return;
    }
    
    const formData = {
      _id: member.enterpriseMemberId || member._id, // 优先使用enterpriseMemberId，这是EnterpriseMember的ID
      name: member.name,
      role: member.role as 'member' | 'admin',
      position: member.position || '',
      departmentId: member.departmentId || null
    };
    
    console.log('🔍 调试信息 - 设置表单数据:', formData);
    console.log('🔍 调试信息 - member.enterpriseMemberId:', member.enterpriseMemberId);
    console.log('🔍 调试信息 - member._id:', member._id);
    
    setEditMemberForm(formData);
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

  // 获取消息类型中文名称
  const getMessageTypeName = (type: string) => {
    switch (type) {
      case 'general':
        return '普通消息';
      case 'announcement':
        return '公告';
      case 'department':
        return '部门消息';
      case 'group':
        return '群聊消息';
      case 'mention':
        return '提及消息';
      case 'reply':
        return '回复';
      default:
        return '未知类型';
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
                    name: enterpriseInfo?.currentUser?.name || '当前用户',
                    avatar: enterpriseInfo?.currentUser?.avatar
                  }
                ]
              }
            : msg
        )
      );
    } catch (error) {
      console.error('标记消息已读失败:', error);
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-blue-900/20 dark:to-indigo-900/20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">加载中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-blue-900/20 dark:to-indigo-900/20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">加载失败</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <Button onClick={fetchEnterpriseInfo}>重试</Button>
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
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">未加入企业</h2>
          <p className="text-gray-600 dark:text-gray-400">您尚未加入任何企业</p>
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
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{enterprise?.name || '企业'}</h1>
              <p className="text-gray-600 dark:text-gray-400">企业管理中心</p>
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
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">基本信息</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500 dark:text-gray-400">邮箱后缀:</span>
                          <span className="font-medium">{enterprise?.emailSuffix || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500 dark:text-gray-400">信用代码:</span>
                          <span className="font-medium">{enterprise?.creditCode || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500 dark:text-gray-400">成员数量:</span>
                          <span className="font-medium">{enterprise?.currentMembers || 0}/{enterprise?.maxMembers || 0}</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">详细信息</h3>
                      <div className="space-y-2 text-sm">
                        {enterprise?.description && (
                          <div className="flex items-center gap-2">
                            <span className="text-gray-500 dark:text-gray-400">描述:</span>
                            <span className="font-medium">{enterprise.description}</span>
                          </div>
                        )}
                        {enterprise?.address && (
                          <div className="flex items-center gap-2">
                            <span className="text-gray-500 dark:text-gray-400">地址:</span>
                            <span className="font-medium">{enterprise.address}</span>
                          </div>
                        )}
                        {enterprise?.industry && (
                          <div className="flex items-center gap-2">
                            <span className="text-gray-500 dark:text-gray-400">行业:</span>
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
              { id: 'overview', label: '概览', icon: Building2 },
              { id: 'members', label: '成员', icon: Users },
              { id: 'departments', label: '部门', icon: Settings },
              { id: 'messages', label: '消息', icon: MessageSquare }
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
                    <p className="text-gray-600 dark:text-gray-400">企业成员</p>
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
                    <p className="text-gray-600 dark:text-gray-400">部门数量</p>
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
                    <p className="text-gray-600 dark:text-gray-400">消息数量</p>
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
                        placeholder="搜索成员姓名、邮箱或部门..."
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
                        <option value="">所有部门</option>
                        {departments?.map(dept => (
                          <option key={dept._id} value={dept._id}>{dept.name}</option>
                        )) || []}
                      </select>
                      <Button onClick={handleSearch}>搜索</Button>
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
                          <h4 className="font-semibold text-gray-900 dark:text-gray-100">{member.name || '未知用户'}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{member.email || 'N/A'}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full flex items-center gap-1">
                              {getRoleIcon(member.role)}
                              {member.role === 'superAdmin' ? '超级管理员' : member.role === 'admin' ? '管理员' : '成员'}
                            </span>
                            {member.position && (
                              <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full">
                                {member.position}
                              </span>
                            )}
                            {member.departmentId && (
                              <span className="text-xs px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full">
                                {department?.name || '未知部门'}
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
                            <div>最后登录</div>
                            <div>{member.lastLogin ? new Date(member.lastLogin).toLocaleDateString() : '从未登录'}</div>
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
          showErrorRightSlide('获取失败', '无法获取成员信息，请刷新页面重试');
        }
                                }}
                                title="转让超级管理员身份"
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
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">部门管理</h3>
                    {(userRole?.isSuperAdmin || userRole?.isAdmin) && (
                      <Button 
                        className="bg-blue-600 hover:bg-blue-700"
                        onClick={() => setShowCreateDepartmentModal(true)}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        创建部门
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
                            <h4 className="font-semibold text-gray-900 dark:text-gray-100">{dept.name || '未命名部门'}</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{dept.code || 'N/A'}</p>
                            {dept.description && (
                              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{dept.description}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right text-sm text-gray-500 dark:text-gray-400">
                            <div>成员数量</div>
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
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">企业消息</h3>
                    <Button 
                      className="bg-blue-600 hover:bg-blue-700"
                      onClick={() => setShowSendMessageModal(true)}
                    >
                      <Send className="w-4 h-4 mr-2" />
                      发送消息
                    </Button>
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
                      <div key={msg._id} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
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
                                <h4 className="font-semibold text-gray-900 dark:text-gray-100">{msg.sender?.name || '未知用户'}</h4>
                                <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full">
                                  {getMessageTypeName(msg.type)}
                                </span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {msg.createdAt ? new Date(msg.createdAt).toLocaleString() : '未知时间'}
                                </span>
                                {/* 已读状态显示 - 只有发送者能看到 */}
                                {msg.isRead && msg.isRead.length > 0 && msg.sender?._id === currentUserId && (
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full">
                                      已读 ({msg.isRead.length})
                                    </span>
                                    {/* 发送者可以看到具体已读的人 */}
                                    <div className="flex items-center gap-1">
                                      <span className="text-xs text-gray-500 dark:text-gray-400">已读:</span>
                                      {msg.isRead.map((reader, index) => (
                                        <span 
                                          key={reader._id || `reader-${index}`} 
                                          className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full"
                                        >
                                          {reader.name || '未知用户'}
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
                                  onClick={() => handleDeleteMessage(msg._id)}
                                  className="text-red-600 hover:text-red-700"
                                  title="删除消息"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                            <p className="text-gray-700 dark:text-gray-300">{msg.content || '无内容'}</p>
                            
                            {(msg.mentionedUsers?.length > 0 || msg.mentionedDepartments?.length > 0) && (
                              <div className="flex items-center gap-2 mt-2">
                                <AtSign className="w-4 h-4 text-gray-400" />
                                <div className="flex gap-2">
                                  {msg.mentionedUsers?.map(user => (
                                    <span key={user._id} className="text-xs px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded">
                                      @{user?.name || '未知用户'}
                                    </span>
                                  )) || []}
                                  {msg.mentionedDepartments?.map(dept => (
                                    <span key={dept._id} className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded">
                                      @{dept.name || '未知部门'}
                                    </span>
                                  )) || []}
                                </div>
                              </div>
                            )}
                            
                            {/* 回复统计和展开按钮 */}
                            {msg.replies && msg.replies.length > 0 && (
                              <div className="mt-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => toggleReplies(msg._id)}
                                  className="text-gray-600 hover:text-gray-700"
                                >
                                  {expandedReplies.has(msg._id) ? '收起回复' : `展开回复 (${msg.replies.length})`}
                                </Button>
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
                                            <h5 className="text-sm font-medium text-gray-900 dark:text-gray-100">{reply.sender?.name || '未知用户'}</h5>
                                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                              {reply.createdAt ? new Date(reply.createdAt).toLocaleString() : '未知时间'}
                                            </span>
                                          </div>
                                          {/* 删除回复按钮 - 只有发送者可以删除 */}
                                          {reply.sender?._id === currentUserId && (
                                            <Button
                                              size="sm"
                                              variant="outline"
                                              onClick={() => handleDeleteMessage(reply._id)}
                                              className="text-red-600 hover:text-red-700"
                                              title="删除回复"
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
                            
                            {/* 消息操作按钮 */}
                            <div className="flex items-center gap-2 mt-3">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openReplyInput(msg._id)}
                                className="text-blue-600 hover:text-blue-700"
                              >
                                <MessageSquare className="w-4 h-4 mr-1" />
                                回复
                              </Button>
                            </div>

                            {/* 内联回复输入框 */}
                            {replyingToMessage === msg._id && (
                              <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                                <div className="flex items-start gap-2">
                                  <div className="flex-1">
                                    <textarea
                                      value={replyForm.content}
                                      onChange={(e) => setReplyForm({ ...replyForm, content: e.target.value })}
                                      placeholder="输入回复内容..."
                                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
                                      rows={2}
                                      autoFocus
                                    />
                                  </div>
                                  <div className="flex gap-2">
                                    <Button
                                      size="sm"
                                      onClick={handleReplyMessage}
                                      disabled={!replyForm.content.trim()}
                                      className="bg-blue-600 hover:bg-blue-700 text-white"
                                    >
                                      发送
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={cancelReply}
                                      className="text-gray-600 hover:text-gray-700"
                                    >
                                      取消
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
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
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">创建部门</h3>
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
                    部门名称
                  </label>
                  <Input
                    value={createDepartmentForm.name}
                    onChange={(e) => setCreateDepartmentForm({ ...createDepartmentForm, name: e.target.value })}
                    placeholder="请输入部门名称"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    部门代码
                  </label>
                  <Input
                    value={createDepartmentForm.code}
                    onChange={(e) => setCreateDepartmentForm({ ...createDepartmentForm, code: e.target.value })}
                    placeholder="请输入部门代码"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    部门描述
                  </label>
                  <textarea
                    value={createDepartmentForm.description}
                    onChange={(e) => setCreateDepartmentForm({ ...createDepartmentForm, description: e.target.value })}
                    placeholder="请输入部门描述（可选）"
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
                  取消
                </Button>
                <Button onClick={handleCreateDepartment}>
                  创建
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
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">编辑部门</h3>
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
                    部门名称
                  </label>
                  <Input
                    value={editDepartmentForm.name}
                    onChange={(e) => setEditDepartmentForm({ ...editDepartmentForm, name: e.target.value })}
                    placeholder="请输入部门名称"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    部门代码
                  </label>
                  <Input
                    value={editDepartmentForm.code}
                    disabled
                    className="bg-gray-100 dark:bg-gray-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    部门描述
                  </label>
                  <textarea
                    value={editDepartmentForm.description}
                    onChange={(e) => setEditDepartmentForm({ ...editDepartmentForm, description: e.target.value })}
                    placeholder="请输入部门描述（可选）"
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
                  取消
                </Button>
                <Button onClick={handleEditDepartment}>
                  保存
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
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">发送消息</h3>
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
                    消息类型
                  </label>
                  <FuzzySelect
                    options={[
                      { value: 'general', label: '普通消息' },
                      { value: 'department', label: '部门消息' },
                      ...(userRole?.isAdmin || userRole?.isSuperAdmin ? [{ value: 'announcement', label: '公告（发送给所有成员）' }] : [])
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
                    placeholder="选择消息类型"
                    className="w-full"
                  />
                </div>

                {/* 部门选择（仅部门消息显示） */}
                {sendMessageForm.type === 'department' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      选择部门
                    </label>
                    <FuzzySelect
                      options={departments?.map(dept => ({
                        value: dept._id,
                        label: dept.name
                      })) || []}
                      value={sendMessageForm.departmentId || ''}
                      onChange={(value) => setSendMessageForm({ ...sendMessageForm, departmentId: String(value) })}
                      placeholder="请选择部门"
                      className="w-full"
                    />
                  </div>
                )}

                {/* 用户选择（普通消息显示） */}
                {sendMessageForm.type === 'general' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      选择接收者
                    </label>
                    <MultiSelect
                      label="选择接收者"
                      options={members?.map(member => ({
                        value: member._id,
                        label: member.name
                      })) || []}
                      value={sendMessageForm.recipients}
                      onChange={(value) => setSendMessageForm({ ...sendMessageForm, recipients: value.map(v => String(v)) })}
                      placeholder="选择接收者"
                      className="w-full"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      可以选择多个用户作为接收者
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    消息内容
                  </label>
                  <HoverTooltip
                    content={sendMessageForm.content}
                    config={{ mode: 'lightweight' }}
                    maxWidth="max-w-md"
                  >
                    <LaTeXHighlightInput
                      value={sendMessageForm.content}
                      onChange={(content) => setSendMessageForm({ ...sendMessageForm, content })}
                      placeholder="请输入消息内容，支持LaTeX公式"
                      className="w-full"
                      rows={4}
                      enableAutoComplete={true}
                    />
                  </HoverTooltip>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    支持LaTeX数学公式，鼠标悬停可预览渲染效果
                  </p>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setShowSendMessageModal(false)}
                >
                  取消
                </Button>
                <Button onClick={handleSendMessage} disabled={sendingMessage}>
                  发送
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* 编辑成员职位模态框 */}
        {showEditMemberModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">编辑成员职位</h3>
                <button
                  onClick={() => setShowEditMemberModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    成员姓名
                  </label>
                  <Input
                    value={editMemberForm.name}
                    disabled
                    className="bg-gray-100 dark:bg-gray-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    企业角色
                  </label>
                  <select
                    value={editMemberForm.role}
                    onChange={(e) => setEditMemberForm({ ...editMemberForm, role: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  >
                    <option value="member">普通成员</option>
                    <option value="admin">管理员</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    职位描述
                  </label>
                  <Input
                    value={editMemberForm.position}
                    onChange={(e) => setEditMemberForm({ ...editMemberForm, position: e.target.value })}
                    placeholder="请输入职位描述（可选）"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    所属部门
                  </label>
                  <select
                    value={editMemberForm.departmentId || ''}
                    onChange={(e) => setEditMemberForm({ 
                      ...editMemberForm, 
                      departmentId: e.target.value === '' ? null : e.target.value 
                    })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  >
                    <option value="">无部门</option>
                    {departments?.map(dept => (
                      <option key={dept._id} value={dept._id}>{dept.name}</option>
                    )) || []}
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setShowEditMemberModal(false)}
                >
                  取消
                </Button>
                <Button onClick={handleEditMember}>
                  保存
                </Button>
              </div>
            </div>
          </div>
        )}



        {/* 超级管理员转让模态框 */}
        {showTransferSuperAdminModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">转让超级管理员身份</h3>
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
                    <span className="font-medium">重要提示</span>
                  </div>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-2">
                    转让超级管理员身份后，您将降级为普通成员，失去所有管理权限。此操作不可撤销，请谨慎操作。
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    选择新超级管理员
                  </label>
                  <FuzzySelect
                    options={members?.filter(member => member.role !== 'superAdmin' && member.enterpriseMemberId).map(member => ({
                      value: member.enterpriseMemberId!,
                      label: `${member.name} (${member.role === 'admin' ? '管理员' : '成员'})`
                    })) || []}
                    value={transferSuperAdminForm.newSuperAdminId}
                    onChange={(value) => setTransferSuperAdminForm({ newSuperAdminId: String(value) })}
                    placeholder="请选择新超级管理员"
                    className="w-full"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setShowTransferSuperAdminModal(false)}
                >
                  取消
                </Button>
                <Button 
                  onClick={handleTransferSuperAdmin}
                  className="bg-yellow-600 hover:bg-yellow-700"
                  disabled={!transferSuperAdminForm.newSuperAdminId}
                >
                  确认转让
                </Button>
              </div>
            </div>
          </div>
        )}

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
