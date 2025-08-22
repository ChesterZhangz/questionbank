import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, CheckCircle, XCircle, RefreshCw, ArrowRight } from 'lucide-react';
import { authAPI } from '../../services/api';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';

const EmailVerificationPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('正在验证邮箱...');
  const hasVerified = useRef(false);

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setStatus('error');
      setMessage('验证链接无效');
      return;
    }

    // 防止重复请求
    if (hasVerified.current) {
      return;
    }

    verifyEmail(token);
  }, [searchParams]);

  const verifyEmail = async (token: string) => {
    try {
  
      
      // 设置加载状态，防止重复请求
      setStatus('loading');
      setMessage('正在验证邮箱...');
      
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://www.mareate.com/api'}/auth/verify-email?token=${token}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || `HTTP ${response.status}: ${response.statusText}`);
      }
      
      if (result.success) {
        hasVerified.current = true;
        setStatus('success');
        setMessage('邮箱验证成功！');
      } else {
        hasVerified.current = true;
        setStatus('error');
        setMessage(result.message || '验证失败，请重试');
      }
    } catch (error) {
              // 错误日志已清理
      hasVerified.current = true;
      setStatus('error');
      setMessage('验证过程中出现错误，请重试');
    }
  };

  const handleGoToLogin = () => {
    navigate('/login');
  };

  const handleResendEmail = async () => {
    try {
      setStatus('loading');
      setMessage('正在重新发送验证邮件...');
      
      // 这里需要用户输入邮箱，暂时使用提示
      const email = prompt('请输入您的邮箱地址：');
      if (!email) return;
      
      const response = await authAPI.resendVerification(email);
      
      if (response.data.success) {
        setStatus('success');
        setMessage('验证邮件已重新发送，请查收邮箱');
      } else {
        setStatus('error');
        setMessage(response.data.error || '重新发送失败，请重试');
      }
    } catch (error: any) {
      setStatus('error');
      setMessage(error.response?.data?.error || '重新发送失败，请重试');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
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
            className="mx-auto w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center mb-6"
          >
            <Mail className="w-8 h-8 text-white" />
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2"
          >
            邮箱验证
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-gray-600 dark:text-gray-400"
          >
            验证您的企业邮箱地址
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
            {status === 'loading' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full mx-auto mb-4"
                />
                <p className="text-gray-600 dark:text-gray-400">{message}</p>
              </motion.div>
            )}

            {status === 'success' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4"
                >
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </motion.div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">验证成功！</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">{message}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                  您的邮箱已成功验证，现在可以登录使用系统了。
                </p>
                <Button 
                  onClick={handleGoToLogin} 
                  className="w-full bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700"
                >
                  前往登录
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </motion.div>
            )}

            {status === 'error' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4"
                >
                  <XCircle className="w-8 h-8 text-red-600" />
                </motion.div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">验证失败</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">{message}</p>
                <div className="space-y-3">
                  <Button 
                    onClick={handleResendEmail} 
                    variant="outline" 
                    className="w-full border-purple-200 dark:border-purple-700 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    重新发送验证邮件
                  </Button>
                  <Button 
                    onClick={handleGoToLogin} 
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
                  >
                    返回登录
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </motion.div>
            )}
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default EmailVerificationPage; 