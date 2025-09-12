import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, TrendingUp, X, RefreshCw, Eye, Edit, Settings, Calendar, Tag, PenTool, FileText, Crown, Handshake, Eye as EyeIcon, CheckCircle, Clock, Type, BookOpen, Plus } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';
import { paperAPI, paperBankAPI } from '../../services/api';
import { FuzzySelect, MultiSelect } from '../../components/ui/menu';
import LoadingPage from '../../components/ui/LoadingPage';
import { useNavigate } from 'react-router-dom';
import { useModal } from '../../hooks/useModal';
import RightSlideModal from '../../components/ui/RightSlideModal';
import ConfirmModal from '../../components/ui/ConfirmModal';
import { PracticePaperCard } from '../../components/paper';
import { useTranslation } from '../../hooks/useTranslation';

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

interface Paper {
  _id: string;
  name: string;
  type: 'lecture' | 'practice' | 'test';
  subject?: string;
  grade?: string;
  timeLimit?: number;
  totalScore: number;
  status: 'draft' | 'published' | 'modified';
  version: number;
  publishedAt?: string;
  modifiedAt?: string;
  createdAt: string;
  updatedAt: string;
  bank?: {
    _id: string;
    name: string;
  };
  owner: {
    _id: string;
    name: string;
    email?: string;
  };
  userRole: 'creator' | 'manager' | 'collaborator' | 'viewer';
}

const MyPapersPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { 
    rightSlideModal, 
    closeRightSlide, 
    confirmModal, 
    showConfirm, 
    closeConfirm, 
    setConfirmLoading,
    showSuccessRightSlide,
    showErrorRightSlide
  } = useModal();
  
  // 状态管理
  const [papers, setPapers] = useState<Paper[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // 搜索和筛选
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // 分页
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(0);
  const [totalPapers, setTotalPapers] = useState(0);
  
  // 视图模式
  
  
  // 防抖搜索
  const debouncedSearchTerm = useDebounce(searchTerm, 300);


  // 状态选项
  const statusOptions = [
    { value: 'draft', label: t('paperBanks.myPapers.statusOptions.draft'), icon: PenTool },
    { value: 'published', label: t('paperBanks.myPapers.statusOptions.published'), icon: CheckCircle },
    { value: 'modified', label: t('paperBanks.myPapers.statusOptions.modified'), icon: Edit }
  ];

  // 试卷类型选项
  const typeOptions = [
    { value: 'lecture', label: t('paperBanks.myPapers.typeOptions.lecture'), icon: BookOpen },
    { value: 'practice', label: t('paperBanks.myPapers.typeOptions.practice'), icon: PenTool },
    { value: 'test', label: t('paperBanks.myPapers.typeOptions.test'), icon: FileText }
  ];

  // 角色选项
  const roleOptions = [
    { value: 'creator', label: t('paperBanks.myPapers.roleOptions.creator'), icon: Crown },
    { value: 'manager', label: t('paperBanks.myPapers.roleOptions.manager'), icon: Settings },
    { value: 'collaborator', label: t('paperBanks.myPapers.roleOptions.collaborator'), icon: Handshake },
    { value: 'viewer', label: t('paperBanks.myPapers.roleOptions.viewer'), icon: EyeIcon }
  ];

  // 加载试卷集数据
  const loadPaperBanks = useCallback(async () => {
    try {
      // 使用getMyPapers API来获取用户有权限访问的所有试卷集（包括被邀请的）
      const response = await paperBankAPI.getMyPapers();
      if (response.data.success) {
        // 试卷集数据已加载，但不再需要存储
      }
    } catch (error) {
      console.error('加载试卷集失败:', error);
    }
  }, []);

  // 获取试卷列表
  const fetchPapers = useCallback(async () => {
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
      if (selectedStatuses.length > 0) {
        params.status = selectedStatuses[0]; // 只取第一个状态
      }
      if (selectedTypes.length > 0) {
        params.type = selectedTypes[0]; // 只取第一个类型
      }
      
      const response = await paperAPI.getMyPapers(params);
      
      if (response.data.success) {
        const papersData = response.data.data?.papers || [];
        setPapers(papersData);
        
        // 更新分页信息
        if (response.data.data?.pagination) {
          setTotalPages(response.data.data.pagination.totalPages);
          setTotalPapers(response.data.data.pagination.total);
        }
      } else {
        setError(t('paperBanks.myPapers.messages.fetchFailed'));
      }
    } catch (error: any) {
      if (error.response?.status === 401) {
        setError(t('paperBanks.myPapers.messages.authFailed'));
      } else {
        setError(t('paperBanks.myPapers.messages.fetchFailed') + ': ' + (error.response?.data?.error || error.message || t('paperBanks.myPapers.messages.unknownError')));
      }
    } finally {
      setLoading(false);
    }
  }, [debouncedSearchTerm, selectedStatuses, selectedTypes, sortBy, sortOrder, currentPage, pageSize]);

  // 监听筛选条件变化
  useEffect(() => {
    fetchPapers();
  }, [fetchPapers]);

  // 加载试卷集数据
  useEffect(() => {
    loadPaperBanks();
  }, [loadPaperBanks]);

  // 重置筛选
  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedStatuses([]);
    setSelectedTypes([]);
    setSortBy('createdAt');
    setSortOrder('desc');
    setCurrentPage(1);
  };

  // 创建试卷处理函数
  const handleCreatePaper = () => {
    navigate('/papers/create');
  };

  // 预览试卷
  const handlePreviewPaper = (paper: any) => {
    navigate(`/papers/${paper._id}/view`);
  };



  // 编辑试卷
  const handleEditPaper = (paper: any) => {
    if (paper.type === 'practice') {
      navigate(`/paper-banks/${paper.bank._id}/practices/${paper._id}/edit`);
    } else {
      navigate(`/papers/${paper._id}/edit`);
    }
  };

  // 删除试卷
  const handleDeletePaper = (paper: any) => {
    showConfirm(
      t('paperBanks.myPapers.deleteConfirm.title'), 
      t('paperBanks.myPapers.deleteConfirm.message', { name: paper.name }), 
      async () => {
        try {
          // 设置加载状态
          setConfirmLoading(true, t('paperBanks.myPapers.deleteConfirm.deleting'));
          
          const response = await paperAPI.deletePaper(paper._id);
          if (response.data.success) {
            // 从本地状态中移除已删除的试卷
            setPapers(prev => prev.filter(p => p._id !== paper._id));
            
            // 关闭确认弹窗
            closeConfirm();
            
            // 显示成功提示
            showSuccessRightSlide(t('paperBanks.myPapers.messages.deleteSuccess'), t('paperBanks.myPapers.messages.deleteSuccessMessage', { name: paper.name }));
          } else {
            setConfirmLoading(false);
            showErrorRightSlide(t('paperBanks.myPapers.messages.deleteFailed'), t('paperBanks.myPapers.messages.deleteFailedMessage'));
          }
        } catch (error: any) {
          console.error('删除试卷失败:', error);
          setConfirmLoading(false);
          showErrorRightSlide(t('paperBanks.myPapers.messages.deleteFailed'), error.response?.data?.message || t('paperBanks.myPapers.messages.deleteError'));
        }
      },
      {
        type: 'danger',
        confirmText: t('paperBanks.myPapers.deleteConfirm.confirmText'),
        confirmDanger: true
      }
    );
  };


  // 获取角色标签样式
  const getRoleBadgeStyle = (role: string) => {
    const styles = {
      creator: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
      manager: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      collaborator: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      viewer: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
    };
    return styles[role as keyof typeof styles] || styles.viewer;
  };

  // 获取状态标签样式
  const getStatusBadgeStyle = (status: string) => {
    const styles = {
      draft: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      published: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      modified: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
    };
    return styles[status as keyof typeof styles] || styles.draft;
  };

  // 获取试卷类型标签样式
  const getTypeBadgeStyle = (type: string) => {
    const styles = {
      lecture: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      practice: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
      test: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
    };
    return styles[type as keyof typeof styles] || styles.lecture;
  };


  // 获取试卷类型标签
  const getTypeLabel = (type: string) => {
    const typeInfo = typeOptions.find(t => t.value === type);
    return typeInfo?.label || type;
  };

  // 试卷卡片组件
  const PaperCard: React.FC<{ paper: Paper; index: number }> = ({ paper, index }) => {
    // 根据试卷类型使用不同的卡片组件
    if (paper.type === 'practice') {
      return (
        <PracticePaperCard
          paper={paper as any}
          index={index}
          onEdit={handleEditPaper}
          onPreview={handlePreviewPaper}
        />
      );
    }

    // 默认试卷卡片（非练习卷）
    const canEdit = ['creator', 'manager', 'collaborator'].includes(paper.userRole);

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.05 }}
        className="group"
      >
        <Card className="h-full hover:shadow-lg transition-all duration-300 border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600">
          <div className="p-6 h-full flex flex-col">
            {/* 头部信息 */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {paper.name}
                </h3>
                <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                  {paper.bank && <p>{t('paperBanks.myPapers.paperInfo.bank', { name: paper.bank.name })}</p>}
                  {paper.subject && <p>{t('paperBanks.myPapers.paperInfo.subject', { subject: paper.subject })}</p>}
                  {paper.grade && <p>{t('paperBanks.myPapers.paperInfo.grade', { grade: paper.grade })}</p>}
                  <p>{t('paperBanks.myPapers.paperInfo.totalScore', { score: paper.totalScore })}</p>
                  {paper.timeLimit && <p>{t('paperBanks.myPapers.paperInfo.timeLimit', { minutes: paper.timeLimit })}</p>}
                </div>
              </div>
              <div className="flex flex-col items-end space-y-2 ml-4">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleBadgeStyle(paper.userRole)}`}>
                  {roleOptions.find(r => r.value === paper.userRole)?.label}
                </span>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeStyle(paper.status)}`}>
                  {statusOptions.find(s => s.value === paper.status)?.label}
                </span>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeBadgeStyle(paper.type)}`}>
                  {getTypeLabel(paper.type)}
                </span>
              </div>
            </div>

            {/* 统计信息 */}
            <div className="grid grid-cols-2 gap-4 mb-4 text-sm text-gray-600 dark:text-gray-300">
              <div className="flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span>{t('paperBanks.myPapers.paperInfo.created', { date: new Date(paper.createdAt).toLocaleDateString() })}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Tag className="w-4 h-4" />
                <span>{t('paperBanks.myPapers.paperInfo.version', { version: paper.version })}</span>
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePreviewPaper(paper)}
                    className="flex items-center space-x-1"
                  >
                    <Eye className="w-4 h-4" />
                    <span>{t('paperBanks.myPapers.actions.preview')}</span>
                  </Button>
                  
                  {canEdit && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditPaper(paper)}
                      className="flex items-center space-x-1"
                    >
                      <Edit className="w-4 h-4" />
                      <span>{t('paperBanks.myPapers.actions.edit')}</span>
                    </Button>
                  )}
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {t('paperBanks.myPapers.paperInfo.creator', { name: paper.owner.name })}
                  </div>
                  
                  {/* 删除按钮 - 只有创建者和管理员可以删除 */}
                  {['creator', 'manager'].includes(paper.userRole) && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeletePaper(paper)}
                      className="flex items-center space-x-1 text-red-600 hover:text-red-700 hover:border-red-300 dark:text-red-400 dark:hover:text-red-300"
                    >
                      <X className="w-4 h-4" />
                      <span>{t('paperBanks.myPapers.actions.delete')}</span>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    );
  };

  // 移除全屏加载，改为局部加载

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
                  <X className="h-5 w-5" />
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
                {t('paperBanks.myPapers.title')}
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1">{t('paperBanks.myPapers.subtitle')}</p>
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
                      key={`filtered-${papers.length}`}
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ 
                        duration: 0.3,
                        ease: "easeOut"
                      }}
                    >
                      {t('paperBanks.myPapers.filteredCount', { count: papers.length })}
                    </motion.span>
                  </motion.div>
                </motion.div>
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
                    onClick={handleCreatePaper}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm hover:shadow-md transition-all duration-200 flex items-center space-x-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{t('paperBanks.myPapers.createPaper')}</span>
                  </Button>
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
          {/* 筛选头部 */}
          <div className="bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/40 px-6 py-3 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-sm">
                  <Filter className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-800 dark:text-gray-100">{t('paperBanks.myPapers.smartFilter')}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{t('paperBanks.myPapers.smartFilterDescription')}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleResetFilters}
                    className="px-3 py-1.5 text-xs text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 bg-white/60 dark:bg-gray-700/60 backdrop-blur-sm"
                  >
                    <RefreshCw className="h-3 w-3 mr-1" />
                    {t('paperBanks.myPapers.resetFilter')}
                  </Button>
                </motion.div>
              </div>
            </div>
          </div>

          {/* 筛选内容 */}
          <div className="p-4 relative overflow-visible" style={{ minHeight: '300px' }}>
            <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-5 gap-4 relative">
              {/* 搜索框 */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="lg:col-span-2 relative"
              >
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1.5">{t('paperBanks.myPapers.searchLabel')}</label>
                <div className="relative group">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-4 w-4 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors duration-200" />
                  <Input
                    placeholder={t('paperBanks.myPapers.searchPlaceholder')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-3 py-2 text-sm border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rounded-lg transition-all duration-200 hover:border-gray-300 dark:hover:border-gray-500 group-hover:shadow-md text-gray-900 dark:text-gray-100"
                  />
                </div>
              </motion.div>


              {/* 状态选择 */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.3 }}
                className="relative z-[110]"
              >
                <MultiSelect
                  label={t('paperBanks.myPapers.statusLabel')}
                  options={statusOptions}
                  value={selectedStatuses}
                  onChange={(value) => setSelectedStatuses(value as string[])}
                  placeholder={t('paperBanks.myPapers.statusPlaceholder')}
                  maxDisplay={2}
                />
              </motion.div>

              {/* 试卷类型选择 */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.4 }}
                className="relative z-[115]"
              >
                <MultiSelect
                  label={t('paperBanks.myPapers.typeLabel')}
                  options={typeOptions}
                  value={selectedTypes}
                  onChange={(value) => setSelectedTypes(value as string[])}
                  placeholder={t('paperBanks.myPapers.typePlaceholder')}
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
                  label={t('paperBanks.myPapers.sortLabel')}
                  options={[
                    { value: 'createdAt', label: t('paperBanks.myPapers.sortOptions.createdAt'), icon: Clock },
                    { value: 'updatedAt', label: t('paperBanks.myPapers.sortOptions.updatedAt'), icon: Calendar },
                    { value: 'name', label: t('paperBanks.myPapers.sortOptions.name'), icon: Type },
                    { value: 'totalScore', label: t('paperBanks.myPapers.sortOptions.totalScore'), icon: TrendingUp }
                  ]}
                  value={sortBy}
                  onChange={(value) => setSortBy(value as string)}
                  placeholder={t('paperBanks.myPapers.sortPlaceholder')}
                />
              </motion.div>

              {/* 排序方向 */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2, delay: 0.25 }}
                className="relative z-[130]"
              >
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1.5">{t('paperBanks.myPapers.sortDirectionLabel')}</label>
                <div className="relative group">
                  <Button
                    variant="outline"
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm hover:bg-white dark:hover:bg-gray-600 hover:border-gray-300 dark:hover:border-gray-500 group-hover:shadow-md rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
                  >
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="h-3 w-3 text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-100 transition-colors" />
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-100 group-hover:text-gray-900 dark:group-hover:text-gray-100 transition-colors">
                        {sortOrder === 'asc' ? t('paperBanks.myPapers.ascending') : t('paperBanks.myPapers.descending')}
                      </span>
                    </div>
                  </Button>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* 试卷列表区域 */}
        <div className="mt-8">
          {loading ? (
            <LoadingPage 
              title={t('paperBanks.myPapers.loadingTitle')} 
              description={t('paperBanks.myPapers.loadingDescription')}
              fullScreen={false}
            />
          ) : papers.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">{t('paperBanks.myPapers.noDataTitle')}</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">{t('paperBanks.myPapers.noDataDescription')}</p>
              <Button
                onClick={handleCreatePaper}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm hover:shadow-md transition-all duration-200 flex items-center space-x-2 mx-auto"
              >
                <Plus className="w-4 h-4" />
                <span>{t('paperBanks.myPapers.createFirstPaper')}</span>
              </Button>
            </div>
          ) : (
            <>

              {/* 试卷显示 */}
              <div className="space-y-4 overflow-hidden">
                {papers.map((paper, index) => (
                  <div key={paper._id} className="animate-slide-in w-full" style={{ animationDelay: `${index * 8}ms` }}>
                    <PaperCard paper={paper} index={index} />
                  </div>
                ))}
              </div>
              
              {/* 分页组件 */}
              {!loading && papers.length > 0 && (
                <div className="mt-8 flex items-center justify-between">
                  {/* 分页信息 */}
                  <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-300">
                    <span>
                      {t('paperBanks.myPapers.pagination.total', { total: totalPapers, current: currentPage, pages: totalPages })}
                    </span>
                    <div className="flex items-center space-x-2">
                      <span>{t('paperBanks.myPapers.pagination.perPage')}</span>
                      <select
                        value={pageSize}
                        onChange={(e) => {
                          setPageSize(parseInt(e.target.value));
                          setCurrentPage(1);
                        }}
                        className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      >
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                      </select>
                      <span>{t('paperBanks.myPapers.pagination.papers')}</span>
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
                      {t('paperBanks.myPapers.pagination.previous')}
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
                      {t('paperBanks.myPapers.pagination.next')}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* 模态框 */}
      <RightSlideModal
        isOpen={rightSlideModal.isOpen}
        onClose={closeRightSlide}
        title={rightSlideModal.title}
        message={rightSlideModal.message}
        type={rightSlideModal.type}
        width={rightSlideModal.width}
        autoClose={rightSlideModal.autoClose}
        showProgress={rightSlideModal.showProgress}
      />

      {/* 确认删除弹窗 */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onCancel={closeConfirm}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type}
        confirmText={confirmModal.confirmText}
        cancelText={confirmModal.cancelText}
        confirmDanger={confirmModal.confirmDanger}
        confirmLoading={confirmModal.confirmLoading}
        loadingText={confirmModal.loadingText}
        preventClose={confirmModal.preventClose}
      />

    </div>
  );
};

export default MyPapersPage;
