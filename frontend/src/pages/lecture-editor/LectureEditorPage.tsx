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
import './LectureEditorPage.css';

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
  const editorRef = useRef<HTMLDivElement>(null);

  // 空内容，不预设文字
  const sampleContent = '';

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


  const handleContentChange = (content: string) => {
    setLecture(prev => ({
      ...prev,
      content
    }));
  };

  // 处理代码块语言选择
  const handleLanguageSelect = (language: string) => {
    if (currentCodeBlock) {
      const codeElement = currentCodeBlock.querySelector('code');
      if (codeElement) {
        codeElement.className = `language-${language}`;
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
            
            // 在代码块下方添加新段落
            const newP = document.createElement('p');
            newP.innerHTML = '<br>';
            pre.parentNode?.insertBefore(newP, pre.nextSibling);
            
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
              
              // 在代码块下方添加新段落
              const newP = document.createElement('p');
              newP.innerHTML = '<br>';
              pre.parentNode?.insertBefore(newP, pre.nextSibling);
              
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
      <div className="max-w-7xl mx-auto px-6 py-8">
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
            <div className="w-16 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-4">
              <WYSIWYGToolbar 
                onFormat={handleFormat}
                disabled={false}
                vertical={true}
              />
            </div>
            
            {/* A4纸容器 */}
            <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden p-6">
              <div 
                className="a4-paper dark:dark"
                style={{
                  width: '210mm', // A4宽度
                  minHeight: '297mm', // A4高度
                  maxWidth: '100%',
                  position: 'relative'
                }}
              >
                {/* 页面边距模拟 */}
                <div className="a4-margins">
                  {/* 编辑器内容区域 */}
                  <div 
                    className="lecture-editor-content dark:dark"
                    style={{
                      minHeight: 'calc(297mm - 40mm)', // A4高度减去上下边距
                      width: 'calc(210mm - 40mm)', // A4宽度减去左右边距
                      margin: '20mm auto', // 上下左右边距
                    }}
                  >
                    <div
                      ref={editorRef}
                      contentEditable
                      className="outline-none focus:outline-none w-full h-full"
                      style={{
                        minHeight: 'calc(297mm - 40mm)', // 减去边距
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
                                  // 在代码块中，允许正常的换行
                                  return;
                                }
                              }
                              element = element.parentElement || (element.parentNode as HTMLElement);
                            }
                            
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
                                  
                                  // 在代码块下方添加新段落
                                  const newP = document.createElement('p');
                                  newP.innerHTML = '<br>';
                                  pre.parentNode?.insertBefore(newP, pre.nextSibling);
                                  
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
                                    
                                    // 在代码块下方添加新段落
                                    const newP = document.createElement('p');
                                    newP.innerHTML = '<br>';
                                    pre.parentNode?.insertBefore(newP, pre.nextSibling);
                                    
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
        </motion.div>
      </div>

      {/* 弹窗组件 */}
      <ConfirmModal {...confirmModal} onCancel={closeConfirm} />
      
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
    </div>
  );
};

export default LectureEditorPage;
