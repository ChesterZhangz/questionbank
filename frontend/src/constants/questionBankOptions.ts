// 题库相关预设选项

// 题库分类选项
export const QUESTION_BANK_CATEGORIES = [
  '数学',
  '物理',
  '化学',
  '生物',
  '计算机',
  '语文',
  '英语',
  '历史',
  '地理',
  '政治',
  '其他'
] as const;

// 题库分类类型
export type QuestionBankCategory = typeof QUESTION_BANK_CATEGORIES[number];

// 题库导出模板选项
export const EXPORT_TEMPLATES = [
  { value: 'default', label: '默认模板' },
  { value: 'simple', label: '简洁模板' },
  { value: 'detailed', label: '详细模板' },
  { value: 'custom', label: '自定义模板' }
] as const;

// 备份频率选项
export const BACKUP_FREQUENCIES = [
  { value: 'daily', label: '每日' },
  { value: 'weekly', label: '每周' },
  { value: 'monthly', label: '每月' }
] as const;

// 题库状态选项
export const QUESTION_BANK_STATUSES = [
  { value: 'active', label: '活跃' },
  { value: 'archived', label: '已归档' },
  { value: 'deleted', label: '已删除' }
] as const;
