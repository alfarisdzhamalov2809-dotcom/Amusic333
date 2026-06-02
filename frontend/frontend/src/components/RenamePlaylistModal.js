import React, { useEffect, useState } from 'react';
import './PlaylistModal.css';

function RenamePlaylistModal({ visible, initialName = '', onClose, onSave }) {
  const [name, setName] = useState(initialName);

  useEffect(() => {
    setName(initialName || '');
  }, [initialName, visible]);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Enter') handleSave();
    };
    if (visible) window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, name]);

  const handleSave = () => {
    if (!name.trim()) return;
    onSave && onSave(name.trim());
  };

  if (!visible) return null;

  return (
    <div className="pm-overlay" onMouseDown={onClose}>
      <div className="pm-modal" role="dialog" aria-modal="true" onMouseDown={(e) => e.stopPropagation()}>
        <h3 className="pm-title">Изменить название плейлиста</h3>
        <p className="pm-sub">Текущее название подставлено в поле</p>

        <div className="pm-input-wrap">
          <input className="pm-input" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
        </div>

        <div className="pm-actions">
          <button className="pm-cancel" onClick={onClose}>Отмена</button>
          <button className="pm-create" onClick={handleSave}>Сохранить</button>
        </div>
      </div>
    </div>
  );
}

export default RenamePlaylistModal;
