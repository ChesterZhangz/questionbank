import axios from 'axios';

const API_BASE_URL = import.meta.env.DEV ? '/api' : (import.meta.env.VITE_API_URL || 'https://www.mareate.com/api');

// 游戏记录接口
export interface GameRecord {
  gameType: 'math' | 'memory' | 'puzzle' | 'reaction';
  score: number;
  difficulty?: string;
  settings?: {
    timeLimit: number;
    gridSize?: number;
    difficulty?: string;
  };
  gameData?: {
    moves?: number;
    timeUsed?: number;
    accuracy?: number;
    bestTime?: number;
    averageTime?: number;
    rounds?: number;
    initialBoard?: number[];
    moveSequence?: Array<{
      from: number;
      to: number;
      piece: number;
      step: number;
    }>;
  };
}

// 排行榜条目接口
export interface LeaderboardEntry {
  id: string;
  userId: string;
  username: string;
  score: number;
  rank: number;
  difficulty?: string;
  gameData?: {
    moves?: number;
    timeUsed?: number;
    accuracy?: number;
    bestTime?: number;
    averageTime?: number;
    rounds?: number;
  };
  createdAt: string;
}

// 用户游戏统计接口
export interface UserGameStats {
  userId: string;
  username: string;
  totalGames: number;
  totalScore: number;
  averageScore: number;
  bestScores: {
    math: number;
    memory: number;
    puzzle: number;
    reaction: number;
  };
  gameCounts: {
    math: number;
    memory: number;
    puzzle: number;
    reaction: number;
  };
  dailyGameCount: number;
  isGameDisabled: boolean;
  gameDisabledUntil?: string;
  achievements: string[];
  lastPlayed: string;
}

// 游戏状态接口
export interface GameStatus {
  canPlay: boolean;
  dailyGameCount: number;
  warningMessage?: string;
  reason?: string;
  disabledUntil?: string;
  message?: string;
  userStats?: UserGameStats;
}

// 游戏历史记录接口
export interface GameHistoryRecord {
  id: string;
  gameType: string;
  score: number;
  difficulty: string;
  settings?: {
    timeLimit?: number;
    gridSize?: number;
    difficulty?: string;
  };
  gameData?: {
    moves?: number;
    timeUsed?: number;
    accuracy?: number;
    bestTime?: number;
    averageTime?: number;
    rounds?: number;
    initialBoard?: number[];
    moveSequence?: Array<{
      from: number;
      to: number;
      piece: number;
      step: number;
    }>;
  };
  createdAt: string;
}

// 游戏概览接口
export interface GameOverview {
  totalGames: number;
  totalPlayers: number;
  averageScore: number;
  todayGames: number;
  todayPlayers: number;
}

// 用户排名接口
export interface UserRank {
  rank: number | null;
  score: number;
  totalPlayers: number;
}

// 创建axios实例
const gameAPI = axios.create({
  baseURL: `${API_BASE_URL}/games`,
  timeout: 30000, // 增加超时时间，与其他API保持一致
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器 - 添加认证token
gameAPI.interceptors.request.use(
  (config) => {
    // 从Zustand持久化数据中获取token
    const authStorage = localStorage.getItem('auth-storage');
    if (authStorage) {
      try {
        const authData = JSON.parse(authStorage);
        if (authData.state && authData.state.token) {
          config.headers.Authorization = `Bearer ${authData.state.token}`;
        }
      } catch (error) {
        console.error('Failed to parse auth storage:', error);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器 - 处理错误
gameAPI.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error('游戏API错误:', error);
    
    // 处理401未授权错误
    if (error.response?.status === 401) {
      // 清理认证状态
      localStorage.removeItem('auth-storage');
      // 重定向到登录页面
      window.location.href = '/login';
      return Promise.reject(error);
    }
    
    // 处理404错误 - 重定向到404页面
    if (error.response?.status === 404) {
      window.location.href = '/error/404';
      return Promise.reject(error);
    }
    
    return Promise.reject(error);
  }
);

// 游戏API服务类
export class GameAPIService {
  // 提交游戏记录
  static async submitGameRecord(record: GameRecord) {
    try {
      const response = await gameAPI.post('/record', record);
      return response;
    } catch (error) {
      console.error('提交游戏记录失败:', error);
      throw error;
    }
  }

  // 获取排行榜
  static async getLeaderboard(
    gameType: string, 
    limit: number = 10, 
    difficulty?: string
  ): Promise<LeaderboardEntry[]> {
    try {
      const params: any = { limit };
      if (difficulty) params.difficulty = difficulty;
      
      const response = await gameAPI.get(`/leaderboard/${gameType}`, { params });
      return response.data.data || response.data;
    } catch (error) {
      console.error('获取排行榜失败:', error);
      throw error;
    }
  }

  // 获取用户游戏统计
  static async getUserStats(): Promise<{
    stats: UserGameStats;
    recentGames: GameHistoryRecord[];
  }> {
    try {
      const response = await gameAPI.get('/stats');
      return response.data;
    } catch (error) {
      console.error('获取用户统计失败:', error);
      throw error;
    }
  }

  // 获取用户在特定游戏中的排名
  static async getUserRank(gameType: string): Promise<UserRank> {
    try {
      const response = await gameAPI.get(`/rank/${gameType}`);
      return response.data;
    } catch (error) {
      console.error('获取用户排名失败:', error);
      throw error;
    }
  }

  // 获取游戏历史记录
  static async getGameHistory(
    gameType?: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{
    records: GameHistoryRecord[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }> {
    try {
      const params: any = { page, limit };
      if (gameType) params.gameType = gameType;
      
      const response = await gameAPI.get('/history', { params });
      return response.data;
    } catch (error) {
      console.error('获取游戏历史失败:', error);
      throw error;
    }
  }

  // 获取游戏统计概览
  static async getGameOverview(gameType?: string): Promise<GameOverview> {
    try {
      const params: any = {};
      if (gameType) params.gameType = gameType;
      
      const response = await gameAPI.get('/overview', { params });
      return response.data;
    } catch (error) {
      console.error('获取游戏概览失败:', error);
      throw error;
    }
  }

  // 检查游戏状态
  static async getGameStatus(): Promise<GameStatus> {
    try {
      const response = await gameAPI.get('/status');
      return response.data;
    } catch (error) {
      console.error('检查游戏状态失败:', error);
      throw error;
    }
  }
}

// 导出默认实例
export default GameAPIService; 