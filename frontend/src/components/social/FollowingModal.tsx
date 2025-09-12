import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UserPlus, Search, UserMinus, Mail, Calendar } from 'lucide-react';
import { authAPI } from '../../services/api';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import LoadingPage from '../ui/LoadingPage';
import type { User } from '../../types';
import { useTranslation } from '../../hooks/useTranslation';

interface FollowingModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

const FollowingModal: React.FC<FollowingModalProps> = ({ isOpen, onClose, userId }) => {
  const { t } = useTranslation();
  const [following, setFollowing] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [unfollowingId, setUnfollowingId] = useState<string | null>(null);

  // 获取关注列表
  const fetchFollowing = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await authAPI.getSocialList(userId, 'following');
      if (response.data.success && response.data.data) {
        setFollowing(response.data.data);
      } else {
        setError(response.data.error || t('social.getFollowingFailed'));
      }
    } catch (error: any) {
      // 错误日志已清理
      setError(error.response?.data?.error || t('social.getFollowingFailed'));
    } finally {
      setLoading(false);
    }
  };

  // 取消关注
  const handleUnfollow = async (targetUserId: string) => {
    setUnfollowingId(targetUserId);
    try {
      const response = await authAPI.followUser(targetUserId);
      if (response.data.success) {
        setFollowing(prev => prev.filter(user => user._id !== targetUserId));
      }
    } catch (error: any) {
      // 错误日志已清理
    } finally {
      setUnfollowingId(null);
    }
  };

  // 过滤关注列表
  const filteredFollowing = following.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.name && user.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  useEffect(() => {
    if (isOpen && userId) {
      fetchFollowing();
    }
  }, [isOpen, userId]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);



  const getRoleText = (role: string) => {
    switch (role) {
      case 'superadmin': return t('social.roles.superadmin');
      case 'admin': return t('social.roles.admin');
      case 'teacher': return t('social.roles.teacher');
      case 'student': return t('social.roles.student');
      default: return t('social.roles.user');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[120] flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 头部 */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                    <UserPlus className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">{t('social.myFollowing')}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{t('social.viewFollowingUsers')}</p>
                  </div>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                  <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                </button>
              </div>
            </div>

            {/* 搜索 */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <Input
                placeholder={t('social.searchFollowing')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                icon={<Search className="w-4 h-4" />}
              />
            </div>

            {/* 内容区域 */}
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {loading ? (
                <LoadingPage />
              ) : error ? (
                <div className="text-center py-12">
                  <UserPlus className="w-12 h-12 text-red-500 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">{error}</p>
                  <Button onClick={fetchFollowing} className="mt-4">{t('social.retry')}</Button>
                </div>
              ) : filteredFollowing.length === 0 ? (
                <div className="text-center py-12">
                  <UserPlus className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">
                    {searchTerm ? t('social.noMatchingFollowing') : t('social.noFollowing')}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredFollowing.map((user) => (
                    <Card key={user._id} className="hover:shadow-lg transition-shadow">
                      <div className="flex items-center gap-4">
                        {/* 头像 */}
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                          <span className="text-white font-semibold text-lg">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>

                        {/* 用户信息 */}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                              {user.name}
                            </h4>
                            <span className="text-xs px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 rounded-full">
                              {getRoleText(user.role)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{user.email}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              <span>{t('social.recentlyRegistered')}</span>
                            </div>
                          </div>
                        </div>

                        {/* 操作按钮 */}
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" className="flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {t('social.sendMessage')}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-1 text-red-600 dark:text-red-400 border-red-300 dark:border-red-600 hover:bg-red-50 dark:hover:bg-red-900/30"
                            onClick={() => handleUnfollow(user._id)}
                            loading={unfollowingId === user._id}
                          >
                            <UserMinus className="w-3 h-3" />
                            {t('social.unfollow')}
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* 底部统计 */}
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600 dark:text-gray-400">{t('social.totalFollowing', { count: following.length })}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{t('social.lastUpdated')}: {new Date().toLocaleDateString()}</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FollowingModal; 