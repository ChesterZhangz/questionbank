// 设置页面相关文本 - 中文
export const settings = {
  // 页面标题
  title: '系统设置',
  subtitle: '自定义您的应用体验和偏好设置',
  
  // 外观设置
  appearance: {
    title: '外观设置',
    subtitle: '自定义界面主题和布局',
    theme: {
      title: '主题模式',
      light: {
        title: '浅色主题',
        description: '明亮清晰的界面'
      },
      dark: {
        title: '深色主题',
        description: '护眼舒适的界面'
      },
      auto: {
        title: '跟随系统',
        description: '自动跟随系统主题'
      }
    },
    layout: {
      title: '布局模式',
      sidebar: {
        title: '侧边栏模式',
        description: '传统侧边导航'
      },
      header: {
        title: '顶部导航模式',
        description: '现代顶部导航'
      }
    },
    language: {
      title: '界面语言',
      chinese: {
        title: '中文',
        description: '简体中文界面'
      },
      english: {
        title: 'English',
        description: 'English Interface'
      },
      updating: '正在更新语言设置...'
    }
  },
  
  // 账户安全
  security: {
    title: '账户安全',
    subtitle: '保护您的账户安全',
    changePassword: '修改密码',
    twoFactorAuth: '两步验证',
    enableTwoFactor: '启用两步验证',
    disableTwoFactor: '禁用两步验证',
    dataExport: '数据导出',
    exporting: '导出中...',
    exportSuccess: '导出成功',
    exportFailed: '导出失败',
    exportMessage: '数据已成功导出到您的设备',
    exportErrorMessage: '数据导出失败，请重试'
  },
  
  // 密码修改
  passwordChange: {
    title: '修改密码',
    currentPassword: '当前密码',
    currentPasswordPlaceholder: '输入当前密码',
    newPassword: '新密码',
    newPasswordPlaceholder: '输入新密码',
    confirmPassword: '确认新密码',
    confirmPasswordPlaceholder: '再次输入新密码',
    changeSuccess: '修改成功',
    changeFailed: '修改失败',
    changeMessage: '密码已成功修改，请使用新密码重新登录',
    changeErrorMessage: '密码修改失败，请重试',
    passwordMismatch: '新密码和确认密码不匹配',
    passwordTooShort: '新密码长度至少6位'
  },
  
  // 两步验证
  twoFactor: {
    enableSuccess: '两步验证已启用',
    disableSuccess: '两步验证已禁用',
    enableFailed: '启用两步验证失败',
    disableFailed: '禁用两步验证失败'
  },
  
  // 语言设置
  language: {
    updateSuccess: '设置成功',
    updateFailed: '设置失败',
    updateMessage: '语言设置已更新',
    updateErrorMessage: '语言设置失败，请重试'
  },
  
  // 通用操作
  actions: {
    save: '保存',
    cancel: '取消',
    confirm: '确认',
    close: '关闭',
    back: '返回',
    next: '下一步',
    previous: '上一步',
    finish: '完成',
    skip: '跳过',
    retry: '重试',
    refresh: '刷新'
  },
  
  // 状态提示
  status: {
    success: '成功',
    error: '错误',
    warning: '警告',
    info: '信息',
    loading: '加载中',
    saving: '保存中',
    updating: '更新中',
    deleting: '删除中',
    processing: '处理中'
  },
  
  // 表单验证
  validation: {
    required: '此字段为必填项',
    invalid: '输入格式无效',
    tooShort: '输入内容太短',
    tooLong: '输入内容太长',
    notMatch: '两次输入不匹配',
    networkError: '网络错误，请检查网络连接',
    serverError: '服务器错误，请稍后重试'
  },
  
  // 确认对话框
  confirm: {
    title: '确认操作',
    message: '确定要执行此操作吗？',
    deleteTitle: '确认删除',
    deleteMessage: '删除后无法恢复，确定要删除吗？',
    cancelTitle: '取消操作',
    cancelMessage: '确定要取消当前操作吗？'
  },
  
  // 错误信息
  errors: {
    loadFailed: '加载失败',
    saveFailed: '保存失败',
    updateFailed: '更新失败',
    deleteFailed: '删除失败',
    networkError: '网络错误',
    serverError: '服务器错误',
    unauthorized: '未授权访问',
    forbidden: '禁止访问',
    notFound: '未找到',
    timeout: '请求超时',
    unknown: '未知错误'
  },
  
  // 成功信息
  success: {
    loadSuccess: '加载成功',
    saveSuccess: '保存成功',
    updateSuccess: '更新成功',
    deleteSuccess: '删除成功',
    operationSuccess: '操作成功'
  }
};
