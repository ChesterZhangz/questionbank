import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from './Button';
import { useTranslation } from '../../hooks/useTranslation';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon: React.ComponentType<{ className?: string }>;
  showBackButton?: boolean;
  backPath?: string;
  backText?: string;
  children?: React.ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  icon: Icon,
  showBackButton = false,
  backPath,
  backText,
  children
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleBack = () => {
    if (backPath) {
      navigate(backPath);
    } else {
      navigate(-1);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-8"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {showBackButton && (
            <Button
              variant="outline"
              onClick={handleBack}
              className="flex items-center gap-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-gray-200 dark:border-gray-600 hover:bg-white dark:hover:bg-gray-700 hover:border-blue-300 dark:hover:border-blue-400 transition-all duration-200"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{backText || t('ui.pageHeader.back')}</span>
            </Button>
          )}
          
          <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-600 dark:from-blue-500 dark:to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg dark:shadow-gray-900/30">
            <Icon className="w-8 h-8 text-white" />
          </div>
          
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-blue-600 dark:from-gray-100 dark:to-blue-400 bg-clip-text text-transparent">
              {title}
            </h1>
            {subtitle && (
              <p className="text-gray-600 dark:text-gray-400 mt-1">{subtitle}</p>
            )}
          </div>
        </div>
        
        {children && (
          <div className="flex items-center gap-3">
            {children}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default PageHeader; 