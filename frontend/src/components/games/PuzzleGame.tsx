import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Target, Move } from 'lucide-react';
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

  const totalPieces = gridSize * gridSize;
  const emptyValue = totalPieces - 1;

  // 生成拼图
  const generatePuzzle = useCallback((): PuzzlePiece[] => {
    const values = Array.from({ length: totalPieces - 1 }, (_, i) => i);
    const shuffled = [...values, emptyValue].sort(() => Math.random() - 0.5);
    
    return shuffled.map((value, index) => ({
      id: value,
      value,
      currentPosition: index,
      correctPosition: value
    }));
  }, [totalPieces, emptyValue]);

  // 检查是否可解
  const isSolvable = useCallback((puzzle: PuzzlePiece[]): boolean => {
    let inversions = 0;
    const flatPuzzle = puzzle.map(p => p.value);
    
    for (let i = 0; i < flatPuzzle.length - 1; i++) {
      for (let j = i + 1; j < flatPuzzle.length; j++) {
        if (flatPuzzle[i] !== emptyValue && flatPuzzle[j] !== emptyValue && flatPuzzle[i] > flatPuzzle[j]) {
          inversions++;
        }
      }
    }
    
    if (gridSize % 2 === 1) {
      return inversions % 2 === 0;
    } else {
      const emptyRow = Math.floor(puzzle.find(p => p.value === emptyValue)!.currentPosition / gridSize);
      return (inversions + emptyRow) % 2 === 0;
    }
  }, [gridSize, emptyValue]);

  // 开始游戏
  const startGame = useCallback(() => {
    let newPuzzle: PuzzlePiece[];
    do {
      newPuzzle = generatePuzzle();
    } while (!isSolvable(newPuzzle));
    
    setPieces(newPuzzle);
    setMoves(0);
    setTimeLeft(timeLimit);
    setIsGameActive(true);
    setIsCompleted(false);
    setStartTime(Date.now());
  }, [generatePuzzle, isSolvable, timeLimit]);

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


    </motion.div>
  );
};

export default PuzzleGame; 