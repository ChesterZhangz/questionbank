import React, { useState } from 'react';
import { ExternalLink, Edit, Trash2, Check, X } from 'lucide-react';
import Button from '../../ui/Button';
import Input from '../../ui/Input';
import { paperAPI } from '../../../services/api';
import type { Paper } from './types';
import { useModal } from '../../../hooks/useModal';
import ConfirmModal from '../../ui/ConfirmModal';
import RightSlideModal from '../../ui/RightSlideModal';

interface OverleafLinkManagerProps {
  paper: Paper;
  onUpdateLink: (link: string) => void;
  onRemoveLink: () => void;
  canEdit?: boolean;
}

const OverleafLinkManager: React.FC<OverleafLinkManagerProps> = ({
  paper,
  onUpdateLink,
  onRemoveLink,
  canEdit = true
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editLink, setEditLink] = useState(paper.overleafEditLink || '');
  const [isLoading, setIsLoading] = useState(false);
  
  // 弹窗管理
  const {
    confirmModal,
    showDanger,
    closeConfirm,
    setConfirmLoading,
    rightSlideModal,
    showSuccessRightSlide,
    showErrorRightSlide,
    closeRightSlide
  } = useModal();

  const handleSave = async () => {
    if (!editLink.trim()) return;
    
    setIsLoading(true);
    try {
      const response = await paperAPI.updateOverleafLink(paper._id, editLink.trim());
      if (response.data.success) {
        onUpdateLink(editLink.trim());
        setIsEditing(false);
        showSuccessRightSlide(
          '操作成功',
          paper.overleafEditLink ? 'Overleaf链接更新成功' : 'Overleaf链接添加成功'
        );
      } else {
        showErrorRightSlide(
          '操作失败',
          response.data.message || '更新Overleaf链接失败'
        );
      }
    } catch (error: any) {
      showErrorRightSlide(
        '操作失败',
        error.response?.data?.error || error.message || '更新Overleaf链接失败'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setEditLink(paper.overleafEditLink || '');
    setIsEditing(false);
  };

  const handleRemoveClick = () => {
    showDanger(
      '确认删除',
      '确定要删除Overleaf编辑链接吗？删除后无法恢复。',
      handleRemove,
      {
        confirmText: '删除',
        cancelText: '取消',
        confirmDanger: true
      }
    );
  };

  const handleRemove = async () => {
    setConfirmLoading(true, '删除中...');
    try {
      const response = await paperAPI.updateOverleafLink(paper._id, '');
      if (response.data.success) {
        onRemoveLink();
        setIsEditing(false);
        closeConfirm();
        showSuccessRightSlide(
          '删除成功',
          'Overleaf链接已删除'
        );
      } else {
        closeConfirm();
        showErrorRightSlide(
          '删除失败',
          response.data.message || '删除Overleaf链接失败'
        );
      }
    } catch (error: any) {
      closeConfirm();
      showErrorRightSlide(
        '删除失败',
        error.response?.data?.error || error.message || '删除Overleaf链接失败'
      );
    } finally {
      setConfirmLoading(false);
    }
  };

  if (!paper.overleafEditLink && !isEditing) {
    if (!canEdit) return null;
    
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsEditing(true)}
        className="flex items-center space-x-2"
      >
        <ExternalLink className="w-4 h-4" />
        <span>添加Overleaf链接</span>
      </Button>
    );
  }

  if (isEditing) {
    return (
      <div className="flex items-center space-x-2">
        <Input
          value={editLink}
          onChange={(e) => setEditLink(e.target.value)}
          placeholder="输入Overleaf编辑链接"
          className="min-w-64"
        />
        <Button
          variant="outline"
          size="sm"
          onClick={handleSave}
          disabled={!editLink.trim() || isLoading}
          loading={isLoading}
          className="flex items-center space-x-1"
        >
          <Check className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleCancel}
          className="flex items-center space-x-1"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center space-x-2">
        <a
          href={paper.overleafEditLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center space-x-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
          <span>用Overleaf打开</span>
        </a>
        {canEdit && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="flex items-center space-x-1"
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRemoveClick}
              className="flex items-center space-x-1 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/30"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </>
        )}
      </div>
      
      {/* 确认删除弹窗 */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type}
        confirmText={confirmModal.confirmText}
        cancelText={confirmModal.cancelText}
        onConfirm={confirmModal.onConfirm}
        onCancel={closeConfirm}
        showCancel={confirmModal.showCancel}
        showConfirm={confirmModal.showConfirm}
        confirmDanger={confirmModal.confirmDanger}
        confirmLoading={confirmModal.confirmLoading}
        loadingText={confirmModal.loadingText}
        preventClose={confirmModal.preventClose}
      />
      
      {/* 右侧提示弹窗 */}
      <RightSlideModal
        isOpen={rightSlideModal.isOpen}
        onClose={closeRightSlide}
        title={rightSlideModal.title}
        message={rightSlideModal.message}
        type={rightSlideModal.type}
        width={rightSlideModal.width}
        autoClose={rightSlideModal.autoClose}
        showProgress={rightSlideModal.showProgress}
      />
    </>
  );
};

export default OverleafLinkManager;
