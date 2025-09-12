export const auth = {
  // 登录页面
  login: {
    title: '登录',
    subtitle: '欢迎回来！请登录您的账户',
    email: '邮箱地址',
    password: '密码',
    loginButton: '登录',
    forgotPassword: '忘记密码？',
    noAccount: '还没有账户？',
    registerLink: '立即注册',
    errors: {
      emailRequired: '请输入邮箱地址',
      passwordRequired: '请输入密码',
      passwordMinLength: '密码至少6位',
      invalidCredentials: '邮箱或密码错误',
      loginFailed: '登录失败，请重试'
    },
    forgotPasswordModal: {
      title: '重置密码',
      description: '请输入您的邮箱地址，我们将发送重置密码的链接给您',
      email: '邮箱地址',
      sendButton: '发送重置链接',
      cancelButton: '取消',
      successTitle: '邮件已发送',
      successMessage: '重置密码的链接已发送到您的邮箱，请查收邮件并按照说明重置密码',
      closeButton: '关闭',
      errors: {
        emailRequired: '请输入邮箱地址',
        emailInvalid: '请输入有效的邮箱地址',
        sendFailed: '发送失败，请重试'
      }
    }
  },

  // 注册页面
  register: {
    title: '注册',
    subtitle: '创建您的账户',
    name: '姓名',
    email: '邮箱地址',
    password: '密码',
    confirmPassword: '确认密码',
    registerButton: '注册',
    hasAccount: '已有账户？',
    loginLink: '立即登录',
    errors: {
      nameRequired: '请输入姓名',
      emailRequired: '请输入邮箱地址',
      emailInvalid: '请输入有效的邮箱地址',
      passwordRequired: '请输入密码',
      passwordMinLength: '密码至少8位',
      passwordWeak: '密码强度太弱',
      confirmPasswordRequired: '请确认密码',
      passwordsNotMatch: '两次输入的密码不一致',
      registerFailed: '注册失败，请重试',
      emailExists: '该邮箱已被注册'
    },
    passwordStrength: {
      weak: '弱',
      medium: '中等',
      strong: '强',
      veryStrong: '很强'
    },
    supportedEmailSuffixes: {
      title: '支持的邮箱后缀',
      description: '我们支持以下邮箱后缀注册'
    }
  },

  // 重置密码页面
  resetPassword: {
    title: '重置密码',
    subtitle: '请输入您的新密码',
    newPassword: '新密码',
    confirmPassword: '确认密码',
    resetButton: '重置密码',
    successTitle: '密码重置成功',
    successMessage: '您的密码已成功重置，请使用新密码登录',
    loginButton: '返回登录',
    errors: {
      passwordRequired: '请输入新密码',
      passwordMinLength: '密码至少8位',
      passwordWeak: '密码强度太弱',
      confirmPasswordRequired: '请确认密码',
      passwordsNotMatch: '两次输入的密码不一致',
      resetFailed: '重置失败，请重试',
      tokenInvalid: '重置链接无效或已过期'
    },
    tokenValidation: {
      loading: '正在验证重置链接...',
      invalid: '重置链接无效或已过期',
      expired: '重置链接已过期，请重新申请'
    }
  },

  // 邮箱验证页面
  emailVerification: {
    title: '邮箱验证',
    loading: '正在验证邮箱...',
    successTitle: '邮箱验证成功',
    successMessage: '您的邮箱已验证成功，现在可以正常使用所有功能',
    loginButton: '返回登录',
    errorTitle: '验证失败',
    errorMessage: '邮箱验证失败，请检查链接是否正确或重新申请验证',
    resendButton: '重新发送验证邮件',
    retryButton: '重试',
    errors: {
      tokenInvalid: '验证链接无效',
      tokenExpired: '验证链接已过期',
      verificationFailed: '验证失败，请重试',
      resendFailed: '重新发送失败，请重试'
    }
  },

  // 注册成功页面
  registerSuccess: {
    title: '注册成功',
    subtitle: '欢迎加入我们！',
    message: '您的账户已创建成功，请查收邮箱中的验证邮件并完成邮箱验证',
    checkEmail: '请检查您的邮箱',
    emailSent: '验证邮件已发送到您的邮箱',
    loginButton: '返回登录',
    resendButton: '重新发送验证邮件',
    features: {
      title: '注册成功，您可以：',
      createQuestionBank: '创建和管理题库',
      collaborate: '与团队成员协作',
      aiAnalysis: '使用AI智能分析',
      exportPapers: '导出试卷和练习'
    },
    modal: {
      resendTitle: '重新发送验证邮件',
      resendMessage: '验证邮件已重新发送，请查收邮箱',
      closeButton: '关闭'
    }
  },

  // 通用
  common: {
    loading: '加载中...',
    success: '成功',
    error: '错误',
    warning: '警告',
    info: '提示',
    confirm: '确认',
    cancel: '取消',
    close: '关闭',
    back: '返回',
    next: '下一步',
    previous: '上一步',
    submit: '提交',
    save: '保存',
    edit: '编辑',
    delete: '删除',
    create: '创建',
    update: '更新',
    search: '搜索',
    filter: '筛选',
    sort: '排序',
    refresh: '刷新',
    retry: '重试',
    continue: '继续',
    finish: '完成',
    done: '完成',
    ok: '确定',
    yes: '是',
    no: '否'
  }
};
