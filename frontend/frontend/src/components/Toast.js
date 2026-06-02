import React, { useEffect } from 'react';
import './Toast.css';

function Toast({ message, visible = false, duration = 3000, onClose }) {
  useEffect(() => {
    if (!visible) return;
    const t = setTimeout(() => onClose && onClose(), duration);
    return () => clearTimeout(t);
  }, [visible, duration, onClose]);

  if (!visible) return null;

  return (
    <div className="toast-root">
      <div className="toast-card">{message}</div>
    </div>
  );
}

export default Toast;
