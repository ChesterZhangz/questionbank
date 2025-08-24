import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Calculator, 
  TrendingUp, 
  Grid, 
  Eye,
  Zap
} from 'lucide-react';
import TikZCodeExample from '../../components/guide/TikZCodeExample';
import GuideNavigation from '../../components/guide/GuideNavigation';

const TikZFunctionsGuide: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: '概述', icon: Eye },
    { id: 'basics', label: '基础函数', icon: Calculator },
    { id: 'coordinates', label: '坐标系统', icon: Grid },
    { id: 'advanced', label: '高级函数', icon: TrendingUp },
    { id: 'examples', label: '实战示例', icon: Zap }
  ];

  const renderOverview = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-6 border border-blue-200/50 dark:border-blue-700/50">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
            <Calculator className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">TikZ 函数图像绘制</h2>
            <p className="text-gray-600 dark:text-gray-400">掌握数学函数的可视化绘制技巧</p>
          </div>
        </div>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
          TikZ函数绘制系统可以创建各种数学函数的图像，包括线性函数、二次函数、三角函数等。
          本教程将教你如何设置坐标轴、绘制网格、绘制函数曲线，以及如何自定义函数图像的样式。
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-purple-50/80 dark:bg-gray-800/80 rounded-lg p-4 border border-purple-200/50 dark:border-gray-700/50">
          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center mb-3">
            <Calculator className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">基础函数</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">学习绘制线性、二次、三角函数</p>
        </div>
        
        <div className="bg-purple-50/80 dark:bg-gray-800/80 rounded-lg p-4 border border-purple-200/50 dark:border-gray-700/50">
          <div className="w-10 h-10 bg-green-100 dark:bg-green-900/50 rounded-lg flex items-center justify-center mb-3">
            <Grid className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">坐标系统</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">设置坐标轴、网格、刻度</p>
        </div>
        
        <div className="bg-purple-50/80 dark:bg-gray-800/80 rounded-lg p-4 border border-purple-200/50 dark:border-gray-700/50">
          <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/50 rounded-lg flex items-center justify-center mb-3">
            <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">高级技巧</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">参数化函数、多函数组合</p>
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
          <Calculator className="w-5 h-5 text-blue-600" />
          基础函数绘制
        </h3>
        
        <div className="space-y-6">
          <div>
            <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-3">1. 线性函数</h4>
            <TikZCodeExample
              code={`\\begin{tikzpicture}
\\draw[step=0.5cm,gray,very thin] (-2,-2) grid (2,2);
\\draw[->] (-2.5,0) -- (2.5,0);
\\draw[->] (0,-2.5) -- (0,2.5);
\\draw[red, thick] plot {x};
\\end{tikzpicture}`}
              title="线性函数 y=x"
              description="绘制线性函数y=x，包含坐标网格和坐标轴"
            />
          </div>
          
          <div>
            <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-3">2. 二次函数</h4>
            <TikZCodeExample
              code={`\\begin{tikzpicture}
\\draw[step=0.5cm,gray,very thin] (-2,-1) grid (2,3);
\\draw[->] (-2.5,0) -- (2.5,0);
\\draw[->] (0,-1.5) -- (0,3.5);
\\draw[blue, thick] plot {x^2};
\\end{tikzpicture}`}
              title="二次函数 y=x²"
              description="绘制二次函数y=x²，抛物线图像"
            />
          </div>
          
          <div>
            <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-3">3. 三角函数</h4>
            <TikZCodeExample
              code={`\\begin{tikzpicture}
\\draw[->] (-3.5,0) -- (3.5,0);
\\draw[->] (0,-1.5) -- (0,1.5);
\\draw[green, thick] plot {sin(x)};
\\end{tikzpicture}`}
              title="正弦函数 y=sin(x)"
              description="绘制正弦函数，注意使用弧度制"
            />
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
          <Grid className="w-5 h-5 text-green-600" />
          坐标系统设置
        </h3>
        
        <div className="space-y-6">
          <div>
            <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-3">1. 基础坐标轴</h4>
            <TikZCodeExample
              code={`\\begin{tikzpicture}
\\draw[->, thick] (-3,0) -- (3,0) node[right] {$x$};
\\draw[->, thick] (0,-2) -- (0,2) node[above] {$y$};
\\draw[step=0.5cm,gray,very thin] (-2,-1) grid (2,1);
\\end{tikzpicture}`}
              title="基础坐标轴"
              description="绘制带箭头的坐标轴和网格线"
            />
          </div>
          
          <div>
            <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-3">2. 带刻度的坐标轴</h4>
            <TikZCodeExample
              code={`\\begin{tikzpicture}
\\draw[->, thick] (-3,0) -- (3,0) node[right] {$x$};
\\draw[->, thick] (0,-2) -- (0,2) node[above] {$y$};
\\foreach \\x in {-2,-1,0,1,2}
  \\draw (\\x,0.1) -- (\\x,-0.1) node[below] {$\\x$};
\\foreach \\y in {-1,0,1}
  \\draw (0.1,\\y) -- (-0.1,\\y) node[left] {$\\y$};
\\end{tikzpicture}`}
              title="带刻度的坐标轴"
              description="在坐标轴上添加刻度标记和数值标签"
            />
          </div>
          
          <div>
            <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-3">3. 自定义网格</h4>
            <TikZCodeExample
              code={`\\begin{tikzpicture}
\\draw[step=0.5, gray, very thin] (-2,-1) grid (2,1);
\\draw[->, thick] (-2.5,0) -- (2.5,0) node[right] {$x$};
\\draw[->, thick] (0,-1.5) -- (0,1.5) node[above] {$y$};
\\end{tikzpicture}`}
              title="自定义网格"
              description="使用step参数控制网格密度"
            />
          </div>
          
          <div>
            <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-3">4. 使用foreach循环绘制刻度</h4>
            <TikZCodeExample
              code={`\\begin{tikzpicture}
\\draw[step=0.5cm,gray,very thin] (-2,-1) grid (2,1);
\\draw[->, thick] (-2.5,0) -- (2.5,0) node[right] {$x$};
\\draw[->, thick] (0,-1.5) -- (0,1.5) node[above] {$y$};
\\foreach \\x in {-2,-1,0,1,2}
  \\draw (\\x,0.1) -- (\\x,-0.1) node[below] {$\\x$};
\\foreach \\y in {-1,0,1}
  \\draw (0.1,\\y) -- (-0.1,\\y) node[left] {$\\y$};
\\end{tikzpicture}`}
              title="带刻度的坐标轴"
              description="使用foreach循环自动生成刻度标记和数值标签"
            />
          </div>
        </div>
      </div>
    </motion.div>
  );

  const renderAdvanced = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="bg-purple-50/80 dark:bg-gray-800/80 rounded-xl p-6 border border-purple-200/50 dark:border-gray-700/50">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-purple-600" />
          高级函数技巧
        </h3>
        
        <div className="space-y-6">
          <div>
            <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-3">1. 参数化函数</h4>
            <TikZCodeExample
              code={`\\begin{tikzpicture}
\\draw[step=0.5cm,gray,very thin] (-2,-2) grid (2,2);
\\draw[->] (-2.5,0) -- (2.5,0);
\\draw[->] (0,-2.5) -- (0,2.5);
\\draw[red, thick] plot {cos(x), sin(x)};
\\end{tikzpicture}`}
              title="参数化圆"
              description="使用参数方程绘制单位圆"
            />
          </div>
          
          <div>
            <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-3">2. 多函数组合</h4>
            <TikZCodeExample
              code={`\\begin{tikzpicture}
\\draw[step=0.5cm,gray,very thin] (-2,-1) grid (2,3);
\\draw[->] (-2.5,0) -- (2.5,0);
\\draw[->] (0,-1.5) -- (0,3.5);
\\draw[red, thick] plot {x^2};
\\draw[blue, thick] plot {x+1};
\\end{tikzpicture}`}
              title="多函数组合"
              description="在同一坐标系中绘制多个函数"
            />
          </div>
          
          <div>
            <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-3">3. 函数变换</h4>
            <TikZCodeExample
              code={`\\begin{tikzpicture}
\\draw[step=0.5cm,gray,very thin] (-2,-1) grid (2,3);
\\draw[->] (-2.5,0) -- (2.5,0);
\\draw[->] (0,-1.5) -- (0,3.5);
\\draw[red, thick] plot {x^2};
\\draw[blue, thick] plot {(x-1)^2};
\\end{tikzpicture}`}
              title="函数变换"
              description="绘制平移后的函数图像"
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
      <div className="bg-blue-50/80 dark:bg-gray-800/80 rounded-xl p-6 border border-blue-200/50 dark:border-gray-700/50">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-blue-600" />
          实战示例
        </h3>
        
        <div className="space-y-6">
          <div>
            <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-3">1. 二次函数图像</h4>
            <TikZCodeExample
              code={`\\begin{tikzpicture}
% 绘制二次函数 y = x^2
\\draw[step=0.5cm,gray,very thin] (-2,-1) grid (2,4);
\\draw[->, thick] (-2.5,0) -- (2.5,0) node[right] {$x$};
\\draw[->, thick] (0,-1.5) -- (0,4.5) node[above] {$y$};
\\draw[red, thick, smooth] plot[domain=-2:2] (\\x,{\\x*\\x});
\\node[red] at (1.5,2.5) {$y = x^2$};
\\end{tikzpicture}`}
              title="二次函数"
              description="绘制标准的二次函数图像，包含网格和标签"
            />
          </div>
          
          <div>
            <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-3">2. 三角函数图像</h4>
            <TikZCodeExample
              code={`\\begin{tikzpicture}
% 绘制正弦函数 y = sin(x)
\\draw[step=0.5cm,gray,very thin] (-3,-1.5) grid (3,1.5);
\\draw[->, thick] (-3.5,0) -- (3.5,0) node[right] {$x$};
\\draw[->, thick] (0,-2) -- (0,2) node[above] {$y$};
\\draw[blue, thick, smooth] plot[domain=-3:3] (\\x,{sin(\\x r)});
\\node[blue] at (2,1.2) {$y = \\sin(x)$};
\\end{tikzpicture}`}
              title="正弦函数"
              description="绘制正弦函数图像，注意角度单位转换"
            />
          </div>
          
          <div>
            <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-3">3. 复合函数图像</h4>
            <TikZCodeExample
              code={`\\begin{tikzpicture}
% 绘制复合函数 y = x^2 + sin(x)
\\draw[step=0.5cm,gray,very thin] (-2,-1) grid (2,5);
\\draw[->, thick] (-2.5,0) -- (2.5,0) node[right] {$x$};
\\draw[->, thick] (0,-1.5) -- (0,5.5) node[above] {$y$};
\\draw[purple, thick, smooth] plot[domain=-2:2] (\\x,{\\x*\\x + sin(\\x r)});
\\node[purple] at (1.5,4) {$y = x^2 + \\sin(x)$};
\\end{tikzpicture}`}
              title="复合函数"
              description="组合代数函数和三角函数，展示复杂函数绘制"
            />
          </div>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <GuideNavigation 
        title="TikZ 函数绘图" 
        description="学习使用TikZ绘制函数图像、坐标轴和网格的高级技巧"
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
                  ? 'bg-blue-600 text-white shadow-lg'
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
          {activeTab === 'coordinates' && renderCoordinates()}
          {activeTab === 'advanced' && renderAdvanced()}
          {activeTab === 'examples' && renderExamples()}
        </motion.div>
      </div>
    </div>
  );
};

export default TikZFunctionsGuide;
