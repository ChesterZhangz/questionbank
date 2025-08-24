import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Palette, 
  Brush, 
  Sparkles, 
  Eye,
  Zap
} from 'lucide-react';
import TikZCodeExample from '../../components/guide/TikZCodeExample';
import GuideNavigation from '../../components/guide/GuideNavigation';

const TikZEffectsGuide: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: '概述', icon: Eye },
    { id: 'shadows', label: '阴影效果', icon: Brush },
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
          TikZ提供了丰富的视觉效果功能，包括阴影、渐变、透明度、模式填充等.
          本教程将教你如何使用这些高级效果来创建更加美观和专业的图形.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-purple-50/80 dark:bg-gray-800/80 rounded-lg p-4 border border-purple-200/50 dark:border-gray-700/50">
          <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/50 rounded-lg flex items-center justify-center mb-3">
            <Brush className="w-5 h-5 text-purple-600 dark:text-purple-400" />
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
          <Brush className="w-5 h-5 text-purple-600" />
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
      <div className="bg-orange-50/80 dark:bg-gray-800/80 rounded-xl p-6 border border-orange-200/50 dark:border-gray-700/50">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-orange-600" />
          实战示例
        </h3>
        
        <div className="space-y-6">
          <div>
            <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-3">1. 综合样式效果</h4>
            <TikZCodeExample
              code={`\\begin{tikzpicture}
% 综合应用各种样式效果
\\draw[dashed, red, thick, opacity=0.7] (0,0) -- (2,2);
\\draw[dotted, blue, ultra thick, opacity=0.8] (0,2) -- (2,0);
\\fill[green!50, opacity=0.6] (1,1) circle (0.5);
\\node[above, red, opacity=0.9] at (1,1.5) {综合效果};
\\end{tikzpicture}`}
              title="综合样式效果"
              description="组合使用多种样式属性，创建丰富的视觉效果"
            />
          </div>
          
          <div>
            <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-3">2. 渐变和阴影效果</h4>
            <TikZCodeExample
              code={`\\begin{tikzpicture}
% 创建渐变和阴影效果
\\draw[thick, red, opacity=0.8] (0,0) rectangle (2,1);
\\draw[thick, red, opacity=0.6] (0.1,0.1) rectangle (2.1,1.1);
\\draw[thick, red, opacity=0.4] (0.2,0.2) rectangle (2.2,1.2);
\\fill[red!30, opacity=0.7] (0,0) rectangle (2,1);
\\end{tikzpicture}`}
              title="渐变和阴影"
              description="通过多层绘制和透明度变化模拟阴影效果"
            />
          </div>
          
          <div>
            <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-3">3. 高级线条样式</h4>
            <TikZCodeExample
              code={`\\begin{tikzpicture}
% 展示各种线条样式
\\draw[loosely dashed, thick, blue] (0,0) -- (2,0);
\\draw[densely dotted, thick, green] (0,0.5) -- (2,0.5);
\\draw[loosely dotted, thick, red] (0,1) -- (2,1);
\\draw[densely dashed, thick, purple] (0,1.5) -- (2,1.5);
\\end{tikzpicture}`}
              title="高级线条样式"
              description="使用不同的虚线样式创建丰富的线条效果"
            />
          </div>
        </div>
      </div>
    </motion.div>
  );


  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <GuideNavigation 
        title="TikZ 特效样式" 
        description="掌握TikZ的线条样式、颜色、透明度和高级视觉效果"
        type="tikz"
      />

      {/* 导航标签 */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex flex-wrap justify-center gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-orange-600 text-white shadow-lg'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
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
          {activeTab === 'shadows' && renderShadows()}
          {activeTab === 'gradients' && renderGradients()}
          {activeTab === 'transparency' && renderTransparency()}
          {activeTab === 'examples' && renderExamples()}
        </motion.div>
      </div>
    </div>
  );
};

export default TikZEffectsGuide;
