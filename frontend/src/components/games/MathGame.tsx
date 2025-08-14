import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calculator, Target, Trophy } from 'lucide-react';
import Button from '../ui/Button';
import GameAPIService from '../../services/gameAPI';

interface MathGameProps {
  onScoreUpdate: (score: number) => void;
  onGameEnd: () => void;
  isActive: boolean;
  difficulty: 'easy' | 'medium' | 'hard';
  timeLimit: number;
}

interface MathProblem {
  question: string;
  answer: number;
  options?: number[];
  difficulty: 'easy' | 'medium' | 'hard';
  type: 'addition' | 'subtraction' | 'multiplication' | 'division' | 'mixed';
}

const MathGame: React.FC<MathGameProps> = ({ 
  onScoreUpdate, 
  onGameEnd, 
  isActive,
  difficulty, 
  timeLimit 
}) => {
  const [currentProblem, setCurrentProblem] = useState<MathProblem | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [isGameActive, setIsGameActive] = useState(false);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [totalAnswered, setTotalAnswered] = useState(0);
  const [correctAnswered, setCorrectAnswered] = useState(0);

  // 生成数学题目
  const generateProblem = useCallback((): MathProblem => {
    const types = ['addition', 'subtraction', 'multiplication', 'division'];
    const type = types[Math.floor(Math.random() * types.length)] as any;
    
    let a: number, b: number, answer: number, question: string;
    
    switch (type) {
      case 'addition':
        if (difficulty === 'easy') {
          a = Math.floor(Math.random() * 20) + 1;
          b = Math.floor(Math.random() * 20) + 1;
        } else if (difficulty === 'medium') {
          a = Math.floor(Math.random() * 100) + 10;
          b = Math.floor(Math.random() * 100) + 10;
        } else {
          a = Math.floor(Math.random() * 500) + 100;
          b = Math.floor(Math.random() * 500) + 100;
        }
        answer = a + b;
        question = `${a} + ${b} = ?`;
        break;
        
      case 'subtraction':
        if (difficulty === 'easy') {
          a = Math.floor(Math.random() * 20) + 10;
          b = Math.floor(Math.random() * a) + 1;
        } else if (difficulty === 'medium') {
          a = Math.floor(Math.random() * 200) + 50;
          b = Math.floor(Math.random() * a) + 10;
        } else {
          a = Math.floor(Math.random() * 1000) + 200;
          b = Math.floor(Math.random() * a) + 50;
        }
        answer = a - b;
        question = `${a} - ${b} = ?`;
        break;
        
      case 'multiplication':
        if (difficulty === 'easy') {
          a = Math.floor(Math.random() * 12) + 1;
          b = Math.floor(Math.random() * 12) + 1;
        } else if (difficulty === 'medium') {
          a = Math.floor(Math.random() * 25) + 5;
          b = Math.floor(Math.random() * 25) + 5;
        } else {
          a = Math.floor(Math.random() * 50) + 10;
          b = Math.floor(Math.random() * 50) + 10;
        }
        answer = a * b;
        question = `${a} × ${b} = ?`;
        break;
        
      case 'division':
        if (difficulty === 'easy') {
          b = Math.floor(Math.random() * 12) + 1;
          a = b * (Math.floor(Math.random() * 10) + 1);
        } else if (difficulty === 'medium') {
          b = Math.floor(Math.random() * 20) + 2;
          a = b * (Math.floor(Math.random() * 15) + 2);
        } else {
          b = Math.floor(Math.random() * 30) + 5;
          a = b * (Math.floor(Math.random() * 20) + 3);
        }
        answer = a / b;
        question = `${a} ÷ ${b} = ?`;
        break;
        
      default:
        a = Math.floor(Math.random() * 20) + 1;
        b = Math.floor(Math.random() * 20) + 1;
        answer = a + b;
        question = `${a} + ${b} = ?`;
    }

    return {
      question,
      answer,
      difficulty,
      type
    };
  }, [difficulty]);

  // 开始游戏
  const startGame = useCallback(() => {
    setIsGameActive(true);
    setScore(0);
    setStreak(0);
    setTimeLeft(timeLimit);
    setTotalAnswered(0);
    setCorrectAnswered(0);
    setCurrentProblem(generateProblem());
  }, [generateProblem, timeLimit]);

  // 处理答案提交
  const handleSubmit = useCallback(() => {
    if (!currentProblem || !userAnswer.trim()) return;

    const userNum = parseInt(userAnswer);
    const isCorrect = userNum === currentProblem.answer;
    
    setTotalAnswered(prev => prev + 1);
    
    if (isCorrect) {
      const newStreak = streak + 1;
      // 根据难度调整基础分数
    const baseScore = difficulty === 'easy' ? 5 : difficulty === 'medium' ? 12 : 25;
    const points = Math.floor(baseScore * (1 + newStreak * 0.1)); // 连胜奖励
      const newScore = score + points;
      
      setScore(newScore);
      setStreak(newStreak);
      setCorrectAnswered(prev => prev + 1);
      setFeedback('correct');
      onScoreUpdate(newScore);
    } else {
      setStreak(0);
      setFeedback('incorrect');
    }

    setUserAnswer('');
    setCurrentProblem(generateProblem());

    // 清除反馈
    setTimeout(() => setFeedback(null), 1500);
  }, [currentProblem, userAnswer, score, streak, generateProblem, onScoreUpdate]);

  // 处理键盘事件
  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  }, [handleSubmit]);

  // 计算准确率
  const accuracy = totalAnswered > 0 ? Math.round((correctAnswered / totalAnswered) * 100) : 0;

  // 创建一个不依赖score的提交函数，用于计时器
  const submitScoreForTimer = useCallback(async (currentScore: number) => {
    try {
      await GameAPIService.submitGameRecord({
        gameType: 'math',
        score: currentScore,
        difficulty,
        settings: {
          timeLimit,
          difficulty
        },
        gameData: {
          moves: totalAnswered,
          accuracy: accuracy,
          timeUsed: timeLimit - timeLeft
        }
      });
    } catch (error) {
      console.error('提交分数失败:', error);
    }
  }, [difficulty, timeLimit, totalAnswered, accuracy, timeLeft]);

  // 时间倒计时
  useEffect(() => {
    if (!isGameActive) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setIsGameActive(false);
          // 使用不依赖score的提交函数
          submitScoreForTimer(score);
          onGameEnd();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isGameActive, onGameEnd, submitScoreForTimer]);

  // 响应游戏状态变化
  useEffect(() => {
    if (isActive && !isGameActive) {
      startGame();
    } else if (!isActive && isGameActive) {
      setIsGameActive(false);
    }
  }, [isActive, isGameActive, startGame]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md mx-auto"
    >
      {/* 游戏统计 */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        <motion.div 
          className="text-center p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200"
          whileHover={{ scale: 1.05 }}
        >
          <div className="text-2xl font-bold text-blue-600">{score}</div>
          <div className="text-xs text-blue-500 font-medium">总分</div>
        </motion.div>
        <motion.div 
          className="text-center p-3 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200"
          whileHover={{ scale: 1.05 }}
        >
          <div className="text-2xl font-bold text-green-600">{streak}</div>
          <div className="text-xs text-green-500 font-medium">连胜</div>
        </motion.div>
        <motion.div 
          className="text-center p-3 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200"
          whileHover={{ scale: 1.05 }}
        >
          <div className="text-2xl font-bold text-purple-600">{accuracy}%</div>
          <div className="text-xs text-purple-500 font-medium">准确率</div>
        </motion.div>
        <motion.div 
          className="text-center p-3 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl border border-orange-200"
          whileHover={{ scale: 1.05 }}
        >
          <div className="text-2xl font-bold text-orange-600">{timeLeft}</div>
          <div className="text-xs text-orange-500 font-medium">剩余时间</div>
        </motion.div>
      </div>

      {/* 进度条 */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>时间进度</span>
          <span>{Math.round(((timeLimit - timeLeft) / timeLimit) * 100)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <motion.div
            className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
            initial={{ width: '100%' }}
            animate={{ width: `${((timeLimit - timeLeft) / timeLimit) * 100}%` }}
            transition={{ duration: 1, ease: 'linear' }}
          />
        </div>
      </div>

      {/* 题目区域 */}
      <motion.div
        key={currentProblem?.question}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="text-center mb-6"
      >
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8 border border-gray-200">
          <div className="flex items-center justify-center mb-4">
            <Calculator className="w-8 h-8 text-blue-600 mr-3" />
            <h3 className="text-xl font-bold text-gray-800">数学计算</h3>
          </div>
          
          <div className="text-4xl font-bold text-gray-800 mb-6">
            {currentProblem?.question}
          </div>
          
          <div className="flex items-center justify-center space-x-3">
            <input
              type="number"
              value={userAnswer}
              onChange={(e) => {
                const value = e.target.value;
                // 限制输入长度，防止过长输入导致性能问题
                if (value.length <= 10) {
                  setUserAnswer(value);
                }
              }}
              onKeyPress={handleKeyPress}
              className="w-32 px-4 py-3 text-center text-2xl font-bold border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all"
              placeholder="?"
              autoFocus
              disabled={!isGameActive}
              maxLength={10}
            />
            <Button
              onClick={handleSubmit}
              variant="primary"
              disabled={!userAnswer.trim() || !isGameActive}
              className="px-6 py-3 text-lg font-semibold"
            >
              确认
            </Button>
          </div>
        </div>
      </motion.div>

      {/* 反馈信息 */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className={`text-center p-4 rounded-xl font-semibold text-lg ${
              feedback === 'correct' 
                ? 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 border border-green-300' 
                : 'bg-gradient-to-r from-red-100 to-red-200 text-red-800 border border-red-300'
            }`}
          >
            {feedback === 'correct' ? (
              <div className="flex items-center justify-center">
                <Trophy className="w-6 h-6 mr-2" />
                <span>正确！+{Math.floor((difficulty === 'easy' ? 10 : difficulty === 'medium' ? 15 : 25) * (1 + streak * 0.1))}分</span>
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <Target className="w-6 h-6 mr-2" />
                <span>错误，再试一次</span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>


    </motion.div>
  );
};

export default MathGame; 