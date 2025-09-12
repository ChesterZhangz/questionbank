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
import RoleSelector from '../../components/ui/RoleSelector';
import { useModal } from '../../hooks/useModal';
import ConfirmModal from '../../components/ui/ConfirmModal';
import RightSlideModal from '../../components/ui/RightSlideModal';
import { paperBankAPI, authAPI } from '../../services/api';
import { FuzzySelect } from '../../components/ui/menu';
import { useTranslation } from '../../hooks/useTranslation';

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
  const { t } = useTranslation();
  const { 
    showConfirm, 
    confirmModal,
    closeConfirm, 
    setConfirmLoading,
    rightSlideModal,
    closeRightSlide,
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
  const [isOwner, setIsOwner] = useState(false);

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
        
        // 检查当前用户是否是试卷集的所有者
        const currentUser = await authAPI.getCurrentUser();
        if (currentUser.data.success && currentUser.data.user) {
          setIsOwner(currentUser.data.user._id === paperBankData.ownerId);
        }
      } else {
        showErrorRightSlide(t('paperBanks.members.messages.fetchFailed'), t('paperBanks.members.messages.fetchPaperBankFailed'));
      }
    } catch (error: any) {
      showErrorRightSlide(t('paperBanks.members.messages.fetchFailed'), t('paperBanks.members.messages.fetchPaperBankFailed'));
    }
  };

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const response = await paperBankAPI.getPaperBankMembers(id!);
      if (response.data.success) {
        setMembers(response.data.data.members);
      } else {
        showErrorRightSlide(t('paperBanks.members.messages.fetchFailed'), t('paperBanks.members.messages.fetchMembersFailed'));
      }
    } catch (error: any) {
      showErrorRightSlide(t('paperBanks.members.messages.fetchFailed'), t('paperBanks.members.messages.fetchMembersFailed'));
    } finally {
      setLoading(false);
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'owner': return t('paperBanks.members.roles.owner');
      case 'manager': return t('paperBanks.members.roles.manager');
      case 'collaborator': return t('paperBanks.members.roles.collaborator');
      case 'viewer': return t('paperBanks.members.roles.viewer');
      default: return t('paperBanks.members.roles.unknown');
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
      const newMembers: PaperBankMember[] = [];

      for (const user of selectedUsers) {
        try {
          const response = await paperBankAPI.invitePaperBankMember(id!, {
            email: user.email,
            role: inviteRole
          });
          
          if (response.data.success) {
            success++;
            // 创建新成员对象并添加到本地状态
            const newMember: PaperBankMember = {
              _id: response.data.data._id,
              userId: user._id,
              username: user.name,
              email: user.email,
              role: inviteRole,
              joinedAt: new Date().toISOString(),
              lastActiveAt: new Date().toISOString()
            };
            newMembers.push(newMember);
          } else {
            failed++;
          }
        } catch (error) {
          failed++;
        }
      }

      // 更新本地状态
      if (newMembers.length > 0) {
        setMembers(prev => [...prev, ...newMembers]);
        setPaperBank(prev => prev ? { ...prev, memberCount: prev.memberCount + newMembers.length } : null);
      }

      if (failed === 0) {
        showSuccessRightSlide(t('paperBanks.members.messages.inviteSuccess'), t('paperBanks.members.messages.inviteSuccessMessage', { count: success }));
      } else {
        showSuccessRightSlide(t('paperBanks.members.messages.inviteComplete'), t('paperBanks.members.messages.inviteCompleteMessage', { success, failed }));
      }

      setSelectedUsers([]);
      setSearchResults([]);
      setShowInviteForm(false);
    } catch (error: any) {
      showErrorRightSlide(t('paperBanks.members.messages.inviteFailed'), t('paperBanks.members.messages.inviteFailedMessage'));
    } finally {
      setInviting(false);
    }
  };

  const handleCancelInvite = () => {
    setShowInviteForm(false);
    setSelectedUsers([]);
    setSearchResults([]);
  };

  const handleChangeRole = async (memberId: string, newRole: string) => {
    try {
      const response = await paperBankAPI.updatePaperBankMemberRole(id!, memberId, newRole as 'manager' | 'collaborator' | 'viewer');
      if (response.data.success) {
        // 更新本地状态中的成员角色
        setMembers(prev => prev.map(member => 
          member._id === memberId 
            ? { ...member, role: newRole as 'manager' | 'collaborator' | 'viewer' }
            : member
        ));
        showSuccessRightSlide(t('paperBanks.members.messages.roleUpdateSuccess'), t('paperBanks.members.messages.roleUpdateSuccessMessage'));
      } else {
        showErrorRightSlide(t('paperBanks.members.messages.roleUpdateFailed'), response.data.message || t('paperBanks.members.messages.roleUpdateFailedMessage'));
      }
    } catch (error: any) {
      showErrorRightSlide(t('paperBanks.members.messages.roleUpdateFailed'), t('paperBanks.members.messages.roleUpdateFailedMessage'));
    }
  };

  const handleRemoveMember = (memberId: string) => {
    showConfirm(
      t('paperBanks.members.confirm.removeTitle'),
      t('paperBanks.members.confirm.removeMessage'),
      async () => {
        try {
          setConfirmLoading(true, t('paperBanks.members.confirm.removeConfirm'));
          const response = await paperBankAPI.removePaperBankMember(id!, memberId);
          if (response.data.success) {
            // 直接从本地状态中移除成员，不刷新页面
            setMembers(prev => prev.filter(member => member._id !== memberId));
            // 更新试卷集成员数量
            setPaperBank(prev => prev ? { ...prev, memberCount: prev.memberCount - 1 } : null);
            closeConfirm();
            showSuccessRightSlide(t('paperBanks.members.messages.removeSuccess'), t('paperBanks.members.messages.removeSuccessMessage'));
          } else {
            setConfirmLoading(false);
            showErrorRightSlide(t('paperBanks.members.messages.removeFailed'), response.data.message || t('paperBanks.members.messages.removeFailedMessage'));
          }
        } catch (error: any) {
          setConfirmLoading(false);
          showErrorRightSlide(t('paperBanks.members.messages.removeFailed'), t('paperBanks.members.messages.removeFailedMessage'));
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
          <p className="mt-4 text-gray-600 dark:text-gray-400">{t('paperBanks.members.loading')}</p>
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
                  {t('paperBanks.members.title')}
                </h1>
                <p className="text-gray-600 dark:text-gray-300 mt-1">
                  {t('paperBanks.members.subtitle', { name: paperBank?.name || '' })}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                onClick={handleInviteMember}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                {t('paperBanks.members.inviteMember')}
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
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('paperBanks.members.stats.totalMembers')}</p>
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
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('paperBanks.members.stats.owners')}</p>
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
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('paperBanks.members.stats.managers')}</p>
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
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('paperBanks.members.stats.otherMembers')}</p>
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
                    placeholder={t('paperBanks.members.search.placeholder')}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="flex gap-4">
                <FuzzySelect
                  options={[
                    { value: 'all', label: t('paperBanks.members.search.allRoles') },
                    { value: 'owner', label: t('paperBanks.members.roles.owner') },
                    { value: 'manager', label: t('paperBanks.members.roles.manager') },
                    { value: 'collaborator', label: t('paperBanks.members.roles.collaborator') },
                    { value: 'viewer', label: t('paperBanks.members.roles.viewer') }
                  ]}
                  value={roleFilter}
                  onChange={(value) => setRoleFilter(String(value))}
                  placeholder={t('paperBanks.members.search.selectRole')}
                />
                
                <FuzzySelect
                  options={[
                    { value: 'joinedAt', label: t('paperBanks.members.search.sortOptions.joinedAt') },
                    { value: 'username', label: t('paperBanks.members.search.sortOptions.username') },
                    { value: 'role', label: t('paperBanks.members.search.sortOptions.role') }
                  ]}
                  value={sortBy}
                  onChange={(value) => setSortBy(String(value))}
                  placeholder={t('paperBanks.members.search.sortBy')}
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
            <div className="overflow-x-auto overflow-y-visible">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">{t('paperBanks.members.table.member')}</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">{t('paperBanks.members.table.role')}</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">{t('paperBanks.members.table.joinedAt')}</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">{t('paperBanks.members.table.lastActive')}</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">{t('paperBanks.members.table.actions')}</th>
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
                            : t('paperBanks.members.table.neverActive')
                          }
                        </td>
                        
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-3">
                            {member.role !== 'owner' && isOwner && (
                              <>
                                <RoleSelector
                                  currentRole={member.role}
                                  onRoleChange={(newRole) => handleChangeRole(member._id, newRole)}
                                  disabled={false}
                                  showLabel={false}
                                  className="min-w-[140px]"
                                />
                                
                                <Button
                                  onClick={() => handleRemoveMember(member._id)}
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                  title={t('paperBanks.members.table.removeMember')}
                                >
                                  <UserMinus className="w-4 h-4" />
                                </Button>
                              </>
                            )}
                            
                            {member.role === 'owner' && (
                              <div className="flex items-center text-gray-500 dark:text-gray-400">
                                <Crown className="w-4 h-4 mr-2" />
                                <span className="text-sm">{t('paperBanks.members.table.paperBankOwner')}</span>
                              </div>
                            )}
                            
                            {!isOwner && (
                              <div className="flex items-center text-gray-500 dark:text-gray-400">
                                <Eye className="w-4 h-4 mr-2" />
                                <span className="text-sm">{t('paperBanks.members.table.noPermission')}</span>
                              </div>
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
                  <p className="text-gray-500 dark:text-gray-400">{t('paperBanks.members.table.noMembers')}</p>
                </div>
              )}
            </div>
          </Card>
        </motion.div>
      </div>

      {/* 弹窗组件 */}
      <ConfirmModal {...confirmModal} onCancel={closeConfirm} />
      <RightSlideModal {...rightSlideModal} onClose={closeRightSlide} />

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
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">{t('paperBanks.members.inviteForm.title')}</h3>
              
              <div className="space-y-6">
                {/* 搜索用户 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                    {t('paperBanks.members.inviteForm.searchUser')}
                  </label>
                  <Input
                    type="text"
                    placeholder={t('paperBanks.members.inviteForm.searchPlaceholder')}
                    onChange={(e) => searchUsers(e.target.value)}
                    icon={<Users className="w-4 h-4" />}
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {t('paperBanks.members.inviteForm.searchDescription')}
                  </p>
                </div>

                {/* 搜索结果 */}
                {searchResults.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                      {t('paperBanks.members.inviteForm.searchResults')}
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
                      {t('paperBanks.members.inviteForm.selectedUsers', { count: selectedUsers.length })}
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
                    {t('paperBanks.members.inviteForm.assignRole')}
                  </label>
                  <FuzzySelect
                    options={[
                      { value: 'viewer', label: t('paperBanks.members.inviteForm.roleOptions.viewer'), html: `<span>${t('paperBanks.members.inviteForm.roleOptions.viewer')}</span>` },
                      { value: 'collaborator', label: t('paperBanks.members.inviteForm.roleOptions.collaborator'), html: `<span>${t('paperBanks.members.inviteForm.roleOptions.collaborator')}</span>` },
                      { value: 'manager', label: t('paperBanks.members.inviteForm.roleOptions.manager'), html: `<span>${t('paperBanks.members.inviteForm.roleOptions.manager')}</span>` }
                    ]}
                    value={inviteRole}
                    onChange={(value) => setInviteRole(value as 'manager' | 'collaborator' | 'viewer')}
                    placeholder={t('paperBanks.members.inviteForm.selectRole')}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancelInvite}
                    className="flex-1"
                  >
                    {t('paperBanks.members.inviteForm.cancel')}
                  </Button>
                  <Button
                    onClick={handleAddSelectedUsers}
                    loading={inviting}
                    disabled={inviting || selectedUsers.length === 0}
                    className="flex-1 bg-green-500 hover:bg-green-600"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    {t('paperBanks.members.inviteForm.invite', { count: selectedUsers.length })}
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
