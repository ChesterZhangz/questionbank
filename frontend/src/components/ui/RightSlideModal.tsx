import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle, HelpCircle } from 'lucide-react';

interface RightSlideModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: 'success' | 'warning' | 'error' | 'info' | 'confirm';
  width?: 'sm' | 'md' | 'lg' | 'xl';
  autoClose?: number;
  showProgress?: boolean;
}

const RightSlideModal: React.FC<RightSlideModalProps> = ({
  isOpen,
  onClose,
  title,
  message,
  type = 'info',
  width = 'md',
  autoClose = 1500,
  showProgress = true
}) => {
  const [progress, setProgress] = useState(100);

  // 类型配置
  const typeConfig = {
    success: {
      icon: CheckCircle,
      bgColor: 'bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/40 dark:to-emerald-800/40',
      borderColor: 'border-emerald-200 dark:border-emerald-700',
      textColor: 'text-emerald-800 dark:text-emerald-200',
      progressColor: 'bg-emerald-500',
      shadowColor: 'shadow-emerald-500/20',
      accentColor: 'from-emerald-400 to-emerald-500'
    },
    warning: {
      icon: AlertTriangle,
      bgColor: 'bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/40 dark:to-amber-800/40',
      borderColor: 'border-amber-200 dark:border-amber-700',
      textColor: 'text-amber-800 dark:text-amber-200',
      progressColor: 'bg-amber-500',
      shadowColor: 'shadow-amber-500/20',
      accentColor: 'from-amber-400 to-amber-500'
    },
    error: {
      icon: AlertCircle,
      bgColor: 'bg-gradient-to-br from-rose-50 to-rose-100 dark:from-rose-900/40 dark:to-rose-800/40',
      borderColor: 'border-rose-200 dark:border-rose-700',
      textColor: 'text-rose-800 dark:text-rose-200',
      progressColor: 'bg-rose-500',
      shadowColor: 'shadow-rose-500/20',
      accentColor: 'from-rose-400 to-rose-500'
    },
    info: {
      icon: Info,
      bgColor: 'bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/40 dark:to-blue-800/40',
      borderColor: 'border-blue-200 dark:border-blue-700',
      textColor: 'text-blue-800 dark:text-blue-200',
      progressColor: 'bg-blue-500',
      shadowColor: 'shadow-blue-500/20',
      accentColor: 'from-blue-400 to-blue-500'
    },
    confirm: {
      icon: HelpCircle,
      bgColor: 'bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/40 dark:to-indigo-800/40',
      borderColor: 'border-indigo-200 dark:border-indigo-700',
      textColor: 'text-indigo-800 dark:text-indigo-200',
      progressColor: 'bg-indigo-500',
      shadowColor: 'shadow-indigo-500/20',
      accentColor: 'from-indigo-400 to-indigo-500'
    }
  };

  const config = typeConfig[type];
  const IconComponent = config.icon;

  // 宽度类 - 更紧凑的宽度
  const getWidthClass = () => {
    switch (width) {
      case 'sm': return 'w-56';
      case 'md': return 'w-64';
      case 'lg': return 'w-72';
      case 'xl': return 'w-80';
      default: return 'w-64';
    }
  };

  // 自动关闭逻辑
  useEffect(() => {
    if (!isOpen || !autoClose || autoClose <= 0) return;

    const startTime = Date.now();
    const endTime = startTime + autoClose;

    const updateProgress = () => {
      const now = Date.now();
      const remaining = Math.max(0, endTime - now);
      const newProgress = (remaining / autoClose) * 100;
      
      setProgress(newProgress);

      if (remaining > 0) {
        requestAnimationFrame(updateProgress);
      } else {
        onClose();
      }
    };

    const timer = setTimeout(() => {
      requestAnimationFrame(updateProgress);
    }, 100);

    return () => {
      clearTimeout(timer);
      setProgress(100);
    };
  }, [isOpen, autoClose, onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          key="rightSlideModal"
          initial={{ 
            opacity: 0, 
            x: 100, 
            scale: 0.8,
            rotateY: -15
          }}
          animate={{ 
            opacity: 1, 
            x: 0, 
            scale: 1,
            rotateY: 0
          }}
          exit={{ 
            opacity: 0, 
            x: 100, 
            scale: 0.8,
            rotateY: -15
          }}
          transition={{ 
            type: "spring",
            stiffness: 400,
            damping: 25,
            duration: 0.3
          }}
          className={`fixed top-4 right-4 z-[99999] ${getWidthClass()}`}
          style={{
            transformOrigin: "right center",
            perspective: "1000px"
          }}
        >
          {/* 高斯模糊背景 */}
          <motion.div 
            className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-xl"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ delay: 0.1, duration: 0.2 }}
          />
          
          {/* 主卡片 - 更紧凑的高度 */}
          <motion.div 
            className={`relative ${config.bgColor} ${config.borderColor} border rounded-xl shadow-xl ${config.shadowColor} overflow-hidden`}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ delay: 0.05, duration: 0.25 }}
          >
            {/* 顶部装饰条 */}
            <motion.div 
              className={`h-0.5 bg-gradient-to-r ${config.accentColor}`}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              exit={{ scaleX: 0 }}
              transition={{ delay: 0.2, duration: 0.3 }}
            />
            
            {/* 内容区域 - 减少内边距 */}
            <div className="p-2.5 relative">
              {/* 头部 - 更紧凑的布局 */}
              <motion.div 
                className="flex items-center gap-2 mb-1.5"
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -10, opacity: 0 }}
                transition={{ delay: 0.1, duration: 0.2 }}
              >
                <motion.div 
                  className={`p-1 rounded-md bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm`}
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0, rotate: 180 }}
                  transition={{ delay: 0.15, duration: 0.3, type: "spring", stiffness: 300 }}
                >
                  <IconComponent className={`w-3.5 h-3.5 ${config.textColor}`} />
                </motion.div>
                <motion.h3 
                  className={`text-xs font-semibold ${config.textColor} flex-1`}
                  initial={{ x: -10, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -10, opacity: 0 }}
                  transition={{ delay: 0.2, duration: 0.2 }}
                >
                  {title}
                </motion.h3>
                <motion.button
                  onClick={onClose}
                  className="p-0.5 rounded hover:bg-white/40 dark:hover:bg-gray-800/40 transition-colors"
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  initial={{ scale: 0, rotate: -90 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0, rotate: 90 }}
                  transition={{ delay: 0.25, duration: 0.3, type: "spring", stiffness: 400 }}
                >
                  <X className="w-3 h-3 text-gray-500 dark:text-gray-400" />
                </motion.button>
              </motion.div>

              {/* 消息内容 - 减少下边距 */}
              <motion.div 
                className={`ml-8 mb-1.5`}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
                transition={{ delay: 0.3, duration: 0.25 }}
              >
                <p className={`text-xs ${config.textColor} leading-tight whitespace-pre-line max-h-32 overflow-y-auto dark:text-white`}>
                  {message}
                </p>
              </motion.div>

              {/* 进度条 - 放在卡片内部偏下位置，更细 */}
              {showProgress && (
                <motion.div 
                  className="ml-8 mb-1"
                  initial={{ scaleX: 0, opacity: 0 }}
                  animate={{ scaleX: 1, opacity: 1 }}
                  exit={{ scaleX: 0, opacity: 0 }}
                  transition={{ delay: 0.4, duration: 0.3 }}
                >
                  <div className="w-full bg-white/40 dark:bg-gray-800/40 rounded-full h-0.5 overflow-hidden">
                    <motion.div
                      className={`h-full ${config.progressColor} rounded-full`}
                      initial={{ width: '100%' }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.1, ease: "linear" }}
                    />
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default RightSlideModal;
