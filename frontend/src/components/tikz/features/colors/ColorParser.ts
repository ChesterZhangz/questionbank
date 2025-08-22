// TikZ 颜色解析器
import { getColorValue } from '../../../../config/tikz/colorSchemes';

export interface ParsedColor {
  value: string;
  opacity?: number;
  isValid: boolean;
  type: 'named' | 'hex' | 'rgb' | 'rgba' | 'cmyk' | 'gray';
}

export class ColorParser {
  /**
   * 解析颜色字符串
   * @param colorString 颜色字符串
   * @returns 解析后的颜色对象
   */
  static parse(colorString: string): ParsedColor {
    if (!colorString || typeof colorString !== 'string') {
      return { value: 'black', isValid: false, type: 'named' };
    }

    const trimmed = colorString.trim().toLowerCase();

    // 检查预定义颜色名称
    if (getColorValue(trimmed)) {
      return {
        value: getColorValue(trimmed)!,
        isValid: true,
        type: 'named'
      };
    }

    // 解析HEX颜色
    if (trimmed.startsWith('#')) {
      return this.parseHexColor(trimmed);
    }

    // 解析RGB颜色
    if (trimmed.startsWith('rgb(') && trimmed.endsWith(')')) {
      return this.parseRGBColor(trimmed);
    }

    // 解析RGBA颜色
    if (trimmed.startsWith('rgba(') && trimmed.endsWith(')')) {
      return this.parseRGBAColor(trimmed);
    }

    // 解析CMYK颜色
    if (trimmed.startsWith('cmyk(') && trimmed.endsWith(')')) {
      return this.parseCMYKColor(trimmed);
    }

    // 解析灰度颜色
    if (trimmed.startsWith('gray(') && trimmed.endsWith(')')) {
      return this.parseGrayColor(trimmed);
    }

    // 尝试作为预定义颜色名称处理
    const predefinedColor = getColorValue(trimmed);
    if (predefinedColor) {
      return {
        value: predefinedColor,
        isValid: true,
        type: 'named'
      };
    }

    return { value: 'black', isValid: false, type: 'named' };
  }

  /**
   * 解析HEX颜色
   */
  private static parseHexColor(hex: string): ParsedColor {
    // 支持 #RGB, #RGBA, #RRGGBB, #RRGGBBAA 格式
    const hexRegex = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{4}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/;
    
    if (!hexRegex.test(hex)) {
      return { value: 'black', isValid: false, type: 'hex' };
    }

    let r = 0, g = 0, b = 0, a = 1;

    if (hex.length === 4) {
      // #RGB
      r = parseInt(hex[1] + hex[1], 16);
      g = parseInt(hex[2] + hex[2], 16);
      b = parseInt(hex[3] + hex[3], 16);
    } else if (hex.length === 5) {
      // #RGBA
      r = parseInt(hex[1] + hex[1], 16);
      g = parseInt(hex[2] + hex[2], 16);
      b = parseInt(hex[3] + hex[3], 16);
      a = parseInt(hex[4] + hex[4], 16) / 255;
    } else if (hex.length === 7) {
      // #RRGGBB
      r = parseInt(hex.slice(1, 3), 16);
      g = parseInt(hex.slice(3, 5), 16);
      b = parseInt(hex.slice(5, 7), 16);
    } else if (hex.length === 9) {
      // #RRGGBBAA
      r = parseInt(hex.slice(1, 3), 16);
      g = parseInt(hex.slice(3, 5), 16);
      b = parseInt(hex.slice(5, 7), 16);
      a = parseInt(hex.slice(7, 9), 16) / 255;
    }

    if (a === 1) {
      return {
        value: `rgb(${r}, ${g}, ${b})`,
        isValid: true,
        type: 'hex'
      };
    } else {
      return {
        value: `rgba(${r}, ${g}, ${b}, ${a})`,
        opacity: a,
        isValid: true,
        type: 'hex'
      };
    }
  }

  /**
   * 解析RGB颜色
   */
  private static parseRGBColor(rgb: string): ParsedColor {
    const rgbRegex = /^rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/;
    const match = rgb.match(rgbRegex);
    
    if (!match) {
      return { value: 'black', isValid: false, type: 'rgb' };
    }

    const r = parseInt(match[1]);
    const g = parseInt(match[2]);
    const b = parseInt(match[3]);

    if (r < 0 || r > 255 || g < 0 || g > 255 || b < 0 || b > 255) {
      return { value: 'black', isValid: false, type: 'rgb' };
    }

    return {
      value: `rgb(${r}, ${g}, ${b})`,
      isValid: true,
      type: 'rgb'
    };
  }

  /**
   * 解析RGBA颜色
   */
  private static parseRGBAColor(rgba: string): ParsedColor {
    const rgbaRegex = /^rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*([0-1]?\.?\d*)\s*\)$/;
    const match = rgba.match(rgbaRegex);
    
    if (!match) {
      return { value: 'black', isValid: false, type: 'rgba' };
    }

    const r = parseInt(match[1]);
    const g = parseInt(match[2]);
    const b = parseInt(match[3]);
    const a = parseFloat(match[4]);

    if (r < 0 || r > 255 || g < 0 || g > 255 || b < 0 || b > 255 || a < 0 || a > 1) {
      return { value: 'black', isValid: false, type: 'rgba' };
    }

    return {
      value: `rgba(${r}, ${g}, ${b}, ${a})`,
      opacity: a,
      isValid: true,
      type: 'rgba'
    };
  }

  /**
   * 解析CMYK颜色
   */
  private static parseCMYKColor(cmyk: string): ParsedColor {
    const cmykRegex = /^cmyk\(\s*([0-1]?\.?\d*)\s*,\s*([0-1]?\.?\d*)\s*,\s*([0-1]?\.?\d*)\s*,\s*([0-1]?\.?\d*)\s*\)$/;
    const match = cmyk.match(cmykRegex);
    
    if (!match) {
      return { value: 'black', isValid: false, type: 'cmyk' };
    }

    const c = parseFloat(match[1]);
    const m = parseFloat(match[2]);
    const y = parseFloat(match[3]);
    const k = parseFloat(match[4]);

    if (c < 0 || c > 1 || m < 0 || m > 1 || y < 0 || y > 1 || k < 0 || k > 1) {
      return { value: 'black', isValid: false, type: 'cmyk' };
    }

    // 将CMYK转换为RGB
    const r = Math.round(255 * (1 - c) * (1 - k));
    const g = Math.round(255 * (1 - m) * (1 - k));
    const b = Math.round(255 * (1 - y) * (1 - k));

    return {
      value: `rgb(${r}, ${g}, ${b})`,
      isValid: true,
      type: 'cmyk'
    };
  }

  /**
   * 解析灰度颜色
   */
  private static parseGrayColor(gray: string): ParsedColor {
    const grayRegex = /^gray\(\s*([0-1]?\.?\d*)\s*\)$/;
    const match = gray.match(grayRegex);
    
    if (!match) {
      return { value: 'black', isValid: false, type: 'gray' };
    }

    const grayValue = parseFloat(match[1]);

    if (grayValue < 0 || grayValue > 1) {
      return { value: 'black', isValid: false, type: 'gray' };
    }

    const rgbValue = Math.round(255 * grayValue);

    return {
      value: `rgb(${rgbValue}, ${rgbValue}, ${rgbValue})`,
      isValid: true,
      type: 'gray'
    };
  }

  /**
   * 混合两种颜色
   */
  static mix(color1: string, color2: string, weight: number = 0.5): string {
    const parsed1 = this.parse(color1);
    const parsed2 = this.parse(color2);

    if (!parsed1.isValid || !parsed2.isValid) {
      return 'black';
    }

    // 提取RGB值
    const rgb1 = this.extractRGB(parsed1.value);
    const rgb2 = this.extractRGB(parsed2.value);

    if (!rgb1 || !rgb2) {
      return 'black';
    }

    // 混合颜色
    const r = Math.round(rgb1.r * (1 - weight) + rgb2.r * weight);
    const g = Math.round(rgb1.g * (1 - weight) + rgb2.g * weight);
    const b = Math.round(rgb1.b * (1 - weight) + rgb2.b * weight);

    return `rgb(${r}, ${g}, ${b})`;
  }

  /**
   * 调整颜色亮度
   */
  static lighten(color: string, amount: number): string {
    const parsed = this.parse(color);
    if (!parsed.isValid) return 'black';

    const rgb = this.extractRGB(parsed.value);
    if (!rgb) return 'black';

    const factor = 1 + amount;
    const r = Math.min(255, Math.round(rgb.r * factor));
    const g = Math.min(255, Math.round(rgb.g * factor));
    const b = Math.min(255, Math.round(rgb.b * factor));

    return `rgb(${r}, ${g}, ${b})`;
  }

  /**
   * 调整颜色暗度
   */
  static darken(color: string, amount: number): string {
    const parsed = this.parse(color);
    if (!parsed.isValid) return 'black';

    const rgb = this.extractRGB(parsed.value);
    if (!rgb) return 'black';

    const factor = 1 - amount;
    const r = Math.max(0, Math.round(rgb.r * factor));
    const g = Math.max(0, Math.round(rgb.g * factor));
    const b = Math.max(0, Math.round(rgb.b * factor));

    return `rgb(${r}, ${g}, ${b})`;
  }

  /**
   * 从颜色字符串中提取RGB值
   */
  private static extractRGB(colorString: string): { r: number; g: number; b: number } | null {
    // 处理rgb()格式
    const rgbMatch = colorString.match(/rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/);
    if (rgbMatch) {
      return {
        r: parseInt(rgbMatch[1]),
        g: parseInt(rgbMatch[2]),
        b: parseInt(rgbMatch[3])
      };
    }

    // 处理rgba()格式
    const rgbaMatch = colorString.match(/rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*([0-1]?\.?\d*)\s*\)/);
    if (rgbaMatch) {
      return {
        r: parseInt(rgbaMatch[1]),
        g: parseInt(rgbaMatch[2]),
        b: parseInt(rgbaMatch[3])
      };
    }

    // 处理HEX格式
    const hexMatch = colorString.match(/^#([0-9A-Fa-f]{6})$/);
    if (hexMatch) {
      const hex = hexMatch[1];
      return {
        r: parseInt(hex.slice(0, 2), 16),
        g: parseInt(hex.slice(2, 4), 16),
        b: parseInt(hex.slice(4, 6), 16)
      };
    }

    // 处理3位HEX格式
    const hex3Match = colorString.match(/^#([0-9A-Fa-f]{3})$/);
    if (hex3Match) {
      const hex = hex3Match[1];
      return {
        r: parseInt(hex[0] + hex[0], 16),
        g: parseInt(hex[1] + hex[1], 16),
        b: parseInt(hex[2] + hex[2], 16)
      };
    }

    return null;
  }

  /**
   * 检查颜色是否为亮色
   */
  static isLight(color: string): boolean {
    const parsed = this.parse(color);
    if (!parsed.isValid) return false;

    const rgb = this.extractRGB(parsed.value);
    if (!rgb) return false;

    // 计算亮度
    const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
    return brightness > 128;
  }

  /**
   * 获取对比色（黑或白）
   */
  static getContrastColor(color: string): string {
    return this.isLight(color) ? 'black' : 'white';
  }
}
