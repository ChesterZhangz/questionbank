import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  Sigma, 
  Layers,
  Zap,
  BookOpen,
  Search,
  Copy,
  Eye,
  Star,
  Filter,
  SortAsc,
  SortDesc,
  Tag
} from 'lucide-react';
import { codeTemplates, type CodeTemplate } from '../../data/codeTemplates';
import LaTeXEditor from '../editor/latex/LaTeXEditor';

const CodeTemplatesSection: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'title' | 'difficulty' | 'category'>('title');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<CodeTemplate | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [favoriteTemplates, setFavoriteTemplates] = useState<Set<string>>(new Set());

  const categories = [
    { id: 'all', name: '全部', icon: BookOpen, color: 'gray' },
    { id: 'latex', name: 'LaTeX基础', icon: FileText, color: 'blue' },
    { id: 'math', name: '数学公式', icon: Sigma, color: 'green' },
    { id: 'tikz', name: 'TikZ图形', icon: Layers, color: 'purple' },
    { id: 'geometry', name: '几何图形', icon: Zap, color: 'orange' },
    { id: 'diagram', name: '图表图示', icon: Star, color: 'red' }
  ];

  const difficulties = [
    { id: 'all', name: '全部难度', color: 'gray' },
    { id: 'beginner', name: '初级', color: 'green' },
    { id: 'intermediate', name: '中级', color: 'yellow' },
    { id: 'advanced', name: '高级', color: 'red' }
  ];

  // 过滤和排序模板
  const filteredTemplates = useMemo(() => {
    let filtered = codeTemplates;

    // 分类过滤
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(template => template.category === selectedCategory);
    }

    // 难度过滤
    if (selectedDifficulty !== 'all') {
      filtered = filtered.filter(template => template.difficulty === selectedDifficulty);
    }

    // 搜索过滤
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(template =>
        template.title.toLowerCase().includes(query) ||
        template.description.toLowerCase().includes(query) ||
        template.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // 排序
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'difficulty':
          const difficultyOrder = { beginner: 1, intermediate: 2, advanced: 3 };
          comparison = difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
          break;
        case 'category':
          comparison = a.category.localeCompare(b.category);
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [selectedCategory, selectedDifficulty, searchQuery, sortBy, sortOrder]);

  // 复制代码到剪贴板
  const copyToClipboard = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      // 可以添加提示
    } catch (err) {
      console.error('复制失败:', err);
    }
  };

  // 切换收藏状态
  const toggleFavorite = (templateId: string) => {
    const newFavorites = new Set(favoriteTemplates);
    if (newFavorites.has(templateId)) {
      newFavorites.delete(templateId);
    } else {
      newFavorites.add(templateId);
    }
    setFavoriteTemplates(newFavorites);
  };

  // 获取难度颜色
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'green';
      case 'intermediate': return 'yellow';
      case 'advanced': return 'red';
      default: return 'gray';
    }
  };

  // 获取分类颜色
  const getCategoryColor = (category: string) => {
    const cat = categories.find(c => c.id === category);
    return cat ? cat.color : 'gray';
  };

  return (
    <div className="space-y-6">
      {/* 标题和描述 */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 flex items-center justify-center gap-3">
          <FileText className="w-8 h-8 text-purple-600" />
          代码模板库
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
          精选的LaTeX和TikZ代码模板，涵盖基础语法、数学公式、图形绘制等各个方面，助您快速上手
        </p>
      </div>

      {/* 搜索和过滤栏 */}
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          {/* 搜索框 */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="搜索模板、标签或描述..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            />
          </div>

          {/* 工具按钮 */}
          <div className="flex gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-3 rounded-lg border transition-all ${
                showFilters 
                  ? 'bg-purple-500 text-white border-purple-500' 
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
              title="过滤选项"
            >
              <Filter className="w-5 h-5" />
            </button>
            
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="p-3 rounded-lg border bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
              title={`${sortOrder === 'asc' ? '升序' : '降序'}排列`}
            >
              {sortOrder === 'asc' ? <SortAsc className="w-5 h-5" /> : <SortDesc className="w-5 h-5" />}
            </button>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="p-3 rounded-lg border bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="title">按标题</option>
              <option value="category">按分类</option>
              <option value="difficulty">按难度</option>
            </select>
          </div>
        </div>

        {/* 过滤选项面板 */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
            >
              <div className="space-y-4">
                {/* 分类过滤 */}
                <div>
                  <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">分类筛选</h4>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        className={`px-3 py-1 rounded-full text-sm transition-all flex items-center gap-1 ${
                          selectedCategory === category.id
                            ? `bg-${category.color}-500 text-white`
                            : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600'
                        }`}
                      >
                        <category.icon className="w-4 h-4" />
                        {category.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 难度过滤 */}
                <div>
                  <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">难度筛选</h4>
                  <div className="flex flex-wrap gap-2">
                    {difficulties.map((difficulty) => (
                      <button
                        key={difficulty.id}
                        onClick={() => setSelectedDifficulty(difficulty.id)}
                        className={`px-3 py-1 rounded-full text-sm transition-all ${
                          selectedDifficulty === difficulty.id
                            ? `bg-${difficulty.color}-500 text-white`
                            : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600'
                        }`}
                      >
                        {difficulty.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 模板网格 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredTemplates.map((template) => (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              whileHover={{ y: -2 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300"
            >
              {/* 模板头部 */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    {template.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    {template.description}
                  </p>
                </div>
                <button
                  onClick={() => toggleFavorite(template.id)}
                  className={`p-2 rounded-lg transition-colors ${
                    favoriteTemplates.has(template.id)
                      ? 'text-red-500 hover:text-red-600 bg-red-50 dark:bg-red-900/20'
                      : 'text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                  title={favoriteTemplates.has(template.id) ? '取消收藏' : '收藏'}
                >
                  <Star className={`w-5 h-5 ${favoriteTemplates.has(template.id) ? 'fill-current' : ''}`} />
                </button>
              </div>

              {/* 标签和分类 */}
              <div className="flex items-center gap-2 mb-4">
                <span className={`px-2 py-1 rounded-full text-xs font-medium bg-${getCategoryColor(template.category)}-100 dark:bg-${getCategoryColor(template.category)}-900/30 text-${getCategoryColor(template.category)}-700 dark:text-${getCategoryColor(template.category)}-300`}>
                  {template.category}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium bg-${getDifficultyColor(template.difficulty)}-100 dark:bg-${getDifficultyColor(template.difficulty)}-900/30 text-${getDifficultyColor(template.difficulty)}-700 dark:text-${getDifficultyColor(template.difficulty)}-300`}>
                  {template.difficulty}
                </span>
              </div>

              {/* 标签 */}
              <div className="flex flex-wrap gap-1 mb-4">
                {template.tags.slice(0, 3).map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded text-xs flex items-center gap-1"
                  >
                    <Tag className="w-3 h-3" />
                    {tag}
                  </span>
                ))}
                {template.tags.length > 3 && (
                  <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded text-xs">
                    +{template.tags.length - 3}
                  </span>
                )}
              </div>

              {/* 操作按钮 */}
              <div className="flex gap-2">
                <button
                  onClick={() => copyToClipboard(template.code)}
                  className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-2 px-3 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm flex items-center justify-center gap-2"
                >
                  <Copy className="w-4 h-4" />
                  复制
                </button>
                <button
                  onClick={() => {
                    setSelectedTemplate(template);
                    setShowPreview(true);
                  }}
                  className="flex-1 bg-purple-500 text-white py-2 px-3 rounded-lg hover:bg-purple-600 transition-colors text-sm flex items-center justify-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  预览
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* 空状态 */}
      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-600 dark:text-gray-400 mb-2">
            没有找到匹配的模板
          </h3>
          <p className="text-gray-500 dark:text-gray-500">
            尝试调整搜索条件或清空筛选器
          </p>
        </div>
      )}

      {/* 预览模态框 */}
      <AnimatePresence>
        {showPreview && selectedTemplate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowPreview(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                    {selectedTemplate.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    {selectedTemplate.description}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => copyToClipboard(selectedTemplate.code)}
                    className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    title="复制代码"
                  >
                    <Copy className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setShowPreview(false)}
                    className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                  >
                    ✕
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                <LaTeXEditor
                  value={selectedTemplate.code}
                  onChange={() => {}}
                  showPreview={true}
                  simplified={false}
                  placeholder="代码模板预览"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CodeTemplatesSection;
