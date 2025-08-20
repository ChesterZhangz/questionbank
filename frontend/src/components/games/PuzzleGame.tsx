import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Target, Move } from 'lucide-react';
import GameAPIService from '../../services/gameAPI';
import { type Move as PuzzleMove } from '../../lib/puzzle/PuzzleSolver';

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
  const [initialBoard, setInitialBoard] = useState<number[]>([]);
  const [moveSequence, setMoveSequence] = useState<PuzzleMove[]>([]);
  const [hasSubmittedScore, setHasSubmittedScore] = useState<boolean>(false);

  const totalPieces = gridSize * gridSize;
  const emptyValue = 0; // 修复：按照Python代码逻辑，空格值应该是0

  // 生成拼图
  const generatePuzzle = useCallback((): PuzzlePiece[] => {
    // 修复：按照Python代码逻辑，空格应该是0，目标状态是[0,1,2,3,4,5,6,7,8]
    // 其中0是空格，其他数字在对应位置
    const correctPuzzle = Array.from({ length: totalPieces }, (_, i) => ({
      id: i,
      value: i === 0 ? 0 : i,  // 第0个位置是空格(0)，其他位置是对应数字
      currentPosition: i,
      correctPosition: i
    }));
    
    // 然后通过随机移动来打乱拼图，确保可解性
    const shuffledPuzzle = [...correctPuzzle];
    const randomMoves = Math.floor(Math.random() * 100) + 100; // 100-200次随机移动
    
    for (let i = 0; i < randomMoves; i++) {
      // 找到空格位置
      const emptyIndex = shuffledPuzzle.findIndex(p => p.value === emptyValue);
      const emptyRow = Math.floor(emptyIndex / gridSize);
      const emptyCol = emptyIndex % gridSize;
      
      // 生成可能的移动方向
      const possibleMoves = [];
      if (emptyRow > 0) possibleMoves.push(emptyIndex - gridSize); // 上
      if (emptyRow < gridSize - 1) possibleMoves.push(emptyIndex + gridSize); // 下
      if (emptyCol > 0) possibleMoves.push(emptyIndex - 1); // 左
      if (emptyCol < gridSize - 1) possibleMoves.push(emptyIndex + 1); // 右
      
      // 增加随机性：有时候优先选择某个方向
      if (possibleMoves.length > 0) {
        let selectedMoveIndex;
        
        // 20%的概率进行"智能"移动，避免立即回到上一个位置
        if (i > 0 && Math.random() < 0.2) {
          // 尝试避免与上一次移动相反的方向
          const filteredMoves = possibleMoves.filter(() => {
            // 简单的过滤逻辑，避免完全相反的移动
            return Math.random() > 0.3;
          });
          selectedMoveIndex = filteredMoves.length > 0 
            ? filteredMoves[Math.floor(Math.random() * filteredMoves.length)]
            : possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
        } else {
          // 80%的概率完全随机选择
          selectedMoveIndex = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
        }
        
        const pieceToMove = shuffledPuzzle[selectedMoveIndex];
        
        // 交换位置
        shuffledPuzzle[emptyIndex].currentPosition = pieceToMove.currentPosition;
        shuffledPuzzle[selectedMoveIndex].currentPosition = emptyIndex;
        
        // 更新数组中的位置
        [shuffledPuzzle[emptyIndex], shuffledPuzzle[selectedMoveIndex]] = 
        [shuffledPuzzle[selectedMoveIndex], shuffledPuzzle[emptyIndex]];
      }
      
      // 每隔一定次数增加额外的随机性
      if (i % 10 === 0 && i > 0) {
        // 随机交换两个非空格的相邻位置（保持可解性）
        const nonEmptyPieces = shuffledPuzzle.filter(p => p.value !== emptyValue);
        if (nonEmptyPieces.length >= 2 && Math.random() < 0.1) {
          // 找到两个相邻的非空格位置进行小幅调整
          for (let attempt = 0; attempt < 5; attempt++) {
            const piece1 = nonEmptyPieces[Math.floor(Math.random() * nonEmptyPieces.length)];
            const piece1Row = Math.floor(piece1.currentPosition / gridSize);
            const piece1Col = piece1.currentPosition % gridSize;
            
            // 找相邻的位置
            const adjacentPositions: number[] = [];
            if (piece1Row > 0) adjacentPositions.push((piece1Row - 1) * gridSize + piece1Col);
            if (piece1Row < gridSize - 1) adjacentPositions.push((piece1Row + 1) * gridSize + piece1Col);
            if (piece1Col > 0) adjacentPositions.push(piece1Row * gridSize + piece1Col - 1);
            if (piece1Col < gridSize - 1) adjacentPositions.push(piece1Row * gridSize + piece1Col + 1);
            
            const adjacentPiece = shuffledPuzzle.find(p => 
              adjacentPositions.includes(p.currentPosition) && p.value !== emptyValue
            );
            
            if (adjacentPiece) {
              // 交换这两个相邻的非空格位置
              const tempPos = piece1.currentPosition;
              piece1.currentPosition = adjacentPiece.currentPosition;
              adjacentPiece.currentPosition = tempPos;
              
              // 更新数组中的位置
              const index1 = shuffledPuzzle.findIndex(p => p.id === piece1.id);
              const index2 = shuffledPuzzle.findIndex(p => p.id === adjacentPiece.id);
              [shuffledPuzzle[index1], shuffledPuzzle[index2]] = [shuffledPuzzle[index2], shuffledPuzzle[index1]];
              break;
            }
          }
        }
      }
    }
    
    return shuffledPuzzle;
  }, [totalPieces, emptyValue, gridSize]);



  // 开始游戏
  const startGame = useCallback(() => {
    // 直接生成拼图，因为generatePuzzle已经确保可解性
    const newPuzzle = generatePuzzle();
    
    // 记录初始棋盘状态
    const initialBoardState = newPuzzle.map(piece => piece.value);
    setInitialBoard(initialBoardState);
    
    setPieces(newPuzzle);
    setMoves(0);
    setMoveSequence([]);
    setTimeLeft(timeLimit);
    setIsGameActive(true);
    setIsCompleted(false);
    setStartTime(Date.now());
    setHasSubmittedScore(false);
  }, [generatePuzzle, timeLimit]);

  // 提交分数到后端
  const submitScore = useCallback(async (finalScore: number, timeUsed: number, accuracy: number) => {
    // 防止重复提交分数
    if (hasSubmittedScore) {
      console.log('分数已经提交过，跳过重复提交');
      return;
    }
    
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
          timeUsed,
          accuracy,
          initialBoard,
          moveSequence
        }
      });
      
      // 标记分数已提交
      setHasSubmittedScore(true);
      console.log('分数提交成功');
    } catch (error) {
      console.error('提交分数失败:', error);
    }
  }, [timeLimit, gridSize, moves, initialBoard, moveSequence, hasSubmittedScore]);

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
      const timeUsed = timeLimit - timeLeft;
      onScoreUpdate(finalScore);
      // 游戏完成时提交分数
      submitScore(finalScore, timeUsed, 100);
      onGameEnd();
    }
  }, [isCompleted, startTime, timeLimit, moves, onScoreUpdate, isGameActive, onGameEnd, timeLeft, gridSize]);

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
      
      // 记录移动
      const move: PuzzleMove = {
        from: piece.currentPosition,
        to: emptyPiece.currentPosition,
        piece: piece.value,
        step: moves + 1
      };
      setMoveSequence(prev => [...prev, move]);
      
      // 每走一步时间减少0.2秒
      setTimeLeft(prev => Math.max(1, prev - 0.2));
      checkCompletion(newPieces);
    }
  }, [pieces, isGameActive, gridSize, emptyValue, checkCompletion]);

  // 时间倒计时
  useEffect(() => {
    if (!isGameActive) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setIsGameActive(false);
          // 只有在游戏未完成且未提交过分数时才提交分数（时间耗尽）
          if (!isCompleted) {
            const baseScore = gridSize === 3 ? 100 : 200;
            const finalScore = Math.max(0, baseScore - moves * 2);
            // 时间耗尽时提交分数
            submitScore(finalScore, timeLimit, 0);
          }
          onGameEnd();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isGameActive, onGameEnd, isCompleted, moves, gridSize, timeLimit]);

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
        {piece.value === emptyValue ? '' : piece.value}
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