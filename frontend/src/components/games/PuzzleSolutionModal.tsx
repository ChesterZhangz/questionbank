import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Play, 
  Pause, 
  SkipForward, 
  ChevronLeft, 
  ChevronRight,
  RotateCcw,
  Target,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { type SolutionStep } from '../../lib/puzzle/PuzzleSolver';
import PuzzleSolverService, { type PuzzleSolutionResponse } from '../../services/puzzleSolverAPI';

interface PuzzleSolutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialBoard: number[];
  gridSize: number;
  gameData?: {
    moves?: number;
    timeUsed?: number;
    moveSequence?: Array<{
      from: number;
      to: number;
      piece: number;
      step: number;
    }>;
  };
}

const PuzzleSolutionModal: React.FC<PuzzleSolutionModalProps> = ({
  isOpen,
  onClose,
  initialBoard,
  gridSize,
  gameData
}) => {
  const [solution, setSolution] = useState<SolutionStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [playbackSpeed, setPlaybackSpeed] = useState(1000); // 毫秒

  // 获取解题方案
  useEffect(() => {
    if (isOpen && initialBoard.length > 0) {
      solvePuzzle();
    }
  }, [isOpen, initialBoard]);

  // 自动播放控制
  useEffect(() => {
    if (!isPlaying || !solution.length) return;

    const timer = setInterval(() => {
      setCurrentStep(prev => {
        if (prev >= solution.length - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, playbackSpeed);

    return () => clearInterval(timer);
  }, [isPlaying, solution.length, playbackSpeed]);

  const solvePuzzle = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response: PuzzleSolutionResponse = await PuzzleSolverService.solvePuzzle({
        initialBoard,
        gridSize
      });
      
      if (response.success) {
        setSolution(response.solution);
        setCurrentStep(0);
      } else {
        setError(response.error || '无法生成解题方案');
      }
    } catch (err) {
      setError('解题算法执行失败');
      // 错误日志已清理
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setCurrentStep(0);
    setIsPlaying(false);
  };

  const handlePrevStep = () => {
    setCurrentStep(prev => Math.max(0, prev - 1));
    setIsPlaying(false);
  };

  const handleNextStep = () => {
    setCurrentStep(prev => Math.min(solution.length - 1, prev + 1));
    setIsPlaying(false);
  };

  const handleStepClick = (step: number) => {
    setCurrentStep(step);
    setIsPlaying(false);
  };

  // 渲染拼图块
  const renderPuzzleBoard = (board: number[]) => {
    const emptyValue = gridSize * gridSize - 1;
    
    return (
      <div 
        className="grid gap-1 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 p-4 rounded-xl border border-gray-200 dark:border-gray-600"
        style={{ 
          gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
          gridTemplateRows: `repeat(${gridSize}, 1fr)`,
          maxWidth: `${gridSize * 60 + 32}px`,
          aspectRatio: '1'
        }}
      >
        {board.map((piece, index) => {
          const isCorrect = piece === index;
          const isEmpty = piece === emptyValue;
          
          return (
            <motion.div
              key={`${piece}-${index}`}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className={`w-full aspect-square rounded-lg font-bold text-sm flex items-center justify-center transition-all duration-300 ${
                isEmpty
                  ? 'bg-transparent border-2 border-dashed border-gray-400 dark:border-gray-500'
                  : isCorrect
                  ? 'bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg'
                  : 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-md'
              }`}
            >
              {isEmpty ? '' : piece + 1}
            </motion.div>
          );
        })}
      </div>
    );
  };

  // 渲染移动信息
  const renderMoveInfo = () => {
    if (currentStep === 0 || !solution[currentStep]?.move) {
      return (
        <div className="text-center text-gray-500 dark:text-gray-400">
          <div className="text-lg font-medium">初始状态</div>
          <div className="text-sm">开始解题</div>
        </div>
      );
    }

    const move = solution[currentStep].move!;
    return (
      <div className="text-center">
        <div className="text-lg font-medium text-gray-800 dark:text-gray-100 mb-2">
          第 {move.step} 步
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-300">
          移动数字 <span className="font-bold text-blue-600 dark:text-blue-400">{move.piece + 1}</span>
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          从位置 {move.from + 1} 到位置 {move.to + 1}
        </div>
      </div>
    );
  };

  const currentBoard = solution[currentStep]?.board || initialBoard;
  const progress = solution.length > 1 ? (currentStep / (solution.length - 1)) * 100 : 0;

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
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 头部 */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                    <Target className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">拼图解法演示</h2>
                    <p className="text-purple-100 text-sm">
                      {gridSize}×{gridSize} 拼图的最优解法步骤
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* 内容区域 */}
            <div className="p-6 max-h-[calc(95vh-120px)] overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 text-purple-600 dark:text-purple-400 animate-spin mr-3" />
                  <span className="text-gray-600 dark:text-gray-300">正在计算最优解法...</span>
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                  <div className="text-red-600 dark:text-red-400 mb-4">{error}</div>
                  <button
                    onClick={solvePuzzle}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    重试
                  </button>
                </div>
              ) : solution.length > 0 ? (
                <div className="space-y-6">
                  {/* 统计信息 */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                        {solution.length - 1}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">最优步数</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {gameData?.moves || 'N/A'}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">实际步数</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {gameData?.timeUsed ? `${gameData.timeUsed}s` : 'N/A'}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">用时</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                        {currentStep}/{solution.length - 1}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">当前步骤</div>
                    </div>
                  </div>

                  {/* 拼图显示区域 */}
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* 拼图板 */}
                    <div className="flex-1 flex flex-col items-center">
                      <div className="mb-4">
                        {renderPuzzleBoard(currentBoard)}
                      </div>
                      {renderMoveInfo()}
                    </div>

                    {/* 控制面板 */}
                    <div className="lg:w-80 space-y-4">
                      {/* 进度条 */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300">
                          <span>解题进度</span>
                          <span>{Math.round(progress)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <motion.div
                            className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                            initial={{ width: '0%' }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.3 }}
                          />
                        </div>
                      </div>

                      {/* 播放控制 */}
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={handleReset}
                          className="p-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                          title="重置到开始"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>
                        <button
                          onClick={handlePrevStep}
                          disabled={currentStep === 0}
                          className="p-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title="上一步"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                          onClick={handlePlay}
                          className="p-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                          title={isPlaying ? "暂停" : "播放"}
                        >
                          {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                        </button>
                        <button
                          onClick={handleNextStep}
                          disabled={currentStep === solution.length - 1}
                          className="p-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title="下一步"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setCurrentStep(solution.length - 1)}
                          className="p-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                          title="跳到结尾"
                        >
                          <SkipForward className="w-4 h-4" />
                        </button>
                      </div>

                      {/* 播放速度控制 */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          播放速度
                        </label>
                        <div className="flex space-x-2">
                          {[
                            { speed: 2000, label: '0.5x' },
                            { speed: 1000, label: '1x' },
                            { speed: 500, label: '2x' },
                            { speed: 250, label: '4x' }
                          ].map((option) => (
                            <button
                              key={option.speed}
                              onClick={() => setPlaybackSpeed(option.speed)}
                              className={`px-3 py-1 rounded text-sm transition-colors ${
                                playbackSpeed === option.speed
                                  ? 'bg-purple-600 text-white'
                                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                              }`}
                            >
                              {option.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* 步骤列表 */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          步骤列表
                        </label>
                        <div className="max-h-48 overflow-y-auto space-y-1 bg-gray-50 dark:bg-gray-700 rounded-lg p-2">
                          {solution.map((step, index) => (
                            <button
                              key={index}
                              onClick={() => handleStepClick(index)}
                              className={`w-full text-left p-2 rounded text-sm transition-colors ${
                                currentStep === index
                                  ? 'bg-purple-600 text-white'
                                  : 'hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300'
                              }`}
                            >
                              {index === 0 ? (
                                '初始状态'
                              ) : (
                                `步骤 ${index}: 移动 ${step.move!.piece + 1}`
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  <Target className="w-12 h-12 mx-auto mb-4" />
                  <p>暂无解法数据</p>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PuzzleSolutionModal;
