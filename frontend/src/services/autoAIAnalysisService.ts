import { questionEvaluationAPI } from './questionEvaluationAPI';
import type { Question } from '../types';

// 自动AI分析服务
class AutoAIAnalysisService {
  private analysisQueue: Array<{
    questionId: string;
    question: Question;
    priority: 'high' | 'normal' | 'low';
    retryCount: number;
  }> = [];
  
  private isProcessing = false;
  private maxRetries = 3;
  private retryDelay = 5000; // 5秒后重试

  constructor() {
    // 启动队列处理器
    this.startQueueProcessor();
  }

  // 添加题目到分析队列
  async addToAnalysisQueue(question: Question, priority: 'high' | 'normal' | 'low' = 'normal'): Promise<void> {
    const existingIndex = this.analysisQueue.findIndex(item => item.questionId === question.qid);
    
    if (existingIndex !== -1) {
      // 如果已存在，更新优先级和题目数据
      this.analysisQueue[existingIndex] = {
        questionId: question.qid,
        question,
        priority,
        retryCount: 0
      };
    } else {
      // 添加到队列
      this.analysisQueue.push({
        questionId: question.qid,
        question,
        priority,
        retryCount: 0
      });
    }

    // 按优先级排序
    this.sortQueue();
  }

  // 队列排序（高优先级在前）
  private sortQueue(): void {
    const priorityOrder = { high: 3, normal: 2, low: 1 };
    this.analysisQueue.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);
  }

  // 启动队列处理器
  private startQueueProcessor(): void {
    setInterval(() => {
      if (!this.isProcessing && this.analysisQueue.length > 0) {
        this.processNextInQueue();
      }
    }, 2000); // 每2秒检查一次队列
  }

  // 处理队列中的下一个题目
  private async processNextInQueue(): Promise<void> {
    if (this.analysisQueue.length === 0) return;

    this.isProcessing = true;
    const item = this.analysisQueue.shift()!;

    try {
      
      // 调用AI分析
      const analysis = await questionEvaluationAPI.getCompleteAnalysis(item.questionId, item.question);
      
      // 保存分析结果到后端
      await questionEvaluationAPI.saveAIAnalysis(item.questionId, analysis);
      
      
      // 触发分析完成事件
      this.emitAnalysisComplete(item.questionId, analysis);
      
    } catch (error) {
      console.error(`题目 ${item.questionId} 的AI分析失败:`, error);
      
      // 重试逻辑
      if (item.retryCount < this.maxRetries) {
        item.retryCount++;
        
        // 延迟重试
        setTimeout(() => {
          this.analysisQueue.unshift(item);
          this.sortQueue();
        }, this.retryDelay);
      } else {
        console.error(`题目 ${item.questionId} 已达到最大重试次数，分析失败`);
        
        // 触发分析失败事件
        this.emitAnalysisFailed(item.questionId, error);
      }
    } finally {
      this.isProcessing = false;
    }
  }

  // 立即分析指定题目（高优先级）
  async analyzeImmediately(question: Question): Promise<void> {
    await this.addToAnalysisQueue(question, 'high');
  }

  // 批量添加题目到分析队列
  async addBatchToAnalysisQueue(questions: Question[], priority: 'high' | 'normal' | 'low' = 'normal'): Promise<void> {
    for (const question of questions) {
      await this.addToAnalysisQueue(question, priority);
    }
  }

  // 获取队列状态
  getQueueStatus(): {
    total: number;
    processing: boolean;
    highPriority: number;
    normalPriority: number;
    lowPriority: number;
  } {
    const highPriority = this.analysisQueue.filter(item => item.priority === 'high').length;
    const normalPriority = this.analysisQueue.filter(item => item.priority === 'normal').length;
    const lowPriority = this.analysisQueue.filter(item => item.priority === 'low').length;

    return {
      total: this.analysisQueue.length,
      processing: this.isProcessing,
      highPriority,
      normalPriority,
      lowPriority
    };
  }

  // 清空队列
  clearQueue(): void {
    this.analysisQueue = [];
  }

  // 事件系统
  private listeners: {
    analysisComplete: Array<(questionId: string, analysis: any) => void>;
    analysisFailed: Array<(questionId: string, error: any) => void>;
  } = {
    analysisComplete: [],
    analysisFailed: []
  };

  // 监听分析完成事件
  onAnalysisComplete(callback: (questionId: string, analysis: any) => void): void {
    this.listeners.analysisComplete.push(callback);
  }

  // 监听分析失败事件
  onAnalysisFailed(callback: (questionId: string, error: any) => void): void {
    this.listeners.analysisFailed.push(callback);
  }

  // 触发分析完成事件
  private emitAnalysisComplete(questionId: string, analysis: any): void {
    this.listeners.analysisComplete.forEach(callback => {
      try {
        callback(questionId, analysis);
      } catch (error) {
        console.error('分析完成事件回调执行失败:', error);
      }
    });
  }

  // 触发分析失败事件
  private emitAnalysisFailed(questionId: string, error: any): void {
    this.listeners.analysisFailed.forEach(callback => {
      try {
        callback(questionId, error);
      } catch (error) {
        console.error('分析失败事件回调执行失败:', error);
      }
    });
  }

  // 移除事件监听器
  removeListener(event: 'analysisComplete' | 'analysisFailed', callback: Function): void {
    const eventListeners = this.listeners[event];
    const index = eventListeners.indexOf(callback as any);
    if (index !== -1) {
      eventListeners.splice(index, 1);
    }
  }
}

// 创建全局实例
export const autoAIAnalysisService = new AutoAIAnalysisService();
