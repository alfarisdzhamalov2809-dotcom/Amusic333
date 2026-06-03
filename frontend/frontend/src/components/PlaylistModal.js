import React, { useEffect, useState } from 'react';
import './PlaylistModal.css';
import { IoMusicalNotes } from 'react-icons/io5';
import { showToast } from '../utils/toastService';

function PlaylistModal({ visible, onClose, onCreated }) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) setName('');
  }, [visible]);

  useEffect(() => {
    if (!visible) return;
    const handler = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Enter') handleCreate();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, name, loading]);

  const handleCreate = async () => {
    if (!name.trim() || loading) return;
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      const response = await fetch('/api/playlists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ name }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Не удалось создать плейлист');
      onCreated && onCreated(data);
      onClose();
    } catch (err) {
      showToast(err.message || 'Ошибка');
    } finally {
      setLoading(false);
    }
  };

  if (!visible) return null;

  return (
    <div className="pm-overlay" onMouseDown={onClose}>
      <div className="pm-modal" role="dialog" aria-modal="true" onMouseDown={(e) => e.stopPropagation()}>
        <h3 className="pm-title">Создать новый плейлист</h3>
        <p className="pm-sub">Введите название плейлиста</p>

        <div className="pm-input-wrap">
          <span className="pm-icon"><IoMusicalNotes /></span>
          <input
            className="pm-input"
            placeholder="Например: Любимые треки"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
            onKeyDown={(e) => { if (e.key === 'Enter') handleCreate(); }}
          />
        </div>

        <div className="pm-actions">
          <button className="pm-cancel" onClick={onClose} type="button">Отмена</button>
          <button className="pm-create" onClick={handleCreate} type="button" disabled={loading}>{loading ? 'Создаём...' : 'Создать'}</button>
        </div>
      </div>
    </div>
  );
}

export default PlaylistModal;
