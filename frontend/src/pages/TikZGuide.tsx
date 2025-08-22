import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Code, Palette, Zap, FileText, Lightbulb, ArrowRight, CheckCircle } from 'lucide-react';

const TikZGuide: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'overview' | 'features' | 'latex' | 'examples'>('overview');

  const sections = [
    { id: 'overview', name: 'TikZ概述', icon: BookOpen },
    { id: 'features', name: '核心功能', icon: Zap },
    { id: 'latex', name: 'LaTeX编辑器', icon: Code },
    { id: 'examples', name: '使用示例', icon: FileText }
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6">
        <h3 className="text-xl font-semibold text-blue-800 dark:text-blue-200 mb-4 flex items-center gap-2">
          <BookOpen className="w-6 h-6" />
          TikZ 是什么？
        </h3>
        <p className="text-blue-700 dark:text-blue-300 leading-relaxed">
          TikZ 是一个强大的图形绘制包，专为 LaTeX 设计。它允许用户使用简单的代码创建复杂的图形、图表和示意图。
          在我们的系统中，我们提供了完整的 TikZ 支持，包括语法高亮、实时预览和丰富的图形功能。
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
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
          <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-yellow-500" />
            适用场景
          </h4>
          <ul className="space-y-2 text-gray-600 dark:text-gray-400">
            <li>• 数学图表和函数图像</li>
            <li>• 流程图和思维导图</li>
            <li>• 几何图形和示意图</li>
            <li>• 科学论文插图</li>
            <li>• 技术文档图表</li>
          </ul>
        </div>
      </div>
    </div>
  );

  const renderFeatures = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
            <Palette className="w-5 h-5 text-purple-500" />
            颜色系统
          </h4>
          <div className="space-y-3 text-gray-600 dark:text-gray-400">
            <p><strong>支持格式：</strong></p>
            <ul className="ml-4 space-y-1">
              <li>• 预定义颜色名称 (red, blue, green)</li>
              <li>• HEX 颜色 (#FF0000, #RGB)</li>
              <li>• RGB 颜色 (rgb(255,0,0))</li>
              <li>• RGBA 颜色 (rgba(255,0,0,0.5))</li>
              <li>• CMYK 颜色 (cmyk(0,0.5,0.5,0))</li>
              <li>• 灰度颜色 (gray(0.5))</li>
            </ul>
            <p className="mt-3"><strong>高级功能：</strong></p>
            <ul className="ml-4 space-y-1">
              <li>• 颜色混合和调整</li>
              <li>• 亮度和对比度控制</li>
              <li>• 透明度支持</li>
            </ul>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-orange-500" />
            效果系统
          </h4>
          <div className="space-y-3 text-gray-600 dark:text-gray-400">
            <p><strong>渐变效果：</strong></p>
            <ul className="ml-4 space-y-1">
              <li>• 线性渐变 (水平、垂直、对角)</li>
              <li>• 径向渐变 (圆形、椭圆)</li>
              <li>• 预定义样式 (彩虹、金属、玻璃)</li>
            </ul>
            <p className="mt-3"><strong>阴影效果：</strong></p>
            <ul className="ml-4 space-y-1">
              <li>• 多种阴影类型</li>
              <li>• 可调节偏移和模糊</li>
              <li>• 彩色阴影支持</li>
            </ul>
            <p className="mt-3"><strong>图案填充：</strong></p>
            <ul className="ml-4 space-y-1">
              <li>• 几何图案 (点、线、网格)</li>
              <li>• 特殊图案 (波浪、星星、六边形)</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6">
        <h4 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-3">
          🚀 性能优化特性
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-green-700 dark:text-green-300">
          <div className="text-center">
            <div className="text-2xl font-bold mb-1">⚡</div>
            <div className="text-sm">实时渲染</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold mb-1">🎯</div>
            <div className="text-sm">精确坐标</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold mb-1">🔄</div>
            <div className="text-sm">即时更新</div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderLaTeXEditor = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6">
        <h3 className="text-xl font-semibold text-purple-800 dark:text-purple-200 mb-4 flex items-center gap-2">
          <Code className="w-6 h-6" />
          LaTeX 编辑器功能
        </h3>
        <p className="text-purple-700 dark:text-purple-300 leading-relaxed">
          我们的 LaTeX 编辑器提供了完整的 TikZ 支持，让您能够轻松创建和编辑复杂的图形代码。
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
            ✨ 智能编辑功能
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
          <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
            🎨 编辑器特性
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

      <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl p-6">
        <h4 className="text-lg font-semibold text-orange-800 dark:text-orange-200 mb-3">
          🔧 高级功能
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-orange-700 dark:text-orange-300">
          <div>
            <h5 className="font-semibold mb-2">代码片段</h5>
            <p className="text-sm">预定义的常用 TikZ 代码模板，快速插入常用图形</p>
          </div>
          <div>
            <h5 className="font-semibold mb-2">历史记录</h5>
            <p className="text-sm">保存编辑历史，支持版本回退和比较</p>
          </div>
          <div>
            <h5 className="font-semibold mb-2">导出功能</h5>
            <p className="text-sm">支持 SVG、PNG、PDF 等多种格式导出</p>
          </div>
          <div>
            <h5 className="font-semibold mb-2">协作编辑</h5>
            <p className="text-sm">支持多人同时编辑，实时同步</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderExamples = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 rounded-xl p-6">
        <h3 className="text-xl font-semibold text-teal-800 dark:text-teal-200 mb-4">
          📚 TikZ 使用示例
        </h3>
        <p className="text-teal-700 dark:text-teal-300">
          以下是一些常用的 TikZ 代码示例，您可以在编辑器中尝试这些代码来熟悉 TikZ 的使用。
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">
            基础图形
          </h4>
          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">矩形</p>
              <code className="block bg-gray-100 dark:bg-gray-700 p-2 rounded text-xs font-mono text-gray-800 dark:text-gray-200">
                \draw[red, thick] (0,0) rectangle (2,1);
              </code>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">圆形</p>
              <code className="block bg-gray-100 dark:bg-gray-700 p-2 rounded text-xs font-mono text-gray-800 dark:text-gray-200">
                \draw[blue, fill=blue!20] (0,0) circle (1);
              </code>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">线条</p>
              <code className="block bg-gray-100 dark:bg-gray-700 p-2 rounded text-xs font-mono text-gray-800 dark:text-gray-200">
                \draw[green, thick] (0,0) -- (3,2);
              </code>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">
            高级效果
          </h4>
          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">渐变填充</p>
              <code className="block bg-gray-100 dark:bg-gray-700 p-2 rounded text-xs font-mono text-gray-800 dark:text-gray-200">
                \shade[top color=red, bottom color=blue] (0,0) rectangle (2,1);
              </code>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">阴影效果</p>
              <code className="block bg-gray-100 dark:bg-gray-700 p-2 rounded text-xs font-mono text-gray-800 dark:text-gray-200">
                \draw[drop shadow] (0,0) circle (1);
              </code>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">图案填充</p>
              <code className="block bg-gray-100 dark:bg-gray-700 p-2 rounded text-xs font-mono text-gray-800 dark:text-gray-200">
                \draw[pattern=dots] (0,0) rectangle (2,1);
              </code>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
          🎯 快速开始建议
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-gray-600 dark:text-gray-400">
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-2xl mb-2">1️⃣</div>
            <h5 className="font-semibold mb-2">熟悉基础命令</h5>
            <p className="text-sm">从简单的 \draw 命令开始，学习坐标系统和基本图形</p>
          </div>
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-2xl mb-2">2️⃣</div>
            <h5 className="font-semibold mb-2">尝试样式属性</h5>
            <p className="text-sm">实验不同的颜色、线宽、填充等样式属性</p>
          </div>
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-2xl mb-2">3️⃣</div>
            <h5 className="font-semibold mb-2">探索高级功能</h5>
            <p className="text-sm">逐步尝试渐变、阴影、图案等高级效果</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            TikZ 使用指导
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            了解 TikZ 的强大功能，掌握 LaTeX 图形绘制技巧
          </p>
        </div>

        {/* 导航标签 */}
        <div className="flex flex-wrap justify-center mb-8">
          {sections.map((section) => (
            <motion.button
              key={section.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveSection(section.id as any)}
              className={`px-6 py-3 mx-2 mb-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                activeSection === section.id
                  ? 'bg-blue-600 text-white shadow-lg'
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
          {activeSection === 'features' && renderFeatures()}
          {activeSection === 'latex' && renderLaTeXEditor()}
          {activeSection === 'examples' && renderExamples()}
        </motion.div>

        {/* 快速链接 */}
        <div className="mt-8 text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            准备好开始使用 TikZ 了吗？
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.open('/TikZFeaturesDemo', '_blank')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              查看功能演示
              <ArrowRight className="w-4 h-4" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.open('/TikZSupport', '_blank')}
              className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              TikZ 支持页面
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TikZGuide;
