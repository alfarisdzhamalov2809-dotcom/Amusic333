import React, { useContext, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Sidebar.css';
import PlaylistModal from './PlaylistModal';
import RenamePlaylistModal from './RenamePlaylistModal';
import ConfirmModal from './ConfirmModal';
import { IoHome, IoSearch, IoMusicalNotes, IoLibrary, IoCloudUploadOutline, IoPencil, IoTrash } from 'react-icons/io5';

function Sidebar({ playlists = [], onPlaylistCreated, onPlaylistSelect, selectedPlaylistId, onPlaylistEdited, onPlaylistDeleted }) { 
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [modalVisible, setModalVisible] = useState(false);

  const handleCreatePlaylist = () => {
    setModalVisible(true);
  };

  const handleModalCreated = (newPlaylist) => {
    onPlaylistCreated && onPlaylistCreated(newPlaylist);
    const tracksCount = newPlaylist && newPlaylist.tracks ? newPlaylist.tracks.length : 0;
    window.dispatchEvent(new CustomEvent('app-toast', { detail: { message: `Плейлист "${newPlaylist.name}" создан • ${tracksCount} треков`, duration: 3500 } }));
  };

  const [renameVisible, setRenameVisible] = useState(false);
  const [renameTarget, setRenameTarget] = useState(null);

  const [confirmVisible, setConfirmVisible] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState(null);

  const handleHomeClick = (e) => {
    e.preventDefault();
    if (onPlaylistSelect) {
      onPlaylistSelect(null);
    }
    navigate('/');
  };

  const handlePlaylistClick = (playlistId) => {
    navigate(`/playlist/${playlistId}`);
  };

  const handleEditPlaylist = (e, playlistId) => {
    e.stopPropagation();
    setRenameTarget({ id: playlistId, name: playlists.find(p => p._id === playlistId)?.name || '' });
    setRenameVisible(true);
  };

  const handleDeletePlaylist = (e, playlistId) => {
    e.stopPropagation();
    setConfirmTarget({ id: playlistId });
    setConfirmVisible(true);
  };

  return (
    <aside className="sidebar">
      <Link to="/" className="sidebar-logo" onClick={handleHomeClick}>
        <IoMusicalNotes /> AMusic
      </Link>
      <nav className="sidebar-nav">
        <ul>
          <li><NavLink to="/" end onClick={handleHomeClick}><IoHome /><span>Главная</span></NavLink></li>
          <li><NavLink to="/search"><IoSearch /><span>Поиск</span></NavLink></li>
          <li><NavLink to="/songs"><IoMusicalNotes /><span>Песни</span></NavLink></li>
          <li><NavLink to="/upload"><IoCloudUploadOutline /><span>Загрузить</span></NavLink></li>
        </ul>
      </nav>

      <div className="sidebar-library">
        <div className="library-header">
          <IoLibrary /><span>Моя медиатека</span>
          <button onClick={handleCreatePlaylist} className="add-playlist-btn">+</button>
        </div>
        <ul className="playlist-list">
          {playlists.map(playlist => (
            <li 
              key={playlist._id} 
              className={`playlist-item ${playlist._id === selectedPlaylistId ? 'active-playlist' : ''}`}
              onClick={() => handlePlaylistClick(playlist._id)}
            >
              <span className="playlist-name">{playlist.name}</span>
              <div className="playlist-actions">
                <button onClick={(e) => handleEditPlaylist(e, playlist._id)} className="action-btn"><IoPencil /></button>
                <button onClick={(e) => handleDeletePlaylist(e, playlist._id)} className="action-btn"><IoTrash /></button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <PlaylistModal visible={modalVisible} onClose={() => setModalVisible(false)} onCreated={handleModalCreated} />
      <RenamePlaylistModal visible={renameVisible} initialName={renameTarget?.name} onClose={() => setRenameVisible(false)} onSave={(newName) => { setRenameVisible(false); onPlaylistEdited(renameTarget.id, newName); window.dispatchEvent(new CustomEvent('app-toast', { detail: { message: 'Название плейлиста изменено', duration: 3000 } })); }} />
      <ConfirmModal visible={confirmVisible} title="Удалить плейлист" message="Вы действительно хотите удалить плейлист? Это действие нельзя отменить." onCancel={() => { setConfirmVisible(false); setConfirmTarget(null);} } onConfirm={() => { setConfirmVisible(false); onPlaylistDeleted(confirmTarget.id); setConfirmTarget(null); window.dispatchEvent(new CustomEvent('app-toast', { detail: { message: 'Плейлист удален', duration: 3000 } })); }} danger={true} />

      <div className="user-section">
        {user ? (
          <button onClick={logout} className="logout-button">Выйти</button>
        ) : (
          <div className="auth-links">
            <Link to="/login" className="auth-link">Войти</Link>
            <Link to="/register" className="auth-link register">Регистрация</Link>
          </div>
        )}
      </div>
    </aside>
  );
}

export default Sidebar;