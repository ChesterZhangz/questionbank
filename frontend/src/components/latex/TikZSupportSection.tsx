import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  Code, 
  Palette, 
  Zap, 
  Lightbulb, 
  CheckCircle,
  Play,
  Settings,
  Layers,
  Grid3X3,
  Circle,
  Square,
  Triangle,
  Star,
  Hexagon,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  Move
} from 'lucide-react';
import { TikZPreview, TikZEditorPanel, TikZHighlightInput } from '../tikz';
import { AnimatePresence } from 'framer-motion';

interface TikZCode {
  id: string;
  code: string;
  format: 'svg' | 'png';
  order: number;
}

const TikZSupportSection: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'overview' | 'editor' | 'shapes' | 'effects' | 'interactive'>('overview');
  const [showFullEditor, setShowFullEditor] = useState(false);
  const [playgroundCode, setPlaygroundCode] = useState(`\\begin{tikzpicture}
\\draw[thick, blue] (0,0) circle (1);
\\draw[red] (0,0) -- (1,1);
\\node[right] at (1,1) {点};
\\end{tikzpicture}`);
  const [tikzCodes, setTikzCodes] = useState<TikZCode[]>([
    {
      id: 'demo-1',
      code: '\\draw[thick, blue] (0,0) circle (1);',
      format: 'svg',
      order: 0
    }
  ]);

  const sections = [
    { id: 'overview', name: 'TikZ概述', icon: BookOpen, color: 'blue' },
    { id: 'editor', name: 'TikZ编辑器', icon: Code, color: 'green' },
    { id: 'shapes', name: '图形库', icon: Layers, color: 'purple' },
    { id: 'effects', name: '效果系统', icon: Palette, color: 'orange' },
    { id: 'interactive', name: '交互演示', icon: Play, color: 'red' }
  ];

  // 基础图形演示数据
  const basicShapes = [
    { name: '圆形', code: '\\draw[thick, blue] (0,0) circle (1);', icon: Circle },
    { name: '矩形', code: '\\draw[red, fill=red!20] (0,0) rectangle (2,1);', icon: Square },
    { name: '三角形', code: '\\draw[green, fill=green!20] (0,0) -- (1,1) -- (0,1) -- cycle;', icon: Triangle },
    { name: '星形', code: '\\draw[purple, fill=purple!20] (0,0) -- (0.5,0.5) -- (1,0) -- (0.5,-0.5) -- cycle;', icon: Star },
    { name: '六边形', code: '\\draw[orange, fill=orange!20] (0,0) -- (0.5,0.3) -- (1,0) -- (1,-0.3) -- (0.5,-0.6) -- (0,-0.3) -- cycle;', icon: Hexagon }
  ];

  // 箭头和线条演示
  const arrowsAndLines = [
    { name: '右箭头', code: '\\draw[thick, blue, ->] (0,0) -- (2,0);', icon: ArrowRight },
    { name: '上箭头', code: '\\draw[thick, red, ->] (0,0) -- (0,2);', icon: ArrowUp },
    { name: '下箭头', code: '\\draw[thick, green, ->] (0,0) -- (0,-2);', icon: ArrowDown },
    { name: '左箭头', code: '\\draw[thick, purple, ->] (0,0) -- (-2,0);', icon: ArrowLeft },
    { name: '双向箭头', code: '\\draw[thick, orange, <->] (0,0) -- (2,0);', icon: Move },
    { name: '曲线箭头', code: '\\draw[thick, brown, ->] (0,0) to[out=45,in=135] (2,0);', icon: Move }
  ];

  // 效果演示数据
  const effects = [
    { name: '渐变填充', code: '\\shade[top color=red, bottom color=blue] (0,0) rectangle (2,1);', type: 'gradient' },
    { name: '阴影效果', code: '\\draw[drop shadow, fill=green!20] (0,0) circle (1);', type: 'shadow' },
    { name: '图案填充', code: '\\draw[pattern=dots, pattern color=purple] (0,0) rectangle (2,1);', type: 'pattern' },
    { name: '透明度', code: '\\draw[fill=red!50, opacity=0.7] (0,0) circle (1);', type: 'opacity' }
  ];

  // 交互演示数据
  const interactiveDemos = [
    {
      id: 'basic-drawing',
      title: '基础绘图交互',
      description: '学习基本的绘图命令和交互操作',
      code: `\\begin{tikzpicture}
\\draw[thick, blue] (0,0) circle (1);
\\draw[red] (0,0) -- (1,1);
\\node[right] at (1,1) {点};
\\end{tikzpicture}`,
      features: ['实时编辑', '即时预览', '代码高亮', '错误提示']
    },
    {
      id: 'advanced-shapes',
      title: '高级图形组合',
      description: '组合多种图形创建复杂图案',
      code: `\\begin{tikzpicture}
\\draw[thick, blue, fill=blue!20] (0,0) circle (1);
\\draw[red, thick] (-1,-1) rectangle (1,1);
\\draw[green, thick] (0,0) -- (1.5,1.5);
\\node[above] at (1.5,1.5) {组合图形};
\\end{tikzpicture}`,
      features: ['图形组合', '颜色搭配', '层次管理', '精确定位']
    },
    {
      id: 'mathematical',
      title: '数学图形',
      description: '绘制数学函数和几何图形',
      code: `\\begin{tikzpicture}
\\draw[->] (-2,0) -- (2,0) node[right] {$x$};
\\draw[->] (0,-2) -- (0,2) node[above] {$y$};
\\draw[thick, red] plot[domain=-1.5:1.5] (\\x,{sin(\\x r)});
\\node[right] at (1.5,0.5) {$y=\\sin x$};
\\end{tikzpicture}`,
      features: ['函数绘制', '坐标系统', '数学标注', '动态调整']
    },
    {
      id: 'function-plotting',
      title: 'PGFPlots 函数绘图',
      description: '使用PGFPlots绘制复杂数学函数图像',
      code: `\\begin{axis}[
  title={三角函数图像},
  xlabel={$x$},
  ylabel={$y$},
  xmin=-6, xmax=6,
  ymin=-2, ymax=2,
  grid=major,
  legend pos=north east
]
\\addplot[color=red, line width=2pt]{sin(x)};
\\addplot[color=blue, line width=2pt]{cos(x)};
\\addlegendentry{$\\sin(x)$}
\\addlegendentry{$\\cos(x)$}
\\end{axis}`,
      features: ['PGFPlots语法', '多函数绘制', '图例显示', '网格坐标系']
    },
    {
      id: 'polynomial-functions',
      title: '多项式函数',
      description: '绘制各种多项式函数图像',
      code: `\\begin{axis}[
  title={多项式函数},
  xlabel={$x$},
  ylabel={$y$},
  xmin=-3, xmax=3,
  ymin=-5, ymax=5,
  grid=major,
  legend pos=south east
]
\\addplot[color=red]{x^2};
\\addplot[color=blue]{x^3};
\\addplot[color=green]{x^2 - 2*x + 1};
\\addlegendentry{$x^2$}
\\addlegendentry{$x^3$}
\\addlegendentry{$x^2-2x+1$}
\\end{axis}`,
      features: ['多项式绘制', '图像对比', '自动范围', '标准坐标系']
    },
    {
      id: 'exponential-functions',
      title: '指数和对数函数',
      description: '展示指数函数和对数函数的特性',
      code: `\\begin{axis}[
  title={指数与对数函数},
  xlabel={$x$},
  ylabel={$y$},
  xmin=-2, xmax=4,
  ymin=-2, ymax=8,
  grid=major,
  legend pos=north west
]
\\addplot[color=red, domain=-2:2]{exp(x)};
\\addplot[color=blue, domain=0.1:4]{ln(x)};
\\addplot[color=green, domain=-2:4]{2^x};
\\addlegendentry{$e^x$}
\\addlegendentry{$\\ln(x)$}
\\addlegendentry{$2^x$}
\\end{axis}`,
      features: ['指数函数', '对数函数', '定义域控制', '函数特性对比']
    }
  ];

  const renderOverview = () => (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-8">
        <h3 className="text-2xl font-bold text-blue-800 dark:text-blue-200 mb-6 flex items-center gap-3">
          <BookOpen className="w-8 h-8" />
          TikZ 是什么？
        </h3>
        <p className="text-blue-700 dark:text-blue-300 leading-relaxed text-lg">
          TikZ 是一个强大的图形绘制包，专为 LaTeX 设计.它允许用户使用简单的代码创建复杂的图形、图表和示意图.
          在我们的系统中，我们提供了完整的 TikZ 支持，包括实时编辑器、语法高亮、即时预览和丰富的图形功能.
          <span className="font-semibold text-blue-800 dark:text-blue-200"> 特别支持 PGFPlots 函数绘图，能够绘制各种数学函数图像.</span>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4 mx-auto">
            <CheckCircle className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h4 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3 text-center">
            主要优势
          </h4>
          <ul className="space-y-2 text-gray-600 dark:text-gray-400">
            <li>• 矢量图形，无限缩放不失真</li>
            <li>• 数学公式完美集成</li>
            <li>• 精确的坐标系统</li>
            <li>• 丰富的样式和效果</li>
            <li>• 代码化图形，易于修改</li>
          </ul>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4 mx-auto">
            <Lightbulb className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <h4 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3 text-center">
            适用场景
          </h4>
          <ul className="space-y-2 text-gray-600 dark:text-gray-400">
            <li>• 数学图表和函数图像</li>
            <li>• PGFPlots复杂函数绘制</li>
            <li>• 流程图和思维导图</li>
            <li>• 几何图形和示意图</li>
            <li>• 科学论文插图</li>
            <li>• 技术文档图表</li>
          </ul>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mb-4 mx-auto">
            <Zap className="w-8 h-8 text-purple-600 dark:text-purple-400" />
          </div>
          <h4 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3 text-center">
            核心特性
          </h4>
          <ul className="space-y-2 text-gray-600 dark:text-gray-400">
            <li>• 实时语法高亮</li>
            <li>• 智能自动补全</li>
            <li>• 即时预览渲染</li>
            <li>• 错误检测提示</li>
            <li>• 代码格式化</li>
          </ul>
        </div>
      </div>
    </div>
  );

  const renderEditor = () => (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-8">
        <h3 className="text-2xl font-bold text-green-800 dark:text-green-200 mb-6 flex items-center gap-3">
          <Code className="w-8 h-8" />
          TikZ 编辑器功能
        </h3>
        <p className="text-green-700 dark:text-green-300 leading-relaxed text-lg">
          我们的 TikZ 编辑器提供了完整的图形绘制体验，让您能够轻松创建和编辑复杂的图形代码.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <h4 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              智能编辑功能
            </h4>
            <ul className="space-y-3 text-gray-600 dark:text-gray-400">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span><strong>语法高亮：</strong> TikZ 命令、参数、颜色等不同元素使用不同颜色显示</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span><strong>自动补全：</strong> 输入时自动提示可用的 TikZ 命令和参数</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span><strong>实时预览：</strong> 代码修改后立即显示渲染结果</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span><strong>错误提示：</strong> 语法错误实时检测和提示</span>
              </li>
            </ul>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <h4 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5 text-blue-500" />
              编辑器特性
            </h4>
            <ul className="space-y-3 text-gray-600 dark:text-gray-400">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span><strong>暗黑模式：</strong> 支持明暗主题切换，保护眼睛</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span><strong>响应式设计：</strong> 适配各种屏幕尺寸</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span><strong>快捷键支持：</strong> 提高编辑效率</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span><strong>代码格式化：</strong> 自动整理代码结构</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <h4 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
            <Play className="w-5 h-5 text-purple-500" />
            交互式代码游乐场
          </h4>
          <div className="space-y-4">
            <p className="text-gray-600 dark:text-gray-400">
              在下方实时编辑TikZ代码，立即查看渲染效果：
            </p>
            
            {/* 快速代码编辑器 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  TikZ 代码编辑器
                </label>
                <TikZHighlightInput
                  value={playgroundCode}
                  onChange={setPlaygroundCode}
                  placeholder="输入TikZ代码..."
                  rows={8}
                  enableAutoComplete={true}
                  className="border border-gray-300 dark:border-gray-600 rounded-md w-full"
                  style={{
                    fontFamily: 'monospace',
                    fontSize: '14px',
                    lineHeight: '1.5'
                  }}
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  实时预览
                </label>
                <div className="border border-gray-300 dark:border-gray-600 rounded-md overflow-hidden bg-white dark:bg-gray-900">
                  <TikZPreview
                    code={playgroundCode}
                    width={300}
                    height={250}
                    showGrid={true}
                    showTitle={false}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => setShowFullEditor(true)}
                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-2 px-4 rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transition-all duration-300 flex items-center justify-center gap-2"
              >
                <Code className="w-4 h-4" />
                打开高级编辑器
              </button>
              <button
                onClick={() => setPlaygroundCode('\\draw[thick, blue] (0,0) circle (1);\\draw[red] (0,0) -- (1,1);\\node[right] at (1,1) {点};')}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                重置示例
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderShapes = () => (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-8">
        <h3 className="text-2xl font-bold text-purple-800 dark:text-purple-200 mb-6 flex items-center gap-3">
          <Layers className="w-8 h-8" />
          TikZ 图形库
        </h3>
        <p className="text-purple-700 dark:text-purple-300 leading-relaxed text-lg">
          探索 TikZ 提供的丰富图形库，从基础几何图形到复杂的组合图案.
        </p>
      </div>

      <div className="space-y-8">
        <div>
          <h4 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-6 flex items-center gap-2">
            <Grid3X3 className="w-6 h-6 text-blue-500" />
            基础几何图形
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {basicShapes.map((shape, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.02, y: -2 }}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                    <shape.icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h5 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                    {shape.name}
                  </h5>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 mb-4">
                  <code className="text-sm font-mono text-gray-800 dark:text-gray-200">
                    {shape.code}
                  </code>
                </div>
                <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 h-32 flex items-center justify-center">
                  <TikZPreview
                    code={shape.code}
                    width={200}
                    height={120}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-6 flex items-center gap-2">
            <Move className="w-6 h-6 text-green-500" />
            箭头和线条
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {arrowsAndLines.map((item, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.02, y: -2 }}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                    <item.icon className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <h5 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                    {item.name}
                  </h5>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 mb-4">
                  <code className="text-sm font-mono text-gray-800 dark:text-gray-200">
                    {item.code}
                  </code>
                </div>
                <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 h-32 flex items-center justify-center overflow-hidden">
                  <TikZPreview
                    code={item.code}
                    width={180}
                    height={100}
                    showGrid={false}
                    showTitle={false}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderEffects = () => (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl p-8">
        <h3 className="text-2xl font-bold text-orange-800 dark:text-orange-200 mb-6 flex items-center gap-3">
          <Palette className="w-8 h-8" />
          TikZ 效果系统
        </h3>
        <p className="text-orange-700 dark:text-orange-300 leading-relaxed text-lg">
          探索 TikZ 强大的效果系统，包括颜色、渐变、阴影、图案等高级功能.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {effects.map((effect, index) => (
          <motion.div
            key={index}
            whileHover={{ scale: 1.02, y: -2 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300"
          >
            <h4 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
              <Palette className="w-5 h-5 text-orange-500" />
              {effect.name}
            </h4>
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 mb-4">
              <code className="text-sm font-mono text-gray-800 dark:text-gray-200">
                {effect.code}
              </code>
            </div>
            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 h-40 flex items-center justify-center overflow-hidden">
              <TikZPreview
                code={effect.code}
                width={220}
                height={120}
                showGrid={false}
                showTitle={false}
              />
            </div>
          </motion.div>
        ))}
      </div>

      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl p-8">
        <h4 className="text-xl font-semibold text-indigo-800 dark:text-indigo-200 mb-4">
          🎨 自定义效果
        </h4>
        <p className="text-indigo-700 dark:text-indigo-300 mb-4">
          除了预定义效果，您还可以：
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-indigo-700 dark:text-indigo-300">
          <ul className="space-y-2">
            <li>• 自定义颜色和透明度</li>
            <li>• 创建渐变和阴影</li>
            <li>• 设计图案和纹理</li>
          </ul>
          <ul className="space-y-2">
            <li>• 组合多种效果</li>
            <li>• 调整参数和属性</li>
            <li>• 保存和复用样式</li>
          </ul>
        </div>
      </div>
    </div>
  );

  const renderInteractive = () => (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 rounded-xl p-8">
        <h3 className="text-2xl font-bold text-red-800 dark:text-red-200 mb-6 flex items-center gap-3">
          <Play className="w-8 h-8" />
          交互式演示
        </h3>
        <p className="text-red-700 dark:text-red-300 leading-relaxed text-lg">
          通过交互式演示学习 TikZ 的各种功能，实时编辑代码并查看效果.
        </p>
      </div>

      <div className="space-y-6">
        {interactiveDemos.map((demo) => (
          <motion.div
            key={demo.id}
            whileHover={{ scale: 1.01 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h4 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  {demo.title}
                </h4>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {demo.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  {demo.features.map((feature, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex gap-2 ml-4">
                <button
                  onClick={() => setShowFullEditor(true)}
                  className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors flex items-center gap-2"
                >
                  <Code className="w-4 h-4" />
                  打开编辑器
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">代码预览：</span>
                  <button
                    onClick={() => navigator.clipboard.writeText(demo.code)}
                    className="text-blue-500 hover:text-blue-600 text-sm"
                  >
                    复制代码
                  </button>
                </div>
                <pre className="text-sm text-gray-800 dark:text-gray-200 overflow-x-auto">
                  <code>{demo.code}</code>
                </pre>
              </div>
              
              <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 flex items-center justify-center overflow-hidden">
                <TikZPreview
                  code={demo.code}
                  width={250}
                  height={200}
                  showGrid={false}
                  showTitle={false}
                />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* 标题和描述 */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          TikZ 支持文档
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          深入了解 TikZ 的强大功能，掌握图形绘制技巧，体验交互式学习
        </p>
      </div>

      {/* 导航标签 */}
      <div className="flex flex-wrap justify-center mb-8 gap-2">
        {sections.map((section) => (
          <motion.button
            key={section.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveSection(section.id as any)}
            className={`px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2 ${
              activeSection === section.id
                ? `bg-${section.color}-600 text-white shadow-lg`
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <section.icon className="w-4 h-4" />
            {section.name}
          </motion.button>
        ))}
      </div>

      {/* 内容区域 */}
      <motion.div
        key={activeSection}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
      >
        {activeSection === 'overview' && renderOverview()}
        {activeSection === 'editor' && renderEditor()}
        {activeSection === 'shapes' && renderShapes()}
        {activeSection === 'effects' && renderEffects()}
        {activeSection === 'interactive' && renderInteractive()}
      </motion.div>

      {/* 完整编辑器模态框 */}
      <AnimatePresence>
        {showFullEditor && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowFullEditor(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  TikZ 完整编辑器
                </h3>
                <button
                  onClick={() => setShowFullEditor(false)}
                  className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                >
                  ✕
                </button>
              </div>
              
              <div className="p-6">
                <TikZEditorPanel
                  tikzCodes={tikzCodes}
                  onTikzCodesChange={setTikzCodes}
                  className="min-h-[500px]"
                />
                <div className="mt-6 text-center">
                  <button
                    onClick={() => setShowFullEditor(false)}
                    className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    关闭编辑器
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TikZSupportSection;
