import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, Handshake, Eye, Crown } from 'lucide-react';
import SimpleSelect from './menu/SimpleSelect';
import ConfirmModal from './ConfirmModal';

interface RoleSelectorProps {
  currentRole: string;
  onRoleChange: (role: string) => void;
  disabled?: boolean;
  className?: string;
  showLabel?: boolean;
}

const RoleSelector: React.FC<RoleSelectorProps> = ({
  currentRole,
  onRoleChange,
  disabled = false,
  className = '',
  showLabel = true
}) => {
  const [isChanging, setIsChanging] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingRole, setPendingRole] = useState<string>('');

  // 角色选项配置
  const roleOptions = [
    {
      value: 'owner',
      label: '所有者',
      icon: Crown,
      description: '拥有所有权限，可以管理试卷集和成员'
    },
    {
      value: 'manager',
      label: '管理员',
      icon: Settings,
      description: '可以管理试卷集内容，但不能删除试卷集'
    },
    {
      value: 'collaborator',
      label: '协作者',
      icon: Handshake,
      description: '可以编辑试卷集内容，但不能管理成员'
    },
    {
      value: 'viewer',
      label: '查看者',
      icon: Eye,
      description: '只能查看试卷集内容，不能进行编辑'
    }
  ];


  const handleRoleChange = async (newRole: string | number) => {
    const roleString = String(newRole);
    if (roleString === currentRole) return;
    
    // 如果要设置为所有者，需要确认
    if (roleString === 'owner') {
      setPendingRole(roleString);
      setShowConfirmModal(true);
      return;
    }
    
    // 其他角色直接更新
    await updateRole(roleString);
  };

  const updateRole = async (role: string) => {
    setIsChanging(true);
    try {
      await onRoleChange(role);
    } catch (error) {
      console.error('角色更新失败:', error);
    } finally {
      setIsChanging(false);
    }
  };

  const handleConfirmRoleChange = async () => {
    setShowConfirmModal(false);
    await updateRole(pendingRole);
    setPendingRole('');
  };

  const handleCancelRoleChange = () => {
    setShowConfirmModal(false);
    setPendingRole('');
  };

  return (
    <div className={`role-selector ${className}`}>
      {showLabel && (
        <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-2">
          成员身份
        </label>
      )}
      
      <div className="relative">
        <div className="relative z-50">
          <SimpleSelect
            options={roleOptions}
            value={currentRole}
            onChange={handleRoleChange}
            placeholder="选择身份..."
            disabled={disabled || isChanging}
            variant="outline"
            size="sm"
            theme="blue"
            showIcon={true}
            customStyles={{
              button: 'min-w-[140px]',
              dropdown: 'min-w-[280px]',
              option: 'py-3 px-4'
            }}
          />
        </div>
        
        {/* 加载状态指示器 */}
        {isChanging && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute right-2 top-1/2 transform -translate-y-1/2"
          >
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </motion.div>
        )}
      </div>
      
      {/* 确认对话框 */}
      <ConfirmModal
        isOpen={showConfirmModal}
        onCancel={handleCancelRoleChange}
        onConfirm={handleConfirmRoleChange}
        title="确认设置所有者身份"
        message="确定要将此成员设置为试卷集所有者吗？设置后该成员将拥有所有管理权限，包括删除试卷集的权限。"
        confirmText="确认设置"
        cancelText="取消"
        type="warning"
      />
    </div>
  );
};

export default RoleSelector;
