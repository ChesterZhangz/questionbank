import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import AutoComplete from '../editor/latex/AutoComplete';
import LaTeXHighlightInput from '../editor/latex/LaTeXHighlightInput';
import { searchAllSymbols } from '../../lib/latex/symbols';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
  onIconClick?: () => void;
  enableLatexAutoComplete?: boolean; // 新增：是否启用LaTeX自动补全
  enableLatexHighlight?: boolean; // 新增：是否启用LaTeX语法高亮
}

interface AutoCompleteSuggestion {
  text: string;
  description: string;
  type: 'latex' | 'markdown' | 'question';
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  icon,
  onIconClick,
  enableLatexAutoComplete = false,
  enableLatexHighlight = false,
  className = '',
  onChange,
  ...props
}) => {
  // LaTeX自动补全相关状态
  const [showAutoComplete, setShowAutoComplete] = useState(false);
  const [autoCompleteSuggestions, setAutoCompleteSuggestions] = useState<AutoCompleteSuggestion[]>([]);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(0);
  const [autoCompletePosition, setAutoCompletePosition] = useState({ x: 0, y: 0 });
  
  const inputRef = useRef<HTMLInputElement>(null);
  const autoCompleteRef = useRef<HTMLDivElement>(null);

  // 获取LaTeX自动补全建议
  const getAutoCompleteSuggestions = (currentCommand: string): AutoCompleteSuggestion[] => {
    return searchAllSymbols(currentCommand);
  };

  // 检查自动补全
  const checkAutoComplete = (content: string, position: number) => {
    if (!enableLatexAutoComplete) return;
    
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

  // 更新自动补全位置
  const updateAutoCompletePosition = (position: number) => {
    if (!inputRef.current) return;
    
    const input = inputRef.current;
    const rect = input.getBoundingClientRect();
    
    // 计算光标位置
    const textBeforeCursor = input.value.substring(0, position);
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (context) {
      context.font = window.getComputedStyle(input).font;
      const textWidth = context.measureText(textBeforeCursor).width;
      
      setAutoCompletePosition({
        x: rect.left + textWidth + (icon ? 40 : 12), // 考虑图标偏移
        y: rect.bottom + 5
      });
    }
  };

  // 处理自动补全选择
  const handleAutoComplete = (suggestion: AutoCompleteSuggestion) => {
    if (!inputRef.current) return;
    
    const input = inputRef.current;
    const value = input.value;
    const position = input.selectionStart || 0;
    
    // 找到当前LaTeX命令的开始位置
    const beforeCursor = value.substring(0, position);
    const commandMatch = beforeCursor.match(/\\[a-zA-Z]*$/);
    
    if (commandMatch) {
      const commandStart = position - commandMatch[0].length;
      const newValue = value.substring(0, commandStart) + suggestion.text + value.substring(position);
      
      // 触发onChange事件
      if (onChange) {
        const event = {
          target: { value: newValue }
        } as React.ChangeEvent<HTMLInputElement>;
        onChange(event);
      }
      
      // 设置光标位置
      setTimeout(() => {
        if (inputRef.current) {
          const newPosition = commandStart + suggestion.text.length;
          inputRef.current.setSelectionRange(newPosition, newPosition);
          inputRef.current.focus();
        }
      }, 0);
    }
    
    setShowAutoComplete(false);
  };

  // 处理输入变化
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      onChange(e);
    }
    
    // 检查自动补全
    if (enableLatexAutoComplete) {
      checkAutoComplete(e.target.value, e.target.selectionStart || 0);
    }
  };

  // 处理键盘事件
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!enableLatexAutoComplete || !showAutoComplete) return;

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
  };

  // 点击外部关闭自动补全
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (autoCompleteRef.current && !autoCompleteRef.current.contains(event.target as Node) &&
          inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setShowAutoComplete(false);
      }
    };

    if (enableLatexAutoComplete) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [enableLatexAutoComplete]);

  return (
    <div className="w-full relative">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div 
            className={`absolute inset-y-0 left-0 pl-3 flex items-center ${onIconClick ? 'cursor-pointer' : 'pointer-events-none'}`}
            onClick={onIconClick}
            style={{ zIndex: 10 }}
          >
            <div className="text-gray-400 dark:text-gray-500">
              {icon}
            </div>
          </div>
        )}
        
        {enableLatexHighlight ? (
          <LaTeXHighlightInput
            value={props.value as string || ''}
            onChange={(value) => {
              const syntheticEvent = {
                target: { value },
                currentTarget: { value }
              } as React.ChangeEvent<HTMLInputElement>;
              handleChange(syntheticEvent);
            }}
            placeholder={props.placeholder}
            enableAutoComplete={enableLatexAutoComplete}
            disabled={props.disabled}
            rows={1}
            className={`
              ${icon ? 'pl-10' : ''}
              ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-500 dark:border-red-600 dark:focus:border-red-400 dark:focus:ring-red-400' : ''}
              ${className}
            `}
            style={{
              minHeight: '40px',
              height: '40px',
              resize: 'none',
              ...props.style
            }}
          />
        ) : (
          <input
            ref={inputRef}
            className={`
              input
              ${icon ? 'pl-10' : ''}
              ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-500 dark:border-red-600 dark:focus:border-red-400 dark:focus:ring-red-400' : ''}
              ${className}
            `}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            {...props}
          />
        )}
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
      {helperText && !error && (
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{helperText}</p>
      )}
      
      {/* LaTeX自动补全 */}
      <AnimatePresence>
        {showAutoComplete && enableLatexAutoComplete && (
          <AutoComplete
            ref={autoCompleteRef}
            suggestions={autoCompleteSuggestions}
            selectedIndex={selectedSuggestionIndex}
            position={autoCompletePosition}
            onSelect={handleAutoComplete}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Input; 