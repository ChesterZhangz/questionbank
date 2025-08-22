import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Palette, Eye, EyeOff, Plus } from 'lucide-react';
import TikZHighlightInput from './TikZHighlightInput';
import TikZPreview from './TikZPreview';
import Card from '../../ui/Card';
import Button from '../../ui/Button';

interface TikZCode {
  id: string;
  code: string;
  format: 'svg' | 'png';
  order: number;
}

interface TikZEditorPanelProps {
  tikzCodes: TikZCode[];
  onTikzCodesChange: (codes: TikZCode[]) => void;
  className?: string;
}

const TikZEditorPanel: React.FC<TikZEditorPanelProps> = ({
  tikzCodes,
  onTikzCodesChange,
  className = ''
}) => {
  const [selectedTikZ, setSelectedTikZ] = useState<TikZCode | null>(null);
  const [showPreview, setShowPreview] = useState(true);
  const [previewSize, setPreviewSize] = useState<'small' | 'medium' | 'large'>('medium');

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
    setSelectedTikZ(newTikZ);
  };

  // 删除 TikZ 代码
  const handleDeleteTikZ = (id: string) => {
    const updatedCodes = tikzCodes.filter(code => code.id !== id);
    onTikzCodesChange(updatedCodes);
    
    if (selectedTikZ?.id === id) {
      setSelectedTikZ(updatedCodes.length > 0 ? updatedCodes[0] : null);
    }
  };

  // 更新 TikZ 代码
  const handleUpdateTikZCode = (id: string, code: string) => {
    const updatedCodes = tikzCodes.map(tikz => 
      tikz.id === id ? { ...tikz, code } : tikz
    );
    onTikzCodesChange(updatedCodes);
    
    if (selectedTikZ?.id === id) {
      setSelectedTikZ({ ...selectedTikZ, code });
    }
  };

  // 更新 TikZ 格式
  const handleUpdateTikZFormat = (id: string, format: 'svg' | 'png') => {
    const updatedCodes = tikzCodes.map(tikz => 
      tikz.id === id ? { ...tikz, format } : tikz
    );
    onTikzCodesChange(updatedCodes);
    
    if (selectedTikZ?.id === id) {
      setSelectedTikZ({ ...selectedTikZ, format });
    }
  };

  // 重新排序 TikZ 代码
  const handleReorderTikZ = (id: string, direction: 'up' | 'down') => {
    const currentIndex = tikzCodes.findIndex(code => code.id === id);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= tikzCodes.length) return;

    const updatedCodes = [...tikzCodes];
    [updatedCodes[currentIndex], updatedCodes[newIndex]] = [updatedCodes[newIndex], updatedCodes[currentIndex]];
    
    // 更新 order 字段
    updatedCodes.forEach((code, index) => {
      code.order = index;
    });
    
    onTikzCodesChange(updatedCodes);
  };

  // 获取预览尺寸
  const getPreviewDimensions = () => {
    switch (previewSize) {
      case 'small':
        return { width: 300, height: 200 };
      case 'medium':
        return { width: 400, height: 300 };
      case 'large':
        return { width: 500, height: 400 };
      default:
        return { width: 400, height: 300 };
    }
  };

  return (
    <Card className={`${className}`}>
      <div className="p-4 border-b bg-gray-50 dark:bg-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Palette className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <h3 className="font-medium text-gray-900 dark:text-gray-100">TikZ 图形编辑器</h3>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              ({tikzCodes.length}/3)
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center space-x-1"
            >
              {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              <span>{showPreview ? '隐藏预览' : '显示预览'}</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddTikZ}
              disabled={tikzCodes.length >= 3}
              className="flex items-center space-x-1"
            >
              <Plus className="w-4 h-4" />
              <span>添加图形</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="p-4">
        {tikzCodes.length === 0 ? (
          <div className="text-center py-8">
            <Palette className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              还没有添加 TikZ 图形
            </p>
            <Button
              variant="outline"
              onClick={handleAddTikZ}
              className="flex items-center space-x-1 mx-auto"
            >
              <Plus className="w-4 h-4" />
              <span>添加第一个图形</span>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* TikZ 代码列表 */}
            <div className="space-y-3">
              {tikzCodes.map((tikz, index) => (
                <motion.div
                  key={tikz.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`border rounded-lg p-3 transition-all duration-200 ${
                    selectedTikZ?.id === tikz.id
                      ? 'border-purple-500 dark:border-purple-400 bg-purple-50 dark:bg-purple-900/20'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                        图形 {index + 1}
                      </span>
                      <select
                        value={tikz.format}
                        onChange={(e) => handleUpdateTikZFormat(tikz.id, e.target.value as 'svg' | 'png')}
                        className="text-xs border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200"
                      >
                        <option value="svg">SVG</option>
                        <option value="png">PNG</option>
                      </select>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedTikZ(tikz)}
                        className={`px-2 py-1 text-xs ${
                          selectedTikZ?.id === tikz.id
                            ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                            : ''
                        }`}
                      >
                        编辑
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleReorderTikZ(tikz.id, 'up')}
                        disabled={index === 0}
                        className="px-2 py-1 text-xs"
                      >
                        ↑
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleReorderTikZ(tikz.id, 'down')}
                        disabled={index === tikzCodes.length - 1}
                        className="px-2 py-1 text-xs"
                      >
                        ↓
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteTikZ(tikz.id)}
                        className="px-2 py-1 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30"
                      >
                        删除
                      </Button>
                    </div>
                  </div>
                  
                  {/* 简化的代码预览 */}
                  <div className="text-xs text-gray-600 dark:text-gray-400 font-mono bg-gray-100 dark:bg-gray-800 p-2 rounded border">
                    {tikz.code.length > 50 ? `${tikz.code.substring(0, 50)}...` : tikz.code}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* 编辑区域 */}
            {selectedTikZ && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="border border-purple-200 dark:border-purple-700 rounded-lg p-4 bg-purple-50 dark:bg-purple-900/10"
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900 dark:text-gray-100">
                    编辑图形 {tikzCodes.findIndex(t => t.id === selectedTikZ.id) + 1}
                  </h4>
                  <div className="flex items-center space-x-2">
                    <select
                      value={previewSize}
                      onChange={(e) => setPreviewSize(e.target.value as 'small' | 'medium' | 'large')}
                      className="text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200"
                    >
                      <option value="small">小</option>
                      <option value="medium">中</option>
                      <option value="large">大</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* 代码编辑区域 */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      TikZ 代码
                    </label>
                    <TikZHighlightInput
                      value={selectedTikZ.code}
                      onChange={(code: string) => handleUpdateTikZCode(selectedTikZ.id, code)}
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

                  {/* 预览区域 */}
                  {showPreview && (
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        实时预览
                      </label>
                      <div className="border border-gray-200 dark:border-gray-600 rounded-md overflow-hidden">
                        <TikZPreview
                          code={selectedTikZ.code}
                          format={selectedTikZ.format}
                          {...getPreviewDimensions()}
                          showGrid={true}
                          showTitle={false}
                          className="w-full"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};

export default TikZEditorPanel;
