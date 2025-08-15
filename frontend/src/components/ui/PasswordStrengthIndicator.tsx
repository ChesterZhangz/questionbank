import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Shield } from 'lucide-react';
import { PasswordValidator } from '../../utils/passwordValidator';

interface PasswordStrengthIndicatorProps {
  password: string;
  username?: string;
  email?: string;
  showDetails?: boolean;
  className?: string;
}

const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({
  password,
  username,
  email,
  showDetails = true,
  className = ''
}) => {
  const validation = PasswordValidator.validate(password, username, email);

  const getStrengthColor = (strength: 'weak' | 'medium' | 'strong') => {
    switch (strength) {
      case 'weak':
        return 'bg-red-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'strong':
        return 'bg-green-500';
      default:
        return 'bg-gray-300';
    }
  };

  const getStrengthWidth = (score: number) => {
    return Math.min(100, Math.max(0, score));
  };

  const getStrengthTextColor = (strength: 'weak' | 'medium' | 'strong') => {
    switch (strength) {
      case 'weak':
        return 'text-red-600 dark:text-red-400';
      case 'medium':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'strong':
        return 'text-green-600 dark:text-green-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  if (!password) {
    return null;
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* 密码强度条 */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            密码强度
          </span>
          <span className={`text-sm font-medium ${getStrengthTextColor(validation.strength)}`}>
            {PasswordValidator.getStrengthText(validation.strength)} ({validation.score}/100)
          </span>
        </div>
        
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${getStrengthWidth(validation.score)}%` }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className={`h-full rounded-full transition-colors duration-300 ${getStrengthColor(validation.strength)}`}
          />
        </div>
      </div>

      {/* 详细验证结果 */}
      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-2"
          >
            {/* 验证规则检查 */}
            <div className="grid grid-cols-1 gap-2">
              <ValidationRule
                passed={password.length >= 8 && password.length <= 20}
                text="密码长度8-20位"
              />
              <ValidationRule
                passed={!username || !PasswordValidator.isRelatedToUsername(password, username)}
                text="不包含用户名相关内容"
              />
              <ValidationRule
                passed={!email || !PasswordValidator.isRelatedToEmail(password, email)}
                text="不包含邮箱相关内容"
              />
              <ValidationRule
                passed={!PasswordValidator.containsBirthDatePattern(password)}
                text="不包含生日日期格式"
              />
              <ValidationRule
                passed={!PasswordValidator.hasConsecutiveRepeats(password)}
                text="无连续三位相同字符"
              />
              <ValidationRule
                passed={/[a-z]/.test(password)}
                text="包含小写字母"
              />
              <ValidationRule
                passed={/[A-Z]/.test(password)}
                text="包含大写字母"
              />
              <ValidationRule
                passed={/\d/.test(password)}
                text="包含数字"
              />
              <ValidationRule
                passed={/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)}
                text="包含特殊字符"
              />
            </div>

            {/* 错误提示 */}
            {validation.errors.length > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3"
              >
                <div className="flex items-start gap-2">
                  <XCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                  <div className="space-y-1">
                    {validation.errors.map((error, index) => (
                      <p key={index} className="text-sm text-red-600 dark:text-red-400">
                        {error}
                      </p>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* 安全提示 */}
            {validation.isValid && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3"
              >
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-green-500" />
                  <p className="text-sm text-green-600 dark:text-green-400">
                    密码符合安全要求！
                  </p>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

interface ValidationRuleProps {
  passed: boolean;
  text: string;
}

const ValidationRule: React.FC<ValidationRuleProps> = ({ passed, text }) => {
  return (
    <div className="flex items-center gap-2">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
      >
        {passed ? (
          <CheckCircle className="w-4 h-4 text-green-500" />
        ) : (
          <XCircle className="w-4 h-4 text-red-500" />
        )}
      </motion.div>
      <span className={`text-sm ${passed ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
        {text}
      </span>
    </div>
  );
};

export default PasswordStrengthIndicator;
