"use client";

import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle, faTrash } from '@fortawesome/free-solid-svg-icons';
import Modal from './Modal';

interface ConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  itemName?: string;
  confirmLabel?: string;
  variant?: 'danger' | 'warning';
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  open,
  onClose,
  onConfirm,
  title,
  message,
  itemName,
  confirmLabel = 'Ya, Hapus',
  variant = 'danger'
}) => {
  const isDanger = variant === 'danger';
  
  const footer = (
    <>
      <button 
        onClick={onClose}
        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200 transition-colors"
      >
        Batal
      </button>
      <button 
        onClick={() => {
          onConfirm();
          onClose();
        }}
        className={`px-4 py-2 text-sm font-medium text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 flex items-center gap-2 transition-colors ${
          isDanger 
            ? 'bg-danger hover:bg-red-600 focus:ring-red-500' 
            : 'bg-warning hover:bg-amber-600 focus:ring-amber-500'
        }`}
      >
        <FontAwesomeIcon icon={isDanger ? faTrash : faExclamationTriangle} />
        {confirmLabel}
      </button>
    </>
  );

  return (
    <Modal open={open} onClose={onClose} title={title} footer={footer} maxWidth="md">
      <div className="flex flex-col items-center text-center py-4">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
          isDanger ? 'bg-red-100 text-danger' : 'bg-amber-100 text-warning'
        }`}>
          <FontAwesomeIcon icon={faExclamationTriangle} className="text-3xl" />
        </div>
        <p className="text-gray-600 mb-2">{message}</p>
        {itemName && (
          <p className="text-lg font-semibold text-gray-900">"{itemName}"</p>
        )}
      </div>
    </Modal>
  );
};

export default ConfirmModal;
