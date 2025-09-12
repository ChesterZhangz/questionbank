import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, 
  Image, 
  X, 
  Loader2, 
  AlertCircle,
  Camera,
  RotateCcw,
  ZoomIn
} from 'lucide-react';
import Button from '../../ui/Button';
import { ocrAPI } from '../../../services/api';
import { useTranslation } from '../../../hooks/useTranslation';

interface QuestionData {
  id: string;
  stem: string;
  options?: string[];
  answer: string;
  questionType: 'choice' | 'multiple-choice' | 'fill' | 'solution';
  category?: string[];
  tags?: string[];
  source?: string;
  difficulty?: number;
  isChoiceQuestion?: boolean;
  questionContent?: string;
}

interface MultiQuestionUploaderProps {
  onQuestionsGenerated: (questions: QuestionData[]) => void;
  onError?: (error: string) => void;
  className?: string;
  maxFileSize?: number; // 单位：MB
  acceptedFormats?: string[];
}

const MultiQuestionUploader: React.FC<MultiQuestionUploaderProps> = ({
  onQuestionsGenerated,
  onError,
  className = "",
  maxFileSize = 5,
  acceptedFormats = ['image/jpeg', 'image/png', 'image/jpg']
}) => {
  const { t } = useTranslation();
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string>('');
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 验证文件
  const validateFile = (file: File): boolean => {
    // 检查文件类型
    if (!acceptedFormats.includes(file.type)) {
      setError(t('editor.multiQuestionUploader.unsupportedFormat', { type: file.type }));
      return false;
    }

    // 检查文件大小
    if (file.size > maxFileSize * 1024 * 1024) {
      setError(t('editor.multiQuestionUploader.fileTooLarge', { maxSize: maxFileSize }));
      return false;
    }

    return true;
  };

  // 处理文件选择
  const handleFileSelect = useCallback((files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const validFiles = fileArray.filter(validateFile);
    
    if (validFiles.length === 0) return;

    // 检查总文件数量限制
    if (selectedFiles.length + validFiles.length > 10) {
      setError(t('editor.multiQuestionUploader.maxFilesExceeded'));
      return;
    }

    // 生成预览URL
    const newPreviewUrls = validFiles.map(file => URL.createObjectURL(file));
    
    setSelectedFiles(prev => [...prev, ...validFiles]);
    setPreviewUrls(prev => [...prev, ...newPreviewUrls]);
    setError('');
  }, [selectedFiles, acceptedFormats, maxFileSize]);

  // 处理剪切板粘贴
  const handlePaste = useCallback((event: ClipboardEvent) => {
    const items = event.clipboardData?.items;
    if (!items) return;

    const imageFiles: File[] = [];
    
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile();
        if (file) {
          imageFiles.push(file);
        }
      }
    }

    if (imageFiles.length > 0) {
      event.preventDefault();
      handleFileSelect(imageFiles);
    }
  }, [handleFileSelect]);

  // 监听剪切板事件
  useEffect(() => {
    document.addEventListener('paste', handlePaste);
    return () => {
      document.removeEventListener('paste', handlePaste);
    };
  }, [handlePaste]);

  // 文件输入处理
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      handleFileSelect(files);
    }
  };

  // 触发文件选择
  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  // 拖拽处理
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files) {
      handleFileSelect(files);
    }
  };

  // 删除文件
  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => {
      const newUrls = prev.filter((_, i) => i !== index);
      // 释放被删除的URL
      URL.revokeObjectURL(prev[index]);
      return newUrls;
    });
    setError('');
  };

  // 清空所有文件
  const clearAll = useCallback(() => {
    setSelectedFiles([]);
    setPreviewUrls(prev => {
      prev.forEach(url => URL.revokeObjectURL(url));
      return [];
    });
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  // 查看图片
  const handleViewImage = (index: number) => {
    setSelectedImageIndex(index);
    setShowImageModal(true);
  };

  // 关闭图片查看
  const handleCloseImageModal = () => {
    setShowImageModal(false);
    setSelectedImageIndex(null);
  };

  // 批量OCR识别
  const handleBatchOCR = async () => {
    if (selectedFiles.length === 0) return;

    setIsProcessing(true);
    setProgress(0);
    setError('');

    // 模拟进度条动画
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);

    try {

      
      const response = await ocrAPI.recognizeImages(selectedFiles);
      
      if (response.data.success) {

        
        // 确保结果数组长度与文件数量一致
        const results = response.data.results || [];
        const questions: QuestionData[] = [];
        
        for (let i = 0; i < selectedFiles.length; i++) {
          const result = results[i];
          
          
          // 确保每个题目都有内容，即使OCR失败也要创建题目
          let stem = '';
          let questionType: 'choice' | 'multiple-choice' | 'fill' | 'solution' = 'solution';
          let options: string[] = [];
          
          if (result) {
            stem = result.latex || result.questionContent || '';
            questionType = (result.isChoiceQuestion ? 'choice' : 'solution') as 'choice' | 'multiple-choice' | 'fill' | 'solution';
            options = result.options || [];
          }
          
          // 如果OCR没有返回内容，使用占位符
          if (!stem.trim()) {
            stem = `题目 ${i + 1} (OCR识别失败，请手动编辑)`;
          }
          
          const question = {
            id: `question-${Date.now()}-${i}`,
            stem: stem,
            questionType: questionType,
            answer: '',
            isChoiceQuestion: result?.isChoiceQuestion || false,
            questionContent: result?.questionContent || '',
            options: options,
            category: [],
            tags: [],
            source: '',
            difficulty: 3
          };
          
          questions.push(question);
        }
        

        
        // 确保所有题目都被传输
        if (questions.length > 0) {
          setProgress(100);
          setTimeout(() => {
            onQuestionsGenerated(questions);
          }, 500);
        } else {
          throw new Error(t('editor.multiQuestionUploader.noQuestionsGenerated'));
        }
      } else {
        throw new Error(response.data.error || t('editor.multiQuestionUploader.recognitionFailed'));
      }
    } catch (err: any) {
      // 错误日志已清理
      const errorMsg = err.response?.data?.error || err.message || t('editor.multiQuestionUploader.recognitionFailed');
      setError(errorMsg);
      onError?.(errorMsg);
    } finally {
      clearInterval(progressInterval);
      setTimeout(() => {
        setIsProcessing(false);
        setProgress(0);
      }, 1000);
    }
  };

  return (
    <div className={`multi-question-uploader ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedFormats.join(',')}
        onChange={handleFileInput}
        multiple
        className="hidden"
      />

      <div className="space-y-6">
        {/* 上传区域 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
            isDragging
              ? 'border-blue-400 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="space-y-4">
            <div className="flex justify-center">
              <div className={`p-4 rounded-full transition-colors ${
                isDragging ? 'bg-blue-100' : 'bg-gray-100'
              }`}>
                <Upload className={`w-8 h-8 ${
                  isDragging ? 'text-blue-600' : 'text-gray-600'
                }`} />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {isDragging ? t('editor.multiQuestionUploader.dragToUpload') : t('editor.multiQuestionUploader.title')}
              </h3>
              <p className="text-gray-500 mb-4">
                {t('editor.multiQuestionUploader.supportFormats', { maxSize: maxFileSize })}
              </p>
              <p className="text-sm text-gray-400">
                {t('editor.multiQuestionUploader.selectedCount', { count: selectedFiles.length })}
              </p>
            </div>

            <div className="flex justify-center space-x-3">
              <Button
                onClick={triggerFileSelect}
                variant="outline"
                disabled={selectedFiles.length >= 10}
              >
                <Camera className="w-4 h-4 mr-2" />
                {t('editor.multiQuestionUploader.selectImages')}
              </Button>
              
              {selectedFiles.length > 0 && (
                <Button
                  onClick={clearAll}
                  variant="outline"
                  size="sm"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  {t('editor.multiQuestionUploader.clear')}
                </Button>
              )}
            </div>
          </div>
        </motion.div>

        {/* 错误提示 */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg"
          >
            <AlertCircle className="w-5 h-5 text-red-500" />
            <span className="text-red-700">{error}</span>
          </motion.div>
        )}

        {/* 图片预览 */}
        {selectedFiles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <h4 className="text-lg font-medium text-gray-900">{t('editor.multiQuestionUploader.selectedImages')}</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {selectedFiles.map((file, index) => (
                <div key={index} className="relative group">
                  <div 
                    className="aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => handleViewImage(index)}
                  >
                    <img
                      src={previewUrls[index]}
                      alt={t('editor.multiQuestionUploader.preview', { index: index + 1 })}
                      className="w-full h-full object-cover"
                    />
                    
                    {/* 查看按钮 */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black bg-opacity-30">
                      <ZoomIn className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  
                  {/* 删除按钮 */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(index);
                    }}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                  
                  {/* 文件信息 */}
                  <div className="mt-2 text-xs text-gray-500">
                    <p className="truncate">{file.name}</p>
                    <p>{t('editor.multiQuestionUploader.fileSize', { size: (file.size / 1024 / 1024).toFixed(2) })}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* 进度条 */}
        {isProcessing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-2"
          >
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>{t('editor.multiQuestionUploader.recognizing')}</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </motion.div>
        )}

        {/* 操作按钮 */}
        <div className="flex justify-center">
          <Button
            onClick={handleBatchOCR}
            disabled={selectedFiles.length === 0 || isProcessing}
            size="lg"
            className="min-w-[200px]"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                {t('editor.multiQuestionUploader.recognizing')}
              </>
            ) : (
              <>
                <Image className="w-5 h-5 mr-2" />
                {t('editor.multiQuestionUploader.startRecognition', { count: selectedFiles.length })}
              </>
            )}
          </Button>
        </div>
      </div>

      {/* 图片查看模态框 */}
      <AnimatePresence>
        {showImageModal && selectedImageIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75"
            onClick={handleCloseImageModal}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="relative max-w-4xl max-h-[90vh] bg-white rounded-lg overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* 关闭按钮 */}
              <button
                onClick={handleCloseImageModal}
                className="absolute top-4 right-4 z-10 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              
              {/* 图片信息 */}
              <div className="absolute top-4 left-4 z-10 px-3 py-1 bg-black bg-opacity-50 text-white rounded-lg text-sm">
                {t('editor.multiQuestionUploader.imageViewer', { current: selectedImageIndex + 1, total: selectedFiles.length })}
              </div>
              
              {/* 图片 */}
              <img
                src={previewUrls[selectedImageIndex]}
                alt={t('editor.multiQuestionUploader.preview', { index: selectedImageIndex + 1 })}
                className="w-full h-full object-contain max-h-[90vh]"
              />
              
              {/* 文件名 */}
              <div className="absolute bottom-4 left-4 right-4 px-3 py-2 bg-black bg-opacity-50 text-white rounded-lg text-sm">
                {selectedFiles[selectedImageIndex]?.name}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MultiQuestionUploader; 