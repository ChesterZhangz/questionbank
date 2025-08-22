import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Image as ImageIcon, 
  Code, 
  ChevronDown, 
  ChevronRight,
  Settings,
  Info
} from 'lucide-react';
import { QuestionImageManager } from './QuestionImageManager';
import type { QuestionImage } from './QuestionImageManager';
import { TikZEditor } from '../tikz/core/TikZEditor';
import type { TikZCode } from '../tikz/core/TikZEditor';
import { TikZRenderer } from '../tikz/core/TikZRenderer';
import { cn } from '../../lib/utils';

interface QuestionMediaManagerProps {
  questionId: string;
  images?: QuestionImage[];
  tikzCodes?: TikZCode[];
  onImagesChange?: (images: QuestionImage[]) => void;
  onTikZCodesChange?: (tikzCodes: TikZCode[]) => void;
  className?: string;
}

export const QuestionMediaManager: React.FC<QuestionMediaManagerProps> = ({
  questionId,
  images = [],
  tikzCodes = [],
  onImagesChange,
  onTikZCodesChange,
  className
}) => {
  const [activeTab, setActiveTab] = useState<'images' | 'tikz'>('images');
  const [expandedSections, setExpandedSections] = useState({
    images: true,
    tikz: true,
    preview: false
  });

  // 切换标签页
  const handleTabChange = useCallback((tab: 'images' | 'tikz') => {
    setActiveTab(tab);
  }, []);

  // 切换区域展开状态
  const toggleSection = useCallback((section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  }, []);

  // 处理图片变化
  const handleImagesChange = useCallback((newImages: QuestionImage[]) => {
    onImagesChange?.(newImages);
  }, [onImagesChange]);

  // 处理TikZ代码变化
  const handleTikZCodesChange = useCallback((newTikZCodes: TikZCode[]) => {
    onTikZCodesChange?.(newTikZCodes);
  }, [onTikZCodesChange]);

  // 重新生成TikZ预览
  const handleRegenerateTikZ = useCallback(() => {
    // 这里可以调用后端API重新生成预览
    // 调试日志已清理
  }, []);

  return (
    <div className={cn("space-y-6", className)}>
      {/* 标题和统计 */}
      <div className="border-b border-gray-200">
        <div className="flex items-center justify-between pb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">题目媒体管理</h2>
            <p className="text-sm text-gray-600 mt-1">
              管理题目的图片和TikZ图形，提升题目的可视化效果
            </p>
          </div>
          
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center space-x-2">
              <ImageIcon className="w-4 h-4" />
              <span>{images.length} 张图片</span>
            </div>
            <div className="flex items-center space-x-2">
              <Code className="w-4 h-4" />
              <span>{tikzCodes.length} 个TikZ图形</span>
            </div>
          </div>
        </div>

        {/* 标签页切换 */}
        <div className="flex space-x-8">
          <button
            onClick={() => handleTabChange('images')}
            className={cn(
              "pb-4 px-1 border-b-2 font-medium text-sm transition-colors",
              activeTab === 'images'
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            )}
          >
            <ImageIcon className="w-4 h-4 inline mr-2" />
            图片管理
          </button>
          <button
            onClick={() => handleTabChange('tikz')}
            className={cn(
              "pb-4 px-1 border-b-2 font-medium text-sm transition-colors",
              activeTab === 'tikz'
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            )}
          >
            <Code className="w-4 h-4 inline mr-2" />
            TikZ图形
          </button>
        </div>
      </div>

      {/* 内容区域 */}
      <div className="space-y-6">
        {/* 图片管理区域 */}
        <AnimatePresence mode="wait">
          {activeTab === 'images' && (
            <motion.div
              key="images"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <div className="bg-white border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                  <button
                    onClick={() => toggleSection('images')}
                    className="flex items-center space-x-2 text-lg font-semibold text-gray-900 hover:text-blue-600"
                  >
                    {expandedSections.images ? (
                      <ChevronDown className="w-5 h-5" />
                    ) : (
                      <ChevronRight className="w-5 h-5" />
                    )}
                    <span>图片管理</span>
                  </button>
                  
                  <div className="flex items-center space-x-2">
                    <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md">
                      <Settings className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md">
                      <Info className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <AnimatePresence>
                  {expandedSections.images && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="p-4">
                        <QuestionImageManager
                          questionId={questionId}
                          images={images}
                          onImagesChange={handleImagesChange}
                          maxImages={5}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* TikZ管理区域 */}
        <AnimatePresence mode="wait">
          {activeTab === 'tikz' && (
            <motion.div
              key="tikz"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <div className="bg-white border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                  <button
                    onClick={() => toggleSection('tikz')}
                    className="flex items-center space-x-2 text-lg font-semibold text-gray-900 hover:text-blue-600"
                  >
                    {expandedSections.tikz ? (
                      <ChevronDown className="w-5 h-5" />
                    ) : (
                      <ChevronRight className="w-5 h-5" />
                    )}
                    <span>TikZ图形管理</span>
                  </button>
                  
                  <div className="flex items-center space-x-2">
                    <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md">
                      <Settings className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md">
                      <Info className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <AnimatePresence>
                  {expandedSections.tikz && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="p-4">
                        <TikZEditor
                          tikzCodes={tikzCodes}
                          onTikZCodesChange={handleTikZCodesChange}
                          maxTikZCodes={3}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 预览区域 */}
        <div className="bg-white border border-gray-200 rounded-lg">
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <button
              onClick={() => toggleSection('preview')}
              className="flex items-center space-x-2 text-lg font-semibold text-gray-900 hover:text-blue-600"
            >
              {expandedSections.preview ? (
                <ChevronDown className="w-5 h-5" />
              ) : (
                <ChevronRight className="w-5 h-5" />
              )}
              <span>媒体预览</span>
            </button>
            
            <div className="text-sm text-gray-500">
              实时预览题目的图片和TikZ图形
            </div>
          </div>
          
          <AnimatePresence>
            {expandedSections.preview && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="p-4 space-y-6">
                  {/* 图片预览 */}
                  {images.length > 0 && (
                    <div>
                      <h4 className="text-lg font-medium text-gray-900 mb-3">图片预览</h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {images.map((image, index) => (
                          <div key={image.id} className="border border-gray-200 rounded-lg overflow-hidden">
                            <img
                              src={image.url}
                              alt={image.filename}
                              className="w-full h-32 object-cover"
                            />
                            <div className="p-2 bg-gray-50">
                              <p className="text-xs text-gray-600 truncate">{image.filename}</p>
                              <p className="text-xs text-gray-500">#{index + 1}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* TikZ图形预览 */}
                  {tikzCodes.length > 0 && (
                    <div>
                      <h4 className="text-lg font-medium text-gray-900 mb-3">TikZ图形预览</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {tikzCodes.map((tikzCode) => (
                          <TikZRenderer
                            key={tikzCode.id}
                            tikzCode={tikzCode}
                            showControls={false}
                            onRegenerate={handleRegenerateTikZ}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 空状态 */}
                  {images.length === 0 && tikzCodes.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                      <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <ImageIcon className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-lg font-medium">暂无媒体内容</p>
                      <p className="text-sm">添加图片或TikZ图形来丰富题目内容</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* 底部信息 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-800">
            <h4 className="font-medium mb-2">使用提示</h4>
            <ul className="space-y-1 text-xs">
              <li>• 图片支持拖拽上传，最大5MB，支持JPG、PNG、GIF格式</li>
              <li>• TikZ图形支持模拟渲染（无需后端）和真实渲染（需要LaTeX环境）</li>
              <li>• 可以调整图片和TikZ图形的显示顺序</li>
              <li>• 所有媒体内容都会自动保存到题目中</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
