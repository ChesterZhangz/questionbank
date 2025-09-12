import React from 'react';
import type { CopyMode, CopyConfig } from './types';
import { useTranslation } from '../../../hooks/useTranslation';

interface CopyModeSelectorProps {
  config: CopyConfig;
  onConfigChange: (config: CopyConfig) => void;
  className?: string;
  disableOverleafOption?: boolean; // 是否禁用Overleaf选项
}

const CopyModeSelector: React.FC<CopyModeSelectorProps> = ({
  config,
  onConfigChange,
  className = '',
  disableOverleafOption = false
}) => {
  const { t } = useTranslation();
  
  // 如果禁用Overleaf选项且当前选择的是overleaf，自动切换到clipboard
  React.useEffect(() => {
    if (disableOverleafOption && config.copyMethod === 'overleaf') {
      onConfigChange({ ...config, copyMethod: 'clipboard' });
    }
  }, [disableOverleafOption, config.copyMethod, config, onConfigChange]);
  
  const modes: Array<{ value: CopyMode; label: string; description: string }> = [
    {
      value: 'mareate',
      label: t('paper.copyModeSelector.modes.mareate.label'),
      description: t('paper.copyModeSelector.modes.mareate.description')
    },
    {
      value: 'normal',
      label: t('paper.copyModeSelector.modes.normal.label'),
      description: t('paper.copyModeSelector.modes.normal.description')
    }
  ];

  const handleModeChange = (mode: CopyMode) => {
    onConfigChange({ ...config, mode });
  };

  const handleCopyMethodChange = (copyMethod: 'clipboard' | 'overleaf') => {
    const newConfig = { ...config, copyMethod };
    
    // 如果选择Overleaf打开，自动启用完整LaTeX文档环境
    if (copyMethod === 'overleaf') {
      if (config.mode === 'normal') {
        newConfig.normalConfig = {
          addDocumentEnvironment: true,
          paperSize: config.normalConfig?.paperSize || 'A4',
          customGeometry: config.normalConfig?.customGeometry || ''
        };
      }
    }
    
    onConfigChange(newConfig);
  };

  const handleVspaceToggle = () => {
    onConfigChange({ ...config, addVspace: !config.addVspace });
  };

  const handleVspaceChange = (type: keyof CopyConfig['vspaceAmount'], value: string) => {
    // 只允许输入数字，自动添加cm单位
    const numericValue = value.replace(/[^\d.]/g, '');
    const vspaceValue = numericValue ? `\\vspace{${numericValue}cm}` : '';
    
    onConfigChange({
      ...config,
      vspaceAmount: {
        ...config.vspaceAmount,
        [type]: vspaceValue
      }
    });
  };

  // 从vspace字符串中提取数字
  const extractVspaceNumber = (vspace: string): string => {
    const match = vspace.match(/\\vspace\{([\d.]+)cm\}/);
    return match ? match[1] : '';
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* 复制方式选择 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {t('paper.copyModeSelector.copyMethod.label')}
        </label>
        <div className="space-y-2">
          <label className="flex items-start space-x-3 cursor-pointer">
            <input
              type="radio"
              name="copyMethod"
              value="clipboard"
              checked={config.copyMethod === 'clipboard'}
              onChange={() => handleCopyMethodChange('clipboard')}
              className="mt-1 w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
            />
            <div>
              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {t('paper.copyModeSelector.copyMethod.clipboard.label')}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {t('paper.copyModeSelector.copyMethod.clipboard.description')}
              </div>
            </div>
          </label>
          {!disableOverleafOption && (
            <label className="flex items-start space-x-3 cursor-pointer">
              <input
                type="radio"
                name="copyMethod"
                value="overleaf"
                checked={config.copyMethod === 'overleaf'}
                onChange={() => handleCopyMethodChange('overleaf')}
                className="mt-1 w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <div>
              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {t('paper.copyModeSelector.copyMethod.overleaf.label')}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {t('paper.copyModeSelector.copyMethod.overleaf.description')}
              </div>
              </div>
            </label>
          )}
        </div>
      </div>

      {/* 复制模式选择 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {t('paper.copyModeSelector.copyMode.label')}
        </label>
        <div className="space-y-2">
          {modes.map((mode) => (
            <label key={mode.value} className="flex items-start space-x-3 cursor-pointer">
              <input
                type="radio"
                name="copyMode"
                value={mode.value}
                checked={config.mode === mode.value}
                onChange={() => handleModeChange(mode.value)}
                className="mt-1 w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <div>
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {mode.label}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {mode.description}
                </div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Vspace设置 */}
      <div>
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            checked={config.addVspace}
            onChange={handleVspaceToggle}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('paper.copyModeSelector.vspace.addVspace')}
          </span>
        </label>

        {config.addVspace && (
          <div className="mt-3 space-y-3 pl-6">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                  {t('paper.copyModeSelector.vspace.choiceSpacing')}
                </label>
                <input
                  type="text"
                  value={extractVspaceNumber(config.vspaceAmount.choice)}
                  onChange={(e) => handleVspaceChange('choice', e.target.value)}
                  className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="3"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                  {t('paper.copyModeSelector.vspace.fillSpacing')}
                </label>
                <input
                  type="text"
                  value={extractVspaceNumber(config.vspaceAmount.fill)}
                  onChange={(e) => handleVspaceChange('fill', e.target.value)}
                  className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="3"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                  {t('paper.copyModeSelector.vspace.solutionSpacing')}
                </label>
                <input
                  type="text"
                  value={extractVspaceNumber(config.vspaceAmount.solution)}
                  onChange={(e) => handleVspaceChange('solution', e.target.value)}
                  className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="5"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                  {t('paper.copyModeSelector.vspace.defaultSpacing')}
                </label>
                <input
                  type="text"
                  value={extractVspaceNumber(config.vspaceAmount.default)}
                  onChange={(e) => handleVspaceChange('default', e.target.value)}
                  className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="3"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 常规模式特有配置 */}
      {config.mode === 'normal' && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            {t('paper.copyModeSelector.normalConfig.title')}
          </h4>
          <div className="space-y-3 pl-4">
            

            <label className={`flex items-center space-x-2 ${config.copyMethod === 'overleaf' ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}>
              <input
                type="checkbox"
                checked={config.normalConfig?.addDocumentEnvironment || false}
                disabled={config.copyMethod === 'overleaf'}
                onChange={(e) => {
                  if (config.copyMethod !== 'overleaf') {
                    onConfigChange({
                      ...config,
                      normalConfig: {
                        ...config.normalConfig,
                      addDocumentEnvironment: e.target.checked,
                        paperSize: config.normalConfig?.paperSize || 'A4',
                        customGeometry: config.normalConfig?.customGeometry || ''
                      }
                    });
                  }
                }}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {t('paper.copyModeSelector.normalConfig.addDocumentEnvironment')}
                {config.copyMethod === 'overleaf' && (
                  <span className="text-xs text-gray-500 ml-1">({t('paper.copyModeSelector.normalConfig.overleafDefault')})</span>
                )}
              </span>
            </label>

            {config.normalConfig?.addDocumentEnvironment && (
              <div className="space-y-2 pl-6">
                <div>
                  <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                    {t('paper.copyModeSelector.normalConfig.paperSize')}
                  </label>
                  <select
                    value={config.normalConfig?.paperSize || 'A4'}
                    onChange={(e) => {
                      onConfigChange({
                        ...config,
                        normalConfig: {
                          ...config.normalConfig,
                          addDocumentEnvironment: config.normalConfig?.addDocumentEnvironment || false,
                          paperSize: e.target.value as 'A4' | 'B5' | 'custom',
                          customGeometry: config.normalConfig?.customGeometry || ''
                        }
                      });
                    }}
                    className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="A4">{t('paper.copyModeSelector.normalConfig.paperSizes.a4')}</option>
                    <option value="B5">{t('paper.copyModeSelector.normalConfig.paperSizes.b5')}</option>
                    <option value="custom">{t('paper.copyModeSelector.normalConfig.paperSizes.custom')}</option>
                  </select>
                </div>

                {config.normalConfig?.paperSize === 'custom' && (
                  <div>
                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                      {t('paper.copyModeSelector.normalConfig.customGeometry')}
                    </label>
                    <input
                      type="text"
                      value={config.normalConfig?.customGeometry || ''}
                      onChange={(e) => {
                        onConfigChange({
                          ...config,
                          normalConfig: {
                            ...config.normalConfig,
                            addDocumentEnvironment: config.normalConfig?.addDocumentEnvironment || false,
                            paperSize: config.normalConfig?.paperSize || 'A4',
                            customGeometry: e.target.value
                          }
                        });
                      }}
                      className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="paperwidth=21cm,paperheight=29.7cm,top=2.4cm,bottom=2.6cm,right=2cm,left=2cm"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CopyModeSelector;
