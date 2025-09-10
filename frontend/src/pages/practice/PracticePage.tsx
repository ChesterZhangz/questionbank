import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Search,
  BookOpen,
  Clock,
  Target,
  Plus,
  PenTool
} from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';
import { paperBankAPI } from '../../services/api';

interface Practice {
  _id: string;
  name: string;
  subtitle?: string;
  description?: string;
  tags?: string[];
  totalScore: number;
  createdAt: string;
  updatedAt: string;
  bank: {
    _id: string;
    name: string;
  };
  owner: {
    _id: string;
    name: string;
  };
}

interface PaperBank {
  _id: string;
  name: string;
  description: string;
  memberCount: number;
  ownerId: string;
  userRole: 'owner' | 'manager' | 'collaborator' | 'viewer';
}

const PracticePage: React.FC = () => {
  const navigate = useNavigate();
  
  // 状态管理
  const [practices, setPractices] = useState<Practice[]>([]);
  const [paperBanks, setPaperBanks] = useState<PaperBank[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBank, setSelectedBank] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'name'>('newest');

  // 加载数据
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // 并行加载练习和试卷集数据
      const [practicesResponse, banksResponse] = await Promise.all([
        paperBankAPI.getMyPapers(),
        paperBankAPI.getMyPapers()
      ]);

      if (practicesResponse.data.success) {
        // 从试卷集中提取练习
        const allPractices: Practice[] = [];
        practicesResponse.data.data.papers.forEach((bank: any) => {
          if (bank.practices && Array.isArray(bank.practices)) {
            bank.practices.forEach((practice: any) => {
              allPractices.push({
                ...practice,
                bank: {
                  _id: bank._id,
                  name: bank.name
                }
              });
            });
          }
        });
        setPractices(allPractices);
      }

      if (banksResponse.data.success) {
        setPaperBanks(banksResponse.data.data.papers);
      }
    } catch (error) {
      console.error('加载数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 过滤和排序练习
  const filteredPractices = practices
    .filter(practice => {
      const matchesSearch = practice.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           practice.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           practice.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesBank = selectedBank === 'all' || practice.bank._id === selectedBank;
      
      return matchesSearch && matchesBank;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        case 'oldest':
          return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

  // 创建新练习
  const handleCreatePractice = () => {
    navigate('/papers/create?type=practice');
  };

  // 编辑练习
  const handleEditPractice = (practice: Practice) => {
    navigate(`/paper-banks/${practice.bank._id}/practices/${practice._id}/edit`);
  };

  // 查看练习
  const handleViewPractice = (practice: Practice) => {
    navigate(`/paper-banks/${practice.bank._id}/practices/${practice._id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* 头部 */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => navigate(-1)}
                variant="ghost"
                size="sm"
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                返回
              </Button>
              
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                  <Target className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    练习模式
                  </h1>
                  <p className="text-gray-600 dark:text-gray-300">
                    管理和练习您的题目
                  </p>
                </div>
              </div>
            </div>

            <Button
              onClick={handleCreatePractice}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              创建练习
            </Button>
          </div>
        </div>
      </div>

      {/* 搜索和筛选 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 搜索框 */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索练习..."
                className="pl-10"
              />
            </div>

            {/* 试卷集筛选 */}
            <div>
              <select
                value={selectedBank}
                onChange={(e) => setSelectedBank(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="all">所有试卷集</option>
                {paperBanks.map(bank => (
                  <option key={bank._id} value={bank._id}>
                    {bank.name}
                  </option>
                ))}
              </select>
            </div>

            {/* 排序方式 */}
            <div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="newest">最新更新</option>
                <option value="oldest">最早创建</option>
                <option value="name">按名称</option>
              </select>
            </div>
          </div>
        </div>

        {/* 练习列表 */}
        {filteredPractices.length === 0 ? (
          <div className="text-center py-12">
            <PenTool className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {searchQuery || selectedBank !== 'all' ? '没有找到匹配的练习' : '还没有练习'}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              {searchQuery || selectedBank !== 'all' 
                ? '尝试调整搜索条件或筛选器' 
                : '开始创建您的第一个练习吧！'
              }
            </p>
            {!searchQuery && selectedBank === 'all' && (
              <Button
                onClick={handleCreatePractice}
                className="bg-orange-500 hover:bg-orange-600 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                创建练习
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPractices.map((practice, index) => (
              <motion.div
                key={practice._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-6 h-full hover:shadow-lg transition-shadow duration-200">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                        <PenTool className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2">
                          {practice.name}
                        </h3>
                        {practice.subtitle && (
                          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                            {practice.subtitle}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {practice.description && (
                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3">
                      {practice.description}
                    </p>
                  )}

                  {practice.tags && practice.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {practice.tags.slice(0, 3).map((tag, tagIndex) => (
                        <span
                          key={tagIndex}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300"
                        >
                          {tag}
                        </span>
                      ))}
                      {practice.tags.length > 3 && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          +{practice.tags.length - 3} 更多
                        </span>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
                    <div className="flex items-center space-x-4">
                      <span className="flex items-center">
                        <BookOpen className="w-4 h-4 mr-1" />
                        {practice.bank.name}
                      </span>
                      <span className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {new Date(practice.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      onClick={() => handleViewPractice(practice)}
                      variant="outline"
                      size="sm"
                      className="flex-1"
                    >
                      查看
                    </Button>
                    <Button
                      onClick={() => handleEditPractice(practice)}
                      size="sm"
                      className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
                    >
                      编辑
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PracticePage;
