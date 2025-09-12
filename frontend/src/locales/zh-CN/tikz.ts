export const tikz = {
  // 自动补全相关
  autoComplete: {
    completeExample: '完整示例',
    categories: {
      draw: '绘制',
      shape: '图形',
      node: '节点',
      style: '样式',
      transform: '变换',
      math: '数学',
      greek: '希腊',
      symbol: '符号',
      arrow: '箭头'
    }
  },
  
  // 内容编辑器
  contentEditor: {
    title: 'TikZ 图形',
    count: '({count}/3)',
    edit: '编辑',
    preview: '预览',
    add: '添加',
    addFirst: '添加第一个图形',
    addDescription: '添加 TikZ 图形以增强题目表达',
    delete: '删除',
    graphNumber: '图形 {number}',
    placeholder: '输入TikZ代码...'
  },
  
  // 内容预览
  contentPreview: {
    title: '题目图形',
    graphNumber: '图形 {number}'
  },
  
  // 编辑器
  editor: {
    title: 'TikZ图形管理',
    count: '{current}/{max}',
    addTikZ: '添加TikZ图形',
    tikzNumber: 'TikZ图形 #{number}',
    format: '格式',
    svg: 'SVG',
    png: 'PNG',
    delete: '删除',
    tikzCode: 'TikZ代码',
    frontendPreview: '前端模拟预览',
    noTikZ: '还没有TikZ图形',
    noTikZDescription: '点击上方按钮添加第一个TikZ图形',
    maxTikZAlert: '最多只能添加{max}个TikZ图形'
  },
  
  // 编辑器面板
  editorPanel: {
    title: 'TikZ 图形编辑器',
    count: '({count}/3)',
    hidePreview: '隐藏预览',
    showPreview: '显示预览',
    addGraph: '添加图形',
    noTikZ: '还没有添加 TikZ 图形',
    addFirst: '添加第一个图形',
    graphNumber: '图形 {number}',
    edit: '编辑',
    delete: '删除',
    tikzCode: 'TikZ 代码',
    realtimePreview: '实时预览',
    size: {
      small: '小',
      medium: '中',
      large: '大'
    },
    editGraph: '编辑图形 {number}'
  },
  
  // 高亮输入
  highlightInput: {
    placeholder: '输入TikZ代码...',
    commonCommands: {
      draw: '绘制路径',
      fill: '填充图形',
      node: '节点',
      path: '路径命令',
      clip: '裁剪区域',
      rectangle: '矩形',
      circle: '圆形',
      ellipse: '椭圆',
      sinFunction: '正弦函数',
      quadFunction: '二次函数',
      cubicFunction: '三次函数'
    }
  },
  
  // 渲染器
  renderer: {
    tikzNumber: 'TikZ #{number}',
    format: '{format} 格式',
    simulateRender: '模拟渲染',
    realRender: '真实渲染',
    download: '下载图片',
    fullscreen: '全屏显示',
    exitFullscreen: '退出全屏',
    rendering: '渲染中...',
    renderComplete: '渲染完成',
    waitingRender: '等待渲染',
    renderError: '渲染失败',
    realRenderError: '真实渲染失败',
    waitingRenderDescription: '点击渲染按钮生成图形',
    simulateRenderDescription: '模拟渲染',
    realRenderDescription: '真实渲染',
    simulateDescription: '基于代码分析生成模拟图形，无需后端支持',
    realDescription: '调用后端LaTeX编译，生成真实的TikZ图形',
    simulationResults: {
      circle: '模拟圆形图形 ({format})',
      rectangle: '模拟矩形图形 ({format})',
      line: '模拟线条图形 ({format})',
      node: '模拟节点图形 ({format})',
      generic: '通用模拟图形 ({format})'
    }
  },
  
  // 预览组件
  preview: {
    title: '图形预览区域',
    description: '输入TikZ代码后自动渲染',
    frontendRender: '前端模拟渲染',
    noBackend: '无需后端'
  }
};
