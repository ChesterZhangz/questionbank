import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, CheckCircle, RefreshCw, ArrowRight, AlertCircle } from 'lucide-react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import RightSlideModal from '../../components/ui/RightSlideModal';
import { useModal } from '../../hooks/useModal';

const RegisterSuccessPage: React.FC = () => {
  const navigate = useNavigate();

  // 弹窗状态管理
  const { 
    showErrorRightSlide,
    rightSlideModal,
    closeRightSlide
  } = useModal();

  const handleGoToLogin = () => {
    navigate('/login');
  };

  const handleResendEmail = () => {
    // 这里可以添加重新发送验证邮件的功能
    showErrorRightSlide('功能开发中', '重新发送功能开发中...');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="sm:mx-auto sm:w-full sm:max-w-md"
      >
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mb-6"
          >
            <CheckCircle className="w-8 h-8 text-white" />
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2"
          >
            注册成功
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-gray-600 dark:text-gray-400"
          >
            请查收您的企业邮箱
          </motion.p>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        className="mt-8 sm:mx-auto sm:w-full sm:max-w-md"
      >
        <Card>
          <div className="text-center space-y-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="mx-auto w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-4"
            >
              <Mail className="w-10 h-10 text-blue-600" />
            </motion.div>
            
            <motion.h2 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.5 }}
              className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2"
            >
              验证邮件已发送
            </motion.h2>
            
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              className="text-gray-600 dark:text-gray-400 mb-6"
            >
              我们已向您的企业邮箱发送了验证邮件，请查收并点击邮件中的验证链接完成注册。
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.9, duration: 0.5 }}
              className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4 mb-6"
            >
              <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-3 flex items-center">
                <CheckCircle className="w-4 h-4 mr-2" />
                下一步操作：
              </h3>
              <ol className="text-sm text-blue-700 dark:text-blue-300 space-y-2 text-left">
                <li className="flex items-center">
                  <span className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-xs font-medium mr-3">1</span>
                  打开您的企业邮箱
                </li>
                <li className="flex items-center">
                  <span className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-xs font-medium mr-3">2</span>
                  查找来自 "Mareate题库系统" 的邮件
                </li>
                <li className="flex items-center">
                  <span className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-xs font-medium mr-3">3</span>
                  点击邮件中的 "验证邮箱地址" 按钮
                </li>
                <li className="flex items-center">
                  <span className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-xs font-medium mr-3">4</span>
                  验证成功后即可登录使用系统
                </li>
              </ol>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.0, duration: 0.5 }}
              className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4 mb-6"
            >
              <p className="text-sm text-yellow-800 dark:text-yellow-300 flex items-start">
                <AlertCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                <span>
                  <strong>注意：</strong>验证链接将在24小时后失效。如果未收到邮件，请检查垃圾邮件文件夹。
                </span>
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1, duration: 0.5 }}
              className="space-y-3"
            >
              <Button 
                onClick={handleResendEmail} 
                variant="outline" 
                className="w-full border-blue-200 dark:border-blue-700 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                重新发送验证邮件
              </Button>
              <Button 
                onClick={handleGoToLogin} 
                className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
              >
                前往登录
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </motion.div>
          </div>
        </Card>
      </motion.div>

      {/* 右侧弹窗 */}
      <RightSlideModal
        {...rightSlideModal}
        onClose={closeRightSlide}
      />
    </div>
  );
};

export default RegisterSuccessPage; 