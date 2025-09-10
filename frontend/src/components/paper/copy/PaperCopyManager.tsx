import React, { useState } from 'react';
import { Settings, ChevronDown, ChevronUp } from 'lucide-react';
import Button from '../../ui/Button';
import CopyButton from './CopyButton';
import CopyModeSelector from './CopyModeSelector';
import type { Paper, CopyConfig } from './types';
import { defaultCopyConfig } from './copyUtils';

interface PaperCopyManagerProps {
  paper: Paper;
  className?: string;
  showSettings?: boolean;
  showOverleafButton?: boolean;
}

const PaperCopyManager: React.FC<PaperCopyManagerProps> = ({
  paper,
  className = '',
  showSettings = true,
  showOverleafButton = false
}) => {
  const [config, setConfig] = useState<CopyConfig>(defaultCopyConfig);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* 主要复制按钮 */}
      <div className="flex items-center space-x-3">
        <CopyButton
          paper={paper}
          config={config}
          showOverleafButton={showOverleafButton}
          className="flex-1"
        />
        
        {showSettings && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
            className="flex items-center space-x-1"
          >
            <Settings className="w-4 h-4" />
            <span>设置</span>
            {showAdvancedSettings ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </Button>
        )}
      </div>

      {/* 高级设置面板 */}
      {showSettings && showAdvancedSettings && (
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <CopyModeSelector
            config={config}
            onConfigChange={setConfig}
          />
        </div>
      )}
    </div>
  );
};

export default PaperCopyManager;
