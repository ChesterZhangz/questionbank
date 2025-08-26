import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle } from 'lucide-react';

interface ModernUploadSpinnerProps {
  isUploading: boolean;
  progress?: number;
  error?: string;
  success?: boolean;
  className?: string;
  currentFile?: string;
  totalFiles?: number;
}

export const ModernUploadSpinner: React.FC<ModernUploadSpinnerProps> = ({
  isUploading,
  progress = 0,
  error,
  success,
  className = '',
  currentFile,
  totalFiles
}) => {
  if (!isUploading && !error && !success) return null;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        transition={{ 
          type: "spring", 
          stiffness: 300, 
          damping: 25,
          duration: 0.3
        }}
        className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm ${className}`}
      >
        {/* 状态指示器 */}
        <div className="relative">
          {/* 背景条 */}
          <motion.div
            className="absolute inset-0 bg-blue-100 dark:bg-blue-900/20"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            style={{ transformOrigin: 'left' }}
          />
          
          {/* 内容区域 */}
          <div className="relative p-4">
            <div className="flex items-center space-x-3">
              {/* 状态图标 */}
              <div className="flex-shrink-0">
                {error ? (
                  <AlertCircle className="w-5 h-5 text-red-500" />
                ) : success ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <div className="w-5 h-5 text-blue-500">
                    <div className="w-full h-full border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>

              {/* 状态文本和进度 */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <motion.div
                      className="text-sm font-medium text-gray-900 dark:text-gray-100"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.1 }}
                    >
                      {error ? '上传失败' : success ? '上传成功' : '正在上传...'}
                    </motion.div>
                    
                    {currentFile && (
                      <motion.div
                        className="text-xs text-gray-500 dark:text-gray-400 mt-1"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                      >
                        {currentFile}
                        {totalFiles && totalFiles > 1 && ` (${totalFiles} 个文件)`}
                      </motion.div>
                    )}
                  </div>
                  
                  {/* 进度指示器 */}
                  {isUploading && (
                    <motion.div
                      className="flex-shrink-0 ml-3"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {Math.round(progress)}%
                      </div>
                    </motion.div>
                  )}
                </div>

                                 {/* 进度条 */}
                 {isUploading && (
                   <motion.div
                     className="mt-3 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden"
                     initial={{ scaleX: 0, opacity: 0 }}
                     animate={{ scaleX: 1, opacity: 1 }}
                     transition={{ delay: 0.4, duration: 0.5 }}
                   >
                     <motion.div
                       className="h-full bg-blue-500 rounded-full"
                       initial={{ width: 0 }}
                       animate={{ width: `${progress}%` }}
                       transition={{ duration: 1.2, ease: [0.4, 0.0, 0.2, 1] }}
                     />
                   </motion.div>
                 )}

                {/* 错误信息 */}
                {error && (
                  <motion.div
                    className="mt-2 text-xs text-red-500 flex items-center space-x-1"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <AlertCircle className="w-3 h-3" />
                    <span>{error}</span>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 底部装饰条 */}
        <motion.div
          className="h-1 bg-blue-500"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          style={{ transformOrigin: 'left' }}
        />
      </motion.div>
    </AnimatePresence>
  );
};
