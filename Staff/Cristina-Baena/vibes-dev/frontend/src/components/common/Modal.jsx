import React from 'react';
import Button from './Button';

const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  message, 
  type = 'info', // 'info', 'success', 'error', 'warning'
  confirmText = 'OK',
  cancelText = 'Cancel',
  onConfirm,
  showCancel = false
}) => {
  if (!isOpen) return null;

  const typeStyles = {
    info: {
      icon: '💬',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600'
    },
    success: {
      icon: '✅',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600'
    },
    error: {
      icon: '❌',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600'
    },
    warning: {
      icon: '⚠️',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      iconBg: 'bg-yellow-100',
      iconColor: 'text-yellow-600'
    }
  };

  const currentStyle = typeStyles[type] || typeStyles.info;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleConfirm = () => {
    if (onConfirm) {
        onConfirm();
        onClose(); // Ensure modal closes after confirmation
    } else {
        onClose();
    }
};

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 transform transition-all">
        {/* Header */}
        <div className={`${currentStyle.bgColor} ${currentStyle.borderColor} border-b px-6 py-4 rounded-t-xl`}>
          <div className="flex items-center space-x-3">
            <div className={`${currentStyle.iconBg} ${currentStyle.iconColor} w-10 h-10 rounded-full flex items-center justify-center text-lg`}>
              {currentStyle.icon}
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              {title || 'Notification'}
            </h3>
          </div>
        </div>
        
        {/* Body */}
        <div className="px-6 py-4">
          <p className="text-gray-700 leading-relaxed">{message}</p>
        </div>
        
        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 rounded-b-xl flex justify-end space-x-3">
          {showCancel && (
            <Button
              variant="secondary"
              onClick={onClose}
              size="sm"
            >
              {cancelText}
            </Button>
          )}
          <Button
            variant={type === 'error' ? 'danger' : 'primary'}
            onClick={handleConfirm}
            size="sm">
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Modal;