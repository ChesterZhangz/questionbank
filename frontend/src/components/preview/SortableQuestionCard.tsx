import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Card from '../ui/Card';
import Button from '../ui/Button';
import LaTeXPreview from '../editor/preview/LaTeXPreview';
import { 
  GripVertical,
  Edit3,
  Brain,
  Trash2,
  CheckCircle,
  Circle,
  Target,
  Scissors
} from 'lucide-react';
import type { Question } from '../../types';
import './SortableQuestionCard.css';

interface SortableQuestionCardProps {
  question: Question;
  index: number;
  viewMode: 'grid' | 'list';
  onSelect: (selected: boolean) => void;
  onEdit: () => void;
  onAnalyze: () => void;
  onDelete: () => void;
  onSplit?: () => void;
  isAnalyzing: boolean;
}

const SortableQuestionCard: React.FC<SortableQuestionCardProps> = ({
  question,
  index,
  viewMode,
  onSelect,
  onEdit,
  onAnalyze,
  onDelete,
  onSplit,
  isAnalyzing
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: question.id || question._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // 获取题目类型信息
  const getTypeInfo = () => {
    switch (question.type) {
      case 'choice':
        // 根据正确选项数量判断单选/多选
        const correctOptions = question.content?.options?.filter(option => option.isCorrect) || [];
        const isMultipleChoice = correctOptions.length > 1;
        return { 
          name: isMultipleChoice ? '多选题' : '单选题', 
          color: isMultipleChoice ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700' 
        };
      case 'fill':
        return { name: '填空题', color: 'bg-green-100 text-green-700' };
      case 'solution':
        return { name: '解答题', color: 'bg-orange-100 text-orange-700' };
      default:
        return { name: '未知', color: 'bg-gray-100 text-gray-700' };
    }
  };

  // 获取难度信息
  const getDifficultyInfo = () => {
    const difficulty = question.difficulty || 3;
    const colors = [
      'bg-green-100 text-green-700',
      'bg-blue-100 text-blue-700',
      'bg-yellow-100 text-yellow-700',
      'bg-orange-100 text-orange-700',
      'bg-red-100 text-red-700'
    ];
    const names = ['简单', '较简单', '中等', '较难', '困难'];
    return {
      name: names[difficulty - 1],
      color: colors[difficulty - 1]
    };
  };

  const typeInfo = getTypeInfo();
  const difficultyInfo = getDifficultyInfo();

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ 
        opacity: isDragging ? 0.5 : 1, 
        scale: isDragging ? 1.05 : 1 
      }}
      whileHover={{ scale: 1.02 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className={`sortable-question-card ${viewMode === 'grid' ? 'grid-view' : 'list-view'} ${
        isDragging ? 'dragging' : ''
      }`}
    >
      <Card className={`card h-full transition-all duration-200 ${
        isDragging ? 'shadow-xl' : 'hover:shadow-lg'
      }`}>
        <div className="p-4">
          {/* 头部信息 */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              {/* 拖拽手柄 */}
              <div
                {...attributes}
                {...listeners}
                className={`drag-handle cursor-grab active:cursor-grabbing p-1 rounded ${
                  isHovered ? 'bg-gray-100 dark:bg-gray-700' : ''
                }`}
              >
                <GripVertical className="h-4 w-4 text-gray-400 dark:text-gray-500" />
              </div>

              {/* 题目编号 */}
              <span className="question-number text-sm font-medium text-gray-600 dark:text-gray-400">
                {`T${index + 1}`}
              </span>

              {/* 选择状态 */}
              <button
                onClick={() => onSelect(!question.isSelected)}
                className="selection-button p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {question.isSelected ? (
                  <CheckCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                ) : (
                  <Circle className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                )}
              </button>
            </div>

            {/* 操作按钮 */}
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={onEdit}
                className="action-button p-1 h-8 w-8 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Edit3 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onAnalyze}
                disabled={isAnalyzing}
                className="action-button p-1 h-8 w-8 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Brain className={`h-4 w-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
              </Button>
              {onSplit && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onSplit}
                  className="action-button p-1 h-8 w-8 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                  title="分割题目"
                >
                  <Scissors className="h-4 w-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={onDelete}
                className="action-button p-1 h-8 w-8 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* 题目内容 */}
          <div className="question-content mb-3">
            <div className="min-h-40">
              <LaTeXPreview
                content={question.content?.stem || ''}
                variant="compact"
                className="question-card-latex-content text-sm"
                maxHeight="max-h-40"
                fullWidth={viewMode === 'list'} // 列表模式下占满宽度
              />
            </div>
            
            {/* 选择题选项 */}
            {question.type === 'choice' || question.type === 'multiple-choice' ? (
              <div className="mt-3 space-y-2">
                {question.content?.options?.map((option, optionIndex) => (
                  <div
                    key={optionIndex}
                    className="option-item"
                  >
                    <span className="option-number">
                      {String.fromCharCode(65 + optionIndex)}
                    </span>
                    <div className="option-content">
                      <LaTeXPreview
                        content={option.text}
                        variant="compact"
                        className="question-card-latex-content option-text text-sm"
                        maxHeight="max-h-32"
                        fullWidth={viewMode === 'list'} // 列表模式下占满宽度
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
            
            {/* 填空题答案 */}
            {question.type === 'fill' && question.content?.fillAnswers && question.content.fillAnswers.length > 0 && (
              <div className="mt-3">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">答案：</div>
                <div className="space-y-1">
                  {question.content.fillAnswers.map((answer, answerIndex) => (
                    <div key={answerIndex} className="flex items-center space-x-2">
                      <span className="text-xs text-gray-500 dark:text-gray-400 w-4">({answerIndex + 1})</span>
                      <LaTeXPreview
                        content={answer}
                        variant="compact"
                        className="question-card-latex-content option-text text-sm"
                        maxHeight="max-h-28"
                        fullWidth={viewMode === 'list'} // 列表模式下占满宽度
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* 解答题答案 */}
            {question.type === 'solution' && question.content?.solutionAnswers && question.content.solutionAnswers.length > 0 && (
              <div className="mt-3">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">答案：</div>
                <div className="space-y-1">
                  {question.content.solutionAnswers.map((answer, answerIndex) => (
                    <div key={answerIndex} className="flex items-center space-x-2">
                      <span className="text-xs text-gray-500 dark:text-gray-400 w-4">({answerIndex + 1})</span>
                      <LaTeXPreview
                        content={answer}
                        variant="compact"
                        className="question-card-latex-content option-text text-sm"
                        maxHeight="max-h-28"
                        fullWidth={viewMode === 'list'} // 列表模式下占满宽度
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* 解答题解析 */}
            {question.type === 'solution' && question.content?.solution && (
              <div className="mt-3">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">解析：</div>
                <LaTeXPreview
                  content={question.content.solution}
                  variant="compact"
                  className="question-card-latex-content text-sm"
                  maxHeight="max-h-40"
                  fullWidth={viewMode === 'list'} // 列表模式下占满宽度
                />
              </div>
            )}
          </div>

          {/* 标签信息 */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            {/* 题目类型 */}
            <span className={`tag type-${question.type} px-2 py-1 rounded-full text-xs font-medium`}>
              {typeInfo.name}
            </span>

            {/* 难度等级 */}
            <span className={`tag difficulty-${question.difficulty || 3} px-2 py-1 rounded-full text-xs font-medium`}>
              {difficultyInfo.name}
            </span>

            {/* 分类信息 */}
            {question.category && (
              <span className="tag category px-2 py-1 rounded-full text-xs">
                {question.category}
              </span>
            )}

            {/* 知识点标签 */}
            {question.tags && question.tags.length > 0 && (
              <>
                {question.tags.slice(0, 3).map((tag: string, idx: number) => (
                  <span
                    key={idx}
                    className="tag knowledge px-2 py-1 rounded-full text-xs"
                  >
                    {tag}
                  </span>
                ))}
                {question.tags.length > 3 && (
                  <span className="tag px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full text-xs">
                    +{question.tags.length - 3}
                  </span>
                )}
              </>
            )}
          </div>

          {/* 来源信息 */}
          <div className="source-info flex items-center space-x-1 text-xs">
            <Target className="h-3 w-3" />
            <span>{question.source || '未知来源'}</span>
            <span className="text-gray-400 dark:text-gray-500">·</span>
            <span className="font-medium">T{index + 1}</span>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default SortableQuestionCard; 