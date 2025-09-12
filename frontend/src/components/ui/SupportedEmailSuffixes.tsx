import React, { useState, useEffect } from 'react';
import { HelpCircle, Mail, Building2, X, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { authAPI } from '../../services/api';
import { useTranslation } from '../../hooks/useTranslation';

interface SupportedEmailSuffixesProps {
  className?: string;
}

const SupportedEmailSuffixes: React.FC<SupportedEmailSuffixesProps> = ({
  className = ''
}) => {
  const { t } = useTranslation();
  const [showModal, setShowModal] = useState(false);
  const [allowedEnterprises, setAllowedEnterprises] = useState<Array<{
    name: string;
    emailSuffix: string;
    currentMembers: number;
    maxMembers: number;
    availableSlots: number;
  }>>([]);
  const [loading, setLoading] = useState(false);

  // 获取支持的企业邮箱后缀和名额信息
  const fetchAllowedEnterprises = async () => {
    try {
      setLoading(true);
      const response = await authAPI.getAllowedEnterprises();
      if (response.data.success) {
        setAllowedEnterprises(response.data.enterprises || []);
      }
    } catch (error) {
      // 错误日志已清理
    } finally {
      setLoading(false);
    }
  };

  // 组件加载时获取数据
  useEffect(() => {
    if (showModal && allowedEnterprises.length === 0) {
      fetchAllowedEnterprises();
    }
  }, [showModal]);

  // 静态的企业邮箱后缀分类（作为补充显示）
  const staticEmailSuffixes = [
    // 教育机构
    { category: t('ui.supportedEmailSuffixes.categories.education'), suffixes: ['@edu.cn', '@ac.cn', '@university.edu', '@college.edu'] },
    // 政府机构
    { category: t('ui.supportedEmailSuffixes.categories.government'), suffixes: ['@gov.cn', '@org.cn'] },
    // 知名科技公司
    { category: t('ui.supportedEmailSuffixes.categories.techCompanies'), suffixes: ['@tencent.com', '@alibaba-inc.com', '@baidu.com', '@bytedance.com', '@huawei.com'] },
    // 国际企业
    { category: t('ui.supportedEmailSuffixes.categories.international'), suffixes: ['@microsoft.com', '@apple.com', '@google.com', '@amazon.com', '@facebook.com'] }
  ];

  return (
    <>
      {/* 触发按钮 */}
      <button
        type="button"
        onClick={() => setShowModal(true)}
        className={`inline-flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors ${className}`}
      >
        <HelpCircle className="w-4 h-4" />
        <span>{t('ui.supportedEmailSuffixes.viewSupported')}</span>
      </button>

      {/* 模态框 */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            {/* 背景遮罩 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowModal(false)}
            />
            
            {/* 模态框内容 */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="relative w-full max-w-2xl max-h-[80vh] bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              {/* 头部 */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                    <Mail className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                      {t('ui.supportedEmailSuffixes.title')}
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {t('ui.supportedEmailSuffixes.description')}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {/* 刷新按钮 */}
                  <button
                    onClick={fetchAllowedEnterprises}
                    disabled={loading}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                    title={t('ui.supportedEmailSuffixes.refresh')}
                  >
                    <RefreshCw className={`w-5 h-5 text-gray-500 dark:text-gray-400 ${loading ? 'animate-spin' : ''}`} />
                  </button>
                  
                  {/* 关闭按钮 */}
                  <button
                    onClick={() => setShowModal(false)}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  </button>
                </div>
              </div>

              {/* 内容区域 */}
              <div className="p-6 overflow-y-auto max-h-[60vh]">
                <div className="space-y-6">
                  {/* 已注册的企业（来自后端） */}
                  {allowedEnterprises.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-700"
                    >
                      {/* 分类标题 */}
                      <div className="flex items-center gap-2 mb-3">
                        <Building2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                        <h3 className="text-md font-semibold text-gray-900 dark:text-gray-100">
                          {t('ui.supportedEmailSuffixes.registeredEnterprises')}
                        </h3>
                      </div>
                      
                      {/* 企业列表 */}
                      <div className="space-y-3">
                        {allowedEnterprises.map((enterprise, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.05 }}
                            className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-md border border-green-200 dark:border-green-600 shadow-sm"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <div>
                                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                  {enterprise.name}
                                </div>
                                <code className="text-xs font-mono text-gray-600 dark:text-gray-400">
                                  {enterprise.emailSuffix}
                                </code>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className={`text-sm font-semibold ${
                                enterprise.availableSlots > 0 
                                  ? 'text-green-600 dark:text-green-400' 
                                  : 'text-red-600 dark:text-red-400'
                              }`}>
                                {enterprise.availableSlots > 0 
                                  ? t('ui.supportedEmailSuffixes.availableSlots', { count: enterprise.availableSlots })
                                  : t('ui.supportedEmailSuffixes.slotsFull')
                                }
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {enterprise.currentMembers}/{enterprise.maxMembers}
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* 静态的企业邮箱后缀分类 */}
                  {staticEmailSuffixes.map((category, categoryIndex) => (
                    <motion.div
                      key={category.category}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: (allowedEnterprises.length > 0 ? 0.3 : 0) + categoryIndex * 0.1 }}
                      className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-200 dark:border-gray-600"
                    >
                      {/* 分类标题 */}
                      <div className="flex items-center gap-2 mb-3">
                        <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        <h3 className="text-md font-semibold text-gray-900 dark:text-gray-100">
                          {category.category}
                        </h3>
                      </div>
                      
                      {/* 邮箱后缀列表 */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                        {category.suffixes.map((suffix, suffixIndex) => (
                          <motion.div
                            key={suffix}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: (allowedEnterprises.length > 0 ? 0.3 : 0) + (categoryIndex * 0.1) + (suffixIndex * 0.05) }}
                            className="flex items-center gap-2 p-2 bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-600 shadow-sm"
                          >
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <code className="text-sm font-mono text-gray-700 dark:text-gray-300">
                              {suffix}
                            </code>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* 说明文字 */}
                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
                    {t('ui.supportedEmailSuffixes.registrationInstructions')}
                  </h4>
                  <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                    <li>• <span className="text-green-600 dark:text-green-400 font-medium">{t('ui.supportedEmailSuffixes.greenArea')}</span>{t('ui.supportedEmailSuffixes.greenAreaDesc')}</li>
                    <li>• <span className="text-blue-600 dark:text-blue-400 font-medium">{t('ui.supportedEmailSuffixes.blueArea')}</span>{t('ui.supportedEmailSuffixes.blueAreaDesc')}</li>
                    <li>{t('ui.supportedEmailSuffixes.enterpriseBenefits')}</li>
                    <li>{t('ui.supportedEmailSuffixes.personalEmail')}</li>
                    <li>{t('ui.supportedEmailSuffixes.contactAdmin')}</li>
                  </ul>
                </div>
              </div>

              {/* 底部操作 */}
              <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                >
                  {t('ui.supportedEmailSuffixes.gotIt')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default SupportedEmailSuffixes;
