export const paper = {
  // PracticePaperCard component
  practicePaperCard: {
    paperBank: 'Paper Bank',
    unknownPaperBank: 'Unknown Paper Bank',
    sectionsAndQuestions: '{sectionCount} sections · {totalQuestions} questions',
    practicePaper: 'Practice Paper',
    roles: {
      creator: 'Creator',
      manager: 'Manager',
      collaborator: 'Collaborator',
      viewer: 'Viewer'
    },
    created: 'Created:',
    updated: 'Updated:',
    preview: 'Preview',
    edit: 'Edit',
    creatorInfo: 'Creator: {creatorName}',
    unknownUser: 'Unknown User'
  },

  // PracticePaperPreviewModal component
  practicePaperPreviewModal: {
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
    labels: {
      practicePaper: 'Practice Paper',
      paperBank: 'Paper Bank:',
      overleafEditLink: 'Overleaf Edit Link',
      sectionCount: 'Sections',
      totalQuestions: 'Total Questions',
      createdAt: 'Created At',
      creator: 'Creator',
      tags: 'Tags',
      questionPreview: 'Question Preview',
      loadingQuestions: 'Loading questions...',
      incompleteQuestionData: 'Incomplete question data',
      graphicsAndImages: 'Graphics & Images',
      options: 'Options',
      summary: '{sectionCount} sections, {totalQuestions} questions total',
      close: 'Close'
    },
    errors: {
      fetchFailed: 'Failed to fetch practice paper details:'
    }
  },

  // CopyButton component
  copyButton: {
    states: {
      opening: 'Opening...',
      copying: 'Copying...',
      opened: 'Opened',
      copied: 'Copied',
      openInOverleaf: 'Open in Overleaf',
      copyLaTeX: 'Copy LaTeX'
    },
    hint: 'Copy all by default',
    errors: {
      operationFailed: 'Operation failed:'
    }
  },

  // copyUtils related
  copyUtils: {
    difficulty: {
      veryEasy: 'Very Easy',
      easy: 'Easy',
      medium: 'Medium',
      hard: 'Hard',
      veryHard: 'Very Hard',
      unknown: 'Unknown'
    },
    answer: {
      answer: 'Answer: ',
      separator: ', ',
      fillSeparator: '; '
    },
    errors: {
      copyFailed: 'Copy failed'
    }
  },

  // CopyModeSelector component
  copyModeSelector: {
    modes: {
      mareate: {
        label: 'Mareate Version',
        description: 'Mareate department original, beautiful typesetting'
      },
      normal: {
        label: 'Normal',
        description: 'No customizations or answers, only necessary packages'
      }
    },
    copyMethod: {
      label: 'Copy Method',
      clipboard: {
        label: 'Copy to Clipboard',
        description: 'Copy LaTeX code to system clipboard'
      },
      overleaf: {
        label: 'Open in Overleaf',
        description: 'Open Overleaf project directly in new tab'
      }
    },
    copyMode: {
      label: 'Copy Mode'
    },
    vspace: {
      addVspace: 'Add Question Spacing',
      choiceSpacing: 'Choice Question Spacing',
      fillSpacing: 'Fill-in-the-blank Spacing',
      solutionSpacing: 'Solution Question Spacing',
      defaultSpacing: 'Default Spacing'
    },
    normalConfig: {
      title: 'Normal Mode Configuration',
      addDocumentEnvironment: 'Add Complete LaTeX Document Environment',
      overleafDefault: '(Enabled by default in Overleaf mode)',
      paperSize: 'Paper Size',
      customGeometry: 'Custom Geometry Configuration',
      paperSizes: {
        a4: 'A4 (21cm × 29.7cm)',
        b5: 'B5 (18.2cm × 25.7cm)',
        custom: 'Custom'
      }
    }
  },

  // OverleafLinkManager component
  overleafLinkManager: {
    messages: {
      operationSuccess: 'Operation Successful',
      linkUpdated: 'Overleaf link updated successfully',
      linkAdded: 'Overleaf link added successfully',
      operationFailed: 'Operation Failed',
      updateFailed: 'Failed to update Overleaf link',
      deleteSuccess: 'Delete Successful',
      linkDeleted: 'Overleaf link deleted'
    },
    confirmDialog: {
      title: 'Confirm Delete',
      message: 'Are you sure you want to delete the Overleaf edit link? This action cannot be undone.',
      delete: 'Delete',
      cancel: 'Cancel',
      deleting: 'Deleting...'
    }
  },

  // PaperCopyManager component
  paperCopyManager: {
    overleafEditLink: 'Overleaf Edit Link',
    copySettings: 'Copy Settings',
    advancedSettings: 'Advanced Settings',
    selectiveCopy: 'Selective Copy',
    copyAll: 'Copy All',
    copySelected: 'Copy Selected Questions',
    selectedCount: '{count} questions selected',
    copyConfig: 'Copy Configuration',
    copy: 'Copy',
    settings: 'Settings',
    collapseSettings: 'Collapse Settings'
  }
};