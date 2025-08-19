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
  Eye,
  ArrowRight
} from 'lucide-react';
import GameAPIService, { type GameHistoryRecord } from '../../services/gameAPI';

interface GameHistoryProps {
  isOpen: boolean;
  onClose: () => void;
}

// 拼图求解器接口
interface PuzzlePosition {
  id: number;
  position: number;
}

interface PuzzleStep {
  from: number;
  to: number;
  piece: number;
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
  const [showSolutionModal, setShowSolutionModal] = useState(false);
  const [selectedPuzzleRecord, setSelectedPuzzleRecord] = useState<GameHistoryRecord | null>(null);

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



  // 显示拼图解决方案
  const showPuzzleSolution = (record: GameHistoryRecord) => {
    setSelectedPuzzleRecord(record);
    setShowSolutionModal(true);
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
                        
                        {/* 拼图游戏显示解决方案按钮 */}
                        {record.gameType === 'puzzle' && record.gameData?.initialPositions && (
                          <button
                            onClick={() => showPuzzleSolution(record)}
                            className="flex items-center space-x-1 px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-800/40 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                            <span className="text-sm font-medium">查看解答</span>
                          </button>
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
      
      {/* 拼图解决方案模态框 */}
      {showSolutionModal && selectedPuzzleRecord && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-60"
          onClick={() => setShowSolutionModal(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 头部 */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                    <Target className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">拼图解决方案</h2>
                    <p className="text-sm text-white opacity-90">最佳路径步骤展示</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowSolutionModal(false)}
                  className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* 内容区域 */}
            <div className="p-6 max-h-[70vh] overflow-y-auto">
              <PuzzleSolutionViewer 
                record={selectedPuzzleRecord}
                onClose={() => setShowSolutionModal(false)}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// 拼图解决方案查看器组件
interface PuzzleSolutionViewerProps {
  record: GameHistoryRecord;
  onClose: () => void;
}

const PuzzleSolutionViewer: React.FC<PuzzleSolutionViewerProps> = ({ record }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  
  // 获取网格大小
  const gridSize = record.settings?.gridSize || 3;
  const totalPieces = gridSize * gridSize;
  const emptyValue = totalPieces - 1;
  
  // 获取初始位置
  const initialPositions: PuzzlePosition[] = record.gameData?.initialPositions || [];
  
  // 辅助函数：比较两个数组是否相等
  const arraysEqual = (a: number[], b: number[]): boolean => {
    return a.length === b.length && a.every((val, i) => val === b[i]);
  };

  // 生成解决步骤
  const solutionSteps = React.useMemo(() => {
    if (!initialPositions || initialPositions.length === 0) return [];
    
    // 创建初始状态
    const initialState = Array(totalPieces).fill(emptyValue);
    initialPositions.forEach(pos => {
      initialState[pos.position] = pos.id;
    });
    
    // 目标状态
    const targetState = Array.from({ length: totalPieces }, (_, i) => i === totalPieces - 1 ? emptyValue : i);
    
    // 检查是否已经完成
    if (JSON.stringify(initialState) === JSON.stringify(targetState)) {
      return [];
    }
    
    // 简化的解决步骤生成
    const steps: PuzzleStep[] = [];
    const currentState = [...initialState];
    
    // 找到空位置
    const getEmptyPosition = (state: number[]) => state.indexOf(emptyValue);
    
    // 获取可移动的位置
    const getMovablePositions = (emptyPos: number): number[] => {
      const row = Math.floor(emptyPos / gridSize);
      const col = emptyPos % gridSize;
      const positions: number[] = [];
      
      // 上下左右
      if (row > 0) positions.push((row - 1) * gridSize + col); // 上
      if (row < gridSize - 1) positions.push((row + 1) * gridSize + col); // 下
      if (col > 0) positions.push(row * gridSize + (col - 1)); // 左
      if (col < gridSize - 1) positions.push(row * gridSize + (col + 1)); // 右
      
      return positions;
    };
    
    // 计算曼哈顿距离
    const manhattanDistance = (pos1: number, pos2: number) => {
      const row1 = Math.floor(pos1 / gridSize);
      const col1 = pos1 % gridSize;
      const row2 = Math.floor(pos2 / gridSize);
      const col2 = pos2 % gridSize;
      return Math.abs(row1 - row2) + Math.abs(col1 - col2);
    };
    
    // 生成解决步骤（简化版本）
    let attempts = 0;
    const maxAttempts = 30;
    
    while (!arraysEqual(currentState, targetState) && attempts < maxAttempts) {
      const emptyPos = getEmptyPosition(currentState);
      const movablePositions = getMovablePositions(emptyPos);
      
      // 找到最需要移动的块
      let bestMove = -1;
      let bestScore = -Infinity;
      
      for (const pos of movablePositions) {
        const piece = currentState[pos];
        if (piece === emptyValue) continue;
        
        // 计算这个块到目标位置的距离
        const targetPos = piece === emptyValue ? totalPieces - 1 : piece;
        const currentDistance = manhattanDistance(pos, targetPos);
        const newDistance = manhattanDistance(emptyPos, targetPos);
        
        // 如果移动后更接近目标位置，或者这个位置应该放正确的块
        const score = currentDistance - newDistance;
        if (score > bestScore) {
          bestScore = score;
          bestMove = pos;
        }
      }
      
      if (bestMove !== -1) {
        const piece = currentState[bestMove];
        steps.push({
          from: bestMove,
          to: emptyPos,
          piece: piece
        });
        
        // 执行移动
        currentState[emptyPos] = piece;
        currentState[bestMove] = emptyValue;
      } else {
        // 如果没有找到好的移动，随机选择一个
        const randomPos = movablePositions[Math.floor(Math.random() * movablePositions.length)];
        const piece = currentState[randomPos];
        if (piece !== emptyValue) {
          steps.push({
            from: randomPos,
            to: emptyPos,
            piece: piece
          });
          currentState[emptyPos] = piece;
          currentState[randomPos] = emptyValue;
        }
      }
      
      attempts++;
    }
    
    return steps.slice(0, 15); // 限制步骤数
  }, [initialPositions, totalPieces, gridSize, emptyValue]);
  
  // 渲染当前步骤的拼图状态
  const renderCurrentStepGrid = () => {
    if (currentStep === 0) {
      return renderPuzzleGrid(initialPositions);
    }
    
    // 计算当前步骤的状态
    const currentState = Array(totalPieces).fill(emptyValue);
    initialPositions.forEach(pos => {
      currentState[pos.position] = pos.id;
    });
    
    // 应用之前的步骤
    for (let i = 0; i < currentStep; i++) {
      const step = solutionSteps[i];
      const temp = currentState[step.from];
      currentState[step.from] = currentState[step.to];
      currentState[step.to] = temp;
    }
    
    // 转换为位置数组格式
    const currentPositions: PuzzlePosition[] = currentState.map((piece, index) => ({
      id: piece,
      position: index
    }));
    
    return renderPuzzleGrid(currentPositions);
  };
  
  // 渲染拼图块
  const renderPuzzleGrid = (positions: PuzzlePosition[]) => {
    const grid = Array(totalPieces).fill(emptyValue);
    positions.forEach(pos => {
      grid[pos.position] = pos.id;
    });
    
    return (
      <div 
        className="grid gap-1 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 p-3 rounded-xl border border-gray-300 dark:border-gray-600"
        style={{ 
          gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
          gridTemplateRows: `repeat(${gridSize}, 1fr)`,
        }}
      >
        {grid.map((piece, index) => (
          <div
            key={index}
            className={`w-12 h-12 rounded-lg flex items-center justify-center font-bold text-sm transition-all ${
              piece === emptyValue
                ? 'bg-transparent border-2 border-dashed border-gray-400 dark:border-gray-500'
                : piece === index
                ? 'bg-gradient-to-br from-green-500 to-green-600 text-white shadow-md'
                : 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-md'
            }`}
          >
            {piece === emptyValue ? '' : piece + 1}
          </div>
        ))}
      </div>
    );
  };
  
  // 自动播放
  useEffect(() => {
    if (isPlaying && currentStep < solutionSteps.length) {
      const timer = setTimeout(() => {
        setCurrentStep(prev => prev + 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (isPlaying && currentStep >= solutionSteps.length) {
      setIsPlaying(false);
    }
  }, [isPlaying, currentStep, solutionSteps.length]);
  
  if (initialPositions.length === 0) {
    return (
      <div className="text-center py-8">
        <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 dark:text-gray-400">暂无解决方案数据</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* 游戏信息 */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-4 rounded-xl border border-purple-200 dark:border-purple-700">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-lg font-bold text-purple-600 dark:text-purple-400">{gridSize}×{gridSize}</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">网格大小</div>
          </div>
          <div>
            <div className="text-lg font-bold text-blue-600 dark:text-blue-400">{record.gameData?.moves || 0}</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">实际步数</div>
          </div>
          <div>
            <div className="text-lg font-bold text-green-600 dark:text-green-400">{solutionSteps.length}</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">建议步数</div>
          </div>
          <div>
            <div className="text-lg font-bold text-orange-600 dark:text-orange-400">{record.score}</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">得分</div>
          </div>
        </div>
      </div>
      
      {/* 初始状态 */}
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">初始状态</h3>
        <div className="flex justify-center">
          {renderPuzzleGrid(initialPositions)}
        </div>
      </div>
      
      {/* 解决步骤 */}
      {solutionSteps.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">解决步骤</h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                {isPlaying ? '暂停' : '播放'}
              </button>
              <button
                onClick={() => setCurrentStep(0)}
                className="px-3 py-1 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                重置
              </button>
            </div>
          </div>
          
          {/* 步骤进度 */}
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300 mb-2">
              <span>步骤 {currentStep} / {solutionSteps.length}</span>
              <span>{Math.round((currentStep / solutionSteps.length) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <motion.div
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                initial={{ width: '0%' }}
                animate={{ width: `${(currentStep / solutionSteps.length) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
          
          {/* 当前步骤描述和状态 */}
          {currentStep > 0 && currentStep <= solutionSteps.length && (
            <div className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-700">
                <div className="flex items-center space-x-2">
                  <ArrowRight className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <span className="text-blue-800 dark:text-blue-200">
                    步骤 {currentStep}: 移动数字 {solutionSteps[currentStep - 1].piece + 1}
                  </span>
                </div>
              </div>
              
              {/* 当前步骤的拼图状态 */}
              <div className="text-center">
                <h4 className="text-md font-semibold text-gray-700 dark:text-gray-300 mb-3">当前状态</h4>
                <div className="flex justify-center">
                  {renderCurrentStepGrid()}
                </div>
              </div>
            </div>
          )}
          
          {/* 步骤控制 */}
          <div className="flex justify-center space-x-2 mb-4">
            <button
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0}
              className="px-3 py-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              上一步
            </button>
            <button
              onClick={() => setCurrentStep(Math.min(solutionSteps.length, currentStep + 1))}
              disabled={currentStep >= solutionSteps.length}
              className="px-3 py-1 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              下一步
            </button>
          </div>
        </div>
      )}
      
      {/* 目标状态 */}
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">目标状态</h3>
        <div className="flex justify-center">
          {renderPuzzleGrid(
            Array.from({ length: totalPieces }, (_, i) => ({
              id: i === totalPieces - 1 ? emptyValue : i,
              position: i
            }))
          )}
        </div>
      </div>
    </div>
  );
};

export default GameHistory; 