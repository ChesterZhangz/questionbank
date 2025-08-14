import { forwardRef } from 'react';
import { motion } from 'framer-motion';

interface AutoCompleteSuggestion {
  text: string;
  description: string;
  type: 'latex' | 'markdown' | 'question';
}

interface AutoCompleteProps {
  suggestions: AutoCompleteSuggestion[];
  selectedIndex: number;
  position: { x: number; y: number };
  onSelect: (suggestion: AutoCompleteSuggestion) => void;
}

const AutoComplete = forwardRef<HTMLDivElement, AutoCompleteProps>(({
  suggestions,
  selectedIndex,
  position,
  onSelect
}, ref) => {
  // 直接使用传入的位置，不做边界调整（调试模式）
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
        minWidth: '200px'
      }}
    >
      {suggestions.map((suggestion, index) => (
        <button
          key={`${suggestion.text}-${index}`}
          onClick={() => onSelect(suggestion)}
          className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 focus:bg-gray-100 dark:focus:bg-gray-700 focus:outline-none flex items-center justify-between ${
            index === selectedIndex ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' : 'text-gray-700 dark:text-gray-200'
          }`}
        >
          <div className="flex items-center space-x-2">
            <span className="font-mono">{suggestion.text}</span>
            <span className="text-gray-500 dark:text-gray-400 text-xs">{suggestion.description}</span>
          </div>
          <span className={`text-xs px-2 py-1 rounded ${
            suggestion.type === 'latex' ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300' :
            suggestion.type === 'question' ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300' :
            'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
          }`}>
            {suggestion.type === 'latex' ? 'LaTeX' : suggestion.type === 'question' ? '题目' : 'Markdown'}
          </span>
        </button>
      ))}
    </motion.div>
  );
});

AutoComplete.displayName = 'AutoComplete';

export default AutoComplete; 