import React, { useState } from 'react';
import Button from '../ui/Button';
import Card from '../ui/Card';
import Input from '../ui/Input';
import { Loader2, Upload, FileText, Image as ImageIcon, X } from 'lucide-react';
import { useMathpixUpload } from '../../hooks/useMathpixUpload';
import { useTranslation } from '../../hooks/useTranslation';
// cn函数简单实现
const cn = (...classes: (string | undefined)[]) => classes.filter(Boolean).join(' ');

interface MathpixUploaderProps {
  onSuccess?: (result: any) => void;
  onError?: (error: any) => void;
  className?: string;
  allowedFileTypes?: string[];
  maxFileSize?: number; // 以MB为单位
  title?: string;
  description?: string;
}

export const MathpixUploader: React.FC<MathpixUploaderProps> = ({
  onSuccess,
  onError,
  className,
  allowedFileTypes = ['image/*', 'application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword'],
  maxFileSize = 20, // 默认20MB
  title,
  description
}) => {
  const { t } = useTranslation();
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  
  const { isLoading, handleFileUpload } = useMathpixUpload({
    onSuccess,
    onError
  });

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files[0]);
    }
  };

  const handleFiles = (file: File) => {
    // 检查文件类型
    const fileType = file.type;
    const isAllowedType = allowedFileTypes.some(type => {
      if (type.endsWith('/*')) {
        const baseType = type.split('/')[0];
        return fileType.startsWith(`${baseType}/`);
      }
      return type === fileType;
    });
    
    if (!isAllowedType) {
      onError?.({ message: t('upload.mathpixUploader.unsupportedFileType') });
      return;
    }
    
    // 检查文件大小
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxFileSize) {
      onError?.({ message: t('upload.mathpixUploader.fileSizeExceeded', { maxSize: maxFileSize }) });
      return;
    }
    
    setFile(file);
    
    // 如果是图片，创建预览
    if (fileType.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    
    try {
      await handleFileUpload(file);
    } catch (error) {
      // 错误已在hook中处理
    }
  };

  const handleRemove = () => {
    setFile(null);
    setPreview(null);
  };

  const renderFilePreview = () => {
    if (!file) return null;
    
    const fileType = file.type;
    
    if (fileType.startsWith('image/') && preview) {
      return (
        <div className="relative w-full h-40 bg-gray-100 rounded-md overflow-hidden">
          <img src={preview} alt={t('upload.mathpixUploader.preview')} className="w-full h-full object-contain" />
          <Button 
                        variant="outline"
            size="sm" 
            className="absolute top-2 right-2 h-6 w-6"
            onClick={handleRemove}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      );
    }
    
    if (fileType.includes('pdf')) {
      return (
        <div className="relative flex items-center p-4 bg-gray-100 rounded-md">
          <FileText className="h-8 w-8 mr-2 text-red-500" />
          <div className="flex-1 truncate">
            <p className="font-medium">{file.name}</p>
            <p className="text-sm text-gray-500">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
          </div>
          <Button 
                        variant="outline"
            size="sm" 
            className="h-6 w-6"
            onClick={handleRemove}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      );
    }
    
    if (fileType.includes('word') || fileType.includes('doc')) {
      return (
        <div className="relative flex items-center p-4 bg-gray-100 rounded-md">
          <FileText className="h-8 w-8 mr-2 text-blue-500" />
          <div className="flex-1 truncate">
            <p className="font-medium">{file.name}</p>
            <p className="text-sm text-gray-500">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
          </div>
          <Button 
                        variant="outline"
            size="sm" 
            className="h-6 w-6"
            onClick={handleRemove}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      );
    }
    
    return (
      <div className="relative flex items-center p-4 bg-gray-100 rounded-md">
        <FileText className="h-8 w-8 mr-2" />
        <div className="flex-1 truncate">
          <p className="font-medium">{file.name}</p>
          <p className="text-sm text-gray-500">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
        </div>
        <Button 
                      variant="outline"
            size="sm" 
          className="h-6 w-6"
          onClick={handleRemove}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  };

  return (
    <Card className={cn("w-full", className)}>
      <div className="p-6 pb-0">
        <h3 className="text-lg font-semibold">{title || t('upload.mathpixUploader.title')}</h3>
        <p className="text-sm text-gray-600">{description || t('upload.mathpixUploader.description')}</p>
      </div>
      <div className="p-6">
        {file ? (
          renderFilePreview()
        ) : (
          <div
            className={cn(
              "border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer transition-all",
              dragActive ? "border-primary bg-primary/5" : "border-gray-300 hover:border-primary/50"
            )}
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
          >
            <div className="flex flex-col items-center justify-center space-y-2 text-center">
              <div className="rounded-full bg-primary/10 p-3">
                {dragActive ? (
                  <Upload className="h-6 w-6 text-primary" />
                ) : (
                  <ImageIcon className="h-6 w-6 text-primary" />
                )}
              </div>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">
                  {dragActive ? t('upload.mathpixUploader.dragActive') : t('upload.mathpixUploader.dragInactive')}
                </p>
                <p className="text-xs text-gray-500">
                  {t('upload.mathpixUploader.fileSizeLimit', { maxSize: maxFileSize })}
                </p>
              </div>
              <Input
                id="file-upload"
                type="file"
                className="hidden"
                accept={allowedFileTypes.join(',')}
                onChange={handleChange}
              />
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2"
                onClick={() => document.getElementById('file-upload')?.click()}
              >
                <span>{t('upload.mathpixUploader.selectFile')}</span>
              </Button>
            </div>
          </div>
        )}
      </div>
      <div className="flex justify-end p-6 pt-0">
        <Button
          onClick={handleUpload}
          disabled={!file || isLoading}
          className="w-full sm:w-auto"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t('upload.mathpixUploader.processing')}
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              {t('upload.mathpixUploader.uploadAndRecognize')}
            </>
          )}
        </Button>
      </div>
    </Card>
  );
};