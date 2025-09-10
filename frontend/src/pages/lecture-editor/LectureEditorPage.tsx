import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Save,
  FileText,
  BookOpen,
  X,
  Plus,
  Tag
} from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import WYSIWYGToolbar from '../../components/editor/markdown/WYSIWYGToolbar';
import { useModal } from '../../hooks/useModal';
import ConfirmModal from '../../components/ui/ConfirmModal';
import RightSlideModal from '../../components/ui/RightSlideModal';
import { paperAPI, paperBankAPI } from '../../services/api';
import { setupLatexHandling, renderAllLatex, insertLatex, processEditorContent } from '../../components/editor/markdown/latexUtils';
import AutoComplete from '../../components/editor/latex/AutoComplete';
import { searchAllSymbols } from '../../lib/latex/symbols';
import type { AutoCompleteSuggestion } from '../../lib/latex/symbols';
import './LectureEditorPage.css';

// 简单的语法高亮函数
const highlightCode = (element: HTMLElement) => {
  const text = element.textContent || '';
  if (text.trim()) {
    // 保存当前光标位置
    const selection = window.getSelection();
    let range = null;
    let cursorOffset = 0;
    
    if (selection && selection.rangeCount > 0) {
      range = selection.getRangeAt(0);
      if (range.startContainer === element || element.contains(range.startContainer)) {
        // 计算光标在文本中的偏移量
        const tempRange = document.createRange();
        tempRange.setStart(element, 0);
        tempRange.setEnd(range.startContainer, range.startOffset);
        cursorOffset = tempRange.toString().length;
      }
    }
    
    // 获取当前语言类
    const currentClass = element.className;
    const languageMatch = currentClass.match(/language-(\w+)/);
    const language = languageMatch ? languageMatch[1] : 'text';
    
    // 应用语法高亮
    element.innerHTML = applySyntaxHighlighting(text, language);
    
    // 恢复光标位置
    if (range && cursorOffset >= 0) {
      try {
        const newRange = document.createRange();
        const walker = document.createTreeWalker(
          element,
          NodeFilter.SHOW_TEXT
        );
        
        let currentOffset = 0;
        let textNode = walker.nextNode();
        
        while (textNode && currentOffset + textNode.textContent!.length < cursorOffset) {
          currentOffset += textNode.textContent!.length;
          textNode = walker.nextNode();
        }
        
        if (textNode && selection) {
          const offsetInNode = Math.min(cursorOffset - currentOffset, textNode.textContent!.length);
          newRange.setStart(textNode, offsetInNode);
          newRange.setEnd(textNode, offsetInNode);
          selection.removeAllRanges();
          selection.addRange(newRange);
        }
      } catch (e) {
        // 如果恢复失败，将光标放在末尾
        if (selection) {
          const newRange = document.createRange();
          newRange.selectNodeContents(element);
          newRange.collapse(false);
          selection.removeAllRanges();
          selection.addRange(newRange);
        }
      }
    }
  }
};

// 应用语法高亮的函数
const applySyntaxHighlighting = (code: string, language: string): string => {
  // 转义HTML特殊字符
  const escapeHtml = (text: string) => {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  };

  let highlightedCode = escapeHtml(code);

  // 根据语言应用不同的高亮规则
  switch (language) {
    case 'javascript':
    case 'typescript':
      highlightedCode = highlightJavaScript(highlightedCode);
      break;
    case 'python':
      highlightedCode = highlightPython(highlightedCode);
      break;
    case 'html':
      highlightedCode = highlightHTML(highlightedCode);
      break;
    case 'css':
      highlightedCode = highlightCSS(highlightedCode);
      break;
    case 'json':
      highlightedCode = highlightJSON(highlightedCode);
      break;
    case 'sql':
      highlightedCode = highlightSQL(highlightedCode);
      break;
    case 'bash':
    case 'shell':
      highlightedCode = highlightBash(highlightedCode);
      break;
    default:
      // 默认情况下只转义HTML
      break;
  }

  return highlightedCode;
};

// JavaScript/TypeScript 高亮
const highlightJavaScript = (code: string): string => {
  let result = code;
  
  // 先处理注释
  result = result.replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="comment">$1</span>');
  result = result.replace(/(\/\/.*$)/gm, '<span class="comment">$1</span>');
  
  // 然后处理字符串
  result = result.replace(/(["'`])((?:\\.|(?!\1)[^\\])*?)\1/g, '<span class="string">$1$2$1</span>');
  
  // 处理关键字，只匹配不在HTML标签内的内容
  result = result.replace(/\b(const|let|var|function|if|else|for|while|return|class|import|export|from|async|await|try|catch|finally|throw|new|this|super|extends|implements|interface|type|enum|namespace|module|declare|public|private|protected|static|readonly|abstract|override|get|set)\b/g, (match, offset, string) => {
    // 检查是否在HTML标签内
    const beforeMatch = string.substring(0, offset);
    const openTags = (beforeMatch.match(/<[^>]*>/g) || []).length;
    const closeTags = (beforeMatch.match(/<\/[^>]*>/g) || []).length;
    return openTags > closeTags ? match : `<span class="keyword">${match}</span>`;
  });
  
  // 处理字面量
  result = result.replace(/\b(true|false|null|undefined)\b/g, (match, offset, string) => {
    const beforeMatch = string.substring(0, offset);
    const openTags = (beforeMatch.match(/<[^>]*>/g) || []).length;
    const closeTags = (beforeMatch.match(/<\/[^>]*>/g) || []).length;
    return openTags > closeTags ? match : `<span class="literal">${match}</span>`;
  });
  
  // 处理数字
  result = result.replace(/\b(\d+\.?\d*)\b/g, (match, offset, string) => {
    const beforeMatch = string.substring(0, offset);
    const openTags = (beforeMatch.match(/<[^>]*>/g) || []).length;
    const closeTags = (beforeMatch.match(/<\/[^>]*>/g) || []).length;
    return openTags > closeTags ? match : `<span class="number">${match}</span>`;
  });
  
  return result;
};

// Python 高亮
const highlightPython = (code: string): string => {
  let result = code;
  
  // 先处理注释
  result = result.replace(/(#.*$)/gm, '<span class="comment">$1</span>');
  
  // 然后处理字符串
  result = result.replace(/(["'`])((?:\\.|(?!\1)[^\\])*?)\1/g, '<span class="string">$1$2$1</span>');
  
  // 处理关键字
  result = result.replace(/\b(def|class|if|elif|else|for|while|try|except|finally|with|import|from|as|return|yield|lambda|and|or|not|in|is|None|True|False)\b/g, (match, offset, string) => {
    const beforeMatch = string.substring(0, offset);
    const openTags = (beforeMatch.match(/<[^>]*>/g) || []).length;
    const closeTags = (beforeMatch.match(/<\/[^>]*>/g) || []).length;
    return openTags > closeTags ? match : `<span class="keyword">${match}</span>`;
  });
  
  // 处理数字
  result = result.replace(/\b(\d+\.?\d*)\b/g, (match, offset, string) => {
    const beforeMatch = string.substring(0, offset);
    const openTags = (beforeMatch.match(/<[^>]*>/g) || []).length;
    const closeTags = (beforeMatch.match(/<\/[^>]*>/g) || []).length;
    return openTags > closeTags ? match : `<span class="number">${match}</span>`;
  });
  
  return result;
};

// HTML 高亮
const highlightHTML = (code: string): string => {
  return code
    // 先处理注释
    .replace(/(&lt;!--[\s\S]*?--&gt;)/g, '<span class="comment">$1</span>')
    // 然后处理属性值（字符串）
    .replace(/(\s[a-zA-Z-]+)(=)(["'][^"']*["'])/g, '$1<span class="attr">$2</span><span class="string">$3</span>')
    // 最后处理标签
    .replace(/(&lt;\/?)([a-zA-Z][a-zA-Z0-9]*)/g, '$1<span class="tag">$2</span>');
};

// CSS 高亮
const highlightCSS = (code: string): string => {
  return code
    // 先处理注释
    .replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="comment">$1</span>')
    // 然后处理属性值
    .replace(/([^:;{}]+)(;)/g, '<span class="value">$1</span><span class="punctuation">$2</span>')
    // 处理属性名
    .replace(/([a-zA-Z-]+)(\s*)(:)/g, '<span class="property">$1</span>$2<span class="punctuation">$3</span>')
    // 最后处理选择器
    .replace(/([.#]?[a-zA-Z-]+)(\s*)(\{)/g, '<span class="selector">$1</span>$2<span class="punctuation">$3</span>');
};

// JSON 高亮
const highlightJSON = (code: string): string => {
  return code
    // 先处理字符串（键值对中的值）
    .replace(/(["'][^"']*["'])/g, '<span class="string">$1</span>')
    // 然后处理键值对
    .replace(/(["'][^"']*["'])(\s*:)/g, '<span class="key">$1</span><span class="punctuation">$2</span>')
    // 处理字面量
    .replace(/\b(true|false|null)\b/g, '<span class="literal">$1</span>')
    // 最后处理数字
    .replace(/\b(\d+\.?\d*)\b/g, '<span class="number">$1</span>');
};

// SQL 高亮
const highlightSQL = (code: string): string => {
  return code
    // 先处理字符串
    .replace(/(["'`])((?:\\.|(?!\1)[^\\])*?)\1/g, '<span class="string">$1$2$1</span>')
    // 然后处理关键字
    .replace(/\b(SELECT|FROM|WHERE|INSERT|UPDATE|DELETE|CREATE|ALTER|DROP|TABLE|INDEX|VIEW|JOIN|LEFT|RIGHT|INNER|OUTER|ON|GROUP|BY|ORDER|HAVING|UNION|DISTINCT|LIMIT|OFFSET|AS|AND|OR|NOT|IN|EXISTS|BETWEEN|LIKE|IS|NULL)\b/gi, '<span class="keyword">$1</span>')
    // 最后处理数字
    .replace(/\b(\d+\.?\d*)\b/g, '<span class="number">$1</span>');
};

// Bash 高亮
const highlightBash = (code: string): string => {
  return code
    // 先处理注释
    .replace(/(#.*$)/gm, '<span class="comment">$1</span>')
    // 然后处理字符串
    .replace(/(["'`])((?:\\.|(?!\1)[^\\])*?)\1/g, '<span class="string">$1$2$1</span>')
    // 处理变量
    .replace(/\$[a-zA-Z_][a-zA-Z0-9_]*/g, '<span class="variable">$&</span>')
    // 最后处理关键字
    .replace(/\b(if|then|else|elif|fi|for|while|do|done|case|esac|function|return|export|local|readonly|declare|typeset|alias|unalias|cd|pwd|ls|cat|grep|sed|awk|find|grep|sort|uniq|head|tail|cut|paste|join|comm|diff|patch|tar|gzip|gunzip|zip|unzip|chmod|chown|chgrp|mkdir|rmdir|rm|cp|mv|ln|touch|stat|file|which|whereis|locate|updatedb|man|info|help|apropos|whatis|history|alias|unalias|set|unset|env|printenv|export|source|\.|exec|eval|trap|exit|break|continue|shift|getopts|read|echo|printf|test|\[|\[\[|\(|\(\(|\)|\)\)|&&|\|\|)\b/g, '<span class="keyword">$1</span>');
};

// 支持的语言列表
const SUPPORTED_LANGUAGES = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'cpp', label: 'C++' },
  { value: 'c', label: 'C' },
  { value: 'csharp', label: 'C#' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
  { value: 'sql', label: 'SQL' },
  { value: 'json', label: 'JSON' },
  { value: 'xml', label: 'XML' },
  { value: 'markdown', label: 'Markdown' },
  { value: 'bash', label: 'Bash' },
  { value: 'shell', label: 'Shell' },
  { value: 'php', label: 'PHP' },
  { value: 'ruby', label: 'Ruby' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
  { value: 'swift', label: 'Swift' },
  { value: 'kotlin', label: 'Kotlin' },
  { value: 'scala', label: 'Scala' },
  { value: 'r', label: 'R' },
  { value: 'matlab', label: 'MATLAB' },
  { value: 'plaintext', label: 'Plain Text' }
];

interface Lecture {
  _id: string;
  name: string;
  type: 'lecture';
  content: string;
  description?: string;
  tags?: string[];
  status: 'draft' | 'published' | 'modified';
  createdAt: string;
  updatedAt: string;
  owner: {
    _id: string;
    username: string;
    avatar?: string;
  };
  paperBankId?: string;
}

interface PaperBank {
  _id: string;
  name: string;
  description?: string;
  status: 'draft' | 'published';
  memberCount: number;
  userRole: 'owner' | 'editor' | 'viewer';
}

const LectureEditorPage: React.FC = () => {
  const navigate = useNavigate();
  const { id, paperBankId } = useParams<{ id?: string; paperBankId: string }>();
  const { confirmModal, closeConfirm, showErrorRightSlide, showSuccessRightSlide, rightSlideModal, closeRightSlide } = useModal();

  const [lecture, setLecture] = useState<Partial<Lecture>>({
    name: '',
    type: 'lecture',
    content: '',
    description: '',
    tags: [],
    status: 'draft'
  });

  // 试卷库相关状态
  const [paperBanks, setPaperBanks] = useState<PaperBank[]>([]);
  const [selectedPaperBankId, setSelectedPaperBankId] = useState<string>(paperBankId || '');
  const [loadingPaperBanks, setLoadingPaperBanks] = useState(false);
  const [tagInput, setTagInput] = useState('');

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  const [currentCodeBlock, setCurrentCodeBlock] = useState<HTMLElement | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showPaperBankSelector, setShowPaperBankSelector] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  const fullscreenEditorRef = useRef<HTMLDivElement>(null);

  // 自动补全相关状态
  const [showAutoComplete, setShowAutoComplete] = useState(false);
  const [autoCompleteSuggestions, setAutoCompleteSuggestions] = useState<AutoCompleteSuggestion[]>([]);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(0);
  const [autoCompletePosition, setAutoCompletePosition] = useState({ x: 0, y: 0 });
  const [cursorPosition, setCursorPosition] = useState(0);
  const autoCompleteRef = useRef<HTMLDivElement>(null);

  // 移除分页状态，使用单页编辑

  // 空内容，确保至少有一个p标签
  const sampleContent = '<p><br></p>';

  // 移除分页相关的高度检测逻辑


  useEffect(() => {
    loadPaperBanks();
    if (id) {
      // 编辑现有讲义
      loadLecture();
    } else {
      // 创建新讲义，使用空内容
      setLecture(prev => ({
        ...prev,
        content: sampleContent,
        name: ''
      }));
    }
  }, [id]);

  // 初始化编辑器内容
  useEffect(() => {
    if (editorRef.current && lecture.content !== undefined) {
      // 只在内容真正改变时才更新DOM
      const currentContent = editorRef.current.innerHTML;
      const newContent = lecture.content || '<p><br></p>';
      
      if (currentContent !== newContent) {
        editorRef.current.innerHTML = newContent;
        // 处理LaTeX内容
        processEditorContent(editorRef.current);
      }
    }
  }, [lecture.content]);

  // 初始化LaTeX处理
  useEffect(() => {
    if (editorRef.current) {
      setupLatexHandling(editorRef.current);
    }
  }, []);

  // 为全屏编辑器初始化LaTeX处理
  useEffect(() => {
    if (isFullscreen && fullscreenEditorRef.current) {
      // 延迟一点时间确保DOM完全渲染
      setTimeout(() => {
        if (fullscreenEditorRef.current) {
          // 清理可能存在的旧监听器，然后设置新的
          setupLatexHandling(fullscreenEditorRef.current);
        }
      }, 100);
    }
    // 清理函数：当退出全屏时清理事件监听器
    return () => {
      if (!isFullscreen && fullscreenEditorRef.current) {
        // 这里可以添加清理逻辑，但由于setupLatexHandling现在是直接添加监听器
        // 我们依赖浏览器的垃圾回收来清理
      }
    };
  }, [isFullscreen]);

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

  // 加载试卷库列表
  const loadPaperBanks = async () => {
    setLoadingPaperBanks(true);
    try {
      const response = await paperBankAPI.getPaperBanks();
      if (response.data.success) {
        const banks = response.data.data.paperBanks;
        setPaperBanks(banks);
        // 如果URL中有paperBankId，设置为选中状态
        if (paperBankId && banks.find(bank => bank._id === paperBankId)) {
          setSelectedPaperBankId(paperBankId);
        } else if (banks.length > 0) {
          // 否则选择第一个试卷库
          setSelectedPaperBankId(banks[0]._id);
        }
      } else {
        throw new Error('加载试卷库失败');
      }
    } catch (error) {
      console.error('加载试卷库失败:', error);
      showErrorRightSlide('加载失败', '加载试卷库失败');
    } finally {
      setLoadingPaperBanks(false);
    }
  };

  const loadLecture = async () => {
    setLoading(true);
    try {
      const response = await paperAPI.getPaper(id!);
      if (response.data.success) {
        const paperData = response.data.data;
        setLecture({
          _id: paperData._id,
          name: paperData.name,
          type: paperData.type,
          content: paperData.content || sampleContent,
          description: paperData.description,
          tags: paperData.tags || [],
          status: paperData.status,
          createdAt: paperData.createdAt,
          updatedAt: paperData.updatedAt,
          owner: paperData.owner,
          paperBankId: paperData.libraryId
        });
        setSelectedPaperBankId(paperData.libraryId);
      } else {
        throw new Error('加载失败');
      }
    } catch (error) {
      console.error('加载讲义失败:', error);
      showErrorRightSlide('加载失败', '加载讲义失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!lecture.name?.trim()) {
      showErrorRightSlide('保存失败', '请输入讲义标题');
      return;
    }

    if (!selectedPaperBankId) {
      showErrorRightSlide('保存失败', '请选择试卷库');
      return;
    }

    setSaving(true);
    try {
      if (id) {
        // 更新现有讲义
        const response = await paperAPI.updatePaper(id, {
          name: lecture.name,
          content: lecture.content,
          description: lecture.description,
          tags: lecture.tags,
          status: 'draft'
        });
        
        if (response.data.success) {
          showSuccessRightSlide('保存成功', '讲义已保存');
          setLecture(prev => ({
            ...prev,
            updatedAt: new Date().toISOString()
          }));
        } else {
          throw new Error('更新失败');
        }
      } else {
        // 创建新讲义
        const response = await paperAPI.createPaper({
          name: lecture.name,
          type: 'lecture',
          paperBankId: selectedPaperBankId,
          content: lecture.content,
          description: lecture.description,
          tags: lecture.tags,
          status: 'draft'
        });
        
        if (response.data.success) {
          showSuccessRightSlide('创建成功', '讲义已创建并保存');
          // 更新URL为编辑模式
          navigate(`/paper-banks/${selectedPaperBankId}/lectures/${response.data.data._id}/edit`, { replace: true });
        } else {
          throw new Error('创建失败');
        }
      }
    } catch (error: any) {
      console.error('保存讲义失败:', error);
      showErrorRightSlide('保存失败', error.response?.data?.error || '保存讲义失败');
    } finally {
      setSaving(false);
    }
  };


  // 防抖定时器
  const highlightTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 清理定时器
  useEffect(() => {
    return () => {
      if (highlightTimeoutRef.current) {
        clearTimeout(highlightTimeoutRef.current);
      }
    };
  }, []);

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
    const currentEditor = isFullscreen ? fullscreenEditorRef.current : editorRef.current;
    if (currentEditor) {
      const editorRect = currentEditor.getBoundingClientRect();
      
      // 获取编辑器样式
      const computedStyle = getComputedStyle(currentEditor);
      const lineHeight = parseFloat(computedStyle.lineHeight) || 20;
      const paddingTop = parseFloat(computedStyle.paddingTop) || 0;
      const paddingLeft = parseFloat(computedStyle.paddingLeft) || 0;
      
      // 计算光标位置
      const textBeforeCursor = (lecture.content || '').substring(0, position);
      const logicalLines = textBeforeCursor.split('\n');
      const currentLogicalLine = logicalLines[logicalLines.length - 1];
      const logicalLineIndex = logicalLines.length - 1;
      
      // 计算最终的视觉行索引
      const visualLineIndex = logicalLineIndex;
      
      // 计算光标在编辑器中的位置
      const cursorX = paddingLeft + (currentLogicalLine.length * (parseFloat(computedStyle.fontSize) * 0.6));
      const cursorY = paddingTop + (visualLineIndex * lineHeight);
      
      // 考虑编辑器的滚动位置
      const scrollTop = currentEditor.scrollTop;
      const scrollLeft = currentEditor.scrollLeft;
      
      // 计算绝对位置（相对于视口）
      const x = editorRect.left + cursorX - scrollLeft;
      const y = editorRect.top + cursorY - scrollTop + 5; // 在光标下方5px显示
      
      setAutoCompletePosition({ x, y });
    }
  };

  // 处理自动补全选择
  const handleAutoComplete = (suggestion: AutoCompleteSuggestion) => {
    const currentEditor = isFullscreen ? fullscreenEditorRef.current : editorRef.current;
    if (currentEditor) {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const textContent = currentEditor.textContent || '';
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
          
          // 在编辑器中，我们需要找到并替换选中的文本
          const walker = document.createTreeWalker(
            currentEditor,
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
            handleContentChange(currentEditor.innerHTML);
            setShowAutoComplete(false);
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

  // 全屏切换功能
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // 同步编辑器内容
  useEffect(() => {
    if (isFullscreen && fullscreenEditorRef.current && editorRef.current) {
      // 进入全屏时，同步内容到全屏编辑器
      fullscreenEditorRef.current.innerHTML = editorRef.current.innerHTML;
      // 渲染LaTeX内容
      setTimeout(() => {
        if (fullscreenEditorRef.current) {
          renderAllLatex(fullscreenEditorRef.current);
        }
      }, 50);
    } else if (!isFullscreen && editorRef.current && fullscreenEditorRef.current) {
      // 退出全屏时，同步内容到普通编辑器
      editorRef.current.innerHTML = fullscreenEditorRef.current.innerHTML;
      // 渲染LaTeX内容
      setTimeout(() => {
        if (editorRef.current) {
          renderAllLatex(editorRef.current);
        }
      }, 50);
    }
  }, [isFullscreen]);

  // 移除分页相关函数

  const handleContentChange = (content: string) => {
    // 确保内容始终至少有一个p标签
    let safeContent = content;
    const currentEditor = isFullscreen ? fullscreenEditorRef.current : editorRef.current;
    const otherEditor = isFullscreen ? editorRef.current : fullscreenEditorRef.current;
    
    if (currentEditor) {
      const pTags = currentEditor.querySelectorAll('p');
      if (pTags.length === 0) {
        // 如果没有p标签，添加一个
        safeContent = '<p><br></p>';
        currentEditor.innerHTML = safeContent;
      }
    }
    
    // 同步内容到另一个编辑器
    if (otherEditor) {
      otherEditor.innerHTML = safeContent;
    }
    
    setLecture(prev => ({
      ...prev,
      content: safeContent
    }));

    // 更新光标位置并检查自动补全
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0 && currentEditor) {
      const range = selection.getRangeAt(0);
      const textContent = currentEditor.textContent || '';
      
      // 计算光标在文本中的位置
      let cursorPos = 0;
      const walker = document.createTreeWalker(
        currentEditor,
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
    
    // 清除之前的定时器
    if (highlightTimeoutRef.current) {
      clearTimeout(highlightTimeoutRef.current);
    }
    
    // 延迟执行语法高亮，避免在用户输入时频繁触发
    highlightTimeoutRef.current = setTimeout(() => {
      if (currentEditor) {
        const codeBlocks = currentEditor.querySelectorAll('code[class*="language-"]');
        codeBlocks.forEach(block => {
          // 检查光标是否在代码块内
          const selection = window.getSelection();
          if (selection && selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            const isInCodeBlock = block.contains(range.startContainer) || block === range.startContainer;
            
            // 如果光标在代码块内，不进行语法高亮，避免干扰用户输入
            if (isInCodeBlock) {
              return;
            }
          }
          
          highlightCode(block as HTMLElement);
        });
      }
    }, 500); // 500ms延迟
  };

  // 处理代码块语言选择
  const handleLanguageSelect = (language: string) => {
    if (currentCodeBlock) {
      const codeElement = currentCodeBlock.querySelector('code');
      const languageButton = currentCodeBlock.querySelector('.code-language-selector');
      if (codeElement) {
        codeElement.className = `language-${language}`;
        // 更新语言按钮显示文本
        if (languageButton) {
          const languageInfo = SUPPORTED_LANGUAGES.find(lang => lang.value === language);
          languageButton.innerHTML = languageInfo ? languageInfo.label.substring(0, 2).toUpperCase() : language.substring(0, 2).toUpperCase();
        }
        // 触发语法高亮
        highlightCode(codeElement);
        handleContentChange(editorRef.current?.innerHTML || '');
      }
    }
    setShowLanguageSelector(false);
    setCurrentCodeBlock(null);
  };

  // 显示语言选择器
  const showLanguageSelectorForCodeBlock = (codeBlock: HTMLElement) => {
    setCurrentCodeBlock(codeBlock);
    setShowLanguageSelector(true);
  };

  // 添加标签
  const addTag = () => {
    const tag = tagInput.trim();
    if (tag && !lecture.tags?.includes(tag)) {
      setLecture(prev => ({
        ...prev,
        tags: [...(prev.tags || []), tag]
      }));
      setTagInput('');
    }
  };

  // 删除标签
  const removeTag = (tagToRemove: string) => {
    setLecture(prev => ({
      ...prev,
      tags: prev.tags?.filter(tag => tag !== tagToRemove) || []
    }));
  };

  // 处理标签输入框回车
  const handleTagInputKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

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
        
        const url = prompt('请输入链接地址:');
        if (url) {
          document.execCommand('createLink', false, url);
          handleContentChange(editorRef.current.innerHTML);
        }
      } else if (command === 'insertUnorderedList') {
        // 检查是否已经在列表中
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          let element: Node | null = range.commonAncestorContainer;
          
          // 找到最近的li元素
          while (element && element !== editorRef.current) {
            if (element.nodeType === 1 && (element as HTMLElement).tagName === 'LI') {
              break;
            }
            element = element.parentElement || (element.parentNode as HTMLElement);
          }
          
          if (element && (element as HTMLElement).tagName === 'LI') {
            // 如果光标在空的列表项中，退出列表
            if (element.textContent?.trim() === '' || (element as HTMLElement).innerHTML === '<br>') {
              const ul = element.parentElement;
              if (ul && ul.tagName === 'UL') {
                const p = document.createElement('p');
                p.innerHTML = '<br>';
                ul.parentNode?.insertBefore(p, ul.nextSibling);
                ul.removeChild(element);
                if (ul.children.length === 0) {
                  ul.parentNode?.removeChild(ul);
                }
                // 将光标移到新段落
                const newRange = document.createRange();
                newRange.selectNodeContents(p);
                newRange.collapse(true);
                selection.removeAllRanges();
                selection.addRange(newRange);
              }
            } else {
              // 正常创建无序列表
              document.execCommand('insertUnorderedList', false);
            }
          } else {
            // 创建新的无序列表
            document.execCommand('insertUnorderedList', false);
          }
        }
        handleContentChange(editorRef.current.innerHTML);
      } else if (command === 'insertOrderedList') {
        // 检查是否已经在列表中
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          let element: Node | null = range.commonAncestorContainer;
          
          // 找到最近的li元素
          while (element && element !== editorRef.current) {
            if (element.nodeType === 1 && (element as HTMLElement).tagName === 'LI') {
              break;
            }
            element = element.parentElement || (element.parentNode as HTMLElement);
          }
          
          if (element && (element as HTMLElement).tagName === 'LI') {
            // 如果光标在空的列表项中，退出列表
            if (element.textContent?.trim() === '' || (element as HTMLElement).innerHTML === '<br>') {
              const ol = element.parentElement;
              if (ol && ol.tagName === 'OL') {
                const p = document.createElement('p');
                p.innerHTML = '<br>';
                ol.parentNode?.insertBefore(p, ol.nextSibling);
                ol.removeChild(element);
                if (ol.children.length === 0) {
                  ol.parentNode?.removeChild(ol);
                }
                // 将光标移到新段落
                const newRange = document.createRange();
                newRange.selectNodeContents(p);
                newRange.collapse(true);
                selection.removeAllRanges();
                selection.addRange(newRange);
              }
            } else {
              // 正常创建有序列表
              document.execCommand('insertOrderedList', false);
            }
          } else {
            // 创建新的有序列表
            document.execCommand('insertOrderedList', false);
          }
        }
        handleContentChange(editorRef.current.innerHTML);
      } else if (command === 'formatBlock' && value === 'blockquote') {
        // 处理引用块
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          
          if (!range.collapsed) {
            // 如果有选中内容，只对选中内容创建引用
            const selectedContent = range.extractContents();
            const blockquote = document.createElement('blockquote');
            blockquote.appendChild(selectedContent);
            range.insertNode(blockquote);
            
            // 在引用后添加新段落
            const newP = document.createElement('p');
            newP.innerHTML = '<br>';
            blockquote.parentNode?.insertBefore(newP, blockquote.nextSibling);
            
            range.collapse(false);
            selection.removeAllRanges();
            selection.addRange(range);
          } else {
            // 如果没有选中内容，对当前段落创建引用
            const container = range.commonAncestorContainer;
            let element: HTMLElement | null = container.nodeType === 3 ? container.parentElement : container as HTMLElement;
            
            // 找到包含的块级元素
            while (element && element !== editorRef.current) {
              if (['P', 'DIV', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6'].includes(element.tagName)) {
                break;
              }
              element = element.parentElement || (element.parentNode as HTMLElement);
            }
            
            if (element && element.tagName !== 'BLOCKQUOTE') {
              const blockquote = document.createElement('blockquote');
              element.parentNode?.insertBefore(blockquote, element);
              blockquote.appendChild(element);
              
              // 在引用后添加新段落
              const newP = document.createElement('p');
              newP.innerHTML = '<br>';
              blockquote.parentNode?.insertBefore(newP, blockquote.nextSibling);
            }
          }
          handleContentChange(editorRef.current.innerHTML);
        }
      } else if (command === 'formatBlock' && value === 'pre') {
        // 处理代码块 - 添加语言选择
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          
          if (!range.collapsed) {
            // 如果有选中内容，只对选中内容创建代码块
            const selectedContent = range.extractContents();
            const pre = document.createElement('pre');
            const code = document.createElement('code');
            code.className = 'language-javascript'; // 默认语言
            code.appendChild(selectedContent);
            pre.appendChild(code);
            
            // 添加语言选择按钮
            const languageButton = document.createElement('button');
            languageButton.innerHTML = 'JS';
            languageButton.className = 'code-language-selector';
            languageButton.onclick = (e) => {
              e.preventDefault();
              e.stopPropagation();
              showLanguageSelectorForCodeBlock(pre);
            };
            pre.appendChild(languageButton);
            
            range.insertNode(pre);
            
            // 在代码块下方添加新段落，让用户能退出代码块
            const newP = document.createElement('p');
            newP.innerHTML = '<br>';
            pre.parentNode?.insertBefore(newP, pre.nextSibling);
            
            // 触发语法高亮（创建时立即高亮）
            setTimeout(() => {
              highlightCode(code);
            }, 100);
            
            // 将光标保持在代码块内
            const codeRange = document.createRange();
            codeRange.selectNodeContents(code);
            codeRange.collapse(false);
            selection.removeAllRanges();
            selection.addRange(codeRange);
          } else {
            // 如果没有选中内容，对当前段落创建代码块
            const container = range.commonAncestorContainer;
            let element: HTMLElement | null = container.nodeType === 3 ? container.parentElement : container as HTMLElement;
            
            // 找到包含的块级元素
            while (element && element !== editorRef.current) {
              if (['P', 'DIV', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6'].includes(element.tagName)) {
                break;
              }
              element = element.parentElement || (element.parentNode as HTMLElement);
            }
            
            if (element && element.tagName !== 'PRE') {
              const pre = document.createElement('pre');
              const code = document.createElement('code');
              code.className = 'language-javascript'; // 默认语言
              code.innerHTML = element.innerHTML;
              pre.appendChild(code);
              
              // 添加语言选择按钮
              const languageButton = document.createElement('button');
              languageButton.innerHTML = 'JS';
              languageButton.className = 'code-language-selector';
              languageButton.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                showLanguageSelectorForCodeBlock(pre);
              };
              pre.appendChild(languageButton);
              
              element.parentNode?.insertBefore(pre, element);
              element.parentNode?.removeChild(element);
              
              // 在代码块下方添加新段落，让用户能退出代码块
              const newP = document.createElement('p');
              newP.innerHTML = '<br>';
              pre.parentNode?.insertBefore(newP, pre.nextSibling);
              
              // 触发语法高亮（创建时立即高亮）
              setTimeout(() => {
                highlightCode(code);
              }, 100);
              
              // 将光标保持在代码块内
              const codeRange = document.createRange();
              codeRange.selectNodeContents(code);
              codeRange.collapse(false);
              const selection = window.getSelection();
              if (selection) {
                selection.removeAllRanges();
                selection.addRange(codeRange);
              }
            }
          }
          handleContentChange(editorRef.current.innerHTML);
        }
      } else if (command === 'insertMath') {
        // 插入LaTeX块级公式
        if (editorRef.current) {
          insertLatex(editorRef.current, '\\LaTeX', true);
          handleContentChange(editorRef.current.innerHTML);
        }
      } else {
        // 使用标准的execCommand
        document.execCommand(command, false, value);
        handleContentChange(editorRef.current.innerHTML);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* 顶部导航栏 */}
      <div className="sticky top-0 z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* 左侧：返回按钮和标题 */}
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => navigate(`/paper-banks/${paperBankId || selectedPaperBankId}`)}
                variant="ghost"
                className="p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all duration-200"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 dark:from-blue-400 dark:via-purple-400 dark:to-indigo-400 bg-clip-text text-transparent">
                  {id ? '编辑讲义' : '创建讲义'}
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {id ? '修改现有讲义内容' : '创建新的讲义内容'}
                </p>
              </div>
            </div>
            
            {/* 右侧：保存按钮 */}
            <div className="flex items-center space-x-3">
              <Button
                onClick={handleSave}
                disabled={saving}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? '保存中...' : '保存'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 主要内容区域 */}
      <div className={`max-w-7xl mx-auto px-6 py-8 ${isFullscreen ? 'hidden' : ''}`}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          {/* 讲义信息卡片 */}
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 试卷库选择 */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center space-x-2">
                  <BookOpen className="w-4 h-4" />
                  <span>试卷库</span>
                </label>
                <select
                  value={selectedPaperBankId}
                  onChange={(e) => setSelectedPaperBankId(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  disabled={loadingPaperBanks}
                >
                  {loadingPaperBanks ? (
                    <option>加载中...</option>
                  ) : (
                    paperBanks.map((bank) => (
                      <option key={bank._id} value={bank._id}>
                        {bank.name}
                      </option>
                    ))
                  )}
                </select>
              </div>
              
              {/* 讲义标题输入 */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center space-x-2">
                  <FileText className="w-4 h-4" />
                  <span>讲义标题</span>
                </label>
                <Input
                  value={lecture.name || ''}
                  onChange={(e) => setLecture(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="请输入讲义标题..."
                  className="w-full px-4 py-3 rounded-xl border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>
            </div>
            
            {/* 标签输入区域 */}
            <div className="mt-6 space-y-3">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center space-x-2">
                <Tag className="w-4 h-4" />
                <span>标签</span>
              </label>
              
              {/* 标签输入框 */}
              <div className="flex items-center space-x-3">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={handleTagInputKeyPress}
                  placeholder="输入标签并按回车添加..."
                  className="flex-1 px-4 py-3 rounded-xl border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
                <Button
                  onClick={addTag}
                  size="sm"
                  variant="outline"
                  className="px-4 py-3 rounded-xl border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              
              {/* 已添加的标签 */}
              {lecture.tags && lecture.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {lecture.tags.map((tag, index) => (
                    <motion.span
                      key={index}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 text-blue-800 dark:text-blue-300 rounded-full text-sm font-medium shadow-sm hover:shadow-md transition-all duration-200"
                    >
                      <span>{tag}</span>
                      <button
                        onClick={() => removeTag(tag)}
                        className="ml-1 hover:bg-blue-200 dark:hover:bg-blue-800/50 rounded-full p-1 transition-all duration-200"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </motion.span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* A4纸模拟编辑器区域 */}
          <div className="flex gap-6 justify-center">
            {/* 左侧工具栏 */}
            <div className="w-16 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-4 relative z-50">
              <WYSIWYGToolbar 
                onFormat={handleFormat}
                disabled={false}
                vertical={true}
              />
              {/* 全屏按钮 */}
              <div className="mt-4 flex justify-center">
                <button
                  onClick={toggleFullscreen}
                  className="p-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  title="全屏编辑"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                  </svg>
                </button>
              </div>
            </div>
            
            {/* A4纸容器 - 单页编辑 */}
            <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-6 relative z-10">
              {/* 单页A4纸容器 */}
              <div className="flex justify-center max-h-[80vh] overflow-y-auto">
                <div 
                  className="a4-paper dark:dark"
                  style={{
                    width: '210mm', // A4宽度
                    minHeight: '297mm', // 保持最小高度
                    maxWidth: '100%',
                    position: 'relative'
                  }}
                >
                  {/* 页面边距模拟 - 只保留左右边距 */}
                  <div className="a4-margins">
                    {/* 编辑器内容区域 */}
                    <div 
                      className="lecture-editor-content dark:dark"
                      style={{
                        minHeight: '297mm', // 保持最小高度
                        width: 'calc(210mm - 40mm)', // A4宽度减去左右边距
                        margin: '0 auto', // 只保留左右边距
                        padding: '20px 0', // 添加上下内边距
                      }}
                    >
                      <div
                        ref={editorRef}
                        contentEditable
                        className="outline-none focus:outline-none w-full h-full"
                        style={{
                          minHeight: '297mm', // 保持最小高度
                          width: '100%',
                          padding: '0',
                          margin: '0'
                        }}
                        onInput={(e) => {
                          const target = e.target as HTMLDivElement;
                          handleContentChange(target.innerHTML);
                        }}
                              onBlur={() => {
                                // 失去焦点时渲染所有LaTeX
                                if (editorRef.current) {
                                  renderAllLatex(editorRef.current);
                                }
                              }}
                              onKeyDown={(e) => {
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

                        // 处理Delete键逻辑 - 防止删除最后一个p标签
                        if (e.key === 'Delete' || e.key === 'Backspace') {
                          // 检查是否只剩下一个空的p标签
                          if (editorRef.current) {
                            const pTags = editorRef.current.querySelectorAll('p');
                            const nonEmptyPTags = Array.from(pTags).filter(p => {
                              const text = p.textContent?.trim() || '';
                              const html = p.innerHTML.trim();
                              return text !== '' && html !== '<br>' && html !== '';
                            });
                            
                            // 如果只有一个p标签且为空，阻止删除
                            if (pTags.length === 1 && nonEmptyPTags.length === 0) {
                              e.preventDefault();
                              return;
                            }
                            
                            // 如果全选删除后会导致没有p标签，也阻止删除
                            const selection = window.getSelection();
                            if (selection && selection.rangeCount > 0) {
                              const range = selection.getRangeAt(0);
                              const selectedContent = range.toString();
                              const allContent = editorRef.current.textContent || '';
                              
                              // 如果选中的内容等于全部内容，阻止删除
                              if (selectedContent === allContent && pTags.length <= 1) {
                                e.preventDefault();
                                return;
                              }
                            }
                          }
                        }

                        // 处理Delete键逻辑 - 删除空代码块
                        if (e.key === 'Delete' || e.key === 'Backspace') {
                          const selection = window.getSelection();
                          if (selection && selection.rangeCount > 0) {
                            const range = selection.getRangeAt(0);
                            let element: Node | null = range.commonAncestorContainer;
                            
                            // 检查是否在代码块中
                            while (element && element !== editorRef.current) {
                              if (element.nodeType === 1) {
                                const htmlElement = element as HTMLElement;
                                const tagName = htmlElement.tagName;
                                if (tagName === 'PRE') {
                                  // 检查代码块是否为空
                                  const codeElement = htmlElement.querySelector('code');
                                  if (codeElement && (!codeElement.textContent || codeElement.textContent.trim() === '')) {
                                    e.preventDefault();
                                    // 删除整个代码块
                                    const p = document.createElement('p');
                                    p.innerHTML = '<br>';
                                    htmlElement.parentNode?.insertBefore(p, htmlElement);
                                    htmlElement.remove();
                                    // 将光标移到新段落
                                    const newRange = document.createRange();
                                    newRange.selectNodeContents(p);
                                    newRange.collapse(true);
                                    selection.removeAllRanges();
                                    selection.addRange(newRange);
                                    if (editorRef.current) {
                                      handleContentChange(editorRef.current.innerHTML);
                                    }
                                    return;
                                  }
                                }
                              }
                              element = element.parentElement || (element.parentNode as HTMLElement);
                            }
                          }
                        }

                        // 处理回车键逻辑
                        if (e.key === 'Enter') {
                          const selection = window.getSelection();
                          if (selection && selection.rangeCount > 0) {
                            const range = selection.getRangeAt(0);
                            let element: Node | null = range.commonAncestorContainer;
                            
                            // 检查是否在代码块中
                            while (element && element !== editorRef.current) {
                              if (element.nodeType === 1) {
                                const tagName = (element as HTMLElement).tagName;
                                if (tagName === 'PRE' || tagName === 'CODE') {
                                  // 在代码块中，允许正常的换行，不阻止默认行为
                                  // 确保光标在代码块内正确换行
                                  if (tagName === 'CODE') {
                                    // 在code标签内，直接允许换行
                                    return;
                                  } else if (tagName === 'PRE') {
                                    // 在pre标签内，也允许换行
                                    return;
                                  }
                                }
                              }
                              element = element.parentElement || (element.parentNode as HTMLElement);
                            }
                            
                            // 如果不在代码块中，检查是否需要创建新段落
                            // 这里添加正常的段落创建逻辑
                            
                            // 检查是否在列表项中
                            element = range.commonAncestorContainer;
                            while (element && element !== editorRef.current) {
                              if (element.nodeType === 1 && (element as HTMLElement).tagName === 'LI') {
                                break;
                              }
                              element = element.parentElement || (element.parentNode as HTMLElement);
                            }
                            
                            if (element && (element as HTMLElement).tagName === 'LI') {
                              // 如果光标在空的列表项中，退出列表
                              if (element.textContent?.trim() === '' || (element as HTMLElement).innerHTML === '<br>') {
                                e.preventDefault();
                                const list = element.parentElement;
                                if (list && (list.tagName === 'UL' || list.tagName === 'OL')) {
                                  const p = document.createElement('p');
                                  p.innerHTML = '<br>';
                                  list.parentNode?.insertBefore(p, list.nextSibling);
                                  list.removeChild(element);
                                  if (list.children.length === 0) {
                                    list.parentNode?.removeChild(list);
                                  }
                                  // 将光标移到新段落
                                  const newRange = document.createRange();
                                  newRange.selectNodeContents(p);
                                  newRange.collapse(true);
                                  selection.removeAllRanges();
                                  selection.addRange(newRange);
                                  if (editorRef.current) {
                                    handleContentChange(editorRef.current.innerHTML);
                                  }
                                }
                              }
                            }
                          }
                        }

                        // 处理基本的Ctrl/Cmd快捷键
                        if (e.ctrlKey || e.metaKey) {
                          switch (e.key) {
                            case 'b':
                              e.preventDefault();
                              document.execCommand('bold');
                              handleContentChange(editorRef.current?.innerHTML || '');
                              break;
                            case 'i':
                              e.preventDefault();
                              document.execCommand('italic');
                              handleContentChange(editorRef.current?.innerHTML || '');
                              break;
                            case 'u':
                              e.preventDefault();
                              document.execCommand('underline');
                              handleContentChange(editorRef.current?.innerHTML || '');
                              break;
                            case '1':
                              e.preventDefault();
                              document.execCommand('formatBlock', false, 'h1');
                              handleContentChange(editorRef.current?.innerHTML || '');
                              break;
                            case '2':
                              e.preventDefault();
                              document.execCommand('formatBlock', false, 'h2');
                              handleContentChange(editorRef.current?.innerHTML || '');
                              break;
                            case '3':
                              e.preventDefault();
                              document.execCommand('formatBlock', false, 'h3');
                              handleContentChange(editorRef.current?.innerHTML || '');
                              break;
                            case '4':
                              e.preventDefault();
                              document.execCommand('formatBlock', false, 'h4');
                              handleContentChange(editorRef.current?.innerHTML || '');
                              break;
                            case '5':
                              e.preventDefault();
                              document.execCommand('formatBlock', false, 'h5');
                              handleContentChange(editorRef.current?.innerHTML || '');
                              break;
                            case '6':
                              e.preventDefault();
                              document.execCommand('formatBlock', false, 'h6');
                              handleContentChange(editorRef.current?.innerHTML || '');
                              break;
                            case '0':
                              e.preventDefault();
                              document.execCommand('formatBlock', false, 'p');
                              handleContentChange(editorRef.current?.innerHTML || '');
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
                              
                              // 这里可以添加链接创建逻辑
                              break;
                            case 's':
                              e.preventDefault();
                              document.execCommand('strikeThrough');
                              handleContentChange(editorRef.current?.innerHTML || '');
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
                              handleContentChange(editorRef.current?.innerHTML || '');
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
                              handleContentChange(editorRef.current?.innerHTML || '');
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
                                  handleContentChange(editorRef.current?.innerHTML || '');
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
                                  code.className = 'language-javascript';
                                  code.textContent = selectedText;
                                  pre.appendChild(code);
                                  
                                  // 添加语言选择按钮
                                  const languageButton = document.createElement('button');
                                  languageButton.innerHTML = 'JS';
                                  languageButton.className = 'code-language-selector';
                                  languageButton.onclick = (e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    showLanguageSelectorForCodeBlock(pre);
                                  };
                                  pre.appendChild(languageButton);
                                  
                                  range.deleteContents();
                                  range.insertNode(pre);
                                  
                                  // 在代码块下方添加新段落，让用户能退出代码块
                                  const newP = document.createElement('p');
                                  newP.innerHTML = '<br>';
                                  pre.parentNode?.insertBefore(newP, pre.nextSibling);
                                  
                                  // 触发语法高亮（创建时立即高亮）
                                  setTimeout(() => {
                                    highlightCode(code);
                                  }, 100);
                                  
                                  // 将光标保持在代码块内
                                  const codeRange = document.createRange();
                                  codeRange.selectNodeContents(code);
                                  codeRange.collapse(false);
                                  const selection = window.getSelection();
                                  if (selection) {
                                    selection.removeAllRanges();
                                    selection.addRange(codeRange);
                                  }
                                  
                                  handleContentChange(editorRef.current?.innerHTML || '');
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
                                    code.className = 'language-javascript';
                                    code.innerHTML = element.innerHTML;
                                    pre.appendChild(code);
                                    
                                    // 添加语言选择按钮
                                    const languageButton = document.createElement('button');
                                    languageButton.innerHTML = 'JS';
                                    languageButton.className = 'code-language-selector';
                                    languageButton.onclick = (e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      showLanguageSelectorForCodeBlock(pre);
                                    };
                                    pre.appendChild(languageButton);
                                    
                                    element.parentNode?.insertBefore(pre, element);
                                    element.parentNode?.removeChild(element);
                                    
                                    // 在代码块下方添加新段落，让用户能退出代码块
                                    const newP = document.createElement('p');
                                    newP.innerHTML = '<br>';
                                    pre.parentNode?.insertBefore(newP, pre.nextSibling);
                                    
                                    // 触发语法高亮（创建时立即高亮）
                                    setTimeout(() => {
                                      highlightCode(code);
                                    }, 100);
                                    
                                    // 将光标保持在代码块内
                                    const codeRange = document.createRange();
                                    codeRange.selectNodeContents(code);
                                    codeRange.collapse(false);
                                    const selection = window.getSelection();
                                    if (selection) {
                                      selection.removeAllRanges();
                                      selection.addRange(codeRange);
                                    }
                                    
                                    handleContentChange(editorRef.current?.innerHTML || '');
                                  }
                                }
                              }
                              break;
                            case 'm':
                              // 插入LaTeX块级公式
                              e.preventDefault();
                              if (editorRef.current) {
                                insertLatex(editorRef.current, '\\LaTeX', true);
                                handleContentChange(editorRef.current.innerHTML);
                              }
                              break;
                          }
                        }
                      }}
                      suppressContentEditableWarning={true}
                      data-placeholder="开始编写讲义内容...支持 Markdown 和 LaTeX 语法"
                    />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* 全屏模式编辑器 */}
      {isFullscreen && (
        <motion.div 
          className="fixed inset-0 z-[9999] bg-white dark:bg-gray-900 flex flex-col"
          initial={{ 
            opacity: 0, 
            scale: 0.9
          }}
          animate={{ 
            opacity: 1, 
            scale: 1
          }}
          exit={{ 
            opacity: 0, 
            scale: 0.9
          }}
          transition={{ 
            duration: 0.3, 
            ease: [0.23, 1, 0.32, 1]
          }}
        >
          {/* 全屏工具栏 */}
          <div className="flex justify-between items-center p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-4">
              <WYSIWYGToolbar 
                onFormat={handleFormat}
                disabled={false}
                vertical={false}
              />
            </div>
            
            <div className="flex items-center space-x-4">
              {/* 保存按钮 */}
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors flex items-center space-x-2"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>保存中...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                    </svg>
                    <span>保存</span>
                  </>
                )}
              </button>
              
              {/* 切换题库按钮 */}
              <button
                onClick={() => setShowPaperBankSelector(true)}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <span>切换题库</span>
              </button>
              
              {/* 退出全屏按钮 */}
              <button
                onClick={toggleFullscreen}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span>退出全屏</span>
              </button>
            </div>
          </div>
          
          {/* 全屏编辑器内容 */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="flex justify-center">
              <div 
                className="a4-paper dark:dark"
                style={{
                  width: '210mm', // A4标准宽度
                  minHeight: '297mm', // 保持最小高度
                  maxWidth: '100%',
                  position: 'relative'
                }}
              >
                {/* 页面边距模拟 - 只保留左右边距 */}
                <div className="a4-margins">
                  {/* 编辑器内容区域 */}
                  <div 
                    className="lecture-editor-content dark:dark"
                    style={{
                      minHeight: '297mm', // 保持最小高度
                      width: 'calc(210mm - 40mm)', // A4宽度减去左右边距
                      margin: '0 auto', // 只保留左右边距
                      padding: '20px 0', // 添加上下内边距
                    }}
                  >
                    <div
                      ref={fullscreenEditorRef}
                      contentEditable
                      className="outline-none focus:outline-none w-full h-full"
                      style={{
                        minHeight: '297mm', // 保持最小高度
                        width: '100%',
                        padding: '0',
                        margin: '0'
                      }}
                      onInput={(e) => {
                        const target = e.target as HTMLDivElement;
                        handleContentChange(target.innerHTML);
                      }}
                      onBlur={() => {
                        // 失去焦点时渲染所有LaTeX
                        if (fullscreenEditorRef.current) {
                          renderAllLatex(fullscreenEditorRef.current);
                        }
                      }}
                      onKeyDown={(e) => {
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

                        // 处理Delete键逻辑 - 防止删除最后一个p标签
                        if (e.key === 'Delete' || e.key === 'Backspace') {
                          // 检查是否只剩下一个空的p标签
                          if (editorRef.current) {
                            const pTags = editorRef.current.querySelectorAll('p');
                            const nonEmptyPTags = Array.from(pTags).filter(p => {
                              const text = p.textContent?.trim() || '';
                              const html = p.innerHTML.trim();
                              return text !== '' && html !== '<br>' && html !== '';
                            });
                            
                            // 如果只有一个p标签且为空，阻止删除
                            if (pTags.length === 1 && nonEmptyPTags.length === 0) {
                              e.preventDefault();
                              return;
                            }
                            
                            // 如果全选删除后会导致没有p标签，也阻止删除
                            const selection = window.getSelection();
                            if (selection && selection.rangeCount > 0) {
                              const range = selection.getRangeAt(0);
                              const selectedContent = range.toString();
                              const allContent = editorRef.current.textContent || '';
                              
                              // 如果选中的内容等于全部内容，阻止删除
                              if (selectedContent === allContent && pTags.length <= 1) {
                                e.preventDefault();
                                return;
                              }
                            }
                          }
                        }

                        // 处理Delete键逻辑 - 删除空代码块
                        if (e.key === 'Delete' || e.key === 'Backspace') {
                          const selection = window.getSelection();
                          if (selection && selection.rangeCount > 0) {
                            const range = selection.getRangeAt(0);
                            let element: Node | null = range.commonAncestorContainer;
                            
                            // 检查是否在代码块中
                            while (element && element !== editorRef.current) {
                              if (element.nodeType === 1) {
                                const htmlElement = element as HTMLElement;
                                const tagName = htmlElement.tagName;
                                if (tagName === 'PRE') {
                                  // 检查代码块是否为空
                                  const codeElement = htmlElement.querySelector('code');
                                  if (codeElement && (!codeElement.textContent || codeElement.textContent.trim() === '')) {
                                    e.preventDefault();
                                    // 删除整个代码块
                                    const p = document.createElement('p');
                                    p.innerHTML = '<br>';
                                    htmlElement.parentNode?.insertBefore(p, htmlElement);
                                    htmlElement.remove();
                                    // 将光标移到新段落
                                    const newRange = document.createRange();
                                    newRange.selectNodeContents(p);
                                    newRange.collapse(true);
                                    selection.removeAllRanges();
                                    selection.addRange(newRange);
                                    if (editorRef.current) {
                                      handleContentChange(editorRef.current.innerHTML);
                                    }
                                    return;
                                  }
                                }
                              }
                              element = element.parentElement || (element.parentNode as HTMLElement);
                            }
                          }
                        }

                        // 处理回车键逻辑
                        if (e.key === 'Enter') {
                          const selection = window.getSelection();
                          if (selection && selection.rangeCount > 0) {
                            const range = selection.getRangeAt(0);
                            let element: Node | null = range.commonAncestorContainer;
                            
                            // 检查是否在代码块中
                            while (element && element !== editorRef.current) {
                              if (element.nodeType === 1) {
                                const tagName = (element as HTMLElement).tagName;
                                if (tagName === 'PRE' || tagName === 'CODE') {
                                  // 在代码块中，允许正常的换行，不阻止默认行为
                                  // 确保光标在代码块内正确换行
                                  if (tagName === 'CODE') {
                                    // 在code标签内，直接允许换行
                                    return;
                                  }
                                  
                                  // 在pre标签内，也允许换行
                                  return;
                                }
                              }
                              element = element.parentElement || (element.parentNode as HTMLElement);
                            }
                          }
                        }

                        // 处理快捷键
                        if (e.ctrlKey || e.metaKey) {
                          switch (e.key) {
                            case '1':
                              e.preventDefault();
                              document.execCommand('formatBlock', false, 'h1');
                              handleContentChange(editorRef.current?.innerHTML || '');
                              break;
                            case '2':
                              e.preventDefault();
                              document.execCommand('formatBlock', false, 'h2');
                              handleContentChange(editorRef.current?.innerHTML || '');
                              break;
                            case '3':
                              e.preventDefault();
                              document.execCommand('formatBlock', false, 'h3');
                              handleContentChange(editorRef.current?.innerHTML || '');
                              break;
                            case '4':
                              e.preventDefault();
                              document.execCommand('formatBlock', false, 'h4');
                              handleContentChange(editorRef.current?.innerHTML || '');
                              break;
                            case '5':
                              e.preventDefault();
                              document.execCommand('formatBlock', false, 'h5');
                              handleContentChange(editorRef.current?.innerHTML || '');
                              break;
                            case '6':
                              e.preventDefault();
                              document.execCommand('formatBlock', false, 'h6');
                              handleContentChange(editorRef.current?.innerHTML || '');
                              break;
                            case '0':
                              e.preventDefault();
                              document.execCommand('formatBlock', false, 'p');
                              handleContentChange(editorRef.current?.innerHTML || '');
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
                              
                              // 这里可以添加链接创建逻辑
                              break;
                            case 's':
                              e.preventDefault();
                              document.execCommand('strikeThrough');
                              handleContentChange(editorRef.current?.innerHTML || '');
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
                              handleContentChange(editorRef.current?.innerHTML || '');
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
                              handleContentChange(editorRef.current?.innerHTML || '');
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
                                
                                if (element && element.tagName !== 'BLOCKQUOTE') {
                                  const blockquote = document.createElement('blockquote');
                                  blockquote.innerHTML = element.innerHTML;
                                  element.parentNode?.insertBefore(blockquote, element);
                                  element.parentNode?.removeChild(element);
                                  
                                  // 在引用块下方添加新段落
                                  const newP = document.createElement('p');
                                  newP.innerHTML = '<br>';
                                  blockquote.parentNode?.insertBefore(newP, blockquote.nextSibling);
                                  
                                  handleContentChange(editorRef.current?.innerHTML || '');
                                }
                              }
                              break;
                            case 'c':
                              e.preventDefault();
                              // 处理代码块
                              const codeSelection = window.getSelection();
                              if (codeSelection && codeSelection.rangeCount > 0) {
                                const range = codeSelection.getRangeAt(0);
                                const container = range.commonAncestorContainer;
                                let element = container.nodeType === 3 ? container.parentElement : container as HTMLElement;
                                
                                // 找到包含的块级元素
                                while (element && element !== editorRef.current) {
                                  if (['P', 'DIV', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'LI'].includes(element.tagName)) {
                                    break;
                                  }
                                  element = element.parentElement;
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
                                  code.className = 'language-javascript';
                                  code.innerHTML = element.innerHTML;
                                  pre.appendChild(code);
                                  
                                  // 添加语言选择按钮
                                  const languageButton = document.createElement('button');
                                  languageButton.innerHTML = 'JS';
                                  languageButton.className = 'code-language-selector';
                                  languageButton.onclick = (e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    showLanguageSelectorForCodeBlock(pre);
                                  };
                                  pre.appendChild(languageButton);
                                  
                                  element.parentNode?.insertBefore(pre, element);
                                  element.parentNode?.removeChild(element);
                                  
                                  // 在代码块下方添加新段落，让用户能退出代码块
                                  const newP = document.createElement('p');
                                  newP.innerHTML = '<br>';
                                  pre.parentNode?.insertBefore(newP, pre.nextSibling);
                                  
                                  // 触发语法高亮（创建时立即高亮）
                                  setTimeout(() => {
                                    highlightCode(code);
                                  }, 100);
                                  
                                  // 将光标保持在代码块内
                                  const codeRange = document.createRange();
                                  codeRange.selectNodeContents(code);
                                  codeRange.collapse(false);
                                  const selection = window.getSelection();
                                  if (selection) {
                                    selection.removeAllRanges();
                                    selection.addRange(codeRange);
                                  }
                                  
                                  handleContentChange(editorRef.current?.innerHTML || '');
                                }
                              }
                              break;
                            case 'm':
                              // 插入LaTeX块级公式
                              e.preventDefault();
                              if (editorRef.current) {
                                insertLatex(editorRef.current, '\\LaTeX', true);
                                handleContentChange(editorRef.current.innerHTML);
                              }
                              break;
                          }
                        }
                      }}
                      suppressContentEditableWarning={true}
                      data-placeholder="开始编写讲义内容...支持 Markdown 和 LaTeX 语法"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* 弹窗组件 */}
      <ConfirmModal {...confirmModal} onCancel={closeConfirm} />
      
      {/* 题库选择器模态框 */}
      {showPaperBankSelector && (
        <div className="fixed inset-0 z-[10000] bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">选择试卷库</h3>
            <select
              value={selectedPaperBankId}
              onChange={(e) => setSelectedPaperBankId(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {paperBanks.map((bank) => (
                <option key={bank._id} value={bank._id}>
                  {bank.name}
                </option>
              ))}
            </select>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowPaperBankSelector(false)}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                取消
              </button>
              <button
                onClick={() => setShowPaperBankSelector(false)}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                确定
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* 右侧弹窗 */}
      <RightSlideModal
        {...rightSlideModal}
        onClose={closeRightSlide}
      />

      {/* 语言选择器 */}
      {showLanguageSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">选择编程语言</h3>
            <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
              {SUPPORTED_LANGUAGES.map((lang) => (
                <button
                  key={lang.value}
                  onClick={() => handleLanguageSelect(lang.value)}
                  className="px-4 py-2 text-sm text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
                >
                  {lang.label}
                </button>
              ))}
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => {
                  setShowLanguageSelector(false);
                  setCurrentCodeBlock(null);
                }}
                className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors duration-200"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 自动补全 */}
      {showAutoComplete && autoCompleteSuggestions.length > 0 && (
        <AutoComplete
          ref={autoCompleteRef}
          suggestions={autoCompleteSuggestions}
          selectedIndex={selectedSuggestionIndex}
          position={autoCompletePosition}
          onSelect={handleAutoComplete}
        />
      )}
    </div>
  );
};

export default LectureEditorPage;
