import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Eye, EyeOff, ChevronUp, ChevronDown, CheckCircle, Type, FileText } from 'lucide-react';
import Button from '../ui/Button';
import FuzzySelect from '../ui/FuzzySelect';
import { LaTeXEditor } from '../editor';
import LaTeXPreview from '../editor/preview/LaTeXPreview';
import QuestionTypeSelector from '../editor/question/QuestionTypeSelector';
import KnowledgeTagSelector from '../editor/question/KnowledgeTagSelector';
import RightSlideModal from '../ui/RightSlideModal';
import { BatchEditMediaEditor, SimpleMediaPreview } from '../question';
import type { Question, QuestionBank } from '../../types';
import { useModal } from '../../hooks/useModal';

interface QuestionEditModalProps {
  isOpen: boolean;
  question: Question | null;
  questionBank: QuestionBank | null;
  onClose: () => void;
  onSave: (updatedQuestion: Partial<Question>) => void;
}

const QuestionEditModal: React.FC<QuestionEditModalProps> = ({
  isOpen,
  question,
  questionBank,
  onClose,
  onSave
}) => {
  // 弹窗状态管理
  const { showErrorRightSlide, rightSlideModal, closeRightSlide } = useModal();

  const [editedQuestion, setEditedQuestion] = useState<Partial<Question>>({});
  const [showPreview, setShowPreview] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});
  
  // 媒体相关状态
  const [images, setImages] = useState<Array<{
    id: string;
    url: string;
    filename: string;
    order: number;
  }>>([]);
  const [tikzCodes, setTikzCodes] = useState<Array<{
    id: string;
    code: string;
    format: 'svg' | 'png';
    order: number;
  }>>([]);

  // 管理背景滚动
  useEffect(() => {
    if (isOpen) {
      // 禁用背景滚动
      document.body.style.overflow = 'hidden';
    } else {
      // 恢复背景滚动
      document.body.style.overflow = 'unset';
    }

    // 清理函数
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // 初始化编辑数据
  React.useEffect(() => {
    if (question) {
      setEditedQuestion({
        type: question.type,
        content: {
          stem: question.content?.stem || '',
          options: question.content?.options || [],
          answer: question.content?.answer || '',
          fillAnswers: question.content?.fillAnswers || [],
          solutionAnswers: question.content?.solutionAnswers || [],
          solution: question.content?.solution || ''
        },
        difficulty: question.difficulty || 3,
        tags: question.tags || [],
        category: question.category || [],
        source: question.source || ''
      });
      
      // 初始化媒体数据
      setImages(question.images || []);
      setTikzCodes(question.tikzCodes || []);
    }
  }, [question]);

  const handleSave = () => {
    // 数据验证
    const errors: string[] = [];
    
    // 验证题干
    if (!editedQuestion.content?.stem?.trim()) {
      errors.push('题干不能为空');
    }
    
    // 根据题目类型验证
    const questionType = editedQuestion.type || question?.type;
    
    if (questionType === 'choice') {
      // 选择题验证
      if (!editedQuestion.content?.options || editedQuestion.content.options.length < 2) {
        errors.push('选择题至少需要2个选项');
      }
      
      const hasCorrectOption = editedQuestion.content?.options?.some(option => option.isCorrect);
      if (!hasCorrectOption) {
        errors.push('选择题至少需要选择一个正确答案');
      }
      
      const emptyOptions = editedQuestion.content?.options?.some(option => !option.text.trim());
      if (emptyOptions) {
        errors.push('选择题选项不能为空');
      }
    }
    
    if (questionType === 'fill') {
      // 填空题验证
      if (!editedQuestion.content?.fillAnswers || editedQuestion.content.fillAnswers.length === 0) {
        errors.push('填空题至少需要一个答案');
      }
      
      const emptyAnswers = editedQuestion.content?.fillAnswers?.some(answer => !answer.trim());
      if (emptyAnswers) {
        errors.push('填空题答案不能为空');
      }
    }
    
    if (questionType === 'solution') {
      // 解答题验证
      if (!editedQuestion.content?.solutionAnswers || editedQuestion.content.solutionAnswers.length === 0) {
        errors.push('解答题至少需要一个解答步骤');
      }
      
      const emptyAnswers = editedQuestion.content?.solutionAnswers?.some(answer => !answer.trim());
      if (emptyAnswers) {
        errors.push('解答题答案不能为空');
      }
    }
    
    // 验证分类和标签
    if (editedQuestion.category && Array.isArray(editedQuestion.category)) {
      if (editedQuestion.category.length > 3) {
        errors.push('小题型分类最多3个');
      }
    }
    
    if (editedQuestion.tags && editedQuestion.tags.length > 5) {
      errors.push('知识点标签最多5个');
    }
    
    // 如果有错误，显示错误信息
    if (errors.length > 0) {
      showErrorRightSlide('验证失败', '请修正以下错误：\n' + errors.join('\n'));
      return;
    }
    
    // 保存数据，包含媒体信息
    const updatedQuestion = {
      ...editedQuestion,
      images: images,
      tikzCodes: tikzCodes
    };
    
    onSave(updatedQuestion);
    onClose();
  };

  const handleCancel = () => {
    setEditedQuestion({});
    onClose();
  };

  const updateContent = (field: string, value: any) => {
    setEditedQuestion(prev => ({
      ...prev,
      content: {
        ...prev.content,
        [field]: value
      } as any
    }));
  };

  const updateField = (field: string, value: any) => {
    setEditedQuestion(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // 切换区域展开/收缩
  const toggleSection = (sectionId: string) => {
    setCollapsedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  // 题目类型选项
  const questionTypeOptions = [
    { value: 'choice', label: '选择题', icon: CheckCircle },
    { value: 'fill', label: '填空题', icon: Type },
    { value: 'solution', label: '解答题', icon: FileText }
  ];

  // 难度等级选项
  const difficultyOptions = [
    { value: 1, label: '简单' },
    { value: 2, label: '较简单' },
    { value: 3, label: '中等' },
    { value: 4, label: '较难' },
    { value: 5, label: '困难' }
  ];

  // 获取题目类型显示名称（根据选项自动判断单选/多选）
  const getQuestionTypeDisplayName = (type: string) => {
    if (type === 'choice') {
      const correctOptions = editedQuestion.content?.options?.filter(option => option.isCorrect) || [];
      return correctOptions.length === 1 ? '单选题' : '多选题';
    }
    return questionTypeOptions.find(option => option.value === type)?.label || type;
  };

  // 获取题目类型颜色（参考QuestionCard）
  const getQuestionTypeColor = (type: string) => {
    switch (type) {
      case 'choice': return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700';
      case 'fill': return 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700';
      case 'solution': return 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-700';
      default: return 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700';
    }
  };

  // 获取难度颜色（参考QuestionCard）
  const getDifficultyColor = (difficulty: number) => {
    switch (difficulty) {
      case 1: return 'text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700';
      case 2: return 'text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700';
      case 3: return 'text-orange-600 bg-orange-50 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-700';
      case 4: return 'text-red-600 bg-red-50 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700';
      case 5: return 'text-purple-600 bg-purple-50 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-700';
      default: return 'text-gray-600 bg-gray-50 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700';
    }
  };

  // 获取难度文本（参考QuestionCard）
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

  // 计算填空题答案数量
  const getFillCount = (stem: string) => {
    const matches = stem.match(/\\fill/g);
    return matches ? matches.length : 0;
  };

  // 计算解答题的答案数量和标签
  const getSolutionAnswerInfo = (stem: string) => {
    const answers: { label: string; index: number }[] = [];
    
    // 如果没有找到任何标记，返回默认答案
    if (!stem.includes('\\subp') && !stem.includes('\\subsubp')) {
      answers.push({
        label: '答案',
        index: 0
      });
      return answers;
    }
    
    // 先扫描一遍，确定每个 \subp 是否有对应的 \subsubp
    const lines = stem.split('\n');
    const subpHasSubsubp = new Set<number>(); // 记录哪些 \subp 有对应的 \subsubp
    let currentSubpIndex = 0;
    
    for (const line of lines) {
      const subpCount = (line.match(/\\subp/g) || []).length;
      if (subpCount > 0) {
        currentSubpIndex += subpCount;
      }
      
      const subsubpCount = (line.match(/\\subsubp/g) || []).length;
      if (subsubpCount > 0) {
        // 标记当前 \subp 有对应的 \subsubp
        subpHasSubsubp.add(currentSubpIndex);
      }
    }
    
    // 重新解析，生成答案框
    currentSubpIndex = 0;
    let currentSubsubpIndex = 0;
    
    for (const line of lines) {
      const subpCount = (line.match(/\\subp/g) || []).length;
      if (subpCount > 0) {
        currentSubpIndex += subpCount;
        currentSubsubpIndex = 0; // 重置子子问题索引
      }
      
      const subsubpCount = (line.match(/\\subsubp/g) || []).length;
      if (subsubpCount > 0) {
        // 处理 \subsubp，生成答案框
        for (let i = 0; i < subsubpCount; i++) {
          currentSubsubpIndex++;
          const romanNumerals = ['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'viii', 'ix', 'x'];
          const romanNum = romanNumerals[currentSubsubpIndex - 1] || currentSubsubpIndex.toString();
          answers.push({
            label: `(${currentSubpIndex})${romanNum}`,
            index: answers.length
          });
        }
      } else if (subpCount > 0) {
        // 处理 \subp，只有当它没有对应的 \subsubp 时才生成答案框
        for (let i = 0; i < subpCount; i++) {
          const subpNumber = currentSubpIndex - subpCount + i + 1;
          if (!subpHasSubsubp.has(subpNumber)) {
            answers.push({
              label: `(${subpNumber})`,
              index: answers.length
            });
          }
        }
      }
    }
    
    return answers;
  };

  if (!question) return null;

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50 dark:bg-opacity-70 p-4"
            onClick={onClose}
          >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="w-full max-w-7xl max-h-[90vh] overflow-hidden bg-white dark:bg-gray-800 rounded-lg shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 模态框头部 */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30">
              <div className="flex items-center space-x-3">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">编辑题目</h2>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowPreview(!showPreview)}
                    className="flex items-center space-x-1"
                  >
                    {showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    <span>{showPreview ? '隐藏预览' : '显示预览'}</span>
                  </Button>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="p-1 h-8 w-8 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* 编辑内容 - 动态布局 */}
            <div className={`flex h-[calc(90vh-120px)] ${showPreview ? '' : 'justify-center'}`}>
              {/* 左侧编辑区域 */}
              <div className={`${showPreview ? 'flex-1' : 'w-full max-w-4xl'} p-6 overflow-y-auto border-r border-gray-200 dark:border-gray-700 relative`}>
                <motion.div 
                  className="space-y-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* 基础信息组 */}
                  <motion.div 
                    className="bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/30 rounded-lg border border-gray-200 dark:border-gray-700"
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                  >
                    <div 
                      className="p-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center justify-between"
                      onClick={() => toggleSection('basic')}
                    >
                      <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 flex items-center">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                        基础信息
                      </h3>
                      {collapsedSections['basic'] ? (
                        <ChevronDown className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                      ) : (
                        <ChevronUp className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                      )}
                    </div>
                    {!collapsedSections['basic'] && (
                      <div className="p-4 pt-0">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* 题目类型选择 */}
                          <div>
                            <FuzzySelect
                              options={questionTypeOptions}
                              value={editedQuestion.type || question.type}
                              onChange={(value) => updateField('type', value)}
                              placeholder="请选择题目类型"
                              label="题目类型"
                              className="w-full"
                            />
                          </div>

                          {/* 难度选择 */}
                          <div>
                            <FuzzySelect
                              options={difficultyOptions}
                              value={editedQuestion.difficulty || 3}
                              onChange={(value) => updateField('difficulty', value)}
                              placeholder="请选择难度等级"
                              label="难度等级"
                              className="w-full"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>

                  {/* 题目内容组 */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div 
                      className="p-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center justify-between"
                      onClick={() => toggleSection('content')}
                    >
                      <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 flex items-center">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                        题目内容
                      </h3>
                      {collapsedSections['content'] ? (
                        <ChevronDown className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                      ) : (
                        <ChevronUp className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                      )}
                    </div>
                    {!collapsedSections['content'] && (
                      <div className="p-4 pt-0">
                        {/* 题干编辑 - LaTeX编辑器 */}
                        <div className="mb-6">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            题干 <span className="text-red-500">*</span>
                          </label>
                          <div className="border border-gray-300 dark:border-gray-600 rounded-md overflow-hidden bg-white dark:bg-gray-700 shadow-sm">
                            <LaTeXEditor
                              value={editedQuestion.content?.stem || ''}
                              onChange={(value) => updateContent('stem', value)}
                              placeholder="请输入题目题干，支持LaTeX公式..."
                              className="min-h-24"
                              showPreview={false}
                              questionType={question.type === 'multiple-choice' ? 'choice' : question.type}
                              displayType="question"
                              simplified={true}
                            />
                          </div>
                        </div>

                        {/* 选择题选项编辑 */}
                        {(editedQuestion.type || question?.type) === 'choice' && (
                          <div className="mb-6">
                            <div className="flex items-center justify-between mb-3">
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                选项 ({getQuestionTypeDisplayName(editedQuestion.type || question?.type)}) <span className="text-red-500">*</span>
                              </label>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                选择题答案通过勾选正确答案选项来设置
                              </div>
                              <div className="flex items-center space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    const newOptions = [...(editedQuestion.content?.options || []), { text: '', isCorrect: false }];
                                    updateContent('options', newOptions);
                                  }}
                                  disabled={(editedQuestion.content?.options?.length || 0) >= 6}
                                  className="text-xs"
                                >
                                  添加选项
                                </Button>
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {(editedQuestion.content?.options?.length || 0)}/6
                                </span>
                              </div>
                            </div>
                            <div className="space-y-3">
                              {editedQuestion.content?.options?.map((option, index) => (
                                <div key={index} className="border border-gray-200 dark:border-gray-600 rounded-md p-3 bg-white dark:bg-gray-700 shadow-sm">
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center space-x-2">
                                      <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 flex items-center justify-center text-xs font-medium">
                                        {String.fromCharCode(65 + index)}
                                      </span>
                                      <input
                                        type="checkbox"
                                        checked={option.isCorrect}
                                        onChange={(e) => {
                                          const newOptions = [...(editedQuestion.content?.options || [])];
                                          newOptions[index] = { ...option, isCorrect: e.target.checked };
                                          updateContent('options', newOptions);
                                        }}
                                        className="w-4 h-4 text-blue-600 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 dark:focus:ring-blue-400 dark:bg-gray-700"
                                      />
                                      <span className="text-xs text-gray-500 dark:text-gray-400">正确答案</span>
                                    </div>
                                    {(editedQuestion.content?.options?.length || 0) > 2 && (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                          const newOptions = (editedQuestion.content?.options || []).filter((_, i) => i !== index);
                                          updateContent('options', newOptions);
                                        }}
                                        className="text-red-600 hover:text-red-700 p-1 h-6 w-6"
                                      >
                                        <X className="h-3 w-3" />
                                      </Button>
                                    )}
                                  </div>
                                  <div className="border border-gray-300 dark:border-gray-600 rounded-md overflow-hidden">
                                                                          <LaTeXEditor
                                        value={option.text}
                                        onChange={(value) => {
                                          const newOptions = [...(editedQuestion.content?.options || [])];
                                          newOptions[index] = { ...option, text: value };
                                          updateContent('options', newOptions);
                                        }}
                                        placeholder={`选项 ${String.fromCharCode(65 + index)}，支持LaTeX公式...`}
                                        className="min-h-16"
                                        showPreview={false}
                                        questionType={question.type === 'multiple-choice' ? 'choice' : question.type}
                                        displayType="question"
                                        simplified={true}
                                      />
                                  </div>
                                </div>
                              ))}
                            </div>
                            {(editedQuestion.content?.options?.length || 0) < 2 && (
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                选择题至少需要2个选项
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* 题目图片与图形组 */}
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div 
                      className="p-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center justify-between"
                      onClick={() => toggleSection('media')}
                    >
                      <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 flex items-center">
                        <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                        题目图片与图形
                      </h3>
                      {collapsedSections['media'] ? (
                        <ChevronDown className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                      ) : (
                        <ChevronUp className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                      )}
                    </div>
                    {!collapsedSections['media'] && (
                      <div className="p-4 pt-0">
                        <BatchEditMediaEditor
                          images={images}
                          onImagesChange={setImages}
                          tikzCodes={tikzCodes}
                          onTikzCodesChange={setTikzCodes}
                          bid={questionBank?._id}
                        />
                      </div>
                    )}
                  </div>

                  {/* 答案和解析组 */}
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div 
                      className="p-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center justify-between"
                      onClick={() => toggleSection('answer')}
                    >
                      <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 flex items-center">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                        答案与解析
                      </h3>
                      {collapsedSections['answer'] ? (
                        <ChevronDown className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                      ) : (
                        <ChevronUp className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                      )}
                    </div>
                    {!collapsedSections['answer'] && (
                      <div className="p-4 pt-0">
                        {/* 填空题答案编辑 */}
                        {(editedQuestion.type || question?.type) === 'fill' && (
                          <div className="mb-6">
                            <div className="flex items-center justify-between mb-3">
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                填空题答案 <span className="text-red-500">*</span>
                              </label>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                根据题干中的 \fill 标记自动生成
                              </span>
                            </div>
                            <div className="space-y-3">
                              {(() => {
                                const fillCount = getFillCount(editedQuestion.content?.stem || '');
                                if (fillCount === 0) {
                                  return (
                                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                                      <p className="text-sm text-yellow-700 dark:text-yellow-300">
                                        题干中没有找到 \fill 标记，请先在题干中添加填空题标记
                                      </p>
                                    </div>
                                  );
                                }
                                
                                return Array.from({ length: fillCount }, (_, index) => (
                                  <div key={`fill-answer-${index}`} className="border border-gray-200 dark:border-gray-600 rounded-md p-3 bg-white dark:bg-gray-700 shadow-sm">
                                    <div className="flex items-center space-x-2 mb-2">
                                      <span className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300 flex items-center justify-center text-xs font-medium">
                                        {index + 1}
                                      </span>
                                      <span className="text-xs text-gray-500 dark:text-gray-400">第{index + 1}空答案</span>
                                    </div>
                                    <div className="border border-gray-300 dark:border-gray-600 rounded-md overflow-hidden">
                                      <LaTeXEditor
                                        value={editedQuestion.content?.fillAnswers?.[index] || ''}
                                        onChange={(value) => {
                                          const newFillAnswers = [...(editedQuestion.content?.fillAnswers || [])];
                                          newFillAnswers[index] = value;
                                          updateContent('fillAnswers', newFillAnswers);
                                        }}
                                        placeholder={`第${index + 1}空答案，支持LaTeX公式...`}
                                        className="min-h-16"
                                        showPreview={false}
                                        questionType="fill"
                                        displayType="question"
                                        simplified={true}
                                      />
                                    </div>
                                  </div>
                                ));
                              })()}
                            </div>
                          </div>
                        )}

                        {/* 解答题答案编辑 */}
                        {(editedQuestion.type || question?.type) === 'solution' && (
                          <div className="mb-6">
                            <div className="flex items-center justify-between mb-3">
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                解答题答案 <span className="text-red-500">*</span>
                              </label>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                根据题干中的 \subp 和 \subsubp 标记自动生成
                              </span>
                            </div>
                            <div className="space-y-3">
                              {(() => {
                                const answerInfo = getSolutionAnswerInfo(editedQuestion.content?.stem || '');
                                return answerInfo.map((info, index) => (
                                  <div key={`solution-answer-${index}-${info.label}`} className="border border-gray-200 dark:border-gray-600 rounded-md p-3 bg-white dark:bg-gray-700 shadow-sm">
                                    <div className="flex items-center space-x-2 mb-2">
                                      <span className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 flex items-center justify-center text-xs font-medium">
                                        {index + 1}
                                      </span>
                                      <span className="text-xs text-gray-500 dark:text-gray-400">{info.label}</span>
                                    </div>
                                    <div className="border border-gray-300 dark:border-gray-600 rounded-md overflow-hidden">
                                      <LaTeXEditor
                                        value={editedQuestion.content?.solutionAnswers?.[index] || ''}
                                        onChange={(value) => {
                                          const newSolutionAnswers = [...(editedQuestion.content?.solutionAnswers || [])];
                                          newSolutionAnswers[index] = value;
                                          updateContent('solutionAnswers', newSolutionAnswers);
                                        }}
                                        placeholder={`答案 ${info.label}，支持LaTeX公式...`}
                                        className="min-h-16"
                                        showPreview={false}
                                        questionType="solution"
                                        displayType="question"
                                        simplified={true}
                                      />
                                    </div>
                                  </div>
                                ));
                              })()}
                            </div>
                          </div>
                        )}

                        {/* 答案编辑 - LaTeX编辑器（非选择题、非填空题且非解答题） */}
                        {(editedQuestion.type || question?.type) !== 'choice' && 
                         (editedQuestion.type || question?.type) !== 'multiple-choice' &&
                         (editedQuestion.type || question?.type) !== 'fill' && 
                         (editedQuestion.type || question?.type) !== 'solution' && (
                          <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              答案
                            </label>
                            <div className="border border-gray-300 dark:border-gray-600 rounded-md overflow-hidden bg-white dark:bg-gray-700 shadow-sm">
                              <LaTeXEditor
                                value={editedQuestion.content?.answer || ''}
                                onChange={(value) => updateContent('answer', value)}
                                placeholder="请输入答案，支持LaTeX公式..."
                                className="min-h-20"
                                showPreview={false}
                                questionType={question.type === 'multiple-choice' ? 'choice' : question.type}
                                displayType="question"
                                simplified={true}
                              />
                            </div>
                          </div>
                        )}

                        {/* 解析编辑 - LaTeX编辑器 */}
                        <div className="mb-6">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            解析
                          </label>
                          <div className="border border-gray-300 dark:border-gray-600 rounded-md overflow-hidden bg-white dark:bg-gray-700 shadow-sm">
                            <LaTeXEditor
                              value={editedQuestion.content?.solution || ''}
                              onChange={(value) => updateContent('solution', value)}
                              placeholder="请输入解析，支持LaTeX公式..."
                              className="min-h-24"
                              showPreview={false}
                              questionType={question.type === 'multiple-choice' ? 'choice' : question.type}
                              displayType="solution"
                              simplified={true}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 分类和标签组 */}
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div 
                      className="p-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center justify-between"
                      onClick={() => toggleSection('category')}
                    >
                      <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 flex items-center">
                        <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                        分类与标签
                      </h3>
                      {collapsedSections['category'] ? (
                        <ChevronDown className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                      ) : (
                        <ChevronUp className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                      )}
                    </div>
                    {!collapsedSections['category'] && (
                      <div className="p-4 pt-0">
                        <div className="space-y-4">
                          {/* 分类编辑 */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              小题型分类
                            </label>
                            <QuestionTypeSelector
                              selectedTypes={editedQuestion.category && Array.isArray(editedQuestion.category) ? editedQuestion.category : []}
                              onTypesChange={(types) => updateField('category', types)}
                              maxCount={3}
                              className="border-0 shadow-none"
                            />
                          </div>

                          {/* 标签编辑 */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              知识点标签
                            </label>
                            <KnowledgeTagSelector
                              selectedTags={editedQuestion.tags || []}
                              onTagsChange={(tags) => updateField('tags', tags)}
                              maxCount={5}
                              className="border-0 shadow-none"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 来源信息组 */}
                  <div className="bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-900/30 dark:to-yellow-900/30 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div 
                      className="p-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center justify-between"
                      onClick={() => toggleSection('source')}
                    >
                      <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 flex items-center">
                        <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                        来源信息
                      </h3>
                      {collapsedSections['source'] ? (
                        <ChevronDown className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                      ) : (
                        <ChevronUp className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                      )}
                    </div>
                    {!collapsedSections['source'] && (
                      <div className="p-4 pt-0">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            题目来源
                          </label>
                          <input
                            type="text"
                            value={editedQuestion.source || ''}
                            onChange={(e) => updateField('source', e.target.value)}
                            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 shadow-sm"
                            placeholder="请输入题目来源，如：2025年上海中学高一期中"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>


              </div>

              {/* 右侧实时预览区域 */}
              {showPreview && (
                <div className="w-1/2 p-6 overflow-y-auto bg-gray-50 dark:bg-gray-900">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                    <Eye className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
                    实时预览
                  </h3>
                  <div className="space-y-4">
                    {/* Type & Difficulty & Tags Preview */}
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getQuestionTypeColor(editedQuestion.type || question?.type)}`}>
                        {getQuestionTypeDisplayName(editedQuestion.type || question?.type)}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(editedQuestion.difficulty || 3)}`}>
                        {getDifficultyText(editedQuestion.difficulty || 3)}
                      </span>
                      <AnimatePresence>
                        {editedQuestion.category && Array.isArray(editedQuestion.category) && editedQuestion.category.length > 0 && (
                          <>
                            {editedQuestion.category.map((category, index) => (
                              <motion.span
                                key={`category-${category}-${index}`}
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0, opacity: 0 }}
                                transition={{ duration: 0.2, delay: index * 0.1 }}
                                className="px-2 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-700"
                              >
                                {category}
                              </motion.span>
                            ))}
                          </>
                        )}
                      </AnimatePresence>
                      <AnimatePresence>
                        {editedQuestion.tags && editedQuestion.tags.length > 0 && (
                          <>
                            {editedQuestion.tags.slice(0, 3).map((tag, index) => (
                              <motion.span
                                key={`tag-${tag}-${index}`}
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0, opacity: 0 }}
                                transition={{ duration: 0.2, delay: index * 0.1 }}
                                className="px-2 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 dark:bg-green-900 dark:text-green-300 border border-green-200 dark:border-green-700"
                              >
                                {tag}
                              </motion.span>
                            ))}
                            {editedQuestion.tags.length > 3 && (
                              <motion.span
                                key="more-tags"
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="px-2 py-1 rounded-full text-xs font-medium bg-gray-50 text-gray-600 dark:bg-gray-900 dark:text-gray-300 border border-gray-200 dark:border-gray-700"
                              >
                                +{editedQuestion.tags.length - 3}
                              </motion.span>
                            )}
                          </>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Stem Preview */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">题干</h4>
                      <div className="p-3 bg-white dark:bg-gray-700 rounded border shadow-sm">
                        <LaTeXPreview
                          content={editedQuestion.content?.stem || ''}
                          variant="compact"
                          className="text-sm"
                          maxHeight="max-h-48"
                        />
                      </div>
                    </div>

                    {/* 媒体预览 */}
                    {((images && images.length > 0) || (tikzCodes && tikzCodes.length > 0)) && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">题目图片与图形</h4>
                        <div className="p-3 bg-white dark:bg-gray-700 rounded border shadow-sm">
                          <SimpleMediaPreview
                            images={images}
                            tikzCodes={tikzCodes}
                          />
                        </div>
                      </div>
                    )}

                    {/* 选择题选项预览 */}
                    {(editedQuestion.type || question?.type) === 'choice' && editedQuestion.content?.options && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">选项</h4>
                        <div className="space-y-2">
                          {editedQuestion.content.options.map((option, index) => (
                            <div key={index} className="flex items-start space-x-2 p-2 bg-white dark:bg-gray-700 rounded border shadow-sm">
                              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                                option.isCorrect ? 'bg-green-500 text-white dark:bg-green-600 dark:text-white' : 'bg-gray-300 text-gray-700 dark:bg-gray-600 dark:text-gray-300'
                              }`}>
                                {String.fromCharCode(65 + index)}
                              </span>
                              <div className="flex-1">
                                <LaTeXPreview
                                  content={option.text || `选项 ${String.fromCharCode(65 + index)}`}
                                  variant="compact"
                                  className="text-sm"
                                  maxHeight="max-h-32"
                                />
                              </div>
                              {option.isCorrect && (
                                <span className="text-green-500 text-xs mt-1">✓</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 填空题答案预览 */}
                    {(editedQuestion.type || question?.type) === 'fill' && editedQuestion.content?.fillAnswers && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">填空题答案</h4>
                        <div className="space-y-2">
                          {editedQuestion.content.fillAnswers.map((answer, index) => (
                            <div key={index} className="flex items-start space-x-2 p-2 bg-white dark:bg-gray-700 rounded border shadow-sm">
                              <span className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300 flex items-center justify-center text-xs font-medium">
                                {index + 1}
                              </span>
                              <div className="flex-1">
                                <LaTeXPreview
                                  content={answer || `第${index + 1}空答案`}
                                  variant="compact"
                                  className="text-sm"
                                  maxHeight="max-h-24"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 解答题答案预览 */}
                    {(editedQuestion.type || question?.type) === 'solution' && editedQuestion.content?.solutionAnswers && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">解答题答案</h4>
                        <div className="space-y-2">
                          {editedQuestion.content.solutionAnswers.map((answer, index) => (
                            <div key={index} className="flex items-start space-x-2 p-2 bg-white dark:bg-gray-700 rounded border shadow-sm">
                              <span className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 flex items-center justify-center text-xs font-medium">
                                {index + 1}
                              </span>
                              <div className="flex-1">
                                <LaTeXPreview
                                  content={answer || `第${index + 1}步解答`}
                                  variant="compact"
                                  className="text-sm"
                                  maxHeight="max-h-24"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Solution Preview */}
                    {editedQuestion.content?.solution && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">解析</h4>
                        <div className="p-3 bg-white dark:bg-gray-700 rounded border shadow-sm">
                          <LaTeXPreview
                            content={editedQuestion.content.solution}
                            variant="compact"
                            className="text-sm"
                          />
                        </div>
                      </div>
                    )}



                    {/* Source Preview */}
                    {editedQuestion.source && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">来源</h4>
                        <div className="p-3 bg-white dark:bg-gray-700 rounded border shadow-sm text-sm">
                          {editedQuestion.source}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* 底部按钮 */}
            <div className="flex items-center justify-end space-x-3 p-4 border-t border-gray-200 bg-gray-50 dark:bg-gray-900">
              <Button
                variant="outline"
                onClick={handleCancel}
              >
                取消
              </Button>
              <Button
                variant="primary"
                onClick={handleSave}
                className="flex items-center space-x-1"
              >
                <Save className="h-4 w-4" />
                <span>保存</span>
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>

    {/* 右侧弹窗 */}
    <RightSlideModal
      isOpen={rightSlideModal.isOpen}
      title={rightSlideModal.title}
      message={rightSlideModal.message}
      type={rightSlideModal.type}
      width={rightSlideModal.width}
      autoClose={rightSlideModal.autoClose}
      showProgress={rightSlideModal.showProgress}
      onClose={closeRightSlide}
    />
  </>
  );
};

export default QuestionEditModal; 