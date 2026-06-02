import React from 'react';
import './PlaylistModal.css';
import { IoTrash, IoAlertCircle } from 'react-icons/io5';

function ConfirmModal({ visible, title, message, onCancel, onConfirm, confirmLabel = 'Удалить', cancelLabel = 'Отмена', danger = false }) {
  if (!visible) return null;

  return (
    <div className="pm-overlay" onMouseDown={onCancel}>
      <div className="pm-modal" role="dialog" aria-modal="true" onMouseDown={(e) => e.stopPropagation()}>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <div style={{color: danger ? '#ef4444' : '#22c55e', fontSize:22}}>{danger ? <IoAlertCircle /> : <IoTrash />}</div>
          <div>
            <h3 className="pm-title">{title}</h3>
            <p className="pm-sub">{message}</p>
          </div>
        </div>

        <div className="pm-actions">
          <button className="pm-cancel" onClick={onCancel}>{cancelLabel}</button>
          <button className="pm-create" onClick={onConfirm} style={{ background: danger ? '#ef4444' : undefined }}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;
