import type { SymbolCategory, SymbolDefinition } from '../types';

// 基础运算符号
export const basicOperators: SymbolDefinition[] = [
  { latex: '+', name: '加号', category: 'basic-operators' },
  { latex: '-', name: '减号', category: 'basic-operators' },
  { latex: '\\times', name: '乘号', category: 'basic-operators' },
  { latex: '\\div', name: '除号', category: 'basic-operators' },
  { latex: '=', name: '等号', category: 'basic-operators' },
  { latex: '\\neq', name: '不等号', category: 'basic-operators' },
  { latex: '<', name: '小于', category: 'basic-operators' },
  { latex: '>', name: '大于', category: 'basic-operators' },
  { latex: '\\leq', name: '小于等于', category: 'basic-operators' },
  { latex: '\\geq', name: '大于等于', category: 'basic-operators' },
  { latex: '\\approx', name: '约等于', category: 'basic-operators' },
  { latex: '\\pm', name: '正负号', category: 'basic-operators' },
  { latex: '\\mp', name: '负正号', category: 'basic-operators' },
  { latex: '\\propto', name: '正比于', category: 'basic-operators' }
];

// 希腊字母
export const greekLetters: SymbolDefinition[] = [
  { latex: '\\alpha', name: 'alpha', category: 'greek-letters' },
  { latex: '\\beta', name: 'beta', category: 'greek-letters' },
  { latex: '\\gamma', name: 'gamma', category: 'greek-letters' },
  { latex: '\\delta', name: 'delta', category: 'greek-letters' },
  { latex: '\\epsilon', name: 'epsilon', category: 'greek-letters' },
  { latex: '\\varepsilon', name: 'varepsilon', category: 'greek-letters' },
  { latex: '\\zeta', name: 'zeta', category: 'greek-letters' },
  { latex: '\\eta', name: 'eta', category: 'greek-letters' },
  { latex: '\\theta', name: 'theta', category: 'greek-letters' },
  { latex: '\\vartheta', name: 'vartheta', category: 'greek-letters' },
  { latex: '\\iota', name: 'iota', category: 'greek-letters' },
  { latex: '\\kappa', name: 'kappa', category: 'greek-letters' },
  { latex: '\\lambda', name: 'lambda', category: 'greek-letters' },
  { latex: '\\mu', name: 'mu', category: 'greek-letters' },
  { latex: '\\nu', name: 'nu', category: 'greek-letters' },
  { latex: '\\xi', name: 'xi', category: 'greek-letters' },
  { latex: '\\pi', name: 'pi', category: 'greek-letters' },
  { latex: '\\rho', name: 'rho', category: 'greek-letters' },
  { latex: '\\sigma', name: 'sigma', category: 'greek-letters' },
  { latex: '\\tau', name: 'tau', category: 'greek-letters' },
  { latex: '\\upsilon', name: 'upsilon', category: 'greek-letters' },
  { latex: '\\phi', name: 'phi', category: 'greek-letters' },
  { latex: '\\varphi', name: 'varphi', category: 'greek-letters' },
  { latex: '\\chi', name: 'chi', category: 'greek-letters' },
  { latex: '\\psi', name: 'psi', category: 'greek-letters' },
  { latex: '\\omega', name: 'omega', category: 'greek-letters' },
  // 大写希腊字母
  { latex: '\\Alpha', name: 'Alpha', category: 'greek-letters' },
  { latex: '\\Beta', name: 'Beta', category: 'greek-letters' },
  { latex: '\\Gamma', name: 'Gamma', category: 'greek-letters' },
  { latex: '\\Delta', name: 'Delta', category: 'greek-letters' },
  { latex: '\\Theta', name: 'Theta', category: 'greek-letters' },
  { latex: '\\Lambda', name: 'Lambda', category: 'greek-letters' },
  { latex: '\\Xi', name: 'Xi', category: 'greek-letters' },
  { latex: '\\Pi', name: 'Pi', category: 'greek-letters' },
  { latex: '\\Sigma', name: 'Sigma', category: 'greek-letters' },
  { latex: '\\Phi', name: 'Phi', category: 'greek-letters' },
  { latex: '\\Psi', name: 'Psi', category: 'greek-letters' },
  { latex: '\\Omega', name: 'Omega', category: 'greek-letters' }
];

// 数学函数
export const mathFunctions: SymbolDefinition[] = [
  { latex: '\\sin', name: '正弦', category: 'math-functions' },
  { latex: '\\cos', name: '余弦', category: 'math-functions' },
  { latex: '\\tan', name: '正切', category: 'math-functions' },
  { latex: '\\cot', name: '余切', category: 'math-functions' },
  { latex: '\\sec', name: '正割', category: 'math-functions' },
  { latex: '\\csc', name: '余割', category: 'math-functions' },
  { latex: '\\arcsin', name: '反正弦', category: 'math-functions' },
  { latex: '\\arccos', name: '反余弦', category: 'math-functions' },
  { latex: '\\arctan', name: '反正切', category: 'math-functions' },
  { latex: '\\log', name: '对数', category: 'math-functions' },
  { latex: '\\ln', name: '自然对数', category: 'math-functions' },
  { latex: '\\lg', name: '常用对数', category: 'math-functions' },
  { latex: '\\exp', name: '指数', category: 'math-functions' },
  { latex: '\\lim', name: '极限', category: 'math-functions' },
  { latex: '\\sum', name: '求和', category: 'math-functions' },
  { latex: '\\int', name: '积分', category: 'math-functions' },
  { latex: '\\iint', name: '二重积分', category: 'math-functions' },
  { latex: '\\iiint', name: '三重积分', category: 'math-functions' },
  { latex: '\\oint', name: '曲线积分', category: 'math-functions' },
  { latex: '\\prod', name: '连乘', category: 'math-functions' },
  { latex: '\\coprod', name: '余积', category: 'math-functions' },
  { latex: '\\max', name: '最大值', category: 'math-functions' },
  { latex: '\\min', name: '最小值', category: 'math-functions' },
  { latex: '\\inf', name: '下确界', category: 'math-functions' },
  { latex: '\\sup', name: '上确界', category: 'math-functions' }
];

// 分数和根式
export const fractionsAndRoots: SymbolDefinition[] = [
  { latex: '\\frac{a}{b}', name: '分数', category: 'fractions-roots' },
  { latex: '\\dfrac{a}{b}', name: '显示分数', category: 'fractions-roots' },
  { latex: '\\tfrac{a}{b}', name: '小分数', category: 'fractions-roots' },
  { latex: '\\sqrt{a}', name: '平方根', category: 'fractions-roots' },
  { latex: '\\sqrt[n]{a}', name: 'n次根', category: 'fractions-roots' },
];

// 上下标和括号
export const subscriptsAndBrackets: SymbolDefinition[] = [
  { latex: 'x^2', name: '上标', category: 'subscripts-brackets' },
  { latex: 'x_2', name: '下标', category: 'subscripts-brackets' },
  { latex: 'x^{a+b}', name: '复合上标', category: 'subscripts-brackets' },
  { latex: 'x_{a+b}', name: '复合下标', category: 'subscripts-brackets' },
  { latex: '\\left(\\right)', name: '自适应括号', category: 'subscripts-brackets' },
  { latex: '\\left[\\right]', name: '方括号', category: 'subscripts-brackets' },
  { latex: '\\left\\{\\right\\}', name: '大括号', category: 'subscripts-brackets' },
  { latex: '\\left|\\right|', name: '绝对值', category: 'subscripts-brackets' }
];

// 集合和逻辑
export const setsAndLogic: SymbolDefinition[] = [
  { latex: '\\in', name: '属于', category: 'sets-logic' },
  { latex: '\\notin', name: '不属于', category: 'sets-logic' },
  { latex: '\\subset', name: '真子集', category: 'sets-logic' },
  { latex: '\\subseteq', name: '子集', category: 'sets-logic' },
  { latex: '\\supset', name: '真超集', category: 'sets-logic' },
  { latex: '\\supseteq', name: '超集', category: 'sets-logic' },
  { latex: '\\cup', name: '并集', category: 'sets-logic' },
  { latex: '\\cap', name: '交集', category: 'sets-logic' },
  { latex: '\\emptyset', name: '空集', category: 'sets-logic' },
  { latex: '\\mathbb{R}', name: '实数集', category: 'sets-logic' },
  { latex: '\\mathbb{Z}', name: '整数集', category: 'sets-logic' },
  { latex: '\\mathbb{N}', name: '自然数集', category: 'sets-logic' },
  { latex: '\\mathbb{Q}', name: '有理数集', category: 'sets-logic' },
  { latex: '\\mathbb{C}', name: '复数集', category: 'sets-logic' }
];

// 箭头和关系
export const arrowsAndRelations: SymbolDefinition[] = [
  { latex: '\\rightarrow', name: '右箭头', category: 'arrows-relations' },
  { latex: '\\leftarrow', name: '左箭头', category: 'arrows-relations' },
  { latex: '\\leftrightarrow', name: '双向箭头', category: 'arrows-relations' },
  { latex: '\\Rightarrow', name: '双线右箭头', category: 'arrows-relations' },
  { latex: '\\Leftarrow', name: '双线左箭头', category: 'arrows-relations' },
  { latex: '\\Leftrightarrow', name: '双线双向箭头', category: 'arrows-relations' },
  { latex: '\\to', name: '映射箭头', category: 'arrows-relations' },
  { latex: '\\mapsto', name: '映射到', category: 'arrows-relations' }
];

// 特殊符号
export const specialSymbols: SymbolDefinition[] = [
  { latex: '\\infty', name: '无穷', category: 'special-symbols' },
  { latex: '\\partial', name: '偏微分', category: 'special-symbols' },
  { latex: '\\nabla', name: '梯度', category: 'special-symbols' },
  { latex: '\\triangle', name: '三角形', category: 'special-symbols' },
  { latex: '\\angle', name: '角', category: 'special-symbols' },
  { latex: '\\degree', name: '度', category: 'special-symbols' },
  { latex: '\\prime', name: '撇号', category: 'special-symbols' },
  { latex: '\\prime\\prime', name: '双撇号', category: 'special-symbols' },
  { latex: '\\ldots', name: '省略号', category: 'special-symbols' },
  { latex: '\\cdots', name: '居中省略号', category: 'special-symbols' },
  { latex: '\\vdots', name: '垂直省略号', category: 'special-symbols' },
  { latex: '\\ddots', name: '对角省略号', category: 'special-symbols' },
  { latex: '\\square', name: '正方形', category: 'special-symbols' },
  { latex: '\\odot', name: '圆形', category: 'special-symbols' },
  { latex: '\\diamond', name: '菱形', category: 'special-symbols' },
  { latex: '\\star', name: '星形', category: 'special-symbols' },
  { latex: '\\bullet', name: '圆点', category: 'special-symbols' },
  { latex: '\\circ', name: '圆圈', category: 'special-symbols' },
  { latex: '\\bigcirc', name: '大圆圈', category: 'special-symbols' },
  { latex: '\\bigtriangleup', name: '大三角形', category: 'special-symbols' },
  { latex: '\\bigtriangledown', name: '倒大三角形', category: 'special-symbols' },
  { latex: '\\diamond', name: '菱形', category: 'special-symbols' },
  { latex: '\\lozenge', name: '菱形', category: 'special-symbols' },
  { latex: '\\displaystyle', name: '全局', category: 'special-symbols' },
];

// 字体样式
export const fontStyles: SymbolDefinition[] = [
  { latex: '\\mathbf{a}', name: '粗体', category: 'font-styles' },
  { latex: '\\mathit{a}', name: '斜体', category: 'font-styles' },
  { latex: '\\mathrm{a}', name: '罗马字体', category: 'font-styles' },
  { latex: '\\mathcal{A}', name: '花体', category: 'font-styles' },
  { latex: '\\mathscr{A}', name: '手写体', category: 'font-styles' },
  { latex: '\\mathfrak{a}', name: '哥特体', category: 'font-styles' },
  { latex: '\\mathbb{A}', name: '黑板粗体', category: 'font-styles' },
  { latex: '\\text{a}', name: '文本模式', category: 'font-styles' },
  { latex: '\\texttt{a}', name: '等宽字体', category: 'font-styles' },
  { latex: '\\textsf{a}', name: '无衬线字体', category: 'font-styles' }
];

// 数学装饰
export const mathDecorations: SymbolDefinition[] = [
  { latex: '\\textcircled{a}', name: '圈字', category: 'math-decorations' },
  { latex: '\\hat{a}', name: '帽子', category: 'math-decorations' },
  { latex: '\\bar{a}', name: '横线', category: 'math-decorations' },
  { latex: '\\vec{a}', name: '向量', category: 'math-decorations' },
  { latex: '\\dot{a}', name: '点', category: 'math-decorations' },
  { latex: '\\ddot{a}', name: '双点', category: 'math-decorations' },
  { latex: '\\tilde{a}', name: '波浪线', category: 'math-decorations' },
  { latex: '\\widetilde{a}', name: '宽波浪线', category: 'math-decorations' },
  { latex: '\\widehat{a}', name: '宽帽子', category: 'math-decorations' },
  { latex: '\\overline{a}', name: '上横线', category: 'math-decorations' },
  { latex: '\\underline{a}', name: '下横线', category: 'math-decorations' },
  { latex: '\\overbrace{a}', name: '上大括号', category: 'math-decorations' },
  { latex: '\\underbrace{a}', name: '下大括号', category: 'math-decorations' },
  { latex: '\\overset{a}{b}', name: '上标', category: 'math-decorations' },
  { latex: '\\underset{a}{b}', name: '下标', category: 'math-decorations' }
];

// 矩阵环境
export const matrixEnvironments: SymbolDefinition[] = [
  { latex: '\\begin{pmatrix}\\end{pmatrix}', name: '圆括号矩阵', category: 'matrix-environments' },
  { latex: '\\begin{bmatrix}\\end{bmatrix}', name: '方括号矩阵', category: 'matrix-environments' },
  { latex: '\\begin{vmatrix}\\end{vmatrix}', name: '行列式', category: 'matrix-environments' },
  { latex: '\\begin{Vmatrix}\\end{Vmatrix}', name: '范数', category: 'matrix-environments' }
];

// 对齐环境
export const alignEnvironments: SymbolDefinition[] = [
  { latex: '\\begin{aligned}\\end{aligned}', name: '多列对齐', category: 'align-environments' },
  { latex: '\\begin{cases}\\end{cases}', name: '分段函数', category: 'align-environments' },
];

// 其他常用命令
export const otherCommands: SymbolDefinition[] = [
  { latex: '\\xrightarrow{a}', name: '带标签箭头', category: 'other-commands' },
  { latex: '\\xleftarrow{a}', name: '带标签左箭头', category: 'other-commands' },
  { latex: '\\xleftrightarrow{a}', name: '带标签双向箭头', category: 'other-commands' }
];

// 符号分类
export const mathSymbolCategories: SymbolCategory[] = [
  {
    name: '基础运算',
    icon: 'plus',
    symbols: basicOperators
  },
  {
    name: '希腊字母',
    icon: 'sigma',
    symbols: greekLetters
  },
  {
    name: '数学函数',
    icon: 'function',
    symbols: mathFunctions
  },
  {
    name: '分数根式',
    icon: 'divide',
    symbols: fractionsAndRoots
  },
  {
    name: '上下标',
    icon: 'superscript',
    symbols: subscriptsAndBrackets
  },
  {
    name: '集合逻辑',
    icon: 'set',
    symbols: setsAndLogic
  },
  {
    name: '箭头关系',
    icon: 'arrow-right',
    symbols: arrowsAndRelations
  },
  {
    name: '特殊符号',
    icon: 'infinity',
    symbols: specialSymbols
  },
  {
    name: '字体样式',
    icon: 'type',
    symbols: fontStyles
  },
  {
    name: '数学装饰',
    icon: 'zap',
    symbols: mathDecorations
  },
  {
    name: '矩阵环境',
    icon: 'grid',
    symbols: matrixEnvironments
  },
  {
    name: '对齐环境',
    icon: 'align-left',
    symbols: alignEnvironments
  },
  {
    name: '其他命令',
    icon: 'command',
    symbols: otherCommands
  }
];

// 获取所有符号
export const getAllMathSymbols = (): SymbolDefinition[] => {
  return [
    ...basicOperators,
    ...greekLetters,
    ...mathFunctions,
    ...fractionsAndRoots,
    ...subscriptsAndBrackets,
    ...setsAndLogic,
    ...arrowsAndRelations,
    ...specialSymbols,
    ...fontStyles,
    ...mathDecorations,
    ...matrixEnvironments,
    ...alignEnvironments,
    ...otherCommands
  ];
};

// 根据类别获取符号
export const getSymbolsByCategory = (category: string): SymbolDefinition[] => {
  return getAllMathSymbols().filter(symbol => symbol.category === category);
};

// 搜索符号
export const searchMathSymbols = (query: string): SymbolDefinition[] => {
  const lowerQuery = query.toLowerCase();
  return getAllMathSymbols().filter(symbol => 
    symbol.name.toLowerCase().includes(lowerQuery) ||
    symbol.latex.toLowerCase().includes(lowerQuery)
  );
}; 