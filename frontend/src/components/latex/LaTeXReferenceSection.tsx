import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  Sigma, 
  HelpCircle, 
  Image, 
  Zap, 
  Code,
  Search,
  Copy,
  Eye,
  BookOpen,
  Filter,
  SortAsc,
  SortDesc,
  Heart,
  Bookmark,
  Star,
  Share2,
  Edit3,
  X,
  Check
} from 'lucide-react';
import  LaTeXEditor  from '../editor/latex/LaTeXEditor';

// 分类定义
const categories = [
  { id: 'basics', name: '基础语法', icon: FileText, color: 'blue' },
  { id: 'math', name: '数学公式', icon: Sigma, color: 'green' },
  { id: 'question', name: '题目语法', icon: HelpCircle, color: 'purple' },
  { id: 'tikz', name: 'TikZ图形', icon: Image, color: 'orange' },
  { id: 'advanced', name: '高级功能', icon: Zap, color: 'red' },
  { id: 'examples', name: '实例代码', icon: Code, color: 'indigo' }
];

// 基础语法数据
const basicSyntaxData = [
  {
    id: 'document-structure',
    title: '文档结构',
    description: 'LaTeX文档的基本结构和命令',
    items: [
      {
        command: '\\documentclass{article}',
        description: '设置文档类型为文章',
        example: '\\documentclass[12pt,a4paper]{article}',
        category: 'document'
      },
      {
        command: '\\usepackage{package}',
        description: '导入LaTeX包',
        example: '\\usepackage{amsmath,amssymb}',
        category: 'package'
      },
      {
        command: '\\begin{document}',
        description: '文档内容开始',
        example: '\\begin{document}\n文档内容\n\\end{document}',
        category: 'environment'
      },
      {
        command: '\\end{document}',
        description: '文档内容结束',
        example: '',
        category: 'environment'
      }
    ]
  },
  {
    id: 'text-formatting',
    title: '文本格式',
    description: '文本样式和格式设置',
    items: [
      {
        command: '\\textbf{text}',
        description: '粗体文本',
        example: '\\textbf{重要内容}',
        category: 'formatting'
      },
      {
        command: '\\textit{text}',
        description: '斜体文本',
        example: '\\textit{强调内容}',
        category: 'formatting'
      },
      {
        command: '\\underline{text}',
        description: '下划线文本',
        example: '\\underline{重点内容}',
        category: 'formatting'
      },
      {
        command: '\\textcolor{color}{text}',
        description: '彩色文本',
        example: '\\textcolor{red}{红色文本}',
        category: 'formatting'
      }
    ]
  },
  {
    id: 'math-mode',
    title: '数学模式',
    description: '数学公式的输入方式',
    items: [
      {
        command: '$...$',
        description: '行内数学公式',
        example: '这是一个行内公式：$E = mc^2$',
        category: 'math'
      },
      {
        command: '$$...$$',
        description: '行间数学公式',
        example: '$$\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}$$',
        category: 'math'
      },
      {
        command: '\\[...\\]',
        description: '行间数学公式（推荐）',
        example: '\\[\\sum_{n=1}^{\\infty} \\frac{1}{n^2} = \\frac{\\pi^2}{6}\\]',
        category: 'math'
      }
    ]
  }
];

// 数学公式数据
const mathFormulasData = [
  {
    id: 'basic-operators',
    title: '基础运算',
    description: '基本的数学运算符号',
    items: [
      {
        command: '+',
        description: '加号',
        example: 'a + b',
        category: 'operator'
      },
      {
        command: '-',
        description: '减号',
        example: 'a - b',
        category: 'operator'
      },
      {
        command: '\\times',
        description: '乘号',
        example: 'a \\times b',
        category: 'operator'
      },
      {
        command: '\\div',
        description: '除号',
        example: 'a \\div b',
        category: 'operator'
      },
      {
        command: '=',
        description: '等号',
        example: 'a = b',
        category: 'operator'
      },
      {
        command: '\\neq',
        description: '不等号',
        example: 'a \\neq b',
        category: 'operator'
      },
      {
        command: '<',
        description: '小于',
        example: 'a < b',
        category: 'operator'
      },
      {
        command: '>',
        description: '大于',
        example: 'a > b',
        category: 'operator'
      },
      {
        command: '\\leq',
        description: '小于等于',
        example: 'a \\leq b',
        category: 'operator'
      },
      {
        command: '\\geq',
        description: '大于等于',
        example: 'a \\geq b',
        category: 'operator'
      }
    ]
  },
  {
    id: 'greek-letters',
    title: '希腊字母',
    description: '常用的希腊字母',
    items: [
      {
        command: '\\alpha',
        description: 'alpha',
        example: '\\alpha',
        category: 'greek'
      },
      {
        command: '\\beta',
        description: 'beta',
        example: '\\beta',
        category: 'greek'
      },
      {
        command: '\\gamma',
        description: 'gamma',
        example: '\\gamma',
        category: 'greek'
      },
      {
        command: '\\delta',
        description: 'delta',
        example: '\\delta',
        category: 'greek'
      },
      {
        command: '\\epsilon',
        description: 'epsilon',
        example: '\\epsilon',
        category: 'greek'
      },
      {
        command: '\\pi',
        description: 'pi',
        example: '\\pi',
        category: 'greek'
      },
      {
        command: '\\sigma',
        description: 'sigma',
        example: '\\sigma',
        category: 'greek'
      },
      {
        command: '\\omega',
        description: 'omega',
        example: '\\omega',
        category: 'greek'
      }
    ]
  },
  {
    id: 'math-functions',
    title: '数学函数',
    description: '常用的数学函数',
    items: [
      {
        command: '\\sin',
        description: '正弦函数',
        example: '\\sin x',
        category: 'function'
      },
      {
        command: '\\cos',
        description: '余弦函数',
        example: '\\cos x',
        category: 'function'
      },
      {
        command: '\\tan',
        description: '正切函数',
        example: '\\tan x',
        category: 'function'
      },
      {
        command: '\\log',
        description: '对数函数',
        example: '\\log x',
        category: 'function'
      },
      {
        command: '\\ln',
        description: '自然对数',
        example: '\\ln x',
        category: 'function'
      },
      {
        command: '\\lim',
        description: '极限',
        example: '\\lim_{x \\to 0}',
        category: 'function'
      },
      {
        command: '\\sum',
        description: '求和',
        example: '\\sum_{i=1}^{n}',
        category: 'function'
      },
      {
        command: '\\int',
        description: '积分',
        example: '\\int_{a}^{b}',
        category: 'function'
      }
    ]
  },
  {
    id: 'fractions-roots',
    title: '分数和根式',
    description: '分数和根式的表示方法',
    items: [
      {
        command: '\\frac{a}{b}',
        description: '分数',
        example: '\\frac{1}{2}',
        category: 'fraction'
      },
      {
        command: '\\dfrac{a}{b}',
        description: '显示分数',
        example: '\\dfrac{1}{2}',
        category: 'fraction'
      },
      {
        command: '\\sqrt{a}',
        description: '平方根',
        example: '\\sqrt{2}',
        category: 'root'
      },
      {
        command: '\\sqrt[n]{a}',
        description: 'n次根',
        example: '\\sqrt[3]{8}',
        category: 'root'
      }
    ]
  }
];

// 题目语法数据
const questionSyntaxData = [
  {
    id: 'choice-questions',
    title: '选择题',
    description: '选择题的语法结构',
    items: [
      {
        command: '\\choice',
        description: '选择题问题',
        example: '\\choice 下列哪个函数是偶函数？',
        category: 'choice'
      },
      {
        command: '\\subp',
        description: '子问题',
        example: '\\subp 子问题1\n\\subp 子问题2',
        category: 'subp'
      },
      {
        command: '\\subsubp',
        description: '子子问题',
        example: '\\subsubp 子子问题1\n\\subsubp 子子问题2',
        category: 'subsubp'
      }
    ]
  },
  {
    id: 'fill-questions',
    title: '填空题',
    description: '填空题的语法结构',
    items: [
      {
        command: '\\blank',
        description: '填空题空白',
        example: '这是一个\\blank 填空题',
        category: 'fill'
      },
      {
        command: '\\fill',
        description: '填空题空白（另一种写法）',
        example: '这是另一个\\fill 填空题',
        category: 'fill'
      }
    ]
  },
  {
    id: 'solution-questions',
    title: '解答题',
    description: '解答题的语法结构',
    items: [
      {
        command: '\\solution',
        description: '解答',
        example: '\\solution 这是解答内容',
        category: 'solution'
      },
      {
        command: '\\analysis',
        description: '解析',
        example: '\\analysis 这是解析内容',
        category: 'analysis'
      }
    ]
  }
];

// TikZ功能数据
const tikzFeaturesData = [
  {
    id: 'basic-drawing',
    title: '基础绘图',
    description: '基本的绘图命令',
    items: [
      {
        command: '\\draw',
        description: '绘制线条',
        example: '\\draw (0,0) -- (2,2);',
        category: 'drawing'
      },
      {
        command: '\\fill',
        description: '填充图形',
        example: '\\fill[red] (0,0) circle (1);',
        category: 'drawing'
      },
      {
        command: '\\node',
        description: '添加文本节点',
        example: '\\node[right] at (1,1) {文本};',
        category: 'drawing'
      }
    ]
  },
  {
    id: 'shapes',
    title: '基本图形',
    description: '常用的基本图形',
    items: [
      {
        command: 'circle',
        description: '圆形',
        example: '\\draw (0,0) circle (1);',
        category: 'shape'
      },
      {
        command: 'rectangle',
        description: '矩形',
        example: '\\draw (0,0) rectangle (2,1);',
        category: 'shape'
      },
      {
        command: 'polygon',
        description: '多边形',
        example: '\\draw (0,0) -- (1,1) -- (0,1) -- cycle;',
        category: 'shape'
      }
    ]
  },
  {
    id: 'colors',
    title: '颜色系统',
    description: 'TikZ的颜色支持',
    items: [
      {
        command: 'red',
        description: '红色',
        example: '\\draw[red] (0,0) -- (2,2);',
        category: 'color'
      },
      {
        command: 'blue',
        description: '蓝色',
        example: '\\draw[blue] (0,0) -- (2,2);',
        category: 'color'
      },
      {
        command: 'green',
        description: '绿色',
        example: '\\draw[green] (0,0) -- (2,2);',
        category: 'color'
      },
      {
        command: '\\definecolor',
        description: '自定义颜色',
        example: '\\definecolor{mycolor}{RGB}{255,128,0}',
        category: 'color'
      }
    ]
  }
];

// 高级功能数据
const advancedFeaturesData = [
  {
    id: 'tables',
    title: '表格环境',
    description: 'LaTeX表格的创建',
    items: [
      {
        command: '\\begin{table}',
        description: '表格环境开始',
        example: '\\begin{table}\n\\centering\n\\begin{tabular}{ccc}\n\\hline\nA & B & C \\\\\n\\hline\n\\end{tabular}\n\\caption{表格标题}\n\\end{table}',
        category: 'table'
      },
      {
        command: '\\begin{tabular}',
        description: '表格内容环境',
        example: '\\begin{tabular}{|c|c|c|}\n\\hline\n列1 & 列2 & 列3 \\\\\n\\hline\n\\end{tabular}',
        category: 'table'
      }
    ]
  },
  {
    id: 'figures',
    title: '图片插入',
    description: '图片的插入和管理',
    items: [
      {
        command: '\\includegraphics',
        description: '插入图片',
        example: '\\includegraphics[width=0.5\\textwidth]{image.png}',
        category: 'figure'
      },
      {
        command: '\\begin{figure}',
        description: '图片环境',
        example: '\\begin{figure}\n\\centering\n\\includegraphics{image.png}\n\\caption{图片标题}\n\\end{figure}',
        category: 'figure'
      }
    ]
  }
];

// 实例代码数据
const examplesData = [
  {
    id: 'simple-equation',
    title: '简单数学公式',
    description: '基础的数学公式示例',
    code: `这是一个行内公式：$E = mc^2$

这是一个行间公式：
\\[\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}\\]

这是分数：
\\[\\frac{1}{2} + \\frac{1}{3} = \\frac{5}{6}\\]`,
    category: 'math'
  },
  {
    id: 'choice-question',
    title: '选择题示例',
    description: '完整的选择题结构',
    code: `\\begin{question}
选择题：下列哪个是正确的？

\\choice 选项A
\\choice 选项B  
\\choice 选项C
\\choice 选项D

\\solution 正确答案是C
\\end{question}`,
    category: 'question'
  },
  {
    id: 'tikz-example',
    title: 'TikZ图形示例',
    description: '简单的TikZ绘图',
    code: `\\begin{tikzpicture}
\\draw[thick, blue] (0,0) circle (1);
\\draw[red] (0,0) -- (1,1);
\\node[right] at (1,1) {点};
\\end{tikzpicture}`,
    category: 'tikz'
  }
];

// 所有数据整合
const allData = {
  basics: basicSyntaxData,
  math: mathFormulasData,
  question: questionSyntaxData,
  tikz: tikzFeaturesData,
  advanced: advancedFeaturesData,
  examples: examplesData
};

interface ReferenceItem {
  id: string;
  title: string;
  description: string;
  items?: Array<{
    command: string;
    description: string;
    example: string;
    category: string;
  }>;
  code?: string;
  category?: string;
}

const LaTeXReferenceSection: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('basics');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<ReferenceItem | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [sortBy, setSortBy] = useState<'name' | 'category' | 'usage'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showFilters, setShowFilters] = useState(false);
  const [favoriteItems, setFavoriteItems] = useState<Set<string>>(new Set());
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editingCode, setEditingCode] = useState('');
  const [userNotes, setUserNotes] = useState<Map<string, string>>(new Map());

  // 过滤数据
  const filteredData = useMemo(() => {
    const categoryData = allData[activeCategory as keyof typeof allData] || [];
    
    if (!searchQuery) return categoryData;
    
    return categoryData.filter(item => 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ('items' in item && item.items && item.items.some(subItem => 
        subItem.command.toLowerCase().includes(searchQuery.toLowerCase()) ||
        subItem.description.toLowerCase().includes(searchQuery.toLowerCase())
      ))
    );
  }, [activeCategory, searchQuery]);

  // 复制代码到剪贴板
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // 可以添加一个提示
    } catch (err) {
      console.error('复制失败:', err);
    }
  };

  // 切换收藏状态
  const toggleFavorite = (itemId: string) => {
    const newFavorites = new Set(favoriteItems);
    if (newFavorites.has(itemId)) {
      newFavorites.delete(itemId);
    } else {
      newFavorites.add(itemId);
    }
    setFavoriteItems(newFavorites);
  };

  // 开始编辑代码
  const startEditing = (itemId: string, code: string) => {
    setEditingItem(itemId);
    setEditingCode(code);
  };

  // 保存编辑
  const saveEdit = () => {
    setEditingItem(null);
    setEditingCode('');
  };

  // 取消编辑
  const cancelEdit = () => {
    setEditingItem(null);
    setEditingCode('');
  };

  // 保存用户笔记
  const saveNote = (itemId: string, note: string) => {
    const newNotes = new Map(userNotes);
    if (note.trim()) {
      newNotes.set(itemId, note);
    } else {
      newNotes.delete(itemId);
    }
    setUserNotes(newNotes);
  };

  // 渲染内容项
  const renderContentItem = (item: ReferenceItem) => {
    if (item.code) {
      // 实例代码
      return (
        <motion.div
          key={item.id}
          layout
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                {item.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {item.description}
              </p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => toggleFavorite(item.id)}
                className={`p-2 rounded-lg transition-colors ${
                  favoriteItems.has(item.id)
                    ? 'text-red-500 hover:text-red-600 bg-red-50 dark:bg-red-900/20'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                title={favoriteItems.has(item.id) ? "取消收藏" : "收藏"}
              >
                <Heart className={`w-4 h-4 ${favoriteItems.has(item.id) ? 'fill-current' : ''}`} />
              </button>
              <button
                onClick={() => startEditing(item.id, item.code!)}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title="编辑代码"
              >
                <Edit3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => copyToClipboard(item.code!)}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title="复制代码"
              >
                <Copy className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setSelectedItem(item);
                  setShowPreview(true);
                }}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title="预览效果"
              >
                <Eye className="w-4 h-4" />
              </button>
              <button
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title="分享代码"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          {/* 代码编辑区域 */}
          {editingItem === item.id ? (
            <div className="space-y-4">
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                <textarea
                  value={editingCode}
                  onChange={(e) => setEditingCode(e.target.value)}
                  className="w-full h-32 bg-transparent text-sm font-mono text-gray-800 dark:text-gray-200 border-none outline-none resize-none"
                  placeholder="编辑LaTeX代码..."
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={cancelEdit}
                  className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  <X className="w-4 h-4 inline mr-1" />
                  取消
                </button>
                <button
                  onClick={saveEdit}
                  className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                  <Check className="w-4 h-4 inline mr-1" />
                  保存
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
              <pre className="text-sm text-gray-800 dark:text-gray-200 overflow-x-auto">
                <code>{item.code}</code>
              </pre>
            </div>
          )}

          {/* 用户笔记区域 */}
          <div className="mt-4">
            <details className="group">
              <summary className="cursor-pointer text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors">
                <Bookmark className="w-4 h-4 inline mr-1" />
                我的笔记
                {userNotes.has(item.id) && (
                  <span className="ml-2 px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs">
                    有笔记
                  </span>
                )}
              </summary>
              <div className="mt-2">
                <textarea
                  value={userNotes.get(item.id) || ''}
                  onChange={(e) => saveNote(item.id, e.target.value)}
                  className="w-full h-20 p-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-800 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="添加你的笔记和想法..."
                />
              </div>
            </details>
          </div>
        </motion.div>
      );
    } else {
      // 参考项
      return (
        <motion.div
          key={item.id}
          layout
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm hover:shadow-md transition-shadow"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            {item.title}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {item.description}
          </p>
          
          <div className="space-y-3">
            {item.items?.map((subItem, index) => (
              <div key={index} className="border-l-4 border-blue-500 pl-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <code className="text-sm font-mono bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded">
                      {subItem.command}
                    </code>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {subItem.description}
                    </p>
                    {subItem.example && (
                      <div className="mt-2">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">示例：</p>
                        <code className="text-xs font-mono bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-2 py-1 rounded">
                          {subItem.example}
                        </code>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => copyToClipboard(subItem.command)}
                    className="p-1 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors ml-2"
                    title="复制命令"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* 标题和描述 */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 flex items-center justify-center gap-3">
          <BookOpen className="w-8 h-8 text-blue-600" />
          LaTeX 参考手册
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
          完整的LaTeX语法参考，包含基础语法、数学公式、题目语法、TikZ图形等所有功能的详细说明和实例代码
        </p>
      </div>

      {/* 搜索和过滤栏 */}
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          {/* 搜索框 */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="搜索LaTeX命令、语法或功能..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          {/* 工具按钮 */}
          <div className="flex gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-3 rounded-lg border transition-all ${
                showFilters 
                  ? 'bg-blue-500 text-white border-blue-500' 
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
              title="过滤选项"
            >
              <Filter className="w-5 h-5" />
            </button>
            
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="p-3 rounded-lg border bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
              title={`${sortOrder === 'asc' ? '升序' : '降序'}排列`}
            >
              {sortOrder === 'asc' ? <SortAsc className="w-5 h-5" /> : <SortDesc className="w-5 h-5" />}
            </button>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="p-3 rounded-lg border bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="name">按名称</option>
              <option value="category">按分类</option>
              <option value="usage">按使用频率</option>
            </select>
          </div>
        </div>

        {/* 过滤选项面板 */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
            >
              <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-3">筛选选项</h4>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setActiveCategory('favorites')}
                  className={`px-3 py-1 rounded-full text-sm transition-all ${
                    activeCategory === 'favorites'
                      ? 'bg-red-500 text-white'
                      : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600'
                  }`}
                >
                  <Heart className="w-4 h-4 inline mr-1" />
                  我的收藏
                </button>
                <button className="px-3 py-1 rounded-full text-sm bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600">
                  <Star className="w-4 h-4 inline mr-1" />
                  常用命令
                </button>
                <button className="px-3 py-1 rounded-full text-sm bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600">
                  <Bookmark className="w-4 h-4 inline mr-1" />
                  最近使用
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 分类导航 */}
      <div className="flex flex-wrap justify-center gap-2">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setActiveCategory(category.id)}
            className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
              activeCategory === category.id
                ? `bg-${category.color}-600 text-white shadow-lg`
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <category.icon className="w-4 h-4" />
            {category.name}
          </button>
        ))}
      </div>

      {/* 内容区域 */}
      <div className="space-y-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {filteredData.map(renderContentItem)}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 预览模态框 */}
      <AnimatePresence>
        {showPreview && selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowPreview(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  {selectedItem.title} - 预览效果
                </h3>
                <button
                  onClick={() => setShowPreview(false)}
                  className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                >
                  ✕
                </button>
              </div>
              
              <div className="p-6">
                <LaTeXEditor
                  value={selectedItem.code || ''}
                  onChange={() => {}}
                  showPreview={true}
                  simplified={false}
                  placeholder="LaTeX代码预览"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LaTeXReferenceSection;
