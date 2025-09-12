import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Image, Palette, Plus, Trash2, Upload } from 'lucide-react';
import TikZHighlightInput from '../tikz/core/TikZHighlightInput';
import { useAuthStore } from '../../stores/authStore';
import { useTranslation } from '../../hooks/useTranslation';

import Button from '../ui/Button';

interface TikZCode {
  id: string;
  code: string;
  format: 'svg' | 'png';
  order: number;
}

interface QuestionImage {
  id: string;
  url: string;
  filename: string;
  order: number;
}

interface BatchEditMediaEditorProps {
  tikzCodes: TikZCode[];
  onTikzCodesChange: (codes: TikZCode[]) => void;
  images?: QuestionImage[];
  onImagesChange?: (images: QuestionImage[]) => void;
  bid?: string; // 题库ID，用于图片上传
  className?: string;
}

const BatchEditMediaEditor: React.FC<BatchEditMediaEditorProps> = ({
  tikzCodes,
  onTikzCodesChange,
  images = [],
  onImagesChange: _onImagesChange = () => {},
  bid,
  className = ''
}) => {
  const { t } = useTranslation();
  const { token } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'images' | 'tikz'>('images');
  const [editingTikzId, setEditingTikzId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);




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

  // 图片上传处理
  const handleImageUpload = async () => {
    if (!bid) {
      alert(t('question.batchEditMediaEditor.bankIdMissing'));
      return;
    }

    // 创建隐藏的文件输入元素
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.multiple = true;
    
    fileInput.onchange = async (event) => {
      const target = event.target as HTMLInputElement;
      const files = target.files;
      
      if (files && files.length > 0) {
        setIsUploading(true);
        
        try {
          const newImages: QuestionImage[] = [];
          
          for (let i = 0; i < files.length; i++) {
            const file = files[i];
            
            // 检查文件大小（限制为5MB）
            if (file.size > 5 * 1024 * 1024) {
              alert(t('question.batchEditMediaEditor.fileTooLarge', { filename: file.name }));
              continue;
            }
            
            try {
              // 创建FormData用于文件上传
              const formData = new FormData();
              formData.append('image', file);
              formData.append('bid', bid);
              
              // 调用临时图片上传API
              const response = await fetch('/api/questions/upload', {
                method: 'POST',
                body: formData,
                headers: {
                  'Authorization': `Bearer ${token}`
                }
              });

              if (!response.ok) {
                throw new Error(t('question.batchEditMediaEditor.uploadFailed'));
              }

              const uploadResult = await response.json();
              
              if (uploadResult.success) {
                const newImage: QuestionImage = {
                  id: uploadResult.data.id,
                  url: uploadResult.data.url,
                  filename: uploadResult.data.filename || file.name,
                  order: images.length + i
                };
                
                newImages.push(newImage);
              } else {
                throw new Error(uploadResult.error || t('question.batchEditMediaEditor.uploadFailed'));
              }
            } catch (uploadError) {
              console.error('单个图片上传失败:', uploadError);
              alert(t('question.batchEditMediaEditor.singleUploadFailed', { filename: file.name, error: String(uploadError) }));
              continue;
            }
          }
          
          // 更新图片列表
          if (newImages.length > 0) {
            const updatedImages = [...images, ...newImages];
            _onImagesChange(updatedImages);
          }
        } catch (error) {
          console.error('图片上传失败:', error);
          alert(t('question.batchEditMediaEditor.uploadFailedRetry'));
        } finally {
          setIsUploading(false);
        }
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
                {t('question.batchEditMediaEditor.images')}: {images.length}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Palette className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                TikZ: {tikzCodes.length}
              </span>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {t('question.batchEditMediaEditor.total')}: {totalMediaCount}/6
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
              <span>{t('question.batchEditMediaEditor.images')}</span>
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

        {/* 内容区域 - 只显示编辑信息，不显示预览 */}
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
                    {t('question.batchEditMediaEditor.noImagesAdded')}
                  </p>
                  <Button
                    variant="outline"
                    onClick={handleImageUpload}
                    disabled={isUploading}
                    className="flex items-center space-x-2 mx-auto"
                  >
                    <Upload className="w-4 h-4" />
                    <span>{isUploading ? t('question.batchEditMediaEditor.uploading') : t('question.batchEditMediaEditor.uploadImages')}</span>
                  </Button>
                </div>
              ) : (
                <div>
                  {/* 图片信息列表（仅显示文件名和操作按钮） */}
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    {t('question.batchEditMediaEditor.uploadedImages')}：
                  </h4>
                  <div className="space-y-3">
                    {images.map((image, index) => (
                      <motion.div
                        key={image.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600"
                      >
                        <div className="flex items-center space-x-3">
                          <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 flex items-center justify-center text-xs font-medium">
                            {index + 1}
                          </span>
                          <div>
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                              {image.filename}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {t('question.batchEditMediaEditor.image')} {index + 1}
                            </p>
                          </div>
                        </div>
                        <button 
                          onClick={() => {
                            // 删除图片
                            const updatedImages = images.filter(img => img.id !== image.id);
                            _onImagesChange(updatedImages);
                          }}
                          className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </motion.div>
                    ))}
                    
                    {images.length < 3 && (
                      <motion.button
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        onClick={handleImageUpload}
                        className="w-full p-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex flex-col items-center justify-center text-gray-500 dark:text-gray-400 hover:border-blue-400 dark:hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      >
                        <Plus className="w-6 h-6 mb-2" />
                        <span className="text-sm font-medium">{t('question.batchEditMediaEditor.uploadMoreImages')}</span>
                        <span className="text-xs opacity-75">{t('question.batchEditMediaEditor.supportedFormats')}</span>
                      </motion.button>
                    )}
                  </div>
                </div>
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
                    {t('question.batchEditMediaEditor.noTikzAdded')}
                  </p>
                  <Button
                    variant="outline"
                    onClick={handleAddTikZ}
                    className="flex items-center space-x-2 mx-auto"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{t('question.batchEditMediaEditor.addTikzCode')}</span>
                  </Button>
                </div>
              ) : (
                <div>
                  {/* TikZ 代码列表（仅显示代码编辑器） */}
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    {t('question.batchEditMediaEditor.tikzCode')}：
                  </h4>
                  <div className="space-y-4">
                    {tikzCodes.map((tikz, index) => (
                      <motion.div
                        key={tikz.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 overflow-hidden"
                      >
                        <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-600">
                          <h5 className="text-sm font-medium text-gray-700 dark:text-gray-200">
                            {t('question.batchEditMediaEditor.tikzGraphic')} {index + 1}
                          </h5>
                          <button
                            onClick={() => handleDeleteTikZ(tikz.id)}
                            className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="p-3">
                          <TikZHighlightInput
                            value={tikz.code}
                            onChange={(code) => handleUpdateTikZCode(tikz.id, code)}
                            placeholder={t('question.batchEditMediaEditor.enterTikzCode')}
                            className="w-full"
                          />
                        </div>
                      </motion.div>
                    ))}
                    
                    {tikzCodes.length < 3 && (
                      <motion.button
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        onClick={handleAddTikZ}
                        className="w-full p-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex flex-col items-center justify-center text-gray-500 dark:text-gray-400 hover:border-purple-400 dark:hover:border-purple-500 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                      >
                        <Plus className="w-6 h-6 mb-2" />
                        <span className="text-sm font-medium">{t('question.batchEditMediaEditor.addMoreTikzCode')}</span>
                        <span className="text-xs opacity-75">{t('question.batchEditMediaEditor.createGraphics')}</span>
                      </motion.button>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default BatchEditMediaEditor;
