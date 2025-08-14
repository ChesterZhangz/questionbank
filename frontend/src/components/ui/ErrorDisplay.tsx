import React from 'react';
import { AlertCircle, RefreshCw, HelpCircle, ExternalLink } from 'lucide-react';
import Button from './Button';

interface ErrorDisplayProps {
  error: string;
  errorType?: 'network' | 'file' | 'processing' | 'permission' | 'unknown';
  onRetry?: () => void;
  onHelp?: () => void;
  showDetails?: boolean;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  error,
  errorType = 'unknown',
  onRetry,
  onHelp,
  showDetails = false
}) => {
  const getErrorInfo = (type: string) => {
    switch (type) {
      case 'network':
        return {
          title: '网络连接错误',
          description: '无法连接到服务器，请检查网络连接',
          suggestions: [
            '检查网络连接是否正常',
            '确认服务器地址是否正确',
            '尝试刷新页面重试'
          ],
          icon: '🌐'
        };
      case 'file':
        return {
          title: '文件处理错误',
          description: '文件格式不支持或文件损坏',
          suggestions: [
            '确认文件格式为 PDF、Word 或 TeX',
            '检查文件是否完整且未损坏',
            '尝试重新上传文件'
          ],
          icon: '📄'
        };
      case 'processing':
        return {
          title: '处理过程错误',
          description: '文档处理过程中出现错误',
          suggestions: [
            '文件可能包含复杂格式或特殊字符',
            '尝试简化文档内容后重新上传',
            '联系技术支持获取帮助'
          ],
          icon: '⚙️'
        };
      case 'permission':
        return {
          title: '权限不足',
          description: '没有足够的权限执行此操作',
          suggestions: [
            '确认已正确登录系统',
            '检查账户权限设置',
            '联系管理员获取权限'
          ],
          icon: '🔒'
        };
      default:
        return {
          title: '未知错误',
          description: '发生了意外的错误',
          suggestions: [
            '尝试刷新页面',
            '清除浏览器缓存',
            '联系技术支持'
          ],
          icon: '❓'
        };
    }
  };

  const errorInfo = getErrorInfo(errorType);

  return (
    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <div className="w-8 h-8 bg-red-100 dark:bg-red-800/50 rounded-full flex items-center justify-center">
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-lg">{errorInfo.icon}</span>
            <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
              {errorInfo.title}
            </h3>
          </div>
          
          <p className="text-sm text-red-700 dark:text-red-300 mb-3">
            {errorInfo.description}
          </p>
          
          {showDetails && (
            <div className="bg-red-100 dark:bg-red-800/30 rounded p-3 mb-3">
              <p className="text-xs text-red-800 dark:text-red-200 font-mono break-all">
                {error}
              </p>
            </div>
          )}
          
          <div className="space-y-2">
            <p className="text-xs font-medium text-red-800 dark:text-red-200">建议解决方案：</p>
            <ul className="text-xs text-red-700 dark:text-red-300 space-y-1">
              {errorInfo.suggestions.map((suggestion, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <span className="text-red-500 dark:text-red-400 mt-0.5">•</span>
                  <span>{suggestion}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="flex items-center space-x-3 mt-4">
            {onRetry && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRetry}
                className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-800/30 border-red-300 dark:border-red-600"
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                重试
              </Button>
            )}
            
            {onHelp && (
              <Button
                variant="outline"
                size="sm"
                onClick={onHelp}
                className="text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-800/30 border-blue-300 dark:border-blue-600"
              >
                <HelpCircle className="h-4 w-4 mr-1" />
                获取帮助
              </Button>
            )}
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open('https://support.example.com', '_blank')}
              className="text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 border-gray-300 dark:border-gray-600"
            >
              <ExternalLink className="h-4 w-4 mr-1" />
              查看文档
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorDisplay;
