// TikZ符号库 - 自动补全建议

export interface TikZSymbol {
  latex: string;
  name: string;
  description: string;
  category: string;
  examples?: string[];
}

// 绘制命令
export const DRAW_COMMANDS: TikZSymbol[] = [
  {
    latex: '\\draw',
    name: '绘制路径',
    description: '绘制路径或图形',
    category: 'draw',
    examples: ['\\draw (0,0) -- (1,1);', '\\draw [red, thick] (0,0) circle (1cm);']
  },
  {
    latex: '\\fill',
    name: '填充图形',
    description: '填充封闭图形',
    category: 'draw',
    examples: ['\\fill [blue] (0,0) circle (1cm);', '\\fill [red!30] (0,0) rectangle (2,1);']
  },
  {
    latex: '\\shade',
    name: '渐变填充',
    description: '创建渐变填充效果',
    category: 'draw',
    examples: ['\\shade [left color=red, right color=blue] (0,0) rectangle (2,1);']
  },
  {
    latex: '\\path',
    name: '路径命令',
    description: '定义路径但不绘制',
    category: 'draw',
    examples: ['\\path (0,0) -- (1,1);', '\\path [name path=A] (0,0) -- (1,1);']
  },
  {
    latex: '\\clip',
    name: '裁剪区域',
    description: '裁剪后续绘制内容',
    category: 'draw',
    examples: ['\\clip (0,0) circle (1cm);']
  }
];

// 图形命令
export const SHAPE_COMMANDS: TikZSymbol[] = [
  {
    latex: '\\circle',
    name: '圆形',
    description: '绘制圆形',
    category: 'shape',
    examples: ['\\draw (0,0) circle (1cm);', '\\fill [red] (0,0) circle (0.5cm);']
  },
  {
    latex: '\\rectangle',
    name: '矩形',
    description: '绘制矩形',
    category: 'shape',
    examples: ['\\draw (0,0) rectangle (2,1);', '\\fill [blue] (0,0) rectangle (1,1);']
  },
  {
    latex: '\\ellipse',
    name: '椭圆',
    description: '绘制椭圆',
    category: 'shape',
    examples: ['\\draw (0,0) ellipse (2cm and 1cm);']
  },
  {
    latex: '\\arc',
    name: '圆弧',
    description: '绘制圆弧',
    category: 'shape',
    examples: ['\\draw (0,0) arc (0:180:1cm);']
  },
  {
    latex: '\\parabola',
    name: '抛物线',
    description: '绘制抛物线',
    category: 'shape',
    examples: ['\\draw (0,0) parabola (1,1);']
  }
];

// 节点和坐标命令
export const NODE_COMMANDS: TikZSymbol[] = [
  {
    latex: '\\node',
    name: '节点',
    description: '创建文本或图形节点',
    category: 'node',
    examples: ['\\node at (0,0) {A};', '\\node [above] {Label};', '\\node [right] at (1,1) {B};']
  },
  {
    latex: '\\coordinate',
    name: '坐标点',
    description: '定义坐标点',
    category: 'node',
    examples: ['\\coordinate (A) at (0,0);', '\\coordinate [label=above:$P$] (P) at (1,1);']
  },
  {
    latex: '\\pic',
    name: '图片',
    description: '插入预定义图片',
    category: 'node',
    examples: ['\\pic at (0,0) {angle=A--B--C};']
  }
];

// 样式命令
export const STYLE_COMMANDS: TikZSymbol[] = [
  {
    latex: 'color',
    name: '颜色',
    description: '设置颜色',
    category: 'style',
    examples: ['color=red', 'color=blue!30', 'color=red!50!blue']
  },
  {
    latex: 'fill',
    name: '填充颜色',
    description: '设置填充颜色',
    category: 'style',
    examples: ['fill=red', 'fill=blue!20', 'fill=none']
  },
  {
    latex: 'draw',
    name: '绘制颜色',
    description: '设置绘制颜色',
    category: 'style',
    examples: ['draw=red', 'draw=black', 'draw=none']
  },
  {
    latex: 'line width',
    name: '线宽',
    description: '设置线条宽度',
    category: 'style',
    examples: ['line width=1pt', 'line width=2mm', 'ultra thick', 'very thin']
  },
  {
    latex: 'line cap',
    name: '线帽样式',
    description: '设置线条端点样式',
    category: 'style',
    examples: ['line cap=round', 'line cap=butt', 'line cap=rect']
  },
  {
    latex: 'line join',
    name: '线连接样式',
    description: '设置线条连接样式',
    category: 'style',
    examples: ['line join=round', 'line join=bevel', 'line join=miter']
  },
  {
    latex: 'dash pattern',
    name: '虚线样式',
    description: '设置虚线样式',
    category: 'style',
    examples: ['dash pattern=on 2pt off 2pt', 'dashed', 'dotted', 'loosely dashed']
  },
  {
    latex: 'opacity',
    name: '透明度',
    description: '设置透明度',
    category: 'style',
    examples: ['opacity=0.5', 'opacity=0.8']
  }
];

// 颜色值
export const COLOR_VALUES: TikZSymbol[] = [
  { latex: 'red', name: '红色', description: '红色', category: 'color' },
  { latex: 'blue', name: '蓝色', description: '蓝色', category: 'color' },
  { latex: 'green', name: '绿色', description: '绿色', category: 'color' },
  { latex: 'yellow', name: '黄色', description: '黄色', category: 'color' },
  { latex: 'orange', name: '橙色', description: '橙色', category: 'color' },
  { latex: 'purple', name: '紫色', description: '紫色', category: 'color' },
  { latex: 'brown', name: '棕色', description: '棕色', category: 'color' },
  { latex: 'pink', name: '粉色', description: '粉色', category: 'color' },
  { latex: 'gray', name: '灰色', description: '灰色', category: 'color' },
  { latex: 'cyan', name: '青色', description: '青色', category: 'color' },
  { latex: 'magenta', name: '洋红色', description: '洋红色', category: 'color' },
  { latex: 'black', name: '黑色', description: '黑色', category: 'color' },
  { latex: 'white', name: '白色', description: '白色', category: 'color' },
  { latex: 'red!30', name: '浅红色', description: '30% 红色', category: 'color' },
  { latex: 'blue!50', name: '中蓝色', description: '50% 蓝色', category: 'color' },
  { latex: 'green!70', name: '深绿色', description: '70% 绿色', category: 'color' },
  { latex: 'red!50!blue', name: '红蓝混合', description: '红色和蓝色混合', category: 'color' },
  { latex: 'blue!20!green', name: '蓝绿混合', description: '蓝色和绿色混合', category: 'color' }
];

// 线宽值
export const LINE_WIDTH_VALUES: TikZSymbol[] = [
  { latex: 'ultra thin', name: '极细', description: '极细线条', category: 'linewidth' },
  { latex: 'very thin', name: '很细', description: '很细线条', category: 'linewidth' },
  { latex: 'thin', name: '细', description: '细线条', category: 'linewidth' },
  { latex: 'semithick', name: '中等', description: '中等粗细线条', category: 'linewidth' },
  { latex: 'thick', name: '粗', description: '粗线条', category: 'linewidth' },
  { latex: 'very thick', name: '很粗', description: '很粗线条', category: 'linewidth' },
  { latex: 'ultra thick', name: '极粗', description: '极粗线条', category: 'linewidth' },
  { latex: 'line width=0.5pt', name: '0.5pt', description: '0.5 点线宽', category: 'linewidth' },
  { latex: 'line width=1pt', name: '1pt', description: '1 点线宽', category: 'linewidth' },
  { latex: 'line width=2pt', name: '2pt', description: '2 点线宽', category: 'linewidth' },
  { latex: 'line width=3pt', name: '3pt', description: '3 点线宽', category: 'linewidth' }
];

// 线型值
export const LINE_STYLE_VALUES: TikZSymbol[] = [
  { latex: 'solid', name: '实线', description: '实线', category: 'linestyle' },
  { latex: 'dashed', name: '虚线', description: '虚线', category: 'linestyle' },
  { latex: 'dotted', name: '点线', description: '点线', category: 'linestyle' },
  { latex: 'loosely dashed', name: '疏松虚线', description: '疏松虚线', category: 'linestyle' },
  { latex: 'densely dashed', name: '密集虚线', description: '密集虚线', category: 'linestyle' },
  { latex: 'loosely dotted', name: '疏松点线', description: '疏松点线', category: 'linestyle' },
  { latex: 'densely dotted', name: '密集点线', description: '密集点线', category: 'linestyle' },
  { latex: 'dash pattern=on 2pt off 2pt', name: '自定义虚线', description: '自定义虚线模式', category: 'linestyle' },
  { latex: 'dash pattern=on 4pt off 2pt', name: '长虚线', description: '长虚线模式', category: 'linestyle' }
];

// 透明度值
export const OPACITY_VALUES: TikZSymbol[] = [
  { latex: 'opacity=0.1', name: '10%', description: '10% 透明度', category: 'opacity' },
  { latex: 'opacity=0.2', name: '20%', description: '20% 透明度', category: 'opacity' },
  { latex: 'opacity=0.3', name: '30%', description: '30% 透明度', category: 'opacity' },
  { latex: 'opacity=0.4', name: '40%', description: '40% 透明度', category: 'opacity' },
  { latex: 'opacity=0.5', name: '50%', description: '50% 透明度', category: 'opacity' },
  { latex: 'opacity=0.6', name: '60%', description: '60% 透明度', category: 'opacity' },
  { latex: 'opacity=0.7', name: '70%', description: '70% 透明度', category: 'opacity' },
  { latex: 'opacity=0.8', name: '80%', description: '80% 透明度', category: 'opacity' },
  { latex: 'opacity=0.9', name: '90%', description: '90% 透明度', category: 'opacity' }
];

// 变换命令
export const TRANSFORM_COMMANDS: TikZSymbol[] = [
  {
    latex: 'scale',
    name: '缩放',
    description: '缩放图形',
    category: 'transform',
    examples: ['scale=2', 'scale=0.5', 'scale=1.5']
  },
  {
    latex: 'rotate',
    name: '旋转',
    description: '旋转图形',
    category: 'transform',
    examples: ['rotate=45', 'rotate=90', 'rotate=-30']
  },
  {
    latex: 'shift',
    name: '平移',
    description: '平移图形',
    category: 'transform',
    examples: ['shift={(1,0)}', 'shift={(-1,1)}']
  },
  {
    latex: 'translate',
    name: '平移',
    description: '平移图形（别名）',
    category: 'transform',
    examples: ['translate={(1,0)}', 'translate={(-1,1)}']
  },
  {
    latex: 'transform shape',
    name: '变换形状',
    description: '允许形状被变换',
    category: 'transform',
    examples: ['transform shape']
  }
];

// 数学函数
export const MATH_FUNCTIONS: TikZSymbol[] = [
  {
    latex: '\\sin',
    name: '正弦函数',
    description: '计算正弦值',
    category: 'math',
    examples: ['\\draw plot (\\x,{sin(\\x r)});']
  },
  {
    latex: '\\cos',
    name: '余弦函数',
    description: '计算余弦值',
    category: 'math',
    examples: ['\\draw plot (\\x,{cos(\\x r)});']
  },
  {
    latex: '\\tan',
    name: '正切函数',
    description: '计算正切值',
    category: 'math',
    examples: ['\\draw plot (\\x,{tan(\\x r)});']
  },
  {
    latex: '\\sqrt',
    name: '平方根',
    description: '计算平方根',
    category: 'math',
    examples: ['\\draw plot (\\x,{sqrt(\\x)});']
  },
  {
    latex: '\\exp',
    name: '指数函数',
    description: '计算指数值',
    category: 'math',
    examples: ['\\draw plot (\\x,{exp(\\x)});']
  },
  {
    latex: '\\log',
    name: '对数函数',
    description: '计算对数值',
    category: 'math',
    examples: ['\\draw plot (\\x,{log(\\x)});']
  },
  {
    latex: '\\ln',
    name: '自然对数',
    description: '计算自然对数值',
    category: 'math',
    examples: ['\\draw plot (\\x,{ln(\\x)});']
  }
];

// 希腊字母
export const GREEK_LETTERS: TikZSymbol[] = [
  { latex: '\\alpha', name: 'Alpha', description: '希腊字母 Alpha', category: 'greek' },
  { latex: '\\beta', name: 'Beta', description: '希腊字母 Beta', category: 'greek' },
  { latex: '\\gamma', name: 'Gamma', description: '希腊字母 Gamma', category: 'greek' },
  { latex: '\\delta', name: 'Delta', description: '希腊字母 Delta', category: 'greek' },
  { latex: '\\epsilon', name: 'Epsilon', description: '希腊字母 Epsilon', category: 'greek' },
  { latex: '\\theta', name: 'Theta', description: '希腊字母 Theta', category: 'greek' },
  { latex: '\\lambda', name: 'Lambda', description: '希腊字母 Lambda', category: 'greek' },
  { latex: '\\mu', name: 'Mu', description: '希腊字母 Mu', category: 'greek' },
  { latex: '\\pi', name: 'Pi', description: '希腊字母 Pi', category: 'greek' },
  { latex: '\\sigma', name: 'Sigma', description: '希腊字母 Sigma', category: 'greek' },
  { latex: '\\phi', name: 'Phi', description: '希腊字母 Phi', category: 'greek' },
  { latex: '\\omega', name: 'Omega', description: '希腊字母 Omega', category: 'greek' }
];

// 数学符号
export const MATH_SYMBOLS: TikZSymbol[] = [
  { latex: '\\infty', name: '无穷大', description: '无穷大符号', category: 'symbol' },
  { latex: '\\partial', name: '偏微分', description: '偏微分符号', category: 'symbol' },
  { latex: '\\nabla', name: '梯度', description: '梯度符号', category: 'symbol' },
  { latex: '\\Delta', name: 'Delta', description: '大写 Delta', category: 'symbol' },
  { latex: '\\Omega', name: 'Omega', description: '大写 Omega', category: 'symbol' },
  { latex: '\\Gamma', name: 'Gamma', description: '大写 Gamma', category: 'symbol' },
  { latex: '\\Lambda', name: 'Lambda', description: '大写 Lambda', category: 'symbol' },
  { latex: '\\Phi', name: 'Phi', description: '大写 Phi', category: 'symbol' },
  { latex: '\\Psi', name: 'Psi', description: '大写 Psi', category: 'symbol' },
  { latex: '\\Theta', name: 'Theta', description: '大写 Theta', category: 'symbol' },
  { latex: '\\Xi', name: 'Xi', description: '大写 Xi', category: 'symbol' },
  { latex: '\\Pi', name: 'Pi', description: '大写 Pi', category: 'symbol' },
  { latex: '\\Sigma', name: 'Sigma', description: '大写 Sigma', category: 'symbol' }
];

// 箭头样式
export const ARROW_STYLES: TikZSymbol[] = [
  { latex: '->', name: '右箭头', description: '指向右侧的箭头', category: 'arrow' },
  { latex: '<-', name: '左箭头', description: '指向左侧的箭头', category: 'arrow' },
  { latex: '--', name: '直线', description: '无箭头的直线', category: 'arrow' },
  { latex: '->>', name: '双线右箭头', description: '双线指向右侧的箭头', category: 'arrow' },
  { latex: '<<-', name: '双线左箭头', description: '双线指向左侧的箭头', category: 'arrow' },
  { latex: '<->', name: '双向箭头', description: '双向箭头', category: 'arrow' },
  { latex: '<->>', name: '双向双线箭头', description: '双向双线箭头', category: 'arrow' }
];

// 获取所有符号
export const getAllTikZSymbols = (): TikZSymbol[] => {
  return [
    ...DRAW_COMMANDS,
    ...SHAPE_COMMANDS,
    ...NODE_COMMANDS,
    ...STYLE_COMMANDS,
    ...COLOR_VALUES,
    ...LINE_WIDTH_VALUES,
    ...LINE_STYLE_VALUES,
    ...OPACITY_VALUES,
    ...TRANSFORM_COMMANDS,
    ...MATH_FUNCTIONS,
    ...GREEK_LETTERS,
    ...MATH_SYMBOLS,
    ...ARROW_STYLES
  ];
};

// 根据类别获取符号
export const getTikZSymbolsByCategory = (category: string): TikZSymbol[] => {
  return getAllTikZSymbols().filter(symbol => symbol.category === category);
};

// 搜索符号
export const searchTikZSymbols = (query: string): TikZSymbol[] => {
  if (!query) return getAllTikZSymbols();
  
  const lowerQuery = query.toLowerCase();
  return getAllTikZSymbols().filter(symbol => 
    symbol.name.toLowerCase().includes(lowerQuery) ||
    symbol.latex.toLowerCase().includes(lowerQuery) ||
    symbol.description.toLowerCase().includes(lowerQuery) ||
    symbol.category.toLowerCase().includes(lowerQuery)
  );
};

// 获取常用符号（用于快速访问）
export const getCommonTikZSymbols = (): TikZSymbol[] => {
  return [
    ...DRAW_COMMANDS.slice(0, 3),
    ...SHAPE_COMMANDS.slice(0, 3),
    ...NODE_COMMANDS.slice(0, 2),
    ...STYLE_COMMANDS.slice(0, 4),
    ...GREEK_LETTERS.slice(0, 5)
  ];
};

// 获取样式参数建议（用于 [] 中的自动补全）
export const getStyleParameterSuggestions = (context: string): TikZSymbol[] => {
  const suggestions: TikZSymbol[] = [];
  
  // 根据上下文提供不同的建议
  if (context.includes('color') || context.includes('fill') || context.includes('draw')) {
    suggestions.push(...COLOR_VALUES);
  }
  
  if (context.includes('line width') || context.includes('thick') || context.includes('thin')) {
    suggestions.push(...LINE_WIDTH_VALUES);
  }
  
  if (context.includes('dash') || context.includes('dotted')) {
    suggestions.push(...LINE_STYLE_VALUES);
  }
  
  if (context.includes('opacity')) {
    suggestions.push(...OPACITY_VALUES);
  }
  
  // 如果没有特定上下文，提供所有样式选项
  if (suggestions.length === 0) {
    suggestions.push(
      ...COLOR_VALUES.slice(0, 8), // 前8个颜色
      ...LINE_WIDTH_VALUES.slice(0, 5), // 前5个线宽
      ...LINE_STYLE_VALUES.slice(0, 4), // 前4个线型
      ...OPACITY_VALUES.slice(0, 3) // 前3个透明度
    );
  }
  
  return suggestions;
};
