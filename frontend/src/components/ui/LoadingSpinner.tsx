import React from 'react';
import { useTranslation } from '../../hooks/useTranslation';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  text 
}) => {
  const { t } = useTranslation();
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] space-y-4">
      <div className={`${sizeClasses[size]} animate-spin rounded-full border-4 border-gray-200 border-t-blue-600`}></div>
      {(text || t('ui.loadingSpinner.loading')) && (
        <p className="text-sm text-gray-600 dark:text-gray-400">{text || t('ui.loadingSpinner.loading')}</p>
      )}
    </div>
  );
};

export default LoadingSpinner;
