import React from 'react';
import LaTeXPreview from './LaTeXPreview';
import type { RenderConfig, LaTeXRenderResult } from '../../../lib/latex/types';
import { useTranslation } from '../../../hooks/useTranslation';

interface LivePreviewProps {
  content: string;
  isEditing: boolean;
  config?: Partial<RenderConfig>;
  className?: string;
  title?: string;
  variant?: 'default' | 'compact' | 'detailed';
  onRenderComplete?: (result: LaTeXRenderResult) => void;
}

const LivePreview: React.FC<LivePreviewProps> = ({
  content,
  isEditing,
  config = { mode: 'full' },
  className = '',
  title,
  variant = 'default',
  onRenderComplete
}) => {
  const { t } = useTranslation();
  if (!isEditing) return null;
  
  return (
    <LaTeXPreview
      content={content}
      config={config}
      className={className}
      title={title || t('editor.preview.livePreview')}
      variant={variant}
      onRenderComplete={onRenderComplete}
    />
  );
};

export default LivePreview; 