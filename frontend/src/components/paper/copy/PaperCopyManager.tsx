import React, { useState } from 'react';
import { Settings, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';
import Button from '../../ui/Button';
import CopyButton from './CopyButton';
import CopyModeSelector from './CopyModeSelector';
import OverleafLinkManager from './OverleafLinkManager';
import type { Paper, CopyConfig } from './types';
import { defaultCopyConfig, setTranslationFunction } from './copyUtils';
import { useTranslation } from '../../../hooks/useTranslation';

interface PaperCopyManagerProps {
  paper: Paper;
  className?: string;
  showSettings?: boolean;
  showOverleafButton?: boolean;
  canEdit?: boolean;
  onPaperUpdate?: (updatedPaper: Paper) => void;
  isSelectMode?: boolean;
  selectedQuestions?: string[];
  selectiveCopyConfig?: {
    showDifficulty: boolean;
    showSource: boolean;
    showAnswer: boolean;
  };
  onSelectiveCopy?: (latex: string) => void;
  onSelectiveCopyConfigUpdate?: (updates: Partial<{
    showDifficulty: boolean;
    showSource: boolean;
    showAnswer: boolean;
  }>) => void;
  currentUserId?: string;
}

const PaperCopyManager: React.FC<PaperCopyManagerProps> = ({
  paper,
  className = '',
  showSettings = true,
  showOverleafButton = false,
  canEdit = true,
  onPaperUpdate,
  isSelectMode = false,
  selectedQuestions = [],
  selectiveCopyConfig = { showDifficulty: true, showSource: true, showAnswer: false },
  onSelectiveCopy,
  onSelectiveCopyConfigUpdate,
  currentUserId
}) => {
  const { t } = useTranslation();
  const [config, setConfig] = useState<CopyConfig>(defaultCopyConfig);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  // 设置 copyUtils 的翻译函数
  React.useEffect(() => {
    setTranslationFunction(t);
  }, [t]);

  // 检查是否可以编辑Overleaf链接
  // 只有添加链接的人和试卷集所有者可以编辑/删除链接
  const canEditOverleafLink = canEdit && currentUserId && (
    paper.owner._id === currentUserId || 
    paper.bank?.ownerId === currentUserId ||
    paper.overleafLinkAddedBy?._id === currentUserId
  );

  const handleOverleafLinkUpdate = (link: string) => {
    if (onPaperUpdate) {
      onPaperUpdate({ ...paper, overleafEditLink: link });
    }
  };

  const handleOverleafLinkRemove = () => {
    if (onPaperUpdate) {
      const { overleafEditLink, ...paperWithoutLink } = paper;
      onPaperUpdate(paperWithoutLink as Paper);
    }
  };


  return (
    <div className={`space-y-4 ${className}`}>
      {/* Overleaf链接管理 */}
      {canEdit && (
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
          <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
            {t('paper.paperCopyManager.overleafEditLink')}
          </h3>
          <OverleafLinkManager
            paper={paper}
            onUpdateLink={handleOverleafLinkUpdate}
            onRemoveLink={handleOverleafLinkRemove}
            canEdit={!!canEditOverleafLink}
          />
        </div>
      )}


      {/* 主要复制按钮 */}
      <div className="flex items-center space-x-3">
        {isSelectMode && selectedQuestions.length > 0 ? (
          <Button
            onClick={async () => {
              if (onSelectiveCopy) {
                const selectedQuestionsData = paper.sections.flatMap(section => 
                  section.items.map(item => item.question)
                ).filter(question => selectedQuestions.includes(question._id));
                
                const { generateSelectiveCopyLaTeX } = await import('./copyUtils');
                const latex = generateSelectiveCopyLaTeX(selectedQuestionsData, {
                  showDifficulty: selectiveCopyConfig.showDifficulty,
                  showSource: selectiveCopyConfig.showSource,
                  showAnswer: selectiveCopyConfig.showAnswer
                });
                onSelectiveCopy(latex);
                
                // 显示复制成功状态
                setCopySuccess(true);
                setTimeout(() => setCopySuccess(false), 2000);
              }
            }}
            className={`flex-1 transition-all duration-200 ${
              copySuccess 
                ? 'bg-green-600 hover:bg-green-700 text-white' 
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {copySuccess ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                {t('paper.copyButton.states.copied')}
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 mr-2" />
                {t('paper.paperCopyManager.copySelected')} {selectedQuestions.length} {t('paper.practicePaperCard.questions')} LaTeX
              </>
            )}
          </Button>
        ) : (
          <CopyButton
            paper={paper}
            config={config}
            showOverleafButton={showOverleafButton && !paper.overleafEditLink}
            className="flex-1"
            showHint={!isSelectMode}
          />
        )}
        
        {showSettings && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
            className="flex items-center space-x-1"
          >
            <Settings className="w-4 h-4" />
            <span>{t('paper.paperCopyManager.settings')}</span>
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
          {isSelectMode ? (
            // 选择模式下的设置
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white">{t('paper.paperCopyManager.selectiveCopy')}</h4>
              <div className="space-y-3">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={selectiveCopyConfig?.showDifficulty || false}
                    onChange={(e) => {
                      if (onSelectiveCopyConfigUpdate) {
                        onSelectiveCopyConfigUpdate({ showDifficulty: e.target.checked });
                      }
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">显示难度标签</span>
                </label>
                
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={selectiveCopyConfig?.showSource || false}
                    onChange={(e) => {
                      if (onSelectiveCopyConfigUpdate) {
                        onSelectiveCopyConfigUpdate({ showSource: e.target.checked });
                      }
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">显示出处</span>
                </label>
                
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={selectiveCopyConfig?.showAnswer || false}
                    onChange={(e) => {
                      if (onSelectiveCopyConfigUpdate) {
                        onSelectiveCopyConfigUpdate({ showAnswer: e.target.checked });
                      }
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">显示答案（解析）</span>
                </label>
              </div>
            </div>
          ) : (
            // 完整复制模式下的设置
            <CopyModeSelector
              config={config}
              onConfigChange={setConfig}
              disableOverleafOption={!!paper.overleafEditLink}
            />
          )}
        </div>
      )}


    </div>
  );
};

export default PaperCopyManager;
