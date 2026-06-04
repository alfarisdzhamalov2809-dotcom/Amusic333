import React, { useState } from 'react';
import { toast } from 'react-toastify';
import './AddToPlaylistModal.css';
import { apiUrl } from '../api';

function AddToPlaylistModal({ playlists, trackId, onClose, onTrackAdded }) {
  const [selectedPlaylistId, setSelectedPlaylistId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePlaylistSelect = (playlistId) => {
    if (isSubmitting) return;
    setSelectedPlaylistId(playlistId);
  };

  const handleConfirmAdd = async () => {
    if (!selectedPlaylistId || isSubmitting) return;
    setIsSubmitting(true);
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(apiUrl(`/api/playlists/${selectedPlaylistId}/tracks`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ trackId })
      });
      const updatedPlaylist = await response.json();
      if (!response.ok) {
        throw new Error(updatedPlaylist.message || 'Ошибка при добавлении');
      }
      toast.success('Трек добавлен!');
      onTrackAdded(updatedPlaylist);
      onClose();
    } catch (error) {
      toast.error('Ошибка при добавлении');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h3>Добавить в плейлист</h3>
        <ul className="modal-playlist-list">
          {playlists.map(playlist => (
            <li
              key={playlist._id}
              className={selectedPlaylistId === playlist._id ? 'selected' : ''}
              onClick={() => handlePlaylistSelect(playlist._id)}
            >
              <span className="playlist-name">{playlist.name}</span>
            </li>
          ))}
        </ul>
        {selectedPlaylistId && (
          <button
            className="modal-confirm-btn"
            onClick={handleConfirmAdd}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Добавление...' : 'ПОДТВЕРДИТЬ'}
          </button>
        )}
        <button className="modal-close-btn" onClick={onClose}>Закрыть</button>
      </div>
    </div>
  );
}

export default AddToPlaylistModal;