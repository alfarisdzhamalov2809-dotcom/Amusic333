import React from 'react';
import './AddToPlaylistModal.css';
import { showToast } from '../utils/toastService';

function AddToPlaylistModal({ playlists, trackId, onClose, onTrackAdded }) {
  const handleAddToPlaylist = async (playlistId) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:5000/api/playlists/${playlistId}/tracks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ trackId })
      });
      const updatedPlaylist = await response.json();
      if (!response.ok) {
        throw new Error(updatedPlaylist.message || 'Could not add track to playlist');
      }
      onTrackAdded(updatedPlaylist); 
      onClose(); 
    } catch (error) {
      showToast(error.message || 'Ошибка');
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h3>Добавить в плейлист</h3>
        <ul className="modal-playlist-list">
          {playlists.map(playlist => (
            <li key={playlist._id} onClick={() => handleAddToPlaylist(playlist._id)}>
              {playlist.name}
            </li>
          ))}
        </ul>
        <button className="modal-close-btn" onClick={onClose}>Закрыть</button>
      </div>
    </div>
  );
}

export default AddToPlaylistModal;