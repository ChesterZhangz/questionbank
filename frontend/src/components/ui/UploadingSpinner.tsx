import React from 'react';
import { motion } from 'framer-motion';
import { Upload, CheckCircle, AlertCircle } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';

interface UploadingSpinnerProps {
  isUploading: boolean;
  progress?: number;
  error?: string;
  success?: boolean;
  className?: string;
}

export const UploadingSpinner: React.FC<UploadingSpinnerProps> = ({
  isUploading,
  progress = 0,
  error,
  success,
  className = ''
}) => {
  const { t } = useTranslation();
  if (!isUploading && !error && !success) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className={`flex items-center space-x-3 p-3 rounded-lg border ${
        error 
          ? 'bg-red-50 border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400'
          : success
          ? 'bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400'
          : 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400'
      } ${className}`}
    >
      {/* 状态图标 */}
      <motion.div
        animate={isUploading ? { rotate: 360 } : {}}
        transition={{ 
          duration: 1, 
          repeat: isUploading ? Infinity : 0, 
          ease: "linear" 
        }}
        className="flex-shrink-0"
      >
        {error ? (
          <AlertCircle className="w-5 h-5" />
        ) : success ? (
          <CheckCircle className="w-5 h-5" />
        ) : (
          <Upload className="w-5 h-5" />
        )}
      </motion.div>

      {/* 状态文本 */}
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium">
          {error ? t('ui.uploadingSpinner.uploadFailed') : success ? t('ui.uploadingSpinner.uploadSuccess') : t('ui.uploadingSpinner.uploading')}
        </div>
        {error && (
          <div className="text-xs opacity-80">{error}</div>
        )}
      </div>

      {/* 进度条 */}
      {isUploading && (
        <div className="flex-shrink-0 w-16">
          <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
            <motion.div
              className="bg-blue-600 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            />
          </div>
          <div className="text-xs text-center mt-1">{Math.round(progress)}%</div>
        </div>
      )}

      {/* 成功或错误指示器 */}
      {success && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        >
          <CheckCircle className="w-5 h-5 text-green-500" />
        </motion.div>
      )}
      
      {error && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        >
          <AlertCircle className="w-5 h-5 text-red-500" />
        </motion.div>
      )}
    </motion.div>
  );
};
