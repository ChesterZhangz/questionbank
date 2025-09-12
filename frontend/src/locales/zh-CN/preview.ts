export const preview = {
  // QuestionSavePanel 组件
  questionSavePanel: {
    title: '保存题目到题库',
    saving: '正在保存题目...',
    saveProgress: '进度: {progress}%',
    selectedCount: '准备保存 {count} 道题目',
    selectBank: '选择目标题库',
    selectBankPlaceholder: '请选择要保存到的题库',
    subtitle: '保存说明：',
    description1: '题目将保存到选中的题库中',
    description2: '保存后可在题库管理页面查看',
    description3: '保存过程中请勿关闭页面',
    saveButton: '确认保存'
  },

  // AIAnalysisPanel 组件
  aiAnalysisPanel: {
    title: 'AI智能分析',
    subtitle: '将对选中的',
    selectedCount: '{count} 道题目进行AI智能分析，包括：',
    feature1: '自动识别题目难度等级',
    feature2: '智能生成知识点标签',
    feature3: '自动分类题目类型',
    feature4: '提供分析置信度',
    notesTitle: '注意事项：',
    note1: 'AI分析需要一定时间，请耐心等待',
    note2: '分析结果仅供参考，建议人工审核',
    note3: '大量题目分析可能需要较长时间',
    analyzing: '分析中...',
    analyzeButton: '开始分析'
  },

  // BatchMoveModal 组件
  batchMoveModal: {
    title: '批量移动题目',
    selectedCount: '选中的题目 ({count})',
    moveTarget: '移动到',
    moveTargetPlaceholder: '选择目标题目',
    movePosition: '移动位置',
    moveBefore: '移动到所选题目之前',
    moveAfter: '移动到所选题目之后',
    moveButton: '确认移动',
    noQuestionsSelected: '请选择要移动的题目',
    noTargetSelected: '请选择目标题目'
  },

  // QuestionPreviewStats 组件
  questionPreviewStats: {
    total: '总题目数',
    selected: '已选择',
    analyzed: '已分析',
    questions: '道题目',
    byType: '按类型',
    byDifficulty: '按难度',
    byStatus: '按状态'
  },

  // QuestionList 组件
  questionList: {
    noQuestions: '暂无题目',
    loading: '加载中...',
    errorLoading: '加载题目失败'
  },

  // QuestionGrid 组件
  questionGrid: {
    noQuestions: '暂无题目',
    loading: '加载中...',
    errorLoading: '加载题目失败'
  },

  // QuestionPreviewHeader 组件
  questionPreviewHeader: {
    backToUpload: '返回批量上传',
    title: '题目预览与编辑',
    draftManager: '草稿管理',
    totalQuestions: '总题目',
    selectedQuestions: '已选择 {count} 题'
  },

  // QuestionPreviewToolbar 组件
  questionPreviewToolbar: {
    grid: '网格',
    list: '列表',
    selectAll: '全选',
    deselectAll: '取消全选',
    setSource: '设置来源',
    aiAnalysis: 'AI分析',
    analyzing: '分析中...',
    batchMove: '批量移动',
    save: '保存',
    delete: '删除',
    searchPlaceholder: '搜索题目内容...',
    filter: '筛选',
    reset: '重置',
    sortPlaceholder: '选择排序方式',
    questionType: '题目类型',
    difficulty: '难度等级',
    tags: '标签',
    source: '来源'
  },

  // QuestionEditModal 组件
  questionEditModal: {
    title: '编辑题目',
    showPreview: '显示预览',
    hidePreview: '隐藏预览',
    basicInfo: '基础信息',
    questionContent: '题目内容',
    media: '题目图片与图形',
    answer: '答案与解析',
    category: '分类与标签',
    sourceInfo: '来源信息',
    questionTypeLabel: '题目类型',
    difficultyLabel: '难度等级',
    stem: '题干',
    options: '选项',
    fillAnswers: '填空题答案',
    solutionAnswers: '解答题答案',
    solution: '解析',
    categoryLabel: '小题型分类',
    tagsLabel: '知识点标签',
    sourceLabel: '题目来源',
    sourcePlaceholder: '请输入题目来源，如：2025年上海中学高一期中',
    addOption: '添加选项',
    correctAnswer: '正确答案',
    fillAnswer: '第{index}空答案',
    solutionAnswer: '答案 {label}',
    validation: {
      stemRequired: '题干不能为空',
      minOptions: '选择题至少需要2个选项',
      correctOptionRequired: '选择题至少需要选择一个正确答案',
      emptyOptions: '选择题选项不能为空',
      minFillAnswers: '填空题至少需要一个答案',
      emptyFillAnswers: '填空题答案不能为空',
      minSolutionAnswers: '解答题至少需要一个解答步骤',
      emptySolutionAnswers: '解答题答案不能为空',
      maxCategory: '小题型分类最多3个',
      maxTags: '知识点标签最多5个'
    },
    preview: {
      title: '实时预览',
      stem: '题干',
      options: '选项',
      fillAnswers: '填空题答案',
      solutionAnswers: '解答题答案',
      solution: '解析',
      source: '来源'
    }
  },

  // SortableQuestionCard 组件
  sortableQuestionCard: {
    questionNumber: '题目 {number}',
    type: '类型',
    difficultyLabel: '难度',
    source: '出处',
    tags: '标签',
    answer: '答案',
    solution: '解析',
    unknownSource: '未知来源',
    questionType: {
      choice: '单选题',
      multipleChoice: '多选题',
      fill: '填空题',
      solution: '解答题',
      unknown: '未知'
    },
    difficulty: {
      easy: '简单',
      mediumEasy: '较简单',
      medium: '中等',
      mediumHard: '较难',
      hard: '困难'
    },
    actions: {
      edit: '编辑',
      analyze: '分析',
      split: '拆分',
      delete: '删除'
    },
    analyzing: '分析中...',
    answerGenerating: '生成答案中...'
  },

  // SourceSettingPanel 组件
  sourceSettingPanel: {
    title: '设置题目来源',
    selectedCount: '已选择 {count} 道题目',
    source: '来源',
    sourcePlaceholder: '请输入题目来源',
    save: '保存',
    cancel: '取消'
  },

  // DraftManager 组件
  draftManager: {
    title: '题目集草稿',
    currentDraft: '当前草稿：{name}',
    notInDraftMode: '未在草稿模式',
    saveCurrent: '保存当前题目集为草稿',
    noQuestionsToSave: '暂无题目可保存',
    noQuestionsHint: '请先上传文档或加载草稿',
    draftName: '草稿名称',
    draftNamePlaceholder: '请输入草稿名称',
    description: '描述（可选）',
    descriptionPlaceholder: '请输入草稿描述',
    save: '保存',
    cancel: '取消',
    draftList: '草稿列表 ({count})',
    loadingDrafts: '正在加载草稿...',
    noDrafts: '暂无草稿',
    noDraftsHint: '保存题目集后，草稿将显示在这里',
    questionCount: '{count}题',
    lastModified: '最后修改',
    load: '加载',
    currentDraftStatus: '当前草稿',
    loading: '正在加载...',
    rename: '重命名',
    edit: '编辑',
    delete: '删除',
    deleting: '正在删除...',
    saveRename: '保存',
    cancelRename: '取消',
    confirmDelete: '确认删除',
    confirmDeleteMessage: '确定要删除草稿"{name}"吗？',
    confirmLoad: '确认加载',
    confirmLoadMessage: '当前有未保存的草稿，确定要加载其他草稿吗？',
    confirmOverwrite: '确认覆盖',
    confirmOverwriteMessage: '检测到与草稿"{name}"高度相似的习题集.\n\n相似度：{similarity}%\n\n是否要覆盖现有草稿？\n\n注意：这将更新草稿"{name}"的内容，而不是创建新的草稿.',
    inputError: '输入错误',
    inputErrorMessage: '请输入草稿名称',
    saveFailed: '保存失败',
    saveFailedMessage: '没有题目可以保存',
    updateSuccess: '更新成功',
    updateSuccessMessage: '已更新草稿：{name}',
    updateFailed: '更新失败',
    updateFailedMessage: '草稿更新失败，请重试',
    saveSuccess: '保存成功',
    saveSuccessMessage: '草稿"{name}"保存成功',
    loadSuccess: '加载成功',
    loadSuccessMessage: '已加载草稿：{name}',
    loadFailed: '加载失败',
    loadFailedMessage: '加载草稿失败，请重试',
    deleteSuccess: '删除成功',
    deleteSuccessMessage: '草稿删除成功',
    deleteFailed: '删除失败',
    deleteFailedMessage: '草稿删除失败，请重试',
    renameSuccess: '重命名成功',
    renameSuccessMessage: '草稿重命名成功',
    nameExists: '名称重复',
    nameExistsMessage: '草稿名称已存在',
    invalidId: '重命名失败',
    invalidIdMessage: '草稿ID无效',
    cloudStorage: '草稿保存在云端数据库中',
    dataSecurity: '数据安全可靠，支持多设备同步'
  },

  // PaperHistoryDetail 组件
  paperHistoryDetail: {
    title: '文档处理详情',
    subtitle: '查看上传文档的详细处理信息',
    fileInfo: '文件信息',
    fileInfoEn: 'Document Information',
    fileName: '文件名',
    fileType: '文件类型',
    fileSize: '文件大小',
    processStatus: '处理状态',
    timeInfo: '时间信息',
    timeInfoEn: 'Time Information',
    uploadTime: '上传时间',
    processComplete: '处理完成',
    processTime: '处理耗时',
    processTimeUnit: '秒',
    resultsOverview: '处理结果概览',
    resultsOverviewEn: 'Processing Results Overview',
    totalQuestions: '总题目数',
    avgConfidence: '平均置信度',
    fileFormat: '文件格式',
    processStatusLabel: '处理状态',
    typeDistribution: '题目类型分布',
    typeDistributionEn: 'Question Type Distribution',
    questions: '道题目',
    processingSteps: '处理步骤详情',
    processingStepsEn: 'Processing Steps Details',
    completed: '完成',
    processing: '处理中',
    failed: '失败',
    waiting: '等待',
    stepError: '错误信息',
    documentId: '文档ID: {id}',
    export: '导出',
    share: '分享',
    close: '关闭',
    questionTypes: {
      choice: '选择题',
      fill: '填空题',
      solution: '解答题',
      unknown: '未知类型'
    },
    statusTypes: {
      completed: '处理完成',
      failed: '处理失败',
      processing: '处理中',
      uploading: '上传中',
      waiting: '等待中',
      paused: '已暂停',
      retrying: '重试中',
      unknown: '未知状态'
    }
  },

  // ProcessingProgressCard 组件
  processingProgressCard: {
    estimatedTime: '预估时间: {time}',
    calculating: '计算中...',
    overallProgress: '总体进度',
    processingSteps: '处理步骤',
    retryCount: '重试次数: {current}/{max}',
    cancel: '取消',
    continue: '继续',
    retry: '重试',
    delete: '删除',
    status: {
      completed: '完成',
      processing: '处理中',
      failed: '失败',
      waiting: '等待'
    }
  },

  // DraftReminderModal 组件
  draftReminderModal: {
    needSave: '需要保存草稿',
    saveReminder: '保存草稿提醒',
    needSaveMessage: '您需要先保存草稿才能进行编辑操作',
    saveReminderMessage: '您有未保存的题目，建议先保存草稿',
    questionCount: '题目数量',
    questionCountValue: '{count} 道',
    saveHint: '保存草稿后即可进行编辑、删除、拖拽等操作',
    saveHint2: '建议及时保存，避免数据丢失',
    draftName: '草稿名称',
    draftNamePlaceholder: '请输入草稿名称',
    description: '描述（可选）',
    descriptionPlaceholder: '请输入草稿描述，帮助您更好地管理题目',
    saveNow: '立即保存',
    saving: '保存中...',
    cancel: '取消',
    saveLater: '稍后保存',
    benefits: '保存草稿的好处：',
    benefit1: '防止数据丢失',
    benefit2: '支持后续编辑和修改',
    benefit3: '可以随时恢复工作进度'
  },

  // ProcessingResultPreview 组件
  processingResultPreview: {
    processingComplete: '处理完成',
    questionsIdentified: '识别题目',
    confidence: '置信度',
    enterEdit: '进入编辑',
    downloadResult: '下载结果',
    share: '分享'
  },

  // QuestionSplitModal 组件
  questionSplitModal: {
    title: '分割题目',
    originalContent: '原题目内容：',
    selectTextHint: '选中要分割的文本，然后点击"添加分割点"',
    splitPoints: '分割点：',
    selectedText: '已选中: "{text}"',
    addSplitPoint: '添加分割点',
    splitPoint: '分割点 {index}: 位置 {position}',
    noSplitPoints: '暂无分割点，请选中文本并添加分割点',
    splitPreview: '分割预览：',
    newQuestion: '新题目 {index}',
    questionTypeOptions: {
      choice: '选择题',
      fill: '填空题',
      solution: '解答题',
      question: '题目'
    },
    willGenerate: '将生成 {count} 道新题目',
    cancel: '取消',
    confirmSplit: '确认分割 ({count} 道题目)'
  },

  // 通用文本
  common: {
    loading: '加载中...',
    error: '错误',
    success: '成功',
    warning: '警告',
    info: '信息',
    confirm: '确认',
    cancel: '取消',
    save: '保存',
    delete: '删除',
    edit: '编辑',
    close: '关闭',
    back: '返回',
    next: '下一步',
    previous: '上一步',
    finish: '完成',
    retry: '重试',
    refresh: '刷新',
    search: '搜索',
    filter: '筛选',
    sort: '排序',
    select: '选择',
    clear: '清空',
    reset: '重置',
    submit: '提交',
    apply: '应用',
    ok: '确定',
    yes: '是',
    no: '否'
  }
};
