import React, { useState } from 'react';
import { TikZPreview } from '../components/tikz/core/TikZPreview';

// TikZ 函数绘制测试页面
const TikZFunctionTestPage: React.FC = () => {
  const [selectedExample, setSelectedExample] = useState<string>('quadratic');

  // 预定义的 TikZ 函数绘制示例
  const examples = {
    quadratic: {
      name: '二次函数',
      code: `
\\draw[red, dashed] plot[domain=-3:3, samples=100] {x^2 + 1};`
    },
    trigonometric: {
      name: '三角函数',
      code: `% 三角函数图像
\\tikzset{xmin=-2*pi, xmax=2*pi, ymin=-2, ymax=2, grid, ticks}
\\draw[blue, thick] plot[domain=-2*pi:2*pi, samples=200] {sin(x)};
\\draw[red, thick] plot[domain=-2*pi:2*pi, samples=200] {cos(x)};
\\draw[green, dashed] plot[domain=-2*pi:2*pi, samples=200] {tan(x)};`
    },
    exponential: {
      name: '指数函数',
      code: `% 指数函数图像
\\tikzset{xmin=-2, xmax=4, ymin=0, ymax=20, grid, ticks}
\\draw[blue, thick] plot[domain=-2:4, samples=100] {exp(x)};
\\draw[red, dashed] plot[domain=-2:4, samples=100] {2^x};
\\draw[green, dotted] plot[domain=-2:4, samples=100] {0.5^x};`
    },
    logarithmic: {
      name: '对数函数',
      code: `% 对数函数图像
\\tikzset{xmin=0.1, xmax=5, ymin=-2, ymax=2, grid, ticks}
\\draw[blue, thick] plot[domain=0.1:5, samples=100] {ln(x)};
\\draw[red, dashed] plot[domain=0.1:5, samples=100] {log(x)};`
    },
    polynomial: {
      name: '多项式函数',
      code: `% 多项式函数图像
\\tikzset{xmin=-4, xmax=4, ymin=-10, ymax=10, grid, ticks}
\\draw[blue, thick] plot[domain=-4:4, samples=200] {x^3 - 3*x};
\\draw[red, dashed] plot[domain=-4:4, samples=200] {x^4 - 5*x^2 + 4};
\\draw[green, dotted] plot[domain=-4:4, samples=200] {x^2 - 4};`
    },
    rational: {
      name: '有理函数',
      code: `% 有理函数图像
\\tikzset{xmin=-5, xmax=5, ymin=-5, ymax=5, grid, ticks}
\\draw[blue, thick] plot[domain=-5:-0.1, samples=100] {1/x};
\\draw[blue, thick] plot[domain=0.1:5, samples=100] {1/x};
\\draw[red, dashed] plot[domain=-5:-0.1, samples=100] {x/(x^2+1)};
\\draw[red, dashed] plot[domain=0.1:5, samples=100] {x/(x^2+1)};`
    },
    custom: {
      name: '自定义函数',
      code: `% 自定义函数图像
\\tikzset{xmin=-3, xmax=3, ymin=-3, ymax=3, grid, ticks}
\\draw[blue, thick] plot[domain=-3:3, samples=200] {sin(x)*cos(x)};
\\draw[red, dashed] plot[domain=-3:3, samples=200] {sqrt(4-x^2)};
\\draw[green, dotted] plot[domain=-3:3, samples=200] {-sqrt(4-x^2)};`
    }
  };

  const currentExample = examples[selectedExample as keyof typeof examples];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            TikZ 函数绘制测试
          </h1>
          <p className="text-gray-600 text-lg">
            纯 TikZ 实现，支持函数绘制、坐标轴、网格等。无需 PGFPlots 包！
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 左侧：代码编辑和预览 */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                函数绘制代码
              </h2>
              
              {/* 示例选择器 */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  选择示例：
                </label>
                <select
                  value={selectedExample}
                  onChange={(e) => setSelectedExample(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {Object.entries(examples).map(([key, example]) => (
                    <option key={key} value={key}>
                      {example.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* 代码编辑器 */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  TikZ 代码：
                </label>
                <textarea
                  value={currentExample.code}
                  readOnly
                  className="w-full h-64 px-3 py-2 border border-gray-300 rounded-md shadow-sm font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="输入 TikZ 代码..."
                />
              </div>

              <div className="text-sm text-gray-600 space-y-2">
                <p><strong>语法说明：</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li><code>tikzset options</code> - 设置坐标轴选项</li>
                  <li><code>draw[options] plot[domain=xmin:xmax, samples=N] function</code> - 绘制函数</li>
                  <li><code>grid</code> - 显示网格线</li>
                  <li><code>ticks</code> - 显示刻度</li>
                  <li><code>thick</code>, <code>dashed</code>, <code>dotted</code> - 线条样式</li>
                </ul>
              </div>
            </div>
          </div>

          {/* 右侧：渲染结果 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              渲染结果
            </h2>
            
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <TikZPreview
                code={currentExample.code}
                width={500}
                height={400}
                showGrid={true}
                className="w-full"
              />
            </div>

            <div className="mt-4 text-sm text-gray-600">
              <p><strong>功能特性：</strong></p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>✅ 纯 TikZ 实现，无需额外包</li>
                <li>✅ 支持数学函数：sin, cos, tan, log, exp, sqrt 等</li>
                <li>✅ 可配置的坐标轴范围</li>
                <li>✅ 可选的网格线和刻度</li>
                <li>✅ 带箭头的坐标轴</li>
                <li>✅ 多种线条样式和颜色</li>
                <li>✅ 自动采样和插值</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 更多示例说明 */}
        <div className="mt-12 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            更多 TikZ 函数绘制语法
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">基本语法</h3>
              <div className="bg-gray-50 p-4 rounded-md font-mono text-sm">
                <p>draw[color, style] plot[domain=xmin:xmax, samples=N] function;</p>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">常用函数</h3>
              <div className="bg-gray-50 p-4 rounded-md font-mono text-sm space-y-1">
                <p>sin(x), cos(x), tan(x)</p>
                <p>log(x), ln(x), exp(x)</p>
                <p>sqrt(x), abs(x)</p>
                <p>x^n, pi, e</p>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">样式选项</h3>
              <div className="bg-gray-50 p-4 rounded-md font-mono text-sm space-y-1">
                <p>thick, thin</p>
                <p>solid, dashed, dotted</p>
                <p>red, blue, green</p>
                <p>smooth</p>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">坐标轴设置</h3>
              <div className="bg-gray-50 p-4 rounded-md font-mono text-sm space-y-1">
                <p>xmin, xmax, ymin, ymax</p>
                <p>grid, no grid</p>
                <p>ticks, no ticks</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TikZFunctionTestPage;
