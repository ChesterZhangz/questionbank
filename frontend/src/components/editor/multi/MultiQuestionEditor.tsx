import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  ChevronRight, 
  Brain, 
  Save, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  Trash2
} from 'lucide-react';
import Button from '../../ui/Button';
import Card from '../../ui/Card';
import { questionAnalysisAPI, questionAPI } from '../../../services/api';
import QuestionEditor from './QuestionEditor';
import { useTranslation } from '../../../hooks/useTranslation';

interface QuestionData {
  id: string;
  stem: string;
  options?: string[];
  answer: string;
  fillAnswers?: string[];
  solutionAnswers?: string[];
  solution?: string;
  questionType: 'choice' | 'multiple-choice' | 'fill' | 'solution';
  category?: string[];
  tags?: string[];
  source?: string;
  difficulty?: number;
  isChoiceQuestion?: boolean;
  questionContent?: string;
}

interface MultiQuestionEditorProps {
  questions: QuestionData[];
  onQuestionsUpdate: (questions: QuestionData[]) => void;
  onSaveAll: (questions: QuestionData[]) => void;
  onExit?: () => void;
  selectedBankId?: string;
  className?: string;
}

const MultiQuestionEditor: React.FC<MultiQuestionEditorProps> = ({
  questions,
  onQuestionsUpdate,
  onSaveAll,
  selectedBankId,
  className = ""
}) => {
  const { t } = useTranslation();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [saveProgress, setSaveProgress] = useState(0);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  


  // 更新单个题目
  const handleQuestionUpdate = useCallback((updatedQuestion: QuestionData) => {
    const newQuestions = [...questions];
    newQuestions[currentQuestionIndex] = updatedQuestion;
    onQuestionsUpdate(newQuestions);
  }, [questions, currentQuestionIndex, onQuestionsUpdate]);

  // 删除当前题目
  const handleDeleteQuestion = useCallback(() => {
    if (questions.length <= 1) {
      setError(t('editor.multiQuestionEditor.deleteConfirm'));
      return;
    }

    const newQuestions = questions.filter((_, index) => index !== currentQuestionIndex);
    onQuestionsUpdate(newQuestions);
    
    // 调整当前索引
    if (currentQuestionIndex >= newQuestions.length) {
      setCurrentQuestionIndex(Math.max(0, newQuestions.length - 1));
    }
    
    setSuccess(t('editor.multiQuestionEditor.deleteSuccess'));
    setTimeout(() => setSuccess(''), 3000);
  }, [questions, currentQuestionIndex, onQuestionsUpdate, t]);

  // 切换到上一题
  const goToPrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  // 切换到下一题
  const goToNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };



  // 批量智能分析
  const handleBatchAnalysis = async () => {
    if (questions.length === 0) return;

    setIsAnalyzing(true);
    setAnalysisProgress(0);
    setError('');
    setSuccess('');

    // 模拟进度条动画
    const progressInterval = setInterval(() => {
      setAnalysisProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 5;
      });
    }, 100);

    try {

      
      const analysisPromises = questions.map(async (question) => {
        try {
          const response = await questionAnalysisAPI.analyzeQuestion(question.stem);

          if (response.data.success) {
            const analysis = response.data.analysis;
            const updatedQuestion = {
              ...question,
              category: analysis.category ? [analysis.category] : question.category,
              tags: analysis.tags || question.tags,
              difficulty: analysis.difficulty || question.difficulty,
              // 根据AI分析结果更新题型
              questionType: analysis.questionType || question.questionType,
              // 如果是选择题且有选项，则更新选项
              options: analysis.options || question.options
            };
            
            return updatedQuestion;
          } else {
            throw new Error('分析失败');
          }
        } catch (err) {
          // 错误日志已清理
          return question; // 返回原题目，不中断整个流程
        }
      });

      const updatedQuestions = await Promise.all(analysisPromises);
      onQuestionsUpdate(updatedQuestions);
      
      // 完成进度条
      setAnalysisProgress(100);
      setTimeout(() => {
        setSuccess(t('editor.multiQuestionEditor.analysisSuccess', { count: questions.length }));
        setTimeout(() => setSuccess(''), 5000);
      }, 500);
      
    } catch (err: any) {
      // 错误日志已清理
      const errorMsg = err.response?.data?.error || err.message || t('editor.multiQuestionEditor.analysisFailed');
      setError(errorMsg);
    } finally {
      clearInterval(progressInterval);
      setTimeout(() => {
        setIsAnalyzing(false);
        setAnalysisProgress(0);
      }, 1000);
    }
  };

  // 批量保存
  const handleSaveAll = async () => {
    if (questions.length === 0 || !selectedBankId) return;

    setIsSaving(true);
    setSaveProgress(0);
    setError('');
    setSuccess('');

    // 模拟进度条动画
    const progressInterval = setInterval(() => {
      setSaveProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 5;
      });
    }, 100);

    try {
      
      
      const savePromises = questions.map(async (question) => {
        try {
          // 准备保存数据
          let answerContent = question.answer || '';
          
          // 根据题目类型设置答案内容
          if (question.questionType === 'fill') {
            // 填空题：将fillAnswers合并为答案字符串
            answerContent = question.fillAnswers?.join('; ') || '';
          } else if (question.questionType === 'solution') {
            // 解答题：将solutionAnswers合并为答案字符串
            answerContent = question.solutionAnswers?.join('; ') || '';
          }
          
          const saveData = {
            type: question.questionType,
            content: {
              stem: question.stem,
              options: question.questionType === 'choice' || question.questionType === 'multiple-choice' 
                ? (question.options || []).map((option, index) => ({
                    text: option,
                    isCorrect: question.answer.includes(String.fromCharCode(65 + index))
                  }))
                : undefined,
              answer: answerContent,
              fillAnswers: question.questionType === 'fill' ? question.fillAnswers : undefined,
              solutionAnswers: question.questionType === 'solution' ? question.solutionAnswers : undefined,
              solution: question.solution || ''
            },
            category: question.category || [],
            tags: question.tags || [],
            source: question.source || '',
            difficulty: question.difficulty || 3
          };

          const response = await questionAPI.createQuestion(selectedBankId, saveData);
          
          if (response.data.success) {
            return { success: true, questionId: response.data.question?._id };
          } else {
            throw new Error('保存失败');
          }
        } catch (err) {
          // 错误日志已清理
          return { success: false, error: err };
        }
      });

      const results = await Promise.all(savePromises);
      const successCount = results.filter(r => r.success).length;
      const failCount = results.length - successCount;
      
      if (failCount === 0) {
        // 完成进度条
        setSaveProgress(100);
        setTimeout(() => {
          setSuccess(t('editor.multiQuestionEditor.saveSuccess', { count: questions.length }));
          // 保存成功后调用父组件的保存回调
          onSaveAll(questions);
          setTimeout(() => setSuccess(''), 5000);
        }, 500);
      } else {
        setError(t('editor.multiQuestionEditor.savePartial', { success: successCount, fail: failCount }));
      }
      
    } catch (err: any) {
      // 错误日志已清理
      const errorMsg = err.response?.data?.error || err.message || t('editor.multiQuestionEditor.saveFailed');
      setError(errorMsg);
    } finally {
      clearInterval(progressInterval);
      setTimeout(() => {
        setIsSaving(false);
        setSaveProgress(0);
      }, 1000);
    }
  };

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`multi-question-editor ${className}`}
    >
      <div className="space-y-6">
        {/* 题目导航栏 */}
        <Card>
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {t('editor.multiQuestionEditor.questionCount', { current: currentQuestionIndex + 1, total: questions.length })}
              </span>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* 删除按钮 */}
              <Button
                onClick={handleDeleteQuestion}
                variant="outline"
                size="sm"
                disabled={questions.length <= 1}
                className="border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                {t('editor.multiQuestionEditor.delete')}
              </Button>
              
              {/* 一键智能分析 */}
              <Button
                onClick={handleBatchAnalysis}
                disabled={isAnalyzing || questions.length === 0}
                size="sm"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                    {t('editor.multiQuestionEditor.analyzing')}
                  </>
                ) : (
                  <>
                    <Brain className="w-4 h-4 mr-1" />
                    {t('editor.multiQuestionEditor.batchAnalysis')}
                  </>
                )}
              </Button>
              
              {/* 批量保存 */}
              <Button
                onClick={handleSaveAll}
                disabled={isSaving || questions.length === 0 || !selectedBankId}
                size="sm"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                    {t('editor.multiQuestionEditor.saving')}
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-1" />
                    {t('editor.multiQuestionEditor.batchSave')}
                  </>
                )}
              </Button>
            </div>
          </div>
        </Card>

        {/* 进度条 */}
        {(isAnalyzing || isSaving) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2"
          >
            <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
              <span>{isAnalyzing ? t('editor.multiQuestionEditor.analyzing') : t('editor.multiQuestionEditor.saving')}</span>
              <span>{Math.round(isAnalyzing ? analysisProgress : saveProgress)}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${isAnalyzing ? analysisProgress : saveProgress}%` }}
              />
            </div>
          </motion.div>
        )}

        {/* 错误提示 */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center space-x-2 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg"
          >
            <AlertCircle className="w-5 h-5 text-red-500" />
            <span className="text-red-700 dark:text-red-300">{error}</span>
          </motion.div>
        )}

        {/* 成功提示 */}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center space-x-2 p-3 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg"
          >
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span className="text-green-700 dark:text-green-300">{success}</span>
          </motion.div>
        )}

        {/* 题目切换导航 */}
        <Card>
          <div className="p-4 flex items-center justify-between">
            <Button
              onClick={goToPrevious}
              disabled={currentQuestionIndex === 0}
              variant="outline"
              className="border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              {t('editor.multiQuestionEditor.previous')}
            </Button>
            
            <div className="flex items-center space-x-2">
              {questions.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentQuestionIndex(index)}
                  className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-medium transition-colors ${
                    index === currentQuestionIndex
                      ? 'bg-blue-500 border-blue-500 text-white'
                      : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-400 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
            
            <Button
              onClick={goToNext}
              disabled={currentQuestionIndex === questions.length - 1}
              variant="outline"
              className="border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              {t('editor.multiQuestionEditor.next')}
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </Card>

        {/* 当前题目编辑器 */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestionIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {currentQuestion && (
              <QuestionEditor
                question={currentQuestion}
                onChange={handleQuestionUpdate}
              />
            )}
          </motion.div>
        </AnimatePresence>

        {/* 底部导航 */}
        <Card>
          <div className="p-4 flex items-center justify-between">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {selectedBankId ? t('editor.multiQuestionEditor.questionBankSelected') : t('editor.multiQuestionEditor.selectQuestionBank')}
            </div>
            
            <div className="flex items-center space-x-3">
              <Button
                onClick={goToPrevious}
                disabled={currentQuestionIndex === 0}
                variant="outline"
                size="sm"
                className="border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                {t('editor.multiQuestionEditor.previous')}
              </Button>
              
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {currentQuestionIndex + 1} / {questions.length}
              </span>
              
              <Button
                onClick={goToNext}
                disabled={currentQuestionIndex === questions.length - 1}
                variant="outline"
                size="sm"
                className="border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                {t('editor.multiQuestionEditor.next')}
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </motion.div>
  );
};

export default MultiQuestionEditor; 