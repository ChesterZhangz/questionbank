import React, { useState, useCallback, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, 
  Image as ImageIcon, 
  GripVertical,
  Trash2,
  Eye,
  Download
} from 'lucide-react';
import { cn } from '../../lib/utils';

export interface QuestionImage {
  id: string;
  bid: string;
  order: number;
  format: string;
  uploadedAt: Date;
  uploadedBy: string;
  filename: string;
  url: string;
}

interface QuestionImageManagerProps {
  questionId: string;
  images: QuestionImage[];
  onImagesChange: (images: QuestionImage[]) => void;
  maxImages?: number;
  className?: string;
}

export const QuestionImageManager: React.FC<QuestionImageManagerProps> = ({
  images = [],
  onImagesChange,
  maxImages = 5,
  className
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 处理文件上传
  const handleFileUpload = useCallback(async (files: File[]) => {
    if (images.length + files.length > maxImages) {
      alert(`最多只能上传${maxImages}张图片`);
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const newImages: QuestionImage[] = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setUploadProgress((i / files.length) * 100);

        // 模拟上传过程
        await new Promise(resolve => setTimeout(resolve, 500));

        const newImage: QuestionImage = {
          id: `img_${Date.now()}_${i}`,
          bid: 'temp-bid',
          order: images.length + i,
          format: file.type.split('/')[1] || 'unknown',
          uploadedAt: new Date(),
          uploadedBy: 'current-user',
          filename: file.name,
          url: URL.createObjectURL(file)
        };

        newImages.push(newImage);
      }

      const updatedImages = [...images, ...newImages];
      onImagesChange(updatedImages);
      
      setUploadProgress(100);
      setTimeout(() => setUploadProgress(0), 1000);
    } catch (error) {
      // 错误日志已清理
      alert('图片上传失败，请重试');
    } finally {
      setIsUploading(false);
    }
  }, [images, maxImages, onImagesChange]);

  // 删除图片
  const handleDeleteImage = useCallback((imageId: string) => {
    const updatedImages = images.filter(img => img.id !== imageId);
    onImagesChange(updatedImages);
  }, [images, onImagesChange]);



  // 拖拽上传
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif']
    },
    maxFiles: maxImages - images.length,
    onDrop: handleFileUpload,
    disabled: isUploading || images.length >= maxImages
  });

  // 点击上传
  const handleClickUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* 标题和统计 */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          题目图片 ({images.length}/{maxImages})
        </h3>
        <button
          onClick={handleClickUpload}
          disabled={isUploading || images.length >= maxImages}
          className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Upload className="w-4 h-4 mr-2" />
          上传图片
        </button>
      </div>

      {/* 拖拽上传区域 */}
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer",
          isDragActive || dragActive
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 hover:border-gray-400",
          images.length >= maxImages && "opacity-50 cursor-not-allowed"
        )}
        onDragEnter={() => setDragActive(true)}
        onDragLeave={() => setDragActive(false)}
      >
        <input {...getInputProps()} />
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => {
            const files = Array.from(e.target.files || []);
            if (files.length > 0) {
              handleFileUpload(files);
            }
          }}
          className="hidden"
        />
        
        <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-2 text-sm text-gray-600">
          {isDragActive
            ? "释放文件以上传"
            : "拖拽图片文件到这里，或点击上传按钮"}
        </p>
        <p className="mt-1 text-xs text-gray-500">
          支持 JPG、PNG、GIF 格式，单个文件最大 5MB
        </p>
      </div>

      {/* 上传进度 */}
      {isUploading && (
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${uploadProgress}%` }}
          />
        </div>
      )}

      {/* 图片列表 */}
      <AnimatePresence>
        {images.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-3"
          >
            {images.map((image) => (
              <motion.div
                key={image.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex items-center space-x-3 p-3 bg-white border border-gray-200 rounded-lg shadow-sm"
              >
                {/* 拖拽手柄 */}
                <div className="cursor-move text-gray-400 hover:text-gray-600">
                  <GripVertical className="w-5 h-5" />
                </div>

                {/* 图片预览 */}
                <div className="flex-shrink-0">
                  <img
                    src={image.url}
                    alt={image.filename}
                    className="w-16 h-16 object-cover rounded border border-gray-200"
                  />
                </div>

                {/* 图片信息 */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {image.filename}
                  </p>
                  <p className="text-xs text-gray-500">
                    {image.format.toUpperCase()} • {image.uploadedAt.toLocaleDateString()}
                  </p>
                </div>

                {/* 操作按钮 */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => window.open(image.url, '_blank')}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                    title="查看原图"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  
                  <button
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = image.url;
                      link.download = image.filename;
                      link.click();
                    }}
                    className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-md transition-colors"
                    title="下载图片"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  
                  <button
                    onClick={() => handleDeleteImage(image.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                    title="删除图片"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 空状态 */}
      {images.length === 0 && !isUploading && (
        <div className="text-center py-8 text-gray-500">
          <ImageIcon className="mx-auto h-12 w-12 text-gray-300" />
          <p className="mt-2 text-sm">暂无图片</p>
          <p className="text-xs">上传图片来丰富题目内容</p>
        </div>
      )}
    </div>
  );
};
