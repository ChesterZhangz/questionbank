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

export const paperBankCategories: PaperBankCategory[] = [
  {
    value: 'mathematics',
    label: '数学',
    icon: Calculator,
    subcategories: [
      // 按教育阶段分类
      { value: 'primary-math', label: '小学数学', icon: Plus },
      { value: 'junior-math', label: '初中数学', icon: Target },
      { value: 'senior-math', label: '高中数学', icon: Hash },
      // 大学数学课程
      { value: 'calculus', label: '微积分', icon: TrendingUp },
      { value: 'linear-algebra', label: '线性代数', icon: Grid3X3 },
      { value: 'mathematical-analysis', label: '数学分析', icon: Pi },
      { value: 'probability-statistics', label: '概率论与数理统计', icon: Dice6 },
      { value: 'discrete-mathematics', label: '离散数学', icon: Network },
      { value: 'differential-equations', label: '微分方程', icon: Equal },
      { value: 'complex-analysis', label: '复变函数', icon: Infinity },
      { value: 'real-analysis', label: '实变函数', icon: Square },
      { value: 'abstract-algebra', label: '抽象代数', icon: Divide },
      { value: 'topology', label: '拓扑学', icon: CircleDot },
      { value: 'functional-analysis', label: '泛函分析', icon: TrendingUp },
      { value: 'numerical-analysis', label: '数值分析', icon: BarChart3 }
    ]
  },
  {
    value: 'physics',
    label: '物理',
    icon: Atom,
    subcategories: [
      // 按教育阶段分类
      { value: 'junior-physics', label: '初中物理', icon: Zap },
      { value: 'senior-physics', label: '高中物理', icon: Telescope },
      { value: 'mechanics', label: '力学', icon: Zap },
      { value: 'thermodynamics', label: '热力学', icon: Thermometer },
      { value: 'electromagnetism', label: '电磁学', icon: Magnet },
      { value: 'optics', label: '光学', icon: Eye },
      { value: 'quantum', label: '量子物理', icon: Atom },
      { value: 'relativity', label: '相对论', icon: Clock },
      { value: 'nuclear', label: '核物理', icon: Radiation },
      { value: 'particle', label: '粒子物理', icon: CircleDot },
      { value: 'astrophysics', label: '天体物理', icon: Telescope },
      { value: 'condensed-matter', label: '凝聚态物理', icon: Box },
      { value: 'wave-physics', label: '波动学', icon: TrendingUp },
      { value: 'acoustics', label: '声学', icon: TrendingUp },
      { value: 'fluid-mechanics', label: '流体力学', icon: TrendingUp },
      { value: 'solid-mechanics', label: '固体力学', icon: Box }
    ]
  }
];

// 获取所有分类选项（用于筛选器）
export const getCategoryOptions = () => {
  return [
    { value: 'all', label: '全部分类', icon: Grid3X3 },
    ...paperBankCategories.map(cat => ({
      value: cat.value,
      label: cat.label,
      icon: cat.icon
    }))
  ];
};

// 获取指定分类的子分类选项
export const getSubcategoryOptions = (categoryValue: string) => {
  const category = paperBankCategories.find(cat => cat.value === categoryValue);
  if (!category || !category.subcategories) {
    return [];
  }
  
  return [
    { value: 'all', label: '全部子分类', icon: Grid3X3 },
    ...category.subcategories.map(sub => ({
      value: sub.value,
      label: sub.label,
      icon: sub.icon
    }))
  ];
};

// 根据分类值获取分类信息
export const getCategoryInfo = (categoryValue: string) => {
  return paperBankCategories.find(cat => cat.value === categoryValue);
};

// 根据子分类值获取子分类信息
export const getSubcategoryInfo = (categoryValue: string, subcategoryValue: string) => {
  const category = getCategoryInfo(categoryValue);
  if (!category || !category.subcategories) {
    return null;
  }
  return category.subcategories.find(sub => sub.value === subcategoryValue);
};
