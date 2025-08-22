import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, RotateCcw, AlertCircle, ChevronLeft, ChevronRight, Target, Check, Minus, Plus } from 'lucide-react';
import { questionAPI, questionBankAPI } from '../../services/api';
import type { Question, QuestionBank } from '../../types';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import LaTeXEditor from '../../components/editor/latex/LaTeXEditor';
import LoadingPage from '../../components/ui/LoadingPage';
import { HoverTooltip, QuestionTypeSelector, KnowledgeTagSelector, QuestionSourceSelector } from '../../components/editor';
import { IntegratedMediaEditor, MediaContentPreview, SimpleMediaPreview } from '../../components/question';
import ConfirmModal from '../../components/ui/ConfirmModal';
import RightSlideModal from '../../components/ui/RightSlideModal';
import { useModal } from '../../hooks/useModal';
import 'katex/dist/katex.min.css';
import { renderContentWithCache } from '../../lib/latex/utils/renderContent';

const EditQuestionPage: React.FC = () => {
  const { bid, qid } = useParams<{ bid: string; qid: string }>();
  const navigate = useNavigate();

  // 弹窗状态管理
  const { 
    showConfirm, 
    confirmModal, 
    closeConfirm,
    setConfirmLoading,
    showSuccessRightSlide,
    rightSlideModal,
    closeRightSlide
  } = useModal();
  
  const [question, setQuestion] = useState<Question | null>(null);
  const [questionBank, setQuestionBank] = useState<QuestionBank | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  
  // 导航相关状态
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [activeTab, setActiveTab] = useState<'stem' | 'solution' | 'media'>('stem');

  // 图片相关状态
  const [images, setImages] = useState<Array<{
    id: string;
    url: string;
    filename: string;
    order: number;
  }>>([]);
  
  // TikZ 图形相关状态
  const [tikzCodes, setTikzCodes] = useState<Array<{
    id: string;
    code: string;
    format: 'svg' | 'png';
    order: number;
  }>>([]);

  const fetchQuestion = useCallback(async () => {
    try {
      setLoading(true);
      const response = await questionAPI.getQuestion(qid!);
      if (response.data.success && response.data.question) {
        setQuestion(response.data.question);
      } else {
        setError(response.data.error || '获取题目失败');
      }
    } catch (error: any) {
      setError(error.response?.data?.error || '获取题目失败');
    } finally {
      setLoading(false);
    }
  }, [qid]);

  const fetchQuestionBank = useCallback(async () => {
    try {
      const response = await questionBankAPI.getQuestionBank(bid!);
      if (response.data.success && response.data.questionBank) {
        setQuestionBank(response.data.questionBank);
      }
    } catch (error: any) {
      // 错误日志已清理
    }
  }, [bid]);

  // 获取题库中的所有题目用于导航
  const fetchAllQuestions = useCallback(async () => {
    try {
      const response = await questionAPI.getQuestions(bid!);
      if (response.data.success && response.data.questions) {
        setAllQuestions(response.data.questions);
        const index = response.data.questions.findIndex((q: Question) => q.qid === qid);
        setCurrentIndex(index);
      }
    } catch (error: any) {
      // 错误日志已清理
    }
  }, [bid, qid]);

  // 获取题目数据
  useEffect(() => {
    if (bid && qid) {
      fetchQuestion();
      fetchQuestionBank();
      fetchAllQuestions();
    }
  }, [bid, qid]); // 移除函数依赖，避免无限循环

  // 同步题目数据到媒体状态
  useEffect(() => {
    if (question) {
      setImages(question.images || []);
      setTikzCodes(question.tikzCodes || []);
    }
  }, [question]);

  // 监听媒体状态变化，设置 hasChanges
  useEffect(() => {
    if (question) {
      const originalImages = question.images || [];
      const originalTikzCodes = question.tikzCodes || [];
      
      // 检查是否有变化
      const imagesChanged = JSON.stringify(images) !== JSON.stringify(originalImages);
      const tikzChanged = JSON.stringify(tikzCodes) !== JSON.stringify(originalTikzCodes);
      
      if (imagesChanged || tikzChanged) {
        setHasChanges(true);
      }
    }
  }, [images, tikzCodes, question]);

  // 处理题目内容变化
  const handleQuestionChange = useCallback((updatedQuestion: Partial<Question>) => {
    setQuestion(prev => prev ? { ...prev, ...updatedQuestion } : null);
    setHasChanges(true);
  }, []);

  // 保存题目
  const handleSave = async () => {
    if (!question) return;

    try {
      setSaving(true);
      // 合并最新的媒体数据到题目对象
      const updatedQuestion = {
        ...question,
        images: images,
        tikzCodes: tikzCodes
      };
      
      const response = await questionAPI.updateQuestion(qid!, updatedQuestion);
      
      if (response.data.success) {
        setHasChanges(false);
        // 显示成功提示
        showSuccessRightSlide('保存成功', '题目保存成功！');
      } else {
        setError(response.data.error || '保存失败');
      }
    } catch (error: any) {
      setError(error.response?.data?.error || '保存失败');
    } finally {
      setSaving(false);
    }
  };

  // 取消编辑
  const handleCancel = () => {
    if (hasChanges) {
      showConfirm(
        '确认离开',
        '您有未保存的更改，确定要离开吗？',
        () => {
          closeConfirm();
          navigate(-1); // 回到上一个页面
        }
      );
    } else {
      navigate(-1); // 回到上一个页面
    }
  };

  // 重置更改
  const handleReset = () => {
    showConfirm(
      '确认重置',
      '确定要重置所有更改吗？',
      async () => {
        setConfirmLoading(true, '正在重置...');
        try {
          await fetchQuestion();
          setHasChanges(false);
        } finally {
          setConfirmLoading(false);
          closeConfirm();
        }
      }
    );
  };

  // 导航到上一道题目
  const handlePreviousQuestion = () => {
    if (currentIndex > 0) {
      const prevQuestion = allQuestions[currentIndex - 1];
      navigate(`/question-banks/${bid}/questions/${prevQuestion.qid}/edit`);
    }
  };

  // 导航到下一道题目
  const handleNextQuestion = () => {
    if (currentIndex < allQuestions.length - 1) {
      const nextQuestion = allQuestions[currentIndex + 1];
      navigate(`/question-banks/${bid}/questions/${nextQuestion.qid}/edit`);
    }
  };

  // 处理选项变化
  const handleOptionChange = (index: number, value: string) => {
    if (!question?.content?.options) return;
    
    const newOptions = [...question.content.options];
    newOptions[index] = { ...newOptions[index], text: value };
    handleQuestionChange({
      content: { ...question.content, options: newOptions }
    });
  };

  // 添加选项
  const addOption = () => {
    if (!question?.content?.options) return;
    
    const newOptions = [...question.content.options, { text: '', isCorrect: false }];
    handleQuestionChange({
      content: { ...question.content, options: newOptions }
    });
  };

  // 删除选项
  const removeOption = (index: number) => {
    if (!question?.content?.options || question.content.options.length <= 2) return;
    
    const newOptions = question.content.options.filter((_, i) => i !== index);
    handleQuestionChange({
      content: { ...question.content, options: newOptions }
    });
  };

  // 处理选择题切换
  const handleChoiceToggle = (index: number) => {
    if (!question?.content?.options) return;
    
    const optionLetter = String.fromCharCode(65 + index);
    let newAnswer = question.content.answer || '';
    
    if (newAnswer.includes(optionLetter)) {
      // 移除选项
      newAnswer = newAnswer.replace(new RegExp(optionLetter, 'g'), '');
    } else {
      // 添加选项
      newAnswer += optionLetter;
    }
    
    // 更新选项的正确性
    const newOptions = question.content.options.map((option, i) => ({
      ...option,
      isCorrect: newAnswer.includes(String.fromCharCode(65 + i))
    }));
    
    handleQuestionChange({
      content: { ...question.content, answer: newAnswer, options: newOptions }
    });
  };

  // 计算填空题的空格数量
  const getFillCount = (stem: string) => {
    const matches = stem.match(/\\fill/g);
    return matches ? matches.length : 0;
  };

  // 计算解答题的答案数量和标签
  const getSolutionAnswerInfo = (stem: string) => {
    const lines = stem.split('\n');
    const answers: { label: string; index: number }[] = [];
    let subpCount = 0;
    let subsubpCount = 0;
    const subpWithSubsubp = new Set<number>();
    
    for (const line of lines) {
      if (line.includes('\\subp')) {
        subpCount++;
        subsubpCount = 0;
      } else if (line.includes('\\subsubp')) {
        subsubpCount++;
        subpWithSubsubp.add(subpCount);
        const romanNumerals = ['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'viii', 'ix', 'x'];
        const romanNum = romanNumerals[subsubpCount - 1] || subsubpCount.toString();
        answers.push({
          label: `(${subpCount}) ${romanNum}.`,
          index: answers.length
        });
      }
    }
    
    for (let i = 1; i <= subpCount; i++) {
      if (!subpWithSubsubp.has(i)) {
        answers.push({
          label: `(${i})`,
          index: answers.length
        });
      }
    }
    
    if (answers.length === 0) {
      answers.push({
        label: '答案',
        index: 0
      });
    }
    
    return answers;
  };

  // 处理填空题答案变化
  const handleFillAnswerChange = (index: number, value: string) => {
    if (!question?.content) return;
    
    const newFillAnswers = [...(question.content.fillAnswers || [])];
    newFillAnswers[index] = value;
    handleQuestionChange({
      content: { ...question.content, fillAnswers: newFillAnswers }
    });
  };

  // 处理解答题答案变化
  const handleSolutionAnswerChange = (index: number, value: string) => {
    if (!question?.content) return;
    
    const newSolutionAnswers = [...(question.content.solutionAnswers || [])];
    newSolutionAnswers[index] = value;
    handleQuestionChange({
      content: { ...question.content, solutionAnswers: newSolutionAnswers }
    });
  };

  // 处理难度变化
  const handleDifficultyChange = (difficulty: number) => {
    handleQuestionChange({ difficulty });
  };

  // 处理分类变化
  const handleCategoryChange = (categories: string[]) => {
    handleQuestionChange({ category: categories.join(', ') });
  };

  // 处理来源变化
  const handleSourceChange = (value: string) => {
    handleQuestionChange({ source: value });
  };

  if (loading) {
    return (
      <LoadingPage
        type="loading"
        title="加载题目中..."
        description="正在获取题目信息，请稍候"
        animation="spinner"
      />
    );
  }

  if (error || !question) {
    return (
      <LoadingPage
        type="error"
        title="题目不存在"
        description={error || '无法加载题目信息'}
        backText="返回题库列表"
        onBack={() => navigate('/question-banks')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* 顶部导航栏 */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={handleCancel}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>返回题库</span>
              </Button>
              
              <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>
              
              {/* 题目导航 */}
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePreviousQuestion}
                  disabled={currentIndex <= 0}
                  className="flex items-center space-x-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>上一题</span>
                </Button>
                
                <div className="text-sm text-gray-500 dark:text-gray-400 px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded">
                  {currentIndex + 1} / {allQuestions.length}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextQuestion}
                  disabled={currentIndex >= allQuestions.length - 1}
                  className="flex items-center space-x-1"
                >
                  <span>下一题</span>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>
              
              <div>
                <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  编辑题目
                </h1>
                {questionBank && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {questionBank.name} • {question.qid}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {hasChanges && (
                <span className="text-sm text-orange-600 dark:text-orange-400 flex items-center space-x-1">
                  <AlertCircle className="w-4 h-4" />
                  <span>有未保存的更改</span>
                </span>
              )}
              
              <Button
                variant="outline"
                onClick={handleReset}
                disabled={!hasChanges}
                className="flex items-center space-x-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>重置</span>
              </Button>
              
              <Button
                onClick={handleSave}
                disabled={saving || !hasChanges}
                className="flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? '保存中...' : '保存'}</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 主要内容区域 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* 题目内容编辑区域 */}
          <div className="space-y-6">
            {/* 题干/解析切换 */}
            <Card>
              <div className="p-4 border-b bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setActiveTab('stem')}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      activeTab === 'stem'
                        ? 'bg-blue-500 text-white'
                        : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                    }`}
                  >
                    题干
                  </button>
                  <button
                    onClick={() => setActiveTab('media')}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      activeTab === 'media'
                        ? 'bg-blue-500 text-white'
                        : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                    }`}
                  >
                    图形
                  </button>
                  <button
                    onClick={() => setActiveTab('solution')}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      activeTab === 'solution'
                        ? 'bg-blue-500 text-white'
                        : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                    }`}
                  >
                    解析
                  </button>
                </div>
              </div>
              <div className="p-4">
                {activeTab === 'stem' ? (
                  <div className="space-y-4">
                     <div>
                       <h4 className="font-medium text-gray-700 dark:text-gray-200 mb-2">题目内容</h4>
                       <LaTeXEditor
                         value={question.content?.stem || ''}
                         onChange={(value) => handleQuestionChange({
                           content: { ...question.content, stem: value }
                         })}
                         placeholder="输入题目内容"
                         showPreview={true}
                         enableHoverPreview={true}
                         questionType={question.type === 'multiple-choice' ? 'choice' : question.type}
                       />
                     </div>
                  </div>
                ) : activeTab === 'solution' ? (
                   <div className="space-y-4">
                     {/* 题目内容显示 */}
                     <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                       <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-3 flex items-center">
                         <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                         题目内容
                       </h4>
                       <div 
                         className="prose prose-sm max-w-none text-blue-800 dark:text-blue-200"
                         dangerouslySetInnerHTML={{ 
                           __html: question.content?.stem ? 
                             (() => {
                               // 处理自动编号
                               let processedContent = question.content.stem;
                               const lines = processedContent.split('\n');
                               let subpCount = 0;
                               let subsubpCount = 0;

                               processedContent = lines.map(line => {
                                 // 处理 \subp
                                 if (line.includes('\\subp')) {
                                   subpCount++;
                                   subsubpCount = 0; // 重置小小问计数
                                   return line.replace(/\\subp(\[.*?\])?/, `\\subp[${subpCount}]`);
                                 }
                                 // 处理 \subsubp
                                 if (line.includes('\\subsubp')) {
                                   subsubpCount++;
                                   const romanNumerals = ['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'viii', 'ix', 'x'];
                                   const romanNum = romanNumerals[subsubpCount - 1] || subsubpCount.toString();
                                   return line.replace(/\\subsubp(\[.*?\])?/, `\\subsubp[${romanNum}]`);
                                 }
                                 return line;
                               }).join('\n');

                               // 使用 renderContentWithCache 确保正确的 LaTeX 渲染
                               return renderContentWithCache(processedContent);
                             })() : '暂无题目内容'
                         }}
                       />
                       
                       {/* 题目图形预览 */}
                       {(tikzCodes.length > 0 || images.length > 0) && (
                         <div className="mt-4 pt-4 border-t border-blue-200 dark:border-blue-600">
                           <SimpleMediaPreview tikzCodes={tikzCodes} images={images} />
                         </div>
                       )}
                     </div>



                     {/* 解析编辑器 */}
                     <div>
                       <h4 className="font-medium text-gray-700 dark:text-gray-200 mb-2">解析内容</h4>
                       <LaTeXEditor
                         value={question.content?.solution || ''}
                         onChange={(value: string) => handleQuestionChange({
                           content: { ...question.content, solution: value }
                         })}
                         placeholder="输入题目解析"
                         showPreview={true}
                         enableHoverPreview={true}
                         questionType="solution"
                         displayType="solution"
                       />
                       {/* 媒体内容预览在解析中 */}
                       <MediaContentPreview tikzCodes={tikzCodes} images={images} />
                     </div>
                   </div>
                 ) : activeTab === 'media' ? (
                   <div className="space-y-4">
                     <h4 className="font-medium text-gray-700 dark:text-gray-200">图形管理</h4>
                     <IntegratedMediaEditor
                       tikzCodes={tikzCodes}
                       onTikzCodesChange={setTikzCodes}
                       images={images}
                       onImagesChange={setImages}
                     />
                   </div>
                 ) : null}
              </div>
            </Card>

            {/* 选项编辑（选择题） */}
            {(question.type === 'choice' || question.type === 'multiple-choice') && question.content?.options && (
              <Card>
                <div className="p-4 border-b bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                  <h3 className="font-medium text-gray-900 dark:text-gray-100">选项设置</h3>
                </div>
                <div className="p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      题目类型：{question.type === 'choice' ? '单选题' : '多选题'} 
                      <span className="text-xs text-gray-400 dark:text-gray-500 ml-2">（系统自动判断）</span>
                    </span>
                  </div>

                  <div className="space-y-3">
                    {question.content.options.map((option, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <button
                          onClick={() => handleChoiceToggle(index)}
                          className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                            question.content.answer.includes(String.fromCharCode(65 + index))
                              ? 'bg-blue-500 border-blue-500 text-white'
                              : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-400'
                          }`}
                          title={question.content.answer.includes(String.fromCharCode(65 + index)) ? '取消选择' : '选择答案'}
                        >
                          {question.content.answer.includes(String.fromCharCode(65 + index)) && <Check className="w-3 h-3" />}
                        </button>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-200 w-6">
                          {String.fromCharCode(65 + index)}.
                        </span>
                        <HoverTooltip content={option.text} config={{ mode: 'lightweight' }}>
                          <Input
                            value={option.text}
                            onChange={(e) => handleOptionChange(index, e.target.value)}
                            placeholder={`选项 ${String.fromCharCode(65 + index)}`}
                            className="flex-1"
                            enableLatexAutoComplete={true}
                          />
                        </HoverTooltip>
                        <Button
                          onClick={() => removeOption(index)}
                          variant="outline"
                          size="sm"
                          disabled={(question.content.options?.length || 0) <= 2}
                          title="删除选项"
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  {question.content.answer && (
                    <div className="mt-3 p-2 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        已选择答案：<span className="font-medium text-gray-900 dark:text-gray-100">{question.content.answer}</span>
                        <span className="text-xs text-gray-400 dark:text-gray-500 ml-2">
                          （{question.type === 'choice' ? '单选题' : '多选题'}）
                        </span>
                      </p>
                    </div>
                  )}

                                     <Button
                     onClick={addOption}
                     variant="outline"
                     size="sm"
                     disabled={(question.content.options?.length || 0) >= 6}
                   >
                    <Plus className="w-4 h-4 mr-1" />
                    添加选项
                  </Button>
                </div>
              </Card>
            )}

            {/* 答案编辑（非选择题） */}
            {(question.type === 'fill' || question.type === 'solution') && (
              <Card>
                <div className="p-4 border-b bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                  <h3 className="font-medium text-gray-900 dark:text-gray-100">答案设置</h3>
                </div>
                <div className="p-4">
                  {question.type === 'fill' ? (
                    <div className="space-y-3">
                      <p className="text-sm text-gray-600 dark:text-gray-400">根据题干中的 \fill 数量，填写对应的答案：</p>
                      {Array.from({ length: getFillCount(question.content.stem) }, (_, index) => (
                        <div key={`fill-answer-${index}`} className="space-y-2">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-200">第 {index + 1} 空：</span>
                          <HoverTooltip content={question.content.fillAnswers?.[index] || ''} config={{ mode: 'lightweight' }}>
                            <Input
                              value={question.content.fillAnswers?.[index] || ''}
                              onChange={(e) => handleFillAnswerChange(index, e.target.value)}
                              placeholder={`答案 ${index + 1}`}
                              className="w-full"
                              enableLatexAutoComplete={true}
                              enableLatexHighlight={true}
                            />
                          </HoverTooltip>
                        </div>
                      ))}
                      {getFillCount(question.content.stem) === 0 && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">题干中没有找到 \fill，请先添加填空题标记</p>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-sm text-gray-600 dark:text-gray-400">根据题干中的 \subp 和 \subsubp 数量，填写对应的答案：</p>
                      {(() => {
                        const answerInfo = getSolutionAnswerInfo(question.content.stem);
                        return answerInfo.map((info, index) => (
                          <div key={`solution-answer-${index}-${info.label}`} className="space-y-2">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{info.label}：</span>
                            <HoverTooltip content={question.content.solutionAnswers?.[index] || ''} config={{ mode: 'lightweight' }}>
                              <Input
                                value={question.content.solutionAnswers?.[index] || ''}
                                onChange={(e) => handleSolutionAnswerChange(index, e.target.value)}
                                placeholder={`答案 ${info.label}`}
                                className="w-full"
                                enableLatexAutoComplete={true}
                              enableLatexHighlight={true}
                              />
                            </HoverTooltip>
                          </div>
                        ));
                      })()}
                    </div>
                  )}
                </div>
              </Card>
            )}
          </div>

          {/* 题目属性设置 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* 难度设置 */}
            <Card>
              <div className="p-4 border-b bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-2">
                  <Target className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  <h3 className="font-medium text-gray-900 dark:text-gray-100">难度</h3>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-center space-x-2">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <button
                      key={level}
                      onClick={() => handleDifficultyChange(level)}
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                        question.difficulty === level
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  {question.difficulty === 1 && '非常简单'}
                  {question.difficulty === 2 && '简单'}
                  {question.difficulty === 3 && '中等'}
                  {question.difficulty === 4 && '困难'}
                  {question.difficulty === 5 && '非常困难'}
                </p>
              </div>
            </Card>

            {/* 小题型设置 */}
            <QuestionTypeSelector
              selectedTypes={question.category ? [question.category] : []}
              onTypesChange={handleCategoryChange}
              maxCount={3}
            />

            {/* 知识点标签 */}
            <KnowledgeTagSelector
              selectedTags={question.tags || []}
              onTagsChange={(tags: string[]) => handleQuestionChange({ tags })}
              maxCount={5}
            />

            {/* 题目出处 */}
            <QuestionSourceSelector
              source={question.source || ''}
              onSourceChange={handleSourceChange}
            />
          </div>
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

export default EditQuestionPage; 