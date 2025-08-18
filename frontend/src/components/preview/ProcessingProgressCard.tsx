import React from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Loader2, 
  Play, 
  Trash2,
  RotateCcw,
} from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';

interface ProcessingStep {
  step: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  startTime?: Date;
  endTime?: Date;
  error?: string;
}

interface ProcessingProgressCardProps {
  document: {
    id: string;
    fileName: string;
    fileType: string;
    status: string;
    processingSteps?: ProcessingStep[];
    processingProgress?: number;
    estimatedTime?: number;
    startTime?: Date;
    error?: string;
    retryCount?: number;
    maxRetries?: number;
  };
  onDelete?: (docId: string) => void;
  onResume?: (docId: string) => void;
  onRetry?: (docId: string) => void;
}

const ProcessingProgressCard: React.FC<ProcessingProgressCardProps> = ({
  document,
  onDelete,
  onResume,
  onRetry
}) => {
  const formatTime = (seconds: number): string => {
    if (seconds < 60) return `${Math.round(seconds)}秒`;
    if (seconds < 3600) return `${Math.round(seconds / 60)}分钟`;
    return `${Math.round(seconds / 3600)}小时${Math.round((seconds % 3600) / 60)}分钟`;
  };

  const getStepIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'processing':
        return <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const isProcessing = document.status === 'processing' || document.status === 'uploading';
  const isPaused = document.status === 'paused';
  const isFailed = document.status === 'failed';
  const canRetry = isFailed && (document.retryCount || 0) < (document.maxRetries || 3);

  return (
    <Card className="p-4 hover:shadow-lg transition-shadow bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
      <div className="space-y-4">
        {/* 文档头部信息 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <div className={`p-2 rounded-lg flex-shrink-0 ${
              document.fileType === 'pdf' ? 'bg-red-100 dark:bg-red-900/30' : 
              document.fileType === 'tex' ? 'bg-green-100 dark:bg-green-900/30' : 'bg-blue-100 dark:bg-blue-900/30'
            }`}>
              <span className={`text-sm font-medium ${
                document.fileType === 'pdf' ? 'text-red-800 dark:text-red-200' : 
                document.fileType === 'tex' ? 'text-green-800 dark:text-green-200' : 'text-blue-800 dark:text-blue-200'
              }`}>
                {document.fileType.toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="group relative">
                <p className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate" title={document.fileName}>
                  {document.fileName}
                </p>
                {/* 悬停显示完整文件名 */}
                  <div className="absolute bottom-full left-0 mb-2 px-3 py-2 bg-gray-900 dark:bg-gray-700 text-white dark:text-gray-100 text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-[9999] max-w-xs break-words">
                  {document.fileName}
                  <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900 dark:border-t-gray-700"></div>
                </div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                预估时间: {document.estimatedTime ? formatTime(document.estimatedTime) : '计算中...'}
              </p>
            </div>
          </div>
          
          {/* 操作按钮 */}
          <div className="flex items-center space-x-2">
            {onDelete && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDelete(document.id)}
                className="text-red-600 dark:text-red-400 border-red-200 dark:border-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                {isProcessing ? '取消' : '删除'}
              </Button>
            )}
            
            {isPaused && onResume && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onResume(document.id)}
                className="text-green-600 dark:text-green-400 border-green-200 dark:border-green-700 hover:bg-green-50 dark:hover:bg-green-900/20"
              >
                <Play className="h-4 w-4 mr-1" />
                继续
              </Button>
            )}
            
            {canRetry && onRetry && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onRetry(document.id)}
                className="text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/20"
              >
                <RotateCcw className="h-4 w-4 mr-1" />
                重试
              </Button>
            )}
          </div>
        </div>

        {/* 总体进度条 */}
        {isProcessing && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>总体进度</span>
              <span>{Math.round(document.processingProgress || 0)}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <motion.div 
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${document.processingProgress || 0}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        )}

        {/* 处理步骤详情 */}
        {document.processingSteps && document.processingSteps.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-gray-700 dark:text-gray-300">处理步骤</p>
            <div className="space-y-2">
              {document.processingSteps.map((step, index) => (
                <div key={index} className="flex items-center space-x-3">
                  {getStepIcon(step.status)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className={`text-xs px-2 py-1 rounded-full border ${
                        step.status === 'completed' ? 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-700' :
                        step.status === 'processing' ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700' :
                        step.status === 'failed' ? 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-700' :
                        'text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600'
                      }`}>
                        {step.step}
                      </span>
                    </div>
                    {step.status === 'processing' && (
                      <div className="mt-1 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1">
                        <motion.div 
                          className="bg-blue-500 dark:bg-blue-400 h-1 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${step.progress}%` }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                    )}
                    {step.status === 'failed' && step.error && (
                      <p className="text-xs text-red-600 dark:text-red-400 mt-1">{step.error}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 错误信息 */}
        {isFailed && document.error && (
          <div className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 p-3 rounded-lg border border-red-200 dark:border-red-700">
            <div className="flex items-start space-x-2">
              <AlertCircle className="h-4 w-4 text-red-500 dark:text-red-400 mt-0.5 flex-shrink-0" />
              <span>{document.error}</span>
            </div>
            {canRetry && (
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                重试次数: {document.retryCount || 0}/{document.maxRetries || 3}
              </p>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};

export default ProcessingProgressCard;
