import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Palette, 
  Code, 
  Circle, 
  ArrowRight,
  ChevronRight,
  Eye,
  PenTool,
  Target,
  Zap
} from 'lucide-react';
import { Link } from 'react-router-dom';
import TikZCodeExample from '../../components/guide/TikZCodeExample';

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
          <Zap className="w-5 h-5 text-yellow-600" />
          实战示例
        </h3>
        
        <div className="space-y-6">
          <div>
            <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-3">1. 简单几何图形组合</h4>
            <TikZCodeExample
              code={`\\begin{tikzpicture}
\\draw[red, thick] (0,0) circle (1cm);
\\draw[blue, thick] (2,0) circle (1cm);
\\draw[green, thick] (1,1.5) circle (1cm);
\\end{tikzpicture}`}
              title="三圆组合"
              description="绘制三个不同颜色的圆形，形成几何图案"
            />
          </div>
          
          <div>
            <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-3">2. 带标签的图形</h4>
            <TikZCodeExample
              code={`\\begin{tikzpicture}
\\draw[thick] (0,0) rectangle (3,2);
\\node at (1.5,1) {矩形};
\\node[above] at (1.5,2) {标签};
\\end{tikzpicture}`}
              title="带标签的矩形"
              description="绘制矩形并添加文字标签"
            />
          </div>
          
          <div>
            <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-3">3. 复杂路径绘制</h4>
            <TikZCodeExample
              code={`\\begin{tikzpicture}
\\draw[thick, blue] (0,0) -- (1,1) -- (2,0) -- (3,1) -- (4,0);
\\fill[red!30] (0,0) -- (1,1) -- (2,0) -- (3,1) -- (4,0) -- cycle;
\\end{tikzpicture}`}
              title="折线图"
              description="绘制折线并填充下方区域"
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
      case 'basics':
        return renderBasics();
      case 'shapes':
        return renderShapes();
      case 'coordinates':
        return renderCoordinates();
      case 'examples':
        return renderExamples();
      default:
        return renderOverview();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-pink-50/30 dark:from-slate-900 dark:via-purple-900/20 dark:to-pink-900/20">
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
              className="p-2 rounded-lg bg-purple-50/80 dark:bg-gray-800/80 backdrop-blur-sm border border-purple-200/50 dark:border-gray-700/50 hover:bg-purple-100 dark:hover:bg-gray-700 transition-all duration-200"
            >
              <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400 rotate-180" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">TikZ 基础教程</h1>
              <p className="text-gray-600 dark:text-gray-400">从零开始学习TikZ矢量图形绘制</p>
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
                    ? 'bg-purple-500 text-white shadow-lg'
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
                to="/guide/tikz/functions"
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 hover:scale-105"
              >
                <PenTool className="w-4 h-4" />
                函数图像绘制
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/guide/tikz/effects"
                className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 hover:scale-105"
              >
                <Zap className="w-4 h-4" />
                高级效果
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default TikZBasicsGuide;
