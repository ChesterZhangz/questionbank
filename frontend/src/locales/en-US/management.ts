export const management = {
  // Question Management Page
  questionManagement: {
    title: 'Question Management',
    description: 'Organize your question bank with batch operations and advanced filtering',
    filteredCount: 'Filtered: {count} questions',
    createNew: 'Create New',
    createNewTooltip: 'Create new question',
    intelligentPaper: 'Intelligent Paper Generation',
    intelligentPaperTooltip: 'Intelligent Paper Generation',
    
    // Filter related
    smartFilter: 'Smart Filter',
    quickLocate: 'Quickly locate target questions',
    resetFilter: 'Reset Filter',
    searchQuestions: 'Search Questions',
    searchPlaceholder: 'Search question ID, content, tags, difficulty, type...',
    questionBank: 'Question Bank',
    selectQuestionBank: 'Select Question Bank',
    difficulty: 'Question Difficulty',
    selectDifficulty: 'Select Difficulty',
    sortBy: 'Sort By',
    selectSortBy: 'Select Sort By',
    sortDirection: 'Sort Direction',
    ascending: 'Ascending ↑',
    descending: 'Descending ↓',
    questionTypeFilter: 'Question Type Filter',
    selectedTypes: 'Selected Types ({count})',
    clear: 'Clear',
    knowledgeTags: 'Knowledge Tags',
    selectKnowledgeTags: 'Select Knowledge Tags',
    
    // Question type options
    questionTypes: {
      choice: { label: 'Multiple Choice', icon: '○' },
      multipleChoice: { label: 'Multiple Selection', icon: '□' },
      fill: { label: 'Fill in the Blank', icon: '___' },
      solution: { label: 'Solution', icon: '✎' }
    },
    
    // Difficulty options
    difficulties: {
      veryEasy: { label: 'Very Easy', icon: '○' },
      easy: { label: 'Easy', icon: '○○' },
      medium: { label: 'Medium', icon: '○○○' },
      hard: { label: 'Hard', icon: '○○○○' },
      veryHard: { label: 'Very Hard', icon: '○○○○○' }
    },
    
    // Sort options
    sortOptions: {
      createdAt: { label: 'Creation Time', icon: '◉' },
      updatedAt: { label: 'Update Time', icon: '◐' },
      difficulty: { label: 'Difficulty', icon: '◆' },
      views: { label: 'Views', icon: '◇' }
    },
    
    // Batch operations
    batchActions: {
      selectedCount: 'Selected {count} questions',
      cancelSelection: 'Cancel Selection'
    },
    
    // Question list
    questionList: {
      loading: 'Loading questions...',
      loadingDescription: 'Please wait, fetching question list',
      noData: 'No question data',
      noDataDescription: 'Try adjusting filter conditions or adding new questions',
      totalQuestions: 'Total {total} questions, page {current} / {totalPages}',
      perPage: 'Per page:',
      questions: 'questions',
      previousPage: 'Previous',
      nextPage: 'Next'
    },
    
    // Operations
    operations: {
      confirmDelete: 'Confirm Delete',
      deleteConfirmMessage: 'Are you sure you want to delete this question? This action cannot be undone.',
      deleting: 'Deleting...',
      deleteSuccess: 'Delete Successful',
      deleteSuccessMessage: 'Question deleted successfully',
      deleteFailed: 'Delete Failed',
      deleteFailedMessage: 'Failed to delete question, please try again',
      favoriteFailed: 'Favorite operation failed'
    },
    
    // Error messages
    errors: {
      fetchBanksFailed: 'Failed to fetch question bank list',
      fetchBanksTimeout: 'Request timeout, please check your network connection or try again later',
      fetchBanksAuthFailed: 'Authentication failed, please log in again',
      fetchBanksUnknownError: 'Failed to fetch question bank list: {error}',
      fetchQuestionsFailed: 'Failed to fetch question list',
      fetchQuestionsTimeout: 'Request timeout, please check your network connection or try again later',
      fetchQuestionsAuthFailed: 'Authentication failed, please log in again',
      fetchQuestionsUnknownError: 'Failed to fetch question list: {error}'
    }
  },
  
  // User Management Page
  userManagement: {
    title: 'User Management',
    description: 'Manage system users, assign permissions and roles',
    subtitle: 'Manage system users, assign permissions and roles',
    totalUsers: 'Total Users: {count}',
    activeUsers: 'Active: {count}',
    adminUsers: 'Admins: {count}',
    
    // Statistics
    stats: {
      total: 'Total Users: {count}',
      active: 'Active: {count}',
      admins: 'Admins: {count}'
    },

    search:{
      placeholder: 'Search username or email...',
    },
    
    roleFilter: 'Role Filter',
    allRoles: 'All Roles',
    statusFilter: 'Status Filter',
    allStatuses: 'All Statuses',
    resetFilters: 'Reset Filters',
    
    // Filter options
    filters: {
      role: {
        label: 'Role Filter',
        placeholder: 'All Roles'
      },
      status: {
        label: 'Status Filter',
        placeholder: 'All Statuses'
      },
      reset: 'Reset Filters'
    },
    
    // Role options
    roles: {
      superadmin: 'Super Administrator',
      admin: 'Administrator',
      teacher: 'Teacher',
      student: 'Student'
    },
    
    // Status options
    statuses: {
      active: 'Active',
      inactive: 'Inactive',
      suspended: 'Suspended'
    },
    
    // User list
    userList: {
      title: 'User List',
      count: 'Total {count} users',
      loading: 'Loading user data...',
      noData: 'No user data',
      userInfo: 'User Info',
      role: 'Role',
      status: 'Status',
      lastLogin: 'Last Login',
      registeredAt: 'Registration Time',
      operations: 'Operations',
      neverLoggedIn: 'Never logged in'
    },
    
    // Table related
    table: {
      userInfo: 'User Info',
      role: 'Role',
      status: 'Status',
      lastLogin: 'Last Login',
      registeredAt: 'Registration Time',
      actions: 'Operations',
      neverLoggedIn: 'Never logged in'
    },
    
    // Actions
    actions: {
      activate: 'Enable',
      deactivate: 'Disable',
      edit: 'Edit',
      delete: 'Delete'
    },
    
    // Edit user modal
    editUser: {
      title: 'Edit User',
      description: 'Modify user information and permission settings',
      name: 'Name',
      namePlaceholder: 'Please enter name',
      role: 'Role',
      selectRole: 'Select Role',
      department: 'Department',
      departmentPlaceholder: 'Please enter department',
      status: 'Status',
      selectStatus: 'Select Status',
      cancel: 'Cancel',
      save: 'Save',
      saving: 'Saving...'
    },
    
    // Operations
    operations: {
      confirmDelete: 'Are you sure you want to delete user "{name}"?',
      deleteConfirmMessage: 'This action cannot be undone.',
      deleteSuccess: 'User deleted successfully',
      deleteFailed: 'Failed to delete user',
      updateSuccess: 'User updated successfully',
      updateFailed: 'Failed to update user',
      updateStatusSuccess: 'User status updated successfully',
      updateStatusFailed: 'Failed to update user status'
    },
    
    // Error messages
    errors: {
      fetchUsersFailed: 'Failed to fetch user list',
      fetchUsersUnknownError: 'Failed to fetch user list: {error}'
    },
    
    // Loading states
    loading: {
      title: 'Loading user list...',
      description: 'Please wait, fetching user information',
      loadingData: 'Loading user data...'
    }
  }
};
