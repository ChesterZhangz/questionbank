// TikZ符号库 - 自动补全建议

// 翻译函数类型
type TranslationFunction = (key: string) => string;

// 全局翻译函数设置
let globalTranslationFunction: TranslationFunction | null = null;

// 设置全局翻译函数
export const setGlobalTranslationFunction = (t: TranslationFunction) => {
  globalTranslationFunction = t;
};

// 获取全局翻译函数
const getGlobalTranslationFunction = (): TranslationFunction => {
  if (globalTranslationFunction) {
    return globalTranslationFunction;
  }
  // 如果没有设置全局翻译函数，返回默认函数
  return (key: string) => key;
};

export interface TikZSymbol {
  latex: string;
  name: string;
  description: string;
  category: string;
  examples?: string[];
  completeExample?: string; // 完整的绘图示例代码
}

// 绘制命令
export const getDrawCommands = (t: TranslationFunction = getGlobalTranslationFunction()): TikZSymbol[] => [
  {
    latex: '\\draw',
    name: t('lib.tikzSymbols.drawCommands.draw'),
    description: t('lib.tikzSymbols.drawCommands.drawDescription'),
    category: 'draw',
    examples: ['\\draw (0,0) -- (1,1);', '\\draw [red, thick] (0,0) circle (1cm);']
  },
  {
    latex: '\\fill',
    name: t('lib.tikzSymbols.drawCommands.fill'),
    description: t('lib.tikzSymbols.drawCommands.fillDescription'),
    category: 'draw',
    examples: ['\\fill [blue] (0,0) circle (1cm);', '\\fill [red!30] (0,0) rectangle (2,1);']
  },
  {
    latex: '\\shade',
    name: t('lib.tikzSymbols.drawCommands.shade'),
    description: t('lib.tikzSymbols.drawCommands.shadeDescription'),
    category: 'draw',
    examples: ['\\shade [left color=red, right color=blue] (0,0) rectangle (2,1);']
  },
  {
    latex: '\\path',
    name: t('lib.tikzSymbols.drawCommands.path'),
    description: t('lib.tikzSymbols.drawCommands.pathDescription'),
    category: 'draw',
    examples: ['\\path (0,0) -- (1,1);', '\\path [name path=A] (0,0) -- (1,1);']
  },
  {
    latex: '\\clip',
    name: t('lib.tikzSymbols.drawCommands.clip'),
    description: t('lib.tikzSymbols.drawCommands.clipDescription'),
    category: 'draw',
    examples: ['\\clip (0,0) circle (1cm);']
  }
];


// 图形命令 - 包含完整的绘图示例
export const getShapeCommands = (t: TranslationFunction = getGlobalTranslationFunction()): TikZSymbol[] => [
  {
    latex: '\\circle',
    name: t('lib.tikzSymbols.shapeCommands.circle'),
    description: t('lib.tikzSymbols.shapeCommands.circleDescription'),
    category: 'shape',
    examples: ['\\draw (0,0) circle (1cm);', '\\fill [red] (0,0) circle (0.5cm);'],
    completeExample: '\\draw (0,0) circle (1cm);'
  },
  {
    latex: '\\rectangle',
    name: t('lib.tikzSymbols.shapeCommands.rectangle'),
    description: t('lib.tikzSymbols.shapeCommands.rectangleDescription'),
    category: 'shape',
    examples: ['\\draw (0,0) rectangle (2,1);', '\\fill [blue] (0,0) rectangle (1,1);'],
    completeExample: '\\draw (0,0) rectangle (2,2);'
  },
  {
    latex: '\\ellipse',
    name: t('lib.tikzSymbols.shapeCommands.ellipse'),
    description: t('lib.tikzSymbols.shapeCommands.ellipseDescription'),
    category: 'shape',
    examples: ['\\draw (0,0) ellipse (2cm and 1cm);'],
    completeExample: '\\draw (0,0) ellipse (2cm and 1cm);'
  },
  {
    latex: '\\arc',
    name: t('lib.tikzSymbols.shapeCommands.arc'),
    description: t('lib.tikzSymbols.shapeCommands.arcDescription'),
    category: 'shape',
    examples: ['\\draw (0,0) arc (0:180:1cm);'],
    completeExample: '\\draw (0,0) arc (0:180:1cm);'
  },
  {
    latex: '\\parabola',
    name: t('lib.tikzSymbols.shapeCommands.parabola'),
    description: t('lib.tikzSymbols.shapeCommands.parabolaDescription'),
    category: 'shape',
    examples: ['\\draw (0,0) parabola (1,1);'],
    completeExample: '\\draw (0,0) parabola (1,1);'
  },
  {
    latex: '\\line',
    name: t('lib.tikzSymbols.shapeCommands.line'),
    description: t('lib.tikzSymbols.shapeCommands.lineDescription'),
    category: 'shape',
    examples: ['\\draw (0,0) -- (2,2);'],
    completeExample: '\\draw (0,0) -- (2,2);'
  },
  {
    latex: '\\grid',
    name: t('lib.tikzSymbols.shapeCommands.grid'),
    description: t('lib.tikzSymbols.shapeCommands.gridDescription'),
    category: 'shape',
    examples: ['\\draw[step=0.5cm] (0,0) grid (2,2);'],
    completeExample: '\\draw[step=0.5cm] (0,0) grid (2,2);'
  }
];


// 节点和坐标命令
export const getNodeCommands = (t: TranslationFunction = getGlobalTranslationFunction()): TikZSymbol[] => [
  {
    latex: '\\node',
    name: t('lib.tikzSymbols.nodeCommands.node'),
    description: t('lib.tikzSymbols.nodeCommands.nodeDescription'),
    category: 'node',
    examples: ['\\node at (0,0) {A};', '\\node [above] {Label};', '\\node [right] at (1,1) {B};']
  },
  {
    latex: '\\coordinate',
    name: t('lib.tikzSymbols.nodeCommands.coordinate'),
    description: t('lib.tikzSymbols.nodeCommands.coordinateDescription'),
    category: 'node',
    examples: ['\\coordinate (A) at (0,0);', '\\coordinate [label=above:$P$] (P) at (1,1);']
  },
  {
    latex: '\\pic',
    name: t('lib.tikzSymbols.nodeCommands.pic'),
    description: t('lib.tikzSymbols.nodeCommands.picDescription'),
    category: 'node',
    examples: ['\\pic at (0,0) {angle=A--B--C};']
  }
];


// 样式命令
export const getStyleCommands = (t: TranslationFunction = getGlobalTranslationFunction()): TikZSymbol[] => [
  {
    latex: 'color',
    name: t('lib.tikzSymbols.styleCommands.color'),
    description: t('lib.tikzSymbols.styleCommands.colorDescription'),
    category: 'style',
    examples: ['color=red', 'color=blue!30', 'color=red!50!blue']
  },
  {
    latex: 'fill',
    name: t('lib.tikzSymbols.styleCommands.fill'),
    description: t('lib.tikzSymbols.styleCommands.fillDescription'),
    category: 'style',
    examples: ['fill=red', 'fill=blue!20', 'fill=none']
  },
  {
    latex: 'draw',
    name: t('lib.tikzSymbols.styleCommands.draw'),
    description: t('lib.tikzSymbols.styleCommands.drawDescription'),
    category: 'style',
    examples: ['draw=red', 'draw=black', 'draw=none']
  },
  {
    latex: 'line width',
    name: t('lib.tikzSymbols.styleCommands.lineWidth'),
    description: t('lib.tikzSymbols.styleCommands.lineWidthDescription'),
    category: 'style',
    examples: ['line width=1pt', 'line width=2mm', 'ultra thick', 'very thin']
  },
  {
    latex: 'line cap',
    name: t('lib.tikzSymbols.styleCommands.lineCap'),
    description: t('lib.tikzSymbols.styleCommands.lineCapDescription'),
    category: 'style',
    examples: ['line cap=round', 'line cap=butt', 'line cap=rect']
  },
  {
    latex: 'line join',
    name: t('lib.tikzSymbols.styleCommands.lineJoin'),
    description: t('lib.tikzSymbols.styleCommands.lineJoinDescription'),
    category: 'style',
    examples: ['line join=round', 'line join=bevel', 'line join=miter']
  },
  {
    latex: 'dash pattern',
    name: t('lib.tikzSymbols.styleCommands.dashPattern'),
    description: t('lib.tikzSymbols.styleCommands.dashPatternDescription'),
    category: 'style',
    examples: ['dash pattern=on 2pt off 2pt', 'dashed', 'dotted', 'loosely dashed']
  },
  {
    latex: 'opacity',
    name: t('lib.tikzSymbols.styleCommands.opacity'),
    description: t('lib.tikzSymbols.styleCommands.opacityDescription'),
    category: 'style',
    examples: ['opacity=0.5', 'opacity=0.8']
  }
];


// 颜色值
export const getColorValues = (t: TranslationFunction = getGlobalTranslationFunction()): TikZSymbol[] => [
  { latex: 'red', name: t('lib.tikzSymbols.colors.red'), description: t('lib.tikzSymbols.colors.red'), category: 'color' },
  { latex: 'blue', name: t('lib.tikzSymbols.colors.blue'), description: t('lib.tikzSymbols.colors.blue'), category: 'color' },
  { latex: 'green', name: t('lib.tikzSymbols.colors.green'), description: t('lib.tikzSymbols.colors.green'), category: 'color' },
  { latex: 'yellow', name: t('lib.tikzSymbols.colors.yellow'), description: t('lib.tikzSymbols.colors.yellow'), category: 'color' },
  { latex: 'orange', name: t('lib.tikzSymbols.colors.orange'), description: t('lib.tikzSymbols.colors.orange'), category: 'color' },
  { latex: 'purple', name: t('lib.tikzSymbols.colors.purple'), description: t('lib.tikzSymbols.colors.purple'), category: 'color' },
  { latex: 'brown', name: t('lib.tikzSymbols.colors.brown'), description: t('lib.tikzSymbols.colors.brown'), category: 'color' },
  { latex: 'pink', name: t('lib.tikzSymbols.colors.pink'), description: t('lib.tikzSymbols.colors.pink'), category: 'color' },
  { latex: 'gray', name: t('lib.tikzSymbols.colors.gray'), description: t('lib.tikzSymbols.colors.gray'), category: 'color' },
  { latex: 'cyan', name: t('lib.tikzSymbols.colors.cyan'), description: t('lib.tikzSymbols.colors.cyan'), category: 'color' },
  { latex: 'magenta', name: t('lib.tikzSymbols.colors.magenta'), description: t('lib.tikzSymbols.colors.magenta'), category: 'color' },
  { latex: 'black', name: t('lib.tikzSymbols.colors.black'), description: t('lib.tikzSymbols.colors.black'), category: 'color' },
  { latex: 'white', name: t('lib.tikzSymbols.colors.white'), description: t('lib.tikzSymbols.colors.white'), category: 'color' },
  { latex: 'red!30', name: t('lib.tikzSymbols.colors.lightRed'), description: t('lib.tikzSymbols.colors.lightRed'), category: 'color' },
  { latex: 'blue!50', name: t('lib.tikzSymbols.colors.mediumBlue'), description: t('lib.tikzSymbols.colors.mediumBlue'), category: 'color' },
  { latex: 'green!70', name: t('lib.tikzSymbols.colors.darkGreen'), description: t('lib.tikzSymbols.colors.darkGreen'), category: 'color' },
  { latex: 'red!50!blue', name: t('lib.tikzSymbols.colors.redBlueMix'), description: t('lib.tikzSymbols.colors.redBlueMix'), category: 'color' },
  { latex: 'blue!20!green', name: t('lib.tikzSymbols.colors.blueGreenMix'), description: t('lib.tikzSymbols.colors.blueGreenMix'), category: 'color' }
];


// 线宽值
export const getLineWidthValues = (t: TranslationFunction = getGlobalTranslationFunction()): TikZSymbol[] => [
  { latex: 'ultra thin', name: t('lib.tikzSymbols.lineWidths.ultraThin'), description: t('lib.tikzSymbols.lineWidths.ultraThin'), category: 'linewidth' },
  { latex: 'very thin', name: t('lib.tikzSymbols.lineWidths.veryThin'), description: t('lib.tikzSymbols.lineWidths.veryThin'), category: 'linewidth' },
  { latex: 'thin', name: t('lib.tikzSymbols.lineWidths.thin'), description: t('lib.tikzSymbols.lineWidths.thin'), category: 'linewidth' },
  { latex: 'semithick', name: t('lib.tikzSymbols.lineWidths.semithick'), description: t('lib.tikzSymbols.lineWidths.semithick'), category: 'linewidth' },
  { latex: 'thick', name: t('lib.tikzSymbols.lineWidths.thick'), description: t('lib.tikzSymbols.lineWidths.thick'), category: 'linewidth' },
  { latex: 'very thick', name: t('lib.tikzSymbols.lineWidths.veryThick'), description: t('lib.tikzSymbols.lineWidths.veryThick'), category: 'linewidth' },
  { latex: 'ultra thick', name: t('lib.tikzSymbols.lineWidths.ultraThick'), description: t('lib.tikzSymbols.lineWidths.ultraThick'), category: 'linewidth' },
  { latex: 'line width=0.5pt', name: t('lib.tikzSymbols.lineWidths.pt05'), description: t('lib.tikzSymbols.lineWidths.pt05'), category: 'linewidth' },
  { latex: 'line width=1pt', name: t('lib.tikzSymbols.lineWidths.pt1'), description: t('lib.tikzSymbols.lineWidths.pt1'), category: 'linewidth' },
  { latex: 'line width=2pt', name: t('lib.tikzSymbols.lineWidths.pt2'), description: t('lib.tikzSymbols.lineWidths.pt2'), category: 'linewidth' },
  { latex: 'line width=3pt', name: t('lib.tikzSymbols.lineWidths.pt3'), description: t('lib.tikzSymbols.lineWidths.pt3'), category: 'linewidth' }
];


// 线型值
export const getLineStyleValues = (t: TranslationFunction = getGlobalTranslationFunction()): TikZSymbol[] => [
  { latex: 'solid', name: t('lib.tikzSymbols.lineStyles.solid'), description: t('lib.tikzSymbols.lineStyles.solid'), category: 'linestyle' },
  { latex: 'dashed', name: t('lib.tikzSymbols.lineStyles.dashed'), description: t('lib.tikzSymbols.lineStyles.dashed'), category: 'linestyle' },
  { latex: 'dotted', name: t('lib.tikzSymbols.lineStyles.dotted'), description: t('lib.tikzSymbols.lineStyles.dotted'), category: 'linestyle' },
  { latex: 'loosely dashed', name: t('lib.tikzSymbols.lineStyles.looselyDashed'), description: t('lib.tikzSymbols.lineStyles.looselyDashed'), category: 'linestyle' },
  { latex: 'densely dashed', name: t('lib.tikzSymbols.lineStyles.denselyDashed'), description: t('lib.tikzSymbols.lineStyles.denselyDashed'), category: 'linestyle' },
  { latex: 'loosely dotted', name: t('lib.tikzSymbols.lineStyles.looselyDotted'), description: t('lib.tikzSymbols.lineStyles.looselyDotted'), category: 'linestyle' },
  { latex: 'densely dotted', name: t('lib.tikzSymbols.lineStyles.denselyDotted'), description: t('lib.tikzSymbols.lineStyles.denselyDotted'), category: 'linestyle' },
  { latex: 'dash pattern=on 2pt off 2pt', name: t('lib.tikzSymbols.lineStyles.customDashed'), description: t('lib.tikzSymbols.lineStyles.customDashed'), category: 'linestyle' },
  { latex: 'dash pattern=on 4pt off 2pt', name: t('lib.tikzSymbols.lineStyles.longDashed'), description: t('lib.tikzSymbols.lineStyles.longDashed'), category: 'linestyle' }
];


// 透明度值
export const getOpacityValues = (t: TranslationFunction = getGlobalTranslationFunction()): TikZSymbol[] => [
  { latex: 'opacity=0.1', name: t('lib.tikzSymbols.opacities.p10'), description: t('lib.tikzSymbols.opacities.p10'), category: 'opacity' },
  { latex: 'opacity=0.2', name: t('lib.tikzSymbols.opacities.p20'), description: t('lib.tikzSymbols.opacities.p20'), category: 'opacity' },
  { latex: 'opacity=0.3', name: t('lib.tikzSymbols.opacities.p30'), description: t('lib.tikzSymbols.opacities.p30'), category: 'opacity' },
  { latex: 'opacity=0.4', name: t('lib.tikzSymbols.opacities.p40'), description: t('lib.tikzSymbols.opacities.p40'), category: 'opacity' },
  { latex: 'opacity=0.5', name: t('lib.tikzSymbols.opacities.p50'), description: t('lib.tikzSymbols.opacities.p50'), category: 'opacity' },
  { latex: 'opacity=0.6', name: t('lib.tikzSymbols.opacities.p60'), description: t('lib.tikzSymbols.opacities.p60'), category: 'opacity' },
  { latex: 'opacity=0.7', name: t('lib.tikzSymbols.opacities.p70'), description: t('lib.tikzSymbols.opacities.p70'), category: 'opacity' },
  { latex: 'opacity=0.8', name: t('lib.tikzSymbols.opacities.p80'), description: t('lib.tikzSymbols.opacities.p80'), category: 'opacity' },
  { latex: 'opacity=0.9', name: t('lib.tikzSymbols.opacities.p90'), description: t('lib.tikzSymbols.opacities.p90'), category: 'opacity' }
];


// 变换命令
export const getTransformCommands = (t: TranslationFunction = getGlobalTranslationFunction()): TikZSymbol[] => [
  {
    latex: 'scale',
    name: t('lib.tikzSymbols.transforms.scale'),
    description: t('lib.tikzSymbols.transforms.scaleDescription'),
    category: 'transform',
    examples: ['scale=2', 'scale=0.5', 'scale=1.5']
  },
  {
    latex: 'rotate',
    name: t('lib.tikzSymbols.transforms.rotate'),
    description: t('lib.tikzSymbols.transforms.rotateDescription'),
    category: 'transform',
    examples: ['rotate=45', 'rotate=90', 'rotate=-30']
  },
  {
    latex: 'shift',
    name: t('lib.tikzSymbols.transforms.shift'),
    description: t('lib.tikzSymbols.transforms.shiftDescription'),
    category: 'transform',
    examples: ['shift={(1,0)}', 'shift={(-1,1)}']
  },
  {
    latex: 'translate',
    name: t('lib.tikzSymbols.transforms.translate'),
    description: t('lib.tikzSymbols.transforms.translateDescription'),
    category: 'transform',
    examples: ['translate={(1,0)}', 'translate={(-1,1)}']
  },
  {
    latex: 'transform shape',
    name: t('lib.tikzSymbols.transforms.transformShape'),
    description: t('lib.tikzSymbols.transforms.transformShapeDescription'),
    category: 'transform',
    examples: ['transform shape']
  }
];


// 数学函数
export const getMathFunctions = (t: TranslationFunction = getGlobalTranslationFunction()): TikZSymbol[] => [
  {
    latex: '\\sin',
    name: t('lib.tikzSymbols.mathFunctions.sin'),
    description: t('lib.tikzSymbols.mathFunctions.sinDescription'),
    category: 'math',
    examples: ['\\draw plot[domain=0:6.28, samples=100] {sin(x)};'],
    completeExample: '\\draw[red, thick] plot[domain=0:6.28, samples=100] {sin(x)};'
  },
  {
    latex: '\\cos',
    name: t('lib.tikzSymbols.mathFunctions.cos'),
    description: t('lib.tikzSymbols.mathFunctions.cosDescription'),
    category: 'math',
    examples: ['\\draw plot[domain=0:6.28, samples=100] {cos(x)};'],
    completeExample: '\\draw[blue, thick] plot[domain=0:6.28, samples=100] {cos(x)};'
  },
  {
    latex: '\\tan',
    name: t('lib.tikzSymbols.mathFunctions.tan'),
    description: t('lib.tikzSymbols.mathFunctions.tanDescription'),
    category: 'math',
    examples: ['\\draw plot[domain=-1.5:1.5, samples=100] {tan(x)};'],
    completeExample: '\\draw[green, thick] plot[domain=-1.5:1.5, samples=100] {tan(x)};'
  },
  {
    latex: '\\sqrt',
    name: t('lib.tikzSymbols.mathFunctions.sqrt'),
    description: t('lib.tikzSymbols.mathFunctions.sqrtDescription'),
    category: 'math',
    examples: ['\\draw plot[domain=0:4, samples=100] {sqrt(x)};'],
    completeExample: '\\draw[purple, thick] plot[domain=0:4, samples=100] {sqrt(x)};'
  },
  {
    latex: '\\exp',
    name: t('lib.tikzSymbols.mathFunctions.exp'),
    description: t('lib.tikzSymbols.mathFunctions.expDescription'),
    category: 'math',
    examples: ['\\draw plot[domain=-2:2, samples=100] {exp(x)};'],
    completeExample: '\\draw[orange, thick] plot[domain=-2:2, samples=100] {exp(x)};'
  },
  {
    latex: '\\log',
    name: t('lib.tikzSymbols.mathFunctions.log'),
    description: t('lib.tikzSymbols.mathFunctions.logDescription'),
    category: 'math',
    examples: ['\\draw plot[domain=0.1:2, samples=100] {log10(x)};'],
    completeExample: '\\draw[brown, thick] plot[domain=0.1:2, samples=100] {log10(x)};'
  },
  {
    latex: '\\ln',
    name: t('lib.tikzSymbols.mathFunctions.ln'),
    description: t('lib.tikzSymbols.mathFunctions.lnDescription'),
    category: 'math',
    examples: ['\\draw plot[domain=0.1:2, samples=100] {ln(x)};'],
    completeExample: '\\draw[teal, thick] plot[domain=0.1:2, samples=100] {ln(x)};'
  },
  {
    latex: 'x^2',
    name: t('lib.tikzSymbols.mathFunctions.x2'),
    description: t('lib.tikzSymbols.mathFunctions.x2Description'),
    category: 'math',
    examples: ['\\draw plot[domain=-2:2, samples=100] {x^2};'],
    completeExample: '\\draw[red, thick] plot[domain=-2:2, samples=100] {x^2};'
  },
  {
    latex: 'x^3',
    name: t('lib.tikzSymbols.mathFunctions.x3'),
    description: t('lib.tikzSymbols.mathFunctions.x3Description'),
    category: 'math',
    examples: ['\\draw plot[domain=-2:2, samples=100] {x^3};'],
    completeExample: '\\draw[blue, thick] plot[domain=-2:2, samples=100] {x^3};'
  },
  {
    latex: '1/x',
    name: t('lib.tikzSymbols.mathFunctions.inverse'),
    description: t('lib.tikzSymbols.mathFunctions.inverseDescription'),
    category: 'math',
    examples: ['\\draw plot[domain=0.1:3, samples=100] {1/x};'],
    completeExample: '\\draw[green, thick] plot[domain=0.1:3, samples=100] {1/x};'
  }
];


// 希腊字母
export const getGreekLetters = (t: TranslationFunction = getGlobalTranslationFunction()): TikZSymbol[] => [
  { latex: '\\alpha', name: t('lib.tikzSymbols.greekLetters.alpha'), description: t('lib.tikzSymbols.greekLetters.alpha'), category: 'greek' },
  { latex: '\\beta', name: t('lib.tikzSymbols.greekLetters.beta'), description: t('lib.tikzSymbols.greekLetters.beta'), category: 'greek' },
  { latex: '\\gamma', name: t('lib.tikzSymbols.greekLetters.gamma'), description: t('lib.tikzSymbols.greekLetters.gamma'), category: 'greek' },
  { latex: '\\delta', name: t('lib.tikzSymbols.greekLetters.delta'), description: t('lib.tikzSymbols.greekLetters.delta'), category: 'greek' },
  { latex: '\\epsilon', name: t('lib.tikzSymbols.greekLetters.epsilon'), description: t('lib.tikzSymbols.greekLetters.epsilon'), category: 'greek' },
  { latex: '\\theta', name: t('lib.tikzSymbols.greekLetters.theta'), description: t('lib.tikzSymbols.greekLetters.theta'), category: 'greek' },
  { latex: '\\lambda', name: t('lib.tikzSymbols.greekLetters.lambda'), description: t('lib.tikzSymbols.greekLetters.lambda'), category: 'greek' },
  { latex: '\\mu', name: t('lib.tikzSymbols.greekLetters.mu'), description: t('lib.tikzSymbols.greekLetters.mu'), category: 'greek' },
  { latex: '\\pi', name: t('lib.tikzSymbols.greekLetters.pi'), description: t('lib.tikzSymbols.greekLetters.pi'), category: 'greek' },
  { latex: '\\sigma', name: t('lib.tikzSymbols.greekLetters.sigma'), description: t('lib.tikzSymbols.greekLetters.sigma'), category: 'greek' },
  { latex: '\\phi', name: t('lib.tikzSymbols.greekLetters.phi'), description: t('lib.tikzSymbols.greekLetters.phi'), category: 'greek' },
  { latex: '\\omega', name: t('lib.tikzSymbols.greekLetters.omega'), description: t('lib.tikzSymbols.greekLetters.omega'), category: 'greek' }
];


// 数学符号
export const getMathSymbols = (t: TranslationFunction = getGlobalTranslationFunction()): TikZSymbol[] => [
  { latex: '\\infty', name: t('lib.tikzSymbols.mathSymbols.infinity'), description: t('lib.tikzSymbols.mathSymbols.infinityDescription'), category: 'symbol' },
  { latex: '\\partial', name: t('lib.tikzSymbols.mathSymbols.partial'), description: t('lib.tikzSymbols.mathSymbols.partialDescription'), category: 'symbol' },
  { latex: '\\nabla', name: t('lib.tikzSymbols.mathSymbols.gradient'), description: t('lib.tikzSymbols.mathSymbols.gradientDescription'), category: 'symbol' },
  { latex: '\\Delta', name: t('lib.tikzSymbols.mathSymbols.delta'), description: t('lib.tikzSymbols.mathSymbols.deltaDescription'), category: 'symbol' },
  { latex: '\\Omega', name: t('lib.tikzSymbols.mathSymbols.omega'), description: t('lib.tikzSymbols.mathSymbols.omegaDescription'), category: 'symbol' },
  { latex: '\\Gamma', name: t('lib.tikzSymbols.mathSymbols.gamma'), description: t('lib.tikzSymbols.mathSymbols.gammaDescription'), category: 'symbol' },
  { latex: '\\Lambda', name: t('lib.tikzSymbols.mathSymbols.lambda'), description: t('lib.tikzSymbols.mathSymbols.lambdaDescription'), category: 'symbol' },
  { latex: '\\Phi', name: t('lib.tikzSymbols.mathSymbols.phi'), description: t('lib.tikzSymbols.mathSymbols.phiDescription'), category: 'symbol' },
  { latex: '\\Psi', name: t('lib.tikzSymbols.mathSymbols.psi'), description: t('lib.tikzSymbols.mathSymbols.psiDescription'), category: 'symbol' },
  { latex: '\\Theta', name: t('lib.tikzSymbols.mathSymbols.theta'), description: t('lib.tikzSymbols.mathSymbols.thetaDescription'), category: 'symbol' },
  { latex: '\\Xi', name: t('lib.tikzSymbols.mathSymbols.xi'), description: t('lib.tikzSymbols.mathSymbols.xiDescription'), category: 'symbol' },
  { latex: '\\Pi', name: t('lib.tikzSymbols.mathSymbols.pi'), description: t('lib.tikzSymbols.mathSymbols.piDescription'), category: 'symbol' },
  { latex: '\\Sigma', name: t('lib.tikzSymbols.mathSymbols.sigma'), description: t('lib.tikzSymbols.mathSymbols.sigmaDescription'), category: 'symbol' }
];


// 箭头样式
export const getArrowStyles = (t: TranslationFunction = getGlobalTranslationFunction()): TikZSymbol[] => [
  { latex: '->', name: t('lib.tikzSymbols.arrows.rightArrow'), description: t('lib.tikzSymbols.arrows.rightArrowDescription'), category: 'arrow' },
  { latex: '<-', name: t('lib.tikzSymbols.arrows.leftArrow'), description: t('lib.tikzSymbols.arrows.leftArrowDescription'), category: 'arrow' },
  { latex: '--', name: t('lib.tikzSymbols.arrows.straightLine'), description: t('lib.tikzSymbols.arrows.straightLineDescription'), category: 'arrow' },
  { latex: '->>', name: t('lib.tikzSymbols.arrows.doubleRightArrow'), description: t('lib.tikzSymbols.arrows.doubleRightArrowDescription'), category: 'arrow' },
  { latex: '<<-', name: t('lib.tikzSymbols.arrows.doubleLeftArrow'), description: t('lib.tikzSymbols.arrows.doubleLeftArrowDescription'), category: 'arrow' },
  { latex: '<->', name: t('lib.tikzSymbols.arrows.bidirectionalArrow'), description: t('lib.tikzSymbols.arrows.bidirectionalArrowDescription'), category: 'arrow' },
  { latex: '<->>', name: t('lib.tikzSymbols.arrows.doubleBidirectionalArrow'), description: t('lib.tikzSymbols.arrows.doubleBidirectionalArrowDescription'), category: 'arrow' }
];


// 获取所有符号
export const getAllTikZSymbols = (t: TranslationFunction = getGlobalTranslationFunction()): TikZSymbol[] => {
  return [
    ...getDrawCommands(t),
    ...getShapeCommands(t),
    ...getNodeCommands(t),
    ...getStyleCommands(t),
    ...getColorValues(t),
    ...getLineWidthValues(t),
    ...getLineStyleValues(t),
    ...getOpacityValues(t),
    ...getTransformCommands(t),
    ...getMathFunctions(t),
    ...getGreekLetters(t),
    ...getMathSymbols(t),
    ...getArrowStyles(t)
  ];
};

// 搜索符号
export const searchTikZSymbols = (query: string, t: TranslationFunction = getGlobalTranslationFunction()): TikZSymbol[] => {
  // 如果查询为空，只返回常用的TikZ命令，而不是所有符号
  if (!query || query.trim() === '') {
    return [
      ...getDrawCommands(t),
      ...getShapeCommands(t).slice(0, 4), // 只显示前4个常用图形
      ...getNodeCommands(t).slice(0, 2)   // 只显示前2个节点命令
    ];
  }
  
  const lowerQuery = query.toLowerCase();
  
  // 严格匹配：只显示以查询开头的命令
  const exactMatches = getAllTikZSymbols(t).filter(symbol => 
    symbol.latex.toLowerCase().startsWith('\\' + lowerQuery)
  );
  
  // 如果有精确匹配，只返回精确匹配，最多5个
  if (exactMatches.length > 0) {
    return exactMatches.slice(0, 5);
  }
  
  // 如果没有精确匹配，返回名称开头匹配的，最多3个
  const nameMatches = getAllTikZSymbols(t).filter(symbol => 
    symbol.name.toLowerCase().startsWith(lowerQuery)
  );
  
  return nameMatches.slice(0, 3);
};

// 获取常用符号（用于快速访问）
export const getCommonTikZSymbols = (t: TranslationFunction = getGlobalTranslationFunction()): TikZSymbol[] => {
  return [
    ...getDrawCommands(t).slice(0, 3),
    ...getShapeCommands(t).slice(0, 3),
    ...getNodeCommands(t).slice(0, 2),
    ...getStyleCommands(t).slice(0, 4),
    ...getGreekLetters(t).slice(0, 5)
  ];
};

// 智能筛选函数
export const filterSuggestions = (suggestions: TikZSymbol[], query: string): TikZSymbol[] => {
  if (!query.trim()) return suggestions;
  
  const lowerQuery = query.toLowerCase();
  
  return suggestions.filter(symbol => {
    // 优先匹配 latex 命令开头
    if (symbol.latex.toLowerCase().startsWith(lowerQuery)) return true;
    
    // 然后匹配名称开头
    if (symbol.name.toLowerCase().startsWith(lowerQuery)) return true;
    
    // 最后匹配包含关系
    return symbol.latex.toLowerCase().includes(lowerQuery) ||
           symbol.name.toLowerCase().includes(lowerQuery) ||
           symbol.description.toLowerCase().includes(lowerQuery);
  }).sort((a, b) => {
    // 排序：latex开头 > 名称开头 > 其他匹配
    const aLatexStart = a.latex.toLowerCase().startsWith(lowerQuery);
    const bLatexStart = b.latex.toLowerCase().startsWith(lowerQuery);
    const aNameStart = a.name.toLowerCase().startsWith(lowerQuery);
    const bNameStart = b.name.toLowerCase().startsWith(lowerQuery);
    
    if (aLatexStart && !bLatexStart) return -1;
    if (!aLatexStart && bLatexStart) return 1;
    if (aNameStart && !bNameStart) return -1;
    if (!aNameStart && bNameStart) return 1;
    
    return a.latex.localeCompare(b.latex);
  });
};

// 获取上下文相关的参数建议
export const getContextualParameters = (command: string, currentInput: string = '', t: TranslationFunction = getGlobalTranslationFunction()): TikZSymbol[] => {
  let suggestions: TikZSymbol[] = [];
  
  // 根据命令类型提供不同的参数建议
  switch (command.toLowerCase()) {
    case 'draw':
      suggestions = [
        // 箭头样式
        { latex: '->', name: t('lib.tikzSymbols.drawParameters.rightArrow'), description: t('lib.tikzSymbols.drawParameters.rightArrowDescription'), category: 'arrow' },
        { latex: '<-', name: t('lib.tikzSymbols.drawParameters.leftArrow'), description: t('lib.tikzSymbols.drawParameters.leftArrowDescription'), category: 'arrow' },
        { latex: '<->', name: t('lib.tikzSymbols.drawParameters.doubleArrow'), description: t('lib.tikzSymbols.drawParameters.doubleArrowDescription'), category: 'arrow' },
        // 线宽
        { latex: 'ultra thin', name: t('lib.tikzSymbols.drawParameters.ultraThin'), description: t('lib.tikzSymbols.drawParameters.ultraThin'), category: 'linewidth' },
        { latex: 'thick', name: t('lib.tikzSymbols.drawParameters.thick'), description: t('lib.tikzSymbols.drawParameters.thick'), category: 'linewidth' },
        // 颜色
        { latex: 'red', name: t('lib.tikzSymbols.drawParameters.red'), description: t('lib.tikzSymbols.drawParameters.red'), category: 'color' },
        { latex: 'blue', name: t('lib.tikzSymbols.drawParameters.blue'), description: t('lib.tikzSymbols.drawParameters.blue'), category: 'color' }
      ];
      break;
    case 'node':
      suggestions = [
        { latex: 'above', name: t('lib.tikzSymbols.nodeParameters.above'), description: t('lib.tikzSymbols.nodeParameters.aboveDescription'), category: 'position' },
        { latex: 'below', name: t('lib.tikzSymbols.nodeParameters.below'), description: t('lib.tikzSymbols.nodeParameters.belowDescription'), category: 'position' },
        { latex: 'left', name: t('lib.tikzSymbols.nodeParameters.left'), description: t('lib.tikzSymbols.nodeParameters.leftDescription'), category: 'position' },
        { latex: 'right', name: t('lib.tikzSymbols.nodeParameters.right'), description: t('lib.tikzSymbols.nodeParameters.rightDescription'), category: 'position' }
      ];
      break;
    case 'fill':
      suggestions = [
        { latex: 'red', name: t('lib.tikzSymbols.fillParameters.red'), description: t('lib.tikzSymbols.fillParameters.red'), category: 'color' },
        { latex: 'blue', name: t('lib.tikzSymbols.fillParameters.blue'), description: t('lib.tikzSymbols.fillParameters.blue'), category: 'color' },
        { latex: 'green', name: t('lib.tikzSymbols.fillParameters.green'), description: t('lib.tikzSymbols.fillParameters.green'), category: 'color' }
      ];
      break;
    default:
      // 通用参数
      suggestions = [
        ...getColorValues(t).slice(0, 8),
        ...getLineWidthValues(t).slice(0, 5)
      ];
  }
  
  // 应用实时筛选
  return filterSuggestions(suggestions, currentInput);
};
