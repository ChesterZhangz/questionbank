import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Scissors, Plus, Trash2 } from 'lucide-react';
import Button from '../ui/Button';
import LaTeXPreview from '../editor/preview/LaTeXPreview';
import type { Question } from '../../types';

interface QuestionSplitModalProps {
  isOpen: boolean;
  question: Question | null;
  onClose: () => void;
  onSplit: (newQuestions: Question[]) => void;
}

const QuestionSplitModal: React.FC<QuestionSplitModalProps> = ({
  isOpen,
  question,
  onClose,
  onSplit
}) => {
  const [splitPoints, setSplitPoints] = useState<number[]>([]);
  const [selectedText, setSelectedText] = useState<string>('');

  // 根据分割点生成新题目
  const splitQuestions = useMemo(() => {
    if (!question) return [];

    const stem = question.content?.stem || '';
    if (splitPoints.length === 0) return [];

    const questions: Question[] = [];
    let lastIndex = 0;

    splitPoints.forEach((point, index) => {
      const questionStem = stem.substring(lastIndex, point).trim();
      if (questionStem) {
        questions.push({
          ...question,
          id: `${question.id}-split-${index}`,
          content: {
            ...question.content,
            stem: questionStem
          }
        });
      }
      lastIndex = point;
    });

    // 添加最后一部分
    const lastStem = stem.substring(lastIndex).trim();
    if (lastStem) {
      questions.push({
        ...question,
        id: `${question.id}-split-${splitPoints.length}`,
        content: {
          ...question.content,
          stem: lastStem
        }
      });
    }

    return questions;
  }, [question, splitPoints]);

  // 添加分割点
  const addSplitPoint = () => {
    if (selectedText && question) {
      const stem = question.content?.stem || '';
      const index = stem.indexOf(selectedText);
      if (index !== -1) {
        const splitIndex = index + selectedText.length;
        if (!splitPoints.includes(splitIndex)) {
          setSplitPoints([...splitPoints, splitIndex].sort((a, b) => a - b));
        }
      }
    }
    setSelectedText('');
  };

  // 移除分割点
  const removeSplitPoint = (index: number) => {
    setSplitPoints(splitPoints.filter((_, i) => i !== index));
  };

  // 处理文本选择
  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim()) {
      setSelectedText(selection.toString().trim());
    }
  };

  // 确认分割
  const handleConfirmSplit = () => {
    if (splitQuestions.length > 0) {
      onSplit(splitQuestions);
      onClose();
    }
  };



  if (!question) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 dark:bg-black/70 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="w-full max-w-5xl bg-white dark:bg-gray-800 rounded-lg shadow-xl dark:shadow-gray-900/50"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 模态框头部 */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2">
                <Scissors className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">分割题目</h2>
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

            {/* 模态框内容 */}
            <div className="p-6 space-y-6">
              {/* 原题目内容 */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">原题目内容：</h3>
                <div 
                  className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 max-h-64 overflow-y-auto w-full"
                  onMouseUp={handleTextSelection}
                >
                  <LaTeXPreview
                    content={question.content?.stem || ''}
                    variant="compact"
                    className="text-sm w-full"
                    maxHeight="max-h-64"
                    fullWidth={true}
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  选中要分割的文本，然后点击"添加分割点"
                </p>
              </div>

              {/* 分割点管理 */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">分割点：</h3>
                  <div className="flex items-center space-x-2">
                    {selectedText && (
                      <span className="text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded">
                        已选中: "{selectedText}"
                      </span>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={addSplitPoint}
                      disabled={!selectedText}
                      className="flex items-center space-x-1 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <Plus className="h-3 w-3" />
                      <span>添加分割点</span>
                    </Button>
                  </div>
                </div>
                
                {splitPoints.length > 0 ? (
                  <div className="space-y-2">
                    {splitPoints.map((point, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/30 rounded border border-blue-200 dark:border-blue-700">
                        <span className="text-sm text-blue-700 dark:text-blue-300">
                          分割点 {index + 1}: 位置 {point}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeSplitPoint(index)}
                          className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/30"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                    暂无分割点，请选中文本并添加分割点
                  </div>
                )}
              </div>

              {/* 分割预览 */}
              {splitPoints.length > 0 && (
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">分割预览：</h4>
                  <div className="max-h-64 overflow-y-auto space-y-3">
                    {splitQuestions.map((splitQuestion, index) => (
                      <div key={index} className="p-3 bg-white dark:bg-gray-700 rounded-lg border border-blue-200 dark:border-blue-600 w-full">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded">
                            新题目 {index + 1}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {splitQuestion.type === 'choice' ? '选择题' : 
                             splitQuestion.type === 'fill' ? '填空题' : 
                             splitQuestion.type === 'solution' ? '解答题' : '题目'}
                          </span>
                        </div>
                        <div className="text-sm w-full">
                          <LaTeXPreview
                            content={splitQuestion.content?.stem || ''}
                            variant="compact"
                            className="text-sm w-full"
                            fullWidth={true}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    将生成 {splitQuestions.length} 道新题目
                  </div>
                </div>
              )}
            </div>

            {/* 底部按钮 */}
            <div className="flex items-center justify-end space-x-3 p-4 border-t border-gray-200 dark:border-gray-700">
              <Button
                variant="outline"
                onClick={onClose}
                className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                取消
              </Button>
              <Button
                variant="primary"
                onClick={handleConfirmSplit}
                disabled={splitQuestions.length === 0}
                className="flex items-center space-x-1"
              >
                <Scissors className="h-4 w-4" />
                <span>确认分割 ({splitQuestions.length} 道题目)</span>
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default QuestionSplitModal; 