import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Calculator, 
  Target, 
  ArrowLeft
} from 'lucide-react';

interface GuideNavigationProps {
  title: string;
  description: string;
}

const GuideNavigation: React.FC<GuideNavigationProps> = ({ title, description }) => {
  const location = useLocation();

  const guideLinks = [
    {
      path: '/guide/latex/math',
      name: '数学公式',
      icon: Calculator,
      color: 'from-blue-500 to-cyan-500',
      description: '数学符号、语法和高级功能'
    },
    {
      path: '/guide/latex/questions',
      name: '题目语法',
      icon: Target,
      color: 'from-green-500 to-emerald-500',
      description: '选择题、填空题、小题结构'
    }
  ];

  return (
    <div className="sticky top-0 z-30 bg-white dark:bg-gray-900 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* 左侧标题区域 */}
          <div className="flex items-center space-x-4">
            <Link 
              to="/LaTeXGuide"
              className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm font-medium">返回指导</span>
            </Link>
            <div className="w-px h-6 bg-gray-300 dark:bg-gray-600"></div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 dark:from-gray-100 to-blue-600 dark:to-blue-400 bg-clip-text text-transparent">
                {title}
              </h1>
              <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">{description}</p>
            </div>
          </div>

          {/* 右侧导航链接 */}
          <div className="flex items-center space-x-2">
            {guideLinks.map((link) => {
              const isActive = location.pathname === link.path;
              const Icon = link.icon;
              
              return (
                <motion.div
                  key={link.path}
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Link
                    to={link.path}
                    className={`relative group flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r ' + link.color + ' text-white shadow-lg'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{link.name}</span>
                    
                    {/* 悬停提示 */}
                    {!isActive && (
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                        {link.description}
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-gray-900 dark:border-t-gray-700"></div>
                      </div>
                    )}
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuideNavigation;
