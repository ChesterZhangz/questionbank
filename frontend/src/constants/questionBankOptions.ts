// 题库相关预设选项

// 题库分类选项（向后兼容）
export const QUESTION_BANK_CATEGORIES = [
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'Computer Science',
  'Chinese',
  'English',
  'History',
  'Geography',
  'Politics',
  'Other'
] as const;

// 题库分类类型
export type QuestionBankCategory = typeof QUESTION_BANK_CATEGORIES[number];

// 获取翻译后的题库分类选项
export const getQuestionBankCategories = (t: (key: string) => string) => [
  t('constants.questionBankOptions.categories.mathematics'),
  t('constants.questionBankOptions.categories.physics'),
  t('constants.questionBankOptions.categories.chemistry'),
  t('constants.questionBankOptions.categories.biology'),
  t('constants.questionBankOptions.categories.computer'),
  t('constants.questionBankOptions.categories.chinese'),
  t('constants.questionBankOptions.categories.english'),
  t('constants.questionBankOptions.categories.history'),
  t('constants.questionBankOptions.categories.geography'),
  t('constants.questionBankOptions.categories.politics'),
  t('constants.questionBankOptions.categories.other')
];

// 题库导出模板选项（向后兼容）
export const EXPORT_TEMPLATES = [
  { value: 'default', label: 'Default Template' },
  { value: 'simple', label: 'Simple Template' },
  { value: 'detailed', label: 'Detailed Template' },
  { value: 'custom', label: 'Custom Template' }
] as const;

// 获取翻译后的导出模板选项
export const getExportTemplates = (t: (key: string) => string) => [
  { value: 'default', label: t('constants.questionBankOptions.exportTemplates.default') },
  { value: 'simple', label: t('constants.questionBankOptions.exportTemplates.simple') },
  { value: 'detailed', label: t('constants.questionBankOptions.exportTemplates.detailed') },
  { value: 'custom', label: t('constants.questionBankOptions.exportTemplates.custom') }
];

// 备份频率选项（向后兼容）
export const BACKUP_FREQUENCIES = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' }
] as const;

// 获取翻译后的备份频率选项
export const getBackupFrequencies = (t: (key: string) => string) => [
  { value: 'daily', label: t('constants.questionBankOptions.backupFrequencies.daily') },
  { value: 'weekly', label: t('constants.questionBankOptions.backupFrequencies.weekly') },
  { value: 'monthly', label: t('constants.questionBankOptions.backupFrequencies.monthly') }
];

// 题库状态选项（向后兼容）
export const QUESTION_BANK_STATUSES = [
  { value: 'active', label: 'Active' },
  { value: 'archived', label: 'Archived' },
  { value: 'deleted', label: 'Deleted' }
] as const;

// 获取翻译后的题库状态选项
export const getQuestionBankStatuses = (t: (key: string) => string) => [
  { value: 'active', label: t('constants.questionBankOptions.statuses.active') },
  { value: 'archived', label: t('constants.questionBankOptions.statuses.archived') },
  { value: 'deleted', label: t('constants.questionBankOptions.statuses.deleted') }
];
