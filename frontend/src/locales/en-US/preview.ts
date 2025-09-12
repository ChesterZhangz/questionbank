export const preview = {
  // QuestionSavePanel component
  questionSavePanel: {
    title: 'Save Questions to Question Bank',
    saving: 'Saving questions...',
    saveProgress: 'Progress: {progress}%',
    selectedCount: 'Preparing to save {count} questions',
    selectBank: 'Select Target Question Bank',
    selectBankPlaceholder: 'Please select a question bank to save to',
    subtitle: 'Save Instructions:',
    description1: 'Questions will be saved to the selected question bank',
    description2: 'Viewable in Question Bank Management after saving',
    description3: 'Do not close the page during saving',
    saveButton: 'Confirm Save'
  },

  // AIAnalysisPanel component
  aiAnalysisPanel: {
    title: 'AI Smart Analysis',
    subtitle: 'AI smart analysis will be performed on the selected',
    selectedCount: '{count} questions, including:',
    feature1: 'Automatic identification of question difficulty level',
    feature2: 'Intelligent generation of knowledge point tags',
    feature3: 'Automatic classification of question types',
    feature4: 'Provision of analysis confidence',
    notesTitle: 'Notes:',
    note1: 'AI analysis takes some time, please wait patiently',
    note2: 'Analysis results are for reference only, manual review is recommended',
    note3: 'Analyzing a large number of questions may take a long time',
    analyzing: 'Analyzing...',
    analyzeButton: 'Start Analysis'
  },

  // BatchMoveModal component
  batchMoveModal: {
    title: 'Batch Move Questions',
    selectedCount: 'Selected Questions ({count})',
    moveTarget: 'Move to',
    moveTargetPlaceholder: 'Select target question',
    movePosition: 'Move Position',
    moveBefore: 'Move before selected question',
    moveAfter: 'Move after selected question',
    moveButton: 'Confirm Move',
    noQuestionsSelected: 'Please select questions to move',
    noTargetSelected: 'Please select a target question'
  },

  // QuestionPreviewStats component
  questionPreviewStats: {
    total: 'Total Questions',
    selected: 'Selected',
    analyzed: 'Analyzed',
    questions: 'questions',
    byType: 'By Type',
    byDifficulty: 'By Difficulty',
    byStatus: 'By Status'
  },

  // QuestionList component
  questionList: {
    noQuestions: 'No questions available',
    loading: 'Loading...',
    errorLoading: 'Failed to load questions'
  },

  // QuestionGrid component
  questionGrid: {
    noQuestions: 'No questions available',
    loading: 'Loading...',
    errorLoading: 'Failed to load questions'
  },

  // QuestionPreviewHeader component
  questionPreviewHeader: {
    backToUpload: 'Back to Upload',
    title: 'Question Preview & Edit',
    draftManager: 'Draft Manager',
    totalQuestions: 'Total Questions',
    selectedQuestions: 'Selected {count} questions'
  },

  // QuestionPreviewToolbar component
  questionPreviewToolbar: {
    grid: 'Grid',
    list: 'List',
    selectAll: 'Select All',
    deselectAll: 'Deselect All',
    setSource: 'Set Source',
    aiAnalysis: 'AI Analysis',
    analyzing: 'Analyzing...',
    batchMove: 'Batch Move',
    save: 'Save',
    delete: 'Delete',
    searchPlaceholder: 'Search question content...',
    filter: 'Filter',
    reset: 'Reset',
    sortPlaceholder: 'Select sort method',
    questionType: 'Question Type',
    difficulty: 'Difficulty Level',
    tags: 'Tags',
    source: 'Source'
  },

  // QuestionEditModal component
  questionEditModal: {
    title: 'Edit Question',
    showPreview: 'Show Preview',
    hidePreview: 'Hide Preview',
    basicInfo: 'Basic Information',
    questionContent: 'Question Content',
    media: 'Images & Graphics',
    answer: 'Answer & Solution',
    category: 'Category & Tags',
    sourceInfo: 'Source Information',
    questionTypeLabel: 'Question Type',
    difficultyLabel: 'Difficulty Level',
    stem: 'Stem',
    options: 'Options',
    fillAnswers: 'Fill-in Answers',
    solutionAnswers: 'Solution Answers',
    solution: 'Solution',
    categoryLabel: 'Question Category',
    tagsLabel: 'Knowledge Tags',
    sourceLabel: 'Question Source',
    sourcePlaceholder: 'Enter question source, e.g., 2025 Shanghai High School Midterm',
    addOption: 'Add Option',
    correctAnswer: 'Correct Answer',
    fillAnswer: 'Answer {index}',
    solutionAnswer: 'Answer {label}',
    validation: {
      stemRequired: 'Stem cannot be empty',
      minOptions: 'At least 2 options required for multiple choice',
      correctOptionRequired: 'At least one correct answer required',
      emptyOptions: 'Options cannot be empty',
      minFillAnswers: 'At least one fill-in answer required',
      emptyFillAnswers: 'Fill-in answers cannot be empty',
      minSolutionAnswers: 'At least one solution step required',
      emptySolutionAnswers: 'Solution answers cannot be empty',
      maxCategory: 'Maximum 3 categories allowed',
      maxTags: 'Maximum 5 tags allowed'
    },
    preview: {
      title: 'Live Preview',
      stem: 'Stem',
      options: 'Options',
      fillAnswers: 'Fill-in Answers',
      solutionAnswers: 'Solution Answers',
      solution: 'Solution',
      source: 'Source'
    }
  },

  // SortableQuestionCard component
  sortableQuestionCard: {
    questionNumber: 'Question {number}',
    type: 'Type',
    difficultyLabel: 'Difficulty',
    source: 'Source',
    tags: 'Tags',
    answer: 'Answer',
    solution: 'Solution',
    unknownSource: 'Unknown Source',
    questionType: {
      choice: 'Single Choice',
      multipleChoice: 'Multiple Choice',
      fill: 'Fill in the Blank',
      solution: 'Solution',
      unknown: 'Unknown'
    },
    difficulty: {
      easy: 'Easy',
      mediumEasy: 'Medium Easy',
      medium: 'Medium',
      mediumHard: 'Medium Hard',
      hard: 'Hard'
    },
    actions: {
      edit: 'Edit',
      analyze: 'Analyze',
      split: 'Split',
      delete: 'Delete'
    },
    analyzing: 'Analyzing...',
    answerGenerating: 'Generating answer...'
  },

  // SourceSettingPanel component
  sourceSettingPanel: {
    title: 'Set Question Source',
    selectedCount: 'Selected {count} questions',
    source: 'Source',
    sourcePlaceholder: 'Enter question source',
    save: 'Save',
    cancel: 'Cancel'
  },

  // DraftManager component
  draftManager: {
    title: 'Question Set Drafts',
    currentDraft: 'Current Draft: {name}',
    notInDraftMode: 'Not in draft mode',
    saveCurrent: 'Save current question set as draft',
    noQuestionsToSave: 'No questions to save',
    noQuestionsHint: 'Please upload documents or load drafts first',
    draftName: 'Draft Name',
    draftNamePlaceholder: 'Enter draft name',
    description: 'Description (Optional)',
    descriptionPlaceholder: 'Enter draft description',
    save: 'Save',
    cancel: 'Cancel',
    draftList: 'Draft List ({count})',
    loadingDrafts: 'Loading drafts...',
    noDrafts: 'No drafts available',
    noDraftsHint: 'Drafts will appear here after saving question sets',
    questionCount: '{count} questions',
    lastModified: 'Last Modified',
    load: 'Load',
    currentDraftStatus: 'Current Draft',
    loading: 'Loading...',
    rename: 'Rename',
    edit: 'Edit',
    delete: 'Delete',
    deleting: 'Deleting...',
    saveRename: 'Save',
    cancelRename: 'Cancel',
    confirmDelete: 'Confirm Delete',
    confirmDeleteMessage: 'Are you sure you want to delete draft "{name}"?',
    confirmLoad: 'Confirm Load',
    confirmLoadMessage: 'You have unsaved drafts. Are you sure you want to load another draft?',
    confirmOverwrite: 'Confirm Overwrite',
    confirmOverwriteMessage: 'A highly similar question set to draft "{name}" has been detected.\n\nSimilarity: {similarity}%\n\nDo you want to overwrite the existing draft?\n\nNote: This will update the content of draft "{name}" instead of creating a new draft.',
    inputError: 'Input Error',
    inputErrorMessage: 'Please enter a draft name',
    saveFailed: 'Save Failed',
    saveFailedMessage: 'No questions to save',
    updateSuccess: 'Update Successful',
    updateSuccessMessage: 'Draft "{name}" updated',
    updateFailed: 'Update Failed',
    updateFailedMessage: 'Failed to update draft, please try again',
    saveSuccess: 'Save Successful',
    saveSuccessMessage: 'Draft "{name}" saved successfully',
    loadSuccess: 'Load Successful',
    loadSuccessMessage: 'Draft "{name}" loaded successfully',
    loadFailed: 'Load Failed',
    loadFailedMessage: 'Failed to load draft, please try again',
    deleteSuccess: 'Delete Successful',
    deleteSuccessMessage: 'Draft deleted successfully',
    deleteFailed: 'Delete Failed',
    deleteFailedMessage: 'Failed to delete draft, please try again',
    renameSuccess: 'Rename Successful',
    renameSuccessMessage: 'Draft renamed successfully',
    nameExists: 'Name Exists',
    nameExistsMessage: 'Draft name already exists',
    invalidId: 'Rename Failed',
    invalidIdMessage: 'Invalid draft ID',
    cloudStorage: 'Drafts are saved in cloud database',
    dataSecurity: 'Data is secure and reliable, supports multi-device sync'
  },

  // PaperHistoryDetail component
  paperHistoryDetail: {
    title: 'Document Processing Details',
    subtitle: 'View detailed processing information of uploaded documents',
    fileInfo: 'File Information',
    fileInfoEn: 'Document Information',
    fileName: 'File Name',
    fileType: 'File Type',
    fileSize: 'File Size',
    processStatus: 'Processing Status',
    timeInfo: 'Time Information',
    timeInfoEn: 'Time Information',
    uploadTime: 'Upload Time',
    processComplete: 'Processing Complete',
    processTime: 'Processing Time',
    processTimeUnit: 'seconds',
    resultsOverview: 'Processing Results Overview',
    resultsOverviewEn: 'Processing Results Overview',
    totalQuestions: 'Total Questions',
    avgConfidence: 'Average Confidence',
    fileFormat: 'File Format',
    processStatusLabel: 'Processing Status',
    typeDistribution: 'Question Type Distribution',
    typeDistributionEn: 'Question Type Distribution',
    questions: 'questions',
    processingSteps: 'Processing Steps Details',
    processingStepsEn: 'Processing Steps Details',
    completed: 'Completed',
    processing: 'Processing',
    failed: 'Failed',
    waiting: 'Waiting',
    stepError: 'Error Information',
    documentId: 'Document ID: {id}',
    export: 'Export',
    share: 'Share',
    close: 'Close',
    questionTypes: {
      choice: 'Multiple Choice',
      fill: 'Fill in the Blank',
      solution: 'Solution',
      unknown: 'Unknown Type'
    },
    statusTypes: {
      completed: 'Processing Complete',
      failed: 'Processing Failed',
      processing: 'Processing',
      uploading: 'Uploading',
      waiting: 'Waiting',
      paused: 'Paused',
      retrying: 'Retrying',
      unknown: 'Unknown Status'
    }
  },

  // ProcessingProgressCard component
  processingProgressCard: {
    estimatedTime: 'Estimated Time: {time}',
    calculating: 'Calculating...',
    overallProgress: 'Overall Progress',
    processingSteps: 'Processing Steps',
    retryCount: 'Retry Count: {current}/{max}',
    cancel: 'Cancel',
    continue: 'Continue',
    retry: 'Retry',
    delete: 'Delete',
    status: {
      completed: 'Completed',
      processing: 'Processing',
      failed: 'Failed',
      waiting: 'Waiting'
    }
  },

  // DraftReminderModal component
  draftReminderModal: {
    needSave: 'Need to Save Draft',
    saveReminder: 'Draft Save Reminder',
    needSaveMessage: 'You need to save a draft before performing edit operations',
    saveReminderMessage: 'You have unsaved questions, it is recommended to save a draft first',
    questionCount: 'Question Count',
    questionCountValue: '{count} questions',
    saveHint: 'After saving a draft, you can perform edit, delete, drag and other operations',
    saveHint2: 'It is recommended to save in time to avoid data loss',
    draftName: 'Draft Name',
    draftNamePlaceholder: 'Enter draft name',
    description: 'Description (Optional)',
    descriptionPlaceholder: 'Enter draft description to help you better manage questions',
    saveNow: 'Save Now',
    saving: 'Saving...',
    cancel: 'Cancel',
    saveLater: 'Save Later',
    benefits: 'Benefits of saving drafts:',
    benefit1: 'Prevent data loss',
    benefit2: 'Support subsequent editing and modification',
    benefit3: 'Can restore work progress at any time'
  },

  // ProcessingResultPreview component
  processingResultPreview: {
    processingComplete: 'Processing Complete',
    questionsIdentified: 'Questions Identified',
    confidence: 'Confidence',
    enterEdit: 'Enter Edit',
    downloadResult: 'Download Result',
    share: 'Share'
  },

  // QuestionSplitModal component
  questionSplitModal: {
    title: 'Split Question',
    originalContent: 'Original Question Content:',
    selectTextHint: 'Select the text to split, then click "Add Split Point"',
    splitPoints: 'Split Points:',
    selectedText: 'Selected: "{text}"',
    addSplitPoint: 'Add Split Point',
    splitPoint: 'Split Point {index}: Position {position}',
    noSplitPoints: 'No split points, please select text and add split points',
    splitPreview: 'Split Preview:',
    newQuestion: 'New Question {index}',
    questionTypeOptions: {
      choice: 'Multiple Choice',
      fill: 'Fill in the Blank',
      solution: 'Solution',
      question: 'Question'
    },
    willGenerate: 'Will generate {count} new questions',
    cancel: 'Cancel',
    confirmSplit: 'Confirm Split ({count} questions)'
  },

  // Common text
  common: {
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    warning: 'Warning',
    info: 'Info',
    confirm: 'Confirm',
    cancel: 'Cancel',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    close: 'Close',
    back: 'Back',
    next: 'Next',
    previous: 'Previous',
    finish: 'Finish',
    retry: 'Retry',
    refresh: 'Refresh',
    search: 'Search',
    filter: 'Filter',
    sort: 'Sort',
    select: 'Select',
    clear: 'Clear',
    reset: 'Reset',
    submit: 'Submit',
    apply: 'Apply',
    ok: 'OK',
    yes: 'Yes',
    no: 'No'
  }
};
