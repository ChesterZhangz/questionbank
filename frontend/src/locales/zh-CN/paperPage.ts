export default {
  // 创建试卷页面
  createPage: {
    title: '创建试卷',
    description: '选择试卷类型，开始创建您的试卷',
    back: '返回',
    // 试卷类型选项
    paperTypes: {
      lecture: {
        label: '讲义',
        description: '教学讲义，用于知识传授（暂时禁用）',
        status: '即将开放'
      },
      practice: {
        label: '练习',
        description: '练习题，用于巩固知识',
        status: '可用'
      },
      test: {
        label: '试卷',
        description: '考试试卷，用于评估学习效果',
        status: '即将开放'
      }
    },
    // 权限相关
    noPermission: {
      title: '无法创建试卷',
      description: '您需要拥有试卷集的编辑、管理或拥有者权限才能创建试卷',
      methodsTitle: '获取权限的方法',
      methods: {
        createBank: '创建自己的试卷集',
        beInvited: '请试卷集拥有者添加您为成员',
        purchase: '购买已发布的试卷集'
      },
      viewBanks: '查看试卷集',
      createBank: '创建试卷集'
    },
    // 试卷集选择
    selectBank: {
      title: '选择试卷集',
      description: '请选择要在其中创建内容的试卷集',
      cancel: '取消',
      members: '成员',
      status: '状态',
      published: '已发布',
      draft: '草稿'
    },
    // 错误信息
    errors: {
      loadFailed: '加载失败',
      loadFailedMessage: '无法加载试卷集列表',
      cannotCreate: '无法创建试卷',
      cannotCreateMessage: '您需要先创建试卷集或有编辑权限的试卷集才能创建试卷',
      cannotCreatePractice: '无法创建练习',
      cannotCreatePracticeMessage: '您需要先创建试卷集或有编辑权限的试卷集才能创建练习',
      featureNotAvailable: '功能暂未开放',
      featureNotAvailableMessage: '该功能正在开发中，敬请期待！'
    },
    // 底部提示
    bottomTip: '选择试卷类型后，将直接进入编辑页面开始创建'
  },

  // 练习页面
  practicePage: {
    title: '练习模式',
    description: '管理和练习您的题目',
    back: '返回',
    createPractice: '创建练习',
    loading: '加载中...',
    // 搜索和筛选
    search: {
      placeholder: '搜索练习...',
      allBanks: '所有试卷集',
      sortBy: {
        newest: '最新更新',
        oldest: '最早创建',
        name: '按名称'
      }
    },
    // 空状态
    emptyState: {
      noResults: '没有找到匹配的练习',
      noResultsDescription: '尝试调整搜索条件或筛选器',
      noPractices: '还没有练习',
      noPracticesDescription: '开始创建您的第一个练习吧！'
    },
    // 练习卡片
    practiceCard: {
      more: '更多',
      view: '查看',
      edit: '编辑',
      updatedAt: '更新于'
    },
    // 错误信息
    errors: {
      loadFailed: '加载数据失败'
    }
  }
};
