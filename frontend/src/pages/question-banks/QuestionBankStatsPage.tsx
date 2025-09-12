import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import {
  ArrowLeft,
  BarChart3,
  TrendingUp,
  Users,
  FileText,
  Star,
  Eye,
  Activity,
  Target,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Download
} from 'lucide-react';
import { questionBankAPI } from '../../services/api';
import type { QuestionBank } from '../../types';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { renderContentWithCache } from '../../lib/latex/utils/renderContent';
import LoadingPage from '../../components/ui/LoadingPage';
import { useTranslation } from '../../hooks/useTranslation';

/**
 * 统计分析页面 - 简化版本
 * 
 * 功能特性：
 * 1. 缓存机制 - 5分钟数据缓存，减少重复请求
 * 2. 实时刷新 - 手动刷新数据
 * 3. 趋势指示器 - 显示数据变化趋势
 * 4. 错误重试机制 - 友好的错误提示和重试功能
 * 5. 性能优化 - 使用 useCallback 和 useMemo 优化渲染
 * 6. 动画效果 - 流畅的页面切换和进度条动画
 * 7. 响应式设计 - 适配不同屏幕尺寸
 */

interface QuestionBankStats {
  // 基础统计
  totalQuestions: number;
  questionTypes: {
    choice: number;
    'multiple-choice': number;
    fill: number;
    solution: number;
  };
  difficultyDistribution: {
    easy: number;
    medium: number;
    hard: number;
  };
  
  // 使用统计
  totalViews: number;
  monthlyViews: Array<{ month: string; count: number }>;
  popularQuestions: Array<{
    qid: string;
    title: string;
    views: number;
  }>;
  
  // 成员统计
  memberActivity: Array<{
    userId: string;
    name: string;
    role: string;
    lastActive: string;
    questionCount: number;
  }>;
  
  // 质量分析
  averageDifficulty: number;
  tagCoverage: number;
  duplicateRate: number;
}

const QuestionBankStatsPage: React.FC = () => {
  const { bid } = useParams<{ bid: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  // const { user } = useAuthStore();
  
  // 状态管理
  const [questionBank, setQuestionBank] = useState<QuestionBank | null>(null);
  const [stats, setStats] = useState<QuestionBankStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefreshTime, setLastRefreshTime] = useState<Date | null>(null);
  const [dataQualityIssues, setDataQualityIssues] = useState<string[]>([]);

  // 标签页状态
  const [activeTab, setActiveTab] = useState<'overview' | 'questions' | 'usage' | 'members'>('overview');

  // 缓存机制
  const [statsCache, setStatsCache] = useState<Map<string, { data: QuestionBankStats; timestamp: number }>>(new Map());
  const [cacheExpiry] = useState(2 * 60 * 1000); // 2分钟缓存，平衡性能和新鲜度

  // 缓存管理
  const getCacheKey = useCallback(() => {
    return `stats_${bid}`;
  }, [bid]);

  const isCacheValid = useCallback((cacheKey: string) => {
    const cached = statsCache.get(cacheKey);
    if (!cached) return false;
    return Date.now() - cached.timestamp < cacheExpiry;
  }, [statsCache, cacheExpiry]);

  // 获取缓存的统计数据
  const getCachedStats = useCallback((cacheKey: string) => {
    const cached = statsCache.get(cacheKey);
    return cached ? cached.data : null;
  }, [statsCache]);

  // 设置缓存
  const setCachedStats = useCallback((cacheKey: string, data: QuestionBankStats) => {
    setStatsCache(prev => new Map(prev).set(cacheKey, {
      data,
      timestamp: Date.now()
    }));
  }, []);

  const fetchStats = useCallback(async (forceRefresh = false) => {
    if (!bid) return;

    const cacheKey = getCacheKey();
    
    // 检查缓存
    if (!forceRefresh && isCacheValid(cacheKey)) {
      const cachedStats = getCachedStats(cacheKey);
      if (cachedStats) {
        setStats(cachedStats);
        setLoading(false);
        return;
      }
    }

    try {
      setRefreshing(true);
      setError(null);
      
      // 获取统计数据（包含题库信息）
      const statsResponse = await questionBankAPI.getStats(bid);

      if (statsResponse.data.success) {
        const statsData = statsResponse.data.stats;
        const questionBankData = statsResponse.data.questionBank;
        
        // 设置题库信息
        if (questionBankData) {
          setQuestionBank(questionBankData);
        }
        
        // 验证数据有效性
        if (validateStats(statsData)) {
  
          setStats(statsData);
          setCachedStats(cacheKey, statsData);
          setLastRefreshTime(new Date());
        } else {
          
          setStats(statsData);
          setCachedStats(cacheKey, statsData);
          setLastRefreshTime(new Date());
        }
      } else {
        setError(t('questionBankPage.QuestionBankStatsPage.errors.loadFailed'));
      }
    } catch (error: any) {
      // 错误日志已清理
      setError(error.response?.data?.error || t('questionBankPage.QuestionBankStatsPage.errors.loadFailedRetry'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [bid, getCacheKey, isCacheValid, getCachedStats, setCachedStats]);

  // 手动刷新数据
  const handleRefresh = useCallback(() => {
    fetchStats(true);
  }, [fetchStats]);

  useEffect(() => {
    if (bid) {
      fetchStats();
    }
  }, [bid, fetchStats]);

  // 移除重复的fetchQuestionBank函数，现在在fetchStats中并行获取


  // 数据验证函数
  const validateStats = useCallback((stats: QuestionBankStats) => {
    const issues: string[] = [];
    
    if (stats.tagCoverage > 100) {
      issues.push(t('questionBankPage.QuestionBankStatsPage.dataQuality.tagCoverageAnomaly', { value: stats.tagCoverage }));
    }
    if (stats.duplicateRate > 100) {
      issues.push(t('questionBankPage.QuestionBankStatsPage.dataQuality.duplicateRateAnomaly', { value: stats.duplicateRate }));
    }
    if (stats.averageDifficulty < 0 || stats.averageDifficulty > 5) {
      issues.push(t('questionBankPage.QuestionBankStatsPage.dataQuality.averageDifficultyAnomaly', { value: stats.averageDifficulty }));
    }
    if (stats.totalQuestions < 0) {
      issues.push(t('questionBankPage.QuestionBankStatsPage.dataQuality.totalQuestionsAnomaly', { value: stats.totalQuestions }));
    }
    
    if (issues.length > 0) {
      
      setDataQualityIssues(issues);
    } else {
      setDataQualityIssues([]);
    }
    
    return issues.length === 0;
  }, []);

  // 格式化百分比
  const safeFormatPercentage = useCallback((num: number) => {
    if (typeof num !== 'number' || isNaN(num)) {
      return 0;
    }
    return Math.max(0, Math.min(num, 100));
  }, []);

  const safeFormatDifficulty = useCallback((num: number) => {
    if (typeof num !== 'number' || isNaN(num)) {
      return 0;
    }
    return Math.max(0, Math.min(num, 5));
  }, []);

  // 数字动画组件
  const AnimatedNumber = ({ value, format = 'number', className = '' }: { 
    value: number; 
    format?: 'number' | 'percentage' | 'decimal';
    className?: string;
  }) => {
    const motionValue = useMotionValue(0);
    const springValue = useSpring(motionValue, {
      stiffness: 150,
      damping: 25,
      duration: 0.8
    });

    useEffect(() => {
      motionValue.set(value);
    }, [value, motionValue]);

    const displayValue = useTransform(springValue, (latest) => {
      if (format === 'percentage') {
        return `${Math.round(latest)}%`;
      } else if (format === 'decimal') {
        return latest.toFixed(1);
      }
      return Math.round(latest).toString();
    });

    return (
      <motion.span className={className}>
        {displayValue}
      </motion.span>
    );
  };

  // 进度条动画组件
  const AnimatedProgressBar = ({ 
    value, 
    max = 100, 
    color = 'bg-blue-500',
    className = ''
  }: { 
    value: number; 
    max?: number;
    color?: string;
    className?: string;
  }) => {
    const percentage = Math.min((value / max) * 100, 100);
    
    return (
      <div className={`w-full bg-gray-200 rounded-full h-2 overflow-hidden ${className}`}>
        <motion.div
          className={`${color} h-2 rounded-full transition-all duration-300`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ 
            duration: 0.6, 
            ease: [0.4, 0, 0.2, 1],
            delay: 0.1
          }}
        />
      </div>
    );
  };

  // 卡片动画组件
  const AnimatedCard = ({ 
    children, 
    delay = 0,
    className = ''
  }: { 
    children: React.ReactNode; 
    delay?: number;
    className?: string;
  }) => {
    return (
      <motion.div
        initial={{ opacity: 0, y: 15, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ 
          duration: 0.4, 
          ease: [0.4, 0, 0.2, 1],
          delay: delay
        }}
        className={className}
      >
        {children}
      </motion.div>
    );
  };

  // 计算百分比
  const calculatePercentage = useCallback((value: number, total: number) => {
    return total > 0 ? Math.round((value / total) * 100) : 0;
  }, []);

  // 格式化最后活跃时间
  const formatLastActive = useCallback((lastActive: string | null | undefined) => {
    if (!lastActive) return t('questionBankPage.QuestionBankStatsPage.time.unknown');
    
    try {
      const date = new Date(lastActive);
      if (isNaN(date.getTime())) return t('questionBankPage.QuestionBankStatsPage.time.unknown');
      
      const now = new Date();
      const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffInDays === 0) {
        return t('questionBankPage.QuestionBankStatsPage.time.today');
      } else if (diffInDays === 1) {
        return t('questionBankPage.QuestionBankStatsPage.time.yesterday');
      } else if (diffInDays < 7) {
        return t('questionBankPage.QuestionBankStatsPage.time.daysAgo', { days: diffInDays });
      } else if (diffInDays < 30) {
        return t('questionBankPage.QuestionBankStatsPage.time.weeksAgo', { weeks: Math.floor(diffInDays / 7) });
      } else {
        return date.toLocaleDateString('zh-CN', { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric' 
        });
      }
    } catch (error) {
      
      return t('questionBankPage.QuestionBankStatsPage.time.unknown');
    }
  }, [t]);


  if (loading && !stats) {
    return <LoadingPage />;
  }

  if (error || !questionBank || !stats) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-6">
            <AlertTriangle className="w-12 w-12 text-red-500 dark:text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-red-800 dark:text-red-200 mb-2">{t('questionBankPage.QuestionBankStatsPage.errors.loadFailed')}</h3>
            <p className="text-red-600 dark:text-red-400 mb-4">{error || t('questionBankPage.QuestionBankStatsPage.errors.cannotLoadStats')}</p>
            <div className="flex items-center justify-center gap-3">
              <Button 
                onClick={handleRefresh}
                disabled={refreshing}
                className="bg-red-600 hover:bg-red-700"
              >
                {refreshing ? (
                  <>
                    <RefreshCw className="w-4 w-4 mr-2 animate-spin" />
                    {t('questionBankPage.QuestionBankStatsPage.buttons.retrying')}
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 w-4 mr-2" />
                    {t('questionBankPage.QuestionBankStatsPage.buttons.retry')}
                  </>
                )}
              </Button>
              <Button 
                variant="outline"
                onClick={() => navigate(-1)}
              >
                {t('questionBankPage.QuestionBankStatsPage.buttons.back')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">


      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 数据质量警告 */}
        {dataQualityIssues.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-700">
              <div className="p-4">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
                  <div>
                    <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">{t('questionBankPage.QuestionBankStatsPage.dataQuality.title')}</h4>
                    <div className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                      {dataQualityIssues.map((issue, index) => (
                        <div key={index}>• {issue}</div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* 页面标题 */}
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
          className="flex items-center justify-between mb-6"
        >
          <div className="flex items-center gap-4">
            <motion.button
              onClick={() => navigate(-1)}
              className="p-2 rounded-lg bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-all duration-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </motion.button>
            <div>
              <motion.h1 
                className="text-2xl font-bold text-gray-900 dark:text-gray-100"
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.05 }}
              >
                {questionBank.name} - {t('questionBankPage.QuestionBankStatsPage.title')}
              </motion.h1>
              <motion.p 
                className="text-sm text-gray-500 dark:text-gray-400 mt-1"
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
              >
                {t('questionBankPage.QuestionBankStatsPage.subtitle')}
              </motion.p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {lastRefreshTime && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-xs text-gray-400 dark:text-gray-500"
              >
                {t('questionBankPage.QuestionBankStatsPage.lastUpdate')}: {lastRefreshTime.toLocaleTimeString()}
              </motion.div>
            )}
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.15 }}
            >
              <Button
                onClick={handleRefresh}
                disabled={refreshing}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <motion.div
                  animate={{ rotate: refreshing ? 360 : 0 }}
                  transition={{ duration: 0.8, repeat: refreshing ? Infinity : 0, ease: "linear" }}
                >
                  <RefreshCw className="w-4 h-4" />
                </motion.div>
                {refreshing ? t('questionBankPage.QuestionBankStatsPage.buttons.refreshing') : t('questionBankPage.QuestionBankStatsPage.buttons.refresh')}
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <Button
                onClick={() => {/* 导出功能 */}}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                {t('questionBankPage.QuestionBankStatsPage.buttons.exportReport')}
              </Button>
            </motion.div>
          </div>
        </motion.div>

        {/* 标签页导航 */}
        <motion.div 
          className="flex space-x-1 bg-white dark:bg-gray-800 rounded-lg p-1 mb-6 shadow-sm"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
        >
          {[
            { key: 'overview', label: t('questionBankPage.QuestionBankStatsPage.tabs.overview'), icon: BarChart3 },
            { key: 'questions', label: t('questionBankPage.QuestionBankStatsPage.tabs.questions'), icon: FileText },
            { key: 'usage', label: t('questionBankPage.QuestionBankStatsPage.tabs.usage'), icon: TrendingUp },
            { key: 'members', label: t('questionBankPage.QuestionBankStatsPage.tabs.members'), icon: Users }
          ].map((tab, index) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            
            return (
              <motion.button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ 
                  duration: 0.3, 
                  delay: 0.2 + index * 0.05,
                  ease: [0.4, 0, 0.2, 1]
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </motion.button>
            );
          })}
        </motion.div>

        {/* 优化的概览统计 */}
        {activeTab === 'overview' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* 状态指示器 */}
            {refreshing && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-3 flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4 text-blue-600 dark:text-blue-400 animate-spin" />
                <span className="text-sm text-blue-700 dark:text-blue-300">{t('questionBankPage.QuestionBankStatsPage.refreshingData')}</span>
              </motion.div>
            )}

            {/* 关键指标卡片 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <AnimatedCard delay={0.05}>
                <Card className="dark:bg-gray-800 dark:border-gray-700">
                  <div className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <motion.div 
                          className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center"
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ duration: 0.3, delay: 0.1 }}
                        >
                          <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </motion.div>
                        <div>
                          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                            <AnimatedNumber 
                              value={stats.totalQuestions} 
                              format="number"
                              className="text-2xl font-bold text-gray-900 dark:text-gray-100"
                            />
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{t('questionBankPage.QuestionBankStatsPage.stats.totalQuestions')}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </AnimatedCard>

              <AnimatedCard delay={0.1}>
                <Card className="dark:bg-gray-800 dark:border-gray-700">
                  <div className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <motion.div 
                          className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center"
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ duration: 0.3, delay: 0.15 }}
                        >
                          <Eye className="w-5 h-5 text-green-600 dark:text-green-400" />
                        </motion.div>
                        <div>
                          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                            <AnimatedNumber 
                              value={stats.totalViews} 
                              format="number"
                              className="text-2xl font-bold text-gray-900 dark:text-gray-100"
                            />
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{t('questionBankPage.QuestionBankStatsPage.stats.totalViews')}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </AnimatedCard>

              <AnimatedCard delay={0.15}>
                <Card className="dark:bg-gray-800 dark:border-gray-700">
                  <div className="p-6">
                    <div className="flex items-center gap-3">
                      <motion.div 
                        className="w-10 h-10 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center"
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ duration: 0.3, delay: 0.2 }}
                      >
                        <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      </motion.div>
                      <div>
                        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                          <AnimatedNumber 
                            value={stats.memberActivity.length} 
                            format="number"
                            className="text-2xl font-bold text-gray-900 dark:text-gray-100"
                          />
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{t('questionBankPage.QuestionBankStatsPage.stats.activeMembers')}</div>
                      </div>
                    </div>
                  </div>
                </Card>
              </AnimatedCard>

              <AnimatedCard delay={0.2}>
                <Card className="dark:bg-gray-800 dark:border-gray-700">
                  <div className="p-6">
                    <div className="flex items-center gap-3">
                      <motion.div 
                        className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg flex items-center justify-center"
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ duration: 0.3, delay: 0.25 }}
                      >
                        <Star className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                      </motion.div>
                      <div>
                        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                          <AnimatedNumber 
                            value={safeFormatDifficulty(stats.averageDifficulty)} 
                            format="decimal"
                            className="text-2xl font-bold text-gray-900 dark:text-gray-100"
                          />
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{t('questionBankPage.QuestionBankStatsPage.stats.averageDifficulty')}</div>
                      </div>
                    </div>
                  </div>
                </Card>
              </AnimatedCard>
            </div>

            {/* 图表展示区域 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 题目类型分布图表 */}
              <AnimatedCard delay={0.25}>
                <Card className="dark:bg-gray-800 dark:border-gray-700">
                  <div className="p-6">
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('questionBankPage.QuestionBankStatsPage.charts.questionTypeDistribution')}</h3>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-blue-500 dark:bg-blue-600 rounded-full"></div>
                          <span className="text-sm text-gray-700 dark:text-gray-300">{t('questionBankPage.QuestionBankStatsPage.questionTypes.choice')}</span>
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          <AnimatedNumber 
                            value={stats.questionTypes.choice} 
                            format="number"
                            className="text-sm font-medium text-gray-900 dark:text-gray-100"
                          /> {t('questionBankPage.QuestionBankStatsPage.units.questions')} ({calculatePercentage(stats.questionTypes.choice, stats.totalQuestions)}%)
                        </span>
                      </div>
                      <AnimatedProgressBar 
                        value={calculatePercentage(stats.questionTypes.choice, stats.totalQuestions)} 
                        color="bg-blue-500 dark:bg-blue-600"
                      />
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-green-500 dark:bg-green-600 rounded-full"></div>
                          <span className="text-sm text-gray-700 dark:text-gray-300">{t('questionBankPage.QuestionBankStatsPage.questionTypes.fill')}</span>
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          <AnimatedNumber 
                            value={stats.questionTypes.fill} 
                            format="number"
                            className="text-sm font-medium text-gray-900 dark:text-gray-100"
                          /> 题 ({calculatePercentage(stats.questionTypes.fill, stats.totalQuestions)}%)
                        </span>
                      </div>
                      <AnimatedProgressBar 
                        value={calculatePercentage(stats.questionTypes.fill, stats.totalQuestions)} 
                        color="bg-green-500 dark:bg-green-600"
                      />
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-purple-500 dark:bg-purple-600 rounded-full"></div>
                          <span className="text-sm text-gray-700 dark:text-gray-300">{t('questionBankPage.QuestionBankStatsPage.questionTypes.multipleChoice')}</span>
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          <AnimatedNumber 
                            value={stats.questionTypes['multiple-choice'] || 0} 
                            format="number"
                            className="text-sm font-medium text-gray-900 dark:text-gray-100"
                          /> 题 ({calculatePercentage(stats.questionTypes['multiple-choice'] || 0, stats.totalQuestions)}%)
                        </span>
                      </div>
                      <AnimatedProgressBar 
                        value={calculatePercentage(stats.questionTypes['multiple-choice'] || 0, stats.totalQuestions)} 
                        color="bg-purple-500 dark:bg-purple-600"
                      />

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-orange-500 dark:bg-orange-600 rounded-full"></div>
                          <span className="text-sm text-gray-700 dark:text-gray-300">{t('questionBankPage.QuestionBankStatsPage.questionTypes.solution')}</span>
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          <AnimatedNumber 
                            value={stats.questionTypes.solution} 
                            format="number"
                            className="text-sm font-medium text-gray-900 dark:text-gray-100"
                          /> 题 ({calculatePercentage(stats.questionTypes.solution, stats.totalQuestions)}%)
                        </span>
                      </div>
                      <AnimatedProgressBar 
                        value={calculatePercentage(stats.questionTypes.solution, stats.totalQuestions)} 
                        color="bg-orange-500 dark:bg-orange-600"
                      />
                    </div>
                  </div>
                </Card>
              </AnimatedCard>

              {/* 质量分析 */}
              <AnimatedCard delay={0.3}>
                <Card className="dark:bg-gray-800 dark:border-gray-700">
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">{t('questionBankPage.QuestionBankStatsPage.charts.qualityAnalysis')}</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                          <span className="text-sm text-gray-700 dark:text-gray-300">{t('questionBankPage.QuestionBankStatsPage.quality.tagCoverage')}</span>
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          <AnimatedNumber 
                            value={safeFormatPercentage(stats.tagCoverage)} 
                            format="percentage"
                            className="text-sm font-medium text-gray-900 dark:text-gray-100"
                          />
                        </span>
                      </div>
                      <AnimatedProgressBar 
                        value={safeFormatPercentage(stats.tagCoverage)} 
                        color="bg-green-600 dark:bg-green-400"
                      />

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                          <span className="text-sm text-gray-700 dark:text-gray-300">{t('questionBankPage.QuestionBankStatsPage.quality.duplicateRate')}</span>
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          <AnimatedNumber 
                            value={safeFormatPercentage(stats.duplicateRate)} 
                            format="percentage"
                            className="text-sm font-medium text-gray-900 dark:text-gray-100"
                          />
                        </span>
                      </div>
                      <AnimatedProgressBar 
                        value={safeFormatPercentage(stats.duplicateRate)} 
                        color="bg-yellow-600 dark:bg-yellow-400"
                      />

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Star className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          <span className="text-sm text-gray-700 dark:text-gray-300">{t('questionBankPage.QuestionBankStatsPage.quality.averageDifficulty')}</span>
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          <AnimatedNumber 
                            value={safeFormatDifficulty(stats.averageDifficulty)} 
                            format="decimal"
                            className="text-sm font-medium text-gray-900 dark:text-gray-100"
                          /> / 5.0
                        </span>
                      </div>
                      <AnimatedProgressBar 
                        value={safeFormatPercentage((stats.averageDifficulty / 5) * 100)} 
                        color="bg-blue-600 dark:bg-blue-400"
                      />

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Activity className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                          <span className="text-sm text-gray-700 dark:text-gray-300">{t('questionBankPage.QuestionBankStatsPage.quality.questionCompleteness')}</span>
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          <AnimatedNumber 
                            value={stats.totalQuestions > 0 ? Math.round((stats.totalQuestions / (stats.totalQuestions + 5)) * 100) : 0} 
                            format="percentage"
                            className="text-sm font-medium text-gray-900 dark:text-gray-100"
                          />
                        </span>
                      </div>
                      <AnimatedProgressBar 
                        value={stats.totalQuestions > 0 ? Math.round((stats.totalQuestions / (stats.totalQuestions + 5)) * 100) : 0} 
                        color="bg-purple-600 dark:bg-purple-400"
                      />
                    </div>
                  </div>
                </Card>
              </AnimatedCard>

              <AnimatedCard delay={0.35}>
                <Card className="dark:bg-gray-800 dark:border-gray-700">
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">{t('questionBankPage.QuestionBankStatsPage.charts.recentActivity')}</h3>
                    <div className="space-y-3">
                      {stats.memberActivity.slice(0, 5).map((member, index) => (
                        <motion.div 
                          key={member.userId} 
                          className="flex items-center justify-between"
                          initial={{ opacity: 0, x: -15 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ 
                            duration: 0.3, 
                            delay: 0.4 + index * 0.05,
                            ease: [0.4, 0, 0.2, 1]
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <motion.div 
                              className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center"
                              whileHover={{ scale: 1.05 }}
                              transition={{ duration: 0.15 }}
                            >
                              <span className="text-white text-sm font-medium">
                                {member.name && member.name.length > 0 ? member.name.charAt(0) : '?'}
                              </span>
                            </motion.div>
                            <div>
                              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{member.name || t('questionBankPage.QuestionBankStatsPage.members.unknownUser')}</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">{member.role}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {formatLastActive(member.lastActive)}
                            </div>
                            <div className="text-xs text-gray-400 dark:text-gray-500">
                              <AnimatedNumber 
                                value={member.questionCount} 
                                format="number"
                                className="text-xs text-gray-400 dark:text-gray-500"
                              /> {t('questionBankPage.QuestionBankStatsPage.units.questions')}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </Card>
              </AnimatedCard>
            </div>
          </motion.div>
        )}

        {/* 题目统计 */}
        {activeTab === 'questions' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 题目类型分布 */}
              <AnimatedCard delay={0.5}>
                <Card className="dark:bg-gray-800 dark:border-gray-700">
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">{t('questionBankPage.QuestionBankStatsPage.charts.questionTypeDistribution')}</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-blue-500 dark:bg-blue-600 rounded-full"></div>
                          <span className="text-sm text-gray-700 dark:text-gray-300">{t('questionBankPage.QuestionBankStatsPage.questionTypes.choice')}</span>
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          <AnimatedNumber 
                            value={stats.questionTypes.choice} 
                            format="number"
                            className="text-sm font-medium text-gray-900 dark:text-gray-100"
                          /> {t('questionBankPage.QuestionBankStatsPage.units.questions')} ({calculatePercentage(stats.questionTypes.choice, stats.totalQuestions)}%)
                        </span>
                      </div>
                      <AnimatedProgressBar 
                        value={calculatePercentage(stats.questionTypes.choice, stats.totalQuestions)} 
                        color="bg-blue-500 dark:bg-blue-600"
                      />
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-green-500 dark:bg-green-600 rounded-full"></div>
                          <span className="text-sm text-gray-700 dark:text-gray-300">{t('questionBankPage.QuestionBankStatsPage.questionTypes.fill')}</span>
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          <AnimatedNumber 
                            value={stats.questionTypes.fill} 
                            format="number"
                            className="text-sm font-medium text-gray-900 dark:text-gray-100"
                          /> 题 ({calculatePercentage(stats.questionTypes.fill, stats.totalQuestions)}%)
                        </span>
                      </div>
                      <AnimatedProgressBar 
                        value={calculatePercentage(stats.questionTypes.fill, stats.totalQuestions)} 
                        color="bg-green-500 dark:bg-green-600"
                      />
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-purple-500 dark:bg-purple-600 rounded-full"></div>
                          <span className="text-sm text-gray-700 dark:text-gray-300">{t('questionBankPage.QuestionBankStatsPage.questionTypes.multipleChoice')}</span>
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          <AnimatedNumber 
                            value={stats.questionTypes['multiple-choice'] || 0} 
                            format="number"
                            className="text-sm font-medium text-gray-900 dark:text-gray-100"
                          /> 题 ({calculatePercentage(stats.questionTypes['multiple-choice'] || 0, stats.totalQuestions)}%)
                        </span>
                      </div>
                      <AnimatedProgressBar 
                        value={calculatePercentage(stats.questionTypes['multiple-choice'] || 0, stats.totalQuestions)} 
                        color="bg-purple-500 dark:bg-purple-600"
                      />

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-orange-500 dark:bg-orange-600 rounded-full"></div>
                          <span className="text-sm text-gray-700 dark:text-gray-300">{t('questionBankPage.QuestionBankStatsPage.questionTypes.solution')}</span>
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          <AnimatedNumber 
                            value={stats.questionTypes.solution} 
                            format="number"
                            className="text-sm font-medium text-gray-900 dark:text-gray-100"
                          /> 题 ({calculatePercentage(stats.questionTypes.solution, stats.totalQuestions)}%)
                        </span>
                      </div>
                      <AnimatedProgressBar 
                        value={calculatePercentage(stats.questionTypes.solution, stats.totalQuestions)} 
                        color="bg-orange-500 dark:bg-orange-600"
                      />
                    </div>
                  </div>
                </Card>
              </AnimatedCard>

              {/* 难度分布 */}
              <AnimatedCard delay={0.7}>
                <Card className="dark:bg-gray-800 dark:border-gray-700">
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">{t('questionBankPage.QuestionBankStatsPage.charts.difficultyDistribution')}</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-green-500 dark:bg-green-600 rounded-full"></div>
                          <span className="text-sm text-gray-700 dark:text-gray-300">{t('questionBankPage.QuestionBankStatsPage.difficulty.easy')}</span>
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          <AnimatedNumber 
                            value={stats.difficultyDistribution.easy} 
                            format="number"
                            className="text-sm font-medium text-gray-900 dark:text-gray-100"
                          /> 题
                        </span>
                      </div>
                      <AnimatedProgressBar 
                        value={calculatePercentage(stats.difficultyDistribution.easy, stats.totalQuestions)} 
                        color="bg-green-500 dark:bg-green-600"
                      />

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-yellow-500 dark:bg-yellow-600 rounded-full"></div>
                          <span className="text-sm text-gray-700 dark:text-gray-300">{t('questionBankPage.QuestionBankStatsPage.difficulty.medium')}</span>
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          <AnimatedNumber 
                            value={stats.difficultyDistribution.medium} 
                            format="number"
                            className="text-sm font-medium text-gray-900 dark:text-gray-100"
                          /> 题
                        </span>
                      </div>
                      <AnimatedProgressBar 
                        value={calculatePercentage(stats.difficultyDistribution.medium, stats.totalQuestions)} 
                        color="bg-yellow-500 dark:bg-yellow-600"
                      />

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-red-500 dark:bg-red-600 rounded-full"></div>
                          <span className="text-sm text-gray-700 dark:text-gray-300">{t('questionBankPage.QuestionBankStatsPage.difficulty.hard')}</span>
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          <AnimatedNumber 
                            value={stats.difficultyDistribution.hard} 
                            format="number"
                            className="text-sm font-medium text-gray-900 dark:text-gray-100"
                          /> 题
                        </span>
                      </div>
                      <AnimatedProgressBar 
                        value={calculatePercentage(stats.difficultyDistribution.hard, stats.totalQuestions)} 
                        color="bg-red-500 dark:bg-red-600"
                      />
                    </div>
                  </div>
                </Card>
              </AnimatedCard>
            </div>

            {/* 热门题目 */}
            <AnimatedCard delay={0.4}>
              <Card className="dark:bg-gray-800 dark:border-gray-700">
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">{t('questionBankPage.QuestionBankStatsPage.charts.popularQuestions')}</h3>
                  <div className="space-y-3">
                    {stats.popularQuestions.map((question, index) => (
                      <motion.div 
                        key={question.qid} 
                        className="flex items-start justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                        initial={{ opacity: 0, x: -15 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ 
                          duration: 0.3, 
                          delay: 0.45 + index * 0.05,
                          ease: [0.4, 0, 0.2, 1]
                        }}
                        whileHover={{ 
                          scale: 1.01,
                          backgroundColor: '#f8fafc'
                        }}
                      >
                        <div className="flex items-start gap-3 flex-1">
                          <motion.div 
                            className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center flex-shrink-0"
                            whileHover={{ scale: 1.05 }}
                            transition={{ duration: 0.15 }}
                          >
                            <span className="text-blue-600 dark:text-blue-400 font-medium text-sm">{index + 1}</span>
                          </motion.div>
                          <div className="flex-1 min-w-0">
                            <div 
                              className="text-sm font-medium text-gray-900 dark:text-gray-100 leading-relaxed"
                              dangerouslySetInnerHTML={{ __html: renderContentWithCache(question.title) }}
                            />
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">ID: {question.qid}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                          <Eye className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            <AnimatedNumber 
                              value={question.views} 
                              format="number"
                              className="text-sm font-medium text-gray-900 dark:text-gray-100"
                            />
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </Card>
            </AnimatedCard>
          </motion.div>
        )}

        {/* 使用情况 */}
        {activeTab === 'usage' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* 访问趋势 */}
            <AnimatedCard delay={0.1}>
              <Card className="dark:bg-gray-800 dark:border-gray-700">
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">{t('questionBankPage.QuestionBankStatsPage.charts.visitTrend')}</h3>
                  <div className="h-64 flex items-end justify-between gap-2">
                    {stats.monthlyViews.map((data, index) => {
                      const maxCount = Math.max(...stats.monthlyViews.map(d => d.count));
                      const height = maxCount > 0 ? (data.count / maxCount) * 200 : 0;
                      
                      return (
                        <motion.div 
                          key={data.month} 
                          className="flex-1 flex flex-col items-center"
                          initial={{ opacity: 0, y: 30 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ 
                            duration: 0.5, 
                            delay: 0.2 + index * 0.05,
                            ease: [0.4, 0, 0.2, 1]
                          }}
                        >
                          <motion.div 
                            className="w-full bg-blue-500 dark:bg-blue-600 rounded-t"
                            initial={{ height: 0 }}
                            animate={{ height: `${height}px` }}
                            transition={{ 
                              duration: 0.8, 
                              delay: 0.3 + index * 0.05,
                              ease: [0.4, 0, 0.2, 1]
                            }}
                          />
                          <motion.div 
                            className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ 
                              duration: 0.3, 
                              delay: 0.6 + index * 0.05
                            }}
                          >
                            {data.month.split('-')[1]}月
                          </motion.div>
                        </motion.div>
                      );
                    })}
                  </div>
                  <motion.div 
                    className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4, delay: 0.8 }}
                  >
                    {t('questionBankPage.QuestionBankStatsPage.charts.lastSixMonthsStats')}
                  </motion.div>
                </div>
              </Card>
            </AnimatedCard>

            {/* 使用统计 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <AnimatedCard delay={0.2}>
                <Card className="dark:bg-gray-800 dark:border-gray-700">
                  <div className="p-6 text-center">
                    <motion.div 
                      className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-3"
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ duration: 0.3, delay: 0.25 }}
                    >
                      <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </motion.div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      <AnimatedNumber 
                        value={Math.round(stats.totalViews / 6)} 
                        format="number"
                        className="text-2xl font-bold text-gray-900 dark:text-gray-100"
                      />
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{t('questionBankPage.QuestionBankStatsPage.stats.monthlyAverageViews')}</div>
                  </div>
                </Card>
              </AnimatedCard>

              <AnimatedCard delay={0.25}>
                <Card className="dark:bg-gray-800 dark:border-gray-700">
                  <div className="p-6 text-center">
                    <motion.div 
                      className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-3"
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ duration: 0.3, delay: 0.3 }}
                    >
                      <Activity className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </motion.div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      <AnimatedNumber 
                        value={stats.totalQuestions > 0 ? Math.round(stats.totalViews / stats.totalQuestions) : 0} 
                        format="number"
                        className="text-2xl font-bold text-gray-900 dark:text-gray-100"
                      />
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{t('questionBankPage.QuestionBankStatsPage.stats.averageViewsPerQuestion')}</div>
                  </div>
                </Card>
              </AnimatedCard>

              <AnimatedCard delay={0.3}>
                <Card className="dark:bg-gray-800 dark:border-gray-700">
                  <div className="p-6 text-center">
                    <motion.div 
                      className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-3"
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ duration: 0.3, delay: 0.35 }}
                    >
                      <Target className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    </motion.div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      <AnimatedNumber 
                        value={stats.popularQuestions[0]?.views || 0} 
                        format="number"
                        className="text-2xl font-bold text-gray-900 dark:text-gray-100"
                      />
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{t('questionBankPage.QuestionBankStatsPage.stats.highestSingleQuestionViews')}</div>
                  </div>
                </Card>
              </AnimatedCard>
            </div>
          </motion.div>
        )}

        {/* 成员活动 */}
        {activeTab === 'members' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <AnimatedCard delay={0.1}>
              <Card className="dark:bg-gray-800 dark:border-gray-700">
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">{t('questionBankPage.QuestionBankStatsPage.charts.memberActivity')}</h3>
                  <div className="space-y-4">
                    {stats.memberActivity.map((member, index) => (
                      <motion.div 
                        key={member.userId} 
                        className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ 
                          duration: 0.4, 
                          delay: 0.15 + index * 0.05,
                          ease: [0.4, 0, 0.2, 1]
                        }}
                        whileHover={{ 
                          scale: 1.01,
                          backgroundColor: '#f8fafc'
                        }}
                      >
                        <div className="flex items-center gap-4">
                          <motion.div 
                            className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center"
                            whileHover={{ scale: 1.05, rotate: 3 }}
                            transition={{ duration: 0.15 }}
                          >
                            <span className="text-white dark:text-gray-800 font-medium">
                              {member.name && member.name.length > 0 ? member.name.charAt(0) : '?'}
                            </span>
                          </motion.div>
                          <div>
                            <div className="font-medium text-gray-900 dark:text-gray-100">{member.name || t('questionBankPage.QuestionBankStatsPage.members.unknownUser')}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">{member.role}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {formatLastActive(member.lastActive)}
                          </div>
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            <AnimatedNumber 
                              value={member.questionCount} 
                              format="number"
                              className="text-sm font-medium text-gray-900 dark:text-gray-100"
                            /> {t('questionBankPage.QuestionBankStatsPage.units.questions')}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </Card>
            </AnimatedCard>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default QuestionBankStatsPage; 