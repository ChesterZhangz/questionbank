import React from 'react';
import { AlertCircle, RefreshCw, HelpCircle, ExternalLink } from 'lucide-react';
import Button from './Button';
import { useTranslation } from '../../hooks/useTranslation';

interface ErrorDisplayProps {
  error: string;
  errorType?: 'network' | 'file' | 'processing' | 'permission' | 'unknown';
  onRetry?: () => void;
  onHelp?: () => void;
  showDetails?: boolean;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  error,
  errorType = 'unknown',
  onRetry,
  onHelp,
  showDetails = false
}) => {
  const { t } = useTranslation();
  
  const getErrorInfo = (type: string) => {
    switch (type) {
      case 'network':
        return {
          title: t('ui.errorDisplay.network.title'),
          description: t('ui.errorDisplay.network.description'),
          suggestions: t('ui.errorDisplay.network.suggestions'),
          icon: '🌐'
        };
      case 'file':
        return {
          title: t('ui.errorDisplay.file.title'),
          description: t('ui.errorDisplay.file.description'),
          suggestions: t('ui.errorDisplay.file.suggestions'),
          icon: '📄'
        };
      case 'processing':
        return {
          title: t('ui.errorDisplay.processing.title'),
          description: t('ui.errorDisplay.processing.description'),
          suggestions: t('ui.errorDisplay.processing.suggestions'),
          icon: '⚙️'
        };
      case 'permission':
        return {
          title: t('ui.errorDisplay.permission.title'),
          description: t('ui.errorDisplay.permission.description'),
          suggestions: t('ui.errorDisplay.permission.suggestions'),
          icon: '🔒'
        };
      default:
        return {
          title: t('ui.errorDisplay.unknown.title'),
          description: t('ui.errorDisplay.unknown.description'),
          suggestions: t('ui.errorDisplay.unknown.suggestions'),
          icon: '❓'
        };
    }
  };

  const errorInfo = getErrorInfo(errorType);

  return (
    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <div className="w-8 h-8 bg-red-100 dark:bg-red-800/50 rounded-full flex items-center justify-center">
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-lg">{errorInfo.icon}</span>
            <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
              {errorInfo.title}
            </h3>
          </div>
          
          <p className="text-sm text-red-700 dark:text-red-300 mb-3">
            {errorInfo.description}
          </p>
          
          {showDetails && (
            <div className="bg-red-100 dark:bg-red-800/30 rounded p-3 mb-3">
              <p className="text-xs text-red-800 dark:text-red-200 font-mono break-all">
                {error}
              </p>
            </div>
          )}
          
          <div className="space-y-2">
            <p className="text-xs font-medium text-red-800 dark:text-red-200">{t('ui.errorDisplay.suggestions')}</p>
            <ul className="text-xs text-red-700 dark:text-red-300 space-y-1">
              {Array.isArray(errorInfo.suggestions) ? errorInfo.suggestions.map((suggestion: string, index: number) => (
                <li key={index} className="flex items-start space-x-2">
                  <span className="text-red-500 dark:text-red-400 mt-0.5">•</span>
                  <span>{suggestion}</span>
                </li>
              )) : (
                <li className="flex items-start space-x-2">
                  <span className="text-red-500 dark:text-red-400 mt-0.5">•</span>
                  <span>{errorInfo.suggestions}</span>
                </li>
              )}
            </ul>
          </div>
          
          <div className="flex items-center space-x-3 mt-4">
            {onRetry && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRetry}
                className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-800/30 border-red-300 dark:border-red-600"
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                {t('ui.errorDisplay.retry')}
              </Button>
            )}
            
            {onHelp && (
              <Button
                variant="outline"
                size="sm"
                onClick={onHelp}
                className="text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-800/30 border-blue-300 dark:border-blue-600"
              >
                <HelpCircle className="h-4 w-4 mr-1" />
                {t('ui.errorDisplay.help')}
              </Button>
            )}
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open('https://support.example.com', '_blank')}
              className="text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 border-gray-300 dark:border-gray-600"
            >
              <ExternalLink className="h-4 w-4 mr-1" />
              {t('ui.errorDisplay.documentation')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorDisplay;
