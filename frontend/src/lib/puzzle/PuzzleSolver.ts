/**
 * 数字拼图解题算法
 * 使用A*搜索算法找到最优解
 */

interface PuzzleState {
  board: number[];
  emptyIndex: number;
  moves: Move[];
  cost: number;
  heuristic: number;
}

interface Move {
  from: number;
  to: number;
  piece: number;
  step: number;
}

interface SolutionStep {
  board: number[];
  move: Move | null;
  step: number;
}

class PuzzleSolver {
  private gridSize: number;

  constructor(gridSize: number) {
    this.gridSize = gridSize;
  }

  /**
   * 解决拼图问题
   * @param initialBoard 初始拼图状态
   * @returns 解题步骤数组
   */
  solve(initialBoard: number[]): SolutionStep[] {
    
    if (this.isSolved(initialBoard)) {
      return [{
        board: [...initialBoard],
        move: null,
        step: 0
      }];
    }

    if (!this.isSolvable(initialBoard)) {
      return [];
    }
    

    const openSet = new Map<string, PuzzleState>();
    const closedSet = new Set<string>();
    
    // 修复：按照Python代码逻辑，空格值应该是0
    const emptyValue = 0;
    const emptyIndex = initialBoard.indexOf(emptyValue);
    
    const initialState: PuzzleState = {
      board: [...initialBoard],
      emptyIndex,
      moves: [],
      cost: 0,
      heuristic: this.calculateHeuristic(initialBoard)
    };

    const stateKey = this.getBoardKey(initialBoard);
    openSet.set(stateKey, initialState);

    while (openSet.size > 0) {
      // 找到f值最小的状态
      const currentState = this.getLowestFScore(openSet);
      const currentKey = this.getBoardKey(currentState.board);
      
      
      openSet.delete(currentKey);
      closedSet.add(currentKey);

      if (this.isSolved(currentState.board)) {
        return this.reconstructSolution(currentState);
      }

      // 生成所有可能的移动
      const possibleMoves = this.getPossibleMoves(currentState);
      
      for (const move of possibleMoves) {
        const newBoard = this.applyMove(currentState.board, move);
        const newKey = this.getBoardKey(newBoard);
        
        if (closedSet.has(newKey)) {
          continue;
        }

        const newEmptyIndex = move.to;
        const newCost = currentState.cost + 1;
        const newHeuristic = this.calculateHeuristic(newBoard);
        
        const newState: PuzzleState = {
          board: newBoard,
          emptyIndex: newEmptyIndex,
          moves: [...currentState.moves, { ...move, step: newCost }],
          cost: newCost,
          heuristic: newHeuristic
        };

        const existingState = openSet.get(newKey);
        if (!existingState || newCost < existingState.cost) {
          openSet.set(newKey, newState);
        }
      }

      // 防止无限循环，限制最大搜索深度
      if (currentState.cost > 80) {
        break;
      }
    }

    return []; // 未找到解
  }

  /**
   * 检查拼图是否可解
   */
  private isSolvable(board: number[]): boolean {
    let inversions = 0;
    // 修复：按照Python代码逻辑，空格值应该是0
    const emptyValue = 0;
    
    
    // 按照Python代码的逆序数计算逻辑
    
    // 计算逆序数（不包括空格）
    for (let i = 0; i < board.length - 1; i++) {
      if (board[i] === emptyValue) continue;
      for (let j = i + 1; j < board.length; j++) {
        if (board[j] === emptyValue) continue;
        if (board[i] > board[j]) {
          inversions++;
        }
      }
    }
    
    const emptyIndex = board.indexOf(emptyValue);
    const emptyRow = Math.floor(emptyIndex / this.gridSize);
    
    // 使用Python代码的可解性判断公式：(逆序数 + 空格行数) % 2 == 0 则可解
    const result = (inversions + emptyRow) % 2 === 0;
    
    return result;
  }

  /**
   * 检查拼图是否已解决
   */
  private isSolved(board: number[]): boolean {
    // 修复：按照Python代码的逻辑，空格应该是0，目标状态是[0,1,2,3,4,5,6,7,8]
    // 其中0是空格，其他数字在对应位置
    for (let i = 0; i < board.length; i++) {
      if (i === 0) {
        // 第0个位置应该是空格(0)
        if (board[i] !== 0) {
          return false;
        }
      } else {
        // 其他位置应该是对应的数字
        if (board[i] !== i) {
          return false;
        }
      }
    }
    return true;
  }

  /**
   * 计算启发式函数值（曼哈顿距离）
   */
  private calculateHeuristic(board: number[]): number {
    let distance = 0;
    // 修复：按照Python代码逻辑，空格值应该是0
    const emptyValue = 0;
    
    for (let i = 0; i < board.length; i++) {
      const piece = board[i];
      if (piece !== emptyValue) { // 忽略空格
        const currentRow = Math.floor(i / this.gridSize);
        const currentCol = i % this.gridSize;
        
        // 计算目标位置：每个数字的目标位置就是数字本身
        const targetPosition = piece;
        const targetRow = Math.floor(targetPosition / this.gridSize);
        const targetCol = targetPosition % this.gridSize;
        
        distance += Math.abs(currentRow - targetRow) + Math.abs(currentCol - targetCol);
      }
    }
    
    return distance;
  }

  /**
   * 获取可能的移动
   */
  private getPossibleMoves(state: PuzzleState): Move[] {
    const moves: Move[] = [];
    const emptyRow = Math.floor(state.emptyIndex / this.gridSize);
    const emptyCol = state.emptyIndex % this.gridSize;
    
    // 四个方向：上、下、左、右
    const directions = [
      { row: -1, col: 0 }, // 上
      { row: 1, col: 0 },  // 下
      { row: 0, col: -1 }, // 左
      { row: 0, col: 1 }   // 右
    ];
    
    for (const dir of directions) {
      const newRow = emptyRow + dir.row;
      const newCol = emptyCol + dir.col;
      
      if (newRow >= 0 && newRow < this.gridSize && newCol >= 0 && newCol < this.gridSize) {
        const pieceIndex = newRow * this.gridSize + newCol;
        const piece = state.board[pieceIndex];
        
        moves.push({
          from: pieceIndex,
          to: state.emptyIndex,
          piece: piece,
          step: state.cost + 1
        });
      }
    }
    
    return moves;
  }

  /**
   * 应用移动到棋盘
   */
  private applyMove(board: number[], move: Move): number[] {
    const newBoard = [...board];
    // 修复：按照Python代码逻辑，空格值应该是0
    const emptyValue = 0;
    newBoard[move.to] = newBoard[move.from];
    newBoard[move.from] = emptyValue; // 空格
    return newBoard;
  }

  /**
   * 获取棋盘的唯一标识
   */
  private getBoardKey(board: number[]): string {
    return board.join(',');
  }

  /**
   * 获取F值最小的状态
   */
  private getLowestFScore(openSet: Map<string, PuzzleState>): PuzzleState {
    let lowestState: PuzzleState | null = null;
    let lowestF = Infinity;
    
    for (const state of openSet.values()) {
      const f = state.cost + state.heuristic;
      if (f < lowestF) {
        lowestF = f;
        lowestState = state;
      }
    }
    
    return lowestState!;
  }

  /**
   * 重构解题步骤
   */
  private reconstructSolution(finalState: PuzzleState): SolutionStep[] {
    const steps: SolutionStep[] = [];
    
    // 添加初始状态（通过逆向应用所有移动来重建）
    let currentBoard = [...finalState.board];
    
    // 逆向重建初始状态
    for (let i = finalState.moves.length - 1; i >= 0; i--) {
      const move = finalState.moves[i];
      // 撤销移动：将空格移回原来的位置
      const emptyValue = 0;
      currentBoard[move.from] = currentBoard[move.to];
      currentBoard[move.to] = emptyValue;
    }
    
    // 添加初始状态
    steps.push({
      board: [...currentBoard],
      move: null,
      step: 0
    });
    
    // 正向添加每一步
    for (let i = 0; i < finalState.moves.length; i++) {
      const move = finalState.moves[i];
      currentBoard = this.applyMove(currentBoard, move);
      
      steps.push({
        board: [...currentBoard],
        move: move,
        step: i + 1
      });
    }
    
    return steps;
  }

  /**
   * 生成随机可解拼图
   */
  static generateSolvablePuzzle(gridSize: number): number[] {
    const totalPieces = gridSize * gridSize;
    const board = Array.from({ length: totalPieces }, (_, i) => i);
    
    // 随机打乱，但保证可解
    for (let i = 0; i < 1000; i++) {
      const emptyIndex = board.indexOf(totalPieces - 1);
      const emptyRow = Math.floor(emptyIndex / gridSize);
      const emptyCol = emptyIndex % gridSize;
      
      const directions = [];
      if (emptyRow > 0) directions.push(emptyIndex - gridSize);
      if (emptyRow < gridSize - 1) directions.push(emptyIndex + gridSize);
      if (emptyCol > 0) directions.push(emptyIndex - 1);
      if (emptyCol < gridSize - 1) directions.push(emptyIndex + 1);
      
      const randomIndex = directions[Math.floor(Math.random() * directions.length)];
      [board[emptyIndex], board[randomIndex]] = [board[randomIndex], board[emptyIndex]];
    }
    
    return board;
  }

}

export { PuzzleSolver, type Move, type SolutionStep };
