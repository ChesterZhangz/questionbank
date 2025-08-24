import React from 'react';
import { motion } from 'framer-motion';
import { 
  AlertTriangle,
  RefreshCw,
  Home
} from 'lucide-react';
import Button from '../ui/Button';

interface ErrorFallbackProps {
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({ error, errorInfo }) => {
  const handleRefresh = () => {
    window.location.reload();
  };

  const handleGoHome = () => {
    window.location.href = '/dashboard';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl dark:shadow-gray-900/50 p-8 text-center"
      >
        {/* 错误图标 */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
          className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-6"
        >
          <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
        </motion.div>

        {/* 错误标题 */}
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2"
        >
          应用程序错误
        </motion.h1>

        {/* 错误消息 */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-gray-600 dark:text-gray-300 mb-6"
        >
          抱歉，应用程序遇到了一个意外错误.我们的技术团队已经收到这个错误报告.
        </motion.p>

        {/* 错误详情（仅在开发环境显示） */}
        {process.env.NODE_ENV === 'development' && error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mb-6 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg text-left"
          >
            <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">错误详情：</h3>
            <p className="text-sm text-red-600 dark:text-red-400 mb-2">{error.message}</p>
            {errorInfo && (
              <details className="text-xs text-gray-600 dark:text-gray-400">
                <summary className="cursor-pointer hover:text-gray-800 dark:hover:text-gray-200">
                  查看堆栈跟踪
                </summary>
                <pre className="mt-2 whitespace-pre-wrap">
                  {errorInfo.componentStack}
                </pre>
              </details>
            )}
          </motion.div>
        )}

        {/* 操作按钮 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-3"
        >
          <Button
            onClick={handleRefresh}
            variant="primary"
            className="flex-1"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            刷新页面
          </Button>
          
          <Button
            onClick={handleGoHome}
            variant="outline"
            className="flex-1"
          >
            <Home className="w-4 h-4 mr-2" />
            返回首页
          </Button>
        </motion.div>

        {/* 联系信息 */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-xs text-gray-500 dark:text-gray-400 mt-6"
        >
          如果问题持续存在，请联系技术支持
        </motion.p>
      </motion.div>
    </div>
  );
};

export default ErrorFallback; 