import { useState, useCallback } from 'react';

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
  const [confirmModal, setConfirmModal] = useState<ModalState>({
    isOpen: false,
    title: '',
    message: '',
    type: 'confirm',
    confirmText: '确认',
    cancelText: '取消'
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
      confirmText: '确认',
      cancelText: '取消',
      ...options
    });
  }, []);

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
      confirmText: '确认',
      cancelText: '取消',
      ...options
    });
  }, []);

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
      confirmText: '确认',
      cancelText: '取消',
      confirmDanger: true,
      ...options
    });
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
      confirmText: '确定',
      showCancel: false,
      onConfirm: () => closeConfirm(),
      ...options
    });
  }, []);

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
      confirmText: '确定',
      showCancel: false,
      onConfirm: () => closeConfirm(),
      ...options
    });
  }, []);

  // 关闭确认弹窗
  const closeConfirm = useCallback(() => {
    setConfirmModal(prev => ({ ...prev, isOpen: false }));
  }, []);

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
    
    // 右侧弹窗
    rightSlideModal,
    showRightSlide,
    showSuccessRightSlide,
    showErrorRightSlide,
    closeRightSlide
  };
};
