import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  CheckCircle,
  AlertCircle,
  Lightbulb,
  Sigma,
  Brain,
  Eye,
  FileText
} from 'lucide-react';
import GuideNavigation from '../../components/guide/GuideNavigation';
import CodeExample from '../../components/guide/CodeExample';
import { LaTeXRenderer } from '../../lib/latex/renderer/LaTeXRenderer';

const LaTeXMathGuide: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'symbols' | 'environments' | 'examples'>('overview');
  const latexRenderer = new LaTeXRenderer({ mode: 'full' });

  const tabs = [
    { id: 'overview', name: '概述', icon: BookOpen },
    { id: 'symbols', name: '数学符号', icon: Sigma },
    { id: 'environments', name: '数学环境', icon: FileText },
    { id: 'examples', name: '实用示例', icon: Eye }
  ];

  const renderOverview = () => (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-2xl p-8">
        <h2 className="text-3xl font-bold text-blue-800 dark:text-blue-200 mb-4">
          LaTeX 数学公式完整指南
        </h2>
        <p className="text-lg text-blue-700 dark:text-blue-300 leading-relaxed mb-6">
          我们的 LaTeX 编辑器专为数学公式编写设计，提供完整的数学符号支持、智能补全、实时预览等功能.
          虽然主要面向题目编写，但也支持许多高级LaTeX功能.无需复杂的文档结构，专注于数学内容的快速编写.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-4">
              <Brain className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">智能补全</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              基于KaTeX的智能命令补全，支持常用数学符号和语法的快速输入.
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mb-4">
              <Eye className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">实时预览</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              实时渲染LaTeX内容，所见即所得的编辑体验，支持数学公式和高级语法.
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mb-4">
              <Sigma className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">丰富符号</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              完整的数学符号库和高级LaTeX功能，通过符号面板快速插入常用符号.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          重要提示
        </h3>
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            数学模式说明
          </h4>
          <p className="text-blue-700 dark:text-blue-300 text-sm">
            我们的LaTeX编辑器只支持 $...$（行内公式）和 $$...$$（块级公式）数学模式，
            不支持 \(...\) 格式.请确保所有数学公式都使用正确的美元符号包围.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">支持的功能</h4>
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  基础数学符号和运算
                </span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  高级LaTeX功能（\binom、矩阵等）
                </span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  数学环境和多行对齐
                </span>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">使用建议</h4>
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <Lightbulb className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  使用符号面板快速插入常用符号
                </span>
              </div>
              <div className="flex items-start gap-2">
                <Lightbulb className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  开启实时预览检查公式效果
                </span>
              </div>
              <div className="flex items-start gap-2">
                <Lightbulb className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  从简单公式开始，逐步尝试复杂功能
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderBasics = () => (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-8">
        <h2 className="text-3xl font-bold text-green-800 dark:text-green-200 mb-4">
          数学符号完整指南
        </h2>
        <p className="text-lg text-green-700 dark:text-green-300 leading-relaxed">
          学习LaTeX数学公式的完整符号系统，包括基础运算、高级数学符号、函数、积分、极限等.
          所有符号都使用正确的LaTeX语法（单斜杠）.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            数学模式
          </h3>
          <div className="space-y-4">
            {[
              { name: '行内公式', code: '$x^2 + y^2 = z^2$', desc: '在文本中嵌入数学公式' },
              { name: '块级公式', code: '$$\\int_0^1 x^2 dx$$', desc: '独立成行的数学公式' }
            ].map((mode, idx) => (
              <div key={idx} className="border-b border-gray-200 dark:border-gray-600 pb-3 last:border-b-0">
                <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">{mode.name}</h4>
                <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded font-mono text-xs text-gray-800 dark:text-gray-200 block mb-2">
                  {mode.code}
                </code>
                <p className="text-sm text-gray-600 dark:text-gray-400">{mode.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            基础运算符号
          </h3>
          <div className="space-y-4">
            {[
              { name: '算术运算', symbols: ['+', '-', '\\times', '\\div', '\\pm', '\\mp'] },
              { name: '关系符号', symbols: ['=', '\\neq', '<', '>', '\\leq', '\\geq'] },
              { name: '逻辑符号', symbols: ['\\forall', '\\exists', '\\land', '\\lor', '\\lnot', '\\implies'] }
            ].map((category, idx) => (
              <div key={idx} className="border-b border-gray-200 dark:border-gray-600 pb-3 last:border-b-0">
                <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">{category.name}</h4>
                <div className="flex flex-wrap gap-2">
                  {category.symbols.map((symbol, symIdx) => (
                    <code key={symIdx} className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs font-mono text-gray-800 dark:text-gray-200">
                      {symbol}
                    </code>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            分数和根式
          </h3>
          <div className="space-y-4">
            {[
              { name: '分数', code: '\\frac{a}{b}', desc: '使用\\frac{分子}{分母}' },
              { name: '根式', code: '\\sqrt{x}', desc: '使用\\sqrt{被开方数}' },
              { name: 'n次根', code: '\\sqrt[n]{x}', desc: '使用\\sqrt[n]{被开方数}' }
            ].map((item, idx) => (
              <div key={idx} className="border-b border-gray-200 dark:border-gray-600 pb-3 last:border-b-0">
                <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">{item.name}</h4>
                <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded font-mono text-xs text-gray-800 dark:text-gray-200 block mb-2">
                  {item.code}
                </code>
                <p className="text-sm text-gray-600 dark:text-gray-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            上下标和希腊字母
          </h3>
          <div className="space-y-4">
            {[
              { name: '上标', code: 'x^2', desc: '使用^上标内容' },
              { name: '下标', code: 'x_i', desc: '使用_下标内容' },
              { name: '希腊字母', code: '\\alpha, \\beta, \\gamma', desc: '常用希腊字母' }
            ].map((item, idx) => (
              <div key={idx} className="border-b border-gray-200 dark:border-gray-600 pb-3 last:border-b-0">
                <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">{item.name}</h4>
                <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded font-mono text-xs text-gray-800 dark:text-gray-200 block mb-2">
                  {item.code}
                </code>
                <p className="text-sm text-gray-600 dark:text-gray-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 数学符号库 */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6">
          数学符号库
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              category: '基础运算',
              symbols: [
                { latex: '+', desc: '加号', example: 'a + b' },
                { latex: '-', desc: '减号', example: 'a - b' },
                { latex: '\\times', desc: '乘号', example: 'a \\times b' },
                { latex: '\\div', desc: '除号', example: 'a \\div b' },
                { latex: '\\pm', desc: '正负号', example: 'a \\pm b' },
                { latex: '\\mp', desc: '负正号', example: 'a \\mp b' }
              ]
            },
            {
              category: '关系符号',
              symbols: [
                { latex: '=', desc: '等于', example: 'a = b' },
                { latex: '\\neq', desc: '不等于', example: 'a \\neq b' },
                { latex: '<', desc: '小于', example: 'a < b' },
                { latex: '>', desc: '大于', example: 'a > b' },
                { latex: '\\leq', desc: '小于等于', example: 'a \\leq b' },
                { latex: '\\geq', desc: '大于等于', example: 'a \\geq b' }
              ]
            },
            {
              category: '逻辑符号',
              symbols: [
                { latex: '\\forall', desc: '任意', example: '\\forall x' },
                { latex: '\\exists', desc: '存在', example: '\\exists x' },
                { latex: '\\land', desc: '且', example: 'A \\land B' },
                { latex: '\\lor', desc: '或', example: 'A \\lor B' },
                { latex: '\\lnot', desc: '非', example: '\\lnot A' },
                { latex: '\\implies', desc: '蕴含', example: 'A \\implies B' }
              ]
            },
            {
              category: '集合符号',
              symbols: [
                { latex: '\\in', desc: '属于', example: 'x \\in A' },
                { latex: '\\notin', desc: '不属于', example: 'x \\notin A' },
                { latex: '\\subset', desc: '真子集', example: 'A \\subset B' },
                { latex: '\\subseteq', desc: '子集', example: 'A \\subseteq B' },
                { latex: '\\cup', desc: '并集', example: 'A \\cup B' },
                { latex: '\\cap', desc: '交集', example: 'A \\cap B' }
              ]
            },
            {
              category: '希腊字母',
              symbols: [
                { latex: '\\alpha', desc: 'alpha', example: '\\alpha' },
                { latex: '\\beta', desc: 'beta', example: '\\beta' },
                { latex: '\\gamma', desc: 'gamma', example: '\\gamma' },
                { latex: '\\delta', desc: 'delta', example: '\\delta' },
                { latex: '\\epsilon', desc: 'epsilon', example: '\\epsilon' },
                { latex: '\\theta', desc: 'theta', example: '\\theta' }
              ]
            },
            {
              category: '特殊符号',
              symbols: [
                { latex: '\\infty', desc: '无穷大', example: '\\infty' },
                { latex: '\\partial', desc: '偏微分', example: '\\partial' },
                { latex: '\\nabla', desc: '梯度', example: '\\nabla' },
                { latex: '\\propto', desc: '正比于', example: '\\propto' },
                { latex: '\\approx', desc: '约等于', example: '\\approx' },
                { latex: '\\equiv', desc: '恒等于', example: '\\equiv' }
              ]
            },
            {
              category: '积分符号',
              symbols: [
                { latex: '\\int', desc: '积分', example: '\\int f(x) dx' },
                { latex: '\\iint', desc: '二重积分', example: '\\iint f(x,y) dxdy' },
                { latex: '\\iiint', desc: '三重积分', example: '\\iiint f(x,y,z) dxdydz' },
                { latex: '\\oint', desc: '曲线积分', example: '\\oint f(x) dx' },
                { latex: '\\int\\limits', desc: '带限积分', example: '\\int\\limits_{a}^{b}' }
              ]
            },
            {
              category: '求和与乘积',
              symbols: [
                { latex: '\\sum', desc: '求和', example: '\\sum_{i=1}^{n} a_i' },
                { latex: '\\prod', desc: '连乘', example: '\\prod_{i=1}^{n} a_i' },
                { latex: '\\coprod', desc: '余积', example: '\\coprod_{i=1}^{n} a_i' },
                { latex: '\\bigcup', desc: '大并集', example: '\\bigcup_{i=1}^{n} A_i' },
                { latex: '\\bigcap', desc: '大交集', example: '\\bigcap_{i=1}^{n} A_i' }
              ]
            },
            {
              category: '极限与收敛',
              symbols: [
                { latex: '\\lim', desc: '极限', example: '\\lim_{x \\to a}' },
                { latex: '\\liminf', desc: '下极限', example: '\\liminf_{n \\to \\infty}' },
                { latex: '\\limsup', desc: '上极限', example: '\\limsup_{n \\to \\infty}' },
                { latex: '\\inf', desc: '下确界', example: '\\inf_{x \\in A}' },
                { latex: '\\sup', desc: '上确界', example: '\\sup_{x \\in A}' }
              ]
            },
            {
              category: '组合与排列',
              symbols: [
                { latex: '\\binom{n}{k}', desc: '组合数', example: '\\binom{n}{k}' },
                { latex: '\\frac{n!}{k!(n-k)!}', desc: '组合数公式', example: '\\frac{n!}{k!(n-k)!}' },
                { latex: 'P(n,k)', desc: '排列数', example: 'P(n,k)' },
                { latex: 'C(n,k)', desc: '组合数', example: 'C(n,k)' }
              ]
            },
            {
              category: '微积分',
              symbols: [
                { latex: '\\frac{d}{dx}', desc: '导数', example: '\\frac{d}{dx} f(x)' },
                { latex: '\\frac{\\partial}{\\partial x}', desc: '偏导数', example: '\\frac{\\partial}{\\partial x}' },
                { latex: '\\nabla', desc: '梯度', example: '\\nabla f' },
                { latex: '\\Delta', desc: '拉普拉斯算子', example: '\\Delta f' },
                { latex: '\\partial', desc: '偏微分', example: '\\partial' }
              ]
            },
            {
              category: '集合论',
              symbols: [
                { latex: '\\emptyset', desc: '空集', example: '\\emptyset' },
                { latex: '\\mathbb{R}', desc: '实数集', example: '\\mathbb{R}' },
                { latex: '\\mathbb{Z}', desc: '整数集', example: '\\mathbb{Z}' },
                { latex: '\\mathbb{N}', desc: '自然数集', example: '\\mathbb{N}' },
                { latex: '\\mathbb{Q}', desc: '有理数集', example: '\\mathbb{Q}' },
                { latex: '\\mathbb{C}', desc: '复数集', example: '\\mathbb{C}' }
              ]
            }
          ].map((category, catIdx) => (
            <div key={catIdx} className="space-y-3">
              <h4 className="font-semibold text-gray-800 dark:text-gray-200 text-lg border-b border-gray-200 dark:border-gray-600 pb-2">
                {category.category}
              </h4>
              <div className="space-y-2">
                {category.symbols.map((symbol, symIdx) => (
                  <div key={symIdx} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <code className="bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded text-xs font-mono text-gray-800 dark:text-gray-200">
                        {symbol.latex}
                      </code>
                      <span className="text-xs text-gray-500 dark:text-gray-400">{symbol.desc}</span>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      示例：<span 
                        className="text-lg text-gray-800 dark:text-gray-200"
                        dangerouslySetInnerHTML={{ 
                          __html: latexRenderer.render(`$${symbol.example}$`).html 
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-2xl p-8">
        <h3 className="text-2xl font-bold text-indigo-800 dark:text-indigo-200 mb-6 text-center">
          数学符号支持说明
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-indigo-800 dark:text-indigo-200 mb-3 flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-indigo-500" />
              支持但未在符号面板显示
            </h4>
            <div className="space-y-3 text-indigo-700 dark:text-indigo-300">
              <p className="text-sm">
                虽然符号面板主要显示基础符号，但我们的编辑器基于KaTeX渲染引擎，支持许多高级LaTeX功能：
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2 flex-shrink-0" />
                  <span>组合数：\\binom{'{n}'}{'{k}'}</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2 flex-shrink-0" />
                  <span>矩阵环境：{`\\begin{pmatrix}...\\end{pmatrix}`}</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2 flex-shrink-0" />
                  <span>分段函数：{`\\left\\{\\begin{aligned}...\\end{aligned}\\right.`}</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2 flex-shrink-0" />
                  <span>多行对齐：{`\\begin{aligned}...\\end{aligned}`}</span>
                </li>
              </ul>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-indigo-800 dark:text-indigo-200 mb-3 flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-indigo-500" />
              使用建议
            </h4>
            <div className="space-y-3 text-indigo-700 dark:text-indigo-300">
              <p className="text-sm">
                对于高级LaTeX功能，建议：
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2 flex-shrink-0" />
                  <span>直接输入命令，编辑器会正确渲染</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2 flex-shrink-0" />
                  <span>使用实时预览功能检查渲染效果</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2 flex-shrink-0" />
                  <span>参考LaTeX文档了解完整语法</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2 flex-shrink-0" />
                  <span>从简单命令开始，逐步学习复杂功能</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderEnvironments = () => (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-2xl p-8">
        <h2 className="text-3xl font-bold text-orange-800 dark:text-orange-200 mb-4">
          数学环境
        </h2>
        <p className="text-lg text-orange-700 dark:text-orange-300 leading-relaxed">
          学习LaTeX中的各种数学环境，包括矩阵、对齐、分段函数等复杂数学结构.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            矩阵环境
          </h3>
          <div className="space-y-4">
            {[
              { latex: '\\begin{pmatrix}\\end{pmatrix}', desc: '圆括号矩阵', example: '\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}' },
              { latex: '\\begin{bmatrix}\\end{bmatrix}', desc: '方括号矩阵', example: '\\begin{bmatrix} a & b \\\\ c & d \\end{bmatrix}' },
              { latex: '\\begin{vmatrix}\\end{vmatrix}', desc: '行列式', example: '\\begin{vmatrix} a & b \\\\ c & d \\end{vmatrix}' },
              { latex: '\\begin{Vmatrix}\\end{Vmatrix}', desc: '范数', example: '\\begin{Vmatrix} a & b \\\\ c & d \\end{Vmatrix}' }
            ].map((env, idx) => (
              <div key={idx} className="border-b border-gray-200 dark:border-gray-600 pb-3 last:border-b-0">
                <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">{env.desc}</h4>
                <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded font-mono text-xs text-gray-800 dark:text-gray-200 block mb-2">
                  {env.latex}
                </code>
                {env.example.length > 50 ? (
                  <div className="space-y-2">
                    <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded font-mono text-xs text-gray-800 dark:text-gray-200 block">
                      {env.example}
                    </code>
                    <CodeExample
                      title=""
                      code={`$${env.example}$`}
                      description=""
                    />
                  </div>
                ) : (
                  <CodeExample
                    title=""
                    code={`$${env.example}$`}
                    description=""
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            对齐环境
          </h3>
          <div className="space-y-4">
            {[
              { latex: '\\begin{aligned}\\end{aligned}', desc: '多行对齐（唯一支持）', example: '\\begin{aligned} f(x) &= x^2 \\\\ &= x \\cdot x \\end{aligned}' }
            ].map((env, idx) => (
              <div key={idx} className="border-b border-gray-200 dark:border-gray-600 pb-3 last:border-b-0">
                <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">{env.desc}</h4>
                <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded font-mono text-xs text-gray-800 dark:text-gray-200 block mb-2">
                  {env.latex}
                </code>
                {env.example.length > 50 ? (
                  <div className="space-y-2">
                    <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded font-mono text-xs text-gray-800 dark:text-gray-200 block">
                      {env.example}
                    </code>
                    <CodeExample
                      title=""
                      code={`$${env.example}$`}
                      description=""
                    />
                  </div>
                ) : (
                  <CodeExample
                    title=""
                    code={`$${env.example}$`}
                    description=""
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 数学环境库 */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6">
          数学环境库
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              category: '矩阵环境',
              environments: [
                { latex: '\\begin{pmatrix}\\end{pmatrix}', desc: '圆括号矩阵', example: '\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}' },
                { latex: '\\begin{bmatrix}\\end{bmatrix}', desc: '方括号矩阵', example: '\\begin{bmatrix} a & b \\\\ c & d \\end{bmatrix}' },
                { latex: '\\begin{vmatrix}\\end{vmatrix}', desc: '行列式', example: '\\begin{vmatrix} a & b \\\\ c & d \\end{vmatrix}' },
                { latex: '\\begin{Vmatrix}\\end{Vmatrix}', desc: '范数', example: '\\begin{Vmatrix} a & b \\\\ c & d \\end{Vmatrix}' },
                { latex: '\\begin{matrix}\\end{matrix}', desc: '无括号矩阵', example: '\\begin{matrix} a & b \\\\ c & d \\end{matrix}' }
              ]
            },
            {
              category: '对齐环境',
              environments: [
                { latex: '\\begin{aligned}\\end{aligned}', desc: '多行对齐（唯一支持）', example: '\\begin{aligned} f(x) &= x^2 \\\\ &= x \\cdot x \\end{aligned}' }
              ]
            },
            {
              category: '分段函数',
              environments: [
                { latex: '\\left\\{\\begin{aligned}\\end{aligned}\\right.', desc: '分段函数', example: 'f(x) = \\left\\{\\begin{aligned} x^2 & \\text{ if } x > 0 \\\\ -x^2 & \\text{ if } x \\leq 0 \\end{aligned}\\right.' },
                { latex: '\\begin{cases}\\end{cases}', desc: 'cases环境', example: 'f(x) = \\begin{cases} x^2 & \\text{ if } x > 0 \\\\ -x^2 & \\text{ if } x \\leq 0 \\end{cases}' }
              ]
            },
            {
              category: '表格环境',
              environments: [
                { latex: '\\begin{tabular}\\end{tabular}', desc: '表格环境（唯一支持）', example: '\\begin{tabular}{|c|c|} \\hline a & b \\\\ \\hline c & d \\\\ \\hline \\end{tabular}' }
              ]
            }
          ].map((category, catIdx) => (
            <div key={catIdx} className="space-y-3">
              <h4 className="font-semibold text-gray-800 dark:text-gray-200 text-lg border-b border-gray-200 dark:border-gray-600 pb-2">
                {category.category}
              </h4>
              <div className="space-y-2">
                {category.environments.map((env, envIdx) => (
                  <div key={envIdx} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <code className="bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded text-xs font-mono text-gray-800 dark:text-gray-200">
                        {env.latex}
                      </code>
                      <span className="text-xs text-gray-500 dark:text-gray-400">{env.desc}</span>
                    </div>
                    {env.example.length > 50 ? (
                      <div className="space-y-2">
                        <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded font-mono text-xs text-gray-800 dark:text-gray-200 block">
                          {env.example}
                        </code>
                        <CodeExample
                          title=""
                          code={`$${env.example}$`}
                          description=""
                        />
                      </div>
                    ) : (
                      <CodeExample
                        title=""
                        code={`$${env.example}$`}
                        description=""
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          分段函数
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          使用aligned环境创建分段函数：
        </p>
        <CodeExample
          title=""
          code="$f(x) = \left\{\begin{aligned} & x^2, \quad x > 0 \\ & 0, \quad x = 0 \\ & -x^2, \quad x < 0 \end{aligned}\right.$"
          description=""
        />
      </div>
    </div>
  );

  const renderExamples = () => (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-2xl p-8">
        <h2 className="text-3xl font-bold text-indigo-800 dark:text-indigo-200 mb-4">
          实用示例
        </h2>
        <p className="text-lg text-indigo-700 dark:text-indigo-300 leading-relaxed">
          通过这些实际例子，快速掌握 LaTeX 数学公式的编写方法.
          左侧显示LaTeX代码，右侧显示真实的渲染结果.
        </p>
      </div>

      <div className="space-y-6">
        <CodeExample
          title="基础数学公式"
          code="$\frac{a}{b} + \sqrt{x^2 + y^2}$"
          description="分数和根式的基本用法"
        />

        <CodeExample
          title="上下标"
          code="$x^2 + y_i = \sum_{i=1}^{n} a_i$"
          description="上标、下标和求和符号"
        />

        <CodeExample
          title="二次方程求根公式"
          code="$x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}$"
          description="复杂的数学公式示例"
        />

        <CodeExample
          title="矩阵"
          code="$\begin{pmatrix} a & b \\ c & d \end{pmatrix}$"
          description="2×2矩阵，使用圆括号"
        />

        <CodeExample
          title="积分和极限"
          code="$\lim_{x \to 0} \frac{\sin x}{x} = 1 \quad \int_0^1 x^2 dx = \frac{1}{3}$"
          description="极限和积分的表示方法"
        />

        <CodeExample
          title="分段函数"
          code="$f(x) = \left\{\begin{aligned} x^2 & \text{ if } x > 0 \\ -x^2 & \text{ if } x \leq 0 \end{aligned}\right.$"
          description="使用\begin{aligned}...\end{aligned}创建分段函数"
        />

        <CodeExample
          title="复杂公式"
          code="$\int_{-\infty}^{\infty} e^{-x^2} dx = \sqrt{\pi}$"
          description="使用积分、指数和根式的复杂公式"
        />

        <CodeExample
          title="多行对齐"
          code="$\begin{aligned} f(x) &= \int_0^x \frac{t^2}{1 + t^2} dt \\ &= x - \arctan x \end{aligned}$"
          description="使用aligned环境的多行对齐公式"
        />

        <CodeExample
          title="组合数和排列"
          code="$\binom{n}{k} = \frac{n!}{k!(n-k)!}$"
          description="组合数的数学表示"
        />

        <CodeExample
          title="微积分公式"
          code="$\frac{d}{dx}\left(\int_0^x f(t) dt\right) = f(x)$"
          description="微积分基本定理"
        />

        <CodeExample
          title="集合运算"
          code="$A \cup B = \{x : x \in A \text{ or } x \in B\}$"
          description="集合的并集定义"
        />

        <CodeExample
          title="三角函数恒等式"
          code="$\sin^2 x + \cos^2 x = 1$"
          description="基本的三角函数恒等式"
        />

        <CodeExample
          title="泰勒级数"
          code="$e^x = \sum_{n=0}^{\infty} \frac{x^n}{n!}$"
          description="指数函数的泰勒级数展开"
        />

        <CodeExample
          title="行列式计算"
          code="$\begin{vmatrix} a & b \\ c & d \end{vmatrix} = ad - bc$"
          description="2×2行列式的计算公式"
        />

        <CodeExample
          title="分段函数（cases环境）"
          code="$f(x) = \begin{cases} x^2 & \text{if } x > 0 \\ 0 & \text{if } x = 0 \\ -x^2 & \text{if } x < 0 \end{cases}$"
          description="使用cases环境创建分段函数"
        />

        <CodeExample
          title="多变量积分"
          code="$\iint_D f(x,y) dxdy = \int_a^b \int_c^d f(x,y) dxdy$"
          description="二重积分的表示方法"
        />

        <CodeExample
          title="向量运算"
          code="$\vec{a} \cdot \vec{b} = |\vec{a}| |\vec{b}| \cos \theta$"
          description="向量的点积公式"
        />
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-2xl p-8">
        <h3 className="text-2xl font-bold text-blue-800 dark:text-blue-200 mb-4 text-center">
          开始实践
        </h3>
        <p className="text-blue-700 dark:text-blue-300 text-center mb-6">
          现在您已经了解了数学公式的语法，可以开始在编辑器中实践了！
        </p>
        <div className="flex justify-center">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-lg">
            <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">快速入门建议：</h4>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>• 使用符号面板快速插入常用符号</li>
              <li>• 开启实时预览功能查看效果</li>
              <li>• 从简单公式开始，逐步尝试复杂功能</li>
              <li>• 参考本指南中的示例代码</li>
              <li>• 注意LaTeX语法使用单斜杠（\\）</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <GuideNavigation 
        title="LaTeX 数学公式" 
        description="学习LaTeX数学符号、语法和高级功能的完整指南"
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
                  ? 'bg-blue-600 text-white shadow-lg'
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
          {activeTab === 'symbols' && renderBasics()}
          {activeTab === 'environments' && renderEnvironments()}
          {activeTab === 'examples' && renderExamples()}
        </motion.div>
      </div>
    </div>
  );
};

export default LaTeXMathGuide;
