import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Move, Play, Pause, RotateCcw, Eye } from 'lucide-react';
import GameAPIService from '../../services/gameAPI';

interface PuzzleGameProps {
  onScoreUpdate: (score: number) => void;
  onGameEnd: () => void;
  isActive: boolean;
  gridSize: 3 | 4;
  timeLimit: number;
}

interface PuzzlePiece {
  id: number;
  value: number;
  currentPosition: number;
  correctPosition: number;
}

const PuzzleGame: React.FC<PuzzleGameProps> = ({ 
  onScoreUpdate, 
  onGameEnd, 
  isActive,
  gridSize, 
  timeLimit 
}) => {
  const [pieces, setPieces] = useState<PuzzlePiece[]>([]);
  const [moves, setMoves] = useState(0);
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [isGameActive, setIsGameActive] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [startTime, setStartTime] = useState<number>(0);
  
  // 答案走法相关状态
  const [showSolution, setShowSolution] = useState(false);
  const [solutionSteps, setSolutionSteps] = useState<PuzzlePiece[][]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlayingSolution, setIsPlayingSolution] = useState(false);
  const [originalPuzzle, setOriginalPuzzle] = useState<PuzzlePiece[]>([]);

  const totalPieces = gridSize * gridSize;
  const emptyValue = totalPieces - 1;

  // 获取可能的移动
  const getPossibleMoves = useCallback((puzzle: PuzzlePiece[]): number[] => {
    const emptyPiece = puzzle.find(p => p.value === emptyValue);
    if (!emptyPiece) return [];
    
    const emptyRow = Math.floor(emptyPiece.currentPosition / gridSize);
    const emptyCol = emptyPiece.currentPosition % gridSize;
    const moves: number[] = [];
    
    // 检查上下左右四个方向
    const directions = [
      { row: emptyRow - 1, col: emptyCol }, // 上
      { row: emptyRow + 1, col: emptyCol }, // 下
      { row: emptyRow, col: emptyCol - 1 }, // 左
      { row: emptyRow, col: emptyCol + 1 }  // 右
    ];
    
    directions.forEach(({ row, col }) => {
      if (row >= 0 && row < gridSize && col >= 0 && col < gridSize) {
        const position = row * gridSize + col;
        const piece = puzzle.find(p => p.currentPosition === position);
        if (piece) {
          moves.push(piece.id);
        }
      }
    });
    
    return moves;
  }, [gridSize, emptyValue]);

  // 执行移动
  const executeMove = useCallback((puzzle: PuzzlePiece[], pieceId: number): PuzzlePiece[] => {
    const piece = puzzle.find(p => p.id === pieceId);
    const emptyPiece = puzzle.find(p => p.value === emptyValue);
    
    if (!piece || !emptyPiece) return puzzle;
    
    return puzzle.map(p => {
      if (p.id === pieceId) {
        return { ...p, currentPosition: emptyPiece.currentPosition };
      }
      if (p.value === emptyValue) {
        return { ...p, currentPosition: piece.currentPosition };
      }
      return p;
    });
  }, [emptyValue]);

  // 生成拼图
  const generatePuzzle = useCallback((): PuzzlePiece[] => {
    // 先生成正确的拼图状态
    const correctPuzzle = Array.from({ length: totalPieces }, (_, i) => ({
      id: i,
      value: i,
      currentPosition: i,
      correctPosition: i
    }));
    
    // 随机移动100步来打乱拼图
    let currentPuzzle = [...correctPuzzle];
    for (let i = 0; i < 100; i++) {
      const possibleMoves = getPossibleMoves(currentPuzzle);
      if (possibleMoves.length > 0) {
        const randomMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
        currentPuzzle = executeMove(currentPuzzle, randomMove);
      }
    }
    
    return currentPuzzle;
  }, [totalPieces, getPossibleMoves, executeMove]);



  // 计算曼哈顿距离
  const manhattanDistance = useCallback((puzzle: PuzzlePiece[]): number => {
    return puzzle.reduce((total, piece) => {
      if (piece.value === emptyValue) return total;
      const currentRow = Math.floor(piece.currentPosition / gridSize);
      const currentCol = piece.currentPosition % gridSize;
      const targetRow = Math.floor(piece.correctPosition / gridSize);
      const targetCol = piece.correctPosition % gridSize;
      return total + Math.abs(currentRow - targetRow) + Math.abs(currentCol - targetCol);
    }, 0);
  }, [gridSize, emptyValue]);

  // 使用A*算法计算最优解
  const calculateOptimalSolution = useCallback((puzzle: PuzzlePiece[]): PuzzlePiece[][] => {
    const visited = new Set<string>();
    const queue: Array<{
      state: PuzzlePiece[];
      path: PuzzlePiece[][];
      cost: number;
      heuristic: number;
    }> = [{
      state: puzzle,
      path: [puzzle],
      cost: 0,
      heuristic: manhattanDistance(puzzle)
    }];
    
    while (queue.length > 0) {
      queue.sort((a, b) => (a.cost + a.heuristic) - (b.cost + b.heuristic));
      const current = queue.shift()!;
      
      const stateKey = current.state.map(p => p.currentPosition).join(',');
      if (visited.has(stateKey)) continue;
      visited.add(stateKey);
      
      // 检查是否达到目标状态
      if (current.state.every(p => p.currentPosition === p.correctPosition)) {
        return current.path;
      }
      
      // 获取可能的移动
      const possibleMoves = getPossibleMoves(current.state);
      
      for (const pieceId of possibleMoves) {
        const newState = executeMove(current.state, pieceId);
        const newStateKey = newState.map(p => p.currentPosition).join(',');
        
        if (!visited.has(newStateKey)) {
          const newPath = [...current.path, newState];
          const newCost = current.cost + 1;
          const newHeuristic = manhattanDistance(newState);
          
          queue.push({
            state: newState,
            path: newPath,
            cost: newCost,
            heuristic: newHeuristic
          });
        }
      }
    }
    
    return [];
  }, [totalPieces, manhattanDistance, getPossibleMoves, executeMove]);

  // 开始游戏
  const startGame = useCallback(() => {
    const newPuzzle = generatePuzzle();
    
    setPieces(newPuzzle);
    setOriginalPuzzle([...newPuzzle]); // 保存原始状态
    setMoves(0);
    setTimeLeft(timeLimit);
    setIsGameActive(true);
    setIsCompleted(false);
    setShowSolution(false);
    setSolutionSteps([]);
    setCurrentStep(0);
    setIsPlayingSolution(false);
    setStartTime(Date.now());
  }, [generatePuzzle, timeLimit]);

  // 提交分数到后端
  const submitScore = useCallback(async (finalScore: number) => {
    try {
      await GameAPIService.submitGameRecord({
        gameType: 'puzzle',
        score: finalScore,
        difficulty: 'medium',
        settings: {
          timeLimit,
          gridSize
        },
        gameData: {
          moves,
          timeUsed: timeLimit - timeLeft,
          accuracy: isCompleted ? 100 : 0
        }
      });
    } catch (error) {
      console.error('提交分数失败:', error);
    }
  }, [timeLimit, gridSize, moves, timeLeft, isCompleted]);

  // 显示答案走法
  const showSolutionSteps = useCallback(() => {
    if (originalPuzzle.length === 0) return;
    
    const solution = calculateOptimalSolution(originalPuzzle);
    if (solution.length > 0) {
      setSolutionSteps(solution);
      setCurrentStep(0);
      setShowSolution(true);
      setIsPlayingSolution(false);
    }
  }, [originalPuzzle, calculateOptimalSolution]);

  // 播放答案走法
  const playSolution = useCallback(() => {
    if (solutionSteps.length === 0) return;
    
    setIsPlayingSolution(true);
    setCurrentStep(0);
    
    const interval = setInterval(() => {
      setCurrentStep(prev => {
        if (prev >= solutionSteps.length - 1) {
          setIsPlayingSolution(false);
          clearInterval(interval);
          return prev;
        }
        return prev + 1;
      });
    }, 500); // 每步0.5秒
    
    return () => clearInterval(interval);
  }, [solutionSteps]);

  // 暂停答案走法
  const pauseSolution = useCallback(() => {
    setIsPlayingSolution(false);
  }, []);

  // 重置答案走法
  const resetSolution = useCallback(() => {
    setCurrentStep(0);
    setIsPlayingSolution(false);
  }, []);

  // 检查是否完成
  const checkCompletion = useCallback((currentPieces: PuzzlePiece[]) => {
    const isComplete = currentPieces.every(piece => piece.currentPosition === piece.correctPosition);
    if (isComplete && !isCompleted && isGameActive) {
      setIsCompleted(true);
      setIsGameActive(false);
      const completionTime = Date.now() - startTime;
      // 根据网格大小调整基础分数（更大的网格 = 更高的难度 = 更高的分数）
      const baseScore = gridSize === 3 ? 100 : 200;
      const timeBonus = Math.max(0, Math.floor((timeLimit * 1000 - completionTime) / 1000) * 2);
      const moveBonus = Math.max(0, (baseScore - moves * 5));
      const finalScore = baseScore + timeBonus + moveBonus;
      onScoreUpdate(finalScore);
      submitScore(finalScore);
      onGameEnd();
    }
  }, [isCompleted, startTime, timeLimit, moves, onScoreUpdate, submitScore, isGameActive, onGameEnd]);

  // 移动拼图块
  const movePiece = useCallback((pieceId: number) => {
    if (!isGameActive) return;

    const piece = pieces.find(p => p.id === pieceId);
    const emptyPiece = pieces.find(p => p.value === emptyValue);
    
    if (!piece || !emptyPiece) return;

    const pieceRow = Math.floor(piece.currentPosition / gridSize);
    const pieceCol = piece.currentPosition % gridSize;
    const emptyRow = Math.floor(emptyPiece.currentPosition / gridSize);
    const emptyCol = emptyPiece.currentPosition % gridSize;

    // 检查是否相邻
    const isAdjacent = (
      (Math.abs(pieceRow - emptyRow) === 1 && pieceCol === emptyCol) ||
      (Math.abs(pieceCol - emptyCol) === 1 && pieceRow === emptyRow)
    );

    if (isAdjacent) {
      const newPieces = pieces.map(p => {
        if (p.id === pieceId) {
          return { ...p, currentPosition: emptyPiece.currentPosition };
        }
        if (p.value === emptyValue) {
          return { ...p, currentPosition: piece.currentPosition };
        }
        return p;
      });

      setPieces(newPieces);
      setMoves(prev => prev + 1);
      // 每走一步时间减少0.15秒
      setTimeLeft(prev => Math.max(0, prev - 0.15));
      checkCompletion(newPieces);
    }
  }, [pieces, isGameActive, gridSize, emptyValue, checkCompletion]);

  // 时间倒计时
  useEffect(() => {
    if (!isGameActive) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0.1) {
          setIsGameActive(false);
          const baseScore = gridSize === 3 ? 100 : 200;
          const finalScore = Math.max(0, baseScore - moves * 2);
          submitScore(finalScore);
          onGameEnd();
          return 0;
        }
        return Math.max(0, prev - 1);
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isGameActive, onGameEnd, submitScore]);

  // 播放答案走法
  useEffect(() => {
    if (!isPlayingSolution || solutionSteps.length === 0) return;

    const interval = setInterval(() => {
      setCurrentStep(prev => {
        if (prev >= solutionSteps.length - 1) {
          setIsPlayingSolution(false);
          return prev;
        }
        return prev + 1;
      });
    }, 500);

    return () => clearInterval(interval);
  }, [isPlayingSolution, solutionSteps]);

  // 响应游戏状态变化
  useEffect(() => {
    if (isActive && !isGameActive) {
      startGame();
    } else if (!isActive && isGameActive) {
      setIsGameActive(false);
    }
  }, [isActive, isGameActive, startGame]);

  // 渲染拼图块
  const renderPiece = (piece: PuzzlePiece) => {
    const row = Math.floor(piece.currentPosition / gridSize);
    const col = piece.currentPosition % gridSize;
    const isCorrect = piece.currentPosition === piece.correctPosition;

    return (
      <motion.button
        key={piece.id}
        onClick={() => movePiece(piece.id)}
        className={`w-16 h-16 rounded-xl font-bold text-lg transition-all duration-300 ${
          piece.value === emptyValue
            ? 'bg-transparent border-2 border-dashed border-gray-400 cursor-default'
            : isCorrect
            ? 'bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg scale-105'
            : 'bg-gradient-to-br from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 hover:scale-105 shadow-md cursor-pointer'
        }`}
        whileHover={piece.value !== emptyValue ? { scale: 1.1 } : {}}
        whileTap={piece.value !== emptyValue ? { scale: 0.95 } : {}}
        disabled={piece.value === emptyValue || !isGameActive}
        style={{
          gridRow: row + 1,
          gridColumn: col + 1
        }}
      >
        {piece.value === emptyValue ? '' : piece.value + 1}
      </motion.button>
    );
  };

  // 渲染答案走法中的拼图块
  const renderSolutionPiece = (piece: PuzzlePiece) => {
    const row = Math.floor(piece.currentPosition / gridSize);
    const col = piece.currentPosition % gridSize;
    const isCorrect = piece.currentPosition === piece.correctPosition;

    return (
      <motion.div
        key={piece.id}
        className={`w-16 h-16 rounded-xl font-bold text-lg flex items-center justify-center transition-all duration-300 ${
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
        {piece.value === emptyValue ? '' : piece.value + 1}
      </motion.div>
    );
  };

  const progress = pieces.length > 0 
    ? (pieces.filter(p => p.currentPosition === p.correctPosition).length / pieces.length) * 100 
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md mx-auto"
    >
      {/* 游戏统计 */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        <motion.div 
          className="text-center p-3 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 rounded-xl border border-blue-200 dark:border-blue-700"
          whileHover={{ scale: 1.05 }}
        >
          <div className="text-xl font-bold text-blue-600 dark:text-blue-400">{moves}</div>
          <div className="text-xs text-blue-500 dark:text-blue-300 font-medium">步数</div>
        </motion.div>
        <motion.div 
          className="text-center p-3 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 rounded-xl border border-green-200 dark:border-green-700"
          whileHover={{ scale: 1.05 }}
        >
          <div className="text-xl font-bold text-green-600 dark:text-green-400">{Math.max(0, Math.ceil(timeLeft))}</div>
          <div className="text-xs text-green-500 dark:text-green-300 font-medium">时间</div>
        </motion.div>
        <motion.div 
          className="text-center p-3 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 rounded-xl border border-purple-200 dark:border-purple-700"
          whileHover={{ scale: 1.05 }}
        >
          <div className="text-xl font-bold text-purple-600 dark:text-purple-400">{Math.round(progress)}%</div>
          <div className="text-xs text-purple-500 dark:text-purple-300 font-medium">进度</div>
        </motion.div>
        <motion.div 
          className="text-center p-3 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-800/30 rounded-xl border border-orange-200 dark:border-orange-700"
          whileHover={{ scale: 1.05 }}
        >
          <div className="text-xl font-bold text-orange-600 dark:text-orange-400">{gridSize}×{gridSize}</div>
          <div className="text-xs text-orange-500 dark:text-orange-300 font-medium">难度</div>
        </motion.div>
      </div>

      {/* 进度条 */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300 mb-2">
          <span>完成进度</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <motion.div
            className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
            initial={{ width: '0%' }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* 游戏标题 */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center mb-2">
          <Target className="w-8 h-8 text-purple-600 dark:text-purple-400 mr-3" />
          <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100">数字拼图</h3>
        </div>
        <p className="text-gray-600 dark:text-gray-300">将数字按顺序排列完成拼图</p>
      </div>

      {/* 拼图网格 */}
      <div className="flex justify-center mb-6">
        <div 
          className="grid gap-1 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 p-4 rounded-2xl border border-gray-200 dark:border-gray-600"
          style={{ 
            gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
            gridTemplateRows: `repeat(${gridSize}, 1fr)`,
            maxWidth: `${gridSize * 80 + 32}px`
          }}
        >
          {pieces.map(renderPiece)}
        </div>
      </div>

      {/* 操作提示 */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center text-sm text-gray-600 dark:text-gray-300">
          <Move className="w-4 h-4 mr-2" />
          <span>点击相邻的数字块进行移动</span>
        </div>
      </div>

      {/* 游戏结束后的按钮组 */}
      {isCompleted && !showSolution && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-3"
        >
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={showSolutionSteps}
              className="flex items-center justify-center px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <Eye className="w-5 h-5 mr-2" />
              查看答案走法
            </button>
            <button
              onClick={startGame}
              className="flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-indigo-600 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <RotateCcw className="w-5 h-5 mr-2" />
              重新开始
            </button>
          </div>
        </motion.div>
      )}

      {/* 答案走法展示 */}
      <AnimatePresence>
        {showSolution && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mt-6 p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-2xl border border-gray-200 dark:border-gray-600"
          >
            <div className="text-center mb-4">
              <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">答案走法</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                最优解：{solutionSteps.length - 1} 步
              </p>
            </div>

            {/* 控制按钮 */}
            <div className="flex justify-center gap-3 mb-4">
              <button
                onClick={isPlayingSolution ? pauseSolution : playSolution}
                className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                {isPlayingSolution ? <Pause className="w-4 h-4 mr-1" /> : <Play className="w-4 h-4 mr-1" />}
                {isPlayingSolution ? '暂停' : '播放'}
              </button>
              <button
                onClick={resetSolution}
                className="flex items-center px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                <RotateCcw className="w-4 h-4 mr-1" />
                重置
              </button>
              <button
                onClick={startGame}
                className="flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                <RotateCcw className="w-4 h-4 mr-1" />
                重新开始
              </button>
            </div>

            {/* 进度显示 */}
            <div className="text-center mb-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                步骤 {currentStep + 1} / {solutionSteps.length}
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
                <motion.div
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                  initial={{ width: '0%' }}
                  animate={{ width: `${((currentStep + 1) / solutionSteps.length) * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>

            {/* 当前状态展示 */}
            {solutionSteps.length > 0 && (
              <div className="flex justify-center">
                <div 
                  className="grid gap-1 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 p-4 rounded-2xl border border-gray-200 dark:border-gray-600"
                  style={{ 
                    gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
                    gridTemplateRows: `repeat(${gridSize}, 1fr)`,
                    maxWidth: `${gridSize * 80 + 32}px`
                  }}
                >
                  {solutionSteps[currentStep]?.map(renderSolutionPiece)}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

    </motion.div>
  );
};

export default PuzzleGame; 