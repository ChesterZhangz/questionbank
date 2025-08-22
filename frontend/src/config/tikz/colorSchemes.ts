// TikZ 颜色方案配置
export interface ColorScheme {
  name: string;
  colors: Record<string, string>;
  description: string;
}

// 预定义颜色库
export const colorSchemes: ColorScheme[] = [
  {
    name: 'basic',
    description: '基础颜色',
    colors: {
      'black': '#000000',
      'white': '#FFFFFF',
      'red': '#FF0000',
      'green': '#00FF00',
      'blue': '#0000FF',
      'yellow': '#FFFF00',
      'cyan': '#00FFFF',
      'magenta': '#FF00FF',
      'gray': '#808080',
      'orange': '#FFA500',
      'purple': '#800080',
      'brown': '#A52A2A',
      'pink': '#FFC0CB'
    }
  },
  {
    name: 'xcolor',
    description: 'xcolor包扩展颜色',
    colors: {
      'navy': '#000080',
      'olive': '#808000',
      'teal': '#008080',
      'maroon': '#800000',
      'lime': '#00FF00',
      'aqua': '#00FFFF',
      'fuchsia': '#FF00FF',
      'silver': '#C0C0C0'
    }
  }
];

// 获取颜色值
export function getColorValue(colorName: string): string | null {
  for (const scheme of colorSchemes) {
    if (scheme.colors[colorName.toLowerCase()]) {
      return scheme.colors[colorName.toLowerCase()];
    }
  }
  return null;
}

// 检查颜色是否有效
export function isValidColor(color: string): boolean {
  // 检查是否为有效的颜色名称
  if (getColorValue(color)) return true;
  
  // 检查是否为有效的HEX颜色
  if (/^#[0-9A-F]{6}$/i.test(color)) return true;
  
  // 检查是否为有效的RGB颜色
  if (/^rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$/i.test(color)) return true;
  
  // 检查是否为有效的RGBA颜色
  if (/^rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*[0-1]?\.?\d*\s*\)$/i.test(color)) return true;
  
  return false;
}
