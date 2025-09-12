export const ui = {
  // Common text
  common: {
    select: 'Please select...',
    search: 'Search...',
    clear: 'Clear',
    confirm: 'Confirm',
    cancel: 'Cancel',
    submit: 'Submit',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    close: 'Close',
    retry: 'Retry',
    loading: 'Loading...',
    saving: 'Saving...',
    processing: 'Processing...',
    noOptions: 'No options available',
    noMatches: 'No matching options found',
    clearAll: 'Clear all selections',
    required: 'This field is required',
    maxLength: 'Input cannot exceed {max} characters',
    characters: 'characters',
    back: 'Back',
    help: 'Get Help',
    documentation: 'View Documentation'
  },

  // Menu components
  menu: {
    fuzzySelect: {
      placeholder: 'Please select...',
      searchPlaceholder: 'Search...',
      noMatches: 'No matching options found'
    },
    multiSelect: {
      placeholder: 'Please select',
      searchPlaceholder: 'Search...',
      noMatches: 'No matching options found',
      clearAll: 'Clear all selections'
    },
    simpleSelect: {
      placeholder: 'Please select...',
      noOptions: 'No options available'
    }
  },

  // Alert component
  alert: {
    close: 'Close',
    confirm: 'Confirm',
    cancel: 'Cancel',
    processing: 'Processing...'
  },

  // Avatar component
  avatar: {
    defaultName: 'User Avatar',
    defaultInitials: 'U'
  },

  // Custom input modal
  customInputModal: {
    placeholder: 'Please enter...',
    submitText: 'OK',
    cancelText: 'Cancel',
    required: 'This field is required',
    maxLength: 'Input cannot exceed {max} characters',
    saving: 'Saving...',
    characters: 'characters'
  },

  // Error display
  errorDisplay: {
    network: {
      title: 'Network Connection Error',
      description: 'Unable to connect to server, please check your network connection',
      suggestions: [
        'Check if your network connection is working',
        'Verify the server address is correct',
        'Try refreshing the page'
      ]
    },
    file: {
      title: 'File Processing Error',
      description: 'File format not supported or file is corrupted',
      suggestions: [
        'Ensure file format is PDF, Word, or TeX',
        'Check if file is complete and not corrupted',
        'Try uploading the file again'
      ]
    },
    processing: {
      title: 'Processing Error',
      description: 'An error occurred during document processing',
      suggestions: [
        'File may contain complex formatting or special characters',
        'Try simplifying the document content before uploading',
        'Contact technical support for assistance'
      ]
    },
    permission: {
      title: 'Insufficient Permissions',
      description: 'Not enough permissions to perform this operation',
      suggestions: [
        'Make sure you are properly logged in',
        'Check your account permission settings',
        'Contact administrator for permissions'
      ]
    },
    unknown: {
      title: 'Unknown Error',
      description: 'An unexpected error occurred',
      suggestions: [
        'Try refreshing the page',
        'Clear browser cache',
        'Contact technical support'
      ]
    },
    suggestions: 'Suggested Solutions:',
    retry: 'Retry',
    help: 'Get Help',
    documentation: 'View Documentation'
  },

  // Loading page
  loadingPage: {
    loading: {
      title: 'Loading...',
      description: 'Please wait, processing your request'
    },
    error: {
      title: 'Loading Failed',
      description: 'An error occurred, please try again'
    },
    success: {
      title: 'Loading Complete',
      description: 'Data loaded successfully'
    },
    empty: {
      title: 'No Data',
      description: 'No content available to display'
    },
    retry: 'Retry'
  },

  // Loading spinner
  loadingSpinner: {
    loading: 'Loading...'
  },

  // Page header
  pageHeader: {
    back: 'Back'
  },

  // Password strength indicator
  passwordStrength: {
    strength: 'Password Strength',
    requirements: 'Password Security Requirements',
    length: 'Password length 8-20 characters',
    noUsername: 'Does not contain username-related content',
    noEmail: 'Does not contain email-related content',
    noBirthdate: 'Does not contain birth date format',
    noRepeats: 'No consecutive three identical characters',
    hasLowercase: 'Contains lowercase letters',
    hasUppercase: 'Contains uppercase letters',
    hasDigit: 'Contains numbers',
    hasSpecial: 'Contains special characters',
    noLowercase: 'lowercase letters',
    noUppercase: 'uppercase letters',
    noDigit: 'numbers',
    noSpecial: 'special characters',
    suggestInclude: 'Suggested to include:',
    allRequirementsMet: 'Password meets all security requirements!',
    passwordSecure: 'Password meets security requirements!',
    moreIssues: '{count} more issues...',
    weak: 'Weak',
    medium: 'Medium',
    strong: 'Strong'
  },

  // Role selector
  roleSelector: {
    memberRole: 'Member Role',
    selectRole: 'Select role...',
    confirmOwner: 'Confirm Owner Role Assignment',
    confirmOwnerMessage: 'Are you sure you want to set this member as the question bank owner? After setting, this member will have all management permissions, including the permission to delete the question bank.',
    confirmSet: 'Confirm Assignment',
    roles: {
      owner: {
        label: 'Owner',
        description: 'Has all permissions, can manage question banks and members'
      },
      manager: {
        label: 'Manager',
        description: 'Can manage question bank content, but cannot delete the question bank'
      },
      collaborator: {
        label: 'Collaborator',
        description: 'Can edit question bank content, but cannot manage members'
      },
      viewer: {
        label: 'Viewer',
        description: 'Can only view question bank content, cannot edit'
      }
    }
  },

  // Supported email suffixes
  supportedEmailSuffixes: {
    viewSupported: 'View Supported Enterprise Email Suffixes',
    title: 'Supported Enterprise Email Suffixes',
    description: 'The following email suffixes can be used for enterprise user registration',
    refresh: 'Refresh Enterprise Information',
    registeredEnterprises: 'Registered Enterprises (Direct Registration Available)',
    availableSlots: '{count} slots available',
    slotsFull: 'Slots full',
    registrationInstructions: 'Registration Instructions',
    greenArea: 'Green Area',
    greenAreaDesc: ': Registered enterprises, can register directly and view remaining slots',
    blueArea: 'Blue Area',
    blueAreaDesc: ': Supported enterprise email types, need to contact administrator to enable',
    enterpriseBenefits: '• Using enterprise email registration can enjoy enterprise-level features and services',
    personalEmail: '• Personal emails (such as @qq.com, @163.com, @gmail.com) only support personal user registration',
    contactAdmin: '• To enable new enterprise email support, please contact system administrator email: admin@viquard.com',
    gotIt: 'Got it',
    categories: {
      education: 'Educational Institutions',
      government: 'Government Agencies',
      techCompanies: 'Famous Tech Companies',
      international: 'International Enterprises'
    }
  },

  // Tag selector
  tagSelector: {
    selectTags: 'Select Tags',
    selectedTags: 'Selected Tags',
    clear: 'Clear',
    searchTags: 'Search tags...',
    availableTags: 'Available Tags',
    noMatchingTags: 'No matching tags found',
    allTagsSelected: 'All tags have been selected',
    clearSearch: 'Clear Search',
    totalTags: 'Total {total} tags, {selected} selected'
  },

  // Theme toggle
  themeToggle: {
    currentTheme: 'Current Theme',
    light: 'Light',
    dark: 'Dark',
    system: 'System',
    lightTheme: 'Light Theme',
    darkTheme: 'Dark Theme',
    followSystem: 'Follow System'
  },

  // Uploading spinner
  uploadingSpinner: {
    uploading: 'Uploading...',
    uploadFailed: 'Upload Failed',
    uploadSuccess: 'Upload Successful'
  }
};
