// 坐标轴渲染器
// 生成pgfplots风格的坐标轴系统

import { createSVGElement, setSVGAttributes } from '../../utils/SVGUtils';
import type { AxisOptions } from './PgfplotsParser';

export interface AxisDimensions {
  width: number;
  height: number;
  marginLeft: number;
  marginRight: number;
  marginTop: number;
  marginBottom: number;
  plotWidth: number;
  plotHeight: number;
}

export interface AxisScale {
  xScale: (value: number) => number;
  yScale: (value: number) => number;
  xInverse: (pixel: number) => number;
  yInverse: (pixel: number) => number;
}

export interface TickInfo {
  value: number;
  position: number;
  label: string;
}

export class AxisRenderer {
  private options: AxisOptions;
  private dimensions: AxisDimensions;
  private scale: AxisScale;
  // LaTeX渲染器已移除

  constructor(options: AxisOptions, containerWidth: number = 400, containerHeight: number = 300) {
    this.options = {
      xmin: -5,
      xmax: 5,
      ymin: -5,
      ymax: 5,
      grid: 'major',
      axis_lines: 'box',
      showGrid: true,
      showTicks: true,
      showArrows: true,
      ...options
    };

    this.dimensions = this.calculateDimensions(containerWidth, containerHeight);
    this.scale = this.createScale();
    // LaTeX渲染器初始化已移除
  }

  /**
   * 计算坐标轴尺寸
   */
  private calculateDimensions(containerWidth: number, containerHeight: number): AxisDimensions {
    const marginLeft = 60;
    const marginRight = 20;
    const marginTop = this.options.title ? 40 : 20;
    const marginBottom = this.options.xlabel ? 60 : 40;

    const plotWidth = containerWidth - marginLeft - marginRight;
    const plotHeight = containerHeight - marginTop - marginBottom;

    return {
      width: containerWidth,
      height: containerHeight,
      marginLeft,
      marginRight,
      marginTop,
      marginBottom,
      plotWidth,
      plotHeight
    };
  }

  /**
   * 创建比例尺函数
   */
  private createScale(): AxisScale {
    const { xmin = -5, xmax = 5, ymin = -5, ymax = 5 } = this.options;
    const { marginLeft, marginTop, plotWidth, plotHeight } = this.dimensions;

    const xScale = (value: number) => marginLeft + ((value - xmin) / (xmax - xmin)) * plotWidth;
    const yScale = (value: number) => marginTop + plotHeight - ((value - ymin) / (ymax - ymin)) * plotHeight;
    
    const xInverse = (pixel: number) => xmin + ((pixel - marginLeft) / plotWidth) * (xmax - xmin);
    const yInverse = (pixel: number) => ymin + ((marginTop + plotHeight - pixel) / plotHeight) * (ymax - ymin);

    return { xScale, yScale, xInverse, yInverse };
  }

  /**
   * 生成完整的坐标轴SVG
   */
  renderAxis(): SVGGElement {
    const group = createSVGElement('g') as SVGGElement;
    setSVGAttributes(group, { 'class': 'pgfplots-axis' });

    // 渲染网格（可选）
    if (this.options.showGrid !== false) {
      group.appendChild(this.renderGrid());
    }

    // 渲染坐标轴线（带箭头）
    group.appendChild(this.renderAxisLines());

    // 渲染刻度（可选）
    if (this.options.showTicks !== false) {
      group.appendChild(this.renderTicks());
    }

    // 渲染标签
    group.appendChild(this.renderLabels());

    return group;
  }

  /**
   * 渲染网格
   */
  private renderGrid(): SVGGElement {
    const gridGroup = createSVGElement('g') as SVGGElement;
    setSVGAttributes(gridGroup, { 'class': 'axis-grid' });

    const { xmin = -5, xmax = 5, ymin = -5, ymax = 5 } = this.options;
    const { marginLeft, marginTop, plotWidth, plotHeight } = this.dimensions;

    // X方向网格线
    const xTicks = this.calculateTicks(xmin, xmax);
    for (const tick of xTicks) {
      const x = this.scale.xScale(tick.value);
      const line = createSVGElement('line');
      setSVGAttributes(line, {
        x1: x,
        y1: marginTop,
        x2: x,
        y2: marginTop + plotHeight,
        stroke: '#e0e0e0',
        'stroke-width': 0.5,
        'stroke-opacity': 0.7
      });
      gridGroup.appendChild(line);
    }

    // Y方向网格线
    const yTicks = this.calculateTicks(ymin, ymax);
    for (const tick of yTicks) {
      const y = this.scale.yScale(tick.value);
      const line = createSVGElement('line');
      setSVGAttributes(line, {
        x1: marginLeft,
        y1: y,
        x2: marginLeft + plotWidth,
        y2: y,
        stroke: '#e0e0e0',
        'stroke-width': 0.5,
        'stroke-opacity': 0.7
      });
      gridGroup.appendChild(line);
    }

    return gridGroup;
  }

  /**
   * 渲染坐标轴线（带箭头）
   */
  private renderAxisLines(): SVGGElement {
    const axisGroup = createSVGElement('g') as SVGGElement;
    setSVGAttributes(axisGroup, { 'class': 'axis-lines' });

    const { marginLeft, marginTop, plotWidth, plotHeight } = this.dimensions;
    const { showArrows = true } = this.options;

    const lineStyle = {
      stroke: '#000000',
      'stroke-width': 1.5,
      fill: 'none'
    };

    // X轴（水平线）
    const xAxis = createSVGElement('line');
    setSVGAttributes(xAxis, {
      x1: marginLeft,
      y1: marginTop + plotHeight,
      x2: marginLeft + plotWidth + (showArrows ? 20 : 0),
      y2: marginTop + plotHeight,
      ...lineStyle
    });
    axisGroup.appendChild(xAxis);

    // Y轴（垂直线）
    const yAxis = createSVGElement('line');
    setSVGAttributes(yAxis, {
      x1: marginLeft,
      y1: marginTop - (showArrows ? 20 : 0),
      x2: marginLeft,
      y2: marginTop + plotHeight,
      ...lineStyle
    });
    axisGroup.appendChild(yAxis);

    // 添加箭头
    if (showArrows) {
      // X轴箭头
      const xArrow = this.createArrow(
        marginLeft + plotWidth + 20,
        marginTop + plotHeight,
        0,
        -1,
        15,
        8
      );
      axisGroup.appendChild(xArrow);

      // Y轴箭头
      const yArrow = this.createArrow(
        marginLeft,
        marginTop - 20,
        1,
        0,
        15,
        8
      );
      axisGroup.appendChild(yArrow);
    }

    return axisGroup;
  }

  /**
   * 创建箭头
   */
  private createArrow(x: number, y: number, dx: number, dy: number, length: number, width: number): SVGPathElement {
    const arrow = createSVGElement('path') as SVGPathElement;
    
    // 箭头路径
    const tipX = x + dx * length;
    const tipY = y + dy * length;
    const leftX = x + dx * (length - width) + dy * width;
    const leftY = y + dy * (length - width) - dx * width;
    const rightX = x + dx * (length - width) - dy * width;
    const rightY = y + dy * (length - width) + dx * width;
    
    const pathData = `M ${tipX} ${tipY} L ${leftX} ${leftY} L ${x} ${y} L ${rightX} ${rightY} Z`;
    
    setSVGAttributes(arrow, {
      d: pathData,
      fill: '#000000'
    });
    
    return arrow;
  }

  /**
   * 渲染刻度
   */
  private renderTicks(): SVGGElement {
    const tickGroup = createSVGElement('g') as SVGGElement;
    setSVGAttributes(tickGroup, { 'class': 'axis-ticks' });

    const { xmin = -5, xmax = 5, ymin = -5, ymax = 5 } = this.options;
    const { marginLeft, marginTop, plotHeight } = this.dimensions;

    const tickLength = 5;
    const tickStyle = {
      stroke: '#000000',
      'stroke-width': 1
    };

    // X轴刻度
    const xTicks = this.calculateTicks(xmin, xmax);
    for (const tick of xTicks) {
      const x = this.scale.xScale(tick.value);
      const tickLine = createSVGElement('line');
      setSVGAttributes(tickLine, {
        x1: x,
        y1: marginTop + plotHeight,
        x2: x,
        y2: marginTop + plotHeight + tickLength,
        ...tickStyle
      });
      tickGroup.appendChild(tickLine);

      // 刻度标签
      const tickLabel = createSVGElement('text');
      setSVGAttributes(tickLabel, {
        x: x,
        y: marginTop + plotHeight + tickLength + 15,
        'text-anchor': 'middle',
        'font-size': '12',
        'font-family': 'Arial, sans-serif',
        fill: '#000000'
      });
      tickLabel.textContent = tick.label;
      tickGroup.appendChild(tickLabel);
    }

    // Y轴刻度
    const yTicks = this.calculateTicks(ymin, ymax);
    for (const tick of yTicks) {
      const y = this.scale.yScale(tick.value);
      const tickLine = createSVGElement('line');
      setSVGAttributes(tickLine, {
        x1: marginLeft - tickLength,
        y1: y,
        x2: marginLeft,
        y2: y,
        ...tickStyle
      });
      tickGroup.appendChild(tickLine);

      // 刻度标签
      const tickLabel = createSVGElement('text');
      setSVGAttributes(tickLabel, {
        x: marginLeft - tickLength - 5,
        y: y + 4,
        'text-anchor': 'end',
        'font-size': '12',
        'font-family': 'Arial, sans-serif',
        fill: '#000000'
      });
      tickLabel.textContent = tick.label;
      tickGroup.appendChild(tickLabel);
    }

    return tickGroup;
  }

  /**
   * 渲染轴标签
   */
  private renderLabels(): SVGGElement {
    const labelGroup = createSVGElement('g') as SVGGElement;
    setSVGAttributes(labelGroup, { 'class': 'axis-labels' });

    // 渲染坐标轴标签
    const axisLabels = this.renderAxisLabels();
    labelGroup.appendChild(axisLabels);

    return labelGroup;
  }

  /**
   * 渲染坐标轴标签
   */
  private renderAxisLabels(): SVGGElement {
    const labelGroup = createSVGElement('g') as SVGGElement;
    setSVGAttributes(labelGroup, { 'class': 'axis-labels' });

    const { marginLeft, marginTop, plotWidth, plotHeight } = this.dimensions;

    // X轴标签
    if (this.options.xlabel) {
      const xlabel = createSVGElement('text') as SVGTextElement;
      setSVGAttributes(xlabel, {
        x: marginLeft + plotWidth / 2,
        y: marginTop + plotHeight + 45,
        'font-family': 'KaTeX_Main, "Times New Roman", serif',
        'font-size': '14px',
        'font-weight': 'bold',
        'fill': '#000000',
        'text-anchor': 'middle',
        'dominant-baseline': 'middle',
        'pointer-events': 'none'
      });
      xlabel.textContent = this.options.xlabel;
      labelGroup.appendChild(xlabel);
    }

    // Y轴标签
    if (this.options.ylabel) {
      const ylabel = createSVGElement('text') as SVGTextElement;
      setSVGAttributes(ylabel, {
        x: 15,
        y: marginTop + plotHeight / 2,
        'font-family': 'KaTeX_Main, "Times New Roman", serif',
        'font-size': '14px',
        'font-weight': 'bold',
        'fill': '#000000',
        'text-anchor': 'middle',
        'dominant-baseline': 'middle',
        'pointer-events': 'none',
        'transform': `rotate(-90, 15, ${marginTop + plotHeight / 2})`
      });
      ylabel.textContent = this.options.ylabel;
      labelGroup.appendChild(ylabel);
    }

    return labelGroup;
  }

  /**
   * 计算刻度位置和标签
   */
  private calculateTicks(min: number, max: number): TickInfo[] {
    const range = max - min;
    const targetTickCount = 6;
    
    // 计算合适的刻度间隔
    const rawStep = range / targetTickCount;
    const magnitude = Math.floor(Math.log10(rawStep));
    const normalizedStep = rawStep / Math.pow(10, magnitude);
    
    let step: number;
    if (normalizedStep <= 1) {
      step = Math.pow(10, magnitude);
    } else if (normalizedStep <= 2) {
      step = 2 * Math.pow(10, magnitude);
    } else if (normalizedStep <= 5) {
      step = 5 * Math.pow(10, magnitude);
    } else {
      step = 10 * Math.pow(10, magnitude);
    }

    // 生成刻度
    const ticks: TickInfo[] = [];
    const startTick = Math.ceil(min / step) * step;
    
    for (let value = startTick; value <= max + step * 0.001; value += step) {
      // 处理浮点数精度问题
      const roundedValue = Math.round(value / step) * step;
      
      ticks.push({
        value: roundedValue,
        position: 0, // 将在使用时计算
        label: this.formatTickLabel(roundedValue)
      });
    }

    return ticks;
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
   * 获取比例尺
   */
  getScale(): AxisScale {
    return this.scale;
  }

  /**
   * 获取绘图区域尺寸
   */
  getDimensions(): AxisDimensions {
    return this.dimensions;
  }

  /**
   * 获取轴选项
   */
  getOptions(): AxisOptions {
    return this.options;
  }
}

// 导出相关类型
// export type { AxisDimensions, AxisScale, TickInfo };
