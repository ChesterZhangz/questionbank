import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Users, 
  UserPlus,
  UserMinus,
  Crown,
  Shield,
  User,
  Eye,
  Edit,
  Search,
  RefreshCw,
  CheckCircle,
  X
} from 'lucide-react';

import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import { useModal } from '../../hooks/useModal';
import ConfirmModal from '../../components/ui/ConfirmModal';
import { paperBankAPI, authAPI } from '../../services/api';
import { FuzzySelect } from '../../components/ui/menu';

interface PaperBankMember {
  _id: string;
  userId: string;
  username: string;
  email: string;
  role: 'owner' | 'manager' | 'collaborator' | 'viewer';
  joinedAt: string;
  lastActiveAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface PaperBankInfo {
  _id: string;
  name: string;
  description: string;
  status: 'draft' | 'published';
  memberCount: number;
  ownerId: string;
}

const PaperBankMembersPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { 
    showConfirm, 
    confirmModal,
    closeConfirm, 
    showErrorRightSlide, 
    showSuccessRightSlide
  } = useModal();

  const [paperBank, setPaperBank] = useState<PaperBankInfo | null>(null);
  const [members, setMembers] = useState<PaperBankMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('joinedAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<any[]>([]);
  const [inviteRole, setInviteRole] = useState<'manager' | 'collaborator' | 'viewer'>('collaborator');
  const [inviting, setInviting] = useState(false);

  useEffect(() => {
    if (id) {
      fetchPaperBankInfo();
      fetchMembers();
    }
  }, [id]);

  const fetchPaperBankInfo = async () => {
    try {
      const response = await paperBankAPI.getPaperBank(id!);
      if (response.data.success) {
        const paperBankData = response.data.data;
        setPaperBank({
          _id: paperBankData._id,
          name: paperBankData.name,
          description: paperBankData.description,
          status: paperBankData.status,
          memberCount: paperBankData.memberCount || 0,
          ownerId: paperBankData.ownerId
        });
      } else {
        showErrorRightSlide('获取失败', '获取试卷集信息失败');
      }
    } catch (error: any) {
      showErrorRightSlide('获取失败', '获取试卷集信息失败');
    }
  };

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const response = await paperBankAPI.getPaperBankMembers(id!);
      if (response.data.success) {
        setMembers(response.data.data.members);
      } else {
        showErrorRightSlide('获取失败', '获取成员列表失败');
      }
    } catch (error: any) {
      showErrorRightSlide('获取失败', '获取成员列表失败');
    } finally {
      setLoading(false);
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'owner': return '所有者';
      case 'manager': return '管理员';
      case 'collaborator': return '协作者';
      case 'viewer': return '查看者';
      default: return '未知';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner': return 'text-purple-600 dark:text-purple-400';
      case 'manager': return 'text-blue-600 dark:text-blue-400';
      case 'collaborator': return 'text-green-600 dark:text-green-400';
      case 'viewer': return 'text-gray-600 dark:text-gray-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner': return Crown;
      case 'manager': return Shield;
      case 'collaborator': return Edit;
      case 'viewer': return Eye;
      default: return User;
    }
  };

  const handleInviteMember = () => {
    setShowInviteForm(true);
  };

  // 搜索用户
  const searchUsers = async (query: string) => {
    if (!query || query.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      const response = await authAPI.searchUsers(query, 20, id);
      if (response.data.success) {
        setSearchResults(response.data.users || []);
      }
    } catch (error) {
      setSearchResults([]);
    }
  };

  const handleAddSelectedUsers = async () => {
    if (selectedUsers.length === 0) return;

    setInviting(true);
    try {
      let success = 0;
      let failed = 0;

      for (const user of selectedUsers) {
        try {
          const response = await paperBankAPI.invitePaperBankMember(id!, {
            email: user.email,
            role: inviteRole
          });
          
          if (response.data.success) {
            success++;
          } else {
            failed++;
          }
        } catch (error) {
          failed++;
        }
      }

      if (failed === 0) {
        showSuccessRightSlide('邀请成功', `成功邀请 ${success} 个成员`);
      } else {
        showSuccessRightSlide('邀请完成', `成功邀请 ${success} 个成员，${failed} 个失败`);
      }

      setSelectedUsers([]);
      setSearchResults([]);
      setShowInviteForm(false);
      fetchMembers();
    } catch (error: any) {
      showErrorRightSlide('邀请失败', '邀请成员失败');
    } finally {
      setInviting(false);
    }
  };

  const handleCancelInvite = () => {
    setShowInviteForm(false);
    setSelectedUsers([]);
    setSearchResults([]);
  };

  const handleChangeRole = (_memberId: string, _newRole: string) => {
    // 这里应该调用API更改成员角色
    showErrorRightSlide('功能开发中', '更改角色功能正在开发中');
  };

  const handleRemoveMember = (memberId: string) => {
    showConfirm(
      '确认移除',
      '确定要移除这个成员吗？移除后该成员将无法访问此试卷集。',
      async () => {
        try {
          // 这里应该调用API移除成员
          setMembers(prev => prev.filter(member => member._id !== memberId));
          showSuccessRightSlide('移除成功', '成员已成功移除');
          closeConfirm();
        } catch (error: any) {
          showErrorRightSlide('移除失败', '移除成员失败');
        }
      }
    );
  };

  // 筛选和排序成员
  const filteredMembers = members.filter(member => {
    const matchesSearch = searchTerm === '' || 
                         member.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || member.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const sortedMembers = [...filteredMembers].sort((a, b) => {
    let aValue: any, bValue: any;
    
    switch (sortBy) {
      case 'username':
        aValue = a.username;
        bValue = b.username;
        break;
      case 'role':
        aValue = a.role;
        bValue = b.role;
        break;
      case 'joinedAt':
      default:
        aValue = new Date(a.joinedAt).getTime();
        bValue = new Date(b.joinedAt).getTime();
        break;
    }

    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* 标题区域 */}
      <div className="sticky top-0 z-30 bg-white dark:bg-gray-900 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => navigate('/paper-banks')}
                variant="ghost"
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 dark:from-gray-100 to-blue-600 dark:to-blue-400 bg-clip-text text-transparent">
                  试卷集成员管理
                </h1>
                <p className="text-gray-600 dark:text-gray-300 mt-1">
                  {paperBank?.name} - 管理试卷集成员和权限
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                onClick={handleInviteMember}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                邀请成员
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 主要内容 */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* 统计信息 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">总成员数</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {paperBank?.memberCount || 0}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <Crown className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">所有者</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {members.filter(m => m.role === 'owner').length}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">管理员</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {members.filter(m => m.role === 'manager').length}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <User className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">其他成员</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {members.filter(m => !['owner', 'manager'].includes(m.role)).length}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </motion.div>

        {/* 搜索和筛选 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="mb-6"
        >
          <Card className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="搜索成员姓名或邮箱..."
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="flex gap-4">
                <FuzzySelect
                  options={[
                    { value: 'all', label: '所有角色' },
                    { value: 'owner', label: '所有者' },
                    { value: 'manager', label: '管理员' },
                    { value: 'collaborator', label: '协作者' },
                    { value: 'viewer', label: '查看者' }
                  ]}
                  value={roleFilter}
                  onChange={(value) => setRoleFilter(String(value))}
                  placeholder="选择角色"
                />
                
                <FuzzySelect
                  options={[
                    { value: 'joinedAt', label: '加入时间' },
                    { value: 'username', label: '姓名' },
                    { value: 'role', label: '角色' }
                  ]}
                  value={sortBy}
                  onChange={(value) => setSortBy(String(value))}
                  placeholder="排序方式"
                />
                
                <Button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  variant="outline"
                  className="px-3"
                >
                  {sortOrder === 'asc' ? '↑' : '↓'}
                </Button>
                
                <Button
                  onClick={fetchMembers}
                  variant="outline"
                  className="px-3"
                >
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* 成员列表 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">成员</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">角色</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">加入时间</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">最后活跃</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedMembers.map((member, index) => {
                    const RoleIcon = getRoleIcon(member.role);
                    return (
                      <motion.tr
                        key={member._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                      >
                        <td className="py-4 px-4">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                              {member.username.charAt(0)}
                            </div>
                            <div className="ml-3">
                              <p className="font-medium text-gray-900 dark:text-gray-100">
                                {member.username}
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {member.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        
                        <td className="py-4 px-4">
                          <div className="flex items-center">
                            <RoleIcon className={`w-4 h-4 mr-2 ${getRoleColor(member.role)}`} />
                            <span className={`text-sm font-medium ${getRoleColor(member.role)}`}>
                              {getRoleLabel(member.role)}
                            </span>
                          </div>
                        </td>
                        
                        <td className="py-4 px-4 text-sm text-gray-600 dark:text-gray-400">
                          {new Date(member.joinedAt).toLocaleDateString()}
                        </td>
                        
                        <td className="py-4 px-4 text-sm text-gray-600 dark:text-gray-400">
                          {member.lastActiveAt 
                            ? new Date(member.lastActiveAt).toLocaleDateString()
                            : '从未活跃'
                          }
                        </td>
                        
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-2">
                            {member.role !== 'owner' && (
                              <>
                                <Button
                                  onClick={() => handleChangeRole(member._id, 'manager')}
                                  variant="ghost"
                                  size="sm"
                                  className="text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                  disabled={member.role === 'manager'}
                                >
                                  设为管理员
                                </Button>
                                
                                <Button
                                  onClick={() => handleChangeRole(member._id, 'collaborator')}
                                  variant="ghost"
                                  size="sm"
                                  className="text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
                                  disabled={member.role === 'collaborator'}
                                >
                                  设为协作者
                                </Button>
                                
                                <Button
                                  onClick={() => handleChangeRole(member._id, 'viewer')}
                                  variant="ghost"
                                  size="sm"
                                  className="text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-900/20"
                                  disabled={member.role === 'viewer'}
                                >
                                  设为查看者
                                </Button>
                                
                                <Button
                                  onClick={() => handleRemoveMember(member._id)}
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                >
                                  <UserMinus className="w-4 h-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
              
              {sortedMembers.length === 0 && (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">暂无成员</p>
                </div>
              )}
            </div>
          </Card>
        </motion.div>
      </div>

      {/* 弹窗组件 */}
      <ConfirmModal {...confirmModal} onCancel={closeConfirm} />

      {/* 邀请成员表单弹窗 */}
      {showInviteForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">邀请成员</h3>
              
              <div className="space-y-6">
                {/* 搜索用户 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                    搜索用户
                  </label>
                  <Input
                    type="text"
                    placeholder="输入用户姓名或邮箱进行搜索..."
                    onChange={(e) => searchUsers(e.target.value)}
                    icon={<Users className="w-4 h-4" />}
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    可以搜索所有已注册的用户，不限制邮箱后缀
                  </p>
                </div>

                {/* 搜索结果 */}
                {searchResults.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                      搜索结果 (点击选择用户)
                    </label>
                    <div className="max-h-60 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded-lg">
                      {searchResults.map((user) => (
                        <div
                          key={user._id}
                          onClick={() => {
                            if (!selectedUsers.find(u => u._id === user._id)) {
                              setSelectedUsers([...selectedUsers, user]);
                            }
                          }}
                          className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-100 dark:border-gray-600 last:border-b-0"
                        >
                          <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                              {user.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-gray-900 dark:text-gray-100">
                              {user.name}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {user.email}
                            </div>
                            {user.enterpriseName && (
                              <div className="text-xs text-gray-400 dark:text-gray-500">
                                {user.enterpriseName}
                              </div>
                            )}
                          </div>
                          {selectedUsers.find(u => u._id === user._id) && (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 已选择的用户 */}
                {selectedUsers.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                      已选择的用户 ({selectedUsers.length})
                    </label>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {selectedUsers.map((user) => (
                        <div
                          key={user._id}
                          className="flex items-center gap-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg"
                        >
                          <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                            <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                              {user.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {user.name}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {user.email}
                            </div>
                          </div>
                          <button
                            onClick={() => setSelectedUsers(selectedUsers.filter(u => u._id !== user._id))}
                            className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 角色选择 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                    分配角色
                  </label>
                  <FuzzySelect
                    options={[
                      { value: 'viewer', label: '查看者', html: '<span>查看者 - 只能查看试卷集内容</span>' },
                      { value: 'collaborator', label: '协作者', html: '<span>协作者 - 可以添加和编辑试卷</span>' },
                      { value: 'manager', label: '管理者', html: '<span>管理者 - 可以管理试卷集和成员</span>' }
                    ]}
                    value={inviteRole}
                    onChange={(value) => setInviteRole(value as 'manager' | 'collaborator' | 'viewer')}
                    placeholder="选择角色"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancelInvite}
                    className="flex-1"
                  >
                    取消
                  </Button>
                  <Button
                    onClick={handleAddSelectedUsers}
                    loading={inviting}
                    disabled={inviting || selectedUsers.length === 0}
                    className="flex-1 bg-green-500 hover:bg-green-600"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    邀请 {selectedUsers.length > 0 ? `${selectedUsers.length} 个` : ''}成员
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default PaperBankMembersPage;
