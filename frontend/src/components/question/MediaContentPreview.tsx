import React from 'react';
import { motion } from 'framer-motion';
import { Image, Palette } from 'lucide-react';
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

interface MediaContentPreviewProps {
  tikzCodes: TikZCode[];
  images?: QuestionImage[];
  className?: string;
}

const MediaContentPreview: React.FC<MediaContentPreviewProps> = ({
  tikzCodes,
  images = [],
  className = ''
}) => {
  const hasMedia = tikzCodes.length > 0 || images.length > 0;

  if (!hasMedia) {
    return null;
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center space-x-2 mb-4">
        <div className="flex items-center space-x-1">
          {images.length > 0 && <Image className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
          {tikzCodes.length > 0 && <Palette className="w-4 h-4 text-purple-600 dark:text-purple-400" />}
        </div>
        <h4 className="font-medium text-gray-900 dark:text-gray-100">题目媒体内容</h4>
      </div>

      <div className="space-y-6">
        {/* 图片预览 */}
        {images.length > 0 && (
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <Image className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <h5 className="text-sm font-medium text-gray-700 dark:text-gray-200">图片</h5>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {images.map((image, index) => (
                <motion.div
                  key={image.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-600"
                >
                  <div className="text-xs font-medium text-gray-700 dark:text-gray-200 mb-2">
                    图片 {index + 1}
                  </div>
                  <img
                    src={image.url}
                    alt={image.filename}
                    className="w-full h-32 object-cover rounded border border-gray-100 dark:border-gray-700"
                  />
                  <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 truncate">
                    {image.filename}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* TikZ 图形预览 */}
        {tikzCodes.length > 0 && (
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <Palette className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <h5 className="text-sm font-medium text-gray-700 dark:text-gray-200">TikZ 图形</h5>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tikzCodes.map((tikz, index) => (
                <motion.div
                  key={tikz.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: (images.length + index) * 0.1 }}
                  className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-600"
                >
                  <div className="text-xs font-medium text-gray-700 dark:text-gray-200 mb-2">
                    图形 {index + 1}
                  </div>
                  <div className="flex justify-center">
                    <TikZPreview
                      code={tikz.code}
                      format={tikz.format}
                      width={280}
                      height={180}
                      showGrid={false}
                      showTitle={false}
                      className="border border-gray-100 dark:border-gray-700 rounded"
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MediaContentPreview;
