import React from 'react';
import { motion } from 'framer-motion';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { X, Brain, Sparkles, AlertTriangle } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';

interface AIAnalysisPanelProps {
  onClose: () => void;
  onAnalyze: () => void;
  selectedCount: number;
  isAnalyzing: boolean;
}

const AIAnalysisPanel: React.FC<AIAnalysisPanelProps> = ({
  onClose,
  onAnalyze,
  selectedCount,
  isAnalyzing
}) => {
  const { t } = useTranslation();
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
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
              <Brain className="h-5 w-5 text-purple-600" />
              <h3 className="text-lg font-semibold text-gray-900">{t('preview.aiAnalysisPanel.title')}</h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="p-1 h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-4">
            <div className="text-sm text-gray-600">
              {t('preview.aiAnalysisPanel.subtitle')} {t('preview.aiAnalysisPanel.selectedCount', { count: selectedCount })}
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm">
                <Sparkles className="h-4 w-4 text-purple-500" />
                <span>自动识别题目难度等级</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Sparkles className="h-4 w-4 text-purple-500" />
                <span>智能生成知识点标签</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Sparkles className="h-4 w-4 text-purple-500" />
                <span>自动分类题目类型</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Sparkles className="h-4 w-4 text-purple-500" />
                <span>提供分析置信度</span>
              </div>
            </div>

            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                <div className="text-sm text-yellow-700">
                  <p className="font-medium">注意事项：</p>
                  <p>• AI分析需要一定时间，请耐心等待</p>
                  <p>• 分析结果仅供参考，建议人工审核</p>
                  <p>• 大量题目分析可能需要较长时间</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-4">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={isAnalyzing}
              >
                {t('preview.common.cancel')}
              </Button>
              <Button
                onClick={onAnalyze}
                disabled={isAnalyzing}
                className="flex items-center space-x-1 bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700"
              >
                <Brain className={`h-4 w-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
                <span>{isAnalyzing ? t('preview.aiAnalysisPanel.analyzing') : t('preview.aiAnalysisPanel.analyzeButton')}</span>
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default AIAnalysisPanel; 