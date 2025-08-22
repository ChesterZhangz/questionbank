import React, { useState } from 'react';
import { getAllTikZSymbols, getTikZSymbolsByCategory } from '../lib/tikz/symbols';
import TikZPreview from '../components/tikz/core/TikZPreview';
import { FileText, Palette, Zap, Eye, BookOpen } from 'lucide-react';

const TikZSupport: React.FC = () => {
  const allSymbols = getAllTikZSymbols();
  const [selectedExample, setSelectedExample] = useState<string | null>(null);
  
  // 分类符号
  const categories = [
    { key: 'draw', name: '绘制命令', color: 'blue' },
    { key: 'shape', name: '图形命令', color: 'green' },
    { key: 'node', name: '节点命令', color: 'purple' },
    { key: 'style', name: '样式命令', color: 'orange' },
    { key: 'color', name: '颜色值', color: 'pink' },
    { key: 'linewidth', name: '线宽值', color: 'indigo' },
    { key: 'linestyle', name: '线型值', color: 'cyan' },
    { key: 'opacity', name: '透明度', color: 'teal' },
    { key: 'transform', name: '变换命令', color: 'yellow' },
    { key: 'math', name: '数学函数', color: 'red' },
    { key: 'greek', name: '希腊字母', color: 'emerald' },
    { key: 'symbol', name: '数学符号', color: 'violet' },
    { key: 'arrow', name: '箭头样式', color: 'slate' }
  ];

  // TikZ 示例
  const examples = [
    {
      title: '基本图形',
      code: `\\draw [thick] (0,0) -- (2,2);
\\fill [blue!30] (1,1) circle (0.5cm);
\\draw [dashed] (0,0) rectangle (3,2);`,
      description: '直线、填充圆形和虚线矩形'
    },
    {
      title: '节点和标签',
      code: `\\node at (0,0) {A};
\\node [right] at (2,2) {$B_1$};
\\coordinate (C) at (1.5,1);`,
      description: '节点标签和坐标定义'
    },
    {
      title: '箭头和路径',
      code: `\\draw [->] (0,0) -- (2,1);
\\draw [<->] (1,0) arc (0:90:1cm);
\\draw [thick, red] (0,0) to [bend left] (2,2);`,
      description: '各种箭头和弯曲路径'
    },
    {
      title: '样式和颜色',
      code: `\\draw [red, thick, dashed] (0,0) -- (2,2);
\\fill [green!50, opacity=0.7] (1,1) ellipse (0.3 and 0.2);
\\draw [blue, line width=2pt] (0,0) circle (1cm);`,
      description: '颜色、线宽和透明度设置'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* 页面标题 */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            TikZ 支持
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            完整的 TikZ 符号库和语法支持，包含语法高亮、智能自动补全和实时预览
          </p>
        </div>

                  {/* 功能特性 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 text-center border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300">
              <div className="flex justify-center mb-4">
                <Palette className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">语法高亮</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                智能识别 TikZ 命令、样式参数、数学符号等，提供清晰的语法高亮
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 text-center border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300">
              <div className="flex justify-center mb-4">
                <Zap className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">智能补全</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                支持命令和样式参数的智能自动补全，提高编写效率
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 text-center border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300">
              <div className="flex justify-center mb-4">
                <Eye className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">实时预览</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                前端模拟的 TikZ 渲染，无需后端编译即可实时预览图形效果
              </p>
            </div>
          </div>

        {/* TikZ 示例 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-12 border border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center flex items-center justify-center gap-2">
            <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            TikZ 示例
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {examples.map((example, index) => (
              <div
                key={index}
                className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 border border-gray-200 dark:border-gray-600 hover:shadow-md transition-shadow duration-200"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {example.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                  {example.description}
                </p>
                
                {/* 代码区域 */}
                <div className="mb-4">
                  <pre className="bg-gray-800 dark:bg-gray-900 text-gray-100 p-4 rounded-lg text-sm font-mono overflow-x-auto border">
                    {example.code}
                  </pre>
                </div>
                
                {/* 渲染按钮和预览 */}
                <div className="space-y-3">
                  <button
                    onClick={() => setSelectedExample(selectedExample === example.code ? null : example.code)}
                    className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors duration-200 font-medium"
                  >
                    {selectedExample === example.code ? '隐藏渲染' : '帮我渲染一下'}
                  </button>
                  
                  {selectedExample === example.code && (
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">渲染结果：</h4>
                      <TikZPreview
                        code={example.code}
                        format="svg"
                        width={300}
                        height={200}
                        showGrid={true}
                        showTitle={false}
                        className="w-full"
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* TikZ 符号库 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center justify-center gap-2">
              <BookOpen className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              TikZ 符号库
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              支持 {allSymbols.length} 个 TikZ 命令和符号，按类别分组显示
            </p>
          </div>

          {/* 符号分类 */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-8">
            {categories.map((category) => {
              const categorySymbols = getTikZSymbolsByCategory(category.key);
              const colorClasses = {
                blue: 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
                green: 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800',
                purple: 'bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800',
                orange: 'bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800',
                pink: 'bg-pink-100 dark:bg-pink-900/50 text-pink-700 dark:text-pink-300 border-pink-200 dark:border-pink-800',
                indigo: 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
                cyan: 'bg-cyan-100 dark:bg-cyan-900/50 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800',
                teal: 'bg-teal-100 dark:bg-teal-900/50 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800',
                yellow: 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800',
                red: 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800',
                emerald: 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
                violet: 'bg-violet-100 dark:bg-violet-900/50 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-800',
                slate: 'bg-slate-100 dark:bg-slate-900/50 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800'
              };
              
              return (
                <div
                  key={category.key}
                  className={`rounded-lg p-4 border-2 text-center hover:shadow-md transition-all duration-200 cursor-pointer ${colorClasses[category.color as keyof typeof colorClasses]}`}
                  onClick={() => {
                    const element = document.getElementById(`category-${category.key}`);
                    if (element) {
                      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                  }}
                >
                  <div className="font-semibold text-sm mb-1">{category.name}</div>
                  <div className="text-xs opacity-75">{categorySymbols.length} 个</div>
                </div>
              );
            })}
          </div>

          {/* 符号列表 - 添加滚动效果 */}
          <div className="max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-gray-100 dark:scrollbar-track-gray-800">
            <div className="space-y-6 pr-2">
              {categories.map((category) => {
                const categorySymbols = getTikZSymbolsByCategory(category.key);
                
                return (
                  <div key={category.key} id={`category-${category.key}`}>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-600">
                      {category.name} ({categorySymbols.length})
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {categorySymbols.map((symbol, index) => {
                        const getCategoryColor = (category: string) => {
                          const colors = {
                            draw: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
                            shape: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
                            node: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800',
                            style: 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800',
                            color: 'bg-pink-50 dark:bg-pink-900/20 border-pink-200 dark:border-pink-800',
                            linewidth: 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800',
                            linestyle: 'bg-cyan-50 dark:bg-cyan-900/20 border-cyan-200 dark:border-cyan-800',
                            opacity: 'bg-teal-50 dark:bg-teal-900/20 border-teal-200 dark:border-teal-800',
                            transform: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800',
                            math: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
                            greek: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800',
                            symbol: 'bg-violet-50 dark:bg-violet-900/20 border-violet-200 dark:border-violet-800',
                            arrow: 'bg-slate-50 dark:bg-slate-900/20 border-slate-200 dark:border-slate-800'
                          };
                          return colors[category as keyof typeof colors] || 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800';
                        };

                        return (
                          <div
                            key={index}
                            className={`border rounded-lg p-4 hover:shadow-md transition-all duration-200 ${getCategoryColor(symbol.category)}`}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <code className="text-sm font-mono font-bold text-gray-900 dark:text-white bg-white dark:bg-gray-800 px-2 py-1 rounded">
                                {symbol.latex}
                              </code>
                            </div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                              {symbol.name}
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                              {symbol.description}
                            </div>
                            {symbol.examples && symbol.examples.length > 0 && (
                              <div className="mt-3">
                                <div className="text-xs text-gray-500 dark:text-gray-500 mb-1 font-medium">示例：</div>
                                {symbol.examples.slice(0, 1).map((example, idx) => (
                                  <code
                                    key={idx}
                                    className="block text-xs bg-gray-800 dark:bg-gray-900 text-gray-100 px-2 py-1 rounded font-mono overflow-x-auto"
                                  >
                                    {example}
                                  </code>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TikZSupport;
