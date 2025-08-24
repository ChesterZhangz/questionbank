/**
 * TikZ 样式解析工具类
 * 统一处理颜色、线宽、透明度等样式属性的解析
 */

export interface DrawOptions {
  hasArrow?: boolean;
  color?: string;
  lineWidth?: number;
  fill?: string;
  strokeDasharray?: string;
  opacity?: number;
  stroke?: string;
  strokeWidth?: number;
}

export class TikZStyleParser {
  /**
   * 检测是否为暗色模式
   */
  private static isDarkMode(): boolean {
    if (typeof document !== 'undefined') {
      return document.documentElement.classList.contains('dark');
    }
    return false;
  }

  /**
   * 根据暗色/浅色模式返回适配的颜色
   */
  private static getAdaptiveColor(lightColor: string, darkColor: string): string {
    return this.isDarkMode() ? darkColor : lightColor;
  }

  /**
   * 解析颜色选项
   */
  static parseColor(options: string): string | null {
    // 匹配颜色名称并转换为适配暗色模式的hex值
    const colorMatch = options.match(/\b(red|blue|green|yellow|orange|purple|pink|brown|gray|grey|black|white)\b/);
    if (colorMatch) {
      const colorName = colorMatch[1];
      // 根据颜色名称返回适配暗色模式的hex值
      switch (colorName) {
        case 'red': return this.getAdaptiveColor('#ff0000', '#ff6666');
        case 'blue': return this.getAdaptiveColor('#0000ff', '#6666ff');
        case 'green': return this.getAdaptiveColor('#00ff00', '#66ff66');
        case 'yellow': return this.getAdaptiveColor('#ffff00', '#ffff66');
        case 'orange': return this.getAdaptiveColor('#ffa500', '#ffcc66');
        case 'purple': return this.getAdaptiveColor('#800080', '#cc66cc');
        case 'pink': return this.getAdaptiveColor('#ffc0cb', '#ffccdd');
        case 'brown': return this.getAdaptiveColor('#8b4513', '#cc9966');
        case 'gray':
        case 'grey': return this.getAdaptiveColor('#808080', '#cccccc');
        case 'black': return this.getAdaptiveColor('#000000', '#ffffff');
        case 'white': return this.getAdaptiveColor('#ffffff', '#000000');
        default: return this.getAdaptiveColor('#000000', '#ffffff');
      }
    }
    
    // 匹配 RGB 颜色（保持原样，用户自定义颜色）
    const rgbMatch = options.match(/rgb\(([^)]+)\)/);
    if (rgbMatch) {
      return `rgb(${rgbMatch[1]})`;
    }
    
    // 匹配 hex 颜色（保持原样，用户自定义颜色）
    const hexMatch = options.match(/#[0-9a-fA-F]{6}/);
    if (hexMatch) {
      return hexMatch[0];
    }
    
    return null;
  }

  /**
   * 解析线宽选项
   */
  static parseLineWidth(options: string): number | null {
    if (options.includes('ultra thick')) return 4;
    if (options.includes('very thick')) return 3;
    if (options.includes('thick')) return 2;
    if (options.includes('thin')) return 0.5;
    if (options.includes('very thin')) return 0.2;
    
    // 匹配具体数值
    const widthMatch = options.match(/line width=([0-9.]+)/);
    if (widthMatch) {
      return parseFloat(widthMatch[1]);
    }
    
    return null;
  }

  /**
   * 解析填充选项
   */
  static parseFill(options: string): string | null {
    const fillMatch = options.match(/fill=([^,\]]+)/);
    if (fillMatch) {
      return fillMatch[1].trim();
    }
    
    if (options.includes('fill')) {
      return '#cccccc'; // 默认填充颜色
    }
    
    return null;
  }

  /**
   * 解析线型样式
   */
  static parseStrokeDasharray(options: string): string | null {
    if (options.includes('loosely dashed')) return '10,5';
    if (options.includes('densely dashed')) return '3,3';
    if (options.includes('dashed')) return '5,5';
    if (options.includes('loosely dotted')) return '5,2';
    if (options.includes('densely dotted')) return '1,1';
    if (options.includes('dotted')) return '2,2';
    
    return null;
  }

  /**
   * 解析透明度
   */
  static parseOpacity(options: string): number | null {
    // 解析数值透明度
    if (options.includes('opacity=')) {
      const opacityMatch = options.match(/opacity=([0-9.]+)/);
      if (opacityMatch) {
        return parseFloat(opacityMatch[1]);
      }
    }
    
    // 预设透明度级别
    if (options.includes('ultra nearly transparent')) return 0.02;
    if (options.includes('very nearly transparent')) return 0.05;
    if (options.includes('nearly transparent')) return 0.1;
    if (options.includes('semitransparent')) return 0.5;
    if (options.includes('nearly opaque')) return 0.9;
    if (options.includes('very nearly opaque')) return 0.95;
    if (options.includes('ultra nearly opaque')) return 0.98;
    
    return null;
  }

  /**
   * 解析箭头选项
   */
  static parseArrow(options: string): boolean {
    return options.includes('->') || options.includes('<-') || options.includes('<->');
  }

  /**
   * 解析绘图选项 - 统一入口
   */
  static parseDrawOptions(optionsString: string): DrawOptions {
    const options: DrawOptions = {};
    
    // 解析各种样式属性
    const color = this.parseColor(optionsString);
    if (color) {
      options.color = color;
      options.stroke = color;
    } else {
      options.color = this.getAdaptiveColor('#000000', '#ffffff');
      options.stroke = this.getAdaptiveColor('#000000', '#ffffff');
    }
    
    const lineWidth = this.parseLineWidth(optionsString);
    if (lineWidth !== null) {
      options.lineWidth = lineWidth;
      options.strokeWidth = lineWidth;
    } else {
      options.lineWidth = 1.5;
      options.strokeWidth = 1.5;
    }
    
    const fill = this.parseFill(optionsString);
    if (fill) {
      options.fill = fill;
    }
    
    const strokeDasharray = this.parseStrokeDasharray(optionsString);
    if (strokeDasharray) {
      options.strokeDasharray = strokeDasharray;
    }
    
    const opacity = this.parseOpacity(optionsString);
    if (opacity !== null) {
      options.opacity = opacity;
    }
    
    const hasArrow = this.parseArrow(optionsString);
    if (hasArrow) {
      options.hasArrow = true;
    }
    
    return options;
  }

  /**
   * 获取适合当前模式的文本颜色
   */
  static getTextColor(): string {
    return this.getAdaptiveColor('#000000', '#e5e7eb');
  }

  /**
   * 获取颜色值映射（用于简单颜色名称转换）
   */
  static getColorValue(colorName: string): string {
    const colorMap: { [key: string]: string } = {
      'gray': '#808080',
      'grey': '#808080',
      'black': '#000000',
      'blue': '#0000ff',
      'red': '#ff0000',
      'green': '#008000',
      'yellow': '#ffff00',
      'orange': '#ffa500',
      'purple': '#800080',
      'pink': '#ffc0cb',
      'brown': '#8b4513',
      'white': '#ffffff'
    };
    return colorMap[colorName] || '#808080';
  }

  /**
   * 根据颜色值获取颜色名称（用于箭头标记ID）
   */
  static getColorName(colorValue: string): string | null {
    const colorMap: { [key: string]: string } = {
      '#ff0000': 'red',
      '#0000ff': 'blue',
      '#00ff00': 'green',
      '#ffff00': 'yellow',
      '#ffa500': 'orange',
      '#800080': 'purple',
      '#ffc0cb': 'pink',
      '#8b4513': 'brown',
      '#808080': 'gray',
      '#000000': 'black',
      '#ffffff': 'white'
    };
    
    return colorMap[colorValue.toLowerCase()] || null;
  }
}
