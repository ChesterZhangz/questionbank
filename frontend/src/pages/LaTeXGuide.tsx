import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, 
  Palette, 
  ArrowRight,
  Target,
  Eye,
  FileText,
  Calculator,
  PenTool,
  Sparkles,
  Code,
  ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

const LaTeXGuide: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'latex' | 'tikz'>('latex');
  const [hoveredFeature, setHoveredFeature] = useState<string | null>(null);



  const latexFeatures = [
    {
      id: 'editor',
      icon: Code,
      title: 'LaTeX编辑器',
      description: '专业的数学公式编辑环境',
      color: 'from-blue-500 to-cyan-500',
      path: '/guide/latex/math',
      features: ['语法高亮', '实时预览', '智能补全', '错误诊断']
    },
    {
      id: 'math',
      icon: Calculator,
      title: '数学公式',
      description: '完整的数学符号库',
      color: 'from-purple-500 to-pink-500',
      path: '/guide/latex/math',
      features: ['基础符号', '高级公式', '矩阵环境', '对齐系统']
    },
    {
      id: 'questions',
      icon: Target,
      title: '题目语法',
      description: '专业的题目编写语法',
      color: 'from-green-500 to-emerald-500',
      path: '/guide/latex/questions',
      features: ['选择题', '填空题', '解答题', '编号系统']
    },
    {
      id: 'templates',
      icon: FileText,
      title: '代码模板',
      description: '丰富的LaTeX模板库',
      color: 'from-orange-500 to-red-500',
      path: '/guide/latex/math',
      features: ['公式模板', '题目模板', '环境模板', '自定义模板']
    }
  ];

  const tikzFeatures = [
    {
      id: 'drawing',
      icon: PenTool,
      title: '图形绘制',
      description: '矢量图形绘制系统',
      color: 'from-indigo-500 to-purple-500',
      path: '/guide/tikz/basics',
      features: ['几何图形', '复杂路径', '节点标签', '样式效果']
    },
    {
      id: 'functions',
      icon: Calculator,
      title: '函数图像',
      description: '数学函数可视化',
      color: 'from-teal-500 to-blue-500',
      path: '/guide/tikz/functions',
      features: ['函数绘制', '坐标系统', '网格刻度', '自动缩放']
    },
    {
      id: 'preview',
      icon: Eye,
      title: '实时预览',
      description: '所见即所得编辑',
      color: 'from-pink-500 to-rose-500',
      path: '/guide/tikz/basics',
      features: ['实时预览', '交互编辑', '多格式导出', '高质量渲染']
    },
    {
      id: 'effects',
      icon: Sparkles,
      title: '高级效果',
      description: '丰富的视觉效果',
      color: 'from-yellow-500 to-orange-500',
      path: '/guide/tikz/effects',
      features: ['渐变阴影', '透明度', '动画效果', '自定义样式']
    }
  ];

  const renderLaTeXSection = () => (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
    >
      {/* 功能特性网格 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {latexFeatures.map((feature, index) => (
          <motion.div
            key={feature.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: index * 0.05 }}
            whileHover={{ 
              scale: 1.02, 
              y: -3,
              transition: { duration: 0.1 }
            }}
            onHoverStart={() => setHoveredFeature(feature.id)}
            onHoverEnd={() => setHoveredFeature(null)}
            className="group cursor-pointer"
          >
            <Link to={feature.path}>
              <div className="h-full bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 shadow-lg hover:shadow-xl transition-all duration-150 overflow-hidden rounded-xl relative">
                {/* 精致拼凑感 - 几何装饰 */}
                <div className="absolute top-0 right-0 w-16 h-16 opacity-20">
                  <div className="w-full h-full bg-gradient-to-br from-blue-400 to-cyan-400 transform rotate-45 translate-x-8 -translate-y-8"></div>
                </div>
                <div className="absolute bottom-0 left-0 w-12 h-12 opacity-20">
                  <div className="w-full h-full bg-gradient-to-tr from-purple-400 to-pink-400 transform -rotate-45 -translate-x-6 translate-y-6"></div>
                </div>
                
                {/* 神秘光效 */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                  initial={{ x: '-100%' }}
                  animate={{ x: hoveredFeature === feature.id ? '100%' : '-100%' }}
                  transition={{ duration: 0.4 }}
                />
                
                <div className="p-6 relative z-10">
                  <div className={`w-14 h-14 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center shadow-lg mb-4 group-hover:scale-105 transition-transform duration-150`}>
                    <feature.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 mb-4 text-sm">
                    {feature.description}
                  </p>
                  <ul className="space-y-2 mb-4">
                    {feature.features.map((item, idx) => (
                      <motion.li
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2, delay: index * 0.05 + idx * 0.03 }}
                        className="flex items-center gap-2 text-gray-700 dark:text-gray-300 text-sm"
                      >
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full flex-shrink-0" />
                        <span>{item}</span>
                      </motion.li>
                    ))}
                  </ul>
                  
                  {/* 进入按钮 */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: 0.2 }}
                    className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-medium text-sm group-hover:text-blue-700 dark:group-hover:text-blue-300"
                  >
                    <span>进入学习</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-150" />
                  </motion.div>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );

  const renderTikZSection = () => (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
    >
      {/* 功能特性网格 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tikzFeatures.map((feature, index) => (
          <motion.div
            key={feature.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: index * 0.05 }}
            whileHover={{ 
              scale: 1.02, 
              y: -3,
              transition: { duration: 0.1 }
            }}
            onHoverStart={() => setHoveredFeature(feature.id)}
            onHoverEnd={() => setHoveredFeature(null)}
            className="group cursor-pointer"
          >
            <Link to={feature.path}>
              <div className="h-full bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 shadow-lg hover:shadow-xl transition-all duration-150 overflow-hidden rounded-xl relative">
                {/* 精致拼凑感 - 几何装饰 */}
                <div className="absolute top-0 right-0 w-16 h-16 opacity-20">
                  <div className="w-full h-full bg-gradient-to-br from-purple-400 to-pink-400 transform rotate-45 translate-x-8 -translate-y-8"></div>
                </div>
                <div className="absolute bottom-0 left-0 w-12 h-12 opacity-20">
                  <div className="w-full h-full bg-gradient-to-tr from-indigo-400 to-blue-400 transform -rotate-45 -translate-x-6 translate-y-6"></div>
                </div>
                
                {/* 神秘光效 */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                  initial={{ x: '-100%' }}
                  animate={{ x: hoveredFeature === feature.id ? '100%' : '-100%' }}
                  transition={{ duration: 0.4 }}
                />
                
                <div className="p-6 relative z-10">
                  <div className={`w-14 h-14 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center shadow-lg mb-4 group-hover:scale-105 transition-transform duration-150`}>
                    <feature.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 mb-4 text-sm">
                    {feature.description}
                  </p>
                  <ul className="space-y-2 mb-4">
                    {feature.features.map((item, idx) => (
                      <motion.li
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2, delay: index * 0.05 + idx * 0.03 }}
                        className="flex items-center gap-2 text-gray-700 dark:text-gray-300 text-sm"
                      >
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full flex-shrink-0" />
                        <span>{item}</span>
                      </motion.li>
                    ))}
                  </ul>
                  
                  {/* 进入按钮 */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: 0.2 }}
                    className="flex items-center gap-2 text-purple-600 dark:text-purple-400 font-medium text-sm group-hover:text-purple-700 dark:group-hover:text-purple-300"
                  >
                    <span>进入学习</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-150" />
                  </motion.div>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 dark:from-slate-900 dark:via-blue-900/20 dark:to-purple-900/20 relative overflow-hidden">
      {/* 背景动画元素 - 加快速度 */}
      <div className="absolute inset-0 overflow-hidden">
        {/* 浮动的数学符号 - 加快速度 */}
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-white/5 text-3xl font-bold"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              rotate: 0
            }}
            animate={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              rotate: 360
            }}
            transition={{
              duration: 8 + Math.random() * 4,
              repeat: Infinity as any,
              ease: "linear"
            }}
          >
            {['∫', '∑', 'π', '∞', 'θ', 'σ', 'ω', 'Δ', '√', '±'][i % 10]}
          </motion.div>
        ))}
        
        {/* 精致拼凑感 - 几何装饰背景 */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-br from-blue-400/5 to-cyan-400/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-gradient-to-br from-purple-400/5 to-pink-400/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-gradient-to-br from-green-400/5 to-emerald-400/5 rounded-full blur-2xl" />
      </div>

      {/* 主要内容 */}
      <div className="relative z-10">
        {/* 页面头部 - 仿照题目管理页面设计 */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-20">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              {/* 左侧标题区域 */}
              <div className="flex items-center gap-4">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg"
                >
                  <BookOpen className="w-6 h-6 text-white" />
                </motion.div>
                <div>
                  <motion.h1
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                    className="text-2xl font-bold text-gray-900 dark:text-gray-100"
                  >
                    LaTeX 指导中心
                  </motion.h1>
                  <motion.p
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                    className="text-sm text-gray-600 dark:text-gray-400"
                  >
                    专业的LaTeX编辑和TikZ绘图学习平台
                  </motion.p>
                </div>
              </div>


            </div>
          </div>
        </div>

        {/* 切换标签栏 - 仿照题目管理页面 */}
        <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-b border-gray-200/30 dark:border-gray-700/30">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-center gap-1">
              <motion.button
                onClick={() => setActiveSection('latex')}
                className={`px-6 py-3 rounded-t-lg font-medium text-sm transition-all duration-150 relative ${
                  activeSection === 'latex'
                    ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-gray-800 border-t-2 border-blue-500 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-blue-50/50 dark:hover:bg-gray-700/50'
                }`}
                whileHover={{ scale: 1.02, transition: { duration: 0.1 } }}
                whileTap={{ scale: 0.98, transition: { duration: 0.1 } }}
              >
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  LaTeX 编辑器
                </div>
                {activeSection === 'latex' && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500"
                  />
                )}
              </motion.button>
              
              <motion.button
                onClick={() => setActiveSection('tikz')}
                className={`px-6 py-3 rounded-t-lg font-medium text-sm transition-all duration-150 relative ${
                  activeSection === 'tikz'
                    ? 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-gray-800 border-t-2 border-purple-500 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-purple-50/50 dark:hover:bg-gray-700/50'
                }`}
                whileHover={{ scale: 1.02, transition: { duration: 0.1 } }}
                whileTap={{ scale: 0.98, transition: { duration: 0.1 } }}
              >
                <div className="flex items-center gap-2">
                  <Palette className="w-4 h-4" />
                  TikZ 绘图
                </div>
                {activeSection === 'tikz' && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500"
                  />
                )}
              </motion.button>
            </div>
          </div>
        </div>

        {/* 内容区域 */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          <AnimatePresence mode="wait">
            {activeSection === 'latex' ? renderLaTeXSection() : renderTikZSection()}
          </AnimatePresence>
        </div>

        {/* 底部CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="text-center py-12"
        >
          <div className="bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 backdrop-blur-sm rounded-2xl p-8 max-w-3xl mx-auto border border-gray-300/60 dark:border-gray-700/50">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              开启数学探索之旅
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              立即体验专业的LaTeX编辑环境和强大的TikZ绘图系统
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                to="/guide/latex/math"
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-150 flex items-center gap-2 hover:scale-105"
              >
                <BookOpen className="w-4 h-4" />
                开始学习LaTeX
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/guide/tikz/basics"
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-150 flex items-center gap-2 hover:scale-105"
              >
                <Palette className="w-4 h-4" />
                开始学习TikZ
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LaTeXGuide;
