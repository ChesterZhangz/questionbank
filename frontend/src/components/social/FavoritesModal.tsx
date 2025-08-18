import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, Search, AlertCircle } from 'lucide-react';
import { authAPI } from '../../services/api';
import Button from '../ui/Button';
import Input from '../ui/Input';
import QuestionCard from '../question/QuestionCard';
import LoadingPage from '../ui/LoadingPage';
import type { Question } from '../../types';
import { useModal } from '../../hooks/useModal';

interface FavoritesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FavoriteQuestion extends Question {
  favoritedAt: string;
  bankName?: string; // 题库名称
}

const FavoritesModal: React.FC<FavoritesModalProps> = ({ isOpen, onClose }) => {
  // 弹窗状态管理
  const { showErrorRightSlide } = useModal();

  const [favorites, setFavorites] = useState<FavoriteQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState<string | null>(null);

  // 获取收藏列表
  const fetchFavorites = async (page: number = 1) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authAPI.getFavorites({ page, limit: 12 });
      if (response.data.success && response.data.data) {
        setFavorites(response.data.data.favorites || []);
        setTotalPages(response.data.data.pagination?.totalPages || 1);
      } else {
        setError(response.data.error || '获取收藏失败');
      }
    } catch (error: any) {
      console.error('获取收藏失败:', error);
      setError(error.response?.data?.error || '获取收藏失败');
    } finally {
      setLoading(false);
    }
  };

  // 处理收藏/取消收藏
  const handleFavorite = async (qid: string, _isFavorite: boolean) => {
    try {
      const response = await authAPI.toggleFavorite(qid);
      if (response.data.success) {
        // 从列表中移除已取消收藏的题目
        if (!response.data.isFavorited) {
          setFavorites(prev => prev.filter(q => q.qid !== qid));
        }
      }
    } catch (error: any) {
      console.error('收藏操作失败:', error);
    }
  };

  // 过滤收藏列表
  const filteredFavorites = favorites.filter(question => {
    const matchesSearch = question.content.stem.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (question.content.answer && question.content.answer.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = filterType === 'all' || question.type === filterType;
    return matchesSearch && matchesType;
  });

  // 获取题目类型选项
  const getQuestionTypes = () => {
    const types = new Set(favorites.map(q => q.type));
    return Array.from(types);
  };

  useEffect(() => {
    if (isOpen) {
      fetchFavorites(1);
      setCurrentPage(1);
    }
  }, [isOpen]);

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
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 头部 */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Heart className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">我的收藏</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">查看您收藏的题目</p>
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

            {/* 搜索和过滤 */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="搜索收藏的题目..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    icon={<Search className="w-4 h-4" />}
                  />
                </div>
                <div className="flex gap-2">
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  >
                    <option value="all">全部类型</option>
                    {getQuestionTypes().map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* 内容区域 */}
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {loading ? (
                <LoadingPage />
              ) : error ? (
                <div className="text-center py-12">
                  <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">{error}</p>
                  <Button
                    onClick={() => fetchFavorites(currentPage)}
                    className="mt-4"
                  >
                    重试
                  </Button>
                </div>
              ) : filteredFavorites.length === 0 ? (
                <div className="text-center py-12">
                  <Heart className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">
                    {searchTerm || filterType !== 'all' ? '没有找到匹配的收藏题目' : '您还没有收藏任何题目'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredFavorites.map((question, index) => (
                      <QuestionCard
                        key={question.qid}
                        question={question}
                        bid={question.bid || ''}
                        bankName={question.bankName}
                        userRole="student"
                        index={index}
                        isFavorite={true}
                        onFavorite={handleFavorite}
                        onViewDetail={(index) => {
                          // 在收藏模态框中查看题目详情
                          const targetQuestion = filteredFavorites[index];
                          if (targetQuestion && targetQuestion.bid) {
                            // 打开新窗口查看题目详情
                            const url = `/question-banks/${targetQuestion.bid}/questions/${targetQuestion.qid}`;
                            window.open(url, '_blank');
                          } else {
                            showErrorRightSlide('查看失败', '无法查看题目详情：缺少题库信息');
                          }
                        }}
                        className="hover:shadow-lg transition-shadow"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 分页 */}
            {totalPages > 1 && (
              <div className="p-6 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    共 {favorites.length} 个收藏
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => {
                        const newPage = currentPage - 1;
                        if (newPage >= 1) {
                          setCurrentPage(newPage);
                          fetchFavorites(newPage);
                        }
                      }}
                      disabled={currentPage === 1}
                      variant="outline"
                      size="sm"
                    >
                      上一页
                    </Button>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {currentPage} / {totalPages}
                    </span>
                    <Button
                      onClick={() => {
                        const newPage = currentPage + 1;
                        if (newPage <= totalPages) {
                          setCurrentPage(newPage);
                          fetchFavorites(newPage);
                        }
                      }}
                      disabled={currentPage === totalPages}
                      variant="outline"
                      size="sm"
                    >
                      下一页
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FavoritesModal; 