import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Eye,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Tag,
  FileText
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
import { useTheme } from '../../contexts/ThemeContext';

const QuestionViewPage: React.FC = () => {
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
  
  const [question, setQuestion] = useState<Question | null>(null);
  const [relatedQuestions, setRelatedQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingRelated, setLoadingRelated] = useState(false);
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

  // 当题目变化时，重新获取相关题目
  useEffect(() => {
    if (question) {
      fetchRelatedQuestions();
    }
  }, [question]);

  const fetchQuestion = async () => {
    try {
      setLoading(true);
      const response = await questionAPI.getQuestion(qid!);
      
      if (response.data.success && response.data.question) {
        setQuestion(response.data.question);
        
        // 将当前题目添加到题目列表中
        setQuestions([response.data.question]);
        setCurrentQuestionIndex(0);
        
        // 增加访问量
        questionAPI.addView(qid!).catch(error => {
          console.warn('更新访问量失败:', error);
        });
      } else {
        setError(response.data.error || '获取题目失败');
      }
    } catch (error: any) {
      setError(error.response?.data?.error || '获取题目失败');
    } finally {
      setLoading(false);
    }
  };
  
  // 获取相关题目
  const fetchRelatedQuestions = async () => {
    if (!question?.qid) return;
    
    setLoadingRelated(true);
    
    try {
      const response = await questionAPI.getRelatedQuestions(question.qid, { limit: 5, excludeCurrent: true });
      if (response.data.success) {
        const relatedQs = response.data.questions || [];
        setRelatedQuestions(relatedQs);
        
        // 将相关题目添加到题目列表中，但不包括当前题目
        const allQuestions = [question];
        relatedQs.forEach(q => {
          if (q.qid !== question.qid) {
            allQuestions.push(q);
          }
        });
        setQuestions(allQuestions);
      }
    } catch (error) {
      console.error('获取相关题目失败:', error);
    } finally {
      setLoadingRelated(false);
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
        questionAPI.addView(newQuestion.qid).catch(error => {
          console.warn('更新访问量失败:', error);
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
        questionAPI.addView(newQuestion.qid).catch(error => {
          console.warn('更新访问量失败:', error);
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
          if ((event.ctrlKey || event.metaKey) && question) {
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
      '确认删除',
      '确定要删除这道题目吗？',
      async () => {
        try {
          // 先关闭模态框
          closeConfirm();
          
          const response = await questionAPI.batchOperation({
            operation: 'delete',
            questionIds: [currentQuestion.qid] // 使用qid而不是_id
          });
          
          if (response.data.success) {
            showSuccessRightSlide('删除成功', '题目已成功删除');
            
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
            showErrorRightSlide('删除失败', response.data.error || '删除失败');
          }
        } catch (error: any) {
          showErrorRightSlide('删除失败', error.response?.data?.error || '删除失败');
        }
      }
    );
  };

  // 获取当前显示的题目
  const currentQuestion = questions[currentQuestionIndex] || null;

  if (loading) {
    return (
      <LoadingPage
        type="loading"
        title="加载中..."
        description="正在获取题目信息，请稍候"
        animation="spinner"
      />
    );
  }

  if (error || !currentQuestion) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <div className="p-8 text-center">
            <p className="text-red-600 dark:text-red-400 mb-4">{error || '题目不存在'}</p>
            <Button onClick={() => navigate('/questions')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回题目列表
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
                <span>返回</span>
              </Button>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 dark:from-gray-100 to-blue-600 dark:to-blue-400 bg-clip-text text-transparent">
                  查看题目
                </h1>
                <p className="text-gray-600 dark:text-gray-300">题目详情与相关题目</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                onClick={handleEdit}
                className="flex items-center space-x-2"
              >
                <Edit className="h-4 w-4" />
                <span>编辑</span>
              </Button>
              <Button
                variant="outline"
                onClick={handleDelete}
                className="flex items-center space-x-2 text-red-600 hover:text-red-700 dark:text-red-500 dark:hover:text-red-400"
              >
                <Trash2 className="h-4 w-4" />
                <span>删除</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 题目导航 */}
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
            <span>上一题</span>
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
            <span>下一题</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 题目内容 */}
            <div className="lg:col-span-2 space-y-6">
              {/* 题目题干 */}
              <Card className="overflow-hidden shadow-lg border-0 dark:bg-gray-800">
                <div className="p-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <FileText className="h-5 w-5 text-blue-500 dark:text-blue-400" />
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">题目题干</h2>
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
                        fontSize: '1rem',
                        lineHeight: '1.6',
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

              {/* 题目选项 */}
              {(currentQuestion.type === 'choice' || currentQuestion.type === 'multiple-choice') && currentQuestion.content.options && (
                <Card className="overflow-hidden shadow-lg border-0 dark:bg-gray-800">
                  <div className="p-6">
                    <div className="flex items-center space-x-2 mb-4">
                      <BookOpen className="h-5 w-5 text-green-500 dark:text-green-400" />
                      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {currentQuestion.type === 'choice' ? '选项' : '选项（多选题）'}
                      </h2>
                    </div>
                    <div className="space-y-3">
                      {currentQuestion.content.options.map((option, index) => (
                        <div
                          key={index}
                          className={`p-4 rounded-lg border ${
                            option.isCorrect 
                              ? 'bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-700' 
                              : 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600'
                          }`}
                        >
                          <div className="flex items-start space-x-3">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium ${
                              option.isCorrect 
                                ? 'bg-green-500 text-white' 
                                : 'bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200'
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
                                    fontSize: '1rem',
                                    lineHeight: '1.6',
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
                    <Tag className="h-5 w-5 text-purple-500 dark:text-purple-400" />
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">答案</h2>
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
                        fontSize: '1rem',
                        lineHeight: '1.6',
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
                      <BookOpen className="h-5 w-5 text-orange-500 dark:text-orange-400" />
                      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">解析</h2>
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
                          fontSize: '1rem',
                          lineHeight: '1.6',
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
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">基本信息</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">题目类型:</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {currentQuestion.type === 'choice' ? '选择题' : 
                         currentQuestion.type === 'multiple-choice' ? '多选题' :
                         currentQuestion.type === 'fill' ? '填空题' : 
                         currentQuestion.type === 'solution' ? '解答题' : currentQuestion.type}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">难度等级:</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">{currentQuestion.difficulty}/5</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">访问次数:</span>
                      <span className="font-medium flex items-center text-gray-900 dark:text-gray-100">
                        <Eye className="h-4 w-4 mr-1 text-gray-400 dark:text-gray-500" />
                        {currentQuestion.views || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">创建时间:</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {new Date(currentQuestion.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">更新时间:</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">
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
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">知识点标签</h3>
                    <div className="flex flex-wrap gap-2">
                      {currentQuestion.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-sm"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </Card>
              )}

              {/* 来源信息 */}
              {currentQuestion.source && (
                <Card className="overflow-hidden shadow-lg border-0 dark:bg-gray-800">
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">来源信息</h3>
                    <p className="text-gray-700 dark:text-gray-300">{currentQuestion.source}</p>
                  </div>
                </Card>
              )}

              {/* 创建者信息 */}
              {currentQuestion.creator && (
                <Card className="overflow-hidden shadow-lg border-0 dark:bg-gray-800">
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">创建者</h3>
                    <div className="space-y-2">
                      <p className="text-gray-700 dark:text-gray-300">
                        <span className="font-medium">姓名:</span> {currentQuestion.creator.name}
                      </p>
                      <p className="text-gray-700 dark:text-gray-300">
                        <span className="font-medium">邮箱:</span> {currentQuestion.creator.email}
                      </p>
                    </div>
                  </div>
                </Card>
              )}
              
              {/* 相关题目 */}
              <Card className="overflow-hidden shadow-lg border-0 dark:bg-gray-800">
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">相关题目</h3>
                  {loadingRelated ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    </div>
                  ) : relatedQuestions.length === 0 ? (
                    <div className="text-center py-6">
                      <p className="text-gray-500 dark:text-gray-400">暂无相关题目</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {relatedQuestions.slice(0, 3).map((q) => (
                        <div 
                          key={q.qid}
                          className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
                          onClick={() => {
                            // 找到该题目在questions数组中的索引
                            const index = questions.findIndex(question => question.qid === q.qid);
                            if (index !== -1) {
                              setCurrentQuestionIndex(index);
                              
                              // 更新URL，但不刷新页面
                              window.history.pushState({}, '', `/questions/${q.qid}/view`);
                              
                              // 增加访问量
                              questionAPI.addView(q.qid).catch(error => {
                                console.warn('更新访问量失败:', error);
                              });
                            }
                          }}
                        >
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1 line-clamp-1">
                            {q.content.stem.replace(/<[^>]*>/g, '').substring(0, 50)}...
                          </div>
                          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                            <div className="flex items-center space-x-2">
                              <span>{q.type === 'choice' ? '选择题' : q.type === 'multiple-choice' ? '多选题' : q.type === 'fill' ? '填空题' : '解答题'}</span>
                              <span>•</span>
                              <span>难度 {q.difficulty}/5</span>
                            </div>
                            <div className="flex items-center">
                              <Eye className="w-3 h-3 mr-1" />
                              <span>{q.views || 0}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </div>
        </motion.div>
      </div>

      {/* 键盘快捷键提示 */}
      <div className="container mx-auto px-6 mt-8">
        <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>使用 ← → 键切换题目，Ctrl+E 编辑题目</p>
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