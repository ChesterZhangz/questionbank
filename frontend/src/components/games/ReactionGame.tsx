import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Zap, Target, Clock } from 'lucide-react';
import GameAPIService from '../../services/gameAPI';

interface ReactionGameProps {
  onScoreUpdate: (score: number) => void;
  onGameEnd: () => void;
  isActive: boolean;
  timeLimit: number;
  difficulty?: 'easy' | 'medium' | 'hard';
}

const ReactionGame: React.FC<ReactionGameProps> = ({ 
  onScoreUpdate, 
  onGameEnd, 
  isActive,
  timeLimit,
  difficulty = 'medium'
}) => {
  const [isWaiting, setIsWaiting] = useState(false);
  const [isTargetVisible, setIsTargetVisible] = useState(false);
  const [startTime, setStartTime] = useState<number>(0);
  const [reactionTime, setReactionTime] = useState<number>(0);
  const [score, setScore] = useState(0);
  const [rounds, setRounds] = useState(0);
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [isGameActive, setIsGameActive] = useState(false);
  const [bestTime, setBestTime] = useState<number | null>(null);
  const [averageTime, setAverageTime] = useState<number>(0);
  const [totalReactionTime, setTotalReactionTime] = useState<number>(0);
  const [targetColor, setTargetColor] = useState<string>('red');
  const [targetShape, setTargetShape] = useState<'circle' | 'square' | 'triangle'>('circle');
  const [targetPosition, setTargetPosition] = useState({ x: 0, y: 0 }); // 新增：目标位置状态
  const [distractionElements, setDistractionElements] = useState<Array<{id: number, x: number, y: number, color: string}>>([]);

  // 根据难度调整游戏参数
  const getDifficultyConfig = () => {
    switch (difficulty) {
      case 'easy':
        return {
          maxRounds: 8,
          targetSize: 80,
          waitTimeRange: { min: 1500, max: 3000 },
          distractionCount: 0,
          colorChange: false,
          shapeChange: false
        };
      case 'medium':
        return {
          maxRounds: 12,
          targetSize: 60,
          waitTimeRange: { min: 1000, max: 2500 },
          distractionCount: 2,
          colorChange: true,
          shapeChange: false
        };
      case 'hard':
        return {
          maxRounds: 15,
          targetSize: 40,
          waitTimeRange: { min: 800, max: 2000 },
          distractionCount: 4,
          colorChange: true,
          shapeChange: true
        };
      default:
        return {
          maxRounds: 10,
          targetSize: 60,
          waitTimeRange: { min: 1000, max: 2500 },
          distractionCount: 2,
          colorChange: true,
          shapeChange: false
        };
    }
  };

  const config = getDifficultyConfig();

  // 生成随机位置
  const generateRandomPosition = () => {
    const padding = config.targetSize / 2 + 20; // 确保目标不会太靠近边缘
    const maxX = 256 - config.targetSize - padding;
    const maxY = 256 - config.targetSize - padding;
    
    return {
      x: Math.random() * maxX + padding,
      y: Math.random() * maxY + padding
    };
  };

  // 提交分数到后端
  const submitScore = useCallback(async (finalScore?: number) => {
    try {
      const scoreToSubmit = finalScore !== undefined ? finalScore : score;
      await GameAPIService.submitGameRecord({
        gameType: 'reaction',
        score: scoreToSubmit,
        difficulty: 'medium',
        settings: {
          timeLimit
        },
        gameData: {
          rounds,
          bestTime: bestTime || 0,
          averageTime
        }
      });
    } catch (error) {
      console.error('提交分数失败:', error);
    }
  }, [score, timeLimit, rounds, bestTime, averageTime, totalReactionTime]);

  // 创建一个不依赖score的提交函数，用于计时器
  const submitScoreForTimer = useCallback(async (currentScore: number) => {
    try {
      await GameAPIService.submitGameRecord({
        gameType: 'reaction',
        score: currentScore,
        difficulty: 'medium',
        settings: {
          timeLimit
        },
        gameData: {
          rounds,
          bestTime: bestTime || 0,
          averageTime
        }
      });
    } catch (error) {
      console.error('提交分数失败:', error);
    }
  }, [timeLimit, rounds, bestTime, averageTime, totalReactionTime]);

  // 开始游戏
  const startGame = useCallback(() => {
    setIsGameActive(true);
    setScore(0);
    setRounds(0);
    setTimeLeft(timeLimit);
    setBestTime(null);
    setAverageTime(0);
    setTotalReactionTime(0);
    startNewRound();
  }, [timeLimit]);

  // 响应游戏状态变化
  useEffect(() => {
    if (isActive && !isGameActive) {
      startGame();
    } else if (!isActive && isGameActive) {
      setIsGameActive(false);
    }
  }, [isActive, isGameActive, startGame]);

  // 开始新回合
  const startNewRound = useCallback(() => {
    setIsWaiting(true);
    setIsTargetVisible(false);
    
    // 根据难度调整等待时间
    const waitTime = Math.random() * (config.waitTimeRange.max - config.waitTimeRange.min) + config.waitTimeRange.min;
    
    // 生成干扰元素
    if (config.distractionCount > 0) {
      const distractions = [];
      for (let i = 0; i < config.distractionCount; i++) {
        distractions.push({
          id: i,
          x: Math.random() * 200 + 50,
          y: Math.random() * 200 + 50,
          color: ['blue', 'green', 'purple', 'orange'][Math.floor(Math.random() * 4)]
        });
      }
      setDistractionElements(distractions);
    }
    
    // 随机改变目标颜色和形状
    if (config.colorChange) {
      const colors = ['red', 'blue', 'green', 'purple', 'orange'];
      setTargetColor(colors[Math.floor(Math.random() * colors.length)]);
    }
    
    if (config.shapeChange) {
      const shapes: Array<'circle' | 'square' | 'triangle'> = ['circle', 'square', 'triangle'];
      setTargetShape(shapes[Math.floor(Math.random() * shapes.length)]);
    }
    
    // 生成随机位置
    const randomPosition = generateRandomPosition();
    setTargetPosition(randomPosition);
    
    setTimeout(() => {
      setIsWaiting(false);
      setIsTargetVisible(true);
      setStartTime(Date.now());
    }, waitTime);
  }, [config]);

  // 处理目标点击
  const handleTargetClick = useCallback(() => {
    if (!isTargetVisible || !isGameActive) return;

    const endTime = Date.now();
    const reaction = endTime - startTime;
    
    setReactionTime(reaction);
    setTotalReactionTime(prev => prev + reaction);
    
    // 根据难度调整基础分数
    const baseScore = difficulty === 'easy' ? 800 : difficulty === 'medium' ? 1000 : 1200;
    const points = Math.max(0, Math.floor(baseScore - reaction));
    const newScore = score + points;
    setScore(newScore);
    
    // 更新最佳时间
    if (!bestTime || reaction < bestTime) {
      setBestTime(reaction);
    }
    
    const newRounds = rounds + 1;
    setRounds(newRounds);
    
    onScoreUpdate(newScore);
    
    // 隐藏目标
    setIsTargetVisible(false);
    
    // 检查游戏是否结束
    if (newRounds >= config.maxRounds) {
      setIsGameActive(false);
      const avg = totalReactionTime / newRounds;
      setAverageTime(avg);
      submitScore(newScore);
      onGameEnd();
    } else {
      // 开始下一回合
      setTimeout(() => {
        if (isGameActive) {
          startNewRound();
        }
      }, 1000);
    }
  }, [isTargetVisible, isGameActive, startTime, score, rounds, bestTime, totalReactionTime, onScoreUpdate, onGameEnd]);

  // 时间倒计时
  useEffect(() => {
    if (!isGameActive) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setIsGameActive(false);
          submitScoreForTimer(score);
          onGameEnd();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isGameActive, onGameEnd, submitScoreForTimer]);

  const progress = (rounds / config.maxRounds) * 100;

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
          <div className="text-xl font-bold text-blue-600">{score}</div>
          <div className="text-xs text-blue-500 font-medium">得分</div>
        </motion.div>
        <motion.div 
          className="text-center p-3 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200"
          whileHover={{ scale: 1.05 }}
        >
          <div className="text-xl font-bold text-green-600">{rounds}/{config.maxRounds}</div>
          <div className="text-xs text-green-500 font-medium">回合</div>
        </motion.div>
        <motion.div 
          className="text-center p-3 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200"
          whileHover={{ scale: 1.05 }}
        >
          <div className="text-xl font-bold text-purple-600">{timeLeft}</div>
          <div className="text-xs text-purple-500 font-medium">时间</div>
        </motion.div>
        <motion.div 
          className="text-center p-3 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl border border-orange-200"
          whileHover={{ scale: 1.05 }}
        >
          <div className="text-xl font-bold text-orange-600">{Math.round(progress)}%</div>
          <div className="text-xs text-orange-500 font-medium">进度</div>
        </motion.div>
      </div>

      {/* 进度条 */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>游戏进度</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <motion.div
            className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full"
            initial={{ width: '0%' }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* 游戏标题 */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center mb-2">
          <Zap className="w-8 h-8 text-orange-600 mr-3" />
          <h3 className="text-2xl font-bold text-gray-800">反应速度</h3>
          <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
            difficulty === 'easy' ? 'bg-green-100 text-green-700' :
            difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
            'bg-red-100 text-red-700'
          }`}>
            {difficulty === 'easy' ? '简单' : difficulty === 'medium' ? '中等' : '困难'}
          </span>
        </div>
        <p className="text-gray-600">
          {difficulty === 'easy' ? '点击出现的圆圈，测试你的反应速度' :
           difficulty === 'medium' ? '点击出现的目标，注意颜色变化' :
           '点击出现的目标，注意形状和颜色变化，避开干扰元素'}
        </p>
      </div>

      {/* 游戏区域 */}
      <div className="flex justify-center mb-6">
        <div className="relative w-64 h-64 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border border-gray-200 overflow-hidden">
          {/* 干扰元素 */}
          {distractionElements.map((element) => (
            <motion.div
              key={element.id}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 0.3, scale: 1 }}
              className={`absolute w-8 h-8 rounded-full bg-${element.color}-400`}
              style={{
                left: element.x,
                top: element.y,
                pointerEvents: 'none'
              }}
            />
          ))}
          
          {isWaiting && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="text-center">
                <Clock className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">等待目标出现...</p>
              </div>
            </motion.div>
          )}
          
          {isTargetVisible && (
            <motion.button
              onClick={handleTargetClick}
              className={`absolute shadow-lg hover:shadow-xl transition-all cursor-pointer ${
                targetShape === 'circle' ? 'rounded-full' :
                targetShape === 'square' ? 'rounded-lg' :
                'transform rotate-45'
              }`}
              style={{
                width: config.targetSize,
                height: config.targetSize,
                backgroundColor: targetColor,
                left: targetPosition.x,
                top: targetPosition.y
              }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {targetShape === 'triangle' ? (
                <div className="w-full h-full flex items-center justify-center">
                  <div 
                    className="w-0 h-0 border-l-4 border-r-4 border-b-8 border-transparent"
                    style={{ borderBottomColor: 'white' }}
                  />
                </div>
              ) : (
                <Target className="w-6 h-6 text-white mx-auto" />
              )}
            </motion.button>
          )}
        </div>
      </div>

      {/* 反应时间显示 */}
      {reactionTime > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6 p-4 bg-gradient-to-r from-green-100 to-green-200 rounded-xl border border-green-300"
        >
          <div className="text-lg font-semibold text-green-800">
            反应时间: {reactionTime}ms
          </div>
          <div className="text-sm text-green-600">
            得分: +{Math.max(0, Math.floor(1000 - reactionTime))}
          </div>
        </motion.div>
      )}


    </motion.div>
  );
};

export default ReactionGame; 