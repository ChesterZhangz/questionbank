// PGFPlots语法解析器
// 模拟LaTeX中的pgfplots包功能

export interface AxisOptions {
  title?: string;
  xlabel?: string;
  ylabel?: string;
  xmin?: number;
  xmax?: number;
  ymin?: number;
  ymax?: number;
  width?: number;
  height?: number;
  grid?: 'major' | 'minor' | 'both' | 'none';
  axis_lines?: 'left' | 'center' | 'right' | 'box' | 'none';
  axis_equal?: boolean;
  legend_pos?: 'north east' | 'north west' | 'south east' | 'south west' | 'outer north east';
  domain?: [number, number];
  samples?: number;
  // 新增选项
  showGrid?: boolean;
  showTicks?: boolean;
  showArrows?: boolean;
}

export interface PlotOptions {
  color?: string;
  line_width?: number;
  mark?: 'o' | '*' | 'x' | '+' | 'square' | 'triangle' | 'none';
  mark_size?: number;
  style?: 'solid' | 'dashed' | 'dotted' | 'dashdotted';
  opacity?: number;
  smooth?: boolean;
  only_marks?: boolean;
  no_marks?: boolean;
  domain?: [number, number];
  samples?: number;
  legend?: string;
}

export interface PlotCommand {
  type: 'function' | 'coordinates' | 'table' | 'expression';
  data: string | Array<{x: number, y: number}>;
  options: PlotOptions;
  legend?: string;
}

export interface AxisEnvironment {
  options: AxisOptions;
  plots: PlotCommand[];
}

export class PgfplotsParser {
  /**
   * 解析pgfplots轴环境
   */
  static parseAxis(content: string): AxisEnvironment {
    const result: AxisEnvironment = {
      options: {},
      plots: []
    };

    // 解析\begin{axis}[options]
    const axisMatch = content.match(/\\begin\{axis\}\s*(?:\[([^\]]*)\])?/);
    if (axisMatch && axisMatch[1]) {
      result.options = this.parseAxisOptions(axisMatch[1]);
    }

    // 解析\addplot命令
    
    const plotMatches = content.matchAll(/\\addplot\s*(?:\[([^\]]*)\])?\s*\{([^}]+)\}/g);
    for (const match of plotMatches) {
      const options = match[1] ? this.parsePlotOptions(match[1]) : {};
      const expression = match[2];
      
      
      if (expression) {
        const plotData: PlotCommand = {
          type: 'function',
          data: expression.trim(),
          options,
          legend: options.legend
        };
        result.plots.push(plotData);
        
      }
    }

    // 解析\addlegendentry
    const legendMatches = content.matchAll(/\\addlegendentry\s*\{([^}]+)\}/g);
    const legends = Array.from(legendMatches).map(match => match[1]);
    
    // 将图例分配给对应的plots
    legends.forEach((legend, index) => {
      if (result.plots[index]) {
        result.plots[index].legend = legend;
      }
    });
    
    => ({
      index: i,
      legend: p.legend,
      type: p.type
    })));

    return result;
  }

  /**
   * 解析轴选项
   */
  private static parseAxisOptions(optionsString: string): AxisOptions {
    const options: AxisOptions = {};
    
    // 解析键值对
    const pairs = this.parseKeyValuePairs(optionsString);
    
    for (const [key, value] of pairs) {
      switch (key) {
        case 'title':
          options.title = this.cleanString(value);
          break;
        case 'xlabel':
          options.xlabel = this.cleanString(value);
          break;
        case 'ylabel':
          options.ylabel = this.cleanString(value);
          break;
        case 'xmin':
          options.xmin = parseFloat(value);
          break;
        case 'xmax':
          options.xmax = parseFloat(value);
          break;
        case 'ymin':
          options.ymin = parseFloat(value);
          break;
        case 'ymax':
          options.ymax = parseFloat(value);
          break;
        case 'width':
          options.width = this.parseLength(value);
          break;
        case 'height':
          options.height = this.parseLength(value);
          break;
        case 'grid':
          options.grid = value as any;
          break;
        case 'axis lines':
          options.axis_lines = value.replace(/\s+/g, '_') as any;
          break;
        case 'axis equal':
          options.axis_equal = value === 'true' || value === '';
          break;
        case 'legend pos':
          options.legend_pos = value.replace(/\s+/g, '_') as any;
          break;
        case 'domain':
          const domainMatch = value.match(/(-?\d+\.?\d*):(-?\d+\.?\d*)/);
          if (domainMatch) {
            options.domain = [parseFloat(domainMatch[1]), parseFloat(domainMatch[2])];
          }
          break;
        case 'samples':
          options.samples = parseInt(value);
          break;
      }
    }

    return options;
  }

  /**
   * 解析绘图选项
   */
  private static parsePlotOptions(optionsString: string): PlotOptions {
    const options: PlotOptions = {};
    
    const pairs = this.parseKeyValuePairs(optionsString);
    
    for (const [key, value] of pairs) {
      switch (key) {
        case 'color':
          options.color = value;
          break;
        case 'line width':
          options.line_width = parseFloat(value);
          break;
        case 'mark':
          options.mark = value as any;
          break;
        case 'mark size':
          options.mark_size = parseFloat(value);
          break;
        case 'style':
          options.style = value as any;
          break;
        case 'opacity':
          options.opacity = parseFloat(value);
          break;
        case 'smooth':
          options.smooth = value === 'true' || value === '';
          break;
        case 'only marks':
          options.only_marks = value === 'true' || value === '';
          break;
        case 'no marks':
          options.no_marks = value === 'true' || value === '';
          break;
        case 'domain':
          const domainMatch = value.match(/(-?\d+\.?\d*):(-?\d+\.?\d*)/);
          if (domainMatch) {
            options.domain = [parseFloat(domainMatch[1]), parseFloat(domainMatch[2])];
          }
          break;
        case 'samples':
          options.samples = parseInt(value);
          break;
      }
    }

    return options;
  }

  /**
   * 解析键值对
   */
  private static parseKeyValuePairs(str: string): Array<[string, string]> {
    const pairs: Array<[string, string]> = [];
    const regex = /([^=,]+)(?:=([^,]*))?/g;
    let match;

    while ((match = regex.exec(str)) !== null) {
      const key = match[1].trim();
      const value = match[2] ? match[2].trim() : '';
      pairs.push([key, value]);
    }

    return pairs;
  }

  /**
   * 清理字符串（移除引号等）
   */
  private static cleanString(str: string): string {
    return str.replace(/^["']|["']$/g, '').trim();
  }

  /**
   * 解析长度单位
   */
  private static parseLength(lengthStr: string): number {
    const match = lengthStr.match(/(\d+\.?\d*)(cm|pt|mm|in)?/);
    if (!match) return 300; // 默认值

    const value = parseFloat(match[1]);
    const unit = match[2] || 'pt';

    // 转换为像素
    switch (unit) {
      case 'cm': return value * 37.8; // 1cm = 37.8px
      case 'mm': return value * 3.78; // 1mm = 3.78px
      case 'in': return value * 96;   // 1in = 96px
      case 'pt': return value * 1.33; // 1pt = 1.33px
      default: return value;
    }
  }

  /**
   * 检查是否为pgfplots代码
   */
  static isPgfplotsCode(code: string): boolean {
    // 更严格的检查：必须包含axis环境
    const hasAxisEnvironment = /\\begin\{axis\}/.test(code);
    const hasAddplot = /\\addplot/.test(code);
    
    // 同时检查是否包含tikzpicture环境（传统TikZ）
    const hasTikzpicture = /\\begin\{tikzpicture\}/.test(code);
    
    // 如果是pgfplots，不应该包含tikzpicture环境
    if (hasAxisEnvironment && hasAddplot && !hasTikzpicture) {
      return true;
    }
    
    // 如果只包含addplot但没有axis环境，可能是混合代码
    if (hasAddplot && !hasAxisEnvironment) {
      return false; // 让传统TikZ解析器处理
    }
    
    return false;
  }

  /**
   * 提取pgfplots环境
   */
  static extractAxisEnvironments(code: string): string[] {
    const environments: string[] = [];
    const regex = /\\begin\{axis\}[\s\S]*?\\end\{axis\}/g;
    let match;

    while ((match = regex.exec(code)) !== null) {
      environments.push(match[0]);
    }

    return environments;
  }
}

// 导出类型
// export type { AxisOptions, PlotOptions, PlotCommand, AxisEnvironment };
