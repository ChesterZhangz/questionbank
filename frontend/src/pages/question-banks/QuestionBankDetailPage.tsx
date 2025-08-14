import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Edit, 
  Users, 
  Settings, 
  MoreVertical,
  ArrowLeft,
  Calendar,
  BookOpen,
  Target,
  TrendingUp
} from 'lucide-react';
import { questionAPI, questionBankAPI, authAPI } from '../../services/api';
import { useAuthStore } from '../../stores/authStore';
import type { Question, QuestionBank } from '../../types';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import QuestionCard from '../../components/question/QuestionCard';
import QuestionView from '../../components/question/QuestionView';
import LoadingPage from '../../components/ui/LoadingPage';
import ConfirmModal from '../../components/ui/ConfirmModal';
import RightSlideModal from '../../components/ui/RightSlideModal';
import { useModal } from '../../hooks/useModal';

const QuestionBankDetailPage: React.FC = () => {
  const { bid } = useParams<{ bid: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  // 弹窗状态管理
  const { 
    showConfirm, 
    confirmModal, 
    closeConfirm,
    showSuccessRightSlide,
    showErrorRightSlide,
    rightSlideModal,
    closeRightSlide
  } = useModal();
  const [questionBank, setQuestionBank] = useState<QuestionBank | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string>('');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  useEffect(() => {
    fetchQuestionBank();
    fetchQuestions();
  }, [bid]);

  // 监听题目删除事件，更新统计数据
  useEffect(() => {
    const handleQuestionDeleted = () => {
      // 当题目被删除时，重新获取题库数据以更新统计数据
      fetchQuestionBank();
      fetchQuestions();
    };

    window.addEventListener('questionDeleted', handleQuestionDeleted);
    
    return () => {
      window.removeEventListener('questionDeleted', handleQuestionDeleted);
    };
  }, [bid]);

  const fetchQuestionBank = async () => {
    try {
      const response = await questionBankAPI.getQuestionBank(bid!);
      if (response.data.success) {
        setQuestionBank(response.data.questionBank!);
        determineUserRole(response.data.questionBank!);
      } else {
        setError(response.data.error || '获取题库信息失败');
      }
    } catch (error: any) {
      setError(error.response?.data?.error || '获取题库信息失败');
    } finally {
      setLoading(false);
    }
  };

  const fetchQuestions = async () => {
    try {
      // 传递足够大的limit参数来获取所有题目
      const response = await questionAPI.getQuestions(bid!, { limit: 1000 });
      if (response.data.success) {
        const questionsData = response.data.questions || [];
        
        setQuestions(questionsData);
      }
    } catch (error: any) {
      console.error('获取题目列表失败:', error);
    }
  };

  const determineUserRole = (bank: QuestionBank) => {
    // 转换为字符串进行比较，避免ObjectId类型问题
    const userId = user?._id?.toString();
    const creatorId = bank.creator._id?.toString();
    
    if (creatorId === userId) {
      setUserRole('creator');
    } else if (bank.managers.some(m => m._id?.toString() === userId)) {
      setUserRole('manager');
    } else if (bank.collaborators.some(c => c._id?.toString() === userId)) {
      setUserRole('collaborator');
    } else {
      setUserRole('viewer');
    }
  };

  const handleCreateQuestion = () => {
    navigate(`/question-banks/${bid}/questions/create`);
  };

  const handleEditBank = () => {
    navigate(`/question-banks/${bid}/edit`);
  };

  const handleManageMembers = () => {
    navigate(`/question-banks/${bid}/members`);
  };



  const handleDeleteQuestion = async (qid: string) => {
    showConfirm(
      '确认删除',
      '确定要删除这道题目吗？删除后无法恢复。',
      async () => {
        try {
          const response = await questionAPI.deleteQuestion(qid);
          if (response.data.success) {
            setQuestions(prev => prev.filter(q => q.qid !== qid));
            // 刷新题库信息以更新题目数量
            fetchQuestionBank();
          } else {
            showErrorRightSlide('删除失败', response.data.error || '删除失败');
          }
        } catch (error: any) {
          showErrorRightSlide('删除失败', error.response?.data?.error || '删除失败');
        }
      }
    );
  };

  const handleFavoriteQuestion = async (qid: string) => {
    try {

      const response = await authAPI.toggleFavorite(qid);
      
      if (response.data.success) {
        // 更新本地状态
        setFavorites(prev => {
          const newFavorites = new Set(prev);
          if (response.data.isFavorited) {
            newFavorites.add(qid);
          } else {
            newFavorites.delete(qid);
          }
          return newFavorites;
        });
        
        // 显示提示
        showSuccessRightSlide('收藏成功', response.data.isFavorited ? '已添加到收藏' : '已取消收藏');
      } else {
        showErrorRightSlide('收藏失败', '收藏操作失败，请重试');
      }
    } catch (error: any) {
      console.error('收藏操作失败:', error);
      showErrorRightSlide('收藏失败', '收藏操作失败，请重试');
    }
  };

  // 打开题目详情弹窗
  const handleViewQuestionDetail = (index: number) => {
    setCurrentQuestionIndex(index);
    setIsModalOpen(true);
  };

  // 关闭题目详情弹窗
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };



  if (loading) {
    return <LoadingPage />;
  }

  if (error || !questionBank) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">题库不存在</h1>
            <p className="text-gray-600 dark:text-gray-300 mb-6">{error || '无法加载题库信息'}</p>
            <Button onClick={() => navigate('/question-banks')}>
              返回题库列表
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* 头部 */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Button
                variant="outline"
                onClick={() => navigate('/question-banks')}
                className="mr-4"
              >
                <ArrowLeft className="w-4 w-4 mr-2" />
                返回
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{questionBank.name}</h1>
                <p className="text-gray-600 dark:text-gray-300">题库详情</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {(userRole === 'creator' || userRole === 'manager') && (
                <Button
                  onClick={handleCreateQuestion}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="w-4 w-4 mr-2" />
                  添加题目
                </Button>
              )}
              <div className="relative group">
                <Button variant="outline" size="sm">
                  <MoreVertical className="w-4 w-4" />
                </Button>
                {/* 下拉菜单 */}
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <div className="py-1">
                    {(userRole === 'creator' || userRole === 'manager') && (
                      <>
                        <button
                          onClick={handleEditBank}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <Edit className="w-4 w-4 mr-2" />
                          编辑题库
                        </button>
                        <button
                          onClick={handleManageMembers}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <Users className="w-4 w-4 mr-2" />
                          成员管理
                        </button>
                      </>
                    )}
                    {(userRole === 'creator' || userRole === 'manager') && (
                      <button
                        onClick={() => navigate(`/question-banks/${bid}/settings`)}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <Settings className="w-4 w-4 mr-2" />
                        题库设置
                      </button>
                    )}
                    <button
                      onClick={() => navigate(`/question-banks/${bid}/stats`)}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <TrendingUp className="w-4 w-4 mr-2" />
                      统计分析
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 内容区域 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 题库信息卡片 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Card>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* 基本信息 */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">基本信息</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">创建者：</span>
                      <span className="text-sm text-gray-900 dark:text-gray-100">{questionBank.creator.name}</span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">您的角色：</span>
                      <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                        {userRole === 'creator' ? '创建者' : 
                         userRole === 'manager' ? '管理者' : 
                         userRole === 'collaborator' ? '协作者' : '查看者'}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">状态：</span>
                      <span className="text-sm text-gray-900 dark:text-gray-100">
                        {questionBank.isPublic ? '公开' : '私有'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 统计信息 */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">统计信息</h3>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <BookOpen className="w-4 w-4 text-blue-500 dark:text-blue-400 mr-2" />
                      <span className="text-sm text-gray-500 dark:text-gray-400">题目数量：</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100 ml-1">
                        {questionBank.questionCount}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Users className="w-4 w-4 text-green-500 dark:text-green-400 mr-2" />
                      <span className="text-sm text-gray-500 dark:text-gray-400">成员数量：</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100 ml-1">
                        {questionBank.managers.length + questionBank.collaborators.length + 1}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-4 w-4 text-purple-500 dark:text-purple-400 mr-2" />
                      <span className="text-sm text-gray-500 dark:text-gray-400">最后更新：</span>
                      <span className="text-sm text-gray-900 dark:text-gray-100 ml-1">
                        {new Date(questionBank.lastUpdated).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 分类和标签 */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">分类标签</h3>
                  <div className="space-y-3">
                    {questionBank.category && (
                      <div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">分类：</span>
                        <span className="text-sm text-gray-900 dark:text-gray-100">{questionBank.category}</span>
                      </div>
                    )}
                    {questionBank.tags.length > 0 && (
                      <div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">标签：</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {questionBank.tags.slice(0, 3).map((tag, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300"
                            >
                              {tag}
                            </span>
                          ))}
                          {questionBank.tags.length > 3 && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                              +{questionBank.tags.length - 3}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* 描述 */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">描述</h3>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    {questionBank.description || '暂无描述'}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* 题目列表 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">题目列表</h2>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              共 {questions.length} 道题目
            </div>
          </div>

          {questions.length === 0 ? (
            <Card>
              <div className="text-center py-12">
                <Target className="w-16 w-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">还没有题目</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">开始添加您的第一道题目</p>
                {(userRole === 'creator' || userRole === 'manager' || userRole === 'collaborator') && (
                  <Button
                    onClick={handleCreateQuestion}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="w-4 w-4 mr-2" />
                    添加题目
                  </Button>
                )}
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {questions.map((question, index) => (
                <QuestionCard
                  key={question.qid}
                  question={question}
                  bid={bid!}
                  userRole={userRole}
                  index={index}
                  onFavorite={handleFavoriteQuestion}
                  isFavorite={favorites.has(question.qid)}
                  onViewDetail={handleViewQuestionDetail}
                  onDelete={handleDeleteQuestion}
                />
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* 题目详情弹窗 */}
      <QuestionView
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        questions={questions}
        currentIndex={currentQuestionIndex}
        bid={bid!}
        userRole={userRole}
        onDelete={handleDeleteQuestion}
        onFavorite={handleFavoriteQuestion}
        favorites={favorites}
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
  );
};

export default QuestionBankDetailPage; 