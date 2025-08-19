import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Pause, SkipBack, SkipForward, Target, Move } from 'lucide-react';

interface PuzzleSolutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPositions: Array<{ id: number; position: number }>;
  finalPositions: Array<{ id: number; position: number }>;
  gridSize: number;
  userMoves: number;
}

interface PuzzlePiece {
  id: number;
  value: number;
  currentPosition: number;
  correctPosition: number;
}

const PuzzleSolutionModal: React.FC<PuzzleSolutionModalProps> = ({
  isOpen,
  onClose,
  initialPositions,
  finalPositions,
  gridSize,
  userMoves
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [solutionSteps, setSolutionSteps] = useState<PuzzlePiece[][]>([]);
  const [optimalMoves, setOptimalMoves] = useState(0);

  const totalPieces = gridSize * gridSize;
  const emptyValue = totalPieces - 1;

  // 生成拼图状态
  const generatePuzzleState = useCallback((positions: Array<{ id: number; position: number }>) => {
    const pieces: PuzzlePiece[] = [];
    for (let i = 0; i < totalPieces; i++) {
      const piece = positions.find(p => p.position === i);
      if (piece) {
        pieces.push({
          id: piece.id,
          value: piece.id,
          currentPosition: piece.position,
          correctPosition: piece.id
        });
      }
    }
    return pieces;
  }, [totalPieces]);

  // 计算最优步数（使用曼哈顿距离）
  const calculateOptimalMoves = useCallback((initial: PuzzlePiece[], final: PuzzlePiece[]) => {
    let totalDistance = 0;
    for (let i = 0; i < initial.length; i++) {
      const initialPiece = initial.find(p => p.id === i);
      const finalPiece = final.find(p => p.id === i);
      if (initialPiece && finalPiece) {
        const initialRow = Math.floor(initialPiece.currentPosition / gridSize);
        const initialCol = initialPiece.currentPosition % gridSize;
        const finalRow = Math.floor(finalPiece.currentPosition / gridSize);
        const finalCol = finalPiece.currentPosition % gridSize;
        totalDistance += Math.abs(initialRow - finalRow) + Math.abs(initialCol - finalCol);
      }
    }
    return Math.ceil(totalDistance / 2); // 每次移动可以同时移动两个位置
  }, [gridSize]);

  // 生成示例拼图（当没有位置数据时）
  const generateExamplePuzzle = useCallback(() => {
    const exampleInitial: PuzzlePiece[] = [];
    const exampleFinal: PuzzlePiece[] = [];
    
    for (let i = 0; i < totalPieces; i++) {
      const piece: PuzzlePiece = {
        id: i,
        value: i,
        currentPosition: i === emptyValue ? totalPieces - 1 : i,
        correctPosition: i
      };
      
      exampleInitial.push({ ...piece, currentPosition: i === emptyValue ? totalPieces - 1 : i });
      exampleFinal.push({ ...piece, currentPosition: i });
    }
    
    // 打乱初始状态
    const shuffled = [...exampleInitial];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i].currentPosition, shuffled[j].currentPosition] = [shuffled[j].currentPosition, shuffled[i].currentPosition];
    }
    
    const optimal = calculateOptimalMoves(shuffled, exampleFinal);
    setOptimalMoves(optimal);
    
    // 生成示例步骤
    const steps: PuzzlePiece[][] = [shuffled];
    let current = [...shuffled];
    
    for (let i = 0; i < Math.min(optimal, 15); i++) {
      const next = current.map(piece => {
        if (piece.currentPosition !== piece.correctPosition) {
          // 随机移动一步
          const currentRow = Math.floor(piece.currentPosition / gridSize);
          const currentCol = piece.currentPosition % gridSize;
          const directions = [
            [currentRow - 1, currentCol],
            [currentRow + 1, currentCol],
            [currentRow, currentCol - 1],
            [currentRow, currentCol + 1]
          ].filter(([r, c]) => r >= 0 && r < gridSize && c >= 0 && c < gridSize);
          
          if (directions.length > 0) {
            const [newRow, newCol] = directions[Math.floor(Math.random() * directions.length)];
            const newPosition = newRow * gridSize + newCol;
            
            // 检查位置是否被占用
            const isOccupied = current.some(p => p.currentPosition === newPosition);
            if (!isOccupied) {
              return { ...piece, currentPosition: newPosition };
            }
          }
        }
        return piece;
      });
      
      current = next;
      steps.push([...next]);
    }
    
    // 添加最终状态
    steps.push(exampleFinal);
    setSolutionSteps(steps);
  }, [totalPieces, emptyValue, gridSize, calculateOptimalMoves]);

  // 生成解决方案步骤
  const generateSolutionSteps = useCallback(() => {
    const initial = generatePuzzleState(initialPositions);
    const final = generatePuzzleState(finalPositions);
    
    const optimal = calculateOptimalMoves(initial, final);
    setOptimalMoves(optimal);

    // 生成中间步骤（这里简化处理，实际可以使用A*算法）
    const steps: PuzzlePiece[][] = [initial];
    let current = [...initial];
    
    // 模拟移动过程，生成中间状态
    for (let i = 0; i < Math.min(optimal, 20); i++) {
      const next = current.map(piece => {
        if (piece.currentPosition !== piece.correctPosition) {
          // 向目标位置移动一步
          const currentRow = Math.floor(piece.currentPosition / gridSize);
          const currentCol = piece.currentPosition % gridSize;
          const targetRow = Math.floor(piece.correctPosition / gridSize);
          const targetCol = piece.correctPosition % gridSize;
          
          let newRow = currentRow;
          let newCol = currentCol;
          
          if (currentRow < targetRow) newRow++;
          else if (currentRow > targetRow) newRow--;
          if (currentCol < targetCol) newCol++;
          else if (currentCol > targetCol) newCol--;
          
          const newPosition = newRow * gridSize + newCol;
          
          // 检查位置是否被占用
          const isOccupied = current.some(p => p.currentPosition === newPosition);
          if (!isOccupied) {
            return { ...piece, currentPosition: newPosition };
          }
        }
        return piece;
      });
      
      current = next;
      steps.push([...next]);
    }
    
    // 添加最终状态
    if (steps[steps.length - 1] !== final) {
      steps.push(final);
    }
    
    setSolutionSteps(steps);
  }, [initialPositions, finalPositions, gridSize, generatePuzzleState, calculateOptimalMoves]);

  // 自动播放
  useEffect(() => {
    if (!isPlaying || currentStep >= solutionSteps.length - 1) return;
    
    const timer = setTimeout(() => {
      setCurrentStep(prev => prev + 1);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [isPlaying, currentStep, solutionSteps.length]);

  // 当模态框打开时生成解决方案
  useEffect(() => {
    if (isOpen) {
      if (initialPositions.length > 0 && finalPositions.length > 0) {
        generateSolutionSteps();
      } else {
        // 如果没有位置数据，生成一个示例拼图
        generateExamplePuzzle();
      }
    }
  }, [isOpen, initialPositions, finalPositions, generateSolutionSteps]);

  // 重置播放
  const resetPlayback = () => {
    setCurrentStep(0);
    setIsPlaying(false);
  };

  // 播放/暂停
  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
  };

  // 下一步
  const nextStep = () => {
    setCurrentStep(prev => Math.min(prev + 1, solutionSteps.length - 1));
  };

  // 上一步
  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  // 渲染拼图块
  const renderPiece = (piece: PuzzlePiece) => {
    const row = Math.floor(piece.currentPosition / gridSize);
    const col = piece.currentPosition % gridSize;
    const isCorrect = piece.currentPosition === piece.correctPosition;

    return (
      <div
        key={piece.id}
        className={`w-12 h-12 rounded-lg font-bold text-sm transition-all duration-300 ${
          piece.value === emptyValue
            ? 'bg-transparent border-2 border-dashed border-gray-400'
            : isCorrect
            ? 'bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg'
            : 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-md'
        }`}
        style={{
          gridRow: row + 1,
          gridColumn: col + 1
        }}
      >
        <div className="w-full h-full flex items-center justify-center">
          {piece.value === emptyValue ? '' : piece.value + 1}
        </div>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* 头部 */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <Target className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">拼图解决方案</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          {/* 内容 */}
          <div className="p-6">
            {/* 统计信息 */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                <div className="text-lg font-bold text-blue-600 dark:text-blue-400">{userMoves}</div>
                <div className="text-xs text-blue-500 dark:text-blue-300">你的步数</div>
              </div>
              <div className="text-center p-3 bg-green-50 dark:bg-green-900/30 rounded-lg">
                <div className="text-lg font-bold text-green-600 dark:text-green-400">{optimalMoves}</div>
                <div className="text-xs text-green-500 dark:text-green-300">最优步数</div>
              </div>
              <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
                <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
                  {solutionSteps.length > 0 ? currentStep + 1 : 0}/{solutionSteps.length}
                </div>
                <div className="text-xs text-purple-500 dark:text-purple-300">当前步骤</div>
              </div>
            </div>

            {/* 拼图显示 */}
            {solutionSteps.length > 0 && (
              <div className="flex justify-center mb-6">
                <div 
                  className="grid gap-1 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 p-4 rounded-2xl border border-gray-200 dark:border-gray-600"
                  style={{ 
                    gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
                    gridTemplateRows: `repeat(${gridSize}, 1fr)`,
                  }}
                >
                  {solutionSteps[currentStep]?.map(renderPiece)}
                </div>
              </div>
            )}

            {/* 控制按钮 */}
            <div className="flex items-center justify-center space-x-4">
              <button
                onClick={resetPlayback}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                title="重置"
              >
                <SkipBack className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              
              <button
                onClick={prevStep}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                disabled={currentStep === 0}
                title="上一步"
              >
                <SkipForward className="w-5 h-5 text-gray-600 dark:text-gray-400 rotate-180" />
              </button>
              
              <button
                onClick={togglePlayback}
                className="p-3 rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-colors"
                title={isPlaying ? "暂停" : "播放"}
              >
                {isPlaying ? (
                  <Pause className="w-6 h-6" />
                ) : (
                  <Play className="w-6 h-6" />
                )}
              </button>
              
              <button
                onClick={nextStep}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                disabled={currentStep === solutionSteps.length - 1}
                title="下一步"
              >
                <SkipForward className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>

            {/* 步骤说明 */}
            <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Move className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">步骤说明</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {currentStep === 0 ? '初始状态' : 
                 currentStep === solutionSteps.length - 1 ? '完成状态' : 
                 `第 ${currentStep} 步：移动拼图块到目标位置`}
                {(!initialPositions.length || !finalPositions.length) && (
                  <span className="block mt-1 text-xs text-gray-500 dark:text-gray-400">
                    (示例拼图，用于演示功能)
                  </span>
                )}
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PuzzleSolutionModal;
