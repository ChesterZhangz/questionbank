import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Coins, 
  TrendingUp, 
  TrendingDown, 
  Search, 
  Filter,
  Download,
  RefreshCw,
  Shield,
  Eye
} from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import { vcountAPI } from '../../services/api';
import { useAuthStore } from '../../stores/authStore';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { useModal } from '../../hooks/useModal';

interface VCountUser {
  userId: {
    _id: string;
    email: string;
    name: string;
    role: string;
  };
  balance: number;
  totalRecharged: number;
  totalSpent: number;
  lastRechargeDate?: string;
  transactionCount: number;
  createdAt: string;
}

interface VCountStats {
  totalUsers: number;
  totalBalance: number;
  totalRecharged: number;
  totalSpent: number;
  averageBalance: number;
}

const VCountManagementPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const { showErrorRightSlide, showSuccessRightSlide } = useModal();
  
  const [stats, setStats] = useState<VCountStats | null>(null);
  const [isLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'balance' | 'totalRecharged' | 'totalSpent' | 'createdAt'>('balance');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<VCountUser | null>(null);
  const [showUserDetail, setShowUserDetail] = useState(false);
  const [allUsers, setAllUsers] = useState<VCountUser[]>([]);

  const pageSize = 20;

  // 检查管理员权限
  useEffect(() => {
    if (user && user.role !== 'admin' && user.role !== 'superadmin') {
      showErrorRightSlide(t('vcount.errors.accessDenied'), '');
      // 可以重定向到其他页面
    }
  }, [user, t, showErrorRightSlide]);

  // 加载所有用户数据（用于统计和导出）
  const loadAllUsers = async () => {
    try {
      const response = await vcountAPI.getAdminAllUsers({
        page: 1,
        limit: 1000 // 获取大量数据用于统计
      });
      
      if (response.data.success) {
        setAllUsers(response.data.data.vCounts);
        
        // 计算统计数据
        const allUsersData = response.data.data.vCounts;
        const statsData: VCountStats = {
          totalUsers: response.data.data.pagination.total,
          totalBalance: allUsersData.reduce((sum: number, user: VCountUser) => sum + user.balance, 0),
          totalRecharged: allUsersData.reduce((sum: number, user: VCountUser) => sum + user.totalRecharged, 0),
          totalSpent: allUsersData.reduce((sum: number, user: VCountUser) => sum + user.totalSpent, 0),
          averageBalance: allUsersData.length > 0 ? 
            allUsersData.reduce((sum: number, user: VCountUser) => sum + user.balance, 0) / allUsersData.length : 0
        };
        setStats(statsData);
      }
    } catch (error: any) {
      console.error('加载所有用户数据失败:', error);
    }
  };


  useEffect(() => {
    if (user && (user.role === 'admin' || user.role === 'superadmin')) {
      loadAllUsers(); // 加载所有用户数据用于统计
    }
  }, [user]);

  // 当搜索条件改变时重置到第一页
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortBy, sortOrder]);

  // 搜索和过滤（基于所有用户数据）
  const filteredUsers = allUsers.filter(user => {
    const searchLower = searchTerm.toLowerCase();
    return (
      user.userId.name.toLowerCase().includes(searchLower) ||
      user.userId.email.toLowerCase().includes(searchLower) ||
      user.userId.role.toLowerCase().includes(searchLower)
    );
  });

  // 排序
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    let aValue: any, bValue: any;
    
    switch (sortBy) {
      case 'balance':
        aValue = a.balance;
        bValue = b.balance;
        break;
      case 'totalRecharged':
        aValue = a.totalRecharged;
        bValue = b.totalRecharged;
        break;
      case 'totalSpent':
        aValue = a.totalSpent;
        bValue = b.totalSpent;
        break;
      case 'createdAt':
        aValue = new Date(a.createdAt).getTime();
        bValue = new Date(b.createdAt).getTime();
        break;
      default:
        aValue = a.balance;
        bValue = b.balance;
    }

    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });


  const handleRefresh = () => {
    loadAllUsers();
  };

  const handleViewUser = (user: VCountUser) => {
    setSelectedUser(user);
    setShowUserDetail(true);
  };

  const handleExportData = () => {
    try {
      // 准备导出数据
      const exportData = allUsers.map(user => ({
        '用户姓名': user.userId.name,
        '邮箱': user.userId.email,
        '角色': user.userId.role,
        '当前余额': user.balance.toFixed(2),
        '总充值': user.totalRecharged.toFixed(2),
        '总消费': user.totalSpent.toFixed(2),
        '交易次数': user.transactionCount,
        '最后充值时间': user.lastRechargeDate ? new Date(user.lastRechargeDate).toLocaleDateString('zh-CN') : '无',
        '创建时间': new Date(user.createdAt).toLocaleDateString('zh-CN')
      }));

      // 转换为CSV格式
      const headers = Object.keys(exportData[0] || {});
      const csvContent = [
        headers.join(','),
        ...exportData.map(row => 
          headers.map(header => {
            const value = row[header as keyof typeof row];
            // 处理包含逗号的值
            return typeof value === 'string' && value.includes(',') 
              ? `"${value}"` 
              : value;
          }).join(',')
        )
      ].join('\n');

      // 添加BOM以支持中文
      const BOM = '\uFEFF';
      const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
      
      // 创建下载链接
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `vcount-users-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      
      // 触发下载
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // 清理URL对象
      URL.revokeObjectURL(url);
      
      showSuccessRightSlide(t('vcount.management.exportSuccess'), `成功导出 ${exportData.length} 条用户记录`);
    } catch (error) {
      console.error('导出数据失败:', error);
      showErrorRightSlide('导出失败', '请稍后重试');
    }
  };

  // 权限检查
  if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-blue-900/20 dark:to-indigo-900/20 p-6">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl">
            <div className="p-8 text-center">
              <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                {t('vcount.management.accessDenied')}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {t('vcount.management.accessDeniedMessage')}
              </p>
            </div>
          </Card>
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
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                {t('vcount.management.title')}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {t('vcount.management.subtitle')}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={handleRefresh}
                disabled={isLoading}
                variant="outline"
                className="flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                {t('common.refresh')}
              </Button>
              <Button
                onClick={handleExportData}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                {t('vcount.management.export')}
              </Button>
            </div>
          </div>
        </motion.div>

        {/* 统计卡片 */}
        {stats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8"
          >
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {t('vcount.management.totalUsers')}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {stats.totalUsers}
                    </p>
                  </div>
                  <Users className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </Card>

            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {t('vcount.management.totalBalance')}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {stats.totalBalance.toFixed(2)} V
                    </p>
                  </div>
                  <Coins className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </Card>

            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {t('vcount.management.totalRecharged')}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {stats.totalRecharged.toFixed(2)} V
                    </p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                </div>
              </div>
            </Card>

            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {t('vcount.management.totalSpent')}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {stats.totalSpent.toFixed(2)} V
                    </p>
                  </div>
                  <TrendingDown className="w-8 h-8 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
            </Card>

            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {t('vcount.management.averageBalance')}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {stats.averageBalance.toFixed(2)} V
                    </p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* 搜索和过滤 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl">
            <div className="p-6">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      type="text"
                      placeholder={t('vcount.management.searchPlaceholder')}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-gray-400" />
                  <select
                    value={`${sortBy}-${sortOrder}`}
                    onChange={(e) => {
                      const [field, order] = e.target.value.split('-');
                      setSortBy(field as typeof sortBy);
                      setSortOrder(order as 'asc' | 'desc');
                    }}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm"
                  >
                    <option value="balance-desc">{t('vcount.management.sortByBalance')} ↓</option>
                    <option value="balance-asc">{t('vcount.management.sortByBalance')} ↑</option>
                    <option value="totalRecharged-desc">{t('vcount.management.sortByRecharged')} ↓</option>
                    <option value="totalRecharged-asc">{t('vcount.management.sortByRecharged')} ↑</option>
                    <option value="totalSpent-desc">{t('vcount.management.sortBySpent')} ↓</option>
                    <option value="totalSpent-asc">{t('vcount.management.sortBySpent')} ↑</option>
                    <option value="createdAt-desc">{t('vcount.management.sortByCreated')} ↓</option>
                    <option value="createdAt-asc">{t('vcount.management.sortByCreated')} ↑</option>
                  </select>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* 用户列表 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {t('vcount.management.userList')}
                </h3>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {searchTerm ? `${sortedUsers.length} / ${allUsers.length}` : allUsers.length} {t('vcount.management.users')}
                </span>
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-8 h-8 border-2 border-indigo-300 border-t-indigo-600 rounded-full"
                  />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-gray-100">
                          {t('vcount.management.user')}
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-gray-100">
                          {t('vcount.management.role')}
                        </th>
                        <th className="text-right py-3 px-4 font-medium text-gray-900 dark:text-gray-100">
                          {t('vcount.management.balance')}
                        </th>
                        <th className="text-right py-3 px-4 font-medium text-gray-900 dark:text-gray-100">
                          {t('vcount.management.recharged')}
                        </th>
                        <th className="text-right py-3 px-4 font-medium text-gray-900 dark:text-gray-100">
                          {t('vcount.management.spent')}
                        </th>
                        <th className="text-right py-3 px-4 font-medium text-gray-900 dark:text-gray-100">
                          {t('vcount.management.transactions')}
                        </th>
                        <th className="text-center py-3 px-4 font-medium text-gray-900 dark:text-gray-100">
                          {t('vcount.management.action')}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedUsers.slice((currentPage - 1) * pageSize, currentPage * pageSize).map((user, index) => (
                        <motion.tr
                          key={user.userId._id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                        >
                          <td className="py-4 px-4">
                            <div>
                              <div className="font-medium text-gray-900 dark:text-gray-100">
                                {user.userId.name}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {user.userId.email}
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              user.userId.role === 'admin' || user.userId.role === 'superadmin'
                                ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                                : user.userId.role === 'teacher'
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                            }`}>
                              {user.userId.role}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-right">
                            <span className="font-medium text-gray-900 dark:text-gray-100">
                              {user.balance.toFixed(2)} V
                            </span>
                          </td>
                          <td className="py-4 px-4 text-right">
                            <span className="text-green-600 dark:text-green-400">
                              {user.totalRecharged.toFixed(2)} V
                            </span>
                          </td>
                          <td className="py-4 px-4 text-right">
                            <span className="text-orange-600 dark:text-orange-400">
                              {user.totalSpent.toFixed(2)} V
                            </span>
                          </td>
                          <td className="py-4 px-4 text-right">
                            <span className="text-gray-600 dark:text-gray-400">
                              {user.transactionCount}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-center">
                            <Button
                              onClick={() => handleViewUser(user)}
                              variant="outline"
                              size="sm"
                              className="flex items-center gap-1"
                            >
                              <Eye className="w-4 h-4" />
                              {t('common.view')}
                            </Button>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* 分页 */}
              {Math.ceil(sortedUsers.length / pageSize) > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {t('vcount.management.page')} {currentPage} {t('common.of')} {Math.ceil(sortedUsers.length / pageSize)}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      variant="outline"
                      size="sm"
                    >
                      {t('common.previous')}
                    </Button>
                    <Button
                      onClick={() => setCurrentPage(Math.min(Math.ceil(sortedUsers.length / pageSize), currentPage + 1))}
                      disabled={currentPage === Math.ceil(sortedUsers.length / pageSize)}
                      variant="outline"
                      size="sm"
                    >
                      {t('common.next')}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </motion.div>

        {/* 用户详情模态框 */}
        {showUserDetail && selectedUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowUserDetail(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {t('vcount.management.userDetail')}
                  </h3>
                  <button
                    onClick={() => setShowUserDetail(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    ×
                  </button>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">
                      {t('vcount.management.userInfo')}
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">{t('profile.name')}:</span>
                        <span className="ml-2 text-gray-900 dark:text-gray-100">{selectedUser.userId.name}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">{t('profile.email')}:</span>
                        <span className="ml-2 text-gray-900 dark:text-gray-100">{selectedUser.userId.email}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">{t('profile.role')}:</span>
                        <span className="ml-2 text-gray-900 dark:text-gray-100">{selectedUser.userId.role}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">
                      {t('vcount.management.vcountInfo')}
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">{t('vcount.currentBalance')}:</span>
                        <span className="ml-2 font-medium text-gray-900 dark:text-gray-100">
                          {selectedUser.balance.toFixed(2)} V
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">{t('profile.totalRecharged')}:</span>
                        <span className="ml-2 text-green-600 dark:text-green-400">
                          {selectedUser.totalRecharged.toFixed(2)} V
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">{t('profile.totalSpent')}:</span>
                        <span className="ml-2 text-orange-600 dark:text-orange-400">
                          {selectedUser.totalSpent.toFixed(2)} V
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">{t('profile.transactionCount')}:</span>
                        <span className="ml-2 text-gray-900 dark:text-gray-100">{selectedUser.transactionCount}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default VCountManagementPage;
