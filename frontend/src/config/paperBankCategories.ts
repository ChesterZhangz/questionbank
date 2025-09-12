import { 
  Calculator, 
  Atom, 
  TrendingUp, 
  Hash, 
  Grid3X3, 
  Network, 
  CircleDot, 
  BarChart3, 
  Dice6, 
  Zap, 
  Thermometer, 
  Magnet, 
  Eye, 
  Clock, 
  Radiation, 
  Telescope, 
  Box,
  Target,
  Pi,
  Infinity,
  Square,
  Divide,
  Plus,
  Equal
} from 'lucide-react';
// 试卷集分类配置
export interface PaperBankCategory {
  value: string;
  label: string;
  icon: any;
  subcategories?: PaperBankSubcategory[];
}

export interface PaperBankSubcategory {
  value: string;
  label: string;
  icon: any;
}

// 默认分类配置（向后兼容）
export const paperBankCategories: PaperBankCategory[] = [
  {
    value: 'mathematics',
    label: 'Mathematics',
    icon: Calculator,
    subcategories: [
      // 按教育阶段分类
      { value: 'primary-math', label: 'Primary Mathematics', icon: Plus },
      { value: 'junior-math', label: 'Junior Mathematics', icon: Target },
      { value: 'senior-math', label: 'Senior Mathematics', icon: Hash },
      // 大学数学课程
      { value: 'calculus', label: 'Calculus', icon: TrendingUp },
      { value: 'linear-algebra', label: 'Linear Algebra', icon: Grid3X3 },
      { value: 'mathematical-analysis', label: 'Mathematical Analysis', icon: Pi },
      { value: 'probability-statistics', label: 'Probability and Statistics', icon: Dice6 },
      { value: 'discrete-mathematics', label: 'Discrete Mathematics', icon: Network },
      { value: 'differential-equations', label: 'Differential Equations', icon: Equal },
      { value: 'complex-analysis', label: 'Complex Analysis', icon: Infinity },
      { value: 'real-analysis', label: 'Real Analysis', icon: Square },
      { value: 'abstract-algebra', label: 'Abstract Algebra', icon: Divide },
      { value: 'topology', label: 'Topology', icon: CircleDot },
      { value: 'functional-analysis', label: 'Functional Analysis', icon: TrendingUp },
      { value: 'numerical-analysis', label: 'Numerical Analysis', icon: BarChart3 }
    ]
  },
  {
    value: 'physics',
    label: 'Physics',
    icon: Atom,
    subcategories: [
      // 按教育阶段分类
      { value: 'junior-physics', label: 'Junior Physics', icon: Zap },
      { value: 'senior-physics', label: 'Senior Physics', icon: Telescope },
      { value: 'mechanics', label: 'Mechanics', icon: Zap },
      { value: 'thermodynamics', label: 'Thermodynamics', icon: Thermometer },
      { value: 'electromagnetism', label: 'Electromagnetism', icon: Magnet },
      { value: 'optics', label: 'Optics', icon: Eye },
      { value: 'quantum', label: 'Quantum Physics', icon: Atom },
      { value: 'relativity', label: 'Relativity', icon: Clock },
      { value: 'nuclear', label: 'Nuclear Physics', icon: Radiation },
      { value: 'particle', label: 'Particle Physics', icon: CircleDot },
      { value: 'astrophysics', label: 'Astrophysics', icon: Telescope },
      { value: 'condensed-matter', label: 'Condensed Matter Physics', icon: Box },
      { value: 'wave-physics', label: 'Wave Physics', icon: TrendingUp },
      { value: 'acoustics', label: 'Acoustics', icon: TrendingUp },
      { value: 'fluid-mechanics', label: 'Fluid Mechanics', icon: TrendingUp },
      { value: 'solid-mechanics', label: 'Solid Mechanics', icon: Box }
    ]
  }
];

// 获取翻译后的分类配置
export const getPaperBankCategories = (t: (key: string) => string): PaperBankCategory[] => [
  {
    value: 'mathematics',
    label: t('config.paperBankCategories.categories.mathematics.label'),
    icon: Calculator,
    subcategories: [
      // 按教育阶段分类
      { value: 'primary-math', label: t('config.paperBankCategories.categories.mathematics.subcategories.primary-math'), icon: Plus },
      { value: 'junior-math', label: t('config.paperBankCategories.categories.mathematics.subcategories.junior-math'), icon: Target },
      { value: 'senior-math', label: t('config.paperBankCategories.categories.mathematics.subcategories.senior-math'), icon: Hash },
      // 大学数学课程
      { value: 'calculus', label: t('config.paperBankCategories.categories.mathematics.subcategories.calculus'), icon: TrendingUp },
      { value: 'linear-algebra', label: t('config.paperBankCategories.categories.mathematics.subcategories.linear-algebra'), icon: Grid3X3 },
      { value: 'mathematical-analysis', label: t('config.paperBankCategories.categories.mathematics.subcategories.mathematical-analysis'), icon: Pi },
      { value: 'probability-statistics', label: t('config.paperBankCategories.categories.mathematics.subcategories.probability-statistics'), icon: Dice6 },
      { value: 'discrete-mathematics', label: t('config.paperBankCategories.categories.mathematics.subcategories.discrete-mathematics'), icon: Network },
      { value: 'differential-equations', label: t('config.paperBankCategories.categories.mathematics.subcategories.differential-equations'), icon: Equal },
      { value: 'complex-analysis', label: t('config.paperBankCategories.categories.mathematics.subcategories.complex-analysis'), icon: Infinity },
      { value: 'real-analysis', label: t('config.paperBankCategories.categories.mathematics.subcategories.real-analysis'), icon: Square },
      { value: 'abstract-algebra', label: t('config.paperBankCategories.categories.mathematics.subcategories.abstract-algebra'), icon: Divide },
      { value: 'topology', label: t('config.paperBankCategories.categories.mathematics.subcategories.topology'), icon: CircleDot },
      { value: 'functional-analysis', label: t('config.paperBankCategories.categories.mathematics.subcategories.functional-analysis'), icon: TrendingUp },
      { value: 'numerical-analysis', label: t('config.paperBankCategories.categories.mathematics.subcategories.numerical-analysis'), icon: BarChart3 }
    ]
  },
  {
    value: 'physics',
    label: t('config.paperBankCategories.categories.physics.label'),
    icon: Atom,
    subcategories: [
      // 按教育阶段分类
      { value: 'junior-physics', label: t('config.paperBankCategories.categories.physics.subcategories.junior-physics'), icon: Zap },
      { value: 'senior-physics', label: t('config.paperBankCategories.categories.physics.subcategories.senior-physics'), icon: Telescope },
      { value: 'mechanics', label: t('config.paperBankCategories.categories.physics.subcategories.mechanics'), icon: Zap },
      { value: 'thermodynamics', label: t('config.paperBankCategories.categories.physics.subcategories.thermodynamics'), icon: Thermometer },
      { value: 'electromagnetism', label: t('config.paperBankCategories.categories.physics.subcategories.electromagnetism'), icon: Magnet },
      { value: 'optics', label: t('config.paperBankCategories.categories.physics.subcategories.optics'), icon: Eye },
      { value: 'quantum', label: t('config.paperBankCategories.categories.physics.subcategories.quantum'), icon: Atom },
      { value: 'relativity', label: t('config.paperBankCategories.categories.physics.subcategories.relativity'), icon: Clock },
      { value: 'nuclear', label: t('config.paperBankCategories.categories.physics.subcategories.nuclear'), icon: Radiation },
      { value: 'particle', label: t('config.paperBankCategories.categories.physics.subcategories.particle'), icon: CircleDot },
      { value: 'astrophysics', label: t('config.paperBankCategories.categories.physics.subcategories.astrophysics'), icon: Telescope },
      { value: 'condensed-matter', label: t('config.paperBankCategories.categories.physics.subcategories.condensed-matter'), icon: Box },
      { value: 'wave-physics', label: t('config.paperBankCategories.categories.physics.subcategories.wave-physics'), icon: TrendingUp },
      { value: 'acoustics', label: t('config.paperBankCategories.categories.physics.subcategories.acoustics'), icon: TrendingUp },
      { value: 'fluid-mechanics', label: t('config.paperBankCategories.categories.physics.subcategories.fluid-mechanics'), icon: TrendingUp },
      { value: 'solid-mechanics', label: t('config.paperBankCategories.categories.physics.subcategories.solid-mechanics'), icon: Box }
    ]
  }
];

// 获取所有分类选项（用于筛选器）
export const getCategoryOptions = (t: (key: string) => string) => {
  const categories = getPaperBankCategories(t);
  return [
    { value: 'all', label: t('config.paperBankCategories.allCategories'), icon: Grid3X3 },
    ...categories.map(cat => ({
      value: cat.value,
      label: cat.label,
      icon: cat.icon
    }))
  ];
};

// 获取指定分类的子分类选项
export const getSubcategoryOptions = (categoryValue: string, t: (key: string) => string) => {
  const categories = getPaperBankCategories(t);
  const category = categories.find(cat => cat.value === categoryValue);
  if (!category || !category.subcategories) {
    return [];
  }
  
  return [
    { value: 'all', label: t('config.paperBankCategories.allSubcategories'), icon: Grid3X3 },
    ...category.subcategories.map(sub => ({
      value: sub.value,
      label: sub.label,
      icon: sub.icon
    }))
  ];
};

// 根据分类值获取分类信息
export const getCategoryInfo = (categoryValue: string, t: (key: string) => string) => {
  const categories = getPaperBankCategories(t);
  return categories.find(cat => cat.value === categoryValue);
};

// 根据子分类值获取子分类信息
export const getSubcategoryInfo = (categoryValue: string, subcategoryValue: string, t: (key: string) => string) => {
  const category = getCategoryInfo(categoryValue, t);
  if (!category || !category.subcategories) {
    return null;
  }
  return category.subcategories.find(sub => sub.value === subcategoryValue);
};
