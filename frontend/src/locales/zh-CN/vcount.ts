const vcount = {
  // 充值页面
  recharge: {
    title: 'VCount 充值',
    subtitle: '为您的账户充值VCount虚拟货币',
    formTitle: '充值信息',
    presetAmounts: '快速选择金额',
    customAmount: '自定义金额',
    amountPlaceholder: '请输入充值金额',
    amountHint: '充值金额范围：0.01 - 10,000 V',
    description: '充值说明',
    descriptionPlaceholder: '请输入充值说明（可选）',
    confirmRecharge: '确认充值',
    processing: '处理中...',
    noteTitle: '充值说明',
    note1: '充值成功后，VCount将立即到账',
    note2: 'VCount可用于购买题库、试卷等资源',
    note3: '如有疑问，请联系管理员',
    securityTitle: '安全提示',
    securityNote: '请确保在安全的网络环境下进行充值操作，避免在公共网络或不信任的设备上操作。',
    action: '操作'
  },

  // 管理页面
  management: {
    title: 'VCount 管理',
    subtitle: '管理系统内所有用户的VCount信息',
    totalUsers: '总用户数',
    totalBalance: '总余额',
    totalRecharged: '总充值',
    totalSpent: '总消费',
    averageBalance: '平均余额',
    searchPlaceholder: '搜索用户姓名、邮箱或角色',
    sortByBalance: '按余额排序',
    sortByRecharged: '按充值排序',
    sortBySpent: '按消费排序',
    sortByCreated: '按创建时间排序',
    userList: '用户列表',
    users: '用户',
    user: '用户',
    role: '角色',
    balance: '余额',
    recharged: '充值',
    spent: '消费',
    transactions: '交易次数',
    page: '第',
    export: '导出数据',
    exportSuccess: '数据导出成功',
    accessDenied: '访问被拒绝',
    accessDeniedMessage: '只有管理员才能访问此页面',
    userDetail: '用户详情',
    userInfo: '用户信息',
    vcountInfo: 'VCount信息'
  },

  // 通用VCount相关
  currentBalance: '当前余额',
  totalRecharged: '总充值',
  totalSpent: '总消费',
  transactionCount: '交易次数',
  loadFailed: '加载失败',
  rechargeVCount: '充值 VCount',
  defaultDescription: '用户充值',

  // 成功消息
  success: {
    rechargeSuccess: '充值成功！VCount已到账',
    rechargeSuccessMessage: '您的VCount余额已更新，可以开始使用了！'
  },

  // 错误消息
  errors: {
    invalidAmount: '请输入有效的充值金额',
    amountTooLarge: '充值金额不能超过10,000 V',
    rechargeFailed: '充值失败，请稍后重试',
    loadFailed: '加载失败，请刷新页面重试',
    accessDenied: '权限不足，无法访问此功能',
    noPaymentMethod: '请先绑定支付方式',
    noPaymentMethodDesc: '充值前需要绑定银行卡或支付宝等支付方式',
    systemNotReady: '充值系统还未开发完成',
    systemNotReadyDesc: '充值功能正在开发中，敬请期待'
  }
};

export default vcount;
