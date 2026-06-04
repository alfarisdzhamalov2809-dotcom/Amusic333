import React, { useState } from 'react';
import { toast } from 'react-toastify';
import './AddToPlaylistModal.css';
import { apiUrl } from '../api';

function AddToPlaylistModal({ playlists, trackId, onClose, onTrackAdded }) {
  const [addingPlaylistId, setAddingPlaylistId] = useState(null);

  const handleAddToPlaylist = async (playlistId) => {
    if (addingPlaylistId) return;
    setAddingPlaylistId(playlistId);
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
      toast.success('Трек добавлен в плейлист!');
      onTrackAdded(updatedPlaylist);
      onClose();
    } catch (error) {
      toast.error('Не удалось добавить трек');
    } finally {
      setAddingPlaylistId(null);
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
              className={addingPlaylistId === playlist._id ? 'adding' : ''}
              onClick={() => handleAddToPlaylist(playlist._id)}
            >
              {addingPlaylistId === playlist._id ? 'Добавление...' : playlist.name}
            </li>
          ))}
        </ul>
        <button className="modal-close-btn" onClick={onClose}>Закрыть</button>
      </div>
    </div>
  );
}

export default AddToPlaylistModal;