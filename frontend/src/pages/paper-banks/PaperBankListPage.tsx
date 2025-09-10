import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Plus, 
  FileText, 
  Users, 
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Star,
  Download,
  Search,
  ClipboardList,
  Filter,
  RefreshCw,
  TrendingUp,
  Clock,
  DollarSign,
  BarChart3,
  Tag
} from 'lucide-react';

import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import DynamicStats from '../../components/ui/DynamicStats';
import LoadingPage from '../../components/ui/LoadingPage';
import ConfirmModal from '../../components/ui/ConfirmModal';
import RightSlideModal from '../../components/ui/RightSlideModal';
import { useModal } from '../../hooks/useModal';
import Input from '../../components/ui/Input';
import { FuzzySelect } from '../../components/ui/menu';
import { paperBankAPI } from '../../services/api';
import { getCategoryOptions, getSubcategoryOptions, paperBankCategories } from '../../config/paperBankCategories';
import TagSelector from '../../components/ui/TagSelector';

// 试卷集接口定义
interface PaperBank {
  _id: string;
  name: string;
  description: string;
  avatar?: string;
  status: 'draft' | 'published';
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  category: string;
  subcategory?: string;
  price: number;
  memberCount: number;
  paperCount: number;
  rating: number;
  purchaseCount: number;
  customTags: string[]; // 用户自定义标签
}

const PaperBankListPage: React.FC = () => {
  const navigate = useNavigate();


  // 弹窗状态管理
  const { 
    showConfirm, 
    confirmModal, 
    closeConfirm,
    showErrorRightSlide,
    rightSlideModal,
    closeRightSlide,
    showSuccessRightSlide,
    setConfirmLoading
  } = useModal();

  // 状态管理
  const [paperBanks, setPaperBanks] = useState<PaperBank[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // 真实数据获取
  useEffect(() => {
    fetchPaperBanks();
  }, []);

  const fetchPaperBanks = async () => {
    try {
      setLoading(true);
      // 使用getMyPapers API来获取用户有权限访问的所有试卷集（包括被邀请的）
      const response = await paperBankAPI.getMyPapers({
        search: searchTerm,
        category: selectedCategory === 'all' ? '' : selectedCategory,
        subcategory: selectedSubcategory === 'all' ? '' : selectedSubcategory,
        status: selectedStatus === 'all' ? '' : selectedStatus,
        sortBy,
        sortOrder,
        page: 1,
        limit: 100
      });
      
      if (response.data.success) {
        // getMyPapers返回的是papers字段，不是paperBanks字段
        setPaperBanks(response.data.data.papers || []);
      } else {
        setError('获取试卷集列表失败');
      }
    } catch (error: any) {
      setError(error.response?.data?.error || '获取试卷集列表失败');
    } finally {
      setLoading(false);
    }
  };

  // 统计数据
  const stats = [
    { 
      label: '已发布', 
      count: paperBanks.filter(bank => bank.status === 'published').length, 
      color: {
        bg: 'from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30',
        border: 'border-green-200 dark:border-green-700',
        dot: 'bg-green-500',
        text: 'text-green-700 dark:text-green-300'
      }
    },
    { 
      label: '草稿状态', 
      count: paperBanks.filter(bank => bank.status === 'draft').length, 
      color: {
        bg: 'from-yellow-50 to-amber-50 dark:from-yellow-900/30 dark:to-amber-900/30',
        border: 'border-yellow-200 dark:border-yellow-700',
        dot: 'bg-yellow-500',
        text: 'text-yellow-700 dark:text-yellow-300'
      }
    },
    { 
      label: '总收入', 
      count: paperBanks.reduce((sum, bank) => sum + bank.purchaseCount * bank.price, 0), 
      color: {
        bg: 'from-purple-50 to-violet-50 dark:from-purple-900/30 dark:to-violet-900/30',
        border: 'border-purple-200 dark:border-purple-700',
        dot: 'bg-purple-500',
        text: 'text-purple-700 dark:text-purple-300'
      }
    }
  ];

  // 筛选后的试卷集
  const filteredPaperBanks = paperBanks.filter(bank => {
    const matchesSearch = searchTerm === '' || 
                         bank.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         bank.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (bank.customTags && bank.customTags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())));
    
    const matchesCategory = selectedCategory === 'all' || bank.category === selectedCategory;
    const matchesSubcategory = selectedSubcategory === 'all' || bank.subcategory === selectedSubcategory;
    const matchesStatus = selectedStatus === 'all' || bank.status === selectedStatus;
    const matchesTags = selectedTags.length === 0 || 
                       selectedTags.some(selectedTag => 
                         bank.customTags && bank.customTags.includes(selectedTag)
                       );

    return matchesSearch && matchesCategory && matchesSubcategory && matchesStatus && matchesTags;
  });

  // 排序后的试卷集
  const sortedPaperBanks = [...filteredPaperBanks].sort((a, b) => {
    let aValue: any, bValue: any;
    
    switch (sortBy) {
      case 'name':
        aValue = a.name;
        bValue = b.name;
        break;
      case 'memberCount':
        aValue = a.memberCount;
        bValue = b.memberCount;
        break;
      case 'rating':
        aValue = a.rating;
        bValue = b.rating;
        break;
      case 'purchaseCount':
        aValue = a.purchaseCount;
        bValue = b.purchaseCount;
        break;
      case 'createdAt':
      default:
        aValue = new Date(a.createdAt).getTime();
        bValue = new Date(b.createdAt).getTime();
        break;
    }

    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const handleCreatePaperBank = () => {
    navigate('/paper-banks/create');
  };

  const handleViewPaperBank = (id: string) => {
    navigate(`/paper-banks/${id}`);
  };

  const handleEditPaperBank = (id: string) => {
    navigate(`/paper-banks/${id}/edit`);
  };

  const handleDeletePaperBank = async (id: string) => {
    showConfirm(
      '确认删除',
      '确定要删除这个试卷集吗？删除后无法恢复，所有相关的试卷和成员信息都将丢失。',
      async () => {
        setConfirmLoading(true);
        try {
          const response = await paperBankAPI.deletePaperBank(id);
          if (response.data.success) {
            setPaperBanks(prev => prev.filter(bank => bank._id !== id));
            showSuccessRightSlide('删除成功', '试卷集已成功删除');
            // 关闭确认弹窗
            closeConfirm();
          } else {
            showErrorRightSlide('删除失败', response.data.message || '删除试卷集时发生错误');
          }
        } catch (error: any) {
          showErrorRightSlide('删除失败', error.response?.data?.message || '删除试卷集时发生错误');
        } finally {
          setConfirmLoading(false);
        }
      }
    );
  };



  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'text-green-600 dark:text-green-400';
      case 'draft': return 'text-yellow-600 dark:text-yellow-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'published': return '已发布';
      case 'draft': return '草稿';
      default: return '未知';
    }
  };

  // 获取子分类的中文标签
  const getSubcategoryLabel = (category: string, subcategory: string) => {
    const cat = paperBankCategories.find(c => c.value === category);
    if (cat && cat.subcategories) {
      const sub = cat.subcategories.find(s => s.value === subcategory);
      return sub ? sub.label : subcategory;
    }
    return subcategory;
  };

  // 获取所有可用标签
  const getAvailableTags = () => {
    const allTags = new Set<string>();
    paperBanks.forEach(bank => {
      // 添加用户自定义标签
      if (bank.customTags) {
        bank.customTags.forEach(tag => allTags.add(tag));
      }
    });
    return Array.from(allTags).sort();
  };

  // 移除全屏加载，改为局部加载

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* 标题区域 - 参考题库管理和题目管理页面的设计语言 */}
      <div className="sticky top-0 z-30 bg-white dark:bg-gray-900 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 dark:from-gray-100 to-blue-600 dark:to-blue-400 bg-clip-text text-transparent">
                试卷集管理
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1">管理和组织您的试卷集，支持协作编辑和智能组卷</p>
            </div>
            <div className="flex items-center space-x-4">
              {/* 快速统计面板 */}
              <motion.div 
                className="flex items-center space-x-3"
                layout
              >
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ 
                    duration: 0.25,
                    delay: 0.05,
                    ease: [0.25, 0.1, 0.25, 1]
                  }}
                  className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-xl px-4 py-2 border border-blue-200 dark:border-blue-700 shadow-sm hover:shadow-md transition-shadow duration-200"
                >
                  <motion.div 
                    className="flex items-center space-x-2"
                    layout
                  >
                    <motion.div 
                      className="w-2 h-2 bg-blue-500 rounded-full"
                      animate={{ 
                        scale: [1, 1.2, 1],
                        opacity: [0.7, 1, 0.7]
                      }}
                      transition={{ 
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                    <motion.span 
                      className="text-sm font-medium text-blue-700 dark:text-blue-300"
                      layout
                      key={`total-${paperBanks.length}`}
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ 
                        duration: 0.3,
                        ease: "easeOut"
                      }}
                    >
                      总试卷集: {paperBanks.length} 个
                    </motion.span>
                  </motion.div>
                </motion.div>
                
                {/* 动态显示统计数据 */}
                <DynamicStats stats={stats} maxItems={2} />
              </motion.div>

              {/* 创建试卷集按钮 */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: 0.2 }}
                className="relative group"
              >
                <Button
                  onClick={handleCreatePaperBank}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  创建试卷集
                </Button>
                {/* 悬停提示 */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 dark:bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                  创建新的试卷集
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* 内容区域 */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* 智能筛选区域 - 模仿题目管理页面的设计 */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 backdrop-blur-md rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-visible relative z-10 mb-8"
        >
          {/* 筛选头部 - 与题目管理页面风格统一 */}
          <div className="bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/40 px-6 py-3 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-sm">
                  <Filter className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-800 dark:text-gray-100">智能筛选</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">快速定位目标试卷集</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                        setSearchTerm('');
                        setSelectedCategory('all');
                        setSelectedSubcategory('all');
                        setSelectedStatus('all');
                        setSelectedTags([]);
                        setSortBy('createdAt');
                        setSortOrder('desc');
                    }}
                    className="px-3 py-1.5 text-xs text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 bg-white/60 dark:bg-gray-700/60 backdrop-blur-sm"
                  >
                    <RefreshCw className="h-3 w-3 mr-1" />
                    重置筛选
                  </Button>
                </motion.div>
              </div>
            </div>
          </div>

          {/* 筛选内容 - 紧凑的网格布局 */}
          <div className="p-4 relative overflow-visible" style={{ minHeight: '200px' }}>
            <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-5 gap-4 relative">
              {/* 搜索框 */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="lg:col-span-2 relative"
              >
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1.5">搜索试卷集</label>
                <div className="relative group">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-4 w-4 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors duration-200" />
                  <Input
                    placeholder="搜索试卷集名称、描述或标签..."
                    value={searchTerm}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-3 py-2 text-sm border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rounded-lg transition-all duration-200 hover:border-gray-300 dark:hover:border-gray-500 group-hover:shadow-md text-gray-900 dark:text-gray-100"
                  />
                  {/* 搜索框悬停效果 */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-50/0 to-blue-50/10 dark:from-blue-900/0 dark:to-blue-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg pointer-events-none"></div>
                </div>
              </motion.div>

              {/* 分类筛选 */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.2 }}
                className="relative z-[100]"
              >
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1.5">试卷集分类</label>
                                  <FuzzySelect
                    options={getCategoryOptions()}
                    value={selectedCategory}
                    onChange={(value: string | number) => {
                      setSelectedCategory(value.toString());
                      setSelectedSubcategory('all'); // 重置子分类
                    }}
                    placeholder="选择分类"
                    label=""
                  />
              </motion.div>

              {/* 子分类筛选 */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.3 }}
                className="relative z-[110]"
              >
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1.5">子分类</label>
                <FuzzySelect
                  options={getSubcategoryOptions(selectedCategory)}
                  value={selectedSubcategory}
                  onChange={(value: string | number) => setSelectedSubcategory(value.toString())}
                  placeholder="选择子分类"
                  label=""
                />
              </motion.div>

              {/* 标签筛选 */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.4 }}
                className="relative z-[120]"
              >
                <TagSelector
                  label="标签筛选"
                  availableTags={getAvailableTags()}
                  selectedTags={selectedTags}
                  onTagsChange={setSelectedTags}
                  placeholder="选择标签进行筛选"
                  className="w-full"
                />
              </motion.div>

              {/* 状态筛选 */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.4 }}
                className="relative z-[120]"
              >
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1.5">发布状态</label>
                <FuzzySelect
                  options={[
                    { value: 'all', label: '全部状态' },
                    { value: 'published', label: '已发布' },
                    { value: 'draft', label: '草稿' }
                  ]}
                  value={selectedStatus}
                  onChange={(value: string | number) => setSelectedStatus(value.toString())}
                  placeholder="选择状态"
                  label=""
                />
              </motion.div>

              {/* 排序方式 */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.5 }}
                className="relative z-[130]"
              >
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1.5">排序方式</label>
                <FuzzySelect
                  options={[
                    { value: 'createdAt', label: '创建时间', icon: Clock },
                    { value: 'name', label: '名称', icon: FileText },
                    { value: 'price', label: '价格', icon: DollarSign },
                    { value: 'rating', label: '评分', icon: Star },
                    { value: 'purchaseCount', label: '购买次数', icon: BarChart3 }
                  ]}
                  value={sortBy}
                  onChange={(value: string | number) => setSortBy(value.toString())}
                  placeholder="选择排序方式"
                  label=""
                />
              </motion.div>
            </div>

            {/* 排序方向和统计信息 - 第二行 */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              {/* 排序方向按钮 */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.6 }}
                className="flex items-center space-x-4"
              >
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-300">排序方向</label>
                <div className="relative group">
                  <Button
                    variant="outline"
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    className="px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm hover:bg-white dark:hover:bg-gray-600 hover:border-gray-300 dark:hover:border-gray-500 group-hover:shadow-md rounded-lg transition-all duration-200 flex items-center space-x-2"
                  >
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="h-3 w-3 text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-100 transition-colors" />
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-100 group-hover:text-gray-900 dark:group-hover:text-gray-100 transition-colors">
                        {sortOrder === 'asc' ? '升序 ↑' : '降序 ↓'}
                      </span>
                    </div>
                  </Button>
                  {/* 悬停效果指示器 */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-50/0 to-blue-50/20 dark:from-blue-900/0 dark:to-blue-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg pointer-events-none"></div>
                </div>
              </motion.div>

              {/* 统计信息 */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.7 }}
                className="text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 px-3 py-2 rounded-lg"
              >
                共找到 <span className="font-medium text-blue-600 dark:text-blue-400">{filteredPaperBanks.length}</span> 个试卷集
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* 错误提示 */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6"
          >
            <p className="text-red-600 dark:text-red-300">{error}</p>
          </motion.div>
        )}

        {/* 试卷集列表 */}
        {loading ? (
          <LoadingPage 
            title="正在加载试卷集..." 
            description="请稍候，正在获取试卷集列表"
            fullScreen={false}
          />
        ) : sortedPaperBanks.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12"
          >
            <ClipboardList className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">还没有试卷集</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">创建您的第一个试卷集，开始管理试卷和协作编辑</p>
            <Button
              onClick={handleCreatePaperBank}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              创建试卷集
            </Button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedPaperBanks.map((bank, index) => (
              <motion.div
                key={bank._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow duration-200 cursor-pointer group">
                  <div className="p-6">
                    {/* 试卷集头部 */}
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {bank.name}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                          {bank.description}
                        </p>
                      </div>
                      <div className="relative group">
                        <Button
                          variant="outline"
                          size="sm"
                          className="p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                        {/* 下拉菜单 */}
                        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                          <div className="py-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewPaperBank(bank._id);
                              }}
                              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              查看详情
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditPaperBank(bank._id);
                              }}
                              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              编辑
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/paper-banks/${bank._id}/members`);
                              }}
                              className="flex items-center w-full px-4 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                            >
                              <Users className="w-4 h-4 mr-2" />
                              成员管理
                            </button>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeletePaperBank(bank._id);
                              }}
                              className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              删除
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 标签 */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {/* 自定义标签 */}
                      {bank.customTags && bank.customTags.slice(0, 2).map((tag, tagIndex) => (
                        <span
                          key={`custom-${tagIndex}`}
                          className="px-2 py-1 text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full border border-purple-200 dark:border-purple-700"
                        >
                          {tag}
                        </span>
                      ))}
                      {/* 显示更多标签的提示 */}
                      {bank.customTags && bank.customTags.length > 2 && (
                        <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full">
                          +{bank.customTags.length - 2}
                        </span>
                      )}
                    </div>

                    {/* 统计信息 */}
                    <div className="grid grid-cols-3 gap-3 mb-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600 dark:text-gray-400">{bank.memberCount} 成员</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600 dark:text-gray-400">{bank.paperCount} 试卷</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-yellow-500" />
                        <span className="text-gray-600 dark:text-gray-400">{bank.rating} 分</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Download className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600 dark:text-gray-400">{bank.purchaseCount} 购买</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600 dark:text-gray-400">{bank.customTags ? bank.customTags.length : 0} 标签</span>
                      </div>
                    </div>

                    {/* 底部信息 */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-3">
                        <span className="px-2 py-1 text-xs rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 bg-opacity-10">
                          {bank.subcategory ? getSubcategoryLabel(bank.category, bank.subcategory) : '未分类'}
                        </span>
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(bank.status)} bg-opacity-10`}>
                          {getStatusLabel(bank.status)}
                        </span>
                      </div>
                      {bank.status === 'published' && bank.price > 0 ? (
                        <div className="text-lg font-bold text-green-600 dark:text-green-400">
                          ¥{bank.price}
                        </div>
                      ) : (
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(bank.createdAt).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* 弹窗组件 */}
      <ConfirmModal {...confirmModal} onCancel={closeConfirm} />
      <RightSlideModal {...rightSlideModal} onClose={closeRightSlide} />
    </div>
  );
};

export default PaperBankListPage;
