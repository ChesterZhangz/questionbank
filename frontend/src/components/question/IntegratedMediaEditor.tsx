import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Image, Palette, Plus, Trash2, Upload } from 'lucide-react';
import TikZHighlightInput from '../tikz/core/TikZHighlightInput';
import TikZPreview from '../tikz/core/TikZPreview';
import { QuestionImageManager } from './QuestionImageManager';
import { useAuthStore } from '../../stores/authStore';
import { CustomInputModal } from '../ui/CustomInputModal';
import { useModal } from '../../hooks/useModal';

import Button from '../ui/Button';

interface TikZCode {
  id: string;
  code: string;
  format: 'svg' | 'png';
  order: number;
}

interface QuestionImage {
  id: string;
  bid: string;
  url: string;
  filename: string;
  order: number;
  format: string;
  uploadedAt: Date;
  uploadedBy: string;
  cosKey?: string; // 腾讯云COS的键值
}

interface IntegratedMediaEditorProps {
  bid?: string; // 题库ID，用于图片上传
  tikzCodes: TikZCode[];
  onTikzCodesChange: (codes: TikZCode[]) => void;
  images?: QuestionImage[];
  onImagesChange?: (images: QuestionImage[]) => void;
  className?: string;
}

const IntegratedMediaEditor: React.FC<IntegratedMediaEditorProps> = ({
  bid,
  tikzCodes,
  onTikzCodesChange,
  images = [],
  onImagesChange: _onImagesChange = () => {},
  className = ''
}) => {
  const { token } = useAuthStore();
  const { showSuccessRightSlide, showErrorRightSlide } = useModal();
  const [activeTab, setActiveTab] = useState<'images' | 'tikz'>('images');
  const [editingTikzId, setEditingTikzId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  // 自定义输入框状态
  const [isInputModalOpen, setIsInputModalOpen] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [pendingFileIndex, setPendingFileIndex] = useState(0);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);

  // 添加新的 TikZ 代码
  const handleAddTikZ = () => {
    const newTikZ: TikZCode = {
      id: `tikz-${Date.now()}`,
      code: '\\draw [thick] (0,0) -- (2,2);',
      format: 'svg',
      order: tikzCodes.length
    };
    
    const updatedCodes = [...tikzCodes, newTikZ];
    onTikzCodesChange(updatedCodes);
    setEditingTikzId(newTikZ.id);
  };

  // 删除 TikZ 代码
  const handleDeleteTikZ = (id: string) => {
    const updatedCodes = tikzCodes.filter(code => code.id !== id);
    onTikzCodesChange(updatedCodes);
    if (editingTikzId === id) {
      setEditingTikzId(null);
    }
  };

  // 更新 TikZ 代码
  const handleUpdateTikZCode = (id: string, code: string) => {
    const updatedCodes = tikzCodes.map(tikz => 
      tikz.id === id ? { ...tikz, code } : tikz
    );
    onTikzCodesChange(updatedCodes);
  };

  // 处理自定义名称输入
  const handleCustomNameSubmit = useCallback(async (customName: string) => {
    if (!pendingFile || !bid) return;

    setIsUploading(true);

    try {
      // 检查文件大小（限制为5MB）
      if (pendingFile.size > 5 * 1024 * 1024) {
        alert(`文件 ${pendingFile.name} 过大，请选择小于5MB的图片`);
        return;
      }

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
          url: uploadResult.data.url,
          filename: uploadResult.data.filename || pendingFile.name,
          order: images.length + pendingFileIndex,
          format: uploadResult.data.format || pendingFile.type.split('/')[1] || 'unknown',
          uploadedAt: new Date(uploadResult.data.uploadedAt || Date.now()),
          uploadedBy: uploadResult.data.uploadedBy || 'current-user',
          cosKey: uploadResult.data.cosKey
        };
        
        // 更新图片列表
        const updatedImages = [...images, newImage];
        _onImagesChange(updatedImages);
        
        // 显示成功提示
        showSuccessRightSlide('上传成功', `图片 "${customName || pendingFile.name}" 上传成功`);
      } else {
        throw new Error(uploadResult.error || '图片上传失败');
      }
    } catch (uploadError) {
      console.error('图片上传失败:', uploadError);
      const errorMessage = uploadError instanceof Error ? uploadError.message : '图片上传失败';
      showErrorRightSlide('上传失败', `图片 ${pendingFile.name} 上传失败: ${errorMessage}`);
    } finally {
      // 处理下一个文件或完成
      const nextIndex = pendingFileIndex + 1;
      if (nextIndex < pendingFiles.length) {
        setPendingFileIndex(nextIndex);
        setPendingFile(pendingFiles[nextIndex]);
        setIsInputModalOpen(true);
      } else {
        // 所有文件处理完成
        setIsUploading(false);
        setPendingFiles([]);
        setPendingFile(null);
        setPendingFileIndex(0);
      }
    }
  }, [pendingFile, pendingFileIndex, pendingFiles, bid, token, images, _onImagesChange]);

  // 图片上传处理
  const handleImageUpload = () => {
    if (!bid) {
      alert('题库ID不存在，无法上传图片');
      return;
    }

    // 创建隐藏的文件输入元素
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.multiple = true;
    
    fileInput.onchange = (event) => {
      const target = event.target as HTMLInputElement;
      const files = target.files;
      
      if (files && files.length > 0) {
        // 设置待处理的文件列表
        setPendingFiles(Array.from(files));
        setPendingFileIndex(0);
        setPendingFile(files[0]);
        setIsInputModalOpen(true);
      }
      
      // 清理文件输入
      fileInput.remove();
    };
    
    // 触发文件选择
    fileInput.click();
  };

  const totalMediaCount = images.length + tikzCodes.length;

  return (
    <div className={className}>
      <div className="space-y-4">
        {/* 媒体统计 */}
        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Image className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                图片: {images.length}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Palette className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                TikZ: {tikzCodes.length}
              </span>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              总计: {totalMediaCount}/6
            </div>
          </div>
          
          <div className="flex items-center space-x-1 bg-white dark:bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('images')}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors flex items-center space-x-1 ${
                activeTab === 'images'
                  ? 'bg-blue-500 text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
              }`}
            >
              <Image className="w-4 h-4" />
              <span>图片</span>
            </button>
            <button
              onClick={() => setActiveTab('tikz')}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors flex items-center space-x-1 ${
                activeTab === 'tikz'
                  ? 'bg-purple-500 text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
              }`}
            >
              <Palette className="w-4 h-4" />
              <span>TikZ</span>
            </button>
          </div>
        </div>

        {/* 内容区域 */}
        <AnimatePresence mode="wait">
          {activeTab === 'images' ? (
            <motion.div
              key="images"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {images.length === 0 ? (
                <div className="text-center py-12">
                  <Image className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    还没有添加图片
                  </p>
                  <Button
                    variant="outline"
                    onClick={handleImageUpload}
                    disabled={isUploading}
                    className="flex items-center space-x-2 mx-auto"
                  >
                    <Upload className="w-4 h-4" />
                    <span>{isUploading ? '上传中...' : '上传图片'}</span>
                  </Button>
                </div>
              ) : (
                <QuestionImageManager
                  bid={bid}
                  images={images}
                  onImagesChange={_onImagesChange}
                  maxImages={3}
                  className="w-full"
                />
              )}
            </motion.div>
          ) : (
            <motion.div
              key="tikz"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {tikzCodes.length === 0 ? (
                <div className="text-center py-12">
                  <Palette className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    还没有添加 TikZ 图形
                  </p>
                  <Button
                    variant="outline"
                    onClick={handleAddTikZ}
                    className="flex items-center space-x-2 mx-auto"
                  >
                    <Plus className="w-4 h-4" />
                    <span>添加 TikZ 图形</span>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* TikZ 图形列表 */}
                  {tikzCodes.map((tikz, index) => (
                    <motion.div
                      key={tikz.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`border rounded-lg p-4 transition-all duration-200 ${
                        editingTikzId === tikz.id
                          ? 'border-purple-500 dark:border-purple-400 bg-purple-50 dark:bg-purple-900/20'
                          : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-gray-900 dark:text-gray-100">
                          图形 {index + 1}
                        </h4>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteTikZ(tikz.id)}
                            className="text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                          >
                            <Trash2 className="w-3 w-3" />
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                        {/* 左侧：代码编辑 */}
                        <div className="space-y-3">
                          <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            TikZ 代码：
                          </h5>
                          <TikZHighlightInput
                            value={tikz.code}
                            onChange={(code: string) => handleUpdateTikZCode(tikz.id, code)}
                            placeholder="输入TikZ代码..."
                            rows={12}
                            enableAutoComplete={true}
                            className="w-full"
                            style={{
                              fontFamily: 'monospace',
                              fontSize: '14px',
                              lineHeight: '1.5'
                            }}
                          />
                        </div>
                        
                        {/* 右侧：实时预览 - 与编辑区域对齐 */}
                        <div className="space-y-3">
                          <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            图形预览：
                          </h5>
                          <div className="flex justify-center items-start h-full">
                            <TikZPreview
                              code={tikz.code}
                              format={tikz.format}
                              width={280}
                              height={300}
                              showGrid={false}
                              showTitle={false}
                              className="w-full"
                            />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}

                  {/* 添加新图形按钮 */}
                  {tikzCodes.length < 3 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex justify-center"
                    >
                      <Button
                        variant="outline"
                        onClick={handleAddTikZ}
                        className="flex items-center space-x-2"
                      >
                        <Plus className="w-4 h-4" />
                        <span>添加 TikZ 图形</span>
                      </Button>
                    </motion.div>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

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
    </div>
  );
};

export default IntegratedMediaEditor;
