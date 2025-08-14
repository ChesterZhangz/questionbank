import React from 'react';
import { 
  CheckCircle, 
  Eye, 
  Download, 
  Share2
} from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';

interface ProcessingResultPreviewProps {
  document: {
    id: string;
    fileName: string;
    fileType: string;
    questions: any[];
    confidence?: number;
    processTime?: Date;
    startTime?: Date;
  };
  onViewDetails: () => void;
  onDownload: () => void;
  onShare: () => void;
}

const ProcessingResultPreview: React.FC<ProcessingResultPreviewProps> = ({
  document,
  onViewDetails,
  onDownload,
  onShare
}) => {
  return (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <div className="space-y-4">
        {/* 头部信息 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="group relative">
                <h3 className="font-medium text-gray-900 truncate" title={document.fileName}>
                  处理完成
                </h3>
                <p className="text-sm text-gray-500 truncate" title={document.fileName}>
                  {document.fileName}
                </p>
                {/* 悬停显示完整文件名 */}
                <div className="absolute bottom-full left-0 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 max-w-xs break-words">
                  {document.fileName}
                  <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 主要统计信息 */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <p className="text-2xl font-bold text-blue-600">{document.questions.length}</p>
            <p className="text-xs text-blue-700">识别题目</p>
          </div>
          
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <p className="text-2xl font-bold text-green-600">
              {document.confidence ? Math.round(document.confidence * 100) : 0}%
            </p>
            <p className="text-xs text-green-700">置信度</p>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div className="flex items-center space-x-2">
            <Button
              onClick={onViewDetails}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
            >
              <Eye className="h-4 w-4 mr-2" />
              进入编辑
            </Button>
            
            <Button
              variant="outline"
              onClick={onDownload}
              className="text-green-600 hover:bg-green-50"
            >
              <Download className="h-4 w-4 mr-2" />
              下载结果
            </Button>
          </div>
          
          <Button
            variant="outline"
            onClick={onShare}
            className="text-gray-600 hover:bg-gray-50"
          >
            <Share2 className="h-4 w-4 mr-2" />
            分享
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default ProcessingResultPreview;
