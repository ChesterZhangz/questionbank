import React, { useEffect, useState } from 'react';
import { X, AlertTriangle, CheckCircle, TrendingUp, ChevronLeft, ChevronRight } from 'lucide-react';
import type { SimilarityResult } from '../../types';
import Button from '../ui/Button';
import Card from '../ui/Card';
import { renderContent } from '../../lib/latex/utils/renderContent';

interface SimilarityDetectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  similarQuestions: SimilarityResult[];
  onContinue: () => void;
  onCancel: () => void;
  questionData: any;
  detectedSimilarQuestions?: Map<string, SimilarityResult[]>;
  onNextQuestion?: () => void;
  onPrevQuestion?: () => void;
  currentQuestionIndex?: number;
  totalQuestions?: number;
}

const SimilarityDetectionModal: React.FC<SimilarityDetectionModalProps> = ({
  isOpen,
  onClose,
  similarQuestions,
  onContinue,
  onCancel,
  questionData,
  onNextQuestion,
  onPrevQuestion,
  currentQuestionIndex = 0,
  totalQuestions = 0
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // 阻止背景页面滚动
      document.body.style.overflow = 'hidden';
      
      setIsLoading(true);
      // 延迟显示动画，让内容先加载
      const timer = setTimeout(() => {
        setIsVisible(true);
        setIsLoading(false);
      }, 100);
      return () => clearTimeout(timer);
    } else {
      // 关闭时立即恢复页面滚动
      document.body.style.overflow = 'unset';
      
      // 关闭时先隐藏内容，然后延迟关闭模态框
      setIsVisible(false);
      const timer = setTimeout(() => {
        // 这里可以添加额外的清理逻辑
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // 处理关闭
  const handleClose = () => {
    setIsVisible(false);
    // 立即恢复页面滚动
    document.body.style.overflow = 'unset';
    setTimeout(() => {
      onClose();
    }, 300);
  };

  if (!isOpen) return null;

  const getSimilarityLevel = (score: number) => {
    if (score >= 0.9) return { level: '极高', color: 'text-red-600', bgColor: 'bg-red-50', borderColor: 'border-red-200' };
    if (score >= 0.8) return { level: '高', color: 'text-orange-600', bgColor: 'bg-orange-50', borderColor: 'border-orange-200' };
    if (score >= 0.6) return { level: '中等', color: 'text-yellow-600', bgColor: 'bg-yellow-50', borderColor: 'border-yellow-200' };
    return { level: '低', color: 'text-green-600', bgColor: 'bg-green-50', borderColor: 'border-green-200' };
  };

  const getQuestionTypeText = (type: string) => {
    const typeMap: Record<string, string> = {
      'choice': '单选题',
      'multiple-choice': '多选题',
      'fill': '填空题',
      'solution': '解答题'
    };
    return typeMap[type] || type;
  };

  const getQuestionTypeColor = (type: string) => {
    const colorMap: Record<string, string> = {
      'choice': 'bg-blue-100 text-blue-800',
      'multiple-choice': 'bg-purple-100 text-purple-800',
      'fill': 'bg-green-100 text-green-800',
      'solution': 'bg-orange-100 text-orange-800'
    };
    return colorMap[type] || 'bg-gray-100 text-gray-800';
  };

  const getDifficultyStars = (difficulty: number) => {
    return '★'.repeat(difficulty) + '☆'.repeat(5 - difficulty);
  };

  return (
    <div 
      className={`fixed inset-0 bg-black transition-opacity duration-300 flex items-center justify-center z-50 p-4 modal-backdrop ${
        isVisible ? 'bg-opacity-50' : 'bg-opacity-0'
      }`}
      onClick={handleClose}
    >
      <div 
        className={`bg-white dark:bg-gray-800 rounded-lg shadow-xl dark:shadow-gray-900/50 max-w-4xl w-full max-h-[90vh] overflow-y-auto transition-all duration-300 transform modal-content ${
          isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
        onClick={(e) => e.stopPropagation()}
        onWheel={(e) => e.stopPropagation()}
        style={{ 
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* 加载状态 */}
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 dark:border-blue-400"></div>
            <span className="ml-3 text-gray-600 dark:text-gray-300">加载相似题目...</span>
          </div>
        ) : (
          <>
            {/* 头部 */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="w-6 h-6 text-orange-500 dark:text-orange-400" />
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">发现相似题目</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    检测到 {similarQuestions.length} 个相似题目，建议检查是否重复
                  </p>
                  {totalQuestions > 1 && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      第 {currentQuestionIndex + 1} 题，共 {totalQuestions} 题有相似题目
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {/* 翻页按钮 */}
                {totalQuestions > 1 && (
                  <div className="flex items-center space-x-1">
                                    <button
                  onClick={onPrevQuestion}
                  disabled={currentQuestionIndex === 0}
                  className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="上一题"
                >
                  <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                </button>
                <span className="text-sm text-gray-600 dark:text-gray-300 px-2">
                  {currentQuestionIndex + 1} / {totalQuestions}
                </span>
                <button
                  onClick={onNextQuestion}
                  disabled={currentQuestionIndex === totalQuestions - 1}
                  className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="下一题"
                >
                  <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                </button>
                  </div>
                )}
                <button
                  onClick={handleClose}
                  className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* 内容 */}
            <div 
              className="flex-1 overflow-y-auto p-6 min-h-0"
              onWheel={(e) => e.stopPropagation()}
            >
              {/* 当前题目预览 */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-3">当前题目</h3>
                <Card className="p-4 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded text-sm font-medium ${getQuestionTypeColor(questionData.type)}`}>
                        {getQuestionTypeText(questionData.type)}
                      </span>
                      <span className="text-yellow-500 dark:text-yellow-400 text-sm">
                        {getDifficultyStars(questionData.difficulty)}
                      </span>
                    </div>
                    <div 
                      className="text-sm text-gray-700 dark:text-gray-200 line-clamp-3 prose prose-sm max-w-none dark:prose-invert"
                      dangerouslySetInnerHTML={{ 
                        __html: renderContent(questionData.content.stem)
                      }}
                    />
                  </div>
                </Card>
              </div>

              {/* 相似题目列表 */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-3">相似题目列表</h3>
                <div className="space-y-4">
                  {similarQuestions.map((result, index) => {
                    const similarityLevel = getSimilarityLevel(result.similarityScore);
                    return (
                      <Card 
                        key={result.question._id} 
                        className={`p-4 ${similarityLevel.bgColor} border ${similarityLevel.borderColor} transition-all duration-300 transform animate-fade-in-up`}
                        style={{
                          animationDelay: `${index * 100}ms`
                        }}
                      >
                        <div className="space-y-3">
                          {/* 头部信息 */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <span className={`px-2 py-1 rounded text-sm font-medium ${getQuestionTypeColor(result.question.type)}`}>
                                {getQuestionTypeText(result.question.type)}
                              </span>
                              <span className="text-yellow-500 text-sm">
                                {getDifficultyStars(result.question.difficulty)}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className={`flex items-center text-sm font-medium ${similarityLevel.color}`}>
                                <TrendingUp className="w-4 h-4 mr-1" />
                                {Math.round(result.similarityScore * 100)}% ({similarityLevel.level})
                              </span>
                            </div>
                          </div>

                          {/* 题目内容 */}
                          <div className="text-sm text-gray-700 dark:text-gray-200">
                            <div 
                              className="line-clamp-2 mb-2 prose prose-sm max-w-none dark:prose-invert"
                              dangerouslySetInnerHTML={{ 
                                __html: renderContent(result.question.content.stem)
                              }}
                            />
                          </div>



                          {/* 相似原因 */}
                          {result.reasons.length > 0 && (
                            <div className="text-xs text-gray-600 dark:text-gray-400">
                              <div className="font-medium mb-1">相似原因：</div>
                              <div className="flex flex-wrap gap-1">
                                {result.reasons.map((reason, idx) => (
                                  <span key={idx} className="px-2 py-1 bg-gray-100 dark:bg-gray-600 rounded text-xs text-gray-700 dark:text-gray-200">
                                    {reason}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}


                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* 底部操作 */}
            <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 flex-shrink-0">
              <div className="text-sm text-gray-600 dark:text-gray-300">
                <AlertTriangle className="w-4 h-4 inline mr-1" />
                建议仔细检查相似题目，避免创建重复内容
              </div>
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    // 立即恢复页面滚动
                    document.body.style.overflow = 'unset';
                    onCancel();
                  }}
                  className="px-4 py-2"
                >
                  取消创建
                </Button>
                <Button
                  onClick={() => {
                    // 立即恢复页面滚动
                    document.body.style.overflow = 'unset';
                    onContinue();
                  }}
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-700"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  继续创建
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SimilarityDetectionModal; 