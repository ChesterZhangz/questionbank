import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft,
  User,
  Clock,
  Edit3,
  Save,
  X,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff,
  Crown,
  Shield as ShieldIcon,
  Users,
  Heart,
  UserPlus,
  GraduationCap,
  Building2,
  Mail,
  Calendar,
  Globe,
  Bell,
  Settings,
  Lock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { enterpriseService } from '../../services/enterpriseService';
import { userProfileAPI, vcountAPI } from '../../services/api';
import FavoritesModal from '../../components/social/FavoritesModal';
import FollowersModal from '../../components/social/FollowersModal';
import FollowingModal from '../../components/social/FollowingModal';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { useModal } from '../../hooks/useModal';
import { useUserAvatar } from '../../hooks/useUserAvatar';
import { useTranslation } from '../../hooks/useTranslation';
import { 
  getUserTimezone, 
  getSupportedTimezones, 
  getUserLocationAndTimezone,
  formatTimezoneName
} from '../../utils/timezoneUtils';
import { SimpleSelect } from '../../components/ui/menu';
import LoadingPage from '../../components/ui/LoadingPage';
import Avatar from '../../components/ui/Avatar';

interface ProfileFormData {
  name: string;
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

interface VCountInfo {
  balance: number;
  totalRecharged: number;
  totalSpent: number;
  lastRechargeDate?: string;
  transactionCount: number;
}

interface EnterpriseInfo {
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

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { showSuccessRightSlide, showErrorRightSlide } = useModal();
  const { src: userAvatarSrc } = useUserAvatar();
  const { t } = useTranslation();
  
  // 表单状态
  const [profileData, setProfileData] = useState<ProfileFormData>({
    name: '',
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
  
  const [passwordData, setPasswordData] = useState<PasswordFormData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // UI状态
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // 企业信息
  const [enterpriseInfo, setEnterpriseInfo] = useState<EnterpriseInfo | null>(null);
  const [isLoadingEnterprise, setIsLoadingEnterprise] = useState(false);
  
  // VCount货币信息
  const [vcountInfo, setVcountInfo] = useState<VCountInfo | null>(null);
  const [isLoadingVCount, setIsLoadingVCount] = useState(false);

  // 加载状态
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);

  // 时区相关
  const [supportedTimezones, setSupportedTimezones] = useState<Array<{ value: string; label: string }>>([]);

  // 社交功能状态
  const [showFavorites, setShowFavorites] = useState(false);
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);

  // 初始化表单数据
  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        preferences: {
          theme: user.preferences?.theme || 'auto',
          language: user.preferences?.language || 'zh-CN',
          timezone: user.preferences?.timezone || getUserTimezone(),
          notifications: {
            email: user.preferences?.notifications?.email ?? true,
            push: user.preferences?.notifications?.push ?? true,
            sms: user.preferences?.notifications?.sms ?? false
          }
        }
      });
    }
  }, [user]);

  // 加载时区数据
  useEffect(() => {
    setSupportedTimezones(getSupportedTimezones());
  }, []);



  // 加载用户资料
  const loadUserProfile = async () => {
    try {
      setIsLoadingProfile(true);
      const response = await userProfileAPI.getProfile();
      if (response.data?.success) {
        const profileUser = response.data.user;
        setProfileData({
          name: profileUser.name || '',
          preferences: {
            theme: profileUser.preferences?.theme || 'auto',
            language: profileUser.preferences?.language || 'zh-CN',
            timezone: profileUser.preferences?.timezone || getUserTimezone(),
            notifications: {
              email: profileUser.preferences?.notifications?.email ?? true,
              push: profileUser.preferences?.notifications?.push ?? true,
              sms: profileUser.preferences?.notifications?.sms ?? false
            }
          }
        });
      }
    } catch (error) {
      // 如果API调用失败，使用本地用户数据
      if (user) {
        setProfileData({
          name: user.name || '',
          preferences: {
            theme: user.preferences?.theme || 'auto',
            language: user.preferences?.language || 'zh-CN',
            timezone: user.preferences?.timezone || getUserTimezone(),
            notifications: {
              email: user.preferences?.notifications?.email ?? true,
              push: user.preferences?.notifications?.push ?? true,
              sms: user.preferences?.notifications?.sms ?? false
            }
          }
        });
      }
    } finally {
      setIsLoadingProfile(false);
    }
  };

  // 加载企业信息
  const loadEnterpriseInfo = async () => {
    if (!user?.enterpriseId) {
      setIsLoadingEnterprise(false);
        return;
      }
      
      try {
      setIsLoadingEnterprise(true);
      const response = await enterpriseService.getMyEnterpriseInfo();
        if (response.data.success) {
        setEnterpriseInfo(response.data);
      }
    } catch (error) {
      // 企业信息加载失败，静默处理
    } finally {
      setIsLoadingEnterprise(false);
    }
  };

  // 加载VCount货币信息
  const loadVCountInfo = async () => {
    try {
      setIsLoadingVCount(true);
      const response = await vcountAPI.getBalance();
      if (response.data.success) {
        setVcountInfo(response.data.data);
      }
    } catch (error) {
      // VCount信息加载失败，静默处理
    } finally {
      setIsLoadingVCount(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadUserProfile();
      loadEnterpriseInfo();
      loadVCountInfo();
    }
  }, [user]);

  // 保存个人资料
  const handleSaveProfile = async () => {
    try {
      setIsLoading(true);
      const response = await userProfileAPI.updateProfile(profileData);
      if (response.data?.success) {
        // 更新本地用户数据
        if (user) {
          // 这里需要调用authStore的updateUser方法
          // const updatedUser = { ...user, ...response.data.user };
          // updateUser(updatedUser);
        }
        setIsEditingProfile(false);
        showSuccessRightSlide(t('profile.success.saveSuccess'), t('profile.success.profileUpdated'));
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || t('profile.errors.profileUpdateError');
      showErrorRightSlide(t('profile.errors.saveFailed'), errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // 修改密码
  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showErrorRightSlide(t('profile.errors.passwordMismatch'), t('profile.errors.passwordMismatchMessage'));
      return;
    }

    try {
      setIsLoading(true);
      const response = await userProfileAPI.changePassword(passwordData);
      if (response.data?.success) {
        setIsChangingPassword(false);
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        showSuccessRightSlide(t('profile.success.passwordChanged'), t('profile.success.passwordUpdated'));
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || t('profile.errors.passwordChangeError');
      showErrorRightSlide(t('profile.errors.passwordChangeFailed'), errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // 取消编辑
  const handleCancelEdit = () => {
    if (user) {
      setProfileData({
        name: user.name || '',
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
    setIsEditingProfile(false);
  };

  // 获取角色显示名称
  const getRoleDisplayName = (role: string) => {
    const roleNames: { [key: string]: string } = {
      'superadmin': t('profile.roles.superadmin'),
      'admin': t('profile.roles.admin'),
      'teacher': t('profile.roles.teacher'),
      'student': t('profile.roles.student')
    };
    return roleNames[role] || role;
  };

  // 获取角色图标
  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'superadmin':
        return <Crown className="w-4 h-4 text-yellow-500" />;
      case 'admin':
        return <ShieldIcon className="w-4 h-4 text-blue-500" />;
      case 'teacher':
        return <GraduationCap className="w-4 h-4 text-green-500" />;
      case 'student':
        return <User className="w-4 h-4 text-purple-500" />;
      default:
        return <User className="w-4 h-4 text-gray-500" />;
    }
  };

  // 获取状态图标和颜色
  const getStatusIcon = (isActive: boolean) => {
    if (isActive) {
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
    return <AlertCircle className="w-4 h-4 text-red-500" />;
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';
  };

  // 检测用户位置并推荐时区
  const handleDetectLocation = async () => {
    try {
      setIsDetectingLocation(true);
      const result = await getUserLocationAndTimezone();
      
      if (result.timezone) {
        setProfileData(prev => ({
          ...prev,
          preferences: {
            ...prev.preferences,
            timezone: result.timezone
          }
        }));
        
        if (result.city && result.country) {
          showSuccessRightSlide(t('profile.success.locationDetected'), t('profile.success.locationDetectedWithCity', { country: result.country, city: result.city, timezone: formatTimezoneName(result.timezone) }));
        } else {
          showSuccessRightSlide(t('profile.success.locationDetected'), t('profile.success.locationDetectedWithoutCity', { timezone: formatTimezoneName(result.timezone) }));
        }
      }
    } catch (error) {
      showErrorRightSlide(t('profile.errors.locationFailed'), t('profile.errors.locationFailedMessage'));
    } finally {
      setIsDetectingLocation(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-blue-900/20 dark:to-indigo-900/20 flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">{t('profile.loading')}</p>
        </motion.div>
      </div>
    );
  }

  // 如果正在加载数据，显示加载页面
  if (isLoadingProfile || isLoadingVCount || isLoadingEnterprise) {
    return (
      <LoadingPage 
        type="loading"
        title={t('profile.loadingProfile')}
        description={t('profile.loadingProfileDescription')}
        animation="shimmer"
      />
    );
  }

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
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(-1)}
              className="p-3 rounded-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 hover:bg-white dark:hover:bg-gray-700 hover:shadow-lg transition-all duration-200"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </motion.button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{t('profile.pageTitle')}</h1>
              <p className="text-gray-600 dark:text-gray-400">{t('profile.pageDescription')}</p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* 左侧：用户信息卡片 */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="xl:col-span-1"
          >
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl sticky top-6">
              <div className="p-6 text-center">
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="mx-auto mb-4 flex items-center justify-center"
                >
                  <Avatar
                    src={userAvatarSrc}
                    name={user.name}
                    size="2xl"
                    shape="circle"
                    className="shadow-lg"
                  />
                </motion.div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">
                  {user.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {user.email}
                </p>
                <div className="flex items-center justify-center gap-2 mb-4">
                  {getRoleIcon(user.role)}
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {getRoleDisplayName(user.role)}
                  </span>
                </div>
                {/* 账户状态 */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="mt-4 space-y-2"
                >
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">{t('profile.accountStatus')}</span>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(user.isActive)}
                      <span className={getStatusColor(user.isActive)}>
                        {user.isActive ? t('profile.normal') : t('profile.disabled')}
                      </span>
                    </div>
                  </div>

                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">{t('profile.emailVerification')}</span>
                    <div className="flex items-center gap-2">
                      {user.isEmailVerified ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-yellow-500" />
                      )}
                      <span className={user.isEmailVerified ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'}>
                        {user.isEmailVerified ? t('profile.verified') : t('profile.unverified')}
                      </span>
                    </div>
                  </div>
            </motion.div>



                {/* 时间信息 */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="mt-4 space-y-2 text-sm text-gray-600 dark:text-gray-400"
                >
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{t('profile.registrationTime')}：{new Date(user.createdAt).toLocaleDateString('zh-CN')}</span>
                  </div>
                  {user.lastLogin && (
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>{t('profile.lastLogin')}：{new Date(user.lastLogin).toLocaleDateString('zh-CN')}</span>
                    </div>
                  )}
                </motion.div>

                {/* VCount货币系统 - 重新设计 */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="mt-6"
                >
                  <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-900/30 dark:via-purple-900/30 dark:to-pink-900/30 border border-indigo-200/50 dark:border-indigo-700/50">
                    {/* 装饰性背景元素 */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 dark:via-white/5 to-transparent transform -skew-x-12 translate-x-[-100%] animate-pulse"></div>
                    
                    <div className="relative p-4">
                      {/* 标题区域 */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full animate-pulse"></div>
                          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{t('profile.vcount')}</span>
                        </div>
                        <div className="w-6 h-6 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
                          <span className="text-xs font-bold text-white">V</span>
                        </div>
                      </div>

                      {/* 余额显示 */}
                      {isLoadingVCount ? (
                        <div className="flex items-center justify-center py-6">
                  <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-8 h-8 border-2 border-indigo-300 border-t-indigo-600 rounded-full"
                          />
                        </div>
                      ) : vcountInfo ? (
                        <div className="space-y-3">
                          {/* 主要余额 */}
                          <div className="text-center">
                            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('profile.currentBalance')}</div>
                            <motion.div
                              initial={{ scale: 0.8, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                              className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"
                            >
                              {vcountInfo.balance.toFixed(2)}
                            </motion.div>
                          </div>

                          {/* 统计信息网格 */}
                          <div className="grid grid-cols-2 gap-3 text-xs">
                            <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.3 }}
                              className="text-center p-2 bg-white/50 dark:bg-white/10 rounded-lg"
                            >
                              <div className="text-gray-500 dark:text-gray-400 mb-1">{t('profile.totalRecharged')}</div>
                              <div className="font-semibold text-green-600 dark:text-green-400">
                                {vcountInfo.totalRecharged.toFixed(2)}
                              </div>
                  </motion.div>
                            
                            <motion.div
                              initial={{ opacity: 0, x: 10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.4 }}
                              className="text-center p-2 bg-white/50 dark:bg-white/10 rounded-lg"
                            >
                              <div className="text-gray-500 dark:text-gray-400 mb-1">{t('profile.totalSpent')}</div>
                              <div className="font-semibold text-red-600 dark:text-red-400">
                                {vcountInfo.totalSpent.toFixed(2)}
            </div>
                            </motion.div>
                          </div>

                          {/* 交易信息 */}
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-200/50 dark:border-gray-700/50"
                          >
                            <span>{t('profile.transactionCount')}：{vcountInfo.transactionCount}</span>
                            {vcountInfo.lastRechargeDate && (
                              <span>{new Date(vcountInfo.lastRechargeDate).toLocaleDateString('zh-CN')}</span>
                            )}
                          </motion.div>
        </div>
                      ) : (
                        <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                          <div className="w-8 h-8 mx-auto mb-2 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
                          <div className="text-xs">{t('profile.loadFailed')}</div>
      </div>
                      )}

                      {/* 充值按钮 */}
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="mt-4"
                      >
            <motion.button
              whileHover={{ 
                            scale: 1.02,
                            boxShadow: "0 10px 25px rgba(99, 102, 241, 0.3)"
                          }}
                          whileTap={{ scale: 0.98 }}
                          className="w-full py-2.5 px-4 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white text-sm font-medium rounded-lg transition-all duration-300 transform"
                        >
                          {t('profile.rechargeVCount')}
            </motion.button>
                      </motion.div>
            </div>
          </div>
                </motion.div>
        </div>
            </Card>
          </motion.div>

          {/* 右侧：主要内容区域 */}
          <div className="xl:col-span-3 space-y-6">
            {/* 基本信息卡片 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                      <User className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">{t('profile.basicInfo')}</h2>
                      {isLoadingProfile && (
                        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
                          {t('profile.loading')}
                    </div>
                      )}
                  </div>
                    {!isEditingProfile ? (
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                          onClick={() => setIsEditingProfile(true)}
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-2"
                          disabled={isLoadingProfile}
                        >
                          <Edit3 className="w-4 h-4" />
                          {t('profile.edit')}
                        </Button>
                      </motion.div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Button
                          onClick={handleSaveProfile}
                            disabled={isLoading}
                            size="sm"
                            className="flex items-center gap-2"
                          >
                            {isLoading ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            ) : (
                              <Save className="w-4 h-4" />
                            )}
                            {t('profile.save')}
                          </Button>
                        </motion.div>
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Button
                            onClick={handleCancelEdit}
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-2"
                          >
                            <X className="w-4 h-4" />
                            {t('profile.cancel')}
                          </Button>
                        </motion.div>
                      </div>
                    )}
                </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* 姓名 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t('profile.name')}
                        </label>
                      {isEditingProfile ? (
                    <Input
                      value={profileData.name}
                          onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                          placeholder={t('profile.enterName')}
                        />
                      ) : (
                        <p className="text-gray-900 dark:text-gray-100 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          {user.name}
                        </p>
                      )}
                  </div>

                    {/* 邮箱 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t('profile.email')}
                    </label>
                      <p className="text-gray-900 dark:text-gray-100 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-500" />
                        {user.email}
                      </p>
                  </div>

                    {/* 企业名称（只读） */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t('profile.enterpriseName')}
                      </label>
                      <p className="text-gray-900 dark:text-gray-100 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-gray-500" />
                        {enterpriseInfo?.enterprise.name || user.enterpriseName || t('profile.notJoinedEnterprise')}
                      </p>
                    </div>

                    {/* 角色 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t('profile.role')}
                      </label>
                      <p className="text-gray-900 dark:text-gray-100 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg flex items-center gap-2">
                        {getRoleIcon(user.role)}
                        {getRoleDisplayName(user.role)}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* 偏好设置卡片 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl">
                <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <Settings className="w-6 h-6 text-green-600 dark:text-green-400" />
                      <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">{t('profile.preferences')}</h2>
                </div>
                    {!isEditingProfile ? (
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                          onClick={() => setIsEditingProfile(true)}
                      variant="outline"
                          size="sm"
                      className="flex items-center gap-2"
                    >
                      <Edit3 className="w-4 h-4" />
                          {t('profile.edit')}
                    </Button>
                      </motion.div>
                    ) : null}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* 主题 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t('profile.theme')}
                      </label>
                      {isEditingProfile ? (
                        <SimpleSelect
                          options={[
                            { value: 'auto', label: t('profile.themes.auto') },
                            { value: 'light', label: t('profile.themes.light') },
                            { value: 'dark', label: t('profile.themes.dark') }
                          ]}
                          value={profileData.preferences?.theme || 'auto'}
                          onChange={(value) => setProfileData({
                            ...profileData,
                            preferences: {
                              ...profileData.preferences,
                              theme: value as 'light' | 'dark' | 'auto'
                            }
                          })}
                          placeholder={t('profile.theme')}
                      variant="outline"
                          size="md"
                          theme="blue"
                        />
                      ) : (
                        <p className="text-gray-900 dark:text-gray-100 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          {profileData.preferences?.theme === 'auto' ? t('profile.themes.auto') : 
                           profileData.preferences?.theme === 'light' ? t('profile.themes.light') : t('profile.themes.dark')}
                        </p>
                      )}
                  </div>

                    {/* 语言 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t('profile.language')}
                      </label>
                      {isEditingProfile ? (
                        <SimpleSelect
                          options={[
                            { value: 'zh-CN', label: t('profile.languages.zh-CN') },
                            { value: 'en-US', label: t('profile.languages.en-US') }
                          ]}
                          value={profileData.preferences?.language || 'zh-CN'}
                          onChange={(value) => setProfileData({
                            ...profileData,
                            preferences: {
                              ...profileData.preferences,
                              language: value as 'zh-CN' | 'en-US'
                            }
                          })}
                          placeholder={t('profile.language')}
                      variant="outline"
                          size="md"
                          theme="blue"
                        />
                      ) : (
                        <p className="text-gray-900 dark:text-gray-100 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          {profileData.preferences?.language === 'zh-CN' ? t('profile.languages.zh-CN') : t('profile.languages.en-US')}
                        </p>
                      )}
                  </div>

                    {/* 时区 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t('profile.timezone')}
                      </label>
                      {isEditingProfile ? (
                        <div className="space-y-3">
                          <div className="flex gap-2">
                            <SimpleSelect
                              options={supportedTimezones}
                              value={profileData.preferences?.timezone || getUserTimezone()}
                              onChange={(value) => setProfileData({
                                ...profileData,
                                preferences: {
                                  ...profileData.preferences,
                                  timezone: value as string
                                }
                              })}
                              placeholder={t('profile.selectTimezone')}
                      variant="outline"
                              size="md"
                              theme="blue"
                              className="flex-1"
                            />
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={handleDetectLocation}
                              disabled={isDetectingLocation}
                              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors flex items-center gap-2"
                            >
                              {isDetectingLocation ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              ) : (
                                <Globe className="w-4 h-4" />
                              )}
                              {isDetectingLocation ? t('profile.detecting') : t('profile.detectLocation')}
                            </motion.button>
                  </div>
                          
                </div>
                      ) : (
                        <div className="space-y-2">
                          <p className="text-gray-900 dark:text-gray-100 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg flex items-center gap-2">
                            <Globe className="w-4 h-4 text-gray-500" />
                            {formatTimezoneName(profileData.preferences?.timezone || getUserTimezone())}
                          </p>

                        </div>
                      )}
          </div>

                    {/* 通知设置 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t('profile.notifications')}
                      </label>
                      <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                            <Bell className="w-4 h-4" />
                            {t('profile.emailNotifications')}
                    </span>
                          {isEditingProfile ? (
                            <input
                              type="checkbox"
                              checked={profileData.preferences?.notifications?.email ?? true}
                              onChange={(e) => setProfileData({
                                ...profileData,
                                preferences: {
                                  ...profileData.preferences,
                                  notifications: {
                                    ...profileData.preferences?.notifications,
                                    email: e.target.checked
                                  }
                                }
                              })}
                              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                            />
                          ) : (
                            <span className={`text-sm ${profileData.preferences?.notifications?.email ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                              {profileData.preferences?.notifications?.email ? t('profile.enabled') : t('profile.disabledSetting')}
                    </span>
                          )}
                  </div>
                  </div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* 密码修改卡片 */}
                <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                      <Lock className="w-6 h-6 text-red-600 dark:text-red-400" />
                      <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">{t('profile.passwordChange')}</h2>
                    </div>
                    {!isChangingPassword ? (
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                          onClick={() => setIsChangingPassword(true)}
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-2"
                        >
                          <Edit3 className="w-4 h-4" />
                          {t('profile.changePassword')}
                        </Button>
                </motion.div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                            onClick={handleChangePassword}
                            disabled={isLoading}
                            size="sm"
                            className="flex items-center gap-2"
                          >
                            {isLoading ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            ) : (
                              <Save className="w-4 h-4" />
                            )}
                            {t('profile.confirmChange')}
                </Button>
                        </motion.div>
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                            onClick={() => {
                              setIsChangingPassword(false);
                              setPasswordData({
                                currentPassword: '',
                                newPassword: '',
                                confirmPassword: ''
                              });
                            }}
                  variant="outline"
                            size="sm"
                            className="flex items-center gap-2"
                >
                            <X className="w-4 h-4" />
                            {t('profile.cancel')}
                </Button>
                        </motion.div>
              </div>
                    )}
        </div>

        <AnimatePresence>
                    {isChangingPassword ? (
            <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-4 overflow-hidden"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              {t('profile.currentPassword')}
                            </label>
                            <div className="relative">
                    <Input
                                type={showPassword ? 'text' : 'password'}
                      value={passwordData.currentPassword}
                                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                placeholder={t('profile.enterCurrentPassword')}
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                              >
                                {showPassword ? (
                                  <EyeOff className="h-5 w-5 text-gray-400" />
                                ) : (
                                  <Eye className="h-5 w-5 text-gray-400" />
                                )}
                              </button>
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              {t('profile.newPassword')}
                            </label>
                            <div className="relative">
                    <Input
                                type={showNewPassword ? 'text' : 'password'}
                      value={passwordData.newPassword}
                                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                placeholder={t('profile.enterNewPassword')}
                              />
                              <button
                                type="button"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                              >
                                {showNewPassword ? (
                                  <EyeOff className="h-5 w-5 text-gray-400" />
                                ) : (
                                  <Eye className="h-5 w-5 text-gray-400" />
                                )}
                              </button>
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            {t('profile.confirmNewPassword')}
                          </label>
                          <div className="relative">
                    <Input
                              type={showConfirmPassword ? 'text' : 'password'}
                      value={passwordData.confirmPassword}
                              onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                              placeholder={t('profile.enterNewPasswordAgain')}
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            >
                              {showConfirmPassword ? (
                                <EyeOff className="h-5 w-5 text-gray-400" />
                              ) : (
                                <Eye className="h-5 w-5 text-gray-400" />
                              )}
                            </button>
                  </div>
                </div>
              </motion.div>
                    ) : (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-gray-600 dark:text-gray-400 text-center py-8"
                      >
                        {t('profile.passwordSecurityTip')}
                      </motion.p>
          )}
        </AnimatePresence>
                </div>
              </Card>
            </motion.div>

            {/* 社交功能卡片 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl">
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">{t('profile.socialFeatures')}</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <motion.button
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowFavorites(true)}
                      className="p-4 rounded-xl bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border border-red-200 dark:border-red-800 hover:shadow-lg transition-all duration-200"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <Heart className="w-6 h-6 text-red-500" />
                        <span className="font-medium text-red-700 dark:text-red-300">{t('profile.favoriteQuestions')}</span>
                      </div>
                      <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                        {user.favorites?.length || 0}
                      </p>
                      <p className="text-sm text-red-600 dark:text-red-400">{t('profile.favorites')}</p>
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowFollowers(true)}
                      className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 hover:shadow-lg transition-all duration-200"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <Users className="w-6 h-6 text-blue-500" />
                        <span className="font-medium text-blue-700 dark:text-blue-300">{t('profile.followers')}</span>
                  </div>
                      <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {user.followers?.length || 0}
                      </p>
                      <p className="text-sm text-blue-600 dark:text-blue-400">{t('profile.followersCount')}</p>
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowFollowing(true)}
                      className="p-4 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 hover:shadow-lg transition-all duration-200"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <UserPlus className="w-6 h-6 text-green-500" />
                        <span className="font-medium text-green-700 dark:text-green-300">{t('profile.following')}</span>
                </div>
                      <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {user.following?.length || 0}
                      </p>
                      <p className="text-sm text-green-600 dark:text-green-400">{t('profile.followingCount')}</p>
                    </motion.button>
                            </div>
                            </div>
              </Card>
            </motion.div>
                          </div>
                        </div>
                          </div>

      {/* 模态框 */}
        <FavoritesModal
        isOpen={showFavorites}
        onClose={() => setShowFavorites(false)}
        />
        
        <FollowersModal
        isOpen={showFollowers}
        onClose={() => setShowFollowers(false)}
        userId={user._id}
        />
        
        <FollowingModal
        isOpen={showFollowing}
        onClose={() => setShowFollowing(false)}
        userId={user._id}
      />
    </div>
  );
};

export default ProfilePage;