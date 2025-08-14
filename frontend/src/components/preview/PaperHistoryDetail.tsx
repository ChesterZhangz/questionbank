import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  TrendingUp,
  BarChart3,
  Database,
  Download,
  Share2,
  FileType,
  CheckCircle2,
  Clock2
} from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';

interface Question {
  id: string;
  documentId: string;
  title: string;
  content: string;
  type: 'choice' | 'fill' | 'solution';
  options?: string[];
  blanks?: number[];
  source?: string;
  confidence?: number;
  difficulty?: number;
  tags?: string[];
  category?: string[];
  isSelected: boolean;
  isEditing: boolean;
}

interface DocumentItem {
  id: string;
  fileName: string;
  fileSize: number;
  fileType: 'pdf' | 'docx' | 'tex';
  status: 'uploading' | 'processing' | 'completed' | 'failed' | 'waiting' | 'paused' | 'retrying' | 'cancelled';
  uploadTime: Date;
  processTime?: Date;
  questions: Question[];
  originalContent?: string;
  processedContent?: string;
  confidence?: number;
  error?: string;
  uploadProgress?: number;
  processingProgress?: number;
  currentStep?: string;
  estimatedTime?: number;
  startTime?: Date;
  lastUpdateTime?: Date;
  processingSteps?: {
    step: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    progress: number;
    startTime?: Date;
    endTime?: Date;
    error?: string;
  }[];
  retryCount?: number;
  maxRetries?: number;
  retryDelay?: number;
}

interface PaperHistoryDetailProps {
  isOpen: boolean;
  onClose: () => void;
  historyDoc: DocumentItem | null;
}

const PaperHistoryDetail: React.FC<PaperHistoryDetailProps> = ({ 
  isOpen, 
  onClose, 
  historyDoc 
}) => {
  if (!historyDoc) return null;

  const getQuestionTypeText = (type: string) => {
    switch (type) {
      case 'choice': return '选择题';
      case 'fill': return '填空题';
      case 'solution': return '解答题';
      default: return '未知类型';
    }
  };

  const getQuestionTypeColor = (type: string) => {
    switch (type) {
      case 'choice': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-700';
      case 'fill': return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 border-green-200 dark:border-green-700';
      case 'solution': return 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 border-purple-200 dark:border-purple-700';
      default: return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-600';
    }
  };

  const getFileTypeIcon = (type: string) => {
    switch (type) {
      case 'pdf': return <FileType className="h-6 w-6 text-red-500 dark:text-red-400" />;
      case 'docx': return <FileType className="h-6 w-6 text-blue-500 dark:text-blue-400" />;
      case 'tex': return <FileType className="h-6 w-6 text-green-500 dark:text-green-400" />;
      default: return <FileType className="h-6 w-6 text-gray-500 dark:text-gray-400" />;
    }
  };

  const getFileTypeColor = (type: string) => {
    switch (type) {
      case 'pdf': return 'text-red-500 dark:text-red-400';
      case 'docx': return 'text-blue-500 dark:text-blue-400';
      case 'tex': return 'text-green-500 dark:text-green-400';
      default: return 'text-gray-500 dark:text-gray-400';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 dark:text-green-400';
      case 'failed': return 'text-red-600 dark:text-red-400';
      case 'processing': return 'text-blue-600 dark:text-blue-400';
      case 'uploading': return 'text-yellow-600 dark:text-yellow-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return '处理完成';
      case 'failed': return '处理失败';
      case 'processing': return '处理中';
      case 'uploading': return '上传中';
      case 'waiting': return '等待中';
      case 'paused': return '已暂停';
      case 'retrying': return '重试中';
      default: return '未知状态';
    }
  };

  const questionTypeStats = {
    choice: historyDoc.questions.filter(q => q.type === 'choice').length,
    fill: historyDoc.questions.filter(q => q.type === 'fill').length,
    solution: historyDoc.questions.filter(q => q.type === 'solution').length
  };

  const totalQuestions = historyDoc.questions.length;
  const avgConfidence = historyDoc.confidence ? (historyDoc.confidence * 100).toFixed(1) : '0.0';

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 dark:bg-black/70 z-[9999] flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', duration: 0.3 }}
            className="w-full max-w-4xl max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <Card className="bg-white dark:bg-gray-800 shadow-2xl border-0">
              {/* 头部 */}
              <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <FileText className="h-6 w-6" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold">文档处理详情</h2>
                      <p className="text-sm opacity-90">查看上传文档的详细处理信息</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onClose}
                    className="text-white border-white hover:bg-white/20"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* 内容区域 */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* 左侧：基本信息 */}
                  <div className="lg:col-span-1 space-y-6">
                    {/* 文件信息卡片 */}
                    <Card className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-700">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="text-2xl">{getFileTypeIcon(historyDoc.fileType)}</div>
                        <div>
                          <h3 className="font-semibold text-blue-900 dark:text-blue-100">文件信息</h3>
                          <p className="text-sm text-blue-700 dark:text-blue-300">Document Information</p>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-blue-700 dark:text-blue-300">文件名</span>
                          <span className="text-sm font-medium text-blue-900 dark:text-blue-100 truncate max-w-32" title={historyDoc.fileName}>
                            {historyDoc.fileName}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-blue-700 dark:text-blue-300">文件类型</span>
                          <span className={`text-sm font-medium ${getFileTypeColor(historyDoc.fileType)}`}>
                            {historyDoc.fileType.toUpperCase()}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-blue-700 dark:text-blue-300">文件大小</span>
                          <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                            {formatFileSize(historyDoc.fileSize)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-blue-700 dark:text-blue-300">处理状态</span>
                          <span className={`text-sm font-medium ${getStatusColor(historyDoc.status)}`}>
                            {getStatusText(historyDoc.status)}
                          </span>
                        </div>
                      </div>
                    </Card>

                    {/* 时间信息卡片 */}
                    <Card className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-700">
                      <div className="flex items-center space-x-3 mb-4">
                        <Clock className="h-5 w-5 text-green-600 dark:text-green-400" />
                        <div>
                          <h3 className="font-semibold text-green-900 dark:text-green-100">时间信息</h3>
                          <p className="text-sm text-green-700 dark:text-green-300">Time Information</p>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-green-700 dark:text-green-300">上传时间</span>
                          <span className="text-sm font-medium text-green-900 dark:text-green-100">
                            {new Date(historyDoc.uploadTime).toLocaleString()}
                          </span>
                        </div>
                        {historyDoc.processTime && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-green-700 dark:text-green-300">处理完成</span>
                            <span className="text-sm font-medium text-green-900 dark:text-green-100">
                              {new Date(historyDoc.processTime).toLocaleString()}
                            </span>
                          </div>
                        )}
                        {historyDoc.processTime && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-green-700 dark:text-green-300">处理耗时</span>
                            <span className="text-sm font-medium text-green-900 dark:text-green-100">
                              {Math.round((new Date(historyDoc.processTime).getTime() - new Date(historyDoc.uploadTime).getTime()) / 1000)}秒
                            </span>
                          </div>
                        )}
                      </div>
                    </Card>
                  </div>

                  {/* 右侧：统计信息 */}
                  <div className="lg:col-span-2 space-y-6">
                    {/* 处理结果概览 */}
                    <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-700">
                      <div className="flex items-center space-x-3 mb-6">
                        <BarChart3 className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                        <div>
                          <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100">处理结果概览</h3>
                          <p className="text-sm text-purple-700 dark:text-purple-300">Processing Results Overview</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-3 bg-white dark:bg-gray-700 rounded-lg border border-purple-200 dark:border-purple-600">
                          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{totalQuestions}</div>
                          <div className="text-sm text-purple-700 dark:text-purple-300">总题目数</div>
                        </div>
                        <div className="text-center p-3 bg-white dark:bg-gray-700 rounded-lg border border-purple-200 dark:border-purple-600">
                          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{avgConfidence}%</div>
                          <div className="text-sm text-purple-700 dark:text-purple-300">平均置信度</div>
                        </div>
                        <div className="text-center p-3 bg-white dark:bg-gray-700 rounded-lg border border-purple-200 dark:border-purple-600">
                          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{historyDoc.fileType.toUpperCase()}</div>
                          <div className="text-sm text-purple-700 dark:text-purple-300">文件格式</div>
                        </div>
                        <div className="text-center p-3 bg-white dark:bg-gray-700 rounded-lg border border-purple-200 dark:border-purple-600">
                          <div className="flex justify-center mb-2">
                            {historyDoc.status === 'completed' ? (
                              <CheckCircle2 className="h-8 w-8 text-green-500 dark:text-green-400" />
                            ) : (
                              <Clock2 className="h-8 w-8 text-blue-500 dark:text-blue-400" />
                            )}
                          </div>
                          <div className="text-sm font-medium text-purple-700 dark:text-purple-300">处理状态</div>
                        </div>
                      </div>
                    </Card>

                    {/* 题目类型分布 */}
                    <Card className="p-6 bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 border border-orange-200 dark:border-orange-700">
                      <div className="flex items-center space-x-3 mb-6">
                        <TrendingUp className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                        <div>
                          <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-100">题目类型分布</h3>
                          <p className="text-sm text-orange-700 dark:text-orange-300">Question Type Distribution</p>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        {Object.entries(questionTypeStats).map(([type, count]) => (
                          <div key={type} className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getQuestionTypeColor(type)}`}>
                                {getQuestionTypeText(type)}
                              </span>
                              <span className="text-sm text-orange-700 dark:text-orange-300">
                                {count} 道题目
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="w-24 bg-orange-200 dark:bg-orange-700 rounded-full h-2">
                                <div 
                                  className="bg-orange-500 dark:bg-orange-400 h-2 rounded-full transition-all duration-500"
                                  style={{ width: `${totalQuestions > 0 ? (count / totalQuestions) * 100 : 0}%` }}
                                />
                              </div>
                              <span className="text-sm font-medium text-orange-900 dark:text-orange-100 w-12 text-right">
                                {totalQuestions > 0 ? Math.round((count / totalQuestions) * 100) : 0}%
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </Card>
                  </div>
                </div>

                {/* 处理步骤详情 - 单独成一栏 */}
                {historyDoc.processingSteps && historyDoc.processingSteps.length > 0 && (
                  <div className="mt-6">
                    <Card className="p-6 bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 border border-indigo-200 dark:border-indigo-700">
                      <div className="flex items-center space-x-3 mb-6">
                        <Database className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                        <div>
                          <h3 className="text-lg font-semibold text-indigo-900 dark:text-indigo-100">处理步骤详情</h3>
                          <p className="text-sm text-indigo-700 dark:text-indigo-300">Processing Steps Details</p>
                        </div>
                      </div>
                      
                      {/* 图形化的步骤流程 */}
                      <div className="relative">
                        {/* 连接线 */}
                        <div className="absolute top-8 left-0 right-0 h-0.5 bg-indigo-200 dark:bg-indigo-700"></div>
                        
                        {/* 步骤节点 */}
                        <div className="flex items-center justify-between relative z-10">
                          {historyDoc.processingSteps.map((step, index) => (
                            <div key={index} className="flex flex-col items-center space-y-3">
                              {/* 步骤状态图标 */}
                              <div className={`w-16 h-16 rounded-full flex items-center justify-center border-4 ${
                                step.status === 'completed' ? 'bg-green-100 dark:bg-green-900/30 border-green-500 dark:border-green-400' :
                                step.status === 'processing' ? 'bg-blue-100 dark:bg-blue-900/30 border-blue-500 dark:border-blue-400' :
                                step.status === 'failed' ? 'bg-red-100 dark:bg-red-900/30 border-red-500 dark:border-red-400' :
                                'bg-gray-100 dark:bg-gray-700 border-gray-400 dark:border-gray-500'
                              }`}>
                                {step.status === 'completed' ? (
                                  <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                                ) : step.status === 'processing' ? (
                                  <div className="w-8 h-8 border-4 border-blue-600 dark:border-blue-400 border-t-transparent rounded-full animate-spin" />
                                ) : step.status === 'failed' ? (
                                  <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
                                ) : (
                                  <div className="w-8 h-8 bg-gray-400 dark:bg-gray-500 rounded-full" />
                                )}
                              </div>
                              
                              {/* 步骤名称 */}
                              <div className="text-center max-w-24">
                                <div className="text-sm font-medium text-indigo-900 dark:text-indigo-100 mb-1">
                                  {step.step}
                                </div>
                                
                                {/* 进度条（如果正在处理） */}
                                {step.status === 'processing' && step.progress !== undefined && (
                                  <div className="w-full bg-indigo-200 dark:bg-indigo-700 rounded-full h-1.5">
                                    <div 
                                      className="bg-indigo-500 dark:bg-indigo-400 h-1.5 rounded-full transition-all duration-300"
                                      style={{ width: `${step.progress}%` }}
                                    />
                                  </div>
                                )}
                                
                                {/* 状态标签 */}
                                <div className={`text-xs px-2 py-1 rounded-full mt-1 ${
                                  step.status === 'completed' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' :
                                  step.status === 'processing' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' :
                                  step.status === 'failed' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' :
                                  'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                                }`}>
                                  {step.status === 'completed' ? '完成' :
                                   step.status === 'processing' ? '处理中' :
                                   step.status === 'failed' ? '失败' : '等待'}
                                </div>
                                
                                {/* 错误信息 */}
                                {step.error && (
                                  <div className="text-xs text-red-600 dark:text-red-400 mt-1 max-w-24 break-words">
                                    {step.error}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </Card>
                  </div>
                )}
              </div>

              {/* 底部操作按钮 */}
              <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    文档ID: {historyDoc.id}
                  </div>
                  <div className="flex items-center space-x-3">
                    <Button
                      variant="outline"
                      onClick={() => {
                        // 这里可以添加导出功能
                        console.log('导出文档:', historyDoc.fileName);
                      }}
                      className="text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      导出
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        // 这里可以添加分享功能
                        console.log('分享文档:', historyDoc.fileName);
                      }}
                      className="text-green-600 dark:text-green-400 border-green-200 dark:border-green-700 hover:bg-green-50 dark:hover:bg-green-900/20"
                    >
                      <Share2 className="h-4 w-4 mr-2" />
                      分享
                    </Button>
                    <Button
                      onClick={onClose}
                      className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white"
                    >
                      关闭
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PaperHistoryDetail;