import React, { useState, useRef, useEffect, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import TikZHighlighter from './TikZHighlighter';
import TikZAutoComplete from './TikZAutoComplete';
import { 
  searchTikZSymbols, 
  getContextualParameters,
  filterSuggestions,
  getColorValues,
  getLineWidthValues,
  getLineStyleValues,
  getOpacityValues
} from '../../../lib/tikz/symbols';
import { useTheme } from '../../../contexts/ThemeContext';
import { useTranslation } from '../../../hooks/useTranslation';
import './TikZHighlighter.css';

interface TikZHighlightInputProps {
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
  onCursorPositionChange?: (position: number) => void;
}

const TikZHighlightInput: React.FC<TikZHighlightInputProps> = ({
  value,
  onChange,
  placeholder = '输入TikZ代码...',
  className = '',
  style = {},
  enableAutoComplete = false,
  onFocus,
  onBlur,
  disabled = false,
  rows = 4,
  onCursorPositionChange
}) => {
  const { t } = useTranslation();
  const { isDark } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [showAutoComplete, setShowAutoComplete] = useState(false);
  const [autoCompleteSuggestions, setAutoCompleteSuggestions] = useState<any[]>([]);
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
        const highlighterContent = highlighter.querySelector('.tikz-highlighter') as HTMLElement;
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

  // 增强的自动补全检查 - 支持上下文识别和实时筛选
  const checkAutoComplete = (content: string, position: number) => {
    if (!enableAutoComplete) return;
    
    const beforeCursor = content.substring(0, position);
    
    // 1. 检查是否在TikZ命令中（以\开头）
    const commandMatch = beforeCursor.match(/\\([a-zA-Z]*)$/);
    if (commandMatch) {
      const query = commandMatch[1];
      
      // 如果查询为空（用户只输入了\），提供精选的常用命令、图形和函数
      if (query === '') {
        const commonCommands = [
          // 基础绘图命令
          { latex: '\\draw', name: t('tikz.highlightInput.commonCommands.draw'), description: '绘制路径或图形', category: 'draw' },
          { latex: '\\fill', name: t('tikz.highlightInput.commonCommands.fill'), description: '填充封闭图形', category: 'draw' },
          { latex: '\\node', name: t('tikz.highlightInput.commonCommands.node'), description: '创建文本或图形节点', category: 'node' },
          { latex: '\\path', name: t('tikz.highlightInput.commonCommands.path'), description: '定义路径但不绘制', category: 'draw' },
          { latex: '\\clip', name: t('tikz.highlightInput.commonCommands.clip'), description: '裁剪后续绘制内容', category: 'draw' },
          
          // 常用图形
          { latex: '\\draw (0,0) rectangle (2,2);', name: t('tikz.highlightInput.commonCommands.rectangle'), description: '绘制矩形', category: 'shape', completeExample: '\\draw (0,0) rectangle (2,2);' },
          { latex: '\\draw (0,0) circle (1cm);', name: t('tikz.highlightInput.commonCommands.circle'), description: '绘制圆形', category: 'shape', completeExample: '\\draw (0,0) circle (1cm);' },
          { latex: '\\draw (0,0) ellipse (2cm and 1cm);', name: t('tikz.highlightInput.commonCommands.ellipse'), description: '绘制椭圆', category: 'shape', completeExample: '\\draw (0,0) ellipse (2cm and 1cm);' },
          
          // 常用函数
          { latex: '\\draw plot {sin(x)};', name: t('tikz.highlightInput.commonCommands.sinFunction'), description: '绘制正弦函数', category: 'math', completeExample: '\\draw[red, thick] plot[domain=0:6.28, samples=100] {sin(x)};' },
          { latex: '\\draw plot {x^2};', name: t('tikz.highlightInput.commonCommands.quadFunction'), description: '绘制二次函数', category: 'math', completeExample: '\\draw[blue, thick] plot[domain=-2:2, samples=100] {x^2};' },
          { latex: '\\draw plot {x^3};', name: t('tikz.highlightInput.commonCommands.cubicFunction'), description: '绘制三次函数', category: 'math', completeExample: '\\draw[green, thick] plot[domain=-2:2, samples=100] {x^3};' }
        ];
        setAutoCompleteSuggestions(commonCommands);
        setShowAutoComplete(true);
        setSelectedSuggestionIndex(0);
        updateAutoCompletePosition(position);
        return;
      }
      
      // 如果有具体查询内容，进行正常搜索和筛选
      const suggestions = searchTikZSymbols(query, t);
      const filteredSuggestions = filterSuggestions(suggestions, query);
      
      if (filteredSuggestions.length > 0) {
        setAutoCompleteSuggestions(filteredSuggestions);
        setShowAutoComplete(true);
        setSelectedSuggestionIndex(0);
        updateAutoCompletePosition(position);
      } else {
        setShowAutoComplete(false);
      }
      return;
    }
    
    // 2. 检查是否在样式参数中（[]内）- 增强上下文识别
    const styleParamMatch = beforeCursor.match(/\\(draw|node|fill|path|shade|clip)\s*\[([^\]]*)$/);
    if (styleParamMatch) {
      const command = styleParamMatch[1];
      const currentParam = styleParamMatch[2];
      
      // 获取当前输入的参数（最后一个逗号后的内容）
      const paramParts = currentParam.split(',');
      const currentInput = paramParts[paramParts.length - 1].trim();
      
      // 根据命令类型和当前输入获取上下文相关建议
      const suggestions = getContextualParameters(command, currentInput, t);
      
      if (suggestions.length > 0) {
        setAutoCompleteSuggestions(suggestions);
        setShowAutoComplete(true);
        setSelectedSuggestionIndex(0);
        updateAutoCompletePosition(position);
      } else {
        setShowAutoComplete(false);
      }
      return;
    }
    
    // 2.5. 检查是否在特定命令的[]内，但不在参数值中
    const inSpecificBracketsMatch = beforeCursor.match(/\\(draw|node|fill|path|shade|clip)\s*\[([^\]]*?)([^,\]]*?)$/);
    if (inSpecificBracketsMatch) {
      const command = inSpecificBracketsMatch[1];
      const fullParams = inSpecificBracketsMatch[2];
      const currentInput = inSpecificBracketsMatch[3];
      
      // 检查是否在参数值中（如 color=red 中的 red）
      const isInParamValue = fullParams.includes('=');
      
      if (!isInParamValue) {
        // 不在参数值中，提供该命令的专用参数建议
        const suggestions = getContextualParameters(command, currentInput, t);
        
        if (suggestions.length > 0) {
          setAutoCompleteSuggestions(suggestions);
          setShowAutoComplete(true);
          setSelectedSuggestionIndex(0);
          updateAutoCompletePosition(position);
        } else {
          setShowAutoComplete(false);
        }
        return;
      }
    }
    
    // 3. 检查是否在已有的[]参数中继续输入
    const inBracketsMatch = beforeCursor.match(/\[([^\]]*?)([^,\]]*?)$/);
    if (inBracketsMatch) {
      const currentInput = inBracketsMatch[2];
      
      // 尝试从前面的内容中识别命令类型
      const commandInLineMatch = beforeCursor.match(/\\(draw|node|fill|path|shade|clip)\s*\[[^\]]*$/);
      if (commandInLineMatch) {
        const command = commandInLineMatch[1];
        const suggestions = getContextualParameters(command, currentInput, t);
        
        if (suggestions.length > 0) {
          setAutoCompleteSuggestions(suggestions);
          setShowAutoComplete(true);
          setSelectedSuggestionIndex(0);
          updateAutoCompletePosition(position);
        } else {
          setShowAutoComplete(false);
        }
        return;
      }
    }
    
    // 4. 检查是否在样式参数值中（如 color=red 中的 red）
    const styleValueMatch = beforeCursor.match(/([a-zA-Z\s]+)=([^,\]]*)$/);
    if (styleValueMatch) {
      const styleName = styleValueMatch[1].trim();
      const currentValue = styleValueMatch[2];
      
      let suggestions: any[] = [];
      
      // 根据样式名称提供相应的建议并应用筛选
      if (styleName === 'color' || styleName === 'fill' || styleName === 'draw') {
        suggestions = filterSuggestions(getColorValues(t), currentValue);
      } else if (styleName === 'line width' || styleName.includes('thick') || styleName.includes('thin')) {
        suggestions = filterSuggestions(getLineWidthValues(t), currentValue);
      } else if (styleName.includes('dash') || styleName.includes('dotted')) {
        suggestions = filterSuggestions(getLineStyleValues(t), currentValue);
      } else if (styleName === 'opacity') {
        suggestions = filterSuggestions(getOpacityValues(t), currentValue);
      } else if (styleName.includes('color')) {
        // 处理复合颜色属性如 "left color", "right color"
        suggestions = filterSuggestions(getColorValues(t), currentValue);
      }
      
      if (suggestions.length > 0) {
        setAutoCompleteSuggestions(suggestions);
        setShowAutoComplete(true);
        setSelectedSuggestionIndex(0);
        updateAutoCompletePosition(position);
      } else {
        setShowAutoComplete(false);
      }
      return;
    }
    
    // 5. 检查是否在逗号后的新参数中
    const commaParamMatch = beforeCursor.match(/,\s*([^,\]]*)$/);
    if (commaParamMatch && beforeCursor.includes('[') && !beforeCursor.includes(']')) {
      const currentInput = commaParamMatch[1];
      
      // 尝试识别命令类型
      const commandMatch = beforeCursor.match(/\\(draw|node|fill|path|shade|clip)\s*\[[^\]]*$/);
      if (commandMatch) {
        const command = commandMatch[1];
        const suggestions = getContextualParameters(command, currentInput, t);
        
        if (suggestions.length > 0) {
          setAutoCompleteSuggestions(suggestions);
          setShowAutoComplete(true);
          setSelectedSuggestionIndex(0);
          updateAutoCompletePosition(position);
        } else {
          setShowAutoComplete(false);
        }
      } else {
        // 如果无法识别命令，提供通用建议
        const suggestions = getContextualParameters('', currentInput);
        if (suggestions.length > 0) {
          setAutoCompleteSuggestions(suggestions);
          setShowAutoComplete(true);
          setSelectedSuggestionIndex(0);
          updateAutoCompletePosition(position);
        } else {
          setShowAutoComplete(false);
        }
      }
      return;
    }
    
    // 6. 其他情况关闭自动补全
    setShowAutoComplete(false);
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
      tempDiv.style.whiteSpace = 'pre-wrap';
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
        const lineVisualHeight = tempDiv.offsetHeight;
        const linesInThisLogicalLine = Math.ceil(lineVisualHeight / lineHeight);
        totalVisualLines += linesInThisLogicalLine;
      }
      
      // 计算当前逻辑行到光标位置的视觉行偏移和列位置
      tempDiv.textContent = currentLogicalLine;
      
      let visualLineOffset = 0;
      let visualColumnPosition = 0;
      
      if (currentLogicalLine.length > 0) {
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
        
        let lastTop = -1;
        let currentTop = 0;
        
        for (let i = 0; i <= currentLogicalLine.length; i++) {
          measureSpan.textContent = currentLogicalLine.substring(0, i);
          currentTop = measureSpan.offsetHeight;
          
          if (lastTop !== -1 && currentTop > lastTop) {
            visualLineOffset++;
            visualColumnPosition = 0;
          }
          
          if (i === currentLogicalLine.length) {
            break;
          }
          
          lastTop = currentTop;
          visualColumnPosition++;
        }
        
        document.body.removeChild(measureSpan);
      }
      
      const visualLineIndex = totalVisualLines + visualLineOffset;
      
      // 计算光标在textarea中的位置
      const cursorX = paddingLeft + (visualColumnPosition * (parseFloat(computedStyle.fontSize) * 0.6));
      const cursorY = paddingTop + (visualLineIndex * lineHeight);
      
      document.body.removeChild(tempDiv);
      
      // 考虑textarea的滚动位置
      const scrollTop = textarea.scrollTop;
      const scrollLeft = textarea.scrollLeft;
      
      // 计算绝对位置（相对于视口）
      const x = textareaRect.left + cursorX - scrollLeft;
      const y = textareaRect.top + cursorY - scrollTop + 5;
      
      setAutoCompletePosition({ x, y });
    }
  };

  // 处理自动补全选择
  const handleAutoComplete = (suggestion: any) => {
    const beforeCursor = value.substring(0, cursorPosition);
    
    // 检查是否在样式参数中（[]内）
    const styleParamMatch = beforeCursor.match(/\[([^\]]*)$/);
    if (styleParamMatch) {
      // 处理样式参数自动补全
      const paramStart = beforeCursor.lastIndexOf('[') + 1;
      const beforeParam = value.substring(0, paramStart);
      const afterCursor = value.substring(cursorPosition);
      
      // 检查是否已经有其他参数（用逗号分隔）
      const currentParam = styleParamMatch[1];
      let newValue: string;
      
      if (currentParam.includes(',')) {
        // 如果已经有逗号，替换最后一个参数
        const lastCommaIndex = currentParam.lastIndexOf(',');
        const beforeLastParam = currentParam.substring(0, lastCommaIndex + 1);
        newValue = beforeParam + beforeLastParam + suggestion.latex + afterCursor;
      } else {
        // 如果没有逗号，直接替换
        newValue = beforeParam + suggestion.latex + afterCursor;
      }
      
      onChange(newValue);
      setShowAutoComplete(false);
      
      // 智能光标定位 - 将光标放在自动填充内容的末尾
      setTimeout(() => {
        if (textareaRef.current) {
          const newPosition = beforeParam.length + suggestion.latex.length;
          textareaRef.current.setSelectionRange(newPosition, newPosition);
          textareaRef.current.focus();
          setCursorPosition(newPosition);
          onCursorPositionChange?.(newPosition);
          
          // 检查是否需要继续显示自动补全（如果后面有逗号）
          if (afterCursor.startsWith(',')) {
            // 延迟一下再检查，确保状态已更新
            setTimeout(() => {
              checkAutoComplete(newValue, newPosition);
            }, 10);
          }
        }
      }, 0);
    } else {
      // 处理TikZ命令自动补全
      const commandMatch = beforeCursor.match(/\\[a-zA-Z]*$/);
      
      if (commandMatch) {
        const commandStart = beforeCursor.lastIndexOf(commandMatch[0]);
        const beforeCommand = value.substring(0, commandStart);
        const afterCursor = value.substring(cursorPosition);
        
        let newValue: string;
        
        // 检查是否是图形命令，如果是则提供完整示例
        if (suggestion.category === 'shape' && suggestion.completeExample) {
          // 对于图形命令，插入完整的绘图示例
          newValue = beforeCommand + suggestion.completeExample + afterCursor;
        } else {
          // 对于其他命令，使用标准的latex
          newValue = beforeCommand + suggestion.latex + afterCursor;
        }
        
        onChange(newValue);
        setShowAutoComplete(false);
        
        // 智能光标定位
        setTimeout(() => {
          if (textareaRef.current) {
            let newPosition: number;
            
            if (suggestion.category === 'shape' && suggestion.completeExample) {
              // 对于图形命令，将光标放在示例代码的末尾，方便用户修改
              newPosition = beforeCommand.length + suggestion.completeExample.length;
            } else if (suggestion.latex.includes('{}')) {
              // 对于带括号的命令，将光标放在第一个括号内
              newPosition = beforeCommand.length + suggestion.latex.indexOf('{') + 1;
            } else {
              // 其他情况，光标放在命令末尾
              newPosition = beforeCommand.length + suggestion.latex.length;
            }
            
            textareaRef.current.setSelectionRange(newPosition, newPosition);
            textareaRef.current.focus();
            setCursorPosition(newPosition);
            onCursorPositionChange?.(newPosition);
          }
        }, 0);
      }
    }
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
      const handleScroll = () => {
        if (highlighterRef.current) {
          const highlighter = highlighterRef.current;
          highlighter.style.transform = `translate(-${textarea.scrollLeft}px, -${textarea.scrollTop}px)`;
        }
      };
      
      textarea.addEventListener('scroll', handleScroll);
      syncScrollAndSize();
      return () => textarea.removeEventListener('scroll', handleScroll);
    }
  }, [syncScrollAndSize]);

  // 当内容变化时，延迟同步尺寸
  useEffect(() => {
    const timer = setTimeout(() => {
      syncScrollAndSize();
    }, 50);
    
    return () => clearTimeout(timer);
  }, [value, syncScrollAndSize]);

  // 监听窗口大小变化和容器尺寸变化
  useEffect(() => {
    const handleResize = () => {
      setTimeout(() => {
        syncScrollAndSize();
        setTimeout(syncScrollAndSize, 50);
      }, 0);
    };
    
    window.addEventListener('resize', handleResize);
    
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
      className={`relative tikz-highlight-input ${className}`}
      style={{
        ...style,
        overflow: 'hidden'
      }}
    >
      {/* 高亮背景层 */}
      <div
        ref={highlighterRef}
        className={`absolute pointer-events-none overflow-hidden tikz-highlight-container ${isDark ? 'dark' : ''}`}
        style={{
          top: '1px',
          left: '1px',
          fontSize: '14px',
          lineHeight: '1.6',
          fontFamily: 'monospace',
          letterSpacing: '0px',
          color: 'inherit',
          zIndex: 1,
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          overflowWrap: 'break-word',
          wordWrap: 'break-word',
          tabSize: 4,
          boxSizing: 'border-box',
          wordSpacing: 'normal',
          textAlign: 'left',
          fontVariantLigatures: 'none',
          fontFeatureSettings: 'normal',
          borderRadius: '6px'
        }}
      >
        <TikZHighlighter content={value} className={isDark ? 'dark' : ''} />
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
          fontFamily: 'monospace',
          letterSpacing: '0px',
          color: 'transparent',
          caretColor: isFocused ? '#3b82f6' : isDark ? '#9ca3af' : '#374151',
          zIndex: 2,
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          overflowWrap: 'break-word',
          wordWrap: 'break-word',
          tabSize: 4,
          boxSizing: 'border-box',
          wordSpacing: 'normal',
          textAlign: 'left',
          fontVariantLigatures: 'none',
          fontFeatureSettings: 'normal'
        }}
      />
      
      {/* 自动补全 */}
      {enableAutoComplete && (
        <AnimatePresence>
          {showAutoComplete && autoCompleteSuggestions.length > 0 && (
            <TikZAutoComplete
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

export default TikZHighlightInput;
