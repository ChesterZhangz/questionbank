import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, 
  RefreshCw, 
  Settings, 
  Trophy, 
  Gamepad2, 
  Info,
  Calculator,
  Brain,
  Target,
  Zap,
  Play,
  BarChart3,
  History,
  AlertTriangle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button';
import MathGame from '../../components/games/MathGame';
import MemoryGame from '../../components/games/MemoryGame';
import PuzzleGame from '../../components/games/PuzzleGame';
import ReactionGame from '../../components/games/ReactionGame';
import GameSettings from '../../components/games/GameSettings';
import Leaderboard from '../../components/games/Leaderboard';
import GameHistory from '../../components/games/GameHistory';
import GameAPIService, { type GameStatus } from '../../services/gameAPI';
import ConfirmModal from '../../components/ui/ConfirmModal';
import RightSlideModal from '../../components/ui/RightSlideModal';
import { useModal } from '../../hooks/useModal';

interface ErrorPageProps {
  errorCode: string;
  title: string;
  message: string;
  description?: string;
  showGames?: boolean;
  showNavigation?: boolean;
}

interface GameScore {
  math: number;
  memory: number;
  puzzle: number;
  reaction: number;
}

const ErrorPage: React.FC<ErrorPageProps> = ({
  errorCode,
  title,
  message,
  description,
  showGames = true,
  showNavigation = true
}) => {
  const navigate = useNavigate();

  // 弹窗状态管理
  const { 
    showConfirm, 
    confirmModal, 
    closeConfirm,
    showErrorRightSlide,
    rightSlideModal,
    closeRightSlide
  } = useModal();
  const [currentGame, setCurrentGame] = useState<'math' | 'memory' | 'puzzle' | 'reaction'>('math');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [scores, setScores] = useState<GameScore>({ math: 0, memory: 0, puzzle: 0, reaction: 0 });
  const [totalScore, setTotalScore] = useState(0);
  const [showGameInfo, setShowGameInfo] = useState(false);
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [gameStatus, setGameStatus] = useState<GameStatus | null>(null);
  const [gameStates, setGameStates] = useState({
    math: { isActive: false, isEnded: false },
    memory: { isActive: false, isEnded: false },
    puzzle: { isActive: false, isEnded: false },
    reaction: { isActive: false, isEnded: false }
  });

  // 游戏设置
  const [settings, setSettings] = useState({
    mathDifficulty: 'medium' as 'easy' | 'medium' | 'hard',
    memoryGridSize: 4 as 4 | 5 | 6,
    puzzleGridSize: 3 as 3 | 4,
    reactionDifficulty: 'medium' as 'easy' | 'medium' | 'hard',
    timeLimit: 60,
    soundEnabled: true
  });

  // 更新分数
  const updateScore = useCallback((game: keyof GameScore, score: number) => {
    setScores(prev => {
      const newScores = { ...prev, [game]: score };
      const newTotal = Object.values(newScores).reduce((sum, s) => sum + s, 0);
      setTotalScore(newTotal);
      return newScores;
    });
  }, []);

  // 获取当前游戏状态
  const getCurrentGameState = () => gameStates[currentGame];
  const isGameActive = getCurrentGameState().isActive;
  


  // 处理游戏结束
  const handleGameEnd = useCallback(() => {
    setGameStates(prev => ({
      ...prev,
      [currentGame]: { isActive: false, isEnded: true }
    }));
  }, [currentGame]);



  // 检查游戏状态
  const checkGameStatus = async () => {
    try {
      // 检查是否有有效的token
      const authStorage = localStorage.getItem('auth-storage');
      let token = '';
      if (authStorage) {
        try {
          const authData = JSON.parse(authStorage);
          if (authData.state && authData.state.token) {
            token = authData.state.token;
          }
        } catch (error) {
          console.error('Failed to parse auth storage:', error);
        }
      }
      
      if (!token) {

        setGameStatus({
          canPlay: false,
          dailyGameCount: 0,
          reason: '用户未登录'
        });
        return;
      }

      const status = await GameAPIService.getGameStatus();
      setGameStatus(status);
    } catch (error) {
      console.error('检查游戏状态失败:', error);
      // 如果检查失败，设置默认状态
      setGameStatus({
        canPlay: false,
        dailyGameCount: 0,
        reason: '无法获取游戏状态'
      });
    }
  };

  // 开始游戏
  const handleStartGame = async () => {
    // 检查是否有有效的token
    const authStorage = localStorage.getItem('auth-storage');
    let token = '';
    if (authStorage) {
      try {
        const authData = JSON.parse(authStorage);
        if (authData.state && authData.state.token) {
          token = authData.state.token;
        }
      } catch (error) {
        console.error('Failed to parse auth storage:', error);
      }
    }
    
    if (!token) {
      showErrorRightSlide('登录提示', '请先登录后再使用游戏功能');
      return;
    }

    // 检查游戏状态
    await checkGameStatus();
    
    if (gameStatus && !gameStatus.canPlay) {
      // 游戏被禁用，显示提示
      showErrorRightSlide('游戏禁用', gameStatus.message || gameStatus.reason || '游戏功能已被禁用');
      return;
    }
    
    // 检查每日游戏次数警告
    if (gameStatus && gameStatus.dailyGameCount > 5) {
      const warning = gameStatus.warningMessage || `今日已游戏${gameStatus.dailyGameCount}次，请注意！`;
      showConfirm(
        '游戏提醒',
        warning + '\n\n是否继续游戏？',
        () => {
          startNewGame();
        }
      );
      return;
    }
    
    startNewGame();
  };

  // 开始新游戏（重置所有状态）
  const startNewGame = useCallback(() => {
    setIsGameStarted(true);
    setGameStates(prev => ({
      ...prev,
      [currentGame]: { isActive: true, isEnded: false }
    }));
  }, [currentGame]);

  // 组件加载时检查游戏状态
  useEffect(() => {
    checkGameStatus();
  }, []);

  // 游戏配置
  const gameConfigs = {
    math: {
      difficulty: settings.mathDifficulty,
      timeLimit: settings.timeLimit
    },
    memory: {
      gridSize: settings.memoryGridSize,
      timeLimit: settings.timeLimit
    },
    puzzle: {
      gridSize: settings.puzzleGridSize,
      timeLimit: settings.timeLimit
    },
    reaction: {
      difficulty: settings.reactionDifficulty,
      timeLimit: settings.timeLimit
    }
  };

  // 游戏信息
  const gameInfo = {
    math: {
      title: '数学计算',
      description: '快速计算数学题目，提高计算能力',
      icon: <Calculator className="w-6 h-6" />,
      color: 'blue'
    },
    memory: {
      title: '记忆游戏',
      description: '找到相同的数字配对，锻炼记忆力',
      icon: <Brain className="w-6 h-6" />,
      color: 'green'
    },
    puzzle: {
      title: '数字拼图',
      description: '将数字按顺序排列，训练逻辑思维',
      icon: <Target className="w-6 h-6" />,
      color: 'purple'
    },
    reaction: {
      title: '反应速度',
      description: '点击出现的圆圈，测试反应速度',
      icon: <Zap className="w-6 h-6" />,
      color: 'orange'
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20 flex items-center justify-center p-4">
      <div className="max-w-6xl w-full">
        {/* 主要内容区域 */}
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          
          {/* 错误信息区域 */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            {/* 错误代码 */}
            <div className="text-center lg:text-left">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="inline-block"
              >
                <div className="text-8xl lg:text-9xl font-bold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
                  {errorCode}
                </div>
              </motion.div>
            </div>

            {/* 错误标题和消息 */}
            <div className="text-center lg:text-left space-y-4">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-3xl lg:text-4xl font-bold text-text-primary"
              >
                {title}
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-lg text-text-secondary leading-relaxed"
              >
                {message}
              </motion.p>

              {description && (
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="text-sm text-text-tertiary"
                >
                  {description}
                </motion.p>
              )}
            </div>

          {/* 操作按钮 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
            <Button
                onClick={() => navigate('/')}
              variant="primary"
                className="flex items-center justify-center px-6 py-3"
            >
                <Home className="w-5 h-5 mr-2" />
                返回首页
            </Button>
              
            <Button
                onClick={() => window.location.reload()}
              variant="outline"
                className="flex items-center justify-center px-6 py-3"
            >
                <RefreshCw className="w-5 h-5 mr-2" />
                刷新页面
            </Button>
            </motion.div>
        </motion.div>

          {/* 游戏区域 */}
          {showGames && (
        <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-bg-elevated rounded-2xl shadow-xl border border-border-primary overflow-hidden"
            >
              {/* 游戏头部 */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <Gamepad2 className="w-8 h-8" />
                    <h2 className="text-2xl font-bold">小游戏</h2>
            </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setShowGameInfo(!showGameInfo)}
                      className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
                    >
                      <Info className="w-5 h-5" />
                </button>
                <button
                      onClick={() => setIsLeaderboardOpen(true)}
                      className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
                >
                      <BarChart3 className="w-5 h-5" />
                </button>
                <button
                      onClick={() => setIsHistoryOpen(true)}
                      className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
                >
                      <History className="w-5 h-5" />
                </button>
                <button
                      onClick={() => setIsSettingsOpen(true)}
                      className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
                >
                      <Settings className="w-5 h-5" />
                </button>
              </div>
                </div>

                {/* 游戏状态显示 */}
                {gameStatus && (
                  <div className="mb-3">
                    {gameStatus.warningMessage && (
                      <div className="bg-yellow-500 bg-opacity-20 border border-yellow-300 rounded-lg p-2 mb-2">
                        <div className="flex items-center space-x-2">
                          <AlertTriangle className="w-4 h-4 text-yellow-300" />
                          <span className="text-sm text-yellow-100">{gameStatus.warningMessage}</span>
                        </div>
                      </div>
                    )}
                    <div className="text-center text-sm opacity-90">
                      今日游戏次数: {gameStatus.dailyGameCount}
                    </div>
              </div>
            )}

                {/* 总分显示 */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{totalScore}</div>
                      <div className="text-sm opacity-90">总分</div>
                    </div>
                    <div className="h-8 w-px bg-white bg-opacity-30"></div>
                    <div className="flex items-center space-x-2">
                      <Trophy className="w-5 h-5 text-yellow-300" />
                      <span className="text-sm">挑战自己</span>
                    </div>
                  </div>
                </div>
            </div>

              {/* 游戏信息提示 */}
            <AnimatePresence>
                {showGameInfo && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                    className="bg-blue-50 dark:bg-blue-900/30 border-b border-blue-200 dark:border-blue-600 p-4"
                  >
                    <div className="text-sm text-blue-800 dark:text-blue-200">
                      <strong>游戏说明：</strong>
                      {gameInfo[currentGame].description}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

              {/* 游戏选择器 */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-600">
                <div className="flex items-center justify-between">
                  <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                    {(['math', 'memory', 'puzzle', 'reaction'] as const).map((game) => (
                      <button
                        key={game}
                        onClick={() => setCurrentGame(game)}
                        disabled={isGameActive}
                        className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
                          currentGame === game
                            ? 'bg-white dark:bg-gray-600 text-gray-800 dark:text-gray-100 shadow-sm'
                            : isGameActive
                            ? 'text-gray-400 cursor-not-allowed'
                            : 'text-gray-600 hover:text-gray-800'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          {gameInfo[game].icon}
                          <span className="hidden sm:inline">{gameInfo[game].title}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                  

                </div>
                    </div>

              {/* 游戏内容 */}
              <div className="p-6 min-h-[350px] flex items-center justify-center">
                {!isGameStarted ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center"
                  >
                    <div className="mb-6">
                      <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Play className="w-10 h-10 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">准备开始游戏</h3>
                      <p className="text-gray-600 dark:text-gray-300 mb-6">选择游戏类型，点击开始按钮开始挑战</p>
                      
                      {/* 游戏状态信息 */}
                      {gameStatus && (
                        <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 rounded-lg border border-blue-200 dark:border-blue-600">
                          <div className="text-sm text-gray-700 dark:text-gray-200">
                            <div className="flex items-center justify-center space-x-4">
                              <span>今日游戏次数: {gameStatus.dailyGameCount}/15</span>
                              {gameStatus.dailyGameCount > 5 && (
                                <span className="text-orange-600 dark:text-orange-400 font-medium">注意工作</span>
                              )}
                              {gameStatus.dailyGameCount >= 15 && (
                                <span className="text-red-600 dark:text-red-400 font-medium">已达上限</span>
                              )}
                            </div>
                            {gameStatus.warningMessage && (
                              <div className="mt-2 text-orange-600 dark:text-orange-400 text-xs text-center">
                                {gameStatus.warningMessage}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                        <Button
                      onClick={handleStartGame}
                          variant={gameStatus && !gameStatus.canPlay ? "secondary" : "primary"}
                      className={`px-8 py-3 text-lg font-semibold ${
                        gameStatus && !gameStatus.canPlay ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                      disabled={gameStatus ? !gameStatus.canPlay : false}
                        >
                      {gameStatus && !gameStatus.canPlay ? (
                        <>
                          <AlertTriangle className="w-5 h-5 mr-2" />
                          游戏已禁用
                        </>
                      ) : (
                        <>
                          <Play className="w-5 h-5 mr-2" />
                          开始游戏
                        </>
                      )}
                        </Button>
                  </motion.div>
                ) : (
                  <AnimatePresence mode="wait">
                        <motion.div
                      key={currentGame}
                      initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.3 }}
                      className="w-full"
                    >
                      {currentGame === 'math' && (
                        <MathGame
                          onScoreUpdate={(score) => updateScore('math', score)}
                          onGameEnd={handleGameEnd}
                          isActive={isGameActive || getCurrentGameState().isEnded}
                          difficulty={gameConfigs.math.difficulty}
                          timeLimit={gameConfigs.math.timeLimit}
                        />
                      )}
                      {currentGame === 'memory' && (
                        <MemoryGame
                          onScoreUpdate={(score) => updateScore('memory', score)}
                          onGameEnd={handleGameEnd}
                          isActive={isGameActive || getCurrentGameState().isEnded}
                          gridSize={gameConfigs.memory.gridSize}
                          timeLimit={gameConfigs.memory.timeLimit}
                        />
                      )}
                      {currentGame === 'puzzle' && (
                        <PuzzleGame
                          onScoreUpdate={(score) => updateScore('puzzle', score)}
                          onGameEnd={handleGameEnd}
                          isActive={isGameActive || getCurrentGameState().isEnded}
                          gridSize={gameConfigs.puzzle.gridSize}
                          timeLimit={gameConfigs.puzzle.timeLimit}
                        />
                      )}
                      {currentGame === 'reaction' && (
                        <ReactionGame
                          onScoreUpdate={(score) => updateScore('reaction', score)}
                          onGameEnd={handleGameEnd}
                          isActive={isGameActive || getCurrentGameState().isEnded}
                          timeLimit={gameConfigs.reaction.timeLimit}
                          difficulty={gameConfigs.reaction.difficulty}
                        />
                      )}
                    </motion.div>
                    </AnimatePresence>
                )}
              </div>

              {/* 分数统计 */}
              <div className="bg-gray-50 dark:bg-gray-700 p-4 border-t border-gray-200 dark:border-gray-600">
                <div className="grid grid-cols-4 gap-3">
                  {(['math', 'memory', 'puzzle', 'reaction'] as const).map((game) => (
                    <div
                      key={game}
                      className={`text-center p-2 rounded-lg transition-all ${
                        currentGame === game
                          ? `bg-${gameInfo[game].color}-100 border-${gameInfo[game].color}-200 border dark:bg-gray-800/50 dark:border-gray-600`
                          : isGameActive
                          ? 'bg-white dark:bg-gray-700 cursor-not-allowed opacity-50'
                          : 'bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer'
                      }`}
                      onClick={isGameActive ? undefined : () => setCurrentGame(game)}
                    >
                      <div className="text-sm mb-1">{gameInfo[game].icon}</div>
                      <div className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">
                        {gameInfo[game].title}
                      </div>
                      <div className={`text-sm font-bold text-${gameInfo[game].color}-600`}>
                        {scores[game]}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
                )}
              </div>

        {/* 导航提示 */}
        {showNavigation && (
              <motion.div
            initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-8 text-center"
          >
            <p className="text-sm text-gray-500">
              玩把再走？放松放松（Chester 亲传的摸鱼技能！）
            </p>
              </motion.div>
            )}
      </div>

      {/* 游戏设置模态框 */}
      <GameSettings
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSettingsChange={setSettings}
      />

      {/* 排行榜模态框 */}
      <Leaderboard
        isOpen={isLeaderboardOpen}
        onClose={() => setIsLeaderboardOpen(false)}
        currentUserScore={scores[currentGame]}
        gameType={currentGame}
      />

      {/* 游戏历史记录模态框 */}
      <GameHistory
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
      />

      {/* 确认弹窗 */}
      <ConfirmModal
        {...confirmModal}
        onCancel={closeConfirm}
      />

      {/* 右侧弹窗 */}
      <RightSlideModal
        {...rightSlideModal}
        onClose={closeRightSlide}
      />
    </div>
  );
};

export default ErrorPage; 