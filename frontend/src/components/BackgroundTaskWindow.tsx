import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  X, 
  Minimize2, 
  Maximize2, 
  Zap, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  Loader2,
  Plus,
  Trash2
} from 'lucide-react';
import { useBackgroundTasks, type BackgroundTask } from '../contexts/BackgroundTaskContext';

interface BackgroundTaskWindowProps {
  onAddQuestions?: (questions: any[], source: string) => void;
}

const BackgroundTaskWindow: React.FC<BackgroundTaskWindowProps> = ({ onAddQuestions }) => {
  const { tasks, removeTask, getTaskStats } = useBackgroundTasks();
  const [isMinimized, setIsMinimized] = useState(false);
  const [position, setPosition] = useState({ x: 20, y: 20 });

  const stats = getTaskStats();

  if (tasks.length === 0) return null;

  const handleDragStart = (e: React.MouseEvent) => {
    if (isMinimized) return;
    
    const startX = e.clientX - position.x;
    const startY = e.clientY - position.y;
    
    const handleMouseMove = (e: MouseEvent) => {
      setPosition({
        x: e.clientX - startX,
        y: e.clientY - startY
      });
    };
    
    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleAddQuestions = (task: BackgroundTask) => {
    if (task.result?.questions && onAddQuestions) {
      const source = task.fileName.replace(/\.[^/.]+$/, '');
      onAddQuestions(task.result.questions, source);
      removeTask(task.id);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 50 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      style={{
        position: 'fixed',
        left: position.x,
        top: position.y,
        zIndex: 1000,
        width: isMinimized ? 'auto' : '320px',
        maxWidth: '90vw'
      }}
      className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl dark:shadow-gray-900/50 overflow-hidden"
    >
      {/* 标题栏 */}
      <div 
        className="bg-gradient-to-r from-blue-500 to-purple-600 dark:from-blue-600 dark:to-purple-700 text-white p-3 cursor-move select-none"
        onMouseDown={handleDragStart}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Zap className="w-4 h-4" />
            <span className="text-sm font-medium">后台任务</span>
            {stats.processing > 0 && (
              <div className="w-5 h-5 bg-white/20 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
                {stats.processing}
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-1">
            {!isMinimized && (
              <button
                onClick={() => setIsMinimized(true)}
                className="p-1 hover:bg-white/20 rounded transition-colors"
              >
                <Minimize2 className="w-3 h-3" />
              </button>
            )}
            {isMinimized && (
              <button
                onClick={() => setIsMinimized(false)}
                className="p-1 hover:bg-white/20 rounded transition-colors"
              >
                <Maximize2 className="w-3 h-3" />
              </button>
            )}
            <button
              onClick={() => tasks.forEach(task => removeTask(task.id))}
              className="p-1 hover:bg-white/20 rounded transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* 最小化状态 */}
      {isMinimized && (
        <div className="p-2 bg-gray-50 dark:bg-gray-700">
          <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-300">
            <span>{stats.processing} 处理中</span>
            <span>{stats.completed} 已完成</span>
            <span>{stats.failed} 失败</span>
          </div>
        </div>
      )}

      {/* 展开状态 */}
      {!isMinimized && (
        <div className="bg-white dark:bg-gray-800">
          {/* 统计信息 */}
          <div className="p-3 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mb-2">
              <span>总任务: {stats.total}</span>
              <span>处理中: {stats.processing}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-green-600 dark:text-green-400">已完成: {stats.completed}</span>
              <span className="text-red-600 dark:text-red-400">失败: {stats.failed}</span>
            </div>
          </div>

          {/* 任务列表 */}
          <div className="max-h-48 overflow-y-auto">
            <div className="space-y-2 p-3">
              {tasks.map((task) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 border border-gray-200 dark:border-gray-600"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        task.status === 'completed' ? 'bg-green-100 dark:bg-green-900/30' :
                        task.status === 'failed' ? 'bg-red-100 dark:bg-red-900/30' :
                        task.status === 'processing' ? 'bg-blue-100 dark:bg-blue-900/30' :
                        'bg-gray-100 dark:bg-gray-600'
                      }`}>
                        {task.status === 'completed' ? (
                          <CheckCircle className="w-3 h-3 text-green-600 dark:text-green-400" />
                        ) : task.status === 'failed' ? (
                          <AlertTriangle className="w-3 h-3 text-red-600 dark:text-red-400" />
                        ) : task.status === 'processing' ? (
                          <Loader2 className="w-3 h-3 text-blue-600 dark:text-blue-400 animate-spin" />
                        ) : (
                          <Clock className="w-3 h-3 text-gray-600 dark:text-gray-400" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs font-medium text-gray-900 dark:text-gray-100 truncate">
                          {task.fileName}
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {(task.fileSize / 1024 / 1024).toFixed(2)} MB • {task.type}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      {task.status === 'completed' && task.result && (
                        <button
                          onClick={() => handleAddQuestions(task)}
                          className="p-1 hover:bg-green-100 dark:hover:bg-green-800/50 rounded transition-colors"
                          title="添加题目"
                        >
                          <Plus className="w-3 h-3 text-green-600 dark:text-green-400" />
                        </button>
                      )}
                      <button
                        onClick={() => removeTask(task.id)}
                        className="p-1 hover:bg-red-100 dark:hover:bg-red-800/50 rounded transition-colors"
                        title="删除任务"
                      >
                        <Trash2 className="w-3 h-3 text-red-600 dark:text-red-400" />
                      </button>
                    </div>
                  </div>
                  
                  {/* 进度条 */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600 dark:text-gray-400">
                        {task.status === 'completed' ? '已完成' :
                         task.status === 'failed' ? '处理失败' :
                         task.status === 'processing' ? '处理中...' :
                         '等待中...'}
                      </span>
                      <span className="text-gray-600 dark:text-gray-400">{task.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1.5">
                      <motion.div
                        className={`h-1.5 rounded-full ${
                          task.status === 'completed' ? 'bg-green-500 dark:bg-green-400' :
                          task.status === 'failed' ? 'bg-red-500 dark:bg-red-400' :
                          'bg-blue-500 dark:bg-blue-400'
                        }`}
                        initial={{ width: 0 }}
                        animate={{ width: `${task.progress}%` }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                  
                  {/* 错误信息 */}
                  {task.status === 'failed' && task.error && (
                    <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded text-xs text-red-700 dark:text-red-300">
                      {task.error}
                    </div>
                  )}
                  
                  {/* 成功信息 */}
                  {task.status === 'completed' && task.result && (
                    <div className="mt-2 p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded text-xs text-green-700 dark:text-green-300">
                      识别到 {task.result.questions.length} 道题目
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default BackgroundTaskWindow; 