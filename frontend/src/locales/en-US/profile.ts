const profile = {
  // Page title and navigation
  pageTitle: 'Profile',
  pageDescription: 'Manage your account information and preferences',
  back: 'Back',
  loading: 'Loading...',
  
  // Loading page
  loadingProfile: 'Loading Profile',
  loadingProfileDescription: 'Getting your personal information, enterprise info, and VCount balance...',
  
  // User info card
  accountStatus: 'Account Status',
  emailVerification: 'Email Verification',
  normal: 'Normal',
  disabled: 'Disabled',
  verified: 'Verified',
  unverified: 'Unverified',
  registrationTime: 'Registration Time',
  lastLogin: 'Last Login',
  
  // VCount currency system
  vcount: 'VCount',
  currentBalance: 'Current Balance',
  totalRecharged: 'Total Recharged',
  totalSpent: 'Total Spent',
  transactionCount: 'Transaction Count',
  loadFailed: 'Load Failed',
  rechargeVCount: 'Recharge VCount',
  
  // Basic information
  basicInfo: 'Basic Information',
  edit: 'Edit',
  save: 'Save',
  cancel: 'Cancel',
  name: 'Name',
  email: 'Email',
  enterpriseName: 'Enterprise Name',
  role: 'Role',
  notJoinedEnterprise: 'Not Joined Enterprise',
  enterName: 'Enter name',
  
  // Role names
  roles: {
    superadmin: 'Super Admin',
    admin: 'Admin',
    teacher: 'Teacher',
    student: 'Student'
  },
  
  // Preferences
  preferences: 'Preferences',
  theme: 'Theme',
  language: 'Language',
  timezone: 'Timezone',
  notifications: 'Notifications',
  emailNotifications: 'Email Notifications',
  enabled: 'Enabled',
  disabledSetting: 'Disabled',
  
  // Theme options
  themes: {
    auto: 'Follow System',
    light: 'Light',
    dark: 'Dark'
  },
  
  // Language options
  languages: {
    'zh-CN': '中文',
    'en-US': 'English'
  },
  
  // Timezone related
  selectTimezone: 'Select Timezone',
  detectLocation: 'Detect',
  detecting: 'Detecting...',
  
  // Password change
  passwordChange: 'Password Change',
  changePassword: 'Change Password',
  confirmChange: 'Confirm Change',
  currentPassword: 'Current Password',
  newPassword: 'New Password',
  confirmNewPassword: 'Confirm New Password',
  enterCurrentPassword: 'Enter current password',
  enterNewPassword: 'Enter new password',
  enterNewPasswordAgain: 'Enter new password again',
  passwordSecurityTip: 'Regular password changes can improve account security',
  
  // Social features
  socialFeatures: 'Social Features',
  favoriteQuestions: 'Favorite Questions',
  followers: 'Followers',
  following: 'Following',
  favorites: 'favorites',
  followersCount: 'followers',
  followingCount: 'following',
  
  // Success messages
  success: {
    saveSuccess: 'Save Successful',
    profileUpdated: 'Profile has been updated',
    passwordChanged: 'Password Changed Successfully',
    passwordUpdated: 'Your password has been successfully updated',
    locationDetected: 'Location Detected',
    locationDetectedWithCity: 'Detected you are in {country} {city}, automatically set timezone to {timezone}',
    locationDetectedWithoutCity: 'Automatically set timezone to {timezone}'
  },
  
  // Error messages
  errors: {
    saveFailed: 'Save Failed',
    profileUpdateError: 'Error occurred while updating profile',
    passwordMismatch: 'Password Mismatch',
    passwordMismatchMessage: 'New password and confirm password do not match',
    passwordChangeFailed: 'Password Change Failed',
    passwordChangeError: 'Error occurred while changing password',
    locationFailed: 'Location Detection Failed',
    locationFailedMessage: 'Unable to get your location information, please select timezone manually'
  }
};

export default profile;
