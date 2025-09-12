const practiceEditor = {
  // Page title and navigation
  pageTitle: 'Practice Editor',
  back: 'Back',
  save: 'Save',
  saving: 'Saving...',
  
  // Paper bank selection
  paperBank: 'Paper Bank',
  selectPaperBank: 'Select Paper Bank',
  
  // Question filtering
  questionFilter: 'Question Filter',
  advancedFilter: 'Advanced Filter',
  hideFilter: 'Hide Filter',
  reset: 'Reset',
  searchPlaceholder: 'Search question content, tags...',
  search: 'Search',
  searching: 'Searching',
  clearSearch: 'Clear Search',
  
  // Filter options
  typeFilter: 'Question Type Filter',
  selectTypes: 'Select Question Types',
  difficultyFilter: 'Question Difficulty',
  selectDifficulty: 'Select Difficulty',
  bankFilter: 'Question Bank',
  selectBank: 'Select Question Bank',
  tagFilter: 'Knowledge Point Tags',
  selectTags: 'Select Knowledge Point Tags',
  
  // Question type options
  questionTypes: {
    choice: 'Single Choice',
    multipleChoice: 'Multiple Choice',
    fill: 'Fill in the Blank',
    solution: 'Solution',
    unknown: 'Unknown Type'
  },
  
  // Difficulty options
  difficulties: {
    veryEasy: 'Very Easy',
    easy: 'Easy',
    medium: 'Medium',
    hard: 'Hard',
    veryHard: 'Very Hard',
    unknown: 'Unknown'
  },
  
  // Question list
  availableQuestions: 'Available Questions',
  addTo: 'Add to',
  section: 'Section',
  add: 'Add',
  noQuestions: 'No available questions',
  noQuestionsDescription: 'Please try adjusting filter conditions',
  loadingQuestions: 'Loading...',
  filteringQuestions: 'Filtering questions...',
  
  // Question content
  questionContentLoading: 'Loading question content...',
  graphicsAndImages: 'Graphics and Images',
  count: 'items',
  image: 'Img',
  shape: 'Shape',
  options: 'Options',
  removeFromSection: 'Remove from this section',
  
  // Practice title and sections
  practiceTitle: 'Practice Title',
  clickToSetTitle: 'Click to set practice title',
  enterTitle: 'Please enter practice title',
  addSection: 'Add Section',
  sectionTitle: 'Section Title',
  questions: 'questions',
  current: 'Current',
  
  // Section operations
  switchToSection: 'Switch to this section to add questions',
  moveUp: 'Move up this section',
  moveDown: 'Move down this section',
  deleteSection: 'Delete this section',
  
  // Pagination
  previousPage: 'Previous',
  nextPage: 'Next',
  page: 'Page',
  of: 'of',
  totalQuestions: 'questions total',
  
  // Loading states
  loading: 'Loading...',
  loadingPracticeContent: 'Loading practice content...',
  
  // Save related
  savePractice: 'Save Practice',
  saveAndExit: 'Save and Exit',
  exitWithoutSaving: 'Exit Without Saving',
  savingChanges: 'Saving...',
  unsavedChanges: 'You have unsaved changes. Do you want to save before exiting?',
  
  // Error and success messages
  errors: {
    loadFailed: 'Load Failed',
    loadFailedMessage: 'Unable to load data',
    saveFailed: 'Save Failed',
    saveFailedMessage: 'Save failed',
    saveError: 'Error occurred while saving practice',
    noTitle: 'Please enter title first',
    noTitleMessage: 'Please enter practice title',
    noQuestions: 'Please add at least one question',
    noQuestionsMessage: 'Please add at least one question',
    noPaperBank: 'Please select paper bank',
    noPaperBankMessage: 'Please select paper bank',
    questionLoadFailed: 'Question load failed',
    questionLoadFailedMessage: 'Unable to load question data',
    preloadFailed: 'Preload questions failed',
    getUsedQuestionsFailed: 'Failed to get used questions in paper bank'
  },
  
  success: {
    practiceSaved: 'Practice saved to paper bank',
    practiceUpdated: 'Practice updated',
    saveSuccess: 'Save successful'
  },
  
  // Default tags
  defaultTags: {
    practice: 'Practice',
    comprehensive: 'Comprehensive',
    selfTest: 'Self Test'
  },
  
  // Search keywords
  searchKeywords: {
    difficulty: {
      simple: 'simple',
      easy: 'easy',
      basic: 'basic',
      medium: 'medium',
      normal: 'normal',
      general: 'general',
      hard: 'hard',
      difficult: 'difficult',
      complex: 'complex'
    },
    types: {
      choice: 'choice',
      singleChoice: 'single choice',
      multipleChoice: 'multiple choice',
      multipleChoiceQuestion: 'multiple choice question',
      fill: 'fill',
      fillQuestion: 'fill question',
      solution: 'solution',
      solutionQuestion: 'solution question',
      calculation: 'calculation'
    }
  },
  
  // Statistics
  foundQuestions: 'Found {count} questions',
  
  // Default section title
  defaultSectionTitle: 'Section {number}'
};

export default practiceEditor;
