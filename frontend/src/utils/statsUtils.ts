import type { Question, QuestionBank } from '../types';

// 题型颜色配置
export const getQuestionTypeColor = (type: string) => {
  switch (type) {
    case 'choice': return {
      bg: 'from-blue-50 to-indigo-50',
      border: 'border-blue-200',
      dot: 'bg-blue-500',
      text: 'text-blue-700'
    };
    case 'multiple-choice': return {
      bg: 'from-purple-50 to-violet-50',
      border: 'border-purple-200',
      dot: 'bg-purple-500',
      text: 'text-purple-700'
    };
    case 'fill': return {
      bg: 'from-green-50 to-emerald-50',
      border: 'border-green-200',
      dot: 'bg-green-500',
      text: 'text-green-700'
    };
    case 'solution': return {
      bg: 'from-orange-50 to-amber-50',
      border: 'border-orange-200',
      dot: 'bg-orange-500',
      text: 'text-orange-700'
    };
    default: return {
      bg: 'from-gray-50 to-slate-50',
      border: 'border-gray-200',
      dot: 'bg-gray-500',
      text: 'text-gray-700'
    };
  }
};

// 获取题型标签
export const getQuestionTypeLabel = (type: string) => {
  switch (type) {
    case 'choice': return '选择题';
    case 'multiple-choice': return '多选题';
    case 'fill': return '填空题';
    case 'solution': return '解答题';
    default: return '未知';
  }
};

// 计算题型统计并获取数量最多的题型
export const getTopQuestionTypes = (questions: Question[]) => {
  if (!questions.length) return [];
  
  const typeStats = questions.reduce((acc, question) => {
    const type = question.type;
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  // 按数量排序，取前2个
  const sortedTypes = Object.entries(typeStats)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 2);
  
  return sortedTypes.map(([type, count]) => ({
    type,
    count,
    label: getQuestionTypeLabel(type),
    color: getQuestionTypeColor(type)
  }));
};

// 计算用户角色统计
export const getUserRoleStats = (questionBanks: QuestionBank[], userId: string) => {
  const userCreatedCount = questionBanks.filter(bank => bank.creator._id === userId).length;
  const userManagedCount = questionBanks.filter(bank => bank.managers.some(m => m._id === userId)).length;
  const userCollaboratedCount = questionBanks.filter(bank => bank.collaborators.some(c => c._id === userId)).length;
  
  const stats = [
    { 
      label: '我创建的', 
      count: userCreatedCount, 
      color: {
        bg: 'from-green-50 to-emerald-50',
        border: 'border-green-200',
        dot: 'bg-green-500',
        text: 'text-green-700'
      }
    },
    { 
      label: '我管理的', 
      count: userManagedCount, 
      color: {
        bg: 'from-purple-50 to-violet-50',
        border: 'border-purple-200',
        dot: 'bg-purple-500',
        text: 'text-purple-700'
      }
    },
    { 
      label: '我参与的', 
      count: userCollaboratedCount, 
      color: {
        bg: 'from-orange-50 to-amber-50',
        border: 'border-orange-200',
        dot: 'bg-orange-500',
        text: 'text-orange-700'
      }
    }
  ].filter(stat => stat.count > 0); // 只显示非零统计
  
  return stats;
};

// 计算难度统计
export const getDifficultyStats = (questions: Question[]) => {
  if (!questions.length) return [];
  
  const difficultyStats = questions.reduce((acc, question) => {
    const difficulty = question.difficulty;
    acc[difficulty] = (acc[difficulty] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);
  
  // 按数量排序，取前2个
  const sortedDifficulties = Object.entries(difficultyStats)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 2);
  
  return sortedDifficulties.map(([difficulty, count]) => ({
    difficulty: parseInt(difficulty),
    count,
    label: `${difficulty}星难度`,
    color: getDifficultyColor(parseInt(difficulty))
  }));
};

// 获取难度颜色
export const getDifficultyColor = (difficulty: number) => {
  switch (difficulty) {
    case 1: return {
      bg: 'from-emerald-50 to-green-50',
      border: 'border-emerald-200',
      dot: 'bg-emerald-500',
      text: 'text-emerald-700'
    };
    case 2: return {
      bg: 'from-amber-50 to-yellow-50',
      border: 'border-amber-200',
      dot: 'bg-amber-500',
      text: 'text-amber-700'
    };
    case 3: return {
      bg: 'from-orange-50 to-amber-50',
      border: 'border-orange-200',
      dot: 'bg-orange-500',
      text: 'text-orange-700'
    };
    case 4: return {
      bg: 'from-red-50 to-pink-50',
      border: 'border-red-200',
      dot: 'bg-red-500',
      text: 'text-red-700'
    };
    case 5: return {
      bg: 'from-purple-50 to-violet-50',
      border: 'border-purple-200',
      dot: 'bg-purple-500',
      text: 'text-purple-700'
    };
    default: return {
      bg: 'from-gray-50 to-slate-50',
      border: 'border-gray-200',
      dot: 'bg-gray-500',
      text: 'text-gray-700'
    };
  }
}; 