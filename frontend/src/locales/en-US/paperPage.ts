export default {
  // Create paper page
  createPage: {
    title: 'Create Paper',
    description: 'Select paper type and start creating your paper',
    back: 'Back',
    // Paper type options
    paperTypes: {
      lecture: {
        label: 'Lecture',
        description: 'Teaching materials for knowledge transfer (temporarily disabled)',
        status: 'Coming Soon'
      },
      practice: {
        label: 'Practice',
        description: 'Practice questions to consolidate knowledge',
        status: 'Available'
      },
      test: {
        label: 'Test',
        description: 'Exam papers for learning assessment',
        status: 'Coming Soon'
      }
    },
    // Permission related
    noPermission: {
      title: 'Cannot Create Paper',
      description: 'You need to have edit, management, or owner permissions for a paper bank to create papers',
      methodsTitle: 'Ways to Get Permissions',
      methods: {
        createBank: 'Create your own paper bank',
        beInvited: 'Ask paper bank owner to add you as a member',
        purchase: 'Purchase published paper banks'
      },
      viewBanks: 'View Paper Banks',
      createBank: 'Create Paper Bank'
    },
    // Paper bank selection
    selectBank: {
      title: 'Select Paper Bank',
      description: 'Please select the paper bank where you want to create content',
      cancel: 'Cancel',
      members: 'Members',
      status: 'Status',
      published: 'Published',
      draft: 'Draft'
    },
    // Error messages
    errors: {
      loadFailed: 'Load Failed',
      loadFailedMessage: 'Unable to load paper bank list',
      cannotCreate: 'Cannot Create Paper',
      cannotCreateMessage: 'You need to create a paper bank or have edit permissions for a paper bank to create papers',
      cannotCreatePractice: 'Cannot Create Practice',
      cannotCreatePracticeMessage: 'You need to create a paper bank or have edit permissions for a paper bank to create practices',
      featureNotAvailable: 'Feature Not Available',
      featureNotAvailableMessage: 'This feature is under development, please stay tuned!'
    },
    // Bottom tip
    bottomTip: 'After selecting a paper type, you will go directly to the editing page to start creating'
  },

  // Practice page
  practicePage: {
    title: 'Practice Mode',
    description: 'Manage and practice your questions',
    back: 'Back',
    createPractice: 'Create Practice',
    loading: 'Loading...',
    // Search and filter
    search: {
      placeholder: 'Search practices...',
      allBanks: 'All Paper Banks',
      sortBy: {
        newest: 'Latest Update',
        oldest: 'Earliest Created',
        name: 'By Name'
      }
    },
    // Empty state
    emptyState: {
      noResults: 'No matching practices found',
      noResultsDescription: 'Try adjusting search conditions or filters',
      noPractices: 'No practices yet',
      noPracticesDescription: 'Start creating your first practice!'
    },
    // Practice card
    practiceCard: {
      more: 'More',
      view: 'View',
      edit: 'Edit',
      updatedAt: 'Updated on'
    },
    // Error messages
    errors: {
      loadFailed: 'Failed to load data'
    }
  }
};
