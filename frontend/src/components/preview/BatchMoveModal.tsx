import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Move } from 'lucide-react';
import Button from '../ui/Button';
import FuzzySelect from '../ui/FuzzySelect';
import LaTeXPreview from '../editor/preview/LaTeXPreview';
import { LaTeXRenderer } from '../../lib/latex/renderer/LaTeXRenderer';
import type { Question } from '../../types';

interface BatchMoveModalProps {
  isOpen: boolean;
  selectedQuestions: Question[];
  allQuestions: Question[];
  onClose: () => void;
  onMove: (targetIndex: number, moveAfter: boolean) => void;
}

const BatchMoveModal: React.FC<BatchMoveModalProps> = ({
  isOpen,
  selectedQuestions,
  allQuestions,
  onClose,
  onMove
}) => {
  const [targetIndex, setTargetIndex] = useState<number>(-1); // 初始值改为-1，表示未选择
  const [moveAfter, setMoveAfter] = useState<boolean>(true);

  // 创建LaTeX渲染器
  const latexRenderer = useMemo(() => new LaTeXRenderer({
    mode: 'lightweight',
    features: {
      markdown: false,
      questionSyntax: false,
      autoNumbering: false,
      errorHandling: 'lenient'
    }
  }), []);

  const handleMove = () => {
    if (targetIndex >= 0) { // 确保已选择目标题目
      onMove(targetIndex, moveAfter);
      onClose();
    }
  };

  // 生成FuzzySelect选项，使用LaTeX渲染
  const fuzzySelectOptions = useMemo(() => {
    return allQuestions.map((question, index) => {
      const stem = question.content?.stem || '';
      const shortStem = stem.length > 40 ? stem.substring(0, 40) + '...' : stem;
      
      // 渲染LaTeX内容
      const renderResult = latexRenderer.render(shortStem);
      const renderedContent = renderResult.html || shortStem;
      
      return {
        value: index,
        label: `T${index + 1}: ${shortStem}`, // 保留原始文本用于搜索
        html: `T${index + 1}: ${renderedContent}`, // HTML内容用于显示
      };
    });
  }, [allQuestions, latexRenderer]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50 dark:bg-opacity-70 p-2 sm:p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="w-full max-w-4xl bg-white dark:bg-gray-800 rounded-lg shadow-xl flex flex-col max-h-[90vh] sm:max-h-[85vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 模态框头部 - 固定高度 */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
              <div className="flex items-center space-x-2">
                <Move className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">批量移动题目</h2>
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

            {/* 选中的题目 - 固定高度，可滚动 */}
            <div className="flex-shrink-0 p-4 border-b border-gray-200 dark:border-gray-700 w-full">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">选中的题目 ({selectedQuestions.length})</h3>
              <div className="space-y-2 max-h-32 overflow-y-auto w-full">
                {selectedQuestions.map((question, index) => (
                  <div key={question.id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 w-full">
                    <div className="flex items-start space-x-2 w-full">
                      <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 flex items-center justify-center text-xs font-medium flex-shrink-0">
                        {index + 1}
                      </span>
                      <div className="flex-1 min-w-0 w-full">
                        <LaTeXPreview
                          content={question.content?.stem || ''}
                          variant="compact"
                          className="text-sm w-full"
                          maxHeight="max-h-16"
                          fullWidth={true} // 强制占满宽度
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 移动设置 - 固定高度，不受overflow影响 */}
            <div className="flex-shrink-0 p-4 border-b border-gray-200 dark:border-gray-700 w-full">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">移动设置</h3>
              
              {/* 目标题目选择 */}
              <div className="mb-4 w-full">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  选择目标题目
                </label>
                <div className="relative w-full">
                  <FuzzySelect
                    options={fuzzySelectOptions}
                    value={targetIndex >= 0 ? targetIndex : ''}
                    onChange={(value) => setTargetIndex(Number(value))}
                    placeholder="选择要移动到的目标题目位置"
                    className="w-full"
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  选择一道题目作为移动的参考位置
                </p>
              </div>

              {/* 移动位置选择 */}
              <div className="mb-4 w-full">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  移动位置
                </label>
                <div className="flex items-center space-x-4 w-full">
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="movePosition"
                      value="before"
                      checked={!moveAfter}
                      onChange={() => setMoveAfter(false)}
                      className="w-4 h-4 text-blue-600 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 dark:focus:ring-blue-400 dark:bg-gray-700"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">移动到目标题目之前</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="movePosition"
                      value="after"
                      checked={moveAfter}
                      onChange={() => setMoveAfter(true)}
                      className="w-4 h-4 text-blue-600 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 dark:focus:ring-blue-400 dark:bg-gray-700"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">移动到目标题目之后</span>
                  </label>
                </div>
              </div>
            </div>

            {/* 移动预览 - 可滚动区域 */}
            <div className="flex-1 overflow-y-auto p-4 w-full">
              {targetIndex >= 0 && (
                <div className="w-full">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">移动预览</h4>
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg w-full">
                    <div className="space-y-2 w-full">
                      {/* 移动前的状态 */}
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        <span className="font-medium">移动前：</span>
                        选中的 {selectedQuestions.length} 道题目分散在列表中
                      </div>
                      
                      {/* 移动后的状态 */}
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        <span className="font-medium">移动后：</span>
                        选中的题目将移动到
                        <span className="font-medium text-blue-600 dark:text-blue-400">
                          {moveAfter ? '之后' : '之前'}
                        </span>
                      </div>
                      
                      {/* 目标题目显示 */}
                      <div className="mt-3 p-3 bg-white dark:bg-gray-700 rounded border border-blue-200 dark:border-blue-600 w-full">
                        <div className="flex items-start space-x-2 w-full">
                          <span className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300 flex items-center justify-center text-xs font-medium flex-shrink-0">
                            T{targetIndex + 1}
                          </span>
                          <div className="flex-1 min-w-0 w-full">
                            <LaTeXPreview
                              content={allQuestions[targetIndex]?.content?.stem || ''}
                              variant="compact"
                              className="text-sm w-full"
                              maxHeight="max-h-16"
                              fullWidth={true} // 强制占满宽度
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 模态框底部 - 固定高度 */}
            <div className="flex items-center justify-end space-x-3 p-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
              <Button
                variant="outline"
                onClick={onClose}
              >
                取消
              </Button>
              <Button
                onClick={handleMove}
                disabled={targetIndex < 0}
                className="flex items-center space-x-1"
              >
                <Move className="h-4 w-4" />
                <span>确认移动</span>
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BatchMoveModal; 