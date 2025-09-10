import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Edit, 
  Users, 
  FileText, 
  Calendar,
  User,
  Clock,
  // Plus, // 暂时禁用讲义功能
  Star,
  TrendingUp,
  DollarSign
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import ConfirmModal from '../../components/ui/ConfirmModal';
import RightSlideModal from '../../components/ui/RightSlideModal';
import { paperBankAPI, vcountAPI, paperBankReviewAPI } from '../../services/api';
import { paperBankCategories } from '../../config/paperBankCategories';
import { useModal } from '../../hooks/useModal';

interface PaperBankInfo {
  _id: string;
  name: string;
  description: string;
  category: string;
  subcategory?: string;
  customTags: string[];
  status: 'draft' | 'published';
  price: number;
  memberCount: number;
  paperCount: number;
  rating: number;
  purchaseCount: number;
  ownerId: string;
  ownerName: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  hasPurchased?: boolean; // 用户是否已购买
}

interface PaperBankMember {
  _id: string;
  userId: string;
  username: string;
  email: string;
  role: 'owner' | 'manager' | 'collaborator' | 'viewer';
  joinedAt: string;
  lastActiveAt: string;
}

// 暂时禁用讲义功能
// interface Lecture {
//   _id: string;
//   title: string;
//   description: string;
//   content: string;
//   paperBankId: string;
//   authorId: string;
//   authorName: string;
//   createdAt: string;
//   updatedAt: string;
// }

interface Review {
  _id: string;
  rating: number;
  comment: string;
  isAnonymous: boolean;
  helpfulCount: number;
  userId: {
    _id: string;
    username: string;
    avatar?: string;
  };
  createdAt: string;
}

const PaperBankDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  
  const [paperBank, setPaperBank] = useState<PaperBankInfo | null>(null);
  const [members, setMembers] = useState<PaperBankMember[]>([]);
  // 暂时禁用讲义功能
  // const [lectures, setLectures] = useState<Lecture[]>([]);
  const [practices, setPractices] = useState<any[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'practices' | 'members'>('overview');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    comment: '',
    isAnonymous: false
  });
  
  // 弹窗状态
  const { 
    confirmModal, 
    rightSlideModal, 
    showConfirm, 
    closeConfirm, 
    closeRightSlide, 
    showErrorRightSlide, 
    showSuccessRightSlide,
    setConfirmLoading
  } = useModal();
  
  // 统计数据
  const [statistics, setStatistics] = useState({
    dailyPurchases: [] as Array<{ date: string; purchases: number }>,
    categoryDistribution: [] as Array<{ name: string; value: number; color: string }>,
    ratingDistribution: [] as Array<{ rating: number; count: number }>
  });

  useEffect(() => {
    if (id) {
      fetchPaperBankDetails();
    }
  }, [id]);

  const fetchPaperBankDetails = async () => {
    try {
      setLoading(true);
      const [paperBankResponse, membersResponse, reviewsResponse, statisticsResponse, practicesResponse] = await Promise.all([
        paperBankAPI.getPaperBank(id!),
        paperBankAPI.getPaperBankMembers(id!),
        // paperBankAPI.getPaperBankLectures(id!), // 暂时禁用讲义功能
        paperBankReviewAPI.getReviews(id!, { page: 1, limit: 10 }),
        paperBankAPI.getPaperBankStatistics(id!),
        paperBankAPI.getPaperBankPapers(id!, { type: 'practice' })
      ]);

      if (paperBankResponse.data.success) {
        setPaperBank(paperBankResponse.data.data);
      }

      if (membersResponse.data.success) {
        setMembers(membersResponse.data.data.members || []);
      }

      // 暂时禁用讲义功能
      // if (lecturesResponse.data.success) {
      //   setLectures(lecturesResponse.data.data);
      // }
      
      if (reviewsResponse.data.success) {
        setReviews(reviewsResponse.data.data.reviews || []);
      }
      
      if (statisticsResponse.data.success) {
        setStatistics(statisticsResponse.data.data);
      }
      
      if (practicesResponse.data.success) {
        setPractices(practicesResponse.data.data.papers || []);
      }
    } catch (error) {
      console.error('获取试卷集详情失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditPaperBank = () => {
    navigate(`/paper-banks/${id}/edit`);
  };

  const handleManageMembers = () => {
    navigate(`/paper-banks/${id}/members`);
  };

  // 暂时禁用讲义功能
  // const handleCreateLecture = () => {
  //   navigate(`/paper-banks/${id}/lectures/create`);
  // };

  // const handleEditLecture = (lectureId: string) => {
  //   navigate(`/paper-banks/${id}/lectures/${lectureId}/edit`);
  // };

  // 购买处理
  const handlePurchase = () => {
    if (!paperBank) return;
    
    showConfirm(
      '确认购买',
      `确定要购买试卷集"${paperBank.name}"吗？\n\n价格：${paperBank.price}V\n\n购买后即可查看所有内容。`,
      () => executePurchase(),
      {
        confirmText: '确认购买',
        cancelText: '取消'
      }
    );
  };

  const executePurchase = async () => {
    if (!paperBank) return;
    
    try {
      setConfirmLoading(true, '购买中...');
      
      // 1. 检查VCount余额
      const balanceResponse = await vcountAPI.getBalance();
      if (!balanceResponse.data.success) {
        throw new Error('获取余额失败');
      }
      
      const currentBalance = balanceResponse.data.data.balance;
      if (currentBalance < paperBank.price) {
        throw new Error(`余额不足，当前余额：${currentBalance}V，需要：${paperBank.price}V`);
      }
      
      // 2. 消费VCount
      const spendResponse = await vcountAPI.spend({
        amount: paperBank.price,
        description: `购买试卷集：${paperBank.name}`,
        relatedId: paperBank._id,
        relatedModel: 'PaperBank'
      });
      
      if (!spendResponse.data.success) {
        throw new Error(spendResponse.data.message || '购买失败');
      }
      
      // 3. 更新试卷集购买状态
      const purchaseResponse = await paperBankAPI.purchasePaperBank(paperBank._id);
      if (!purchaseResponse.data.success) {
        // 如果购买失败，需要退款
        await vcountAPI.refund({
          amount: paperBank.price,
          description: `购买试卷集失败退款：${paperBank.name}`,
          relatedId: paperBank._id,
          relatedModel: 'PaperBank'
        });
        throw new Error(purchaseResponse.data.message || '购买失败');
      }
      
      // 4. 更新本地状态
      setPaperBank(prev => prev ? { ...prev, hasPurchased: true } : null);
      
      showSuccessRightSlide('购买成功', `试卷集"${paperBank.name}"购买成功！您现在可以查看所有内容。`);
      
    } catch (error: any) {
      console.error('购买失败:', error);
      showErrorRightSlide('购买失败', error.message || '购买过程中发生错误，请稍后重试');
    } finally {
      setConfirmLoading(false);
      closeConfirm();
    }
  };

  // 评价处理
  const handleSubmitReview = async () => {
    if (!paperBank || !reviewForm.comment.trim()) return;
    
    try {
      const response = await paperBankReviewAPI.createReview(paperBank._id, reviewForm);
      if (response.data.success) {
        showSuccessRightSlide('评价成功', '您的评价已提交成功');
        setShowReviewForm(false);
        setReviewForm({ rating: 5, comment: '', isAnonymous: false });
        // 重新加载评价列表
        const reviewsResponse = await paperBankReviewAPI.getReviews(paperBank._id, { page: 1, limit: 10 });
        if (reviewsResponse.data.success) {
          setReviews(reviewsResponse.data.data.reviews || []);
        }
      } else {
        showErrorRightSlide('评价失败', response.data.message || '评价提交失败');
      }
    } catch (error: any) {
      showErrorRightSlide('评价失败', error.message || '评价提交失败');
    }
  };

  const handleHelpfulReview = async (reviewId: string) => {
    if (!paperBank) return;
    
    try {
      const response = await paperBankReviewAPI.helpfulReview(paperBank._id, reviewId);
      if (response.data.success) {
        // 更新本地评价列表
        setReviews(prev => prev.map(review => 
          review._id === reviewId 
            ? { ...review, helpfulCount: review.helpfulCount + 1 }
            : review
        ));
      }
    } catch (error) {
      console.error('点赞失败:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'manager':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'collaborator':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'viewer':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case 'owner':
        return '所有者';
      case 'manager':
        return '管理员';
      case 'collaborator':
        return '协作者';
      case 'viewer':
        return '查看者';
      default:
        return '未知';
    }
  };

  const getCategoryLabel = (categoryValue: string) => {
    const category = paperBankCategories.find(c => c.value === categoryValue);
    return category ? category.label : categoryValue;
  };

  const getSubcategoryLabel = (categoryValue: string, subcategoryValue: string) => {
    const category = paperBankCategories.find(c => c.value === categoryValue);
    if (category && category.subcategories) {
      const subcategory = category.subcategories.find(s => s.value === subcategoryValue);
      return subcategory ? subcategory.label : subcategoryValue;
    }
    return subcategoryValue;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-primary dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">加载中...</p>
        </div>
      </div>
    );
  }

  if (!paperBank) {
    return (
      <div className="min-h-screen bg-bg-primary dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">试卷集不存在</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">请检查链接是否正确</p>
          <Button onClick={() => navigate('/paper-banks')}>
            返回试卷集列表
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 头部 */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4 flex-1 min-w-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/paper-banks')}
                className="flex items-center flex-shrink-0"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                返回
              </Button>
              <div className="min-w-0 flex-1">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white truncate">
                  {paperBank.name}
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm line-clamp-2 max-w-2xl">
                  {paperBank.description}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3 flex-shrink-0">
              {paperBank.status === 'published' && !paperBank.hasPurchased && (
                <Button
                  className="bg-orange-600 hover:bg-orange-700 text-white flex items-center"
                  onClick={() => handlePurchase()}
                >
                  <DollarSign className="w-4 h-4 mr-2" />
                  购买试卷集 {paperBank.price}V
                </Button>
              )}
              <Button
                variant="outline"
                onClick={handleEditPaperBank}
                className="flex items-center"
              >
                <Edit className="w-4 h-4 mr-2" />
                编辑
              </Button>
              <Button
                variant="outline"
                onClick={handleManageMembers}
                className="flex items-center"
              >
                <Users className="w-4 h-4 mr-2" />
                成员管理
              </Button>
            </div>
          </div>

          {/* 标签和状态 */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full text-sm font-medium">
                {getCategoryLabel(paperBank.category)}
              </span>
              {paperBank.subcategory && (
                <span className="px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full text-sm font-medium">
                  {getSubcategoryLabel(paperBank.category, paperBank.subcategory)}
                </span>
              )}
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                paperBank.status === 'published' 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
              }`}>
                {paperBank.status === 'published' ? '已发布' : '草稿'}
              </span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
              <span className="flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                创建于 {formatDate(paperBank.createdAt)}
              </span>
              <span className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                更新于 {formatDate(paperBank.updatedAt)}
              </span>
            </div>
          </div>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">试卷数量</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {paperBank.paperCount || 0}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                <FileText className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">评分</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {paperBank.rating || 0}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">成员数量</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {paperBank.memberCount || 0}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-lg">
                <FileText className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">购买次数</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {paperBank.purchaseCount || 0}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* 标签页 */}
        <div className="mb-6">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'overview'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                概览
              </button>
              <button
                onClick={() => setActiveTab('practices')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'practices'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                练习卷 ({practices.length})
              </button>
              {/* 暂时禁用讲义标签页 */}
              {/* <button
                onClick={() => setActiveTab('lectures')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'lectures'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                讲义 (0)
              </button> */}
              <button
                onClick={() => setActiveTab('members')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'members'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                成员 ({members.length})
              </button>
            </nav>
          </div>
        </div>

        {/* 标签页内容 */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* 标签 */}
              {paperBank.customTags && paperBank.customTags.length > 0 && (
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">标签</h3>
                  <div className="flex flex-wrap gap-2">
                    {paperBank.customTags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full text-sm font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </Card>
              )}

              {/* 统计信息 */}
              {paperBank.status === 'published' && (
                <div className="space-y-6">
                  {/* 基础统计卡片 */}
                  <Card className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">基础统计</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                          {paperBank.purchaseCount || 0}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">总购买次数</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                          {paperBank.rating || 0}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">平均评分</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                          {paperBank.memberCount || 0}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">成员数量</div>
                      </div>
                    </div>
                  </Card>

                  {/* 每日购买趋势图 */}
                  <Card className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                      <TrendingUp className="w-5 h-5 mr-2" />
                      每日购买趋势
                    </h3>
                    <div className="h-64">
                      {statistics.dailyPurchases.length > 0 && statistics.dailyPurchases.some(item => item.purchases > 0) ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={statistics.dailyPurchases}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis 
                              dataKey="date" 
                              tick={{ fontSize: 12 }}
                              tickFormatter={(value) => new Date(value).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}
                            />
                            <YAxis tick={{ fontSize: 12 }} />
                            <Tooltip 
                              labelFormatter={(value) => new Date(value).toLocaleDateString('zh-CN')}
                              formatter={(value: any) => [value, '购买次数']}
                            />
                            <Line 
                              type="monotone" 
                              dataKey="purchases" 
                              stroke="#3b82f6" 
                              strokeWidth={2}
                              dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                          <div className="text-center">
                            <TrendingUp className="w-12 h-12 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
                            <p>暂无人购买</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </Card>

                  {/* 分类分布饼图 */}
                  <Card className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">分类分布</h3>
                    <div className="h-64">
                      {statistics.categoryDistribution.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={statistics.categoryDistribution}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {statistics.categoryDistribution.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                          <div className="text-center">
                            <FileText className="w-12 h-12 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
                            <p>暂无分类数据</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </Card>

                  {/* 评分分布柱状图 */}
                  <Card className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">评分分布</h3>
                    <div className="h-64">
                      {statistics.ratingDistribution.length > 0 && statistics.ratingDistribution.some(item => item.count > 0) ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={statistics.ratingDistribution}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis 
                              dataKey="rating" 
                              tick={{ fontSize: 12 }}
                              tickFormatter={(value) => `${value}星`}
                            />
                            <YAxis tick={{ fontSize: 12 }} />
                            <Tooltip formatter={(value: any) => [value, '评价数量']} />
                            <Bar dataKey="count" fill="#10b981" />
                          </BarChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                          <div className="text-center">
                            <Star className="w-12 h-12 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
                            <p>暂无评分</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </Card>
                </div>
              )}

              {/* 用户评价 */}
              {paperBank.status === 'published' && (
                <Card className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">用户评价</h3>
                    {paperBank.hasPurchased && (
                      <Button
                        onClick={() => setShowReviewForm(!showReviewForm)}
                        className="flex items-center"
                      >
                        <Star className="w-4 h-4 mr-2" />
                        {showReviewForm ? '取消评价' : '写评价'}
                      </Button>
                    )}
                  </div>
                  
                  {/* 评价表单 */}
                  {showReviewForm && paperBank.hasPurchased && (
                    <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          评分
                        </label>
                        <div className="flex space-x-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              onClick={() => setReviewForm(prev => ({ ...prev, rating: star }))}
                              className={`p-1 ${star <= reviewForm.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                            >
                              <Star className="w-6 h-6 fill-current" />
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          评价内容
                        </label>
                        <textarea
                          value={reviewForm.comment}
                          onChange={(e) => setReviewForm(prev => ({ ...prev, comment: e.target.value }))}
                          placeholder="请分享您对这份试卷集的看法..."
                          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                          rows={4}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={reviewForm.isAnonymous}
                            onChange={(e) => setReviewForm(prev => ({ ...prev, isAnonymous: e.target.checked }))}
                            className="mr-2"
                          />
                          <span className="text-sm text-gray-600 dark:text-gray-400">匿名评价</span>
                        </label>
                        
                        <div className="space-x-2">
                          <Button
                            variant="outline"
                            onClick={() => setShowReviewForm(false)}
                          >
                            取消
                          </Button>
                          <Button
                            onClick={handleSubmitReview}
                            disabled={!reviewForm.comment.trim()}
                          >
                            提交评价
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* 评价列表 */}
                  {reviews.length > 0 ? (
                    <div className="space-y-4">
                      {reviews.map((review) => (
                        <div key={review._id} className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-b-0">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                                <User className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                  {review.isAnonymous ? '匿名用户' : review.userId.username}
                                </p>
                                <div className="flex items-center space-x-1">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                      key={star}
                                      className={`w-4 h-4 ${star <= review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                                    />
                                  ))}
                                </div>
                              </div>
                            </div>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              {formatDate(review.createdAt)}
                            </span>
                          </div>
                          
                          <p className="text-gray-700 dark:text-gray-300 mb-3">
                            {review.comment}
                          </p>
                          
                          <div className="flex items-center justify-between">
                            <button
                              onClick={() => handleHelpfulReview(review._id)}
                              className="flex items-center space-x-1 text-sm text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                            >
                              <span>👍</span>
                              <span>有用 ({review.helpfulCount})</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <div className="flex justify-center mb-4">
                        <Star className="w-12 h-12 text-gray-300 dark:text-gray-600" />
                      </div>
                      <p>暂无用户评价</p>
                      <p className="text-sm">
                        {paperBank.hasPurchased ? '成为第一个评价的用户' : '购买后即可评价'}
                      </p>
                    </div>
                  )}
                </Card>
              )}
            </div>
          )}

          {/* 暂时禁用讲义内容区域 */}
          {/* {activeTab === 'lectures' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">讲义列表</h3>
                <Button onClick={handleCreateLecture} className="flex items-center">
                  <Plus className="w-4 h-4 mr-2" />
                  创建讲义
                </Button>
              </div>

              {lectures.length === 0 ? (
                <Card className="p-12 text-center">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">暂无讲义</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">开始创建第一个讲义吧</p>
                  <Button onClick={handleCreateLecture}>
                    创建讲义
                  </Button>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {lectures.map((lecture) => (
                    <Card key={lecture._id} className="p-6 hover:shadow-lg transition-shadow">
                      <div className="flex items-start justify-between mb-4">
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2">
                          {lecture.title}
                        </h4>
                        <div className="flex items-center space-x-2">
                          {paperBank.status === 'published' && !paperBank.hasPurchased ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-orange-600 border-orange-600 hover:bg-orange-50"
                    onClick={() => handlePurchase()}
                  >
                    购买查看
                  </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditLecture(lecture._id)}
                              className="flex items-center"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3 max-w-xs">
                        {lecture.description || '暂无描述'}
                      </p>
                      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                        <span>{lecture.authorName}</span>
                        <span>{formatDate(lecture.createdAt)}</span>
                      </div>
                      {paperBank.status === 'published' && !paperBank.hasPurchased && (
                        <div className="mt-4 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                          <p className="text-sm text-orange-700 dark:text-orange-300 text-center">
                            💰 需要购买才能查看讲义内容
                          </p>
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )} */}

          {activeTab === 'practices' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">练习卷列表</h3>
                <Button 
                  onClick={() => navigate(`/paper-banks/${id}/practices/create`)}
                  className="flex items-center"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  创建练习卷
                </Button>
              </div>

              <Card className="p-6">
                {practices.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">暂无练习卷</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">开始创建您的第一个练习卷吧！</p>
                    <Button 
                      onClick={() => navigate(`/paper-banks/${id}/practices/create`)}
                      className="flex items-center mx-auto"
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      创建练习卷
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {practices.map((practice) => (
                      <div
                        key={practice._id}
                        className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                        onClick={() => navigate(`/paper-banks/${id}/practices/${practice._id}/edit`)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                              {practice.name}
                            </h4>
                            <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                              <span className="flex items-center">
                                <FileText className="w-4 h-4 mr-1" />
                                {practice.sections?.reduce((total: number, section: any) => total + (section.items?.length || 0), 0) || 0} 题
                              </span>
                              <span className="flex items-center">
                                <Calendar className="w-4 h-4 mr-1" />
                                {new Date(practice.createdAt).toLocaleDateString()}
                              </span>
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                practice.status === 'draft' 
                                  ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                  : practice.status === 'published'
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                  : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                              }`}>
                                {practice.status === 'draft' ? '草稿' : 
                                 practice.status === 'published' ? '已发布' : '已修改'}
                              </span>
                            </div>
                            {practice.tags && practice.tags.length > 0 && (
                              <div className="mt-2 flex flex-wrap gap-1">
                                {practice.tags.slice(0, 3).map((tag: string, index: number) => (
                                  <span
                                    key={index}
                                    className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full"
                                  >
                                    {tag}
                                  </span>
                                ))}
                                {practice.tags.length > 3 && (
                                  <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded-full">
                                    +{practice.tags.length - 3}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/paper-banks/${id}/practices/${practice._id}/edit`);
                              }}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          )}

          {activeTab === 'members' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">成员列表</h3>
                <Button onClick={handleManageMembers} className="flex items-center">
                  <Users className="w-4 h-4 mr-2" />
                  管理成员
                </Button>
              </div>

              <Card className="p-6">
                <div className="space-y-4">
                  {members.map((member) => (
                    <div key={member._id} className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                            {member.username}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {member.email}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(member.role)}`}>
                          {getRoleText(member.role)}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(member.joinedAt)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}
        </motion.div>
      </div>
      
      {/* 弹窗组件 */}
      <ConfirmModal {...confirmModal} onCancel={closeConfirm} />
      <RightSlideModal {...rightSlideModal} onClose={closeRightSlide} />
    </div>
  );
};

export default PaperBankDetailPage;
