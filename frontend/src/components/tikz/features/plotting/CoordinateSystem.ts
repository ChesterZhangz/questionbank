// 坐标系统
// 支持多种坐标系转换

export interface CoordinateTransform {
  toScreen: (x: number, y: number) => { x: number; y: number };
  fromScreen: (screenX: number, screenY: number) => { x: number; y: number };
}

export interface CoordinateRange {
  x: [number, number];
  y: [number, number];
}

export class CoordinateSystem {
  private type: 'cartesian' | 'polar' | 'logarithmic';
  private range: CoordinateRange;
  private screenDimensions: { width: number; height: number };
  private margins: { left: number; right: number; top: number; bottom: number };

  constructor(
    type: 'cartesian' | 'polar' | 'logarithmic' = 'cartesian',
    range: CoordinateRange = { x: [-5, 5], y: [-5, 5] },
    screenDimensions: { width: number; height: number } = { width: 400, height: 300 },
    margins: { left: number; right: number; top: number; bottom: number } = { left: 60, right: 20, top: 40, bottom: 60 }
  ) {
    this.type = type;
    this.range = range;
    this.screenDimensions = screenDimensions;
    this.margins = margins;
  }

  /**
   * 获取坐标变换函数
   */
  getTransform(): CoordinateTransform {
    switch (this.type) {
      case 'cartesian':
        return this.createCartesianTransform();
      case 'polar':
        return this.createPolarTransform();
      case 'logarithmic':
        return this.createLogarithmicTransform();
      default:
        return this.createCartesianTransform();
    }
  }

  /**
   * 创建笛卡尔坐标系变换
   */
  private createCartesianTransform(): CoordinateTransform {
    const { x: [xmin, xmax], y: [ymin, ymax] } = this.range;
    const { width, height } = this.screenDimensions;
    const { left, top } = this.margins;
    const plotWidth = width - left - this.margins.right;
    const plotHeight = height - top - this.margins.bottom;

    return {
      toScreen: (x: number, y: number) => ({
        x: left + ((x - xmin) / (xmax - xmin)) * plotWidth,
        y: top + plotHeight - ((y - ymin) / (ymax - ymin)) * plotHeight
      }),
      fromScreen: (screenX: number, screenY: number) => ({
        x: xmin + ((screenX - left) / plotWidth) * (xmax - xmin),
        y: ymin + ((top + plotHeight - screenY) / plotHeight) * (ymax - ymin)
      })
    };
  }

  /**
   * 创建极坐标系变换
   */
  private createPolarTransform(): CoordinateTransform {
    const { x: [rmin, rmax], y: [thetamin, thetamax] } = this.range;
    const { width, height } = this.screenDimensions;
    const { left, top } = this.margins;
    const plotWidth = width - left - this.margins.right;
    const plotHeight = height - top - this.margins.bottom;
    const centerX = left + plotWidth / 2;
    const centerY = top + plotHeight / 2;
    const maxRadius = Math.min(plotWidth, plotHeight) / 2;

    return {
      toScreen: (r: number, theta: number) => {
        const normalizedR = (r - rmin) / (rmax - rmin);
        const normalizedTheta = (theta - thetamin) / (thetamax - thetamin);
        const screenR = normalizedR * maxRadius;
        const screenTheta = normalizedTheta * 2 * Math.PI;

        return {
          x: centerX + screenR * Math.cos(screenTheta),
          y: centerY + screenR * Math.sin(screenTheta)
        };
      },
      fromScreen: (screenX: number, screenY: number) => {
        const dx = screenX - centerX;
        const dy = screenY - centerY;
        const r = Math.sqrt(dx * dx + dy * dy);
        const theta = Math.atan2(dy, dx);

        const normalizedR = r / maxRadius;
        const normalizedTheta = theta / (2 * Math.PI);

        return {
          x: rmin + normalizedR * (rmax - rmin),
          y: thetamin + normalizedTheta * (thetamax - thetamin)
        };
      }
    };
  }

  /**
   * 创建对数坐标系变换
   */
  private createLogarithmicTransform(): CoordinateTransform {
    const { x: [xmin, xmax], y: [ymin, ymax] } = this.range;
    const { width, height } = this.screenDimensions;
    const { left, top } = this.margins;
    const plotWidth = width - left - this.margins.right;
    const plotHeight = height - top - this.margins.bottom;

    // 确保对数坐标的范围为正数
    const safeXmin = Math.max(xmin, 0.001);
    const safeYmin = Math.max(ymin, 0.001);

    return {
      toScreen: (x: number, y: number) => {
        const logX = Math.log10(Math.max(x, 0.001));
        const logY = Math.log10(Math.max(y, 0.001));
        const logXmin = Math.log10(safeXmin);
        const logXmax = Math.log10(xmax);
        const logYmin = Math.log10(safeYmin);
        const logYmax = Math.log10(ymax);

        return {
          x: left + ((logX - logXmin) / (logXmax - logXmin)) * plotWidth,
          y: top + plotHeight - ((logY - logYmin) / (logYmax - logYmin)) * plotHeight
        };
      },
      fromScreen: (screenX: number, screenY: number) => {
        const logXmin = Math.log10(safeXmin);
        const logXmax = Math.log10(xmax);
        const logYmin = Math.log10(safeYmin);
        const logYmax = Math.log10(ymax);

        const normalizedX = (screenX - left) / plotWidth;
        const normalizedY = (top + plotHeight - screenY) / plotHeight;

        const logX = logXmin + normalizedX * (logXmax - logXmin);
        const logY = logYmin + normalizedY * (logYmax - logYmin);

        return {
          x: Math.pow(10, logX),
          y: Math.pow(10, logY)
        };
      }
    };
  }

  /**
   * 生成坐标轴刻度
   */
  generateTicks(axis: 'x' | 'y', count: number = 6): Array<{ value: number; position: number; label: string }> {
    const range = axis === 'x' ? this.range.x : this.range.y;
    const [min, max] = range;
    const transform = this.getTransform();

    let ticks: Array<{ value: number; position: number; label: string }> = [];

    switch (this.type) {
      case 'cartesian':
        ticks = this.generateCartesianTicks(min, max, count);
        break;
      case 'polar':
        if (axis === 'x') {
          // r轴刻度
          ticks = this.generateCartesianTicks(min, max, count);
        } else {
          // theta轴刻度（角度）
          ticks = this.generatePolarTicks(min, max, count);
        }
        break;
      case 'logarithmic':
        ticks = this.generateLogarithmicTicks(min, max, count);
        break;
    }

    // 转换为屏幕坐标
    return ticks.map(tick => {
      let position: number;
      if (axis === 'x') {
        const screen = transform.toScreen(tick.value, 0);
        position = screen.x;
      } else {
        const screen = transform.toScreen(0, tick.value);
        position = screen.y;
      }

      return {
        ...tick,
        position
      };
    });
  }

  /**
   * 生成笛卡尔坐标系刻度
   */
  private generateCartesianTicks(min: number, max: number, count: number): Array<{ value: number; position: number; label: string }> {
    const range = max - min;
    const step = range / (count - 1);
    const ticks: Array<{ value: number; position: number; label: string }> = [];

    for (let i = 0; i < count; i++) {
      const value = min + i * step;
      ticks.push({
        value,
        position: 0, // 将在调用时计算
        label: this.formatTickLabel(value)
      });
    }

    return ticks;
  }

  /**
   * 生成极坐标系刻度
   */
  private generatePolarTicks(min: number, max: number, _count: number): Array<{ value: number; position: number; label: string }> {
    const ticks: Array<{ value: number; position: number; label: string }> = [];
    
    // 角度刻度：0°, 45°, 90°, 135°, 180°, 225°, 270°, 315°
    const angleStep = 45;
    for (let angle = 0; angle <= 360; angle += angleStep) {
      if (angle >= min && angle <= max) {
        ticks.push({
          value: angle,
          position: 0,
          label: `${angle}°`
        });
      }
    }

    return ticks;
  }

  /**
   * 生成对数坐标系刻度
   */
  private generateLogarithmicTicks(min: number, max: number, _count: number): Array<{ value: number; position: number; label: string }> {
    const ticks: Array<{ value: number; position: number; label: string }> = [];
    const logMin = Math.log10(Math.max(min, 0.001));
    const logMax = Math.log10(max);
    
    // 生成10的幂次刻度
    for (let i = Math.floor(logMin); i <= Math.ceil(logMax); i++) {
      const value = Math.pow(10, i);
      if (value >= min && value <= max) {
        ticks.push({
          value,
          position: 0,
          label: this.formatTickLabel(value)
        });
      }
    }

    // 添加中间刻度（2, 3, 5等）
    for (let i = Math.floor(logMin); i < Math.ceil(logMax); i++) {
      const base = Math.pow(10, i);
      [2, 3, 5].forEach(multiplier => {
        const value = base * multiplier;
        if (value >= min && value <= max) {
          ticks.push({
            value,
            position: 0,
            label: this.formatTickLabel(value)
          });
        }
      });
    }

    return ticks.sort((a, b) => a.value - b.value);
  }

  /**
   * 格式化刻度标签
   */
  private formatTickLabel(value: number): string {
    if (Math.abs(value) < 1e-10) {
      return '0';
    }
    
    if (Math.abs(value) >= 1000 || (Math.abs(value) < 0.01 && Math.abs(value) > 0)) {
      return value.toExponential(1);
    }
    
    return parseFloat(value.toFixed(2)).toString();
  }

  /**
   * 检查点是否在坐标范围内
   */
  isPointInRange(x: number, y: number): boolean {
    const { x: [xmin, xmax], y: [ymin, ymax] } = this.range;
    return x >= xmin && x <= xmax && y >= ymin && y <= ymax;
  }

  /**
   * 获取坐标范围
   */
  getRange(): CoordinateRange {
    return { ...this.range };
  }

  /**
   * 设置坐标范围
   */
  setRange(range: CoordinateRange): void {
    this.range = { ...range };
  }

  /**
   * 获取坐标系类型
   */
  getType(): string {
    return this.type;
  }

  /**
   * 设置坐标系类型
   */
  setType(type: 'cartesian' | 'polar' | 'logarithmic'): void {
    this.type = type;
  }

  /**
   * 获取屏幕尺寸
   */
  getScreenDimensions(): { width: number; height: number } {
    return { ...this.screenDimensions };
  }

  /**
   * 设置屏幕尺寸
   */
  setScreenDimensions(dimensions: { width: number; height: number }): void {
    this.screenDimensions = { ...dimensions };
  }
}
