import React, { useMemo } from 'react';
import { LaTeXRenderer } from '../../../lib/latex/renderer/LaTeXRenderer';
import type { RenderConfig, LaTeXRenderResult } from '../../../lib/latex/types';
import { useTheme } from '../../../contexts/ThemeContext';
// 样式现在统一由renderPreview.css提供

interface LaTeXPreviewProps {
  content: string;
  config?: Partial<RenderConfig>;
  className?: string;
  maxWidth?: string;
  maxHeight?: string;
  showTitle?: boolean;
  title?: string;
  variant?: 'default' | 'compact' | 'detailed';
  onRenderComplete?: (result: LaTeXRenderResult) => void;
  fullWidth?: boolean; // 新增：是否占满容器宽度
}

const LaTeXPreview: React.FC<LaTeXPreviewProps> = ({
  content,
  config = {},
  className = '',
  maxWidth = 'max-w-md',
  maxHeight = '', // 移除默认高度限制
  showTitle = false,
  title = '预览',
  variant = 'default',
  onRenderComplete,
  fullWidth = false // 新增：默认不占满宽度
}) => {
  const { isDark } = useTheme();
  const renderer = useMemo(() => new LaTeXRenderer(config), [config]);

  const renderResult = useMemo(() => {
    if (!content) {
      return { html: '', error: null, warnings: [] };
    }
    const result = renderer.render(content);
    onRenderComplete?.(result);
    return result;
  }, [content, renderer, onRenderComplete]);

  const getVariantClasses = () => {
    switch (variant) {
      case 'compact':
        return 'p-2 text-xs';
      case 'detailed':
        return 'p-4 text-sm';
      default:
        return 'p-3 text-xs';
    }
  };

  const variantClasses = getVariantClasses();
  
  // 根据fullWidth属性决定是否应用maxWidth和maxHeight
  const widthClass = fullWidth ? 'w-full' : maxWidth;
  const heightClass = fullWidth ? '' : maxHeight; // 全宽模式下不限制高度

  return (
    <div className={`latex-preview ${className}`}>
      <div className={`latex-preview-container ${variantClasses} ${widthClass} ${isDark ? 'dark' : ''}`}>
        {showTitle && (
          <div className="latex-preview-title">
            {title}
          </div>
        )}
        <div className="latex-preview-content">
          {content ? (
            <div 
              className={`latex-content ${fullWidth ? 'w-full' : 'max-w-none'} overflow-x-auto ${heightClass} ${isDark ? 'dark' : ''}`}
              dangerouslySetInnerHTML={{
                __html: renderResult.html
              }}
            />
          ) : (
            <span className="text-gray-400 dark:text-gray-500">暂无内容</span>
          )}
        </div>
        {renderResult.error && (
          <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded text-xs text-red-600 dark:text-red-400">
            {renderResult.error}
          </div>
        )}
        {renderResult.warnings && renderResult.warnings.length > 0 && (
          <div className="mt-2 p-2 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-red-800 rounded text-xs text-yellow-600 dark:text-yellow-400">
            {renderResult.warnings.join(', ')}
          </div>
        )}
      </div>
    </div>
  );
};

export default LaTeXPreview; 