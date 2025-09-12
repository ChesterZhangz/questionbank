import type { SymbolCategory, SymbolDefinition } from '../types';

// 翻译函数类型
type TranslationFunction = (key: string) => string;

// 默认翻译函数（用于向后兼容）
const defaultT: TranslationFunction = (key: string) => key;

// 基础运算符号
export const getBasicOperators = (t: TranslationFunction = defaultT): SymbolDefinition[] => [
  { latex: '+', name: t('lib.mathSymbols.basicOperators.plus'), category: 'basic-operators' },
  { latex: '-', name: t('lib.mathSymbols.basicOperators.minus'), category: 'basic-operators' },
  { latex: '\\times', name: t('lib.mathSymbols.basicOperators.multiply'), category: 'basic-operators' },
  { latex: '\\div', name: t('lib.mathSymbols.basicOperators.divide'), category: 'basic-operators' },
  { latex: '=', name: t('lib.mathSymbols.basicOperators.equals'), category: 'basic-operators' },
  { latex: '\\neq', name: t('lib.mathSymbols.basicOperators.notEquals'), category: 'basic-operators' },
  { latex: '<', name: t('lib.mathSymbols.basicOperators.lessThan'), category: 'basic-operators' },
  { latex: '>', name: t('lib.mathSymbols.basicOperators.greaterThan'), category: 'basic-operators' },
  { latex: '\\leq', name: t('lib.mathSymbols.basicOperators.lessThanOrEqual'), category: 'basic-operators' },
  { latex: '\\geq', name: t('lib.mathSymbols.basicOperators.greaterThanOrEqual'), category: 'basic-operators' },
  { latex: '\\approx', name: t('lib.mathSymbols.basicOperators.approximately'), category: 'basic-operators' },
  { latex: '\\pm', name: t('lib.mathSymbols.basicOperators.plusMinus'), category: 'basic-operators' },
  { latex: '\\mp', name: t('lib.mathSymbols.basicOperators.minusPlus'), category: 'basic-operators' },
  { latex: '\\propto', name: t('lib.mathSymbols.basicOperators.proportional'), category: 'basic-operators' }
];

// 希腊字母
export const getGreekLetters = (t: TranslationFunction = defaultT): SymbolDefinition[] => [
  { latex: '\\alpha', name: t('lib.mathSymbols.greekLetters.alpha'), category: 'greek-letters' },
  { latex: '\\beta', name: t('lib.mathSymbols.greekLetters.beta'), category: 'greek-letters' },
  { latex: '\\gamma', name: t('lib.mathSymbols.greekLetters.gamma'), category: 'greek-letters' },
  { latex: '\\delta', name: t('lib.mathSymbols.greekLetters.delta'), category: 'greek-letters' },
  { latex: '\\epsilon', name: t('lib.mathSymbols.greekLetters.epsilon'), category: 'greek-letters' },
  { latex: '\\varepsilon', name: t('lib.mathSymbols.greekLetters.varepsilon'), category: 'greek-letters' },
  { latex: '\\zeta', name: t('lib.mathSymbols.greekLetters.zeta'), category: 'greek-letters' },
  { latex: '\\eta', name: t('lib.mathSymbols.greekLetters.eta'), category: 'greek-letters' },
  { latex: '\\theta', name: t('lib.mathSymbols.greekLetters.theta'), category: 'greek-letters' },
  { latex: '\\vartheta', name: t('lib.mathSymbols.greekLetters.vartheta'), category: 'greek-letters' },
  { latex: '\\iota', name: t('lib.mathSymbols.greekLetters.iota'), category: 'greek-letters' },
  { latex: '\\kappa', name: t('lib.mathSymbols.greekLetters.kappa'), category: 'greek-letters' },
  { latex: '\\lambda', name: t('lib.mathSymbols.greekLetters.lambda'), category: 'greek-letters' },
  { latex: '\\mu', name: t('lib.mathSymbols.greekLetters.mu'), category: 'greek-letters' },
  { latex: '\\nu', name: t('lib.mathSymbols.greekLetters.nu'), category: 'greek-letters' },
  { latex: '\\xi', name: t('lib.mathSymbols.greekLetters.xi'), category: 'greek-letters' },
  { latex: '\\pi', name: t('lib.mathSymbols.greekLetters.pi'), category: 'greek-letters' },
  { latex: '\\rho', name: t('lib.mathSymbols.greekLetters.rho'), category: 'greek-letters' },
  { latex: '\\sigma', name: t('lib.mathSymbols.greekLetters.sigma'), category: 'greek-letters' },
  { latex: '\\tau', name: t('lib.mathSymbols.greekLetters.tau'), category: 'greek-letters' },
  { latex: '\\upsilon', name: t('lib.mathSymbols.greekLetters.upsilon'), category: 'greek-letters' },
  { latex: '\\phi', name: t('lib.mathSymbols.greekLetters.phi'), category: 'greek-letters' },
  { latex: '\\varphi', name: t('lib.mathSymbols.greekLetters.varphi'), category: 'greek-letters' },
  { latex: '\\chi', name: t('lib.mathSymbols.greekLetters.chi'), category: 'greek-letters' },
  { latex: '\\psi', name: t('lib.mathSymbols.greekLetters.psi'), category: 'greek-letters' },
  { latex: '\\omega', name: t('lib.mathSymbols.greekLetters.omega'), category: 'greek-letters' },
  // 大写希腊字母
  { latex: '\\Alpha', name: t('lib.mathSymbols.greekLetters.Alpha'), category: 'greek-letters' },
  { latex: '\\Beta', name: t('lib.mathSymbols.greekLetters.Beta'), category: 'greek-letters' },
  { latex: '\\Gamma', name: t('lib.mathSymbols.greekLetters.Gamma'), category: 'greek-letters' },
  { latex: '\\Delta', name: t('lib.mathSymbols.greekLetters.Delta'), category: 'greek-letters' },
  { latex: '\\Theta', name: t('lib.mathSymbols.greekLetters.Theta'), category: 'greek-letters' },
  { latex: '\\Lambda', name: t('lib.mathSymbols.greekLetters.Lambda'), category: 'greek-letters' },
  { latex: '\\Xi', name: t('lib.mathSymbols.greekLetters.Xi'), category: 'greek-letters' },
  { latex: '\\Pi', name: t('lib.mathSymbols.greekLetters.Pi'), category: 'greek-letters' },
  { latex: '\\Sigma', name: t('lib.mathSymbols.greekLetters.Sigma'), category: 'greek-letters' },
  { latex: '\\Phi', name: t('lib.mathSymbols.greekLetters.Phi'), category: 'greek-letters' },
  { latex: '\\Psi', name: t('lib.mathSymbols.greekLetters.Psi'), category: 'greek-letters' },
  { latex: '\\Omega', name: t('lib.mathSymbols.greekLetters.Omega'), category: 'greek-letters' }
];

// 数学函数
export const getMathFunctions = (t: TranslationFunction = defaultT): SymbolDefinition[] => [
  { latex: '\\sin', name: t('lib.mathSymbols.mathFunctions.sin'), category: 'math-functions' },
  { latex: '\\cos', name: t('lib.mathSymbols.mathFunctions.cos'), category: 'math-functions' },
  { latex: '\\tan', name: t('lib.mathSymbols.mathFunctions.tan'), category: 'math-functions' },
  { latex: '\\cot', name: t('lib.mathSymbols.mathFunctions.cot'), category: 'math-functions' },
  { latex: '\\sec', name: t('lib.mathSymbols.mathFunctions.sec'), category: 'math-functions' },
  { latex: '\\csc', name: t('lib.mathSymbols.mathFunctions.csc'), category: 'math-functions' },
  { latex: '\\arcsin', name: t('lib.mathSymbols.mathFunctions.arcsin'), category: 'math-functions' },
  { latex: '\\arccos', name: t('lib.mathSymbols.mathFunctions.arccos'), category: 'math-functions' },
  { latex: '\\arctan', name: t('lib.mathSymbols.mathFunctions.arctan'), category: 'math-functions' },
  { latex: '\\log', name: t('lib.mathSymbols.mathFunctions.log'), category: 'math-functions' },
  { latex: '\\ln', name: t('lib.mathSymbols.mathFunctions.ln'), category: 'math-functions' },
  { latex: '\\lg', name: t('lib.mathSymbols.mathFunctions.lg'), category: 'math-functions' },
  { latex: '\\exp', name: t('lib.mathSymbols.mathFunctions.exp'), category: 'math-functions' },
  { latex: '\\lim', name: t('lib.mathSymbols.mathFunctions.lim'), category: 'math-functions' },
  { latex: '\\sum', name: t('lib.mathSymbols.mathFunctions.sum'), category: 'math-functions' },
  { latex: '\\int', name: t('lib.mathSymbols.mathFunctions.int'), category: 'math-functions' },
  { latex: '\\iint', name: t('lib.mathSymbols.mathFunctions.iint'), category: 'math-functions' },
  { latex: '\\iiint', name: t('lib.mathSymbols.mathFunctions.iiint'), category: 'math-functions' },
  { latex: '\\oint', name: t('lib.mathSymbols.mathFunctions.oint'), category: 'math-functions' },
  { latex: '\\prod', name: t('lib.mathSymbols.mathFunctions.prod'), category: 'math-functions' },
  { latex: '\\coprod', name: t('lib.mathSymbols.mathFunctions.coprod'), category: 'math-functions' },
  { latex: '\\max', name: t('lib.mathSymbols.mathFunctions.max'), category: 'math-functions' },
  { latex: '\\min', name: t('lib.mathSymbols.mathFunctions.min'), category: 'math-functions' },
  { latex: '\\inf', name: t('lib.mathSymbols.mathFunctions.inf'), category: 'math-functions' },
  { latex: '\\sup', name: t('lib.mathSymbols.mathFunctions.sup'), category: 'math-functions' }
];

// 分数和根式
export const getFractionsAndRoots = (t: TranslationFunction = defaultT): SymbolDefinition[] => [
  { latex: '\\frac{a}{b}', name: t('lib.mathSymbols.fractionsAndRoots.fraction'), category: 'fractions-roots' },
  { latex: '\\dfrac{a}{b}', name: t('lib.mathSymbols.fractionsAndRoots.displayFraction'), category: 'fractions-roots' },
  { latex: '\\tfrac{a}{b}', name: t('lib.mathSymbols.fractionsAndRoots.textFraction'), category: 'fractions-roots' },
  { latex: '\\sqrt{a}', name: t('lib.mathSymbols.fractionsAndRoots.squareRoot'), category: 'fractions-roots' },
  { latex: '\\sqrt[n]{a}', name: t('lib.mathSymbols.fractionsAndRoots.nthRoot'), category: 'fractions-roots' }
];

// 上下标和括号
export const getSubscriptsAndBrackets = (t: TranslationFunction = defaultT): SymbolDefinition[] => [
  { latex: 'x^2', name: t('lib.mathSymbols.subscriptsAndBrackets.superscript'), category: 'subscripts-brackets' },
  { latex: 'x_2', name: t('lib.mathSymbols.subscriptsAndBrackets.subscript'), category: 'subscripts-brackets' },
  { latex: 'x^{a+b}', name: t('lib.mathSymbols.subscriptsAndBrackets.complexSuperscript'), category: 'subscripts-brackets' },
  { latex: 'x_{a+b}', name: t('lib.mathSymbols.subscriptsAndBrackets.complexSubscript'), category: 'subscripts-brackets' },
  { latex: '\\left(\\right)', name: t('lib.mathSymbols.subscriptsAndBrackets.adaptiveParentheses'), category: 'subscripts-brackets' },
  { latex: '\\left[\\right]', name: t('lib.mathSymbols.subscriptsAndBrackets.squareBrackets'), category: 'subscripts-brackets' },
  { latex: '\\left\\{\\right\\}', name: t('lib.mathSymbols.subscriptsAndBrackets.curlyBrackets'), category: 'subscripts-brackets' },
  { latex: '\\left|\\right|', name: t('lib.mathSymbols.subscriptsAndBrackets.absoluteValue'), category: 'subscripts-brackets' }
];

// 集合和逻辑
export const getSetsAndLogic = (t: TranslationFunction = defaultT): SymbolDefinition[] => [
  { latex: '\\in', name: t('lib.mathSymbols.setsAndLogic.belongsTo'), category: 'sets-logic' },
  { latex: '\\notin', name: t('lib.mathSymbols.setsAndLogic.notBelongsTo'), category: 'sets-logic' },
  { latex: '\\subset', name: t('lib.mathSymbols.setsAndLogic.properSubset'), category: 'sets-logic' },
  { latex: '\\subseteq', name: t('lib.mathSymbols.setsAndLogic.subset'), category: 'sets-logic' },
  { latex: '\\supset', name: t('lib.mathSymbols.setsAndLogic.properSuperset'), category: 'sets-logic' },
  { latex: '\\supseteq', name: t('lib.mathSymbols.setsAndLogic.superset'), category: 'sets-logic' },
  { latex: '\\cup', name: t('lib.mathSymbols.setsAndLogic.union'), category: 'sets-logic' },
  { latex: '\\cap', name: t('lib.mathSymbols.setsAndLogic.intersection'), category: 'sets-logic' },
  { latex: '\\emptyset', name: t('lib.mathSymbols.setsAndLogic.emptySet'), category: 'sets-logic' },
  { latex: '\\mathbb{R}', name: t('lib.mathSymbols.setsAndLogic.realNumbers'), category: 'sets-logic' },
  { latex: '\\mathbb{Z}', name: t('lib.mathSymbols.setsAndLogic.integers'), category: 'sets-logic' },
  { latex: '\\mathbb{N}', name: t('lib.mathSymbols.setsAndLogic.naturalNumbers'), category: 'sets-logic' },
  { latex: '\\mathbb{Q}', name: t('lib.mathSymbols.setsAndLogic.rationalNumbers'), category: 'sets-logic' },
  { latex: '\\mathbb{C}', name: t('lib.mathSymbols.setsAndLogic.complexNumbers'), category: 'sets-logic' }
];

// 箭头和关系
export const getArrowsAndRelations = (t: TranslationFunction = defaultT): SymbolDefinition[] => [
  { latex: '\\rightarrow', name: t('lib.mathSymbols.arrowsAndRelations.rightArrow'), category: 'arrows-relations' },
  { latex: '\\leftarrow', name: t('lib.mathSymbols.arrowsAndRelations.leftArrow'), category: 'arrows-relations' },
  { latex: '\\leftrightarrow', name: t('lib.mathSymbols.arrowsAndRelations.bidirectionalArrow'), category: 'arrows-relations' },
  { latex: '\\Rightarrow', name: t('lib.mathSymbols.arrowsAndRelations.doubleRightArrow'), category: 'arrows-relations' },
  { latex: '\\Leftarrow', name: t('lib.mathSymbols.arrowsAndRelations.doubleLeftArrow'), category: 'arrows-relations' },
  { latex: '\\Leftrightarrow', name: t('lib.mathSymbols.arrowsAndRelations.doubleBidirectionalArrow'), category: 'arrows-relations' },
  { latex: '\\to', name: t('lib.mathSymbols.arrowsAndRelations.mappingArrow'), category: 'arrows-relations' },
  { latex: '\\mapsto', name: t('lib.mathSymbols.arrowsAndRelations.mapsTo'), category: 'arrows-relations' }
];

// 特殊符号
export const getSpecialSymbols = (t: TranslationFunction = defaultT): SymbolDefinition[] => [
  { latex: '\\infty', name: t('lib.mathSymbols.specialSymbols.infinity'), category: 'special-symbols' },
  { latex: '\\partial', name: t('lib.mathSymbols.specialSymbols.partial'), category: 'special-symbols' },
  { latex: '\\nabla', name: t('lib.mathSymbols.specialSymbols.nabla'), category: 'special-symbols' },
  { latex: '\\triangle', name: t('lib.mathSymbols.specialSymbols.triangle'), category: 'special-symbols' },
  { latex: '\\angle', name: t('lib.mathSymbols.specialSymbols.angle'), category: 'special-symbols' },
  { latex: '\\degree', name: t('lib.mathSymbols.specialSymbols.degree'), category: 'special-symbols' },
  { latex: '\\prime', name: t('lib.mathSymbols.specialSymbols.prime'), category: 'special-symbols' },
  { latex: '\\prime\\prime', name: t('lib.mathSymbols.specialSymbols.doublePrime'), category: 'special-symbols' },
  { latex: '\\ldots', name: t('lib.mathSymbols.specialSymbols.ellipsis'), category: 'special-symbols' },
  { latex: '\\cdots', name: t('lib.mathSymbols.specialSymbols.centeredEllipsis'), category: 'special-symbols' },
  { latex: '\\vdots', name: t('lib.mathSymbols.specialSymbols.verticalEllipsis'), category: 'special-symbols' },
  { latex: '\\ddots', name: t('lib.mathSymbols.specialSymbols.diagonalEllipsis'), category: 'special-symbols' },
  { latex: '\\square', name: t('lib.mathSymbols.specialSymbols.square'), category: 'special-symbols' },
  { latex: '\\odot', name: t('lib.mathSymbols.specialSymbols.circle'), category: 'special-symbols' },
  { latex: '\\diamond', name: t('lib.mathSymbols.specialSymbols.diamond'), category: 'special-symbols' },
  { latex: '\\star', name: t('lib.mathSymbols.specialSymbols.star'), category: 'special-symbols' },
  { latex: '\\bullet', name: t('lib.mathSymbols.specialSymbols.bullet'), category: 'special-symbols' },
  { latex: '\\circ', name: t('lib.mathSymbols.specialSymbols.circ'), category: 'special-symbols' },
  { latex: '\\bigcirc', name: t('lib.mathSymbols.specialSymbols.bigCircle'), category: 'special-symbols' },
  { latex: '\\bigtriangleup', name: t('lib.mathSymbols.specialSymbols.bigTriangle'), category: 'special-symbols' },
  { latex: '\\bigtriangledown', name: t('lib.mathSymbols.specialSymbols.bigTriangleDown'), category: 'special-symbols' },
  { latex: '\\lozenge', name: t('lib.mathSymbols.specialSymbols.lozenge'), category: 'special-symbols' },
  { latex: '\\displaystyle', name: t('lib.mathSymbols.specialSymbols.displayStyle'), category: 'special-symbols' }
];

// 字体样式
export const getFontStyles = (t: TranslationFunction = defaultT): SymbolDefinition[] => [
  { latex: '\\mathbf{a}', name: t('lib.mathSymbols.fontStyles.bold'), category: 'font-styles' },
  { latex: '\\mathit{a}', name: t('lib.mathSymbols.fontStyles.italic'), category: 'font-styles' },
  { latex: '\\mathrm{a}', name: t('lib.mathSymbols.fontStyles.roman'), category: 'font-styles' },
  { latex: '\\mathcal{A}', name: t('lib.mathSymbols.fontStyles.calligraphic'), category: 'font-styles' },
  { latex: '\\mathscr{A}', name: t('lib.mathSymbols.fontStyles.script'), category: 'font-styles' },
  { latex: '\\mathfrak{a}', name: t('lib.mathSymbols.fontStyles.fraktur'), category: 'font-styles' },
  { latex: '\\mathbb{A}', name: t('lib.mathSymbols.fontStyles.blackboard'), category: 'font-styles' },
  { latex: '\\text{a}', name: t('lib.mathSymbols.fontStyles.text'), category: 'font-styles' },
  { latex: '\\texttt{a}', name: t('lib.mathSymbols.fontStyles.monospace'), category: 'font-styles' },
  { latex: '\\textsf{a}', name: t('lib.mathSymbols.fontStyles.sansSerif'), category: 'font-styles' }
];

// 数学装饰
export const getMathDecorations = (t: TranslationFunction = defaultT): SymbolDefinition[] => [
  { latex: '\\textcircled{a}', name: t('lib.mathSymbols.mathDecorations.circled'), category: 'math-decorations' },
  { latex: '\\hat{a}', name: t('lib.mathSymbols.mathDecorations.hat'), category: 'math-decorations' },
  { latex: '\\bar{a}', name: t('lib.mathSymbols.mathDecorations.bar'), category: 'math-decorations' },
  { latex: '\\vec{a}', name: t('lib.mathSymbols.mathDecorations.vec'), category: 'math-decorations' },
  { latex: '\\dot{a}', name: t('lib.mathSymbols.mathDecorations.dot'), category: 'math-decorations' },
  { latex: '\\ddot{a}', name: t('lib.mathSymbols.mathDecorations.doubleDot'), category: 'math-decorations' },
  { latex: '\\tilde{a}', name: t('lib.mathSymbols.mathDecorations.tilde'), category: 'math-decorations' },
  { latex: '\\widetilde{a}', name: t('lib.mathSymbols.mathDecorations.wideTilde'), category: 'math-decorations' },
  { latex: '\\widehat{a}', name: t('lib.mathSymbols.mathDecorations.wideHat'), category: 'math-decorations' },
  { latex: '\\overline{a}', name: t('lib.mathSymbols.mathDecorations.overline'), category: 'math-decorations' },
  { latex: '\\underline{a}', name: t('lib.mathSymbols.mathDecorations.underline'), category: 'math-decorations' },
  { latex: '\\overbrace{a}', name: t('lib.mathSymbols.mathDecorations.overbrace'), category: 'math-decorations' },
  { latex: '\\underbrace{a}', name: t('lib.mathSymbols.mathDecorations.underbrace'), category: 'math-decorations' },
  { latex: '\\overset{a}{b}', name: t('lib.mathSymbols.mathDecorations.overset'), category: 'math-decorations' },
  { latex: '\\underset{a}{b}', name: t('lib.mathSymbols.mathDecorations.underset'), category: 'math-decorations' }
];

// 矩阵环境
export const getMatrixEnvironments = (t: TranslationFunction = defaultT): SymbolDefinition[] => [
  { latex: '\\begin{pmatrix}\\end{pmatrix}', name: t('lib.mathSymbols.matrixEnvironments.parentheses'), category: 'matrix-environments' },
  { latex: '\\begin{bmatrix}\\end{bmatrix}', name: t('lib.mathSymbols.matrixEnvironments.squareBrackets'), category: 'matrix-environments' },
  { latex: '\\begin{vmatrix}\\end{vmatrix}', name: t('lib.mathSymbols.matrixEnvironments.verticalBars'), category: 'matrix-environments' },
  { latex: '\\begin{Vmatrix}\\end{Vmatrix}', name: t('lib.mathSymbols.matrixEnvironments.doubleVerticalBars'), category: 'matrix-environments' }
];

// 对齐环境
export const getAlignEnvironments = (t: TranslationFunction = defaultT): SymbolDefinition[] => [
  { latex: '\\begin{aligned}\\end{aligned}', name: t('lib.mathSymbols.alignEnvironments.aligned'), category: 'align-environments' },
  { latex: '\\begin{cases}\\end{cases}', name: t('lib.mathSymbols.alignEnvironments.cases'), category: 'align-environments' }
];

// 其他常用命令
export const getOtherCommands = (t: TranslationFunction = defaultT): SymbolDefinition[] => [
  { latex: '\\xrightarrow{a}', name: t('lib.mathSymbols.otherCommands.xrightarrow'), category: 'other-commands' },
  { latex: '\\xleftarrow{a}', name: t('lib.mathSymbols.otherCommands.xleftarrow'), category: 'other-commands' },
  { latex: '\\xleftrightarrow{a}', name: t('lib.mathSymbols.otherCommands.xleftrightarrow'), category: 'other-commands' }
];

// 符号分类
export const getMathSymbolCategories = (t: TranslationFunction = defaultT): SymbolCategory[] => [
  {
    name: t('lib.mathSymbols.categories.basicOperators'),
    icon: 'plus',
    symbols: getBasicOperators(t)
  },
  {
    name: t('lib.mathSymbols.categories.greekLetters'),
    icon: 'sigma',
    symbols: getGreekLetters(t)
  },
  {
    name: t('lib.mathSymbols.categories.mathFunctions'),
    icon: 'function',
    symbols: getMathFunctions(t)
  },
  {
    name: t('lib.mathSymbols.categories.fractionsRoots'),
    icon: 'divide',
    symbols: getFractionsAndRoots(t)
  },
  {
    name: t('lib.mathSymbols.categories.subscriptsBrackets'),
    icon: 'superscript',
    symbols: getSubscriptsAndBrackets(t)
  },
  {
    name: t('lib.mathSymbols.categories.setsLogic'),
    icon: 'set',
    symbols: getSetsAndLogic(t)
  },
  {
    name: t('lib.mathSymbols.categories.arrowsRelations'),
    icon: 'arrow-right',
    symbols: getArrowsAndRelations(t)
  },
  {
    name: t('lib.mathSymbols.categories.specialSymbols'),
    icon: 'infinity',
    symbols: getSpecialSymbols(t)
  },
  {
    name: t('lib.mathSymbols.categories.fontStyles'),
    icon: 'type',
    symbols: getFontStyles(t)
  },
  {
    name: t('lib.mathSymbols.categories.mathDecorations'),
    icon: 'zap',
    symbols: getMathDecorations(t)
  },
  {
    name: t('lib.mathSymbols.categories.matrixEnvironments'),
    icon: 'grid',
    symbols: getMatrixEnvironments(t)
  },
  {
    name: t('lib.mathSymbols.categories.alignEnvironments'),
    icon: 'align-left',
    symbols: getAlignEnvironments(t)
  },
  {
    name: t('lib.mathSymbols.categories.otherCommands'),
    icon: 'command',
    symbols: getOtherCommands(t)
  }
];

// 获取所有符号
export const getAllMathSymbols = (t: TranslationFunction = defaultT): SymbolDefinition[] => {
  return [
    ...getBasicOperators(t),
    ...getGreekLetters(t),
    ...getMathFunctions(t),
    ...getFractionsAndRoots(t),
    ...getSubscriptsAndBrackets(t),
    ...getSetsAndLogic(t),
    ...getArrowsAndRelations(t),
    ...getSpecialSymbols(t),
    ...getFontStyles(t),
    ...getMathDecorations(t),
    ...getMatrixEnvironments(t),
    ...getAlignEnvironments(t),
    ...getOtherCommands(t)
  ];
};

// 根据类别获取符号
export const getSymbolsByCategory = (category: string, t: TranslationFunction = defaultT): SymbolDefinition[] => {
  return getAllMathSymbols(t).filter(symbol => symbol.category === category);
};

// 搜索符号
export const searchMathSymbols = (query: string, t: TranslationFunction = defaultT): SymbolDefinition[] => {
  const lowerQuery = query.toLowerCase();
  return getAllMathSymbols(t).filter(symbol => 
    symbol.name.toLowerCase().includes(lowerQuery) ||
    symbol.latex.toLowerCase().includes(lowerQuery)
  );
};

// 向后兼容的静态导出
export const basicOperators = getBasicOperators();
export const greekLetters = getGreekLetters();
export const mathFunctions = getMathFunctions();
export const fractionsAndRoots = getFractionsAndRoots();
export const subscriptsAndBrackets = getSubscriptsAndBrackets();
export const setsAndLogic = getSetsAndLogic();
export const arrowsAndRelations = getArrowsAndRelations();
export const specialSymbols = getSpecialSymbols();
export const fontStyles = getFontStyles();
export const mathDecorations = getMathDecorations();
export const matrixEnvironments = getMatrixEnvironments();
export const alignEnvironments = getAlignEnvironments();
export const otherCommands = getOtherCommands();
export const mathSymbolCategories = getMathSymbolCategories();