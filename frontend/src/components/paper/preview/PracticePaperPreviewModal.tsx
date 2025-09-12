import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, BookOpen, Play, FileText, Clock, Users, Tag, ExternalLink } from 'lucide-react';
import Button from '../../ui/Button';
import LaTeXPreview from '../../editor/preview/LaTeXPreview';
import TikZPreview from '../../tikz/core/TikZPreview';
import { paperAPI } from '../../../services/api';
import { useTranslation } from '../../../hooks/useTranslation';
import './PracticePaperPreviewModal.css';

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
        // 图片和TikZ支持
        images?: Array<{
          id: string;
          url: string;
          filename: string;
          order: number;
          bid?: string;
          format?: string;
          uploadedAt?: Date;
          uploadedBy?: string;
          cosKey?: string;
        }>;
        tikzCodes?: Array<{
          id: string;
          code: string;
          format: 'svg' | 'png';
          order: number;
          bid?: string;
          uploadedAt?: Date;
          uploadedBy?: string;
        }>;
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
    _id: string;
    name: string;
    username?: string;
  };
  overleafEditLink?: string; // Overleaf编辑链接
  overleafLinkAddedBy?: {
    _id: string;
    name: string;
    email: string;
    username: string;
  }; // 添加链接的用户
  overleafLinkAddedAt?: string; // 添加链接的时间
}

interface PracticePaperPreviewModalProps {
  paper: PracticePaper | null;
  isOpen: boolean;
  onClose: () => void;
}

const PracticePaperPreviewModal: React.FC<PracticePaperPreviewModalProps> = ({
  paper,
  isOpen,
  onClose
}) => {
  const { t } = useTranslation();
  const [fullPaper, setFullPaper] = useState<PracticePaper | null>(null);
  const [loading, setLoading] = useState(false);

  // 当paper变化时，获取完整数据
  useEffect(() => {
    const fetchFullPaper = async () => {
      if (!paper || !isOpen) return;
      
      try {
        setLoading(true);
        const response = await paperAPI.getPaper(paper._id);
        if (response.data.success) {
          setFullPaper(response.data.data);
        }
      } catch (error) {
        console.error(t('paper.practicePaperPreviewModal.errors.fetchFailed'), error);
      } finally {
        setLoading(false);
      }
    };

    fetchFullPaper();
  }, [paper, isOpen]);

  if (!paper) return null;

  // 使用完整数据或原始数据
  const displayPaper = fullPaper || paper;

  // 计算总题数
  const totalQuestions = displayPaper.sections.reduce((total, section) => total + section.items.length, 0);
  
  // 计算部分数
  const sectionCount = displayPaper.sections.length;

  const getQuestionTypeText = (type: string) => {
    const typeMap: { [key: string]: string } = {
      'choice': t('paper.practicePaperPreviewModal.questionTypes.choice'),
      'multiple-choice': t('paper.practicePaperPreviewModal.questionTypes.multipleChoice'),
      'fill': t('paper.practicePaperPreviewModal.questionTypes.fill'),
      'solution': t('paper.practicePaperPreviewModal.questionTypes.solution')
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

  const getCategoryArray = (category: any): string[] => {
    if (!category) return [];
    if (Array.isArray(category)) return category;
    if (typeof category === 'string') return [category];
    return [];
  };

  const getDifficultyStars = (difficulty: number) => {
    return '★'.repeat(difficulty) + '☆'.repeat(5 - difficulty);
  };

  const getDifficultyColor = (difficulty: number) => {
    if (difficulty <= 1) return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
    if (difficulty <= 2) return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300';
    if (difficulty <= 3) return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300';
    if (difficulty <= 4) return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
    return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300';
  };

  const getDifficultyText = (difficulty: number) => {
    const texts = [
      t('paper.practicePaperPreviewModal.difficulty.veryEasy'),
      t('paper.practicePaperPreviewModal.difficulty.easy'),
      t('paper.practicePaperPreviewModal.difficulty.medium'),
      t('paper.practicePaperPreviewModal.difficulty.hard'),
      t('paper.practicePaperPreviewModal.difficulty.veryHard')
    ];
    return texts[difficulty - 1] || t('paper.practicePaperPreviewModal.difficulty.unknown');
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
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
          {/* 头部 */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <BookOpen className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <div className="flex items-center space-x-3 mb-1">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {displayPaper.name}
                </h2>
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  {t('paper.practicePaperPreviewModal.labels.practicePaper')}
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {t('paper.practicePaperPreviewModal.labels.paperBank')} {displayPaper.bank.name}
              </p>
              {displayPaper.overleafEditLink && (
                <div className="mt-2">
                  <a
                    href={displayPaper.overleafEditLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4 mr-1" />
                    {t('paper.practicePaperPreviewModal.labels.overleafEditLink')}
                  </a>
                </div>
              )}
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
          <div className="p-6 overflow-y-auto flex-1">
            {/* 基本信息 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-1">
                  <FileText className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('paper.practicePaperPreviewModal.labels.sectionCount')}</span>
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {sectionCount}
                </div>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-1">
                  <Play className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('paper.practicePaperPreviewModal.labels.totalQuestions')}</span>
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {totalQuestions}
                </div>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-1">
                  <Clock className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('paper.practicePaperPreviewModal.labels.createdAt')}</span>
                </div>
                <div className="text-sm text-gray-900 dark:text-white">
                  {new Date(displayPaper.createdAt).toLocaleDateString()}
                </div>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-1">
                  <Users className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('paper.practicePaperPreviewModal.labels.creator')}</span>
                </div>
                <div className="text-sm text-gray-900 dark:text-white">
                  {displayPaper.owner.name || displayPaper.owner.username || t('paper.practicePaperCard.unknownUser')}
                </div>
              </div>
            </div>

            {/* 标签 */}
            {displayPaper.tags && displayPaper.tags.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                  <Tag className="w-4 h-4 mr-1" />
                  {t('paper.practicePaperPreviewModal.labels.tags')}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {displayPaper.tags.map((tag, idx) => (
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
                {t('paper.practicePaperPreviewModal.labels.questionPreview')}
              </h3>
              {loading ? (
                <div className="text-center py-8">
                  <div className="text-gray-500 dark:text-gray-400">{t('paper.practicePaperPreviewModal.labels.loadingQuestions')}</div>
                </div>
              ) : (
                <div className="space-y-6">
                  {displayPaper.sections.map((section, sectionIndex) => (
                    <div 
                      key={sectionIndex} 
                      className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 mb-6"
                    >
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                            {section.title}
                          </h4>
                          <span className="px-3 py-1 text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full">
                            {section.items.length} 道题
                          </span>
                        </div>
                      
                        <div className="space-y-6">
                          {section.items.map((item, questionIndex) => {
                            // 安全检查：确保 question 存在
                            if (!item.question) {
                              return (
                                <div key={questionIndex} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6">
                                  <div className="text-gray-500 dark:text-gray-400 text-sm">
                                    题目数据不完整
                                  </div>
                                </div>
                              );
                            }

                            // 处理分类和标签数据
                            const categories = getCategoryArray(item.question.category);
                            const tags = item.question.tags || [];
                            const allTags = [...categories, ...tags];

                            return (
                              <motion.div 
                                key={questionIndex} 
                                className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 mb-4"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.2, delay: questionIndex * 0.02 }}
                              >
                                <div className="flex items-start space-x-4">
                                  <span className="flex-shrink-0 w-6 h-6 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded flex items-center justify-center text-sm font-medium">
                                    {questionIndex + 1}
                                  </span>
                                  <div className="flex-1 min-w-0 w-full">
                                    {/* 题目类型和难度信息 */}
                                    <div className="flex items-center justify-between mb-4">
                                      <div className="flex items-center space-x-3">
                                        <span className={`px-3 py-1 text-sm font-medium rounded-full ${getQuestionTypeColor(item.question.type)}`}>
                                          {getQuestionTypeText(item.question.type)}
                                        </span>
                                        {item.question.difficulty && (
                                          <div className="flex items-center space-x-2">
                                            <span className="difficulty-stars-enhanced text-sm">
                                              {getDifficultyStars(item.question.difficulty)}
                                            </span>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(item.question.difficulty)}`}>
                                              {getDifficultyText(item.question.difficulty)}
                                            </span>
                                          </div>
                                        )}
                                      </div>
                                    </div>

                                    {/* 题目标签 */}
                                    {allTags.length > 0 && (
                                      <div className="mb-4">
                                        <div className="flex flex-wrap gap-2">
                                          {allTags.map((tag, tagIndex) => {
                                            // 判断标签类型：前几个是小题型，后面是知识点
                                            const isCategory = tagIndex < categories.length;
                                            const tagClass = isCategory ? 'category-tag' : 'knowledge-tag';
                                            
                                            return (
                                              <span
                                                key={`tag-${tagIndex}`}
                                                className={`${tagClass} inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200`}
                                              >
                                                {tag}
                                              </span>
                                            );
                                          })}
                                        </div>
                                      </div>
                                    )}
                                    
                                    {/* 题目内容 */}
                                    <div className="text-gray-800 dark:text-gray-200 mb-4 question-view-latex-content">
                                      <LaTeXPreview
                                        content={item.question.content?.stem || '题目内容加载中...'}
                                        config={{
                                          mode: 'full'
                                        }}
                                        fullWidth={true}
                                        maxWidth="max-w-none"
                                      />
                                    </div>
                                    
                                    {/* 题目图片和TikZ显示 */}
                                    {((item.question.images && item.question.images.length > 0) || (item.question.tikzCodes && item.question.tikzCodes.length > 0)) && (
                                      <div className="mb-4">
                                        <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                          图形与图片
                                          <span className="ml-2 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs">
                                            ({((item.question.images?.length || 0) + (item.question.tikzCodes?.length || 0))} 个)
                                          </span>
                                        </div>
                                        
                                        {/* 合并图片和图形数据 */}
                                        <div className="flex space-x-3 overflow-x-auto pb-2">
                                          {[
                                            ...(item.question.images || []).map(item => ({ type: 'image' as const, data: item })),
                                            ...(item.question.tikzCodes || []).map(item => ({ type: 'tikz' as const, data: item }))
                                          ].sort((a, b) => {
                                            // 按order字段排序
                                            const orderA = a.data.order || 0;
                                            const orderB = b.data.order || 0;
                                            return orderA - orderB;
                                          }).map((item) => (
                                            <div key={`${item.type}-${item.data.id}`} className="flex-shrink-0 group relative">
                                              {item.type === 'image' ? (
                                                // 图片显示
                                                <div className="w-24 h-20 rounded-lg border border-gray-200 dark:border-gray-600 overflow-hidden bg-gray-50 dark:bg-gray-700 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer">
                                                  <img
                                                    src={item.data.url}
                                                    alt={item.data.filename}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                                  />
                                                  <div className="absolute top-1 left-1 bg-blue-500 text-white text-xs px-1 py-0.5 rounded">
                                                    图片
                                                  </div>
                                                </div>
                                              ) : (
                                                // TikZ显示
                                                <div className="w-24 h-20 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden cursor-pointer">
                                                  <TikZPreview
                                                    code={item.data.code}
                                                    format={item.data.format as 'svg' | 'png'}
                                                    className="w-full h-full"
                                                  />
                                                  <div className="absolute top-1 left-1 bg-green-500 text-white text-xs px-1 py-0.5 rounded">
                                                    TikZ
                                                  </div>
                                                </div>
                                              )}
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                    
                                    {/* 选择题选项 */}
                                    {item.question.content?.options && item.question.content.options.length > 0 && (
                                      <div className="mt-4">
                                        <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                          选项
                                        </div>
                                        <div className="space-y-2">
                                          {item.question.content.options.map((option, optionIndex) => (
                                            <div 
                                              key={optionIndex} 
                                              className="flex items-center p-3 rounded-lg border bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-600"
                                            >
                                              <span className="w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium mr-3 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300">
                                                {String.fromCharCode(65 + optionIndex)}
                                              </span>
                                              <div className="flex-1 text-gray-800 dark:text-gray-200">
                                                <LaTeXPreview
                                                  content={option.text}
                                                  config={{ mode: 'preview' }}
                                                />
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </motion.div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 底部操作 */}
          <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 mt-6">
            <div className="text-sm text-gray-600 dark:text-gray-300">
              {t('paper.practicePaperPreviewModal.labels.summary', { sectionCount, totalQuestions })}
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                onClick={onClose}
              >
                {t('paper.practicePaperPreviewModal.labels.close')}
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default PracticePaperPreviewModal;
