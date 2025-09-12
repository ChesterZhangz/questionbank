import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  AlertTriangle, 
  Shield, 
  FileX, 
  Server, 
  ArrowRight,
  Code,
  Palette,
  Zap,
  Calculator,
  Brain,
  Target
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button';
import { useTranslation } from '../../hooks/useTranslation';

const ErrorDemoPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [selectedError, setSelectedError] = useState<string | null>(null);

  const errorTypes = [
    {
      code: '400',
      title: t('errors.demo.errorTypes.badRequest.title'),
      description: t('errors.demo.errorTypes.badRequest.description'),
      icon: <AlertTriangle className="w-8 h-8" />,
      color: 'orange',
      path: '/400'
    },
    {
      code: '403',
      title: t('errors.demo.errorTypes.forbidden.title'),
      description: t('errors.demo.errorTypes.forbidden.description'),
      icon: <Shield className="w-8 h-8" />,
      color: 'red',
      path: '/403'
    },
    {
      code: '404',
      title: t('errors.demo.errorTypes.notFound.title'),
      description: t('errors.demo.errorTypes.notFound.description'),
      icon: <FileX className="w-8 h-8" />,
      color: 'blue',
      path: '/404'
    },
    {
      code: '500',
      title: t('errors.demo.errorTypes.serverError.title'),
      description: t('errors.demo.errorTypes.serverError.description'),
      icon: <Server className="w-8 h-8" />,
      color: 'purple',
      path: '/500'
    }
  ];

  const features = [
    {
      icon: <Code className="w-6 h-6" />,
      title: t('errors.demo.features.modernDesign.title'),
      description: t('errors.demo.features.modernDesign.description')
    },
    {
      icon: <Palette className="w-6 h-6" />,
      title: t('errors.demo.features.responsiveLayout.title'),
      description: t('errors.demo.features.responsiveLayout.description')
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: t('errors.demo.features.smoothAnimation.title'),
      description: t('errors.demo.features.smoothAnimation.description')
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* 头部 */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Code className="w-6 h-6 text-blue-600" />
              </div>
              <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">{t('errors.demo.title')}</h1>
            </div>
            <Button
              onClick={() => navigate('/')}
              variant="outline"
              className="flex items-center"
            >
              {t('errors.returnHome')}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* 介绍部分 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-4">
            {t('errors.demo.systemTitle')}
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            {t('errors.demo.systemDescription')}
          </p>
        </motion.div>

        {/* 特性展示 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid md:grid-cols-3 gap-6 mb-12"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                  {feature.title}
                </h3>
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* 错误类型选择 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 text-center mb-8">
            {t('errors.demo.selectErrorType')}
          </h3>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {errorTypes.map((error, index) => (
              <motion.button
                key={error.code}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                onClick={() => setSelectedError(error.code)}
                className={`p-6 rounded-xl border-2 transition-all hover:shadow-lg ${
                  selectedError === error.code
                    ? `border-${error.color}-500 bg-${error.color}-50 dark:bg-${error.color}-900/20`
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <div className="text-center space-y-4">
                  <div className={`inline-flex p-3 rounded-full bg-${error.color}-100 text-${error.color}-600`}>
                    {error.icon}
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                      {error.code}
                    </div>
                    <div className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-2">
                      {error.title}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {error.description}
                    </div>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* 演示按钮 */}
        {selectedError && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <Button
              onClick={() => {
                const error = errorTypes.find(e => e.code === selectedError);
                if (error) {
                  navigate(error.path);
                }
              }}
              variant="primary"
              className="px-8 py-4 text-lg font-semibold"
            >
              {t('errors.demo.viewDemo', { code: selectedError })}
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </motion.div>
        )}

        {/* 游戏功能说明 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-16 bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 text-center mb-6">
            {t('errors.demo.builtInGames')}
          </h3>
           <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-blue-100 rounded-full">
                  <Calculator className="w-8 h-8 text-blue-600" />
                </div>
              </div>
              <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">{t('errors.games.math.title')}</h4>
              <p className="text-gray-600 dark:text-gray-400">{t('errors.games.math.description')}</p>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-green-100 rounded-full">
                  <Brain className="w-8 h-8 text-green-600" />
                </div>
              </div>
              <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">{t('errors.games.memory.title')}</h4>
              <p className="text-gray-600 dark:text-gray-400">{t('errors.games.memory.description')}</p>
            </div>
                         <div className="text-center">
               <div className="flex justify-center mb-4">
                 <div className="p-3 bg-purple-100 rounded-full">
                   <Target className="w-8 h-8 text-purple-600" />
                 </div>
               </div>
               <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">{t('errors.games.puzzle.title')}</h4>
               <p className="text-gray-600 dark:text-gray-400">{t('errors.games.puzzle.description')}</p>
             </div>
             <div className="text-center">
               <div className="flex justify-center mb-4">
                 <div className="p-3 bg-orange-100 rounded-full">
                   <Zap className="w-8 h-8 text-orange-600" />
                 </div>
               </div>
               <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">{t('errors.games.reaction.title')}</h4>
               <p className="text-gray-600 dark:text-gray-400">{t('errors.games.reaction.description')}</p>
             </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ErrorDemoPage; 