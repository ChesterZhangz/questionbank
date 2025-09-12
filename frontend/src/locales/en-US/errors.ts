export const errors = {
  // Error page common text
  returnHome: 'Return Home',
  refreshPage: 'Refresh Page',
  
  // 400 Error page
  badRequest: {
    title: 'Bad Request',
    message: 'Sorry, your request format is incorrect or contains invalid parameters.',
    description: 'Please check your request content, ensure all parameters are correct, and try again.'
  },
  
  // 403 Error page
  forbidden: {
    title: 'Access Denied',
    message: 'Sorry, you do not have permission to access this page.',
    description: 'Please confirm you are logged in and have the appropriate access permissions, or contact the administrator for help.'
  },
  
  // 404 Error page
  notFound: {
    title: 'Page Not Found',
    message: 'Sorry, the page you are looking for does not exist or has been removed.',
    description: 'Please check if the URL is correct, or return to the homepage to continue browsing.'
  },
  
  // 500 Error page
  serverError: {
    title: 'Internal Server Error',
    message: 'Sorry, the server encountered an unexpected error and could not complete your request.',
    description: 'Our technical team has received this error report and is working hard to fix it. Please try again later.'
  },
  
  // Game related text
  games: {
    title: 'Mini Games',
    gameInfo: 'Game Instructions:',
    totalScore: 'Total Score',
    challengeYourself: 'Challenge Yourself',
    prepareToStart: 'Prepare to Start Game',
    selectGameType: 'Select game type and click start button to begin the challenge',
    gameEnded: 'This Game Has Ended',
    allGamesEnded: 'All games have ended, click restart button to challenge again',
    clickToRestart: 'Click to Restart',
    startGame: 'Start Game',
    gameDisabled: 'Game Disabled',
    todayGameCount: 'Today\'s Game Count',
    dailyGameCount: 'Today\'s Game Count: {count}/15',
    attentionWork: 'Attention to Work',
    reachedLimit: 'Limit Reached',
    userNotLoggedIn: 'User not logged in',
    cannotGetGameStatus: 'Cannot get game status',
    loginPrompt: 'Login Prompt',
    pleaseLoginFirst: 'Please log in first before using game features',
    gameDisabledTitle: 'Game Disabled',
    gameReminder: 'Game Reminder',
    continueGame: 'Continue playing?',
    playAgain: 'Play again before leaving? Relax and unwind (Chester\'s secret slacking skills!)',
    
    // Game types
    math: {
      title: 'Math Calculation',
      description: 'Quickly calculate math problems to improve calculation ability'
    },
    memory: {
      title: 'Memory Game',
      description: 'Find matching number pairs to exercise memory'
    },
    puzzle: {
      title: 'Number Puzzle',
      description: 'Arrange numbers in order to train logical thinking'
    },
    reaction: {
      title: 'Reaction Speed',
      description: 'Click appearing circles to test reaction speed'
    }
  },
  
  // Error demo page
  demo: {
    title: 'Error Page Demo',
    systemTitle: 'Error Page System',
    systemDescription: 'We have redesigned the error page system to provide better user experience and interactive features. Each error page includes mini games, allowing users to have fun while waiting.',
    selectErrorType: 'Select Error Type for Demo',
    viewDemo: 'View {code} Error Page Demo',
    builtInGames: 'Built-in Mini Game Features',
    
    // Features
    features: {
      modernDesign: {
        title: 'Modern Design',
        description: 'Adopts the latest UI design concepts to provide an elegant user experience'
      },
      responsiveLayout: {
        title: 'Responsive Layout',
        description: 'Perfect adaptation to various device sizes, mobile-friendly'
      },
      smoothAnimation: {
        title: 'Smooth Animation',
        description: 'Uses Framer Motion to provide smooth transition animation effects'
      }
    },
    
    // Error types
    errorTypes: {
      badRequest: {
        title: 'Bad Request',
        description: 'Request format is incorrect or contains invalid parameters'
      },
      forbidden: {
        title: 'Access Denied',
        description: 'No permission to access this page'
      },
      notFound: {
        title: 'Page Not Found',
        description: 'The requested page does not exist or has been removed'
      },
      serverError: {
        title: 'Server Error',
        description: 'Server encountered an unexpected error'
      }
    }
  }
};