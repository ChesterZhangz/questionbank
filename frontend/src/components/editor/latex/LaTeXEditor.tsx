import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import { 
  Eye, 
  EyeOff, 
  Sigma,
  FileText,
  Brain
} from 'lucide-react';
import Button from '../../ui/Button';
import Card from '../../ui/Card';

import HoverTooltip from '../preview/HoverTooltip';
import LaTeXPreview from '../preview/LaTeXPreview';
import SymbolPanel from './SymbolPanel';
import AutoComplete from './AutoComplete';
import LaTeXHighlightInput from './LaTeXHighlightInput';
import type { RenderConfig } from '../../../lib/latex/types';
import { searchAllSymbols } from '../../../lib/latex/symbols';

interface LaTeXEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  showPreview?: boolean;
  enableHoverPreview?: boolean;
  onError?: (error: string) => void;
  questionType?: 'choice' | 'fill' | 'solution';
  displayType?: 'question' | 'solution'; 
  autoNumbering?: boolean;
  config?: Partial<RenderConfig>;
  className?: string;
  simplified?: boolean; // 新增：简化模式，隐藏工具栏
}

interface AutoCompleteSuggestion {
  text: string;
  description: string;
  type: 'latex' | 'markdown' | 'question';
}

const LaTeXEditor: React.FC<LaTeXEditorProps> = ({
  value,
  onChange,
  placeholder = '输入LaTeX公式...',
  showPreview = true,
  enableHoverPreview = false,
  questionType,
  displayType = 'question',
  config = { mode: 'full' },
  className = '',
  simplified = false
}) => {
  const [isPreviewVisible, setIsPreviewVisible] = useState(showPreview);
  const [isSymbolPanelOpen, setIsSymbolPanelOpen] = useState(false);
  const [isQuestionPanelOpen, setIsQuestionPanelOpen] = useState(false);
  const isHighlightEnabled = true; // 直接启用高亮，不可关闭
  const [showAutoComplete, setShowAutoComplete] = useState(false);
  const [autoCompleteSuggestions, setAutoCompleteSuggestions] = useState<AutoCompleteSuggestion[]>([]);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(0);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [autoCompletePosition, setAutoCompletePosition] = useState({ x: 0, y: 0 });
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const autoCompleteRef = useRef<HTMLDivElement>(null);

  // 处理光标位置变化
  const handleCursorPositionChange = (position: number) => {
    setCursorPosition(position);
  };

  // 处理内容变化
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    
    // 更新光标位置
    setCursorPosition(e.target.selectionStart);
    
    // 检查是否需要显示自动补全
    checkAutoComplete(newValue, e.target.selectionStart);
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
        // 使用传入的position参数而不是状态中的cursorPosition
        updateAutoCompletePositionWithPosition(position);
      } else {
        setShowAutoComplete(false);
      }
    } else {
      setShowAutoComplete(false);
    }
  };

  // 获取自动补全建议
  const getAutoCompleteSuggestions = (currentCommand: string): AutoCompleteSuggestion[] => {
    return searchAllSymbols(currentCommand);
  };

  // 更新自动补全位置（使用传入的位置参数）- 考虑文本自动换行
  const updateAutoCompletePositionWithPosition = (position: number) => {
    if (textareaRef.current) {
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
            // 如 \frac{}{}，光标放在第一个 {} 内
            newPosition = beforeCommand.length + cleanedSuggestion.indexOf('{') + 1;
          } else if (cleanedSuggestion.includes('{}')) {
            // 如 \sqrt{}，光标放在 {} 内
            newPosition = beforeCommand.length + cleanedSuggestion.indexOf('{') + 1;
          } else if (cleanedSuggestion.includes('\\left(')) {
            // 如 \left(\right)，光标放在 \left( 后
            newPosition = beforeCommand.length + cleanedSuggestion.indexOf('\\left(') + 6;
          } else if (cleanedSuggestion.includes('\\left[')) {
            // 如 \left[\right]，光标放在 \left[ 后
            newPosition = beforeCommand.length + cleanedSuggestion.indexOf('\\left[') + 6;
          } else if (cleanedSuggestion.includes('\\left\\{')) {
            // 如 \left\{\right\}，光标放在 \left\{ 后
            newPosition = beforeCommand.length + cleanedSuggestion.indexOf('\\left\\{') + 7;
          }
          
          // 如果在数学模式外且是LaTeX符号，需要调整光标位置（因为添加了$...$）
          if (suggestion.type === 'latex' && !isInMathMode) {
            newPosition += 1; // 光标在$后面
          }
          
          textareaRef.current.setSelectionRange(newPosition, newPosition);
          textareaRef.current.focus();
        }
      }, 0);
    }
  };

  // 插入符号
  const insertSymbol = (symbol: string) => {
    // 获取当前textarea的光标位置
    let currentPosition = cursorPosition;
    
    // 如果当前有textarea引用，直接获取其光标位置
    if (textareaRef.current) {
      currentPosition = textareaRef.current.selectionStart;
    }
    
    // 清理填充字符，将字母替换为空的大括号，但保护LaTeX环境名称
    let cleanedSymbol = symbol;
    
    // 添加调试信息
    console.log('🔍 insertSymbol - 原始符号:', symbol);
    console.log('🔍 insertSymbol - 是否包含\\begin:', symbol.includes('\\begin'));
    console.log('🔍 insertSymbol - 是否包含\\end:', symbol.includes('\\end'));
    
    // 首先检查是否包含LaTeX环境命令，如果是则完全跳过清理
    if (symbol.includes('\\begin') || symbol.includes('\\end')) {
      cleanedSymbol = symbol; // 保持原样，不进行任何清理
      console.log('🔍 insertSymbol - 检测到LaTeX环境，跳过清理，结果:', cleanedSymbol);
    } else {
      // 只对非环境命令进行清理
      cleanedSymbol = symbol
        .replace(/\{([a-zA-Z])\}/g, (match, _letter) => {
          // 检查是否在字体样式命令中
          const beforeMatch = symbol.substring(0, symbol.indexOf(match));
          if (beforeMatch.includes('\\mathbb') || beforeMatch.includes('\\mathbf') || beforeMatch.includes('\\mathit') || beforeMatch.includes('\\mathrm') || beforeMatch.includes('\\mathcal') || beforeMatch.includes('\\mathscr') || beforeMatch.includes('\\mathfrak') || beforeMatch.includes('\\text') || beforeMatch.includes('\\texttt') || beforeMatch.includes('\\textsf')) {
            return match; // 保持原样
          }
          return '{}'; // 替换为空大括号
        })
        .replace(/\{([a-zA-Z]+)\}/g, (match, _letters) => {
          // 检查是否在字体样式命令中
          const beforeMatch = symbol.substring(0, symbol.indexOf(match));
          if (beforeMatch.includes('\\mathbb') || beforeMatch.includes('\\mathbf') || beforeMatch.includes('\\mathit') || beforeMatch.includes('\\mathrm') || beforeMatch.includes('\\mathcal') || beforeMatch.includes('\\mathscr') || beforeMatch.includes('\\mathfrak') || beforeMatch.includes('\\text') || beforeMatch.includes('\\texttt') || beforeMatch.includes('\\textsf')) {
            return match; // 保持原样
          }
          return '{}'; // 替换为空大括号
        });
      console.log('🔍 insertSymbol - 非环境命令，清理后结果:', cleanedSymbol);
    }
    
    // 检查当前光标是否在$...$内部
    const beforeCursor = value.substring(0, currentPosition);
    const afterCursor = value.substring(currentPosition);
    
    // 检查是否在数学模式内
    const isInMathMode = isInsideMathMode(beforeCursor);
    
    // 判断是否为题目符号
    const isQuestionSymbol = isQuestionSymbolCommand(symbol);
    
    let finalSymbol = cleanedSymbol;
    let newPosition = currentPosition;
    
    // 只有LaTeX类型的符号才需要检查数学模式，题目符号直接插入
    if (isQuestionSymbol) {
      // 题目符号直接插入，不添加$
      newPosition = currentPosition + cleanedSymbol.length;
    } else {
      // LaTeX符号需要检查数学模式
      if (!isInMathMode) {
        // 不在数学模式内，自动添加$
        finalSymbol = '$' + cleanedSymbol + '$';
        newPosition = currentPosition + finalSymbol.length;
      } else {
        // 在数学模式内，直接插入
        newPosition = currentPosition + cleanedSymbol.length;
      }
    }
    
    const newValue = beforeCursor + finalSymbol + afterCursor;
    onChange(newValue);
    
    // 更新光标位置
    setCursorPosition(newPosition);
    
    // 设置光标位置到新位置
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.setSelectionRange(newPosition, newPosition);
        textareaRef.current.focus();
      }
    }, 0);
  };

  // 判断是否为题目符号命令
  const isQuestionSymbolCommand = (symbol: string): boolean => {
    const questionCommands = ['\\choice', '\\fill', '\\subp', '\\subsubp'];
    return questionCommands.some(cmd => symbol.startsWith(cmd));
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
    if (showAutoComplete) {
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

  return (
    <div className={`space-y-4 ${className}`}>
      {/* 工具栏 */}
      {!simplified && (
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsSymbolPanelOpen(!isSymbolPanelOpen)}
              className="bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <Sigma className="w-4 h-4" />
              <span>数学符号</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsQuestionPanelOpen(!isQuestionPanelOpen)}
              className="bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <FileText className="w-4 h-4" />
              <span>题目符号</span>
            </Button>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsPreviewVisible(!isPreviewVisible)}
            className="bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            {isPreviewVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            <span>{isPreviewVisible ? '隐藏预览' : '显示预览'}</span>
          </Button>
        </div>
      )}

      {/* 符号面板 */}
      <AnimatePresence>
        {isSymbolPanelOpen && (
          <SymbolPanel
            onSymbolSelect={insertSymbol}
            onClose={() => setIsSymbolPanelOpen(false)}
          />
        )}
        {isQuestionPanelOpen && (
          <SymbolPanel
            type="question"
            onSymbolSelect={insertSymbol}
            onClose={() => setIsQuestionPanelOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* 编辑和预览区域 */}
      <div className={`grid ${isPreviewVisible ? 'grid-cols-2' : 'grid-cols-1'} gap-4 w-full`}>
        {/* 编辑区域 */}
        <Card className={`p-0 flex flex-col ${!isPreviewVisible ? 'w-full min-w-0' : ''}`}>
          {/* 简化模式下隐藏头部 */}
          {!simplified && (
            <div className="p-4 border-b bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <Brain className="w-4 h-4" />
                <span>LaTeX编辑区域</span>
                              {questionType && (
                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-xs">
                  {questionType === 'choice' ? '选择题' : 
                   questionType === 'fill' ? '填空题' : 
                   questionType === 'solution' ? (displayType === 'solution' ? '解析' : '解答题') : '解答题'}
                </span>
              )}
              </div>
            </div>
          )}

          {/* 文本编辑区域 */}
          <div className={`relative flex-1 min-w-0 w-full ${simplified ? 'rounded-md overflow-hidden' : ''}`}>
            {isHighlightEnabled ? (
              enableHoverPreview && !isPreviewVisible ? (
                <HoverTooltip content={value} config={config} className="hover-preview-enhanced">
                  <LaTeXHighlightInput
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    enableAutoComplete={true}
                    rows={simplified? 7: 14}
                    className={simplified ? 'border-0' : ''}
                    style={{ 
                      height: simplified ? '182.5px' : '340px',
                      overflow: 'auto',
                      fontFamily: 'monospace', // 使用单一字体，确保一致性
                      letterSpacing: '0px' // 确保字母间距一致
                    }}
                    onCursorPositionChange={handleCursorPositionChange}
                  />
                </HoverTooltip>
              ) : (
                <LaTeXHighlightInput
                  value={value}
                  onChange={onChange}
                  placeholder={placeholder}
                  enableAutoComplete={true}
                  rows={simplified? 7: 14}
                  className={simplified ? 'border-0' : ''}
                  style={{ 
                    height: simplified ? '182.5px' : '340px',
                    overflow: 'auto',
                    fontFamily: 'monospace', // 使用单一字体，确保一致性
                    letterSpacing: '0px' // 确保字母间距一致
                  }}
                  onCursorPositionChange={handleCursorPositionChange}
                />
              )
            ) : (
              enableHoverPreview && !isPreviewVisible ? (
                <HoverTooltip content={value} config={config} className="hover-preview-enhanced">
                  <textarea
                    ref={textareaRef}
                    value={value}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    onClick={(e) => setCursorPosition(e.currentTarget.selectionStart)}
                    placeholder={placeholder}
                    className="w-full h-96 p-4 font-mono text-sm border-0 resize-none focus:outline-none focus:ring-0 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                    style={{
                      lineHeight: '1.6',
                      fontFamily: 'Consolas, Monaco, "Courier New", monospace',
                      boxSizing: 'border-box',
                      width: '100% !important',
                      minWidth: '100% !important',
                      maxWidth: '100% !important',
                      display: 'block'
                    }}
                  />
                </HoverTooltip>
              ) : (
                <textarea
                  ref={textareaRef}
                  value={value}
                  onChange={handleChange}
                  onKeyDown={handleKeyDown}
                  onClick={(e) => setCursorPosition(e.currentTarget.selectionStart)}
                  placeholder={placeholder}
                  className="w-full h-96 p-4 font-mono text-sm border-0 resize-none focus:outline-none focus:ring-0 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                  style={{
                    lineHeight: '1.6',
                    fontFamily: 'Consolas, Monaco, "Courier New", monospace',
                    boxSizing: 'border-box',
                    width: '100% !important',
                    minWidth: '100% !important',
                    maxWidth: '100% !important',
                    display: 'block'
                  }}
                />
              )
            )}
          </div>
        </Card>

        {/* 预览区域 */}
        {isPreviewVisible && (
          <div className="h-[500px]">
            <LaTeXPreview
              content={value}
              config={config}
              variant="detailed"
              showTitle={true}
              title="渲染预览"
              className="h-full preview-enhanced"
            />
          </div>
        )}
      </div>
      
      {/* 自动补全 - 使用fixed定位，渲染在body级别 */}
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
    </div>
  );
};

export default LaTeXEditor; 