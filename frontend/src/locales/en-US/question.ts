export const question = {
  // AbilityRadarChart component
  abilityRadarChart: {
    labels: {
      logicalThinking: 'Logical Thinking',
      mathematicalIntuition: 'Mathematical Intuition',
      problemSolving: 'Problem Solving',
      analyticalAbility: 'Analytical Ability',
      creativeThinking: 'Creative Thinking',
      computationalSkills: 'Computational Skills'
    }
  },

  // QuestionCard component
  questionCard: {
    questionNumber: 'Question {number}',
    type: 'Type',
    difficulty: 'Difficulty',
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
    difficult_level: {
      easy: 'Easy',
      mediumEasy: 'Medium Easy',
      medium: 'Medium',
      mediumHard: 'Medium Hard',
      hard: 'Hard'
    },
    actions: {
      view: 'View',
      edit: 'Edit',
      favorite: 'Favorite',
      unfavorite: 'Unfavorite',
      delete: 'Delete',
      more: 'More'
    },
    media: {
      showMedia: 'Show Media',
      hideMedia: 'Hide Media',
      noMedia: 'No Media Content',
      imageCount: '{count} images',
      tikzCount: '{count} graphics'
    },
    status: {
      analyzing: 'Analyzing...',
      answerGenerating: 'Generating answer...',
      loading: 'Loading...'
    }
  },

  // QuestionView component
  questionView: {
    title: 'Question Details',
    questionNumber: 'Question {current} / {total}',
    navigation: {
      previous: 'Previous',
      next: 'Next',
      close: 'Close'
    },
    actions: {
      share: 'Share',
      favorite: 'Favorite',
      unfavorite: 'Unfavorite',
      edit: 'Edit',
      delete: 'Delete',
      view: 'View'
    },
    evaluation: {
      title: 'Ability Evaluation',
      loading: 'Evaluating...',
      error: 'Evaluation failed',
      retry: 'Retry Evaluation',
      noData: 'No evaluation data'
    },
    analysis: {
      title: 'AI Smart Analysis',
      loading: 'AI analysis generating, please wait...',
      error: 'AI analysis failed',
      retry: 'Retry'
    },
    media: {
      showMedia: 'Show Media',
      hideMedia: 'Hide Media',
      noMedia: 'No Media Content',
      imageCount: '{count} images',
      tikzCount: '{count} graphics',
      title: 'Graphics & Images',
      image: 'Image',
      tikz: 'Graphic'
    },
    status: {
      analyzing: 'Analyzing...',
      answerGenerating: 'Generating answer...',
      loading: 'Loading...'
    },
    tabs: {
      question: 'Question',
      solution: 'Solution',
      analysis: 'Analysis'
    },
    content: {
      title: 'Question Content'
    },
    answer: {
      show: 'Show',
      hide: 'Hide',
      correctHighlighted: 'Correct answers are highlighted in the options above'
    },
    solution: {
      noSolution: 'No solution available'
    },
    sidebar: {
      title: 'Question Information',
      creator: 'Creator',
      createdAt: 'Created At',
      views: 'Views',
      favorites: 'Favorites'
    },
    related: {
      title: 'Related Questions',
      showFirst3: 'Show first 3',
      retry: 'Retry',
      loading: 'Loading...',
      noSimilar: 'No similar questions found'
    },
    keyboard: {
      instructions: 'Use ← → keys to switch questions',
      edit: 'Ctrl+E to edit question',
      close: 'ESC key to close dialog'
    },
    tikzPreview: {
      title: 'TikZ Graphic Preview'
    }
  },

  // SimpleMediaPreview component
  simpleMediaPreview: {
    showMedia: 'Show Media',
    hideMedia: 'Hide Media',
    noMedia: 'No Media Content',
    imageCount: '{count} images',
    tikzCount: '{count} graphics',
    preview: 'Preview',
    close: 'Close',
    title: 'Question Graphics ({count})',
    show: 'Show',
    hide: 'Hide',
    tikzGraphic: 'TikZ Graphic'
  },

  // MediaContentPreview component
  mediaContentPreview: {
    noMedia: 'No Media Content',
    loading: 'Loading...',
    error: 'Load Failed',
    retry: 'Retry',
    title: 'Question Media Content',
    images: 'Images',
    image: 'Image',
    tikzGraphics: 'TikZ Graphics',
    graphic: 'Graphic'
  },

  // QuestionImageManager component
  questionImageManager: {
    title: 'Question Images ({current}/{max})',
    upload: 'Upload Image',
    dragTitle: 'Drag images here or click to upload',
    dragDescription: 'Supports JPG, PNG formats, max 10MB',
    selectFile: 'Select File',
    uploading: 'Uploading...',
    uploadSuccess: 'Upload successful',
    uploadError: 'Upload failed',
    delete: 'Delete',
    confirmDelete: 'Confirm Delete',
    confirmDeleteMessage: 'Are you sure you want to delete this image?',
    cancel: 'Cancel',
    confirm: 'Confirm',
    noImages: 'No images',
    imageCount: '{count} images',
    maxImagesExceeded: 'Maximum {maxImages} images allowed',
    bankIdMissing: 'Bank ID does not exist, cannot upload images',
    uploadFailed: 'Image {filename} upload failed',
    uploadFailedTitle: 'Upload failed',
    uploadComplete: 'Upload complete',
    uploadSuccessMessage: 'Successfully uploaded {count} images',
    partialSuccess: 'Partial success',
    partialSuccessMessage: 'Successfully uploaded {success}/{total} images',
    uploadImages: 'Upload Images',
    dropToUpload: 'Drop files to upload',
    dragOrClick: 'Drag image files here or click upload button',
    supportedFormats: 'Supports JPG, PNG, GIF formats, max 5MB per file',
    uploadToEnrich: 'Upload images to enrich question content'
  },

  // BatchEditMediaEditor component
  batchEditMediaEditor: {
    title: 'Batch Edit Media',
    images: 'Images',
    tikzCodes: 'Graphics',
    upload: 'Upload',
    dragTitle: 'Drag files here or click to upload',
    dragDescription: 'Supports JPG, PNG formats, max 10MB',
    selectFile: 'Select File',
    uploading: 'Uploading...',
    uploadSuccess: 'Upload successful',
    uploadError: 'Upload failed',
    delete: 'Delete',
    confirmDelete: 'Confirm Delete',
    confirmDeleteMessage: 'Are you sure you want to delete this media item?',
    cancel: 'Cancel',
    confirm: 'Confirm',
    noMedia: 'No media content',
    imageCount: '{count} images',
    tikzCount: '{count} graphics',
    bankIdMissing: 'Bank ID does not exist, cannot upload images',
    fileTooLarge: 'File {filename} is too large, please select images smaller than 5MB',
    uploadFailed: 'Image upload failed',
    singleUploadFailed: 'Image {filename} upload failed: {error}',
    uploadFailedRetry: 'Image upload failed, please try again',
    total: 'Total',
    noImagesAdded: 'No images added yet',
    uploadImages: 'Upload Images',
    uploadedImages: 'Uploaded images',
    image: 'Image',
    uploadMoreImages: 'Upload More Images',
    supportedFormats: 'Supports JPG, PNG, GIF formats',
    noTikzAdded: 'No TikZ graphics added yet',
    addTikzCode: 'Add TikZ Code',
    tikzCode: 'TikZ Code',
    tikzGraphic: 'TikZ Graphic',
    enterTikzCode: 'Enter TikZ code...',
    addMoreTikzCode: 'Add More TikZ Code',
    createGraphics: 'Create geometric shapes and mathematical diagrams'
  },

  // IntegratedMediaEditor component
  integratedMediaEditor: {
    title: 'Integrated Media Editor',
    images: 'Images',
    tikzCodes: 'Graphics',
    upload: 'Upload',
    dragTitle: 'Drag files here or click to upload',
    dragDescription: 'Supports JPG, PNG formats, max 10MB',
    selectFile: 'Select File',
    uploading: 'Uploading...',
    uploadSuccess: 'Upload successful',
    uploadError: 'Upload failed',
    delete: 'Delete',
    confirmDelete: 'Confirm Delete',
    confirmDeleteMessage: 'Are you sure you want to delete this media item?',
    cancel: 'Cancel',
    confirm: 'Confirm',
    noMedia: 'No media content',
    imageCount: '{count} images',
    tikzCount: '{count} graphics',
    bankIdMissing: 'Bank ID does not exist, cannot upload images',
    fileTooLarge: 'File too large',
    fileTooLargeMessage: 'File {filename} is too large, please select images smaller than 5MB',
    uploadFailed: 'Image {filename} upload failed',
    uploadFailedTitle: 'Upload failed',
    uploadComplete: 'Upload complete',
    uploadSuccessMessage: 'Successfully uploaded {count} images',
    partialSuccess: 'Partial success',
    partialSuccessMessage: 'Successfully uploaded {success}/{total} images',
    total: 'Total',
    noImagesAdded: 'No images added yet',
    uploadImages: 'Upload Images',
    noTikzAdded: 'No TikZ graphics added yet',
    addTikzGraphic: 'Add TikZ Graphic',
    graphic: 'Graphic',
    tikzCode: 'TikZ Code',
    enterTikzCode: 'Enter TikZ code...',
    graphicPreview: 'Graphic Preview'
  },

  // QuestionMediaManager component
  questionMediaManager: {
    title: 'Question Media Management',
    description: 'Manage question images and TikZ graphics to enhance visual effects',
    imageCount: '{count} images',
    tikzCount: '{count} TikZ graphics',
    imageManagement: 'Image Management',
    tikzGraphics: 'TikZ Graphics',
    tikzManagement: 'TikZ Graphics Management',
    mediaPreview: 'Media Preview',
    realTimePreview: 'Real-time preview of question images and TikZ graphics',
    imagePreview: 'Image Preview',
    tikzPreview: 'TikZ Graphics Preview',
    noMediaContent: 'No media content',
    addMediaToEnrich: 'Add images or TikZ graphics to enrich question content',
    usageTips: 'Usage Tips',
    tip1: 'Images support drag-and-drop upload, max 5MB, supports JPG, PNG, GIF formats',
    tip2: 'TikZ graphics support simulation rendering (no backend) and real rendering (requires LaTeX environment)',
    tip3: 'Can adjust the display order of images and TikZ graphics',
    tip4: 'All media content is automatically saved to the question'
  },

  // EnhancedQuestionItem component
  enhancedQuestionItem: {
    questionNumber: 'Question {number}',
    type: 'Type',
    difficulty: 'Difficulty',
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
    difficult_level: {
      easy: 'Easy',
      mediumEasy: 'Medium Easy',
      medium: 'Medium',
      mediumHard: 'Medium Hard',
      hard: 'Hard'
    },
    actions: {
      view: 'View',
      edit: 'Edit',
      favorite: 'Favorite',
      unfavorite: 'Unfavorite',
      delete: 'Delete',
      more: 'More'
    },
    media: {
      showMedia: 'Show Media',
      hideMedia: 'Hide Media',
      noMedia: 'No Media Content',
      imageCount: '{count} images',
      tikzCount: '{count} graphics'
    },
    status: {
      analyzing: 'Analyzing...',
      answerGenerating: 'Generating answer...',
      loading: 'Loading...'
    },
    quickEdit: 'Quick Edit',
    questionTypeLabel: 'Question Type',
    difficultyLabel: 'Difficulty Level',
    tagManagement: 'Tag Management',
    addTag: 'Add tag...',
    cancel: 'Cancel',
    save: 'Save',
    confidence: 'Confidence',
    options: 'Options',
    blanks: 'blanks',
    document: 'Document',
    category: 'Category'
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
