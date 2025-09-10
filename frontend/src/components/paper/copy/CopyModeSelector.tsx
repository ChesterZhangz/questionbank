import React from 'react';
import type { CopyMode, CopyConfig } from './types';

interface CopyModeSelectorProps {
  config: CopyConfig;
  onConfigChange: (config: CopyConfig) => void;
  className?: string;
}

const CopyModeSelector: React.FC<CopyModeSelectorProps> = ({
  config,
  onConfigChange,
  className = ''
}) => {
  const modes: Array<{ value: CopyMode; label: string; description: string }> = [
    {
      value: 'mareate',
      label: 'Mareate版',
      description: 'Mareate部门独创，排版美观'
    },
    {
      value: 'normal',
      label: '常规',
      description: '无自定义与答案，均为必要包'
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
          复制方式
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
                复制到剪贴板
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                将LaTeX代码复制到系统剪贴板
              </div>
            </div>
          </label>
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
                在Overleaf中打开
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                直接在新标签页中打开Overleaf项目
              </div>
            </div>
          </label>
        </div>
      </div>

      {/* 复制模式选择 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          复制模式
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
            添加题目间距
          </span>
        </label>

        {config.addVspace && (
          <div className="mt-3 space-y-3 pl-6">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                  选择题间距
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
                  填空题间距
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
                  解答题间距
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
                  默认间距
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
            常规模式配置
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
                添加完整LaTeX文档环境
                {config.copyMethod === 'overleaf' && (
                  <span className="text-xs text-gray-500 ml-1">(Overleaf模式默认启用)</span>
                )}
              </span>
            </label>

            {config.normalConfig?.addDocumentEnvironment && (
              <div className="space-y-2 pl-6">
                <div>
                  <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                    纸张尺寸
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
                    <option value="A4">A4 (21cm × 29.7cm)</option>
                    <option value="B5">B5 (18.2cm × 25.7cm)</option>
                    <option value="custom">自定义</option>
                  </select>
                </div>

                {config.normalConfig?.paperSize === 'custom' && (
                  <div>
                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                      自定义Geometry配置
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
