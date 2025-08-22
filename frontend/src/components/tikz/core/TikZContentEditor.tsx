import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Palette, Plus, Trash2 } from 'lucide-react';
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

interface TikZContentEditorProps {
  tikzCodes: TikZCode[];
  onTikzCodesChange: (codes: TikZCode[]) => void;
  className?: string;
}

const TikZContentEditor: React.FC<TikZContentEditorProps> = ({
  tikzCodes,
  onTikzCodesChange,
  className = ''
}) => {
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');

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
  };

  // 删除 TikZ 代码
  const handleDeleteTikZ = (id: string) => {
    const updatedCodes = tikzCodes.filter(code => code.id !== id);
    onTikzCodesChange(updatedCodes);
  };

  // 更新 TikZ 代码
  const handleUpdateTikZCode = (id: string, code: string) => {
    const updatedCodes = tikzCodes.map(tikz => 
      tikz.id === id ? { ...tikz, code } : tikz
    );
    onTikzCodesChange(updatedCodes);
  };

  return (
    <Card className={`${className}`}>
      <div className="p-4 border-b bg-gray-50 dark:bg-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Palette className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <h3 className="font-medium text-gray-900 dark:text-gray-100">TikZ 图形</h3>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              ({tikzCodes.length}/3)
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setActiveTab('edit')}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                  activeTab === 'edit'
                    ? 'bg-white dark:bg-gray-800 text-purple-600 dark:text-purple-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
                }`}
              >
                编辑
              </button>
              <button
                onClick={() => setActiveTab('preview')}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                  activeTab === 'preview'
                    ? 'bg-white dark:bg-gray-800 text-purple-600 dark:text-purple-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
                }`}
              >
                预览
              </button>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddTikZ}
              disabled={tikzCodes.length >= 3}
              className="flex items-center space-x-1"
            >
              <Plus className="w-4 h-4" />
              <span>添加</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="p-4">
        {tikzCodes.length === 0 ? (
          <div className="text-center py-8">
            <Palette className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              添加 TikZ 图形以增强题目表达
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
          <AnimatePresence mode="wait">
            {activeTab === 'edit' ? (
              <motion.div
                key="edit"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                {tikzCodes.map((tikz, index) => (
                  <motion.div
                    key={tikz.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="border border-purple-200 dark:border-purple-700 rounded-lg p-4 bg-purple-50 dark:bg-purple-900/10"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-900 dark:text-gray-100">
                        图形 {index + 1}
                      </h4>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteTikZ(tikz.id)}
                        className="flex items-center space-x-1 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>删除</span>
                      </Button>
                    </div>

                    <TikZHighlightInput
                      value={tikz.code}
                      onChange={(code: string) => handleUpdateTikZCode(tikz.id, code)}
                      placeholder="输入TikZ代码..."
                      rows={6}
                      enableAutoComplete={true}
                      className="border border-gray-300 dark:border-gray-600 rounded-md"
                      style={{
                        fontFamily: 'monospace',
                        fontSize: '14px',
                        lineHeight: '1.5'
                      }}
                    />
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="preview"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                {tikzCodes.map((tikz, index) => (
                  <motion.div
                    key={tikz.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600"
                  >
                    <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">
                      图形 {index + 1}
                    </h4>
                    <div className="flex justify-center">
                      <TikZPreview
                        code={tikz.code}
                        format={tikz.format}
                        width={400}
                        height={300}
                        showGrid={false}
                        showTitle={false}
                        className="border border-gray-200 dark:border-gray-600 rounded"
                      />
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </Card>
  );
};

export default TikZContentEditor;
