import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, CheckCircle, XCircle, Info, HelpCircle, Trash2, Shield, UserCheck, Settings, Bell, FileText, Database, Users, Building2 } from 'lucide-react';
import Button from './Button';

export interface ConfirmModalProps {
  /** 是否显示弹窗 */
  isOpen: boolean;
  /** 弹窗标题 */
  title: string;
  /** 弹窗内容 */
  message: string;
  /** 弹窗类型 */
  type?: 'confirm' | 'warning' | 'danger' | 'info' | 'success' | 'delete' | 'permission' | 'invite' | 'update' | 'notification' | 'document' | 'data' | 'member' | 'enterprise';
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
  width?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  /** 是否阻止点击背景关闭 */
  preventClose?: boolean;
  /** 确认按钮是否加载中 */
  confirmLoading?: boolean;
  /** 加载中时的文字 */
  loadingText?: string;
  /** 弹窗位置 */
  position?: 'center' | 'top' | 'bottom';
  /** 是否显示进度条 */
  showProgress?: boolean;
  /** 进度条进度 (0-100) */
  progress?: number;

  /** 弹窗主题 */
  theme?: 'default' | 'glass' | 'gradient' | 'minimal';
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
  loadingText = '处理中...',
  position = 'center',
  showProgress = false,
  progress = 0,

  theme = 'default'
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
          buttonColor: 'bg-yellow-600 hover:bg-yellow-700 dark:bg-yellow-500 dark:hover:bg-yellow-600',
          accentColor: 'bg-yellow-100 dark:bg-yellow-800/30'
        };
      case 'danger':
        return {
          icon: icon || <XCircle className="w-8 h-8 text-red-500" />,
          bgColor: 'bg-red-50 dark:bg-red-900/20',
          borderColor: 'border-red-200 dark:border-red-700',
          textColor: 'text-red-800 dark:text-red-200',
          buttonColor: 'bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600',
          accentColor: 'bg-red-100 dark:bg-red-800/30'
        };
      case 'delete':
        return {
          icon: icon || <Trash2 className="w-8 h-8 text-red-500" />,
          bgColor: 'bg-red-50 dark:bg-red-900/20',
          borderColor: 'border-red-200 dark:border-red-700',
          textColor: 'text-red-800 dark:text-red-200',
          buttonColor: 'bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600',
          accentColor: 'bg-red-100 dark:bg-red-800/30'
        };
      case 'info':
        return {
          icon: icon || <Info className="w-8 h-8 text-blue-500" />,
          bgColor: 'bg-blue-50 dark:bg-blue-900/20',
          borderColor: 'border-blue-200 dark:border-blue-700',
          textColor: 'text-blue-800 dark:text-blue-200',
          buttonColor: 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600',
          accentColor: 'bg-blue-100 dark:bg-blue-800/30'
        };
      case 'success':
        return {
          icon: icon || <CheckCircle className="w-8 h-8 text-green-500" />,
          bgColor: 'bg-green-50 dark:bg-green-900/20',
          borderColor: 'border-green-200 dark:border-green-700',
          textColor: 'text-green-800 dark:text-green-200',
          buttonColor: 'bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600',
          accentColor: 'bg-green-100 dark:bg-green-800/30'
        };
      case 'permission':
        return {
          icon: icon || <Shield className="w-8 h-8 text-purple-500" />,
          bgColor: 'bg-purple-50 dark:bg-purple-900/20',
          borderColor: 'border-purple-200 dark:border-purple-700',
          textColor: 'text-purple-800 dark:text-purple-200',
          buttonColor: 'bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600',
          accentColor: 'bg-purple-100 dark:bg-purple-800/30'
        };
      case 'invite':
        return {
          icon: icon || <UserCheck className="w-8 h-8 text-emerald-500" />,
          bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
          borderColor: 'border-emerald-200 dark:border-emerald-700',
          textColor: 'text-emerald-800 dark:text-emerald-200',
          buttonColor: 'bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600',
          accentColor: 'bg-emerald-100 dark:bg-emerald-800/30'
        };
      case 'update':
        return {
          icon: icon || <Settings className="w-8 h-8 text-indigo-500" />,
          bgColor: 'bg-indigo-50 dark:bg-indigo-900/20',
          borderColor: 'border-indigo-200 dark:border-indigo-700',
          textColor: 'text-indigo-800 dark:text-indigo-200',
          buttonColor: 'bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600',
          accentColor: 'bg-indigo-100 dark:bg-indigo-800/30'
        };
      case 'notification':
        return {
          icon: icon || <Bell className="w-8 h-8 text-orange-500" />,
          bgColor: 'bg-orange-50 dark:bg-orange-900/20',
          borderColor: 'border-orange-200 dark:border-orange-700',
          textColor: 'text-orange-800 dark:text-orange-200',
          buttonColor: 'bg-orange-600 hover:bg-orange-700 dark:bg-orange-500 dark:hover:bg-orange-600',
          accentColor: 'bg-orange-100 dark:bg-orange-800/30'
        };
      case 'document':
        return {
          icon: icon || <FileText className="w-8 h-8 text-teal-500" />,
          bgColor: 'bg-teal-50 dark:bg-teal-900/20',
          borderColor: 'border-teal-200 dark:border-teal-700',
          textColor: 'text-teal-800 dark:text-teal-200',
          buttonColor: 'bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600',
          accentColor: 'bg-teal-100 dark:bg-teal-800/30'
        };
      case 'data':
        return {
          icon: icon || <Database className="w-8 h-8 text-cyan-500" />,
          bgColor: 'bg-cyan-50 dark:bg-cyan-900/20',
          borderColor: 'border-cyan-200 dark:border-cyan-700',
          textColor: 'text-cyan-800 dark:text-cyan-200',
          buttonColor: 'bg-cyan-600 hover:bg-cyan-700 dark:bg-cyan-500 dark:hover:bg-cyan-600',
          accentColor: 'bg-cyan-100 dark:bg-cyan-800/30'
        };
      case 'member':
        return {
          icon: icon || <Users className="w-8 h-8 text-pink-500" />,
          bgColor: 'bg-pink-50 dark:bg-pink-900/20',
          borderColor: 'border-pink-200 dark:border-pink-700',
          textColor: 'text-pink-800 dark:text-pink-200',
          buttonColor: 'bg-pink-600 hover:bg-pink-700 dark:bg-pink-500 dark:hover:bg-pink-600',
          accentColor: 'bg-pink-100 dark:bg-pink-800/30'
        };
      case 'enterprise':
        return {
          icon: icon || <Building2 className="w-8 h-8 text-violet-500" />,
          bgColor: 'bg-violet-50 dark:bg-violet-900/20',
          borderColor: 'border-violet-200 dark:border-violet-700',
          textColor: 'text-violet-800 dark:text-violet-200',
          buttonColor: 'bg-violet-600 hover:bg-violet-700 dark:bg-violet-500 dark:hover:bg-violet-600',
          accentColor: 'bg-violet-100 dark:bg-violet-800/30'
        };
      default:
        return {
          icon: icon || <HelpCircle className="w-8 h-8 text-gray-500" />,
          bgColor: 'bg-gray-50 dark:bg-gray-800/50',
          borderColor: 'border-gray-200 dark:border-gray-700',
          textColor: 'text-gray-800 dark:text-gray-200',
          buttonColor: 'bg-gray-600 hover:bg-gray-700 dark:bg-gray-500 dark:hover:bg-gray-600',
          accentColor: 'bg-gray-100 dark:bg-gray-700/30'
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
      case '2xl': return 'max-w-2xl';
      default: return 'max-w-md';
    }
  };



  // 获取主题样式
  const getThemeStyles = () => {
    switch (theme) {
      case 'glass':
        return 'bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-white/20 dark:border-gray-700/20 shadow-2xl';
      case 'gradient':
        return 'bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border-gray-200 dark:border-gray-600 shadow-xl';
      case 'minimal':
        return 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 shadow-lg';
      default:
        return 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 shadow-2xl';
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
          transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex justify-center p-4"
          style={{ alignItems: position === 'top' ? 'flex-start' : position === 'bottom' ? 'flex-end' : 'center' }}
          onClick={handleBackgroundClick}
        >
          <motion.div
            initial={{ 
              scale: 0.8, 
              opacity: 0, 
              y: position === 'top' ? -50 : position === 'bottom' ? 50 : 20,
              rotateX: position === 'top' ? 15 : position === 'bottom' ? -15 : 0
            }}
            animate={{ 
              scale: 1, 
              opacity: 1, 
              y: 0,
              rotateX: 0
            }}
            exit={{ 
              scale: 0.8, 
              opacity: 0, 
              y: position === 'top' ? -50 : position === 'bottom' ? 50 : 20,
              rotateX: position === 'top' ? 15 : position === 'bottom' ? -15 : 0
            }}
            transition={{ 
              type: "spring", 
              stiffness: 300, 
              damping: 25,
              duration: 0.3
            }}
            className={`${getWidthClass()} w-full ${getThemeStyles()} rounded-2xl border ${config.borderColor} overflow-hidden`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* 头部 */}
            <motion.div 
              className={`${config.bgColor} p-6 border-b ${config.borderColor} relative overflow-hidden`}
              initial={{ backgroundPosition: '0% 0%' }}
              animate={{ backgroundPosition: '100% 100%' }}
              transition={{ duration: 3, repeat: Infinity, repeatType: 'reverse' }}
            >
              {/* 背景装饰 */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-current to-transparent rounded-full -translate-y-16 translate-x-16"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-current to-transparent rounded-full translate-y-12 -translate-x-12"></div>
              </div>
              
              <div className="flex items-center gap-4 relative z-10">
                <motion.div 
                  className="flex-shrink-0"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                >
                  {config.icon}
                </motion.div>
                <motion.div 
                  className="flex-1"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                >
                  <h3 className={`text-lg font-semibold ${config.textColor}`}>
                    {title}
                  </h3>
                  <p className={`text-sm mt-1 ${config.textColor} opacity-80`}>
                    {message}
                  </p>
                </motion.div>
              </div>

              {/* 进度条 */}
              {showProgress && (
                <motion.div 
                  className="mt-4 h-1 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                >
                  <motion.div
                    className={`h-full ${config.accentColor} rounded-full`}
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ delay: 0.5, duration: 1 }}
                  />
                </motion.div>
              )}
            </motion.div>

            {/* 按钮区域 */}
            <motion.div 
              className="p-6 bg-gray-50 dark:bg-gray-700/50"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            >
              <div className="flex items-center justify-end gap-3">
                {showCancel && (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
                  >
                    <Button
                      variant="outline"
                      onClick={handleCancel}
                      className="px-6 py-2"
                    >
                      {cancelText}
                    </Button>
                  </motion.div>
                )}
                {showConfirm && (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
                  >
                    <Button
                      onClick={handleConfirm}
                      loading={confirmLoading}
                      disabled={confirmLoading}
                      className={`px-6 py-2 ${confirmDanger ? 'bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600' : config.buttonColor}`}
                    >
                      {confirmLoading ? loadingText : confirmText}
                    </Button>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmModal;
