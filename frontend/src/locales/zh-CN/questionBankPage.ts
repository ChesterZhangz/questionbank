// 题库页面相关文本 - 中文
export const questionBankPage = {
  // CreateQuestionBankPage - 创建题库页面
  CreateQuestionBankPage: {
    // 页面标题
    title: '创建题库',
    description: '创建新的数学题库',
    
    // 表单标签
    form: {
      name: '题库名称',
      description: '题库描述',
      category: '题库分类',
      tags: '题库标签',
      settings: '题库设置'
    },
    
    // 占位符
    placeholders: {
      name: '请输入题库名称',
      description: '请输入题库描述（可选）',
      category: '选择题库分类',
      tags: '输入标签'
    },
    
    // 设置选项
    settings: {
      title: '题库设置',
      isPublic: '公开题库',
      allowCollaboration: '允许协作'
    },
    
    // 按钮
    buttons: {
      back: '返回',
      cancel: '取消',
      create: '创建题库',
      add: '添加'
    },
    
    // 错误信息
    errors: {
      nameRequired: '请输入题库名称',
      nameTooLong: '题库名称不能超过50个字符',
      descriptionTooLong: '题库描述不能超过500个字符',
      createFailed: '创建题库失败'
    }
  },

  // CreateQuestionPage - 创建题目页面
  CreateQuestionPage: {
    // 页面标题
    title: '创建题目',
    description: '为题库添加新的题目',
    batchTitle: '批量编辑题目',
    batchDescription: '批量编辑多个题目',
    
    // 导航
    navigation: {
      back: '返回',
      exitBatch: '退出批量编辑',
      previous: '上一题',
      next: '下一题'
    },
    
    // 题目类型
    questionTypes: {
      choice: '选择题',
      fill: '填空题',
      solution: '解答题',
      singleChoice: '单选题',
      multipleChoice: '多选题'
    },
    
    // 操作按钮
    buttons: {
      save: '保存题目',
      saving: '保存中...',
      create: '创建题目',
      cancel: '取消',
      reset: '重置',
      expand: '展开',
      collapse: '收起',
      expandTags: '展开标签',
      collapseTags: '收起标签',
      addOption: '添加选项'
    },
    
    // 功能按钮
    actions: {
      multiUpload: '上传多题',
      ocrScan: 'OCR扫描',
      smartAnalysis: '智能分析',
      analyzing: '分析中...'
    },
    
    // 快捷键提示
    shortcuts: {
      multiMode: '(Ctrl+Shift+M)',
      ocr: '(Ctrl+Shift+O)',
      analysis: '(Ctrl+Shift+A)'
    },
    
    // 标签页
    tabs: {
      stem: '题干',
      media: '图形',
      solution: '解析'
    },
    
    // 表单标签
    form: {
      questionContent: '题目内容',
      options: '选项设置',
      answers: '答案设置',
      difficulty: '难度',
      category: '小题型',
      tags: '知识点标签',
      source: '题目出处',
      solution: '解析内容'
    },
    
    // 占位符
    placeholders: {
      questionContent: '输入题目内容',
      solution: '输入题目解析',
      answer: '答案 {number}',
      category: '选择题库'
    },
    
    // 选项设置
    options: {
      option: '选项 {number}',
      title: '选项设置',
      questionType: '题目类型',
      singleChoice: '单选题',
      multipleChoice: '多选题',
      autoDetected: '系统自动判断',
      selectedAnswer: '已选择答案',
      addOption: '添加选项',
      removeOption: '删除选项',
      select: '选择答案',
      unselect: '取消选择'
    },
    
    // 答案设置
    answers: {
      title: '答案设置',
      fillInstructions: '根据题干中的 \\fill 数量，填写对应的答案：',
      solutionInstructions: '根据题干中的 \\subp 和 \\subsubp 数量，填写对应的答案：',
      fillNumber: '第 {number} 空',
      solutionAnswer: '{label}：',
      noFillFound: '题干中没有找到 \\fill，请先添加填空题标记',
      addAnswer: '添加答案',
      removeAnswer: '删除答案'
    },
    
    // 难度等级
    difficulty: {
      title: '难度',
      veryEasy: '非常简单',
      easy: '简单',
      medium: '中等',
      hard: '困难',
      veryHard: '非常困难'
    },
    
    // 预览
    preview: {
      title: '题目预览'
    },
    
    // 媒体
    media: {
      title: '图形管理'
    },
    
    // 权限相关
    permissions: {
      insufficient: '权限不足',
      noPermission: '您没有权限为任何题库创建题目.只有题库的创建者、管理员或协作者才能创建题目.',
      noPermissionForBank: '您没有权限为该题库创建题目.只有题库的创建者、管理员或协作者才能创建题目.'
    },
    
    // 状态提示
    status: {
      hasChanges: '有未保存的更改',
      detecting: '检测中...',
      detectingSimilarity: '检测中...',
      similarityWarning: '发现 {count} 个相似题目 ({percentage}%)',
      similarityFound: '发现 {count} 个相似题目 ({percentage}%)',
      loadingBanks: '加载题库信息中...',
      loadingBanksDesc: '正在获取题库信息，请稍候',
      noContent: '暂无题目内容',
      noAvailableBanks: '共 {total} 个题库，其中 {available} 个可用'
    },
    
    // 错误信息
    errors: {
      selectBank: '请先选择题库',
      enterContent: '请输入题目内容',
      selectAnswer: '请选择答案',
      completeOptions: '请完善选项内容',
      completeFillAnswers: '请完善填空题答案',
      completeSolutionAnswers: '请完善解答题答案',
      saveFailed: '保存题目时发生错误，请重试',
      loadFailed: '获取题库列表失败，请刷新页面重试',
      analysisFailed: '智能分析失败，请稍后重试',
      ocrFailed: 'OCR识别失败',
      similarityDetectionFailed: '相似度检测失败，请稍后重试'
    },
    
    // 成功提示
    success: {
      saved: '题目已成功保存！',
      analysisComplete: '智能分析已完成，已自动填充相关属性',
      ocrComplete: '图片识别完成，内容已自动填充',
      multiQuestionsGenerated: '已成功生成 {count} 道题目！',
      multiQuestionsSaved: '多道题目已成功保存！',
      questionTypeChanged: '题型已切换！'
    },
    
    // 确认对话框
    confirm: {
      exitMultiMode: '退出多题目模式',
      exitMultiModeMessage: '确定要退出多题目模式吗？未保存的题目将会丢失.'
    }
  },

  // EditQuestionBankPage - 编辑题库页面
  EditQuestionBankPage: {
    // 页面标题
    title: '编辑题库',
    description: '修改题库信息',
    
    // 表单标签
    form: {
      name: '题库名称',
      description: '题库描述',
      category: '题库分类',
      tags: '标签'
    },
    
    // 占位符
    placeholders: {
      name: '请输入题库名称',
      description: '请输入题库描述...',
      category: '选择题库分类',
      tags: '输入标签'
    },
    
    // 设置选项
    settings: {
      isPublic: '公开题库（其他用户可以查看）',
      allowCollaboration: '允许协作（同企业邮箱用户可以参与）'
    },
    
    // 按钮
    buttons: {
      back: '返回',
      cancel: '取消',
      save: '保存修改',
      add: '添加'
    },
    
    // 错误信息
    errors: {
      nameRequired: '题库名称不能为空',
      updateFailed: '更新题库失败',
      loadFailed: '获取题库信息失败',
      notFound: '题库不存在'
    }
  },

  // EditQuestionPage - 编辑题目页面
  EditQuestionPage: {
    // 页面标题
    title: '编辑题目',
    
    // 导航
    navigation: {
      back: '返回题库',
      previous: '上一题',
      next: '下一题'
    },
    
    // 题目类型
    questionTypes: {
      choice: '选择题',
      fill: '填空题',
      solution: '解答题',
      singleChoice: '单选题',
      multipleChoice: '多选题'
    },
    
    // 操作按钮
    buttons: {
      save: '保存',
      saving: '保存中...',
      reset: '重置',
      resetting: '正在重置...',
      addOption: '添加选项'
    },
    
    // 标签页
    tabs: {
      stem: '题干',
      media: '图形',
      solution: '解析'
    },
    
    // 表单标签
    form: {
      questionContent: '题目内容',
      options: '选项设置',
      answers: '答案设置',
      difficulty: '难度',
      category: '小题型',
      tags: '知识点标签',
      source: '题目出处',
      solution: '解析内容'
    },
    
    // 占位符
    placeholders: {
      questionContent: '输入题目内容',
      solution: '输入题目解析',
      answer: '答案 {number}'
    },
    
    // 媒体
    media: {
      title: '图形管理'
    },
    
    // 选项设置
    options: {
      title: '选项设置',
      questionType: '题目类型',
      singleChoice: '单选题',
      multipleChoice: '多选题',
      autoDetected: '系统自动判断',
      selectedAnswer: '已选择答案',
      addOption: '添加选项',
      removeOption: '删除选项',
      select: '选择答案',
      unselect: '取消选择',
      delete: '删除'
    },
    
    // 答案设置
    answers: {
      title: '答案设置',
      fillInstructions: '根据题干中的 \\fill 数量，填写对应的答案：',
      solutionInstructions: '根据题干中的 \\subp 和 \\subsubp 数量，填写对应的答案：',
      fillDescription: '根据题干中的 \\fill 数量，填写对应的答案：',
      solutionDescription: '根据题干中的 \\subp 和 \\subsubp 数量，填写对应的答案：',
      fillAnswer: '第 {index} 空：',
      solutionAnswer: '{label}：',
      fillNumber: '第 {number} 空',
      noFillFound: '题干中没有找到 \\fill，请先添加填空题标记',
      addAnswer: '添加答案',
      removeAnswer: '删除答案'
    },
    
    // 难度等级
    difficulty: {
      title: '难度',
      veryEasy: '非常简单',
      easy: '简单',
      medium: '中等',
      hard: '困难',
      veryHard: '非常困难'
    },
    
    // 状态提示
    status: {
      hasChanges: '有未保存的更改',
      loading: '加载题目中...',
      loadingDesc: '正在获取题目信息，请稍候'
    },
    
    // 确认对话框
    confirm: {
      leave: '确认离开',
      leaveMessage: '您有未保存的更改，确定要离开吗？',
      reset: '确认重置',
      resetMessage: '确定要重置所有更改吗？'
    },
    
    // 错误信息
    errors: {
      notFound: '题目不存在',
      loadFailed: '无法加载题目信息',
      saveFailed: '保存失败'
    },
    
    // 成功提示
    success: {
      saved: '题目保存成功！',
      questionTypeChanged: '题型切换成功'
    },
    
    // 预览
    preview: {
      title: '题目预览',
      noContent: '暂无内容',
      questionType: '题目类型',
      difficulty: '难度等级',
      category: '题目分类',
      tags: '题目标签',
      questionContent: '题目内容',
      options: '选项',
      answers: '答案',
      solution: '解析'
    }
  },

  // QuestionBankDetailPage - 题库详情页面
  QuestionBankDetailPage: {
    // 页面标题
    title: '题库详情',
    
    // 按钮
    buttons: {
      back: '返回',
      addQuestion: '添加题目',
      editBank: '编辑题库',
      manageMembers: '成员管理',
      bankSettings: '题库设置',
      statistics: '统计分析',
      backToList: '返回题库列表'
    },
    
    // 信息标签
    info: {
      basicInfo: '基本信息',
      statistics: '统计信息',
      categoryTags: '分类标签',
      description: '描述',
      creator: '创建者',
      yourRole: '您的角色',
      status: '状态',
      questionCount: '题目数量',
      memberCount: '成员数量',
      lastUpdated: '最后更新',
      category: '分类',
      tags: '标签',
      noDescription: '暂无描述'
    },
    
    // 角色
    roles: {
      creator: '创建者',
      manager: '管理者',
      collaborator: '协作者',
      viewer: '查看者'
    },
    
    // 状态
    status: {
      public: '公开',
      private: '私有',
      deleting: '正在删除...'
    },
    
    // 题目列表
    questions: {
      title: '题目列表',
      totalCount: '共 {count} 道题目',
      noQuestions: '还没有题目',
      startAdding: '开始添加您的第一道题目'
    },
    
    // 确认对话框
    confirm: {
      deleteQuestion: '确认删除',
      deleteQuestionMessage: '确定要删除这道题目吗？删除后无法恢复.'
    },
    
    // 成功提示
    success: {
      deleted: '删除成功',
      questionDeleted: '题目已成功删除',
      favorited: '收藏成功',
      addedToFavorites: '已添加到收藏',
      removedFromFavorites: '已取消收藏'
    },
    
    // 错误信息
    errors: {
      notFound: '题库不存在',
      loadFailed: '无法加载题库信息',
      deleteFailed: '删除失败',
      favoriteFailed: '收藏失败',
      favoriteFailedMessage: '收藏操作失败，请重试'
    }
  },

  // QuestionBankListPage - 题库列表页面
  QuestionBankListPage: {
    // 页面标题
    title: '我的题库',
    description: '管理您的数学题库',
    
    // 按钮
    buttons: {
      createBank: '创建题库',
      viewBank: '查看题库',
      editBank: '编辑题库',
      manageMembers: '成员管理',
      deleteBank: '删除题库'
    },
    
    // 统计信息
    stats: {
      totalBanks: '总题库: {count} 个',
      questionCount: '{count} 道题',
      memberCount: '{count} 人'
    },
    
    // 信息标签
    info: {
      uncategorized: '未分类',
      lastUpdated: '最后更新'
    },
    
    // 角色
    roles: {
      creator: '创建者',
      manager: '管理者',
      collaborator: '协作者',
      viewer: '查看者'
    },
    
    // 空状态
    empty: {
      noBanks: '还没有题库',
      startCreating: '创建您的第一个题库，开始管理数学题目'
    },
    
    // 确认对话框
    confirm: {
      deleteBank: '确认删除',
      deleteBankMessage: '确定要删除这个题库吗？删除后无法恢复.'
    },
    
    // 状态
    status: {
      deleting: '正在删除...'
    },
    
    // 成功提示
    success: {
      deleted: '删除成功',
      bankDeleted: '题库已成功删除'
    },
    
    // 错误信息
    errors: {
      loadFailed: '获取题库列表失败',
      deleteFailed: '删除失败'
    }
  },

  // QuestionBankMembersPage - 题库成员管理页面
  QuestionBankMembersPage: {
    // 页面标题
    title: '成员管理',
    
    // 按钮
    buttons: {
      back: '返回',
      addMember: '添加成员',
      cancel: '取消',
      addMembers: '添加 {count} 个成员'
    },
    
    // 统计信息
    stats: {
      creator: '创建者',
      manager: '管理者',
      collaborator: '协作者',
      viewer: '查看者'
    },
    
    // 搜索和筛选
    search: {
      placeholder: '搜索成员姓名或邮箱...'
    },
    
    filter: {
      allRoles: '所有角色',
      placeholder: '筛选角色'
    },
    
    // 成员列表
    members: {
      title: '成员列表',
      selectAll: '全选',
      deselectAll: '取消全选',
      batchDelete: '批量删除 ({count})',
      noMembers: '暂无成员',
      unknownUser: '未知用户'
    },
    
    // 角色
    roles: {
      creator: '创建者',
      manager: '管理者',
      collaborator: '协作者',
      viewer: '查看者',
      enterpriseViewer: '企业查看者',
      unknown: '未知',
      viewerDescription: '只能查看题库内容',
      collaboratorDescription: '可以添加和编辑题目',
      managerDescription: '可以管理题库和成员'
    },
    
    // 添加成员模态框
    addMember: {
      title: '添加成员',
      searchUser: '搜索用户',
      searchPlaceholder: '输入用户姓名或邮箱进行搜索...',
      searchDescription: '可以搜索所有已注册的用户，不限制邮箱后缀',
      searchResults: '搜索结果 (点击选择用户)',
      selectedUsers: '已选择的用户 ({count})',
      assignRole: '分配角色',
      selectRole: '选择角色'
    },
    
    // 确认对话框
    confirm: {
      removeMember: '确认移除',
      removeMemberMessage: '确定要移除这个成员吗？',
      batchRemoveMembers: '批量删除成员',
      batchRemoveMembersMessage: '确定要删除选中的 {count} 个成员吗？'
    },
    
    // 状态
    status: {
      removing: '正在移除...',
      deleting: '正在删除...'
    },
    
    // 成功提示
    success: {
      removed: '移除成功',
      memberRemoved: '成员已成功移除',
      batchRemoved: '批量删除成功',
      batchRemovedMessage: '成功删除 {count} 个成员',
      batchRemovedPartial: '批量删除完成',
      batchRemovedPartialMessage: '成功删除 {successCount} 个成员，{failCount} 个失败',
      added: '添加成功',
      addedMessage: '成功添加 {count} 个成员',
      addedPartial: '添加完成',
      addedPartialMessage: '成功添加 {successCount} 个成员，{failCount} 个失败'
    },
    
    // 错误信息
    errors: {
      loadFailed: '获取题库信息失败',
      removeFailed: '移除失败',
      removeMemberFailed: '移除成员失败',
      changeRoleFailed: '修改失败',
      changeRoleFailedMessage: '修改角色失败',
      batchRemoveFailed: '批量删除失败',
      batchRemoveFailedMessage: '批量删除成员失败',
      addFailed: '添加失败',
      addMemberFailed: '添加成员失败'
    }
  },

  // QuestionBankSettingsPage - 题库设置页面
  QuestionBankSettingsPage: {
    // 页面标题
    title: '题库设置',
    
    // 按钮
    buttons: {
      back: '返回',
      save: '保存设置',
      saving: '保存中...',
      backToList: '返回题库列表'
    },
    
    // 加载状态
    loading: {
      title: '加载题库设置中...',
      description: '正在获取题库配置信息，请稍候'
    },
    
    // 标签页
    tabs: {
      basic: '基本信息',
      permissions: '权限设置',
      advanced: '高级设置'
    },
    
    // 权限相关
    permissions: {
      currentRole: '您当前的角色是 {role}，',
      onlyCreatorsAndManagers: '只有创建者和管理者可以修改题库设置.'
    },
    
    // 角色
    roles: {
      creator: '创建者',
      manager: '管理者',
      collaborator: '协作者',
      viewer: '查看者'
    },
    
    // 基本信息
    basicInfo: {
      title: '基本信息',
      name: '题库名称',
      namePlaceholder: '输入题库名称',
      description: '题库描述',
      descriptionPlaceholder: '输入题库描述',
      category: '题库分类',
      categoryPlaceholder: '选择题库分类',
      characterCount: '{current}/{max} 字符'
    },
    
    // 标签管理
    tags: {
      title: '标签管理',
      addTag: '添加标签',
      addTagPlaceholder: '输入标签',
      add: '添加',
      currentTags: '当前标签 ({count})',
      noTags: '暂无标签'
    },
    
    // 卡片颜色设置
    cardColor: {
      title: '卡片颜色设置',
      cardColor: '题库卡片颜色',
      description: '自定义题库名称、图标和标签的颜色，让您的题库更加个性化',
      preview: '预览效果',
      reset: '重置',
      colorFormat: '支持十六进制颜色值，例如 #4f46e5、#ff6b6b 等'
    },
    
    // 权限设置
    permissionSettings: {
      title: '权限设置',
      accessControl: '访问权限',
      publicBank: '公开题库',
      publicDescription: '所有用户都可以查看此题库',
      privateDescription: '只有成员可以查看此题库',
      allowCollaboration: '允许协作',
      collaborationEnabled: '成员可以添加和编辑题目',
      collaborationDisabled: '只有创建者和管理者可以编辑题目',
      memberManagement: '成员管理',
      permissionDescription: '权限说明',
      creatorPermissions: '创建者：拥有所有权限，可以删除题库',
      managerPermissions: '管理者：可以管理成员和设置',
      collaboratorPermissions: '协作者：可以添加和编辑题目',
      viewerPermissions: '查看者：只能查看题目内容'
    },
    
    // 高级设置
    advanced: {
      title: '高级设置',
      dataManagement: '数据管理',
      questionLimit: '题目数量限制',
      questionLimitPlaceholder: '不限制',
      questionLimitDescription: '留空表示不限制题目数量',
      exportTemplate: '导出模板'
    },
    
    // 成功提示
    success: {
      saved: '保存成功',
      settingsSaved: '设置保存成功'
    },
    
    // 错误信息
    errors: {
      loadFailed: '获取题库信息失败',
      insufficientPermissions: '权限不足',
      insufficientPermissionsMessage: '只有创建者和管理者可以修改题库设置',
      saveFailed: '保存失败',
      saveBasicFailed: '保存基本信息失败',
      saveAdvancedFailed: '保存高级设置失败'
    }
  },

  // QuestionBankStatsPage - 题库统计分析页面
  QuestionBankStatsPage: {
    title: '统计分析',
    subtitle: '深入了解题库的使用情况和数据质量',
    lastUpdate: '最后更新',
    refreshingData: '正在刷新数据...',
    buttons: {
      back: '返回',
      retry: '重试',
      retrying: '重试中...',
      refresh: '刷新',
      refreshing: '刷新中',
      exportReport: '导出报告'
    },
    tabs: {
      overview: '概览',
      questions: '题目统计',
      usage: '使用情况',
      members: '成员活动'
    },
    stats: {
      totalQuestions: '题目总数',
      totalViews: '总访问量',
      activeMembers: '活跃成员',
      averageDifficulty: '平均难度',
      monthlyAverageViews: '月均访问量',
      averageViewsPerQuestion: '题目平均访问量',
      highestSingleQuestionViews: '最高单题访问量'
    },
    charts: {
      questionTypeDistribution: '题目类型分布',
      qualityAnalysis: '质量分析',
      recentActivity: '最近活动',
      difficultyDistribution: '难度分布',
      popularQuestions: '热门题目 TOP 5',
      visitTrend: '访问趋势',
      lastSixMonthsStats: '最近6个月访问量统计',
      memberActivity: '成员活跃度'
    },
    questionTypes: {
      choice: '选择题',
      fill: '填空题',
      multipleChoice: '多选题',
      solution: '解答题'
    },
    difficulty: {
      easy: '简单 (1-2星)',
      medium: '中等 (3星)',
      hard: '困难 (4-5星)'
    },
    quality: {
      tagCoverage: '标签覆盖率',
      duplicateRate: '重复率',
      averageDifficulty: '平均难度',
      questionCompleteness: '题目完整度'
    },
    members: {
      unknownUser: '未知用户'
    },
    units: {
      questions: '题'
    },
    time: {
      unknown: '未知',
      today: '今天',
      yesterday: '昨天',
      daysAgo: '{days}天前',
      weeksAgo: '{weeks}周前'
    },
    dataQuality: {
      title: '数据质量警告',
      tagCoverageAnomaly: '标签覆盖率异常: {value}%',
      duplicateRateAnomaly: '重复率异常: {value}%',
      averageDifficultyAnomaly: '平均难度异常: {value}',
      totalQuestionsAnomaly: '总题目数异常: {value}'
    },
    errors: {
      loadFailed: '加载失败',
      cannotLoadStats: '无法加载统计数据',
      loadFailedRetry: '获取统计数据失败，请稍后重试'
    }
  },

  // BatchUploadPage - 智能批量上传页面
  BatchUploadPage: {
    title: '智能批量上传',
    subtitle: 'AI驱动的文档智能解析，支持PDF、TeX一键识别题目并批量导入题库',
    buttons: {
      history: '历史记录',
      draftManager: '草稿管理'
    },
    stats: {
      uploaded: '已上传',
      recognizedQuestions: '识别题目'
    },
    statsCards: {
      uploadedDocuments: '已上传文档',
      recognizedQuestions: '识别题目',
      aiProcessing: 'AI处理中',
      questionDrafts: '题目集草稿'
    },
    units: {
      documents: '个文档',
      questions: '道'
    },
    upload: {
      title: '文档上传',
      subtitle: '支持 PDF、TeX 格式，拖拽或点击上传',
      dropToUpload: '释放文件开始上传',
      dragOrClick: '拖拽文件到这里或点击上传',
      supportedFormats: '支持 PDF、TeX 格式，单文件最大 50MB',
      selectFiles: '选择文件'
    },
    documentManagement: {
      title: '文档管理',
      summary: '共 {total} 个文档，{completed} 个已完成，{processing} 个处理中',
      totalProgress: '总进度',
      estimatedRemaining: '预估剩余'
    },
    history: {
      title: '上传历史',
      totalRecords: '共 {count} 条记录',
      recentRecords: '最近 {count} 条记录',
      clearAll: '清空全部',
      noRecords: '暂无历史记录',
      noRecordsDescription: '上传并处理完成的文档会自动保存到这里',
      restore: '恢复',
      details: '详情',
      storageInfo: '历史记录保存在本地存储中',
      maxRecords: '最多保留 50 条记录'
    },
    confirm: {
      title: '确认操作',
      cancelProcessing: '确定要取消这个文档的处理吗？',
      deleteDocument: '确定要删除这个文档吗？此操作不可撤销.',
      clearHistory: '清空历史记录',
      clearHistoryMessage: '确定要清空所有历史记录和当前会话吗？这将清除所有上传的文件和题目.',
      deleteHistoryRecord: '删除历史记录',
      deleteHistoryRecordMessage: '确定要删除历史记录 "{fileName}" 吗？'
    },
    errors: {
      loadFailed: '加载失败',
      loadDocumentStateFailed: '加载当前文档状态失败',
      loadQuestionStateFailed: '加载当前题目状态失败',
      loadGlobalStateFailed: '加载全局处理状态失败',
      loadHistoryFailed: '加载历史记录失败',
      fileTooLarge: '文件过大',
      fileSizeExceeded: '文件大小不能超过 {maxSize}MB，当前文件大小: {currentSize}MB',
      processingFailed: '处理失败',
      fileProcessingFailed: '文件处理失败，请重试',
      invalidFileType: '文件类型错误',
      unsupportedFileType: '不支持的文件类型: {fileName}',
      retryFailed: '重试失败',
      maxRetriesReached: '已达到最大重试次数'
    }
  },

  // QuestionPreviewPage - 题目预览页面
  QuestionPreviewPage: {
    buttons: {
      backToBatchUpload: '返回批量上传',
      viewOtherDrafts: '查看其他草稿'
    },
    emptyState: {
      draftCleared: '草稿已清空',
      draftClearedMessage: '所有题目已被删除，草稿已自动清理'
    },
    leaveConfirm: {
      message: '您有未保存的题目，确定要离开吗？',
      suggestion: '您有未保存的题目，建议先保存草稿再离开'
    },
    notifications: {
      dataLoaded: '数据已加载',
      dataLoadedMessage: '已加载 {count} 道题目，请及时保存草稿',
      setSourceSuccess: '设置成功',
      setSourceSuccessMessage: '已为 {count} 道题目设置来源',
      startAnalysis: '开始分析',
      analyzingQuestions: '正在分析 {count} 道题目，请稍候...',
      operationSuccess: '操作成功',
      analysisCompleted: '已完成 {count} 道题目的AI分析',
      answerGenerationCompleted: '答案生成完成',
      answerGenerationCompletedMessage: '已为 {count} 道低难度题目生成答案和解析',
      singleAnalysisCompleted: 'AI分析完成，已应用到题目',
      singleAnswerGenerationCompleted: '已为题目生成答案和解析',
      questionSplitSuccess: '已将题目分割为 {count} 道新题目',
      questionUpdatedAutoSaved: '题目更新成功，已自动保存',
      questionUpdated: '题目更新成功',
      questionDeleted: '题目删除成功',
      batchDeleteSuccess: '已删除 {count} 道题目',
      batchMoveSuccess: '已移动 {count} 道题目',
      saveSuccess: '保存成功',
      saveSuccessMessage: '已成功保存 {count} 道题目到题库'
    },
    errors: {
      initFailed: '初始化失败',
      initFailedMessage: '页面初始化失败，请刷新重试',
      selectionError: '选择错误',
      pleaseSelectQuestions: '请先选择题目',
      setSourceFailed: '设置失败',
      setSourceFailedMessage: '批量设置来源失败',
      operationFailed: '操作失败',
      batchAnalysisFailed: '批量AI分析失败',
      singleAnalysisFailed: 'AI分析失败',
      questionSplitFailed: '分割题目失败',
      questionIdNotFound: '题目ID不存在，无法保存',
      saveEditFailed: '保存编辑失败',
      questionDeleteFailed: '题目删除失败',
      batchDeleteFailed: '批量删除失败',
      targetQuestionNotFound: '目标题目不存在',
      batchMoveFailed: '批量移动失败',
      dataValidationFailed: '数据验证失败',
      dataValidationFailedMessage: '请检查以下题目的数据完整性：\n\n{details}',
      savePartialFailure: '保存完成，但有部分失败',
      savePartialFailureMessage: '成功保存 {savedCount} 道题目，失败 {failedCount} 道题目。\n\n失败详情：\n{details}',
      saveQuestionsFailed: '保存题目失败'
    },
    confirm: {
      delete: {
        title: '确认删除',
        message: '确定要删除选中的 {count} 道题目吗？此操作不可撤销.',
        confirmText: '删除',
        cancelText: '取消'
      },
      leave: {
        title: '确认离开',
        message: '您有未保存的题目，确定要离开吗？离开后未保存的更改将丢失.',
        confirmText: '离开',
        cancelText: '取消'
      }
    }
  },

  // QuestionViewPage - 题目查看页面
  QuestionViewPage: {
    title: '查看题目',
    subtitle: '题目详情与相关题目',
    loading: {
      title: '加载中...',
      description: '正在获取题目信息，请稍候'
    },
    buttons: {
      back: '返回',
      backToQuestionList: '返回题目列表',
      edit: '编辑',
      delete: '删除',
      previous: '上一题',
      next: '下一题'
    },
    sections: {
      stem: '题目题干',
      imagesAndGraphics: '题目图片与图形',
      images: '图片',
      graphics: '图形',
      options: '选项',
      multipleOptions: '选项（多选题）',
      answer: '答案',
      solution: '解析'
    },
    sidebar: {
      basicInfo: '基本信息',
      questionType: '题目类型',
      subType: '小题型',
      difficultyLevel: '难度等级',
      viewCount: '访问次数',
      questionSource: '题目来源',
      createdAt: '创建时间',
      updatedAt: '更新时间',
      knowledgeTags: '知识点标签',
      creator: '创建者',
      name: '姓名',
      email: '邮箱'
    },
    questionTypes: {
      choice: '选择题',
      multipleChoice: '多选题',
      fill: '填空题',
      solution: '解答题'
    },
    difficulty: {
      veryEasy: '非常简单',
      easy: '简单',
      medium: '中等',
      hard: '困难',
      veryHard: '非常困难',
      unknown: '未知'
    },
    actions: {
      clickToViewLarge: '点击查看大图'
    },
    keyboardShortcuts: {
      navigation: '使用 ← → 键切换题目，',
      edit: 'Ctrl+E 编辑题目'
    },
    notifications: {
      deleteSuccess: '删除成功',
      deleteSuccessMessage: '题目已成功删除'
    },
    errors: {
      getQuestionFailed: '获取题目失败',
      questionNotFound: '题目不存在',
      deleteFailed: '删除失败',
      deleteFailedMessage: '删除失败'
    },
    confirm: {
      delete: {
        title: '确认删除',
        message: '确定要删除这道题目吗？'
      }
    }
  },

  // Utils - 工具类翻译
  utils: {
    // ErrorHandler - 错误处理器
    errorHandler: {
      messages: {
        NETWORK_ERROR: '网络连接错误，请检查网络设置',
        VALIDATION_ERROR: '输入数据验证失败，请检查输入内容',
        AUTHENTICATION_ERROR: '身份验证失败，请重新登录',
        AUTHORIZATION_ERROR: '权限不足，无法访问此资源',
        NOT_FOUND_ERROR: '请求的资源不存在',
        SERVER_ERROR: '服务器内部错误，请稍后重试',
        UNKNOWN_ERROR: '发生未知错误，请稍后重试',
        networkTimeout: '网络连接超时',
        unhandledPromiseError: '未处理的Promise错误',
        javaScriptError: 'JavaScript错误'
      }
    },

    // PasswordValidator - 密码验证器
    passwordValidator: {
      errors: {
        tooShort: '密码长度不能少于8位',
        tooLong: '密码长度不能超过20位',
        containsUsername: '密码不能包含用户名相关内容',
        containsEmail: '密码不能包含邮箱相关内容',
        containsBirthDate: '密码不能包含生日日期格式（如：19990101、1999/01/01等）',
        consecutiveRepeats: '密码不能包含连续三位相同的字符或数字',
        tooSimple: '密码过于简单，请使用更复杂的密码'
      },
      strength: {
        weak: '弱',
        medium: '中等',
        strong: '强',
        unknown: '未知'
      }
    },

    // TimezoneUtils - 时区工具
    timezoneUtils: {
      names: {
        'Asia_Shanghai': '中国标准时间',
        'Asia_Hong_Kong': '香港时间',
        'Asia_Taipei': '台北时间',
        'Asia_Tokyo': '日本标准时间',
        'Asia_Seoul': '韩国标准时间',
        'Asia_Singapore': '新加坡时间',
        'Asia_Bangkok': '曼谷时间',
        'Asia_Kolkata': '印度时间',
        'Asia_Dubai': '迪拜时间',
        'America_New_York': '美国东部时间',
        'America_Chicago': '美国中部时间',
        'America_Denver': '美国山地时间',
        'America_Los_Angeles': '美国太平洋时间',
        'America_Toronto': '多伦多时间',
        'America_Vancouver': '温哥华时间',
        'Europe_London': '格林威治时间',
        'Europe_Paris': '中欧时间',
        'Europe_Berlin': '中欧时间',
        'Europe_Moscow': '莫斯科时间',
        'Australia_Sydney': '澳大利亚东部时间',
        'Australia_Perth': '澳大利亚西部时间',
        'Pacific_Auckland': '新西兰标准时间',
        'Pacific_Fiji': '斐济时间'
      }
    }
  },

  // QuestionEditor - 题目编辑器
  questionEditor: {
    // 题库信息
    questionBank: '题库',
    questionId: '题目ID',
    
    // 题目类型
    questionType: '题目类型',
    singleChoice: '单选题',
    multipleChoice: '多选题',
    fillInBlank: '填空题',
    solution: '解答题',
    
    // 题目内容
    questionContent: '题目内容',
    solutionContent: '解析',
    quickEditTitle: '快捷编辑题目内容',
    quickEditSolution: '快捷编辑解析',
    clickToEdit: '点击编辑题目内容',
    clickToEditSolution: '点击编辑解析内容',
    clickToAddContent: '点击此处添加题目内容',
    clickToAddSolution: '点击此处添加解析内容',
    inputQuestionContent: '输入题目内容，支持LaTeX公式和自定义标签...',
    inputSolutionContent: '输入解析内容，支持LaTeX公式和自定义标签...',
    save: '保存',
    cancel: '取消',
    
    // 选项
    options: '选项',
    addOption: '添加选项',
    saveOption: '保存选项',
    cancelOption: '取消选项',
    editOption: '编辑选项',
    deleteOption: '删除选项',
    optionPreview: '选项 {letter} 预览',
    noContent: '暂无内容',
    latexError: 'LaTeX错误',
    
    // 答案
    answer: '答案',
    fillAnswers: '填空题答案 ({count} 个空)',
    solutionAnswers: '解答题答案',
    fillAnswerPlaceholder: '第 {number} 空答案',
    solutionAnswerPlaceholder: '第 {number} 问答案',
    inputAnswer: '输入答案',
    
    // 题目属性
    questionAttributes: '题目属性',
    difficulty: '难度',
    category: '分类',
    source: '来源',
    knowledgeTags: '知识点标签',
    inputCategory: '输入题目分类',
    inputSource: '输入题目来源',
    inputKnowledgeTag: '输入知识点标签',
    selectPresetTags: '选择预设标签',
    
    // 操作按钮
    cancelQuestion: '取消',
    saveQuestion: '保存题目',
    
    // 预设知识点标签
    presetKnowledgeTags: [
      '函数', '导数', '积分', '极限', '数列', '概率', '统计', '几何', '代数', '三角',
      '向量', '矩阵', '复数', '不等式', '方程', '解析几何', '立体几何'
    ]
  },

  // QuestionTypeSelector - 题型选择器
  questionTypeSelector: {
    title: '题型选择',
    placeholder: '输入题型名称（最多选择 {maxCount} 个）',
    hint: '请从预设选项中选择或输入题型名称',
    selectLimit: '选择限制',
    maxTypesReached: '最多只能选择 {maxCount} 个题型',
    duplicateType: '重复题型',
    typeExists: '该题型已存在',
    add: '添加'
  },

  // KnowledgeTagSelector - 知识点标签选择器
  knowledgeTagSelector: {
    title: '知识点标签',
    placeholder: '输入知识点标签（最多选择 {maxCount} 个）',
    hint: '请选择或输入知识点标签',
    selectLimit: '选择限制',
    maxTagsReached: '最多只能选择 {maxCount} 个标签',
    duplicateTag: '重复标签',
    tagExists: '该标签已存在',
    add: '添加',
    categories: {
      mathBasic: '数学基础',
      advancedMath: '高等数学',
      middleSchoolMath: '中学数学'
    }
  },

  // QuestionSourceSelector - 题目来源选择器
  questionSourceSelector: {
    title: '题目来源',
    placeholder: '输入题目来源信息',
    recentYears: '最近年份',
    searchTemplates: '搜索快速模板...',
    totalTemplates: '共 {count} 个模板',
    foundMatches: '，找到 {count} 个匹配项',
    usageExample: '使用示例：',
    year: '年',
    school_ex: '上海中学',
    grade_ex: '高一',
    property_ex: "期中",
    number_ex: '·T5',
    grade: '年级',
    examType: '考试类型',
    questionNumber: '题号'
  }
};
