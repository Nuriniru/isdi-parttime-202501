import { useState } from 'react';

export const useModal = () => {
  const [modal, setModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
    onConfirm: null,
    showCancel: false,
    confirmText: 'OK',
    cancelText: 'Cancel'
  });

  const showModal = ({
    title,
    message,
    type = 'info',
    onConfirm = null,
    showCancel = false,
    confirmText = 'OK',
    cancelText = 'Cancel'
  }) => {
    setModal({
      isOpen: true,
      title,
      message,
      type,
      onConfirm,
      showCancel,
      confirmText,
      cancelText
    });
  };

  const hideModal = () => {
    setModal(prev => ({ ...prev, isOpen: false }));
  };

  // Convenience methods
  const showSuccess = (message, title = 'Success') => {
    showModal({ title, message, type: 'success' });
  };

  const showError = (message, title = 'Error') => {
    showModal({ title, message, type: 'error' });
  };

  const showWarning = (message, title = 'Warning') => {
    showModal({ title, message, type: 'warning' });
  };

  const showInfo = (message, title = 'Information') => {
    showModal({ title, message, type: 'info' });
  };

  const showConfirm = (message, onConfirm, title = 'Confirm') => {
    showModal({
      title,
      message,
      type: 'warning',
      onConfirm,
      showCancel: true,
      confirmText: 'Confirm',
      cancelText: 'Cancel'
    });
  };

  return {
    modal,
    showModal,
    hideModal,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showConfirm
  };
};