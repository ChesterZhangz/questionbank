import React, { useState, useEffect } from 'react';
import { useNavigate} from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Plus, 
  BookOpen, 
  Users, 
  Calendar, 
  MoreVertical,
  Edit,
  Trash2,
  Eye
} from 'lucide-react';
import { questionBankAPI } from '../../services/api';
import { useAuthStore } from '../../stores/authStore';
import type { QuestionBank } from '../../types';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import DynamicStats from '../../components/ui/DynamicStats';
import LoadingPage from '../../components/ui/LoadingPage';
import ConfirmModal from '../../components/ui/ConfirmModal';
import RightSlideModal from '../../components/ui/RightSlideModal';
import { useModal } from '../../hooks/useModal';
import { getUserRoleStats } from '../../utils/statsUtils';

const QuestionBankListPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  // 弹窗状态管理
  const { 
    showConfirm, 
    confirmModal, 
    closeConfirm,
    showErrorRightSlide,
    rightSlideModal,
    closeRightSlide
  } = useModal();
  const [questionBanks, setQuestionBanks] = useState<QuestionBank[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchQuestionBanks();
  }, []);

  // 监听题目删除事件，更新统计数据
  useEffect(() => {
    const handleQuestionDeleted = (event: CustomEvent) => {
      console.log('题库列表页面收到题目删除事件:', event.detail);
      // 当题目被删除时，重新获取题库数据以更新统计数据
      fetchQuestionBanks();
    };

    window.addEventListener('questionDeleted', handleQuestionDeleted as EventListener);
    
    return () => {
      window.removeEventListener('questionDeleted', handleQuestionDeleted as EventListener);
    };
  }, []);

  const fetchQuestionBanks = async () => {
    try {
      setLoading(true);
      const response = await questionBankAPI.getQuestionBanks();
      if (response.data.success) {
        setQuestionBanks(response.data.questionBanks || []);
      } else {
        setError(response.data.error || '获取题库列表失败');
      }
    } catch (error: any) {
      setError(error.response?.data?.error || '获取题库列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBank = () => {
    navigate('/question-banks/create');
  };

  const handleViewBank = (bid: string) => {
    navigate(`/question-banks/${bid}`);
  };

  const handleEditBank = (bid: string) => {
    navigate(`/question-banks/${bid}/edit`);
  };

  const handleManageMembers = (bid: string) => {
    navigate(`/question-banks/${bid}/members`);
  };

  const handleDeleteBank = async (bid: string) => {
    showConfirm(
      '确认删除',
      '确定要删除这个题库吗？删除后无法恢复。',
      async () => {
        try {
          const response = await questionBankAPI.deleteQuestionBank(bid);
          if (response.data.success) {
            setQuestionBanks(prev => prev.filter(bank => bank.bid !== bid));
          } else {
            showErrorRightSlide('删除失败', response.data.error || '删除失败');
          }
        } catch (error: any) {
          showErrorRightSlide('删除失败', error.response?.data?.error || '删除失败');
        }
      }
    );
  };

  const getUserRole = (bank: QuestionBank) => {
    // 转换为字符串进行比较，避免ObjectId类型问题
    const userId = user?._id?.toString();
    const creatorId = bank.creator._id?.toString();
    
    if (creatorId === userId) return '创建者';
    if (bank.managers.some(m => m._id?.toString() === userId)) return '管理者';
    if (bank.collaborators.some(c => c._id?.toString() === userId)) return '协作者';
    return '查看者';
  };

  // 计算用户角色统计
  const userRoleStats = getUserRoleStats(questionBanks, user?._id || '');

  if (loading) {
    return <LoadingPage />;
  }

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* 头部 */}
      <div className="sticky top-0 z-30 bg-bg-elevated/80 backdrop-blur-md border-b border-border-primary shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
                          <h1 className="text-3xl font-bold bg-gradient-to-r from-text-primary to-blue-600 bg-clip-text text-transparent">
              我的题库
            </h1>
              <p className="text-text-secondary mt-1">管理您的数学题库</p>
            </div>
            <motion.div 
              className="flex items-center space-x-4"
              layout
            >
              {/* 题库统计面板 */}
              <motion.div 
                className="flex items-center space-x-3"
                layout
              >
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ 
                    duration: 0.4,
                    delay: 0.1,
                    ease: [0.25, 0.1, 0.25, 1]
                  }}
                  className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl px-4 py-2 border border-blue-200 dark:border-blue-700 shadow-sm hover:shadow-md transition-shadow duration-200"
                >
                  <motion.div 
                    className="flex items-center space-x-2"
                    layout
                  >
                    <motion.div 
                      className="w-2 h-2 bg-blue-500 rounded-full"
                      animate={{ 
                        scale: [1, 1.2, 1],
                        opacity: [0.7, 1, 0.7]
                      }}
                      transition={{ 
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                    <motion.span 
                      className="text-sm font-medium text-blue-700 dark:text-blue-300"
                      layout
                      key={`total-${questionBanks.length}`}
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ 
                        duration: 0.3,
                        ease: "easeOut"
                      }}
                    >
                      总题库: {questionBanks.length} 个
                    </motion.span>
                  </motion.div>
                </motion.div>
                
                {/* 动态显示用户角色统计 */}
                <DynamicStats stats={userRoleStats} maxItems={2} />
              </motion.div>

              {/* 创建题库按钮 */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.4 }}
              >
                <Button
                  onClick={handleCreateBank}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  创建题库
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* 内容区域 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6"
          >
            <p className="text-red-600 dark:text-red-300">{error}</p>
          </motion.div>
        )}

        {questionBanks.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12"
          >
            <BookOpen className="w-16 h-16 text-text-tertiary mx-auto mb-4" />
            <h3 className="text-lg font-medium text-text-primary mb-2">还没有题库</h3>
            <p className="text-text-secondary mb-6">创建您的第一个题库，开始管理数学题目</p>
            <Button
              onClick={handleCreateBank}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              创建题库
            </Button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {questionBanks.map((bank, index) => (
              <motion.div
                key={bank.bid}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <div className="p-6">
                    {/* 题库头部 */}
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-text-primary mb-1">
                          {bank.name}
                        </h3>
                        <p className="text-sm text-text-tertiary">
                          {getUserRole(bank)} • {bank.category || '未分类'}
                        </p>
                      </div>
                      <div className="relative group">
                        <Button
                          variant="outline"
                          size="sm"
                          className="p-1"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                        {/* 下拉菜单 */}
                        <div className="absolute right-0 mt-2 w-48 bg-bg-elevated rounded-md shadow-lg border border-border-primary z-10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                          <div className="py-1">
                            <button
                              onClick={() => handleViewBank(bank.bid)}
                              className="flex items-center w-full px-4 py-2 text-sm text-text-primary hover:bg-bg-secondary"
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              查看题库
                            </button>
                            {(bank.creator._id === user?._id || bank.managers.some(m => m._id === user?._id)) && (
                              <>
                                <button
                                  onClick={() => handleEditBank(bank.bid)}
                                  className="flex items-center w-full px-4 py-2 text-sm text-text-primary hover:bg-bg-secondary"
                                >
                                  <Edit className="w-4 h-4 mr-2" />
                                  编辑题库
                                </button>
                                <button
                                  onClick={() => handleManageMembers(bank.bid)}
                                  className="flex items-center w-full px-4 py-2 text-sm text-text-primary hover:bg-bg-secondary"
                                >
                                  <Users className="w-4 h-4 mr-2" />
                                  成员管理
                                </button>
                              </>
                            )}
                            {bank.creator._id === user?._id && (
                              <button
                                onClick={() => handleDeleteBank(bank.bid)}
                                className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                删除题库
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 题库描述 */}
                    {bank.description && (
                      <p className="text-text-secondary text-sm mb-4 line-clamp-2">
                        {bank.description}
                      </p>
                    )}

                    {/* 题库标签 */}
                    {bank.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {bank.tags.slice(0, 3).map((tag, tagIndex) => (
                          <span
                            key={tagIndex}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                          >
                            {tag}
                          </span>
                        ))}
                        {bank.tags.length > 3 && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-bg-secondary text-text-tertiary">
                            +{bank.tags.length - 3}
                          </span>
                        )}
                      </div>
                    )}

                    {/* 题库统计 */}
                    <div className="flex items-center justify-between text-sm text-text-tertiary">
                      <div className="flex items-center">
                        <BookOpen className="w-4 h-4 mr-1" />
                        {bank.questionCount} 道题
                      </div>
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-1" />
                        {bank.managers.length + bank.collaborators.length + 1} 人
                      </div>
                    </div>

                    {/* 最后更新 */}
                    <div className="mt-3 text-xs text-text-tertiary">
                      <Calendar className="w-3 h-4 inline mr-1" />
                      最后更新: {new Date(bank.lastUpdated).toLocaleDateString()}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

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
  );
};

export default QuestionBankListPage; 