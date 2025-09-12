// TikZ 颜色方案配置
export interface ColorScheme {
  name: string;
  colors: Record<string, string>;
  description: string;
}

// 获取翻译后的颜色方案配置
export const getColorSchemes = (t: (key: string) => string): ColorScheme[] => [
  {
    name: 'basic',
    description: t('config.tikz.colorSchemes.basic'),
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
    description: t('config.tikz.colorSchemes.primary'),
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

// 获取翻译后的颜色方案配置信息
export const getColorSchemesConfig = (t: (key: string) => string) => ({
  title: t('config.tikz.colorSchemes.title'),
  description: t('config.tikz.colorSchemes.description'),
  basic: t('config.tikz.colorSchemes.basic'),
  primary: t('config.tikz.colorSchemes.primary'),
  secondary: t('config.tikz.colorSchemes.secondary'),
  accent: t('config.tikz.colorSchemes.accent'),
  neutral: t('config.tikz.colorSchemes.neutral'),
  warm: t('config.tikz.colorSchemes.warm'),
  cool: t('config.tikz.colorSchemes.cool'),
  pastel: t('config.tikz.colorSchemes.pastel'),
  vibrant: t('config.tikz.colorSchemes.vibrant'),
  monochrome: t('config.tikz.colorSchemes.monochrome'),
  complementary: t('config.tikz.colorSchemes.complementary'),
  analogous: t('config.tikz.colorSchemes.analogous'),
  triadic: t('config.tikz.colorSchemes.triadic'),
  tetradic: t('config.tikz.colorSchemes.tetradic'),
  custom: t('config.tikz.colorSchemes.custom'),
  gradient: t('config.tikz.colorSchemes.gradient'),
  rainbow: t('config.tikz.colorSchemes.rainbow'),
  earth: t('config.tikz.colorSchemes.earth'),
  ocean: t('config.tikz.colorSchemes.ocean'),
  sunset: t('config.tikz.colorSchemes.sunset'),
  forest: t('config.tikz.colorSchemes.forest'),
  desert: t('config.tikz.colorSchemes.desert'),
  arctic: t('config.tikz.colorSchemes.arctic'),
  tropical: t('config.tikz.colorSchemes.tropical'),
  vintage: t('config.tikz.colorSchemes.vintage'),
  modern: t('config.tikz.colorSchemes.modern'),
  neon: t('config.tikz.colorSchemes.neon'),
  metallic: t('config.tikz.colorSchemes.metallic')
});

// 预定义颜色库
export const colorSchemes: ColorScheme[] = [
  {
    name: 'basic',
    description: 'Basic Colors',
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
    description: 'xcolor Package Extended Colors',
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
