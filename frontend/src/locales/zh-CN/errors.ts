export const errors = {
  // 错误页面通用文本
  returnHome: '返回首页',
  refreshPage: '刷新页面',
  
  // 400 错误页面
  badRequest: {
    title: '请求错误',
    message: '抱歉，您的请求格式不正确或包含无效参数.',
    description: '请检查您的请求内容，确保所有参数都正确，然后重试.'
  },
  
  // 403 错误页面
  forbidden: {
    title: '访问被拒绝',
    message: '抱歉，您没有权限访问此页面.',
    description: '请确认您已登录并具有相应的访问权限，或联系管理员获取帮助.'
  },
  
  // 404 错误页面
  notFound: {
    title: '页面未找到',
    message: '抱歉，您访问的页面不存在或已被移除.',
    description: '请检查URL是否正确，或者返回首页继续浏览.'
  },
  
  // 500 错误页面
  serverError: {
    title: '服务器内部错误',
    message: '抱歉，服务器遇到了一个意外错误，无法完成您的请求.',
    description: '我们的技术团队已经收到这个错误报告，正在努力修复.请稍后再试.'
  },
  
  // 游戏相关文本
  games: {
    title: '小游戏',
    gameInfo: '游戏说明：',
    totalScore: '总分',
    challengeYourself: '挑战自己',
    prepareToStart: '准备开始游戏',
    selectGameType: '选择游戏类型，点击开始按钮开始挑战',
    gameEnded: '本次游戏已结束',
    allGamesEnded: '所有游戏都已结束，点击重新开始按钮重新挑战',
    clickToRestart: '点击重新开始',
    startGame: '开始游戏',
    gameDisabled: '游戏已禁用',
    todayGameCount: '今日游戏次数',
    dailyGameCount: '今日游戏次数: {count}/15',
    attentionWork: '注意工作',
    reachedLimit: '已达上限',
    userNotLoggedIn: '用户未登录',
    cannotGetGameStatus: '无法获取游戏状态',
    loginPrompt: '登录提示',
    pleaseLoginFirst: '请先登录后再使用游戏功能',
    gameDisabledTitle: '游戏禁用',
    gameReminder: '游戏提醒',
    continueGame: '是否继续游戏？',
    playAgain: '玩把再走？放松放松（Chester 亲传的摸鱼技能！）',
    
    // 游戏类型
    math: {
      title: '数学计算',
      description: '快速计算数学题目，提高计算能力'
    },
    memory: {
      title: '记忆游戏',
      description: '找到相同的数字配对，锻炼记忆力'
    },
    puzzle: {
      title: '数字拼图',
      description: '将数字按顺序排列，训练逻辑思维'
    },
    reaction: {
      title: '反应速度',
      description: '点击出现的圆圈，测试反应速度'
    }
  },
  
  // 错误演示页面
  demo: {
    title: '错误页面演示',
    systemTitle: '错误页面系统',
    systemDescription: '我们重新设计了错误页面系统，提供更好的用户体验和交互功能.每个错误页面都包含小游戏，让用户在等待的同时也能享受乐趣.',
    selectErrorType: '选择错误类型进行演示',
    viewDemo: '查看 {code} 错误页面演示',
    builtInGames: '内置小游戏功能',
    
    // 特性
    features: {
      modernDesign: {
        title: '现代化设计',
        description: '采用最新的UI设计理念，提供优雅的用户体验'
      },
      responsiveLayout: {
        title: '响应式布局',
        description: '完美适配各种设备尺寸，移动端友好'
      },
      smoothAnimation: {
        title: '流畅动画',
        description: '使用Framer Motion提供流畅的过渡动画效果'
      }
    },
    
    // 错误类型
    errorTypes: {
      badRequest: {
        title: '请求错误',
        description: '请求格式不正确或包含无效参数'
      },
      forbidden: {
        title: '访问被拒绝',
        description: '没有权限访问此页面'
      },
      notFound: {
        title: '页面未找到',
        description: '请求的页面不存在或已被移除'
      },
      serverError: {
        title: '服务器错误',
        description: '服务器遇到意外错误'
      }
    }
  }
};