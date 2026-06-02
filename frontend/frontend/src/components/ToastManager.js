import React, { useEffect, useState } from 'react';
import './Toast.css';

let idCounter = 1;

function ToastManager() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const handler = (e) => {
      const { message, duration } = e.detail || {};
      const id = idCounter++;
      setToasts((t) => [...t, { id, message, duration }]);
    };

    window.addEventListener('app-toast', handler);
    return () => window.removeEventListener('app-toast', handler);
  }, []);

  useEffect(() => {
    if (toasts.length === 0) return;
    const last = toasts[toasts.length - 1];
    const t = setTimeout(() => {
      setToasts((list) => list.filter((i) => i.id !== last.id));
    }, last.duration || 3500);
    return () => clearTimeout(t);
  }, [toasts]);

  if (toasts.length === 0) return null;

  return (
    <div className="toast-root">
      {toasts.map((t) => (
        <div key={t.id} className="toast-card">{t.message}</div>
      ))}
    </div>
  );
}

export default ToastManager;
