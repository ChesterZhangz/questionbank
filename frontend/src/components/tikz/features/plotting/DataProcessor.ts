// 数据处理器
// 处理各种数据源和格式

export interface DataPoint {
  x: number;
  y: number;
  label?: string;
  metadata?: Record<string, any>;
}

export interface DataSeries {
  name: string;
  data: DataPoint[];
  color?: string;
  lineStyle?: 'solid' | 'dashed' | 'dotted' | 'dashdotted';
  marker?: string;
  visible?: boolean;
}

export interface StatisticalSummary {
  count: number;
  mean: number;
  median: number;
  stdDev: number;
  min: number;
  max: number;
  q1: number;
  q3: number;
}

export class DataProcessor {
  /**
   * 解析CSV数据
   */
  static parseCSV(csvText: string, options: {
    hasHeader?: boolean;
    delimiter?: string;
    xColumn?: number | string;
    yColumn?: number | string;
    labelColumn?: number | string;
  } = {}): DataSeries[] {
    const {
      hasHeader = true,
      delimiter = ',',
      xColumn = 0,
      yColumn = 1,
      labelColumn
    } = options;

    const lines = csvText.trim().split('\n');
    const startIndex = hasHeader ? 1 : 0;
    const data: DataPoint[] = [];

    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const columns = line.split(delimiter);
      const x = this.parseNumber(columns[this.getColumnIndex(xColumn, columns)]);
      const y = this.parseNumber(columns[this.getColumnIndex(yColumn, columns)]);
      
      if (x !== null && y !== null) {
        const point: DataPoint = { x, y };
        
        if (labelColumn !== undefined) {
          const labelIndex = this.getColumnIndex(labelColumn, columns);
          if (labelIndex < columns.length) {
            point.label = columns[labelIndex].trim();
          }
        }
        
        data.push(point);
      }
    }

    return [{
      name: 'CSV Data',
      data,
      visible: true
    }];
  }

  /**
   * 解析表格数据
   */
  static parseTableData(tableText: string, options: {
    hasHeader?: boolean;
    delimiter?: string;
    xColumn?: number;
    yColumn?: number;
  } = {}): DataSeries[] {
    const {
      hasHeader = false,
      delimiter = /\s+/,
      xColumn = 0,
      yColumn = 1
    } = options;

    const lines = tableText.trim().split('\n');
    const startIndex = hasHeader ? 1 : 0;
    const data: DataPoint[] = [];

    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const columns = line.split(delimiter).filter(col => col.trim());
      if (columns.length < Math.max(xColumn, yColumn) + 1) continue;

      const x = this.parseNumber(columns[xColumn]);
      const y = this.parseNumber(columns[yColumn]);
      
      if (x !== null && y !== null) {
        data.push({ x, y });
      }
    }

    return [{
      name: 'Table Data',
      data,
      visible: true
    }];
  }

  /**
   * 生成函数数据
   */
  static generateFunctionData(
    expression: string,
    domain: [number, number],
    samples: number = 100,
    options: {
      variable?: string;
      parameters?: Record<string, number>;
    } = {}
  ): DataSeries {
    // 类型修复：如果传入的是数组，取第一个元素
    let fixedExpression: string;
    if (Array.isArray(expression)) {
      fixedExpression = expression[0] || 'x';
    } else if (typeof expression === 'string') {
      fixedExpression = expression;
    } else {
      console.error('expression 类型错误:', typeof expression, expression);
      fixedExpression = 'x'; // 默认值
    }
    const { variable = 'x', parameters = {} } = options;
    const [xmin, xmax] = domain;
    const step = (xmax - xmin) / (samples - 1);
    const data: DataPoint[] = [];

    for (let i = 0; i < samples; i++) {
      const x = xmin + i * step;
      const y = this.evaluateFunction(fixedExpression, { [variable]: x, ...parameters });
      
      if (y !== null && isFinite(y)) {
        data.push({ x, y });
      }
    }
    
    return {
      name: `f(${variable}) = ${fixedExpression}`,
      data,
      visible: true
    };
  }

  /**
   * 生成参数方程数据
   */
  static generateParametricData(
    xExpression: string,
    yExpression: string,
    tDomain: [number, number],
    samples: number = 100,
    options: {
      parameter?: string;
      parameters?: Record<string, number>;
    } = {}
  ): DataSeries {
    const { parameter = 't', parameters = {} } = options;
    const [tmin, tmax] = tDomain;
    const step = (tmax - tmin) / (samples - 1);
    const data: DataPoint[] = [];

    for (let i = 0; i < samples; i++) {
      const t = tmin + i * step;
      const x = this.evaluateFunction(xExpression, { [parameter]: t, ...parameters });
      const y = this.evaluateFunction(yExpression, { [parameter]: t, ...parameters });
      
      if (x !== null && y !== null && isFinite(x) && isFinite(y)) {
        data.push({ x, y });
      }
    }

    return {
      name: `x = ${xExpression}, y = ${yExpression}`,
      data,
      visible: true
    };
  }

  /**
   * 生成极坐标数据
   */
  static generatePolarData(
    rExpression: string,
    thetaDomain: [number, number],
    samples: number = 100,
    options: {
      parameter?: string;
      parameters?: Record<string, number>;
    } = {}
  ): DataSeries {
    const { parameter = 'θ', parameters = {} } = options;
    const [thetamin, thetamax] = thetaDomain;
    const step = (thetamax - thetamin) / (samples - 1);
    const data: DataPoint[] = [];

    for (let i = 0; i < samples; i++) {
      const theta = thetamin + i * step;
      const r = this.evaluateFunction(rExpression, { [parameter]: theta, ...parameters });
      
      if (r !== null && isFinite(r) && r >= 0) {
        // 转换为笛卡尔坐标
        const x = r * Math.cos(theta);
        const y = r * Math.sin(theta);
        data.push({ x, y });
      }
    }

    return {
      name: `r = ${rExpression}`,
      data,
      visible: true
    };
  }

  /**
   * 数据统计摘要
   */
  static calculateStatistics(data: DataPoint[], axis: 'x' | 'y'): StatisticalSummary {
    const values = data.map(point => axis === 'x' ? point.x : point.y).filter(v => isFinite(v));
    
    if (values.length === 0) {
      return {
        count: 0,
        mean: 0,
        median: 0,
        stdDev: 0,
        min: 0,
        max: 0,
        q1: 0,
        q3: 0
      };
    }

    const sorted = values.sort((a, b) => a - b);
    const count = sorted.length;
    const mean = sorted.reduce((sum, val) => sum + val, 0) / count;
    const median = this.calculateMedian(sorted);
    const stdDev = Math.sqrt(sorted.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / count);
    const min = sorted[0];
    const max = sorted[count - 1];
    const q1 = this.calculatePercentile(sorted, 25);
    const q3 = this.calculatePercentile(sorted, 75);

    return {
      count,
      mean,
      median,
      stdDev,
      min,
      max,
      q1,
      q3
    };
  }

  /**
   * 数据过滤
   */
  static filterData(data: DataPoint[], filter: {
    xRange?: [number, number];
    yRange?: [number, number];
    condition?: (point: DataPoint) => boolean;
  }): DataPoint[] {
    return data.filter(point => {
      // X轴范围过滤
      if (filter.xRange) {
        const [xmin, xmax] = filter.xRange;
        if (point.x < xmin || point.x > xmax) return false;
      }

      // Y轴范围过滤
      if (filter.yRange) {
        const [ymin, ymax] = filter.yRange;
        if (point.y < ymin || point.y > ymax) return false;
      }

      // 自定义条件过滤
      if (filter.condition && !filter.condition(point)) return false;

      return true;
    });
  }

  /**
   * 数据采样
   */
  static sampleData(data: DataPoint[], targetCount: number, method: 'uniform' | 'random' | 'adaptive' = 'uniform'): DataPoint[] {
    if (data.length <= targetCount) {
      return [...data];
    }

    switch (method) {
      case 'uniform':
        return this.uniformSampling(data, targetCount);
      case 'random':
        return this.randomSampling(data, targetCount);
      case 'adaptive':
        return this.adaptiveSampling(data, targetCount);
      default:
        return this.uniformSampling(data, targetCount);
    }
  }

  /**
   * 数据插值
   */
  static interpolateData(data: DataPoint[], targetCount: number): DataPoint[] {
    if (data.length < 2) {
      return [...data];
    }

    const result: DataPoint[] = [];
    const step = (data.length - 1) / (targetCount - 1);

    for (let i = 0; i < targetCount; i++) {
      const index = i * step;
      const lowIndex = Math.floor(index);
      const highIndex = Math.min(lowIndex + 1, data.length - 1);
      const fraction = index - lowIndex;

      const low = data[lowIndex];
      const high = data[highIndex];

      const x = low.x + fraction * (high.x - low.x);
      const y = low.y + fraction * (high.y - low.y);

      result.push({ x, y });
    }

    return result;
  }

  /**
   * 数据平滑
   */
  static smoothData(data: DataPoint[], windowSize: number = 3, method: 'moving-average' | 'savitzky-golay' = 'moving-average'): DataPoint[] {
    if (data.length < windowSize) {
      return [...data];
    }

    switch (method) {
      case 'moving-average':
        return this.movingAverageSmoothing(data, windowSize);
      case 'savitzky-golay':
        return this.savitzkyGolaySmoothing(data, windowSize);
      default:
        return this.movingAverageSmoothing(data, windowSize);
    }
  }

  /**
   * 导出为CSV
   */
  static exportToCSV(data: DataPoint[], options: {
    includeHeader?: boolean;
    delimiter?: string;
    precision?: number;
  } = {}): string {
    const {
      includeHeader = true,
      delimiter = ',',
      precision = 6
    } = options;

    const lines: string[] = [];

    if (includeHeader) {
      lines.push(`x${delimiter}y${delimiter}label`);
    }

    data.forEach(point => {
      const x = point.x.toFixed(precision);
      const y = point.y.toFixed(precision);
      const label = point.label || '';
      lines.push(`${x}${delimiter}${y}${delimiter}${label}`);
    });

    return lines.join('\n');
  }

  /**
   * 导出为JSON
   */
  static exportToJSON(data: DataPoint[]): string {
    return JSON.stringify(data, null, 2);
  }

  // 私有辅助方法

  private static getColumnIndex(column: number | string, columns: string[]): number {
    if (typeof column === 'string') {
      const index = columns.findIndex(col => col.trim().toLowerCase() === column.toLowerCase());
      return index >= 0 ? index : 0;
    }
    return column;
  }

  private static parseNumber(value: string): number | null {
    const parsed = parseFloat(value.trim());
    return isNaN(parsed) ? null : parsed;
  }

  private static evaluateFunction(expression: string, variables: Record<string, number>): number | null {
    try {
      
      // 类型检查和修复
      if (typeof expression !== 'string') {
        console.error('expression 不是字符串类型！', expression);
        return null;
      }
      
      // 简单的函数求值器
      let processed = expression;
      
      // 替换变量
      Object.entries(variables).forEach(([name, value]) => {
        const regex = new RegExp(`\\b${name}\\b`, 'g');
        // 用括号包围负数值以避免运算符优先级问题
        const valueStr = value < 0 ? `(${value})` : value.toString();
        
        // 类型安全检查
        if (typeof processed !== 'string') {
          console.error('processed 不是字符串！', processed);
          throw new Error('processed 变量类型错误');
        }
        
        processed = processed.replace(regex, valueStr);
        
        // 再次检查结果类型
        if (typeof processed !== 'string') {
          console.error('replace 结果不是字符串！', processed);
          throw new Error('replace 操作返回非字符串类型');
        }
      });

      // 替换数学函数
      processed = processed
        // 首先处理 deg() 函数 - 将度数转换为弧度
        .replace(/deg\(/g, '((Math.PI/180)*')
        // 然后处理三角函数
        .replace(/sin\(/g, 'Math.sin(')
        .replace(/cos\(/g, 'Math.cos(')
        .replace(/tan\(/g, 'Math.tan(')
        // 其他数学函数
        .replace(/log\(/g, 'Math.log10(')
        .replace(/ln\(/g, 'Math.log(')
        .replace(/sqrt\(/g, 'Math.sqrt(')
        .replace(/abs\(/g, 'Math.abs(')
        .replace(/exp\(/g, 'Math.exp(')
        // 常数
        .replace(/\bpi\b/g, 'Math.PI')  // 使用单词边界确保不替换其他包含pi的词
        .replace(/\be\b/g, 'Math.E')    // 使用单词边界确保不替换其他包含e的词  
        // 幂运算符（必须最后处理）
        .replace(/\^/g, '**');

      const result = Function('"use strict"; return (' + processed + ')')();
      return result;
    } catch (error) {
      console.error('evaluateFunction 错误:', error);
      return null;
    }
  }

  private static calculateMedian(sorted: number[]): number {
    const mid = Math.floor(sorted.length / 2);
    if (sorted.length % 2 === 0) {
      return (sorted[mid - 1] + sorted[mid]) / 2;
    }
    return sorted[mid];
  }

  private static calculatePercentile(sorted: number[], percentile: number): number {
    const index = (percentile / 100) * (sorted.length - 1);
    const lowIndex = Math.floor(index);
    const highIndex = Math.min(lowIndex + 1, sorted.length - 1);
    const fraction = index - lowIndex;

    return sorted[lowIndex] + fraction * (sorted[highIndex] - sorted[lowIndex]);
  }

  private static uniformSampling(data: DataPoint[], targetCount: number): DataPoint[] {
    const result: DataPoint[] = [];
    const step = (data.length - 1) / (targetCount - 1);

    for (let i = 0; i < targetCount; i++) {
      const index = Math.round(i * step);
      result.push(data[index]);
    }

    return result;
  }

  private static randomSampling(data: DataPoint[], targetCount: number): DataPoint[] {
    const result: DataPoint[] = [];
    const indices = new Set<number>();

    while (indices.size < targetCount) {
      const index = Math.floor(Math.random() * data.length);
      indices.add(index);
    }

    Array.from(indices).sort((a, b) => a - b).forEach(index => {
      result.push(data[index]);
    });

    return result;
  }

  private static adaptiveSampling(data: DataPoint[], targetCount: number): DataPoint[] {
    // 简单的自适应采样：保留曲率较大的点
    if (data.length <= targetCount) {
      return [...data];
    }

    const result: DataPoint[] = [data[0]]; // 保留第一个点
    const step = Math.max(1, Math.floor(data.length / targetCount));

    for (let i = step; i < data.length - step; i += step) {
      const prev = data[i - step];
      const curr = data[i];
      const next = data[i + step];

      // 计算曲率（简化的）
      const curvature = Math.abs(
        (next.y - 2 * curr.y + prev.y) / Math.pow(step, 2)
      );

      if (curvature > 0.01) { // 阈值可调整
        result.push(curr);
      }
    }

    result.push(data[data.length - 1]); // 保留最后一个点
    return result;
  }

  private static movingAverageSmoothing(data: DataPoint[], windowSize: number): DataPoint[] {
    const result: DataPoint[] = [];
    const halfWindow = Math.floor(windowSize / 2);

    for (let i = 0; i < data.length; i++) {
      const start = Math.max(0, i - halfWindow);
      const end = Math.min(data.length, i + halfWindow + 1);
      const window = data.slice(start, end);

      const avgX = window.reduce((sum, p) => sum + p.x, 0) / window.length;
      const avgY = window.reduce((sum, p) => sum + p.y, 0) / window.length;

      result.push({ x: avgX, y: avgY });
    }

    return result;
  }

  private static savitzkyGolaySmoothing(data: DataPoint[], windowSize: number): DataPoint[] {
    // 简化的Savitzky-Golay平滑
    return this.movingAverageSmoothing(data, windowSize);
  }
}
