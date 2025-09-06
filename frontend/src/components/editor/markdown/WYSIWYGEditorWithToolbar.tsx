import React, { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { AnimatePresence } from 'framer-motion';
import WYSIWYGToolbar from './WYSIWYGToolbar';
import { CustomInputModal } from '../../ui/CustomInputModal';
import RightSlideModal from '../../ui/RightSlideModal';
import { useModal } from '../../../hooks/useModal';
import { setupLatexHandling, renderAllLatex, insertLatex, processEditorContent } from './latexUtils';
import AutoComplete from '../latex/AutoComplete';
import { searchAllSymbols } from '../../../lib/latex/symbols';
import type { AutoCompleteSuggestion } from '../../../lib/latex/symbols';
import './WYSIWYGEditorWithToolbar.css';

interface WYSIWYGEditorWithToolbarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onFocus?: () => void;
  onBlur?: () => void;
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
  showToolbar?: boolean;
}

export interface WYSIWYGEditorWithToolbarRef {
  focus: () => void;
  blur: () => void;
  getHTML: () => string;
  setHTML: (html: string) => void;
  insertHTML: (html: string) => void;
}

export const WYSIWYGEditorWithToolbar = forwardRef<WYSIWYGEditorWithToolbarRef, WYSIWYGEditorWithToolbarProps>(
  ({ 
    value, 
    onChange, 
    placeholder = '开始编写...', 
    onFocus, 
    onBlur, 
    disabled = false, 
    className = '', 
    style,
    showToolbar = true
  }, ref) => {
    const editorRef = useRef<HTMLDivElement>(null);
    const autoCompleteRef = useRef<HTMLDivElement>(null);
    const [initialized, setInitialized] = useState(false);
    const [linkModalOpen, setLinkModalOpen] = useState(false);
    const [, setSelectedText] = useState('');
    const { showErrorRightSlide, rightSlideModal, closeRightSlide } = useModal();
    
    // 自动补全相关状态
    const [showAutoComplete, setShowAutoComplete] = useState(false);
    const [autoCompleteSuggestions, setAutoCompleteSuggestions] = useState<AutoCompleteSuggestion[]>([]);
    const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(0);
    const [autoCompletePosition, setAutoCompletePosition] = useState({ x: 0, y: 0 });
    const [cursorPosition, setCursorPosition] = useState(0);

    // 检查自动补全
    const checkAutoComplete = (content: string, position: number) => {
      const beforeCursor = content.substring(0, position);
      
      // 检查是否在LaTeX命令中
      const latexCommandMatch = beforeCursor.match(/\\[a-zA-Z]*$/);
      if (latexCommandMatch) {
        const currentCommand = latexCommandMatch[0];
        const suggestions = searchAllSymbols(currentCommand);
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
      if (editorRef.current) {
        const editor = editorRef.current;
        const editorRect = editor.getBoundingClientRect();
        
        // 获取编辑器样式
        const computedStyle = getComputedStyle(editor);
        const lineHeight = parseFloat(computedStyle.lineHeight) || 20;
        const paddingTop = parseFloat(computedStyle.paddingTop) || 0;
        const paddingLeft = parseFloat(computedStyle.paddingLeft) || 0;
        
        // 计算光标位置
        const textBeforeCursor = value.substring(0, position);
        const logicalLines = textBeforeCursor.split('\n');
        const currentLogicalLine = logicalLines[logicalLines.length - 1];
        const logicalLineIndex = logicalLines.length - 1;
        
        // 创建临时div来计算换行情况
        const tempDiv = document.createElement('div');
        tempDiv.style.position = 'absolute';
        tempDiv.style.visibility = 'hidden';
        tempDiv.style.width = `${editor.clientWidth - paddingLeft}px`;
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
        
        // 计算光标在当前逻辑行中的视觉位置
        let visualLineOffset = 0;
        let visualColumnPosition = 0;
        
        if (currentLogicalLine.length > 0) {
          const measureSpan = document.createElement('span');
          measureSpan.style.position = 'absolute';
          measureSpan.style.visibility = 'hidden';
          measureSpan.style.whiteSpace = 'pre-wrap';
          measureSpan.style.wordBreak = 'break-word';
          measureSpan.style.width = `${editor.clientWidth - paddingLeft}px`;
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
        
        // 计算最终的视觉行索引
        const visualLineIndex = totalVisualLines + visualLineOffset;
        
        // 计算光标在编辑器中的位置
        const cursorX = paddingLeft + (visualColumnPosition * (parseFloat(computedStyle.fontSize) * 0.6));
        const cursorY = paddingTop + (visualLineIndex * lineHeight);
        
        document.body.removeChild(tempDiv);
        
        // 考虑编辑器的滚动位置
        const scrollTop = editor.scrollTop;
        const scrollLeft = editor.scrollLeft;
        
        // 计算绝对位置（相对于视口）
        const x = editorRect.left + cursorX - scrollLeft;
        const y = editorRect.top + cursorY - scrollTop + 5; // 在光标下方5px显示
        
        setAutoCompletePosition({ x, y });
      }
    };

    // 处理自动补全选择
    const handleAutoComplete = (suggestion: AutoCompleteSuggestion) => {
      if (editorRef.current) {
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
          const textContent = editorRef.current.textContent || '';
          const beforeCursor = textContent.substring(0, cursorPosition);
          const commandMatch = beforeCursor.match(/\\[a-zA-Z]*$/);
          
          if (commandMatch) {
            // 找到命令开始位置
            const commandStart = beforeCursor.lastIndexOf(commandMatch[0]);
            const beforeCommand = textContent.substring(0, commandStart);
            
            // 清理填充字符，将字母替换为空的大括号
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
            
            // 在WYSIWYG编辑器中，我们需要找到并替换选中的文本
            // 首先找到包含命令的文本节点
            const walker = document.createTreeWalker(
              editorRef.current,
              NodeFilter.SHOW_TEXT,
              null
            );
            
            let currentPos = 0;
            let targetNode = null;
            let targetOffset = 0;
            
            let node;
            while (node = walker.nextNode()) {
              const nodeLength = node.textContent?.length || 0;
              if (currentPos + nodeLength >= commandStart) {
                targetNode = node;
                targetOffset = commandStart - currentPos;
                break;
              }
              currentPos += nodeLength;
            }
            
            if (targetNode) {
              // 计算需要替换的文本长度
              const replaceLength = cursorPosition - commandStart;
              
              // 创建新的文本内容
              const originalText = targetNode.textContent || '';
              const beforeReplace = originalText.substring(0, targetOffset);
              const afterReplace = originalText.substring(targetOffset + replaceLength);
              const newText = beforeReplace + finalSuggestion + afterReplace;
              
              // 替换文本节点的内容
              targetNode.textContent = newText;
              
              // 设置光标位置到插入文本的末尾
              const newCursorOffset = targetOffset + finalSuggestion.length;
              const newRange = document.createRange();
              newRange.setStart(targetNode, Math.min(newCursorOffset, targetNode.textContent?.length || 0));
              newRange.collapse(true);
              selection.removeAllRanges();
              selection.addRange(newRange);
              
              // 更新编辑器内容
              onChange(editorRef.current.innerHTML);
              setShowAutoComplete(false);
              
              // 智能光标定位
              setTimeout(() => {
                if (editorRef.current) {
                  // 计算新的光标位置
                  let newPosition = targetOffset + finalSuggestion.length;
                  
                  // 对于带括号的命令，将光标放在第一个括号内
                  if (cleanedSuggestion.includes('{}{}')) {
                    // 如 \frac{}{}，光标放在第一个 {} 内
                    newPosition = targetOffset + cleanedSuggestion.indexOf('{') + 1;
                  } else if (cleanedSuggestion.includes('{}')) {
                    // 如 \sqrt{}，光标放在 {} 内
                    newPosition = targetOffset + cleanedSuggestion.indexOf('{') + 1;
                  } else if (cleanedSuggestion.includes('\\left(')) {
                    // 如 \left(\right)，光标放在 \left( 后
                    newPosition = targetOffset + cleanedSuggestion.indexOf('\\left(') + 6;
                  } else if (cleanedSuggestion.includes('\\left[')) {
                    // 如 \left[\right]，光标放在 \left[ 后
                    newPosition = targetOffset + cleanedSuggestion.indexOf('\\left[') + 6;
                  } else if (cleanedSuggestion.includes('\\left\\{')) {
                    // 如 \left\{\right\}，光标放在 \left\{ 后
                    newPosition = targetOffset + cleanedSuggestion.indexOf('\\left\\{') + 7;
                  }
                  
                  // 如果在数学模式外且是LaTeX符号，需要调整光标位置（因为添加了$...$）
                  if (suggestion.type === 'latex' && !isInMathMode) {
                    newPosition += 1; // 光标在$后面
                  }
                  
                  // 设置光标位置
                  const finalRange = document.createRange();
                  finalRange.setStart(targetNode, Math.min(newPosition, targetNode.textContent?.length || 0));
                  finalRange.collapse(true);
                  selection.removeAllRanges();
                  selection.addRange(finalRange);
                  editorRef.current.focus();
                }
              }, 0);
            }
          }
        }
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

    // 处理链接创建
    const handleLinkSubmit = (url: string) => {
      if (url.trim()) {
        document.execCommand('createLink', false, url.trim());
        handleInput();
      }
      setLinkModalOpen(false);
      setSelectedText('');
    };

    const handleLinkCancel = () => {
      setLinkModalOpen(false);
      setSelectedText('');
    };

    useImperativeHandle(ref, () => ({
      focus: () => {
        editorRef.current?.focus();
      },
      blur: () => {
        editorRef.current?.blur();
      },
      getHTML: () => {
        return editorRef.current?.innerHTML || '';
      },
      setHTML: (html: string) => {
        if (editorRef.current) {
          editorRef.current.innerHTML = html;
        }
      },
      insertHTML: (html: string) => {
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = html;
          
          while (tempDiv.firstChild) {
            range.insertNode(tempDiv.firstChild);
          }
          
          range.collapse(false);
          selection.removeAllRanges();
          selection.addRange(range);
        }
      }
    }));

      // 处理输入事件
  const handleInput = () => {
    if (editorRef.current) {
      // 确保HTML结构正确
      ensureContent();
      
      // 更新光标位置并检查自动补全
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const textContent = editorRef.current.textContent || '';
        
        // 计算光标在文本中的位置
        let cursorPos = 0;
        const walker = document.createTreeWalker(
          editorRef.current,
          NodeFilter.SHOW_TEXT,
          null
        );
        
        let node;
        while (node = walker.nextNode()) {
          if (node === range.startContainer) {
            cursorPos += range.startOffset;
            break;
          } else {
            cursorPos += node.textContent?.length || 0;
          }
        }
        
        setCursorPosition(cursorPos);
        
        // 检查自动补全
        checkAutoComplete(textContent, cursorPos);
      }
      
      // LaTeX处理由setupLatexHandling自动处理，这里不需要重复调用
      
      onChange(editorRef.current.innerHTML);
    }
  };

  // LaTeX渲染功能已移除

      // 处理格式化命令
  const handleFormat = (command: string, value?: string) => {
      
      if (editorRef.current) {
        editorRef.current.focus();
        
        if (command === 'createLink') {
          // 检查是否有选中的文本
          const selection = window.getSelection();
          const text = selection?.toString().trim();
          
          if (!text) {
            showErrorRightSlide('提示', '请先选中要添加链接的文本');
            return;
          }
          
          setSelectedText(text);
          setLinkModalOpen(true);
        } else if (command === 'insertUnorderedList') {
          // 确保有选中的内容或光标位置
          const selection = window.getSelection();
          if (selection && selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            if (range.collapsed) {
              // 如果光标在空位置，插入一个列表项
              const li = document.createElement('li');
              li.innerHTML = '<br>';
              range.insertNode(li);
            } else {
              // 如果有选中内容，使用标准命令
              document.execCommand('insertUnorderedList', false);
            }
          }
          handleInput();
        } else if (command === 'insertOrderedList') {
          // 确保有选中的内容或光标位置
          const selection = window.getSelection();
          if (selection && selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            if (range.collapsed) {
              // 如果光标在空位置，插入一个列表项
              const li = document.createElement('li');
              li.innerHTML = '<br>';
              range.insertNode(li);
            } else {
              // 如果有选中内容，使用标准命令
              document.execCommand('insertOrderedList', false);
            }
          }
          handleInput();
        } else if (command === 'formatBlock' && value === 'blockquote') {
          // 处理引用块
          const selection = window.getSelection();
          if (selection && selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            const container = range.commonAncestorContainer;
            let element = container.nodeType === 3 ? container.parentElement : container as HTMLElement;
            
            // 找到包含的块级元素
            while (element && element !== editorRef.current) {
              if (['P', 'DIV', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6'].includes(element.tagName)) {
                break;
              }
              element = element.parentElement;
            }
            
            if (element && element.tagName !== 'BLOCKQUOTE') {
              const blockquote = document.createElement('blockquote');
              element.parentNode?.insertBefore(blockquote, element);
              blockquote.appendChild(element);
              handleInput();
            }
          }
        } else if (command === 'formatBlock' && value === 'pre') {
          // 处理代码块
          const selection = window.getSelection();
          if (selection && selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            const container = range.commonAncestorContainer;
            let element = container.nodeType === 3 ? container.parentElement : container as HTMLElement;
            
            // 找到包含的块级元素
            while (element && element !== editorRef.current) {
              if (['P', 'DIV', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6'].includes(element.tagName)) {
                break;
              }
              element = element.parentElement;
            }
            
            if (element && element.tagName !== 'PRE') {
              const pre = document.createElement('pre');
              const code = document.createElement('code');
              code.innerHTML = element.innerHTML;
              pre.appendChild(code);
              element.parentNode?.insertBefore(pre, element);
              element.parentNode?.removeChild(element);
              handleInput();
            }
          }
        } else if (command === 'strikeThrough') {
          document.execCommand('strikeThrough', false);
          handleInput();
        } else if (command === 'insertMath') {
          // 插入LaTeX块级公式
          if (editorRef.current) {
            insertLatex(editorRef.current, 'x^2 + y^2 = z^2', true);
          }
        } else {
          // 使用标准的execCommand
          document.execCommand(command, false, value);
          handleInput();
        }
      }
    };

      // 处理键盘事件
  const handleKeyDown = (e: React.KeyboardEvent) => {
      // 处理自动补全键盘导航
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
            e.preventDefault();
            setShowAutoComplete(false);
            break;
        }
        return;
      }
      
      // 处理删除键
      if (e.key === 'Backspace' || e.key === 'Delete') {
        // 延迟处理，确保删除操作完成后再同步
        setTimeout(() => {
          handleInput();
        }, 0);
      }


          // 处理基本的Ctrl/Cmd快捷键
    if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'b':
            e.preventDefault();
            document.execCommand('bold');
            handleInput();
            break;
          case 'i':
            e.preventDefault();
            document.execCommand('italic');
            handleInput();
            break;
          case 'u':
            e.preventDefault();
            document.execCommand('underline');
            handleInput();
            break;
          case '1':
            e.preventDefault();
            document.execCommand('formatBlock', false, 'h1');
            handleInput();
            break;
          case '2':
            e.preventDefault();
            document.execCommand('formatBlock', false, 'h2');
            handleInput();
            break;
          case '3':
            e.preventDefault();
            document.execCommand('formatBlock', false, 'h3');
            handleInput();
            break;
          case '4':
            e.preventDefault();
            document.execCommand('formatBlock', false, 'h4');
            handleInput();
            break;
          case '5':
            e.preventDefault();
            document.execCommand('formatBlock', false, 'h5');
            handleInput();
            break;
          case '6':
            e.preventDefault();
            document.execCommand('formatBlock', false, 'h6');
            handleInput();
            break;
          case '0':
            e.preventDefault();
            document.execCommand('formatBlock', false, 'p');
            handleInput();
            break;
          case 'k':
            e.preventDefault();
            // 检查是否有选中的文本
            const selection = window.getSelection();
            const text = selection?.toString().trim();
            
            if (!text) {
              showErrorRightSlide('提示', '请先选中要添加链接的文本');
              return;
            }
            
            setSelectedText(text);
            setLinkModalOpen(true);
            break;
          case 's':
            e.preventDefault();
            document.execCommand('strikeThrough');
            handleInput();
            break;
          case 'l':
            e.preventDefault();
            // 确保有选中的内容或光标位置
            const ulSelection = window.getSelection();
            if (ulSelection && ulSelection.rangeCount > 0) {
              const range = ulSelection.getRangeAt(0);
              if (range.collapsed) {
                // 如果光标在空位置，插入一个列表项
                const li = document.createElement('li');
                li.innerHTML = '<br>';
                range.insertNode(li);
              } else {
                // 如果有选中内容，使用标准命令
                document.execCommand('insertUnorderedList');
              }
            }
            handleInput();
            break;
          case 'o':
            e.preventDefault();
            // 确保有选中的内容或光标位置
            const olSelection = window.getSelection();
            if (olSelection && olSelection.rangeCount > 0) {
              const range = olSelection.getRangeAt(0);
              if (range.collapsed) {
                // 如果光标在空位置，插入一个列表项
                const li = document.createElement('li');
                li.innerHTML = '<br>';
                range.insertNode(li);
              } else {
                // 如果有选中内容，使用标准命令
                document.execCommand('insertOrderedList');
              }
            }
            handleInput();
            break;
          case 'h':
            e.preventDefault();
            // 处理引用块
            const quoteSelection = window.getSelection();
            if (quoteSelection && quoteSelection.rangeCount > 0) {
              const range = quoteSelection.getRangeAt(0);
              const container = range.commonAncestorContainer;
              let element = container.nodeType === 3 ? container.parentElement : container as HTMLElement;
              
              // 找到包含的块级元素
              while (element && element !== editorRef.current) {
                if (['P', 'DIV', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'LI'].includes(element.tagName)) {
                  break;
                }
                element = element.parentElement;
              }
              
              // 检查是否在列表中
              if (element && (element.tagName === 'LI' || element.closest('ul') || element.closest('ol'))) {
                // 如果在列表中，先删除列表格式
                const listItem = element.tagName === 'LI' ? element : element.closest('li');
                if (listItem) {
                  const listContent = listItem.innerHTML;
                  const newP = document.createElement('p');
                  newP.innerHTML = listContent;
                  listItem.parentNode?.replaceChild(newP, listItem);
                  element = newP;
                }
              }
              
              if (element && element.tagName !== 'BLOCKQUOTE') {
                const blockquote = document.createElement('blockquote');
                element.parentNode?.insertBefore(blockquote, element);
                blockquote.appendChild(element);
                handleInput();
              }
            }
            break;
          case 'e':
            e.preventDefault();
            // 处理代码块 - 只对选中的内容或当前段落
            const codeSelection = window.getSelection();
            if (codeSelection && codeSelection.rangeCount > 0) {
              const range = codeSelection.getRangeAt(0);
              
              if (!range.collapsed) {
                // 如果有选中内容，只对选中内容创建代码块
                const selectedText = range.toString();
                const pre = document.createElement('pre');
                const code = document.createElement('code');
                code.textContent = selectedText;
                pre.appendChild(code);
                range.deleteContents();
                range.insertNode(pre);
                handleInput();
              } else {
                // 如果没有选中内容，检查当前段落是否有内容
                const container = range.commonAncestorContainer;
                let element = container.nodeType === 3 ? container.parentElement : container as HTMLElement;
                
                // 找到包含的块级元素
                while (element && element !== editorRef.current) {
                  if (['P', 'DIV', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'LI'].includes(element.tagName)) {
                    break;
                  }
                  element = element.parentElement;
                }
                
                // 检查是否在列表中
                if (element && (element.tagName === 'LI' || element.closest('ul') || element.closest('ol'))) {
                  // 如果在列表中，先删除列表格式
                  const listItem = element.tagName === 'LI' ? element : element.closest('li');
                  if (listItem) {
                    const listContent = listItem.innerHTML;
                    const newP = document.createElement('p');
                    newP.innerHTML = listContent;
                    listItem.parentNode?.replaceChild(newP, listItem);
                    element = newP;
                  }
                }
                
                // 检查段落是否为空或只有空白字符
                const textContent = element?.textContent?.trim();
                if (!textContent || textContent === '') {
                  showErrorRightSlide('提示', '不能对空白地方创建代码块，请先输入内容或选中要转换为代码块的文本');
                  return;
                }
                
                if (element && element.tagName !== 'PRE') {
                  const pre = document.createElement('pre');
                  const code = document.createElement('code');
                  code.innerHTML = element.innerHTML;
                  pre.appendChild(code);
                  element.parentNode?.insertBefore(pre, element);
                  element.parentNode?.removeChild(element);
                  handleInput();
                }
              }
            }
            break;
          case 'm':
            // 插入LaTeX块级公式
            e.preventDefault();
            if (editorRef.current) {
              insertLatex(editorRef.current, 'x^2 + y^2 = z^2', true);
            }
            break;
        }
      }

      // 处理回车键
      if (e.key === 'Enter') {
        // 如果在空的块级元素中，创建新段落
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          const container = range.startContainer;
          
          // 检查是否在标题中
          let element = container.nodeType === 3 ? container.parentElement : container as HTMLElement;
          while (element && element !== editorRef.current) {
            if (/^H[1-6]$/.test(element.tagName)) {
              // 在标题后创建段落
              e.preventDefault();
              const p = document.createElement('p');
              p.innerHTML = '<br>';
              element.parentNode?.insertBefore(p, element.nextSibling);
              
              const newRange = document.createRange();
              newRange.setStart(p, 0);
              newRange.collapse(true);
              selection.removeAllRanges();
              selection.addRange(newRange);
              break;
            }
            element = element.parentElement;
          }
        }
      }
    };

    // 处理粘贴事件
    const handlePaste = (e: React.ClipboardEvent) => {
      e.preventDefault();
      const text = e.clipboardData.getData('text/plain');
      
      // 处理LaTeX和Markdown格式
      let processedText = text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/`(.*?)`/g, '<code>$1</code>')
        .replace(/^#{6}\s+(.*)/gm, '<h6>$1</h6>')
        .replace(/^#{5}\s+(.*)/gm, '<h5>$1</h5>')
        .replace(/^#{4}\s+(.*)/gm, '<h4>$1</h4>')
        .replace(/^#{3}\s+(.*)/gm, '<h3>$1</h3>')
        .replace(/^#{2}\s+(.*)/gm, '<h2>$1</h2>')
        .replace(/^#{1}\s+(.*)/gm, '<h1>$1</h1>')
        .replace(/\n/g, '<br>');

      // LaTeX处理已移除

      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.deleteContents();
        
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = processedText;
        
        while (tempDiv.firstChild) {
          range.insertNode(tempDiv.firstChild);
        }
        
        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);
        
        handleInput();
      }
    };

    // 确保编辑器有初始内容
    const ensureContent = () => {
      if (editorRef.current && editorRef.current.innerHTML.trim() === '') {
        editorRef.current.innerHTML = '<p><br></p>';
      }
    };

    // 处理聚焦事件
    const handleFocus = () => {
      ensureContent();
      onFocus?.();
    };

    // 处理失去焦点事件
  const handleBlur = () => {
    // 失去焦点时渲染所有LaTeX
    if (editorRef.current) {
      renderAllLatex(editorRef.current);
    }
    onBlur?.();
  };

    // 初始化编辑器
    useEffect(() => {
      if (editorRef.current && !initialized) {
        // 设置初始内容
        if (value) {
          editorRef.current.innerHTML = value;
        } else {
          ensureContent();
        }
        
        // 设置LaTeX处理
        setupLatexHandling(editorRef.current);
        
        // 处理初始内容中的LaTeX
        processEditorContent(editorRef.current);
        
        setInitialized(true);
      }
    }, [initialized]);

    // 当外部value改变时更新编辑器内容
    useEffect(() => {
      if (editorRef.current && initialized && value !== editorRef.current.innerHTML) {
        editorRef.current.innerHTML = value || '<p><br></p>';
      }
    }, [value, initialized]);

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
      <div className={`wysiwyg-editor-with-toolbar ${className}`} style={style}>
        {showToolbar && (
          <WYSIWYGToolbar 
            onFormat={handleFormat} 
            disabled={disabled}
          />
        )}
        <div className="simple-wysiwyg-editor">
          <div
            ref={editorRef}
            className="simple-wysiwyg-content"
            contentEditable={!disabled}
            onInput={handleInput}
            onKeyDown={handleKeyDown}
            onKeyUp={handleInput}
            onPaste={handlePaste}
            onFocus={handleFocus}
            onBlur={handleBlur}
            data-placeholder={placeholder}
            spellCheck={false}
          />
        </div>
        
        {/* 链接输入模态框 */}
        <CustomInputModal
          isOpen={linkModalOpen}
          onClose={handleLinkCancel}
          onSubmit={handleLinkSubmit}
          title="添加链接"
          placeholder="请输入链接地址"
          submitText="确定"
          cancelText="取消"
          maxLength={500}
          required={true}
        />
        
        {/* 右侧滑入通知 */}
        <RightSlideModal
          isOpen={rightSlideModal.isOpen}
          onClose={closeRightSlide}
          title={rightSlideModal.title}
          message={rightSlideModal.message}
          type={rightSlideModal.type}
          width={rightSlideModal.width}
          autoClose={rightSlideModal.autoClose}
          showProgress={rightSlideModal.showProgress}
        />
        
        {/* 自动补全 */}
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
  }
);

WYSIWYGEditorWithToolbar.displayName = 'WYSIWYGEditorWithToolbar';
