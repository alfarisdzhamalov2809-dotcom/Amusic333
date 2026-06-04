import React from 'react';
import { toast } from 'react-toastify';
import './AddToPlaylistModal.css';
import { apiUrl } from '../api';

function AddToPlaylistModal({ playlists, trackId, onClose, onTrackAdded }) {
  const handleAddToPlaylist = async (playlistId) => {
    const token = localStorage.getItem('token');
    const playlistName = playlists.find(p => p._id === playlistId)?.name || 'плейлист';
    try {
      const response = await fetch(apiUrl(`/api/playlists/${playlistId}/tracks`), {
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
      toast.success(`✅ Трек добавлен в "${playlistName}"`);
      onTrackAdded(updatedPlaylist); 
      onClose(); 
    } catch (error) {
      toast.error(error.message || 'Ошибка при добавлении трека');
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