import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Users, 
  UserPlus, 
  UserMinus, 
  Crown, 
  Shield, 
  User as UserIcon,
  Mail,
  ArrowLeft,
  CheckSquare,
  Square,
  UserX,
  X,
  CheckCircle
} from 'lucide-react';
import { questionBankAPI, authAPI } from '../../services/api';
import { useAuthStore } from '../../stores/authStore';
import type { QuestionBank } from '../../types';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';
import LoadingPage from '../../components/ui/LoadingPage';
import ConfirmModal from '../../components/ui/ConfirmModal';
import RightSlideModal from '../../components/ui/RightSlideModal';
import { useModal } from '../../hooks/useModal';
import { useTranslation } from '../../hooks/useTranslation';
import { MultiSelect, FuzzySelect } from '../../components/ui/menu';
import Avatar from '../../components/ui/Avatar';

interface MemberInfo {
  _id: string;
  name: string;
  email: string;
  role: 'creator' | 'manager' | 'collaborator' | 'viewer' | 'enterprise_viewer';
  joinedAt: string;
}

const QuestionBankMembersPage: React.FC = () => {
  const { bid } = useParams<{ bid: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { t } = useTranslation();

  // 弹窗状态管理
  const { 
    showConfirm, 
    confirmModal, 
    closeConfirm,
    setConfirmLoading,
    showSuccessRightSlide,
    showErrorRightSlide,
    rightSlideModal,
    closeRightSlide
  } = useModal();
  const [questionBank, setQuestionBank] = useState<QuestionBank | null>(null);
  const [members, setMembers] = useState<MemberInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string>('');
  const [showAddMember, setShowAddMember] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<(string | number)[]>(['all']);
  
  // 用户搜索相关
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const [selectedUsers, setSelectedUsers] = useState<any[]>([]);
  const [selectedRole, setSelectedRole] = useState<'manager' | 'collaborator' | 'viewer'>('collaborator');

  // 批量操作状态
  const [selectedMembers, setSelectedMembers] = useState<Set<string>>(new Set());
  const [isBatchAdding, setIsBatchAdding] = useState(false);
  const [isBatchRemoving, setIsBatchRemoving] = useState(false);

  useEffect(() => {
    if (bid) {
      fetchQuestionBank();
      fetchMembers();
    }
  }, [bid]);

  // 处理模态框滚动锁定
  useEffect(() => {
    if (showAddMember) {
      // 禁用主屏幕滚动
      document.body.style.overflow = 'hidden';
    } else {
      // 恢复主屏幕滚动
      document.body.style.overflow = 'unset';
    }

    // 清理函数
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showAddMember]);

  const fetchQuestionBank = async () => {
    try {
      const response = await questionBankAPI.getQuestionBank(bid!);
      if (response.data.success) {
        setQuestionBank(response.data.questionBank!);
        determineUserRole(response.data.questionBank!);
      } else {
        setError(response.data.error || t('questionBankPage.QuestionBankMembersPage.errors.loadFailed'));
      }
    } catch (error: any) {
      setError(error.response?.data?.error || t('questionBankPage.QuestionBankMembersPage.errors.loadFailed'));
    } finally {
      setLoading(false);
    }
  };

  const fetchMembers = async () => {
    try {
      const response = await questionBankAPI.getMembers(bid!);
      if (response.data.success) {
        const membersData = response.data.members;
        if (membersData) {
          // 将后端返回的嵌套结构转换为扁平数组
          const membersArray: MemberInfo[] = [];
          
          // 添加创建者
          if (membersData.creator) {
            membersArray.push({
              _id: membersData.creator._id,
              name: membersData.creator.name,
              email: membersData.creator.email,
              role: 'creator',
              joinedAt: new Date().toISOString() // 创建者没有joinedAt字段，使用当前时间
            });
          }
          
          // 添加管理者
          if (membersData.managers && Array.isArray(membersData.managers)) {
            membersData.managers.forEach((manager: any) => {
              membersArray.push({
                _id: manager._id,
                name: manager.name,
                email: manager.email,
                role: 'manager',
                joinedAt: new Date().toISOString() // 暂时使用当前时间
              });
            });
          }
          
          // 添加协作者
          if (membersData.collaborators && Array.isArray(membersData.collaborators)) {
            membersData.collaborators.forEach((collaborator: any) => {
              membersArray.push({
                _id: collaborator._id,
                name: collaborator.name,
                email: collaborator.email,
                role: 'collaborator',
                joinedAt: new Date().toISOString() // 暂时使用当前时间
              });
            });
          }
          
          // 添加查看者
          if (membersData.viewers && Array.isArray(membersData.viewers)) {
            membersData.viewers.forEach((viewer: any) => {
              membersArray.push({
                _id: viewer._id,
                name: viewer.name,
                email: viewer.email,
                role: 'viewer',
                joinedAt: new Date().toISOString() // 暂时使用当前时间
              });
            });
          }
          
          // 添加企业查看者
          if (membersData.enterprise_viewers && Array.isArray(membersData.enterprise_viewers)) {
            membersData.enterprise_viewers.forEach((viewer: any) => {
              membersArray.push({
                _id: viewer._id,
                name: viewer.name,
                email: viewer.email,
                role: 'enterprise_viewer',
                joinedAt: new Date().toISOString() // 暂时使用当前时间
              });
            });
          }
          
          setMembers(membersArray);
        } else {
          setMembers([]);
        }
      } else {
        setMembers([]);
      }
    } catch (error: any) {
      // 错误日志已清理
      setMembers([]); // 确保在错误时设置为空数组
    }
  };

  const determineUserRole = (bank: QuestionBank) => {
    const userId = user?._id?.toString();
    const creatorId = bank.creator._id?.toString();
    
    if (creatorId === userId) {
      setUserRole('creator');
    } else if (bank.managers.some(m => m._id?.toString() === userId)) {
      setUserRole('manager');
    } else if (bank.collaborators.some(c => c._id?.toString() === userId)) {
      setUserRole('collaborator');
    } else if (bank.viewers && bank.viewers.some(v => v._id?.toString() === userId)) {
      setUserRole('viewer');
    } else {
      setUserRole('viewer'); // 可能是企业查看者或其他情况
    }
  };



  const handleRemoveMember = async (memberId: string) => {
    showConfirm(
      t('questionBankPage.QuestionBankMembersPage.confirm.removeMember'),
      t('questionBankPage.QuestionBankMembersPage.confirm.removeMemberMessage'),
      async () => {
        try {
          setConfirmLoading(true, t('questionBankPage.QuestionBankMembersPage.status.removing'));
          const response = await questionBankAPI.removeMember(bid!, memberId);
          if (response.data.success) {
            fetchMembers(); // 重新获取成员列表
            closeConfirm(); // 成功后关闭弹窗
            showSuccessRightSlide(t('questionBankPage.QuestionBankMembersPage.success.removed'), t('questionBankPage.QuestionBankMembersPage.success.memberRemoved'));
          } else {
            closeConfirm();
            showErrorRightSlide(t('questionBankPage.QuestionBankMembersPage.errors.removeFailed'), response.data.error || t('questionBankPage.QuestionBankMembersPage.errors.removeMemberFailed'));
          }
        } catch (error: any) {
          closeConfirm();
          showErrorRightSlide(t('questionBankPage.QuestionBankMembersPage.errors.removeFailed'), error.response?.data?.error || t('questionBankPage.QuestionBankMembersPage.errors.removeMemberFailed'));
        }
      }
    );
  };

  const handleChangeRole = async (memberId: string, newRole: 'manager' | 'collaborator' | 'viewer') => {
    try {
      // 先移除当前角色，再添加新角色
      await questionBankAPI.removeMember(bid!, memberId);
      const member = members.find(m => m._id === memberId);
      if (member) {
        await questionBankAPI.addMember(bid!, {
          email: member.email,
          role: newRole
        });
        fetchMembers(); // 重新获取成员列表
      }
    } catch (error: any) {
      showErrorRightSlide(t('questionBankPage.QuestionBankMembersPage.errors.changeRoleFailed'), error.response?.data?.error || t('questionBankPage.QuestionBankMembersPage.errors.changeRoleFailedMessage'));
    }
  };

  // 批量选择操作
  const handleSelectMember = (memberId: string) => {
    const newSelected = new Set(selectedMembers);
    if (newSelected.has(memberId)) {
      newSelected.delete(memberId);
    } else {
      newSelected.add(memberId);
    }
    setSelectedMembers(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedMembers.size === filteredMembers.length) {
      setSelectedMembers(new Set());
    } else {
      const allMemberIds = filteredMembers.map(m => m._id);
      setSelectedMembers(new Set(allMemberIds));
    }
  };



  // 批量删除成员
  const handleBatchRemoveMembers = async () => {
    if (selectedMembers.size === 0) return;

    showConfirm(
      t('questionBankPage.QuestionBankMembersPage.confirm.batchRemoveMembers'),
      t('questionBankPage.QuestionBankMembersPage.confirm.batchRemoveMembersMessage', { count: selectedMembers.size }),
      async () => {
        try {
          setConfirmLoading(true, t('questionBankPage.QuestionBankMembersPage.status.deleting'));
          setIsBatchRemoving(true);
          
          const results = await Promise.allSettled(
            Array.from(selectedMembers).map(memberId => 
              questionBankAPI.removeMember(bid!, memberId)
            )
          );

          const successCount = results.filter(r => r.status === 'fulfilled').length;
          const failCount = results.filter(r => r.status === 'rejected').length;

          setSelectedMembers(new Set());
          fetchMembers();

          closeConfirm(); // 操作完成后关闭弹窗

          if (failCount === 0) {
            showSuccessRightSlide(t('questionBankPage.QuestionBankMembersPage.success.batchRemoved'), t('questionBankPage.QuestionBankMembersPage.success.batchRemovedMessage', { count: successCount }));
          } else {
            showSuccessRightSlide(t('questionBankPage.QuestionBankMembersPage.success.batchRemovedPartial'), t('questionBankPage.QuestionBankMembersPage.success.batchRemovedPartialMessage', { successCount, failCount }));
          }
        } catch (error: any) {
          closeConfirm();
          showErrorRightSlide(t('questionBankPage.QuestionBankMembersPage.errors.batchRemoveFailed'), error.response?.data?.error || t('questionBankPage.QuestionBankMembersPage.errors.batchRemoveFailedMessage'));
        } finally {
          setIsBatchRemoving(false);
        }
      }
    );
  };

  // 搜索用户
  const searchUsers = async (query: string) => {
    if (!query || query.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      const response = await authAPI.searchUsers(query, 20, bid);
      if (response.data.success) {
        setSearchResults(response.data.users || []);
      }
    } catch (error) {
      // 错误日志已清理
      setSearchResults([]);
    }
  };

  // 添加选中的用户
  const handleAddSelectedUsers = async () => {
    if (selectedUsers.length === 0) return;

    try {
      setIsBatchAdding(true);
      
      const results = await Promise.allSettled(
        selectedUsers.map(user => 
          questionBankAPI.addMember(bid!, {
            email: user.email,
            role: selectedRole
          })
        )
      );

      const successCount = results.filter(r => r.status === 'fulfilled').length;
      const failCount = results.filter(r => r.status === 'rejected').length;

      setSelectedUsers([]);
      setShowAddMember(false);
      fetchMembers();

      if (failCount === 0) {
        showSuccessRightSlide(t('questionBankPage.QuestionBankMembersPage.success.added'), t('questionBankPage.QuestionBankMembersPage.success.addedMessage', { count: successCount }));
      } else {
        showSuccessRightSlide(t('questionBankPage.QuestionBankMembersPage.success.addedPartial'), t('questionBankPage.QuestionBankMembersPage.success.addedPartialMessage', { successCount, failCount }));
      }
    } catch (error: any) {
      showErrorRightSlide(t('questionBankPage.QuestionBankMembersPage.errors.addFailed'), error.response?.data?.error || t('questionBankPage.QuestionBankMembersPage.errors.addMemberFailed'));
    } finally {
      setIsBatchAdding(false);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'creator':
        return <Crown className="w-4 h-4 text-yellow-500" />;
      case 'manager':
        return <Shield className="w-4 h-4 text-blue-500" />;
      case 'collaborator':
        return <UserIcon className="w-4 h-4 text-green-500" />;
      case 'viewer':
        return <UserIcon className="w-4 h-4 text-gray-500" />;
      case 'enterprise_viewer':
        return <Users className="w-4 h-4 text-purple-500" />;
      default:
        return <UserIcon className="w-4 h-4 text-gray-500" />;
    }
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case 'creator':
        return t('questionBankPage.QuestionBankMembersPage.roles.creator');
      case 'manager':
        return t('questionBankPage.QuestionBankMembersPage.roles.manager');
      case 'collaborator':
        return t('questionBankPage.QuestionBankMembersPage.roles.collaborator');
      case 'viewer':
        return t('questionBankPage.QuestionBankMembersPage.roles.viewer');
      case 'enterprise_viewer':
        return t('questionBankPage.QuestionBankMembersPage.roles.enterpriseViewer');
      default:
        return t('questionBankPage.QuestionBankMembersPage.roles.unknown');
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'creator':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'manager':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'collaborator':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'viewer':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'enterprise_viewer':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const canManageMembers = userRole === 'creator' || userRole === 'manager';
  const canRemoveMember = (memberRole: string) => {
    // 企业查看者不能被删除（他们是隐式成员）
    if (memberRole === 'enterprise_viewer') return false;
    
    if (userRole === 'creator') return true;
    if (userRole === 'manager') return memberRole !== 'creator' && memberRole !== 'manager';
    return false;
  };

  const canChangeRole = (memberRole: string) => {
    // 企业查看者不能更改角色（他们是隐式成员）
    if (memberRole === 'enterprise_viewer') return false;
    
    if (userRole === 'creator') return memberRole !== 'creator';
    if (userRole === 'manager') return memberRole === 'collaborator' || memberRole === 'viewer';
    return false;
  };

  // 过滤成员
  const filteredMembers = members.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole.includes('all') || filterRole.includes(member.role as string);
    return matchesSearch && matchesRole;
  });

  if (loading) {
    return <LoadingPage />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 dark:text-red-400 text-lg mb-4">{error}</div>
          <Button onClick={() => navigate(-1)}>{t('questionBankPage.QuestionBankMembersPage.buttons.back')}</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* 页面头部 */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(-1)}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 w-4" />
                {t('questionBankPage.QuestionBankMembersPage.buttons.back')}
              </Button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{t('questionBankPage.QuestionBankMembersPage.title')}</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">{questionBank?.name}</p>
              </div>
            </div>
            
            {canManageMembers && (
              <Button
                onClick={() => setShowAddMember(true)}
                className="bg-green-500 hover:bg-green-600 text-white"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                {t('questionBankPage.QuestionBankMembersPage.buttons.addMember')}
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <div className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
                  <Crown className="w-5 w-5 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {members.filter(m => m.role === 'creator').length}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{t('questionBankPage.QuestionBankMembersPage.stats.creator')}</div>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {members.filter(m => m.role === 'manager').length}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{t('questionBankPage.QuestionBankMembersPage.stats.manager')}</div>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                  <UserIcon className="w-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {members.filter(m => m.role === 'collaborator').length}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{t('questionBankPage.QuestionBankMembersPage.stats.collaborator')}</div>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                  <UserIcon className="w-5 w-5 text-gray-600 dark:text-gray-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {members.filter(m => m.role === 'viewer' || m.role === 'enterprise_viewer').length}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{t('questionBankPage.QuestionBankMembersPage.stats.viewer')}</div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* 搜索和筛选 */}
        <Card className="mb-6">
          <div className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 w-4 text-gray-400 dark:text-gray-500" />
                  <Input
                    type="text"
                    placeholder={t('questionBankPage.QuestionBankMembersPage.search.placeholder')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="sm:w-64">
                <MultiSelect
                  label=""
                  options={[
                    { value: 'all', label: t('questionBankPage.QuestionBankMembersPage.filter.allRoles') },
                    { value: 'creator', label: t('questionBankPage.QuestionBankMembersPage.roles.creator') },
                    { value: 'manager', label: t('questionBankPage.QuestionBankMembersPage.roles.manager') },
                    { value: 'collaborator', label: t('questionBankPage.QuestionBankMembersPage.roles.collaborator') },
                    { value: 'viewer', label: t('questionBankPage.QuestionBankMembersPage.roles.viewer') }
                  ]}
                  value={filterRole}
                  onChange={setFilterRole}
                  placeholder={t('questionBankPage.QuestionBankMembersPage.filter.placeholder')}
                  maxDisplay={2}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </Card>



        {/* 成员列表 */}
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('questionBankPage.QuestionBankMembersPage.members.title')}</h3>
              
              <div className="flex items-center gap-3">
                {canManageMembers && (
                  <button
                    onClick={handleSelectAll}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                  >
                    {selectedMembers.size === filteredMembers.length ? (
                      <CheckSquare className="w-4 h-4" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                    {selectedMembers.size === filteredMembers.length ? t('questionBankPage.QuestionBankMembersPage.members.deselectAll') : t('questionBankPage.QuestionBankMembersPage.members.selectAll')}
                  </button>
                )}
                
                {selectedMembers.size > 0 && (
                  <Button
                    onClick={handleBatchRemoveMembers}
                    variant="outline"
                    loading={isBatchRemoving}
                    className="border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
                  >
                    <UserX className="w-4 h-4 mr-2" />
                    {t('questionBankPage.QuestionBankMembersPage.members.batchDelete', { count: selectedMembers.size })}
                  </Button>
                )}
              </div>
            </div>
            
            {filteredMembers.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">{t('questionBankPage.QuestionBankMembersPage.members.noMembers')}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredMembers.map((member) => (
                  <motion.div
                    key={member._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      {/* 批量选择复选框 */}
                      {canManageMembers && canRemoveMember(member.role) && (
                        <button
                          onClick={() => handleSelectMember(member._id)}
                          className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        >
                          {selectedMembers.has(member._id) ? (
                            <CheckSquare className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          ) : (
                            <Square className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                          )}
                        </button>
                      )}
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium">
                          {member.name && member.name.length > 0 ? member.name.charAt(0).toUpperCase() : '?'}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-gray-100">{member.name || t('questionBankPage.QuestionBankMembersPage.members.unknownUser')}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                          <Mail className="w-3 w-3" />
                          {member.email}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className={`flex items-center gap-2 px-3 py-1 rounded-full border ${getRoleColor(member.role)}`}>
                        {getRoleIcon(member.role)}
                        <span className="text-sm font-medium">{getRoleText(member.role)}</span>
                      </div>

                      {canManageMembers && (
                        <div className="flex items-center gap-2">
                          {canChangeRole(member.role) && (
                            <select
                              value={member.role}
                              onChange={(e) => handleChangeRole(member._id, e.target.value as 'manager' | 'collaborator' | 'viewer')}
                              className="text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                            >
                              <option value="manager">{t('questionBankPage.QuestionBankMembersPage.roles.manager')}</option>
                              <option value="collaborator">{t('questionBankPage.QuestionBankMembersPage.roles.collaborator')}</option>
                              <option value="viewer">{t('questionBankPage.QuestionBankMembersPage.roles.viewer')}</option>
                            </select>
                          )}

                          {canRemoveMember(member.role) && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRemoveMember(member._id)}
                              className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
                            >
                              <UserMinus className="w-4 w-4" />
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* 添加成员模态框 */}
      {showAddMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">{t('questionBankPage.QuestionBankMembersPage.addMember.title')}</h3>
              
              <div className="space-y-6">
                {/* 搜索用户 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                    {t('questionBankPage.QuestionBankMembersPage.addMember.searchUser')}
                  </label>
                  <Input
                    type="text"
                    placeholder={t('questionBankPage.QuestionBankMembersPage.addMember.searchPlaceholder')}
                    onChange={(e) => searchUsers(e.target.value)}
                    icon={<Users className="w-4 h-4" />}
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {t('questionBankPage.QuestionBankMembersPage.addMember.searchDescription')}
                  </p>
                </div>

                {/* 搜索结果 */}
                {searchResults.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                      {t('questionBankPage.QuestionBankMembersPage.addMember.searchResults')}
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
                          <Avatar
                            src={user.avatar}
                            name={user.name}
                            size="sm"
                          />
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
                      {t('questionBankPage.QuestionBankMembersPage.addMember.selectedUsers', { count: selectedUsers.length })}
                    </label>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {selectedUsers.map((user) => (
                        <div
                          key={user._id}
                          className="flex items-center gap-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg"
                        >
                          <Avatar
                            src={user.avatar}
                            name={user.name}
                            size="xs"
                          />
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
                    {t('questionBankPage.QuestionBankMembersPage.addMember.assignRole')}
                  </label>
                  <FuzzySelect
                    options={[
                      { value: 'viewer', label: t('questionBankPage.QuestionBankMembersPage.roles.viewer'), html: `<span>${t('questionBankPage.QuestionBankMembersPage.roles.viewer')} - ${t('questionBankPage.QuestionBankMembersPage.roles.viewerDescription')}</span>` },
                      { value: 'collaborator', label: t('questionBankPage.QuestionBankMembersPage.roles.collaborator'), html: `<span>${t('questionBankPage.QuestionBankMembersPage.roles.collaborator')} - ${t('questionBankPage.QuestionBankMembersPage.roles.collaboratorDescription')}</span>` },
                      { value: 'manager', label: t('questionBankPage.QuestionBankMembersPage.roles.manager'), html: `<span>${t('questionBankPage.QuestionBankMembersPage.roles.manager')} - ${t('questionBankPage.QuestionBankMembersPage.roles.managerDescription')}</span>` }
                    ]}
                    value={selectedRole}
                    onChange={(value) => setSelectedRole(value as 'manager' | 'collaborator' | 'viewer')}
                    placeholder={t('questionBankPage.QuestionBankMembersPage.addMember.selectRole')}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowAddMember(false);
                      setSelectedUsers([]);
                      setSearchResults([]);
                    }}
                    className="flex-1"
                  >
                    {t('questionBankPage.QuestionBankMembersPage.buttons.cancel')}
                  </Button>
                  <Button
                    onClick={handleAddSelectedUsers}
                    loading={isBatchAdding}
                    disabled={isBatchAdding || selectedUsers.length === 0}
                    className="flex-1 bg-green-500 hover:bg-green-600"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    {t('questionBankPage.QuestionBankMembersPage.buttons.addMembers', { count: selectedUsers.length })}
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* 确认弹窗 */}
      <ConfirmModal
        {...confirmModal}
        onCancel={closeConfirm}
      />

      {/* 右侧弹窗 */}
      <RightSlideModal
        {...rightSlideModal}
        onClose={closeRightSlide}
      />
    </div>
  );
};

export default QuestionBankMembersPage; 