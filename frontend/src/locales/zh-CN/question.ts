export const question = {
  // AbilityRadarChart 组件
  abilityRadarChart: {
    labels: {
      logicalThinking: '逻辑思维',
      mathematicalIntuition: '数学直观',
      problemSolving: '问题解决',
      analyticalAbility: '分析能力',
      creativeThinking: '创造性思维',
      computationalSkills: '计算技能'
    }
  },

  // QuestionCard 组件
  questionCard: {
    questionNumber: '题目 {number}',
    type: '类型',
    difficulty: '难度',
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
    difficult_level: {
      easy: '简单',
      mediumEasy: '较简单',
      medium: '中等',
      mediumHard: '较难',
      hard: '困难'
    },
    actions: {
      view: '查看',
      edit: '编辑',
      favorite: '收藏',
      unfavorite: '取消收藏',
      delete: '删除',
      more: '更多'
    },
    media: {
      showMedia: '显示媒体',
      hideMedia: '隐藏媒体',
      noMedia: '无媒体内容',
      imageCount: '{count} 张图片',
      tikzCount: '{count} 个图形'
    },
    status: {
      analyzing: '分析中...',
      answerGenerating: '生成答案中...',
      loading: '加载中...'
    }
  },

  // QuestionView 组件
  questionView: {
    title: '题目详情',
    questionNumber: '题目 {current} / {total}',
    navigation: {
      previous: '上一题',
      next: '下一题',
      close: '关闭'
    },
    actions: {
      share: '分享',
      favorite: '收藏',
      unfavorite: '取消收藏',
      edit: '编辑',
      delete: '删除',
      view: '查看'
    },
    evaluation: {
      title: '能力评估',
      loading: '正在评估...',
      error: '评估失败',
      retry: '重试评估',
      noData: '暂无评估数据'
    },
    analysis: {
      title: 'AI智能分析',
      loading: 'AI分析生成中，请稍候...',
      error: 'AI分析失败',
      retry: '重试'
    },
    media: {
      showMedia: '显示媒体',
      hideMedia: '隐藏媒体',
      noMedia: '无媒体内容',
      imageCount: '{count} 张图片',
      tikzCount: '{count} 个图形',
      title: '图形与图片',
      image: '图片',
      tikz: '图形'
    },
    status: {
      analyzing: '分析中...',
      answerGenerating: '生成答案中...',
      loading: '加载中...'
    },
    tabs: {
      question: '题目',
      solution: '解析',
      analysis: '分析'
    },
    content: {
      title: '题目内容'
    },
    answer: {
      show: '显示',
      hide: '隐藏',
      correctHighlighted: '正确答案已在上方选项中高亮显示'
    },
    solution: {
      noSolution: '暂无解析'
    },
    sidebar: {
      title: '题目信息',
      creator: '创建者',
      createdAt: '创建时间',
      views: '浏览量',
      favorites: '收藏数'
    },
    related: {
      title: '相关题目',
      showFirst3: '显示前3个',
      retry: '重试',
      loading: '加载中...',
      noSimilar: '暂无高相似度题目'
    },
    keyboard: {
      instructions: '使用 ← → 键切换题目',
      edit: 'Ctrl+E 编辑题目',
      close: 'ESC 键关闭弹窗'
    },
    tikzPreview: {
      title: 'TikZ 图形预览'
    }
  },

  // SimpleMediaPreview 组件
  simpleMediaPreview: {
    showMedia: '显示媒体',
    hideMedia: '隐藏媒体',
    noMedia: '无媒体内容',
    imageCount: '{count} 张图片',
    tikzCount: '{count} 个图形',
    preview: '预览',
    close: '关闭',
    title: '题目图形 ({count})',
    show: '显示',
    hide: '隐藏',
    tikzGraphic: 'TikZ 图形'
  },

  // MediaContentPreview 组件
  mediaContentPreview: {
    noMedia: '无媒体内容',
    loading: '加载中...',
    error: '加载失败',
    retry: '重试',
    title: '题目媒体内容',
    images: '图片',
    image: '图片',
    tikzGraphics: 'TikZ 图形',
    graphic: '图形'
  },

  // QuestionImageManager 组件
  questionImageManager: {
    title: '题目图片 ({current}/{max})',
    upload: '上传图片',
    dragTitle: '拖拽图片到此处或点击上传',
    dragDescription: '支持 JPG、PNG 格式，最大 10MB',
    selectFile: '选择文件',
    uploading: '上传中...',
    uploadSuccess: '上传成功',
    uploadError: '上传失败',
    delete: '删除',
    confirmDelete: '确认删除',
    confirmDeleteMessage: '确定要删除这张图片吗？',
    cancel: '取消',
    confirm: '确认',
    noImages: '暂无图片',
    imageCount: '{count} 张图片',
    maxImagesExceeded: '最多只能上传{maxImages}张图片',
    bankIdMissing: '题库ID不存在，无法上传图片',
    uploadFailed: '图片 {filename} 上传失败',
    uploadFailedTitle: '上传失败',
    uploadComplete: '上传完成',
    uploadSuccessMessage: '成功上传 {count} 张图片',
    partialSuccess: '部分成功',
    partialSuccessMessage: '成功上传 {success}/{total} 张图片',
    uploadImages: '上传图片',
    dropToUpload: '释放文件以上传',
    dragOrClick: '拖拽图片文件到这里，或点击上传按钮',
    supportedFormats: '支持 JPG、PNG、GIF 格式，单个文件最大 5MB',
    uploadToEnrich: '上传图片来丰富题目内容'
  },

  // BatchEditMediaEditor 组件
  batchEditMediaEditor: {
    title: '批量编辑媒体',
    images: '图片',
    tikzCodes: '图形',
    upload: '上传',
    dragTitle: '拖拽文件到此处或点击上传',
    dragDescription: '支持 JPG、PNG 格式，最大 10MB',
    selectFile: '选择文件',
    uploading: '上传中...',
    uploadSuccess: '上传成功',
    uploadError: '上传失败',
    delete: '删除',
    confirmDelete: '确认删除',
    confirmDeleteMessage: '确定要删除这个媒体项吗？',
    cancel: '取消',
    confirm: '确认',
    noMedia: '暂无媒体内容',
    imageCount: '{count} 张图片',
    tikzCount: '{count} 个图形',
    bankIdMissing: '题库ID不存在，无法上传图片',
    fileTooLarge: '文件 {filename} 过大，请选择小于5MB的图片',
    uploadFailed: '图片上传失败',
    singleUploadFailed: '图片 {filename} 上传失败: {error}',
    uploadFailedRetry: '图片上传失败，请重试',
    total: '总计',
    noImagesAdded: '还没有添加图片',
    uploadImages: '上传图片',
    uploadedImages: '已经上传的图片为',
    image: '图片',
    uploadMoreImages: '上传更多图片',
    supportedFormats: '支持 JPG、PNG、GIF 格式',
    noTikzAdded: '还没有添加 TikZ 图形',
    addTikzCode: '添加 TikZ 代码',
    tikzCode: 'TikZ 代码',
    tikzGraphic: 'TikZ 图形',
    enterTikzCode: '输入 TikZ 代码...',
    addMoreTikzCode: '添加更多 TikZ 代码',
    createGraphics: '创建几何图形和数学图表'
  },

  // IntegratedMediaEditor 组件
  integratedMediaEditor: {
    title: '集成媒体编辑器',
    images: '图片',
    tikzCodes: '图形',
    upload: '上传',
    dragTitle: '拖拽文件到此处或点击上传',
    dragDescription: '支持 JPG、PNG 格式，最大 10MB',
    selectFile: '选择文件',
    uploading: '上传中...',
    uploadSuccess: '上传成功',
    uploadError: '上传失败',
    delete: '删除',
    confirmDelete: '确认删除',
    confirmDeleteMessage: '确定要删除这个媒体项吗？',
    cancel: '取消',
    confirm: '确认',
    noMedia: '暂无媒体内容',
    imageCount: '{count} 张图片',
    tikzCount: '{count} 个图形',
    bankIdMissing: '题库ID不存在，无法上传图片',
    fileTooLarge: '文件过大',
    fileTooLargeMessage: '文件 {filename} 过大，请选择小于5MB的图片',
    uploadFailed: '图片 {filename} 上传失败',
    uploadFailedTitle: '上传失败',
    uploadComplete: '上传完成',
    uploadSuccessMessage: '成功上传 {count} 张图片',
    partialSuccess: '部分成功',
    partialSuccessMessage: '成功上传 {success}/{total} 张图片',
    total: '总计',
    noImagesAdded: '还没有添加图片',
    uploadImages: '上传图片',
    noTikzAdded: '还没有添加 TikZ 图形',
    addTikzGraphic: '添加 TikZ 图形',
    graphic: '图形',
    tikzCode: 'TikZ 代码',
    enterTikzCode: '输入TikZ代码...',
    graphicPreview: '图形预览'
  },

  // QuestionMediaManager 组件
  questionMediaManager: {
    title: '题目媒体管理',
    description: '管理题目的图片和TikZ图形，提升题目的可视化效果',
    imageCount: '{count} 张图片',
    tikzCount: '{count} 个TikZ图形',
    imageManagement: '图片管理',
    tikzGraphics: 'TikZ图形',
    tikzManagement: 'TikZ图形管理',
    mediaPreview: '媒体预览',
    realTimePreview: '实时预览题目的图片和TikZ图形',
    imagePreview: '图片预览',
    tikzPreview: 'TikZ图形预览',
    noMediaContent: '暂无媒体内容',
    addMediaToEnrich: '添加图片或TikZ图形来丰富题目内容',
    usageTips: '使用提示',
    tip1: '图片支持拖拽上传，最大5MB，支持JPG、PNG、GIF格式',
    tip2: 'TikZ图形支持模拟渲染（无需后端）和真实渲染（需要LaTeX环境）',
    tip3: '可以调整图片和TikZ图形的显示顺序',
    tip4: '所有媒体内容都会自动保存到题目中'
  },

  // EnhancedQuestionItem 组件
  enhancedQuestionItem: {
    questionNumber: '题目 {number}',
    type: '类型',
    difficulty: '难度',
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
    difficult_level: {
      easy: '简单',
      mediumEasy: '较简单',
      medium: '中等',
      mediumHard: '较难',
      hard: '困难'
    },
    actions: {
      view: '查看',
      edit: '编辑',
      favorite: '收藏',
      unfavorite: '取消收藏',
      delete: '删除',
      more: '更多'
    },
    media: {
      showMedia: '显示媒体',
      hideMedia: '隐藏媒体',
      noMedia: '无媒体内容',
      imageCount: '{count} 张图片',
      tikzCount: '{count} 个图形'
    },
    status: {
      analyzing: '分析中...',
      answerGenerating: '生成答案中...',
      loading: '加载中...'
    },
    quickEdit: '快速编辑',
    questionTypeLabel: '题目类型',
    difficultyLabel: '难度等级',
    tagManagement: '标签管理',
    addTag: '添加标签...',
    cancel: '取消',
    save: '保存',
    confidence: '置信度',
    options: '选项',
    blanks: '个填空',
    document: '文档',
    category: '分类'
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
