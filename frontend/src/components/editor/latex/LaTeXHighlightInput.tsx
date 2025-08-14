import React, { useState, useRef, useEffect, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import LaTeXHighlighter from './LaTeXHighlighter';
import AutoComplete from './AutoComplete';
import { searchAllSymbols } from '../../../lib/latex/symbols';
import { useTheme } from '../../../contexts/ThemeContext';
import './LaTeXHighlighter.css';

interface AutoCompleteSuggestion {
  text: string;
  description: string;
  type: 'latex' | 'markdown' | 'question';
}

interface LaTeXHighlightInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  style?: React.CSSProperties;
  enableAutoComplete?: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
  disabled?: boolean;
  rows?: number;
  onCursorPositionChange?: (position: number) => void; // 新增：光标位置变化回调
}

const LaTeXHighlightInput: React.FC<LaTeXHighlightInputProps> = ({
  value,
  onChange,
  placeholder = '输入LaTeX内容...',
  className = '',
  style = {},
  enableAutoComplete = false,
  onFocus,
  onBlur,
  disabled = false,
  rows = 4,
  onCursorPositionChange
}) => {
  const { isDark } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [showAutoComplete, setShowAutoComplete] = useState(false);
  const [autoCompleteSuggestions, setAutoCompleteSuggestions] = useState<AutoCompleteSuggestion[]>([]);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(0);
  const [autoCompletePosition, setAutoCompletePosition] = useState({ x: 0, y: 0 });
  

  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const highlighterRef = useRef<HTMLDivElement>(null);
  const autoCompleteRef = useRef<HTMLDivElement>(null);

  // 同步滚动
  const syncScroll = useCallback(() => {
    if (textareaRef.current && highlighterRef.current) {
      const textarea = textareaRef.current;
      const highlighter = highlighterRef.current;
      
      highlighter.scrollTop = textarea.scrollTop;
      highlighter.scrollLeft = textarea.scrollLeft;
    }
  }, []);

  // 处理输入变化
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    
    // 更新光标位置
    const newPosition = e.target.selectionStart;
    setCursorPosition(newPosition);
    
    // 通知父组件光标位置变化
    onCursorPositionChange?.(newPosition);
    
    // 检查自动补全
    if (enableAutoComplete) {
      checkAutoComplete(newValue, newPosition);
    }
  };

  // 处理点击事件，同步光标位置
  const handleClick = (e: React.MouseEvent<HTMLTextAreaElement>) => {
    const newPosition = e.currentTarget.selectionStart;
    setCursorPosition(newPosition);
    onCursorPositionChange?.(newPosition);
  };

  // 获取自动补全建议
  const getAutoCompleteSuggestions = (currentCommand: string): AutoCompleteSuggestion[] => {
    return searchAllSymbols(currentCommand);
  };


      // 检查自动补全
    const checkAutoComplete = (content: string, position: number) => {
      const beforeCursor = content.substring(0, position);
      
      // 检查是否在LaTeX命令中
      const latexCommandMatch = beforeCursor.match(/\\[a-zA-Z]*$/);
      
      if (latexCommandMatch) {
        const currentCommand = latexCommandMatch[0];
        const suggestions = getAutoCompleteSuggestions(currentCommand);
        
        if (suggestions.length > 0) {
          setAutoCompleteSuggestions(suggestions);
          setShowAutoComplete(true);
          setSelectedSuggestionIndex(0);
          updateAutoCompletePosition(position);
        } else {
          setShowAutoComplete(false);
        }
      } else {
        setShowAutoComplete(false);
      }
    };

  // 更新自动补全位置 - 使用与Input组件相同的简单方法
  const updateAutoCompletePosition = (position: number) => {
    if (textareaRef.current && containerRef.current) {
      const textarea = textareaRef.current;
      const rect = textarea.getBoundingClientRect();
      
      // 计算光标位置
      const textBeforeCursor = value.substring(0, position);
      
      // 使用Canvas测量文本宽度
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      if (context) {
        const computedStyle = getComputedStyle(textarea);
        context.font = computedStyle.font;
        
        // 处理多行文本
        const lines = textBeforeCursor.split('\n');
        const currentLine = lines[lines.length - 1];
        const textWidth = context.measureText(currentLine).width;
        
        // 计算位置 - 使用固定偏移
        const padding = 30; // textarea的padding
        
        // 设置位置在光标右侧
        const x = rect.left + padding + textWidth;
                const y = rect.top + padding + (lines.length - 1) * (parseFloat(computedStyle.lineHeight) || 24);
        
        setAutoCompletePosition({ x, y });
      }
    }
  };

  // 处理自动补全选择
  const handleAutoComplete = (suggestion: AutoCompleteSuggestion) => {
    // 找到当前LaTeX命令的开始位置
    const beforeCursor = value.substring(0, cursorPosition);
    const commandMatch = beforeCursor.match(/\\[a-zA-Z]*$/);
    
    if (commandMatch) {
      const commandStart = beforeCursor.lastIndexOf(commandMatch[0]);
      const beforeCommand = value.substring(0, commandStart);
      const afterCursor = value.substring(cursorPosition);
      
      // 清理填充字符，将字母替换为空的大括号
      const cleanedSuggestion = suggestion.text
        .replace(/\{([a-zA-Z])\}/g, (match, _letter) => {
          // 检查是否在字体样式命令中
          const beforeMatch = suggestion.text.substring(0, suggestion.text.indexOf(match));
          if (beforeMatch.includes('\\mathbb') || beforeMatch.includes('\\mathbf') || beforeMatch.includes('\\mathit') || beforeMatch.includes('\\mathrm') || beforeMatch.includes('\\mathcal') || beforeMatch.includes('\\mathscr') || beforeMatch.includes('\\mathfrak') || beforeMatch.includes('\\text') || beforeMatch.includes('\\texttt') || beforeMatch.includes('\\textsf')) {
            return match; // 保持原样
          }
          return '{}'; // 替换为空大括号
        })
        .replace(/\{([a-zA-Z]+)\}/g, (match, _letters) => {
          // 检查是否在字体样式命令中
          const beforeMatch = suggestion.text.substring(0, suggestion.text.indexOf(match));
          if (beforeMatch.includes('\\mathbb') || beforeMatch.includes('\\mathbf') || beforeMatch.includes('\\mathit') || beforeMatch.includes('\\mathrm') || beforeMatch.includes('\\mathcal') || beforeMatch.includes('\\mathscr') || beforeMatch.includes('\\mathfrak') || beforeMatch.includes('\\text') || beforeMatch.includes('\\texttt') || beforeMatch.includes('\\textsf')) {
            return match; // 保持原样
          }
          return '{}'; // 替换为空大括号
        });
      
      // 检查是否在数学模式内
      const isInMathMode = isInsideMathMode(beforeCommand);
      
      let finalSuggestion = cleanedSuggestion;
      // 只有LaTeX类型的符号才需要检查数学模式，题目符号直接插入
      if (suggestion.type === 'latex') {
        if (!isInMathMode) {
          // 不在数学模式内，自动添加$
          finalSuggestion = '$' + cleanedSuggestion + '$';
        }
      }
      // 题目类型的符号直接使用cleanedSuggestion，不添加$
      
      const newValue = beforeCommand + finalSuggestion + afterCursor;
      onChange(newValue);
      setShowAutoComplete(false);
      
      // 智能光标定位
      setTimeout(() => {
        if (textareaRef.current) {
          let newPosition = beforeCommand.length + finalSuggestion.length;
          
          // 对于带括号的命令，将光标放在第一个括号内
          if (cleanedSuggestion.includes('{}{}')) {
            newPosition = beforeCommand.length + cleanedSuggestion.indexOf('{') + 1;
          } else if (cleanedSuggestion.includes('{}')) {
            newPosition = beforeCommand.length + cleanedSuggestion.indexOf('{') + 1;
          }
          
          // 如果在数学模式外且是LaTeX符号，需要调整光标位置（因为添加了$...$）
          if (suggestion.type === 'latex' && !isInMathMode) {
            newPosition += 1; // 光标在$后面
          }
          
          textareaRef.current.setSelectionRange(newPosition, newPosition);
          textareaRef.current.focus();
          setCursorPosition(newPosition);
          onCursorPositionChange?.(newPosition);
        }
      }, 0);
    }
  };

  // 检查是否在数学模式内
  const isInsideMathMode = (beforeCursor: string): boolean => {
    // 计算光标前的$数量
    const dollarCountBefore = (beforeCursor.match(/\$/g) || []).length;
    
    // 如果光标前的$数量是奇数，说明在数学模式内
    return dollarCountBefore % 2 === 1;
  };

  // 处理键盘事件
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (showAutoComplete && autoCompleteSuggestions.length > 0) {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedSuggestionIndex(prev => 
            prev < autoCompleteSuggestions.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedSuggestionIndex(prev => 
            prev > 0 ? prev - 1 : autoCompleteSuggestions.length - 1
          );
          break;
        case 'Enter':
          e.preventDefault();
          if (autoCompleteSuggestions[selectedSuggestionIndex]) {
            handleAutoComplete(autoCompleteSuggestions[selectedSuggestionIndex]);
          }
          break;
        case 'Escape':
          setShowAutoComplete(false);
          break;
      }
    }
  };

  // 处理焦点
  const handleFocus = () => {
    setIsFocused(true);
    onFocus?.();
  };

  const handleBlur = () => {
    setIsFocused(false);
    onBlur?.();
  };

  // 点击外部关闭自动补全
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (autoCompleteRef.current && !autoCompleteRef.current.contains(event.target as Node)) {
        setShowAutoComplete(false);
      }
    };

    if (showAutoComplete) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showAutoComplete]);

  // 同步滚动事件
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.addEventListener('scroll', syncScroll);
      return () => textarea.removeEventListener('scroll', syncScroll);
    }
  }, [syncScroll]);

  return (
    <div 
      ref={containerRef}
      className={`relative latex-highlight-input ${className}`}
      style={style}
    >
      {/* 高亮背景层 */}
      <div
        ref={highlighterRef}
        className={`absolute inset-0 pointer-events-none overflow-auto ${isDark ? 'dark' : ''}`}
        style={{
          padding: '12px',
          fontSize: '14px',
          lineHeight: '1.6',
          fontFamily: 'Consolas, Monaco, "Courier New", monospace',
          color: 'inherit', // 继承颜色，让高亮显示
          zIndex: 1,
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          overflowWrap: 'break-word',
          wordWrap: 'break-word'
        }}
      >
        <LaTeXHighlighter content={value} className={isDark ? 'dark' : ''} />
      </div>
      
      {/* 透明输入框 */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onClick={handleClick}
        placeholder={placeholder}
        disabled={disabled}
        rows={rows}
        className={`w-full resize-none bg-transparent relative outline-none border rounded-md transition-all duration-200 overflow-auto placeholder-gray-500 dark:placeholder-gray-400 ${
          isFocused 
            ? 'border-blue-500 ring-2 ring-blue-500 ring-opacity-20' 
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        style={{
          padding: '12px',
          fontSize: '14px',
          lineHeight: '1.6',
          fontFamily: 'Consolas, Monaco, "Courier New", monospace',
          color: 'transparent',
          caretColor: isFocused ? '#3b82f6' : isDark ? '#9ca3af' : '#374151',
          zIndex: 2,
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          overflowWrap: 'break-word',
          wordWrap: 'break-word'
        }}
      />
      
      {/* 自动补全 */}
      {enableAutoComplete && (
        <AnimatePresence>
          {showAutoComplete && autoCompleteSuggestions.length > 0 && (
            <AutoComplete
              ref={autoCompleteRef}
              suggestions={autoCompleteSuggestions}
              selectedIndex={selectedSuggestionIndex}
              position={autoCompletePosition}
              onSelect={handleAutoComplete}
            />
          )}
        </AnimatePresence>
      )}
    </div>
  );
};

export default LaTeXHighlightInput;