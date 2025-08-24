import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Palette, 
  Sparkles, 
  Eye,
  ArrowRight,
  ChevronRight,
  Zap,
  Target,
  Layers
} from 'lucide-react';
import { Link } from 'react-router-dom';
import TikZCodeExample from '../../components/guide/TikZCodeExample';

const TikZEffectsGuide: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: '概述', icon: Eye },
    { id: 'shadows', label: '阴影效果', icon: Layers },
    { id: 'gradients', label: '渐变填充', icon: Palette },
    { id: 'transparency', label: '透明度', icon: Eye },
    { id: 'examples', label: '实战示例', icon: Zap }
  ];

  const renderOverview = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl p-6 border border-yellow-200/50 dark:border-yellow-700/50">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">TikZ 高级效果</h2>
            <p className="text-gray-600 dark:text-gray-400">掌握TikZ的视觉增强技巧</p>
          </div>
        </div>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
          TikZ提供了丰富的视觉效果功能，包括阴影、渐变、透明度、模式填充等。
          本教程将教你如何使用这些高级效果来创建更加美观和专业的图形。
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-purple-50/80 dark:bg-gray-800/80 rounded-lg p-4 border border-purple-200/50 dark:border-gray-700/50">
          <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/50 rounded-lg flex items-center justify-center mb-3">
            <Layers className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">阴影效果</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">创建立体感和深度</p>
        </div>
        
        <div className="bg-purple-50/80 dark:bg-gray-800/80 rounded-lg p-4 border border-purple-200/50 dark:border-gray-700/50">
          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center mb-3">
            <Palette className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">渐变填充</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">平滑的颜色过渡效果</p>
        </div>
        
        <div className="bg-purple-50/80 dark:bg-gray-800/80 rounded-lg p-4 border border-purple-200/50 dark:border-gray-700/50">
          <div className="w-10 h-10 bg-green-100 dark:bg-green-900/50 rounded-lg flex items-center justify-center mb-3">
            <Eye className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">透明度</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">控制图形的透明程度</p>
        </div>
      </div>
    </motion.div>
  );

  const renderShadows = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="bg-purple-50/80 dark:bg-gray-800/80 rounded-xl p-6 border border-purple-200/50 dark:border-gray-700/50">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
          <Layers className="w-5 h-5 text-purple-600" />
          阴影效果
        </h3>
        
        <div className="space-y-6">
          <div>
            <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-3">1. 基础阴影</h4>
            <TikZCodeExample
              code={`\\begin{tikzpicture}
\\draw[drop shadow={shadow xshift=2pt, shadow yshift=-2pt, shadow opacity=0.3}] (0,0) circle (1cm);
\\draw[drop shadow={shadow xshift=3pt, shadow yshift=-3pt, shadow opacity=0.5}] (2,0) rectangle (3,1);
\\end{tikzpicture}`}
              title="基础阴影"
              description="使用drop shadow为图形添加阴影效果"
            />
          </div>
          
          <div>
            <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-3">2. 自定义阴影</h4>
            <TikZCodeExample
              code={`\\begin{tikzpicture}
\\draw[drop shadow={shadow xshift=4pt, shadow yshift=-4pt, shadow blur=3pt, shadow opacity=0.6}] (0,0) circle (1cm);
\\draw[drop shadow={shadow xshift=-2pt, shadow yshift=2pt, shadow blur=2pt, shadow opacity=0.4}] (2,0) rectangle (3,1);
\\end{tikzpicture}`}
              title="自定义阴影"
              description="控制阴影的偏移、模糊度和透明度"
            />
          </div>
          
          <div>
            <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-3">3. 内阴影</h4>
            <TikZCodeExample
              code={`\\begin{tikzpicture}
\\draw[inner shadow={shadow xshift=1pt, shadow yshift=1pt, shadow opacity=0.3}] (0,0) circle (1cm);
\\draw[inner shadow={shadow xshift=-1pt, shadow yshift=-1pt, shadow opacity=0.5}] (2,0) rectangle (3,1);
\\end{tikzpicture}`}
              title="内阴影"
              description="创建内阴影效果，营造凹陷感"
            />
          </div>
        </div>
      </div>
    </motion.div>
  );

  const renderGradients = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="bg-purple-50/80 dark:bg-gray-800/80 rounded-xl p-6 border border-purple-200/50 dark:border-gray-700/50">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
          <Palette className="w-5 h-5 text-blue-600" />
          渐变填充
        </h3>
        
        <div className="space-y-6">
          <div>
            <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-3">1. 线性渐变</h4>
            <TikZCodeExample
              code={`\\begin{tikzpicture}
\\fill[left color=red, right color=blue] (0,0) rectangle (2,1);
\\fill[left color=yellow, right color=green] (2.5,0) rectangle (4.5,1);
\\end{tikzpicture}`}
              title="线性渐变"
              description="从左到右的颜色渐变效果"
            />
          </div>
          
          <div>
            <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-3">2. 径向渐变</h4>
            <TikZCodeExample
              code={`\\begin{tikzpicture}
\\fill[radial, inner color=white, outer color=red] (0,0) circle (1cm);
\\fill[radial, inner color=yellow, outer color=orange] (2.5,0) circle (1cm);
\\end{tikzpicture}`}
              title="径向渐变"
              description="从中心向外的颜色渐变效果"
            />
          </div>
          
          <div>
            <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-3">3. 多色渐变</h4>
            <TikZCodeExample
              code={`\\begin{tikzpicture}
\\fill[left color=red, middle color=yellow, right color=blue] (0,0) rectangle (3,1);
\\fill[left color=purple, middle color=cyan, right color=green] (3.5,0) rectangle (6.5,1);
\\end{tikzpicture}`}
              title="多色渐变"
              description="三种颜色的平滑过渡"
            />
          </div>
        </div>
      </div>
    </motion.div>
  );

  const renderTransparency = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="bg-purple-50/80 dark:bg-gray-800/80 rounded-xl p-6 border border-purple-200/50 dark:border-gray-700/50">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
          <Eye className="w-5 h-5 text-green-600" />
          透明度控制
        </h3>
        
        <div className="space-y-6">
          <div>
            <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-3">1. 基础透明度</h4>
            <TikZCodeExample
              code={`\\begin{tikzpicture}
\\fill[red!20] (0,0) circle (1cm);
\\fill[blue!40] (1.5,0) circle (1cm);
\\fill[green!60] (3,0) circle (1cm);
\\end{tikzpicture}`}
              title="基础透明度"
              description="使用!符号控制颜色的透明度"
            />
          </div>
          
          <div>
            <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-3">2. 重叠透明度</h4>
            <TikZCodeExample
              code="\\begin{tikzpicture}   \\fill[red!30] (0,0) circle (1cm);   \\fill[blue!30] (0.5,0) circle (1cm);   \\fill[green!30] (1,0) circle (1cm); \\end{tikzpicture}"
              title="重叠透明度"
              description="重叠区域会显示混合颜色"
            />
          </div>
          
          <div>
            <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-3">3. 渐变透明度</h4>
            <TikZCodeExample
              code="\\begin{tikzpicture}   \\fill[left color=red!100, right color=red!20] (0,0) rectangle (2,1);   \\fill[left color=blue!100, right color=blue!20] (2.5,0) rectangle (4.5,1); \\end{tikzpicture}"
              title="渐变透明度"
              description="从完全不透明到透明的渐变"
            />
          </div>
        </div>
      </div>
    </motion.div>
  );

  const renderExamples = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="bg-purple-50/80 dark:bg-gray-800/80 rounded-xl p-6 border border-purple-200/50 dark:border-gray-700/50">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-600" />
          实战示例
        </h3>
        
        <div className="space-y-6">
          <div>
            <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-3">1. 立体按钮效果</h4>
            <TikZCodeExample
              code="\\begin{tikzpicture}   % 按钮阴影   \\fill[drop shadow={shadow xshift=2pt, shadow yshift=-2pt, shadow opacity=0.3}] (0,0) rectangle (2,1);   % 按钮主体   \\fill[left color=blue!80, right color=blue!60] (0,0) rectangle (2,1);   % 高光效果   \\fill[white!30] (0.1,0.1) rectangle (1.8,0.9);   % 文字   \ ode[white, font=\\bfseries] at (1,0.5) {按钮}; \\end{tikzpicture}"
              title="立体按钮"
              description="结合阴影、渐变和透明度创建立体按钮"
            />
          </div>
          
          <div>
            <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-3">2. 玻璃质感效果</h4>
            <TikZCodeExample
              code="\\begin{tikzpicture}   % 背景阴影   \\fill[drop shadow={shadow xshift=3pt, shadow yshift=-3pt, shadow opacity=0.2}] (0,0) circle (1cm);   % 玻璃主体   \\fill[radial, inner color=white!80, outer color=blue!20] (0,0) circle (1cm);   % 高光   \\fill[white!60] (-0.3,0.3) circle (0.2cm);   % 边框   \\draw[blue!50, thick] (0,0) circle (1cm); \\end{tikzpicture}"
              title="玻璃质感"
              description="创建具有玻璃质感的圆形"
            />
          </div>
          
          <div>
            <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-3">3. 彩虹渐变效果</h4>
            <TikZCodeExample
              code="\\begin{tikzpicture}   % 彩虹渐变   \\fill[left color=red, middle color=yellow, right color=blue] (0,0) rectangle (4,1);   % 添加阴影   \\fill[drop shadow={shadow xshift=2pt, shadow yshift=-2pt, shadow opacity=0.4}] (0,0) rectangle (4,1);   % 高光效果   \\fill[white!40] (0,0.6) rectangle (4,1);   % 文字   \ ode[white, font=\\bfseries, drop shadow={shadow xshift=1pt, shadow yshift=-1pt, shadow opacity=0.8}] at (2,0.5) {彩虹}; \\end{tikzpicture}"
              title="彩虹渐变"
              description="结合多种效果创建彩虹渐变条"
            />
          </div>
        </div>
      </div>
    </motion.div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'shadows':
        return renderShadows();
      case 'gradients':
        return renderGradients();
      case 'transparency':
        return renderTransparency();
      case 'examples':
        return renderExamples();
      default:
        return renderOverview();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-yellow-50/30 to-orange-50/30 dark:from-slate-900 dark:via-yellow-900/20 dark:to-orange-900/20">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* 页面头部 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-6">
            <Link
              to="/LaTeXGuide"
              className="p-2 rounded-lg bg-purple-50/80 dark:bg-gray-800/80 backdrop-blur-sm border border-purple-200/50 dark:border-gray-700/50 hover:bg-white dark:hover:bg-gray-700 transition-all duration-200"
            >
              <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400 rotate-180" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">TikZ 高级效果</h1>
              <p className="text-gray-600 dark:text-gray-400">掌握TikZ的视觉增强技巧</p>
            </div>
          </div>
        </motion.div>

        {/* 标签导航 */}
        <div className="bg-purple-50/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-2 border border-purple-200/50 dark:border-gray-700/50 mb-8">
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-yellow-500 text-white shadow-lg'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </motion.button>
            ))}
          </div>
        </div>

        {/* 内容区域 */}
        <div className="space-y-8">
          {renderContent()}
        </div>

        {/* 底部导航 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-12 text-center"
        >
          <div className="bg-purple-50/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 border border-purple-200/50 dark:border-gray-700/50">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              继续学习更多TikZ技巧
            </h3>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                to="/guide/tikz/basics"
                className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 hover:scale-105"
              >
                <Palette className="w-4 h-4" />
                基础教程
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/guide/tikz/functions"
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 hover:scale-105"
              >
                <Target className="w-4 h-4" />
                函数绘制
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default TikZEffectsGuide;
