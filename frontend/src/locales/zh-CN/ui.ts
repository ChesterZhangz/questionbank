export const ui = {
  // 通用文本
  common: {
    select: '请选择...',
    search: '搜索...',
    clear: '清空',
    confirm: '确认',
    cancel: '取消',
    submit: '提交',
    save: '保存',
    delete: '删除',
    edit: '编辑',
    close: '关闭',
    retry: '重试',
    loading: '加载中...',
    saving: '保存中...',
    processing: '处理中...',
    noOptions: '没有可选项',
    noMatches: '没有找到匹配的选项',
    clearAll: '清空所有选择',
    required: '此项为必填项',
    maxLength: '输入内容不能超过{max}个字符',
    characters: '字符',
    back: '返回',
    help: '获取帮助',
    documentation: '查看文档'
  },

  // 菜单组件
  menu: {
    fuzzySelect: {
      placeholder: '请选择...',
      searchPlaceholder: '搜索...',
      noMatches: '没有找到匹配的选项'
    },
    multiSelect: {
      placeholder: '请选择',
      searchPlaceholder: '搜索...',
      noMatches: '没有找到匹配的选项',
      clearAll: '清空所有选择'
    },
    simpleSelect: {
      placeholder: '请选择...',
      noOptions: '没有可选项'
    }
  },

  // 警告组件
  alert: {
    close: '关闭',
    confirm: '确认',
    cancel: '取消',
    processing: '处理中...'
  },

  // 头像组件
  avatar: {
    defaultName: '用户头像',
    defaultInitials: '用'
  },

  // 自定义输入模态框
  customInputModal: {
    placeholder: '请输入...',
    submitText: '确定',
    cancelText: '取消',
    required: '此项为必填项',
    maxLength: '输入内容不能超过{max}个字符',
    saving: '保存中...',
    characters: '字符'
  },

  // 错误显示
  errorDisplay: {
    network: {
      title: '网络连接错误',
      description: '无法连接到服务器，请检查网络连接',
      suggestions: [
        '检查网络连接是否正常',
        '确认服务器地址是否正确',
        '尝试刷新页面重试'
      ]
    },
    file: {
      title: '文件处理错误',
      description: '文件格式不支持或文件损坏',
      suggestions: [
        '确认文件格式为 PDF、Word 或 TeX',
        '检查文件是否完整且未损坏',
        '尝试重新上传文件'
      ]
    },
    processing: {
      title: '处理过程错误',
      description: '文档处理过程中出现错误',
      suggestions: [
        '文件可能包含复杂格式或特殊字符',
        '尝试简化文档内容后重新上传',
        '联系技术支持获取帮助'
      ]
    },
    permission: {
      title: '权限不足',
      description: '没有足够的权限执行此操作',
      suggestions: [
        '确认已正确登录系统',
        '检查账户权限设置',
        '联系管理员获取权限'
      ]
    },
    unknown: {
      title: '未知错误',
      description: '发生了意外的错误',
      suggestions: [
        '尝试刷新页面',
        '清除浏览器缓存',
        '联系技术支持'
      ]
    },
    suggestions: '建议解决方案：',
    retry: '重试',
    help: '获取帮助',
    documentation: '查看文档'
  },

  // 加载页面
  loadingPage: {
    loading: {
      title: '加载中...',
      description: '请稍候，正在处理您的请求'
    },
    error: {
      title: '加载失败',
      description: '发生了一个错误，请重试'
    },
    success: {
      title: '加载完成',
      description: '数据加载成功'
    },
    empty: {
      title: '暂无数据',
      description: '当前没有可显示的内容'
    },
    retry: '重试'
  },

  // 加载旋转器
  loadingSpinner: {
    loading: '加载中...'
  },

  // 页面头部
  pageHeader: {
    back: '返回'
  },

  // 密码强度指示器
  passwordStrength: {
    strength: '密码强度',
    requirements: '密码安全要求',
    length: '密码长度8-20位',
    noUsername: '不包含用户名相关内容',
    noEmail: '不包含邮箱相关内容',
    noBirthdate: '不包含生日日期格式',
    noRepeats: '无连续三位相同字符',
    hasLowercase: '包含小写字母',
    hasUppercase: '包含大写字母',
    hasDigit: '包含数字',
    hasSpecial: '包含特殊字符',
    noLowercase: '小写字母',
    noUppercase: '大写字母',
    noDigit: '数字',
    noSpecial: '特殊字符',
    suggestInclude: '建议包含：',
    allRequirementsMet: '密码符合所有安全要求！',
    passwordSecure: '密码符合安全要求！',
    moreIssues: '还有 {count} 个问题...',
    weak: '弱',
    medium: '中等',
    strong: '强'
  },

  // 角色选择器
  roleSelector: {
    memberRole: '成员身份',
    selectRole: '选择身份...',
    confirmOwner: '确认设置所有者身份',
    confirmOwnerMessage: '确定要将此成员设置为试卷集所有者吗？设置后该成员将拥有所有管理权限，包括删除试卷集的权限。',
    confirmSet: '确认设置',
    roles: {
      owner: {
        label: '所有者',
        description: '拥有所有权限，可以管理试卷集和成员'
      },
      manager: {
        label: '管理员',
        description: '可以管理试卷集内容，但不能删除试卷集'
      },
      collaborator: {
        label: '协作者',
        description: '可以编辑试卷集内容，但不能管理成员'
      },
      viewer: {
        label: '查看者',
        description: '只能查看试卷集内容，不能进行编辑'
      }
    }
  },

  // 支持的企业邮箱后缀
  supportedEmailSuffixes: {
    viewSupported: '查看支持的企业邮箱后缀',
    title: '支持的企业邮箱后缀',
    description: '以下邮箱后缀可用于企业用户注册',
    refresh: '刷新企业信息',
    registeredEnterprises: '已开通企业（可直接注册）',
    availableSlots: '{count}个名额可用',
    slotsFull: '名额已满',
    registrationInstructions: '注册说明',
    greenArea: '绿色区域',
    greenAreaDesc: '：已开通企业，可直接注册并查看剩余名额',
    blueArea: '蓝色区域',
    blueAreaDesc: '：支持的企业邮箱类型，需要联系管理员开通',
    enterpriseBenefits: '• 使用企业邮箱注册可享受企业级功能和服务',
    personalEmail: '• 个人邮箱（如 @qq.com、@163.com、@gmail.com）仅支持个人用户注册',
    contactAdmin: '• 如需开通新的企业邮箱支持，请联系系统管理员邮箱：admin@viquard.com',
    gotIt: '知道了',
    categories: {
      education: '教育机构',
      government: '政府机构',
      techCompanies: '知名科技公司',
      international: '国际企业'
    }
  },

  // 标签选择器
  tagSelector: {
    selectTags: '选择标签',
    selectedTags: '已选标签',
    clear: '清空',
    searchTags: '搜索标签...',
    availableTags: '可用标签',
    noMatchingTags: '没有找到匹配的标签',
    allTagsSelected: '所有标签都已选择',
    clearSearch: '清除搜索',
    totalTags: '共 {total} 个标签，已选择 {selected} 个'
  },

  // 主题切换器
  themeToggle: {
    currentTheme: '当前主题',
    light: '亮色',
    dark: '暗色',
    system: '系统',
    lightTheme: '亮色主题',
    darkTheme: '暗色主题',
    followSystem: '跟随系统'
  },

  // 上传旋转器
  uploadingSpinner: {
    uploading: '正在上传...',
    uploadFailed: '上传失败',
    uploadSuccess: '上传成功'
  }
};
