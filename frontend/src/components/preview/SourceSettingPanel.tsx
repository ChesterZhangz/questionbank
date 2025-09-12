import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { X, Target, Check } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';

interface SourceSettingPanelProps {
  onClose: () => void;
  onConfirm: (source: string) => void;
  selectedCount: number;
}

const SourceSettingPanel: React.FC<SourceSettingPanelProps> = ({
  onClose,
  onConfirm,
  selectedCount
}) => {
  const { t } = useTranslation();
  const [source, setSource] = useState('');

  const handleConfirm = () => {
    if (source.trim()) {
      onConfirm(source.trim());
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 dark:bg-black/70 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md"
      >
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('preview.sourceSettingPanel.title')}</h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="p-1 h-8 w-8 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('preview.sourceSettingPanel.source')}
              </label>
              <Input
                type="text"
                placeholder={t('preview.sourceSettingPanel.sourcePlaceholder')}
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="w-full"
              />
            </div>

            <div className="text-sm text-gray-600 dark:text-gray-400">
              {t('preview.sourceSettingPanel.selectedCount', { count: selectedCount })}
            </div>

            <div className="flex items-center justify-end space-x-3 pt-4">
              <Button
                variant="outline"
                onClick={onClose}
              >
                {t('preview.common.cancel')}
              </Button>
              <Button
                onClick={handleConfirm}
                disabled={!source.trim()}
                className="flex items-center space-x-1"
              >
                <Check className="h-4 w-4" />
                <span>{t('preview.common.save')}</span>
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default SourceSettingPanel; 