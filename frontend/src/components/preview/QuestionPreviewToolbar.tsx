import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { FuzzySelect, MultiSelect } from '../ui/menu';
import { 
  Grid3X3, 
  List, 
  Search, 
  Filter, 
  RotateCcw,
  CheckSquare,
  Square,
  Move,
  Brain,
  Target,
  Save,
  Trash2,
  Loader2
} from 'lucide-react';
import type { FilterState, SortOption } from '../../stores/questionPreviewStore';
import { AnimatePresence } from 'framer-motion';
import { useTranslation } from '../../hooks/useTranslation';

interface QuestionPreviewToolbarProps {
  viewMode: 'grid' | 'list';
  searchTerm: string;
  filters: FilterState;
  sortBy: SortOption;
  selectedCount: number;
  totalCount: number;
  analyzingQuestions?: string[];
  onViewModeChange: (mode: 'grid' | 'list') => void;
  onSearchChange: (term: string) => void;
  onFiltersChange: (filters: FilterState) => void;
  onSortChange: (sort: SortOption) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onBatchSetSource: () => void;
  onBatchAnalysis: () => void;
  onBatchMove: () => void;
  onBatchDelete: () => void;
  onSave: () => void;
}

const QuestionPreviewToolbar: React.FC<QuestionPreviewToolbarProps> = ({
  viewMode,
  searchTerm,
  filters,
  sortBy,
  selectedCount,
  analyzingQuestions = [],
  onViewModeChange,
  onSearchChange,
  onFiltersChange,
  onSortChange,
  onSelectAll,
  onDeselectAll,
  onBatchSetSource,
  onBatchAnalysis,
  onBatchMove,
  onBatchDelete,
  onSave,
}) => {
  const { t } = useTranslation();
  const [showFilters, setShowFilters] = useState(false);

  const questionTypes = [
    { value: 'choice', label: '选择题' },
    { value: 'fill', label: '填空题' },
    { value: 'solution', label: '解答题' }
  ];

  const difficultyLevels = [
    { value: 1, label: '简单' },
    { value: 2, label: '较简单' },
    { value: 3, label: '中等' },
    { value: 4, label: '较难' },
    { value: 5, label: '困难' }
  ];

  const sortOptions = [
    { value: 'original', label: '保持原始顺序' },
    { value: 'createdAt-desc', label: '创建时间 (最新)' },
    { value: 'createdAt-asc', label: '创建时间 (最早)' },
    { value: 'updatedAt-desc', label: '更新时间 (最新)' },
    { value: 'updatedAt-asc', label: '更新时间 (最早)' },
    { value: 'difficulty-asc', label: '难度 (简单到难)' },
    { value: 'difficulty-desc', label: '难度 (难到简单)' },
    { value: 'type-asc', label: '类型 (A-Z)' },
    { value: 'title-asc', label: '标题 (A-Z)' }
  ];

  const handleSortChange = (value: string) => {
    if (value === 'original') {
      // 保持原始顺序，不进行排序
      onSortChange({ field: 'createdAt', order: 'desc' });
    } else {
      const [field, order] = value.split('-') as [SortOption['field'], SortOption['order']];
      onSortChange({ field, order });
    }
  };

  const handleFilterChange = (key: keyof FilterState, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const resetFilters = () => {
    onFiltersChange({
      type: [],
      difficulty: [],
      tags: [],
      source: []
    });
    onSearchChange('');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6"
    >
      <Card className="p-4">
        <div className="flex flex-col space-y-4">
          {/* 主要工具栏 */}
          <div className="flex items-center justify-between flex-wrap gap-4">
            {/* 左侧工具 */}
            <div className="flex items-center space-x-2">
              {/* 视图切换 */}
              <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => onViewModeChange('grid')}
                  className="flex items-center space-x-1"
                >
                  <Grid3X3 className="h-4 w-4" />
                  <span>{t('preview.questionPreviewToolbar.grid')}</span>
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => onViewModeChange('list')}
                  className="flex items-center space-x-1"
                >
                  <List className="h-4 w-4" />
                  <span>{t('preview.questionPreviewToolbar.list')}</span>
                </Button>
              </div>

              {/* 选择操作 */}
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onSelectAll}
                  className="flex items-center space-x-1"
                >
                  <CheckSquare className="h-4 w-4" />
                  <span>{t('preview.questionPreviewToolbar.selectAll')}</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onDeselectAll}
                  className="flex items-center space-x-1"
                >
                  <Square className="h-4 w-4" />
                  <span>{t('preview.questionPreviewToolbar.deselectAll')}</span>
                </Button>
              </div>
            </div>

            {/* 右侧操作 */}
            <div className="flex items-center space-x-2">
              {selectedCount > 0 && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onBatchSetSource}
                    className="flex items-center space-x-1"
                  >
                    <Target className="h-4 w-4" />
                    <span>{t('preview.questionPreviewToolbar.setSource')}</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onBatchAnalysis}
                    disabled={analyzingQuestions.length > 0}
                    className="flex items-center space-x-1"
                  >
                    {analyzingQuestions.length > 0 ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Brain className="h-4 w-4" />
                    )}
                    <span>{analyzingQuestions.length > 0 ? t('preview.questionPreviewToolbar.analyzing') : t('preview.questionPreviewToolbar.aiAnalysis')}</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onBatchMove}
                    className="flex items-center space-x-1"
                  >
                    <Move className="h-4 w-4" />
                    <span>{t('preview.questionPreviewToolbar.batchMove')}</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onSave}
                    className="flex items-center space-x-1"
                  >
                    <Save className="h-4 w-4" />
                    <span>{t('preview.questionPreviewToolbar.save')}</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onBatchDelete}
                    className="flex items-center space-x-1 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>{t('preview.questionPreviewToolbar.delete')}</span>
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* 搜索和筛选 */}
          <div className="flex items-center space-x-4 flex-wrap">
            {/* 搜索框 */}
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                <Input
                  type="text"
                  placeholder={t('preview.questionPreviewToolbar.searchPlaceholder')}
                  value={searchTerm}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* 筛选按钮 */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-1"
            >
              <Filter className="h-4 w-4" />
              <span>{t('preview.questionPreviewToolbar.filter')}</span>
            </Button>

            {/* 重置按钮 */}
            <Button
              variant="outline"
              size="sm"
              onClick={resetFilters}
              className="flex items-center space-x-1"
            >
              <RotateCcw className="h-4 w-4" />
              <span>{t('preview.questionPreviewToolbar.reset')}</span>
            </Button>

            {/* 排序选择 */}
            <div className="min-w-48">
              <FuzzySelect
                options={sortOptions}
                value={sortBy.field === 'createdAt' && sortBy.order === 'desc' ? 'original' : `${sortBy.field}-${sortBy.order}`}
                onChange={(value) => handleSortChange(value.toString())}
                placeholder={t('preview.questionPreviewToolbar.sortPlaceholder')}
                className="w-full"
              />
            </div>
          </div>

          {/* 筛选面板 */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="border-t border-gray-200 dark:border-gray-700 pt-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* 题目类型筛选 */}
                  <div>
                    <MultiSelect
                      options={questionTypes}
                      value={filters.type}
                      onChange={(value) => handleFilterChange('type', value)}
                      placeholder="选择题目类型"
                      label="题目类型"
                      className="w-full"
                    />
                  </div>

                  {/* 难度等级筛选 */}
                  <div>
                    <MultiSelect
                      options={difficultyLevels}
                      value={filters.difficulty}
                      onChange={(value) => handleFilterChange('difficulty', value)}
                      placeholder="选择难度等级"
                      label="难度等级"
                      className="w-full"
                    />
                  </div>

                  {/* 标签筛选 */}
                  <div>
                    <MultiSelect
                      options={[]} // 这里需要从题目中提取所有标签
                      value={filters.tags}
                      onChange={(value) => handleFilterChange('tags', value)}
                      placeholder="选择标签"
                      label="标签"
                      className="w-full"
                    />
                  </div>

                  {/* 来源筛选 */}
                  <div>
                    <MultiSelect
                      options={[]} // 这里需要从题目中提取所有来源
                      value={filters.source}
                      onChange={(value) => handleFilterChange('source', value)}
                      placeholder="选择来源"
                      label="来源"
                      className="w-full"
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Card>
    </motion.div>
  );
};

export default QuestionPreviewToolbar; 