/**
 * 拼图解题算法API服务
 */

import { PuzzleSolver, type SolutionStep } from '../lib/puzzle/PuzzleSolver';

export interface PuzzleSolutionRequest {
  initialBoard: number[];
  gridSize: number;
}

export interface PuzzleSolutionResponse {
  success: boolean;
  solution: SolutionStep[];
  totalSteps: number;
  error?: string;
}

export class PuzzleSolverService {
  /**
   * 解决拼图问题
   */
  static async solvePuzzle(request: PuzzleSolutionRequest): Promise<PuzzleSolutionResponse> {
    try {
      const { initialBoard, gridSize } = request;
      
      // 验证输入
      if (!initialBoard || !Array.isArray(initialBoard)) {
        return {
          success: false,
          solution: [],
          totalSteps: 0,
          error: '无效的初始拼图状态'
        };
      }
      
      if (gridSize < 3 || gridSize > 4) {
        return {
          success: false,
          solution: [],
          totalSteps: 0,
          error: '不支持的拼图大小'
        };
      }
      
      if (initialBoard.length !== gridSize * gridSize) {
        return {
          success: false,
          solution: [],
          totalSteps: 0,
          error: '拼图状态与网格大小不匹配'
        };
      }
      
      // 创建解题器并求解
      const solver = new PuzzleSolver(gridSize);
      const solution = solver.solve(initialBoard);
      
      if (solution.length === 0) {
        return {
          success: false,
          solution: [],
          totalSteps: 0,
          error: '无法找到解决方案'
        };
      }
      
      return {
        success: true,
        solution,
        totalSteps: solution.length - 1, // 减去初始状态
        error: undefined
      };
      
    } catch (error) {
      console.error('解题算法错误:', error);
      return {
        success: false,
        solution: [],
        totalSteps: 0,
        error: '解题算法执行失败'
      };
    }
  }
  
  /**
   * 验证拼图是否可解
   */
  static isPuzzleSolvable(board: number[], gridSize: number): boolean {
    try {
      const solver = new PuzzleSolver(gridSize);
      return solver['isSolvable'](board); // 调用私有方法进行验证
    } catch (error) {
      console.error('验证拼图可解性失败:', error);
      return false;
    }
  }
  
  /**
   * 生成随机可解拼图
   */
  static generateRandomPuzzle(gridSize: number): number[] {
    try {
      return PuzzleSolver.generateSolvablePuzzle(gridSize);
    } catch (error) {
      console.error('生成随机拼图失败:', error);
      // 返回已排序的拼图作为后备
      return Array.from({ length: gridSize * gridSize }, (_, i) => i);
    }
  }
  
  /**
   * 验证移动步骤
   */
  static validateMoveSequence(
    initialBoard: number[], 
    moveSequence: Array<{from: number, to: number, piece: number, step: number}>,
    gridSize: number
  ): boolean {
    try {
      let currentBoard = [...initialBoard];
      const totalPieces = gridSize * gridSize;
      const emptyValue = totalPieces - 1;
      
      for (const move of moveSequence) {
        // 验证移动的有效性
        if (currentBoard[move.from] !== move.piece) {
          return false;
        }
        
        if (currentBoard[move.to] !== emptyValue) {
          return false;
        }
        
        // 验证是否相邻
        const fromRow = Math.floor(move.from / gridSize);
        const fromCol = move.from % gridSize;
        const toRow = Math.floor(move.to / gridSize);
        const toCol = move.to % gridSize;
        
        const isAdjacent = (
          (Math.abs(fromRow - toRow) === 1 && fromCol === toCol) ||
          (Math.abs(fromCol - toCol) === 1 && fromRow === toRow)
        );
        
        if (!isAdjacent) {
          return false;
        }
        
        // 执行移动
        currentBoard[move.to] = currentBoard[move.from];
        currentBoard[move.from] = emptyValue;
      }
      
      return true;
    } catch (error) {
      console.error('验证移动序列失败:', error);
      return false;
    }
  }
}

export default PuzzleSolverService;
