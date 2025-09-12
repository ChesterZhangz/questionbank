import React from 'react';
import { Eye, EyeOff } from 'lucide-react';
import LaTeXPreview from './LaTeXPreview';
import type { RenderConfig } from '../../../lib/latex/types';
import { useTranslation } from '../../../hooks/useTranslation';

interface PreviewPanelProps {
  content: string;
  isVisible: boolean;
  onToggleVisibility: () => void;
  config?: Partial<RenderConfig>;
  className?: string;
  title?: string;
  variant?: 'default' | 'compact' | 'detailed';
}

const PreviewPanel: React.FC<PreviewPanelProps> = ({
  content,
  isVisible,
  onToggleVisibility,
  config = { mode: 'full' },
  className = '',
  title,
  variant = 'default'
}) => {
  const { t } = useTranslation();
  return (
    <div className={`preview-panel ${className}`}>
      {/* 预览控制栏 */}
                <div className="preview-panel-header">
            <div className="preview-panel-controls">
              <div className="preview-panel-title">
                <Eye className="w-4 h-4" />
                <span>{title || t('editor.preview.title')}</span>
              </div>
              <button
                onClick={onToggleVisibility}
                className="preview-panel-toggle"
              >
            {isVisible ? (
              <>
                <EyeOff className="w-3 h-3" />
                <span>{t('editor.preview.hidePreview')}</span>
              </>
            ) : (
              <>
                <Eye className="w-3 h-3" />
                <span>{t('editor.preview.showPreview')}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 预览内容区域 */}
      {isVisible && (
        <div className="preview-panel-content">
          <LaTeXPreview
            content={content}
            config={config}
            variant={variant}
            showTitle={false}
          />
        </div>
      )}
    </div>
  );
};

export default PreviewPanel; 