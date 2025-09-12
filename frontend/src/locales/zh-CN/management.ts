export const management = {
  // 题目管理页面
  questionManagement: {
    title: '题目管理',
    description: '管理和组织您的题目库，支持批量操作和高级筛选',
    filteredCount: '已筛选: {count} 题',
    createNew: '新建',
    createNewTooltip: '创建新题目',
    intelligentPaper: '智能组卷',
    intelligentPaperTooltip: '智能组卷',
    
    // 筛选相关
    smartFilter: '智能筛选',
    quickLocate: '快速定位目标题目',
    resetFilter: '重置筛选',
    searchQuestions: '搜索题目',
    searchPlaceholder: '搜索题目编号、内容、标签、难度、题型...',
    questionBank: '题库归属',
    selectQuestionBank: '选择题库',
    difficulty: '题目难度',
    selectDifficulty: '选择难度',
    sortBy: '排序方式',
    selectSortBy: '选择排序方式',
    sortDirection: '排序方向',
    ascending: '升序 ↑',
    descending: '降序 ↓',
    questionTypeFilter: '题型筛选',
    selectedTypes: '已选题型 ({count})',
    clear: '清空',
    knowledgeTags: '知识点标签',
    selectKnowledgeTags: '选择知识点标签',
    
    // 题型选项
    questionTypes: {
      choice: { label: '选择题', icon: '○' },
      multipleChoice: { label: '多选题', icon: '□' },
      fill: { label: '填空题', icon: '___' },
      solution: { label: '解答题', icon: '✎' }
    },
    
    // 难度选项
    difficulties: {
      veryEasy: { label: '非常简单', icon: '○' },
      easy: { label: '简单', icon: '○○' },
      medium: { label: '中等', icon: '○○○' },
      hard: { label: '困难', icon: '○○○○' },
      veryHard: { label: '非常困难', icon: '○○○○○' }
    },
    
    // 排序选项
    sortOptions: {
      createdAt: { label: '创建时间', icon: '◉' },
      updatedAt: { label: '更新时间', icon: '◐' },
      difficulty: { label: '难度', icon: '◆' },
      views: { label: '访问量', icon: '◇' }
    },
    
    // 批量操作
    batchActions: {
      selectedCount: '已选择 {count} 道题目',
      cancelSelection: '取消选择'
    },
    
    // 题目列表
    questionList: {
      loading: '正在加载题目...',
      loadingDescription: '请稍候，正在获取题目列表',
      noData: '暂无题目数据',
      noDataDescription: '尝试调整筛选条件或添加新题目',
      totalQuestions: '共 {total} 道题目，第 {current} / {totalPages} 页',
      perPage: '每页显示：',
      questions: '道题目',
      previousPage: '上一页',
      nextPage: '下一页'
    },
    
    // 操作相关
    operations: {
      confirmDelete: '确认删除',
      deleteConfirmMessage: '确定要删除这道题目吗？删除后无法恢复.',
      deleting: '正在删除...',
      deleteSuccess: '删除成功',
      deleteSuccessMessage: '题目已成功删除',
      deleteFailed: '删除失败',
      deleteFailedMessage: '删除题目失败，请重试',
      favoriteFailed: '收藏操作失败'
    },
    
    // 错误信息
    errors: {
      fetchBanksFailed: '获取题库列表失败',
      fetchBanksTimeout: '获取题库列表超时，请检查网络连接或稍后重试',
      fetchBanksAuthFailed: '认证失败，请重新登录',
      fetchBanksUnknownError: '获取题库列表失败: {error}',
      fetchQuestionsFailed: '获取题目列表失败',
      fetchQuestionsTimeout: '获取题目列表超时，请检查网络连接或稍后重试',
      fetchQuestionsAuthFailed: '认证失败，请重新登录',
      fetchQuestionsUnknownError: '获取题目列表失败: {error}'
    }
  },
  
  // 用户管理页面
  userManagement: {
    title: '用户管理',
    description: '管理系统用户，分配权限和角色',
    subtitle: '管理系统用户，分配权限和角色',
    totalUsers: '总用户: {count} 人',
    activeUsers: '活跃: {count}',
    adminUsers: '管理员: {count}',
    
    // 统计信息
    stats: {
      total: '总用户: {count} 人',
      active: '活跃: {count}',
      admins: '管理员: {count}'
    },

    search:{
      placeholder: '搜索用户名或邮箱...',
    },
    
    // 筛选相关
    
    roleFilter: '角色筛选',
    allRoles: '所有角色',
    statusFilter: '状态筛选',
    allStatuses: '所有状态',
    resetFilters: '重置筛选',
    
    // 筛选选项
    filters: {
      role: {
        label: '角色筛选',
        placeholder: '所有角色'
      },
      status: {
        label: '状态筛选',
        placeholder: '所有状态'
      },
      reset: '重置筛选'
    },
    
    // 角色选项
    roles: {
      superadmin: '超级管理员',
      admin: '管理员',
      teacher: '教师',
      student: '学生'
    },
    
    // 状态选项
    statuses: {
      active: '活跃',
      inactive: '非活跃',
      suspended: '已暂停'
    },
    
    // 用户列表
    userList: {
      title: '用户列表',
      count: '共 {count} 个用户',
      loading: '正在加载用户数据...',
      noData: '暂无用户数据',
      userInfo: '用户信息',
      role: '角色',
      status: '状态',
      lastLogin: '最后登录',
      registeredAt: '注册时间',
      operations: '操作',
      neverLoggedIn: '从未登录'
    },
    
    // 表格相关
    table: {
      userInfo: '用户信息',
      role: '角色',
      status: '状态',
      lastLogin: '最后登录',
      registeredAt: '注册时间',
      actions: '操作',
      neverLoggedIn: '从未登录'
    },
    
    // 操作相关
    actions: {
      activate: '启用',
      deactivate: '停用',
      edit: '编辑',
      delete: '删除'
    },
    
    // 编辑用户模态框
    editUser: {
      title: '编辑用户',
      description: '修改用户信息和权限设置',
      name: '姓名',
      namePlaceholder: '请输入姓名',
      role: '角色',
      selectRole: '选择角色',
      department: '部门',
      departmentPlaceholder: '请输入部门',
      status: '状态',
      selectStatus: '选择状态',
      cancel: '取消',
      save: '保存',
      saving: '保存中...'
    },
    
    // 操作相关
    operations: {
      confirmDelete: '确定要删除用户 "{name}" 吗？',
      deleteConfirmMessage: '此操作不可撤销.',
      deleteSuccess: '删除用户成功',
      deleteFailed: '删除用户失败',
      updateSuccess: '更新用户成功',
      updateFailed: '更新用户失败',
      updateStatusSuccess: '更新用户状态成功',
      updateStatusFailed: '更新用户状态失败'
    },
    
    // 错误信息
    errors: {
      fetchUsersFailed: '获取用户列表失败',
      fetchUsersUnknownError: '获取用户列表失败: {error}'
    },
    
    // 加载状态
    loading: {
      title: '正在加载用户列表...',
      description: '请稍候，正在获取用户信息',
      loadingData: '正在加载用户数据...'
    }
  }
};
