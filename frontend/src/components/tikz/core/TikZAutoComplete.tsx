import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import type { TikZSymbol } from '../../../lib/tikz/symbols';

interface TikZAutoCompleteProps {
  suggestions: TikZSymbol[];
  selectedIndex: number;
  position: { x: number; y: number };
  onSelect: (suggestion: TikZSymbol) => void;
}

const TikZAutoComplete = forwardRef<HTMLDivElement, TikZAutoCompleteProps>(({
  suggestions,
  selectedIndex,
  position,
  onSelect
}, ref) => {
  // 直接使用传入的位置，不做边界调整
  const adjustedPosition = position;
  
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed z-[1000] max-h-48 overflow-y-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg dark:shadow-gray-900/50"
      style={{
        left: `${adjustedPosition.x}px`,
        top: `${adjustedPosition.y}px`,
        minWidth: '250px'
      }}
    >
      {suggestions.map((suggestion, index) => (
        <button
          key={`${suggestion.latex}-${index}`}
          onClick={() => onSelect(suggestion)}
          className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 focus:bg-gray-100 dark:focus:bg-gray-700 focus:outline-none flex items-center justify-between ${
            index === selectedIndex ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' : 'text-gray-700 dark:text-gray-200'
          }`}
        >
          <div className="flex items-center space-x-2">
            <span className="font-mono">{suggestion.latex}</span>
            <span className="text-gray-500 dark:text-gray-400 text-xs">{suggestion.description}</span>
            {suggestion.completeExample && (
              <span className="text-xs px-2 py-1 rounded bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300">
                完整示例
              </span>
            )}
          </div>
          <span className={`text-xs px-2 py-1 rounded ${
            suggestion.category === 'draw' ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300' :
            suggestion.category === 'shape' ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300' :
            suggestion.category === 'node' ? 'bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300' :
            suggestion.category === 'style' ? 'bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300' :
            suggestion.category === 'transform' ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300' :
            suggestion.category === 'math' ? 'bg-teal-100 dark:bg-teal-900/50 text-teal-700 dark:text-teal-300' :
            suggestion.category === 'greek' ? 'bg-pink-100 dark:bg-pink-900/50 text-pink-700 dark:text-pink-300' :
            suggestion.category === 'symbol' ? 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300' :
            suggestion.category === 'arrow' ? 'bg-cyan-100 dark:bg-cyan-900/50 text-cyan-700 dark:text-cyan-300' :
            'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
          }`}>
            {suggestion.category === 'draw' ? '绘制' :
             suggestion.category === 'shape' ? '图形' :
             suggestion.category === 'node' ? '节点' :
             suggestion.category === 'style' ? '样式' :
             suggestion.category === 'transform' ? '变换' :
             suggestion.category === 'math' ? '数学' :
             suggestion.category === 'greek' ? '希腊' :
             suggestion.category === 'symbol' ? '符号' :
             suggestion.category === 'arrow' ? '箭头' :
             suggestion.category}
          </span>
        </button>
      ))}
    </motion.div>
  );
});

TikZAutoComplete.displayName = 'TikZAutoComplete';

export default TikZAutoComplete;
