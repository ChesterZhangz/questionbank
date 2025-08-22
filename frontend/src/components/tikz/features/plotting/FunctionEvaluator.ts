// 高级函数求值器
// 支持LaTeX数学表达式的安全求值

export interface EvaluationContext {
  variables: Map<string, number>;
  constants: Map<string, number>;
  functions: Map<string, Function>;
}

export interface EvaluationResult {
  value: number;
  isValid: boolean;
  error?: string;
}

export class FunctionEvaluator {
  private static defaultConstants = new Map([
    ['pi', Math.PI],
    ['e', Math.E],
    ['sqrt2', Math.SQRT2],
    ['sqrt1_2', Math.SQRT1_2],
    ['ln2', Math.LN2],
    ['ln10', Math.LN10],
    ['log2e', Math.LOG2E],
    ['log10e', Math.LOG10E]
  ]);

  private static defaultFunctions: Map<string, Function> = new Map([
    // 三角函数
    ['sin', Math.sin],
    ['cos', Math.cos],
    ['tan', Math.tan],
    ['asin', Math.asin],
    ['acos', Math.acos],
    ['atan', Math.atan],
    ['atan2', Math.atan2],
    ['sinh', Math.sinh],
    ['cosh', Math.cosh],
    ['tanh', Math.tanh],
    ['asinh', Math.asinh],
    ['acosh', Math.acosh],
    ['atanh', Math.atanh],
    
    // 对数和指数函数
    ['exp', Math.exp],
    ['log', Math.log],
    ['log10', Math.log10],
    ['log2', Math.log2],
    ['ln', Math.log],
    ['sqrt', Math.sqrt],
    ['cbrt', Math.cbrt],
    ['pow', Math.pow],
    
    // 其他数学函数
    ['abs', Math.abs],
    ['floor', Math.floor],
    ['ceil', Math.ceil],
    ['round', Math.round],
    ['sign', Math.sign],
    ['max', Math.max],
    ['min', Math.min],
    
    // 双曲函数的倒数
    ['csc', (x: number) => 1 / Math.sin(x)],
    ['sec', (x: number) => 1 / Math.cos(x)],
    ['cot', (x: number) => 1 / Math.tan(x)],
    
    // 角度转换
    ['deg', (x: number) => x * 180 / Math.PI],
    ['rad', (x: number) => x * Math.PI / 180],
    
    // 特殊函数
    ['gamma', (x: number): number => {
      // 简化的Gamma函数近似
      if (x === 1) return 1;
      if (x === 0.5) return Math.sqrt(Math.PI);
      return (x - 1) * FunctionEvaluator.defaultFunctions.get('gamma')!(x - 1);
    }],
    
    ['factorial', (x: number) => {
      if (x === 0 || x === 1) return 1;
      let result = 1;
      for (let i = 2; i <= x; i++) {
        result *= i;
      }
      return result;
    }]
  ]);

  /**
   * 创建默认上下文
   */
  static createDefaultContext(): EvaluationContext {
    return {
      variables: new Map([['x', 0]]),
      constants: new Map(this.defaultConstants),
      functions: new Map(this.defaultFunctions)
    };
  }

  /**
   * 评估函数表达式
   */
  static evaluate(expression: string, x: number, context?: EvaluationContext): EvaluationResult {
    const ctx = context || this.createDefaultContext();
    ctx.variables.set('x', x);

    try {
      // 预处理表达式
      const processedExpression = this.preprocessExpression(expression, ctx);
      
      // 安全求值
      const value = this.safeEvaluate(processedExpression, ctx);
      
      if (!isFinite(value)) {
        return {
          value: NaN,
          isValid: false,
          error: '结果不是有限数值'
        };
      }

      return {
        value,
        isValid: true
      };
    } catch (error) {
      return {
        value: NaN,
        isValid: false,
        error: error instanceof Error ? error.message : '未知错误'
      };
    }
  }

  /**
   * 生成函数点集
   */
  static generatePoints(
    expression: string,
    domain: [number, number],
    samples: number = 100,
    context?: EvaluationContext
  ): Array<{ x: number; y: number; valid: boolean }> {
    const [xmin, xmax] = domain;
    const step = (xmax - xmin) / (samples - 1);
    const points: Array<{ x: number; y: number; valid: boolean }> = [];

    for (let i = 0; i < samples; i++) {
      const x = xmin + i * step;
      const result = this.evaluate(expression, x, context);
      
      points.push({
        x,
        y: result.value,
        valid: result.isValid
      });
    }

    return points;
  }

  /**
   * 预处理表达式
   */
  private static preprocessExpression(expression: string, context: EvaluationContext): string {
    let processed = expression;

    // 替换常量
    for (const [name, value] of context.constants) {
      const regex = new RegExp(`\\b${name}\\b`, 'g');
      processed = processed.replace(regex, value.toString());
    }

    // 替换变量
    for (const [name, value] of context.variables) {
      if (name !== 'x') { // x会在求值时动态替换
        const regex = new RegExp(`\\b${name}\\b`, 'g');
        processed = processed.replace(regex, value.toString());
      }
    }

    // 处理LaTeX语法
    processed = this.processLatexSyntax(processed);

    // 处理隐式乘法
    processed = this.processImplicitMultiplication(processed);

    return processed;
  }

  /**
   * 处理LaTeX语法
   */
  private static processLatexSyntax(expression: string): string {
    let processed = expression;

    // 替换LaTeX命令
    const latexReplacements = new Map([
      ['\\sin', 'sin'],
      ['\\cos', 'cos'],
      ['\\tan', 'tan'],
      ['\\log', 'log10'],
      ['\\ln', 'ln'],
      ['\\exp', 'exp'],
      ['\\sqrt', 'sqrt'],
      ['\\pi', 'pi'],
      ['\\frac', ''],
      ['^', '**'],
      ['\\cdot', '*'],
      ['\\times', '*'],
      ['\\div', '/']
    ]);

    for (const [latex, js] of latexReplacements) {
      processed = processed.replace(new RegExp(latex.replace('\\', '\\\\'), 'g'), js);
    }

    // 处理分数 \frac{a}{b} -> (a)/(b)
    processed = processed.replace(/\\frac\s*\{([^}]+)\}\s*\{([^}]+)\}/g, '(($1)/($2))');

    // 处理上标 a^{b} -> pow(a, b)
    processed = processed.replace(/([a-zA-Z0-9)]+)\*\*\s*\{([^}]+)\}/g, 'pow($1, $2)');
    processed = processed.replace(/([a-zA-Z0-9)]+)\*\*([a-zA-Z0-9]+)/g, 'pow($1, $2)');

    // 处理开方 \sqrt{a} -> sqrt(a)
    processed = processed.replace(/sqrt\s*\{([^}]+)\}/g, 'sqrt($1)');

    return processed;
  }

  /**
   * 处理隐式乘法
   */
  private static processImplicitMultiplication(expression: string): string {
    let processed = expression;

    // 数字和字母之间的隐式乘法
    processed = processed.replace(/(\d)([a-zA-Z])/g, '$1*$2');
    
    // 右括号和左括号之间的隐式乘法
    processed = processed.replace(/\)\s*\(/g, ')*(');
    
    // 数字和左括号之间的隐式乘法
    processed = processed.replace(/(\d)\s*\(/g, '$1*(');
    
    // 右括号和字母之间的隐式乘法
    processed = processed.replace(/\)\s*([a-zA-Z])/g, ')*$1');

    return processed;
  }

  /**
   * 安全求值
   */
  private static safeEvaluate(expression: string, context: EvaluationContext): number {
    // 替换变量x
    const xValue = context.variables.get('x') || 0;
    let processed = expression.replace(/\bx\b/g, xValue.toString());

    // 替换函数调用
    for (const [name, func] of context.functions) {
      const regex = new RegExp(`\\b${name}\\s*\\(([^)]+)\\)`, 'g');
      processed = processed.replace(regex, (_match, args) => {
        try {
          const argValues = args.split(',').map((arg: string) => {
            return this.safeEvaluate(arg.trim(), context);
          });
          const result = func(...argValues);
          return result.toString();
        } catch (error) {
          throw new Error(`函数 ${name} 调用失败: ${error}`);
        }
      });
    }

    // 验证表达式安全性
    if (!this.isSafeExpression(processed)) {
      throw new Error('不安全的表达式');
    }

    // 使用Function构造器安全求值
    try {
      return Function('"use strict"; return (' + processed + ')')();
    } catch (error) {
      throw new Error(`表达式求值失败: ${error}`);
    }
  }

  /**
   * 检查表达式安全性
   */
  private static isSafeExpression(expression: string): boolean {
    // 禁止的关键字和模式
    const forbidden = [
      'eval', 'Function', 'constructor', 'prototype',
      '__proto__', 'window', 'document', 'global',
      'process', 'require', 'import', 'export',
      'function', 'class', 'var', 'let', 'const',
      'if', 'else', 'for', 'while', 'do', 'switch',
      'try', 'catch', 'throw', 'return', 'delete',
      'new', 'this', 'typeof', 'instanceof'
    ];

    const lowerExpression = expression.toLowerCase();
    
    for (const keyword of forbidden) {
      if (lowerExpression.includes(keyword)) {
        return false;
      }
    }

    // 只允许数字、运算符、括号、小数点和科学记数法
    const allowedPattern = /^[0-9+\-*/().eE\s]*$/;
    return allowedPattern.test(expression);
  }

  /**
   * 解析参数化函数
   */
  static parseParametricFunction(
    xExpression: string,
    yExpression: string,
    tDomain: [number, number],
    samples: number = 100,
    context?: EvaluationContext
  ): Array<{ x: number; y: number; t: number; valid: boolean }> {
    const [tmin, tmax] = tDomain;
    const step = (tmax - tmin) / (samples - 1);
    const points: Array<{ x: number; y: number; t: number; valid: boolean }> = [];

    const ctx = context || this.createDefaultContext();

    for (let i = 0; i < samples; i++) {
      const t = tmin + i * step;
      ctx.variables.set('t', t);

      const xResult = this.evaluate(xExpression.replace(/\bt\b/g, t.toString()), 0, ctx);
      const yResult = this.evaluate(yExpression.replace(/\bt\b/g, t.toString()), 0, ctx);

      points.push({
        x: xResult.value,
        y: yResult.value,
        t,
        valid: xResult.isValid && yResult.isValid
      });
    }

    return points;
  }
}

// 导出相关类型
// export type { EvaluationContext, EvaluationResult };
