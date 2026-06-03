import React, { useState } from 'react';
import './MainContent.css';
import AddToPlaylistModal from './AddToPlaylistModal';
import { IoTrash } from 'react-icons/io5';

const formatDuration = (seconds) => {
    if (isNaN(seconds)) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
};

function MainContent({ tracks, playlists = [], onTrackSelect, currentTrackIndex, onTrackAdded, playlistTitle, onTrackRemoved }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTrackId, setSelectedTrackId] = useState(null);

  // Иногда просто смотрим, что пришло в tracks
  React.useEffect(() => {
    if (tracks.length > 0) {
      console.log('Tracks data:', tracks[0]);
    }
  }, [tracks]);

  const handleOpenModal = (trackId) => {
    setSelectedTrackId(trackId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTrackId(null);
  };

  const playlistCover = playlists.find(p => p.name === playlistTitle)?.tracks[0]?.cover || '/images/default-cover.jpg';
  const totalDurationSeconds = tracks.reduce((acc, track) => acc + (track.duration || 0), 0);
  return (
    <main className="main-content">
      <div className="playlist-header">
        <img src={playlistCover} alt="Playlist Cover" className="playlist-cover-large" />
        <div className="playlist-details">
          <span className="playlist-type">Плейлист</span>
          <h1>{playlistTitle || 'Все треки'}</h1>
          <p className="playlist-meta">
            {tracks.length} трека(ов), {formatDuration(totalDurationSeconds)}
          </p>
        </div>
      </div>

      <div className="track-list-container">
        <table className="track-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Название</th>
              <th>Прослушивания</th>
              <th>Время</th>
            </tr>
          </thead>
          <tbody>
            {tracks.map((track, index) => (
              <tr 
                key={track._id} 
                className={`track-row ${index === currentTrackIndex ? 'active' : ''}`}
                onClick={() => onTrackSelect(index)}
              >
                <td>{index + 1}</td>
                <td>
                  <div className="track-info-cell">
                    <img src={track.cover && track.cover.startsWith('http') ? track.cover : `https://amusic333-production.up.railway.app${track.cover}`} alt="Track Cover" className="track-cover-small" />
                    <div className="track-name-artist">
                      <span className="track-name">{track.title}</span>
                      <span className="track-artist">{track.artist}</span>
                    </div>
                  </div>
                </td>
                <td>{track.plays ? track.plays.toLocaleString() : 'N/A'}</td>
                <td>
                    <div className="duration-cell">
                        <span>{formatDuration(track.duration)}</span>
                        {playlistTitle ? (
                          <button onClick={(e) => { e.stopPropagation(); onTrackRemoved(track._id); }} className="remove-track-btn">
                            <IoTrash />
                          </button>
                        ) : (
                          <button onClick={(e) => { e.stopPropagation(); handleOpenModal(track._id); }} className="add-to-playlist-btn">
                            +
                          </button>
                        )}
                    </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <AddToPlaylistModal
          playlists={playlists}
          trackId={selectedTrackId}
          onClose={handleCloseModal}
          onTrackAdded={onTrackAdded}
        />
      )}
    </main>
  );
}

export default MainContent;