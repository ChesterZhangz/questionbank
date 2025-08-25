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

  // 同步滚动和尺寸
  const syncScrollAndSize = useCallback(() => {
    if (textareaRef.current && highlighterRef.current) {
      const textarea = textareaRef.current;
      const highlighter = highlighterRef.current;
      
      // 获取textarea的精确样式
      const textareaStyle = getComputedStyle(textarea);
      
      // 计算textarea的实际内容区域（考虑边框、内边距、滚动条）
      const paddingLeft = parseFloat(textareaStyle.paddingLeft) || 0;
      const paddingRight = parseFloat(textareaStyle.paddingRight) || 0;
      const paddingTop = parseFloat(textareaStyle.paddingTop) || 0;
      const paddingBottom = parseFloat(textareaStyle.paddingBottom) || 0;
      
      // 计算内容区域的实际可用宽度（这是换行计算的关键）
      const contentWidth = textarea.clientWidth - paddingLeft - paddingRight;
      const contentHeight = textarea.clientHeight - paddingTop - paddingBottom;
      
      // 只在尺寸真正发生变化时才更新，避免无限循环
      // 同时考虑宽度变大和变小的情况
      const currentWidth = parseFloat(highlighter.style.width) || 0;
      const currentHeight = parseFloat(highlighter.style.height) || 0;
      const currentPaddingLeft = parseFloat(highlighter.style.paddingLeft) || 0;
      
      const widthChanged = Math.abs(currentWidth - textarea.clientWidth) > 1;
      const heightChanged = Math.abs(currentHeight - textarea.clientHeight) > 1;
      const paddingChanged = Math.abs(currentPaddingLeft - paddingLeft) > 0.5;
      
      if (widthChanged || heightChanged || paddingChanged) {
        
        // 设置高亮层为完全匹配textarea的内容区域，确保换行一致
        highlighter.style.width = `${textarea.clientWidth}px`;
        // 使用scrollHeight确保容器足够高，能够显示所有内容
        const containerHeight = Math.max(textarea.scrollHeight, textarea.clientHeight);
        highlighter.style.height = `${containerHeight}px`;
        highlighter.style.paddingLeft = `${paddingLeft}px`;
        highlighter.style.paddingRight = `${paddingRight}px`;
        highlighter.style.paddingTop = `${paddingTop}px`;
        highlighter.style.paddingBottom = `${paddingBottom}px`;
        
        // 确保高亮层内容区域精确匹配textarea的内容区域
        const highlighterContent = highlighter.querySelector('.latex-highlighter') as HTMLElement;
        if (highlighterContent) {
          // 强制重设宽度，确保收缩时也能正确同步
          highlighterContent.style.width = 'auto';
          highlighterContent.style.maxWidth = `${contentWidth}px`;
          highlighterContent.style.minWidth = `${contentWidth}px`;
          highlighterContent.style.width = `${contentWidth}px`;
          // 使用scrollHeight确保内容完全可见
          const scrollHeight = Math.max(textarea.scrollHeight, contentHeight);
          highlighterContent.style.height = `${scrollHeight}px`;
        }
      }
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

  // 更新自动补全位置 - 考虑文本自动换行
  const updateAutoCompletePosition = (position: number) => {
    if (textareaRef.current && containerRef.current) {
      const textarea = textareaRef.current;
      const textareaRect = textarea.getBoundingClientRect();
      
      // 获取textarea的样式
      const computedStyle = getComputedStyle(textarea);
      const lineHeight = parseFloat(computedStyle.lineHeight) || 20;
      const paddingTop = parseFloat(computedStyle.paddingTop) || 0;
      const paddingLeft = parseFloat(computedStyle.paddingLeft) || 0;
      const paddingRight = parseFloat(computedStyle.paddingRight) || 0;
      
      // 计算textarea的可用宽度（考虑padding）
      const availableWidth = textareaRect.width - paddingLeft - paddingRight;
      
      // 计算光标位置
      const textBeforeCursor = value.substring(0, position);
      const logicalLines = textBeforeCursor.split('\n');
      const currentLogicalLine = logicalLines[logicalLines.length - 1];
      const logicalLineIndex = logicalLines.length - 1;
      
      // 创建临时div来计算换行情况
      const tempDiv = document.createElement('div');
      tempDiv.style.position = 'absolute';
      tempDiv.style.visibility = 'hidden';
      tempDiv.style.width = `${availableWidth}px`;
      tempDiv.style.whiteSpace = 'pre-wrap'; // 关键：使用pre-wrap而不是pre
      tempDiv.style.wordBreak = 'break-word';
      tempDiv.style.fontFamily = computedStyle.fontFamily;
      tempDiv.style.fontSize = computedStyle.fontSize;
      tempDiv.style.fontWeight = computedStyle.fontWeight;
      tempDiv.style.letterSpacing = computedStyle.letterSpacing;
      tempDiv.style.lineHeight = computedStyle.lineHeight;
      document.body.appendChild(tempDiv);
      
      // 计算之前所有逻辑行产生的视觉行数
      let totalVisualLines = 0;
      for (let i = 0; i < logicalLineIndex; i++) {
        tempDiv.textContent = logicalLines[i];
        // 计算这一逻辑行占用的视觉行数
        const lineVisualHeight = tempDiv.offsetHeight;
        const linesInThisLogicalLine = Math.ceil(lineVisualHeight / lineHeight);
        totalVisualLines += linesInThisLogicalLine;
      }
      
      // 计算当前逻辑行到光标位置的视觉行偏移和列位置
      tempDiv.textContent = currentLogicalLine;
      
      // 准备测量当前行的高度
      const textNode = document.createTextNode(currentLogicalLine);
      tempDiv.innerHTML = '';
      tempDiv.appendChild(textNode);
      
      // 当前行已经在tempDiv中，不需要额外测量高度
      
      // 计算光标在当前逻辑行中的视觉位置
      // 这需要逐字符测量，找到光标所在的视觉行
      let visualLineOffset = 0;
      let visualColumnPosition = 0;
      
      if (currentLogicalLine.length > 0) {
        // 创建一个临时span来测量每个字符的位置
        const measureSpan = document.createElement('span');
        measureSpan.style.position = 'absolute';
        measureSpan.style.visibility = 'hidden';
        measureSpan.style.whiteSpace = 'pre-wrap';
        measureSpan.style.wordBreak = 'break-word';
        measureSpan.style.width = `${availableWidth}px`;
        measureSpan.style.fontFamily = computedStyle.fontFamily;
        measureSpan.style.fontSize = computedStyle.fontSize;
        measureSpan.style.fontWeight = computedStyle.fontWeight;
        measureSpan.style.letterSpacing = computedStyle.letterSpacing;
        document.body.appendChild(measureSpan);
        
        // 找到光标所在的视觉行
        let lastTop = -1;
        let currentTop = 0;
        
        for (let i = 0; i <= currentLogicalLine.length; i++) {
          measureSpan.textContent = currentLogicalLine.substring(0, i);
          currentTop = measureSpan.offsetHeight;
          
          if (lastTop !== -1 && currentTop > lastTop) {
            // 发现了一个新的视觉行
            visualLineOffset++;
            visualColumnPosition = 0;
          }
          
          if (i === currentLogicalLine.length) {
            // 我们到达了光标位置
            break;
          }
          
          lastTop = currentTop;
          visualColumnPosition++;
        }
        
        document.body.removeChild(measureSpan);
      }
      
      // 计算最终的视觉行索引
      const visualLineIndex = totalVisualLines + visualLineOffset;
      
      // 计算光标在textarea中的位置
      const cursorX = paddingLeft + (visualColumnPosition * (parseFloat(computedStyle.fontSize) * 0.6)); // 估算字符宽度
      const cursorY = paddingTop + (visualLineIndex * lineHeight);
      
      document.body.removeChild(tempDiv);
      
      // 考虑textarea的滚动位置
      const scrollTop = textarea.scrollTop;
      const scrollLeft = textarea.scrollLeft;
      
      // 计算绝对位置（相对于视口）
      const x = textareaRect.left + cursorX - scrollLeft;
      const y = textareaRect.top + cursorY - scrollTop + 5; // 在光标下方5px显示
      
      setAutoCompletePosition({ x, y });
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
      
      // 清理填充字符，将字母替换为空的大括号，但保护LaTeX环境名称
      let cleanedSuggestion = suggestion.text;
      
      // 首先检查是否包含LaTeX环境命令，如果是则完全跳过清理
      if (suggestion.text.includes('\\begin') || suggestion.text.includes('\\end')) {
        cleanedSuggestion = suggestion.text; // 保持原样，不进行任何清理
      } else {
        // 只对非环境命令进行清理
        cleanedSuggestion = suggestion.text
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
      }
      
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
    // 从光标位置向前搜索，找到最近的数学模式开始标记
    let position = beforeCursor.length - 1;
    let inDisplayMathMode = false;
    let inInlineMathMode = false;
    
    while (position >= 0) {
      const char = beforeCursor[position];
      
      if (char === '$') {
        // 检查是否是$$（显示数学模式）
        if (position > 0 && beforeCursor[position - 1] === '$') {
          // 找到$$，检查是否匹配
          if (!inDisplayMathMode) {
            // 开始显示数学模式
            inDisplayMathMode = true;
            position -= 2; // 跳过两个$
            continue;
          } else {
            // 结束显示数学模式
            inDisplayMathMode = false;
            position -= 2;
            continue;
          }
        } else {
          // 单个$，检查是否匹配
          if (!inInlineMathMode && !inDisplayMathMode) {
            // 开始行内数学模式
            inInlineMathMode = true;
            position--;
            continue;
          } else if (inInlineMathMode && !inDisplayMathMode) {
            // 结束行内数学模式
            inInlineMathMode = false;
            position--;
            continue;
          }
        }
      }
      
      position--;
    }
    
    // 如果在显示数学模式或行内数学模式内，返回true
    return inDisplayMathMode || inInlineMathMode;
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

  // 同步滚动事件和尺寸变化
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      // 使用transform同步滚动，避免双重滚动框架
      const handleScroll = () => {
        if (highlighterRef.current) {
          const highlighter = highlighterRef.current;
          // 使用transform来同步滚动位置，避免重新布局
          highlighter.style.transform = `translate(-${textarea.scrollLeft}px, -${textarea.scrollTop}px)`;
        }
      };
      
      textarea.addEventListener('scroll', handleScroll);
      // 初始化同步
      syncScrollAndSize();
      return () => textarea.removeEventListener('scroll', handleScroll);
    }
  }, [syncScrollAndSize]);

  // 当内容变化时，延迟同步尺寸，避免频繁调用
  useEffect(() => {
    const timer = setTimeout(() => {
      syncScrollAndSize();
    }, 50); // 延迟50ms，避免快速输入时频繁调用
    
    return () => clearTimeout(timer);
  }, [value, syncScrollAndSize]);

  // 监听窗口大小变化和容器尺寸变化
  useEffect(() => {
    const handleResize = () => {
      // 强制重新计算，确保宽度变化时正确同步
      setTimeout(() => {
        syncScrollAndSize();
        // 双重调用确保收缩时也能正确同步
        setTimeout(syncScrollAndSize, 50);
      }, 0);
    };
    
    window.addEventListener('resize', handleResize);
    
    // 添加ResizeObserver监听容器自身的尺寸变化
    const container = containerRef.current;
    if (container && window.ResizeObserver) {
      const resizeObserver = new ResizeObserver(() => {
        handleResize();
      });
      resizeObserver.observe(container);
      
      return () => {
        window.removeEventListener('resize', handleResize);
        resizeObserver.disconnect();
      };
    }
    
    return () => window.removeEventListener('resize', handleResize);
  }, [syncScrollAndSize]);

  return (
    <div 
      ref={containerRef}
      className={`relative latex-highlight-input ${className}`}
      style={{
        ...style,
        overflow: 'hidden' // 强制禁用外层滚动条
      }}
    >
      {/* 高亮背景层 - 完全禁用滚动，只跟随textarea */}
      <div
        ref={highlighterRef}
        className={`absolute pointer-events-none overflow-hidden latex-highlight-container ${isDark ? 'dark' : ''}`}
        style={{
          top: '1px', // 考虑边框宽度
          left: '1px',
          fontSize: '14px',
          lineHeight: '1.6',
          fontFamily: 'monospace', // 使用单一字体，确保一致性
          letterSpacing: '0px', // 确保字母间距一致
          color: 'inherit', // 继承颜色，让高亮显示
          zIndex: 1,
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          overflowWrap: 'break-word',
          wordWrap: 'break-word',
          tabSize: 4, // 确保tab大小一致
          boxSizing: 'border-box', // 确保盒模型一致
          wordSpacing: 'normal', // 确保单词间距一致
          textAlign: 'left', // 确保文本对齐一致
          fontVariantLigatures: 'none', // 禁用连字
          fontFeatureSettings: 'normal', // 确保字体特性一致
          borderRadius: '6px' // 与textarea保持一致
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
          fontFamily: 'monospace', // 使用单一字体，确保一致性
          letterSpacing: '0px', // 确保字母间距一致
          color: 'transparent',
          caretColor: isFocused ? '#3b82f6' : isDark ? '#9ca3af' : '#374151',
          zIndex: 2,
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          overflowWrap: 'break-word',
          wordWrap: 'break-word',
          tabSize: 4, // 确保tab大小一致
          boxSizing: 'border-box', // 确保盒模型一致
          wordSpacing: 'normal', // 确保单词间距一致
          textAlign: 'left', // 确保文本对齐一致
          fontVariantLigatures: 'none', // 禁用连字
          fontFeatureSettings: 'normal' // 确保字体特性一致
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