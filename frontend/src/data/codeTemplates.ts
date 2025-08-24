// LaTeX 和 TikZ 代码模板库
export interface CodeTemplate {
  id: string;
  title: string;
  description: string;
  category: 'latex' | 'tikz' | 'math' | 'geometry' | 'diagram';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
  code: string;
  preview?: string;
}

export const codeTemplates: CodeTemplate[] = [
  // LaTeX 基础模板
  {
    id: 'basic-document',
    title: '基础文档结构',
    description: 'LaTeX文档的基本框架结构',
    category: 'latex',
    difficulty: 'beginner',
    tags: ['基础', '文档', '结构'],
    code: `\\documentclass{article}
\\usepackage[utf8]{inputenc}
\\usepackage{amsmath,amssymb}

\\title{文档标题}
\\author{作者姓名}
\\date{\\today}

\\begin{document}
\\maketitle

\\section{引言}
这里是引言部分.

\\section{主要内容}
这里是主要内容.

\\subsection{子章节}
这里是子章节内容.

\\end{document}`
  },
  {
    id: 'math-equation',
    title: '数学公式模板',
    description: '常用数学公式的排版方式',
    category: 'math',
    difficulty: 'beginner',
    tags: ['数学', '公式', '方程'],
    code: `% 行内公式
这是一个行内公式：$E = mc^2$

% 独立公式
\\[
\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}
\\]

% 编号公式
\\begin{equation}
\\sum_{n=1}^{\\infty} \\frac{1}{n^2} = \\frac{\\pi^2}{6}
\\end{equation}

% 多行公式
\\begin{align}
f(x) &= x^2 + 2x + 1 \\\\
     &= (x + 1)^2
\\end{align}`
  },
  {
    id: 'question-choice',
    title: '选择题模板',
    description: '标准选择题的格式模板',
    category: 'latex',
    difficulty: 'beginner',
    tags: ['题目', '选择题', '格式'],
    code: `\\begin{question}
\\choice 下列哪个函数是偶函数？

A. $f(x) = x^2 + 1$
B. $f(x) = x^3 - x$
C. $f(x) = \\sin x$
D. $f(x) = e^x$

\\solution 
偶函数满足 $f(-x) = f(x)$.
检验选项A：$f(-x) = (-x)^2 + 1 = x^2 + 1 = f(x)$
因此答案是A.
\\end{question}`
  },

  // TikZ 基础图形模板
  {
    id: 'tikz-basic-shapes',
    title: '基础几何图形',
    description: '圆形、矩形、三角形等基础图形',
    category: 'tikz',
    difficulty: 'beginner',
    tags: ['几何', '图形', '基础'],
    code: `\\begin{tikzpicture}
% 圆形
\\draw[blue, thick] (0,0) circle (1);
\\node at (0,-1.5) {圆形};

% 矩形
\\draw[red, thick] (3,0) rectangle (5,1);
\\node at (4,-0.5) {矩形};

% 三角形
\\draw[green, thick] (6,0) -- (7,1) -- (8,0) -- cycle;
\\node at (7,-0.5) {三角形};
\\end{tikzpicture}`
  },
  {
    id: 'tikz-coordinate-system',
    title: '坐标系统',
    description: '带坐标轴和网格的坐标系统',
    category: 'tikz',
    difficulty: 'intermediate',
    tags: ['坐标', '轴', '网格'],
    code: `\\begin{tikzpicture}
% 网格
\\draw[step=0.5cm,gray,very thin] (-2,-2) grid (2,2);

% 坐标轴
\\draw[thick,->] (-2.5,0) -- (2.5,0) node[anchor=north west] {x};
\\draw[thick,->] (0,-2.5) -- (0,2.5) node[anchor=south east] {y};

% 原点
\\node at (0,0) [below left] {O};

% 点
\\fill[red] (1,1) circle (2pt);
\\node at (1,1) [above right] {(1,1)};
\\end{tikzpicture}`
  },
  {
    id: 'tikz-function-graph',
    title: '函数图像',
    description: '二次函数图像绘制',
    category: 'geometry',
    difficulty: 'intermediate',
    tags: ['函数', '图像', '抛物线'],
    code: `\\begin{tikzpicture}[scale=0.8]
% 坐标轴
\\draw[->] (-3,0) -- (3,0) node[right] {$x$};
\\draw[->] (0,-1) -- (0,4) node[above] {$y$};

% 函数图像
\\draw[thick,blue,domain=-2.5:2.5,samples=100] 
  plot (\\x,{\\x*\\x/2+1});

% 标注
\\node at (2,3) {$y = \\frac{x^2}{2} + 1$};
\\node at (0,0) [below left] {O};
\\end{tikzpicture}`
  },
  {
    id: 'tikz-flowchart',
    title: '流程图',
    description: '简单的流程图示例',
    category: 'diagram',
    difficulty: 'intermediate',
    tags: ['流程图', '逻辑', '图表'],
    code: `\\begin{tikzpicture}[
  node distance=2cm,
  every node/.style={draw, rounded corners, text width=2cm, text centered}
]
% 节点
\\node (start) [fill=green!30] {开始};
\\node (input) [below of=start, fill=blue!30] {输入数据};
\\node (process) [below of=input, fill=yellow!30] {处理数据};
\\node (output) [below of=process, fill=orange!30] {输出结果};
\\node (end) [below of=output, fill=red!30] {结束};

% 连线
\\draw[thick,->] (start) -- (input);
\\draw[thick,->] (input) -- (process);
\\draw[thick,->] (process) -- (output);
\\draw[thick,->] (output) -- (end);
\\end{tikzpicture}`
  },
  {
    id: 'tikz-geometric-proof',
    title: '几何证明图',
    description: '三角形几何证明用图',
    category: 'geometry',
    difficulty: 'advanced',
    tags: ['几何', '证明', '三角形'],
    code: `\\begin{tikzpicture}[scale=2]
% 三角形顶点
\\coordinate (A) at (0,0);
\\coordinate (B) at (3,0);
\\coordinate (C) at (1.5,2);

% 三角形边
\\draw[thick] (A) -- (B) -- (C) -- cycle;

% 高线
\\coordinate (H) at (1.5,0);
\\draw[dashed, red] (C) -- (H);

% 标注点
\\node at (A) [below left] {A};
\\node at (B) [below right] {B};
\\node at (C) [above] {C};
\\node at (H) [below] {H};

% 直角标记
\\draw (H) rectangle +(0.2,0.2);

% 角度标记
\\draw[thick] (A) +(0.3,0) arc (0:60:0.3);
\\node at (A) +(0.5,0.2) {$\\alpha$};
\\end{tikzpicture}`
  },
  {
    id: 'tikz-vector-diagram',
    title: '向量图',
    description: '向量的加法和分解',
    category: 'geometry',
    difficulty: 'intermediate',
    tags: ['向量', '物理', '数学'],
    code: `\\begin{tikzpicture}[scale=1.5]
% 坐标轴
\\draw[->] (-0.5,0) -- (3,0) node[right] {x};
\\draw[->] (0,-0.5) -- (0,2.5) node[above] {y};

% 向量
\\draw[thick,red,->] (0,0) -- (2,1) node[midway,above] {$\\vec{a}$};
\\draw[thick,blue,->] (0,0) -- (1,2) node[midway,left] {$\\vec{b}$};
\\draw[thick,green,->] (0,0) -- (3,3) node[near end,above] {$\\vec{a}+\\vec{b}$};

% 虚线辅助线
\\draw[dashed,gray] (2,1) -- (3,3);
\\draw[dashed,gray] (1,2) -- (3,3);

% 原点
\\node at (0,0) [below left] {O};
\\end{tikzpicture}`
  },
  {
    id: 'tikz-circuit-diagram',
    title: '电路图',
    description: '简单的电路图绘制',
    category: 'diagram',
    difficulty: 'advanced',
    tags: ['电路', '物理', '图表'],
    code: `\\begin{tikzpicture}[scale=1.2]
% 电源
\\draw (0,0) to[battery1, l=$U$] (0,2);
\\draw (0,2) -- (2,2);

% 电阻
\\draw (2,2) to[R, l=$R_1$] (4,2);
\\draw (4,2) to[R, l=$R_2$] (6,2);

% 下方连线
\\draw (6,2) -- (6,0) -- (0,0);

% 电流方向
\\draw[->, thick, red] (1,2.3) -- (5,2.3);
\\node at (3,2.6) {$I$};

% 节点标记
\\fill (0,0) circle (1pt);
\\fill (0,2) circle (1pt);
\\fill (2,2) circle (1pt);
\\fill (4,2) circle (1pt);
\\fill (6,2) circle (1pt);
\\fill (6,0) circle (1pt);
\\end{tikzpicture}`
  },

  // 高级模板
  {
    id: 'complex-math-proof',
    title: '复杂数学证明',
    description: '包含多个公式和推导步骤的数学证明',
    category: 'math',
    difficulty: 'advanced',
    tags: ['证明', '推导', '高等数学'],
    code: `\\begin{theorem}
对于任意实数 $x$，有 $e^{ix} = \\cos x + i\\sin x$
\\end{theorem}

\\begin{proof}
考虑复数的指数函数：
\\begin{align}
e^{ix} &= \\sum_{n=0}^{\\infty} \\frac{(ix)^n}{n!} \\\\
&= \\sum_{n=0}^{\\infty} \\frac{i^n x^n}{n!} \\\\
&= \\sum_{k=0}^{\\infty} \\frac{i^{2k} x^{2k}}{(2k)!} + \\sum_{k=0}^{\\infty} \\frac{i^{2k+1} x^{2k+1}}{(2k+1)!}
\\end{align}

注意到 $i^{2k} = (-1)^k$ 和 $i^{2k+1} = i(-1)^k$：
\\begin{align}
e^{ix} &= \\sum_{k=0}^{\\infty} \\frac{(-1)^k x^{2k}}{(2k)!} + i\\sum_{k=0}^{\\infty} \\frac{(-1)^k x^{2k+1}}{(2k+1)!} \\\\
&= \\cos x + i\\sin x
\\end{align}
\\end{proof}`
  },
  {
    id: 'tikz-3d-coordinate',
    title: '3D坐标系统',
    description: '三维坐标系统的绘制',
    category: 'geometry',
    difficulty: 'advanced',
    tags: ['3D', '坐标', '立体'],
    code: `\\begin{tikzpicture}[scale=2]
% 3D坐标轴
\\draw[thick,->] (0,0) -- (2,0) node[right] {$x$};
\\draw[thick,->] (0,0) -- (0,2) node[above] {$y$};
\\draw[thick,->] (0,0) -- (-0.8,-0.8) node[below left] {$z$};

% 坐标平面
\\draw[fill=blue!10, opacity=0.3] (0,0) -- (1.5,0) -- (1.5,1.5) -- (0,1.5) -- cycle;
\\draw[fill=red!10, opacity=0.3] (0,0) -- (-0.6,-0.6) -- (0.9,-0.6) -- (1.5,0) -- cycle;
\\draw[fill=green!10, opacity=0.3] (0,0) -- (0,1.5) -- (-0.6,0.9) -- (-0.6,-0.6) -- cycle;

% 原点
\\node at (0,0) [below right] {O};

% 示例点
\\fill[red] (1,1) circle (1pt);
\\draw[dashed] (1,1) -- (1,0);
\\draw[dashed] (1,1) -- (0,1);
\\draw[dashed] (1,1) -- (0.4,0.4);
\\node at (1,1) [above right] {P(a,b,c)};
\\end{tikzpicture}`
  }
];

export const getTemplatesByCategory = (category: string): CodeTemplate[] => {
  return codeTemplates.filter(template => template.category === category);
};

export const getTemplatesByDifficulty = (difficulty: string): CodeTemplate[] => {
  return codeTemplates.filter(template => template.difficulty === difficulty);
};

export const searchTemplates = (query: string): CodeTemplate[] => {
  const lowercaseQuery = query.toLowerCase();
  return codeTemplates.filter(template => 
    template.title.toLowerCase().includes(lowercaseQuery) ||
    template.description.toLowerCase().includes(lowercaseQuery) ||
    template.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
  );
};
