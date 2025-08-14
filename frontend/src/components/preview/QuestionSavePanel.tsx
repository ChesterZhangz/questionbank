import React from 'react';
import { motion } from 'framer-motion';
import Card from '../ui/Card';
import Button from '../ui/Button';
import FuzzySelect from '../ui/FuzzySelect';
import { X, Save, Database, CheckCircle, AlertCircle } from 'lucide-react';
import type { QuestionBank } from '../../types';

interface QuestionSavePanelProps {
  onClose: () => void;
  onSave: (targetBankId: string) => void;
  questionBanks: QuestionBank[];
  selectedQuestionBank?: string;
  onQuestionBankChange: (bankId?: string) => void;
  selectedCount: number;
  isSaving: boolean;
  saveProgress: number;
}

const QuestionSavePanel: React.FC<QuestionSavePanelProps> = ({
  onClose,
  onSave,
  questionBanks,
  selectedQuestionBank,
  onQuestionBankChange,
  selectedCount,
  isSaving,
  saveProgress
}) => {


  // 调试信息
  console.log('QuestionSavePanel - questionBanks:', questionBanks);
  console.log('QuestionSavePanel - selectedQuestionBank:', selectedQuestionBank);

  const bankOptions = questionBanks.map(bank => ({
    value: bank.bid, // 使用bid而不是_id，因为后端API期望bid
    label: bank.name
  }));

  console.log('QuestionSavePanel - bankOptions:', bankOptions);

  const handleSave = () => {
    if (selectedQuestionBank) {
      onSave(selectedQuestionBank);
    }
  };

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
        className="w-full max-w-lg"
      >
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Save className="h-5 w-5 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-900">保存题目到题库</h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="p-1 h-8 w-8"
              disabled={isSaving}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-4">
            {/* 保存进度 */}
            {isSaving && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span className="text-sm font-medium text-blue-700">正在保存题目...</span>
                </div>
                <div className="w-full bg-blue-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${saveProgress}%` }}
                  ></div>
                </div>
                <div className="text-xs text-blue-600 mt-1">
                  进度: {saveProgress}%
                </div>
              </div>
            )}

            {/* 题目统计 */}
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm text-gray-700">
                  准备保存 {selectedCount} 道题目
                </span>
              </div>
            </div>

            {/* 题库选择 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                选择目标题库
              </label>
              <FuzzySelect
                options={bankOptions}
                value={selectedQuestionBank || ''}
                onChange={(value) => onQuestionBankChange(value.toString())}
                placeholder="请选择要保存到的题库"
                className="w-full"
                disabled={isSaving}
              />
            </div>

            {/* 提示信息 */}
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start space-x-2">
                <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
                <div className="text-sm text-yellow-700">
                  <p className="font-medium">保存说明：</p>
                  <p>• 题目将保存到选中的题库中</p>
                  <p>• 保存后可在题库管理页面查看</p>
                  <p>• 保存过程中请勿关闭页面</p>
                </div>
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="flex items-center justify-end space-x-3 pt-4">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={isSaving}
              >
                取消
              </Button>
              <Button
                onClick={handleSave}
                disabled={!selectedQuestionBank || isSaving}
                className="flex items-center space-x-1 bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700"
              >
                <Database className="h-4 w-4" />
                <span>{isSaving ? '保存中...' : '确认保存'}</span>
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default QuestionSavePanel; 