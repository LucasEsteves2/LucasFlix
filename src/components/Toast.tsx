import React, { useState, useEffect } from 'react';
import './Toast.css';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  duration?: number;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type = 'info', duration = 3000, onClose }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!visible) return null;

  return (
    <div className={`toast toast-${type} ${visible ? 'toast-visible' : ''}`}>
      {message}
    </div>
  );
};

// Toast container component
export const ToastContainer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <div className="toast-container">{children}</div>;
};
