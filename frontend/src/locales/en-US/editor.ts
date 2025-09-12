// Editor related translations
export const editor = {
  // LaTeX Editor
  latexEditor: {
    title: 'LaTeX Editing Area',
    mathSymbols: 'Math Symbols',
    questionSymbols: 'Question Symbols',
    showPreview: 'Show Preview',
    hidePreview: 'Hide Preview',
    placeholder: 'Enter LaTeX formula...',
    // Question types
    questionTypes: {
      choice: 'Multiple Choice',
      fill: 'Fill in the Blank',
      solution: 'Solution',
      solutionDisplay: 'Solution'
    }
  },
  
  // Symbol Panel
  symbolPanel: {
    mathSymbols: 'Math Symbols',
    questionSymbols: 'Question Symbols',
    close: 'Close'
  },
  
  // Multi Question Editor
  multiQuestionEditor: {
    title: 'Multi Question Editor',
    questionCount: 'Question {current} of {total}',
    delete: 'Delete',
    batchAnalysis: 'Batch AI Analysis',
    batchSave: 'Batch Save',
    analyzing: 'Analyzing...',
    saving: 'Saving...',
    previous: 'Previous',
    next: 'Next',
    questionBankSelected: 'Question Bank Selected',
    selectQuestionBank: 'Please Select Question Bank First',
    deleteConfirm: 'At least one question must be kept',
    deleteSuccess: 'Question deleted',
    analysisSuccess: 'Successfully analyzed {count} questions',
    saveSuccess: 'Successfully saved all {count} questions',
    savePartial: 'Save completed: {success} successful, {fail} failed',
    analysisFailed: 'Batch AI analysis failed',
    saveFailed: 'Batch save failed'
  },
  
  // Multi Question Uploader
  multiQuestionUploader: {
    title: 'Upload Question Images',
    dragToUpload: 'Release to upload images',
    supportFormats: 'Supports JPG, PNG formats, max {maxSize}MB, up to 10 images',
    selectedCount: 'Selected {count}/10 images',
    selectImages: 'Select Images',
    clear: 'Clear',
    startRecognition: 'Start Recognition ({count} images)',
    recognizing: 'Recognizing...',
    selectedImages: 'Selected Images',
    preview: 'Preview {index}',
    fileSize: '{size} MB',
    imageViewer: 'Image {current} / {total}',
    unsupportedFormat: 'Unsupported file type: {type}',
    fileTooLarge: 'File size cannot exceed {maxSize}MB',
    maxFilesExceeded: 'Maximum 10 images allowed',
    recognitionFailed: 'Batch OCR recognition failed',
    noQuestionsGenerated: 'No questions generated'
  },
  
  // Question Editor
  questionEditor: {
    title: 'Question Editor',
    questionType: 'Question Type',
    questionContent: 'Question Content',
    solution: 'Solution',
    options: 'Options Settings',
    singleChoice: 'Single Choice',
    multipleChoice: 'Multiple Choice',
    autoDetected: '(Auto-detected by system)',
    addOption: 'Add Option',
    delete: 'Delete',
    fillAnswers: 'Fill-in-the-blank Answers',
    fillCount: 'Detected {count} blanks, please fill in corresponding answers',
    fillAnswerPlaceholder: 'Answer for blank {index}',
    solutionAnswers: 'Solution Answers',
    solutionCount: 'Detected {count} solution points, please fill in corresponding answers',
    solutionAnswerPlaceholder: 'Answer for point {index}',
    answer: 'Answer',
    answerPlaceholder: 'Enter answer',
    difficulty: 'Difficulty Settings',
    difficultyLevels: {
      1: '★☆☆☆☆ Basic',
      2: '★★☆☆☆ Easy',
      3: '★★★☆☆ Medium',
      4: '★★★★☆ Hard',
      5: '★★★★★ Expert'
    },
    category: 'Category',
    categoryPlaceholder: 'Enter question category',
    source: 'Source',
    sourcePlaceholder: 'Enter question source',
    tags: 'Knowledge Tags',
    tagsPlaceholder: 'Enter knowledge tags',
    addTag: 'Add',
    selectPresetTags: 'Select Preset Tags',
    questionBank: 'Question Bank: {name}',
    questionId: 'Question ID: {id}',
    quickEdit: 'Quick Edit',
    save: 'Save',
    cancel: 'Cancel',
    clickToEdit: 'Click to edit question content',
    clickToEditSolution: 'Click to edit solution content',
    addContent: 'Click here to add question content',
    addSolution: 'Click here to add solution content',
    optionPreview: 'Option {letter} Preview',
    noContent: 'No content',
    latexError: 'LaTeX Error'
  },
  
  // Preview Components
  preview: {
    title: 'Render Preview',
    livePreview: 'Live Preview',
    showPreview: 'Show Preview',
    hidePreview: 'Hide Preview',
    noContent: 'No content',
    latexError: 'LaTeX Error',
    warnings: 'Warnings'
  },
  
  // Knowledge Tag Selector
  knowledgeTagSelector: {
    title: 'Knowledge Tags',
    placeholder: 'Enter or select knowledge tags (max {maxCount})',
    add: 'Add',
    selectLimit: 'Selection Limit',
    maxTagsReached: 'Maximum {maxCount} knowledge tags allowed',
    duplicateTag: 'Duplicate Input',
    tagExists: 'This knowledge tag already exists',
    categories: {
      mathBasic: 'Basic Math',
      advancedMath: 'Advanced Math',
      middleSchoolMath: 'Middle School Math'
    },
    hint: 'Please select preset tags or enter custom knowledge tags to help better categorize and search questions'
  },
  
  // Question Source Selector
  questionSourceSelector: {
    title: 'Question Source',
    placeholder: 'Enter question source information',
    clear: 'Clear',
    recentYears: 'Recent Years',
    stages: {
      primary: 'Primary School',
      middle: 'Middle School',
      high: 'High School',
      college: 'College',
      graduate: 'Graduate',
      other: 'Other'
    },
    regions: {
      beijing: 'Beijing',
      shanghai: 'Shanghai',
      guangdong: 'Guangdong',
      jiangsu: 'Jiangsu',
      zhejiang: 'Zhejiang',
      shandong: 'Shandong',
      hubei: 'Hubei',
      hunan: 'Hunan',
      sichuan: 'Sichuan',
      fujian: 'Fujian',
      other: 'Other'
    },
    types: {
      exam: 'Exam',
      homework: 'Homework',
      practice: 'Practice',
      competition: 'Competition',
      other: 'Other'
    }
  },
  
  // Question Type Selector
  questionTypeSelector: {
    title: 'Question Types',
    placeholder: 'Enter or select question types (max {maxCount})',
    add: 'Add',
    selectLimit: 'Selection Limit',
    maxTypesReached: 'Maximum {maxCount} question types allowed',
    duplicateType: 'Duplicate Input',
    typeExists: 'This question type already exists',
    categories: {
      basic: 'Basic',
      application: 'Application',
      comprehensive: 'Comprehensive',
      innovative: 'Innovative',
      other: 'Other'
    },
    hint: 'Please select preset types or enter custom question types to help better categorize questions'
  }
};
