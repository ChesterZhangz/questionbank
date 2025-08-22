import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, X } from 'lucide-react';
import TikZPreview from '../tikz/core/TikZPreview';

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

interface SimpleMediaPreviewProps {
  tikzCodes: TikZCode[];
  images?: QuestionImage[];
  className?: string;
}

const SimpleMediaPreview: React.FC<SimpleMediaPreviewProps> = ({
  tikzCodes,
  images = [],
  className = ''
}) => {
  const [showMedia, setShowMedia] = useState(true);
  const [previewMedia, setPreviewMedia] = useState<{ 
    type: 'image' | 'tikz'; 
    url?: string; 
    filename?: string; 
    code?: string; 
    format?: 'svg' | 'png';
  } | null>(null);
  
  const hasMedia = tikzCodes.length > 0 || images.length > 0;

  if (!hasMedia) {
    return null;
  }

  // 合并所有媒体项，按顺序排列
  const allMediaItems = [
    ...images.map(img => ({ type: 'image' as const, data: img, order: img.order })),
    ...tikzCodes.map(tikz => ({ type: 'tikz' as const, data: tikz, order: tikz.order }))
  ].sort((a, b) => a.order - b.order);

  return (
    <div className={className}>
      {/* 控制按钮 */}
      <div className="flex items-center justify-between mb-3">
        <h5 className="text-sm font-medium text-gray-700 dark:text-gray-200">
          题目图形 ({allMediaItems.length})
        </h5>
        <button
          onClick={() => setShowMedia(!showMedia)}
          className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
        >
          {showMedia ? (
            <>
              <EyeOff className="w-3 h-3" />
              <span>隐藏</span>
            </>
          ) : (
            <>
              <Eye className="w-3 h-3" />
              <span>显示</span>
            </>
          )}
        </button>
      </div>

      <AnimatePresence>
        {showMedia && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            {/* 横向滚动的图形容器 */}
            <div className="flex space-x-4 overflow-x-auto pb-3 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
              {allMediaItems.map((item, index) => (
                <motion.div
                  key={`${item.type}-${item.data.id}`}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex-shrink-0"
                >
                  <div className="w-48 h-36 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 overflow-hidden shadow-sm">
                    {item.type === 'image' ? (
                      <div 
                        className="w-full h-full cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => setPreviewMedia({ 
                          type: 'image', 
                          url: item.data.url, 
                          filename: item.data.filename 
                        })}
                      >
                        <img
                          src={item.data.url}
                          alt={item.data.filename}
                          className="w-full h-full object-contain bg-gray-50 dark:bg-gray-700"
                        />
                      </div>
                    ) : (
                      <div 
                        className="w-full h-full flex items-center justify-center p-2 cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => setPreviewMedia({ 
                          type: 'tikz', 
                          code: item.data.code, 
                          format: item.data.format 
                        })}
                      >
                        <TikZPreview
                          code={item.data.code}
                          format={item.data.format}
                          width={180}
                          height={130}
                          showGrid={false}
                          showTitle={false}
                          className="max-w-full max-h-full"
                        />
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 媒体预览模态框 */}
      <AnimatePresence>
        {previewMedia && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75"
            onClick={() => setPreviewMedia(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="relative max-w-[90vw] max-h-[90vh] bg-white dark:bg-gray-800 rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* 关闭按钮 */}
              <button
                onClick={() => setPreviewMedia(null)}
                className="absolute top-4 right-4 z-10 p-2 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </button>
              
              {/* 标题 */}
              <div className="absolute top-4 left-4 z-10 px-3 py-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  {previewMedia.type === 'image' ? previewMedia.filename : 'TikZ 图形'}
                </span>
              </div>
              
              {/* 内容 */}
              <div className="p-4">
                {previewMedia.type === 'image' ? (
                  <img
                    src={previewMedia.url}
                    alt={previewMedia.filename}
                    className="max-w-full max-h-full object-contain"
                  />
                ) : (
                  <TikZPreview
                    code={previewMedia.code || ''}
                    format={previewMedia.format || 'svg'}
                    width={800}
                    height={600}
                    showGrid={false}
                    showTitle={false}
                    className="max-w-full max-h-full"
                  />
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SimpleMediaPreview;
