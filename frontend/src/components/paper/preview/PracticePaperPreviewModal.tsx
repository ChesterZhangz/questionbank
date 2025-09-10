import React from 'react';
import { motion } from 'framer-motion';
import { X, BookOpen, Play, FileText, Clock, Users, Tag } from 'lucide-react';
import Button from '../../ui/Button';
import LaTeXPreview from '../../editor/preview/LaTeXPreview';

interface PracticePaper {
  _id: string;
  name: string;
  type: 'practice';
  tags: string[];
  sections: Array<{
    title: string;
    items: Array<{ 
      question: {
        _id: string;
        type: string;
        content: {
          stem: string;
          options?: Array<{ text: string; isCorrect: boolean }>;
          answer: string;
        };
        category?: string[];
        tags?: string[];
        difficulty?: number;
      };
    }>;
  }>;
  bank: {
    _id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
  owner: {
    username: string;
  };
}

interface PracticePaperPreviewModalProps {
  paper: PracticePaper | null;
  isOpen: boolean;
  onClose: () => void;
  onStartPractice: (paper: PracticePaper) => void;
}

const PracticePaperPreviewModal: React.FC<PracticePaperPreviewModalProps> = ({
  paper,
  isOpen,
  onClose,
  onStartPractice
}) => {
  if (!paper) return null;

  // 计算总题数
  const totalQuestions = paper.sections.reduce((total, section) => total + section.items.length, 0);
  
  // 计算部分数
  const sectionCount = paper.sections.length;

  const getQuestionTypeText = (type: string) => {
    const typeMap: { [key: string]: string } = {
      'choice': '选择题',
      'multiple-choice': '多选题',
      'fill': '填空题',
      'solution': '解答题'
    };
    return typeMap[type] || type;
  };

  const getQuestionTypeColor = (type: string) => {
    const colorMap: { [key: string]: string } = {
      'choice': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
      'multiple-choice': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
      'fill': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
      'solution': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300'
    };
    return colorMap[type] || 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300';
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: isOpen ? 1 : 0 }}
      exit={{ opacity: 0 }}
      className={`fixed inset-0 z-50 ${isOpen ? 'block' : 'hidden'}`}
    >
      {/* 背景遮罩 */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* 弹窗内容 */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: isOpen ? 1 : 0, scale: isOpen ? 1 : 0.95, y: isOpen ? 0 : 20 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="absolute inset-4 flex items-center justify-center p-4"
      >
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
          {/* 头部 */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <BookOpen className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {paper.name}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  试卷集: {paper.bank.name}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* 内容区域 */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            {/* 基本信息 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-1">
                  <FileText className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">部分数</span>
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {sectionCount}
                </div>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-1">
                  <Play className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">总题数</span>
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {totalQuestions}
                </div>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-1">
                  <Clock className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">创建时间</span>
                </div>
                <div className="text-sm text-gray-900 dark:text-white">
                  {new Date(paper.createdAt).toLocaleDateString()}
                </div>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-1">
                  <Users className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">创建者</span>
                </div>
                <div className="text-sm text-gray-900 dark:text-white">
                  {paper.owner.username}
                </div>
              </div>
            </div>

            {/* 标签 */}
            {paper.tags && paper.tags.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                  <Tag className="w-4 h-4 mr-1" />
                  标签
                </h3>
                <div className="flex flex-wrap gap-2">
                  {paper.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 text-sm bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* 题目预览 */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                题目预览
              </h3>
              <div className="space-y-6">
                {paper.sections.map((section, sectionIndex) => (
                  <div key={sectionIndex} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <h4 className="text-md font-medium text-gray-800 dark:text-gray-200 mb-3">
                      {section.title} ({section.items.length}道题)
                    </h4>
                    <div className="space-y-4">
                      {section.items.slice(0, 2).map((item, questionIndex) => {
                        // 安全检查：确保 question 存在
                        if (!item.question) {
                          return (
                            <div key={questionIndex} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                              <div className="text-gray-500 dark:text-gray-400 text-sm">
                                题目数据不完整
                              </div>
                            </div>
                          );
                        }

                        return (
                          <div key={questionIndex} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                            <div className="flex items-start space-x-3">
                              <span className="flex-shrink-0 w-6 h-6 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full flex items-center justify-center text-sm font-medium">
                                {questionIndex + 1}
                              </span>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center space-x-2 mb-2">
                                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getQuestionTypeColor(item.question.type)}`}>
                                    {getQuestionTypeText(item.question.type)}
                                  </span>
                                  {item.question.difficulty && (
                                    <div className="flex items-center space-x-1">
                                      {[...Array(5)].map((_, i) => (
                                        <div
                                          key={i}
                                          className={`w-2 h-2 rounded-full ${
                                            i < item.question.difficulty! 
                                              ? 'bg-yellow-400' 
                                              : 'bg-gray-300 dark:bg-gray-600'
                                          }`}
                                        />
                                      ))}
                                    </div>
                                  )}
                                </div>
                                <div className="text-gray-800 dark:text-gray-200">
                                  <LaTeXPreview
                                    content={item.question.content?.stem || '题目内容加载中...'}
                                    config={{
                                      mode: 'full'
                                    }}
                                  />
                                </div>
                                {item.question.content?.options && (
                                  <div className="mt-2 space-y-1">
                                    {item.question.content.options.map((option, optionIndex) => (
                                      <div key={optionIndex} className="text-sm text-gray-600 dark:text-gray-400">
                                        {String.fromCharCode(65 + optionIndex)}. {option.text}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      {section.items.length > 2 && (
                        <div className="text-center py-2">
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            还有 {section.items.length - 2} 道题...
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 底部操作 */}
          <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
            <div className="text-sm text-gray-600 dark:text-gray-300">
              共 {sectionCount} 个部分，{totalQuestions} 道题目
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                onClick={onClose}
              >
                关闭
              </Button>
              <Button
                onClick={() => onStartPractice(paper)}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Play className="w-4 h-4 mr-2" />
                开始练习
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default PracticePaperPreviewModal;
