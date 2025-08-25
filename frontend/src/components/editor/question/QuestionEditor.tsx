import React, { useState, useEffect } from 'react';
import Card from '../../ui/Card';
import Button from '../../ui/Button';
import Input from '../../ui/Input';
import { 
  BookOpen, 
  Plus, 
  X, 
  EyeOff,
  Trash2,
  Edit3,
  Check,
  Tag
} from 'lucide-react';
import type { Question, QuestionBank } from '../../../types';
import LivePreview from '../preview/LivePreview';
import { renderContentWithCache } from '../../../lib/latex/utils/renderContent';
import katex from 'katex';
import 'katex/dist/katex.min.css';

interface QuestionEditorProps {
  question: Question | null; // Can be null for creation
  questionBank: QuestionBank | null;
  onChange: (updatedQuestion: Partial<Question>) => void;
  onSave: () => void;
  onCancel: () => void;
  showPreview?: boolean; // 新增预览控制属性
}

const QuestionEditor: React.FC<QuestionEditorProps> = ({
  question,
  questionBank,
  onChange,
  onSave,
  onCancel
}) => {
  // 预设知识点标签 - 与后端DeepSeek选项保持一致
  const presetKnowledgeTags = [
    '函数', '导数', '积分', '极限', '数列', '概率', '统计', '几何', '代数', '三角',
    '向量', '矩阵', '复数', '不等式', '方程', '解析几何', '立体几何'
  ];

  const [questionType, setQuestionType] = useState<'choice' | 'multiple-choice' | 'fill' | 'solution'>(question?.type || 'choice');
  const [content, setContent] = useState({
    stem: question?.content?.stem || '',
    options: question?.content?.options || [{ text: '', isCorrect: false }, { text: '', isCorrect: false }, { text: '', isCorrect: false }, { text: '', isCorrect: false }],
    answer: question?.content?.answer || '',
    fillAnswers: question?.content?.fillAnswers || [],
    solutionAnswers: question?.content?.solutionAnswers || [],
    solution: question?.content?.solution || '',
    difficulty: question?.difficulty || 3,
    tags: question?.tags || [],
    category: question?.category || '',
    source: question?.source || ''
  });
  
  // 选项编辑状态
  const [editingOptionIndex, setEditingOptionIndex] = useState<number | null>(null);
  const [editingOptionText, setEditingOptionText] = useState('');
  
  // 显示模式切换
  const [showSolution, setShowSolution] = useState(false);
  
  // 快捷编辑状态
  const [quickEditMode, setQuickEditMode] = useState(false);
  const [quickEditText, setQuickEditText] = useState('');
  const [quickEditType, setQuickEditType] = useState<'stem' | 'solution'>('stem');

  const [newTag, setNewTag] = useState('');
  const [showQuestionTypeDropdown, setShowQuestionTypeDropdown] = useState(false);
  const [showKnowledgeTagDropdown, setShowKnowledgeTagDropdown] = useState(false);

  // 快捷键处理
  useEffect(() => {
    const handleKeyDown = (_event: KeyboardEvent) => {
      // 可以在这里添加其他快捷键
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // 同步内容变化到父组件
  useEffect(() => {
    const updatedQuestion: Partial<Question> = {
      type: questionType,
      content: {
        stem: content.stem,
        options: questionType === 'choice' || questionType === 'multiple-choice' ? content.options : undefined,
        answer: content.answer,
        fillAnswers: questionType === 'fill' ? content.fillAnswers : undefined,
        solutionAnswers: questionType === 'solution' ? content.solutionAnswers : undefined,
        solution: content.solution
      },
      difficulty: content.difficulty,
      tags: content.tags,
      category: Array.isArray(content.category) ? content.category : [content.category].filter(Boolean),
      source: content.source
    };
    
    onChange(updatedQuestion);
  }, [content, questionType]); // 移除onChange依赖

  // 点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.dropdown-container')) {
        setShowQuestionTypeDropdown(false);
        setShowKnowledgeTagDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const addOption = () => {
    setContent(prev => ({
      ...prev,
      options: [...(prev.options || []), { text: '', isCorrect: false }]
    }));
  };

  const removeOption = (index: number) => {
    setContent(prev => ({
      ...prev,
      options: prev.options?.filter((_, i) => i !== index) || []
    }));
  };

  const handleAnswerChange = (value: string) => {
    setContent(prev => ({ ...prev, answer: value }));
  };

  const handleDifficultyChange = (difficulty: number) => {
    setContent(prev => ({ ...prev, difficulty }));
  };

  const addTag = () => {
    if (newTag.trim() && !content.tags.includes(newTag.trim())) {
      setContent(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setContent(prev => ({
      ...prev,
      tags: prev.tags.filter((tag: string) => tag !== tagToRemove)
    }));
  };

  const handleCategoryChange = (value: string) => {
    setContent(prev => ({ ...prev, category: value }));
  };

  const handleSourceChange = (value: string) => {
    setContent(prev => ({ ...prev, source: value }));
  };

  const handleSelectQuestionType = (type: string) => {
    setQuestionType(type as 'choice' | 'multiple-choice' | 'fill' | 'solution');
    setShowQuestionTypeDropdown(false);
  };

  const handleSelectKnowledgeTag = (tag: string) => {
    if (!content.tags.includes(tag)) {
      setContent(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
    }
    setShowKnowledgeTagDropdown(false);
  };

  const getFillCount = (stem: string) => {
    return (stem.match(/\\fill/g) || []).length;
  };

  const getSolutionAnswerInfo = (stem: string) => {
    const subpMatches = stem.match(/\\subp/g) || [];
    const subsubpMatches = stem.match(/\\subsubp/g) || [];
    
    const subpCount = subpMatches.length;
    const subsubpCount = subsubpMatches.length;
    
    return {
      subpCount,
      subsubpCount,
      totalParts: subpCount + subsubpCount
    };
  };

  const handleFillAnswerChange = (index: number, value: string) => {
    setContent(prev => ({
      ...prev,
      fillAnswers: prev.fillAnswers?.map((answer, i) => i === index ? value : answer) || []
    }));
  };

  const handleSolutionAnswerChange = (index: number, value: string) => {
    setContent(prev => ({
      ...prev,
      solutionAnswers: prev.solutionAnswers?.map((answer, i) => i === index ? value : answer) || []
    }));
  };

  const handleChoiceToggle = (index: number) => {
    if (!content.options) return;
    
    const choice = String.fromCharCode(65 + index);
    const currentAnswer = content.answer.toUpperCase();
    
    if (questionType === 'choice') {
      // 单选题：直接替换
      setContent(prev => ({
        ...prev,
        answer: choice
      }));
    } else {
      // 多选题：切换选择状态
      const newAnswer = currentAnswer.includes(choice)
        ? currentAnswer.replace(choice, '')
        : currentAnswer + choice;
      
      setContent(prev => ({
        ...prev,
        answer: newAnswer
      }));
    }
  };

  // 开始编辑选项
  const startEditOption = (index: number) => {
    setEditingOptionIndex(index);
    setEditingOptionText(content.options?.[index]?.text || '');
  };

  // 保存选项编辑
  const saveOptionEdit = () => {
    if (editingOptionIndex !== null && content.options) {
      const newOptions = [...content.options];
      newOptions[editingOptionIndex] = {
        ...newOptions[editingOptionIndex],
        text: editingOptionText
      };
      
      setContent(prev => ({
        ...prev,
        options: newOptions
      }));
      
      setEditingOptionIndex(null);
      setEditingOptionText('');
    }
  };

  // 取消选项编辑
  const cancelOptionEdit = () => {
    setEditingOptionIndex(null);
    setEditingOptionText('');
  };

  // 开始快捷编辑
  const startQuickEdit = (type: 'stem' | 'solution') => {
    setQuickEditMode(true);
    setQuickEditType(type);
    setQuickEditText(type === 'stem' ? content.stem : content.solution);
  };

  // 保存快捷编辑
  const saveQuickEdit = () => {
    if (quickEditType === 'stem') {
      setContent(prev => ({
        ...prev,
        stem: quickEditText
      }));
    } else {
      setContent(prev => ({
        ...prev,
        solution: quickEditText
      }));
    }
    setQuickEditMode(false);
    setQuickEditText('');
  };

  // 取消快捷编辑
  const cancelQuickEdit = () => {
    setQuickEditMode(false);
    setQuickEditText('');
  };

  return (
    <div className="space-y-6">
      {/* 题库信息 */}
      {questionBank && (
        <Card className="p-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <BookOpen className="w-4 h-4" />
            <span>题库：{questionBank.name}</span>
            <span>•</span>
            <span>题目ID：{question?.qid}</span>
          </div>
        </Card>
      )}

      {/* 题目类型选择 */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">题目类型</h3>
          <div className="relative dropdown-container">
            <Button
              variant="outline"
              onClick={() => setShowQuestionTypeDropdown(!showQuestionTypeDropdown)}
              className="flex items-center space-x-2"
            >
              {/* Target icon was removed, so using EyeOff for now */}
              <EyeOff className="w-4 h-4" />
              <span>
                {questionType === 'choice' ? '单选题' : 
                 questionType === 'multiple-choice' ? '多选题' : 
                 questionType === 'fill' ? '填空题' : '解答题'}
              </span>
              {/* ChevronDown icon was removed, so using Check for now */}
              <Check className="w-4 h-4" />
            </Button>
            
            {showQuestionTypeDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                <div className="py-1">
                  <button
                    onClick={() => handleSelectQuestionType('choice')}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    单选题
                  </button>
                  <button
                    onClick={() => handleSelectQuestionType('multiple-choice')}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    多选题
                  </button>
                  <button
                    onClick={() => handleSelectQuestionType('fill')}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    填空题
                  </button>
                  <button
                    onClick={() => handleSelectQuestionType('solution')}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    解答题
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* 题目内容编辑 */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">题目内容</h3>
        </div>

        {/* 题目内容编辑器 */}
        <div className="space-y-4">
          {/* 题目/解析切换按钮 */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowSolution(false)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                !showSolution
                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                  : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
              }`}
            >
              题目内容
            </button>
            <button
              onClick={() => setShowSolution(true)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                showSolution
                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                  : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
              }`}
            >
              解析
            </button>
          </div>

          {/* 题目内容编辑 */}
          {!showSolution && (
            <div className="relative group">
              <div className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all duration-200">
                <div className="flex items-start justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    题目内容
                  </label>
                  {!quickEditMode && (
                    <button
                      type="button"
                      onClick={() => startQuickEdit('stem')}
                      className="p-1 text-gray-400 hover:text-blue-600 transition-colors opacity-0 group-hover:opacity-100"
                      title="快捷编辑题目内容"
                    >
                      {/* FileText icon was removed, so using Edit3 for now */}
                      <Edit3 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                
                {quickEditMode && quickEditType === 'stem' ? (
                  <div className="space-y-2">
                    <div className="relative">
                      <textarea
                        value={quickEditText}
                        onChange={(e) => setQuickEditText(e.target.value)}
                        onKeyDown={(e) => {
                          if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                            e.preventDefault();
                            saveQuickEdit();
                          } else if (e.key === 'Escape') {
                            e.preventDefault();
                            cancelQuickEdit();
                          }
                        }}
                        onBlur={(e) => {
                          // 延迟检查，避免点击保存/取消按钮时立即退出
                          setTimeout(() => {
                            if (!e.currentTarget.contains(document.activeElement)) {
                              saveQuickEdit();
                            }
                          }, 100);
                        }}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        rows={6}
                        placeholder="输入题目内容，支持LaTeX公式和自定义标签..."
                        autoFocus
                      />
                      {/* 悬浮实时预览 */}
                      <LivePreview 
                        content={quickEditText} 
                        title="题目内容预览"
                        isEditing={quickEditMode && quickEditType === 'stem'}
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        onClick={saveQuickEdit}
                        className="flex items-center space-x-1"
                      >
                        <Check className="w-3 h-3" />
                        <span>保存</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={cancelQuickEdit}
                        className="flex items-center space-x-1"
                      >
                        <X className="w-3 h-3" />
                        <span>取消</span>
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div 
                    className="text-sm text-gray-700 cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors"
                    onClick={() => startQuickEdit('stem')}
                    title="点击编辑题目内容"
                  >
                    {content.stem ? (
                      <div 
                        className="prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{
                          __html: renderContentWithCache(content.stem)
                        }}
                      />
                    ) : (
                      <span className="text-gray-400">点击此处添加题目内容</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 解析编辑 */}
          {showSolution && (
            <div className="relative group">
              <div className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all duration-200">
                <div className="flex items-start justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    解析
                  </label>
                  {!quickEditMode && (
                    <button
                      type="button"
                      onClick={() => startQuickEdit('solution')}
                      className="p-1 text-gray-400 hover:text-blue-600 transition-colors opacity-0 group-hover:opacity-100"
                      title="快捷编辑解析"
                    >
                      {/* FileText icon was removed, so using Edit3 for now */}
                      <Edit3 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                
                {quickEditMode && quickEditType === 'solution' ? (
                  <div className="space-y-2">
                    <div className="relative">
                      <textarea
                        value={quickEditText}
                        onChange={(e) => setQuickEditText(e.target.value)}
                        onKeyDown={(e) => {
                          if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                            e.preventDefault();
                            saveQuickEdit();
                          } else if (e.key === 'Escape') {
                            e.preventDefault();
                            cancelQuickEdit();
                          }
                        }}
                        onBlur={(e) => {
                          // 延迟检查，避免点击保存/取消按钮时立即退出
                          setTimeout(() => {
                            if (e.currentTarget && !e.currentTarget.contains(document.activeElement)) {
                              saveQuickEdit();
                            }
                          }, 100);
                        }}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        rows={6}
                        placeholder="输入解析内容，支持LaTeX公式和自定义标签..."
                        autoFocus
                      />
                      {/* 悬浮实时预览 */}
                      <LivePreview content={quickEditText} title="解析内容预览" isEditing={quickEditMode && quickEditType === 'solution'} />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        onClick={saveQuickEdit}
                        className="flex items-center space-x-1"
                      >
                        <Check className="w-3 h-3" />
                        <span>保存</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={cancelQuickEdit}
                        className="flex items-center space-x-1"
                      >
                        <X className="w-3 h-3" />
                        <span>取消</span>
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div 
                    className="text-sm text-gray-700 cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors"
                    onClick={() => startQuickEdit('solution')}
                    title="点击编辑解析内容"
                  >
                    {content.solution ? (
                      <div 
                        className="prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{
                          __html: renderContentWithCache(content.solution)
                        }}
                      />
                    ) : (
                      <span className="text-gray-400">点击此处添加解析内容</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 选择题选项 */}
          {(questionType === 'choice' || questionType === 'multiple-choice') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                选项
              </label>
              <div className="space-y-2">
                {content.options?.map((option, index) => (
                  <div key={index} className="relative group">
                    <div className="flex items-center space-x-2 p-2 border border-gray-200 rounded-md hover:border-blue-300 hover:bg-blue-50 transition-all duration-200">
                      {/* 选项标签 */}
                      <div className="flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-600 rounded text-xs font-semibold flex-shrink-0">
                        {String.fromCharCode(65 + index)}
                      </div>
                      
                      {/* 选项内容 - 支持LaTeX渲染 */}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-gray-700">
                          {editingOptionIndex === index ? (
                            <Input
                              value={editingOptionText}
                              onChange={(e) => setEditingOptionText(e.target.value)}
                              onBlur={saveOptionEdit}
                              onKeyPress={(e) => e.key === 'Enter' && saveOptionEdit()}
                              autoFocus
                            />
                          ) : (
                            <div 
                              className="prose prose-sm max-w-none"
                              dangerouslySetInnerHTML={{
                                __html: option.text
                                  .replace(/\$\$([\s\S]*?)\$\$/g, (_, content) => {
                                    try {
                                      return katex.renderToString(content, { displayMode: true });
                                    } catch {
                                      return `<span class="text-red-500">LaTeX错误: ${content}</span>`;
                                    }
                                  })
                                  .replace(/\$([^$]*?(?:\n[^$\n]*?)*?)\$/g, (_, content) => {
                                    try {
                                      return katex.renderToString(content, { displayMode: false });
                                    } catch {
                                      return `<span class="text-red-500">LaTeX错误: ${content}</span>`;
                                    }
                                  })
                              }}
                            />
                          )}
                        </div>
                      </div>
                      
                      {/* 操作按钮 */}
                      <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {editingOptionIndex === index ? (
                          <>
                            <button
                              type="button"
                              onClick={saveOptionEdit}
                              className="p-1 text-green-600 hover:text-green-800 transition-colors"
                              title="保存选项"
                            >
                              <Check className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={cancelOptionEdit}
                              className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                              title="取消选项"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => startEditOption(index)}
                              className="p-1 text-blue-600 hover:text-blue-800 transition-colors"
                              title="编辑选项"
                            >
                              <Edit3 className="w-3 h-3" />
                            </button>
                            
                            {/* 删除按钮 */}
                            {content.options && content.options.length > 2 && (
                              <button
                                type="button"
                                onClick={() => removeOption(index)}
                                className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                                title="删除选项"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                    
                    {/* 悬浮预览框 - 只在编辑模式下显示 */}
                    {editingOptionIndex === index && (
                      <div className="absolute left-0 top-full mt-1 z-10">
                        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 max-w-sm">
                          <div className="text-xs font-medium text-gray-900 mb-1">
                            选项 {String.fromCharCode(65 + index)} 预览
                          </div>
                          <div className="text-xs text-gray-700">
                            {editingOptionText ? (
                              <div 
                                className="prose prose-xs max-w-none"
                                dangerouslySetInnerHTML={{
                                  __html: editingOptionText
                                    .replace(/\$\$([\s\S]*?)\$\$/g, (_, content) => {
                                      try {
                                        return katex.renderToString(content, { displayMode: true });
                                      } catch {
                                        return `<span class="text-red-500">LaTeX错误</span>`;
                                      }
                                    })
                                    .replace(/\$([^$]*?(?:\n[^$\n]*?)*?)\$/g, (_, content) => {
                                      try {
                                        return katex.renderToString(content, { displayMode: false });
                                      } catch {
                                        return `<span class="text-red-500">LaTeX错误</span>`;
                                      }
                                    })
                                }}
                              />
                            ) : (
                              <span className="text-gray-400">暂无内容</span>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                
                {/* 添加选项按钮 */}
                <Button
                  variant="outline"
                  onClick={addOption}
                  className="flex items-center space-x-2 w-full justify-center py-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50 text-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>添加选项</span>
                </Button>
              </div>
            </div>
          )}

          {/* 填空题答案 */}
          {questionType === 'fill' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                填空题答案 ({getFillCount(content.stem)} 个空)
              </label>
              <div className="space-y-2">
                {Array.from({ length: getFillCount(content.stem) }, (_, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <span className="w-6 h-6 flex items-center justify-center bg-gray-100 rounded text-sm font-medium">
                      {index + 1}
                    </span>
                    <Input
                      value={content.fillAnswers?.[index] || ''}
                      onChange={(e) => handleFillAnswerChange(index, e.target.value)}
                      placeholder={`第 ${index + 1} 空答案`}
                      className="flex-1"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 解答题答案 */}
          {questionType === 'solution' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                解答题答案
              </label>
              <div className="space-y-2">
                {Array.from({ length: getSolutionAnswerInfo(content.stem).totalParts }, (_, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <span className="w-6 h-6 flex items-center justify-center bg-gray-100 rounded text-sm font-medium">
                      {index + 1}
                    </span>
                    <Input
                      value={content.solutionAnswers?.[index] || ''}
                      onChange={(e) => handleSolutionAnswerChange(index, e.target.value)}
                      placeholder={`第 ${index + 1} 问答案`}
                      className="flex-1"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 答案 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              答案
            </label>
            {questionType === 'choice' || questionType === 'multiple-choice' ? (
              <div className="flex flex-wrap gap-2">
                {content.options?.map((_, index) => {
                  const choice = String.fromCharCode(65 + index);
                  const isSelected = content.answer.toUpperCase().includes(choice);
                  return (
                    <button
                      key={index}
                      onClick={() => handleChoiceToggle(index)}
                      className={`w-10 h-10 rounded-full border-2 flex items-center justify-center font-medium transition-colors ${
                        isSelected
                          ? 'bg-blue-500 border-blue-500 text-white'
                          : 'bg-white border-gray-300 text-gray-700 hover:border-blue-300'
                      }`}
                    >
                      {choice}
                    </button>
                  );
                })}
              </div>
            ) : (
              <Input
                value={content.answer}
                onChange={(e) => handleAnswerChange(e.target.value)}
                placeholder="输入答案"
              />
            )}
          </div>
        </div>
      </Card>

      {/* 题目属性 */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">题目属性</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 难度 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              难度
            </label>
            <div className="flex items-center space-x-2">
              {[1, 2, 3, 4, 5].map((level) => (
                <button
                  key={level}
                  onClick={() => handleDifficultyChange(level)}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    content.difficulty === level
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {level}星
                </button>
              ))}
            </div>
          </div>

          {/* 分类 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              分类
            </label>
            <Input
              value={content.category}
              onChange={(e) => handleCategoryChange(e.target.value)}
              placeholder="输入题目分类"
            />
          </div>

          {/* 来源 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              来源
            </label>
            <Input
              value={content.source}
              onChange={(e) => handleSourceChange(e.target.value)}
              placeholder="输入题目来源"
            />
          </div>

          {/* 知识点标签 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              知识点标签
            </label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="输入知识点标签"
                  onKeyPress={(e) => e.key === 'Enter' && addTag()}
                />
                <Button onClick={addTag} disabled={!newTag.trim()}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              
              {/* 预设标签 */}
              <div className="relative dropdown-container">
                <Button
                  variant="outline"
                  onClick={() => setShowKnowledgeTagDropdown(!showKnowledgeTagDropdown)}
                  className="flex items-center space-x-2"
                >
                  <Tag className="w-4 h-4" />
                  <span>选择预设标签</span>
                  {/* ChevronDown icon was removed, so using Check for now */}
                  <Check className="w-4 h-4" />
                </Button>
                
                {showKnowledgeTagDropdown && (
                  <div className="absolute left-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                    <div className="py-1">
                      {presetKnowledgeTags.map((tag) => (
                        <button
                          key={tag}
                          onClick={() => handleSelectKnowledgeTag(tag)}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              {/* 已选标签 */}
              <div className="flex flex-wrap gap-2">
                {content.tags.map((tag: string) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    {tag}
                    <button
                      onClick={() => removeTag(tag)}
                      className="ml-1 text-blue-600 hover:text-blue-800"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* 操作按钮 */}
      <div className="flex items-center justify-end space-x-4">
        <Button variant="outline" onClick={onCancel}>
          取消
        </Button>
        <Button onClick={onSave}>
          保存题目
        </Button>
      </div>
    </div>
  );
};

export default QuestionEditor; 