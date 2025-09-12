import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  X, 
  XCircle,
  AlertOctagon
} from 'lucide-react';
import Button from './Button';
import { useTranslation } from '../../hooks/useTranslation';

export interface AlertProps {
  type?: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  description?: string;
  showIcon?: boolean;
  showCloseButton?: boolean;
  onClose?: () => void;
  actions?: React.ReactNode;
  className?: string;
  autoClose?: boolean;
  autoCloseDelay?: number;
}

const Alert: React.FC<AlertProps> = ({
  type = 'info',
  title,
  message,
  description,
  showIcon = true,
  showCloseButton = true,
  onClose,
  actions,
  className = '',
  autoClose = false,
  autoCloseDelay = 5000
}) => {
  const { t } = useTranslation();
  
  // 自动关闭
  React.useEffect(() => {
    if (autoClose && onClose) {
      const timer = setTimeout(onClose, autoCloseDelay);
      return () => clearTimeout(timer);
    }
  }, [autoClose, onClose, autoCloseDelay]);

  // 根据类型获取样式
  const getStyles = () => {
    switch (type) {
      case 'success':
        return {
          container: 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 dark:from-green-900/20 dark:to-emerald-900/20 dark:border-green-700 dark:bg-green-900/10',
          icon: 'text-green-600 dark:text-green-400',
          title: 'text-green-800 dark:text-green-200',
          message: 'text-green-700 dark:text-green-300',
          description: 'text-green-600 dark:text-green-400',
          closeButton: 'text-green-500 hover:text-green-700 hover:bg-green-100 dark:text-green-400 dark:hover:text-green-200 dark:hover:bg-green-800/50',
          iconComponent: <CheckCircle className="w-6 h-6" />
        };
      case 'error':
        return {
          container: 'bg-gradient-to-r from-red-50 to-rose-50 border-red-200 dark:from-red-900/20 dark:to-rose-900/20 dark:border-red-700 dark:bg-red-900/10',
          icon: 'text-red-600 dark:text-red-400',
          title: 'text-red-800 dark:text-red-200',
          message: 'text-red-700 dark:text-red-300',
          description: 'text-red-600 dark:text-red-400',
          closeButton: 'text-red-500 hover:text-red-700 hover:bg-red-100 dark:text-red-400 dark:hover:text-red-200 dark:hover:bg-red-800/50',
          iconComponent: <XCircle className="w-6 h-6" />
        };
      case 'warning':
        return {
          container: 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200 dark:from-amber-900/20 dark:to-orange-900/20 dark:border-amber-700 dark:bg-amber-900/10',
          icon: 'text-amber-600 dark:text-amber-400',
          title: 'text-amber-800 dark:text-amber-200',
          message: 'text-amber-700 dark:text-amber-300',
          description: 'text-amber-600 dark:text-amber-400',
          closeButton: 'text-amber-500 hover:text-amber-700 hover:bg-amber-100 dark:text-amber-400 dark:hover:text-amber-200 dark:hover:bg-amber-800/50',
          iconComponent: <AlertTriangle className="w-6 h-6" />
        };
      case 'info':
      default:
        return {
          container: 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 dark:from-blue-900/20 dark:to-indigo-900/20 dark:border-blue-700 dark:bg-blue-900/10',
          icon: 'text-blue-600 dark:text-blue-400',
          title: 'text-blue-800 dark:text-blue-200',
          message: 'text-blue-700 dark:text-blue-300',
          description: 'text-blue-600 dark:text-blue-400',
          closeButton: 'text-blue-500 hover:text-blue-700 hover:bg-blue-100 dark:text-blue-400 dark:hover:text-blue-200 dark:hover:bg-blue-800/50',
          iconComponent: <Info className="w-6 h-6" />
        };
    }
  };

  const styles = getStyles();

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className={`relative rounded-xl border shadow-lg backdrop-blur-sm ${styles.container} ${className}`}
      >
        <div className="p-6">
          <div className="flex items-start space-x-4">
            {/* 图标 */}
            {showIcon && (
              <div className={`flex-shrink-0 ${styles.icon}`}>
                {styles.iconComponent}
              </div>
            )}

            {/* 内容 */}
            <div className="flex-1 min-w-0">
              {/* 标题 */}
              {title && (
                <h3 className={`text-lg font-semibold mb-2 ${styles.title}`}>
                  {title}
                </h3>
              )}

              {/* 消息 */}
              <p className={`text-base leading-relaxed ${styles.message}`}>
                {message}
              </p>

              {/* 描述 */}
              {description && (
                <p className={`text-sm mt-2 leading-relaxed ${styles.description}`}>
                  {description}
                </p>
              )}

              {/* 操作按钮 */}
              {actions && (
                <div className="flex flex-wrap gap-3 mt-4">
                  {actions}
                </div>
              )}
            </div>

            {/* 关闭按钮 */}
            {showCloseButton && onClose && (
              <button
                onClick={onClose}
                className={`flex-shrink-0 p-2 rounded-lg transition-all duration-200 ${styles.closeButton}`}
                aria-label={t('ui.alert.close')}
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

// 确认对话框组件
export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
  loading?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  description,
  confirmText,
  cancelText,
  type = 'danger',
  loading = false
}) => {
  const { t } = useTranslation();
  const getTypeStyles = () => {
    switch (type) {
      case 'danger':
        return {
          container: 'bg-gradient-to-r from-red-50 to-rose-50 border-red-200 dark:from-red-900/20 dark:to-rose-900/20 dark:border-red-700 dark:bg-red-900/10',
          icon: 'text-red-600 dark:text-red-400',
          title: 'text-red-800 dark:text-red-200',
          message: 'text-red-700 dark:text-red-300',
          confirmButton: 'bg-red-600 hover:bg-red-700 text-white dark:bg-red-600 dark:hover:bg-red-700',
          cancelButton: 'border-red-300 text-red-700 hover:bg-red-50 dark:border-red-700 dark:text-red-300 dark:hover:bg-red-900/50'
        };
      case 'warning':
        return {
          container: 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200 dark:from-amber-900/20 dark:to-orange-900/20 dark:border-amber-700 dark:bg-amber-900/10',
          icon: 'text-amber-600 dark:text-amber-400',
          title: 'text-amber-800 dark:text-amber-200',
          message: 'text-amber-700 dark:text-amber-300',
          confirmButton: 'bg-amber-600 hover:bg-amber-700 text-white dark:bg-amber-600 dark:hover:bg-amber-700',
          cancelButton: 'border-amber-300 text-amber-700 hover:bg-amber-50 dark:border-amber-700 dark:text-amber-300 dark:hover:bg-amber-900/50'
        };
      case 'info':
      default:
        return {
          container: 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 dark:from-blue-900/20 dark:to-indigo-900/20 dark:border-blue-700 dark:bg-blue-900/10',
          icon: 'text-blue-600 dark:text-blue-400',
          title: 'text-blue-800 dark:text-blue-200',
          message: 'text-blue-700 dark:text-blue-300',
          confirmButton: 'bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-600 dark:hover:bg-blue-700',
          cancelButton: 'border-blue-300 text-blue-700 hover:bg-blue-50 dark:border-blue-700 dark:text-blue-300 dark:hover:bg-blue-900/50'
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className={`relative max-w-md w-full rounded-xl border shadow-2xl ${styles.container}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-start space-x-4">
                {/* 图标 */}
                <div className={`flex-shrink-0 ${styles.icon}`}>
                  {type === 'danger' && <AlertOctagon className="w-6 h-6" />}
                  {type === 'warning' && <AlertTriangle className="w-6 h-6" />}
                  {type === 'info' && <Info className="w-6 h-6" />}
                </div>

                {/* 内容 */}
                <div className="flex-1 min-w-0">
                  <h3 className={`text-lg font-semibold mb-2 ${styles.title}`}>
                    {title}
                  </h3>
                  <p className={`text-base leading-relaxed ${styles.message}`}>
                    {message}
                  </p>
                  {description && (
                    <p className="text-sm text-gray-600 mt-2 leading-relaxed dark:text-gray-400">
                      {description}
                    </p>
                  )}
                </div>
              </div>

              {/* 操作按钮 */}
              <div className="flex flex-col sm:flex-row gap-3 mt-6">
                <Button
                  onClick={onClose}
                  variant="outline"
                  className={`flex-1 ${styles.cancelButton}`}
                  disabled={loading}
                >
                  {cancelText || t('ui.alert.cancel')}
                </Button>
                <Button
                  onClick={onConfirm}
                  className={`flex-1 ${styles.confirmButton}`}
                  disabled={loading}
                >
                  {loading ? t('ui.alert.processing') : (confirmText || t('ui.alert.confirm'))}
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Alert; 