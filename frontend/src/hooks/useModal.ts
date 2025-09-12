import { useState, useCallback } from 'react';
import { useTranslation } from './useTranslation';

export interface ModalState {
  isOpen: boolean;
  title: string;
  message: string;
  type?: 'confirm' | 'warning' | 'danger' | 'info' | 'success';
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  width?: 'sm' | 'md' | 'lg' | 'xl';
  preventClose?: boolean;
  showCancel?: boolean;
  showConfirm?: boolean;
  confirmDanger?: boolean;
  confirmLoading?: boolean;
  loadingText?: string;
}

export interface RightSlideModalState {
  isOpen: boolean;
  title: string;
  message: string;
  type?: 'success' | 'warning' | 'error' | 'info' | 'confirm';
  width?: 'sm' | 'md' | 'lg' | 'xl';
  autoClose?: number;
  showProgress?: boolean;
  onConfirm?: () => void;
}

export const useModal = () => {
  const { t } = useTranslation();
  
  const [confirmModal, setConfirmModal] = useState<ModalState>({
    isOpen: false,
    title: '',
    message: '',
    type: 'confirm',
    confirmText: t('hooks.modal.defaultTexts.confirm'),
    cancelText: t('hooks.modal.defaultTexts.cancel')
  });

  const [rightSlideModal, setRightSlideModal] = useState<RightSlideModalState>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info'
  });

  // 显示确认弹窗
  const showConfirm = useCallback((
    title: string,
    message: string,
    onConfirm: () => void,
    options?: Partial<Omit<ModalState, 'isOpen' | 'title' | 'message' | 'onConfirm'>>
  ) => {
    setConfirmModal({
      isOpen: true,
      title,
      message,
      onConfirm,
      type: 'confirm',
      confirmText: t('hooks.modal.defaultTexts.confirm'),
      cancelText: t('hooks.modal.defaultTexts.cancel'),
      ...options
    });
  }, [t]);

  // 显示警告弹窗
  const showWarning = useCallback((
    title: string,
    message: string,
    onConfirm: () => void,
    options?: Partial<Omit<ModalState, 'isOpen' | 'title' | 'message' | 'onConfirm' | 'type'>>
  ) => {
    setConfirmModal({
      isOpen: true,
      title,
      message,
      onConfirm,
      type: 'warning',
      confirmText: t('hooks.modal.defaultTexts.confirm'),
      cancelText: t('hooks.modal.defaultTexts.cancel'),
      ...options
    });
  }, [t]);

  // 显示危险操作弹窗
  const showDanger = useCallback((
    title: string,
    message: string,
    onConfirm: () => void,
    options?: Partial<Omit<ModalState, 'isOpen' | 'title' | 'message' | 'onConfirm' | 'type'>>
  ) => {
    setConfirmModal({
      isOpen: true,
      title,
      message,
      onConfirm,
      type: 'danger',
      confirmText: t('hooks.modal.defaultTexts.confirm'),
      cancelText: t('hooks.modal.defaultTexts.cancel'),
      confirmDanger: true,
      ...options
    });
  }, [t]);

  // 关闭确认弹窗
  const closeConfirm = useCallback(() => {
    setConfirmModal(prev => ({ ...prev, isOpen: false }));
  }, []);

  // 显示信息弹窗
  const showInfo = useCallback((
    title: string,
    message: string,
    options?: Partial<Omit<ModalState, 'isOpen' | 'title' | 'message' | 'type'>>
  ) => {
    setConfirmModal({
      isOpen: true,
      title,
      message,
      type: 'info',
      confirmText: t('hooks.modal.defaultTexts.ok'),
      showCancel: false,
      onConfirm: () => closeConfirm(),
      ...options
    });
  }, [t, closeConfirm]);

  // 显示成功弹窗
  const showSuccess = useCallback((
    title: string,
    message: string,
    options?: Partial<Omit<ModalState, 'isOpen' | 'title' | 'message' | 'type'>>
  ) => {
    setConfirmModal({
      isOpen: true,
      title,
      message,
      type: 'success',
      confirmText: t('hooks.modal.defaultTexts.ok'),
      showCancel: false,
      onConfirm: () => closeConfirm(),
      ...options
    });
  }, [t, closeConfirm]);

  // 设置确认按钮loading状态
  const setConfirmLoading = useCallback((loading: boolean, loadingText?: string) => {
    setConfirmModal(prev => ({ 
      ...prev, 
      confirmLoading: loading,
      loadingText: loadingText || t('hooks.modal.defaultTexts.processing'),
      preventClose: loading // 加载时防止关闭
    }));
  }, [t]);

  // 显示右侧弹窗
  const showRightSlide = useCallback((
    title: string,
    message: string,
    options?: Partial<Omit<RightSlideModalState, 'isOpen' | 'title' | 'message'>>
  ) => {
    setRightSlideModal({
      isOpen: true,
      title,
      message,
      type: 'info',
      ...options
    });
  }, []);

  // 显示成功右侧弹窗
  const showSuccessRightSlide = useCallback((
    title: string,
    message: string,
    options?: Partial<Omit<RightSlideModalState, 'isOpen' | 'title' | 'message' | 'type'>>
  ) => {
    setRightSlideModal({
      isOpen: true,
      title,
      message,
      type: 'success',
      autoClose: 1000,
      showProgress: true,
      ...options
    });
  }, []);

  // 显示错误右侧弹窗
  const showErrorRightSlide = useCallback((
    title: string,
    message: string,
    options?: Partial<Omit<RightSlideModalState, 'isOpen' | 'title' | 'message' | 'type'>>
  ) => {
    setRightSlideModal({
      isOpen: true,
      title,
      message,
      type: 'error',
      autoClose: 2000,
      showProgress: true,
      ...options
    });
  }, []);

  // 关闭右侧弹窗
  const closeRightSlide = useCallback(() => {
    setRightSlideModal(prev => ({ ...prev, isOpen: false }));
  }, []);

  return {
    // 确认弹窗
    confirmModal,
    showConfirm,
    showWarning,
    showDanger,
    showInfo,
    showSuccess,
    closeConfirm,
    setConfirmLoading,
    
    // 右侧弹窗
    rightSlideModal,
    showRightSlide,
    showSuccessRightSlide,
    showErrorRightSlide,
    closeRightSlide
  };
};
