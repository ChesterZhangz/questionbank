import { 
  BookOpen, 
  Beaker, 
  FileText,
  Calculator,
  Ruler,
  Brain,
  Atom,
  Microscope,
  Code,
  PenTool,
  Languages,
  ScrollText,
  Mountain,
  Gavel
} from 'lucide-react';

export interface QuestionCategory {
  value: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
}

export interface QuestionSubCategory {
  value: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
  parent: string;
}

// 主要分类
export const QUESTION_CATEGORIES: QuestionCategory[] = [
  {
    value: 'math',
    label: '数学',
    icon: Calculator,
    description: '数学相关题目'
  },
  {
    value: 'physics',
    label: '物理',
    icon: Atom,
    description: '物理相关题目'
  },
  {
    value: 'chemistry',
    label: '化学',
    icon: Beaker,
    description: '化学相关题目'
  },
  {
    value: 'biology',
    label: '生物',
    icon: Microscope,
    description: '生物相关题目'
  },
  {
    value: 'computer',
    label: '计算机',
    icon: Code,
    description: '计算机相关题目'
  },
  {
    value: 'chinese',
    label: '语文',
    icon: PenTool,
    description: '语文相关题目'
  },
  {
    value: 'english',
    label: '英语',
    icon: Languages,
    description: '英语相关题目'
  },
  {
    value: 'history',
    label: '历史',
    icon: ScrollText,
    description: '历史相关题目'
  },
  {
    value: 'geography',
    label: '地理',
    icon: Mountain,
    description: '地理相关题目'
  },
  {
    value: 'politics',
    label: '政治',
    icon: Gavel,
    description: '政治相关题目'
  },
  {
    value: 'other',
    label: '其他',
    icon: FileText,
    description: '其他学科题目'
  }
];

// 数学子分类
export const MATH_SUBCATEGORIES: QuestionSubCategory[] = [
  {
    value: 'elementary-math',
    label: '小学数学',
    icon: Ruler,
    description: '小学1-6年级数学题目',
    parent: 'math'
  },
  {
    value: 'junior-math',
    label: '初中数学',
    icon: Calculator,
    description: '初中7-9年级数学题目',
    parent: 'math'
  },
  {
    value: 'senior-math',
    label: '高中数学',
    icon: Brain,
    description: '高中10-12年级数学题目',
    parent: 'math'
  },
  {
    value: 'calculus',
    label: '微积分',
    icon: BookOpen,
    description: '微积分相关题目',
    parent: 'math'
  },
  {
    value: 'linear-algebra',
    label: '线性代数',
    icon: Ruler,
    description: '线性代数相关题目',
    parent: 'math'
  },
  {
    value: 'probability',
    label: '概率统计',
    icon: Calculator,
    description: '概率论与数理统计题目',
    parent: 'math'
  },
  {
    value: 'geometry',
    label: '几何学',
    icon: Ruler,
    description: '平面几何、立体几何题目',
    parent: 'math'
  },
  {
    value: 'algebra',
    label: '代数学',
    icon: Brain,
    description: '代数相关题目',
    parent: 'math'
  },
  {
    value: 'number-theory',
    label: '数论',
    icon: BookOpen,
    description: '数论相关题目',
    parent: 'math'
  },
  {
    value: 'analysis',
    label: '数学分析',
    icon: Calculator,
    description: '数学分析相关题目',
    parent: 'math'
  }
];

// 获取所有分类（包括主分类和子分类）
export const getAllCategories = (): (QuestionCategory | QuestionSubCategory)[] => {
  return [...QUESTION_CATEGORIES, ...MATH_SUBCATEGORIES];
};

// 获取数学相关分类（主分类 + 子分类）
export const getMathCategories = (): (QuestionCategory | QuestionSubCategory)[] => {
  return [
    QUESTION_CATEGORIES.find(cat => cat.value === 'math')!,
    ...MATH_SUBCATEGORIES
  ];
};

// 根据分类值获取分类信息
export const getCategoryByValue = (value: string): QuestionCategory | QuestionSubCategory | undefined => {
  return getAllCategories().find(cat => cat.value === value);
};

// 获取分类的图标
export const getCategoryIcon = (categoryValue: string) => {
  const category = getCategoryByValue(categoryValue);
  return category?.icon || FileText;
};

// 获取分类的标签
export const getCategoryLabel = (categoryValue: string): string => {
  const category = getCategoryByValue(categoryValue);
  return category?.label || '未知分类';
};

// 检查是否为数学分类
export const isMathCategory = (categoryValue: string): boolean => {
  return categoryValue === 'math' || MATH_SUBCATEGORIES.some(sub => sub.value === categoryValue);
};

// 获取数学子分类
export const getMathSubCategories = (): QuestionSubCategory[] => {
  return MATH_SUBCATEGORIES;
};
