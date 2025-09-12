const practiceEditor = {
  // 页面标题和导航
  pageTitle: '练习编辑器',
  back: '返回',
  save: '保存',
  saving: '保存中...',
  
  // 试卷集选择
  paperBank: '试卷集',
  selectPaperBank: '选择试卷集',
  
  // 题目筛选
  questionFilter: '题目筛选',
  advancedFilter: '高级筛选',
  hideFilter: '隐藏筛选',
  reset: '重置',
  searchPlaceholder: '搜索题目内容、标签...',
  search: '搜索',
  searching: '搜索中',
  clearSearch: '清除搜索',
  
  // 筛选选项
  typeFilter: '题型筛选',
  selectTypes: '选择题型',
  difficultyFilter: '题目难度',
  selectDifficulty: '选择难度',
  bankFilter: '题库归属',
  selectBank: '选择题库',
  tagFilter: '知识点标签',
  selectTags: '选择知识点标签',
  
  // 题型选项
  questionTypes: {
    choice: '选择题',
    multipleChoice: '多选题',
    fill: '填空题',
    solution: '解答题',
    unknown: '未知类型'
  },
  
  // 难度选项
  difficulties: {
    veryEasy: '非常简单',
    easy: '简单',
    medium: '中等',
    hard: '困难',
    veryHard: '非常困难',
    unknown: '未知'
  },
  
  // 题目列表
  availableQuestions: '可用题目',
  addTo: '添加到',
  section: '部分',
  add: '添加',
  noQuestions: '暂无可用题目',
  noQuestionsDescription: '请尝试调整筛选条件',
  loadingQuestions: '加载中...',
  filteringQuestions: '正在筛选题目...',
  
  // 题目内容
  questionContentLoading: '题目内容加载中...',
  graphicsAndImages: '图形与图片',
  count: '个',
  image: '图',
  shape: '形',
  options: '选项',
  removeFromSection: '从此部分移除题目',
  
  // 练习标题和部分
  practiceTitle: '练习标题',
  clickToSetTitle: '点击设置练习标题',
  enterTitle: '请输入练习标题',
  addSection: '添加部分',
  sectionTitle: '部分标题',
  questions: '题',
  current: '当前',
  
  // 部分操作
  switchToSection: '切换到此部分添加题目',
  moveUp: '上移此部分',
  moveDown: '下移此部分',
  deleteSection: '删除此部分',
  
  // 分页
  previousPage: '上一页',
  nextPage: '下一页',
  page: '第',
  of: '页，共',
  totalQuestions: '道题目',
  
  // 加载状态
  loading: '加载中...',
  loadingPracticeContent: '正在加载练习内容...',
  
  // 保存相关
  savePractice: '保存练习',
  saveAndExit: '保存并退出',
  exitWithoutSaving: '不保存退出',
  savingChanges: '正在保存...',
  unsavedChanges: '您有未保存的更改，是否要保存后退出？',
  
  // 错误和成功消息
  errors: {
    loadFailed: '加载失败',
    loadFailedMessage: '无法加载数据',
    saveFailed: '保存失败',
    saveFailedMessage: '保存失败',
    saveError: '保存练习时发生错误',
    noTitle: '请先输入标题',
    noTitleMessage: '请输入练习标题',
    noQuestions: '请至少添加一道题目',
    noQuestionsMessage: '请至少添加一道题目',
    noPaperBank: '请选择试卷集',
    noPaperBankMessage: '请选择试卷集',
    questionLoadFailed: '题目加载失败',
    questionLoadFailedMessage: '无法加载题目数据',
    preloadFailed: '预加载题目失败',
    getUsedQuestionsFailed: '获取试卷集中已使用题目失败'
  },
  
  success: {
    practiceSaved: '练习已保存到试卷集中',
    practiceUpdated: '练习卷已更新',
    saveSuccess: '保存成功'
  },
  
  // 默认标签
  defaultTags: {
    practice: '练习卷',
    comprehensive: '综合练习',
    selfTest: '自测'
  },
  
  // 搜索关键词
  searchKeywords: {
    difficulty: {
      simple: '简单',
      easy: '容易',
      basic: '基础',
      medium: '中等',
      normal: '普通',
      general: '一般',
      hard: '困难',
      difficult: '难',
      complex: '复杂'
    },
    types: {
      choice: '选择',
      singleChoice: '单选',
      multipleChoice: '多选',
      multipleChoiceQuestion: '多选题',
      fill: '填空',
      fillQuestion: '填空题',
      solution: '解答',
      solutionQuestion: '解答题',
      calculation: '计算'
    }
  },
  
  // 统计信息
  foundQuestions: '找到 {count} 道题目',
  
  // 部分标题默认值
  defaultSectionTitle: '第{number}部分'
};

export default practiceEditor;
