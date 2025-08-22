import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, BookOpen, X, Send, CheckCircle } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../stores/authStore';
import { authAPI } from '../../services/api';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, setLoading } = useAuthStore();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [forgotPasswordSent, setForgotPasswordSent] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // 清除对应字段的错误
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.email) {
      newErrors.email = '请输入邮箱地址';
    }
    
    if (!formData.password) {
      newErrors.password = '请输入密码';
    } else if (formData.password.length < 6) {
      newErrors.password = '密码至少6位';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    setLoading(true);
    
    try {
      const response = await authAPI.login(formData);
      const { token, user, success } = response.data || {};
      
      if (success && token && user) {
        login(user, token);
        navigate('/dashboard');
      } else {
        setErrors({ general: '登录响应数据格式错误' });
      }
    } catch (error: any) {
      const message = error.response?.data?.error || error.response?.data?.message || '登录失败，请重试';
      setErrors({ general: message });
    } finally {
      setIsSubmitting(false);
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!forgotPasswordEmail) {
      setErrors({ forgotPassword: '请输入邮箱地址' });
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(forgotPasswordEmail)) {
      setErrors({ forgotPassword: '请输入有效的邮箱地址' });
      return;
    }

    try {
      setIsSubmitting(true);
      setErrors({});
      
      const response = await authAPI.forgotPassword({ email: forgotPasswordEmail });
      
      if (response.data.success) {
        setForgotPasswordSent(true);
      } else {
        setErrors({ forgotPassword: response.data.message || '发送失败' });
      }
    } catch (error: any) {
      // 错误日志已清理
      setErrors({ 
        forgotPassword: error.response?.data?.message || '发送失败，请稍后重试'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-green-900/20 dark:via-bg-primary dark:to-blue-900/20 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
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
            className="mx-auto w-16 h-16 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center mb-6"
          >
            <BookOpen className="w-8 h-8 text-white" />
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-3xl font-bold text-text-primary mb-2"
          >
            Mareate 题库系统
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-text-secondary"
          >
            企业数学题库管理平台
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
          <form onSubmit={handleSubmit} className="space-y-6">
            {errors.general && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4"
              >
                <p className="text-sm text-red-600 dark:text-red-300">{errors.general}</p>
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
            >
              <Input
                label="企业邮箱"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
                placeholder="yourname@company"
                required
                icon={<Mail className="w-5 h-5" />}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7, duration: 0.6 }}
            >
              <Input
                label="密码"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                error={errors.password}
                placeholder="请输入密码"
                required
                icon={<Lock className="w-5 h-5" />}
              />
              
              {/* 忘记密码链接 */}
              <div className="mt-2 text-right">
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                >
                  忘记密码？
                </button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
            >
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700"
                loading={isSubmitting}
                disabled={isSubmitting}
              >
                {isSubmitting ? '登录中...' : '登录系统'}
                {!isSubmitting && <ArrowRight className="w-4 h-4 ml-2" />}
              </Button>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9, duration: 0.6 }}
              className="text-center"
            >
              <p className="text-sm text-text-secondary">
                还没有账号？{' '}
                <Link
                  to="/register"
                  className="font-medium text-green-600 hover:text-green-500 dark:text-green-400 dark:hover:text-green-300 transition-colors"
                >
                  立即注册
                </Link>
              </p>
            </motion.div>
          </form>
        </Card>
      </motion.div>

      {/* 忘记密码模态框 */}
      <AnimatePresence>
        {showForgotPassword && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            {/* 背景遮罩 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => {
                setShowForgotPassword(false);
                setForgotPasswordSent(false);
                setForgotPasswordEmail('');
                setErrors({});
              }}
            />
            
            {/* 模态框内容 */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              {!forgotPasswordSent ? (
                // 发送重置邮件表单
                <>
                  {/* 头部 */}
                  <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                        <Lock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                          重置密码
                        </h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          输入邮箱地址，我们将发送重置链接
                        </p>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => {
                        setShowForgotPassword(false);
                        setForgotPasswordSent(false);
                        setForgotPasswordEmail('');
                        setErrors({});
                      }}
                      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    </button>
                  </div>

                  {/* 内容区域 */}
                  <div className="p-6">
                    <div className="space-y-4">
                      <Input
                        label="企业邮箱"
                        type="email"
                        value={forgotPasswordEmail}
                        onChange={(e) => {
                          setForgotPasswordEmail(e.target.value);
                          if (errors.forgotPassword) {
                            setErrors(prev => ({ ...prev, forgotPassword: '' }));
                          }
                        }}
                        error={errors.forgotPassword}
                        placeholder="yourname@company.com"
                        icon={<Mail className="w-5 h-5" />}
                      />
                      
                      <Button
                        onClick={handleForgotPassword}
                        loading={isSubmitting}
                        disabled={isSubmitting}
                        className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
                      >
                        {isSubmitting ? '发送中...' : '发送重置链接'}
                        {!isSubmitting && <Send className="w-4 h-4 ml-2" />}
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                // 发送成功状态
                <>
                  {/* 头部 */}
                  <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-lg">
                        <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                          邮件已发送
                        </h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          请检查您的邮箱
                        </p>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => {
                        setShowForgotPassword(false);
                        setForgotPasswordSent(false);
                        setForgotPasswordEmail('');
                        setErrors({});
                      }}
                      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    </button>
                  </div>

                  {/* 内容区域 */}
                  <div className="p-6">
                    <div className="text-center space-y-4">
                      <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                        <p className="text-sm text-green-800 dark:text-green-200">
                          重置密码链接已发送到：
                        </p>
                        <p className="text-sm font-medium text-green-900 dark:text-green-100 mt-1">
                          {forgotPasswordEmail}
                        </p>
                      </div>
                      
                      <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                        <p>• 请查看邮箱中的重置密码邮件</p>
                        <p>• 链接有效期为24小时</p>
                        <p>• 如果未收到邮件，请检查垃圾邮件文件夹</p>
                      </div>
                      
                      <Button
                        onClick={() => {
                          setShowForgotPassword(false);
                          setForgotPasswordSent(false);
                          setForgotPasswordEmail('');
                          setErrors({});
                        }}
                        className="w-full"
                        variant="outline"
                      >
                        知道了
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LoginPage; 