import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Users, 
  Shield,
  Calendar,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { userAPI } from '../../services/api';
import { useAuthStore } from '../../stores/authStore';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';
import { FuzzySelect } from '../../components/ui/menu';
import LoadingPage from '../../components/ui/LoadingPage';
import ConfirmModal from '../../components/ui/ConfirmModal';
import { useModal } from '../../hooks/useModal';

interface UserData {
  _id: string;
  email: string;
  name: string;
  role: 'superadmin' | 'admin' | 'teacher' | 'student';
  department?: string;
  isEmailVerified: boolean;
  lastLogin?: string;
  createdAt: string;
  status: 'active' | 'inactive' | 'suspended';
}

interface EditUserModalProps {
  user: UserData | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (userId: string, data: any) => Promise<void>;
}

const EditUserModal: React.FC<EditUserModalProps> = ({ user, isOpen, onClose, onUpdate }) => {
  const { user: currentUser } = useAuthStore();
  const isSuperAdmin = currentUser?.role === 'superadmin';
  
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    department: '',
    isActive: true
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        role: user.role,
        department: user.department || '',
        isActive: user.status === 'active'
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);
    try {
      await onUpdate(user._id, {
        name: formData.name,
        role: formData.role as 'admin' | 'teacher' | 'student',
        department: formData.department,
        isActive: formData.isActive
      });
      onClose();
    } catch (error) {
      // 错误日志已清理
    } finally {
      setIsSubmitting(false);
    }
  };

  const roleOptions = [
    { value: 'student', label: '学生', icon: Users },
    { value: 'teacher', label: '教师', icon: Shield },
    { value: 'admin', label: '管理员', icon: Shield }
  ];

  const statusOptions = [
    { value: 'true', label: '活跃', icon: CheckCircle },
    { value: 'false', label: '非活跃', icon: XCircle }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Edit className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">编辑用户</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">修改用户信息和权限设置</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">姓名</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="请输入姓名"
                  required
                />
              </div>

              {isSuperAdmin && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">角色</label>
                  <FuzzySelect
                    options={roleOptions}
                    value={formData.role}
                    onChange={(value) => setFormData({ ...formData, role: value as string })}
                    placeholder="选择角色"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">部门</label>
                <Input
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  placeholder="请输入部门"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">状态</label>
                <FuzzySelect
                  options={statusOptions}
                  value={formData.isActive.toString()}
                  onChange={(value) => setFormData({ ...formData, isActive: value === 'true' })}
                  placeholder="选择状态"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  取消
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? '保存中...' : '保存'}
                </Button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const UserManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [users, setUsers] = useState<UserData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const { showConfirm, confirmModal, closeConfirm } = useModal();

  // 获取用户名首字母
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // 获取头像背景色
  const getAvatarColor = (name: string) => {
    const colors = [
      'bg-gradient-to-br from-blue-500 to-blue-600',
      'bg-gradient-to-br from-green-500 to-green-600',
      'bg-gradient-to-br from-purple-500 to-purple-600',
      'bg-gradient-to-br from-pink-500 to-pink-600',
      'bg-gradient-to-br from-indigo-500 to-indigo-600',
      'bg-gradient-to-br from-teal-500 to-teal-600',
      'bg-gradient-to-br from-orange-500 to-orange-600',
      'bg-gradient-to-br from-red-500 to-red-600'
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  // 检查用户权限
  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';
  const isSuperAdmin = user?.role === 'superadmin';

  // 如果没有权限，重定向到首页
  useEffect(() => {
    // 等待用户信息加载完成后再检查权限
    if (user !== null && !isAdmin) {
      navigate('/dashboard');
    }
  }, [user, isAdmin, navigate]);

  // 获取用户数据
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await userAPI.getAllUsers();
        if (response.data.success) {
          setUsers(response.data.users);
        } else {
          setError('获取用户列表失败');
        }
      } catch (error: any) {
        // 错误日志已清理
        setError(error.response?.data?.error || '获取用户列表失败');
      } finally {
        setLoading(false);
      }
    };

    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin]);

  // 删除用户
  const handleDeleteUser = async (userId: string, userName: string) => {
    showConfirm(
      `确定要删除用户 "${userName}" 吗？`,
      '此操作不可撤销.',
      async () => {
        try {
          // 先关闭模态框
          closeConfirm();
          
          const response = await userAPI.deleteUser(userId);
          if (response.data.success) {
            // 删除成功，刷新用户列表
            setUsers(users.filter(user => user._id !== userId));
            setError('');
          } else {
            setError('删除用户失败');
          }
        } catch (error: any) {
          // 错误日志已清理
          setError(error.response?.data?.error || '删除用户失败');
        }
      }
    );
  };

  // 更新用户信息
  const handleUpdateUser = async (userId: string, data: any) => {
    try {
      // 如果不是超级管理员，不允许修改角色
      if (!isSuperAdmin && data.role) {
        delete data.role;
      }
      
      const response = await userAPI.updateUser(userId, data);
      if (response.data.success) {
        setUsers(users.map(user => 
          user._id === userId 
            ? { 
                ...user, 
                ...data,
                status: data.isActive ? 'active' : 'inactive'
              }
            : user
        ));
        setError('');
      } else {
        setError('更新用户失败');
      }
    } catch (error: any) {
      // 错误日志已清理
      setError(error.response?.data?.error || '更新用户失败');
    }
  };

  // 更新用户状态
  const handleUpdateUserStatus = async (userId: string, isActive: boolean) => {
    try {
      const response = await userAPI.updateUser(userId, { isActive });
      if (response.data.success) {
        setUsers(users.map(user => 
          user._id === userId 
            ? { ...user, status: isActive ? 'active' : 'inactive' }
            : user
        ));
        setError('');
      } else {
        setError('更新用户状态失败');
      }
    } catch (error: any) {
      // 错误日志已清理
      setError(error.response?.data?.error || '更新用户状态失败');
    }
  };

  // 重置筛选
  const handleResetFilters = () => {
    setSearchTerm('');
    setRoleFilter('');
    setStatusFilter('');
  };

  // 过滤用户
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = !roleFilter || user.role === roleFilter;
    const matchesStatus = !statusFilter || user.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      superadmin: { 
        label: '超级管理员', 
        bgColor: 'bg-gradient-to-br from-amber-400 via-orange-500 to-red-500',
        textColor: 'text-white',
        borderColor: 'border-amber-200'
      },
      admin: { 
        label: '管理员', 
        bgColor: 'bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600',
        textColor: 'text-white',
        borderColor: 'border-blue-200'
      },
      teacher: { 
        label: '教师', 
        bgColor: 'bg-gradient-to-br from-emerald-400 via-green-500 to-teal-600',
        textColor: 'text-white',
        borderColor: 'border-emerald-200'
      },
      student: { 
        label: '学生', 
        bgColor: 'bg-gradient-to-br from-slate-400 via-gray-500 to-zinc-600',
        textColor: 'text-white',
        borderColor: 'border-slate-200'
      }
    };
    
    const config = roleConfig[role as keyof typeof roleConfig];
    
    return (
      <div className={`inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-semibold shadow-sm border ${config.bgColor} ${config.textColor} ${config.borderColor} backdrop-blur-sm`}>
        <span className="tracking-wide">{config.label}</span>
      </div>
    );
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { 
        label: '活跃', 
        bgColor: 'bg-gradient-to-br from-green-400 via-emerald-500 to-teal-600',
        textColor: 'text-white',
        borderColor: 'border-green-200'
      },
      inactive: { 
        label: '非活跃', 
        bgColor: 'bg-gradient-to-br from-slate-300 via-gray-400 to-zinc-500',
        textColor: 'text-white',
        borderColor: 'border-slate-200'
      },
      suspended: { 
        label: '已暂停', 
        bgColor: 'bg-gradient-to-br from-red-400 via-pink-500 to-rose-600',
        textColor: 'text-white',
        borderColor: 'border-red-200'
      }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig];
    
    return (
      <div className={`inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-semibold shadow-sm border ${config.bgColor} ${config.textColor} ${config.borderColor} backdrop-blur-sm`}>
        <span className="tracking-wide">{config.label}</span>
      </div>
    );
  };

  // 筛选选项
  const roleOptions = [
    { value: 'superadmin', label: '超级管理员', icon: Shield },
    { value: 'admin', label: '管理员', icon: Shield },
    { value: 'teacher', label: '教师', icon: Shield },
    { value: 'student', label: '学生', icon: Users }
  ];

  const statusOptions = [
    { value: 'active', label: '活跃', icon: CheckCircle },
    { value: 'inactive', label: '非活跃', icon: XCircle },
    { value: 'suspended', label: '已暂停', icon: XCircle }
  ];

  if (!isAdmin) {
    return null;
  }

  if (loading) {
    return (
      <LoadingPage 
        title="正在加载用户列表..." 
        description="请稍候，正在获取用户信息"
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* 错误提示 */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl p-4"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
              </div>
              <div className="ml-auto pl-3">
                <button
                  onClick={() => setError('')}
                  className="inline-flex text-red-400 hover:text-red-600 dark:text-red-300 dark:hover:text-red-400"
                >
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* 页面头部 */}
        <div className="sticky top-0 z-30 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-blue-600 dark:from-gray-100 dark:to-blue-400 bg-clip-text text-transparent">
                  用户管理
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">管理系统用户，分配权限和角色</p>
              </div>
              <div className="flex items-center space-x-4">
                {/* 用户统计面板 */}
                <div className="flex items-center space-x-3">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                    className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-xl px-4 py-2 border border-blue-200 dark:border-blue-600"
                  >
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                        总用户: {users.length} 人
                      </span>
                    </div>
                  </motion.div>
                  
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                    className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 rounded-xl px-4 py-2 border border-green-200 dark:border-green-600"
                  >
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm font-medium text-green-700 dark:text-green-300">
                        活跃: {users.filter(u => u.status === 'active').length}
                      </span>
                    </div>
                  </motion.div>
                  
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.3 }}
                    className="bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-900/30 dark:to-violet-900/30 rounded-xl px-4 py-2 border border-purple-200 dark:border-purple-600"
                  >
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
                        管理员: {users.filter(u => u.role === 'admin' || u.role === 'superadmin').length}
                      </span>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 筛选和搜索 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="relative z-10"
        >
          <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-0 shadow-xl">
            <div className="p-8">
              <div className="space-y-6">
                {/* 搜索栏 */}
                <div className="relative max-w-md">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
                  <Input
                    placeholder="搜索用户名或邮箱..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 pr-4 py-3 bg-white/70 dark:bg-gray-700/70 backdrop-blur-sm border-gray-200 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500 rounded-xl text-sm font-medium"
                  />
                </div>
                
                {/* 筛选选项 */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="relative z-20">
                    <FuzzySelect
                      options={roleOptions}
                      value={roleFilter}
                      onChange={(value) => setRoleFilter(value as string)}
                      placeholder="所有角色"
                      label="角色筛选"
                      className="w-full"
                    />
                  </div>
                  <div className="relative z-20">
                    <FuzzySelect
                      options={statusOptions}
                      value={statusFilter}
                      onChange={(value) => setStatusFilter(value as string)}
                      placeholder="所有状态"
                      label="状态筛选"
                      className="w-full"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button 
                      variant="outline" 
                      className="flex items-center justify-center gap-2 bg-white/70 dark:bg-gray-700/70 backdrop-blur-sm border-gray-200 dark:border-gray-600 hover:bg-white/90 dark:hover:bg-gray-600/90 rounded-xl px-6 py-3 w-full"
                      onClick={handleResetFilters}
                    >
                      <Filter className="w-4 h-4" />
                      重置筛选
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* 用户列表 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl overflow-hidden">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-blue-900/20 dark:to-indigo-900/20">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">用户列表</h2>
                <span className="text-sm text-gray-500 dark:text-gray-400 bg-white/50 dark:bg-gray-700/50 px-3 py-1 rounded-full">
                  共 {filteredUsers.length} 个用户
                </span>
              </div>
            </div>
            
            {loading ? (
              <div className="p-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400">正在加载用户数据...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50/50 dark:bg-gray-700/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">用户信息</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">角色</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">状态</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">最后登录</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">注册时间</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">操作</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white/50 dark:bg-gray-800/50 divide-y divide-gray-100 dark:divide-gray-700">
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                          <div className="flex flex-col items-center gap-2">
                            <Users className="w-8 h-8 text-gray-300 dark:text-gray-600" />
                            <span>暂无用户数据</span>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((user, index) => (
                        <motion.tr
                          key={user._id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                          className="hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-colors duration-200"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div className={`w-12 h-12 ${getAvatarColor(user.name)} rounded-xl flex items-center justify-center shadow-lg`}>
                                <span className="text-white font-semibold text-sm">{getInitials(user.name)}</span>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{user.name}</div>
                                <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                                  <div className="w-4 h-4 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center">
                                    <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                                    </svg>
                                  </div>
                                  <span className="text-xs">{user.email}</span>
                                </div>
                                {user.department && (
                                  <div className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-2 mt-1">
                                    <div className="w-3 h-3 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center">
                                      <svg className="w-1.5 h-1.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
                                      </svg>
                                    </div>
                                    <span>{user.department}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {getRoleBadge(user.role)}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              {getStatusBadge(user.status)}
                              {user.role !== 'superadmin' && (
                                <button
                                  onClick={() => handleUpdateUserStatus(user._id, user.status !== 'active')}
                                  className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline"
                                >
                                  {user.status === 'active' ? '停用' : '启用'}
                                </button>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : '从未登录'}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(user.createdAt).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              {user.role !== 'superadmin' && (
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="flex items-center gap-2 bg-white/70 dark:bg-gray-700/70 backdrop-blur-sm border-gray-200 dark:border-gray-600 hover:bg-white/90 dark:hover:bg-gray-600/90 hover:border-blue-300 transition-all duration-200 rounded-xl px-3 py-2"
                                  onClick={() => {
                                    setEditingUser(user);
                                    setIsEditModalOpen(true);
                                  }}
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                  <span className="text-xs font-medium">编辑</span>
                                </Button>
                              )}
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="flex items-center gap-2 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 bg-white/70 dark:bg-gray-700/70 backdrop-blur-sm border-gray-200 dark:border-gray-600 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-300 transition-all duration-200 rounded-xl px-3 py-2"
                                onClick={() => handleDeleteUser(user._id, user.name)}
                                disabled={user.role === 'superadmin'}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span className="text-xs font-medium">删除</span>
                              </Button>
                            </div>
                          </td>
                        </motion.tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </motion.div>
      </div>

      {/* 编辑用户模态框 */}
      <EditUserModal
        user={editingUser}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingUser(null);
        }}
        onUpdate={handleUpdateUser}
      />

      {/* 确认弹窗 */}
      <ConfirmModal
        {...confirmModal}
        onCancel={closeConfirm}
      />
    </div>
  );
};

export default UserManagementPage; 