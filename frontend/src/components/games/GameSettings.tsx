import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Volume2, VolumeX, X, Save } from 'lucide-react';
import Button from '../ui/Button';

interface GameSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  settings: {
    mathDifficulty: 'easy' | 'medium' | 'hard';
    memoryGridSize: 4 | 5 | 6;
    puzzleGridSize: 3 | 4;
    reactionDifficulty: 'easy' | 'medium' | 'hard';
    timeLimit: number;
    soundEnabled: boolean;
  };
  onSettingsChange: (settings: any) => void;
}

const GameSettings: React.FC<GameSettingsProps> = ({
  isOpen,
  onClose,
  settings,
  onSettingsChange
}) => {
  const [localSettings, setLocalSettings] = React.useState(settings);

  React.useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleSave = () => {
    onSettingsChange(localSettings);
    onClose();
  };

  const handleReset = () => {
    setLocalSettings(settings);
  };

  const updateSetting = (key: string, value: any) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 头部 */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Settings className="w-6 h-6 text-blue-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-800">游戏设置</h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* 设置内容 */}
            <div className="p-6 space-y-6">
              {/* 数学游戏设置 */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                  数学计算游戏
                </h3>
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">
                    难度等级
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                                         {[
                       { value: 'easy', label: '简单', color: 'green', borderColor: '#10b981', bgColor: '#d1fae5', textColor: '#065f46' },
                       { value: 'medium', label: '中等', color: 'yellow', borderColor: '#f59e0b', bgColor: '#fef3c7', textColor: '#92400e' },
                       { value: 'hard', label: '困难', color: 'red', borderColor: '#ef4444', bgColor: '#fee2e2', textColor: '#991b1b' }
                     ].map((option) => (
                       <button
                         key={option.value}
                         onClick={() => updateSetting('mathDifficulty', option.value)}
                         className={`p-3 rounded-xl border-2 transition-all game-button ${
                           localSettings.mathDifficulty === option.value
                             ? 'shadow-sm'
                             : 'border-gray-200 hover:border-gray-300 bg-white'
                         }`}
                         style={{
                           borderColor: localSettings.mathDifficulty === option.value ? option.borderColor : '#e5e7eb',
                           backgroundColor: localSettings.mathDifficulty === option.value ? option.bgColor : '#ffffff',
                           color: localSettings.mathDifficulty === option.value ? option.textColor : '#4b5563'
                         }}
                       >
                         <div 
                           className="text-sm font-medium"
                           style={{
                             color: localSettings.mathDifficulty === option.value ? option.textColor : '#4b5563'
                           }}
                         >
                           {option.label}
                         </div>
                       </button>
                     ))}
                  </div>
                </div>
              </div>

              {/* 记忆游戏设置 */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  记忆游戏
                </h3>
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">
                    网格大小
                  </label>
                                     <div className="grid grid-cols-3 gap-3">
                     {[4, 5, 6].map((size) => (
                       <button
                         key={size}
                         onClick={() => updateSetting('memoryGridSize', size)}
                         className={`p-3 rounded-xl border-2 transition-all game-button ${
                           localSettings.memoryGridSize === size
                             ? 'shadow-sm'
                             : 'border-gray-200 hover:border-gray-300 bg-white'
                         }`}
                         style={{
                           borderColor: localSettings.memoryGridSize === size ? '#10b981' : '#e5e7eb',
                           backgroundColor: localSettings.memoryGridSize === size ? '#d1fae5' : '#ffffff',
                           color: localSettings.memoryGridSize === size ? '#065f46' : '#4b5563'
                         }}
                       >
                         <div 
                           className="text-sm font-medium"
                           style={{
                             color: localSettings.memoryGridSize === size ? '#065f46' : '#4b5563'
                           }}
                         >
                           {size}×{size}
                         </div>
                         <div 
                           className="text-xs"
                           style={{
                             color: localSettings.memoryGridSize === size ? '#047857' : '#6b7280'
                           }}
                         >
                           {size * size / 2}对
                         </div>
                       </button>
                     ))}
                   </div>
                </div>
              </div>

              {/* 拼图游戏设置 */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                  数字拼图
                </h3>
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">
                    拼图大小
                  </label>
                                     <div className="grid grid-cols-2 gap-3">
                     {[3, 4].map((size) => (
                       <button
                         key={size}
                         onClick={() => updateSetting('puzzleGridSize', size)}
                         className={`p-3 rounded-xl border-2 transition-all game-button ${
                           localSettings.puzzleGridSize === size
                             ? 'shadow-sm'
                             : 'border-gray-200 hover:border-gray-300 bg-white'
                         }`}
                         style={{
                           borderColor: localSettings.puzzleGridSize === size ? '#8b5cf6' : '#e5e7eb',
                           backgroundColor: localSettings.puzzleGridSize === size ? '#f3e8ff' : '#ffffff',
                           color: localSettings.puzzleGridSize === size ? '#5b21b6' : '#4b5563'
                         }}
                       >
                         <div 
                           className="text-sm font-medium"
                           style={{
                             color: localSettings.puzzleGridSize === size ? '#5b21b6' : '#4b5563'
                           }}
                         >
                           {size}×{size}
                         </div>
                         <div 
                           className="text-xs"
                           style={{
                             color: localSettings.puzzleGridSize === size ? '#7c3aed' : '#6b7280'
                           }}
                         >
                           {size * size - 1}块
                         </div>
                       </button>
                     ))}
                   </div>
                </div>
              </div>

              {/* 反应速度游戏设置 */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                  <span className="w-2 h-2 bg-orange-500 rounded-full mr-3"></span>
                  反应速度游戏
                </h3>
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">
                    难度等级
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: 'easy', label: '简单', color: 'green', desc: '基础反应测试', borderColor: '#10b981', bgColor: '#d1fae5', textColor: '#065f46' },
                      { value: 'medium', label: '中等', color: 'yellow', desc: '颜色变化', borderColor: '#f59e0b', bgColor: '#fef3c7', textColor: '#92400e' },
                      { value: 'hard', label: '困难', color: 'red', desc: '形状+干扰', borderColor: '#ef4444', bgColor: '#fee2e2', textColor: '#991b1b' }
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => updateSetting('reactionDifficulty', option.value)}
                        className={`p-3 rounded-xl border-2 transition-all game-button ${
                          localSettings.reactionDifficulty === option.value
                            ? 'shadow-sm'
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}
                        style={{
                          borderColor: localSettings.reactionDifficulty === option.value ? option.borderColor : '#e5e7eb',
                          backgroundColor: localSettings.reactionDifficulty === option.value ? option.bgColor : '#ffffff',
                          color: localSettings.reactionDifficulty === option.value ? option.textColor : '#4b5563'
                        }}
                      >
                        <div 
                          className="text-sm font-medium"
                          style={{
                            color: localSettings.reactionDifficulty === option.value ? option.textColor : '#4b5563'
                          }}
                        >
                          {option.label}
                        </div>
                        <div 
                          className="text-xs"
                          style={{
                            color: localSettings.reactionDifficulty === option.value ? option.textColor.replace('1b', '47') : '#6b7280'
                          }}
                        >
                          {option.desc}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 通用设置 */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                  <span className="w-2 h-2 bg-orange-500 rounded-full mr-3"></span>
                  通用设置
                </h3>
                <div className="space-y-4">
                  {/* 时间限制 */}
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700">
                      游戏时间限制
                    </label>
                    <div className="flex items-center space-x-4">
                      <input
                        type="range"
                        min="30"
                        max="120"
                        step="15"
                        value={localSettings.timeLimit}
                        onChange={(e) => updateSetting('timeLimit', parseInt(e.target.value))}
                        className="flex-1 h-3 bg-gradient-to-r from-blue-200 to-purple-200 rounded-lg appearance-none cursor-pointer slider"
                        style={{
                          background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(localSettings.timeLimit - 30) / 90 * 100}%, #e5e7eb ${(localSettings.timeLimit - 30) / 90 * 100}%, #e5e7eb 100%)`
                        }}
                      />
                      <span className="text-sm font-medium text-gray-700 min-w-[3rem]">
                        {localSettings.timeLimit}秒
                      </span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>30秒</span>
                      <span>60秒</span>
                      <span>90秒</span>
                      <span>120秒</span>
                    </div>
                  </div>

                  {/* 音效设置 */}
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">
                      音效
                    </label>
                    <button
                      onClick={() => updateSetting('soundEnabled', !localSettings.soundEnabled)}
                      className={`p-2 rounded-lg transition-all ${
                        localSettings.soundEnabled
                          ? 'bg-green-100 text-green-600'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {localSettings.soundEnabled ? (
                        <Volume2 className="w-5 h-5" />
                      ) : (
                        <VolumeX className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* 底部按钮 */}
            <div className="flex items-center justify-between p-6 border-t border-gray-200">
              <Button
                onClick={handleReset}
                variant="outline"
                className="px-4 py-2"
              >
                重置
              </Button>
              <div className="flex space-x-3">
                <Button
                  onClick={onClose}
                  variant="outline"
                  className="px-4 py-2"
                >
                  取消
                </Button>
                <Button
                  onClick={handleSave}
                  variant="primary"
                  className="px-4 py-2 flex items-center"
                >
                  <Save className="w-4 h-4 mr-2" />
                  保存
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default GameSettings; 