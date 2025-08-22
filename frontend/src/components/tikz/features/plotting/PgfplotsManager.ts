// PGFPlots绘图管理器
// 整合所有绘图功能，提供统一的接口

import { PgfplotsParser } from './PgfplotsParser';
import type { AxisEnvironment } from './PgfplotsParser';
import { FunctionEvaluator } from './FunctionEvaluator';
import { AxisRenderer } from './AxisRenderer';
import { PlotRenderer } from './PlotRenderer';
import { CoordinateSystem } from './CoordinateSystem';
import { DataProcessor } from './DataProcessor';
import type { DataSeries } from './DataProcessor';
import { createSVGElement, setSVGAttributes } from '../../utils/SVGUtils';

export interface PgfplotsRenderOptions {
  width?: number;
  height?: number;
  showGrid?: boolean;
  showLegend?: boolean;
  legendPosition?: 'north east' | 'north west' | 'south east' | 'south west' | 'outer north east';
  coordinateSystem?: 'cartesian' | 'polar' | 'logarithmic';
  autoRange?: boolean;
  margin?: {
    left?: number;
    right?: number;
    top?: number;
    bottom?: number;
  };
}

export class PgfplotsManager {
  private axisEnvironment: AxisEnvironment | null = null;
  private coordinateSystem: CoordinateSystem;
  private axisRenderer: AxisRenderer | null = null;
  private plotRenderer: PlotRenderer | null = null;
  private options: PgfplotsRenderOptions;

  constructor(options: PgfplotsRenderOptions = {}) {
    this.options = {
      width: 400,
      height: 300,
      showGrid: true,
      showLegend: true,
      legendPosition: 'north east',
      coordinateSystem: 'cartesian',
      autoRange: true,
      margin: {
        left: 60,
        right: 20,
        top: 40,
        bottom: 60
      },
      ...options
    };

    this.coordinateSystem = new CoordinateSystem(
      this.options.coordinateSystem,
      { x: [-5, 5], y: [-5, 5] },
      { width: this.options.width!, height: this.options.height! },
      {
        left: this.options.margin?.left || 60,
        right: this.options.margin?.right || 20,
        top: this.options.margin?.top || 40,
        bottom: this.options.margin?.bottom || 60
      }
    );

    // 初始化渲染器
    this.axisRenderer = new AxisRenderer({}, this.options.width!, this.options.height!);
    
    // 创建坐标变换适配器
    const transform = this.coordinateSystem.getTransform();
    const axisScale = {
      xScale: (x: number) => transform.toScreen(x, 0).x,
      yScale: (y: number) => transform.toScreen(0, y).y,
      xInverse: (pixel: number) => transform.fromScreen(pixel, 0).x,
      yInverse: (pixel: number) => transform.fromScreen(0, pixel).y
    };
    this.plotRenderer = new PlotRenderer(axisScale);
  }

  /**
   * 解析pgfplots代码
   */
  parseCode(code: string): boolean {
    try {
      if (PgfplotsParser.isPgfplotsCode(code)) {
        const environments = PgfplotsParser.extractAxisEnvironments(code);
        if (environments.length > 0) {
          this.axisEnvironment = PgfplotsParser.parseAxis(environments[0]);
          return true;
        }
      }
      return false;
    } catch (error) {
      return false;
    }
  }

  /**
   * 渲染完整的图表
   */
  render(): SVGSVGElement | null {
    if (!this.axisEnvironment) {
      return null;
    }

    try {
      const svg = createSVGElement('svg') as SVGSVGElement;
      const { width = 400, height = 300 } = this.options;
      
      setSVGAttributes(svg, {
        width,
        height,
        viewBox: `0 0 ${width} ${height}`
      });
      
      // 单独设置xmlns属性
      svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');

      // 创建主组
      const mainGroup = createSVGElement('g') as SVGGElement;
      setSVGAttributes(mainGroup, { 'class': 'pgfplots-chart' });

      // 更新坐标系统
      this.updateCoordinateSystem();

      // 渲染坐标轴
      if (this.axisRenderer) {
        const axisGroup = this.axisRenderer.renderAxis();
        mainGroup.appendChild(axisGroup);
      }

      // 渲染绘图
      if (this.plotRenderer) {
        const plotsGroup = this.renderPlots();
        mainGroup.appendChild(plotsGroup);
      }

      // 图例渲染已移除

      svg.appendChild(mainGroup);
      return svg;
    } catch (error) {
      return null;
    }
  }

  /**
   * 更新坐标系统
   */
  private updateCoordinateSystem(): void {
    if (!this.axisEnvironment) return;

    const { options } = this.axisEnvironment;
    const { width = 400, height = 300 } = this.options;

    // 更新坐标范围
    if (this.options.autoRange) {
      this.updateAutoRange();
    }

    // 更新坐标系统
    this.coordinateSystem.setScreenDimensions({ width, height });
    
    const xRange: [number, number] = [options.xmin || -5, options.xmax || 5];
    const yRange: [number, number] = [options.ymin || -5, options.ymax || 5];
    
    this.coordinateSystem.setRange({
      x: xRange,
      y: yRange
    });

    // 更新渲染器
    this.axisRenderer = new AxisRenderer(options, width, height);
    
    // 更新坐标变换适配器
    const transform = this.coordinateSystem.getTransform();
    
    // 修复：正确的坐标缩放函数
    const axisScale = {
      xScale: (x: number) => {
        const screenPos = transform.toScreen(x, 0);
        return screenPos.x;
      },
      yScale: (y: number) => {
        const screenPos = transform.toScreen(0, y);
        return screenPos.y;
      },
      xInverse: (pixel: number) => transform.fromScreen(pixel, 0).x,
      yInverse: (pixel: number) => transform.fromScreen(0, pixel).y
    };
    
    this.plotRenderer = new PlotRenderer(axisScale);

    // 图例渲染器已移除
  }

  /**
   * 自动计算坐标范围
   */
  private updateAutoRange(): void {
    if (!this.axisEnvironment || !this.axisEnvironment.plots.length) return;

    let xmin = Infinity, xmax = -Infinity;
    let ymin = Infinity, ymax = -Infinity;

    this.axisEnvironment.plots.forEach(plot => {
      if (plot.type === 'function') {
        // 对于函数，计算在指定域内的范围
        const domain = plot.options.domain || [-5, 5];
        const samples = plot.options.samples || 100;
        const step = (domain[1] - domain[0]) / (samples - 1);

        for (let i = 0; i < samples; i++) {
          const x = domain[0] + i * step;
          const result = FunctionEvaluator.evaluate(plot.data as string, x);
          
          if (result.isValid) {
            xmin = Math.min(xmin, x);
            xmax = Math.max(xmax, x);
            ymin = Math.min(ymin, result.value);
            ymax = Math.max(ymax, result.value);
          }
        }
      }
    });

    // 设置合理的范围
    if (xmin !== Infinity && xmax !== -Infinity) {
      const xRange = xmax - xmin;
      this.axisEnvironment.options.xmin = xmin - xRange * 0.1;
      this.axisEnvironment.options.xmax = xmax + xRange * 0.1;
    }

    if (ymin !== Infinity && ymax !== -Infinity) {
      const yRange = ymax - ymin;
      this.axisEnvironment.options.ymin = ymin - yRange * 0.1;
      this.axisEnvironment.options.ymax = ymax + yRange * 0.1;
    }
  }

  /**
   * 渲染所有绘图
   */
  private renderPlots(): SVGGElement {
    const plotsGroup = createSVGElement('g') as SVGGElement;
    setSVGAttributes(plotsGroup, { 'class': 'pgfplots-plots' });

    if (!this.axisEnvironment || !this.plotRenderer) {
      return plotsGroup;
    }

    this.axisEnvironment.plots.forEach(plot => {
      try {
        const plotGroup = this.renderSinglePlot(plot);
        if (plotGroup) {
          plotsGroup.appendChild(plotGroup);
        }
      } catch (error) {
        // 绘图渲染失败
      }
    });

    return plotsGroup;
  }

  /**
   * 渲染单个绘图
   */
  private renderSinglePlot(plot: any): SVGGElement | null {
    if (!this.plotRenderer) {
      return null;
    }

    try {
      // 转换绘图数据格式
      const plotData = this.convertPlotToData(plot);
      if (!plotData) {
        return null;
      }

      // 修复：创建绘图命令时直接使用原始函数表达式
      const plotCommand = {
        type: 'function' as const,
        data: plot.data,  // 直接使用原始函数表达式字符串，不是处理后的数据点
        options: {
          color: plot.options.color || '#0066cc',
          line_width: plot.options.line_width || 1.5,
          mark: plot.options.mark || 'none',
          mark_size: plot.options.mark_size || 3,
          style: plot.options.style || 'solid',
          smooth: plot.options.smooth || false,
          only_marks: plot.options.only_marks || false,
          no_marks: plot.options.no_marks || false,
          // 添加domain和samples到options中
          domain: plot.options.domain || [-5, 5],
          samples: plot.options.samples || 100
        }
      };

      return this.plotRenderer.renderPlot(plotCommand);
    } catch (error) {
      console.error('转换绘图数据失败:', error);
      return null;
    }
  }

  /**
   * 转换绘图数据
   */
  private convertPlotToData(plot: any): DataSeries | null {
    try {
      if (plot.type === 'function') {
        // 修复：plot.data 应该是函数表达式字符串，不是数据点数组
        let functionExpression: string;
        if (typeof plot.data === 'string') {
          functionExpression = plot.data;
        } else if (Array.isArray(plot.data) && plot.data.length > 0) {
        const firstItem = plot.data[0];
        if (typeof firstItem === 'string') {
          functionExpression = firstItem;
        } else if (typeof firstItem === 'object' && firstItem !== null) {
          // 如果是对象，可能需要从其他地方获取表达式
          functionExpression = 'x'; // 默认值
        } else {
          functionExpression = 'x'; // 默认值
        }
        } else {
          functionExpression = 'x'; // 默认值
        }
        
        const domain = plot.options.domain || [-5, 5];
        const samples = plot.options.samples || 100;
        
        return DataProcessor.generateFunctionData(
          functionExpression,
          domain,
          samples
        );
      }
      return null;
    } catch (error) {
      console.error('转换绘图数据失败:', error);
      return null;
    }
  }

  // 图例相关方法已移除

  /**
   * 设置选项
   */
  setOptions(options: Partial<PgfplotsRenderOptions>): void {
    this.options = { ...this.options, ...options };
  }

  /**
   * 获取选项
   */
  getOptions(): PgfplotsRenderOptions {
    return { ...this.options };
  }

  /**
   * 获取坐标系统
   */
  getCoordinateSystem(): CoordinateSystem {
    return this.coordinateSystem;
  }

  /**
   * 获取轴环境
   */
  getAxisEnvironment(): AxisEnvironment | null {
    return this.axisEnvironment;
  }

  /**
   * 清除数据
   */
  clear(): void {
    this.axisEnvironment = null;
    this.axisRenderer = null;
    this.plotRenderer = null;
  }
}
