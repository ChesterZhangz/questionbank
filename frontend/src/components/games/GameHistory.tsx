import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  History, 
  Filter,
  X,
  RefreshCw,
  Calculator,
  Brain,
  Target,
  Zap,
  BookOpen
} from 'lucide-react';
import GameAPIService, { type GameHistoryRecord } from '../../services/gameAPI';
import PuzzleSolutionModal from './PuzzleSolutionModal';

interface GameHistoryProps {
  isOpen: boolean;
  onClose: () => void;
}

const GameHistory: React.FC<GameHistoryProps> = ({ isOpen, onClose }) => {
  const [history, setHistory] = useState<GameHistoryRecord[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });
  const [selectedGameType, setSelectedGameType] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPuzzle, setSelectedPuzzle] = useState<GameHistoryRecord | null>(null);
  const [isSolutionModalOpen, setIsSolutionModalOpen] = useState(false);

  const gameTypes = [
    { value: '', label: '全部游戏' },
    { value: 'math', label: '数学计算' },
    { value: 'memory', label: '记忆游戏' },
    { value: 'puzzle', label: '数字拼图' },
    { value: 'reaction', label: '反应速度' }
  ];

  // 获取游戏历史
  const fetchHistory = async (page: number = 1, gameType: string = '') => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await GameAPIService.getGameHistory(gameType || undefined, page, 20);
      setHistory(response.records);
      setPagination(response.pagination);
      
    } catch (error) {
      console.error('获取游戏历史失败:', error);
      setError('获取游戏历史失败，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  // 当模态框打开时获取数据
  useEffect(() => {
    if (isOpen) {
      fetchHistory(1, selectedGameType);
    }
  }, [isOpen, selectedGameType]);

  const getGameTitle = (type: string) => {
    switch (type) {
      case 'math': return '数学计算';
      case 'memory': return '记忆游戏';
      case 'puzzle': return '数字拼图';
      case 'reaction': return '反应速度';
      default: return '未知游戏';
    }
  };

  const getGameIcon = (type: string) => {
    switch (type) {
      case 'math': return <Calculator className="w-6 h-6 text-blue-600" />;
      case 'memory': return <Brain className="w-6 h-6 text-green-600" />;
      case 'puzzle': return <Target className="w-6 h-6 text-purple-600" />;
      case 'reaction': return <Zap className="w-6 h-6 text-yellow-600" />;
      default: return <Calculator className="w-6 h-6 text-gray-600" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handlePageChange = (page: number) => {
    fetchHistory(page, selectedGameType);
  };

  const handleGameTypeChange = (gameType: string) => {
    setSelectedGameType(gameType);
  };

  const handleViewSolution = (record: GameHistoryRecord) => {
    setSelectedPuzzle(record);
    setIsSolutionModalOpen(true);
  };

  const handleCloseSolution = () => {
    setIsSolutionModalOpen(false);
    setSelectedPuzzle(null);
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
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 头部 */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                    <History className="w-6 h-6" />
                  </div>
                                     <div>
                     <h2 className="text-xl font-bold text-white">游戏历史记录</h2>
                     <p className="text-sm text-white opacity-90">查看您的游戏记录和统计</p>
                   </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => fetchHistory(1, selectedGameType)}
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

            {/* 筛选器 */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-600">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Filter className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">游戏类型:</span>
                </div>
                <div className="flex space-x-2">
                  {gameTypes.map((type) => (
                    <button
                      key={type.value}
                      onClick={() => handleGameTypeChange(type.value)}
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                        selectedGameType === type.value
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 内容区域 */}
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center py-4">
                  <RefreshCw className="w-5 h-5 text-blue-600 dark:text-blue-400 animate-spin" />
                  <span className="ml-3 text-gray-600 dark:text-gray-300">加载历史记录...</span>
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <div className="text-red-500 mb-4">
                    <History className="w-12 h-12 mx-auto mb-2" />
                    <p className="text-sm">{error}</p>
                  </div>
                  <button
                    onClick={() => fetchHistory(1, selectedGameType)}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    重试
                  </button>
                </div>
              ) : history.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-500 mb-4">
                    <History className="w-12 h-12 mx-auto mb-2" />
                    <p className="text-sm">暂无游戏记录</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {history.map((record, index) => (
                    <motion.div
                      key={record.id || `${record.gameType}-${record.createdAt}-${index}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 rounded-xl border border-gray-200 dark:border-gray-600 hover:shadow-md transition-all"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-3">
                          <div className="text-2xl">{getGameIcon(record.gameType)}</div>
                          <div>
                            <div className="font-semibold text-gray-800 dark:text-gray-100">
                              {getGameTitle(record.gameType)}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              难度: {record.difficulty}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-6">
                        <div className="text-center">
                          <div className="text-lg font-bold text-blue-600 dark:text-blue-400">{record.score}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">分数</div>
                        </div>
                        
                        {record.gameData && (
                          <>
                            {record.gameData.moves && (
                              <div className="text-center">
                                <div className="text-sm font-semibold text-green-600 dark:text-green-400">{record.gameData.moves}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">步数</div>
                              </div>
                            )}
                            
                            {record.gameData.timeUsed && (
                              <div className="text-center">
                                <div className="text-sm font-semibold text-purple-600 dark:text-purple-400">{record.gameData.timeUsed}s</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">用时</div>
                              </div>
                            )}
                            
                            {record.gameData.accuracy && (
                              <div className="text-center">
                                <div className="text-sm font-semibold text-orange-600 dark:text-orange-400">{record.gameData.accuracy}%</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">准确率</div>
                              </div>
                            )}
                          </>
                        )}
                        
                        <div className="text-center">
                          <div className="text-sm font-semibold text-gray-600 dark:text-gray-300">
                            {formatDate(record.createdAt)}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">时间</div>
                        </div>
                        
                        {/* 查看解法按钮 - 仅对数字拼图显示 */}
                        {record.gameType === 'puzzle' && record.gameData?.initialBoard && (
                          <div className="text-center">
                            <button
                              onClick={() => handleViewSolution(record)}
                              className="p-2 bg-purple-100 dark:bg-purple-900/30 hover:bg-purple-200 dark:hover:bg-purple-800/50 rounded-lg transition-colors"
                              title="查看解法"
                            >
                              <BookOpen className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                            </button>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">解法</div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* 分页 */}
            {pagination.pages > 1 && (
              <div className="p-6 border-t border-gray-200 dark:border-gray-600">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    共 {pagination.total} 条记录，第 {pagination.page} / {pagination.pages} 页
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page <= 1}
                      className="px-3 py-1 rounded-lg text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      上一页
                    </button>
                    <button
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page >= pagination.pages}
                      className="px-3 py-1 rounded-lg text-sm font-medium bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      下一页
                    </button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
      
      {/* 拼图解法模态框 */}
      {selectedPuzzle && (
        <PuzzleSolutionModal
          isOpen={isSolutionModalOpen}
          onClose={handleCloseSolution}
          initialBoard={selectedPuzzle.gameData?.initialBoard || []}
          gridSize={selectedPuzzle.settings?.gridSize || 3}
          gameData={selectedPuzzle.gameData}
        />
      )}
    </AnimatePresence>
  );
};

export default GameHistory; 