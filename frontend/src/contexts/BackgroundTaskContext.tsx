import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { Question } from '../types';
import { useModal } from '../hooks/useModal';

// 后台任务状态接口
export interface BackgroundTask {
  id: string;
  type: 'document' | 'ocr' | 'auto-processing';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  fileName: string;
  fileSize: number;
  startTime: Date;
  endTime?: Date;
  result?: {
    questions: Question[];
    statistics?: any;
    errors?: string[];
  };
  error?: string;
}

interface BackgroundTaskContextType {
  tasks: BackgroundTask[];
  addTask: (task: Omit<BackgroundTask, 'id' | 'startTime'>) => string;
  updateTask: (taskId: string, updates: Partial<BackgroundTask>) => void;
  removeTask: (taskId: string) => void;
  getTaskStats: () => {
    total: number;
    completed: number;
    failed: number;
    processing: number;
    pending: number;
  };
  showNotification: (title: string, message: string, type: 'success' | 'error' | 'info') => void;
}

const BackgroundTaskContext = createContext<BackgroundTaskContextType | undefined>(undefined);

export const useBackgroundTasks = () => {
  const context = useContext(BackgroundTaskContext);
  if (!context) {
    throw new Error('useBackgroundTasks must be used within a BackgroundTaskProvider');
  }
  return context;
};

interface BackgroundTaskProviderProps {
  children: React.ReactNode;
}

export const BackgroundTaskProvider: React.FC<BackgroundTaskProviderProps> = ({ children }) => {
  const [tasks, setTasks] = useState<BackgroundTask[]>([]);

  // 弹窗状态管理
  const { showErrorRightSlide } = useModal();

  // 从localStorage恢复任务状态
  useEffect(() => {
    const savedTasks = localStorage.getItem('backgroundTasks');
    if (savedTasks) {
      try {
        const parsedTasks = JSON.parse(savedTasks);
        // 只恢复未完成的任务
        const activeTasks = parsedTasks.filter((task: BackgroundTask) => 
          task.status === 'pending' || task.status === 'processing'
        );
        setTasks(activeTasks);
      } catch (error) {
        console.error('Failed to restore background tasks:', error);
      }
    }
  }, []);

  // 保存任务状态到localStorage
  useEffect(() => {
    localStorage.setItem('backgroundTasks', JSON.stringify(tasks));
  }, [tasks]);

  // 添加后台任务
  const addTask = useCallback((task: Omit<BackgroundTask, 'id' | 'startTime'>) => {
    const newTask: BackgroundTask = {
      ...task,
      id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      startTime: new Date()
    };
    
    setTasks(prev => [newTask, ...prev]);
    return newTask.id;
  }, []);

  // 更新后台任务状态
  const updateTask = useCallback((taskId: string, updates: Partial<BackgroundTask>) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, ...updates } : task
    ));
  }, []);

  // 删除后台任务
  const removeTask = useCallback((taskId: string) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
  }, []);

  // 获取任务统计信息
  const getTaskStats = useCallback(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'completed').length;
    const failed = tasks.filter(t => t.status === 'failed').length;
    const processing = tasks.filter(t => t.status === 'processing').length;
    const pending = tasks.filter(t => t.status === 'pending').length;
    
    return { total, completed, failed, processing, pending };
  }, [tasks]);

  // 显示通知
  const showNotification = useCallback((title: string, message: string, type: 'success' | 'error' | 'info') => {
    // 检查浏览器是否支持通知
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body: message,
        icon: '/favicon.ico',
        tag: 'background-task',
        requireInteraction: type === 'error'
      });
    }

    // 如果浏览器不支持通知或权限未授予，使用弹窗作为后备
    if (!('Notification' in window) || Notification.permission !== 'granted') {
      showErrorRightSlide(title, message);
    }
  }, []);

  // 监听任务完成状态变化，发送通知
  useEffect(() => {
    tasks.forEach(task => {
      if (task.status === 'completed' && !task.endTime) {
        // 任务刚完成，发送通知
        showNotification(
          '任务完成',
          `${task.fileName} 处理完成，识别到 ${task.result?.questions.length || 0} 道题目`,
          'success'
        );
        // 标记已通知
        updateTask(task.id, { endTime: new Date() });
      } else if (task.status === 'failed' && !task.endTime) {
        // 任务失败，发送通知
        showNotification(
          '任务失败',
          `${task.fileName} 处理失败: ${task.error || '未知错误'}`,
          'error'
        );
        // 标记已通知
        updateTask(task.id, { endTime: new Date() });
      }
    });
  }, [tasks, showNotification, updateTask]);

  const value: BackgroundTaskContextType = {
    tasks,
    addTask,
    updateTask,
    removeTask,
    getTaskStats,
    showNotification
  };

  return (
    <BackgroundTaskContext.Provider value={value}>
      {children}
    </BackgroundTaskContext.Provider>
  );
}; 