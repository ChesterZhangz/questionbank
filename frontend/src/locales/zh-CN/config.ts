export const config = {
  // 网站配置
  site: {
    name: 'MareateBank',
    description: '智能题库管理平台',
    tagline: '智能题库管理平台'
  },

  // 试卷集分类
  paperBankCategories: {
    allCategories: '全部分类',
    allSubcategories: '全部子分类',
    categories: {
      mathematics: {
        label: '数学',
        subcategories: {
          'primary-math': '小学数学',
          'junior-math': '初中数学',
          'senior-math': '高中数学',
          'calculus': '微积分',
          'linear-algebra': '线性代数',
          'mathematical-analysis': '数学分析',
          'probability-statistics': '概率论与数理统计',
          'discrete-mathematics': '离散数学',
          'differential-equations': '微分方程',
          'complex-analysis': '复变函数',
          'real-analysis': '实变函数',
          'abstract-algebra': '抽象代数',
          'topology': '拓扑学',
          'functional-analysis': '泛函分析',
          'numerical-analysis': '数值分析'
        }
      },
      physics: {
        label: '物理',
        subcategories: {
          'junior-physics': '初中物理',
          'senior-physics': '高中物理',
          'mechanics': '力学',
          'thermodynamics': '热力学',
          'electromagnetism': '电磁学',
          'optics': '光学',
          'quantum': '量子物理',
          'relativity': '相对论',
          'nuclear': '核物理',
          'particle': '粒子物理',
          'astrophysics': '天体物理',
          'condensed-matter': '凝聚态物理',
          'wave-physics': '波动学',
          'acoustics': '声学',
          'fluid-mechanics': '流体力学',
          'solid-mechanics': '固体力学'
        }
      }
    }
  },

  // TikZ配置
  tikz: {
    // 默认样式
    defaultStyles: {
      title: '默认样式',
      description: 'TikZ图形的基本样式配置',
      stroke: '描边',
      fill: '填充',
      lineWidth: '线宽',
      lineCap: '线端',
      lineJoin: '连接',
      dashPattern: '虚线模式',
      opacity: '透明度',
      color: '颜色',
      gradient: '渐变',
      shadow: '阴影',
      arrow: '箭头',
      node: '节点',
      coordinate: '坐标',
      grid: '网格',
      axis: '坐标轴',
      legend: '图例',
      label: '标签'
    },

    // 数学函数
    mathFunctions: {
      title: '数学函数',
      description: '常用的数学函数和表达式',
      basic: '基本函数',
      trigonometric: '三角函数',
      logarithmic: '对数函数',
      exponential: '指数函数',
      polynomial: '多项式',
      rational: '有理函数',
      hyperbolic: '双曲函数',
      inverse: '反函数',
      composite: '复合函数',
      piecewise: '分段函数',
      parametric: '参数方程',
      polar: '极坐标',
      vector: '向量函数',
      matrix: '矩阵函数',
      complex: '复变函数',
      special: '特殊函数',
      custom: '自定义函数'
    },

    // 颜色方案
    colorSchemes: {
      title: '颜色方案',
      description: '预定义的颜色主题和调色板',
      basic: '基础颜色',
      primary: '主色调',
      secondary: '辅助色',
      accent: '强调色',
      neutral: '中性色',
      warm: '暖色调',
      cool: '冷色调',
      pastel: '粉彩色',
      vibrant: '鲜艳色',
      monochrome: '单色调',
      complementary: '互补色',
      analogous: '类似色',
      triadic: '三色组合',
      tetradic: '四色组合',
      custom: '自定义颜色',
      gradient: '渐变色',
      rainbow: '彩虹色',
      earth: '大地色',
      ocean: '海洋色',
      sunset: '日落色',
      forest: '森林色',
      desert: '沙漠色',
      arctic: '极地色',
      tropical: '热带色',
      vintage: '复古色',
      modern: '现代色',
      neon: '霓虹色',
      metallic: '金属色'
    }
  }
};
