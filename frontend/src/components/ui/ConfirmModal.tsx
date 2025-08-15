import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, CheckCircle, XCircle, Info, HelpCircle } from 'lucide-react';
import Button from './Button';

export interface ConfirmModalProps {
  /** 是否显示弹窗 */
  isOpen: boolean;
  /** 弹窗标题 */
  title: string;
  /** 弹窗内容 */
  message: string;
  /** 弹窗类型 */
  type?: 'confirm' | 'warning' | 'danger' | 'info' | 'success';
  /** 确认按钮文字 */
  confirmText?: string;
  /** 取消按钮文字 */
  cancelText?: string;
  /** 确认回调 */
  onConfirm?: () => void;
  /** 取消回调 */
  onCancel: () => void;
  /** 是否显示取消按钮 */
  showCancel?: boolean;
  /** 是否显示确认按钮 */
  showConfirm?: boolean;
  /** 确认按钮是否危险操作（红色） */
  confirmDanger?: boolean;
  /** 自定义图标 */
  icon?: React.ReactNode;
  /** 弹窗宽度 */
  width?: 'sm' | 'md' | 'lg' | 'xl';
  /** 是否阻止点击背景关闭 */
  preventClose?: boolean;
  /** 确认按钮是否加载中 */
  confirmLoading?: boolean;
  /** 加载中时的文字 */
  loadingText?: string;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  type = 'confirm',
  confirmText = '确认',
  cancelText = '取消',
  onConfirm,
  onCancel,
  showCancel = true,
  showConfirm = true,
  confirmDanger = false,
  icon,
  width = 'md',
  preventClose = false,
  confirmLoading = false,
  loadingText = '处理中...'
}) => {
  // 根据类型获取默认配置
  const getTypeConfig = () => {
    switch (type) {
      case 'warning':
        return {
          icon: icon || <AlertTriangle className="w-8 h-8 text-yellow-500" />,
          bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
          borderColor: 'border-yellow-200 dark:border-yellow-700',
          textColor: 'text-yellow-800 dark:text-yellow-200',
          buttonColor: 'bg-yellow-600 hover:bg-yellow-700 dark:bg-yellow-500 dark:hover:bg-yellow-600'
        };
      case 'danger':
        return {
          icon: icon || <XCircle className="w-8 h-8 text-red-500" />,
          bgColor: 'bg-red-50 dark:bg-red-900/20',
          borderColor: 'border-red-200 dark:border-red-700',
          textColor: 'text-red-800 dark:text-red-200',
          buttonColor: 'bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600'
        };
      case 'info':
        return {
          icon: icon || <Info className="w-8 h-8 text-blue-500" />,
          bgColor: 'bg-blue-50 dark:bg-blue-900/20',
          borderColor: 'border-blue-200 dark:border-blue-700',
          textColor: 'text-blue-800 dark:text-blue-200',
          buttonColor: 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600'
        };
      case 'success':
        return {
          icon: icon || <CheckCircle className="w-8 h-8 text-green-500" />,
          bgColor: 'bg-green-50 dark:bg-green-900/20',
          borderColor: 'border-green-200 dark:border-green-700',
          textColor: 'text-green-800 dark:text-green-200',
          buttonColor: 'bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600'
        };
      default:
        return {
          icon: icon || <HelpCircle className="w-8 h-8 text-gray-500" />,
          bgColor: 'bg-gray-50 dark:bg-gray-800/50',
          borderColor: 'border-gray-200 dark:border-gray-700',
          textColor: 'text-gray-800 dark:text-gray-200',
          buttonColor: 'bg-gray-600 hover:bg-gray-700 dark:bg-gray-500 dark:hover:bg-gray-600'
        };
    }
  };

  const config = getTypeConfig();

  // 获取弹窗宽度类
  const getWidthClass = () => {
    switch (width) {
      case 'sm': return 'max-w-sm';
      case 'md': return 'max-w-md';
      case 'lg': return 'max-w-lg';
      case 'xl': return 'max-w-xl';
      default: return 'max-w-md';
    }
  };

  const handleBackgroundClick = () => {
    if (!preventClose) {
      onCancel();
    }
  };

  const handleConfirm = () => {
    onConfirm && onConfirm();
  };

  const handleCancel = () => {
    onCancel();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
          onClick={handleBackgroundClick}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className={`${getWidthClass()} w-full bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border ${config.borderColor} overflow-hidden`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* 头部 */}
            <div className={`${config.bgColor} p-6 border-b ${config.borderColor}`}>
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0">
                  {config.icon}
                </div>
                <div className="flex-1">
                  <h3 className={`text-lg font-semibold ${config.textColor}`}>
                    {title}
                  </h3>
                  <p className={`text-sm mt-1 ${config.textColor} opacity-80`}>
                    {message}
                  </p>
                </div>
              </div>
            </div>

            {/* 按钮区域 */}
            <div className="p-6 bg-gray-50 dark:bg-gray-700/50">
              <div className="flex items-center justify-end gap-3">
                {showCancel && (
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                    className="px-6 py-2"
                  >
                    {cancelText}
                  </Button>
                )}
                {showConfirm && (
                  <Button
                    onClick={handleConfirm}
                    loading={confirmLoading}
                    disabled={confirmLoading}
                    className={`px-6 py-2 ${confirmDanger ? 'bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600' : config.buttonColor}`}
                  >
                    {confirmLoading ? loadingText : confirmText}
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmModal;
