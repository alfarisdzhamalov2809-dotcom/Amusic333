import React, { useState } from 'react';
import { toast } from 'react-toastify';
import './SongsPage.css';
import AddToPlaylistModal from './AddToPlaylistModal';
import { IoTrash } from 'react-icons/io5';
import ConfirmModal from './ConfirmModal';

function SongsPage({
  allTracks,
  onTrackSelect,
  currentTrackIndex,
  playlists,
  onTrackAdded,
  onTrackDeleted
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTrackId, setSelectedTrackId] = useState(null);

  // Делает из секунд нормальный тайм
  const formatDuration = (seconds) => {
    if (!seconds || seconds === 0) return '—';

    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;

    return `${mins}:${String(secs).padStart(2, '0')}`;
  };

  // Красивый формат просмотров
  const formatPlays = (plays) => {
    if (plays >= 1000000) {
      return (plays / 1000000).toFixed(1) + 'M';
    }

    if (plays >= 1000) {
      return (plays / 1000).toFixed(1) + 'K';
    }

    return plays || 0;
  };

  const handleOpenModal = (trackId) => {
    setSelectedTrackId(trackId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTrackId(null);
  };

  const handleTrackClick = (trackId) => {
    const trackIndex = allTracks.findIndex(
      (track) => track._id === trackId
    );

    if (trackIndex !== -1) {
      onTrackSelect(trackIndex);
    }
  };

  const handleDeleteClick = (e, trackId) => {
    e.stopPropagation();

    setConfirmTarget({ id: trackId });
    setConfirmVisible(true);
  };

  const [confirmVisible, setConfirmVisible] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState(null);

  const handleConfirmDelete = () => {
    if (!confirmTarget) return;
    onTrackDeleted(confirmTarget.id);
    toast.success('🗑️ Трек удален из плейлиста');
    setConfirmVisible(false);
    setConfirmTarget(null);
  };

  return (
    <main className="songs-page-main">
      <h2 className="songs-page-title">Все песни</h2>

      {allTracks.length === 0 ? (
        <div className="no-tracks-message">
          <p>📭 Нет загруженных треков</p>

          <p style={{ fontSize: '0.9em', color: '#888' }}>
            Загрузите первый трек, чтобы начать
          </p>
        </div>
      ) : (
        <div className="songs-list">
          {allTracks.map((track, index) => (
            <div
              key={track._id}
              className={`song-item ${
                index === currentTrackIndex ? 'active' : ''
              }`}
              title={`ID: ${track._id}`}
            >
              <div
                className="song-item-info"
                onClick={() => handleTrackClick(track._id)}
              >
                <img
                  src={track.cover && track.cover.startsWith('http') ? track.cover : `https://amusic333-production.up.railway.app${track.cover}`}
                  alt="Обложка трека"
                  className="song-item-cover"
                />

                <div className="song-item-details">
                  <span className="song-item-title">
                    {track.title}
                  </span>

                  <span className="song-item-artist">
                    {track.artist}
                  </span>

                  <div className="song-item-metadata">
                    <span className="metadata-item">
                      ⏱️ {formatDuration(track.duration)}
                    </span>

                    <span className="metadata-item">
                      👁️ {formatPlays(track.plays)}
                    </span>

                    <span className="metadata-item track-id">
                      ID: {track._id.substring(0, 8)}...
                    </span>
                  </div>
                </div>
              </div>

              <div className="song-item-actions">
                <button
                  onClick={() => handleOpenModal(track._id)}
                  className="action-btn-icon"
                  title="Добавить в плейлист"
                >
                  +
                </button>

                <button
                  onClick={(e) =>
                    handleDeleteClick(e, track._id)
                  }
                  className="action-btn-icon delete-btn"
                  title="Удалить трек"
                >
                  <IoTrash />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <AddToPlaylistModal
          playlists={playlists}
          trackId={selectedTrackId}
          onClose={handleCloseModal}
          onTrackAdded={onTrackAdded}
        />
      )}
      <ConfirmModal visible={confirmVisible} title="Удалить трек" message="Удалить этот трек из плейлиста?" onCancel={() => { setConfirmVisible(false); setConfirmTarget(null); }} onConfirm={handleConfirmDelete} danger={true} />
    </main>
  );
}

export default SongsPage;