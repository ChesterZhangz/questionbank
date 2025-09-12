// TikZ 数学函数配置
export interface MathFunction {
  name: string;
  expression: string;
  description: string;
  category: 'trigonometric' | 'exponential' | 'logarithmic' | 'polynomial' | 'other';
}

// 获取翻译后的数学函数配置
export const getMathFunctions = (t: (key: string) => string): MathFunction[] => [
  // 三角函数
  {
    name: 'sin',
    expression: 'Math.sin(x)',
    description: t('config.tikz.mathFunctions.trigonometric'),
    category: 'trigonometric'
  },
  {
    name: 'cos',
    expression: 'Math.cos(x)',
    description: t('config.tikz.mathFunctions.trigonometric'),
    category: 'trigonometric'
  },
  {
    name: 'tan',
    expression: 'Math.tan(x)',
    description: t('config.tikz.mathFunctions.trigonometric'),
    category: 'trigonometric'
  },
  {
    name: 'csc',
    expression: '1 / Math.sin(x)',
    description: t('config.tikz.mathFunctions.trigonometric'),
    category: 'trigonometric'
  },
  {
    name: 'sec',
    expression: '1 / Math.cos(x)',
    description: t('config.tikz.mathFunctions.trigonometric'),
    category: 'trigonometric'
  },
  {
    name: 'cot',
    expression: '1 / Math.tan(x)',
    description: t('config.tikz.mathFunctions.trigonometric'),
    category: 'trigonometric'
  },
  
  // 指数和对数函数
  {
    name: 'exp',
    expression: 'Math.exp(x)',
    description: t('config.tikz.mathFunctions.exponential'),
    category: 'exponential'
  },
  {
    name: 'log',
    expression: 'Math.log(x)',
    description: t('config.tikz.mathFunctions.logarithmic'),
    category: 'logarithmic'
  },
  {
    name: 'log10',
    expression: 'Math.log10(x)',
    description: t('config.tikz.mathFunctions.logarithmic'),
    category: 'logarithmic'
  },
  {
    name: 'sqrt',
    expression: 'Math.sqrt(x)',
    description: t('config.tikz.mathFunctions.basic'),
    category: 'other'
  },
  
  // 多项式函数
  {
    name: 'x^2',
    expression: 'x * x',
    description: t('config.tikz.mathFunctions.polynomial'),
    category: 'polynomial'
  },
  {
    name: 'x^3',
    expression: 'x * x * x',
    description: t('config.tikz.mathFunctions.polynomial'),
    category: 'polynomial'
  },
  {
    name: '1/x',
    expression: '1 / x',
    description: t('config.tikz.mathFunctions.rational'),
    category: 'polynomial'
  }
];

// 获取翻译后的函数配置信息
export const getMathFunctionsConfig = (t: (key: string) => string) => ({
  title: t('config.tikz.mathFunctions.title'),
  description: t('config.tikz.mathFunctions.description'),
  basic: t('config.tikz.mathFunctions.basic'),
  trigonometric: t('config.tikz.mathFunctions.trigonometric'),
  logarithmic: t('config.tikz.mathFunctions.logarithmic'),
  exponential: t('config.tikz.mathFunctions.exponential'),
  polynomial: t('config.tikz.mathFunctions.polynomial'),
  rational: t('config.tikz.mathFunctions.rational'),
  hyperbolic: t('config.tikz.mathFunctions.hyperbolic'),
  inverse: t('config.tikz.mathFunctions.inverse'),
  composite: t('config.tikz.mathFunctions.composite'),
  piecewise: t('config.tikz.mathFunctions.piecewise'),
  parametric: t('config.tikz.mathFunctions.parametric'),
  polar: t('config.tikz.mathFunctions.polar'),
  vector: t('config.tikz.mathFunctions.vector'),
  matrix: t('config.tikz.mathFunctions.matrix'),
  complex: t('config.tikz.mathFunctions.complex'),
  special: t('config.tikz.mathFunctions.special'),
  custom: t('config.tikz.mathFunctions.custom')
});

// 预定义数学函数库
export const mathFunctions: MathFunction[] = [
  // 三角函数
  {
    name: 'sin',
    expression: 'Math.sin(x)',
    description: 'Sine Function',
    category: 'trigonometric'
  },
  {
    name: 'cos',
    expression: 'Math.cos(x)',
    description: 'Cosine Function',
    category: 'trigonometric'
  },
  {
    name: 'tan',
    expression: 'Math.tan(x)',
    description: 'Tangent Function',
    category: 'trigonometric'
  },
  {
    name: 'csc',
    expression: '1 / Math.sin(x)',
    description: 'Cosecant Function',
    category: 'trigonometric'
  },
  {
    name: 'sec',
    expression: '1 / Math.cos(x)',
    description: 'Secant Function',
    category: 'trigonometric'
  },
  {
    name: 'cot',
    expression: '1 / Math.tan(x)',
    description: 'Cotangent Function',
    category: 'trigonometric'
  },
  
  // 指数和对数函数
  {
    name: 'exp',
    expression: 'Math.exp(x)',
    description: 'Exponential Function e^x',
    category: 'exponential'
  },
  {
    name: 'log',
    expression: 'Math.log(x)',
    description: 'Natural Logarithm ln(x)',
    category: 'logarithmic'
  },
  {
    name: 'log10',
    expression: 'Math.log10(x)',
    description: 'Common Logarithm log₁₀(x)',
    category: 'logarithmic'
  },
  {
    name: 'sqrt',
    expression: 'Math.sqrt(x)',
    description: 'Square Root Function',
    category: 'other'
  },
  
  // 多项式函数
  {
    name: 'x^2',
    expression: 'x * x',
    description: 'Quadratic Function',
    category: 'polynomial'
  },
  {
    name: 'x^3',
    expression: 'x * x * x',
    description: 'Cubic Function',
    category: 'polynomial'
  },
  {
    name: '1/x',
    expression: '1 / x',
    description: 'Inverse Proportional Function',
    category: 'polynomial'
  }
];

// 按类别获取函数
export function getFunctionsByCategory(category: MathFunction['category']): MathFunction[] {
  return mathFunctions.filter(fn => fn.category === category);
}

// 获取所有函数名称
export function getAllFunctionNames(): string[] {
  return mathFunctions.map(fn => fn.name);
}

// 检查函数名是否有效
export function isValidFunctionName(name: string): boolean {
  return mathFunctions.some(fn => fn.name === name);
}

// 获取函数表达式
export function getFunctionExpression(name: string): string | null {
  const func = mathFunctions.find(fn => fn.name === name);
  return func ? func.expression : null;
}
