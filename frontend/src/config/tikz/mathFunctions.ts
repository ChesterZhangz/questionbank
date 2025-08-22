// TikZ 数学函数配置
export interface MathFunction {
  name: string;
  expression: string;
  description: string;
  category: 'trigonometric' | 'exponential' | 'logarithmic' | 'polynomial' | 'other';
}

// 预定义数学函数库
export const mathFunctions: MathFunction[] = [
  // 三角函数
  {
    name: 'sin',
    expression: 'Math.sin(x)',
    description: '正弦函数',
    category: 'trigonometric'
  },
  {
    name: 'cos',
    expression: 'Math.cos(x)',
    description: '余弦函数',
    category: 'trigonometric'
  },
  {
    name: 'tan',
    expression: 'Math.tan(x)',
    description: '正切函数',
    category: 'trigonometric'
  },
  {
    name: 'csc',
    expression: '1 / Math.sin(x)',
    description: '余割函数',
    category: 'trigonometric'
  },
  {
    name: 'sec',
    expression: '1 / Math.cos(x)',
    description: '正割函数',
    category: 'trigonometric'
  },
  {
    name: 'cot',
    expression: '1 / Math.tan(x)',
    description: '余切函数',
    category: 'trigonometric'
  },
  
  // 指数和对数函数
  {
    name: 'exp',
    expression: 'Math.exp(x)',
    description: '指数函数 e^x',
    category: 'exponential'
  },
  {
    name: 'log',
    expression: 'Math.log(x)',
    description: '自然对数 ln(x)',
    category: 'logarithmic'
  },
  {
    name: 'log10',
    expression: 'Math.log10(x)',
    description: '常用对数 log₁₀(x)',
    category: 'logarithmic'
  },
  {
    name: 'sqrt',
    expression: 'Math.sqrt(x)',
    description: '平方根函数',
    category: 'other'
  },
  
  // 多项式函数
  {
    name: 'x^2',
    expression: 'x * x',
    description: '二次函数',
    category: 'polynomial'
  },
  {
    name: 'x^3',
    expression: 'x * x * x',
    description: '三次函数',
    category: 'polynomial'
  },
  {
    name: '1/x',
    expression: '1 / x',
    description: '反比例函数',
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
