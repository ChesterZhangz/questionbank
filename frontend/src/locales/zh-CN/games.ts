export const games = {
  // GameHistory 组件
  gameHistory: {
    title: '游戏历史记录',
    subtitle: '查看您的游戏记录和统计',
    gameTypes: {
      all: '全部游戏',
      math: '数学计算',
      memory: '记忆游戏',
      puzzle: '数字拼图',
      reaction: '反应速度'
    },
    filter: {
      gameType: '游戏类型:',
      loading: '加载历史记录...',
      noRecords: '暂无游戏记录',
      retry: '重试',
      error: '获取游戏历史失败，请稍后重试'
    },
    record: {
      difficulty: '难度',
      score: '分数',
      moves: '步数',
      timeUsed: '用时',
      accuracy: '准确率',
      time: '时间',
      solution: '解法',
      viewSolution: '查看解法',
      unknown: '未知游戏'
    },
    pagination: {
      total: '共 {total} 条记录，第 {page} / {pages} 页',
      previous: '上一页',
      next: '下一页'
    }
  },

  // GameSettings 组件
  gameSettings: {
    title: '游戏设置',
    mathGame: {
      title: '数学计算游戏',
      difficulty: '难度等级',
      levels: {
        easy: '简单',
        medium: '中等',
        hard: '困难'
      }
    },
    memoryGame: {
      title: '记忆游戏',
      gridSize: '网格大小',
      pairs: '{count}对'
    },
    puzzleGame: {
      title: '数字拼图',
      gridSize: '拼图大小',
      pieces: '{count}块'
    },
    reactionGame: {
      title: '反应速度游戏',
      difficulty: '难度等级',
      levels: {
        easy: '简单',
        medium: '中等',
        hard: '困难'
      },
      descriptions: {
        easy: '基础反应测试',
        medium: '颜色变化',
        hard: '形状+干扰'
      }
    },
    common: {
      title: '通用设置',
      timeLimit: '游戏时间限制',
      timeLimitValue: '{seconds}秒',
      timeLimitLabels: {
        min: '30秒',
        mid1: '60秒',
        mid2: '90秒',
        max: '120秒'
      },
      sound: '音效'
    },
    buttons: {
      reset: '重置',
      cancel: '取消',
      save: '保存'
    }
  },

  // Leaderboard 组件
  leaderboard: {
    title: '排行榜',
    yourRank: '你的排名',
    rank: '第 {rank} 名',
    score: '分',
    loading: '加载排行榜...',
    noData: '暂无排行榜数据',
    retry: '重试',
    error: '获取排行榜失败，请稍后重试',
    realTime: '排行榜实时更新',
    challenge: '挑战自己，创造新纪录！',
    gameTypes: {
      math: '数学计算',
      memory: '记忆游戏',
      puzzle: '数字拼图',
      reaction: '反应速度',
      default: '小游戏'
    }
  },

  // MathGame 组件
  mathGame: {
    title: '数学计算',
    totalScore: '总分',
    streak: '连胜',
    accuracy: '准确率',
    timeLeft: '剩余时间',
    timeProgress: '时间进度',
    confirm: '确认',
    correct: '正确！+{points}分',
    incorrect: '错误，再试一次'
  },

  // MemoryGame 组件
  memoryGame: {
    title: '记忆游戏',
    description: '找到所有相同的数字配对',
    score: '得分',
    moves: '步数',
    pairs: '配对',
    time: '时间',
    progress: '进度',
    completionProgress: '完成进度'
  },

  // PuzzleGame 组件
  puzzleGame: {
    title: '数字拼图',
    description: '将数字按顺序排列完成拼图',
    moves: '步数',
    time: '时间',
    progress: '进度',
    difficulty: '难度',
    completionProgress: '完成进度',
    instruction: '点击相邻的数字块进行移动'
  },

  // PuzzleSolutionModal 组件
  puzzleSolutionModal: {
    title: '拼图解法演示',
    subtitle: '{size}×{size} 拼图的最优解法步骤',
    loading: '正在计算最优解法...',
    error: '无法生成解题方案',
    algorithmError: '解题算法执行失败',
    retry: '重试',
    noData: '暂无解法数据',
    initialState: '初始状态',
    step: '第 {step} 步',
    moveNumber: '移动数字 {number}',
    fromPosition: '从位置 {from} 到位置 {to}',
    optimalMoves: '最优步数',
    actualMoves: '实际步数',
    timeUsed: '用时',
    currentStep: '当前步骤',
    solutionProgress: '解题进度',
    resetToStart: '重置到开始',
    previousStep: '上一步',
    play: '播放',
    pause: '暂停',
    nextStep: '下一步',
    jumpToEnd: '跳到结尾',
    playbackSpeed: '播放速度',
    stepList: '步骤列表',
    stepNumber: '步骤 {step}: 移动 {number}'
  },

  // ReactionGame 组件
  reactionGame: {
    title: '反应速度',
    difficulty: {
      easy: '简单',
      medium: '中等',
      hard: '困难'
    },
    descriptions: {
      easy: '点击出现的圆圈，测试你的反应速度',
      medium: '点击出现的目标，注意颜色变化',
      hard: '点击出现的目标，注意形状和颜色变化，避开干扰元素'
    },
    score: '得分',
    rounds: '回合',
    time: '时间',
    progress: '进度',
    gameProgress: '游戏进度',
    waiting: '等待目标出现...',
    reactionTime: '反应时间: {time}ms',
    points: '得分: +{points}'
  },

  // 其他游戏组件通用翻译
  common: {
    loading: '加载中...',
    error: '发生错误',
    retry: '重试',
    close: '关闭',
    start: '开始',
    pause: '暂停',
    resume: '继续',
    restart: '重新开始',
    finish: '完成',
    score: '分数',
    time: '时间',
    moves: '步数',
    accuracy: '准确率',
    best: '最佳',
    new: '新纪录',
    congratulations: '恭喜！',
    gameOver: '游戏结束',
    tryAgain: '再试一次',
    nextLevel: '下一关',
    backToMenu: '返回菜单'
  }
};
