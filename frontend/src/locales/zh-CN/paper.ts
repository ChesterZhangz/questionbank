export const paper = {
  // PracticePaperCard 组件
  practicePaperCard: {
    paperBank: '试卷集',
    unknownPaperBank: '未知试卷集',
    sectionsAndQuestions: '{sectionCount}个部分 · {totalQuestions}道题',
    practicePaper: '练习卷',
    roles: {
      creator: '创建者',
      manager: '管理员',
      collaborator: '协作者',
      viewer: '查看者'
    },
    created: '创建:',
    updated: '更新:',
    preview: '预览',
    edit: '编辑',
    creatorInfo: '创建者: {creatorName}',
    unknownUser: '未知用户'
  },

  // PracticePaperPreviewModal 组件
  practicePaperPreviewModal: {
    questionTypes: {
      choice: '选择题',
      multipleChoice: '多选题',
      fill: '填空题',
      solution: '解答题'
    },
    difficulty: {
      veryEasy: '很简单',
      easy: '简单',
      medium: '中等',
      hard: '困难',
      veryHard: '很困难',
      unknown: '未知'
    },
    labels: {
      practicePaper: '练习卷',
      paperBank: '试卷集:',
      overleafEditLink: 'Overleaf编辑链接',
      sectionCount: '部分数',
      totalQuestions: '总题数',
      createdAt: '创建时间',
      creator: '创建者',
      tags: '标签',
      questionPreview: '题目预览',
      loadingQuestions: '加载题目中...',
      incompleteQuestionData: '题目数据不完整',
      graphicsAndImages: '图形与图片',
      options: '选项',
      summary: '共 {sectionCount} 个部分，{totalQuestions} 道题目',
      close: '关闭'
    },
    errors: {
      fetchFailed: '获取练习卷详情失败:'
    }
  },

  // CopyButton 组件
  copyButton: {
    states: {
      opening: '打开中...',
      copying: '复制中...',
      opened: '已打开',
      copied: '已复制',
      openInOverleaf: '用Overleaf打开',
      copyLaTeX: '复制LaTeX'
    },
    hint: '默认状态下全部复制',
    errors: {
      operationFailed: '操作失败:'
    }
  },

  // copyUtils 相关
  copyUtils: {
    difficulty: {
      veryEasy: '非常简单',
      easy: '简单',
      medium: '中等',
      hard: '困难',
      veryHard: '非常困难',
      unknown: '未知'
    },
    answer: {
      answer: '答案：',
      separator: '、',
      fillSeparator: '；'
    },
    errors: {
      copyFailed: '复制失败'
    }
  },

  // CopyModeSelector 组件
  copyModeSelector: {
    modes: {
      mareate: {
        label: 'Mareate版',
        description: 'Mareate部门独创，排版美观'
      },
      normal: {
        label: '常规',
        description: '无自定义与答案，均为必要包'
      }
    },
    copyMethod: {
      label: '复制方式',
      clipboard: {
        label: '复制到剪贴板',
        description: '将LaTeX代码复制到系统剪贴板'
      },
      overleaf: {
        label: '在Overleaf中打开',
        description: '直接在新标签页中打开Overleaf项目'
      }
    },
    copyMode: {
      label: '复制模式'
    },
    vspace: {
      addVspace: '添加题目间距',
      choiceSpacing: '选择题间距',
      fillSpacing: '填空题间距',
      solutionSpacing: '解答题间距',
      defaultSpacing: '默认间距'
    },
    normalConfig: {
      title: '常规模式配置',
      addDocumentEnvironment: '添加完整LaTeX文档环境',
      overleafDefault: '(Overleaf模式默认启用)',
      paperSize: '纸张尺寸',
      customGeometry: '自定义Geometry配置',
      paperSizes: {
        a4: 'A4 (21cm × 29.7cm)',
        b5: 'B5 (18.2cm × 25.7cm)',
        custom: '自定义'
      }
    }
  },

  // OverleafLinkManager 组件
  overleafLinkManager: {
    messages: {
      operationSuccess: '操作成功',
      linkUpdated: 'Overleaf链接更新成功',
      linkAdded: 'Overleaf链接添加成功',
      operationFailed: '操作失败',
      updateFailed: '更新Overleaf链接失败',
      deleteSuccess: '删除成功',
      linkDeleted: 'Overleaf链接已删除'
    },
    confirmDialog: {
      title: '确认删除',
      message: '确定要删除Overleaf编辑链接吗？删除后无法恢复。',
      delete: '删除',
      cancel: '取消',
      deleting: '删除中...'
    }
  },

  // PaperCopyManager 组件
  paperCopyManager: {
    overleafEditLink: 'Overleaf编辑链接',
    copySettings: '复制设置',
    advancedSettings: '高级设置',
    selectiveCopy: '选择性复制',
    copyAll: '复制全部',
    copySelected: '复制选中题目',
    selectedCount: '已选择 {count} 道题目',
    copyConfig: '复制配置',
    copy: '复制',
    settings: '设置',
    collapseSettings: '收起设置'
  }
};