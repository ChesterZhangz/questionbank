import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Users, Search, UserPlus, Mail, Calendar } from 'lucide-react';
import { authAPI } from '../../services/api';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import LoadingPage from '../ui/LoadingPage';
import type { User } from '../../types';
import { useTranslation } from '../../hooks/useTranslation';

interface FollowersModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

const FollowersModal: React.FC<FollowersModalProps> = ({ isOpen, onClose, userId }) => {
  const { t } = useTranslation();
  const [followers, setFollowers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);

  // 获取粉丝列表
  const fetchFollowers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await authAPI.getSocialList(userId, 'followers');
      if (response.data.success && response.data.data) {
        setFollowers(response.data.data);
      } else {
        setError(response.data.error || t('social.getFollowersFailed'));
      }
    } catch (error: any) {
      // 错误日志已清理
      setError(error.response?.data?.error || t('social.getFollowersFailed'));
    } finally {
      setLoading(false);
    }
  };

  // 过滤粉丝列表
  const filteredFollowers = followers.filter(follower => 
    follower.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    follower.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (follower.name && follower.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  useEffect(() => {
    if (isOpen && userId) {
      fetchFollowers();
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
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">{t('social.myFollowers')}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{t('social.viewFollowers')}</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                </button>
              </div>
            </div>

            {/* 搜索 */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <Input
                placeholder={t('social.searchFollowers')}
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
                  <Users className="w-12 h-12 text-red-500 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">{error}</p>
                  <Button
                    onClick={fetchFollowers}
                    className="mt-4"
                  >
                    {t('social.retry')}
                  </Button>
                </div>
              ) : filteredFollowers.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">
                    {searchTerm ? t('social.noMatchingFollowers') : t('social.noFollowers')}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredFollowers.map((follower) => (
                    <Card key={follower._id} className="hover:shadow-lg transition-shadow">
                      <div className="flex items-center gap-4">
                        {/* 头像 */}
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                          <span className="text-white font-semibold text-lg">
                            {follower.name.charAt(0).toUpperCase()}
                          </span>
                        </div>

                        {/* 用户信息 */}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                              {follower.name}
                            </h4>
                            <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-full">
                              {getRoleText(follower.role)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{follower.email}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              <span>{t('social.recentlyRegistered')}</span>
                            </div>
                          </div>
                        </div>

                        {/* 操作按钮 */}
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-1"
                          >
                            <Mail className="w-3 h-3" />
                            {t('social.sendMessage')}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-1"
                          >
                            <UserPlus className="w-3 h-3" />
                            {t('social.follow')}
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
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('social.totalFollowers', { count: followers.length })}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {t('social.lastUpdated')}: {new Date().toLocaleDateString()}
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FollowersModal; 