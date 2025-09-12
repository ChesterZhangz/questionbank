// TikZ 默认样式配置
export interface TikZStyle {
  stroke: string;
  strokeWidth: string;
  fill: string;
  strokeDasharray?: string;
  opacity?: number;
}

// 获取翻译后的样式配置
export const getDefaultStyles = (t: (key: string) => string) => ({
  title: t('config.tikz.defaultStyles.title'),
  description: t('config.tikz.defaultStyles.description'),
  stroke: t('config.tikz.defaultStyles.stroke'),
  fill: t('config.tikz.defaultStyles.fill'),
  lineWidth: t('config.tikz.defaultStyles.lineWidth'),
  lineCap: t('config.tikz.defaultStyles.lineCap'),
  lineJoin: t('config.tikz.defaultStyles.lineJoin'),
  dashPattern: t('config.tikz.defaultStyles.dashPattern'),
  opacity: t('config.tikz.defaultStyles.opacity'),
  color: t('config.tikz.defaultStyles.color'),
  gradient: t('config.tikz.defaultStyles.gradient'),
  shadow: t('config.tikz.defaultStyles.shadow'),
  arrow: t('config.tikz.defaultStyles.arrow'),
  node: t('config.tikz.defaultStyles.node'),
  coordinate: t('config.tikz.defaultStyles.coordinate'),
  grid: t('config.tikz.defaultStyles.grid'),
  axis: t('config.tikz.defaultStyles.axis'),
  legend: t('config.tikz.defaultStyles.legend'),
  label: t('config.tikz.defaultStyles.label')
});

// 预定义样式
export const defaultStyles: Record<string, TikZStyle> = {
  'thin': {
    stroke: 'black',
    strokeWidth: '0.5',
    fill: 'none'
  },
  'semithin': {
    stroke: 'black',
    strokeWidth: '1',
    fill: 'none'
  },
  'thick': {
    stroke: 'black',
    strokeWidth: '3',
    fill: 'none'
  },
  'very thick': {
    stroke: 'black',
    strokeWidth: '4',
    fill: 'none'
  },
  'ultra thick': {
    stroke: 'black',
    strokeWidth: '5',
    fill: 'none'
  },
  'dashed': {
    stroke: 'black',
    strokeWidth: '2',
    fill: 'none',
    strokeDasharray: '5,5'
  },
  'dotted': {
    stroke: 'black',
    strokeWidth: '2',
    fill: 'none',
    strokeDasharray: '2,2'
  },
  'loosely dashed': {
    stroke: 'black',
    strokeWidth: '2',
    fill: 'none',
    strokeDasharray: '10,5'
  },
  'densely dashed': {
    stroke: 'black',
    strokeWidth: '2',
    fill: 'none',
    strokeDasharray: '3,3'
  },
  'loosely dotted': {
    stroke: 'black',
    strokeWidth: '2',
    fill: 'none',
    strokeDasharray: '5,2'
  },
  'densely dotted': {
    stroke: 'black',
    strokeWidth: '2',
    fill: 'none',
    strokeDasharray: '1,1'
  }
};

// 颜色样式
export const colorStyles: Record<string, Partial<TikZStyle>> = {
  'red': { stroke: 'red', fill: 'red' },
  'blue': { stroke: 'blue', fill: 'blue' },
  'green': { stroke: 'green', fill: 'green' },
  'yellow': { stroke: 'yellow', fill: 'yellow' },
  'cyan': { stroke: 'cyan', fill: 'cyan' },
  'magenta': { stroke: 'magenta', fill: 'magenta' },
  'black': { stroke: 'black', fill: 'black' },
  'white': { stroke: 'white', fill: 'white' },
  'gray': { stroke: 'gray', fill: 'gray' },
  'orange': { stroke: 'orange', fill: 'orange' },
  'purple': { stroke: 'purple', fill: 'purple' },
  'brown': { stroke: 'brown', fill: 'brown' },
  'pink': { stroke: 'pink', fill: 'pink' }
};

// 获取样式
export function getStyle(styleName: string): TikZStyle | null {
  // 检查是否为预定义样式
  if (defaultStyles[styleName]) {
    return { ...defaultStyles[styleName] };
  }
  
  // 检查是否为颜色样式
  if (colorStyles[styleName]) {
    return { ...defaultStyles['thick'], ...colorStyles[styleName] };
  }
  
  return null;
}

// 合并样式
export function mergeStyles(baseStyle: TikZStyle, additionalStyles: Partial<TikZStyle>): TikZStyle {
  return { ...baseStyle, ...additionalStyles };
}

// 解析样式字符串
export function parseStyleString(styleString: string): Partial<TikZStyle> {
  const styles: Partial<TikZStyle> = {};
  const parts = styleString.split(',').map(s => s.trim());
  
  for (const part of parts) {
    if (part.includes('=')) {
      const [key, value] = part.split('=').map(s => s.trim());
      switch (key) {
        case 'fill':
          styles.fill = value;
          break;
        case 'stroke':
          styles.stroke = value;
          break;
        case 'stroke-width':
        case 'strokeWidth':
          styles.strokeWidth = value;
          break;
        case 'opacity':
          styles.opacity = parseFloat(value);
          break;
      }
    } else {
      // 检查是否为预定义样式
      const style = getStyle(part);
      if (style) {
        Object.assign(styles, style);
      }
    }
  }
  
  return styles;
}
