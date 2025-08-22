import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2,
  Plus,
  Search,
  Edit3,
  Trash2,
  Eye,
  Users,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { enterpriseService } from '../../services/enterpriseService';
import { useAuthStore } from '../../stores/authStore';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { useModal } from '../../hooks/useModal';
import type { Enterprise } from '../../services/enterpriseService';

interface EnterpriseWithStats extends Enterprise {
  memberCount?: number;
  departmentCount?: number;
}

const EnterpriseManagementPage: React.FC = () => {
  const { user } = useAuthStore();
  
  // 弹窗状态管理
  const { 
    showSuccessRightSlide,
    showErrorRightSlide
  } = useModal();

  // 页面状态
  const [enterprises, setEnterprises] = useState<EnterpriseWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // 查看详情模态框状态
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedEnterprise, setSelectedEnterprise] = useState<any>(null);

  // 编辑企业模态框状态
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    emailSuffix: '',
    creditCode: '',
    maxMembers: 100,
    description: '',
    address: '',
    phone: '',
    website: '',
    industry: '',
    size: 'medium' as const
  });

  // 删除确认模态框状态
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteEnterpriseId, setDeleteEnterpriseId] = useState<string>('');

  // 创建企业表单状态
  const [createForm, setCreateForm] = useState({
    name: '',
    emailSuffix: '',
    creditCode: '',
    maxMembers: 100,
    description: '',
    address: '',
    phone: '',
    website: '',
    industry: '',
    size: 'medium' as const
  });

  // 检查权限
  useEffect(() => {
    if (user?.role !== 'superadmin') {
      setError('权限不足，仅超级管理员可访问此页面');
      setLoading(false);
      return;
    }
    fetchEnterprises();
  }, [user]);

  // 获取企业列表
  const fetchEnterprises = async () => {
    try {
      setLoading(true);
      const response = await enterpriseService.getAllEnterprises();
      if (response.data.success) {
        setEnterprises(response.data.enterprises);
      } else {
        setError('获取企业列表失败');
      }
    } catch (error: any) {
      // 错误日志已清理
      setError(error.response?.data?.error || '获取企业列表失败');
    } finally {
      setLoading(false);
    }
  };

  // 创建企业
  const handleCreateEnterprise = async () => {
    try {
      // 格式化网站地址，确保符合验证规则
      const formattedData = { ...createForm };
      if (formattedData.website && formattedData.website.trim()) {
        let website = formattedData.website.trim();
        // 如果没有协议前缀，自动添加 https://
        if (!website.startsWith('http://') && !website.startsWith('https://')) {
          website = 'https://' + website;
        }
        formattedData.website = website;
      }

      const response = await enterpriseService.createEnterprise(formattedData);
      if (response.data.success) {
        showSuccessRightSlide('创建成功', '企业创建成功，第一个注册该企业邮箱后缀的用户将自动成为企业管理员');
        setShowCreateModal(false);
        resetCreateForm();
        fetchEnterprises();
      } else {
        showErrorRightSlide('创建失败', '企业创建失败');
      }
    } catch (error: any) {
      // 错误日志已清理
      showErrorRightSlide('创建失败', error.response?.data?.error || '企业创建失败');
    }
  };

  // 查看企业详情
  const handleViewDetail = (enterprise: any) => {
    setSelectedEnterprise(enterprise);
    setShowDetailModal(true);
  };

  // 编辑企业
  const handleEdit = (enterprise: any) => {
    setEditForm({
      name: enterprise.name,
      emailSuffix: enterprise.emailSuffix,
      creditCode: enterprise.creditCode,
      maxMembers: enterprise.maxMembers,
      description: enterprise.description || '',
      address: enterprise.address || '',
      phone: enterprise.phone || '',
      website: enterprise.website || '',
      industry: enterprise.industry || '',
      size: enterprise.size || 'medium'
    });
    setSelectedEnterprise(enterprise);
    setShowEditModal(true);
  };

  // 保存编辑
  const handleSaveEdit = async () => {
    try {
      // 格式化网站地址，确保符合验证规则
      const formattedData = { ...editForm };
      if (formattedData.website && formattedData.website.trim()) {
        let website = formattedData.website.trim();
        // 如果没有协议前缀，自动添加 https://
        if (!website.startsWith('http://') && !website.startsWith('https://')) {
          website = 'https://' + website;
        }
        formattedData.website = website;
      }

      const response = await enterpriseService.updateEnterprise(selectedEnterprise._id, formattedData);
      if (response.data.success) {
        showSuccessRightSlide('更新成功', '企业信息更新成功');
        setShowEditModal(false);
        fetchEnterprises();
      } else {
        showErrorRightSlide('更新失败', '企业信息更新失败');
      }
    } catch (error: any) {
      // 错误日志已清理
      showErrorRightSlide('更新失败', error.response?.data?.error || '企业信息更新失败');
    }
  };

  // 删除企业
  const handleDelete = (enterpriseId: string) => {
    setDeleteEnterpriseId(enterpriseId);
    setShowDeleteModal(true);
  };

  const handleDeleteEnterprise = async () => {
    try {
      const response = await enterpriseService.deleteEnterprise(deleteEnterpriseId);
      if (response.data.success) {
        showSuccessRightSlide('删除成功', '企业删除成功');
        setShowDeleteModal(false);
        fetchEnterprises();
      } else {
        showErrorRightSlide('删除失败', '企业删除失败');
      }
    } catch (error: any) {
      // 错误日志已清理
      showErrorRightSlide('删除失败', error.response?.data?.error || '企业删除失败');
    }
  };



  // 重置创建表单
  const resetCreateForm = () => {
    setCreateForm({
      name: '',
      emailSuffix: '',
      creditCode: '',
      maxMembers: 100,
      description: '',
      address: '',
      phone: '',
      website: '',
      industry: '',
      size: 'medium'
    });
  };

  // 获取企业状态图标
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'inactive':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  // 获取企业状态文本
  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return '已激活';
      case 'inactive':
        return '已禁用';
      case 'pending':
        return '待审核';
      default:
        return '未知状态';
    }
  };

  // 获取企业规模文本
  const getSizeText = (size: string) => {
    switch (size) {
      case 'small':
        return '小型企业';
      case 'medium':
        return '中型企业';
      case 'large':
        return '大型企业';
      case 'enterprise':
        return '超大型企业';
      default:
        return '中型企业';
    }
  };

  // 过滤企业列表
  const filteredEnterprises = enterprises.filter(enterprise =>
    enterprise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    enterprise.emailSuffix.toLowerCase().includes(searchTerm.toLowerCase()) ||
    enterprise.creditCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-blue-900/20 dark:to-indigo-900/20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">加载中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-blue-900/20 dark:to-indigo-900/20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">访问被拒绝</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-blue-900/20 dark:to-indigo-900/20 p-6">
      <div className="max-w-7xl mx-auto">
        {/* 页面头部 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">企业管理</h1>
              <p className="text-gray-600 dark:text-gray-400">管理系统中的所有企业</p>
            </div>
          </div>

          {/* 统计信息 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl">
              <div className="p-6 text-center">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Building2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  {enterprises.length}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">企业总数</p>
              </div>
            </Card>

            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl">
              <div className="p-6 text-center">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  {enterprises.filter(e => e.status === 'active').length}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">已激活</p>
              </div>
            </Card>

            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl">
              <div className="p-6 text-center">
                <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  {enterprises.filter(e => e.status === 'pending').length}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">待审核</p>
              </div>
            </Card>

            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl">
              <div className="p-6 text-center">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  {enterprises.reduce((sum, e) => sum + e.currentMembers, 0)}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">总成员数</p>
              </div>
            </Card>
          </div>
        </motion.div>

        {/* 操作栏 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl">
            <div className="p-6">
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="flex-1 max-w-md">
                  <Input
                    placeholder="搜索企业名称、邮箱后缀或信用代码..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    icon={<Search className="w-4 h-4" />}
                  />
                </div>
                <Button 
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={() => setShowCreateModal(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  创建企业
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* 企业列表 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredEnterprises.map((enterprise) => (
              <Card key={enterprise._id} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
                <div className="p-6">
                  {/* 企业头部 */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100">{enterprise.name}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{enterprise.emailSuffix}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(enterprise.status)}
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {getStatusText(enterprise.status)}
                      </span>
                    </div>
                  </div>

                  {/* 企业信息 */}
                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">信用代码:</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">{enterprise.creditCode}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">成员数量:</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {enterprise.currentMembers}/{enterprise.maxMembers}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">企业规模:</span>
                                              <span className="font-medium text-gray-900 dark:text-gray-100">
                          {getSizeText(enterprise.size || 'medium')}
                        </span>
                    </div>
                    {enterprise.industry && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500 dark:text-gray-400">所属行业:</span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">{enterprise.industry}</span>
                      </div>
                    )}
                  </div>

                  {/* 企业信息 */}
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mb-4">
                    <div className="text-sm">
                      <span className="text-gray-500 dark:text-gray-400">企业状态: </span>
                      <span className={`font-medium px-2 py-1 rounded-full text-xs ${
                        enterprise.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                        enterprise.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                        'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                      }`}>
                        {enterprise.status === 'active' ? '活跃' : 
                         enterprise.status === 'pending' ? '待审核' : '停用'}
                      </span>
                    </div>
                    <div className="text-sm mt-1">
                      <span className="text-gray-500 dark:text-gray-400">成员数量: </span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {enterprise.currentMembers} / {enterprise.maxMembers}
                      </span>
                    </div>
                  </div>

                  {/* 操作按钮 */}
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleViewDetail(enterprise)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      查看详情
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleEdit(enterprise)}
                    >
                      <Edit3 className="w-4 h-4 mr-1" />
                      编辑
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="text-red-600 hover:text-red-700"
                      onClick={() => handleDelete(enterprise._id)}
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      删除
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {filteredEnterprises.length === 0 && (
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl">
              <div className="p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Building2 className="w-8 h-8 text-gray-600 dark:text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">暂无企业</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {searchTerm ? '没有找到匹配的企业' : '还没有创建任何企业'}
                </p>
                {!searchTerm && (
                  <Button onClick={() => setShowCreateModal(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    创建第一个企业
                  </Button>
                )}
              </div>
            </Card>
          )}
        </motion.div>

        {/* 创建企业模态框 */}
        <AnimatePresence>
          {showCreateModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">创建新企业</h2>
                    <button
                      onClick={() => setShowCreateModal(false)}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <span className="sr-only">关闭</span>
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          企业名称 *
                        </label>
                        <Input
                          value={createForm.name}
                          onChange={(e) => setCreateForm(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="请输入企业名称"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          邮箱后缀 *
                        </label>
                        <Input
                          value={createForm.emailSuffix}
                          onChange={(e) => setCreateForm(prev => ({ ...prev, emailSuffix: e.target.value }))}
                          placeholder="@example.com"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          信用代码 *
                        </label>
                        <Input
                          value={createForm.creditCode}
                          onChange={(e) => setCreateForm(prev => ({ ...prev, creditCode: e.target.value }))}
                          placeholder="请输入企业信用代码"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          最大成员数 *
                        </label>
                        <Input
                          type="number"
                          value={createForm.maxMembers}
                          onChange={(e) => setCreateForm(prev => ({ ...prev, maxMembers: parseInt(e.target.value) || 100 }))}
                          placeholder="100"
                        />
                      </div>
                    </div>

                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        <span className="text-sm text-blue-700 dark:text-blue-300">
                          提示：第一个注册该企业邮箱后缀的用户将自动成为企业管理员
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          所属行业
                        </label>
                        <Input
                          value={createForm.industry}
                          onChange={(e) => setCreateForm(prev => ({ ...prev, industry: e.target.value }))}
                          placeholder="如：科技、教育、金融等"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          企业规模
                        </label>
                        <select
                          value={createForm.size}
                          onChange={(e) => setCreateForm(prev => ({ ...prev, size: e.target.value as any }))}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        >
                          <option value="small">小型企业</option>
                          <option value="medium">中型企业</option>
                          <option value="large">大型企业</option>
                          <option value="enterprise">超大型企业</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        企业描述
                      </label>
                      <textarea
                        value={createForm.description}
                        onChange={(e) => setCreateForm(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="请输入企业描述"
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 resize-none"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 mt-6">
                    <Button
                      onClick={handleCreateEnterprise}
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                    >
                      创建企业
                    </Button>
                    <Button
                      onClick={() => setShowCreateModal(false)}
                      variant="outline"
                      className="flex-1"
                    >
                      取消
                    </Button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 查看详情模态框 */}
        <AnimatePresence>
          {showDetailModal && selectedEnterprise && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{selectedEnterprise.name}</h2>
                        <p className="text-gray-600 dark:text-gray-400">{selectedEnterprise.emailSuffix}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowDetailModal(false)}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <span className="sr-only">关闭</span>
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* 基础信息 */}
                    <Card className="bg-gray-50 dark:bg-gray-900/50">
                      <div className="p-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                          <Building2 className="w-5 h-5" />
                          基础信息
                        </h3>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">企业名称:</span>
                            <span className="font-medium text-gray-900 dark:text-gray-100">{selectedEnterprise.name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">邮箱后缀:</span>
                            <span className="font-medium text-gray-900 dark:text-gray-100">{selectedEnterprise.emailSuffix}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">信用代码:</span>
                            <span className="font-medium text-gray-900 dark:text-gray-100">{selectedEnterprise.creditCode}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">企业状态:</span>
                            <span className="font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2">
                              {getStatusIcon(selectedEnterprise.status)}
                              {getStatusText(selectedEnterprise.status)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">企业规模:</span>
                            <span className="font-medium text-gray-900 dark:text-gray-100">{getSizeText(selectedEnterprise.size || 'medium')}</span>
                          </div>
                          {selectedEnterprise.industry && (
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-400">所属行业:</span>
                              <span className="font-medium text-gray-900 dark:text-gray-100">{selectedEnterprise.industry}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>

                    {/* 成员信息 */}
                    <Card className="bg-gray-50 dark:bg-gray-900/50">
                      <div className="p-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                          <Users className="w-5 h-5" />
                          成员信息
                        </h3>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">当前成员:</span>
                            <span className="font-medium text-gray-900 dark:text-gray-100">{selectedEnterprise.currentMembers}人</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">最大成员:</span>
                            <span className="font-medium text-gray-900 dark:text-gray-100">{selectedEnterprise.maxMembers}人</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">可用名额:</span>
                            <span className="font-medium text-gray-900 dark:text-gray-100">{selectedEnterprise.maxMembers - selectedEnterprise.currentMembers}人</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">超级管理员:</span>
                            <span className="font-medium text-gray-900 dark:text-gray-100">{selectedEnterprise.superAdmin?.name || '未设置'}</span>
                          </div>
                          {selectedEnterprise.admins && selectedEnterprise.admins.length > 0 && (
                            <div>
                              <span className="text-gray-600 dark:text-gray-400">管理员:</span>
                              <div className="mt-1">
                                {selectedEnterprise.admins.map((admin: any, index: number) => (
                                  <span key={index} className="inline-block bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-2 py-1 rounded-md text-xs mr-1 mb-1">
                                    {admin.name}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  </div>

                  {/* 详细信息 */}
                  {(selectedEnterprise.description || selectedEnterprise.address || selectedEnterprise.phone || selectedEnterprise.website) && (
                    <Card className="bg-gray-50 dark:bg-gray-900/50 mt-6">
                      <div className="p-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">详细信息</h3>
                        <div className="space-y-3">
                          {selectedEnterprise.description && (
                            <div>
                              <span className="text-gray-600 dark:text-gray-400 block mb-1">企业描述:</span>
                              <p className="text-gray-900 dark:text-gray-100">{selectedEnterprise.description}</p>
                            </div>
                          )}
                          {selectedEnterprise.address && (
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-400">地址:</span>
                              <span className="font-medium text-gray-900 dark:text-gray-100">{selectedEnterprise.address}</span>
                            </div>
                          )}
                          {selectedEnterprise.phone && (
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-400">电话:</span>
                              <span className="font-medium text-gray-900 dark:text-gray-100">{selectedEnterprise.phone}</span>
                            </div>
                          )}
                          {selectedEnterprise.website && (
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-400">网站:</span>
                              <a href={selectedEnterprise.website} target="_blank" rel="noopener noreferrer" className="font-medium text-blue-600 dark:text-blue-400 hover:underline">{selectedEnterprise.website}</a>
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  )}

                  <div className="flex justify-end mt-6">
                    <Button
                      onClick={() => setShowDetailModal(false)}
                      variant="outline"
                    >
                      关闭
                    </Button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 编辑企业模态框 */}
        <AnimatePresence>
          {showEditModal && selectedEnterprise && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">编辑企业信息</h2>
                    <button
                      onClick={() => setShowEditModal(false)}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <span className="sr-only">关闭</span>
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          企业名称 *
                        </label>
                        <Input
                          value={editForm.name}
                          onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="请输入企业名称"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          邮箱后缀 (不可编辑)
                        </label>
                        <Input
                          value={editForm.emailSuffix}
                          disabled
                          className="bg-gray-100 dark:bg-gray-700"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          信用代码 (不可编辑)
                        </label>
                        <Input
                          value={editForm.creditCode}
                          disabled
                          className="bg-gray-100 dark:bg-gray-700"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          最大成员数 *
                        </label>
                        <Input
                          type="number"
                          value={editForm.maxMembers}
                          onChange={(e) => setEditForm(prev => ({ ...prev, maxMembers: parseInt(e.target.value) || 100 }))}
                          placeholder="100"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          所属行业
                        </label>
                        <Input
                          value={editForm.industry}
                          onChange={(e) => setEditForm(prev => ({ ...prev, industry: e.target.value }))}
                          placeholder="如：科技、教育、金融等"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          企业规模
                        </label>
                        <select
                          value={editForm.size}
                          onChange={(e) => setEditForm(prev => ({ ...prev, size: e.target.value as any }))}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        >
                          <option value="small">小型企业</option>
                          <option value="medium">中型企业</option>
                          <option value="large">大型企业</option>
                          <option value="enterprise">超大型企业</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          企业地址
                        </label>
                        <Input
                          value={editForm.address}
                          onChange={(e) => setEditForm(prev => ({ ...prev, address: e.target.value }))}
                          placeholder="请输入企业地址"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          联系电话
                        </label>
                        <Input
                          value={editForm.phone}
                          onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                          placeholder="请输入联系电话"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        企业网站
                      </label>
                      <Input
                        value={editForm.website}
                        onChange={(e) => setEditForm(prev => ({ ...prev, website: e.target.value }))}
                        placeholder="https://example.com"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        企业描述
                      </label>
                      <textarea
                        value={editForm.description}
                        onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="请输入企业描述"
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 resize-none"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 mt-6">
                    <Button
                      onClick={handleSaveEdit}
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                    >
                      保存修改
                    </Button>
                    <Button
                      onClick={() => setShowEditModal(false)}
                      variant="outline"
                      className="flex-1"
                    >
                      取消
                    </Button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 删除确认模态框 */}
        <AnimatePresence>
          {showDeleteModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full"
              >
                <div className="p-6">
                  <div className="flex items-center justify-center w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full mx-auto mb-4">
                    <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
                  </div>
                  
                  <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 text-center mb-2">
                    确认删除企业
                  </h2>
                  
                  <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
                    此操作不可逆，删除后该企业及其所有相关数据将无法恢复。确定要继续吗？
                  </p>

                  <div className="flex gap-3">
                    <Button
                      onClick={handleDeleteEnterprise}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                    >
                      确认删除
                    </Button>
                    <Button
                      onClick={() => setShowDeleteModal(false)}
                      variant="outline"
                      className="flex-1"
                    >
                      取消
                    </Button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default EnterpriseManagementPage;
