import React from 'react';
import { motion } from 'framer-motion';
import { Palette } from 'lucide-react';
import TikZPreview from './TikZPreview';

interface TikZCode {
  id: string;
  code: string;
  format: 'svg' | 'png';
  order: number;
}

interface TikZContentPreviewProps {
  tikzCodes: TikZCode[];
  className?: string;
}

const TikZContentPreview: React.FC<TikZContentPreviewProps> = ({
  tikzCodes,
  className = ''
}) => {
  if (tikzCodes.length === 0) {
    return null;
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center space-x-2 mb-4">
        <Palette className="w-4 h-4 text-purple-600 dark:text-purple-400" />
        <h4 className="font-medium text-gray-900 dark:text-gray-100">题目图形</h4>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tikzCodes.map((tikz, index) => (
          <motion.div
            key={tikz.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600"
          >
            <div className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              图形 {index + 1}
            </div>
            <div className="flex justify-center">
              <TikZPreview
                code={tikz.code}
                format={tikz.format}
                width={300}
                height={200}
                showGrid={false}
                showTitle={false}
                className="border border-gray-100 dark:border-gray-700 rounded"
              />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default TikZContentPreview;
