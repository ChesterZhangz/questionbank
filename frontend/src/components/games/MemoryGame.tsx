import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain } from 'lucide-react';
import GameAPIService from '../../services/gameAPI';

interface MemoryGameProps {
  onScoreUpdate: (score: number) => void;
  onGameEnd: () => void;
  isActive: boolean;
  gridSize: 4 | 5 | 6;
  timeLimit: number;
}

interface MemoryCard {
  id: number;
  value: number;
  isFlipped: boolean;
  isMatched: boolean;
  position: number;
}

const MemoryGame: React.FC<MemoryGameProps> = ({ 
  onScoreUpdate, 
  onGameEnd, 
  isActive,
  gridSize, 
  timeLimit 
}) => {
  const [cards, setCards] = useState<MemoryCard[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [moves, setMoves] = useState(0);
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [isGameActive, setIsGameActive] = useState(false);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [totalPairs, setTotalPairs] = useState(0);

  // 生成卡片
  const generateCards = useCallback((): MemoryCard[] => {
    const totalCards = gridSize * gridSize;
    const pairs = totalCards / 2;
    const values = Array.from({ length: pairs }, (_, i) => i + 1);
    const cardValues = [...values, ...values]; // 每对数字出现两次
    
    // 随机打乱
    const shuffled = cardValues.sort(() => Math.random() - 0.5);
    
    return shuffled.map((value, index) => ({
      id: index,
      value,
      isFlipped: false,
      isMatched: false,
      position: index
    }));
  }, [gridSize]);

  // 开始游戏
  const startGame = useCallback(() => {
    const newCards = generateCards();
    setCards(newCards);
    setFlippedCards([]);
    setScore(0);
    setMoves(0);
    setTimeLeft(timeLimit);
    setMatchedPairs(0);
    setTotalPairs((gridSize * gridSize) / 2);
    setIsGameActive(true);
  }, [generateCards, timeLimit, gridSize]);

  // 处理卡片点击
  const handleCardClick = useCallback((cardId: number) => {
    if (!isGameActive) return;
    
    const card = cards.find(c => c.id === cardId);
    if (!card || card.isMatched || card.isFlipped || flippedCards.length >= 2) return;

    const newFlippedCards = [...flippedCards, cardId];
    setFlippedCards(newFlippedCards);

    // 翻转卡片
    setCards(prev => prev.map(c => 
      c.id === cardId ? { ...c, isFlipped: true } : c
    ));

    // 如果翻开了两张卡片，检查是否匹配
    if (newFlippedCards.length === 2) {
      setMoves(prev => prev + 1);
      
      const [firstId, secondId] = newFlippedCards;
      const firstCard = cards.find(c => c.id === firstId);
      const secondCard = cards.find(c => c.id === secondId);

      if (firstCard && secondCard && firstCard.value === secondCard.value) {
        // 匹配成功
        setTimeout(() => {
          setCards(prev => prev.map(c => 
            c.id === firstId || c.id === secondId 
              ? { ...c, isMatched: true, isFlipped: true }
              : c
          ));
          setMatchedPairs(prev => prev + 1);
          // 根据网格大小调整分数（更大的网格 = 更高的难度 = 更高的分数）
          const baseScore = gridSize === 4 ? 10 : gridSize === 5 ? 15 : 20;
          setScore(prev => prev + baseScore);
          onScoreUpdate(score + baseScore);
          setFlippedCards([]);
        }, 500);
      } else {
        // 匹配失败，翻回卡片
        setTimeout(() => {
          setCards(prev => prev.map(c => 
            c.id === firstId || c.id === secondId 
              ? { ...c, isFlipped: false }
              : c
          ));
          setFlippedCards([]);
        }, 1000);
      }
    }
  }, [cards, flippedCards, isGameActive, score, onScoreUpdate]);

  // 提交分数到后端
  const submitScore = useCallback(async (finalScore?: number) => {
    try {
      const scoreToSubmit = finalScore !== undefined ? finalScore : score;
      await GameAPIService.submitGameRecord({
        gameType: 'memory',
        score: scoreToSubmit,
        difficulty: 'medium',
        settings: {
          timeLimit,
          gridSize
        },
        gameData: {
          moves,
          timeUsed: timeLimit - timeLeft,
          accuracy: totalPairs > 0 ? Math.round((matchedPairs / totalPairs) * 100) : 0
        }
      });
    } catch (error) {
      console.error('提交分数失败:', error);
    }
  }, [score, timeLimit, gridSize, moves, timeLeft, matchedPairs, totalPairs]);



  // 时间倒计时
  useEffect(() => {
    if (!isGameActive) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setIsGameActive(false);
          // 直接在这里处理游戏结束，避免依赖submitScoreForTimer
          const finalScore = score;
          const finalMoves = moves;
          const finalMatchedPairs = matchedPairs;
          const finalTotalPairs = totalPairs;
          
          // 异步提交分数
          GameAPIService.submitGameRecord({
            gameType: 'memory',
            score: finalScore,
            difficulty: 'medium',
            settings: {
              timeLimit,
              gridSize
            },
            gameData: {
              moves: finalMoves,
              timeUsed: timeLimit,
              accuracy: finalTotalPairs > 0 ? Math.round((finalMatchedPairs / finalTotalPairs) * 100) : 0
            }
          }).catch((error: any) => {
            console.error('提交分数失败:', error);
          });
          
          onGameEnd();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isGameActive, onGameEnd, score, moves, matchedPairs, totalPairs, timeLimit, gridSize]);

  // 检查游戏是否完成
  useEffect(() => {
    if (matchedPairs === totalPairs && totalPairs > 0 && isGameActive) {
      setIsGameActive(false);
      const bonus = Math.max(0, timeLeft * 2); // 时间奖励
      const finalScore = score + bonus;
      setScore(finalScore);
      onScoreUpdate(finalScore);
      submitScore(finalScore);
      onGameEnd();
    }
  }, [matchedPairs, totalPairs, timeLeft, score, onScoreUpdate, submitScore, isGameActive, onGameEnd]);

  // 响应游戏状态变化
  useEffect(() => {
    if (isActive && !isGameActive) {
      startGame();
    } else if (!isActive && isGameActive) {
      setIsGameActive(false);
    }
  }, [isActive, isGameActive, startGame]);

  const progress = totalPairs > 0 ? (matchedPairs / totalPairs) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-2xl mx-auto"
    >
      {/* 游戏统计 */}
      <div className="grid grid-cols-5 gap-3 mb-6">
        <motion.div 
          className="text-center p-3 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 rounded-xl border border-blue-200 dark:border-blue-700"
          whileHover={{ scale: 1.05 }}
        >
          <div className="text-xl font-bold text-blue-600 dark:text-blue-400">{score}</div>
          <div className="text-xs text-blue-500 dark:text-blue-300 font-medium">得分</div>
        </motion.div>
        <motion.div 
          className="text-center p-3 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 rounded-xl border border-green-200 dark:border-green-700"
          whileHover={{ scale: 1.05 }}
        >
          <div className="text-xl font-bold text-green-600 dark:text-green-400">{moves}</div>
          <div className="text-xs text-green-500 dark:text-green-300 font-medium">步数</div>
        </motion.div>
        <motion.div 
          className="text-center p-3 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 rounded-xl border border-purple-200 dark:border-purple-700"
          whileHover={{ scale: 1.05 }}
        >
          <div className="text-xl font-bold text-purple-600 dark:text-purple-400">{matchedPairs}/{totalPairs}</div>
          <div className="text-xs text-purple-500 dark:text-purple-300 font-medium">配对</div>
        </motion.div>
        <motion.div 
          className="text-center p-3 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-800/30 rounded-xl border border-orange-200 dark:border-orange-700"
          whileHover={{ scale: 1.05 }}
        >
          <div className="text-xl font-bold text-orange-600 dark:text-orange-400">{timeLeft}</div>
          <div className="text-xs text-orange-500 dark:text-orange-300 font-medium">时间</div>
        </motion.div>
        <motion.div 
          className="text-center p-3 bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-900/30 dark:to-pink-800/30 rounded-xl border border-pink-200 dark:border-pink-700"
          whileHover={{ scale: 1.05 }}
        >
          <div className="text-xl font-bold text-pink-600 dark:text-pink-400">{Math.round(progress)}%</div>
          <div className="text-xs text-pink-500 dark:text-pink-300 font-medium">进度</div>
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
            className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full"
            initial={{ width: '0%' }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* 游戏标题 */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center mb-2">
          <Brain className="w-8 h-8 text-green-600 dark:text-green-400 mr-3" />
          <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100">记忆游戏</h3>
        </div>
        <p className="text-gray-600 dark:text-gray-300">找到所有相同的数字配对</p>
      </div>

      {/* 卡片网格 */}
      <div className="flex justify-center mb-6">
        <div 
          className="grid gap-2 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 p-4 rounded-2xl border border-gray-200 dark:border-gray-600"
          style={{ 
            gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
            maxWidth: `${gridSize * 80 + 32}px`
          }}
        >
          {cards.map((card) => (
            <motion.button
              key={card.id}
              onClick={() => handleCardClick(card.id)}
              className={`w-16 h-16 rounded-xl border-2 font-bold text-lg transition-all duration-300 ${
                card.isMatched
                  ? 'bg-gradient-to-br from-green-500 to-green-600 text-white border-green-500 scale-105 shadow-lg'
                  : card.isFlipped
                  ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white border-blue-500 shadow-md'
                  : 'bg-gradient-to-br from-gray-200 to-gray-300 text-gray-700 border-gray-300 hover:bg-gradient-to-br hover:from-gray-300 hover:to-gray-400 hover:scale-105 hover:shadow-md'
              }`}
              whileHover={{ scale: card.isMatched ? 1.05 : 1.1 }}
              whileTap={{ scale: 0.95 }}
              disabled={card.isMatched || !isGameActive}
            >
              <AnimatePresence mode="wait">
                {card.isFlipped || card.isMatched ? (
                  <motion.div
                    key="flipped"
                    initial={{ rotateY: -90, opacity: 0 }}
                    animate={{ rotateY: 0, opacity: 1 }}
                    exit={{ rotateY: 90, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="w-full h-full flex items-center justify-center"
                  >
                    {card.value}
                  </motion.div>
                ) : (
                  <motion.div
                    key="hidden"
                    initial={{ rotateY: 90, opacity: 0 }}
                    animate={{ rotateY: 0, opacity: 1 }}
                    exit={{ rotateY: -90, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="w-full h-full flex items-center justify-center"
                  >
                    ?
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          ))}
        </div>
      </div>


    </motion.div>
  );
};

export default MemoryGame; 