"use client";

import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faExclamationCircle, faInfoCircle, faExclamationTriangle, faXmark } from '@fortawesome/free-solid-svg-icons';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger animation after mount
    requestAnimationFrame(() => {
      setIsVisible(true);
    });
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300); // Wait for transition
  };

  const icons = {
    success: faCheckCircle,
    error: faExclamationCircle,
    warning: faExclamationTriangle,
    info: faInfoCircle
  };

  const colors = {
    success: 'bg-white text-gray-800 border-success shadow-success/10',
    error: 'bg-white text-gray-800 border-danger shadow-danger/10',
    warning: 'bg-white text-gray-800 border-warning shadow-warning/10',
    info: 'bg-white text-gray-800 border-blue-500 shadow-blue-500/10'
  };
  
  const iconColors = {
    success: 'text-success',
    error: 'text-danger',
    warning: 'text-warning',
    info: 'text-blue-500'
  };

  return (
    <div 
      className={`flex items-center gap-3 p-4 rounded-lg shadow-xl border-l-4 min-w-[300px] transition-all duration-300 transform
        ${isVisible ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-8 opacity-0 scale-95'} 
        ${colors[type]}`}
    >
      <FontAwesomeIcon icon={icons[type]} className={`text-xl ${iconColors[type]}`} />
      <p className="flex-1 text-sm font-medium">{message}</p>
      <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 transition-colors">
        <FontAwesomeIcon icon={faXmark} />
      </button>
    </div>
  );
};

export default Toast;
