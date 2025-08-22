import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calculator, Target, Trophy } from 'lucide-react';
import Button from '../ui/Button';
import GameAPIService from '../../services/gameAPI';
import { LaTeXRenderer } from '../../lib/latex/renderer/LaTeXRenderer';

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
  type: 'addition' | 'subtraction' | 'multiplication' | 'division' | 'mixed' | 'power' | 'square_root' | 'complex_arithmetic' | 'triple_arithmetic' | 'mixed_operations';
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
  const [latexRenderer] = useState(() => new LaTeXRenderer());

  // 生成数学题目
  const generateProblem = useCallback((): MathProblem => {
    if (difficulty === 'hard') {
      // 困难模式：纯粹的计算题，避免简单运算
      const complexTypes = ['power', 'square_root', 'complex_arithmetic', 'triple_arithmetic', 'mixed_operations'];
      const type = complexTypes[Math.floor(Math.random() * complexTypes.length)] as any;
      
      let answer: number, question: string;
      
      switch (type) {
        case 'power':
          // 幂运算：避免简单如2^2=4
          const base = Math.floor(Math.random() * 12) + 3; // 3-14
          const exp = Math.floor(Math.random() * 3) + 3;   // 3-5
          answer = Math.pow(base, exp);
          question = `$$${base}^{${exp}} = ?$$`;
          break;
          
        case 'square_root':
          // 完全平方数开方：避免简单如√16=4
          const perfectSquares = [121, 144, 169, 196, 225, 256, 289, 324, 361, 400, 441, 484, 529, 576, 625, 676, 729, 784, 841, 900, 961];
          const square = perfectSquares[Math.floor(Math.random() * perfectSquares.length)];
          answer = Math.sqrt(square);
          question = `$$\\sqrt{${square}} = ?$$`;
          break;
          
        case 'complex_arithmetic':
          // 复合运算：(a × b) + (c × d)，确保不是简单运算
          const a1 = Math.floor(Math.random() * 30) + 15; // 15-44
          const b1 = Math.floor(Math.random() * 20) + 8;  // 8-27
          const c1 = Math.floor(Math.random() * 25) + 12; // 12-36
          const d1 = Math.floor(Math.random() * 18) + 6;  // 6-23
          answer = (a1 * b1) + (c1 * d1);
          question = `$$(${a1} \\times ${b1}) + (${c1} \\times ${d1}) = ?$$`;
          break;
          
        
          
        case 'triple_arithmetic':
          // 三重运算：(a × b) + (c × d) - (e × f)
          const a2 = Math.floor(Math.random() * 25) + 12; // 12-36
          const b2 = Math.floor(Math.random() * 15) + 7;  // 7-21
          const c2 = Math.floor(Math.random() * 20) + 10; // 10-29
          const d2 = Math.floor(Math.random() * 12) + 5;  // 5-16
          const e2 = Math.floor(Math.random() * 18) + 8;  // 8-25
          const f2 = Math.floor(Math.random() * 10) + 4;  // 4-13
          answer = (a2 * b2) + (c2 * d2) - (e2 * f2);
          question = `$$(${a2} \\times ${b2}) + (${c2} \\times ${d2}) - (${e2} \\times ${f2}) = ?$$`;
          break;
          
        case 'mixed_operations':
          // 混合运算：a × b + c ÷ d
          const a3 = Math.floor(Math.random() * 35) + 18; // 18-52
          const b3 = Math.floor(Math.random() * 22) + 9;  // 9-30
          const c3 = Math.floor(Math.random() * 300) + 100; // 100-399
          const d3 = Math.floor(Math.random() * 15) + 6;  // 6-20
          // 确保c能被d整除
          const adjustedC = Math.floor(c3 / d3) * d3;
          answer = (a3 * b3) + (adjustedC / d3);
          question = `$$${a3} \\times ${b3} + ${adjustedC} \\div ${d3} = ?$$`;
          break;
          
        default:
          // 如果出现未处理的类型，生成一个复杂的乘法
          const a4 = Math.floor(Math.random() * 60) + 25; // 25-84
          const b4 = Math.floor(Math.random() * 45) + 18; // 18-62
          answer = a4 * b4;
          question = `$$${a4} \\times ${b4} = ?$$`;
      }
      
      return {
        question,
        answer,
        difficulty,
        type: type as any
      };
    } else {
      // 简单和中等模式保持原有逻辑
      const types = ['addition', 'subtraction', 'multiplication', 'division'];
      const type = types[Math.floor(Math.random() * types.length)] as any;
      
      let a: number, b: number, answer: number, question: string;
      
      switch (type) {
        case 'addition':
          if (difficulty === 'easy') {
            a = Math.floor(Math.random() * 20) + 1;
            b = Math.floor(Math.random() * 20) + 1;
          } else {
            a = Math.floor(Math.random() * 100) + 10;
            b = Math.floor(Math.random() * 100) + 10;
          }
          answer = a + b;
          question = `$$${a} + ${b} = ?$$`;
          break;
          
        case 'subtraction':
          if (difficulty === 'easy') {
            a = Math.floor(Math.random() * 20) + 10;
            b = Math.floor(Math.random() * a) + 1;
          } else {
            a = Math.floor(Math.random() * 200) + 50;
            b = Math.floor(Math.random() * a) + 10;
          }
          answer = a - b;
          question = `$$${a} - ${b} = ?$$`;
          break;
          
        case 'multiplication':
          if (difficulty === 'easy') {
            a = Math.floor(Math.random() * 12) + 1;
            b = Math.floor(Math.random() * 12) + 1;
          } else {
            a = Math.floor(Math.random() * 25) + 5;
            b = Math.floor(Math.random() * 25) + 5;
          }
          answer = a * b;
          question = `$$${a} \\times ${b} = ?$$`;
          break;
          
        case 'division':
          if (difficulty === 'easy') {
            b = Math.floor(Math.random() * 12) + 1;
            a = b * (Math.floor(Math.random() * 10) + 1);
          } else {
            b = Math.floor(Math.random() * 20) + 2;
            a = b * (Math.floor(Math.random() * 15) + 2);
          }
          answer = a / b;
          question = `$$${a} \\div ${b} = ?$$`;
          break;
          
        default:
          a = Math.floor(Math.random() * 20) + 1;
          b = Math.floor(Math.random() * 20) + 1;
          answer = a + b;
          question = `$$${a} + ${b} = ?$$`;
      }

      return {
        question,
        answer,
        difficulty,
        type
      };
    }
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
      // 答错时间减少1.5秒
      setTimeLeft(prev => Math.max(1, prev - 1.5));
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



  // 时间倒计时
  useEffect(() => {
    if (!isGameActive) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setIsGameActive(false);
          // 直接在这里处理游戏结束，避免依赖submitScoreForTimer
          const finalScore = score;
          const finalAccuracy = accuracy;
          const finalTotalAnswered = totalAnswered;
          
          // 异步提交分数
          GameAPIService.submitGameRecord({
            gameType: 'math',
            score: finalScore,
            difficulty: difficulty,
            settings: {
              timeLimit,
              difficulty
            },
            gameData: {
              moves: finalTotalAnswered,
              accuracy: finalAccuracy,
              timeUsed: timeLimit
            }
          }).catch(() => {
            // 错误日志已清理
          });
          
          onGameEnd();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isGameActive, onGameEnd, score, accuracy, totalAnswered, difficulty, timeLimit]);

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
          className="text-center p-3 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 rounded-xl border border-blue-200 dark:border-blue-700"
          whileHover={{ scale: 1.05 }}
        >
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{score}</div>
          <div className="text-xs text-blue-500 dark:text-blue-300 font-medium">总分</div>
        </motion.div>
        <motion.div 
          className="text-center p-3 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 rounded-xl border border-green-200 dark:border-green-700"
          whileHover={{ scale: 1.05 }}
        >
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">{streak}</div>
          <div className="text-xs text-green-500 dark:text-green-300 font-medium">连胜</div>
        </motion.div>
        <motion.div 
          className="text-center p-3 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 rounded-xl border border-purple-200 dark:border-purple-700"
          whileHover={{ scale: 1.05 }}
        >
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{accuracy}%</div>
          <div className="text-xs text-purple-500 dark:text-purple-300 font-medium">准确率</div>
        </motion.div>
        <motion.div 
          className="text-center p-3 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-800/30 rounded-xl border border-orange-200 dark:border-orange-700"
          whileHover={{ scale: 1.05 }}
        >
          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{Math.max(0, Math.ceil(timeLeft))}</div>
          <div className="text-xs text-orange-500 dark:text-orange-300 font-medium">剩余时间</div>
        </motion.div>
      </div>

      {/* 进度条 */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300 mb-2">
          <span>时间进度</span>
          <span>{Math.round(((timeLimit - timeLeft) / timeLimit) * 100)}%</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
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
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-8 border border-gray-200 dark:border-gray-600">
          <div className="flex items-center justify-center mb-4">
            <Calculator className="w-8 h-8 text-blue-600 dark:text-blue-400 mr-3" />
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">数学计算</h3>
          </div>
          
          <div className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-6">
            {currentProblem?.question && (
              <div 
                className="inline-block text-5xl"
                dangerouslySetInnerHTML={{
                  __html: latexRenderer.render(currentProblem.question).html
                }}
              />
            )}
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
              className="w-32 px-4 py-3 text-center text-2xl font-bold border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/30 transition-all bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
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
                ? 'bg-gradient-to-r from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30 text-green-800 dark:text-green-200 border border-green-300 dark:border-green-600' 
                : 'bg-gradient-to-r from-red-100 to-red-200 dark:from-red-900/30 dark:to-red-800/30 text-red-800 dark:text-red-200 border border-red-300 dark:border-red-600'
            }`}
          >
            {feedback === 'correct' ? (
              <div className="flex items-center justify-center">
                <Trophy className="w-6 h-6 mr-2" />
                <span>正确！+{Math.floor((difficulty === 'easy' ? 10 : difficulty === 'medium' ? 15 : 35) * (1 + streak * 0.1))}分</span>
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