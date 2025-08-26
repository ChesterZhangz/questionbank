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
import { useAuthStore } from '../../stores/authStore';
import { CustomInputModal } from '../ui/CustomInputModal';
import { ModernUploadSpinner } from '../ui/ModernUploadSpinner';
import { useModal } from '../../hooks/useModal';
import ConfirmModal from '../ui/ConfirmModal';
import RightSlideModal from '../ui/RightSlideModal';

export interface QuestionImage {
  id: string;
  bid: string;
  order: number;
  format: string;
  uploadedAt: Date;
  uploadedBy: string;
  filename: string;
  url: string;
  cosKey?: string; // 腾讯云COS的键值
}

interface QuestionImageManagerProps {
  questionId?: string; // 可选，创建题目时可能还没有ID
  bid?: string; // 题库ID，用于临时图片上传
  images: QuestionImage[];
  onImagesChange: (images: QuestionImage[]) => void;
  maxImages?: number;
  className?: string;
}

export const QuestionImageManager: React.FC<QuestionImageManagerProps> = ({
  bid,
  images = [],
  onImagesChange,
  maxImages = 5,
  className
}) => {
  const { token } = useAuthStore();
  const { 
    confirmModal, 
    rightSlideModal, 
    showConfirm, 
    showSuccessRightSlide, 
    showErrorRightSlide, 
    closeConfirm, 
    closeRightSlide,
    setConfirmLoading
  } = useModal();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // 上传状态
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [uploadError, setUploadError] = useState<string>('');
  
  // 自定义输入框状态
  const [isInputModalOpen, setIsInputModalOpen] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [pendingFileIndex, setPendingFileIndex] = useState(0);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  
  // 编辑名称状态
  const [isEditNameModalOpen, setIsEditNameModalOpen] = useState(false);
  const [editingImage, setEditingImage] = useState<QuestionImage | null>(null);
  const [isRenaming, setIsRenaming] = useState(false);

  // 处理文件上传
  const handleFileUpload = useCallback(async (files: File[]) => {
    if (images.length + files.length > maxImages) {
      alert(`最多只能上传${maxImages}张图片`);
      return;
    }

    if (!bid) {
      alert('题库ID不存在，无法上传图片');
      return;
    }

    // 设置待处理的文件列表
    setPendingFiles(files);
    setPendingFileIndex(0);
    setPendingFile(files[0]);
    setIsInputModalOpen(true);
  }, [images.length, maxImages, bid]);

  // 处理自定义名称输入
  const handleCustomNameSubmit = useCallback(async (customName: string) => {
    if (!pendingFile || !bid) return;

    // 立即关闭模态框
    setIsInputModalOpen(false);

    // 确保上传状态正确设置
    setIsUploading(true);
    setUploadStatus('uploading');
    setUploadProgress((pendingFileIndex / pendingFiles.length) * 100);
    setUploadError('');
    
    // 添加模拟进度过渡效果
    setTimeout(() => setUploadProgress(30), 300);
    setTimeout(() => setUploadProgress(70), 800);

    try {
      // 创建FormData用于文件上传
      const formData = new FormData();
      formData.append('image', pendingFile);
      formData.append('bid', bid);
      formData.append('customName', customName || pendingFile.name);

      // 调用临时图片上传API
      const response = await fetch('/api/questions/upload', {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('图片上传失败');
      }

      const uploadResult = await response.json();
      
      if (uploadResult.success) {
        
        const newImage: QuestionImage = {
          id: uploadResult.data.id,
          bid: uploadResult.data.bid || bid,
          order: images.length + pendingFileIndex,
          format: uploadResult.data.format || pendingFile.type.split('/')[1] || 'unknown',
          uploadedAt: new Date(uploadResult.data.uploadedAt || Date.now()),
          uploadedBy: uploadResult.data.uploadedBy || 'current-user',
          filename: uploadResult.data.filename || pendingFile.name,
          url: uploadResult.data.url,
          cosKey: uploadResult.data.cosKey
        };
        
        // 更新图片列表
        const updatedImages = [...images, newImage];
        onImagesChange(updatedImages);
        
        // 显示成功状态
        setUploadStatus('success');
        showSuccessRightSlide('上传成功', `图片 "${customName || pendingFile.name}" 上传成功`);
        
        setTimeout(() => setUploadStatus('idle'), 2000);
      } else {
        throw new Error(uploadResult.error || '图片上传失败');
      }
    } catch (uploadError) {
      console.error('图片上传失败:', uploadError);
      const errorMessage = uploadError instanceof Error ? uploadError.message : '图片上传失败';
      setUploadError(errorMessage);
      setUploadStatus('error');
      setTimeout(() => setUploadStatus('idle'), 3000);
    } finally {
              // 处理下一个文件或完成
        const nextIndex = pendingFileIndex + 1;
        if (nextIndex < pendingFiles.length) {
          setPendingFileIndex(nextIndex);
          setPendingFile(pendingFiles[nextIndex]);
          // 不再自动打开模态框，让用户手动选择是否继续上传
        } else {
          // 所有文件处理完成
          setIsUploading(false);
          setUploadProgress(100);
          setTimeout(() => {
            setUploadProgress(0);
            setUploadStatus('idle');
          }, 1000);
          setPendingFiles([]);
          setPendingFile(null);
          setPendingFileIndex(0);
        }
    }
  }, [pendingFile, pendingFileIndex, pendingFiles, bid, token, images, onImagesChange]);

  // 删除图片
  const handleDeleteImage = useCallback(async (imageId: string) => {
    try {
      // 查找要删除的图片
      const imageToDelete = images.find(img => img.id === imageId);
      if (!imageToDelete) return;

      // 显示确认删除弹窗
      showConfirm(
        '确认删除',
        `确定要删除图片 "${imageToDelete.filename}" 吗？此操作不可恢复。`,
        async () => {
          // 设置确认按钮为加载状态
          setConfirmLoading(true, '正在删除...');
          
          try {
            // 如果有cosKey，先删除COS中的图片
            if (imageToDelete.cosKey) {
              try {
                const response = await fetch(`/api/questions/cos/${encodeURIComponent(imageToDelete.cosKey)}`, {
                  method: 'DELETE',
                  headers: {
                    'Authorization': `Bearer ${token}`
                  }
                });

                if (!response.ok) {
                  console.error('删除COS图片失败:', response.statusText);
                  showErrorRightSlide('删除失败', '删除COS图片失败，但已从列表中移除');
                }
              } catch (error) {
                console.error('删除COS图片失败:', error);
                showErrorRightSlide('删除失败', '删除COS图片失败，但已从列表中移除');
              }
                          }

              // 更新前端状态
              const updatedImages = images.filter(img => img.id !== imageId);
              onImagesChange(updatedImages);
              
              // 关闭确认弹窗
              closeConfirm();
              
              // 显示成功提示
              showSuccessRightSlide('删除成功', `图片 "${imageToDelete.filename}" 已删除`);
          } catch (error) {
            console.error('删除图片失败:', error);
            showErrorRightSlide('删除失败', '删除图片失败，请重试');
          } finally {
            // 重置加载状态
            setConfirmLoading(false);
          }
        },
        {
          type: 'danger',
          confirmText: '删除',
          cancelText: '取消',
          confirmDanger: true
        }
      );
    } catch (error) {
      console.error('删除图片失败:', error);
      showErrorRightSlide('删除失败', '删除图片失败，请重试');
    }
  }, [images, onImagesChange, token, showConfirm, showSuccessRightSlide, showErrorRightSlide, closeConfirm]);

    // 编辑图片名称
  const handleEditImageName = useCallback((image: QuestionImage) => {
    setEditingImage(image);
    setIsEditNameModalOpen(true);
  }, []);

  // 处理编辑名称提交
  const handleEditNameSubmit = useCallback(async (newName: string) => {
    if (!editingImage || !newName.trim() || newName.trim() === editingImage.filename) {
      return;
    }

    setIsRenaming(true);
    try {
      // 确保文件名包含扩展名
      let newFilename = newName.trim();
      
      // 如果用户输入的文件名已经包含扩展名，先移除它
      const nameWithoutExt = newFilename.split('.')[0];
      
      // 从cosKey中提取真正的文件扩展名
      let originalExt = 'jpg'; // 默认扩展名
      if (editingImage.cosKey) {
        const cosKeyParts = editingImage.cosKey.split('/');
        const cosFilename = cosKeyParts[cosKeyParts.length - 1]; // 获取文件名部分
        const ext = cosFilename.split('.').pop();
        if (ext && ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext.toLowerCase())) {
          originalExt = ext.toLowerCase();
        }
      } else {
        // 如果cosKey不存在，尝试从filename中提取
        const ext = editingImage.filename.split('.').pop();
        if (ext && ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext.toLowerCase())) {
          originalExt = ext.toLowerCase();
        }
      }
      
      newFilename = `${nameWithoutExt}.${originalExt}`;

      // 如果有cosKey，需要更新COS中的文件名
      if (editingImage.cosKey) {
        // 调用后端API更新COS中的文件名
        const response = await fetch(`/api/questions/cos/rename`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            oldCosKey: editingImage.cosKey,
            newFilename: newFilename
          })
        });

        if (!response.ok) {
          throw new Error('更新COS文件名失败');
        }
      }

      // 更新前端状态
      const updatedImages = images.map(img =>
        img.id === editingImage.id ? { ...img, filename: newFilename } : img
      );
      onImagesChange(updatedImages);
      
      // 显示成功提示
      showSuccessRightSlide('名称更新成功', `图片名称已更新为 "${newFilename}"`);
      
      // 保存成功后关闭模态框并重置状态
      setEditingImage(null);
      setIsEditNameModalOpen(false);
    } catch (error) {
      console.error('更新图片名称失败:', error);
      showErrorRightSlide('更新失败', '更新图片名称失败，请重试');
    } finally {
      setIsRenaming(false);
    }
  }, [editingImage, images, onImagesChange, showSuccessRightSlide, showErrorRightSlide, token]);



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
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          题目图片 ({images.length}/{maxImages})
        </h3>
        <button
          onClick={handleClickUpload}
          disabled={isUploading || images.length >= maxImages}
          className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-blue-500 dark:hover:bg-blue-600 transition-all duration-200"
        >
          <Upload className={`w-4 h-4 mr-2 transition-transform duration-200 ${isUploading ? 'animate-pulse' : ''}`} />
          <span className="transition-all duration-200">
            {isUploading ? (
              <span className="inline-flex items-center">
                <span className="animate-pulse">上传中</span>
                <span className="ml-1 animate-bounce">.</span>
                <span className="ml-0.5 animate-bounce" style={{ animationDelay: '0.1s' }}>.</span>
                <span className="ml-0.5 animate-bounce" style={{ animationDelay: '0.2s' }}>.</span>
              </span>
            ) : (
              '上传图片'
            )}
          </span>
        </button>
      </div>

      {/* 拖拽上传区域 */}
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer",
          isDragActive || dragActive
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 hover:border-gray-400 dark:border-gray-600 dark:hover:border-gray-500",
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
            // 清空文件选择，防止重复弹出
            e.target.value = '';
          }}
          className="hidden"
        />
        
        <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          {isDragActive
            ? "释放文件以上传"
            : "拖拽图片文件到这里，或点击上传按钮"}
        </p>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          支持 JPG、PNG、GIF 格式，单个文件最大 5MB
        </p>
      </div>

      {/* 上传状态显示 */}
      <ModernUploadSpinner
        isUploading={uploadStatus === 'uploading' || isUploading}
        progress={uploadProgress}
        error={uploadError}
        success={uploadStatus === 'success'}
        currentFile={pendingFile?.name}
        totalFiles={pendingFiles.length}
        className="mt-4"
      />

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
                className="flex items-center space-x-3 p-3 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700"
              >
                {/* 拖拽手柄 */}
                <div className="cursor-move text-gray-400 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300">
                  <GripVertical className="w-5 h-5" />
                </div>

                {/* 图片预览 */}
                <div className="flex-shrink-0">
                  <img
                    src={image.url}
                    alt={image.filename}
                    className="w-16 h-16 object-cover rounded border border-gray-200 dark:border-gray-700"
                    onError={(e) => {
                      // 图片加载失败时的处理
                      console.error('❌ 图片加载失败:', image.url, '图片对象:', image);
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      // 可以在这里添加一个占位符或错误提示
                    }}
                    onLoad={() => {
                      showSuccessRightSlide('图片加载成功', `图片 "${image.filename}" 加载成功`);
                    }}
                  />
                </div>

                {/* 图片信息 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <p className="text-sm font-medium text-gray-900 truncate dark:text-gray-100">
                      {image.filename}
                    </p>
                    <button
                      onClick={() => handleEditImageName(image)}
                      className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      title="编辑名称"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {image.format.toUpperCase()} • {image.uploadedAt instanceof Date ? image.uploadedAt.toLocaleDateString() : new Date(image.uploadedAt).toLocaleDateString()}
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

      {/* 自定义输入框模态框 */}
      <CustomInputModal
        isOpen={isInputModalOpen}
        onClose={() => {
          setIsInputModalOpen(false);
          setPendingFiles([]);
          setPendingFile(null);
          setPendingFileIndex(0);
        }}
        onSubmit={handleCustomNameSubmit}
        title={`为图片命名 (${pendingFileIndex + 1}/${pendingFiles.length})`}
        placeholder={`请输入图片 "${pendingFile?.name}" 的描述性名称`}
        defaultValue={pendingFile?.name.replace(/\.[^/.]+$/, '') || ''}
        submitText="上传"
        cancelText="取消"
        maxLength={50}
        required={false}
      />

      {/* 编辑图片名称模态框 */}
      <CustomInputModal
        isOpen={isEditNameModalOpen}
        onClose={() => {
          setIsEditNameModalOpen(false);
          setEditingImage(null);
        }}
        onSubmit={handleEditNameSubmit}
        title="编辑图片名称"
        placeholder="请输入新的图片名称"
        defaultValue={editingImage?.filename || ''}
        submitText="保存"
        cancelText="取消"
        maxLength={50}
        required={true}
        isLoading={isRenaming}
      />

      {/* 确认弹窗 */}
      <ConfirmModal
        {...confirmModal}
        onCancel={closeConfirm}
      />

      {/* 右侧提示弹窗 */}
      <RightSlideModal
        {...rightSlideModal}
        onClose={closeRightSlide}
      />
    </div>
  );
};
