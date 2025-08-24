import React from 'react';
import LaTeXPreview from '../editor/preview/LaTeXPreview';

interface CodeExampleProps {
  title: string;
  code: string;
  description?: string;
  className?: string;
}

const CodeExample: React.FC<CodeExampleProps> = ({ 
  title, 
  code, 
  description, 
  className = "" 
}) => {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 ${className}`}>
      <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">{title}</h4>
      {description && (
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">{description}</p>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 左侧：代码 */}
        <div>
          <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">LaTeX代码：</h5>
          <pre className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg text-xs font-mono text-gray-800 dark:text-gray-200 overflow-x-auto whitespace-pre-wrap break-words">
            {code}
          </pre>
        </div>
        {/* 右侧：渲染结果 */}
        <div>
          <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">渲染结果：</h5>
          <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg min-h-[60px] flex items-center">
            <LaTeXPreview 
              content={code} 
              config={{ mode: 'full' }}
              className="w-full"
              fullWidth={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeExample;
