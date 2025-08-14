import React from 'react';
import { motion } from 'framer-motion';
import { Loader2, RefreshCw, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import  Button  from './Button';

export interface LoadingPageProps {
  /** 加载状态类型 */
  type?: 'loading' | 'error' | 'success' | 'empty';
  /** 标题文字 */
  title?: string;
  /** 描述文字 */
  description?: string;
  /** 错误信息 */
  error?: string;
  /** 是否显示重试按钮 */
  showRetry?: boolean;
  /** 重试回调函数 */
  onRetry?: () => void;
  /** 返回按钮文字 */
  backText?: string;
  /** 返回回调函数 */
  onBack?: () => void;
  /** 自定义图标 */
  icon?: React.ReactNode;
  /** 加载动画类型 */
  animation?: 'spinner' | 'pulse' | 'dots' | 'wave';
  /** 是否全屏显示 */
  fullScreen?: boolean;
  /** 自定义样式类 */
  className?: string;
  /** 子元素 */
  children?: React.ReactNode;
}

const LoadingPage: React.FC<LoadingPageProps> = ({
  type = 'loading',
  title,
  description,
  error,
  showRetry = false,
  onRetry,
  backText,
  onBack,
  icon,
  animation = 'spinner',
  fullScreen = true,
  className = '',
  children
}) => {
  // 默认配置
  const getDefaultConfig = () => {
    switch (type) {
      case 'loading':
        return {
          icon: icon || <Loader2 className="w-12 h-12 text-blue-600 dark:text-blue-400" />,
          title: title || '加载中...',
          description: description || '请稍候，正在处理您的请求',
          bgColor: 'bg-blue-50 dark:bg-blue-900/20',
          borderColor: 'border-blue-200 dark:border-blue-700',
          textColor: 'text-blue-800 dark:text-blue-200'
        };
      case 'error':
        return {
          icon: icon || <XCircle className="w-12 h-12 text-red-500 dark:text-red-400" />,
          title: title || '加载失败',
          description: description || error || '发生了一个错误，请重试',
          bgColor: 'bg-red-50 dark:bg-red-900/20',
          borderColor: 'border-red-200 dark:border-red-700',
          textColor: 'text-red-800 dark:text-red-200'
        };
      case 'success':
        return {
          icon: icon || <CheckCircle className="w-12 h-12 text-green-500 dark:text-green-400" />,
          title: title || '加载完成',
          description: description || '数据加载成功',
          bgColor: 'bg-green-50 dark:bg-green-900/20',
          borderColor: 'border-green-200 dark:border-green-700',
          textColor: 'text-green-800 dark:text-green-200'
        };
      case 'empty':
        return {
          icon: icon || <AlertTriangle className="w-12 h-12 text-yellow-500 dark:text-yellow-400" />,
          title: title || '暂无数据',
          description: description || '当前没有可显示的内容',
          bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
          borderColor: 'border-yellow-200 dark:border-yellow-700',
          textColor: 'text-yellow-800 dark:text-yellow-200'
        };
      default:
        return {
          icon: icon || <Loader2 className="w-12 h-12 text-blue-600 dark:text-blue-400" />,
          title: title || '加载中...',
          description: description || '请稍候...',
          bgColor: 'bg-gray-50 dark:bg-gray-800/50',
          borderColor: 'border-gray-200 dark:border-gray-700',
          textColor: 'text-gray-800 dark:text-gray-200'
        };
    }
  };

  const config = getDefaultConfig();

  // 加载动画组件
  const LoadingAnimation = () => {
    if (type !== 'loading') return null;

    switch (animation) {
      case 'spinner':
        return (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-4 border-blue-200 dark:border-blue-700 border-t-blue-600 dark:border-t-blue-400 rounded-full"
          />
        );
      case 'pulse':
        return (
          <div className="flex space-x-2">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.2 }}
                className="w-3 h-3 bg-blue-600 dark:bg-blue-400 rounded-full"
              />
            ))}
          </div>
        );
      case 'dots':
        return (
          <div className="flex space-x-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.1 }}
                className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full"
              />
            ))}
          </div>
        );
      case 'wave':
        return (
          <div className="flex space-x-1">
            {[0, 1, 2, 3, 4].map((i) => (
              <motion.div
                key={i}
                animate={{ height: [20, 40, 20] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.1 }}
                className="w-1 bg-blue-600 dark:bg-blue-400 rounded-full"
              />
            ))}
          </div>
        );
      default:
        return config.icon;
    }
  };

  const containerClass = fullScreen 
    ? `min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center ${className}`
    : `flex items-center justify-center p-8 ${className}`;

  return (
    <div className={containerClass}>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="text-center max-w-md mx-auto"
      >
        {/* 主卡片 */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className={`${config.bgColor} ${config.borderColor} border rounded-2xl p-8 shadow-lg dark:shadow-gray-900/30`}
        >
          {/* 图标区域 */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, duration: 0.4, type: "spring", stiffness: 200 }}
            className="mb-6"
          >
            {type === 'loading' ? <LoadingAnimation /> : config.icon}
          </motion.div>

          {/* 标题 */}
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.4 }}
            className={`text-2xl font-bold ${config.textColor} mb-3`}
          >
            {config.title}
          </motion.h2>

          {/* 描述 */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.4 }}
            className="text-gray-600 dark:text-gray-300 text-base leading-relaxed mb-6"
          >
            {config.description}
          </motion.p>

          {/* 子元素 */}
          {children && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.4 }}
            >
              {children}
            </motion.div>
          )}

          {/* 操作按钮 */}
          {(showRetry || backText) && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.4 }}
              className="flex flex-col sm:flex-row gap-3 justify-center"
            >
              {showRetry && onRetry && (
                <Button
                  onClick={onRetry}
                  className="flex items-center space-x-2 px-6 py-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>重试</span>
                </Button>
              )}
              
              {backText && onBack && (
                <Button
                  variant="outline"
                  onClick={onBack}
                  className="px-6 py-2"
                >
                  {backText}
                </Button>
              )}
            </motion.div>
          )}
        </motion.div>

        {/* 装饰性背景元素 */}
        {fullScreen && (
          <>
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 0.1, scale: 1 }}
              transition={{ delay: 1, duration: 1 }}
              className="absolute top-20 left-20 w-32 h-32 bg-blue-200 dark:bg-blue-800 rounded-full blur-3xl"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 0.1, scale: 1 }}
              transition={{ delay: 1.2, duration: 1 }}
              className="absolute bottom-20 right-20 w-24 h-24 bg-purple-200 dark:bg-purple-800 rounded-full blur-3xl"
            />
          </>
        )}
      </motion.div>
    </div>
  );
};

export default LoadingPage;
