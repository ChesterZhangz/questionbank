import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, 
  Code, 
  Palette, 
  CheckCircle,
  Book,
  Image,
  HelpCircle
} from 'lucide-react';
import TikZFeaturesSection from '../components/latex/TikZFeaturesSection';
import TikZSupportSection from '../components/latex/TikZSupportSection';
import LaTeXReferenceSection from '../components/latex/LaTeXReferenceSection';
import CodeTemplatesSection from '../components/latex/CodeTemplatesSection';

const LaTeXGuide: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'tikz-features' | 'tikz-support' | 'templates' | 'reference'>('overview');

  const tabs = [
    { 
      id: 'overview', 
      name: 'LaTeX概述', 
      icon: BookOpen, 
      description: '了解LaTeX的基本概念和功能',
      color: 'blue'
    },
    { 
      id: 'tikz-features', 
      name: 'TikZ功能展示', 
      icon: Palette, 
      description: '体验TikZ的强大绘图功能',
      color: 'green'
    },
    { 
      id: 'tikz-support', 
      name: 'TikZ支持文档', 
      icon: Code, 
      description: '学习TikZ的使用方法和技巧',
      color: 'purple'
    },
    { 
      id: 'templates', 
      name: '代码模板库', 
      icon: Image, 
      description: '精选的LaTeX和TikZ代码模板',
      color: 'green'
    },
    { 
      id: 'reference', 
      name: 'LaTeX参考手册', 
      icon: Book, 
      description: '完整的LaTeX语法参考',
      color: 'orange'
    }
  ];

  const renderOverview = () => (
    <div className="space-y-8">
      {/* 欢迎区域 */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
          LaTeX 使用指导
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-4xl mx-auto leading-relaxed">
          欢迎使用我们的 LaTeX 编辑系统！这里提供了完整的 LaTeX 学习资源，包括基础语法、数学公式、题目语法、TikZ 图形绘制等所有功能的详细说明和实例代码。
        </p>
      </div>

      {/* 功能概览 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            icon: BookOpen,
            title: 'LaTeX 基础',
            description: '掌握 LaTeX 的基本语法和文档结构',
            color: 'blue'
          },
          {
            icon: Palette,
            title: 'TikZ 绘图',
            description: '使用 TikZ 创建专业的数学图表和示意图',
            color: 'green'
          },
          {
            icon: Code,
            title: '智能编辑',
            description: '享受语法高亮、自动补全等智能编辑功能',
            color: 'purple'
          },
          {
            icon: HelpCircle,
            title: '题目语法',
            description: '学习如何编写各种类型的题目和解答',
            color: 'orange'
          }
        ].map((feature, index) => (
          <motion.div
            key={index}
            whileHover={{ scale: 1.05, y: -5 }}
            className={`bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300`}
          >
            <div className={`w-12 h-12 rounded-lg bg-${feature.color}-100 dark:bg-${feature.color}-900/30 flex items-center justify-center mb-4 mx-auto`}>
              <feature.icon className={`w-6 h-6 text-${feature.color}-600 dark:text-${feature.color}-400`} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 text-center mb-2">
              {feature.title}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-center text-sm">
              {feature.description}
            </p>
          </motion.div>
        ))}
      </div>

      {/* 快速开始指南 */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-8">
        <h2 className="text-2xl font-bold text-blue-800 dark:text-blue-200 mb-6 text-center">
          🚀 快速开始指南
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">1</span>
            </div>
            <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-2">
              了解基础概念
            </h3>
            <p className="text-blue-700 dark:text-blue-300 text-sm">
              从 LaTeX 概述开始，了解基本概念和功能特性
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-green-600 dark:text-green-400">2</span>
            </div>
            <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-2">
              体验 TikZ 功能
            </h3>
            <p className="text-green-700 dark:text-green-300 text-sm">
              尝试 TikZ 功能展示，体验绘图能力
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">3</span>
            </div>
            <h3 className="text-lg font-semibold text-purple-800 dark:text-purple-200 mb-2">
              查阅参考手册
            </h3>
            <p className="text-purple-700 dark:text-purple-300 text-sm">
              使用参考手册查找具体的语法和命令
            </p>
          </div>
        </div>
      </div>

      {/* 特色功能 */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-8">
          ✨ 特色功能
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              智能编辑体验
            </h3>
            <ul className="space-y-2 text-gray-600 dark:text-gray-400">
              <li>• 实时语法高亮和错误检测</li>
              <li>• 智能自动补全和代码提示</li>
              <li>• 实时预览和渲染结果</li>
              <li>• 支持暗黑模式和响应式设计</li>
            </ul>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              强大的 TikZ 支持
            </h3>
            <ul className="space-y-2 text-gray-600 dark:text-gray-400">
              <li>• 完整的颜色系统和渐变效果</li>
              <li>• 丰富的阴影和图案填充</li>
              <li>• 精确的坐标系统和图形绘制</li>
              <li>• 实时预览和即时更新</li>
            </ul>
          </div>
        </div>
      </div>

      {/* 学习资源 */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-8">
        <h2 className="text-2xl font-bold text-green-800 dark:text-green-200 mb-6 text-center">
          📚 学习资源
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">
              初学者资源
            </h3>
            <ul className="space-y-2 text-gray-600 dark:text-gray-400">
              <li>• LaTeX 基础语法教程</li>
              <li>• 数学公式编写指南</li>
              <li>• 题目语法结构说明</li>
              <li>• 常用命令速查表</li>
            </ul>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">
              进阶功能
            </h3>
            <ul className="space-y-2 text-gray-600 dark:text-gray-400">
              <li>• TikZ 高级绘图技巧</li>
              <li>• 自定义样式和模板</li>
              <li>• 性能优化建议</li>
              <li>• 最佳实践指南</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* 页面标题 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            LaTeX 使用指导
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            从入门到精通，掌握 LaTeX 和 TikZ 的所有功能
          </p>
        </div>

        {/* 导航标签 */}
        <div className="flex flex-wrap justify-center mb-8 gap-2">
          {tabs.map((tab) => (
            <motion.button
              key={tab.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2 ${
                activeTab === tab.id
                  ? `bg-${tab.color}-600 text-white shadow-lg`
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.name}
            </motion.button>
          ))}
        </div>

        {/* 内容区域 */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
          >
                      {activeTab === 'overview' && renderOverview()}
          {activeTab === 'tikz-features' && <TikZFeaturesSection />}
          {activeTab === 'tikz-support' && <TikZSupportSection />}
          {activeTab === 'templates' && <CodeTemplatesSection />}
          {activeTab === 'reference' && <LaTeXReferenceSection />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default LaTeXGuide;
