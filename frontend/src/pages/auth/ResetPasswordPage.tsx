import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, ArrowRight, BookOpen, CheckCircle, AlertCircle } from 'lucide-react';
import { authAPI } from '../../services/api';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';
import PasswordStrengthIndicator from '../../components/ui/PasswordStrengthIndicator';
import { PasswordValidator } from '../../utils/passwordValidator';
import { useTranslation } from '../../hooks/useTranslation';

const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const { t } = useTranslation();
  
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);

  // 页面加载时验证token
  useEffect(() => {
    if (!token) {
      setTokenValid(false);
      return;
    }
    
    // 这里可以添加token验证的API调用
    // 暂时假设token存在就是有效的
    setTokenValid(true);
  }, [token]);

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
    
    if (!formData.password) {
      newErrors.password = t('auth.resetPassword.errors.passwordRequired');
    } else {
      // 使用密码验证器
      const passwordValidation = PasswordValidator.validate(formData.password);
      
      if (!passwordValidation.isValid) {
        newErrors.password = passwordValidation.errors[0] || t('auth.resetPassword.errors.passwordWeak');
      }
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = t('auth.resetPassword.errors.confirmPasswordRequired');
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t('auth.resetPassword.errors.passwordsNotMatch');
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const response = await authAPI.resetPassword({
        token: token!,
        password: formData.password
      });
      
      if (response.data.success) {
        setResetSuccess(true);
      } else {
        setErrors({ general: response.data.message || t('auth.resetPassword.errors.resetFailed') });
      }
    } catch (error: any) {
      // 错误日志已清理
      setErrors({ 
        general: error.response?.data?.message || t('auth.resetPassword.errors.resetFailed')
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // 如果没有token或token无效
  if (tokenValid === false) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 dark:from-red-900/20 dark:via-bg-primary dark:to-orange-900/20 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="sm:mx-auto sm:w-full sm:max-w-md text-center"
        >
          <div className="flex justify-center">
            <div className="p-3 bg-red-100 dark:bg-red-900/50 rounded-xl">
              <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
          </div>
          <h2 className="mt-4 text-3xl font-bold text-gray-900 dark:text-gray-100">
            {t('auth.resetPassword.tokenValidation.invalid')}
          </h2>
          <p className="mt-2 text-text-secondary">
            {t('auth.resetPassword.tokenValidation.invalid')}
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="mt-8 sm:mx-auto sm:w-full sm:max-w-md"
        >
          <Card>
            <div className="text-center space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('auth.resetPassword.tokenValidation.expired')}
              </p>
              
              <div className="space-y-3">
                <Link to="/login">
                  <Button className="w-full">
                    {t('auth.resetPassword.loginButton')}
                  </Button>
                </Link>
                
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {t('auth.resetPassword.tokenValidation.expired')}
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    );
  }

  // 如果重置成功
  if (resetSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-green-900/20 dark:via-bg-primary dark:to-emerald-900/20 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="sm:mx-auto sm:w-full sm:max-w-md text-center"
        >
          <div className="flex justify-center">
            <div className="p-3 bg-green-100 dark:bg-green-900/50 rounded-xl">
              <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <h2 className="mt-4 text-3xl font-bold text-gray-900 dark:text-gray-100">
            {t('auth.resetPassword.successTitle')}
          </h2>
          <p className="mt-2 text-text-secondary">
            {t('auth.resetPassword.successMessage')}
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="mt-8 sm:mx-auto sm:w-full sm:max-w-md"
        >
          <Card>
            <div className="text-center space-y-4">
              <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <p className="text-sm text-green-800 dark:text-green-200">
                  🎉 {t('auth.resetPassword.successMessage')}
                </p>
              </div>
              
              <Link to="/login">
                <Button className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700">
                  {t('auth.resetPassword.loginButton')}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </Card>
        </motion.div>
      </div>
    );
  }

  // 正常的重置密码表单
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-blue-900/20 dark:via-bg-primary dark:to-indigo-900/20 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="sm:mx-auto sm:w-full sm:max-w-md text-center"
      >
        <div className="flex justify-center">
          <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-xl">
            <BookOpen className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
        <motion.h2 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="mt-4 text-3xl font-bold text-gray-900 dark:text-gray-100"
        >
          {t('auth.resetPassword.title')}
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="mt-2 text-text-secondary"
        >
          {t('auth.resetPassword.subtitle')}
        </motion.p>
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
                label={t('auth.resetPassword.newPassword')}
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                error={errors.password}
                placeholder={t('auth.resetPassword.newPassword')}
                required
                icon={<Lock className="w-5 h-5" />}
              />
              
              {/* 密码强度指示器 */}
              {formData.password && (
                <div className="mt-3">
                  <PasswordStrengthIndicator
                    password={formData.password}
                    compact={true}
                  />
                </div>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7, duration: 0.6 }}
            >
              <Input
                label={t('auth.resetPassword.confirmPassword')}
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                error={errors.confirmPassword}
                placeholder={t('auth.resetPassword.confirmPassword')}
                required
                icon={<Lock className="w-5 h-5" />}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
            >
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
                loading={isSubmitting}
                disabled={isSubmitting}
              >
                {isSubmitting ? t('auth.common.loading') : t('auth.resetPassword.resetButton')}
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
                {t('auth.resetPassword.loginButton')}{' '}
                <Link
                  to="/login"
                  className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                >
                  {t('auth.resetPassword.loginButton')}
                </Link>
              </p>
            </motion.div>
          </form>
        </Card>
      </motion.div>
    </div>
  );
};

export default ResetPasswordPage;
