import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Shield, HelpCircle } from 'lucide-react';
import { PasswordValidator } from '../../utils/passwordValidator';
import { useTranslation } from '../../hooks/useTranslation';

interface PasswordStrengthIndicatorProps {
  password: string;
  username?: string;
  email?: string;
  showDetails?: boolean;
  /** 紧凑模式：只显示强度条和悬浮提示 */
  compact?: boolean;
  className?: string;
}

const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({
  password,
  username,
  email,
  showDetails = true,
  compact = false,
  className = ''
}) => {
  const { t } = useTranslation();
  const [showTooltip, setShowTooltip] = useState(false);
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

  // 紧凑模式渲染
  if (compact) {
    return (
      <div className={`space-y-2 ${className}`}>
        {/* 密码强度条 */}
        <div className="flex items-center gap-3">
          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('ui.passwordStrength.strength')}
              </span>
              <span className={`text-sm font-medium ${getStrengthTextColor(validation.strength)}`}>
                {PasswordValidator.getStrengthText(validation.strength)}
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
          
          {/* 帮助图标和悬浮提示 */}
          <div className="relative">
            <button
              type="button"
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
              className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <HelpCircle className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            </button>
            
            {/* 悬浮提示 */}
            <AnimatePresence>
              {showTooltip && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 z-50"
                >
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
                    {t('ui.passwordStrength.requirements')}
                  </h4>
                  
                  <div className="space-y-2">
                    {/* 计算未满足的要求 */}
                    {(() => {
                      const failedRequirements = [];
                      
                      // 必需要求
                      if (password.length < 8 || password.length > 20) {
                        failedRequirements.push(
                          <ValidationRule key="length" passed={false} text={t('ui.passwordStrength.length')} />
                        );
                      }
                      
                      if (username && PasswordValidator.isRelatedToUsername(password, username)) {
                        failedRequirements.push(
                          <ValidationRule key="username" passed={false} text={t('ui.passwordStrength.noUsername')} />
                        );
                      }
                      
                      if (email && PasswordValidator.isRelatedToEmail(password, email)) {
                        failedRequirements.push(
                          <ValidationRule key="email" passed={false} text={t('ui.passwordStrength.noEmail')} />
                        );
                      }
                      
                      if (PasswordValidator.containsBirthDatePattern(password)) {
                        failedRequirements.push(
                          <ValidationRule key="birthdate" passed={false} text={t('ui.passwordStrength.noBirthdate')} />
                        );
                      }
                      
                      if (PasswordValidator.hasConsecutiveRepeats(password)) {
                        failedRequirements.push(
                          <ValidationRule key="repeats" passed={false} text={t('ui.passwordStrength.noRepeats')} />
                        );
                      }
                      
                      // 复杂度要求
                      const complexityFailed = [];
                      if (!/[a-z]/.test(password)) {
                        complexityFailed.push(
                          <ValidationRule key="lowercase" passed={false} text={t('ui.passwordStrength.noLowercase')} />
                        );
                      }
                      if (!/[A-Z]/.test(password)) {
                        complexityFailed.push(
                          <ValidationRule key="uppercase" passed={false} text={t('ui.passwordStrength.noUppercase')} />
                        );
                      }
                      if (!/\d/.test(password)) {
                        complexityFailed.push(
                          <ValidationRule key="digit" passed={false} text={t('ui.passwordStrength.noDigit')} />
                        );
                      }
                      if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
                        complexityFailed.push(
                          <ValidationRule key="special" passed={false} text={t('ui.passwordStrength.noSpecial')} />
                        );
                      }
                      
                      // 如果所有要求都满足，显示成功消息
                      if (failedRequirements.length === 0 && complexityFailed.length === 0) {
                        return (
                          <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                              {t('ui.passwordStrength.allRequirementsMet')}
                            </p>
                          </div>
                        );
                      }
                      
                      // 显示未满足的要求
                      return (
                        <>
                          {failedRequirements}
                          {complexityFailed.length > 0 && (
                            <div className="border-t border-gray-200 dark:border-gray-600 pt-2 mt-3">
                              <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">{t('ui.passwordStrength.suggestInclude')}</p>
                              {complexityFailed}
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </div>
                  
                  {/* 错误提示 */}
                  {validation.errors.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                      <div className="flex items-start gap-2">
                        <XCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                        <div className="space-y-1">
                          {validation.errors.slice(0, 2).map((error, index) => (
                            <p key={index} className="text-xs text-red-600 dark:text-red-400">
                              {error}
                            </p>
                          ))}
                          {validation.errors.length > 2 && (
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {t('ui.passwordStrength.moreIssues', { count: validation.errors.length - 2 })}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    );
  }

  // 完整模式渲染
  return (
    <div className={`space-y-3 ${className}`}>
      {/* 密码强度条 */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('ui.passwordStrength.strength')}
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
                text={t('ui.passwordStrength.length')}
              />
              <ValidationRule
                passed={!username || !PasswordValidator.isRelatedToUsername(password, username)}
                text={t('ui.passwordStrength.noUsername')}
              />
              <ValidationRule
                passed={!email || !PasswordValidator.isRelatedToEmail(password, email)}
                text={t('ui.passwordStrength.noEmail')}
              />
              <ValidationRule
                passed={!PasswordValidator.containsBirthDatePattern(password)}
                text={t('ui.passwordStrength.noBirthdate')}
              />
              <ValidationRule
                passed={!PasswordValidator.hasConsecutiveRepeats(password)}
                text={t('ui.passwordStrength.noRepeats')}
              />
              <ValidationRule
                passed={/[a-z]/.test(password)}
                text={t('ui.passwordStrength.hasLowercase')}
              />
              <ValidationRule
                passed={/[A-Z]/.test(password)}
                text={t('ui.passwordStrength.hasUppercase')}
              />
              <ValidationRule
                passed={/\d/.test(password)}
                text={t('ui.passwordStrength.hasDigit')}
              />
              <ValidationRule
                passed={/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)}
                text={t('ui.passwordStrength.hasSpecial')}
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
                    {t('ui.passwordStrength.passwordSecure')}
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
