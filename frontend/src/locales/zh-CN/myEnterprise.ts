export const myEnterprise = {
  // 页面标题和描述
  title: '我的企业',
  description: '管理您的企业信息、成员和部门',
  
  // 概览页面
  overview: {
    basicInfo: '基本信息',
    detailedInfo: '详细信息',
    emailSuffix: '邮箱后缀',
    creditCode: '信用代码',
    memberCount: '成员数量',
    description: '描述',
    address: '地址',
    industry: '行业',
    enterpriseMembers: '企业成员',
    departmentCount: '部门数量',
    messageCount: '消息数量'
  },
  
  // 标签页
  tabs: {
    overview: '概览',
    members: '成员',
    departments: '部门',
    messages: '消息'
  },
  
  // 企业信息
  enterpriseInfo: {
    title: '企业信息',
    name: '企业名称',
    emailSuffix: '邮箱后缀',
    creditCode: '统一社会信用代码',
    description: '企业描述',
    address: '企业地址',
    phone: '联系电话',
    website: '企业网站',
    industry: '所属行业',
    size: '企业规模',
    status: '企业状态',
    maxMembers: '最大成员数',
    currentMembers: '当前成员数',
    edit: '编辑企业信息',
    save: '保存',
    cancel: '取消',
    enterprise: '企业',
    managementCenter: '企业管理中心',
    me: '我',
    currentUser: '当前用户',
    unknownUser: '未知用户',
    unknownTime: '未知时间',
    error: '错误'
  },
  
  // 成员管理
  memberManagement: {
    title: '成员管理',
    totalMembers: '总成员数',
    onlineMembers: '在线成员',
    pendingInvites: '待处理邀请',
    addMember: '添加成员',
    inviteMember: '邀请成员',
    memberList: '成员列表',
    name: '姓名',
    email: '邮箱',
    role: '角色',
    department: '部门',
    status: '状态',
    lastActive: '最后活跃',
    actions: '操作',
    edit: '编辑',
    remove: '移除',
    promote: '提升',
    demote: '降级',
    noMembers: '暂无成员',
    loading: '正在加载成员...',
    searchPlaceholder: '搜索成员姓名、邮箱或部门...',
    allDepartments: '所有部门',
    lastLogin: '最后登录',
    neverLoggedIn: '从未登录',
    memberNotFound: '成员未找到',
    updateSuccess: '更新成功',
    updateSuccessMessage: '成员信息更新成功',
    updateFailed: '更新失败',
    editMemberPosition: '编辑成员职位',
    memberName: '成员姓名',
    enterpriseRole: '企业角色',
    positionDescription: '职位描述',
    positionDescriptionPlaceholder: '请输入职位描述（可选）',
    noDepartment: '无部门',
    adminCannotEditOtherAdmin: '管理员不能修改其他管理员的部门',
    saving: '保存中...',
    save: '保存'
  },
  
  // 部门管理
  departmentManagement: {
    title: '部门管理',
    addDepartment: '添加部门',
    departmentName: '部门名称',
    departmentDescription: '部门描述',
    departmentHead: '部门负责人',
    memberCount: '成员数量',
    actions: '操作',
    edit: '编辑',
    delete: '删除',
    noDepartments: '暂无部门',
    loading: '正在加载部门...',
    create: '创建',
    update: '更新',
    confirmDelete: '确认删除',
    deleteConfirmMessage: '确定要删除这个部门吗？此操作不可撤销.',
    createSuccess: '创建成功',
    createSuccessMessage: '部门已成功创建',
    createFailed: '创建失败',
    updateSuccess: '更新成功',
    updateSuccessMessage: '部门信息已成功更新',
    updateFailed: '更新失败',
    deleteSuccess: '删除成功',
    deleteSuccessMessage: '部门已成功删除',
    deleteFailed: '删除失败',
    createDepartment: '创建部门',
    editDepartment: '编辑部门',
    departmentCode: '部门代码',
    departmentNamePlaceholder: '请输入部门名称',
    departmentCodePlaceholder: '请输入部门代码',
    departmentDescriptionPlaceholder: '请输入部门描述（可选）',
    unnamedDepartment: '未命名部门',
    unknownDepartment: '未知部门'
  },
  
  // 消息系统
  messageSystem: {
    title: '企业消息',
    sendMessage: '发送消息',
    messageContent: '消息内容',
    selectDepartment: '选择部门',
    selectRecipient: '选择接收者',
    send: '发送',
    cancel: '取消',
    noMessages: '暂无消息',
    loading: '正在加载消息...',
    reply: '回复',
    expandReplies: '展开回复',
    collapseReplies: '收起回复',
    inputError: '输入错误',
    contentRequired: '请输入消息内容',
    departmentRequired: '请选择部门',
    recipientRequired: '请选择消息接收者',
    cannotSendToSelf: '不能给自己发消息',
    sendSuccess: '发送成功',
    sendSuccessMessage: '消息已发送',
    sendFailed: '发送失败',
    noContent: '无内容',
    read: '已读',
    readBy: '已读',
    replyPlaceholder: '输入回复内容...',
    expandRepliesWithCount: '展开回复 ({count})',
    replyContentRequired: '请输入回复内容',
    replySuccessMessage: '回复发送成功',
    replyFailed: '回复失败',
    deleteSuccess: '删除成功',
    deleteSuccessMessage: '消息删除成功',
    deleteFailed: '删除失败',
    messageType: '消息类型',
    selectMessageType: '选择消息类型',
    selectDepartmentPlaceholder: '请选择部门',
    selectRecipientPlaceholder: '选择接收者（可多选）',
    messageContentPlaceholder: '请输入消息内容',
    messageContentHelp: '请输入您的消息内容',
    selectAllMembers: '全选成员',
    selectAdmins: '选择管理员',
    clearSelection: '清空选择',
    selectedRecipients: '已选择 {count} 个接收者',
    multiSelectHelp: '可以选择多个用户作为接收者，支持快速选择功能',
    sendToAllMembers: '发送给所有成员',
    deleteMessage: '删除消息',
    deleteMessageConfirm: '确定要删除这条消息吗？删除后无法恢复.',
    deleteMessageLoading: '删除中...'
  },
  
  // 角色和权限
  roles: {
    owner: '所有者',
    admin: '管理员',
    collaborator: '协作者',
    viewer: '查看者',
    superAdmin: '超级管理员',
    member: '成员',
    unknown: '未知'
  },
  
  // 消息类型
  messageTypes: {
    general: '普通消息',
    announcement: '公告',
    department: '部门消息',
    group: '群聊消息',
    unknown: '未知类型'
  },
  
  // 状态
  statuses: {
    active: '活跃',
    inactive: '非活跃',
    pending: '待处理',
    suspended: '已暂停'
  },
  
  // 操作按钮
  actions: {
    create: '创建',
    edit: '编辑',
    delete: '删除',
    save: '保存',
    cancel: '取消',
    confirm: '确认',
    close: '关闭',
    refresh: '刷新',
    search: '搜索',
    filter: '筛选',
    sort: '排序',
    export: '导出',
    import: '导入',
    update: '更新',
    transfer: '转让',
    send: '发送',
    retry: '重试',
    transferSuperAdmin: '转让超级管理员身份',
    deleteMessage: '删除消息',
    deleteReply: '删除回复',
    transferSuperAdminTitle: '转让超级管理员身份',
    importantNotice: '重要提示',
    transferWarning: '转让超级管理员身份后，您将降级为普通成员，失去所有管理权限.此操作不可撤销，请谨慎操作.',
    selectNewSuperAdmin: '选择新超级管理员',
    selectNewSuperAdminPlaceholder: '请选择新超级管理员',
    confirmTransfer: '确认转让'
  },
  
  // 错误信息
  errors: {
    fetchEnterpriseFailed: '获取企业信息失败',
    fetchMembersFailed: '获取成员列表失败',
    fetchDepartmentsFailed: '获取部门列表失败',
    fetchMessagesFailed: '获取消息列表失败',
    unknownError: '未知错误',
    loadFailed: '加载失败',
    notJoined: '未加入企业',
    notJoinedMessage: '您尚未加入任何企业',
    insufficientPermissions: '权限不足',
    superAdminCannotEdit: '超级管理员身份不能通过此界面修改，请使用身份转让功能',
    fetchFailed: '获取失败',
    memberInfoNotFound: '无法获取成员信息，请刷新页面重试'
  },
  
  // 加载状态
  loading: {
    title: '正在加载企业信息',
    description: '正在连接企业服务，请稍候...',
    loadingMembers: '正在加载成员...',
    loadingDepartments: '正在加载部门...',
    loadingMessages: '正在加载消息...'
  },
  
  // 表单验证
  validation: {
    required: '此字段为必填项',
    email: '请输入有效的邮箱地址',
    phone: '请输入有效的电话号码',
    url: '请输入有效的网址',
    minLength: '最少需要 {min} 个字符',
    maxLength: '最多允许 {max} 个字符'
  }
};
