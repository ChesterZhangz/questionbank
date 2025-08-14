import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface StatItem {
  label: string;
  count: number;
  color: {
    bg: string;
    border: string;
    dot: string;
    text: string;
  };
}

interface DynamicStatsProps {
  stats: StatItem[];
  maxItems?: number;
  className?: string;
}

const DynamicStats: React.FC<DynamicStatsProps> = ({ 
  stats, 
  maxItems = 2, 
  className = '' 
}) => {
  // 只显示前maxItems个统计项
  const displayStats = stats.slice(0, maxItems);

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <AnimatePresence mode="popLayout">
        {displayStats.map((stat, index) => (
          <motion.div
            key={`${stat.label}-${stat.count}`} // 使用更具体的key来确保动画正确触发
            initial={{ 
              opacity: 0, 
              scale: 0.8,
              y: -10,
              rotateX: -15
            }}
            animate={{ 
              opacity: 1, 
              scale: 1,
              y: 0,
              rotateX: 0
            }}
            exit={{ 
              opacity: 0, 
              scale: 0.8,
              y: -10,
              rotateX: 15
            }}
            transition={{ 
              duration: 0.4,
              delay: index * 0.1,
              ease: [0.25, 0.1, 0.25, 1], // 使用更平滑的缓动函数
              type: "spring",
              stiffness: 300,
              damping: 25
            }}
            layout // 启用布局动画
            className={`bg-gradient-to-r ${stat.color.bg} rounded-xl px-4 py-2 border ${stat.color.border} shadow-sm dark:shadow-gray-900/20 hover:shadow-md dark:hover:shadow-gray-900/30 transition-shadow duration-200`}
          >
            <motion.div 
              className="flex items-center space-x-2"
              layout
            >
              <motion.div 
                className={`w-2 h-2 ${stat.color.dot} rounded-full`}
                layout
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ 
                  delay: 0.1 + index * 0.1,
                  type: "spring",
                  stiffness: 500,
                  damping: 30
                }}
              />
              <motion.span 
                className={`text-sm font-medium ${stat.color.text}`}
                layout
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ 
                  delay: 0.15 + index * 0.1,
                  duration: 0.3,
                  ease: "easeOut"
                }}
              >
                {stat.label}: {stat.count}
              </motion.span>
            </motion.div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default DynamicStats; 