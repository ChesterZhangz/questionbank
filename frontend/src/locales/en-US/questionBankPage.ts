// Question Bank Pages related texts - English
export const questionBankPage = {
  // CreateQuestionBankPage - Create Question Bank Page
  CreateQuestionBankPage: {
    // Page titles
    title: 'Create Question Bank',
    description: 'Create a new math question bank',
    
    // Form labels
    form: {
      name: 'Question Bank Name',
      description: 'Description',
      category: 'Category',
      tags: 'Tags',
      settings: 'Question Bank Settings'
    },
    
    // Placeholders
    placeholders: {
      name: 'Enter question bank name',
      description: 'Enter question bank description (optional)',
      category: 'Select question bank category',
      tags: 'Enter tags'
    },
    
    // Settings options
    settings: {
      title: 'Question Bank Settings',
      isPublic: 'Public Question Bank',
      allowCollaboration: 'Allow Collaboration'
    },
    
    // Buttons
    buttons: {
      back: 'Back',
      cancel: 'Cancel',
      create: 'Create Question Bank',
      add: 'Add'
    },
    
    // Error messages
    errors: {
      nameRequired: 'Question bank name is required',
      nameTooLong: 'Question bank name cannot exceed 50 characters',
      descriptionTooLong: 'Description cannot exceed 500 characters',
      createFailed: 'Failed to create question bank'
    }
  },

  // CreateQuestionPage - Create Question Page
  CreateQuestionPage: {
    // Page titles
    title: 'Create Question',
    description: 'Add new questions to the question bank',
    batchTitle: 'Batch Edit Questions',
    batchDescription: 'Edit multiple questions in batch',
    
    // Navigation
    navigation: {
      back: 'Back',
      exitBatch: 'Exit Batch Edit',
      previous: 'Previous',
      next: 'Next'
    },
    
    // Question types
    questionTypes: {
      choice: 'Multiple Choice',
      fill: 'Fill in the Blank',
      solution: 'Solution',
      singleChoice: 'Single Choice',
      multipleChoice: 'Multiple Choice'
    },
    
    // Action buttons
    buttons: {
      save: 'Save Question',
      saving: 'Saving...',
      create: 'Create Question',
      cancel: 'Cancel',
      reset: 'Reset',
      expand: 'Expand',
      collapse: 'Collapse',
      expandTags: 'Expand Tags',
      collapseTags: 'Collapse Tags',
      addOption: 'Add Option'
    },
    
    // Feature buttons
    actions: {
      multiUpload: 'Upload Multiple',
      ocrScan: 'OCR Scan',
      smartAnalysis: 'Smart Analysis',
      analyzing: 'Analyzing...'
    },
    
    // Shortcut hints
    shortcuts: {
      multiMode: '(Ctrl+Shift+M)',
      ocr: '(Ctrl+Shift+O)',
      analysis: '(Ctrl+Shift+A)'
    },
    
    // Tabs
    tabs: {
      stem: 'Question',
      media: 'Graphics',
      solution: 'Solution'
    },
    
    // Form labels
    form: {
      questionContent: 'Question Content',
      options: 'Options Settings',
      answers: 'Answer Settings',
      difficulty: 'Difficulty',
      category: 'Question Type',
      tags: 'Knowledge Tags',
      source: 'Source',
      solution: 'Solution Content'
    },
    
    // Placeholders
    placeholders: {
      questionContent: 'Enter question content',
      solution: 'Enter question solution',
      answer: 'Answer {number}',
      category: 'Select question bank'
    },
    
    // Options settings
    options: {
      title: 'Options Settings',
      questionType: 'Question Type',
      singleChoice: 'Single Choice',
      multipleChoice: 'Multiple Choice',
      autoDetected: 'Auto-detected by system',
      selectedAnswer: 'Selected Answer',
      addOption: 'Add Option',
      removeOption: 'Remove Option',
      select: 'Select Answer',
      unselect: 'Unselect'
    },
    
    // Answer settings
    answers: {
      title: 'Answer Settings',
      fillInstructions: 'Fill in the answers according to the number of \\fill in the question:',
      solutionInstructions: 'Fill in the answers according to the number of \\subp and \\subsubp in the question:',
      fillDescription: 'Fill in the answers according to the number of \\fill in the question:',
      solutionDescription: 'Fill in the answers according to the number of \\subp and \\subsubp in the question:',
      fillAnswer: 'Blank {index}:',
      solutionAnswer: '{label}:',
      fillNumber: 'Blank {number}',
      noFillFound: 'No \\fill found in the question, please add fill-in-the-blank markers first',
      addAnswer: 'Add Answer',
      removeAnswer: 'Remove Answer'
    },
    
    // Media
    media: {
      title: 'Media Management'
    },
    
    // Difficulty levels
    difficulty: {
      title: 'Difficulty',
      veryEasy: 'Very Easy',
      easy: 'Easy',
      medium: 'Medium',
      hard: 'Hard',
      veryHard: 'Very Hard'
    },
    
    // Permission related
    permissions: {
      insufficient: 'Insufficient Permission',
      noPermission: 'You do not have permission to create questions for any question bank. Only creators, managers, or collaborators can create questions.',
      noPermissionForBank: 'You do not have permission to create questions for this question bank. Only creators, managers, or collaborators can create questions.'
    },
    
    // Status messages
    status: {
      hasChanges: 'Unsaved changes',
      detecting: 'Detecting...',
      detectingSimilarity: 'Detecting...',
      similarityWarning: 'Found {count} similar questions ({percentage}%)',
      similarityFound: 'Found {count} similar questions ({percentage}%)',
      loadingBanks: 'Loading question bank information...',
      loadingBanksDesc: 'Getting question bank information, please wait',
      noContent: 'No question content',
      noAvailableBanks: 'Total {total} question banks, {available} available'
    },
    
    // Error messages
    errors: {
      selectBank: 'Please select a question bank first',
      enterContent: 'Please enter question content',
      selectAnswer: 'Please select an answer',
      completeOptions: 'Please complete option content',
      completeFillAnswers: 'Please complete fill-in-the-blank answers',
      completeSolutionAnswers: 'Please complete solution answers',
      saveFailed: 'Error occurred while saving question, please try again',
      loadFailed: 'Failed to get question bank list, please refresh and try again',
      analysisFailed: 'Smart analysis failed, please try again later',
      ocrFailed: 'OCR recognition failed',
      similarityDetectionFailed: 'Similarity detection failed, please try again later'
    },
    
    // Success messages
    success: {
      saved: 'Question saved successfully!',
      analysisComplete: 'Smart analysis completed, relevant attributes have been auto-filled',
      ocrComplete: 'Image recognition completed, content has been auto-filled',
      multiQuestionsGenerated: 'Successfully generated {count} questions!',
      multiQuestionsSaved: 'Multiple questions saved successfully!',
      questionTypeChanged: 'Question type changed!'
    },
    preview: {
      title: 'Question Preview'
    },
  },

  // EditQuestionBankPage - Edit Question Bank Page
  EditQuestionBankPage: {
    // Page titles
    title: 'Edit Question Bank',
    description: 'Modify question bank information',
    
    // Form labels
    form: {
      name: 'Question Bank Name',
      description: 'Description',
      category: 'Category',
      tags: 'Tags'
    },
    
    // Placeholders
    placeholders: {
      name: 'Enter question bank name',
      description: 'Enter question bank description...',
      category: 'Select question bank category',
      tags: 'Enter tags'
    },
    
    // Settings options
    settings: {
      isPublic: 'Public Question Bank (other users can view)',
      allowCollaboration: 'Allow Collaboration (users with same enterprise email can participate)'
    },
    
    // Buttons
    buttons: {
      back: 'Back',
      cancel: 'Cancel',
      save: 'Save Changes',
      add: 'Add'
    },
    
    // Error messages
    errors: {
      nameRequired: 'Question bank name is required',
      updateFailed: 'Failed to update question bank',
      loadFailed: 'Failed to get question bank information',
      notFound: 'Question bank not found'
    }
  },

  // EditQuestionPage - Edit Question Page
  EditQuestionPage: {
    // Page titles
    title: 'Edit Question',
    
    // Navigation
    navigation: {
      back: 'Back to Question Bank',
      previous: 'Previous',
      next: 'Next'
    },
    
    // Question types
    questionTypes: {
      choice: 'Multiple Choice',
      fill: 'Fill in the Blank',
      solution: 'Solution',
      singleChoice: 'Single Choice',
      multipleChoice: 'Multiple Choice'
    },
    
    // Action buttons
    buttons: {
      save: 'Save',
      saving: 'Saving...',
      reset: 'Reset',
      resetting: 'Resetting...',
      addOption: 'Add Option'
    },
    
    // Tabs
    tabs: {
      stem: 'Question',
      media: 'Graphics',
      solution: 'Solution'
    },
    
    // Form labels
    form: {
      questionContent: 'Question Content',
      options: 'Options Settings',
      answers: 'Answer Settings',
      difficulty: 'Difficulty',
      category: 'Question Type',
      tags: 'Knowledge Tags',
      source: 'Source'
    },
    
    // Options settings
    options: {
      title: 'Options Settings',
      questionType: 'Question Type',
      singleChoice: 'Single Choice',
      multipleChoice: 'Multiple Choice',
      autoDetected: 'Auto-detected by system',
      selectedAnswer: 'Selected Answer',
      addOption: 'Add Option',
      removeOption: 'Remove Option',
      select: 'Select Answer',
      unselect: 'Unselect'
    },
    
    // Answer settings
    answers: {
      title: 'Answer Settings',
      fillInstructions: 'Fill in the answers according to the number of \\fill in the question:',
      solutionInstructions: 'Fill in the answers according to the number of \\subp and \\subsubp in the question:',
      fillDescription: 'Fill in the answers according to the number of \\fill in the question:',
      solutionDescription: 'Fill in the answers according to the number of \\subp and \\subsubp in the question:',
      fillAnswer: 'Blank {index}:',
      solutionAnswer: '{label}:',
      fillNumber: 'Blank {number}',
      noFillFound: 'No \\fill found in the question, please add fill-in-the-blank markers first',
      addAnswer: 'Add Answer',
      removeAnswer: 'Remove Answer'
    },
    
    // Difficulty levels
    difficulty: {
        title: 'Difficulty',
      veryEasy: 'Very Easy',
      easy: 'Easy',
      medium: 'Medium',
      hard: 'Hard',
      veryHard: 'Very Hard'
    },
    
    // Status messages
    status: {
      hasChanges: 'Unsaved changes',
      loading: 'Loading question...',
      loadingDesc: 'Getting question information, please wait'
    },
    
    // Confirmation dialogs
    confirm: {
      leave: 'Confirm Leave',
      leaveMessage: 'You have unsaved changes, are you sure you want to leave?',
      reset: 'Confirm Reset',
      resetMessage: 'Are you sure you want to reset all changes?'
    },
    
    // Error messages
    errors: {
      notFound: 'Question not found',
      loadFailed: 'Unable to load question information',
      saveFailed: 'Save failed'
    },
    
    // Success messages
    success: {
      saved: 'Question saved successfully!',
      questionTypeChanged: 'Question type changed successfully!'
    },
    
    // Preview
    preview: {
      title: 'Question Preview',
      noContent: 'No content',
      questionType: 'Question Type',
      difficulty: 'Difficulty Level',
      category: 'Question Category',
      tags: 'Question Tags',
      questionContent: 'Question Content',
      options: 'Options',
      answers: 'Answers',
      solution: 'Solution'
    },
    media: {
      title: 'Graphs and Pictures'
    }
  },

  // QuestionBankDetailPage - Question Bank Detail Page
  QuestionBankDetailPage: {
    // Page title
    title: 'Question Bank Details',
    
    // Buttons
    buttons: {
      back: 'Back',
      addQuestion: 'Add Question',
      editBank: 'Edit Bank',
      manageMembers: 'Manage Members',
      bankSettings: 'Bank Settings',
      statistics: 'Statistics',
      backToList: 'Back to List'
    },
    
    // Info labels
    info: {
      basicInfo: 'Basic Information',
      statistics: 'Statistics',
      categoryTags: 'Category & Tags',
      description: 'Description',
      creator: 'Creator',
      yourRole: 'Your Role',
      status: 'Status',
      questionCount: 'Question Count',
      memberCount: 'Member Count',
      lastUpdated: 'Last Updated',
      category: 'Category',
      tags: 'Tags',
      noDescription: 'No description'
    },
    
    // Roles
    roles: {
      creator: 'Creator',
      manager: 'Manager',
      collaborator: 'Collaborator',
      viewer: 'Viewer'
    },
    
    // Status
    status: {
      public: 'Public',
      private: 'Private',
      deleting: 'Deleting...'
    },
    
    // Questions
    questions: {
      title: 'Question List',
      totalCount: 'Total {count} questions',
      noQuestions: 'No questions yet',
      startAdding: 'Start adding your first question'
    },
    
    // Confirmation dialogs
    confirm: {
      deleteQuestion: 'Confirm Delete',
      deleteQuestionMessage: 'Are you sure you want to delete this question? This action cannot be undone.'
    },
    
    // Success messages
    success: {
      deleted: 'Deleted Successfully',
      questionDeleted: 'Question deleted successfully',
      favorited: 'Favorited Successfully',
      addedToFavorites: 'Added to favorites',
      removedFromFavorites: 'Removed from favorites'
    },
    
    // Error messages
    errors: {
      notFound: 'Question bank not found',
      loadFailed: 'Failed to load question bank information',
      deleteFailed: 'Delete failed',
      favoriteFailed: 'Favorite failed',
      favoriteFailedMessage: 'Favorite operation failed, please try again'
    }
  },

  // QuestionBankListPage - Question Bank List Page
  QuestionBankListPage: {
    // Page title
    title: 'My Question Banks',
    description: 'Manage your math question banks',
    
    // Buttons
    buttons: {
      createBank: 'Create Bank',
      viewBank: 'View Bank',
      editBank: 'Edit Bank',
      manageMembers: 'Manage Members',
      deleteBank: 'Delete Bank'
    },
    
    // Statistics
    stats: {
      totalBanks: 'Total Banks: {count}',
      questionCount: '{count} questions',
      memberCount: '{count} members'
    },
    
    // Info labels
    info: {
      uncategorized: 'Uncategorized',
      lastUpdated: 'Last Updated'
    },
    
    // Roles
    roles: {
      creator: 'Creator',
      manager: 'Manager',
      collaborator: 'Collaborator',
      viewer: 'Viewer'
    },
    
    // Empty state
    empty: {
      noBanks: 'No question banks yet',
      startCreating: 'Create your first question bank to start managing math questions'
    },
    
    // Confirmation dialogs
    confirm: {
      deleteBank: 'Confirm Delete',
      deleteBankMessage: 'Are you sure you want to delete this question bank? This action cannot be undone.'
    },
    
    // Status
    status: {
      deleting: 'Deleting...'
    },
    
    // Success messages
    success: {
      deleted: 'Deleted Successfully',
      bankDeleted: 'Question bank deleted successfully'
    },
    
    // Error messages
    errors: {
      loadFailed: 'Failed to load question bank list',
      deleteFailed: 'Delete failed'
    }
  },

  // QuestionBankMembersPage - Question Bank Members Management Page
  QuestionBankMembersPage: {
    // Page title
    title: 'Member Management',
    
    // Buttons
    buttons: {
      back: 'Back',
      addMember: 'Add Member',
      cancel: 'Cancel',
      addMembers: 'Add {count} Members'
    },
    
    // Statistics
    stats: {
      creator: 'Creator',
      manager: 'Manager',
      collaborator: 'Collaborator',
      viewer: 'Viewer'
    },
    
    // Search and filter
    search: {
      placeholder: 'Search member name or email...'
    },
    
    filter: {
      allRoles: 'All Roles',
      placeholder: 'Filter by Role'
    },
    
    // Member list
    members: {
      title: 'Member List',
      selectAll: 'Select All',
      deselectAll: 'Deselect All',
      batchDelete: 'Batch Delete ({count})',
      noMembers: 'No members',
      unknownUser: 'Unknown User'
    },
    
    // Roles
    roles: {
      creator: 'Creator',
      manager: 'Manager',
      collaborator: 'Collaborator',
      viewer: 'Viewer',
      enterpriseViewer: 'Enterprise Viewer',
      unknown: 'Unknown',
      viewerDescription: 'Can only view question bank content',
      collaboratorDescription: 'Can add and edit questions',
      managerDescription: 'Can manage question bank and members'
    },
    
    // Add member modal
    addMember: {
      title: 'Add Member',
      searchUser: 'Search User',
      searchPlaceholder: 'Enter user name or email to search...',
      searchDescription: 'Can search all registered users, no email suffix restrictions',
      searchResults: 'Search Results (Click to select user)',
      selectedUsers: 'Selected Users ({count})',
      assignRole: 'Assign Role',
      selectRole: 'Select Role'
    },
    
    // Confirmation dialogs
    confirm: {
      removeMember: 'Confirm Removal',
      removeMemberMessage: 'Are you sure you want to remove this member?',
      batchRemoveMembers: 'Batch Remove Members',
      batchRemoveMembersMessage: 'Are you sure you want to remove {count} selected members?'
    },
    
    // Status
    status: {
      removing: 'Removing...',
      deleting: 'Deleting...'
    },
    
    // Success messages
    success: {
      removed: 'Removed Successfully',
      memberRemoved: 'Member removed successfully',
      batchRemoved: 'Batch Removal Successful',
      batchRemovedMessage: 'Successfully removed {count} members',
      batchRemovedPartial: 'Batch Removal Completed',
      batchRemovedPartialMessage: 'Successfully removed {successCount} members, {failCount} failed',
      added: 'Added Successfully',
      addedMessage: 'Successfully added {count} members',
      addedPartial: 'Addition Completed',
      addedPartialMessage: 'Successfully added {successCount} members, {failCount} failed'
    },
    
    // Error messages
    errors: {
      loadFailed: 'Failed to load question bank information',
      removeFailed: 'Removal failed',
      removeMemberFailed: 'Failed to remove member',
      changeRoleFailed: 'Change failed',
      changeRoleFailedMessage: 'Failed to change role',
      batchRemoveFailed: 'Batch removal failed',
      batchRemoveFailedMessage: 'Failed to batch remove members',
      addFailed: 'Addition failed',
      addMemberFailed: 'Failed to add member'
    }
  },

  // QuestionBankSettingsPage - Question Bank Settings Page
  QuestionBankSettingsPage: {
    // Page title
    title: 'Question Bank Settings',
    
    // Buttons
    buttons: {
      back: 'Back',
      save: 'Save Settings',
      saving: 'Saving...',
      backToList: 'Back to List'
    },
    
    // Loading state
    loading: {
      title: 'Loading Question Bank Settings...',
      description: 'Getting question bank configuration information, please wait'
    },
    
    // Tabs
    tabs: {
      basic: 'Basic Information',
      permissions: 'Permission Settings',
      advanced: 'Advanced Settings'
    },
    
    // Permissions
    permissions: {
      currentRole: 'Your current role is {role}, ',
      onlyCreatorsAndManagers: 'only creators and managers can modify question bank settings.'
    },
    
    // Roles
    roles: {
      creator: 'Creator',
      manager: 'Manager',
      collaborator: 'Collaborator',
      viewer: 'Viewer'
    },
    
    // Basic information
    basicInfo: {
      title: 'Basic Information',
      name: 'Question Bank Name',
      namePlaceholder: 'Enter question bank name',
      description: 'Question Bank Description',
      descriptionPlaceholder: 'Enter question bank description',
      category: 'Question Bank Category',
      categoryPlaceholder: 'Select question bank category',
      characterCount: '{current}/{max} characters'
    },
    
    // Tag management
    tags: {
      title: 'Tag Management',
      addTag: 'Add Tag',
      addTagPlaceholder: 'Enter tag',
      add: 'Add',
      currentTags: 'Current Tags ({count})',
      noTags: 'No tags'
    },
    
    // Card color settings
    cardColor: {
      title: 'Card Color Settings',
      cardColor: 'Question Bank Card Color',
      description: 'Customize the color of question bank name, icon and tags to make your question bank more personalized',
      preview: 'Preview Effect',
      reset: 'Reset',
      colorFormat: 'Supports hexadecimal color values, such as #4f46e5, #ff6b6b, etc.'
    },
    
    // Permission settings
    permissionSettings: {
      title: 'Permission Settings',
      accessControl: 'Access Control',
      publicBank: 'Public Question Bank',
      publicDescription: 'All users can view this question bank',
      privateDescription: 'Only members can view this question bank',
      allowCollaboration: 'Allow Collaboration',
      collaborationEnabled: 'Members can add and edit questions',
      collaborationDisabled: 'Only creators and managers can edit questions',
      memberManagement: 'Member Management',
      permissionDescription: 'Permission Description',
      creatorPermissions: 'Creator: Has all permissions, can delete question bank',
      managerPermissions: 'Manager: Can manage members and settings',
      collaboratorPermissions: 'Collaborator: Can add and edit questions',
      viewerPermissions: 'Viewer: Can only view question content'
    },
    
    // Advanced settings
    advanced: {
      title: 'Advanced Settings',
      dataManagement: 'Data Management',
      questionLimit: 'Question Count Limit',
      questionLimitPlaceholder: 'No limit',
      questionLimitDescription: 'Leave empty to indicate no limit on question count',
      exportTemplate: 'Export Template'
    },
    
    // Success messages
    success: {
      saved: 'Saved Successfully',
      settingsSaved: 'Settings saved successfully'
    },
    
    // Error messages
    errors: {
      loadFailed: 'Failed to load question bank information',
      insufficientPermissions: 'Insufficient Permissions',
      insufficientPermissionsMessage: 'Only creators and managers can modify question bank settings',
      saveFailed: 'Save Failed',
      saveBasicFailed: 'Failed to save basic information',
      saveAdvancedFailed: 'Failed to save advanced settings'
    }
  },

  // QuestionBankStatsPage - Question Bank Statistics Analysis Page
  QuestionBankStatsPage: {
    title: 'Statistics Analysis',
    subtitle: 'Deep dive into question bank usage and data quality',
    lastUpdate: 'Last Update',
    refreshingData: 'Refreshing data...',
    buttons: {
      back: 'Back',
      retry: 'Retry',
      retrying: 'Retrying...',
      refresh: 'Refresh',
      refreshing: 'Refreshing',
      exportReport: 'Export Report'
    },
    tabs: {
      overview: 'Overview',
      questions: 'Question Statistics',
      usage: 'Usage',
      members: 'Member Activity'
    },
    stats: {
      totalQuestions: 'Total Questions',
      totalViews: 'Total Views',
      activeMembers: 'Active Members',
      averageDifficulty: 'Average Difficulty',
      monthlyAverageViews: 'Monthly Average Views',
      averageViewsPerQuestion: 'Average Views per Question',
      highestSingleQuestionViews: 'Highest Single Question Views'
    },
    charts: {
      questionTypeDistribution: 'Question Type Distribution',
      qualityAnalysis: 'Quality Analysis',
      recentActivity: 'Recent Activity',
      difficultyDistribution: 'Difficulty Distribution',
      popularQuestions: 'Popular Questions TOP 5',
      visitTrend: 'Visit Trend',
      lastSixMonthsStats: 'Last 6 months visit statistics',
      memberActivity: 'Member Activity'
    },
    questionTypes: {
      choice: 'Multiple Choice',
      fill: 'Fill in the Blank',
      multipleChoice: 'Multiple Choice',
      solution: 'Solution'
    },
    difficulty: {
      easy: 'Easy (1-2 stars)',
      medium: 'Medium (3 stars)',
      hard: 'Hard (4-5 stars)'
    },
    quality: {
      tagCoverage: 'Tag Coverage',
      duplicateRate: 'Duplicate Rate',
      averageDifficulty: 'Average Difficulty',
      questionCompleteness: 'Question Completeness'
    },
    members: {
      unknownUser: 'Unknown User'
    },
    units: {
      questions: 'questions'
    },
    time: {
      unknown: 'Unknown',
      today: 'Today',
      yesterday: 'Yesterday',
      daysAgo: '{days} days ago',
      weeksAgo: '{weeks} weeks ago'
    },
    dataQuality: {
      title: 'Data Quality Warning',
      tagCoverageAnomaly: 'Tag coverage anomaly: {value}%',
      duplicateRateAnomaly: 'Duplicate rate anomaly: {value}%',
      averageDifficultyAnomaly: 'Average difficulty anomaly: {value}',
      totalQuestionsAnomaly: 'Total questions anomaly: {value}'
    },
    errors: {
      loadFailed: 'Load Failed',
      cannotLoadStats: 'Cannot load statistics data',
      loadFailedRetry: 'Failed to get statistics data, please try again later'
    }
  },

  // BatchUploadPage - Intelligent Batch Upload Page
  BatchUploadPage: {
    title: 'Intelligent Batch Upload',
    subtitle: 'AI-driven document intelligent parsing, supports PDF, TeX one-click question recognition and batch import to question bank',
    buttons: {
      history: 'History',
      draftManager: 'Draft Manager'
    },
    stats: {
      uploaded: 'Uploaded',
      recognizedQuestions: 'Recognized Questions'
    },
    statsCards: {
      uploadedDocuments: 'Uploaded Documents',
      recognizedQuestions: 'Recognized Questions',
      aiProcessing: 'AI Processing',
      questionDrafts: 'Question Drafts'
    },
    units: {
      documents: 'documents',
      questions: 'questions'
    },
    upload: {
      title: 'Document Upload',
      subtitle: 'Supports PDF, TeX formats, drag and drop or click to upload',
      dropToUpload: 'Release files to start uploading',
      dragOrClick: 'Drag files here or click to upload',
      supportedFormats: 'Supports PDF, TeX formats, single file max 50MB',
      selectFiles: 'Select Files'
    },
    documentManagement: {
      title: 'Document Management',
      summary: 'Total {total} documents, {completed} completed, {processing} processing',
      totalProgress: 'Total Progress',
      estimatedRemaining: 'Estimated Remaining'
    },
    history: {
      title: 'Upload History',
      totalRecords: 'Total {count} records',
      recentRecords: 'Recent {count} records',
      clearAll: 'Clear All',
      noRecords: 'No History Records',
      noRecordsDescription: 'Uploaded and processed documents will be automatically saved here',
      restore: 'Restore',
      details: 'Details',
      storageInfo: 'History records are saved in local storage',
      maxRecords: 'Maximum 50 records retained'
    },
    confirm: {
      title: 'Confirm Operation',
      cancelProcessing: 'Are you sure you want to cancel processing this document?',
      deleteDocument: 'Are you sure you want to delete this document? This action cannot be undone.',
      clearHistory: 'Clear History',
      clearHistoryMessage: 'Are you sure you want to clear all history records and current session? This will clear all uploaded files and questions.',
      deleteHistoryRecord: 'Delete History Record',
      deleteHistoryRecordMessage: 'Are you sure you want to delete history record "{fileName}"?'
    },
    errors: {
      loadFailed: 'Load Failed',
      loadDocumentStateFailed: 'Failed to load current document state',
      loadQuestionStateFailed: 'Failed to load current question state',
      loadGlobalStateFailed: 'Failed to load global processing state',
      loadHistoryFailed: 'Failed to load history records',
      fileTooLarge: 'File Too Large',
      fileSizeExceeded: 'File size cannot exceed {maxSize}MB, current file size: {currentSize}MB',
      processingFailed: 'Processing Failed',
      fileProcessingFailed: 'File processing failed, please try again',
      invalidFileType: 'Invalid File Type',
      unsupportedFileType: 'Unsupported file type: {fileName}',
      retryFailed: 'Retry Failed',
      maxRetriesReached: 'Maximum retry attempts reached'
    }
  },

  // QuestionPreviewPage - Question Preview Page
  QuestionPreviewPage: {
    buttons: {
      backToBatchUpload: 'Back to Batch Upload',
      viewOtherDrafts: 'View Other Drafts'
    },
    emptyState: {
      draftCleared: 'Draft Cleared',
      draftClearedMessage: 'All questions have been deleted, draft has been automatically cleaned'
    },
    leaveConfirm: {
      message: 'You have unsaved questions, are you sure you want to leave?',
      suggestion: 'You have unsaved questions, it is recommended to save the draft before leaving'
    },
    notifications: {
      dataLoaded: 'Data Loaded',
      dataLoadedMessage: 'Loaded {count} questions, please save the draft in time',
      setSourceSuccess: 'Set Success',
      setSourceSuccessMessage: 'Set source for {count} questions',
      startAnalysis: 'Start Analysis',
      analyzingQuestions: 'Analyzing {count} questions, please wait...',
      operationSuccess: 'Operation Success',
      analysisCompleted: 'Completed AI analysis for {count} questions',
      answerGenerationCompleted: 'Answer Generation Completed',
      answerGenerationCompletedMessage: 'Generated answers and solutions for {count} low-difficulty questions',
      singleAnalysisCompleted: 'AI analysis completed, applied to question',
      singleAnswerGenerationCompleted: 'Generated answers and solutions for the question',
      questionSplitSuccess: 'Split question into {count} new questions',
      questionUpdatedAutoSaved: 'Question updated successfully, auto-saved',
      questionUpdated: 'Question updated successfully',
      questionDeleted: 'Question deleted successfully',
      batchDeleteSuccess: 'Deleted {count} questions',
      batchMoveSuccess: 'Moved {count} questions',
      saveSuccess: 'Save Success',
      saveSuccessMessage: 'Successfully saved {count} questions to question bank'
    },
    errors: {
      initFailed: 'Initialization Failed',
      initFailedMessage: 'Page initialization failed, please refresh and try again',
      selectionError: 'Selection Error',
      pleaseSelectQuestions: 'Please select questions first',
      setSourceFailed: 'Set Failed',
      setSourceFailedMessage: 'Batch set source failed',
      operationFailed: 'Operation Failed',
      batchAnalysisFailed: 'Batch AI analysis failed',
      singleAnalysisFailed: 'AI analysis failed',
      questionSplitFailed: 'Question split failed',
      questionIdNotFound: 'Question ID not found, cannot save',
      saveEditFailed: 'Save edit failed',
      questionDeleteFailed: 'Question delete failed',
      batchDeleteFailed: 'Batch delete failed',
      targetQuestionNotFound: 'Target question not found',
      batchMoveFailed: 'Batch move failed',
      dataValidationFailed: 'Data Validation Failed',
      dataValidationFailedMessage: 'Please check the data integrity of the following questions:\n\n{details}',
      savePartialFailure: 'Save completed with partial failures',
      savePartialFailureMessage: 'Successfully saved {savedCount} questions, failed {failedCount} questions.\n\nFailure details:\n{details}',
      saveQuestionsFailed: 'Save questions failed'
    },
    confirm: {
      delete: {
        title: 'Confirm Delete',
        message: 'Are you sure you want to delete the selected {count} questions? This action cannot be undone.',
        confirmText: 'Delete',
        cancelText: 'Cancel'
      },
      leave: {
        title: 'Confirm Leave',
        message: 'You have unsaved questions, are you sure you want to leave? Unsaved changes will be lost.',
        confirmText: 'Leave',
        cancelText: 'Cancel'
      }
    }
  },

  // QuestionViewPage - Question View Page
  QuestionViewPage: {
    title: 'View Question',
    subtitle: 'Question details and related questions',
    loading: {
      title: 'Loading...',
      description: 'Getting question information, please wait'
    },
    buttons: {
      back: 'Back',
      backToQuestionList: 'Back to Question List',
      edit: 'Edit',
      delete: 'Delete',
      previous: 'Previous',
      next: 'Next'
    },
    sections: {
      stem: 'Question Stem',
      imagesAndGraphics: 'Question Images and Graphics',
      images: 'Images',
      graphics: 'Graphics',
      options: 'Options',
      multipleOptions: 'Options (Multiple Choice)',
      answer: 'Answer',
      solution: 'Solution'
    },
    sidebar: {
      basicInfo: 'Basic Information',
      questionType: 'Question Type',
      subType: 'Sub Type',
      difficultyLevel: 'Difficulty Level',
      viewCount: 'View Count',
      questionSource: 'Question Source',
      createdAt: 'Created At',
      updatedAt: 'Updated At',
      knowledgeTags: 'Knowledge Tags',
      creator: 'Creator',
      name: 'Name',
      email: 'Email'
    },
    questionTypes: {
      choice: 'Multiple Choice',
      multipleChoice: 'Multiple Choice',
      fill: 'Fill in the Blank',
      solution: 'Solution'
    },
    difficulty: {
      veryEasy: 'Very Easy',
      easy: 'Easy',
      medium: 'Medium',
      hard: 'Hard',
      veryHard: 'Very Hard',
      unknown: 'Unknown'
    },
    actions: {
      clickToViewLarge: 'Click to view large image'
    },
    keyboardShortcuts: {
      navigation: 'Use ← → keys to switch questions, ',
      edit: 'Ctrl+E to edit question'
    },
    notifications: {
      deleteSuccess: 'Delete Success',
      deleteSuccessMessage: 'Question deleted successfully'
    },
    errors: {
      getQuestionFailed: 'Failed to get question',
      questionNotFound: 'Question not found',
      deleteFailed: 'Delete Failed',
      deleteFailedMessage: 'Delete failed'
    },
    confirm: {
      delete: {
        title: 'Confirm Delete',
        message: 'Are you sure you want to delete this question?'
      }
    }
  },

  // Utils - Utility translations
  utils: {
    // ErrorHandler - Error handler
    errorHandler: {
      messages: {
        NETWORK_ERROR: 'Network connection error, please check your network settings',
        VALIDATION_ERROR: 'Input data validation failed, please check your input',
        AUTHENTICATION_ERROR: 'Authentication failed, please log in again',
        AUTHORIZATION_ERROR: 'Insufficient permissions, cannot access this resource',
        NOT_FOUND_ERROR: 'Requested resource not found',
        SERVER_ERROR: 'Internal server error, please try again later',
        UNKNOWN_ERROR: 'Unknown error occurred, please try again later',
        networkTimeout: 'Network connection timeout',
        unhandledPromiseError: 'Unhandled Promise error',
        javaScriptError: 'JavaScript error'
      }
    },

    // PasswordValidator - Password validator
    passwordValidator: {
      errors: {
        tooShort: 'Password must be at least 8 characters long',
        tooLong: 'Password cannot exceed 20 characters',
        containsUsername: 'Password cannot contain username-related content',
        containsEmail: 'Password cannot contain email-related content',
        containsBirthDate: 'Password cannot contain birth date format (e.g., 19990101, 1999/01/01, etc.)',
        consecutiveRepeats: 'Password cannot contain three consecutive identical characters or numbers',
        tooSimple: 'Password is too simple, please use a more complex password'
      },
      strength: {
        weak: 'Weak',
        medium: 'Medium',
        strong: 'Strong',
        unknown: 'Unknown'
      }
    },

    // TimezoneUtils - Timezone utilities
    timezoneUtils: {
      names: {
        'Asia_Shanghai': 'China Standard Time',
        'Asia_Hong_Kong': 'Hong Kong Time',
        'Asia_Taipei': 'Taipei Time',
        'Asia_Tokyo': 'Japan Standard Time',
        'Asia_Seoul': 'Korea Standard Time',
        'Asia_Singapore': 'Singapore Time',
        'Asia_Bangkok': 'Bangkok Time',
        'Asia_Kolkata': 'India Time',
        'Asia_Dubai': 'Dubai Time',
        'America_New_York': 'Eastern Time',
        'America_Chicago': 'Central Time',
        'America_Denver': 'Mountain Time',
        'America_Los_Angeles': 'Pacific Time',
        'America_Toronto': 'Toronto Time',
        'America_Vancouver': 'Vancouver Time',
        'Europe_London': 'Greenwich Mean Time',
        'Europe_Paris': 'Central European Time',
        'Europe_Berlin': 'Central European Time',
        'Europe_Moscow': 'Moscow Time',
        'Australia_Sydney': 'Australian Eastern Time',
        'Australia_Perth': 'Australian Western Time',
        'Pacific_Auckland': 'New Zealand Standard Time',
        'Pacific_Fiji': 'Fiji Time'
      }
    }
  },

  // QuestionEditor - Question Editor
  questionEditor: {
    // Question bank info
    questionBank: 'Question Bank',
    questionId: 'Question ID',
    
    // Question types
    questionType: 'Question Type',
    singleChoice: 'Single Choice',
    multipleChoice: 'Multiple Choice',
    fillInBlank: 'Fill in the Blank',
    solution: 'Solution',
    
    // Question content
    questionContent: 'Question Content',
    solutionContent: 'Solution',
    quickEditTitle: 'Quick Edit Question Content',
    quickEditSolution: 'Quick Edit Solution',
    clickToEdit: 'Click to edit question content',
    clickToEditSolution: 'Click to edit solution content',
    clickToAddContent: 'Click here to add question content',
    clickToAddSolution: 'Click here to add solution content',
    inputQuestionContent: 'Enter question content, supports LaTeX formulas and custom tags...',
    inputSolutionContent: 'Enter solution content, supports LaTeX formulas and custom tags...',
    save: 'Save',
    cancel: 'Cancel',
    
    // Options
    options: 'Options',
    addOption: 'Add Option',
    saveOption: 'Save Option',
    cancelOption: 'Cancel Option',
    editOption: 'Edit Option',
    deleteOption: 'Delete Option',
    optionPreview: 'Option {letter} Preview',
    noContent: 'No Content',
    latexError: 'LaTeX Error',
    
    // Answer
    answer: 'Answer',
    fillAnswers: 'Fill-in-the-blank Answers ({count} blanks)',
    solutionAnswers: 'Solution Answers',
    fillAnswerPlaceholder: 'Answer for blank {number}',
    solutionAnswerPlaceholder: 'Answer for question {number}',
    inputAnswer: 'Enter answer',
    
    // Question attributes
    questionAttributes: 'Question Attributes',
    difficulty: 'Difficulty',
    category: 'Category',
    source: 'Source',
    knowledgeTags: 'Knowledge Tags',
    inputCategory: 'Enter question category',
    inputSource: 'Enter question source',
    inputKnowledgeTag: 'Enter knowledge tag',
    selectPresetTags: 'Select Preset Tags',
    
    // Action buttons
    cancelQuestion: 'Cancel',
    saveQuestion: 'Save Question',
    
    // Preset knowledge tags
    presetKnowledgeTags: [
      'Function', 'Derivative', 'Integral', 'Limit', 'Sequence', 'Probability', 'Statistics', 'Geometry', 'Algebra', 'Trigonometry',
      'Vector', 'Matrix', 'Complex Number', 'Inequality', 'Equation', 'Analytic Geometry', 'Solid Geometry'
    ]
  },

  // QuestionTypeSelector - Question Type Selector
  questionTypeSelector: {
    title: 'Question Type Selection',
    placeholder: 'Enter question type name (select up to {maxCount})',
    hint: 'Please select from preset options or enter question type name',
    selectLimit: 'Selection Limit',
    maxTypesReached: 'Can only select up to {maxCount} question types',
    duplicateType: 'Duplicate Type',
    typeExists: 'This type already exists',
    add: 'Add'
  },

  // KnowledgeTagSelector - Knowledge Tag Selector
  knowledgeTagSelector: {
    title: 'Knowledge Tags',
    placeholder: 'Enter knowledge tag (select up to {maxCount})',
    hint: 'Please select or enter knowledge tags',
    selectLimit: 'Selection Limit',
    maxTagsReached: 'Can only select up to {maxCount} tags',
    duplicateTag: 'Duplicate Tag',
    tagExists: 'This tag already exists',
    add: 'Add',
    categories: {
      mathBasic: 'Basic Mathematics',
      advancedMath: 'Advanced Mathematics',
      middleSchoolMath: 'Middle School Mathematics'
    }
  },

  // QuestionSourceSelector - Question Source Selector
  questionSourceSelector: {
    title: 'Question Source',
    placeholder: 'Enter question source information',
    recentYears: 'Recent Years',
    searchTemplates: 'Search quick templates...',
    totalTemplates: 'Total {count} templates',
    foundMatches: ', found {count} matches',
    usageExample: 'Usage Example:',
    year: 'Year',
    grade: 'Grade',
    examType: 'Exam Type',
    questionNumber: 'Question Number'
  }
};
