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
  private totalPieces: number;

  constructor(gridSize: number) {
    this.gridSize = gridSize;
    this.totalPieces = gridSize * gridSize;
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
    
    const emptyIndex = initialBoard.indexOf(this.totalPieces - 1);
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
      if (currentState.cost > 100) {
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
    const filteredBoard = board.filter(num => num !== this.totalPieces - 1);
    
    for (let i = 0; i < filteredBoard.length - 1; i++) {
      for (let j = i + 1; j < filteredBoard.length; j++) {
        if (filteredBoard[i] > filteredBoard[j]) {
          inversions++;
        }
      }
    }
    
    if (this.gridSize % 2 === 1) {
      return inversions % 2 === 0;
    } else {
      const emptyRow = Math.floor(board.indexOf(this.totalPieces - 1) / this.gridSize);
      return (inversions + emptyRow) % 2 === 0;
    }
  }

  /**
   * 检查拼图是否已解决
   */
  private isSolved(board: number[]): boolean {
    return board.every((piece, index) => piece === index);
  }

  /**
   * 计算启发式函数值（曼哈顿距离）
   */
  private calculateHeuristic(board: number[]): number {
    let distance = 0;
    
    for (let i = 0; i < board.length; i++) {
      const piece = board[i];
      if (piece !== this.totalPieces - 1) { // 忽略空格
        const currentRow = Math.floor(i / this.gridSize);
        const currentCol = i % this.gridSize;
        const targetRow = Math.floor(piece / this.gridSize);
        const targetCol = piece % this.gridSize;
        
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
    newBoard[move.to] = newBoard[move.from];
    newBoard[move.from] = this.totalPieces - 1; // 空格
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
    
    // 添加初始状态
    let currentBoard = [...finalState.board];
    
    // 逆向重建棋盘状态
    for (let i = finalState.moves.length - 1; i >= 0; i--) {
      const move = finalState.moves[i];
      // 撤销移动
      const temp = currentBoard[move.from];
      currentBoard[move.from] = currentBoard[move.to];
      currentBoard[move.to] = temp;
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
