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
import { useModal } from '../../hooks/useModal';

import MagicTextTransition from '../animations/MagicTextTransition';
// 导入LaTeXPreview组件，使用与QuestionCard相同的渲染逻辑
import LaTeXPreview from '../editor/preview/LaTeXPreview';
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

  // 获取当前题目
  const currentQuestion = questions[currentQuestionIndex];

  // 当弹窗打开时，设置当前题目索引
  useEffect(() => {
    if (isOpen) {
      setCurrentQuestionIndex(currentIndex);
      document.body.style.overflow = 'hidden';
      fetchRelatedQuestions();
      // 增加访问量
      if (currentQuestion?.qid) {
        questionAPI.addView(currentQuestion.qid).catch(error => {
          console.warn('更新访问量失败:', error);
        });
      }
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, currentIndex]);

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
      console.error('获取相关题目失败:', error);
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
        questionAPI.addView(questions[newIndex].qid).catch(error => {
          console.warn('更新访问量失败:', error);
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
        questionAPI.addView(questions[newIndex].qid).catch(error => {
          console.warn('更新访问量失败:', error);
        });
      }
      
      setTimeout(() => {
        setSlideDirection(null);
        setIsTransitioning(false);
      }, 400);
    }
  }, [currentQuestionIndex, isTransitioning, questions]);

  // 当题目切换时，重新获取相关题目
  useEffect(() => {
    if (isOpen && currentQuestion?.qid) {
      fetchRelatedQuestions();
    }
  }, [currentQuestionIndex, isOpen]);

  const isFavorite = favorites.has(currentQuestion?.qid || '');

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
      console.error('分享失败:', error);
      showErrorRightSlide('分享失败', '分享失败，请重试');
    } finally {
      setIsSharing(false);
    }
  };

  // 收藏功能
  const handleFavorite = async () => {
    if (!onFavorite || !currentQuestion) return;
    
    setIsFavoriting(true);
    try {
      await onFavorite(currentQuestion.qid, !isFavorite);
    } catch (error) {
      console.error('收藏操作失败:', error);
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
      case 'choice': return '选择题';
      case 'multiple-choice': return '多选题';
      case 'fill': return '填空题';
      case 'solution': return '解答题';
      default: return '未知';
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
      case 1: return '简单';
      case 2: return '较易';
      case 3: return '中等';
      case 4: return '较难';
      case 5: return '困难';
      default: return '未知';
    }
  };

  // 难度星级
  const getDifficultyStars = (difficulty: number) => {
    return '★'.repeat(difficulty) + '☆'.repeat(5 - difficulty);
  };

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
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            {/* 头部 */}
            <div className="flex items-center justify-between p-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  题目详情
                </h2>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {currentQuestionIndex + 1} / {questions.length}
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                {/* 分享按钮 */}
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
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
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    onClick={handleFavorite}
                    disabled={isFavoriting}
                    variant="outline"
                    size="sm"
                    className={`${
                      favorites.has(currentQuestion?.qid || '')
                        ? 'text-red-500 dark:text-red-400 border-red-300 dark:border-red-600'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${favorites.has(currentQuestion?.qid || '') ? 'fill-current' : ''}`} />
                  </Button>
                </motion.div>
                
                {/* 编辑按钮 */}
                {(userRole === 'creator' || userRole === 'manager' || userRole === 'collaborator') && (
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
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
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    onClick={onClose}
                    variant="outline"
                    size="sm"
                    className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
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
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      onClick={handlePrevious}
                      disabled={currentQuestionIndex === 0 || isTransitioning}
                      variant="outline"
                      size="sm"
                      className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </Button>
                  </motion.div>
                  
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      onClick={handleNext}
                      disabled={currentQuestionIndex === questions.length - 1 || isTransitioning}
                      variant="outline"
                      size="sm"
                      className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150"
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
                            x: slideDirection === 'left' ? -20 : slideDirection === 'right' ? 20 : 0,
                            scale: 0.98
                          }}
                          animate={{ 
                            opacity: 1, 
                            x: 0,
                            scale: 1
                          }}
                          transition={{ 
                            duration: 0.2,
                            ease: "easeOut"
                          }}
                        >
                          <Card className="h-full flex flex-col">
                            <div className="p-6 flex-1 flex flex-col overflow-hidden">
                              {/* 题目信息头部 */}
                              <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center space-x-3">
                                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getQuestionTypeColor(currentQuestion.type)}`}>
                                    {getQuestionTypeText(currentQuestion.type)}
                                  </span>
                                  <div className="flex items-center space-x-2">
                                    <span className="difficulty-stars-enhanced text-sm">
                                      {getDifficultyStars(currentQuestion.difficulty)}
                                    </span>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(currentQuestion.difficulty)}`}>
                                      {getDifficultyText(currentQuestion.difficulty)}
                                    </span>
                                  </div>
                                </div>
                                
                                {/* 题目出处 */}
                                {currentQuestion.source && (
                                  <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                                    <span className="font-medium">出处:</span>
                                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-md">
                                      {currentQuestion.source}
                                    </span>
                                  </div>
                                )}
                              </div>

                              {/* 标签 */}
                              <div className="mb-6 space-y-2">
                                {currentQuestion.category && Array.isArray(currentQuestion.category) && currentQuestion.category.length > 0 && (
                                  <div className="flex flex-wrap gap-2">
                                    {currentQuestion.category.map((category, index) => (
                                      <span
                                        key={`category-${index}`}
                                        className="tag-enhanced inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                                      >
                                        {category}
                                      </span>
                                    ))}
                                  </div>
                                )}
                                {currentQuestion.tags && currentQuestion.tags.length > 0 && (
                                  <div className="flex flex-wrap gap-2">
                                    {currentQuestion.tags.map((tag, index) => (
                                      <span
                                        key={`tag-${index}`}
                                        className="tag-enhanced inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                                      >
                                        {tag}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>

                              {/* 标签页 */}
                              <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
                                <nav className="-mb-px flex space-x-8">
                                  <motion.button
                                    onClick={() => setActiveTab('question')}
                                    className={`tab-button-enhanced py-2 px-1 border-b-2 font-medium text-sm transition-all duration-200 ${
                                      activeTab === 'question'
                                        ? 'active border-blue-500 text-blue-600 dark:text-blue-400'
                                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                                    }`}
                                    whileHover={{ scale: 1.01 }}
                                    whileTap={{ scale: 0.99 }}
                                  >
                                    题目
                                  </motion.button>
                                  <motion.button
                                    onClick={() => setActiveTab('solution')}
                                    className={`tab-button-enhanced py-2 px-1 border-b-2 font-medium text-sm transition-all duration-200 ${
                                      activeTab === 'solution'
                                        ? 'active border-blue-500 text-blue-600 dark:text-blue-400'
                                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                                    }`}
                                    whileHover={{ scale: 1.01 }}
                                    whileTap={{ scale: 0.99 }}
                                  >
                                    解析
                                  </motion.button>
                                  <motion.button
                                    onClick={() => setActiveTab('analysis')}
                                    className={`tab-button-enhanced py-2 px-1 border-b-2 font-medium text-sm transition-all duration-200 ${
                                      activeTab === 'analysis'
                                        ? 'active border-blue-500 text-blue-600 dark:text-blue-400'
                                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                                    }`}
                                    whileHover={{ scale: 1.01 }}
                                    whileTap={{ scale: 0.99 }}
                                  >
                                    分析
                                  </motion.button>
                                </nav>
                              </div>

                              {/* 标签页内容 */}
                              <div className="flex-1 overflow-y-auto scrollbar-enhanced">
                                <AnimatePresence mode="wait">
                                  {activeTab === 'question' && (
                                    <motion.div
                                      key={`question-${animationKey}`}
                                      className="fade-in-up"
                                      initial={{ opacity: 0, y: 5 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      exit={{ opacity: 0, y: -5 }}
                                      transition={{ duration: 0.15, ease: "easeOut" }}
                                    >
                                      {/* 题目内容 */}
                                      <div className="mb-6">
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">题目内容</h3>
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
                                      </div>

                                      {/* 选项 */}
                              <div className="space-y-3">
                                {currentQuestion.content.options?.map((option, index) => (
                                  <div
                                    key={index}
                                    className="option-card-enhanced flex items-start space-x-3 p-3 rounded-lg border transition-all duration-200"
                                  >
                                    <span className="option-number-enhanced flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium">
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
                                        className="question-view-latex-content text-gray-700 dark:text-gray-300 leading-relaxed prose max-w-none dark:prose-invert"
                                        maxWidth="max-w-none"
                                      />
                                    </div>
                                  </div>
                                ))}
                              </div>

                                      {/* 答案 */}
                                      {currentQuestion.content.answer && (
                                        <div className="mb-6">
                                          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">答案</h3>
                                          <div className="prose max-w-none dark:prose-invert">
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
                                          </div>
                                        </div>
                                      )}
                                    </motion.div>
                                  )}

                                  {activeTab === 'solution' && (
                                    <motion.div
                                      key={`solution-${animationKey}`}
                                      className="fade-in-up"
                                      initial={{ opacity: 0, y: 5 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      exit={{ opacity: 0, y: -5 }}
                                      transition={{ duration: 0.15, ease: "easeOut" }}
                                    >
                                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">解析</h3>
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
                                          <p className="text-gray-500 dark:text-gray-400 italic">暂无解析</p>
                                        )}
                                      </div>
                                    </motion.div>
                                  )}

                                  {activeTab === 'analysis' && (
                                    <motion.div
                                      key={`analysis-${animationKey}`}
                                      className="fade-in-up"
                                      initial={{ opacity: 0, y: 5 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      exit={{ opacity: 0, y: -5 }}
                                      transition={{ duration: 0.15, ease: "easeOut" }}
                                    >
                                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">题目分析</h3>
                                      <div className="prose max-w-none dark:prose-invert">
                                        {currentQuestion.content.solutionAnswers && currentQuestion.content.solutionAnswers.length > 0 ? (
                                          <div className="space-y-4">
                                            {currentQuestion.content.solutionAnswers.map((answer, index) => (
                                              <div key={index} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                                                  解答步骤 {index + 1}
                                                </h4>
                                                <LaTeXPreview 
                                                  content={answer} 
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
                                              </div>
                                            ))}
                                          </div>
                                        ) : (
                                          <p className="text-gray-500 dark:text-gray-400 italic">暂无题目分析</p>
                                        )}
                                      </div>
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
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                              <TrendingUp className="w-5 h-5 mr-2 text-blue-500" />
                              题目信息
                            </h3>
                            <div className="space-y-3">
                              <div className="flex items-center justify-between p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                <div className="flex items-center">
                                  <User className="w-4 h-4 text-blue-500 mr-2" />
                                  <span className="text-xs text-gray-600 dark:text-gray-400">创建者</span>
                                </div>
                                <span className="text-xs font-medium text-gray-900 dark:text-gray-100 truncate max-w-[80px]" title={currentQuestion.creator.name}>
                                  {currentQuestion.creator.name}
                                </span>
                              </div>
                              
                              <div className="flex items-center justify-between p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                <div className="flex items-center">
                                  <Clock className="w-4 h-4 text-green-500 mr-2" />
                                  <span className="text-xs text-gray-600 dark:text-gray-400">创建时间</span>
                                </div>
                                <span className="text-xs font-medium text-gray-900 dark:text-gray-100">
                                  {new Date(currentQuestion.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                              
                              {/* 题目统计 */}
                              <div className="mt-4 p-3 stats-card-enhanced rounded-lg text-white">
                                <h4 className="font-medium mb-2 text-sm">题目统计</h4>
                                <div className="grid grid-cols-2 gap-2">
                                  <div className="text-center">
                                    <div className="text-lg font-bold">{currentQuestion.views || 0}</div>
                                    <div className="text-xs opacity-90">浏览量</div>
                                  </div>
                                  <div className="text-center">
                                    <div className="text-lg font-bold">{currentQuestion.favorites?.length || 0}</div>
                                    <div className="text-xs opacity-90">收藏数</div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </Card>

                        {/* 相关题目 */}
                        <motion.div
                          key={`related-${animationKey}`}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2, delay: 0.05, ease: "easeOut" }}
                        >
                          <Card className="h-72 lg:h-80 question-card-enhanced">
                            <div className="p-4 lg:p-5 h-full flex flex-col">
                              <div className="flex items-center justify-between mb-4 flex-shrink-0">
                                <div className="flex items-center space-x-2">
                                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">相关题目</h3>
                                  <span className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                                    显示前3个
                                  </span>
                                </div>
                                {relatedError && (
                                  <button
                                    onClick={fetchRelatedQuestions}
                                    className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 px-2 py-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                                  >
                                    重试
                                  </button>
                                )}
                              </div>
                              
                              {loadingRelated ? (
                                <div className="text-center py-8 text-gray-500 dark:text-gray-400 flex-1 flex items-center justify-center">
                                  <div>
                                    <div className="loading-spinner-enhanced mx-auto mb-3"></div>
                                    <p className="text-sm">加载中...</p>
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
                                      重试
                                    </button>
                                  </div>
                                </div>
                              ) : relatedQuestions.length === 0 ? (
                                <div className="text-center py-8 text-gray-500 dark:text-gray-400 flex-1 flex items-center justify-center">
                                  <div>
                                    <BookOpen className="w-8 h-8 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                                    <p className="text-sm">暂无高相似度题目</p>
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
                                                <div className="text-xs text-gray-400 dark:text-gray-500 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors font-medium text-center">
                                                  点击查看 →
                                                </div>
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
            <div className="p-4 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 text-center text-sm text-gray-500 dark:text-gray-400 flex-shrink-0 sticky bottom-0 z-10">
              <p>
                使用 ← → 键切换题目
                {(userRole === 'creator' || userRole === 'manager' || userRole === 'collaborator') && '，Ctrl+E 编辑题目'}
                ，ESC 键关闭弹窗
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default QuestionView; 