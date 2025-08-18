import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, 
  Medal, 
  Crown, 
  Star, 
  X, 
  TrendingUp,
  User,
  Award,
  RefreshCw
} from 'lucide-react';
import GameAPIService, { type LeaderboardEntry } from '../../services/gameAPI';

interface LeaderboardProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserScore?: number;
  gameType: string;
}

const Leaderboard: React.FC<LeaderboardProps> = ({
  isOpen,
  onClose,
  currentUserScore,
  gameType
}) => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [currentUserRank, setCurrentUserRank] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 获取排行榜数据
  const fetchLeaderboard = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const data = await GameAPIService.getLeaderboard(gameType, 20);
      setLeaderboard(data);
      
      // 如果当前用户有分数，查找排名
      if (currentUserScore) {
        const userEntry = data.find(entry => entry.score === currentUserScore);
        setCurrentUserRank(userEntry?.rank || null);
      }
      
    } catch (error) {
      console.error('获取排行榜失败:', error);
      setError('获取排行榜失败，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  // 当模态框打开时获取数据
  useEffect(() => {
    if (isOpen) {
      fetchLeaderboard();
    }
  }, [isOpen, gameType, currentUserScore]);

  const getGameTitle = (type: string) => {
    switch (type) {
      case 'math': return '数学计算';
      case 'memory': return '记忆游戏';
      case 'puzzle': return '数字拼图';
      case 'reaction': return '反应速度';
      default: return '小游戏';
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="w-5 h-5 text-yellow-500" />;
      case 2: return <Medal className="w-5 h-5 text-gray-400" />;
      case 3: return <Medal className="w-5 h-5 text-amber-600" />;
      default: return <Star className="w-5 h-5 text-blue-500" />;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return 'bg-gradient-to-r from-yellow-100 to-yellow-200 dark:from-yellow-900/30 dark:to-yellow-800/30 border-yellow-300 dark:border-yellow-600';
      case 2: return 'bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 border-gray-300 dark:border-gray-500';
      case 3: return 'bg-gradient-to-r from-amber-100 to-amber-200 dark:from-amber-900/30 dark:to-amber-800/30 border-amber-300 dark:border-amber-600';
      default: return 'bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 border-gray-200 dark:border-gray-600';
    }
  };

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
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 头部 */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                    <Trophy className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">排行榜</h2>
                    <p className="text-sm opacity-90">{getGameTitle(gameType)}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={fetchLeaderboard}
                    disabled={isLoading}
                    className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
                  </button>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* 当前用户排名 */}
            {currentUserRank && (
              <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/30 dark:to-blue-900/30 border-b border-green-200 dark:border-green-600">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200">你的排名</span>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-600 dark:text-green-400">第 {currentUserRank} 名</div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">{currentUserScore} 分</div>
                  </div>
                </div>
              </div>
            )}

            {/* 排行榜内容 */}
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center py-4">
                  <RefreshCw className="w-5 h-5 text-blue-600 dark:text-blue-400 animate-spin" />
                  <span className="ml-3 text-gray-600 dark:text-gray-300">加载排行榜...</span>
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <div className="text-red-500 mb-4">
                    <Trophy className="w-12 h-12 mx-auto mb-2" />
                    <p className="text-sm">{error}</p>
                  </div>
                  <button
                    onClick={fetchLeaderboard}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    重试
                  </button>
                </div>
              ) : leaderboard.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-500 mb-4">
                    <Trophy className="w-12 h-12 mx-auto mb-2" />
                    <p className="text-sm">暂无排行榜数据</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {leaderboard.map((entry, index) => (
                    <motion.div
                      key={entry.userId || `${entry.username}-${entry.score}-${index}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                        entry.score === currentUserScore
                          ? 'bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 border-blue-300 dark:border-blue-600 shadow-md' 
                          : getRankColor(entry.rank)
                      }`}
                    >
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          {getRankIcon(entry.rank)}
                          <span className={`font-bold ${
                            entry.rank === 1 ? 'text-yellow-600 dark:text-yellow-400' :
                            entry.rank === 2 ? 'text-gray-600 dark:text-gray-300' :
                            entry.rank === 3 ? 'text-amber-600 dark:text-amber-400' :
                            'text-gray-700 dark:text-gray-200'
                          }`}>
                            #{entry.rank}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <User className="w-4 h-4 text-gray-500" />
                          <span className={`font-medium ${
                            entry.score === currentUserScore ? 'text-blue-700 dark:text-blue-300' : 'text-gray-800 dark:text-gray-100'
                          }`}>
                            {entry.username}
                          </span>
                          {entry.score === currentUserScore && (
                            <Award className="w-4 h-4 text-blue-600" />
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-gray-800 dark:text-gray-100">{entry.score}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">分</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* 底部 */}
            <div className="p-6 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
              <div className="text-center text-sm text-gray-600 dark:text-gray-300">
                <p>排行榜实时更新</p>
                <p className="mt-1">挑战自己，创造新纪录！</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Leaderboard; 