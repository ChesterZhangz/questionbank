import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Share2, 
  Heart, 
  Edit, 
  ChevronLeft, 
  ChevronRight,
  Eye,
  BookOpen,
  User,
  Clock,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Question } from '../../types';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { questionAPI } from '../../services/api';
import { questionEvaluationAPI } from '../../services/questionEvaluationAPI';
import { autoAIAnalysisService } from '../../services/autoAIAnalysisService';
import { useModal } from '../../hooks/useModal';
import { useTranslation } from '../../hooks/useTranslation';

import MagicTextTransition from '../animations/MagicTextTransition';
// 导入LaTeXPreview组件，使用与QuestionCard相同的渲染逻辑
import LaTeXPreview from '../editor/preview/LaTeXPreview';
import TikZPreview from '../tikz/core/TikZPreview';
import AbilityRadarChart from './AbilityRadarChart';
import './QuestionView.css';

interface QuestionViewProps {
  isOpen: boolean;
  onClose: () => void;
  questions: Question[];
  currentIndex: number;
  bid: string;
  userRole: string;
  onDelete?: (qid: string) => void;
  onFavorite?: (qid: string, isFavorite: boolean) => void;
  favorites?: Set<string>;
}

const QuestionView: React.FC<QuestionViewProps> = ({
  isOpen,
  onClose,
  questions,
  currentIndex,
  bid,
  userRole,
  onFavorite,
  favorites = new Set()
}) => {
  // 弹窗状态管理
  const { showSuccessRightSlide, showErrorRightSlide } = useModal();
  const { t } = useTranslation();

  const navigate = useNavigate();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(currentIndex);
  const [isSharing, setIsSharing] = useState(false);
  const [isFavoriting, setIsFavoriting] = useState(false);
  const [activeTab, setActiveTab] = useState<'question' | 'solution' | 'analysis'>('question');
  const [slideDirection, setSlideDirection] = useState<'left' | 'right' | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [relatedQuestions, setRelatedQuestions] = useState<Question[]>([]);
  const [loadingRelated, setLoadingRelated] = useState(false);
  const [relatedError, setRelatedError] = useState<string | null>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [animationKey, setAnimationKey] = useState(0);
  
  // AI分析状态
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  

  
  // 自动分析队列状态
  const [queueStatus, setQueueStatus] = useState<any>(null);
  
  // 答案显示控制
  const [showAnswer, setShowAnswer] = useState(false);
  
  // 本地收藏状态管理
  const [localFavorites, setLocalFavorites] = useState<Set<string>>(favorites);
  
  // 当前题目数据状态（用于实时更新收藏数等）
  const [currentQuestionData, setCurrentQuestionData] = useState<Question | null>(null);
  
  // 处理分类数据，兼容字符串和数组格式
  const getCategoryArray = useCallback((category: string | string[] | undefined): string[] => {
    if (!category) return [];
    if (Array.isArray(category)) return category;
    // 如果是字符串，按逗号分割
    return category.split(',').map(item => item.trim()).filter(item => item.length > 0);
  }, []);
  
  // TikZ预览状态
  const [previewTikZ, setPreviewTikZ] = useState<{ code: string; format: 'svg' | 'png' } | null>(null);

  // 获取当前题目
  const currentQuestion = currentQuestionData || questions[currentQuestionIndex];
  
  // 初始化当前题目数据
  useEffect(() => {
    if (questions[currentQuestionIndex]) {
      setCurrentQuestionData(questions[currentQuestionIndex]);
    }
  }, [questions, currentQuestionIndex]);

  // 当弹窗打开时，设置当前题目索引
  useEffect(() => {
    if (isOpen) {
      setCurrentQuestionIndex(currentIndex);
      document.body.style.overflow = 'hidden';
      fetchRelatedQuestions();
      
      // 增加访问量
      if (currentQuestion?.qid) {
        questionAPI.addView(currentQuestion.qid).catch(() => {
          // 警告日志已清理
        });
      }
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, currentIndex]);

  // 获取AI分析
  const fetchAIAnalysis = useCallback(async (forceRefresh = false) => {
    if (!currentQuestion?.qid) return;
    
    // 检查是否已有完整的AI分析结果，且不强制刷新
    if (!forceRefresh && 
        currentQuestion.aiAnalysis?.evaluation && 
        currentQuestion.aiAnalysis?.coreAbilities &&
        typeof currentQuestion.aiAnalysis.evaluation.overallRating === 'number' &&  // 必须是数字类型
        currentQuestion.aiAnalysis.evaluation.evaluationReasoning &&
        currentQuestion.aiAnalysis.evaluation.evaluationReasoning.trim() !== '' &&  // 不能是空字符串
        typeof currentQuestion.aiAnalysis.coreAbilities.logicalThinking === 'number' &&  // 必须是数字类型
        typeof currentQuestion.aiAnalysis.coreAbilities.mathematicalIntuition === 'number' &&
        typeof currentQuestion.aiAnalysis.coreAbilities.problemSolving === 'number' &&
        typeof currentQuestion.aiAnalysis.coreAbilities.analyticalSkills === 'number' &&
        typeof currentQuestion.aiAnalysis.coreAbilities.creativeThinking === 'number' &&
        typeof currentQuestion.aiAnalysis.coreAbilities.computationalSkills === 'number') {
      setAiAnalysis(currentQuestion.aiAnalysis);
      return;
    }
    
    setLoadingAnalysis(true);
    setAnalysisError(null);
    
    try {
      // 首先尝试从后端获取已保存的分析结果
      const savedResult = await questionEvaluationAPI.getSavedAnalysis(currentQuestion.qid);
      
      if (savedResult.hasSavedAnalysis && savedResult.analysis) {
        setAiAnalysis(savedResult.analysis);
        
        setLoadingAnalysis(false);
        return;
      }
      
      // 如果没有保存的分析结果，尝试从API获取
      const analysis = await questionEvaluationAPI.getCompleteAnalysis(currentQuestion.qid, currentQuestion);
      setAiAnalysis(analysis);
      
      
    } catch (error: any) {
      console.error('AI分析获取失败:', error);
      setAnalysisError(error.message || 'AI分析获取失败');
      
      // 如果API获取失败，尝试自动启动分析
      if (!currentQuestion.aiAnalysis?.evaluation) {
        try {
          await autoAIAnalysisService.analyzeImmediately(currentQuestion);
          showSuccessRightSlide('AI分析已启动', '题目已加入AI分析队列，分析完成后将自动保存');
        } catch (autoError: any) {
          console.error('启动自动AI分析失败:', autoError);
          showErrorRightSlide('启动AI分析失败', autoError.message || '请稍后重试');
        }
      }
    } finally {
      setLoadingAnalysis(false);
    }
  }, [currentQuestion?.qid]);

  // 获取AI分析并在需要时启动分析
  const fetchAIAnalysisAndStartIfNeeded = useCallback(async () => {
    if (!currentQuestion?.qid) return;
    
    // 首先检查前端缓存 - 必须同时有evaluation和coreAbilities才算完整
    if (currentQuestion.aiAnalysis?.evaluation && 
        currentQuestion.aiAnalysis?.coreAbilities &&
        typeof currentQuestion.aiAnalysis.evaluation.overallRating === 'number' &&  // 必须是数字类型
        currentQuestion.aiAnalysis.evaluation.evaluationReasoning &&
        currentQuestion.aiAnalysis.evaluation.evaluationReasoning.trim() !== '' &&  // 不能是空字符串
        typeof currentQuestion.aiAnalysis.coreAbilities.logicalThinking === 'number' &&  // 必须是数字类型
        typeof currentQuestion.aiAnalysis.coreAbilities.mathematicalIntuition === 'number' &&
        typeof currentQuestion.aiAnalysis.coreAbilities.problemSolving === 'number' &&
        typeof currentQuestion.aiAnalysis.coreAbilities.analyticalSkills === 'number' &&
        typeof currentQuestion.aiAnalysis.coreAbilities.creativeThinking === 'number' &&
        typeof currentQuestion.aiAnalysis.coreAbilities.computationalSkills === 'number') {
      setAiAnalysis(currentQuestion.aiAnalysis);
      return;
    }
    
    setLoadingAnalysis(true);
    setAnalysisError(null);
    
    try {
      // 尝试从后端获取已保存的分析结果
      const savedResult = await questionEvaluationAPI.getSavedAnalysis(currentQuestion.qid);
      
      // 检查数据完整性：必须同时有evaluation和coreAbilities，且数据类型正确
      if (savedResult.hasSavedAnalysis && 
          savedResult.analysis &&
          savedResult.analysis.evaluation &&
          savedResult.analysis.coreAbilities &&
          typeof savedResult.analysis.evaluation.overallRating === 'number' &&  // 必须是数字类型
          savedResult.analysis.evaluation.evaluationReasoning &&
          savedResult.analysis.evaluation.evaluationReasoning.trim() !== '' &&  // 不能是空字符串
          typeof savedResult.analysis.coreAbilities.logicalThinking === 'number' &&  // 必须是数字类型
          typeof savedResult.analysis.coreAbilities.mathematicalIntuition === 'number' &&
          typeof savedResult.analysis.coreAbilities.problemSolving === 'number' &&
          typeof savedResult.analysis.coreAbilities.analyticalSkills === 'number' &&
          typeof savedResult.analysis.coreAbilities.creativeThinking === 'number' &&
          typeof savedResult.analysis.coreAbilities.computationalSkills === 'number') {
        setAiAnalysis(savedResult.analysis);
        setLoadingAnalysis(false);
        return;
      }
      
      setLoadingAnalysis(false);
      await startAutoAnalysis();
      
    } catch (error: any) {
      console.error('获取AI分析失败，启动自动分析:', error);
      setAnalysisError(error.message || 'AI分析获取失败');
      setLoadingAnalysis(false);
      
      // 如果获取失败，启动自动分析
      await startAutoAnalysis();
    }
  }, [currentQuestion?.qid]);

  // 自动启动AI分析
  const startAutoAnalysis = useCallback(async () => {
    if (!currentQuestion?.qid) return;
    
    // 如果已有完整的分析结果，不需要重新分析
    if (currentQuestion.aiAnalysis?.evaluation && 
        currentQuestion.aiAnalysis?.coreAbilities &&
        typeof currentQuestion.aiAnalysis.evaluation.overallRating === 'number' &&  // 必须是数字类型
        currentQuestion.aiAnalysis.evaluation.evaluationReasoning &&
        currentQuestion.aiAnalysis.evaluation.evaluationReasoning.trim() !== '' &&  // 不能是空字符串
        typeof currentQuestion.aiAnalysis.coreAbilities.logicalThinking === 'number' &&  // 必须是数字类型
        typeof currentQuestion.aiAnalysis.coreAbilities.mathematicalIntuition === 'number' &&
        typeof currentQuestion.aiAnalysis.coreAbilities.problemSolving === 'number' &&
        typeof currentQuestion.aiAnalysis.coreAbilities.analyticalSkills === 'number' &&
        typeof currentQuestion.aiAnalysis.coreAbilities.creativeThinking === 'number' &&
        typeof currentQuestion.aiAnalysis.coreAbilities.computationalSkills === 'number') {
      return;
    }
    
    try {
      // 添加到自动分析队列
      await autoAIAnalysisService.analyzeImmediately(currentQuestion);
      
      // 显示提示信息
      showSuccessRightSlide('AI分析已启动', '题目已加入AI分析队列，分析完成后将自动保存');
      
    } catch (error: any) {
      console.error('启动自动AI分析失败:', error);
      showErrorRightSlide('启动AI分析失败', error.message || '请稍后重试');
    }
  }, [currentQuestion]);

  // 更新队列状态
  const updateQueueStatus = useCallback(() => {
    const status = autoAIAnalysisService.getQueueStatus();
    setQueueStatus(status);
  }, []);

  // 监听分析完成事件
  useEffect(() => {
    const handleAnalysisComplete = (questionId: string, analysis: any) => {
      if (questionId === currentQuestion?.qid) {
        setAiAnalysis(analysis);
        setLoadingAnalysis(false);
        setAnalysisError(null);
        
        // 更新队列状态
        updateQueueStatus();
        
        // 显示成功提示
        showSuccessRightSlide('AI分析完成', '题目分析已完成并自动保存到后端');
      }
    };

    const handleAnalysisFailed = (questionId: string, error: any) => {
      if (questionId === currentQuestion?.qid) {
        console.error('题目AI分析失败:', questionId, error);
        setAnalysisError(error.message || 'AI分析失败');
        setLoadingAnalysis(false);
        
        // 更新队列状态
        updateQueueStatus();
      }
    };

    // 注册事件监听器
    autoAIAnalysisService.onAnalysisComplete(handleAnalysisComplete);
    autoAIAnalysisService.onAnalysisFailed(handleAnalysisFailed);

    // 定期更新队列状态
    const interval = setInterval(updateQueueStatus, 5000);

    return () => {
      autoAIAnalysisService.removeListener('analysisComplete', handleAnalysisComplete);
      autoAIAnalysisService.removeListener('analysisFailed', handleAnalysisFailed);
      clearInterval(interval);
    };
  }, [currentQuestion?.qid, updateQueueStatus]);



  // 获取相关题目
  const fetchRelatedQuestions = useCallback(async () => {
    if (!currentQuestion?.qid) return;
    
    setLoadingRelated(true);
    setRelatedError(null);
    
    try {
      const response = await questionAPI.getRelatedQuestions(currentQuestion.qid, { limit: 3, excludeCurrent: true });
      if (response.data.success) {
        setRelatedQuestions(response.data.questions || []);
      } else {
        setRelatedError('获取相关题目失败');
      }
    } catch (error) {
      // 错误日志已清理
      setRelatedError('获取相关题目失败');
    } finally {
      setLoadingRelated(false);
    }
  }, [currentQuestion]);

  // 处理上一题
  const handlePrevious = useCallback(() => {
    if (currentQuestionIndex > 0 && !isTransitioning) {
      setIsTransitioning(true);
      setSlideDirection('right');
      setAnimationKey(prev => prev + 1);
      
      const newIndex = currentQuestionIndex - 1;
      setCurrentQuestionIndex(newIndex);
      
      // 增加访问量
      if (questions[newIndex]?.qid) {
        questionAPI.addView(questions[newIndex].qid).catch(() => {
          // 警告日志已清理
        });
      }
      
      setTimeout(() => {
        setSlideDirection(null);
        setIsTransitioning(false);
      }, 400);
    }
  }, [currentQuestionIndex, isTransitioning, questions]);

  // 处理下一题
  const handleNext = useCallback(() => {
    if (currentQuestionIndex < questions.length - 1 && !isTransitioning) {
      setIsTransitioning(true);
      setSlideDirection('left');
      setAnimationKey(prev => prev + 1);
      
      const newIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(newIndex);
      
      // 增加访问量
      if (questions[newIndex]?.qid) {
        questionAPI.addView(questions[newIndex].qid).catch(() => {
          // 警告日志已清理
        });
      }
      
      setTimeout(() => {
        setSlideDirection(null);
        setIsTransitioning(false);
      }, 400);
    }
  }, [currentQuestionIndex, isTransitioning, questions]);

  // 当题目切换时，重新获取相关题目和AI分析
  useEffect(() => {
    if (isOpen && currentQuestion?.qid) {
      fetchRelatedQuestions();
      // 先获取AI分析，如果没有数据再启动分析
      fetchAIAnalysisAndStartIfNeeded();
    }
  }, [currentQuestionIndex, isOpen, fetchRelatedQuestions]);


  // 处理键盘事件
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'Escape':
          event.preventDefault();
          onClose();
          break;
        case 'ArrowLeft':
          event.preventDefault();
          handlePrevious();
          break;
        case 'ArrowRight':
          event.preventDefault();
          handleNext();
          break;
        case 'e':
        case 'E':
          if ((event.ctrlKey || event.metaKey) && (userRole === 'creator' || userRole === 'manager' || userRole === 'collaborator')) {
            event.preventDefault();
            handleEdit();
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, userRole, handlePrevious, handleNext]);

  // 分享功能
  const handleShare = async () => {
    if (!currentQuestion) return;
    
    setIsSharing(true);
    try {
      const shareData = {
        title: `题目 ${currentQuestion.qid}`,
        text: `${currentQuestion.content?.stem}\n\n来源: ${currentQuestion.source || '未知'}\n难度: ${getDifficultyText(currentQuestion.difficulty)}`,
        url: `${window.location.origin}/question-banks/${bid}/questions/${currentQuestion.qid}`
      };

      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        const shareText = `${shareData.title}\n\n${shareData.text}\n\n${shareData.url}`;
        await navigator.clipboard.writeText(shareText);
        showSuccessRightSlide('复制成功', '题目信息已复制到剪贴板');
      }
    } catch (error) {
      // 错误日志已清理
      showErrorRightSlide('分享失败', '分享失败，请重试');
    } finally {
      setIsSharing(false);
    }
  };

  // 收藏功能
  const handleFavorite = async () => {
    if (!currentQuestion) return;
    
    setIsFavoriting(true);
    try {
      // 直接调用后端API
      const response = await questionAPI.toggleFavorite(currentQuestion.qid);
      
      if (response.data.success) {
        // 更新本地收藏状态
        setLocalFavorites(prev => {
          const newFavorites = new Set(prev);
          if (response.data.isFavorited) {
            newFavorites.add(currentQuestion.qid);
          } else {
            newFavorites.delete(currentQuestion.qid);
          }
          return newFavorites;
        });
        
        // 通知父组件（如果提供了回调）
        if (onFavorite) {
          await onFavorite(currentQuestion.qid, response.data.isFavorited);
        }
        
        // 显示提示
        showSuccessRightSlide('收藏成功', response.data.isFavorited ? '已添加到收藏' : '已取消收藏');
        
        // 直接使用返回的收藏数更新本地数据
        if (currentQuestionData) {
          setCurrentQuestionData({
            ...currentQuestionData,
            favorites: Array(response.data.favoritesCount).fill('user-id') // 创建对应长度的数组
          });
        }
      } else {
        showErrorRightSlide('收藏失败', '收藏操作失败，请重试');
      }
    } catch (error) {
      // 错误日志已清理
      showErrorRightSlide('收藏失败', '收藏操作失败，请重试');
    } finally {
      setIsFavoriting(false);
    }
  };

  // 编辑功能
  const handleEdit = () => {
    if (!currentQuestion) return;
    
    // 关闭当前弹窗
    onClose();
    
    // 延迟导航，确保弹窗关闭动画完成
    setTimeout(() => {
      navigate(`/question-banks/${bid}/questions/${currentQuestion.qid}/edit`);
    }, 300);
  };

  // 题目类型文本
  const getQuestionTypeText = (type: string) => {
    switch (type) {
      case 'choice': return t('question.questionCard.questionType.choice');
      case 'multiple-choice': return t('question.questionCard.questionType.multipleChoice');
      case 'fill': return t('question.questionCard.questionType.fill');
      case 'solution': return t('question.questionCard.questionType.solution');
      default: return t('question.questionCard.questionType.unknown');
    }
  };

  // 题目类型颜色
  const getQuestionTypeColor = (type: string) => {
    switch (type) {
      case 'choice': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200';
      case 'multiple-choice': return 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200';
      case 'fill': return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200';
      case 'solution': return 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200';
      default: return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200';
    }
  };

  // 难度颜色
  const getDifficultyColor = (difficulty: number) => {
    switch (difficulty) {
      case 1: return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30';
      case 2: return 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30';
      case 3: return 'text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30';
      case 4: return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30';
      case 5: return 'text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30';
      default: return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700';
    }
  };

  // 难度文本
  const getDifficultyText = (difficulty: number) => {
    switch (difficulty) {
      case 1: return t('question.questionCard.difficult_level.easy');
      case 2: return t('question.questionCard.difficult_level.mediumEasy');
      case 3: return t('question.questionCard.difficult_level.medium');
      case 4: return t('question.questionCard.difficult_level.mediumHard');
      case 5: return t('question.questionCard.difficult_level.hard');
      default: return t('question.questionCard.questionType.unknown');
    }
  };
  // 难度星级
  const getDifficultyStars = (difficulty: number) => {
    return '★'.repeat(difficulty) + '☆'.repeat(5 - difficulty);
  };

  // TikZ预览处理


  // 查看相关题目
  const handleViewRelatedQuestion = (qid: string) => {
    const relatedIndex = questions.findIndex(q => q.qid === qid);
    if (relatedIndex !== -1) {
      setCurrentQuestionIndex(relatedIndex);
      setTimeout(() => {
        const element = document.querySelector(`[data-question-index="${relatedIndex}"]`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    } else {
      // 修改URL格式，使用通用的题目查看页面
      window.open(`/questions/${qid}/view`, '_blank');
    }
  };

  // 处理滚动事件
  const handleScroll = useCallback(() => {
    if (scrollContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
      const progress = scrollTop / (scrollHeight - clientHeight);
      setScrollProgress(progress);
    }
  }, []);

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll);
      return () => scrollContainer.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

  if (!currentQuestion) {
    return null;
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[9998] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm question-view-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className="question-view-container w-full max-w-7xl h-[90vh] rounded-2xl overflow-hidden"
            initial={{ scale: 0.98, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.98, opacity: 0, y: 15 }}
            transition={{ duration: 0.2 }}
          >
            {/* 头部 */}
            <div className="flex items-center justify-between p-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  {t('question.questionView.title')}
                </h2>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {currentQuestionIndex + 1} / {questions.length}
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                {/* 分享按钮 */}
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Button
                    onClick={handleShare}
                    disabled={isSharing}
                    variant="outline"
                    size="sm"
                    className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                  >
                    <Share2 className="w-5 h-5" />
                  </Button>
                </motion.div>
                
                {/* 收藏按钮 */}
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Button
                    onClick={handleFavorite}
                    disabled={isFavoriting}
                    variant="outline"
                    size="sm"
                    className={`${
                      localFavorites.has(currentQuestion?.qid || '')
                        ? 'text-red-500 dark:text-red-400 border-red-300 dark:border-red-600'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${localFavorites.has(currentQuestion?.qid || '') ? 'fill-current' : ''}`} />
                  </Button>
                </motion.div>
                
                {/* 编辑按钮 */}
                {(userRole === 'creator' || userRole === 'manager' || userRole === 'collaborator') && (
                  <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                    <Button
                      onClick={handleEdit}
                      variant="outline"
                      size="sm"
                      className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                    >
                      <Edit className="w-5 h-5" />
                    </Button>
                  </motion.div>
                )}
                
                {/* 关闭按钮 */}
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Button
                    onClick={onClose}
                    variant="outline"
                    size="sm"
                    className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-400"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </motion.div>
              </div>
            </div>

            {/* 主要内容区域 */}
            <div className="flex-1 overflow-hidden">
              <div className="h-full flex">
                {/* 左侧导航 */}
                <div className="w-16 bg-gray-50 dark:bg-gray-800 flex flex-col items-center justify-center space-y-4 flex-shrink-0">
                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    initial={{ opacity: 0, scale: 0.8, x: -15 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    transition={{ duration: 0.15, delay: 0.1, ease: "easeOut" }}
                  >
                    <Button
                      onClick={handlePrevious}
                      disabled={currentQuestionIndex === 0 || isTransitioning}
                      variant="outline"
                      size="sm"
                      className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-100"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </Button>
                  </motion.div>
                  
                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    initial={{ opacity: 0, scale: 0.8, x: 15 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    transition={{ duration: 0.15, delay: 0.15, ease: "easeOut" }}
                  >
                    <Button
                      onClick={handleNext}
                      disabled={currentQuestionIndex === questions.length - 1 || isTransitioning}
                      variant="outline"
                      size="sm"
                      className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-100"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </Button>
                  </motion.div>
                </div>

                {/* 内容区域 */}
                <div className="flex-1 overflow-y-auto scrollbar-enhanced">
                  <div className="p-6">
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
                      {/* 主要内容 */}
                      <div className="xl:col-span-2">
                        <motion.div
                          key={animationKey}
                          className="question-card-enhanced h-[calc(90vh-200px)] overflow-hidden"
                          initial={{ 
                            opacity: 0, 
                            x: slideDirection === 'left' ? -15 : slideDirection === 'right' ? 15 : 0,
                            scale: 0.99
                          }}
                          animate={{ 
                            opacity: 1, 
                            x: 0,
                            scale: 1
                          }}
                          transition={{ 
                            duration: 0.15
                          }}
                        >
                          <Card className="h-full flex flex-col">
                            <div className="p-6 flex-1 flex flex-col overflow-hidden">
                              {/* 题目信息头部 */}
                              <motion.div 
                                className="flex items-center justify-between mb-6"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.08, ease: "easeOut" }}
                              >
                                <div className="flex items-center space-x-3">
                                  <motion.span 
                                    className={`px-3 py-1 rounded-full text-sm font-medium ${getQuestionTypeColor(currentQuestion.type)}`}
                                    initial={{ opacity: 0, scale: 0.8, x: -10 }}
                                    animate={{ opacity: 1, scale: 1, x: 0 }}
                                    transition={{ duration: 0.08, delay: 0.02, ease: "easeOut" }}
                                  >
                                    {getQuestionTypeText(currentQuestion.type)}
                                  </motion.span>
                                  <div className="flex items-center space-x-2">
                                    <motion.span 
                                      className="difficulty-stars-enhanced text-sm"
                                      initial={{ opacity: 0, scale: 0.8, x: -8 }}
                                      animate={{ opacity: 1, scale: 1, x: 0 }}
                                      transition={{ duration: 0.08, delay: 0.04, ease: "easeOut" }}
                                    >
                                      {getDifficultyStars(currentQuestion.difficulty)}
                                    </motion.span>
                                    <motion.span 
                                      className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(currentQuestion.difficulty)}`}
                                      initial={{ opacity: 0, scale: 0.8, x: -6 }}
                                      animate={{ opacity: 1, scale: 1, x: 0 }}
                                      transition={{ duration: 0.08, delay: 0.06, ease: "easeOut" }}
                                    >
                                      {getDifficultyText(currentQuestion.difficulty)}
                                    </motion.span>
                                  </div>
                                </div>
                                
                                {/* 题目出处 */}
                                {currentQuestion.source && (
                                  <motion.div 
                                    className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400"
                                    initial={{ opacity: 0, scale: 0.9, x: 10 }}
                                    animate={{ opacity: 1, scale: 1, x: 0 }}
                                    transition={{ duration: 0.08, delay: 0.08, ease: "easeOut" }}
                                  >
                                    <motion.span 
                                      className="font-medium"
                                      initial={{ opacity: 0, scale: 0.8 }}
                                      animate={{ opacity: 1, scale: 1 }}
                                      transition={{ duration: 0.06, delay: 0.1, ease: "easeOut" }}
                                    >
                                      {t('question.questionCard.source')}:
                                    </motion.span>
                                    <motion.span 
                                      className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-md"
                                      initial={{ opacity: 0, scale: 0.8 }}
                                      animate={{ opacity: 1, scale: 1 }}
                                      transition={{ duration: 0.06, delay: 0.12, ease: "easeOut" }}
                                    >
                                      {currentQuestion.source}
                                    </motion.span>
                                  </motion.div>
                                )}
                              </motion.div>

                              {/* 题目标签 */}
                              <motion.div 
                                className="mb-6 space-y-3"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.08, delay: 0.1, ease: "easeOut" }}
                              >
                                {(() => {
                                  const categories = getCategoryArray(currentQuestion.category);
                                  const tags = currentQuestion.tags || [];
                                  const allTags = [...categories, ...tags];
                                  
                                  return allTags.length > 0 ? (
                                  <div className="flex flex-wrap gap-2">
                                        {allTags.map((tag, index) => {
                                          // 判断标签类型：前几个是小题型，后面是知识点
                                          const isCategory = index < categories.length;
                                          const tagClass = isCategory ? 'category-tag' : 'knowledge-tag';
                                          
                                          return (
                                            <motion.span
                                        key={`tag-${index}`}
                                              className={`${tagClass} inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200`}
                                              initial={{ opacity: 0, scale: 0.7, y: 5 }}
                                              animate={{ opacity: 1, scale: 1, y: 0 }}
                                              transition={{ 
                                                duration: 0.06, 
                                                delay: 0.14 + index * 0.02, 
                                                ease: "easeOut" 
                                              }}
                                      >
                                        {tag}
                                            </motion.span>
                                          );
                                        })}
                                  </div>
                                  ) : null;
                                })()}
                              </motion.div>

                              {/* 标签页 */}
                              <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
                                <nav className="-mb-px flex space-x-8">
                                  <motion.button
                                    onClick={() => setActiveTab('question')}
                                    className={`tab-button-enhanced py-2 px-1 border-b-2 font-medium text-sm transition-all duration-150 ${
                                      activeTab === 'question'
                                        ? 'active border-blue-500 text-blue-600 dark:text-blue-400'
                                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                                    }`}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                  >
                                    {t('question.questionView.tabs.question')}
                                  </motion.button>
                                  <motion.button
                                    onClick={() => setActiveTab('solution')}
                                    className={`tab-button-enhanced py-2 px-1 border-b-2 font-medium text-sm transition-all duration-150 ${
                                      activeTab === 'solution'
                                        ? 'active border-blue-500 text-blue-600 dark:text-blue-400'
                                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                                    }`}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                  >
                                    {t('question.questionView.tabs.solution')}
                                  </motion.button>
                                  <motion.button
                                    onClick={() => setActiveTab('analysis')}
                                    className={`tab-button-enhanced py-2 px-1 border-b-2 font-medium text-sm transition-all duration-150 ${
                                      activeTab === 'analysis'
                                        ? 'active border-blue-500 text-blue-600 dark:text-blue-400'
                                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                                    }`}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                  >
                                    {t('question.questionView.tabs.analysis')}
                                  </motion.button>
                                </nav>
                              </div>

                              {/* 标签页内容 */}
                              <div className="flex-1 overflow-y-auto scrollbar-enhanced">
                                <AnimatePresence mode="wait">
                                  {activeTab === 'question' && (
                                    <motion.div
                                      key={`question-${animationKey}`}
                                      initial={{ opacity: 0, y: 8 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      exit={{ opacity: 0, y: -8 }}
                                      transition={{ duration: 0.12 }}
                                    >
                                      {/* 题目内容 */}
                                      <motion.div 
                                        className="mb-6"
                                        initial={{ opacity: 0, scale: 0.95, y: 8 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        transition={{ duration: 0.08, delay: 0.16, ease: "easeOut" }}
                                      >
                                        <motion.h3 
                                          className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4"
                                          initial={{ opacity: 0, scale: 0.9, x: -8 }}
                                          animate={{ opacity: 1, scale: 1, x: 0 }}
                                          transition={{ duration: 0.08, delay: 0.18, ease: "easeOut" }}
                                        >
                                          {t('question.questionView.content.title')}
                                        </motion.h3>
                                        <MagicTextTransition>
                                          <LaTeXPreview 
                                            content={currentQuestion?.content?.stem || '题目内容缺失'} 
                                            config={{ 
                                              mode: 'full',
                                              features: {
                                                markdown: true,
                                                questionSyntax: true,
                                                autoNumbering: true,
                                                errorHandling: 'lenient'
                                              },
                                              styling: {
                                                fontSize: '1rem',
                                                lineHeight: '1.6',
                                                maxWidth: '100%'
                                              }
                                            }}
                                            variant="compact"
                                            showTitle={false}
                                            className="question-view-latex-content text-gray-700 dark:text-gray-300 leading-relaxed prose max-w-none dark:prose-invert"
                                            maxWidth="max-w-none"
                                          />
                                        </MagicTextTransition>
                                        
                                                                         {/* 题目图片和TikZ显示 */}
                                        {(() => { return null; })()}
                                 {((currentQuestion?.images && currentQuestion.images.length > 0) || (currentQuestion?.tikzCodes && currentQuestion.tikzCodes.length > 0)) && (
                                          <div className="mt-4 space-y-3">
                                            {/* 媒体内容标题 */}
                                            <motion.div 
                                              className="flex items-center space-x-2 mb-2"
                                              initial={{ opacity: 0, scale: 0.9, y: 5 }}
                                              animate={{ opacity: 1, scale: 1, y: 0 }}
                                              transition={{ duration: 0.08, delay: 0.2, ease: "easeOut" }}
                                            >
                                              <motion.span 
                                                className="text-sm font-medium text-gray-600 dark:text-gray-400"
                                                initial={{ opacity: 0, scale: 0.8, x: -5 }}
                                                animate={{ opacity: 1, scale: 1, x: 0 }}
                                                transition={{ duration: 0.06, delay: 0.22, ease: "easeOut" }}
                                              >
                                                {t('question.questionView.media.title')}
                                              </motion.span>
                                              <motion.span 
                                                className="text-xs text-gray-400 dark:text-gray-500"
                                                initial={{ opacity: 0, scale: 0.8, x: 5 }}
                                                animate={{ opacity: 1, scale: 1, x: 0 }}
                                                transition={{ duration: 0.06, delay: 0.24, ease: "easeOut" }}
                                              >
                                                ({((currentQuestion.images?.length || 0) + (currentQuestion.tikzCodes?.length || 0))} 个)
                                              </motion.span>
                                            </motion.div>
                                            
                                            {/* 合并的媒体内容显示 */}
                                            <div className="flex space-x-3 overflow-x-auto pb-2">
                                                                                             {/* 合并图片和图形数据 */}
                                               {[
                                                 ...(currentQuestion.images || []).map(item => ({ type: 'image' as const, data: item })),
                                                 ...(currentQuestion.tikzCodes || []).map(item => ({ type: 'tikz' as const, data: item }))
                                               ].sort((a, b) => {
                                                 // 按order字段排序
                                                 const orderA = a.data.order || 0;
                                                 const orderB = b.data.order || 0;
                                                 return orderA - orderB;
                                               }).map((item) => (
                                                 <div key={`${item.type}-${item.data.id}`} className="flex-shrink-0 group relative">
                                                   {item.type === 'image' ? (
                                                     // 图片显示
                                                     <div className="w-24 h-20 rounded-lg border border-gray-200 dark:border-gray-600 overflow-hidden bg-gray-50 dark:bg-gray-700 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer">
                                                       <img
                                                         src={item.data.url}
                                                         alt={item.data.filename}
                                                         className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                                       />
                                                       <div className="absolute top-1 left-1 bg-blue-500 text-white text-xs px-1 py-0.5 rounded">
                                                         {t('question.questionView.media.image')}
                                                       </div>
                                                     </div>
                                                   ) : (
                                                     // TikZ显示
                                                     <div className="w-24 h-20 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden cursor-pointer">
                                                       <TikZPreview
                                                         code={item.data.code}
                                                         format={item.data.format as 'svg' | 'png'}
                                                         width={400}
                                                         height={300}
                                                         showGrid={false}
                                                         showTitle={false}
                                                         className="w-full h-full group-hover:scale-105 transition-transform duration-200 flex items-center justify-center"
                                                       />
                                                       <div className="absolute top-1 left-1 bg-purple-500 text-white text-xs px-1 py-0.5 rounded">
                                                         {t('question.questionView.media.tikz')}
                                                       </div>
                                                     </div>
                                                   )}
                                                   <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-lg flex items-center justify-center">
                                                     <div className="opacity-0 group-hover:opacity-100 transition-all duration-200 text-white text-xs font-medium">
                                                       {t('question.questionView.actions.view')}
                                                     </div>
                                                   </div>
                                                 </div>
                                               ))}
                                            </div>
                                          </div>
                                        )}
                                      </motion.div>

                                      {/* 选项 */}
                              <div className="space-y-3">
                                {currentQuestion.content.options?.map((option, index) => (
                                  <motion.div
                                    key={index}
                                    className={`option-card-enhanced flex items-start space-x-3 p-3 rounded-lg border transition-all duration-200 ${
                                      showAnswer && option.isCorrect ? 'correct-option' : ''
                                    }`}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.08, delay: index * 0.03 }}
                                  >
                                    <span className={`option-number-enhanced flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                                      showAnswer && option.isCorrect ? 'bg-white text-green-600' : 'text-white'
                                    }`}>
                                      {String.fromCharCode(65 + index)}
                                    </span>
                                    <div className="flex-1 min-w-0">
                                      <LaTeXPreview 
                                        content={option.text} 
                                        config={{ 
                                          mode: 'full',
                                          features: {
                                            markdown: true,
                                            questionSyntax: true,
                                            autoNumbering: true,
                                            errorHandling: 'lenient'
                                          },
                                          styling: {
                                            fontSize: '1rem',
                                            lineHeight: '1.6',
                                            maxWidth: '100%'
                                          }
                                        }}
                                        variant="compact"
                                        showTitle={false}
                                        className={`question-view-latex-content leading-relaxed prose max-w-none dark:prose-invert ${
                                          showAnswer && option.isCorrect ? 'text-white' : 'text-gray-700 dark:text-gray-300'
                                        }`}
                                        maxWidth="max-w-none"
                                      />
                                    </div>
                                    {showAnswer && option.isCorrect && (
                                      <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ duration: 0.2, delay: 0.1 }}
                                        className="ml-2 text-green-500"
                                      >
                                        ✓
                                      </motion.div>
                                    )}
                                  </motion.div>
                                ))}
                              </div>

                                      {/* 答案显示控制 */}
                                        <div className="mb-6">
                                        <div className="flex items-center mb-4">
                                          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                            {t('question.questionCard.answer')}
                                            <motion.span
                                              onClick={() => setShowAnswer(!showAnswer)}
                                              className="answer-text-toggle ml-2 cursor-pointer"
                                              whileHover={{ scale: 1.02 }}
                                              whileTap={{ scale: 0.98 }}
                                            >
                                              <span className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-semibold">
                                                {showAnswer ? t('question.questionView.answer.hide') : t('question.questionView.answer.show')}
                                              </span>
                                            </motion.span>
                                          </h3>
                                        </div>
                                        
                                        {showAnswer && (
                                          <motion.div
                                            initial={{ opacity: 0, y: 8 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -8 }}
                                            transition={{ duration: 0.15 }}
                                            className="prose max-w-none dark:prose-invert"
                                          >
                                            {currentQuestion.type === 'choice' || currentQuestion.type === 'multiple-choice' ? (
                                              <div className="choice-hint text-sm text-gray-600 dark:text-gray-400">
                                                {t('question.questionView.answer.correctHighlighted')}
                                              </div>
                                            ) : (
                                            <LaTeXPreview 
                                              content={currentQuestion.content.answer} 
                                              config={{ 
                                                mode: 'full',
                                                features: {
                                                  markdown: true,
                                                  questionSyntax: true,
                                                  autoNumbering: true,
                                                  errorHandling: 'lenient'
                                                },
                                                styling: {
                                                  fontSize: '1rem',
                                                  lineHeight: '1.6',
                                                  maxWidth: '100%'
                                                }
                                              }}
                                              variant="compact"
                                              showTitle={false}
                                              className="question-view-latex-content text-gray-700 dark:text-gray-300 leading-relaxed prose max-w-none dark:prose-invert"
                                              maxWidth="max-w-none"
                                            />
                                      )}
                                          </motion.div>
                                        )}
                                      </div>
                                    </motion.div>
                                  )}

                                  {activeTab === 'solution' && (
                                    <motion.div
                                      key={`solution-${animationKey}`}
                                      initial={{ opacity: 0, y: 8 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      exit={{ opacity: 0, y: -8 }}
                                      transition={{ duration: 0.12 }}
                                    >
                                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">{t('question.questionCard.solution')}</h3>
                                      <div className="prose max-w-none dark:prose-invert">
                                        {currentQuestion.content.solution ? (
                                          <LaTeXPreview 
                                            content={currentQuestion.content.solution} 
                                            config={{ 
                                              mode: 'full',
                                              features: {
                                                markdown: true,
                                                questionSyntax: true,
                                                autoNumbering: true,
                                                errorHandling: 'lenient'
                                              },
                                              styling: {
                                                fontSize: '1rem',
                                                lineHeight: '1.6',
                                                maxWidth: '100%'
                                              }
                                            }}
                                            variant="compact"
                                            showTitle={false}
                                            className="question-view-latex-content text-gray-700 dark:text-gray-300 leading-relaxed prose max-w-none dark:prose-invert"
                                            maxWidth="max-w-none"
                                          />
                                        ) : (
                                          <p className="text-gray-500 dark:text-gray-400 italic">{t('question.questionView.solution.noSolution')}</p>
                                        )}
                                      </div>
                                    </motion.div>
                                  )}

                                  {activeTab === 'analysis' && (
                                    <motion.div
                                      key={`analysis-${animationKey}`}
                                      initial={{ opacity: 0, y: 8 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      exit={{ opacity: 0, y: -8 }}
                                      transition={{ duration: 0.12 }}
                                    >
                                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">{t('question.questionView.analysis.title')}</h3>
                                      
                                      {/* AI分析状态 */}
                                      {loadingAnalysis && (
                                        <div className="mb-6 text-center py-8">
                                          <div className="loading-spinner-enhanced mx-auto mb-3"></div>
                                          <p className="text-gray-500 dark:text-gray-400">{t('question.questionView.analysis.loading')}</p>
                                        </div>
                                      )}
                                      
                                      {analysisError && (
                                        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
                                          <div className="flex items-center">
                                            <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                                            <span className="text-red-700 dark:text-red-300">{t('question.questionView.analysis.error')}: {analysisError}</span>
                                          </div>
                                          <button
                                            onClick={() => fetchAIAnalysis()}
                                            className="mt-2 text-sm text-red-600 dark:text-red-400 underline hover:no-underline"
                                          >
                                            {t('question.questionView.analysis.retry')}
                                          </button>
                                        </div>
                                      )}
                                      
                                      {aiAnalysis && !loadingAnalysis && !analysisError && (
                                        <>
                                          {/* 队列状态显示（仅超级管理员可见） */}
                                          {userRole === 'superadmin' && queueStatus && (
                                            <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-700">
                                              <h5 className="text-sm font-medium text-yellow-700 dark:text-yellow-300 mb-2">AI分析队列状态</h5>
                                              <div className="grid grid-cols-2 gap-3 text-xs">
                                                <div className="text-center">
                                                  <div className="text-lg font-bold text-yellow-600 dark:text-yellow-400">
                                                    {queueStatus.total}
                                                  </div>
                                                  <div className="text-yellow-500 dark:text-yellow-300">总队列数</div>
                                                </div>
                                                <div className="text-center">
                                                  <div className="text-lg font-bold text-yellow-600 dark:text-yellow-400">
                                                    {queueStatus.processing ? '处理中' : '空闲'}
                                                  </div>
                                                  <div className="text-yellow-500 dark:text-yellow-300">处理状态</div>
                                                </div>
                                                <div className="text-center">
                                                  <div className="text-lg font-bold text-yellow-600 dark:text-yellow-400">
                                                    {queueStatus.highPriority}
                                                  </div>
                                                  <div className="text-yellow-500 dark:text-yellow-300">高优先级</div>
                                                </div>
                                                <div className="text-center">
                                                  <div className="text-lg font-bold text-yellow-600 dark:text-yellow-400">
                                                    {queueStatus.normalPriority}
                                                  </div>
                                                  <div className="text-yellow-500 dark:text-yellow-300">普通优先级</div>
                                                </div>
                                              </div>
                                            </div>
                                          )}
                                          
                                          {/* 整体评价 */}
                                          <motion.div 
                                            className="mb-6"
                                            initial={{ opacity: 0, scale: 0.95, y: 8 }}
                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                            transition={{ duration: 0.08, delay: 0.25, ease: "easeOut" }}
                                          >
                                            <motion.h4 
                                              className="text-md font-medium text-gray-900 dark:text-gray-100 mb-3"
                                              initial={{ opacity: 0, scale: 0.9, x: -8 }}
                                              animate={{ opacity: 1, scale: 1, x: 0 }}
                                              transition={{ duration: 0.08, delay: 0.27, ease: "easeOut" }}
                                            >
                                              整体评价
                                            </motion.h4>
                                            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center">
                                              <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                                                {aiAnalysis.evaluation?.overallRating || 7}/10
                                              </div>
                                              <div className="text-lg text-blue-500 dark:text-blue-300 mb-3">综合评分</div>
                                              <div className="text-sm text-blue-600 dark:text-blue-400">
                                                {aiAnalysis.evaluation?.evaluationReasoning || '这是一道设计良好的数学题目，逻辑清晰，知识点覆盖全面，能够有效培养学生的逻辑思维和计算能力。'}
                                              </div>
                                            </div>
                                          </motion.div>
                                          
                                          {/* 能力维度图 */}
                                          <motion.div 
                                            className="mb-6"
                                            initial={{ opacity: 0, scale: 0.95, y: 8 }}
                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                            transition={{ duration: 0.08, delay: 0.3, ease: "easeOut" }}
                                          >
                                            <motion.h4 
                                              className="text-md font-medium text-gray-900 dark:text-gray-100 mb-3"
                                              initial={{ opacity: 0, scale: 0.9, x: -8 }}
                                              animate={{ opacity: 1, scale: 1, x: 0 }}
                                              transition={{ duration: 0.08, delay: 0.32, ease: "easeOut" }}
                                            >
                                              能力维度评估
                                            </motion.h4>
                                            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                                              <motion.h5 
                                                className="font-medium text-gray-900 dark:text-gray-100 mb-4 text-center"
                                                initial={{ opacity: 0, scale: 0.9, y: 5 }}
                                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                                transition={{ duration: 0.08, delay: 0.35, ease: "easeOut" }}
                                              >
                                                核心能力评估
                                              </motion.h5>
                                              <AbilityRadarChart 
                                                data={aiAnalysis.coreAbilities || {
                                                  logicalThinking: 7,
                                                  mathematicalIntuition: 6,
                                                  problemSolving: 8,
                                                  analyticalSkills: 7,
                                                  creativeThinking: 5,
                                                  computationalSkills: 6
                                                }}
                                                className="h-80"
                                                showValues={true}
                                                />
                                              </div>
                                          </motion.div>
                                        </>
                                      )}
                                      
                                      {/* 如果没有AI分析数据，显示默认内容 */}
                                      {!aiAnalysis && !loadingAnalysis && !analysisError && (
                                        <div className="mb-6 text-center py-8">
                                          <div className="text-gray-500 dark:text-gray-400 mb-4">
                                            <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                                            <p>
                                              {currentQuestion.aiAnalysis?.evaluation 
                                                ? 'AI分析结果加载中...' 
                                                : 'AI分析已自动启动，请稍候...'
                                              }
                                            </p>
                                      </div>
                                        </div>
                                      )}
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            </div>
                          </Card>
                        </motion.div>
                      </div>

                      {/* 侧边栏 */}
                      <div className="lg:col-span-1 space-y-6">
                        {/* 题目信息卡片 */}
                        <Card className="question-card-enhanced">
                          <div className="p-4">
                            <motion.h3 
                              className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center"
                              initial={{ opacity: 0, scale: 0.9, x: -10 }}
                              animate={{ opacity: 1, scale: 1, x: 0 }}
                              transition={{ duration: 0.08, delay: 0.15, ease: "easeOut" }}
                            >
                              <motion.div
                                initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
                                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                                transition={{ duration: 0.08, delay: 0.17, ease: "easeOut" }}
                              >
                              <TrendingUp className="w-5 h-5 mr-2 text-blue-500" />
                              </motion.div>
                              {t('question.questionView.sidebar.title')}
                            </motion.h3>
                            <div className="space-y-3">
                              <motion.div 
                                className="flex items-center justify-between p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.2, delay: 0.1 }}
                              >
                                <div className="flex items-center">
                                  <User className="w-4 h-4 text-blue-500 mr-2" />
                                  <span className="text-xs text-gray-600 dark:text-gray-400">{t('question.questionView.sidebar.creator')}</span>
                                </div>
                                <span className="text-xs font-medium text-gray-900 dark:text-gray-100 truncate max-w-[80px]" title={currentQuestion.creator.name}>
                                  {currentQuestion.creator.name}
                                </span>
                              </motion.div>
                              
                              <motion.div 
                                className="flex items-center justify-between p-2 bg-green-50 dark:bg-green-900/20 rounded-lg"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.2, delay: 0.15 }}
                              >
                                <div className="flex items-center">
                                  <Clock className="w-4 h-4 text-green-500 mr-2" />
                                  <span className="text-xs text-gray-600 dark:text-gray-400">{t('question.questionView.sidebar.createdAt')}</span>
                                </div>
                                <span className="text-xs font-medium text-gray-900 dark:text-gray-100">
                                  {new Date(currentQuestion.createdAt).toLocaleDateString()}
                                </span>
                              </motion.div>
                              
                              {/* 浏览量统计 */}
                              <motion.div 
                                className="flex items-center justify-between p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.2, delay: 0.2 }}
                              >
                                <div className="flex items-center">
                                  <Eye className="w-4 h-4 text-purple-500 mr-2" />
                                  <span className="text-xs text-gray-600 dark:text-gray-400">{t('question.questionView.sidebar.views')}</span>
                              </div>
                                <span className="text-xs font-medium text-gray-900 dark:text-gray-100">
                                  {currentQuestion.views || 0}
                                </span>
                              </motion.div>
                              
                              {/* 收藏数统计 */}
                              <motion.div 
                                className="flex items-center justify-between p-2 bg-red-50 dark:bg-red-900/20 rounded-lg"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.2, delay: 0.25 }}
                              >
                                <div className="flex items-center">
                                  <Heart className="w-4 h-4 text-red-500 mr-2" />
                                  <span className="text-xs text-gray-600 dark:text-gray-400">{t('question.questionView.sidebar.favorites')}</span>
                                  </div>
                                <span className="text-xs font-medium text-gray-900 dark:text-gray-100">
                                  {currentQuestion.favorites?.length || 0}
                                </span>
                              </motion.div>
                            </div>
                          </div>
                        </Card>

                        {/* 相关题目 */}
                        <motion.div
                          key={`related-${animationKey}`}
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.15, delay: 0.1 }}
                        >
                          <Card className="h-72 lg:h-80 question-card-enhanced">
                            <div className="p-4 lg:p-5 h-full flex flex-col">
                              <div className="flex items-center justify-between mb-4 flex-shrink-0">
                                <div className="flex items-center space-x-2">
                                  <motion.h3 
                                    className="text-lg font-semibold text-gray-900 dark:text-gray-100"
                                    initial={{ opacity: 0, scale: 0.9, x: -8 }}
                                    animate={{ opacity: 1, scale: 1, x: 0 }}
                                    transition={{ duration: 0.08, delay: 0.2, ease: "easeOut" }}
                                  >
                                    {t('question.questionView.related.title')}
                                  </motion.h3>
                                  <motion.span 
                                    className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full"
                                    initial={{ opacity: 0, scale: 0.8, x: 8 }}
                                    animate={{ opacity: 1, scale: 1, x: 0 }}
                                    transition={{ duration: 0.08, delay: 0.22, ease: "easeOut" }}
                                  >
                                    {t('question.questionView.related.showFirst3')}
                                  </motion.span>
                                </div>
                                {relatedError && (
                                  <button
                                    onClick={fetchRelatedQuestions}
                                    className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 px-2 py-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                                  >
                                    {t('question.questionView.related.retry')}
                                  </button>
                                )}
                              </div>
                              
                              {loadingRelated ? (
                                <div className="text-center py-8 text-gray-500 dark:text-gray-400 flex-1 flex items-center justify-center">
                                  <div>
                                    <div className="loading-spinner-enhanced mx-auto mb-3"></div>
                                    <p className="text-sm">{t('question.questionView.related.loading')}</p>
                                  </div>
                                </div>
                              ) : relatedError ? (
                                <div className="text-center py-8 text-red-500 flex-1 flex items-center justify-center">
                                  <div>
                                    <AlertCircle className="w-8 h-8 mx-auto mb-3 text-red-300 dark:text-red-600" />
                                    <p className="text-sm mb-3">{relatedError}</p>
                                    <button
                                      onClick={fetchRelatedQuestions}
                                      className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline px-3 py-1 rounded hover:bg-blue-900/20 transition-colors"
                                    >
                                      {t('question.questionView.related.retry')}
                                    </button>
                                  </div>
                                </div>
                              ) : relatedQuestions.length === 0 ? (
                                <div className="text-center py-8 text-gray-500 dark:text-gray-400 flex-1 flex items-center justify-center">
                                  <div>
                                    <BookOpen className="w-8 h-8 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                                    <p className="text-sm">{t('question.questionView.related.noSimilar')}</p>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex-1 flex flex-col min-h-0">
                                  {/* 滑动容器 */}
                                  <div 
                                    ref={scrollContainerRef}
                                    className="flex-1 overflow-y-auto scrollbar-enhanced"
                                  >
                                    <div className="space-y-3 pr-3 pb-4">
                                      {relatedQuestions.map((q) => (
                                        <motion.div 
                                          key={q.qid}
                                          className="related-question-enhanced group relative border rounded-lg transition-all duration-200 cursor-pointer overflow-hidden shadow-sm hover:shadow-md"
                                          onClick={() => handleViewRelatedQuestion(q.qid)}
                                        >
                                            <div className="p-3">
                                              <div className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3">
                                                <LaTeXPreview 
                                                  content={q.content.stem.length > 60 ? q.content.stem.substring(0, 60) + '...' : q.content.stem} 
                                                  config={{ 
                                                    mode: 'full',
                                                    features: {
                                                      markdown: true,
                                                      questionSyntax: true,
                                                      autoNumbering: true,
                                                      errorHandling: 'lenient'
                                                    },
                                                    styling: {
                                                      fontSize: '0.875rem',
                                                      lineHeight: '1.5',
                                                      maxWidth: '100%'
                                                    }
                                                  }}
                                                  variant="compact"
                                                  showTitle={false}
                                                  className="question-view-latex-content"
                                                  maxWidth="max-w-none"
                                                />
                                              </div>
                                              
                                              {/* 底部统计 */}
                                              <div className="flex flex-col space-y-1.5 mt-3">
                                                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                                                  <div className="flex items-center space-x-4">
                                                    <div className="flex items-center space-x-1">
                                                      <Eye className="w-3 h-3" />
                                                      <span>使用 {q.views || 0}</span>
                                                    </div>
                                                    <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                                                      <span>访问 {q.views || 0}</span>
                                                    </div>
                                                  </div>
                                                </div>
                                                <motion.div 
                                                  className="text-xs text-gray-400 dark:text-gray-500 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors font-medium text-center"
                                                  initial={{ opacity: 0, scale: 0.8, x: 10 }}
                                                  animate={{ opacity: 1, scale: 1, x: 0 }}
                                                  transition={{ duration: 0.08, delay: 0.1, ease: "easeOut" }}
                                                >
                                                  点击查看 →
                                                </motion.div>
                                              </div>
                                            </div>
                                          </motion.div>
                                      ))}
                                    </div>
                                  </div>
                                  
                                  {/* 滚动指示器 */}
                                  {relatedQuestions.length > 2 && (
                                    <div className="mt-3 flex-shrink-0">
                                      <div className="h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                                        <motion.div 
                                          className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" 
                                          style={{ width: `${Math.max(10, scrollProgress * 100)}%` }}
                                          initial={{ width: 0 }}
                                          animate={{ width: `${Math.max(10, scrollProgress * 100)}%` }}
                                          transition={{ duration: 0.3, ease: "easeOut" }}
                                        />
                                      </div>
                                      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        <span>顶部</span>
                                        <span>底部</span>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </Card>
                        </motion.div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 底部提示 - 固定在底部 */}
            <motion.div 
              className="p-4 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 text-center text-sm text-gray-500 dark:text-gray-400 flex-shrink-0 sticky bottom-0 z-10"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.08, delay: 0.4, ease: "easeOut" }}
            >
              <motion.p
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.08, delay: 0.42, ease: "easeOut" }}
              >
                {t('question.questionView.keyboard.instructions')}
                {(userRole === 'creator' || userRole === 'manager' || userRole === 'collaborator') && `，${t('question.questionView.keyboard.edit')}`}
                ，{t('question.questionView.keyboard.close')}
              </motion.p>
            </motion.div>
          </motion.div>
        </motion.div>
      )}

      {/* TikZ预览模态框 */}
      {previewTikZ && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-75"
          onClick={() => setPreviewTikZ(null)}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="relative max-w-[90vw] max-h-[90vh] bg-white dark:bg-gray-800 rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 关闭按钮 */}
            <button
              onClick={() => setPreviewTikZ(null)}
              className="absolute top-4 right-4 z-10 p-2 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>
            
            {/* 标题 */}
            <div className="absolute top-4 left-4 z-10 px-3 py-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                {t('question.questionView.tikzPreview.title')}
              </span>
            </div>
            
            {/* 内容 - 可滚动区域 */}
            <div className="p-4 overflow-auto max-h-[calc(90vh-120px)]">
              <div className="flex items-center justify-center min-h-[400px]">
                <TikZPreview
                  code={previewTikZ.code}
                  format={previewTikZ.format}
                  width={800}
                  height={600}
                  showGrid={false}
                  showTitle={false}
                  className="max-w-full max-h-full"
                />
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default QuestionView; 