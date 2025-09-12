export const games = {
  // GameHistory component
  gameHistory: {
    title: 'Game History',
    subtitle: 'View your game records and statistics',
    gameTypes: {
      all: 'All Games',
      math: 'Math Calculation',
      memory: 'Memory Game',
      puzzle: 'Number Puzzle',
      reaction: 'Reaction Speed'
    },
    filter: {
      gameType: 'Game Type:',
      loading: 'Loading history...',
      noRecords: 'No game records',
      retry: 'Retry',
      error: 'Failed to load game history, please try again later'
    },
    record: {
      difficulty: 'Difficulty',
      score: 'Score',
      moves: 'Moves',
      timeUsed: 'Time Used',
      accuracy: 'Accuracy',
      time: 'Time',
      solution: 'Solution',
      viewSolution: 'View Solution',
      unknown: 'Unknown Game'
    },
    pagination: {
      total: 'Total {total} records, page {page} / {pages}',
      previous: 'Previous',
      next: 'Next'
    }
  },

  // GameSettings component
  gameSettings: {
    title: 'Game Settings',
    mathGame: {
      title: 'Math Calculation Game',
      difficulty: 'Difficulty Level',
      levels: {
        easy: 'Easy',
        medium: 'Medium',
        hard: 'Hard'
      }
    },
    memoryGame: {
      title: 'Memory Game',
      gridSize: 'Grid Size',
      pairs: '{count} pairs'
    },
    puzzleGame: {
      title: 'Number Puzzle',
      gridSize: 'Puzzle Size',
      pieces: '{count} pieces'
    },
    reactionGame: {
      title: 'Reaction Speed Game',
      difficulty: 'Difficulty Level',
      levels: {
        easy: 'Easy',
        medium: 'Medium',
        hard: 'Hard'
      },
      descriptions: {
        easy: 'Basic reaction test',
        medium: 'Color changes',
        hard: 'Shape + interference'
      }
    },
    common: {
      title: 'Common Settings',
      timeLimit: 'Game Time Limit',
      timeLimitValue: '{seconds}s',
      timeLimitLabels: {
        min: '30s',
        mid1: '60s',
        mid2: '90s',
        max: '120s'
      },
      sound: 'Sound Effects'
    },
    buttons: {
      reset: 'Reset',
      cancel: 'Cancel',
      save: 'Save'
    }
  },

  // Leaderboard component
  leaderboard: {
    title: 'Leaderboard',
    yourRank: 'Your Rank',
    rank: 'Rank #{rank}',
    score: 'points',
    loading: 'Loading leaderboard...',
    noData: 'No leaderboard data',
    retry: 'Retry',
    error: 'Failed to load leaderboard, please try again later',
    realTime: 'Leaderboard updates in real-time',
    challenge: 'Challenge yourself and set new records!',
    gameTypes: {
      math: 'Math Calculation',
      memory: 'Memory Game',
      puzzle: 'Number Puzzle',
      reaction: 'Reaction Speed',
      default: 'Mini Game'
    }
  },

  // MathGame component
  mathGame: {
    title: 'Math Calculation',
    totalScore: 'Total Score',
    streak: 'Streak',
    accuracy: 'Accuracy',
    timeLeft: 'Time Left',
    timeProgress: 'Time Progress',
    confirm: 'Confirm',
    correct: 'Correct! +{points} points',
    incorrect: 'Incorrect, try again'
  },

  // MemoryGame component
  memoryGame: {
    title: 'Memory Game',
    description: 'Find all matching number pairs',
    score: 'Score',
    moves: 'Moves',
    pairs: 'Pairs',
    time: 'Time',
    progress: 'Progress',
    completionProgress: 'Completion Progress'
  },

  // PuzzleGame component
  puzzleGame: {
    title: 'Number Puzzle',
    description: 'Arrange numbers in order to complete the puzzle',
    moves: 'Moves',
    time: 'Time',
    progress: 'Progress',
    difficulty: 'Difficulty',
    completionProgress: 'Completion Progress',
    instruction: 'Click adjacent number blocks to move'
  },

  // PuzzleSolutionModal component
  puzzleSolutionModal: {
    title: 'Puzzle Solution Demo',
    subtitle: 'Optimal solution steps for {size}×{size} puzzle',
    loading: 'Calculating optimal solution...',
    error: 'Unable to generate solution',
    algorithmError: 'Solution algorithm execution failed',
    retry: 'Retry',
    noData: 'No solution data',
    initialState: 'Initial State',
    step: 'Step {step}',
    moveNumber: 'Move number {number}',
    fromPosition: 'From position {from} to position {to}',
    optimalMoves: 'Optimal Moves',
    actualMoves: 'Actual Moves',
    timeUsed: 'Time Used',
    currentStep: 'Current Step',
    solutionProgress: 'Solution Progress',
    resetToStart: 'Reset to Start',
    previousStep: 'Previous Step',
    play: 'Play',
    pause: 'Pause',
    nextStep: 'Next Step',
    jumpToEnd: 'Jump to End',
    playbackSpeed: 'Playback Speed',
    stepList: 'Step List',
    stepNumber: 'Step {step}: Move {number}'
  },

  // ReactionGame component
  reactionGame: {
    title: 'Reaction Speed',
    difficulty: {
      easy: 'Easy',
      medium: 'Medium',
      hard: 'Hard'
    },
    descriptions: {
      easy: 'Click the appearing circle to test your reaction speed',
      medium: 'Click the appearing target, pay attention to color changes',
      hard: 'Click the appearing target, pay attention to shape and color changes, avoid distraction elements'
    },
    score: 'Score',
    rounds: 'Rounds',
    time: 'Time',
    progress: 'Progress',
    gameProgress: 'Game Progress',
    waiting: 'Waiting for target to appear...',
    reactionTime: 'Reaction Time: {time}ms',
    points: 'Points: +{points}'
  },

  // Common translations for other game components
  common: {
    loading: 'Loading...',
    error: 'An error occurred',
    retry: 'Retry',
    close: 'Close',
    start: 'Start',
    pause: 'Pause',
    resume: 'Resume',
    restart: 'Restart',
    finish: 'Finish',
    score: 'Score',
    time: 'Time',
    moves: 'Moves',
    accuracy: 'Accuracy',
    best: 'Best',
    new: 'New Record',
    congratulations: 'Congratulations!',
    gameOver: 'Game Over',
    tryAgain: 'Try Again',
    nextLevel: 'Next Level',
    backToMenu: 'Back to Menu'
  }
};
