import React, { useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  Code, 
  Trash2, 
  Plus
} from 'lucide-react';
import TikZHighlightInput from './TikZHighlightInput';
import TikZPreview from './TikZPreview';
import { cn } from '../../../lib/utils';

export interface TikZCode {
  id: string;
  bid: string;
  code: string;
  order: number;
  format: 'svg' | 'png';
  createdAt: Date;
  createdBy: string;
}

interface TikZEditorProps {
  tikzCodes: TikZCode[];
  onTikZCodesChange: (codes: TikZCode[]) => void;
  maxTikZCodes?: number;
  className?: string;
}

export const TikZEditor: React.FC<TikZEditorProps> = ({
  tikzCodes = [],
  onTikZCodesChange,
  maxTikZCodes = 3,
  className
}) => {
  const [activeTikZId, setActiveTikZId] = React.useState<string | null>(null);

  // 默认TikZ代码模板
  const defaultTikZCode = `\\begin{tikzpicture}
\\draw[thick, blue] (0,0) circle (1cm);
\\draw[thick, red] (2,0) circle (1cm);
\\draw[thick, green] (1,1.5) circle (1cm);
\\end{tikzpicture}`;

  // 添加新的TikZ代码
  const handleAddTikZ = useCallback(() => {
    if (tikzCodes.length >= maxTikZCodes) {
      alert(`最多只能添加${maxTikZCodes}个TikZ图形`);
      return;
    }

    const newTikZ: TikZCode = {
      id: `tikz_${Date.now()}`,
      bid: 'temp-bid',
      code: defaultTikZCode,
      order: tikzCodes.length,
      format: 'svg',
      createdAt: new Date(),
      createdBy: 'current-user'
    };

    const updatedTikZCodes = [...tikzCodes, newTikZ];
    onTikZCodesChange(updatedTikZCodes);
    setActiveTikZId(newTikZ.id);
  }, [tikzCodes, maxTikZCodes, onTikZCodesChange]);

  // 删除TikZ代码
  const handleDeleteTikZ = useCallback((tikzId: string) => {
    const updatedTikZCodes = tikzCodes.filter(tikz => tikz.id !== tikzId);
    onTikZCodesChange(updatedTikZCodes);
    
    if (activeTikZId === tikzId) {
      setActiveTikZId(null);
    }
  }, [tikzCodes, onTikZCodesChange, activeTikZId]);

  // 更新TikZ代码
  const handleUpdateTikZCode = useCallback((tikzId: string, code: string) => {
    const updatedTikZCodes = tikzCodes.map(tikz => 
      tikz.id === tikzId ? { ...tikz, code } : tikz
    );
    onTikZCodesChange(updatedTikZCodes);
  }, [tikzCodes, onTikZCodesChange]);

  // 更新TikZ格式
  const handleUpdateTikZFormat = useCallback((tikzId: string, format: 'svg' | 'png') => {
    const updatedTikZCodes = tikzCodes.map(tikz => 
      tikz.id === tikzId ? { ...tikz, format } : tikz
    );
    onTikZCodesChange(updatedTikZCodes);
  }, [tikzCodes, onTikZCodesChange]);

  return (
    <div className={cn("space-y-4", className)}>
      {/* 头部 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Code className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            TikZ图形管理
          </h3>
          <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-xs">
            {tikzCodes.length}/{maxTikZCodes}
          </span>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleAddTikZ}
          disabled={tikzCodes.length >= maxTikZCodes}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>添加TikZ图形</span>
        </motion.button>
      </div>

      {/* TikZ代码列表 */}
      <div className="space-y-4">
        {tikzCodes.map((tikzCode) => (
          <motion.div
            key={tikzCode.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
          >
            {/* 头部工具栏 */}
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  TikZ图形 #{tikzCode.order + 1}
                </span>
                
                {/* 格式选择 */}
                <select
                  value={tikzCode.format}
                  onChange={(e) => handleUpdateTikZFormat(tikzCode.id, e.target.value as 'svg' | 'png')}
                  className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="svg">SVG</option>
                  <option value="png">PNG</option>
                </select>
              </div>

              <div className="flex items-center space-x-2">
                {/* 删除按钮 */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleDeleteTikZ(tikzCode.id)}
                  className="flex items-center space-x-2 px-3 py-1.5 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="text-sm">删除</span>
                </motion.button>
              </div>
            </div>

            {/* 编辑和预览区域 */}
            <div className="grid grid-cols-2 gap-4 p-4">
              {/* 代码编辑区域 */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  TikZ代码
                </label>
                          <TikZHighlightInput
            value={tikzCode.code}
            onChange={(code: string) => handleUpdateTikZCode(tikzCode.id, code)}
            placeholder="输入TikZ代码..."
            rows={12}
            enableAutoComplete={true}
            className="border border-gray-300 dark:border-gray-600 rounded-md"
            style={{
              fontFamily: 'monospace',
              fontSize: '14px',
              lineHeight: '1.5'
            }}
          />
              </div>

              {/* 预览区域 - 使用新的TikZPreview组件 */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  前端模拟预览
                </label>
                <TikZPreview
                  code={tikzCode.code}
                  format={tikzCode.format}
                  width={400}
                  height={300}
                  showGrid={true}
                  showTitle={true}
                  className="min-h-[300px]"
                />
              </div>
            </div>
          </motion.div>
        ))}

        {/* 空状态 */}
        {tikzCodes.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg"
          >
            <Code className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              还没有TikZ图形
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              点击上方按钮添加第一个TikZ图形
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};
