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
  ArrowLeft
} from 'lucide-react';
import { questionBankAPI } from '../../services/api';
import { useAuthStore } from '../../stores/authStore';
import type { QuestionBank } from '../../types';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';
import LoadingPage from '../../components/ui/LoadingPage';
import ConfirmModal from '../../components/ui/ConfirmModal';
import RightSlideModal from '../../components/ui/RightSlideModal';
import { useModal } from '../../hooks/useModal';

interface MemberInfo {
  _id: string;
  name: string;
  email: string;
  role: 'creator' | 'manager' | 'collaborator' | 'viewer';
  joinedAt: string;
}

const QuestionBankMembersPage: React.FC = () => {
  const { bid } = useParams<{ bid: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  // 弹窗状态管理
  const { 
    showConfirm, 
    confirmModal, 
    closeConfirm,
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
  const [filterRole, setFilterRole] = useState<string>('all');

  // 添加成员表单状态
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState<'manager' | 'collaborator'>('collaborator');
  const [isAddingMember, setIsAddingMember] = useState(false);

  useEffect(() => {
    if (bid) {
      fetchQuestionBank();
      fetchMembers();
    }
  }, [bid]);

  const fetchQuestionBank = async () => {
    try {
      const response = await questionBankAPI.getQuestionBank(bid!);
      if (response.data.success) {
        setQuestionBank(response.data.questionBank!);
        determineUserRole(response.data.questionBank!);
      } else {
        setError(response.data.error || '获取题库信息失败');
      }
    } catch (error: any) {
      setError(error.response?.data?.error || '获取题库信息失败');
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
          
          setMembers(membersArray);
        } else {
          setMembers([]);
        }
      } else {
        setMembers([]);
      }
    } catch (error: any) {
      console.error('获取成员列表失败:', error);
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
    } else {
      setUserRole('viewer');
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberEmail.trim()) return;

    try {
      setIsAddingMember(true);
      const response = await questionBankAPI.addMember(bid!, {
        email: newMemberEmail.trim(),
        role: newMemberRole
      });

      if (response.data.success) {
        setNewMemberEmail('');
        setNewMemberRole('collaborator');
        setShowAddMember(false);
        fetchMembers(); // 重新获取成员列表
      } else {
        showErrorRightSlide('添加失败', response.data.error || '添加成员失败');
      }
    } catch (error: any) {
      showErrorRightSlide('添加失败', error.response?.data?.error || '添加成员失败');
    } finally {
      setIsAddingMember(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    showConfirm(
      '确认移除',
      '确定要移除这个成员吗？',
      async () => {
        try {
          const response = await questionBankAPI.removeMember(bid!, memberId);
          if (response.data.success) {
            fetchMembers(); // 重新获取成员列表
          } else {
            showErrorRightSlide('移除失败', response.data.error || '移除成员失败');
          }
        } catch (error: any) {
          showErrorRightSlide('移除失败', error.response?.data?.error || '移除成员失败');
        }
      }
    );
  };

  const handleChangeRole = async (memberId: string, newRole: 'manager' | 'collaborator') => {
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
      showErrorRightSlide('修改失败', error.response?.data?.error || '修改角色失败');
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
      default:
        return <UserIcon className="w-4 h-4 text-gray-500" />;
    }
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case 'creator':
        return '创建者';
      case 'manager':
        return '管理者';
      case 'collaborator':
        return '协作者';
      case 'viewer':
        return '查看者';
      default:
        return '未知';
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
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const canManageMembers = userRole === 'creator' || userRole === 'manager';
  const canRemoveMember = (memberRole: string) => {
    if (userRole === 'creator') return true;
    if (userRole === 'manager') return memberRole !== 'creator' && memberRole !== 'manager';
    return false;
  };

  const canChangeRole = (memberRole: string) => {
    if (userRole === 'creator') return memberRole !== 'creator';
    if (userRole === 'manager') return memberRole === 'collaborator';
    return false;
  };

  // 过滤成员
  const filteredMembers = members.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || member.role === filterRole;
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
          <Button onClick={() => navigate(-1)}>返回</Button>
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
                返回
              </Button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">成员管理</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">{questionBank?.name}</p>
              </div>
            </div>
            
            {canManageMembers && (
              <Button
                onClick={() => setShowAddMember(true)}
                className="flex items-center gap-2"
              >
                <UserPlus className="w-4 w-4" />
                添加成员
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
                  <div className="text-sm text-gray-500 dark:text-gray-400">创建者</div>
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
                  <div className="text-sm text-gray-500 dark:text-gray-400">管理者</div>
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
                  <div className="text-sm text-gray-500 dark:text-gray-400">协作者</div>
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
                    {members.filter(m => m.role === 'viewer').length}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">查看者</div>
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
                    placeholder="搜索成员姓名或邮箱..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="sm:w-48">
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="all">所有角色</option>
                  <option value="creator">创建者</option>
                  <option value="manager">管理者</option>
                  <option value="collaborator">协作者</option>
                  <option value="viewer">查看者</option>
                </select>
              </div>
            </div>
          </div>
        </Card>

        {/* 成员列表 */}
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">成员列表</h3>
            
            {filteredMembers.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">暂无成员</p>
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
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium">
                          {member.name && member.name.length > 0 ? member.name.charAt(0).toUpperCase() : '?'}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-gray-100">{member.name || '未知用户'}</div>
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
                              onChange={(e) => handleChangeRole(member._id, e.target.value as 'manager' | 'collaborator')}
                              className="text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                            >
                              <option value="manager">管理者</option>
                              <option value="collaborator">协作者</option>
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4"
          >
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">添加成员</h3>
              
              <form onSubmit={handleAddMember} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                    邮箱地址
                  </label>
                  <Input
                    type="email"
                    value={newMemberEmail}
                    onChange={(e) => setNewMemberEmail(e.target.value)}
                    placeholder="输入成员邮箱地址"
                    required
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    只能添加 @{questionBank?.emailSuffix} 邮箱的用户
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                    角色
                  </label>
                  <select
                    value={newMemberRole}
                    onChange={(e) => setNewMemberRole(e.target.value as 'manager' | 'collaborator')}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  >
                    <option value="collaborator">协作者</option>
                    <option value="manager">管理者</option>
                  </select>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAddMember(false)}
                    className="flex-1"
                  >
                    取消
                  </Button>
                  <Button
                    type="submit"
                    disabled={isAddingMember || !newMemberEmail.trim()}
                    className="flex-1"
                  >
                    {isAddingMember ? '添加中...' : '添加成员'}
                  </Button>
                </div>
              </form>
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