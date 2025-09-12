import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, 
  Image, 
  FileText, 
  X, 
  Loader2, 
  CheckCircle, 
  AlertCircle,
  Camera,
  RotateCcw,
  Clipboard,
  Copy
} from 'lucide-react';
import Button from '../ui/Button';
import { ocrAPI } from '../../services/api';
import { useTranslation } from '../../hooks/useTranslation';

interface OCRUploaderProps {
  onOCRResult: (latex: string, isChoiceQuestion?: boolean, questionContent?: string, options?: string[]) => void;
  onError?: (error: string) => void;
  className?: string;
  maxFileSize?: number; // 单位：MB
  acceptedFormats?: string[];
}

const OCRUploader: React.FC<OCRUploaderProps> = ({
  onOCRResult,
  onError,
  className = "",
  maxFileSize = 5,
  acceptedFormats = ['image/jpeg', 'image/png', 'image/jpg']
}) => {
  const { t } = useTranslation();
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [ocrResult, setOcrResult] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isClipboardSupported, setIsClipboardSupported] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 清理blob URL的useEffect
  useEffect(() => {
    return () => {
      // 组件卸载时清理blob URL
      if (previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // 检查剪切板支持
  React.useEffect(() => {
    setIsClipboardSupported(!!navigator.clipboard && !!navigator.clipboard.read);
  }, []);

  // 键盘快捷键处理
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl+V 或 Cmd+V 粘贴图片
      if ((event.ctrlKey || event.metaKey) && event.key === 'v') {
        event.preventDefault();
        if (isClipboardSupported) {
          readFromClipboard();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isClipboardSupported]);

  // 从剪切板读取图片
  const readFromClipboard = async () => {
    try {
      if (!navigator.clipboard || !navigator.clipboard.read) {
        throw new Error(t('math.ocrUploader.errors.clipboardNotSupported'));
      }

      const clipboardItems = await navigator.clipboard.read();
      
      for (const clipboardItem of clipboardItems) {
        for (const type of clipboardItem.types) {
          if (type.startsWith('image/')) {
            const blob = await clipboardItem.getType(type);
            const file = new File([blob], `clipboard-image-${Date.now()}.${type.split('/')[1]}`, { type });
            
            if (validateFile(file)) {
              handleFileSelect(file);
              return;
            }
          }
        }
      }
      
      throw new Error(t('math.ocrUploader.errors.noImageInClipboard'));
    } catch (err: any) {
      const errorMsg = err.message || t('math.ocrUploader.errors.clipboardReadFailed');
      setError(errorMsg);
      onError?.(errorMsg);
    }
  };

  // 复制OCR结果到剪切板
  const copyToClipboard = async () => {
    try {
      if (!ocrResult) return;
      
      await navigator.clipboard.writeText(ocrResult);
      // 可以添加一个临时的成功提示
      const originalText = document.title;
      document.title = t('math.ocrUploader.errors.copySuccess');
      setTimeout(() => {
        document.title = originalText;
      }, 1000);
    } catch (err) {
      setError(t('math.ocrUploader.errors.copyToClipboardFailed'));
      onError?.(t('math.ocrUploader.errors.copyToClipboardFailed'));
    }
  };

  // 验证文件
  const validateFile = (file: File): boolean => {
    // 检查文件类型
    if (!acceptedFormats.includes(file.type)) {
      setError(t('math.ocrUploader.errors.unsupportedFormat'));
      onError?.(t('math.ocrUploader.errors.unsupportedFormat'));
      return false;
    }

    // 检查文件大小
    if (file.size > maxFileSize * 1024 * 1024) {
      setError(t('math.ocrUploader.errors.fileTooLarge', { maxSize: maxFileSize }));
      onError?.(t('math.ocrUploader.errors.fileTooLarge', { maxSize: maxFileSize }));
      return false;
    }

    return true;
  };

  // 处理文件选择
  const handleFileSelect = useCallback((file: File) => {
    if (!validateFile(file)) return;

    setSelectedFile(file);
    setError('');
    setOcrResult('');

    // 创建预览URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  }, [maxFileSize, acceptedFormats, onError]);

  // 处理拖拽事件
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  // 处理文件输入
  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  // 触发文件选择
  const triggerFileSelect = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  // OCR识别
  const performOCR = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setError('');

    try {
      // 调用OCR API
      const response = await ocrAPI.recognizeImage(selectedFile);

      if (response.data.success) {
        setOcrResult(response.data.latex);
        // 传递选择题识别结果
        onOCRResult(
          response.data.latex,
          response.data.isChoiceQuestion,
          response.data.questionContent,
          response.data.options
        );
      } else {
        throw new Error(response.data.error || t('math.ocrUploader.errors.ocrFailed'));
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || err.message || t('math.ocrUploader.errors.ocrFailed');
      setError(errorMsg);
      onError?.(errorMsg);
    } finally {
      setIsProcessing(false);
    }
  };

  // 清空
  const clearAll = useCallback(() => {
    setSelectedFile(null);
    setPreviewUrl('');
    setOcrResult('');
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  // 重新选择文件
  const reselectFile = useCallback(() => {
    clearAll();
    triggerFileSelect();
  }, [clearAll, triggerFileSelect]);

  return (
    <div className={`ocr-uploader ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedFormats.join(',')}
        onChange={handleFileInput}
        className="hidden"
      />

      <AnimatePresence mode="wait">
        {!selectedFile ? (
          // 上传区域
          <motion.div
            key="upload-area"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
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
                <h3 className="text-lg font-medium text-gray-900 mb-2 dark:text-white">
                  {isDragging ? t('math.ocrUploader.dragTitle') : t('math.ocrUploader.title')}
                </h3>
                <p className="text-gray-500 mb-4">
                  {t('math.ocrUploader.description', { maxSize: maxFileSize })}
                </p>
              </div>

              <div className="flex justify-center space-x-3">
                <Button
                  onClick={triggerFileSelect}
                  variant="outline"
                  className="flex items-center space-x-2"
                >
                  <Camera className="w-4 h-4" />
                  <span>{t('math.ocrUploader.selectFile')}</span>
                </Button>
                <Button
                  onClick={triggerFileSelect}
                  variant="outline"
                  className="flex items-center space-x-2"
                >
                  <Image className="w-4 h-4" />
                  <span>{t('math.ocrUploader.takePhoto')}</span>
                </Button>
                {isClipboardSupported && (
                  <Button
                    onClick={readFromClipboard}
                    variant="outline"
                    className="flex items-center space-x-2"
                  >
                    <Clipboard className="w-4 h-4" />
                    <span>{t('math.ocrUploader.clipboard')}</span>
                  </Button>
                )}
              </div>

              <p className="text-sm text-gray-400">
                {isClipboardSupported 
                  ? t('math.ocrUploader.dragHintWithClipboard')
                  : t('math.ocrUploader.dragHint')
                }
              </p>
            </div>

            {isDragging && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 bg-blue-500 bg-opacity-10 rounded-lg flex items-center justify-center"
              >
                <div className="text-blue-600 font-medium dark:text-white">
                  {t('math.ocrUploader.dragTitle')}
                </div>
              </motion.div>
            )}
          </motion.div>
        ) : (
          // 预览和处理区域
          <motion.div
            key="preview-area"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            {/* 图片预览 */}
            <div className="relative">
              <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={previewUrl}
                  alt={t('math.ocrUploader.previewAlt')}
                  className="w-full h-full object-contain"
                />
              </div>
              
              {/* 操作按钮 */}
              <div className="absolute top-2 right-2 flex space-x-2">
                <Button
                  onClick={reselectFile}
                  size="sm"
                  variant="outline"
                  className="bg-white/90 backdrop-blur-sm"
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>
                <Button
                  onClick={clearAll}
                  size="sm"
                  variant="outline"
                  className="bg-white/90 backdrop-blur-sm"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* 错误信息 */}
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

            {/* OCR结果 */}
            {ocrResult && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="font-medium text-green-700">{t('math.ocrUploader.recognitionSuccess')}</span>
                  </div>
                  <Button
                    onClick={copyToClipboard}
                    size="sm"
                    variant="outline"
                    className="flex items-center space-x-1 text-gray-600 hover:text-gray-800"
                  >
                    <Copy className="w-4 h-4" />
                    <span className="text-sm">{t('math.ocrUploader.copy')}</span>
                  </Button>
                </div>
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <pre className="text-sm text-green-800 whitespace-pre-wrap font-mono">
                    {ocrResult}
                  </pre>
                </div>
              </motion.div>
            )}

            {/* 操作按钮 */}
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-500">
                {t('math.ocrUploader.fileSize', { 
                  fileName: selectedFile.name, 
                  fileSize: (selectedFile.size / 1024 / 1024).toFixed(2) 
                })}
              </div>
              
              <div className="flex space-x-2">
                <Button
                  onClick={clearAll}
                  variant="outline"
                  disabled={isProcessing}
                >
                  {t('math.ocrUploader.reselect')}
                </Button>
                <Button
                  onClick={performOCR}
                  disabled={isProcessing}
                  className="flex items-center space-x-2"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{t('math.ocrUploader.recognizing')}</span>
                    </>
                  ) : (
                    <>
                      <FileText className="w-4 h-4" />
                      <span>{t('math.ocrUploader.startRecognition')}</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OCRUploader; 