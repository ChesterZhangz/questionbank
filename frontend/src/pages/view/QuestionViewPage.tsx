import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from '../../hooks/useTranslation';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Eye,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { questionAPI } from '../../services/api';
import type { Question } from '../../types';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import LoadingPage from '../../components/ui/LoadingPage';
import ConfirmModal from '../../components/ui/ConfirmModal';
import RightSlideModal from '../../components/ui/RightSlideModal';
import { useModal } from '../../hooks/useModal';
import LaTeXPreview from '../../components/editor/preview/LaTeXPreview';
import TikZPreview from '../../components/tikz/core/TikZPreview';
import { useTheme } from '../../contexts/ThemeContext';

const QuestionViewPage: React.FC = () => {
  const { t } = useTranslation();
  const { qid } = useParams<{ qid: string }>();
  const navigate = useNavigate();
  // isDark is used in className conditionals via dark: prefix
  useTheme();

  // 弹窗状态管理
  const { 
    showConfirm, 
    confirmModal, 
    closeConfirm,
    rightSlideModal,
    closeRightSlide,
    showSuccessRightSlide,
    showErrorRightSlide
  } = useModal();
  
  const [, setQuestion] = useState<Question | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right' | null>(null);
  const [animationKey, setAnimationKey] = useState(0);

  // 获取当前题目
  useEffect(() => {
    if (qid) {
      fetchQuestion();
    }
  }, [qid]);



  const fetchQuestion = async () => {
    try {
      setLoading(true);
      const response = await questionAPI.getQuestion(qid!);
      
      if (response.data.success && response.data.question) {
        const currentQ = response.data.question;
        setQuestion(currentQ);
        
        // 获取相关题目
        try {
          const relatedResponse = await questionAPI.getRelatedQuestions(qid!, { limit: 10, excludeCurrent: true });
          if (relatedResponse.data.success) {
            const relatedQs = relatedResponse.data.questions || [];
            
            // 将当前题目和相关题目组合成题目列表
            const allQuestions = [currentQ, ...relatedQs];
            setQuestions(allQuestions);
            setCurrentQuestionIndex(0);
          } else {
            // 如果获取相关题目失败，只显示当前题目
            setQuestions([currentQ]);
            setCurrentQuestionIndex(0);
          }
        } catch (relatedError) {
          // 警告日志已清理
          // 如果获取相关题目失败，只显示当前题目
          setQuestions([currentQ]);
          setCurrentQuestionIndex(0);
        }
        
        // 增加访问量
        questionAPI.addView(qid!).catch(() => {
          // 警告日志已清理
        });
      } else {
        setError(response.data.error || t('questionBankPage.QuestionViewPage.errors.getQuestionFailed'));
      }
    } catch (error: any) {
      setError(error.response?.data?.error || t('questionBankPage.QuestionViewPage.errors.getQuestionFailed'));
    } finally {
      setLoading(false);
    }
  };
  


  // 处理上一题
  const handlePrevious = () => {
    if (currentQuestionIndex > 0 && !isTransitioning) {
      setIsTransitioning(true);
      setSlideDirection('right');
      setAnimationKey(prev => prev + 1);
      
      const newIndex = currentQuestionIndex - 1;
      setCurrentQuestionIndex(newIndex);
      
      // 更新URL，但不刷新页面
      const newQuestion = questions[newIndex];
      window.history.pushState({}, '', `/questions/${newQuestion.qid}/view`);
      
      // 增加访问量
      if (newQuestion?.qid) {
        questionAPI.addView(newQuestion.qid).catch(() => {
          // 警告日志已清理
        });
      }
      
      setTimeout(() => {
        setSlideDirection(null);
        setIsTransitioning(false);
      }, 400);
    }
  };

  // 处理下一题
  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1 && !isTransitioning) {
      setIsTransitioning(true);
      setSlideDirection('left');
      setAnimationKey(prev => prev + 1);
      
      const newIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(newIndex);
      
      // 更新URL，但不刷新页面
      const newQuestion = questions[newIndex];
      window.history.pushState({}, '', `/questions/${newQuestion.qid}/view`);
      
      // 增加访问量
      if (newQuestion?.qid) {
        questionAPI.addView(newQuestion.qid).catch(() => {
          // 警告日志已清理
        });
      }
      
      setTimeout(() => {
        setSlideDirection(null);
        setIsTransitioning(false);
      }, 400);
    }
  };

  // 处理键盘事件
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
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
          if ((event.ctrlKey || event.metaKey) && questions[currentQuestionIndex]) {
            event.preventDefault();
            handleEdit();
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [currentQuestionIndex, questions]);

  const handleEdit = () => {
    const currentQuestion = questions[currentQuestionIndex];
    if (currentQuestion) {
      navigate(`/questions/${currentQuestion._id}/edit`);
    }
  };

  const handleDelete = async () => {
    const currentQuestion = questions[currentQuestionIndex];
    if (!currentQuestion) {
      return;
    }
    
    showConfirm(
      t('questionBankPage.QuestionViewPage.confirm.delete.title'),
      t('questionBankPage.QuestionViewPage.confirm.delete.message'),
      async () => {
        try {
          // 先关闭模态框
          closeConfirm();
          
          const response = await questionAPI.batchOperation({
            operation: 'delete',
            questionIds: [currentQuestion.qid] // 使用qid而不是_id
          });
          
          if (response.data.success) {
            showSuccessRightSlide(t('questionBankPage.QuestionViewPage.notifications.deleteSuccess'), t('questionBankPage.QuestionViewPage.notifications.deleteSuccessMessage'));
            
            // 如果还有其他题目，切换到下一题或上一题
            if (questions.length > 1) {
              if (currentQuestionIndex < questions.length - 1) {
                handleNext();
              } else {
                handlePrevious();
              }
            } else {
              // 如果没有其他题目，返回题目列表
              navigate('/questions');
            }
          } else {
            showErrorRightSlide(t('questionBankPage.QuestionViewPage.errors.deleteFailed'), response.data.error || t('questionBankPage.QuestionViewPage.errors.deleteFailedMessage'));
          }
        } catch (error: any) {
          showErrorRightSlide(t('questionBankPage.QuestionViewPage.errors.deleteFailed'), error.response?.data?.error || t('questionBankPage.QuestionViewPage.errors.deleteFailedMessage'));
        }
      }
    );
  };

  // 获取当前显示的题目
  const currentQuestion = questions[currentQuestionIndex] || null;

  // 难度文本和颜色
  const getDifficultyInfo = (difficulty: number) => {
    switch (difficulty) {
      case 1: return { text: t('questionBankPage.QuestionViewPage.difficulty.veryEasy'), color: 'from-green-100 to-emerald-100 dark:from-green-900/40 dark:to-emerald-900/40 text-green-800 dark:text-green-200 border-green-200 dark:border-green-700/50' };
      case 2: return { text: t('questionBankPage.QuestionViewPage.difficulty.easy'), color: 'from-blue-100 to-cyan-100 dark:from-blue-900/40 dark:to-cyan-900/40 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-700/50' };
      case 3: return { text: t('questionBankPage.QuestionViewPage.difficulty.medium'), color: 'from-yellow-100 to-orange-100 dark:from-yellow-900/40 dark:to-orange-900/40 text-yellow-800 dark:text-yellow-200 border-yellow-200 dark:border-yellow-700/50' };
      case 4: return { text: t('questionBankPage.QuestionViewPage.difficulty.hard'), color: 'from-orange-100 to-red-100 dark:from-orange-900/40 dark:to-red-900/40 text-orange-800 dark:text-orange-200 border-orange-200 dark:border-orange-700/50' };
      case 5: return { text: t('questionBankPage.QuestionViewPage.difficulty.veryHard'), color: 'from-red-100 to-pink-100 dark:from-red-900/40 dark:to-pink-900/40 text-red-800 dark:text-red-200 border-red-200 dark:border-red-700/50' };
      default: return { text: t('questionBankPage.QuestionViewPage.difficulty.unknown'), color: 'from-gray-100 to-slate-100 dark:from-gray-900/40 dark:to-slate-900/40 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-700/50' };
    }
  };

  if (loading) {
    return (
      <LoadingPage
        type="loading"
        title={t('questionBankPage.QuestionViewPage.loading.title')}
        description={t('questionBankPage.QuestionViewPage.loading.description')}
        animation="spinner"
      />
    );
  }

  if (error || !currentQuestion) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <div className="p-8 text-center">
            <p className="text-red-600 dark:text-red-400 mb-4">{error || t('questionBankPage.QuestionViewPage.errors.questionNotFound')}</p>
            <Button onClick={() => navigate('/questions')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('questionBankPage.QuestionViewPage.buttons.backToQuestionList')}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-indigo-900/20 pb-12">
      {/* 页面头部 */}
      <div className="sticky top-0 z-30 bg-white dark:bg-gray-900 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => navigate('/questions')}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>{t('questionBankPage.QuestionViewPage.buttons.back')}</span>
              </Button>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 dark:from-gray-100 to-blue-600 dark:to-blue-400 bg-clip-text text-transparent">
                  {t('questionBankPage.QuestionViewPage.title')}
                </h1>
                <p className="text-gray-600 dark:text-gray-300">{t('questionBankPage.QuestionViewPage.subtitle')}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                onClick={handleEdit}
                className="flex items-center space-x-2"
              >
                <Edit className="h-4 w-4" />
                <span>{t('questionBankPage.QuestionViewPage.buttons.edit')}</span>
              </Button>
              <Button
                variant="outline"
                onClick={handleDelete}
                className="flex items-center space-x-2 text-red-600 hover:text-red-700 dark:text-red-500 dark:hover:text-red-400"
              >
                <Trash2 className="h-4 w-4" />
                <span>{t('questionBankPage.QuestionViewPage.buttons.delete')}</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 题目导航 */}
      {questions.length > 1 && (
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0 || isTransitioning}
              className={`flex items-center space-x-2 ${
                currentQuestionIndex === 0 ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <ChevronLeft className="h-4 w-4" />
              <span>{t('questionBankPage.QuestionViewPage.buttons.previous')}</span>
            </Button>
            <div className="text-sm text-gray-600 dark:text-gray-300">
              {currentQuestionIndex + 1} / {questions.length}
            </div>
            <Button
              variant="outline"
              onClick={handleNext}
              disabled={currentQuestionIndex === questions.length - 1 || isTransitioning}
              className={`flex items-center space-x-2 ${
                currentQuestionIndex === questions.length - 1 ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <span>{t('questionBankPage.QuestionViewPage.buttons.next')}</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* 题目内容 */}
      <div className="container mx-auto px-6">
        <motion.div
          key={animationKey}
          initial={{ 
            opacity: 0, 
            x: slideDirection === 'left' ? 20 : slideDirection === 'right' ? -20 : 0,
            scale: 0.98
          }}
          animate={{ 
            opacity: 1, 
            x: 0,
            scale: 1
          }}
          transition={{ 
            duration: 0.3,
            ease: "easeOut"
          }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* 题目内容 */}
            <div className="lg:col-span-3 space-y-6">
              {/* 题目题干 */}
              <Card className="overflow-hidden shadow-lg border-0 dark:bg-gray-800">
                <div className="p-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('questionBankPage.QuestionViewPage.sections.stem')}</h2>
                  </div>
                  <LaTeXPreview 
                    content={currentQuestion.content.stem} 
                    config={{ 
                      mode: 'full',
                      features: {
                        markdown: true,
                        questionSyntax: true,
                        autoNumbering: true,
                        errorHandling: 'lenient'
                      },
                      styling: {
                        fontSize: '1.4rem',
                        lineHeight: '2.0',
                        maxWidth: '100%'
                      }
                    }}
                    variant="compact"
                    showTitle={false}
                    className="question-view-latex-content text-gray-700 dark:text-gray-300 leading-relaxed prose max-w-none dark:prose-invert"
                    maxWidth="max-w-none"
                    fullWidth={true}
                  />
                </div>
              </Card>

              {/* 题目图片与图形 */}
              {((currentQuestion.images && currentQuestion.images.length > 0) || (currentQuestion.tikzCodes && currentQuestion.tikzCodes.length > 0)) && (
                <Card className="overflow-hidden shadow-lg border-0 dark:bg-gray-800">
                  <div className="p-6">
                    <div className="flex items-center space-x-2 mb-4">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('questionBankPage.QuestionViewPage.sections.imagesAndGraphics')}</h2>
                    </div>
                    <div className="space-y-4">
                      {/* 图片显示 */}
                      {currentQuestion.images && currentQuestion.images.length > 0 && (
                        <div>
                          <h3 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-3">{t('questionBankPage.QuestionViewPage.sections.images')}</h3>
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {currentQuestion.images.map((image) => (
                              <div key={image.id} className="group relative">
                                <img
                                  src={image.url}
                                  alt={image.filename}
                                  className="w-full h-32 object-cover rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
                                  onClick={() => {
                                    // 这里可以添加图片预览功能
                                    window.open(image.url, '_blank');
                                  }}
                                />
                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-lg flex items-center justify-center">
                                    <div className="opacity-0 group-hover:opacity-100 transition-all duration-200 text-white text-sm font-medium">
                                      {t('questionBankPage.QuestionViewPage.actions.clickToViewLarge')}
                                    </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* TikZ显示 */}
                      {currentQuestion.tikzCodes && currentQuestion.tikzCodes.length > 0 && (
                        <div>
                          <h3 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-3">{t('questionBankPage.QuestionViewPage.sections.graphics')}</h3>
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {currentQuestion.tikzCodes.map((tikz) => (
                              <div key={tikz.id} className="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm p-3">
                                <TikZPreview
                                  code={tikz.code}
                                  format={tikz.format}
                                  width={200}
                                  height={150}
                                  showGrid={false}
                                  showTitle={false}
                                  className="w-full h-full"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              )}

              {/* 题目选项 */}
              {(currentQuestion.type === 'choice' || currentQuestion.type === 'multiple-choice') && currentQuestion.content.options && (
                <Card className="overflow-hidden shadow-lg border-0 dark:bg-gray-800">
                  <div className="p-6">
                    <div className="flex items-center space-x-2 mb-4">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {currentQuestion.type === 'choice' ? t('questionBankPage.QuestionViewPage.sections.options') : t('questionBankPage.QuestionViewPage.sections.multipleOptions')}
                      </h2>
                    </div>
                    <div className="space-y-3">
                      {currentQuestion.content.options.map((option, index) => (
                        <div
                          key={index}
                          className={`p-4 rounded-lg border transition-all duration-200 hover:shadow-md ${
                            option.isCorrect 
                              ? 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 border-green-200 dark:border-green-700 shadow-sm' 
                              : 'bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-700/50 dark:to-slate-700/50 border-gray-200 dark:border-gray-600'
                          }`}
                        >
                          <div className="flex items-start space-x-3">
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-medium shadow-sm ${
                              option.isCorrect 
                                ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' 
                                : 'bg-gradient-to-r from-gray-300 to-slate-300 dark:from-gray-600 dark:to-slate-600 text-gray-700 dark:text-gray-200'
                            }`}>
                              {String.fromCharCode(65 + index)}
                            </div>
                            <div className="flex-1">
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
                                    fontSize: '1.3rem',
                                    lineHeight: '1.9',
                                    maxWidth: '100%'
                                  }
                                }}
                                variant="compact"
                                showTitle={false}
                                className="question-view-latex-content text-gray-700 dark:text-gray-300 leading-relaxed prose max-w-none dark:prose-invert"
                                maxWidth="max-w-none"
                                fullWidth={true}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              )}

              {/* 答案 */}
              <Card className="overflow-hidden shadow-lg border-0 dark:bg-gray-800">
                <div className="p-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('questionBankPage.QuestionViewPage.sections.answer')}</h2>
                  </div>
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
                        fontSize: '1.4rem',
                        lineHeight: '2.0',
                        maxWidth: '100%'
                      }
                    }}
                    variant="compact"
                    showTitle={false}
                    className="question-view-latex-content text-gray-700 dark:text-gray-300 leading-relaxed prose max-w-none dark:prose-invert"
                    maxWidth="max-w-none"
                    fullWidth={true}
                  />
                </div>
              </Card>

              {/* 解析 */}
              {currentQuestion.content.solution && (
                <Card className="overflow-hidden shadow-lg border-0 dark:bg-gray-800">
                  <div className="p-6">
                    <div className="flex items-center space-x-2 mb-4">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('questionBankPage.QuestionViewPage.sections.solution')}</h2>
                    </div>
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
                          fontSize: '1.4rem',
                          lineHeight: '2.0',
                          maxWidth: '100%'
                        }
                      }}
                      variant="compact"
                      showTitle={false}
                      className="question-view-latex-content text-gray-700 dark:text-gray-300 leading-relaxed prose max-w-none dark:prose-invert"
                      maxWidth="max-w-none"
                      fullWidth={true}
                    />
                  </div>
                </Card>
              )}
            </div>

            {/* 题目信息侧边栏 */}
            <div className="space-y-6">
              {/* 基本信息 */}
              <Card className="overflow-hidden shadow-lg border-0 dark:bg-gray-800">
                <div className="p-6">
                  <div className="flex items-center space-x-2 mb-6">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('questionBankPage.QuestionViewPage.sidebar.basicInfo')}</h3>
                  </div>
                  
                  <div className="space-y-4">
                    {/* 题目类型 */}
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <span className="text-gray-600 dark:text-gray-400 font-medium">{t('questionBankPage.QuestionViewPage.sidebar.questionType')}</span>
                      <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-sm font-medium">
                        {currentQuestion.type === 'choice' ? t('questionBankPage.QuestionViewPage.questionTypes.choice') : 
                         currentQuestion.type === 'multiple-choice' ? t('questionBankPage.QuestionViewPage.questionTypes.multipleChoice') :
                         currentQuestion.type === 'fill' ? t('questionBankPage.QuestionViewPage.questionTypes.fill') : 
                         currentQuestion.type === 'solution' ? t('questionBankPage.QuestionViewPage.questionTypes.solution') : currentQuestion.type}
                      </span>
                    </div>

                    {/* 小题型 */}
                    {currentQuestion.category && Array.isArray(currentQuestion.category) && currentQuestion.category.length > 0 && (
                      <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-gray-600 dark:text-gray-400 font-medium">{t('questionBankPage.QuestionViewPage.sidebar.subType')}</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {currentQuestion.category.map((cat, index) => (
                            <span key={index} className="px-3 py-1.5 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/40 dark:to-emerald-900/40 text-green-800 dark:text-green-200 rounded-full text-xs font-medium shadow-sm border border-green-200 dark:border-green-700/50 hover:from-green-200 hover:to-emerald-200 dark:hover:from-green-800/50 dark:hover:to-emerald-800/50 transition-all duration-200">
                              {cat}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 难度等级 */}
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <span className="text-gray-600 dark:text-gray-400 font-medium">{t('questionBankPage.QuestionViewPage.sidebar.difficultyLevel')}</span>
                      <div className="flex items-center space-x-2">
                        {(() => {
                          const difficultyInfo = getDifficultyInfo(currentQuestion.difficulty || 3);
                          return (
                            <span className={`px-3 py-1.5 bg-gradient-to-r ${difficultyInfo.color} rounded-full text-sm font-medium shadow-sm border transition-all duration-200`}>
                              {difficultyInfo.text}
                            </span>
                          );
                        })()}
                      </div>
                    </div>

                    {/* 访问次数 */}
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <span className="text-gray-600 dark:text-gray-400 font-medium">{t('questionBankPage.QuestionViewPage.sidebar.viewCount')}</span>
                      <span className="font-medium flex items-center text-gray-900 dark:text-gray-100">
                        <Eye className="h-4 w-4 mr-1 text-gray-400 dark:text-gray-500" />
                        {currentQuestion.views || 0}
                      </span>
                    </div>

                    {/* 题目来源 */}
                    {currentQuestion.source && (
                      <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-gray-600 dark:text-gray-400 font-medium">{t('questionBankPage.QuestionViewPage.sidebar.questionSource')}</span>
                        </div>
                        <div className="text-sm text-gray-900 dark:text-gray-100 break-words">
                          {currentQuestion.source}
                        </div>
                      </div>
                    )}

                    {/* 创建时间 */}
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <span className="text-gray-600 dark:text-gray-400 font-medium">{t('questionBankPage.QuestionViewPage.sidebar.createdAt')}</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {new Date(currentQuestion.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    {/* 更新时间 */}
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <span className="text-gray-600 dark:text-gray-400 font-medium">{t('questionBankPage.QuestionViewPage.sidebar.updatedAt')}</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {new Date(currentQuestion.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>

              {/* 标签 */}
              {currentQuestion.tags && currentQuestion.tags.length > 0 && (
                <Card className="overflow-hidden shadow-lg border-0 dark:bg-gray-800">
                  <div className="p-6">
                    <div className="flex items-center space-x-2 mb-4">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('questionBankPage.QuestionViewPage.sidebar.knowledgeTags')}</h3>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {currentQuestion.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-4 py-2 bg-gradient-to-r from-indigo-100 to-blue-100 dark:from-indigo-900/40 dark:to-blue-900/40 text-indigo-800 dark:text-indigo-200 rounded-full text-sm font-medium hover:from-indigo-200 hover:to-blue-200 dark:hover:from-indigo-800/50 dark:hover:to-blue-800/50 transition-all duration-200 shadow-sm border border-indigo-200 dark:border-indigo-700/50"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </Card>
              )}



              {/* 创建者信息 */}
              {currentQuestion.creator && (
                <Card className="overflow-hidden shadow-lg border-0 dark:bg-gray-800">
                  <div className="p-6">
                    <div className="flex items-center space-x-2 mb-4">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('questionBankPage.QuestionViewPage.sidebar.creator')}</h3>
                    </div>
                    <div className="space-y-3">
                      <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-gray-600 dark:text-gray-400 font-medium">{t('questionBankPage.QuestionViewPage.sidebar.name')}</span>
                        </div>
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100 break-words">
                          {currentQuestion.creator.name}
                        </div>
                      </div>
                      <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-gray-600 dark:text-gray-400 font-medium">{t('questionBankPage.QuestionViewPage.sidebar.email')}</span>
                        </div>
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100 break-words">
                          {currentQuestion.creator.email}
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              )}
              

            </div>
          </div>
        </motion.div>
      </div>

      {/* 键盘快捷键提示 */}
      <div className="container mx-auto px-6 mt-8">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4 text-center">
          <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
            {questions.length > 1 ? t('questionBankPage.QuestionViewPage.keyboardShortcuts.navigation') : ''}{t('questionBankPage.QuestionViewPage.keyboardShortcuts.edit')}
          </p>
        </div>
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

export default QuestionViewPage; 