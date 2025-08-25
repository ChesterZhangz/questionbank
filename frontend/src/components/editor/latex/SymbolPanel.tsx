import React from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { mathSymbolCategories } from '../../../lib/latex/symbols/MathSymbols';
import { questionSymbolCategories } from '../../../lib/latex/symbols/QuestionSymbols';
import type { SymbolDefinition } from '../../../lib/latex/types';

interface SymbolPanelProps {
  type?: 'math' | 'question';
  onSymbolSelect: (symbol: string) => void;
  onClose: () => void;
}

const SymbolPanel: React.FC<SymbolPanelProps> = ({
  type = 'math',
  onSymbolSelect,
  onClose
}) => {
  const categories = type === 'math' ? mathSymbolCategories : questionSymbolCategories;

  const renderSymbol = (symbol: SymbolDefinition) => {
    if (symbol.latex.startsWith('\\')) {
      try {
        // 尝试渲染LaTeX符号
        const rendered = katex.renderToString(symbol.latex, { 
          displayMode: false, 
          throwOnError: false,
          output: 'html'
        });
        console.log('🔍 SymbolPanel - 渲染符号:', symbol.latex, '结果:', rendered);
        return rendered;
      } catch (error) {
        console.log('🔍 SymbolPanel - 渲染失败:', symbol.latex, '错误:', error);
        return symbol.latex;
      }
    }
    return symbol.latex;
  };

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
          {type === 'math' ? '数学符号' : '题目符号'}
        </h3>
        <button
          onClick={onClose}
          className="p-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 hover:bg-blue-100 dark:hover:bg-blue-800/50 rounded"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category: any) => (
          <div key={category.name} className="space-y-2">
            <h4 className="font-medium text-blue-800 dark:text-blue-200 text-sm">{category.name}</h4>
            <div className="flex flex-wrap gap-1">
              {category.symbols.map((symbol: any) => (
                <button
                  key={symbol.latex}
                  onClick={() => {
                    console.log('🔍 SymbolPanel - 点击符号:', symbol.latex);
                    onSymbolSelect(symbol.latex);
                  }}
                  className="px-2 py-1 text-sm bg-white dark:bg-gray-800 border border-blue-200 dark:border-blue-600 rounded hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors text-gray-900 dark:text-gray-100"
                  title={symbol.name}
                  dangerouslySetInnerHTML={{ __html: renderSymbol(symbol) }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default SymbolPanel; 