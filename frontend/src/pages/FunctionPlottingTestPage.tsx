import React, { useState } from 'react';
import { TikZPreview } from '../components/tikz/core/TikZPreview';

const FunctionPlottingTestPage: React.FC = () => {
  const [testCode, setTestCode] = useState(`\\begin{axis}[
  title={函数绘图测试},
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
\\end{axis}`);

  const [simpleFunction, setSimpleFunction] = useState(`\\begin{axis}[
  title={简单函数},
  xlabel={$x$},
  ylabel={$y$},
  xmin=-3, xmax=3,
  ymin=-1, ymax=9,
  grid=major
]
\\addplot[color=green, line width=2pt]{x^2};
\\end{axis}`);

  const [polynomialFunction, setPolynomialFunction] = useState(`\\begin{axis}[
  title={多项式函数},
  xlabel={$x$},
  ylabel={$y$},
  xmin=-2, xmax=4,
  ymin=-2, ymax=8,
  grid=major
]
\\addplot[color=purple, line width=2pt]{x^3 - 2*x^2 + 1};
\\end{axis}`);

  const [exponentialFunction, setExponentialFunction] = useState(`\\begin{axis}[
  title={指数函数},
  xlabel={$x$},
  ylabel={$y$},
  xmin=-2, xmax=3,
  ymin=0, ymax=20,
  grid=major
]
\\addplot[color=orange, line width=2pt]{2^x};
\\end{axis}`);

  const [traditionalTikZ, setTraditionalTikZ] = useState(`\\begin{tikzpicture}
\\draw[thick, blue] (0,0) circle (1);
\\draw[red] (0,0) -- (1,1);
\\node[right] at (1,1) {点};
\\end{tikzpicture}`);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          🎯 PGFPlots 函数绘图测试页面
        </h1>
        
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* 三角函数测试 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              📐 三角函数测试 (sin, cos)
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  代码输入:
                </label>
                <textarea
                  value={testCode}
                  onChange={(e) => setTestCode(e.target.value)}
                  rows={12}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  渲染结果:
                </label>
                <div className="border border-gray-300 dark:border-gray-600 rounded-md overflow-hidden bg-white dark:bg-gray-900">
                  <TikZPreview
                    code={testCode}
                    width={400}
                    height={300}
                    showGrid={false}
                    showTitle={false}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 简单函数测试 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              📈 简单函数测试 (x²)
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  代码输入:
                </label>
                <textarea
                  value={simpleFunction}
                  onChange={(e) => setSimpleFunction(e.target.value)}
                  rows={10}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  渲染结果:
                </label>
                <div className="border border-gray-300 dark:border-gray-600 rounded-md overflow-hidden bg-white dark:bg-gray-900">
                  <TikZPreview
                    code={simpleFunction}
                    width={400}
                    height={300}
                    showGrid={false}
                    showTitle={false}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 多项式函数测试 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              🎯 多项式函数测试 (x³ - 2x² + 1)
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  代码输入:
                </label>
                <textarea
                  value={polynomialFunction}
                  onChange={(e) => setPolynomialFunction(e.target.value)}
                  rows={10}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  渲染结果:
                </label>
                <div className="border border-gray-300 dark:border-gray-600 rounded-md overflow-hidden bg-white dark:bg-gray-900">
                  <TikZPreview
                    code={polynomialFunction}
                    width={400}
                    height={300}
                    showGrid={false}
                    showTitle={false}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 指数函数测试 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              🚀 指数函数测试 (2ˣ)
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  代码输入:
                </label>
                <textarea
                  value={exponentialFunction}
                  onChange={(e) => setExponentialFunction(e.target.value)}
                  rows={10}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  渲染结果:
                </label>
                <div className="border border-gray-300 dark:border-gray-600 rounded-md overflow-hidden bg-white dark:bg-gray-900">
                  <TikZPreview
                    code={exponentialFunction}
                    width={400}
                    height={300}
                    showGrid={false}
                    showTitle={false}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 传统 TikZ 对比测试 */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            🔄 传统 TikZ 对比测试
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                传统 TikZ 代码:
              </label>
              <textarea
                value={traditionalTikZ}
                onChange={(e) => setTraditionalTikZ(e.target.value)}
                rows={8}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                传统 TikZ 渲染结果:
              </label>
              <div className="border border-gray-300 dark:border-gray-600 rounded-md overflow-hidden bg-white dark:bg-gray-900">
                <TikZPreview
                  code={traditionalTikZ}
                  width={400}
                  height={300}
                  showGrid={true}
                  showTitle={false}
                />
              </div>
            </div>
          </div>
        </div>

        {/* 调试信息 */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            🔍 调试信息
          </h2>
          <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <p>• 三角函数代码包含: {testCode.includes('\\begin{axis}') ? '✅ 是' : '❌ 否'}</p>
            <p>• 简单函数代码包含: {simpleFunction.includes('\\addplot') ? '✅ 是' : '❌ 否'}</p>
            <p>• 多项式函数代码包含: {polynomialFunction.includes('x^3') ? '✅ 是' : '❌ 否'}</p>
            <p>• 指数函数代码包含: {exponentialFunction.includes('2^x') ? '✅ 是' : '❌ 否'}</p>
            <p>• 传统 TikZ 代码包含: {traditionalTikZ.includes('\\begin{tikzpicture}') ? '✅ 是' : '❌ 否'}</p>
            <p>• 代码长度统计:</p>
            <ul className="ml-4 space-y-1">
              <li>• 三角函数: {testCode.length} 字符</li>
              <li>• 简单函数: {simpleFunction.length} 字符</li>
              <li>• 多项式函数: {polynomialFunction.length} 字符</li>
              <li>• 指数函数: {exponentialFunction.length} 字符</li>
              <li>• 传统 TikZ: {traditionalTikZ.length} 字符</li>
            </ul>
          </div>
        </div>

        {/* 使用说明 */}
        <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-blue-900 dark:text-blue-100 mb-4">
            📖 使用说明
          </h2>
          <div className="text-blue-800 dark:text-blue-200 space-y-2">
            <p>• 这个页面专门用于测试 PGFPlots 函数绘图功能</p>
            <p>• 左侧输入代码，右侧查看渲染结果</p>
            <p>• 可以修改代码来测试不同的函数和参数</p>
            <p>• 如果函数没有正确显示，请检查控制台错误信息</p>
            <p>• 支持各种数学函数：三角函数、多项式、指数、对数等</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FunctionPlottingTestPage;
