// Settings page related texts - English
export const settings = {
  // Page titles
  title: 'System Settings',
  subtitle: 'Customize your application experience and preferences',
  
  // Appearance settings
  appearance: {
    title: 'Appearance Settings',
    subtitle: 'Customize interface theme and layout',
    theme: {
      title: 'Theme Mode',
      light: {
        title: 'Light Theme',
        description: 'Bright and clear interface'
      },
      dark: {
        title: 'Dark Theme',
        description: 'Eye-friendly and comfortable interface'
      },
      auto: {
        title: 'Follow System',
        description: 'Automatically follow system theme'
      }
    },
    layout: {
      title: 'Layout Mode',
      sidebar: {
        title: 'Sidebar Mode',
        description: 'Traditional sidebar navigation'
      },
      header: {
        title: 'Header Mode',
        description: 'Modern header navigation'
      }
    },
    language: {
      title: 'Interface Language',
      chinese: {
        title: '中文',
        description: 'Simplified Chinese Interface'
      },
      english: {
        title: 'English',
        description: 'English Interface'
      },
      updating: 'Updating language settings...'
    }
  },
  
  // Account security
  security: {
    title: 'Account Security',
    subtitle: 'Protect your account security',
    changePassword: 'Change Password',
    twoFactorAuth: 'Two-Factor Authentication',
    enableTwoFactor: 'Enable Two-Factor Authentication',
    disableTwoFactor: 'Disable Two-Factor Authentication',
    dataExport: 'Data Export',
    exporting: 'Exporting...',
    exportSuccess: 'Export Successful',
    exportFailed: 'Export Failed',
    exportMessage: 'Data has been successfully exported to your device',
    exportErrorMessage: 'Data export failed, please try again'
  },
  
  // Password change
  passwordChange: {
    title: 'Change Password',
    currentPassword: 'Current Password',
    currentPasswordPlaceholder: 'Enter current password',
    newPassword: 'New Password',
    newPasswordPlaceholder: 'Enter new password',
    confirmPassword: 'Confirm New Password',
    confirmPasswordPlaceholder: 'Enter new password again',
    changeSuccess: 'Change Successful',
    changeFailed: 'Change Failed',
    changeMessage: 'Password has been successfully changed, please log in with the new password',
    changeErrorMessage: 'Password change failed, please try again',
    passwordMismatch: 'New password and confirmation password do not match',
    passwordTooShort: 'New password must be at least 6 characters long'
  },
  
  // Two-factor authentication
  twoFactor: {
    enableSuccess: 'Two-factor authentication enabled',
    disableSuccess: 'Two-factor authentication disabled',
    enableFailed: 'Failed to enable two-factor authentication',
    disableFailed: 'Failed to disable two-factor authentication'
  },
  
  // Language settings
  language: {
    updateSuccess: 'Settings Updated',
    updateFailed: 'Settings Failed',
    updateMessage: 'Language settings have been updated',
    updateErrorMessage: 'Language settings failed, please try again'
  },
  
  // Common actions
  actions: {
    save: 'Save',
    cancel: 'Cancel',
    confirm: 'Confirm',
    close: 'Close',
    back: 'Back',
    next: 'Next',
    previous: 'Previous',
    finish: 'Finish',
    skip: 'Skip',
    retry: 'Retry',
    refresh: 'Refresh'
  },
  
  // Status messages
  status: {
    success: 'Success',
    error: 'Error',
    warning: 'Warning',
    info: 'Info',
    loading: 'Loading',
    saving: 'Saving',
    updating: 'Updating',
    deleting: 'Deleting',
    processing: 'Processing'
  },
  
  // Form validation
  validation: {
    required: 'This field is required',
    invalid: 'Invalid input format',
    tooShort: 'Input is too short',
    tooLong: 'Input is too long',
    notMatch: 'Inputs do not match',
    networkError: 'Network error, please check your connection',
    serverError: 'Server error, please try again later'
  },
  
  // Confirmation dialogs
  confirm: {
    title: 'Confirm Action',
    message: 'Are you sure you want to perform this action?',
    deleteTitle: 'Confirm Delete',
    deleteMessage: 'This action cannot be undone. Are you sure you want to delete?',
    cancelTitle: 'Cancel Operation',
    cancelMessage: 'Are you sure you want to cancel the current operation?'
  },
  
  // Error messages
  errors: {
    loadFailed: 'Load failed',
    saveFailed: 'Save failed',
    updateFailed: 'Update failed',
    deleteFailed: 'Delete failed',
    networkError: 'Network error',
    serverError: 'Server error',
    unauthorized: 'Unauthorized access',
    forbidden: 'Access forbidden',
    notFound: 'Not found',
    timeout: 'Request timeout',
    unknown: 'Unknown error'
  },
  
  // Success messages
  success: {
    loadSuccess: 'Load successful',
    saveSuccess: 'Save successful',
    updateSuccess: 'Update successful',
    deleteSuccess: 'Delete successful',
    operationSuccess: 'Operation successful'
  }
};
