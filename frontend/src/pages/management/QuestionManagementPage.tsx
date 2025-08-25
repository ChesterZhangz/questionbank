import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, TrendingUp, X, Plus, RefreshCw, Grid3X3, List } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';
import { questionAPI, questionBankAPI, authAPI } from '../../services/api';
import type { Question, QuestionBank } from '../../types';
import QuestionCard from '../../components/question/QuestionCard';
import FuzzySelect from '../../components/ui/FuzzySelect';
import MultiSelect from '../../components/ui/MultiSelect';
import TagSelector from '../../components/ui/TagSelector';
import QuestionView from '../../components/question/QuestionView';
import DynamicStats from '../../components/ui/DynamicStats';
import LoadingPage from '../../components/ui/LoadingPage';
import { getTopQuestionTypes } from '../../utils/statsUtils';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { useModal } from '../../hooks/useModal';
import ConfirmModal from '../../components/ui/ConfirmModal';
import RightSlideModal from '../../components/ui/RightSlideModal';


const animationStyles = `
  @keyframes fade-in {
    from { opacity: 0; transform: translateY(5px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  @keyframes slide-in {
    from { opacity: 0; transform: translateX(-10px); }
    to { opacity: 1; transform: translateX(0); }
  }
  
  @keyframes scale-in {
    from { opacity: 0; transform: scale(0.98); }
    to { opacity: 1; transform: scale(1); }
  }
  
  .animate-fade-in {
    animation: fade-in 0.15s ease-out forwards;
  }
  
  .animate-slide-in {
    animation: slide-in 0.15s ease-out forwards;
  }

  .animate-scale-in {
    animation: scale-in 0.1s ease-out forwards;
  }

  /* 优化的滚动条样式 */
  .scrollbar-thin::-webkit-scrollbar {
    width: 4px;
  }
  
  .scrollbar-thin::-webkit-scrollbar-track {
    background: #f1f5f9;
    border-radius: 2px;
  }
  
  .scrollbar-thin::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 2px;
  }
  
  .scrollbar-thin::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
  }
  
  .scrollbar-thumb-gray-300::-webkit-scrollbar-thumb {
    background: #d1d5db;
  }
  
  .scrollbar-track-gray-100::-webkit-scrollbar-track {
    background: #f3f4f6;
  }
  
  /* 性能优化样式 */
  .will-change-transform {
    will-change: transform;
  }
  
  .will-change-opacity {
    will-change: opacity;
  }
`;

if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = animationStyles;
  document.head.appendChild(style);
}

const useDebounce = (value: any, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

interface QuestionManagementPageProps {}

const QuestionManagementPage: React.FC<QuestionManagementPageProps> = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  // 弹窗状态管理
  const { 
    showConfirm, 
    showSuccessRightSlide,
    showErrorRightSlide,
    confirmModal, 
    closeConfirm,
    rightSlideModal,
    closeRightSlide,
    setConfirmLoading
  } = useModal();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [questionBanks, setQuestionBanks] = useState<QuestionBank[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [, setBanksLoading] = useState(true);
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [showBatchActions, setShowBatchActions] = useState(false);
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState<number | null>(null);
  const [showQuestionView, setShowQuestionView] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // 筛选状态
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedBanks, setSelectedBanks] = useState<string[]>([]);
  const [selectedDifficulties, setSelectedDifficulties] = useState<number[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // 分页状态
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalQuestions, setTotalQuestions] = useState(0);
  
  // 可用筛选选项
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  
  // 防抖搜索 - 增加延迟避免频繁请求
  const debouncedSearchTerm = useDebounce(searchTerm, 300); // 增加到300ms减少频繁请求
  
  // 用于防止重复请求的ref
  const hasInitialized = useRef(false);
  const lastFilterParams = useRef<any>(null);
  const lastRequestTime = useRef<number>(0);

  // 计算题型统计并获取数量最多的题型
  const topQuestionTypes = getTopQuestionTypes(questions);
  
  // 获取题库列表
  const fetchQuestionBanks = useCallback(async () => {
    setBanksLoading(true);
    setError('');
    
    try {
      const response = await questionBankAPI.getQuestionBanks();
      
      if (response.data.success) {
        const banksData = response.data.questionBanks || [];
        

        
        setQuestionBanks(banksData);
      } else {
        setError('获取题库列表失败: ' + response.data.error);
      }
    } catch (error: any) {
      if (error.code === 'ECONNABORTED') {
        setError('获取题库列表超时，请检查网络连接或稍后重试');
      } else if (error.response?.status === 401) {
        setError('认证失败，请重新登录');
      } else {
        setError('获取题库列表失败: ' + (error.response?.data?.error || error.message || '未知错误'));
      }
    } finally {
      setBanksLoading(false);
    }
  }, []);

  // 获取题目列表 - 优化版本，移除 enrichQuestionsData 避免循环更新
  const fetchQuestions = useCallback(async () => {
    // 防止重复请求
    const now = Date.now();
    if (now - lastRequestTime.current < 200) { // 增加防抖时间
      return;
    }
    lastRequestTime.current = now;
    
    setLoading(true);
    setError('');
    
    try {
      const params: any = {
        search: debouncedSearchTerm,
        sortBy,
        sortOrder,
        page: currentPage,
        limit: pageSize
      };
      
      // 添加筛选参数
      if (selectedBanks.length > 0) {
        params.bankId = selectedBanks;
      }
      if (selectedTypes.length > 0) {
        params.type = selectedTypes;
      }
      if (selectedDifficulties.length > 0) {
        params.difficulty = selectedDifficulties;
      }
      if (selectedTags.length > 0) {
        params.tags = selectedTags;
      }
      
      const response = await questionAPI.getAllQuestions(params);
      
      if (response.data.success) {
        const questionsData = response.data.data?.questions || [];
        
        // 直接设置题目数据，不进行数据补充避免状态循环
        setQuestions(questionsData);
        
        // 更新分页信息
        if (response.data.data?.pagination) {
          setTotalPages(response.data.data.pagination.totalPages);
          setTotalQuestions(response.data.data.pagination.total);
        }
        
        // 更新可用筛选选项
        if (response.data.data?.filters) {
          setAvailableTags(response.data.data.filters.availableTags || []);
        }
        
        // 移除前端数据补充，避免反复刷新
      } else {
        setError('获取题目列表失败: ' + response.data.error);
      }
    } catch (error: any) {
      if (error.code === 'ECONNABORTED') {
        setError('获取题目列表超时，请检查网络连接或稍后重试');
      } else if (error.response?.status === 401) {
        setError('认证失败，请重新登录');
      } else {
        setError('获取题目列表失败: ' + (error.response?.data?.error || error.message || '未知错误'));
      }
    } finally {
      setLoading(false);
    }
  }, [debouncedSearchTerm, selectedBanks, selectedTypes, selectedDifficulties, selectedTags, sortBy, sortOrder, currentPage, pageSize]);

  // 题目操作
  const handleViewQuestionDetail = (index: number) => {
    setSelectedQuestionIndex(index);
    setShowQuestionView(true);
  };

  // 收藏题目
  const handleFavorite = async (qid: string) => {
    try {
      // 使用authAPI来保持API调用的一致性
      const response = await authAPI.toggleFavorite(qid);
      
      if (response.data.success) {
        // 更新本地状态
        const newFavorites = new Set(favorites);
        if (response.data.isFavorited) {
          newFavorites.add(qid);
        } else {
          newFavorites.delete(qid);
        }
        setFavorites(newFavorites);
      } else {
        setError('收藏操作失败');
      }
    } catch (error) {
      // 错误日志已清理
      setError('收藏操作失败');
    }
  };

  // 选择处理
  const handleSelectQuestion = (questionId: string, selected: boolean) => {
    if (selected) {
      setSelectedQuestions(prev => [...prev, questionId]);
    } else {
      setSelectedQuestions(prev => prev.filter(id => id !== questionId));
    }
  };

  // 删除题目
  const handleDeleteQuestion = async (qid: string) => {
    showConfirm(
      '确认删除',
      '确定要删除这道题目吗？删除后无法恢复.',
      async () => {
        try {
          // 设置确认弹窗的加载状态
          setConfirmLoading(true, '正在删除...');
          
          await questionAPI.deleteQuestion(qid);
          // 从题目列表中移除被删除的题目
          setQuestions(prev => prev.filter(q => q._id !== qid));
          // 从选中列表中移除
          setSelectedQuestions(prev => prev.filter(id => id !== qid));
          
          // 立即更新分页信息
          setTotalQuestions(prev => Math.max(0, prev - 1));
          
          // 重新计算总页数
          const newTotalQuestions = Math.max(0, totalQuestions - 1);
          const newTotalPages = Math.ceil(newTotalQuestions / pageSize);
          setTotalPages(newTotalPages);
          
          // 如果当前页没有题目了，且不是第一页，则跳转到上一页
          if (questions.length === 1 && currentPage > 1) {
            setCurrentPage(prev => Math.max(1, prev - 1));
          }
          
          setError(''); // 清除错误信息
          
          // 触发全局事件，通知其他页面更新统计数据
          window.dispatchEvent(new CustomEvent('questionDeleted', { 
            detail: { 
              questionId: qid,
              timestamp: Date.now()
            } 
          }));
          
          closeConfirm(); // 删除成功后关闭弹窗
          // 显示成功提示
          showSuccessRightSlide('删除成功', '题目已成功删除');
        } catch (error) {
          // 错误日志已清理
          showErrorRightSlide('删除失败', '删除题目失败，请重试');
          closeConfirm(); // 删除失败后也关闭弹窗
        }
      }
    );
  };

  // 初始化数据
  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      fetchQuestionBanks();
      fetchQuestions();
      fetchUserFavorites(); // 新增：获取用户收藏状态
    }
  }, []); // 只在组件挂载时执行一次

  // 新增：获取用户收藏状态
  const fetchUserFavorites = async () => {
    try {
      const response = await authAPI.getFavorites({ page: 1, limit: 1000 }); // 获取所有收藏
      if (response.data.success && response.data.data?.favorites) {
        const favoriteIds = new Set(response.data.data.favorites.map((q: any) => q.qid || q._id));
        setFavorites(favoriteIds);
      }
    } catch (error: any) {
      // 错误日志已清理
      // 不影响页面正常显示，只记录错误
    }
  };

  // 获取用户在当前题库中的角色（简化版本，参考题库详情页面的实现）
  const getUserRoleForQuestion = useCallback((question: Question) => {
    if (!user) return 'viewer';
    
    // 如果用户是题目创建者，拥有完全权限
    if (question.creator._id === user._id) {
      return 'creator';
    }
    
    // 查找题目所属的题库
    // 注意：questionBank字段是ObjectId，bid字段是字符串
    const questionBank = questionBanks.find(bank => {
      // 优先使用questionBank字段（ObjectId）
      if (question.questionBank && bank._id === question.questionBank) {
        return true;
      }
      // 备用：使用bid字段（字符串）
      if (question.bid && bank.bid === question.bid) {
        return true;
      }
      return false;
    });
    

    
    if (!questionBank) return 'viewer';
    
    // 优先使用题库API返回的userRole字段（这是最可靠的方式）
    if (questionBank.userRole) {
      return questionBank.userRole;
    }
    
    // 如果没有userRole字段，则手动检查权限
    const userId = user._id?.toString();
    const creatorId = questionBank.creator._id?.toString();
    
    if (creatorId === userId) {
      return 'creator';
    } else if (questionBank.managers.some((m: any) => m._id?.toString() === userId)) {
      return 'manager';
    } else if (questionBank.collaborators.some((c: any) => c._id?.toString() === userId)) {
      return 'collaborator';
    } else {
      return 'viewer';
    }
  }, [user, questionBanks]);

  // 统一监听所有参数变化，避免重复请求
  useEffect(() => {
    if (!hasInitialized.current) {
      return; // 初始化阶段不执行
    }
    
    // 构建当前参数字符串
    const currentParams = JSON.stringify({
      search: debouncedSearchTerm,
      banks: selectedBanks,
      types: selectedTypes,
      difficulties: selectedDifficulties,
      tags: selectedTags,
      sortBy,
      sortOrder,
      page: currentPage,
      pageSize
    });
    
    // 检查参数是否真正发生变化
    const previousParams = lastFilterParams.current;
    if (currentParams === previousParams) {
      return; // 参数未变化，不执行请求
    }
    
    // 检查是否只是分页变化
    const oldParams = previousParams ? JSON.parse(previousParams) : {};
    const newParams = JSON.parse(currentParams);
    
    const isOnlyPageChange = 
      oldParams.search === newParams.search &&
      JSON.stringify(oldParams.banks) === JSON.stringify(newParams.banks) &&
      JSON.stringify(oldParams.types) === JSON.stringify(newParams.types) &&
      JSON.stringify(oldParams.difficulties) === JSON.stringify(newParams.difficulties) &&
      JSON.stringify(oldParams.tags) === JSON.stringify(newParams.tags) &&
      oldParams.sortBy === newParams.sortBy &&
      oldParams.sortOrder === newParams.sortOrder;
    
    // 如果筛选条件改变（非分页），重置到第一页
    if (!isOnlyPageChange && newParams.page !== 1) {
      setCurrentPage(1);
      return; // 等待页码重置后再请求
    }
    
    lastFilterParams.current = currentParams;
    
    // 延迟执行，避免快速连续请求
    const timer = setTimeout(() => {
      fetchQuestions();
    }, 150);
    
    return () => clearTimeout(timer);
  }, [debouncedSearchTerm, selectedBanks, selectedTypes, selectedDifficulties, selectedTags, sortBy, sortOrder, currentPage, pageSize]);

  // 监听批量操作状态
  useEffect(() => {
    setShowBatchActions(selectedQuestions.length > 0);
  }, [selectedQuestions]);

  // 优化的题目卡片包装器 - 使用 React.memo 和 useMemo
  const QuestionCardWrapper = React.memo<{ question: Question; selected: boolean; index: number }>(({ question, selected, index }) => {
    // 使用 useMemo 优化题库信息查找
    const questionBank = useMemo(() => 
      questionBanks.find(bank => bank.bid === question.bid), 
      [questionBanks, question.bid]
    );
    
    // 使用 useMemo 优化收藏状态检查
    const isFavorite = useMemo(() => 
      favorites.has(question.qid), 
      [favorites, question.qid]
    );
    
    // 使用 useCallback 优化选择处理函数
    const handleSelect = useCallback((selected: boolean) => {
      handleSelectQuestion(question._id, selected);
    }, [question._id]);
    
    // 使用 useMemo 优化样式类名
    const className = useMemo(() => 
      selected ? 'ring-2 ring-blue-500' : '', 
      [selected]
    );
    
    // 获取用户对这道题目的权限
    const userRole = getUserRoleForQuestion(question);
    
    return (
      <QuestionCard
        question={question}
        bid={question.bid}
        bankName={questionBank?.name}
        userRole={userRole}
        index={index}
        onFavorite={handleFavorite}
        isFavorite={isFavorite}
        onViewDetail={handleViewQuestionDetail}
        selected={selected}
        onSelect={handleSelect}
        showCheckbox={false}
        viewMode={viewMode}
        onDelete={userRole === 'creator' || userRole === 'manager' || userRole === 'collaborator' ? handleDeleteQuestion : undefined}
        className={className}
      />
    );
  });



  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-indigo-900/20">
      {/* 错误提示 */}
      {error && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 max-w-md">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg shadow-lg p-4 animate-fade-in">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
              </div>
              <div className="ml-auto pl-3">
                <button
                  onClick={() => setError('')}
                  className="inline-flex text-red-400 hover:text-red-600 dark:hover:text-red-300"
                >
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 页面标题区域 */}
      <div className="sticky top-0 z-30 bg-white dark:bg-gray-900 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 dark:from-gray-100 to-blue-600 dark:to-blue-400 bg-clip-text text-transparent">
                题目管理
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1">管理和组织您的题目库，支持批量操作和高级筛选</p>
            </div>
            <div className="flex items-center space-x-4">
              {/* 快速统计面板 */}
              <motion.div 
                className="flex items-center space-x-3"
                layout
              >
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ 
                    duration: 0.25,
                    delay: 0.05,
                    ease: [0.25, 0.1, 0.25, 1]
                  }}
                  className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-xl px-4 py-2 border border-blue-200 dark:border-blue-700 shadow-sm hover:shadow-md transition-shadow duration-200"
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
                      key={`filtered-${questions.length}`}
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ 
                        duration: 0.3,
                        ease: "easeOut"
                      }}
                    >
                      已筛选: {questions.length} 题
                    </motion.span>
                  </motion.div>
                </motion.div>
                
                {/* 动态显示数量最多的题型 */}
                <DynamicStats stats={topQuestionTypes} maxItems={2} />
              </motion.div>

              {/* 快速操作面板 */}
              <div className="flex items-center space-x-2">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: 0.2 }}
                  className="relative group"
                >
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/questions/create')}
                    className="px-3 py-2 bg-white dark:bg-gray-800 backdrop-blur-sm border-gray-200 dark:border-gray-600 hover:bg-white dark:hover:bg-gray-700 hover:border-blue-300 dark:hover:border-blue-500 text-gray-700 dark:text-gray-200 hover:text-blue-700 dark:hover:text-blue-400 font-medium rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    新建
                  </Button>
                  {/* 悬停提示 */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 dark:bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                    创建新题目
                  </div>
                </motion.div>



                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: 0.3 }}
                  className="relative group"
                >
                  {/* 悬停提示 */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 dark:bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                    智能组卷
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 高级筛选区域 */}
      <div className="max-w-7xl mx-auto px-6 py-4 pb-16 relative">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="bg-white dark:bg-gray-800 backdrop-blur-md rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-visible relative z-10"
        >
          {/* 筛选头部 - 与标题区域风格统一 */}
          <div className="bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/40 px-6 py-3 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-sm">
                  <Filter className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-800 dark:text-gray-100">智能筛选</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">快速定位目标题目</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedTypes([]);
                        setSelectedBanks([]);
                        setSelectedDifficulties([]);
                        setSelectedTags([]);
                        setSearchTerm('');
                        setSortBy('createdAt');
                        setSortOrder('desc');
                        setCurrentPage(1); // 重置到第一页
                      }}
                      className="px-3 py-1.5 text-xs text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 bg-white/60 dark:bg-gray-700/60 backdrop-blur-sm"
                    >
                      <RefreshCw className="h-3 w-3 mr-1" />
                      重置筛选
                    </Button>
                  </motion.div>
                </motion.div>
              </div>
            </div>
          </div>

          {/* 筛选内容 - 更紧凑的布局 */}
          <div className="p-4 relative overflow-visible" style={{ minHeight: '300px' }}>
            <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-5 gap-4 relative">
              {/* 搜索框 */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="lg:col-span-2 relative"
              >
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1.5">搜索题目</label>
                <div className="relative group">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-4 w-4 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors duration-200" />
                  <Input
                    placeholder="搜索题目编号、内容、标签、难度、题型..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-3 py-2 text-sm border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rounded-lg transition-all duration-200 hover:border-gray-300 dark:hover:border-gray-500 group-hover:shadow-md text-gray-900 dark:text-gray-100"
                  />
                  {/* 搜索框悬停效果 */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-50/0 to-blue-50/10 dark:from-blue-900/0 dark:to-blue-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg pointer-events-none"></div>
                </div>
              </motion.div>

              {/* 题库选择 */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.2 }}
                className="relative z-[100]"
              >
                <MultiSelect
                  label="题库归属"
                  options={questionBanks.map(bank => ({
                    value: bank._id,
                    label: bank.name
                  }))}
                  value={selectedBanks}
                  onChange={(value) => setSelectedBanks(value as string[])}
                  placeholder="选择题库"
                  maxDisplay={2}
                />
              </motion.div>

              {/* 难度选择 */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.3 }}
                className="relative z-[110]"
              >
                <MultiSelect
                  label="题目难度"
                  options={[
                    { value: 1, label: '非常简单', icon: '○' },
                    { value: 2, label: '简单', icon: '○○' },
                    { value: 3, label: '中等', icon: '○○○' },
                    { value: 4, label: '困难', icon: '○○○○' },
                    { value: 5, label: '非常困难', icon: '○○○○○' }
                  ]}
                  value={selectedDifficulties}
                  onChange={(value) => setSelectedDifficulties(value as number[])}
                  placeholder="选择难度"
                  maxDisplay={2}
                />
              </motion.div>

              {/* 排序方式 */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2, delay: 0.2 }}
                className="relative z-[120]"
              >
                <FuzzySelect
                  label="排序方式"
                  options={[
                    { value: 'createdAt', label: '创建时间', icon: '◉' },
                    { value: 'updatedAt', label: '更新时间', icon: '◐' },
                    { value: 'difficulty', label: '难度', icon: '◆' },
                    { value: 'views', label: '访问量', icon: '◇' }
                  ]}
                  value={sortBy}
                  onChange={(value) => setSortBy(value as string)}
                  placeholder="选择排序方式"
                />
              </motion.div>

              {/* 排序方向 */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2, delay: 0.25 }}
                className="relative z-[130]"
              >
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1.5">排序方向</label>
                <div className="relative group">
                  <Button
                    variant="outline"
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm hover:bg-white dark:hover:bg-gray-600 hover:border-gray-300 dark:hover:border-gray-500 group-hover:shadow-md rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
                  >
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="h-3 w-3 text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-100 transition-colors" />
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-100 group-hover:text-gray-900 dark:group-hover:text-gray-100 transition-colors">
                        {sortOrder === 'asc' ? '升序 ↑' : '降序 ↓'}
                      </span>
                    </div>
                  </Button>
                  {/* 悬停效果指示器 */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-50/0 to-blue-50/20 dark:from-blue-900/0 dark:to-blue-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg pointer-events-none"></div>
                </div>
              </motion.div>

              {/* 题型筛选和知识点标签 - 并排显示 */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2, delay: 0.3 }}
                className="lg:col-span-3 relative z-[90]"
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* 题型筛选 */}
                  <div className="relative z-[95]">
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1.5">题型筛选</label>
                    <div className="space-y-2">
                      {/* 已选题型显示 */}
                      {selectedTypes.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-gradient-to-r from-blue-50/80 to-indigo-50/80 dark:from-blue-900/30 dark:to-indigo-900/30 p-2 rounded-lg border border-blue-100/50 dark:border-blue-700/50"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium text-blue-700 dark:text-blue-300">已选题型 ({selectedTypes.length})</span>
                            <button
                              onClick={() => setSelectedTypes([])}
                              className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 transition-colors"
                            >
                              清空
                            </button>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {selectedTypes.map((type) => {
                              const typeInfo = [
                                { value: 'choice', label: '选择题', color: 'blue' },
                                { value: 'multiple-choice', label: '多选题', color: 'green' },
                                { value: 'fill', label: '填空题', color: 'yellow' },
                                { value: 'solution', label: '解答题', color: 'purple' }
                              ].find(t => t.value === type);
                              
                              return (
                                <motion.span
                                  key={type}
                                  initial={{ opacity: 0, scale: 0.8 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  exit={{ opacity: 0, scale: 0.8 }}
                                  className={`inline-flex items-center gap-1 px-2 py-1 bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm border border-${typeInfo?.color}-200 dark:border-${typeInfo?.color}-600 text-${typeInfo?.color}-700 dark:text-${typeInfo?.color}-300 rounded-full text-xs font-medium shadow-sm hover:shadow-md transition-all duration-200`}
                                >
                                  <span className="w-1.5 h-1.5 bg-current rounded-full"></span>
                                  {typeInfo?.label}
                                  <button
                                    onClick={() => setSelectedTypes(selectedTypes.filter(t => t !== type))}
                                    className="hover:bg-current hover:bg-opacity-10 rounded-full p-0.5 transition-colors ml-1"
                                  >
                                    <X className="h-2.5 w-2.5" />
                                  </button>
                                </motion.span>
                              );
                            })}
                          </div>
                        </motion.div>
                      )}
                      
                      {/* 题型选择按钮 */}
                      <div className="flex flex-wrap gap-2">
                        {[
                          { value: 'choice', label: '选择题', color: 'blue', icon: '○' },
                          { value: 'multiple-choice', label: '多选题', color: 'green', icon: '□' },
                          { value: 'fill', label: '填空题', color: 'yellow', icon: '___' },
                          { value: 'solution', label: '解答题', color: 'purple', icon: '✎' }
                        ].map((type) => (
                          <motion.button
                            key={type.value}
                            whileHover={{ scale: 1.02, y: -1 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => {
                              if (selectedTypes.includes(type.value)) {
                                setSelectedTypes(selectedTypes.filter(t => t !== type.value));
                              } else {
                                setSelectedTypes([...selectedTypes, type.value]);
                              }
                            }}
                            className={`relative px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 flex items-center space-x-1.5 shadow-sm hover:shadow-md ${
                              selectedTypes.includes(type.value)
                                ? `bg-gradient-to-r from-${type.color}-500 to-${type.color}-600 text-white shadow-md`
                                : 'bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                            }`}
                          >
                            <span className="text-xs opacity-80 dark:opacity-90">{type.icon}</span>
                            <span>{type.label}</span>
                            {selectedTypes.includes(type.value) && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-white dark:bg-gray-700 rounded-full flex items-center justify-center shadow-sm"
                              >
                                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                              </motion.div>
                            )}
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* 知识点标签 */}
                  <div className="relative z-[85]">
                    <TagSelector
                      label="知识点标签"
                      availableTags={availableTags}
                      selectedTags={selectedTags}
                      onTagsChange={setSelectedTags}
                      placeholder="选择知识点标签"
                    />
                  </div>
                </div>
              </motion.div>
            </div>


          </div>
        </motion.div>
      </div>

        {/* 批量操作栏 */}
        {showBatchActions && (
          <div className="mb-6 mt-4">
            <Card className="bg-gradient-to-r from-red-500 to-red-600 dark:from-red-600 dark:to-red-700 text-white border-0 shadow-lg animate-slide-in">
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-medium">
                      已选择 {selectedQuestions.length} 道题目
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedQuestions([])}
                      className="text-red-100 dark:text-red-200 border-red-300 dark:border-red-400 hover:bg-red-600 dark:hover:bg-red-700 hover:text-white"
                    >
                      取消选择
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

      {/* 主要内容区域 */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* 题目展示区域 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
          {/* 题目列表 */}
          <div className="p-6">
            {loading ? (
              <LoadingPage 
                title="正在加载题目..." 
                description="请稍候，正在获取题目列表"
                fullScreen={false}
              />
            ) : questions.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-12 h-12 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">暂无题目数据</h3>
                <p className="text-gray-600 dark:text-gray-300">尝试调整筛选条件或添加新题目</p>
              </div>
            ) : (
              <>
                {/* 视图切换 */}
                <div className="flex items-center justify-between mb-6">
                  <div className="relative bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                    <div className="flex items-center space-x-1">
                      <motion.button
                        onClick={() => setViewMode('grid')}
                        className={`relative px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-200 ${
                          viewMode === 'grid' 
                            ? 'text-blue-700 dark:text-blue-300' 
                            : 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100'
                        }`}
                      >
                        <Grid3X3 className="h-4 w-4" />
                      </motion.button>
                      <motion.button
                        onClick={() => setViewMode('list')}
                        className={`relative px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-200 ${
                          viewMode === 'list' 
                            ? 'text-blue-700 dark:text-blue-300' 
                            : 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100'
                        }`}
                      >
                        <List className="h-4 w-4" />
                      </motion.button>
                    </div>
                    {/* 选中指示器 */}
                    <motion.div
                      layout
                      className="absolute top-1 bottom-1 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-md shadow-sm"
                      initial={false}
                      animate={{
                        x: viewMode === 'grid' ? 4 : 44,
                        width: 36
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 30
                      }}
                    />
                  </div>
                </div>

                {/* 题目显示 */}
                {viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-hidden">
                    {questions.map((question, index) => (
                      <div key={question._id} className="animate-fade-in w-full" style={{ animationDelay: `${index * 10}ms` }}>
                        <QuestionCardWrapper
                          question={question}
                          selected={selectedQuestions.includes(question._id)}
                          index={index}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4 overflow-hidden">
                    {questions.map((question, index) => (
                      <div key={question._id} className="animate-slide-in w-full" style={{ animationDelay: `${index * 8}ms` }}>
                        <QuestionCardWrapper
                          question={question}
                          selected={selectedQuestions.includes(question._id)}
                          index={index}
                        />
                      </div>
                    ))}
                  </div>
                )}
                
                {/* 分页组件 */}
                {!loading && questions.length > 0 && (
                  <div className="mt-8 flex items-center justify-between">
                    {/* 分页信息 */}
                    <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-300">
                      <span>
                        共 {totalQuestions} 道题目，第 {currentPage} / {totalPages} 页
                      </span>
                      <div className="flex items-center space-x-2">
                        <span>每页显示：</span>
                        <select
                          value={pageSize}
                          onChange={(e) => {
                            setPageSize(parseInt(e.target.value));
                            setCurrentPage(1); // 切换页面大小时重置到第一页
                          }}
                          className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        >
                          <option value={10}>10</option>
                          <option value={20}>20</option>
                          <option value={50}>50</option>
                          <option value={100}>100</option>
                        </select>
                        <span>道题目</span>
                      </div>
                    </div>
                    
                    {/* 分页导航 */}
                    <div className="flex items-center space-x-2">
                      {/* 上一页 */}
                      <button
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                          currentPage === 1
                            ? 'text-gray-400 dark:text-gray-600 bg-gray-100 dark:bg-gray-700 cursor-not-allowed'
                            : 'text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500'
                        }`}
                      >
                        上一页
                      </button>
                      
                      {/* 页码按钮 */}
                      <div className="flex items-center space-x-1">
                        {/* 第一页 */}
                        {currentPage > 3 && (
                          <button
                            onClick={() => setCurrentPage(1)}
                            className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500 transition-colors"
                          >
                            1
                          </button>
                        )}
                        
                        {/* 省略号 */}
                        {currentPage > 4 && (
                          <span className="px-2 text-gray-400 dark:text-gray-600">...</span>
                        )}
                        
                        {/* 当前页附近的页码 */}
                        {(() => {
                          const pages = [];
                          const startPage = Math.max(1, currentPage - 2);
                          const endPage = Math.min(totalPages, currentPage + 2);
                          
                          for (let pageNum = startPage; pageNum <= endPage; pageNum++) {
                            pages.push(
                              <button
                                key={pageNum}
                                onClick={() => setCurrentPage(pageNum)}
                                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                                  pageNum === currentPage
                                    ? 'text-white bg-blue-600 dark:bg-blue-500 border border-blue-600 dark:border-blue-500'
                                    : 'text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500'
                                }`}
                              >
                                {pageNum}
                              </button>
                            );
                          }
                          return pages;
                        })()}
                        
                        {/* 省略号 */}
                        {currentPage < totalPages - 3 && (
                          <span className="px-2 text-gray-400 dark:text-gray-600">...</span>
                        )}
                        
                        {/* 最后一页 */}
                        {currentPage < totalPages - 2 && (
                          <button
                            onClick={() => setCurrentPage(totalPages)}
                            className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500 transition-colors"
                          >
                            {totalPages}
                          </button>
                        )}
                      </div>
                      
                      {/* 下一页 */}
                      <button
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                          currentPage === totalPages
                            ? 'text-gray-400 dark:text-gray-600 bg-gray-100 dark:bg-gray-700 cursor-not-allowed'
                            : 'text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500'
                        }`}
                      >
                        下一页
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* 题目查看弹窗 */}
      {selectedQuestionIndex !== null && (
        <QuestionView
          isOpen={showQuestionView}
          onClose={() => {
            setShowQuestionView(false);
            setSelectedQuestionIndex(null);
          }}
          questions={questions}
          currentIndex={selectedQuestionIndex}
          bid={questions[selectedQuestionIndex]?.bid || 'unknown'}
          userRole={getUserRoleForQuestion(questions[selectedQuestionIndex])}
          onFavorite={handleFavorite}
          favorites={favorites}
        />
      )}

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

export default QuestionManagementPage; 