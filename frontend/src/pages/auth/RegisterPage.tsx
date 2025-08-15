import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserPlus, Mail, Lock, User, ArrowRight, Building2 } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { authAPI } from '../../services/api';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';
import PasswordStrengthIndicator from '../../components/ui/PasswordStrengthIndicator';
import { PasswordValidator } from '../../utils/passwordValidator';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { setLoading } = useAuthStore();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [allowedEnterprises, setAllowedEnterprises] = useState<Array<{
    name: string;
    emailSuffix: string;
    currentMembers: number;
    maxMembers: number;
    availableSlots: number;
  }>>([]);
  const [loadingEnterprises, setLoadingEnterprises] = useState(true);

  // 获取允许注册的企业
  useEffect(() => {
    const fetchAllowedEnterprises = async () => {
      try {
        setLoadingEnterprises(true);
        const response = await authAPI.getAllowedEnterprises();
        if (response.data.success) {
          setAllowedEnterprises(response.data.enterprises || []);
        }
      } catch (error) {
        console.error('获取允许注册的企业失败:', error);
      } finally {
        setLoadingEnterprises(false);
      }
    };

    fetchAllowedEnterprises();

    // 添加定时刷新，每30秒更新一次企业名额信息
    const interval = setInterval(fetchAllowedEnterprises, 30000);

    return () => clearInterval(interval);
  }, []);

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
    
    if (!formData.name.trim()) {
      newErrors.name = '请输入姓名';
    }
    
    if (!formData.email) {
      newErrors.email = '请输入邮箱地址';
    } else {
      // 检查邮箱后缀是否在允许的企业列表中
      const emailSuffix = '@' + formData.email.split('@')[1];
      const isAllowedSuffix = allowedEnterprises.some(enterprise => 
        enterprise.emailSuffix === emailSuffix
      );
      
      if (!isAllowedSuffix) {
        newErrors.email = '该企业邮箱后缀暂不支持注册，请联系管理员';
      }
    }
    
    if (!formData.password) {
      newErrors.password = '请输入密码';
    } else {
      // 使用新的密码验证器
      const passwordValidation = PasswordValidator.validate(
        formData.password,
        formData.name,
        formData.email
      );
      
      if (!passwordValidation.isValid) {
        newErrors.password = passwordValidation.errors[0] || '密码不符合安全要求';
      }
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = '请确认密码';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = '两次密码不一致';
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
      const response = await authAPI.register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });
      
      const { success } = response.data || {};
      
      if (success) {
        // 注册成功，跳转到成功页面
        navigate('/register-success');
      } else {
        setErrors({ general: '注册失败，请重试' });
      }
    } catch (error: any) {
      const message = error.response?.data?.error || error.response?.data?.message || '注册失败，请重试';
      setErrors({ general: message });
    } finally {
      setIsSubmitting(false);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-blue-900/20 dark:via-bg-primary dark:to-purple-900/20 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
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
            className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-6"
          >
            <UserPlus className="w-8 h-8 text-white" />
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-3xl font-bold text-text-primary mb-2"
          >
            注册账号
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-text-secondary"
          >
            创建您的企业题库账号
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
                className={`border rounded-lg p-4 ${
                  errors.general.includes('成功') 
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
                    : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                }`}
              >
                <p className={`text-sm ${
                  errors.general.includes('成功') 
                    ? 'text-green-600 dark:text-green-300' 
                    : 'text-red-600 dark:text-red-300'
                }`}>{errors.general}</p>
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
            >
              <Input
                label="姓名"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                error={errors.name}
                placeholder="请输入您的姓名"
                required
                icon={<User className="w-5 h-5" />}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7, duration: 0.6 }}
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
              
              {/* 显示支持的企业 */}
              {!loadingEnterprises && allowedEnterprises.length > 0 && (
                <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                        支持的企业邮箱后缀
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setLoadingEnterprises(true);
                        const fetchAllowedEnterprises = async () => {
                          try {
                            const response = await authAPI.getAllowedEnterprises();
                            if (response.data.success) {
                              setAllowedEnterprises(response.data.enterprises || []);
                            }
                          } catch (error) {
                            console.error('获取允许注册的企业失败:', error);
                          } finally {
                            setLoadingEnterprises(false);
                          }
                        };
                        fetchAllowedEnterprises();
                      }}
                      className="text-xs text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                      disabled={loadingEnterprises}
                    >
                      {loadingEnterprises ? '刷新中...' : '刷新'}
                    </button>
                  </div>
                  <div className="space-y-2">
                    {allowedEnterprises.map((enterprise, index) => (
                      <div key={index} className="flex items-center justify-between text-xs">
                        <span className="text-blue-700 dark:text-blue-300">
                          {enterprise.name} ({enterprise.emailSuffix})
                        </span>
                        <span className="text-blue-600 dark:text-blue-400">
                          {enterprise.availableSlots > 0 
                            ? `${enterprise.availableSlots}个名额可用`
                            : '名额已满'
                          }
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
            >
              <Input
                label="密码"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                error={errors.password}
                placeholder="请输入安全密码（8-20位）"
                required
                icon={<Lock className="w-5 h-5" />}
              />
              
              {/* 密码强度指示器 */}
              {formData.password && (
                <div className="mt-3">
                  <PasswordStrengthIndicator
                    password={formData.password}
                    username={formData.name}
                    email={formData.email}
                    compact={true}
                  />
                </div>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.9, duration: 0.6 }}
            >
              <Input
                label="确认密码"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                error={errors.confirmPassword}
                placeholder="请再次输入密码"
                required
                icon={<Lock className="w-5 h-5" />}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0, duration: 0.6 }}
            >
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                loading={isSubmitting}
                disabled={isSubmitting}
              >
                {isSubmitting ? '注册中...' : '注册账号'}
                {!isSubmitting && <ArrowRight className="w-4 h-4 ml-2" />}
              </Button>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.1, duration: 0.6 }}
              className="text-center"
            >
              <p className="text-sm text-text-secondary">
                已有账号？{' '}
                <Link
                  to="/login"
                  className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                >
                  立即登录
                </Link>
              </p>
            </motion.div>
          </form>
        </Card>
      </motion.div>
    </div>
  );
};

export default RegisterPage; 