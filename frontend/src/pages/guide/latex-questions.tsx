import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  CheckCircle,
  AlertCircle,
  Lightbulb,
  CheckSquare,
  Type,
  List,
  ListOrdered,
  Target,
  Eye
} from 'lucide-react';
import GuideNavigation from '../../components/guide/GuideNavigation';
import CodeExample from '../../components/guide/CodeExample';

const LaTeXQuestionsGuide: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'choice' | 'fill' | 'subp' | 'examples'>('overview');

  const tabs = [
    { id: 'overview', name: '概述', icon: BookOpen },
    { id: 'choice', name: '选择题', icon: CheckSquare },
    { id: 'fill', name: '填空题', icon: Type },
    { id: 'subp', name: '小题', icon: List },
    { id: 'examples', name: '实用示例', icon: Eye }
  ];

  const renderOverview = () => (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-8">
        <h2 className="text-3xl font-bold text-green-800 dark:text-green-200 mb-4">
          LaTeX 题目语法完整指南
        </h2>
        <p className="text-lg text-green-700 dark:text-green-300 leading-relaxed mb-6">
          学习如何使用LaTeX编写各种类型的题目，包括选择题、填空题、解答题等。
          我们的编辑器提供了专门的题目符号和语法支持，让题目编写更加规范和高效。
        </p>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mb-4">
              <CheckSquare className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">选择题</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">\\choice 语法，渲染为选择题括号</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-4">
              <Type className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">填空题</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">\\fill 语法，渲染为填空下划线</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mb-4">
              <List className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">小题</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">\\subp 语法，渲染为小题标记</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center mb-4">
              <ListOrdered className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">子小题</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">\\subsubp 语法，渲染为子小题标记</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
            <CheckCircle className="w-6 h-6 text-green-500" />
            题目语法特点
          </h3>
          <div className="space-y-3 text-gray-700 dark:text-gray-300">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
              <span>专门的题目符号命令</span>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
              <span>自动编号和格式化</span>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
              <span>与数学公式完美结合</span>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
              <span>支持中文和英文混合</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
            <Lightbulb className="w-6 h-6 text-yellow-500" />
            使用建议
          </h3>
          <div className="space-y-3 text-gray-700 dark:text-gray-300">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0" />
              <span>使用题目符号面板快速插入</span>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0" />
              <span>保持题目格式的一致性</span>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0" />
              <span>合理使用小题和子小题</span>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0" />
              <span>结合数学公式编写题目</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-2xl p-8">
        <h3 className="text-2xl font-bold text-blue-800 dark:text-blue-200 mb-6 text-center">
          重要提示
        </h3>
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            题目语法说明
          </h4>
          <p className="text-blue-700 dark:text-blue-300 text-sm">
            我们的LaTeX编辑器提供了专门的题目语法支持。这些命令会渲染为特定的格式，
            让题目编写更加规范和美观。所有题目语法都可以与数学公式完美结合使用。
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-3">支持的功能</h4>
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-blue-700 dark:text-blue-300">
                  选择题语法（\\choice）
                </span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-blue-700 dark:text-blue-300">
                  填空题语法（\\fill）
                </span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-blue-700 dark:text-blue-300">
                  小题结构（\\subp、\\subsubp）
                </span>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-3">使用建议</h4>
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <Lightbulb className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-blue-700 dark:text-blue-300">
                  开启实时预览检查渲染效果
                </span>
              </div>
              <div className="flex items-start gap-2">
                <Lightbulb className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-blue-700 dark:text-blue-300">
                  保持题目格式的一致性
                </span>
              </div>
              <div className="flex items-start gap-2">
                <Lightbulb className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-blue-700 dark:text-blue-300">
                  合理使用小题和子小题结构
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderChoice = () => (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-2xl p-8">
        <h2 className="text-3xl font-bold text-blue-800 dark:text-blue-200 mb-4">
          选择题语法
        </h2>
        <p className="text-lg text-blue-700 dark:text-blue-300 leading-relaxed">
          学习如何使用LaTeX编写选择题，包括题目内容、选项和答案的格式规范。
          使用 \\choice 命令创建选择题括号，每个 \\choice 渲染为一个（　　　　）。
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <CodeExample
          title="选择题基本结构"
          code={`已知函数 $f(x) = x^2 + 1$，则 $f'(x) = $ \\choice

A. $2x$
B. $x^2$
C. $x + 1$
D. $2x + 1$`}
          description="选择题包含题目（使用 \\choice 标记）和选项（A、B、C、D）"
        />

        <CodeExample
          title="选择题示例"
          code={`已知函数 $f(x) = \\frac{1}{x^2 + 1}$，则 $f'(x) = $ \\choice

A. $\\frac{-2x}{(x^2 + 1)^2}$
B. $\\frac{2x}{(x^2 + 1)^2}$
C. $\\frac{1}{(x^2 + 1)^2}$
D. $\\frac{-1}{(x^2 + 1)^2}$`}
          description="使用 \\choice 命令标记题目中的（　　　　），选项用 A、B、C、D 标记"
        />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          选择题编写技巧
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-yellow-500" />
              格式建议
            </h4>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li>• 题目描述要清晰明确</li>
              <li>• 选项数量保持一致（通常4个）</li>
              <li>• 选项长度尽量相近</li>
              <li>• 使用数学公式时用 $...$ 包围</li>
              <li>• 每个选项单独一行</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-500" />
              常见用法
            </h4>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li>• 数学计算题</li>
              <li>• 概念理解题</li>
              <li>• 图形分析题</li>
              <li>• 逻辑推理题</li>
              <li>• 综合应用题</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  const renderFill = () => (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl p-8">
        <h2 className="text-3xl font-bold text-purple-800 dark:text-purple-200 mb-4">
          填空题语法
        </h2>
        <p className="text-lg text-purple-700 dark:text-purple-300 leading-relaxed">
          学习如何使用LaTeX编写填空题，包括题目内容、空白标记和答案的格式规范。
          使用 \\fill 命令标记空白处，每个 \\fill 渲染为一个下划线空白。
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <CodeExample
          title="填空题基本结构"
          code={`若 $\\lim_{x \\to 0} \\frac{\\sin x}{x} = $ \\fill，则 \\fill $= 1$

\\fill 表示一个空白
\\fill \\fill 表示两个空白
\\fill \\quad \\fill 表示带间距的空白`}
          description="填空题使用 \\fill 命令标记空白处，可以调整空白数量和间距"
        />

        <CodeExample
          title="填空题示例"
          code={`已知函数 $f(x) = x^2 + 2x + 1$，则：

当 $x = $ \\fill 时，$f(x) = 0$
函数的最小值为 \\fill
对称轴方程为 $x = $ \\fill`}
          description="使用 \\fill 命令标记空白处的填空题"
        />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          填空题编写技巧
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-yellow-500" />
              格式建议
            </h4>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li>• 空白处数量要合理</li>
              <li>• 空白长度要适中</li>
              <li>• 使用 \\quad 调整空白间距</li>
              <li>• 数学公式用 $...$ 包围</li>
              <li>• 题目描述要清晰</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-500" />
              常见用法
            </h4>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li>• 数值计算题</li>
              <li>• 公式推导题</li>
              <li>• 概念填空题</li>
              <li>• 步骤填空题</li>
              <li>• 综合填空题</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSubp = () => (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-2xl p-8">
        <h2 className="text-3xl font-bold text-orange-800 dark:text-orange-200 mb-4">
          小题语法
        </h2>
        <p className="text-lg text-orange-700 dark:text-orange-300 leading-relaxed">
          学习如何使用LaTeX编写小题和子小题，包括编号系统和格式规范。
          使用 \\subp 和 \\subsubp 命令创建小题结构，分别标记为(小题)和(子小题)。
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <CodeExample
          title="小题基本结构"
          code={`\\subp 求函数 $f(x) = x^2 + 1$ 的导数。

\\subsubp 求 $f'(0)$ 的值。

\\subsubp 求函数 $f(x)$ 在区间 $[-1, 1]$ 上的最值。`}
          description="使用 \\subp 标记小题，\\subsubp 标记子小题，自动编号"
        />

        <CodeExample
          title="小题结构示例"
          code={`已知函数 $f(x) = x^3 - 3x^2 + 2$

\\subp 求函数 $f(x)$ 的单调区间

\\subsubp 求函数 $f(x)$ 的极值点

\\subsubp 求函数 $f(x)$ 在区间 $[0, 3]$ 上的最值

\\subp 求函数 $f(x)$ 的图像与 $x$ 轴的交点个数

\\subsubp 求函数 $f(x)$ 的图像与 $y$ 轴的交点坐标`}
          description="使用 \\subp 和 \\subsubp 命令创建小题和子小题结构"
        />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          小题编写技巧
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-yellow-500" />
              结构建议
            </h4>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li>• 小题数量要合理（通常2-4个）</li>
              <li>• 子小题数量适中（通常2-3个）</li>
              <li>• 难度递进，由易到难</li>
              <li>• 逻辑关系要清晰</li>
              <li>• 避免过度嵌套</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-500" />
              常见用法
            </h4>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li>• 函数分析题</li>
              <li>• 几何证明题</li>
              <li>• 概率统计题</li>
              <li>• 综合应用题</li>
              <li>• 证明题</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  const renderExamples = () => (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-2xl p-8">
        <h2 className="text-3xl font-bold text-indigo-800 dark:text-indigo-200 mb-4">
          综合示例
        </h2>
        <p className="text-lg text-indigo-700 dark:text-indigo-300 leading-relaxed">
          通过这些综合示例，学习如何组合使用各种题目语法编写完整的题目。
          左侧显示LaTeX代码，右侧显示真实的渲染结果。
        </p>
      </div>

      <div className="space-y-6">

        <CodeExample
          title="解答题 + 小题结构"
          code={`已知函数 $f(x) = x^3 - 3x^2 + 2$

\\subp 求函数 $f(x)$ 的单调区间

\\subsubp 求函数 $f(x)$ 的极值点

\\subsubp 求函数 $f(x)$ 在区间 $[0, 3]$ 上的最值

\\subp 求函数 $f(x)$ 的图像与 $x$ 轴的交点个数

\\subsubp 求函数 $f(x)$ 的图像与 $y$ 轴的交点坐标`}
          description="使用小题和子小题结构的解答题"
        />

        <CodeExample
          title="数学公式 + 题目语法"
          code={`已知函数 $f(x) = \\frac{x^2 + 1}{x - 1}$，回答下列问题：

\\subp 求函数 $f(x)$ 的定义域

\\subsubp 求 $\\lim_{x \\to 1} f(x)$ 的值

\\subsubp 求函数 $f(x)$ 的导数

\\subp 判断函数 $f(x)$ 的单调性

A. 在 $(-\\infty, 1)$ 上单调递增

B. 在 $(1, +\\infty)$ 上单调递减

C. 在定义域内单调递增

D. 在定义域内单调递减`}
          description="结合数学公式和题目语法的复杂题目"
        />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          使用技巧和注意事项
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-yellow-500" />
              编写技巧
            </h4>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li>• 保持题目格式的一致性</li>
              <li>• 合理使用小题和子小题</li>
              <li>• 数学公式用 $...$ 包围</li>
              <li>• 使用符号面板快速插入</li>
              <li>• 开启实时预览检查效果</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              注意事项
            </h4>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li>• 确保命令语法正确</li>
              <li>• 避免过度嵌套小题</li>
              <li>• 保持题目逻辑清晰</li>
              <li>• 合理分配题目难度</li>
              <li>• 检查渲染效果</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-8">
        <h3 className="text-2xl font-bold text-green-800 dark:text-green-200 mb-4 text-center">
          开始实践
        </h3>
        <p className="text-green-700 dark:text-green-300 text-center mb-6">
          现在您已经了解了题目语法的使用方法，可以开始在编辑器中实践了！
        </p>
        <div className="flex justify-center">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-lg">
            <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">快速入门建议：</h4>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>• 使用题目符号面板快速插入</li>
              <li>• 开启实时预览功能查看效果</li>
              <li>• 从简单题目开始，逐步尝试复杂结构</li>
              <li>• 参考本指南中的示例代码</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <GuideNavigation 
        title="LaTeX 题目语法" 
        description="学习LaTeX题目编写和格式规范的完整指南"
      />

      {/* 导航标签 */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex flex-wrap justify-center gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-green-600 text-white shadow-lg'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.name}
            </button>
          ))}
        </div>
      </div>

      {/* 内容区域 */}
      <div className="max-w-7xl mx-auto px-6 pb-12">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'choice' && renderChoice()}
          {activeTab === 'fill' && renderFill()}
          {activeTab === 'subp' && renderSubp()}
          {activeTab === 'examples' && renderExamples()}
        </motion.div>
      </div>
    </div>
  );
};

export default LaTeXQuestionsGuide;
