export const auth = {
  // Login page
  login: {
    title: 'Login',
    subtitle: 'Welcome back! Please sign in to your account',
    email: 'Email Address',
    password: 'Password',
    loginButton: 'Sign In',
    forgotPassword: 'Forgot Password?',
    noAccount: "Don't have an account?",
    registerLink: 'Sign Up Now',
    errors: {
      emailRequired: 'Please enter your email address',
      passwordRequired: 'Please enter your password',
      passwordMinLength: 'Password must be at least 6 characters',
      invalidCredentials: 'Invalid email or password',
      loginFailed: 'Login failed, please try again'
    },
    forgotPasswordModal: {
      title: 'Reset Password',
      description: 'Please enter your email address, and we will send you a password reset link',
      email: 'Email Address',
      sendButton: 'Send Reset Link',
      cancelButton: 'Cancel',
      successTitle: 'Email Sent',
      successMessage: 'Password reset link has been sent to your email. Please check your inbox and follow the instructions to reset your password',
      closeButton: 'Close',
      errors: {
        emailRequired: 'Please enter your email address',
        emailInvalid: 'Please enter a valid email address',
        sendFailed: 'Failed to send, please try again'
      }
    }
  },

  // Register page
  register: {
    title: 'Register',
    subtitle: 'Create your account',
    name: 'Full Name',
    email: 'Email Address',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    registerButton: 'Sign Up',
    hasAccount: 'Already have an account?',
    loginLink: 'Sign In Now',
    errors: {
      nameRequired: 'Please enter your full name',
      emailRequired: 'Please enter your email address',
      emailInvalid: 'Please enter a valid email address',
      passwordRequired: 'Please enter your password',
      passwordMinLength: 'Password must be at least 8 characters',
      passwordWeak: 'Password is too weak',
      confirmPasswordRequired: 'Please confirm your password',
      passwordsNotMatch: 'Passwords do not match',
      registerFailed: 'Registration failed, please try again',
      emailExists: 'This email is already registered'
    },
    passwordStrength: {
      weak: 'Weak',
      medium: 'Medium',
      strong: 'Strong',
      veryStrong: 'Very Strong'
    },
    supportedEmailSuffixes: {
      title: 'Supported Email Suffixes',
      description: 'We support registration with the following email suffixes'
    }
  },

  // Reset password page
  resetPassword: {
    title: 'Reset Password',
    subtitle: 'Please enter your new password',
    newPassword: 'New Password',
    confirmPassword: 'Confirm Password',
    resetButton: 'Reset Password',
    successTitle: 'Password Reset Successful',
    successMessage: 'Your password has been successfully reset. Please use your new password to sign in',
    loginButton: 'Back to Login',
    errors: {
      passwordRequired: 'Please enter your new password',
      passwordMinLength: 'Password must be at least 8 characters',
      passwordWeak: 'Password is too weak',
      confirmPasswordRequired: 'Please confirm your password',
      passwordsNotMatch: 'Passwords do not match',
      resetFailed: 'Reset failed, please try again',
      tokenInvalid: 'Reset link is invalid or expired'
    },
    tokenValidation: {
      loading: 'Validating reset link...',
      invalid: 'Reset link is invalid or expired',
      expired: 'Reset link has expired, please request a new one'
    }
  },

  // Email verification page
  emailVerification: {
    title: 'Email Verification',
    loading: 'Verifying email...',
    successTitle: 'Email Verified Successfully',
    successMessage: 'Your email has been successfully verified. You can now use all features',
    loginButton: 'Back to Login',
    errorTitle: 'Verification Failed',
    errorMessage: 'Email verification failed. Please check if the link is correct or request a new verification',
    resendButton: 'Resend Verification Email',
    retryButton: 'Retry',
    errors: {
      tokenInvalid: 'Verification link is invalid',
      tokenExpired: 'Verification link has expired',
      verificationFailed: 'Verification failed, please try again',
      resendFailed: 'Failed to resend, please try again'
    }
  },

  // Register success page
  registerSuccess: {
    title: 'Registration Successful',
    subtitle: 'Welcome to our platform!',
    message: 'Your account has been created successfully. Please check your email for the verification link and complete email verification',
    checkEmail: 'Please check your email',
    emailSent: 'Verification email has been sent to your inbox',
    loginButton: 'Back to Login',
    resendButton: 'Resend Verification Email',
    features: {
      title: 'Registration successful, you can now:',
      createQuestionBank: 'Create and manage question banks',
      collaborate: 'Collaborate with team members',
      aiAnalysis: 'Use AI-powered analysis',
      exportPapers: 'Export papers and exercises'
    },
    modal: {
      resendTitle: 'Resend Verification Email',
      resendMessage: 'Verification email has been resent, please check your inbox',
      closeButton: 'Close'
    }
  },

  // Common
  common: {
    loading: 'Loading...',
    success: 'Success',
    error: 'Error',
    warning: 'Warning',
    info: 'Info',
    confirm: 'Confirm',
    cancel: 'Cancel',
    close: 'Close',
    back: 'Back',
    next: 'Next',
    previous: 'Previous',
    submit: 'Submit',
    save: 'Save',
    edit: 'Edit',
    delete: 'Delete',
    create: 'Create',
    update: 'Update',
    search: 'Search',
    filter: 'Filter',
    sort: 'Sort',
    refresh: 'Refresh',
    retry: 'Retry',
    continue: 'Continue',
    finish: 'Finish',
    done: 'Done',
    ok: 'OK',
    yes: 'Yes',
    no: 'No'
  }
};
