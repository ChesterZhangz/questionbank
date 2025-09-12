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

// 主要分类（向后兼容）
export const QUESTION_CATEGORIES: QuestionCategory[] = [
  {
    value: 'math',
    label: 'Mathematics',
    icon: Calculator,
    description: 'Mathematics related questions'
  },
  {
    value: 'physics',
    label: 'Physics',
    icon: Atom,
    description: 'Physics related questions'
  },
  {
    value: 'chemistry',
    label: 'Chemistry',
    icon: Beaker,
    description: 'Chemistry related questions'
  },
  {
    value: 'biology',
    label: 'Biology',
    icon: Microscope,
    description: 'Biology related questions'
  },
  {
    value: 'computer',
    label: 'Computer Science',
    icon: Code,
    description: 'Computer Science related questions'
  },
  {
    value: 'chinese',
    label: 'Chinese',
    icon: PenTool,
    description: 'Chinese related questions'
  },
  {
    value: 'english',
    label: 'English',
    icon: Languages,
    description: 'English related questions'
  },
  {
    value: 'history',
    label: 'History',
    icon: ScrollText,
    description: 'History related questions'
  },
  {
    value: 'geography',
    label: 'Geography',
    icon: Mountain,
    description: 'Geography related questions'
  },
  {
    value: 'politics',
    label: 'Politics',
    icon: Gavel,
    description: 'Politics related questions'
  },
  {
    value: 'other',
    label: 'Other',
    icon: FileText,
    description: 'Other subject questions'
  }
];

// 获取翻译后的主要分类
export const getQuestionCategories = (t: (key: string) => string): QuestionCategory[] => [
  {
    value: 'math',
    label: t('constants.questionCategories.main.math.label'),
    icon: Calculator,
    description: t('constants.questionCategories.main.math.description')
  },
  {
    value: 'physics',
    label: t('constants.questionCategories.main.physics.label'),
    icon: Atom,
    description: t('constants.questionCategories.main.physics.description')
  },
  {
    value: 'chemistry',
    label: t('constants.questionCategories.main.chemistry.label'),
    icon: Beaker,
    description: t('constants.questionCategories.main.chemistry.description')
  },
  {
    value: 'biology',
    label: t('constants.questionCategories.main.biology.label'),
    icon: Microscope,
    description: t('constants.questionCategories.main.biology.description')
  },
  {
    value: 'computer',
    label: t('constants.questionCategories.main.computer.label'),
    icon: Code,
    description: t('constants.questionCategories.main.computer.description')
  },
  {
    value: 'chinese',
    label: t('constants.questionCategories.main.chinese.label'),
    icon: PenTool,
    description: t('constants.questionCategories.main.chinese.description')
  },
  {
    value: 'english',
    label: t('constants.questionCategories.main.english.label'),
    icon: Languages,
    description: t('constants.questionCategories.main.english.description')
  },
  {
    value: 'history',
    label: t('constants.questionCategories.main.history.label'),
    icon: ScrollText,
    description: t('constants.questionCategories.main.history.description')
  },
  {
    value: 'geography',
    label: t('constants.questionCategories.main.geography.label'),
    icon: Mountain,
    description: t('constants.questionCategories.main.geography.description')
  },
  {
    value: 'politics',
    label: t('constants.questionCategories.main.politics.label'),
    icon: Gavel,
    description: t('constants.questionCategories.main.politics.description')
  },
  {
    value: 'other',
    label: t('constants.questionCategories.main.other.label'),
    icon: FileText,
    description: t('constants.questionCategories.main.other.description')
  }
];

// 数学子分类（向后兼容）
export const MATH_SUBCATEGORIES: QuestionSubCategory[] = [
  {
    value: 'elementary-math',
    label: 'Elementary Mathematics',
    icon: Ruler,
    description: 'Elementary school (1-6 grade) mathematics questions',
    parent: 'math'
  },
  {
    value: 'junior-math',
    label: 'Junior Mathematics',
    icon: Calculator,
    description: 'Junior high school (7-9 grade) mathematics questions',
    parent: 'math'
  },
  {
    value: 'senior-math',
    label: 'Senior Mathematics',
    icon: Brain,
    description: 'Senior high school (10-12 grade) mathematics questions',
    parent: 'math'
  },
  {
    value: 'calculus',
    label: 'Calculus',
    icon: BookOpen,
    description: 'Calculus related questions',
    parent: 'math'
  },
  {
    value: 'linear-algebra',
    label: 'Linear Algebra',
    icon: Ruler,
    description: 'Linear algebra related questions',
    parent: 'math'
  },
  {
    value: 'probability',
    label: 'Probability & Statistics',
    icon: Calculator,
    description: 'Probability and statistics questions',
    parent: 'math'
  },
  {
    value: 'geometry',
    label: 'Geometry',
    icon: Ruler,
    description: 'Plane and solid geometry questions',
    parent: 'math'
  },
  {
    value: 'algebra',
    label: 'Algebra',
    icon: Brain,
    description: 'Algebra related questions',
    parent: 'math'
  },
  {
    value: 'number-theory',
    label: 'Number Theory',
    icon: BookOpen,
    description: 'Number theory related questions',
    parent: 'math'
  },
  {
    value: 'analysis',
    label: 'Mathematical Analysis',
    icon: Calculator,
    description: 'Mathematical analysis related questions',
    parent: 'math'
  }
];

// 获取翻译后的数学子分类
export const getMathSubCategoriesTranslated = (t: (key: string) => string): QuestionSubCategory[] => [
  {
    value: 'elementary-math',
    label: t('constants.questionCategories.mathSubcategories.elementary-math.label'),
    icon: Ruler,
    description: t('constants.questionCategories.mathSubcategories.elementary-math.description'),
    parent: 'math'
  },
  {
    value: 'junior-math',
    label: t('constants.questionCategories.mathSubcategories.junior-math.label'),
    icon: Calculator,
    description: t('constants.questionCategories.mathSubcategories.junior-math.description'),
    parent: 'math'
  },
  {
    value: 'senior-math',
    label: t('constants.questionCategories.mathSubcategories.senior-math.label'),
    icon: Brain,
    description: t('constants.questionCategories.mathSubcategories.senior-math.description'),
    parent: 'math'
  },
  {
    value: 'calculus',
    label: t('constants.questionCategories.mathSubcategories.calculus.label'),
    icon: BookOpen,
    description: t('constants.questionCategories.mathSubcategories.calculus.description'),
    parent: 'math'
  },
  {
    value: 'linear-algebra',
    label: t('constants.questionCategories.mathSubcategories.linear-algebra.label'),
    icon: Ruler,
    description: t('constants.questionCategories.mathSubcategories.linear-algebra.description'),
    parent: 'math'
  },
  {
    value: 'probability',
    label: t('constants.questionCategories.mathSubcategories.probability.label'),
    icon: Calculator,
    description: t('constants.questionCategories.mathSubcategories.probability.description'),
    parent: 'math'
  },
  {
    value: 'geometry',
    label: t('constants.questionCategories.mathSubcategories.geometry.label'),
    icon: Ruler,
    description: t('constants.questionCategories.mathSubcategories.geometry.description'),
    parent: 'math'
  },
  {
    value: 'algebra',
    label: t('constants.questionCategories.mathSubcategories.algebra.label'),
    icon: Brain,
    description: t('constants.questionCategories.mathSubcategories.algebra.description'),
    parent: 'math'
  },
  {
    value: 'number-theory',
    label: t('constants.questionCategories.mathSubcategories.number-theory.label'),
    icon: BookOpen,
    description: t('constants.questionCategories.mathSubcategories.number-theory.description'),
    parent: 'math'
  },
  {
    value: 'analysis',
    label: t('constants.questionCategories.mathSubcategories.analysis.label'),
    icon: Calculator,
    description: t('constants.questionCategories.mathSubcategories.analysis.description'),
    parent: 'math'
  }
];

// 获取所有分类（包括主分类和子分类）
export const getAllCategories = (): (QuestionCategory | QuestionSubCategory)[] => {
  return [...QUESTION_CATEGORIES, ...MATH_SUBCATEGORIES];
};

// 获取翻译后的所有分类（包括主分类和子分类）
export const getAllCategoriesTranslated = (t: (key: string) => string): (QuestionCategory | QuestionSubCategory)[] => {
  return [...getQuestionCategories(t), ...getMathSubCategoriesTranslated(t)];
};

// 获取数学相关分类（主分类 + 子分类）
export const getMathCategories = (): (QuestionCategory | QuestionSubCategory)[] => {
  return [
    QUESTION_CATEGORIES.find(cat => cat.value === 'math')!,
    ...MATH_SUBCATEGORIES
  ];
};

// 获取翻译后的数学相关分类（主分类 + 子分类）
export const getMathCategoriesTranslated = (t: (key: string) => string): (QuestionCategory | QuestionSubCategory)[] => {
  return [
    getQuestionCategories(t).find(cat => cat.value === 'math')!,
    ...getMathSubCategoriesTranslated(t)
  ];
};

// 根据分类值获取分类信息
export const getCategoryByValue = (value: string): QuestionCategory | QuestionSubCategory | undefined => {
  return getAllCategories().find(cat => cat.value === value);
};

// 根据分类值获取翻译后的分类信息
export const getCategoryByValueTranslated = (value: string, t: (key: string) => string): QuestionCategory | QuestionSubCategory | undefined => {
  return getAllCategoriesTranslated(t).find(cat => cat.value === value);
};

// 获取分类的图标
export const getCategoryIcon = (categoryValue: string) => {
  const category = getCategoryByValue(categoryValue);
  return category?.icon || FileText;
};

// 获取分类的标签
export const getCategoryLabel = (categoryValue: string): string => {
  const category = getCategoryByValue(categoryValue);
  return category?.label || 'Unknown Category';
};

// 获取翻译后的分类标签
export const getCategoryLabelTranslated = (categoryValue: string, t: (key: string) => string): string => {
  const category = getCategoryByValueTranslated(categoryValue, t);
  return category?.label || t('constants.questionCategories.unknown');
};

// 检查是否为数学分类
export const isMathCategory = (categoryValue: string): boolean => {
  return categoryValue === 'math' || MATH_SUBCATEGORIES.some(sub => sub.value === categoryValue);
};

// 获取数学子分类
export const getMathSubCategories = (): QuestionSubCategory[] => {
  return MATH_SUBCATEGORIES;
};
