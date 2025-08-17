import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft,
  User,
  Mail,
  Shield,
  Clock,
  Edit3,
  Save,
  X,
  Camera,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff,
  Download,
  Trash2,
  Crown,
  GraduationCap,
  Shield as ShieldIcon,
  Calendar,
  Activity,
  Users,
  Heart,
  UserPlus
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { authAPI } from '../../services/api';
import FavoritesModal from '../../components/social/FavoritesModal';
import FollowersModal from '../../components/social/FollowersModal';
import FollowingModal from '../../components/social/FollowingModal';
import { 
  EDUCATION_OPTIONS, 
  POSITION_OPTIONS, 
  OCCUPATION_OPTIONS, 
  INTERESTS_OPTIONS, 
  SKILLS_OPTIONS 
} from '../../constants/profileOptions';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import FuzzySelect from '../../components/ui/FuzzySelect';
import ConfirmModal from '../../components/ui/ConfirmModal';
import RightSlideModal from '../../components/ui/RightSlideModal';
import { useModal } from '../../hooks/useModal';

interface ProfileFormData {
  name: string;
  enterpriseName: string;
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
}

interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface LoginHistory {
  id: string;
  timestamp: string;
  ip: string;
  location: string;
  device: string;
  status: 'success' | 'failed';
}

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  // 弹窗状态管理
  const { 
    showDanger,
    confirmModal, 
    closeConfirm,
    showSuccessRightSlide,
    showErrorRightSlide,
    rightSlideModal,
    closeRightSlide
  } = useModal();
  
  // 表单状态
  const [profileData, setProfileData] = useState<ProfileFormData>({
    name: '',
    enterpriseName: '',
    avatar: '',
    nickname: '',
    bio: '',
    phone: '',
    location: '',
    website: '',
    birthday: '',
    gender: 'prefer-not-to-say',
    interests: [],
    skills: [],
    education: '',
    occupation: '',
    company: '',
    position: '',
    socialLinks: {
      github: '',
      linkedin: '',
      twitter: '',
      wechat: ''
    },
    preferences: {
      theme: 'auto',
      language: 'zh-CN',
      timezone: 'Asia/Shanghai',
      notifications: {
        email: true,
        push: true,
        sms: false
      }
    }
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // 密码修改状态
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState<PasswordFormData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  
  // 登录历史
  const [showLoginHistory, setShowLoginHistory] = useState(false);
  const [loginHistory, setLoginHistory] = useState<LoginHistory[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  
  // 社交功能弹窗状态
  const [showFavoritesModal, setShowFavoritesModal] = useState(false);
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [showFollowingModal, setShowFollowingModal] = useState(false);
  
  // 头像上传
  const [avatarPreview, setAvatarPreview] = useState<string>('');

  // 初始化数据
  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        enterpriseName: user.enterpriseName || '',
        avatar: user.avatar || '',
        nickname: user.nickname || '',
        bio: user.bio || '',
        phone: user.phone || '',
        location: user.location || '',
        website: user.website || '',
        birthday: user.birthday ? new Date(user.birthday).toISOString().split('T')[0] : '',
        gender: user.gender || 'prefer-not-to-say',
        interests: user.interests || [],
        skills: user.skills || [],
        education: user.education || '',
        occupation: user.occupation || '',
        company: user.company || '',
        position: user.position || '',
        socialLinks: {
          github: user.socialLinks?.github || '',
          linkedin: user.socialLinks?.linkedin || '',
          twitter: user.socialLinks?.twitter || '',
          wechat: user.socialLinks?.wechat || ''
        },
        preferences: {
          theme: user.preferences?.theme || 'auto',
          language: user.preferences?.language || 'zh-CN',
          timezone: user.preferences?.timezone || 'Asia/Shanghai',
          notifications: {
            email: user.preferences?.notifications?.email ?? true,
            push: user.preferences?.notifications?.push ?? true,
            sms: user.preferences?.notifications?.sms ?? false
          }
        }
      });
    }
  }, [user]);

  // 页面加载时获取最新用户信息
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await authAPI.getCurrentUser();
        if (response.data.success && response.data.user) {
          // 更新本地用户信息
          useAuthStore.getState().login(response.data.user, useAuthStore.getState().token!);
        }
      } catch (error: any) {
        console.error('获取用户信息失败:', error);
        // 如果获取用户信息失败，不要重定向到404，而是继续使用本地存储的用户信息
        if (error.response?.status === 401) {
          // 如果是认证错误，重定向到登录页
          navigate('/login');
        }
        // 其他错误继续使用本地用户信息
      }
    };

    fetchCurrentUser();
  }, [navigate]);

  // 获取用户角色图标
  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'superadmin':
        return <Crown className="w-4 h-4 text-yellow-600" />;
      case 'admin':
        return <ShieldIcon className="w-4 h-4 text-red-600" />;
      case 'teacher':
        return <GraduationCap className="w-4 h-4 text-blue-600" />;
      case 'student':
        return <User className="w-4 h-4 text-green-600" />;
      default:
        return <User className="w-4 h-4 text-gray-600" />;
    }
  };

  // 获取用户角色文本
  const getRoleText = (role: string) => {
    switch (role) {
      case 'superadmin':
        return '超级管理员';
      case 'admin':
        return '管理员';
      case 'teacher':
        return '教师';
      case 'student':
        return '学生';
      default:
        return '用户';
    }
  };

  // 获取用户头像
  const getUserAvatar = () => {
    // 构建完整的头像URL
    const buildAvatarUrl = (avatarPath: string) => {
      if (!avatarPath) return '';
      if (avatarPath.startsWith('http')) return avatarPath;
      if (avatarPath.startsWith('/')) {
        // 使用代理路径，因为前端配置了代理
        return `${import.meta.env.VITE_API_URL || 'https://www.mareate.com/api'}${avatarPath}`;
      }
      return avatarPath;
    };

    if (avatarPreview) return buildAvatarUrl(avatarPreview);
    if (profileData.avatar) return buildAvatarUrl(profileData.avatar);
    if (user?.avatar) return buildAvatarUrl(user.avatar);
    
    // 生成默认头像
    const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';
    return `https://ui-avatars.com/api/?name=${initials}&background=667eea&color=fff&size=128`;
  };

  // 处理头像上传
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showErrorRightSlide('文件过大', '头像文件大小不能超过5MB');
        return;
      }
      
      // 创建FormData
      const formData = new FormData();
      formData.append('avatar', file);
      
      try {
        const response = await authAPI.uploadAvatar(formData);
        
        if (response.data.success) {
          setAvatarPreview(response.data.avatarUrl || '');
          // 更新本地用户信息
          if (response.data.user) {
            useAuthStore.getState().login(response.data.user, useAuthStore.getState().token!);
          }
          showSuccessRightSlide('上传成功', '头像上传成功');
        } else {
          showErrorRightSlide('上传失败', response.data.error || '头像上传失败');
        }
      } catch (error: any) {
        console.error('头像上传失败:', error);
        showErrorRightSlide('上传失败', error.response?.data?.error || '头像上传失败');
      }
    }
  };

  // 保存个人信息
  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const response = await authAPI.updateProfile({
        name: profileData.name,
        enterpriseName: profileData.enterpriseName,
        avatar: avatarPreview || profileData.avatar,
        nickname: profileData.nickname,
        bio: profileData.bio,
        phone: profileData.phone,
        location: profileData.location,
        website: profileData.website,
        birthday: profileData.birthday ? new Date(profileData.birthday).toISOString() : undefined,
        gender: profileData.gender,
        interests: profileData.interests,
        skills: profileData.skills,
        education: profileData.education,
        occupation: profileData.occupation,
        company: profileData.company,
        position: profileData.position,
        socialLinks: profileData.socialLinks,
        preferences: profileData.preferences
      });
      
      if (response.data.success) {
        setIsEditing(false);
        // 更新本地用户信息
        if (response.data.user) {
          useAuthStore.getState().login(response.data.user, useAuthStore.getState().token!);
        }
        showSuccessRightSlide('更新成功', '个人信息更新成功');
      } else {
        showErrorRightSlide('更新失败', response.data.error || '更新失败');
      }
    } catch (error: any) {
      console.error('保存个人信息失败:', error);
      if (error.response?.data?.details) {
        const errorDetails = error.response.data.details.map((err: any) => `${err.param}: ${err.msg}`).join('\n');
        showErrorRightSlide('保存失败', `保存失败:\n${errorDetails}`);
      } else {
        showErrorRightSlide('保存失败', error.response?.data?.error || '保存失败');
      }
    } finally {
      setIsSaving(false);
    }
  };

  // 修改密码
  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showErrorRightSlide('密码错误', '新密码和确认密码不匹配');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      showErrorRightSlide('密码错误', '新密码长度至少6位');
      return;
    }

    setIsChangingPassword(true);
    try {
      const response = await authAPI.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      if (response.data.success) {
        setShowPasswordModal(false);
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        showSuccessRightSlide('修改成功', '密码修改成功，系统将自动退出登录，请使用新密码重新登录');
        
        // 强制退出登录
        setTimeout(() => {
          logout();
        }, 1500); // 延迟1.5秒让用户看到提示信息
      } else {
        showErrorRightSlide('修改失败', response.data.error || '修改失败');
      }
    } catch (error: any) {
      console.error('修改密码失败:', error);
      showErrorRightSlide('修改失败', error.response?.data?.error || '修改失败');
    } finally {
      setIsChangingPassword(false);
    }
  };

  // 获取登录历史
  const handleGetLoginHistory = async () => {
    setLoadingHistory(true);
    try {
      const response = await authAPI.getLoginHistory({ page: 1, limit: 20 });
      
      if (response.data.success && response.data.data) {
        setLoginHistory(response.data.data.history);
        setShowLoginHistory(true);
      } else {
        showErrorRightSlide('获取失败', response.data.error || '获取登录历史失败');
      }
    } catch (error: any) {
      console.error('获取登录历史失败:', error);
      showErrorRightSlide('获取失败', error.response?.data?.error || '获取登录历史失败');
    } finally {
      setLoadingHistory(false);
    }
  };

  // 导出个人数据
  const handleExportData = async () => {
    try {
      const response = await authAPI.exportUserData();
      if (response.data.success) {
        showErrorRightSlide('功能开发中', '数据导出功能开发中，敬请期待');
      } else {
        showErrorRightSlide('导出失败', response.data.error || '导出失败');
      }
    } catch (error: any) {
      console.error('导出数据失败:', error);
      showErrorRightSlide('导出失败', error.response?.data?.error || '导出失败');
    }
  };

  // 删除账户
  const handleDeleteAccount = () => {
    showDanger(
      '确定要删除账户吗？',
      '此操作不可撤销，所有数据将被永久删除。',
      () => {
        authAPI.deleteAccount().then(response => {
          if (response.data.success) {
            showSuccessRightSlide('删除成功', '账户删除成功');
            // 退出登录
            logout();
          } else {
            showErrorRightSlide('删除失败', response.data.error || '删除失败');
          }
        }).catch(error => {
          console.error('删除账户失败:', error);
          showErrorRightSlide('删除失败', error.response?.data?.error || '删除失败');
        });
      }
    );
  };

  // 格式化日期
  const formatDate = (dateString: string) => {
    if (!dateString) return '未知';
    try {
      return new Date(dateString).toLocaleString('zh-CN');
    } catch {
      return '未知';
    }
  };

  // 获取性别显示文本
  const getGenderText = (gender: string) => {
    switch (gender) {
      case 'male': return '男';
      case 'female': return '女';
      case 'other': return '其他';
      case 'prefer-not-to-say': return '不愿透露';
      default: return '不愿透露';
    }
  };

  // 标签选择组件
  const TagSelector = ({ 
    label, 
    value, 
    onChange, 
    options, 
    disabled 
  }: {
    label: string;
    value: string[];
    onChange: (value: string[]) => void;
    options: string[];
    disabled: boolean;
  }) => {
    const [showDropdown, setShowDropdown] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    const filteredOptions = options.filter(option => 
      option.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !value.includes(option)
    );

    const handleAddTag = (tag: string) => {
      if (!value.includes(tag)) {
        onChange([...value, tag]);
      }
      setSearchTerm('');
      // 保持下拉框打开，让用户可以继续添加标签
      inputRef.current?.focus();
    };

    const handleRemoveTag = (tagToRemove: string) => {
      onChange(value.filter(tag => tag !== tagToRemove));
    };

    const handleInputFocus = () => {
      setShowDropdown(true);
    };

    const handleInputBlur = () => {
      // 延迟关闭，让用户有时间点击选项
      setTimeout(() => {
        setShowDropdown(false);
      }, 200);
    };

    return (
      <div className="relative">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {label}
        </label>
        <div className="space-y-2">
          {/* 已选择的标签 */}
          {value.length > 0 && (
            <motion.div 
              className="flex flex-wrap gap-2"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              {value.map((tag, index) => (
                <motion.span
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                >
                  {tag}
                  {!disabled && (
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      ×
                    </button>
                  )}
                </motion.span>
              ))}
            </motion.div>
          )}
          
          {/* 添加标签输入框 */}
          {!disabled && (
            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
                placeholder="搜索并添加标签..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
              
              {/* 下拉选项 */}
              <AnimatePresence>
                {showDropdown && filteredOptions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-48 overflow-y-auto"
                  >
                    {filteredOptions.map((option, index) => (
                      <motion.button
                        key={option}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.1, delay: index * 0.02 }}
                        type="button"
                        onClick={() => handleAddTag(option)}
                        className="w-full px-3 py-2 text-left hover:bg-blue-50 dark:hover:bg-blue-600 focus:bg-blue-50 dark:focus:bg-blue-600 focus:outline-none transition-colors duration-150"
                      >
                        {option}
                      </motion.button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-blue-900/20 dark:to-indigo-900/20 p-6">
      <div className="max-w-7xl mx-auto">
        {/* 页面头部 */}
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-6">
            <motion.button
              onClick={() => navigate(-1)}
              className="p-3 rounded-2xl bg-bg-elevated/70 dark:bg-gray-800/70 backdrop-blur-sm hover:bg-bg-elevated/90 dark:hover:bg-gray-800/90 transition-all duration-200 shadow-lg hover:shadow-xl"
              whileHover={{ 
                scale: 1.08,
                rotate: -5,
                transition: { type: "spring", stiffness: 400, damping: 10 }
              }}
              whileTap={{ 
                scale: 0.92,
                transition: { type: "spring", stiffness: 400, damping: 10 }
              }}
            >
              <ArrowLeft className="w-6 h-6 text-text-secondary dark:text-gray-300" />
            </motion.button>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-slate-200 dark:to-slate-400 bg-clip-text text-transparent">
                个人信息
              </h1>
              <p className="text-text-secondary dark:text-gray-400 mt-1">
                管理您的账户信息和偏好设置
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左侧：基本信息及设置 */}
          <div className="lg:col-span-2 space-y-8">
            {/* 基本信息卡片 */}
            <motion.div
              whileHover={{ 
                scale: 1.02,
                transition: { type: "spring", stiffness: 300, damping: 20 }
              }}
              className="transform-gpu"
            >
              <Card className="bg-bg-elevated/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-slate-200 dark:to-slate-400 bg-clip-text text-transparent">
                      基本信息
                    </h2>
                  </div>
                  <div>
                    {!isEditing ? (
                      <motion.button
                        onClick={() => setIsEditing(true)}
                        className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-6 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                        whileHover={{ 
                          scale: 1.05,
                          transition: { type: "spring", stiffness: 400, damping: 10 }
                        }}
                        whileTap={{ 
                          scale: 0.95,
                          transition: { type: "spring", stiffness: 400, damping: 10 }
                        }}
                      >
                        <Edit3 className="w-4 h-4 mr-2" />
                        编辑
                      </motion.button>
                    ) : (
                      <div className="flex items-center gap-3">
                        <motion.button
                          onClick={handleSaveProfile}
                          disabled={isSaving}
                          className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                          whileHover={{ 
                            scale: 1.05,
                            transition: { type: "spring", stiffness: 400, damping: 10 }
                          }}
                          whileTap={{ 
                            scale: 0.95,
                            transition: { type: "spring", stiffness: 400, damping: 10 }
                          }}
                        >
                          <Save className="w-4 h-4 mr-2" />
                          {isSaving ? '保存中...' : '保存'}
                        </motion.button>
                        <motion.button
                          onClick={() => setIsEditing(false)}
                          className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                          whileHover={{ 
                            scale: 1.05,
                            transition: { type: "spring", stiffness: 400, damping: 10 }
                          }}
                          whileTap={{ 
                            scale: 0.95,
                            transition: { type: "spring", stiffness: 400, damping: 10 }
                          }}
                        >
                          <X className="w-4 h-4 mr-2" />
                          取消
                        </motion.button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-6">
                  {/* 头像 */}
                  <div className="flex items-center gap-6">
                    <div className="relative">
                      <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600">
                        <img
                          src={getUserAvatar()}
                          alt="用户头像"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      {isEditing && (
                        <label className="absolute bottom-0 right-0 w-8 h-8 bg-white dark:bg-gray-700 rounded-full shadow-lg flex items-center justify-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                          <Camera className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleAvatarChange}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{user?.name}</h3>
                      <p className="text-gray-600 dark:text-gray-400">{user?.email}</p>
                      <div className="flex items-center gap-2 mt-2">
                        {getRoleIcon(user?.role || '')}
                        <span className="text-sm text-gray-600 dark:text-gray-400">{getRoleText(user?.role || '')}</span>
                      </div>
                    </div>
                  </div>

                  {/* 表单字段 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="姓名"
                      value={profileData.name}
                      onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                      disabled={!isEditing}
                      icon={<User className="w-4 h-4" />}
                    />
                    <Input
                      label="昵称"
                      value={profileData.nickname || ''}
                      onChange={(e) => setProfileData(prev => ({ ...prev, nickname: e.target.value }))}
                      disabled={!isEditing}
                      placeholder="设置您的昵称"
                    />
                    <Input
                      label="企业名称"
                      value={profileData.enterpriseName}
                      onChange={(e) => setProfileData(prev => ({ ...prev, enterpriseName: e.target.value }))}
                      disabled={!isEditing}
                      placeholder="请输入企业名称"
                    />
                    <Input
                      label="手机号"
                      value={profileData.phone || ''}
                      onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                      disabled={!isEditing}
                      placeholder="请输入手机号"
                    />
                    <Input
                      label="邮箱"
                      value={user?.email || ''}
                      disabled
                      icon={<Mail className="w-4 h-4" />}
                      className="md:col-span-2"
                    />
                  </div>

                  {/* 扩展信息 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="所在地"
                      value={profileData.location || ''}
                      onChange={(e) => setProfileData(prev => ({ ...prev, location: e.target.value }))}
                      disabled={!isEditing}
                      placeholder="如：北京、上海"
                    />
                    <Input
                      label="个人网站"
                      value={profileData.website || ''}
                      onChange={(e) => setProfileData(prev => ({ ...prev, website: e.target.value }))}
                      disabled={!isEditing}
                      placeholder="https://your-website.com"
                    />
                  </div>

                  {/* 个人简介 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      个人简介
                    </label>
                    <textarea
                      value={profileData.bio || ''}
                      onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                      disabled={!isEditing}
                      placeholder="介绍一下自己吧..."
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 dark:disabled:bg-gray-700 disabled:text-gray-500 dark:disabled:text-gray-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 resize-none"
                      rows={3}
                      maxLength={200}
                    />
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-right">
                      {profileData.bio?.length || 0}/200
                    </div>
                  </div>

                  {/* 性别和生日 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        性别
                      </label>
                      <select
                        value={profileData.gender || 'prefer-not-to-say'}
                        onChange={(e) => setProfileData(prev => ({ ...prev, gender: e.target.value as any }))}
                        disabled={!isEditing}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 dark:disabled:bg-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                      >
                        <option value="prefer-not-to-say">{getGenderText('prefer-not-to-say')}</option>
                        <option value="male">{getGenderText('male')}</option>
                        <option value="female">{getGenderText('female')}</option>
                        <option value="other">{getGenderText('other')}</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        生日
                      </label>
                      <input
                        type="date"
                        value={profileData.birthday || ''}
                        onChange={(e) => setProfileData(prev => ({ ...prev, birthday: e.target.value }))}
                        disabled={!isEditing}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 dark:disabled:bg-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                      />
                    </div>
                  </div>

                  {/* 职业信息 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="公司"
                      value={profileData.company || ''}
                      onChange={(e) => setProfileData(prev => ({ ...prev, company: e.target.value }))}
                      disabled={!isEditing}
                      placeholder="所在公司"
                    />
                    <FuzzySelect
                      label="职位"
                      value={profileData.position || ''}
                      onChange={(value) => setProfileData(prev => ({ ...prev, position: value as string }))}
                      options={POSITION_OPTIONS.map(option => ({ value: option, label: option }))}
                      placeholder="请选择职位"
                      disabled={!isEditing}
                    />
                    <FuzzySelect
                      label="职业"
                      value={profileData.occupation || ''}
                      onChange={(value) => setProfileData(prev => ({ ...prev, occupation: value as string }))}
                      options={OCCUPATION_OPTIONS.map(option => ({ value: option, label: option }))}
                      placeholder="请选择职业"
                      disabled={!isEditing}
                    />
                    <FuzzySelect
                      label="学历"
                      value={profileData.education || ''}
                      onChange={(value) => setProfileData(prev => ({ ...prev, education: value as string }))}
                      options={EDUCATION_OPTIONS.map(option => ({ value: option, label: option }))}
                      placeholder="请选择学历"
                      disabled={!isEditing}
                    />
                  </div>

                  {/* 兴趣爱好和技能 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <TagSelector
                      label="兴趣爱好"
                      value={profileData.interests || []}
                      onChange={(value) => setProfileData(prev => ({ ...prev, interests: value }))}
                      options={INTERESTS_OPTIONS}
                      disabled={!isEditing}
                    />
                    <TagSelector
                      label="技能标签"
                      value={profileData.skills || []}
                      onChange={(value) => setProfileData(prev => ({ ...prev, skills: value }))}
                      options={SKILLS_OPTIONS}
                      disabled={!isEditing}
                    />
                  </div>

                  {/* 账户状态 */}
                  <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                    <div className="flex items-center gap-2">
                      {user?.isEmailVerified ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-yellow-600" />
                      )}
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {user?.isEmailVerified ? '邮箱已验证' : '邮箱未验证'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        注册时间：{formatDate(user?.createdAt || '')}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* 安全设置卡片 */}
            <motion.div
              whileHover={{ 
                scale: 1.02,
                transition: { type: "spring", stiffness: 300, damping: 20 }
              }}
              className="transform-gpu"
            >
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-red-600" />
                    安全设置
                  </h2>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-gray-100">账户密码</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">定期更新密码以确保账户安全</p>
                    </div>
                    <Button
                      onClick={() => setShowPasswordModal(true)}
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <Edit3 className="w-4 h-4" />
                      修改密码
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-gray-100">登录历史</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">查看最近的登录记录和安全状态</p>
                    </div>
                    <Button
                      onClick={handleGetLoginHistory}
                      loading={loadingHistory}
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <Activity className="w-4 h-4" />
                      查看记录
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* 数据管理卡片 */}
            <motion.div
              whileHover={{ 
                scale: 1.02,
                transition: { type: "spring", stiffness: 300, damping: 20 }
              }}
              className="transform-gpu"
            >
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <Download className="w-5 h-5 text-purple-600" />
                    数据管理
                  </h2>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-gray-100">导出个人数据</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">下载您的所有数据备份</p>
                    </div>
                    <Button
                      onClick={handleExportData}
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      导出数据
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-700">
                    <div>
                      <h3 className="font-medium text-red-900 dark:text-red-200">删除账户</h3>
                      <p className="text-sm text-red-600 dark:text-red-300">永久删除账户和所有相关数据</p>
                    </div>
                    <Button
                      onClick={handleDeleteAccount}
                      variant="outline"
                      className="flex items-center gap-2 text-red-600 dark:text-red-400 border-red-300 dark:border-red-600 hover:bg-red-50 dark:hover:bg-red-900/30"
                    >
                      <Trash2 className="w-4 h-4" />
                      删除账户
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>

          {/* 右侧：账户统计与社交功能 */}
          <div className="lg:col-span-1 space-y-6">
            {/* 账户统计 */}
            <motion.div
              whileHover={{ 
                scale: 1.02,
                transition: { type: "spring", stiffness: 300, damping: 20 }
              }}
              className="transform-gpu"
            >
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2 mb-4">
                  <Calendar className="w-5 h-5 text-indigo-600" />
                  账户统计
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <span className="text-gray-600 dark:text-gray-400">注册时间</span>
                    <span className="font-medium text-sm text-gray-900 dark:text-gray-100">
                      {formatDate(user?.createdAt || '')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <span className="text-gray-600 dark:text-gray-400">最后登录</span>
                    <span className="font-medium text-sm text-gray-900 dark:text-gray-100">
                      {formatDate(user?.lastLogin || '')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <span className="text-gray-600 dark:text-gray-400">账户状态</span>
                    <span className="font-medium text-green-600 dark:text-green-400 text-sm">活跃</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <span className="text-gray-600 dark:text-gray-400">用户角色</span>
                    <span className="font-medium text-sm text-gray-900 dark:text-gray-100">
                      {getRoleText(user?.role || '')}
                    </span>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* 社交功能 */}
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2 mb-4">
                <Users className="w-5 h-5 text-green-600" />
                社交功能
              </h2>
              <div className="space-y-3">
                <motion.div 
                  className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200 dark:border-green-700 hover:shadow-md transition-all duration-200 cursor-pointer"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowFavoritesModal(true)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                      <Heart className="w-4 h-4 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-gray-100">我的收藏</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">查看收藏的题目</div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {user?.favorites?.length || 0} 个
                  </div>
                </motion.div>

                <motion.div 
                  className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-700 hover:shadow-md transition-all duration-200 cursor-pointer"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowFollowersModal(true)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                      <UserPlus className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-gray-100">我的粉丝</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">查看关注我的用户</div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {user?.followers?.length || 0} 人
                  </div>
                </motion.div>

                <motion.div 
                  className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg border border-purple-200 dark:border-purple-700 hover:shadow-md transition-all duration-200 cursor-pointer"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowFollowingModal(true)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                      <Users className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-gray-100">我的关注</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">查看我关注的用户</div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {user?.following?.length || 0} 人
                  </div>
                </motion.div>
              </div>
            </Card>

            {/* 快速操作 */}
            <Card>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">快速操作</h2>
              <div className="space-y-3">
                <Button
                  onClick={() => navigate('/settings')}
                  variant="outline"
                  className="w-full flex items-center gap-2"
                >
                  <Shield className="w-4 h-4" />
                  系统设置
                </Button>
                <Button
                  onClick={() => navigate('/dashboard')}
                  variant="outline"
                  className="w-full flex items-center gap-2"
                >
                  <Activity className="w-4 h-4" />
                  返回仪表板
                </Button>
              </div>
            </Card>
          </div>
        </div>

        {/* 密码修改模态框 */}
        <AnimatePresence>
          {showPasswordModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[120] flex items-center justify-center p-4"
              onClick={() => setShowPasswordModal(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-md"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">修改密码</h3>
                  <div className="space-y-4">
                    <Input
                      label="当前密码"
                      type={showPasswords.current ? 'text' : 'password'}
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                      icon={showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      onIconClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                    />
                    <Input
                      label="新密码"
                      type={showPasswords.new ? 'text' : 'password'}
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                      icon={showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      onIconClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                    />
                    <Input
                      label="确认新密码"
                      type={showPasswords.confirm ? 'text' : 'password'}
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      icon={showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      onIconClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                    />
                  </div>
                  <div className="flex items-center gap-3 mt-6">
                    <Button
                      onClick={handleChangePassword}
                      loading={isChangingPassword}
                      className="flex-1"
                    >
                      确认修改
                    </Button>
                    <Button
                      onClick={() => setShowPasswordModal(false)}
                      variant="outline"
                      className="flex-1"
                    >
                      取消
                    </Button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 登录历史模态框 */}
        <AnimatePresence>
          {showLoginHistory && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[120] flex items-center justify-center p-4"
              onClick={() => setShowLoginHistory(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[80vh] overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold text-gray-900">登录历史</h3>
                    <button
                      onClick={() => setShowLoginHistory(false)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5 text-gray-500" />
                    </button>
                  </div>
                </div>
                <div className="p-6 overflow-y-auto max-h-[60vh]">
                  <div className="space-y-4">
                    {loginHistory.map((record) => (
                      <div key={record.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <div className="flex items-center gap-4">
                          <div className={`w-3 h-3 rounded-full ${record.status === 'success' ? 'bg-green-500' : 'bg-red-500'}`} />
                          <div>
                            <div className="font-medium text-gray-900">
                              {record.device}
                            </div>
                            <div className="text-sm text-gray-600">
                              {record.ip} • {record.location}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-900">
                            {new Date(record.timestamp).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(record.timestamp).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 社交功能弹窗 */}
        <FavoritesModal
          isOpen={showFavoritesModal}
          onClose={() => setShowFavoritesModal(false)}
        />
        
        <FollowersModal
          isOpen={showFollowersModal}
          onClose={() => setShowFollowersModal(false)}
          userId={user?._id || ''}
        />
        
        <FollowingModal
          isOpen={showFollowingModal}
          onClose={() => setShowFollowingModal(false)}
          userId={user?._id || ''}
        />

        {/* 确认弹窗 */}
        <ConfirmModal
          {...confirmModal}
          onCancel={closeConfirm}
        />

        {/* 右侧弹窗 */}
        <RightSlideModal
          {...rightSlideModal}
          onClose={closeRightSlide}
        />
      </div>
    </div>
  );
};

export default ProfilePage;