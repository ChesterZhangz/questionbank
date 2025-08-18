import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LaTeXRenderer } from '../../../lib/latex/renderer/LaTeXRenderer';
import Button from '../../ui/Button';
import Card from '../../ui/Card';
import Input from '../../ui/Input';
import LaTeXEditor from '../latex/LaTeXEditor';
import QuestionTypeSelector from '../question/QuestionTypeSelector';
import KnowledgeTagSelector from '../question/KnowledgeTagSelector';
import QuestionSourceSelector from '../question/QuestionSourceSelector';
import HoverTooltip from '../preview/HoverTooltip';

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

interface QuestionEditorProps {
  question: QuestionData;
  onChange: (question: QuestionData) => void;
  className?: string;
}

const QuestionEditor: React.FC<QuestionEditorProps> = ({
  question,
  onChange,
  className = ""
}) => {
  const [localQuestion, setLocalQuestion] = useState<QuestionData>(question);
  const [activeTab, setActiveTab] = useState<'stem' | 'solution'>('stem');

  // 同步外部数据变化
  useEffect(() => {
    setLocalQuestion(question);
  }, [question]);

  // 更新本地数据并通知父组件
  const updateQuestion = (updates: Partial<QuestionData>) => {
    const updatedQuestion = { ...localQuestion, ...updates };
    setLocalQuestion(updatedQuestion);
    onChange(updatedQuestion);
  };

  // 处理题干变化
  const handleStemChange = (value: string) => {
    updateQuestion({ stem: value });
  };



  // 处理解析变化
  const handleSolutionChange = (value: string) => {
    updateQuestion({ solution: value });
  };

  // 处理选项变化
  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...(localQuestion.options || [])];
    newOptions[index] = value;
    updateQuestion({ options: newOptions });
  };

  // 添加选项
  const addOption = () => {
    const newOptions = [...(localQuestion.options || []), ''];
    updateQuestion({ options: newOptions });
  };

  // 删除选项
  const removeOption = (index: number) => {
    const newOptions = localQuestion.options?.filter((_, i) => i !== index) || [];
    updateQuestion({ options: newOptions });
  };

  // 处理难度变化
  const handleDifficultyChange = (difficulty: number) => {
    updateQuestion({ difficulty });
  };

  // 处理小题型变化
  const handleCategoryChange = (categories: string[]) => {
    updateQuestion({ category: categories });
  };

  // 处理标签变化
  const handleTagsChange = (tags: string[]) => {
    updateQuestion({ tags });
  };

  // 处理来源变化
  const handleSourceChange = (source: string) => {
    updateQuestion({ source });
  };

  // 处理题目类型变化
  const handleQuestionTypeChange = (questionType: 'choice' | 'multiple-choice' | 'fill' | 'solution') => {
    if ((questionType === 'choice' || questionType === 'multiple-choice') && (!localQuestion.options || localQuestion.options.length === 0)) {
      updateQuestion({ 
        questionType,
        options: ['', '', '', '']
      });
    } else {
      updateQuestion({ questionType });
    }
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
    
    // 第一遍：统计所有的 \subp 和 \subsubp
    for (const line of lines) {
      if (line.includes('\\subp')) {
        subpCount++;
        subsubpCount = 0;
      } else if (line.includes('\\subsubp')) {
        subsubpCount++;
        subpWithSubsubp.add(subpCount);
      }
    }
    
    // 第二遍：生成答案标签
    subpCount = 0;
    subsubpCount = 0;
    
    for (const line of lines) {
      if (line.includes('\\subp')) {
        subpCount++;
        subsubpCount = 0;
        
        // 如果这个主问题有子问题，不单独添加主问题答案
        if (!subpWithSubsubp.has(subpCount)) {
          answers.push({
            label: `(${subpCount})`,
            index: answers.length
          });
        }
      } else if (line.includes('\\subsubp')) {
        subsubpCount++;
        const romanNumerals = ['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'viii', 'ix', 'x'];
        const romanNum = romanNumerals[subsubpCount - 1] || subsubpCount.toString();
        
        // 添加子问题答案
        answers.push({
          label: `(${subpCount}) ${romanNum}.`,
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
    const newFillAnswers = [...(localQuestion.fillAnswers || [])];
    newFillAnswers[index] = value;
    updateQuestion({ fillAnswers: newFillAnswers });
  };

  // 自动判断选择题类型（根据答案数量）
  const detectChoiceType = (answer: string) => {
    return answer.length > 1 ? 'multiple-choice' : 'choice';
  };

  // 处理选择题答案切换 - 自动判断单选/多选
  const handleChoiceToggle = (index: number) => {
    const optionLetter = String.fromCharCode(65 + index);
    let newAnswer = localQuestion.answer || '';
    
    if (newAnswer.includes(optionLetter)) {
      // 移除选项
      newAnswer = newAnswer.replace(new RegExp(optionLetter, 'g'), '');
    } else {
      // 添加选项 - 不再区分单选/多选，统一处理
      newAnswer += optionLetter;
    }
    
    // 自动更新题目类型
    const newQuestionType = detectChoiceType(newAnswer);
    
    updateQuestion({ 
      answer: newAnswer,
      questionType: newQuestionType as 'choice' | 'multiple-choice'
    });
  };

  // 处理解答题答案变化
  const handleSolutionAnswerChange = (index: number, value: string) => {
    const newSolutionAnswers = [...(localQuestion.solutionAnswers || [])];
    newSolutionAnswers[index] = value;
    updateQuestion({ solutionAnswers: newSolutionAnswers });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 0 }}
      animate={{ opacity: 1, y: 0 }}
      className={`question-editor ${className}`}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 左侧：题目内容 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 题目类型选择 */}
          <Card>
            <div className="p-4 border-b bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <h3 className="font-medium text-gray-900 dark:text-gray-100">题目类型</h3>
            </div>
            <div className="p-4">
              <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                <button
                  onClick={() => handleQuestionTypeChange('choice')}
                  className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                    localQuestion.questionType === 'choice'
                      ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
                  }`}
                >
                  选择题
                </button>
                <button
                  onClick={() => handleQuestionTypeChange('fill')}
                  className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                    localQuestion.questionType === 'fill'
                      ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
                  }`}
                >
                  填空题
                </button>
                <button
                  onClick={() => handleQuestionTypeChange('solution')}
                  className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                    localQuestion.questionType === 'solution'
                      ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
                  }`}
                >
                  解答题
                </button>
              </div>
            </div>
          </Card>

          {/* 题干/解析切换 */}
          <Card>
            <div className="p-4 border-b bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setActiveTab('stem')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    activeTab === 'stem'
                      ? 'bg-blue-500 text-white'
                      : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  题干
                </button>
                <button
                  onClick={() => setActiveTab('solution')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    activeTab === 'solution'
                      ? 'bg-blue-500 text-white'
                      : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  解析
                </button>
              </div>
            </div>
            <div className="p-4">
              {activeTab === 'stem' ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-700 dark:text-gray-200">题目内容</h4>
                  </div>
                  <LaTeXEditor
                    value={localQuestion.stem}
                    onChange={handleStemChange}
                    placeholder="输入题目内容..."
                    showPreview={true}
                    enableHoverPreview={true}
                    questionType={localQuestion.questionType === 'multiple-choice' ? 'choice' : localQuestion.questionType}
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  {/* 题目预览 */}
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <h4 className="font-medium text-gray-700 dark:text-gray-200 mb-2">题目预览</h4>
                    <div 
                      className="prose prose-sm max-w-none dark:prose-invert"
                      style={{
                        fontSize: '0.875rem',
                        lineHeight: '1.5',
                        wordSpacing: '0.05em',
                        letterSpacing: '0.01em',
                        fontFamily: "'SimSun', 'STSong', 'Times New Roman', 'Times', serif"
                      }}
                      dangerouslySetInnerHTML={{ 
                        __html: localQuestion.stem ? 
                          (() => {
                            try {
                              const renderer = new LaTeXRenderer({ mode: 'full' });
                              const result = renderer.render(localQuestion.stem);
                              return result.html;
                            } catch (error) {
                              console.error('LaTeX渲染错误:', error);
                              return localQuestion.stem;
                            }
                          })() : ''
                      }}
                    />
                  </div>
                  {/* 解析编辑器 */}
                  <div>
                    <h4 className="font-medium text-gray-700 dark:text-gray-200 mb-2">解析内容</h4>
                    <LaTeXEditor
                      value={localQuestion.solution || ''}
                      onChange={handleSolutionChange}
                      placeholder="输入题目解析..."
                      showPreview={true}
                      enableHoverPreview={true}
                      questionType="solution"
                      displayType="solution"
                    />
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* 选项编辑（选择题） */}
          {(localQuestion.questionType === 'choice' || localQuestion.questionType === 'multiple-choice') && (
            <Card>
              <div className="p-4 border-b bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <h3 className="font-medium text-gray-900 dark:text-gray-100">选项设置</h3>
              </div>
              <div className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    题目类型：{localQuestion.questionType === 'choice' ? '单选题' : '多选题'} 
                    <span className="text-xs text-gray-400 dark:text-gray-500 ml-2">（系统自动判断）</span>
                  </span>
                </div>

                <div className="space-y-3">
                  {(localQuestion.options || []).map((option, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <button
                        onClick={() => handleChoiceToggle(index)}
                        className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                          localQuestion.answer?.includes(String.fromCharCode(65 + index))
                            ? 'bg-blue-500 border-blue-500 text-white'
                            : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-400'
                        }`}
                        title={localQuestion.answer?.includes(String.fromCharCode(65 + index)) ? '取消选择' : '选择答案'}
                      >
                        {localQuestion.answer?.includes(String.fromCharCode(65 + index)) && (
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </button>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-200 w-6">
                        {String.fromCharCode(65 + index)}.
                      </span>
                      <HoverTooltip content={option} config={{ mode: 'lightweight' }}>
                        <Input
                          value={option}
                          onChange={(e) => handleOptionChange(index, e.target.value)}
                          placeholder={`选项 ${String.fromCharCode(65 + index)}`}
                          className="flex-1"
                        />
                      </HoverTooltip>
                      <Button
                        onClick={() => removeOption(index)}
                        variant="outline"
                        size="sm"
                        className="border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        删除
                      </Button>
                    </div>
                  ))}
                  <Button
                    onClick={addOption}
                    variant="outline"
                    size="sm"
                    className="border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    添加选项
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* 填空题答案 */}
          {localQuestion.questionType === 'fill' && (
            <Card>
              <div className="p-4 border-b bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <h3 className="font-medium text-gray-900 dark:text-gray-100">填空题答案</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  检测到 {getFillCount(localQuestion.stem)} 个填空，请填写对应答案
                </p>
              </div>
              <div className="p-4 space-y-3">
                {Array.from({ length: getFillCount(localQuestion.stem) }, (_, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200 w-8">
                      第{index + 1}空:
                    </span>
                    <Input
                      value={localQuestion.fillAnswers?.[index] || ''}
                      onChange={(e) => handleFillAnswerChange(index, e.target.value)}
                      placeholder={`第${index + 1}空答案`}
                      className="flex-1"
                    />
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* 解答题答案 */}
          {localQuestion.questionType === 'solution' && (
            <Card>
                             <div className="p-4 border-b bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                 <h3 className="font-medium text-gray-900 dark:text-gray-100">解答题答案</h3>
                 <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                   检测到 {getSolutionAnswerInfo(localQuestion.stem).length} 个解答点，请填写对应答案
                 </p>
               </div>
               <div className="p-4 space-y-3">
                 {Array.from({ length: getSolutionAnswerInfo(localQuestion.stem).length }, (_, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200 w-8">
                      第{index + 1}点:
                    </span>
                    <Input
                      value={localQuestion.solutionAnswers?.[index] || ''}
                      onChange={(e) => handleSolutionAnswerChange(index, e.target.value)}
                      placeholder={`第${index + 1}点答案`}
                      className="flex-1"
                    />
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* 右侧：题目属性 */}
        <div className="space-y-6">
          {/* 难度设置 */}
          <Card>
            <div className="p-4 border-b bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <h3 className="font-medium text-gray-900 dark:text-gray-100">难度设置</h3>
            </div>
            <div className="p-4">
              <div className="flex items-center space-x-2">
                {[1, 2, 3, 4, 5].map((level) => (
                  <button
                    key={level}
                    onClick={() => handleDifficultyChange(level)}
                    className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-medium transition-colors ${
                      localQuestion.difficulty === level
                        ? 'bg-blue-500 border-blue-500 text-white'
                        : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-400 text-gray-700 dark:text-gray-200'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
              <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                {localQuestion.difficulty === 1 && '★☆☆☆☆ 基础题'}
                {localQuestion.difficulty === 2 && '★★☆☆☆ 简单题'}
                {localQuestion.difficulty === 3 && '★★★☆☆ 中等题'}
                {localQuestion.difficulty === 4 && '★★★★☆ 困难题'}
                {localQuestion.difficulty === 5 && '★★★★★ 难题'}
              </div>
            </div>
          </Card>

          {/* 小题型选择 */}
          <QuestionTypeSelector
            selectedTypes={localQuestion.category || []}
            onTypesChange={handleCategoryChange}
            maxCount={3}
          />

          {/* 知识点标签 */}
          <KnowledgeTagSelector
            selectedTags={localQuestion.tags || []}
            onTagsChange={handleTagsChange}
            maxCount={5}
          />

          {/* 题目出处 */}
          <QuestionSourceSelector
            source={localQuestion.source || ''}
            onSourceChange={handleSourceChange}
          />
        </div>
      </div>
    </motion.div>
  );
};

export default QuestionEditor; 