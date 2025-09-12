// 编辑器相关翻译
export const editor = {
  // LaTeX编辑器
  latexEditor: {
    title: 'LaTeX编辑区域',
    mathSymbols: '数学符号',
    questionSymbols: '题目符号',
    showPreview: '显示预览',
    hidePreview: '隐藏预览',
    placeholder: '输入LaTeX公式...',
    // 题目类型
    questionTypes: {
      choice: '选择题',
      fill: '填空题',
      solution: '解答题',
      solutionDisplay: '解析'
    }
  },
  
  // 符号面板
  symbolPanel: {
    mathSymbols: '数学符号',
    questionSymbols: '题目符号',
    close: '关闭'
  },
  
  // 多题目编辑器
  multiQuestionEditor: {
    title: '多题目编辑器',
    questionCount: '第 {current} 题 / 共 {total} 题',
    delete: '删除',
    batchAnalysis: '一键智能分析',
    batchSave: '批量保存',
    analyzing: '分析中...',
    saving: '保存中...',
    previous: '上一题',
    next: '下一题',
    questionBankSelected: '已选择题库',
    selectQuestionBank: '请先选择题库',
    deleteConfirm: '至少需要保留一道题目',
    deleteSuccess: '题目已删除',
    analysisSuccess: '成功分析 {count} 道题目',
    saveSuccess: '成功保存所有 {count} 道题目',
    savePartial: '保存完成：成功 {success} 道，失败 {fail} 道',
    analysisFailed: '批量智能分析失败',
    saveFailed: '批量保存失败'
  },
  
  // 多题目上传器
  multiQuestionUploader: {
    title: '上传题目图片',
    dragToUpload: '释放以上传图片',
    supportFormats: '支持 JPG、PNG 格式，最大 {maxSize}MB，最多10张图片',
    selectedCount: '已选择 {count}/10 张图片',
    selectImages: '选择图片',
    clear: '清空',
    startRecognition: '开始识别 ({count} 张图片)',
    recognizing: '识别中...',
    selectedImages: '已选择的图片',
    preview: '预览 {index}',
    fileSize: '{size} MB',
    imageViewer: '图片 {current} / {total}',
    unsupportedFormat: '不支持的文件类型: {type}',
    fileTooLarge: '文件大小不能超过 {maxSize}MB',
    maxFilesExceeded: '最多只能上传10张图片',
    recognitionFailed: '批量OCR识别失败',
    noQuestionsGenerated: '没有生成任何题目'
  },
  
  // 题目编辑器
  questionEditor: {
    title: '题目编辑器',
    questionType: '题目类型',
    questionContent: '题目内容',
    solution: '解析',
    options: '选项设置',
    singleChoice: '单选题',
    multipleChoice: '多选题',
    autoDetected: '（系统自动判断）',
    addOption: '添加选项',
    delete: '删除',
    fillAnswers: '填空题答案',
    fillCount: '检测到 {count} 个填空，请填写对应答案',
    fillAnswerPlaceholder: '第{index}空答案',
    solutionAnswers: '解答题答案',
    solutionCount: '检测到 {count} 个解答点，请填写对应答案',
    solutionAnswerPlaceholder: '第{index}点答案',
    answer: '答案',
    answerPlaceholder: '输入答案',
    difficulty: '难度设置',
    difficultyLevels: {
      1: '★☆☆☆☆ 基础题',
      2: '★★☆☆☆ 简单题',
      3: '★★★☆☆ 中等题',
      4: '★★★★☆ 困难题',
      5: '★★★★★ 难题'
    },
    category: '分类',
    categoryPlaceholder: '输入题目分类',
    source: '来源',
    sourcePlaceholder: '输入题目来源',
    tags: '知识点标签',
    tagsPlaceholder: '输入知识点标签',
    addTag: '添加',
    selectPresetTags: '选择预设标签',
    questionBank: '题库：{name}',
    questionId: '题目ID：{id}',
    quickEdit: '快捷编辑',
    save: '保存',
    cancel: '取消',
    clickToEdit: '点击编辑题目内容',
    clickToEditSolution: '点击编辑解析内容',
    addContent: '点击此处添加题目内容',
    addSolution: '点击此处添加解析内容',
    optionPreview: '选项 {letter} 预览',
    noContent: '暂无内容',
    latexError: 'LaTeX错误'
  },
  
  // 预览组件
  preview: {
    title: '渲染预览',
    livePreview: '实时预览',
    showPreview: '显示预览',
    hidePreview: '隐藏预览',
    noContent: '暂无内容',
    latexError: 'LaTeX错误',
    warnings: '警告'
  },
  
  // 知识点标签选择器
  knowledgeTagSelector: {
    title: '知识点标签',
    placeholder: '输入或选择知识点标签（最多{maxCount}个）',
    add: '添加',
    selectLimit: '选择限制',
    maxTagsReached: '知识点标签最多只能选择{maxCount}个',
    duplicateTag: '重复输入',
    tagExists: '该知识点标签已存在',
    categories: {
      mathBasic: '数学基础',
      advancedMath: '高等数学',
      middleSchoolMath: '中学数学'
    },
    hint: '请选择预设标签或输入自定义知识点标签，帮助更好地分类和检索题目'
  },
  
  // 题目来源选择器
  questionSourceSelector: {
    title: '题目来源',
    placeholder: '输入题目来源信息',
    clear: '清空',
    recentYears: '最近年份',
    stages: {
      primary: '小学',
      middle: '初中',
      high: '高中',
      college: '大学',
      graduate: '研究生',
      other: '其他'
    },
    regions: {
      beijing: '北京',
      shanghai: '上海',
      guangdong: '广东',
      jiangsu: '江苏',
      zhejiang: '浙江',
      shandong: '山东',
      hubei: '湖北',
      hunan: '湖南',
      sichuan: '四川',
      fujian: '福建',
      other: '其他'
    },
    types: {
      exam: '考试',
      homework: '作业',
      practice: '练习',
      competition: '竞赛',
      other: '其他'
    }
  },
  
  // 题目类型选择器
  questionTypeSelector: {
    title: '题目类型',
    placeholder: '输入或选择题目类型（最多{maxCount}个）',
    add: '添加',
    selectLimit: '选择限制',
    maxTypesReached: '题目类型最多只能选择{maxCount}个',
    duplicateType: '重复输入',
    typeExists: '该题目类型已存在',
    categories: {
      basic: '基础题',
      application: '应用题',
      comprehensive: '综合题',
      innovative: '创新题',
      other: '其他'
    },
    hint: '请选择预设类型或输入自定义题目类型，帮助更好地分类题目'
  }
};
