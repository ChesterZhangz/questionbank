import React, { useState } from 'react';
import { Copy, Check, ExternalLink } from 'lucide-react';
import Button from '../../ui/Button';
import type { Paper, CopyConfig } from './types';
import { convertPaperToLaTeX, copyToClipboard, openInOverleaf, defaultCopyConfig, setTranslationFunction } from './copyUtils';
import { useTranslation } from '../../../hooks/useTranslation';

interface CopyButtonProps {
  paper: Paper;
  config?: CopyConfig;
  className?: string;
  variant?: 'outline' | 'default' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  showOverleafButton?: boolean;
  showHint?: boolean; // 是否显示提示文字
}

const CopyButton: React.FC<CopyButtonProps> = ({
  paper,
  config = defaultCopyConfig,
  className = '',
  variant = 'outline',
  size = 'md',
  showOverleafButton = false,
  showHint = false
}) => {
  const { t } = useTranslation();
  const [copySuccess, setCopySuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // 设置 copyUtils 的翻译函数
  React.useEffect(() => {
    setTranslationFunction(t);
  }, [t]);

  const handleCopy = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      if (config.copyMethod === 'overleaf') {
        // 直接在Overleaf中打开
        openInOverleaf(paper, config);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      } else {
        // 复制到剪贴板
        const latexContent = convertPaperToLaTeX(paper, config);
        const success = await copyToClipboard(latexContent);
        
        if (success) {
          setCopySuccess(true);
          setTimeout(() => setCopySuccess(false), 2000);
        }
      }
    } catch (error) {
      console.error(t('paper.copyButton.errors.operationFailed'), error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenInOverleaf = () => {
    openInOverleaf(paper, config);
  };

  if (showOverleafButton) {
    return (
      <div className={`space-y-2 ${className}`}>
        <div className="flex space-x-2">
          <Button
            variant={variant}
            size={size}
            onClick={handleCopy}
            disabled={isLoading}
            className={`flex items-center space-x-2 ${copySuccess ? 'bg-green-50 border-green-200 text-green-700' : ''}`}
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
            ) : copySuccess ? (
              <Check className="w-4 h-4" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
            <span>
              {isLoading 
                ? (config.copyMethod === 'overleaf' ? t('paper.copyButton.states.opening') : t('paper.copyButton.states.copying')) 
                : copySuccess 
                  ? (config.copyMethod === 'overleaf' ? t('paper.copyButton.states.opened') : t('paper.copyButton.states.copied')) 
                  : (config.copyMethod === 'overleaf' ? t('paper.copyButton.states.openInOverleaf') : t('paper.copyButton.states.copyLaTeX'))
              }
            </span>
          </Button>
          
          <Button
            variant="outline"
            size={size}
            onClick={handleOpenInOverleaf}
            className="flex items-center space-x-2"
          >
            <ExternalLink className="w-4 h-4" />
            <span>{t('paper.copyButton.states.openInOverleaf')}</span>
          </Button>
        </div>
        
        {showHint && (
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            {t('paper.copyButton.hint')}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <Button
        variant={variant}
        size={size}
        onClick={handleCopy}
        disabled={isLoading}
        className={`flex items-center space-x-2 ${copySuccess ? 'bg-green-50 border-green-200 text-green-700' : ''}`}
      >
        {isLoading ? (
          <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
        ) : copySuccess ? (
          <Check className="w-4 h-4" />
        ) : (
          <Copy className="w-4 h-4" />
        )}
        <span>
          {isLoading 
            ? (config.copyMethod === 'overleaf' ? t('paper.copyButton.states.opening') : t('paper.copyButton.states.copying')) 
            : copySuccess 
              ? (config.copyMethod === 'overleaf' ? t('paper.copyButton.states.opened') : t('paper.copyButton.states.copied')) 
              : (config.copyMethod === 'overleaf' ? t('paper.copyButton.states.openInOverleaf') : t('paper.copyButton.states.copyLaTeX'))
          }
        </span>
      </Button>
      
      {showHint && (
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
          {t('paper.copyButton.hint')}
        </p>
      )}
    </div>
  );
};

export default CopyButton;
