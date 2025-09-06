import React from 'react';
import { 
  Bold, 
  Italic, 
  Underline, 
  Strikethrough, 
  Heading1, 
  Heading2, 
  Heading3, 
  Pilcrow, 
  List, 
  ListOrdered, 
  Quote, 
  Code, 
  Sigma,
  Link, 
  Minus
} from 'lucide-react';

export interface WYSIWYGToolbarProps {
  onFormat: (command: string, value?: string) => void;
  disabled?: boolean;
  vertical?: boolean;
}

interface ToolbarButton {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
  command: string;
  value?: string;
  shortcut: string;
  description: string;
}

const WYSIWYGToolbar: React.FC<WYSIWYGToolbarProps> = ({ onFormat, disabled = false, vertical = false }) => {
  // 检测用户的操作系统，确定使用 Command 还是 Ctrl
  const isMac = typeof navigator !== 'undefined' && (
    /Mac|iPod|iPhone|iPad/.test(navigator.platform) ||
    navigator.userAgent.includes('Mac OS X') ||
    navigator.userAgent.includes('Macintosh')
  );
  const modifierKey = isMac ? '⌘' : 'Ctrl';
  
  const toolbarButtons: ToolbarButton[] = [
    // 文本格式化
    {
      id: 'bold',
      label: '粗体',
      icon: Bold,
      command: 'bold',
      shortcut: `${modifierKey}+B`,
      description: '将选中的文本设为粗体'
    },
    {
      id: 'italic',
      label: '斜体',
      icon: Italic,
      command: 'italic',
      shortcut: `${modifierKey}+I`,
      description: '将选中的文本设为斜体'
    },
    {
      id: 'underline',
      label: '下划线',
      icon: Underline,
      command: 'underline',
      shortcut: `${modifierKey}+U`,
      description: '为选中的文本添加下划线'
    },
    {
      id: 'strikethrough',
      label: '删除线',
      icon: Strikethrough,
      command: 'strikeThrough',
      shortcut: `${modifierKey}+S`,
      description: '为选中的文本添加删除线'
    },
    
    // 分隔线
    { id: 'separator1', label: '', icon: Minus, command: '', shortcut: '', description: '' },
    
    // 标题
    {
      id: 'h1',
      label: 'H1',
      icon: Heading1,
      command: 'formatBlock',
      value: 'h1',
      shortcut: `${modifierKey}+1`,
      description: '一级标题'
    },
    {
      id: 'h2',
      label: 'H2',
      icon: Heading2,
      command: 'formatBlock',
      value: 'h2',
      shortcut: `${modifierKey}+2`,
      description: '二级标题'
    },
    {
      id: 'h3',
      label: 'H3',
      icon: Heading3,
      command: 'formatBlock',
      value: 'h3',
      shortcut: `${modifierKey}+3`,
      description: '三级标题'
    },
    {
      id: 'paragraph',
      label: '段落',
      icon: Pilcrow,
      command: 'formatBlock',
      value: 'p',
      shortcut: `${modifierKey}+0`,
      description: '普通段落'
    },
    
    // 分隔线
    { id: 'separator2', label: '', icon: Minus, command: '', shortcut: '', description: '' },
    
    // 列表
    {
      id: 'unordered-list',
      label: '无序列表',
      icon: List,
      command: 'insertUnorderedList',
      shortcut: `${modifierKey}+L`,
      description: '创建无序列表'
    },
    {
      id: 'ordered-list',
      label: '有序列表',
      icon: ListOrdered,
      command: 'insertOrderedList',
      shortcut: `${modifierKey}+O`,
      description: '创建有序列表'
    },
    
    // 分隔线
    { id: 'separator3', label: '', icon: Minus, command: '', shortcut: '', description: '' },
    
    // 其他格式
    {
      id: 'quote',
      label: '引用',
      icon: Quote,
      command: 'formatBlock',
      value: 'blockquote',
      shortcut: `${modifierKey}+H`,
      description: '创建引用块'
    },
    {
      id: 'code',
      label: '代码',
      icon: Code,
      command: 'formatBlock',
      value: 'pre',
      shortcut: `${modifierKey}+E`,
      description: '创建代码块'
    },
    {
      id: 'math',
      label: '数学公式',
      icon: Sigma,
      command: 'insertMath',
      shortcut: `${modifierKey}+M`,
      description: '插入LaTeX数学公式'
    },
    {
      id: 'link',
      label: '链接',
      icon: Link,
      command: 'createLink',
      shortcut: `${modifierKey}+K`,
      description: '创建链接'
    }
  ];

  const handleButtonClick = (button: ToolbarButton) => {
    if (button.command && !disabled) {
      onFormat(button.command, button.value);
    }
  };

  const renderButton = (button: ToolbarButton) => {
    if (button.id.startsWith('separator')) {
      return (
        <div key={button.id} className="w-px h-8 bg-gray-300 dark:bg-gray-600 mx-2"></div>
      );
    }

    const IconComponent = button.icon;

    return (
      <div key={button.id} className="relative group">
        <button
          onClick={() => handleButtonClick(button)}
          disabled={disabled}
          className={`
            flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-200
            ${disabled 
              ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed' 
              : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white border border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 hover:shadow-md dark:hover:shadow-lg'
            }
          `}
        >
          <IconComponent className="w-4 h-4" />
        </button>
        
        {/* 悬浮提示 */}
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-sm rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-[9999]">
          <div className="font-medium">{button.description}</div>
          <div className="text-xs text-gray-300 dark:text-gray-600 mt-1">{button.shortcut}</div>
          {/* 小箭头 */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900 dark:border-t-gray-100"></div>
        </div>
      </div>
    );
  };

  return (
    <div className="wysiwyg-toolbar relative z-10">
      <div className={`flex ${vertical ? 'flex-col' : 'flex-row'} items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 rounded-t-lg shadow-sm`}>
        {toolbarButtons.map(renderButton)}
      </div>
    </div>
  );
};

export default WYSIWYGToolbar;