import React from 'react';
import { motion } from 'framer-motion';
import Button from '../ui/Button';
import { ArrowLeft, FileText, Target, Save } from 'lucide-react';

interface QuestionPreviewHeaderProps {
  totalQuestions: number;
  selectedCount: number;
  onBack: () => void;
  onOpenDraftManager: () => void;
  isDraftMode?: boolean;
}

const QuestionPreviewHeader: React.FC<QuestionPreviewHeaderProps> = ({
  totalQuestions,
  selectedCount,
  onBack,
  onOpenDraftManager,
  isDraftMode = false
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            onClick={onBack}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>返回批量上传</span>
          </Button>
          
          <div className="flex items-center space-x-2">
            <FileText className="h-6 w-6 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-300">题目预览与编辑</h1>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            onClick={onOpenDraftManager}
            className={`flex items-center space-x-2 ${
              isDraftMode ? 'bg-blue-50 border-blue-300 text-blue-700' : ''
            }`}
          >
            <Save className="h-4 w-4" />
            <span>草稿管理</span>
            {isDraftMode && (
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            )}
          </Button>
          
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Target className="h-4 w-4 " />
            <span className='dark:text-gray-30'>总题目: {totalQuestions}</span>
          </div> 
          
          {selectedCount > 0 && (
            <div className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
              已选择 {selectedCount} 题
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default QuestionPreviewHeader; 