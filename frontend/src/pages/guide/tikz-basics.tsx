import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Palette, 
  Code, 
  Circle, 
  Eye,
  Target,
  Zap
} from 'lucide-react';
import TikZCodeExample from '../../components/guide/TikZCodeExample';
import GuideNavigation from '../../components/guide/GuideNavigation';

const TikZBasicsGuide: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: '概述', icon: Eye },
    { id: 'basics', label: '基础语法', icon: Code },
    { id: 'shapes', label: '图形绘制', icon: Circle },
    { id: 'coordinates', label: '坐标系统', icon: Target },
    { id: 'examples', label: '实战示例', icon: Zap }
  ];

  const renderOverview = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6 border border-purple-200/50 dark:border-purple-700/50">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
            <Palette className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">TikZ 基础教程</h2>
            <p className="text-gray-600 dark:text-gray-400">从零开始学习TikZ矢量图形绘制</p>
          </div>
        </div>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
          TikZ是一个强大的LaTeX绘图包，可以创建高质量的矢量图形。本教程将带你掌握TikZ的基础语法、
          图形绘制、坐标系统等核心概念，通过实战示例快速上手TikZ绘图。
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-purple-50/80 dark:bg-gray-800/80 rounded-lg p-4 border border-purple-200/50 dark:border-gray-700/50">
          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center mb-3">
            <Code className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">基础语法</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">学习TikZ的基本命令和环境</p>
        </div>
        
        <div className="bg-purple-50/80 dark:bg-gray-800/80 rounded-lg p-4 border border-purple-200/50 dark:border-gray-700/50">
          <div className="w-10 h-10 bg-green-100 dark:bg-green-900/50 rounded-lg flex items-center justify-center mb-3">
            <Circle className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">图形绘制</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">掌握各种几何图形的绘制方法</p>
        </div>
        
        <div className="bg-purple-50/80 dark:bg-gray-800/80 rounded-lg p-4 border border-purple-200/50 dark:border-gray-700/50">
          <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/50 rounded-lg flex items-center justify-center mb-3">
            <Target className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">坐标系统</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">理解TikZ的坐标定位和变换</p>
        </div>
      </div>
    </motion.div>
  );

  const renderBasics = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="bg-purple-50/80 dark:bg-gray-800/80 rounded-xl p-6 border border-purple-200/50 dark:border-gray-700/50">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
          <Code className="w-5 h-5 text-blue-600" />
          TikZ 基础语法
        </h3>
        
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">1. 基本环境</h4>
            <TikZCodeExample
              code={`\\begin{tikzpicture}
% 绘图内容
\\end{tikzpicture}`}
              title="TikZ基本环境"
              description="所有TikZ绘图都必须在tikzpicture环境中进行"
            />
          </div>
          
          <div>
            <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">2. 绘制命令</h4>
            <TikZCodeExample
              code="\\draw [选项] 路径;"
              title="绘制命令"
              description="\\draw命令用于绘制路径，可以指定颜色、线宽等样式"
            />
          </div>
          
          <div>
            <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">3. 填充命令</h4>
            <TikZCodeExample
              code="\\fill [选项] 路径;"
              title="填充命令"
              description="\\fill命令用于填充封闭图形，可以指定填充颜色和透明度"
            />
          </div>
        </div>
      </div>
    </motion.div>
  );

  const renderShapes = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="bg-purple-50/80 dark:bg-gray-800/80 rounded-xl p-6 border border-purple-200/50 dark:border-gray-700/50">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
          <Circle className="w-5 h-5 text-green-600" />
          图形绘制
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-3">基础图形</h4>
            <div className="space-y-3">
              <TikZCodeExample
                code="\\draw (0,0) circle (1cm);"
                title="圆形"
                description="绘制半径为1cm的圆形"
              />
              <TikZCodeExample
                code="\\draw (0,0) rectangle (2,1);"
                title="矩形"
                description="绘制2×1的矩形"
              />
              <TikZCodeExample
                code="\\draw (0,0) -- (2,2);"
                title="直线"
                description="从(0,0)到(2,2)的直线"
              />
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-3">高级图形</h4>
            <div className="space-y-3">
              <TikZCodeExample
                code="\\draw (0,0) ellipse (2cm and 1cm);"
                title="椭圆"
                description="绘制2cm×1cm的椭圆"
              />
              <TikZCodeExample
                code="\\draw (0,0) arc (0:180:1cm);"
                title="圆弧"
                description="绘制0°到180°的圆弧"
              />
              <TikZCodeExample
                code="\\draw (0,0) parabola (1,1);"
                title="抛物线"
                description="绘制抛物线"
              />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );

  const renderCoordinates = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="bg-purple-50/80 dark:bg-gray-800/80 rounded-xl p-6 border border-purple-200/50 dark:border-gray-700/50">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-purple-600" />
          坐标系统
        </h3>
        
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">1. 笛卡尔坐标</h4>
            <TikZCodeExample
              code={`\\draw[step=0.5cm,gray,very thin] (-2,-2) grid (2,2);
\\draw[->] (-2.5,0) -- (2.5,0);
\\draw[->] (0,-2.5) -- (0,2.5);`}
              title="坐标网格"
              description="绘制坐标网格和坐标轴，step参数控制网格密度"
            />
          </div>
          
          <div>
            <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">2. 极坐标</h4>
            <TikZCodeExample
              code="\\draw (0,0) -- (30:2cm); \\draw (0,0) -- (60:1.5cm);"
              title="极坐标"
              description="使用极坐标绘制线段，格式：(角度:距离)"
            />
          </div>
          
          <div>
            <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">3. 相对坐标</h4>
            <TikZCodeExample
              code="\\draw (0,0) -- ++(1,0) -- ++(0,1) -- ++(-1,0) -- cycle;"
              title="相对坐标"
              description="使用++表示相对坐标，从当前位置开始计算"
            />
          </div>

          <div>
            <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">4. 坐标网格</h4>
            <TikZCodeExample
              code={`\\draw[step=0.5cm,gray,very thin] (-2,-2) grid (2,2);
\\draw[->] (-2.5,0) -- (2.5,0);
\\draw[->] (0,-2.5) -- (0,2.5);`}
              title="坐标网格"
              description="绘制坐标网格和坐标轴，step参数控制网格密度"
            />
          </div>
          
          <div>
            <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">5. 使用foreach循环绘制点阵</h4>
            <TikZCodeExample
              code={`\\begin{tikzpicture}
\\draw[step=0.5cm,gray,very thin] (-2,-2) grid (2,2);
\\draw[->] (-2.5,0) -- (2.5,0);
\\draw[->] (0,-2.5) -- (0,2.5);
\\foreach \\x in {-2,-1,0,1,2}
  \\foreach \\y in {-2,-1,0,1,2}
    \\fill[red] (\\x,\\y) circle (2pt);
\\end{tikzpicture}`}
              title="点阵图案"
              description="使用嵌套foreach循环在网格交叉点绘制红色圆点"
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
          <Zap className="w-5 h-5 text-orange-600" />
          实战示例
        </h3>
        
        <div className="space-y-6">
          <div>
            <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-3">1. 简单几何图形组合</h4>
            <TikZCodeExample
              code={`\\begin{tikzpicture}
% 绘制一个简单的房子
\\draw[thick] (0,0) rectangle (2,1.5);
\\draw[thick] (0,1.5) -- (1,2.5) -- (2,1.5);
\\draw[thick] (0.3,0) rectangle (0.7,0.8);
\\draw[thick] (1.3,0.5) circle (0.2);
\\end{tikzpicture}`}
              title="简单房子图形"
              description="组合矩形、三角形、圆形绘制简单房子"
            />
          </div>
          
          <div>
            <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-3">2. 坐标轴和网格</h4>
            <TikZCodeExample
              code={`\\begin{tikzpicture}
% 绘制坐标轴和网格
\\draw[step=0.5cm,gray,very thin] (-2,-1) grid (2,1);
\\draw[->, thick] (-2.5,0) -- (2.5,0) node[right] {$x$};
\\draw[->, thick] (0,-1.5) -- (0,1.5) node[above] {$y$};
\\foreach \\x in {-2,-1,0,1,2} 
  \\draw (\\x,0.1) -- (\\x,-0.1) node[below] {$\\x$};
\\foreach \\y in {-1,0,1} 
  \\draw (0.1,\\y) -- (-0.1,\\y) node[left] {$\\y$};
\\end{tikzpicture}`}
              title="坐标轴和网格"
              description="完整的坐标系统，包含网格线和刻度标记"
            />
          </div>
        </div>
      </div>
    </motion.div>
  );


  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <GuideNavigation 
        title="TikZ 基础教程" 
        description="从零开始学习TikZ矢量图形绘制的基础语法和图形绘制"
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
                  ? 'bg-purple-600 text-white shadow-lg'
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
          {activeTab === 'basics' && renderBasics()}
          {activeTab === 'shapes' && renderShapes()}
          {activeTab === 'coordinates' && renderCoordinates()}
          {activeTab === 'examples' && renderExamples()}
        </motion.div>
      </div>
    </div>
  );
};

export default TikZBasicsGuide;
