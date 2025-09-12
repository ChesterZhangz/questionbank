const profile = {
  // 页面标题和导航
  pageTitle: '个人资料',
  pageDescription: '管理您的账户信息和偏好设置',
  back: '返回',
  loading: '加载中...',
  
  // 加载页面
  loadingProfile: '加载个人资料',
  loadingProfileDescription: '正在获取您的个人信息、企业信息和VCount余额...',
  
  // 用户信息卡片
  accountStatus: '账户状态',
  emailVerification: '邮箱验证',
  normal: '正常',
  disabled: '已禁用',
  verified: '已验证',
  unverified: '未验证',
  registrationTime: '注册时间',
  lastLogin: '最后登录',
  
  // VCount货币系统
  vcount: 'VCount',
  currentBalance: '当前余额',
  totalRecharged: '总充值',
  totalSpent: '总消费',
  transactionCount: '交易次数',
  loadFailed: '加载失败',
  rechargeVCount: '充值 VCount',
  
  // 基本信息
  basicInfo: '基本信息',
  edit: '编辑',
  save: '保存',
  cancel: '取消',
  name: '姓名',
  email: '邮箱',
  enterpriseName: '企业名称',
  role: '角色',
  notJoinedEnterprise: '未加入企业',
  enterName: '请输入姓名',
  
  // 角色名称
  roles: {
    superadmin: '超级管理员',
    admin: '管理员',
    teacher: '教师',
    student: '学生'
  },
  
  // 偏好设置
  preferences: '偏好设置',
  theme: '主题',
  language: '语言',
  timezone: '时区',
  notifications: '通知设置',
  emailNotifications: '邮件通知',
  enabled: '开启',
  disabledSetting: '关闭',
  
  // 主题选项
  themes: {
    auto: '跟随系统',
    light: '浅色',
    dark: '深色'
  },
  
  // 语言选项
  languages: {
    'zh-CN': '中文',
    'en-US': 'English'
  },
  
  // 时区相关
  selectTimezone: '选择时区',
  detectLocation: '定位',
  detecting: '检测中...',
  
  // 密码修改
  passwordChange: '密码修改',
  changePassword: '修改密码',
  confirmChange: '确认修改',
  currentPassword: '当前密码',
  newPassword: '新密码',
  confirmNewPassword: '确认新密码',
  enterCurrentPassword: '请输入当前密码',
  enterNewPassword: '请输入新密码',
  enterNewPasswordAgain: '请再次输入新密码',
  passwordSecurityTip: '定期修改密码可以提高账户安全性',
  
  // 社交功能
  socialFeatures: '社交功能',
  favoriteQuestions: '收藏题目',
  followers: '粉丝',
  following: '关注',
  favorites: '个收藏',
  followersCount: '个粉丝',
  followingCount: '个关注',
  
  // 成功消息
  success: {
    saveSuccess: '保存成功',
    profileUpdated: '个人资料已更新',
    passwordChanged: '密码修改成功',
    passwordUpdated: '您的密码已成功更新',
    locationDetected: '定位成功',
    locationDetectedWithCity: '检测到您位于 {country} {city}，已自动设置时区为 {timezone}',
    locationDetectedWithoutCity: '已自动设置时区为 {timezone}'
  },
  
  // 错误消息
  errors: {
    saveFailed: '保存失败',
    profileUpdateError: '更新个人资料时发生错误',
    passwordMismatch: '密码不匹配',
    passwordMismatchMessage: '新密码和确认密码不一致',
    passwordChangeFailed: '密码修改失败',
    passwordChangeError: '修改密码时发生错误',
    locationFailed: '定位失败',
    locationFailedMessage: '无法获取您的位置信息，请手动选择时区'
  }
};

export default profile;
