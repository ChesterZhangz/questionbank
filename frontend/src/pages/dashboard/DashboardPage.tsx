import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, 
  Users, 
  FolderOpen,
  Plus,
  Code,
  FileText,
  Settings,
  BarChart3,
  Search,
  Target,
  Activity,
  ArrowRight,
  Eye,
  Edit,
  Trash2,
  Share2,
  User,
  Moon,
  Sun,
  Grid,
  List,
  Loader2,
  AlertCircle,
  CheckCircle,
  XCircle,
  Info
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useTheme } from '../../contexts/ThemeContext';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { dashboardAPI, type DashboardStats, type RecentActivity, type DashboardQuestionBank } from '../../services/dashboardAPI';
import searchAPI, { type SearchSuggestion } from '../../services/searchAPI';
import { renderSearchContent } from '../../lib/latex/utils/renderContent';
import 'katex/dist/katex.min.css';
import LoadingPage from '../../components/ui/LoadingPage';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<'overview' | 'question-banks' | 'settings'>('overview');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchSuggestion[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  // 状态管理
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quickStats, setQuickStats] = useState<DashboardStats>({
    totalQuestionBanks: 0,
    totalQuestions: 0,
    recentActivity: 0,
    completionRate: 0,
    userStats: {
      totalUsers: 0,
      activeUsers: 0,
      newUsersThisMonth: 0
    },
    systemStats: {
      systemStatus: 'normal',
      apiStatus: 'normal',
      databaseStatus: 'normal'
    }
  });
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [questionBanks, setQuestionBanks] = useState<DashboardQuestionBank[]>([]);
  const [systemStatus, setSystemStatus] = useState<{
    systemStatus: 'normal' | 'warning' | 'error';
    apiStatus: 'normal' | 'warning' | 'error';
    databaseStatus: 'normal' | 'warning' | 'error';
  }>({
    systemStatus: 'normal',
    apiStatus: 'normal',
    databaseStatus: 'normal'
  });

  // 加载数据
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // 并行加载所有数据
        const [stats, activities, banks, status] = await Promise.all([
          dashboardAPI.getQuickStats(),
          dashboardAPI.getRecentActivities(10),
          dashboardAPI.getUserQuestionBanks(),
          dashboardAPI.getSystemStatus()
        ]);
        

        setQuickStats(stats);
        setRecentActivities(activities);
        setQuestionBanks(banks);
        setSystemStatus(status);
      } catch (err: any) {
        // 错误日志已清理
        setError(err.message || '加载数据失败');
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  // 获取活动类型图标
  const getActivityIcon = (type: RecentActivity['type']) => {
    switch (type) {
      case 'create': return <Plus className="w-4 h-4 text-green-500" />;
      case 'edit': return <Edit className="w-4 h-4 text-blue-500" />;
      case 'delete': return <Trash2 className="w-4 h-4 text-red-500" />;
      case 'share': return <Share2 className="w-4 h-4 text-purple-500" />;
      case 'login': return <User className="w-4 h-4 text-blue-500" />;
      case 'register': return <User className="w-4 h-4 text-green-500" />;
      default: return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  // 格式化时间
  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}天前`;
    if (hours > 0) return `${hours}小时前`;
    return '刚刚';
  };

  // 获取状态图标
  const getStatusIcon = (status: 'normal' | 'warning' | 'error') => {
    switch (status) {
      case 'normal': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning': return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'error': return <XCircle className="w-4 h-4 text-red-500" />;
    }
  };

  // 获取状态文本
  const getStatusText = (status: 'normal' | 'warning' | 'error') => {
    switch (status) {
      case 'normal': return '正常';
      case 'warning': return '警告';
      case 'error': return '错误';
    }
  };

  // 获取状态样式
  const getStatusStyle = (status: 'normal' | 'warning' | 'error') => {
    switch (status) {
      case 'normal': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
    }
  };

  // 根据用户身份获取快捷功能
  const getQuickActions = () => {
    const isAdmin = user?.role === 'admin';
    const isTeacher = user?.role === 'teacher';
    const isStudent = user?.role === 'student';

    const baseActions = [
      {
        icon: <BookOpen className="w-6 h-6" />,
        title: '管理题库',
        description: '创建和管理您的题库',
        onClick: () => navigate('/question-banks'),
        color: 'from-blue-500 to-blue-600'
      },
      {
        icon: <Plus className="w-6 h-6" />,
        title: '创建题目',
        description: '添加新的题目到题库',
        onClick: () => navigate('/question-banks'),
        color: 'from-green-500 to-green-600'
      },
      {
        icon: <Code className="w-6 h-6" />,
        title: 'LaTeX指导',
        description: '学习LaTeX和TikZ语法',
        onClick: () => navigate('/LaTeXGuide'),
        color: 'from-purple-500 to-purple-600'
      }
    ];

    const adminActions = [
      {
        icon: <Users className="w-6 h-6" />,
        title: '用户管理',
        description: '管理系统用户和权限',
        onClick: () => navigate('/user-management'),
        color: 'from-red-500 to-red-600'
      },
    ];

    const teacherActions = [
      {
        icon: <FileText className="w-6 h-6" />,
        title: '试卷生成',
        description: '智能生成试卷',
        onClick: () => navigate('/paper-generation'),
        color: 'from-indigo-500 to-indigo-600'
      }
    ];

    const studentActions = [
      {
        icon: <Target className="w-6 h-6" />,
        title: '练习模式',
        description: '在线练习题目',
        onClick: () => navigate('/practice'),
        color: 'from-pink-500 to-pink-600'
      }
    ];

    if (isAdmin) {
      return [...baseActions, ...adminActions];
    } else if (isTeacher) {
      return [...baseActions, ...teacherActions];
    } else if (isStudent) {
      return [...baseActions, ...studentActions];
    }

    return baseActions;
  };

  // 搜索功能
  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim().length === 0) {
      setShowSearchResults(false);
      setSearchResults([]);
      return;
    }

    try {
      setSearchLoading(true);
      const suggestions = await searchAPI.getSuggestions(query, 5);
      setSearchResults(suggestions);
      setShowSearchResults(true);
    } catch (error) {
      // 错误日志已清理
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  // 处理搜索输入
  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query.trim()) {
      handleSearch(query);
    } else {
      setSearchResults([]);
      setShowSearchResults(false);
    }
  };

  // 点击外部关闭搜索结果显示
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.search-container') && !target.closest('.user-menu-container')) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // 加载状态
  if (loading) {
    return (
      <LoadingPage
        type="loading"
        title="加载仪表板数据中..."
        description="正在获取您的学习统计和进度信息"
        animation="spinner"
      />
    );
  }

  // 错误状态
  if (error) {
    return (
      <LoadingPage
        type="error"
        title="加载数据失败"
        description={error}
        showRetry={true}
        onRetry={() => window.location.reload()}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-bg-primary to-bg-secondary">
      {/* 主要内容区域 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 欢迎区域 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-text-primary mb-2">
                欢迎回来，{user?.name || '用户'}！
              </h1>
              <p className="text-text-secondary">
                今天是 {new Date().toLocaleDateString('zh-CN', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric',
                  weekday: 'long'
                })}
              </p>
            </div>
            
            {/* 搜索栏 */}
            <div className="flex-1 max-w-lg mx-8">
              <div className="relative search-container">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <div className="relative">
                  <input
                    type="text"
                    placeholder="搜索题库、题目... "
                    value={searchQuery}
                    onChange={handleSearchInput}
                    className="w-full pl-10 pr-4 py-2 border border-border-primary rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-bg-elevated text-text-primary"
                  />
                  {/* LaTeX预览提示 */}
                  {searchQuery.includes('\\') && (
                    <div className="absolute top-full left-0 right-0 mt-1 p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg text-xs text-blue-700 dark:text-blue-300 z-40">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">LaTeX预览:</span>
                        <div 
                          className="flex-1"
                          dangerouslySetInnerHTML={{ 
                            __html: renderSearchContent(searchQuery, 100) 
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
                {searchLoading && (
                  <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 animate-spin" />
                )}
                
                {/* 搜索结果下拉框 */}
                {showSearchResults && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-bg-elevated border border-border-primary rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
                    {searchLoading ? (
                                              <div className="p-4 text-center">
                          <Loader2 className="w-4 h-4 text-text-tertiary animate-spin mx-auto" />
                          <p className="text-sm text-text-tertiary mt-1">搜索中...</p>
                        </div>
                    ) : searchResults.length > 0 ? (
                      searchResults.map((result) => (
                        <div
                          key={result.id}
                          className="p-3 hover:bg-bg-secondary cursor-pointer border-b border-border-secondary last:border-b-0 min-h-[60px]"
                          onClick={() => {
                            setShowSearchResults(false);
                            setSearchQuery('');
                            // 根据搜索结果类型导航到不同页面
                            if (result.type === 'questionBank') {
                              navigate(`/question-banks/${result.bid}`);
                            } else if (result.type === 'question') {
                              // 修复题目导航路径 - 导航到题目管理页面并显示该题目
                              navigate(`/questions?search=${encodeURIComponent(result.title)}`);
                            }
                          }}
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                              {result.type === 'questionBank' ? (
                                <BookOpen className="w-4 h-4 text-blue-600" />
                              ) : (
                                <FileText className="w-4 h-4 text-green-600" />
                              )}
                            </div>
                            <div className="flex-1">
                              <div 
                                className="text-sm font-medium text-text-primary"
                                dangerouslySetInnerHTML={{ 
                                  __html: renderSearchContent(result.title, 80) 
                                }}
                              />
                              <div 
                                className="text-xs text-text-tertiary mt-1"
                                dangerouslySetInnerHTML={{ 
                                  __html: `${result.type === 'questionBank' ? '题库' : '题目'} • ${renderSearchContent(result.description, 60)}` 
                                }}
                              />
                            </div>
                            <ArrowRight className="w-4 h-4 text-text-tertiary" />
                          </div>
                        </div>
                      ))
                    ) : (
                                              <div className="p-4 text-center">
                          <p className="text-sm text-text-tertiary">未找到相关结果</p>
                        </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* 错误信息显示 */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/20 dark:border-red-800"
          >
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
              <p className="text-red-700 dark:text-red-300">{error}</p>
            </div>
          </motion.div>
        )}

        {/* 快速统计卡片 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <FolderOpen className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-text-secondary">题库总数</p>
                <p className="text-2xl font-bold text-text-primary">
                  {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : quickStats.totalQuestionBanks}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <FileText className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-text-secondary">题目总数</p>
                <p className="text-2xl font-bold text-text-primary">
                  {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : quickStats.totalQuestions}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Activity className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-text-secondary">今日活动</p>
                <p className="text-2xl font-bold text-text-primary">
                  {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : quickStats.recentActivity}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center">
              <div className="p-3 bg-orange-100 rounded-lg">
                <Target className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-text-secondary">完成率</p>
                <p className="text-2xl font-bold text-text-primary">
                  {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : `${quickStats.completionRate}%`}
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* 主要内容区域 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左侧主要内容 */}
          <div className="lg:col-span-2">
            {/* 标签页导航 */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex space-x-1 bg-bg-secondary p-1 rounded-lg">
                {[
                  { id: 'overview', label: '概览', icon: BarChart3 },
                  { id: 'question-banks', label: '题库', icon: FolderOpen },
                  { id: 'settings', label: '设置', icon: Settings }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'bg-bg-elevated text-blue-600 shadow-sm'
                        : 'text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>

              {activeTab === 'question-banks' && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-text-tertiary'}`}
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-text-tertiary'}`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* 标签页内容 */}
            <AnimatePresence mode="wait">
              {activeTab === 'overview' && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  {/* 快速操作 */}
                  <Card className="p-6">
                    <h3 className="text-lg font-semibold text-text-primary mb-4">快捷功能</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {getQuickActions().map((action, index) => (
                        <motion.button
                          key={action.title}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          onClick={action.onClick}
                          className="group relative p-4 bg-bg-elevated border border-border-primary rounded-lg hover:shadow-md transition-all duration-300 hover:border-border-secondary"
                        >
                          <div className="flex items-center space-x-3">
                            <div className={`w-10 h-10 bg-gradient-to-r ${action.color} rounded-lg flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-300`}>
                              {action.icon}
                            </div>
                            <div className="flex-1 text-left">
                              <h4 className="font-semibold text-text-primary group-hover:text-blue-600 transition-colors">
                                {action.title}
                              </h4>
                              <p className="text-sm text-text-tertiary mt-1">
                                {action.description}
                              </p>
                            </div>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </Card>

                  {/* 网站介绍 */}
                  <Card className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-text-primary">网站介绍</h3>
                      <Button variant="outline" size="sm" onClick={() => navigate('/introduction')}>
                        了解更多
                      </Button>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3 p-3 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200/50 dark:border-blue-700/50">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white">
                          <BookOpen className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-text-primary">专业题库管理平台</p>
                          <p className="text-sm text-text-secondary">支持LaTeX数学公式和TikZ图形绘制</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3 p-3 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200/50 dark:border-green-700/50">
                        <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center text-white">
                          <Target className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-text-primary">智能组卷系统</p>
                          <p className="text-sm text-text-secondary">基于AI的智能组卷，自动生成高质量试卷</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3 p-3 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200/50 dark:border-purple-700/50">
                        <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center text-white">
                          <Users className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-text-primary">团队协作支持</p>
                          <p className="text-sm text-text-secondary">支持团队协作，共享题库和试卷资源</p>
                        </div>
                      </div>
                    </div>
                  </Card>

                  {/* 最近活动 */}
                  <Card className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-text-primary">最近活动</h3>
                      <Button variant="outline" size="sm">
                        查看全部
                      </Button>
                    </div>
                    <div className="space-y-4">
                      {recentActivities.length > 0 ? (
                        recentActivities.map((activity, index) => (
                          <motion.div
                            key={activity.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-center space-x-3 p-3 rounded-lg hover:bg-bg-secondary transition-colors"
                          >
                            {getActivityIcon(activity.type)}
                            <div className="flex-1">
                              <p className="text-sm font-medium text-text-primary">{activity.title}</p>
                              <p className="text-sm text-text-secondary">{activity.description}</p>
                            </div>
                            <span className="text-xs text-text-tertiary">{formatTime(activity.timestamp)}</span>
                          </motion.div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-text-tertiary">
                          <Activity className="w-8 h-8 mx-auto mb-2 text-text-tertiary" />
                          <p>暂无活动记录</p>
                        </div>
                      )}
                    </div>
                  </Card>
                </motion.div>
              )}

              {activeTab === 'question-banks' && (
                <motion.div
                  key="question-banks"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <Card className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">我的题库</h3>
                      <Button onClick={() => navigate('/question-banks')}>
                        <Plus className="w-4 h-4 mr-2" />
                        新建题库
                      </Button>
                    </div>

                    {questionBanks.length > 0 ? (
                      viewMode === 'grid' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {questionBanks.map((bank, index) => (
                            <motion.div
                              key={bank.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                              onClick={() => navigate(`/question-banks/${bank.bid}`)}
                            >
                              <div className="flex items-start justify-between mb-3">
                                <h4 className="font-semibold text-gray-900 dark:text-gray-100">{bank.name}</h4>
                                <div className="flex items-center space-x-2">
                                  <button className="p-1 text-gray-400 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                                    <Eye className="w-4 h-4" />
                                  </button>
                                  <button className="p-1 text-gray-400 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                                    <Edit className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">{bank.description}</p>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                                  <span>{bank.questionCount} 题</span>
                                  <span>{formatTime(bank.lastModified)}</span>
                                </div>
                                <div className="flex space-x-1">
                                  {bank.tags.slice(0, 2).map((tag: string, tagIndex: number) => (
                                    <span
                                      key={tagIndex}
                                      className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs rounded-full"
                                    >
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {questionBanks.map((bank, index) => (
                            <motion.div
                              key={bank.id}
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                              onClick={() => navigate(`/question-banks/${bank.bid}`)}
                            >
                              <div className="flex items-center space-x-4">
                                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                                  <FolderOpen className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                  <h4 className="font-semibold text-text-primary">{bank.name}</h4>
                                  <p className="text-sm text-text-secondary">{bank.description}</p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-4">
                                <span className="text-sm text-text-tertiary">{bank.questionCount} 题</span>
                                <span className="text-sm text-text-tertiary">{formatTime(bank.lastModified)}</span>
                                <ArrowRight className="w-4 h-4 text-text-tertiary" />
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      )
                    ) : (
                      <div className="text-center py-12 text-text-tertiary">
                        <FolderOpen className="w-12 h-12 mx-auto mb-4 text-text-tertiary" />
                        <h3 className="text-lg font-medium mb-2">暂无题库</h3>
                        <p className="mb-4">创建您的第一个题库开始使用</p>
                        <Button onClick={() => navigate('/question-banks')}>
                          <Plus className="w-4 h-4 mr-2" />
                          创建题库
                        </Button>
                      </div>
                    )}
                  </Card>
                </motion.div>
              )}



              {activeTab === 'settings' && (
                <motion.div
                  key="settings"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <Card className="p-6">
                    <h3 className="text-lg font-semibold text-text-primary mb-4">个人设置</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-text-secondary">主题模式</span>
                        <button
                          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                          className="flex items-center space-x-2 px-3 py-2 border border-border-primary rounded-md hover:bg-bg-secondary"
                        >
                          {theme === 'light' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                          <span>{theme === 'light' ? '浅色' : '深色'}</span>
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-text-secondary">通知设置</span>
                        <button className="px-3 py-2 border border-border-primary rounded-md hover:bg-bg-secondary">
                          管理通知
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-text-secondary">账户安全</span>
                        <button className="px-2 border border-border-primary rounded-md hover:bg-bg-secondary">
                          安全设置
                        </button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 右侧边栏 */}
          <div className="space-y-6">
            {/* 用户信息卡片 */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="p-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <User className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-semibold text-text-primary mb-1">{user?.name}</h3>
                  <p className="text-xs text-text-tertiary">{user?.email}</p>
                </div>
              </Card>
            </motion.div>

            {/* 快捷功能 */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="p-6">
                <h3 className="font-semibold text-text-primary mb-4">快捷功能</h3>
                <div className="space-y-3">
                  <button
                    onClick={() => navigate('/introduction')}
                    className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-bg-secondary transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Info className="w-4 h-4 text-blue-600" />
                      </div>
                      <span className="text-sm font-medium text-text-secondary">网站介绍</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-text-tertiary" />
                  </button>
                  
                  <button
                    onClick={() => navigate('/paper-generation')}
                    className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-bg-secondary transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                        <FileText className="w-4 h-4 text-green-600" />
                      </div>
                      <span className="text-sm font-medium text-text-secondary">试卷生成</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-text-tertiary" />
                  </button>
                  
                  {user?.role === 'admin' && (
                    <button
                      onClick={() => navigate('/user-management')}
                      className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-bg-secondary transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                          <Users className="w-4 h-4 text-purple-600" />
                        </div>
                        <span className="text-sm font-medium text-text-secondary">用户管理</span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-text-tertiary" />
                    </button>
                  )}
                </div>
              </Card>
            </motion.div>

            {/* 系统状态 */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="p-6">
                <h3 className="font-semibold text-text-primary mb-4">系统状态</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-text-secondary">系统状态</span>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(systemStatus.systemStatus)}
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusStyle(systemStatus.systemStatus)}`}>
                        {getStatusText(systemStatus.systemStatus)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-text-secondary">API 状态</span>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(systemStatus.apiStatus)}
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusStyle(systemStatus.apiStatus)}`}>
                        {getStatusText(systemStatus.apiStatus)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-text-secondary">数据库</span>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(systemStatus.databaseStatus)}
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusStyle(systemStatus.databaseStatus)}`}>
                        {getStatusText(systemStatus.databaseStatus)}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage; 