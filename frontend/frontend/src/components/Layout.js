import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Routes, Route, useMatch, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import MainContent from './MainContent';
import PlayerBar from './PlayerBar';
import SearchPage from './SearchPage';
import SongsPage from './SongsPage';
import UploadPage from './UploadPage';
import '../App.css';
import ToastManager from './ToastManager';
import { showToast } from '../utils/toastService';

function Layout() {
  const [allTracks, setAllTracks] = useState(null);
  const [playlists, setPlaylists] = useState([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(null);
  const [currentTrackId, setCurrentTrackId] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);
  const [trackProgress, setTrackProgress] = useState(0);
  const [volume, setVolume] = useState(() => {
    const savedVolume = localStorage.getItem('volume');
    return savedVolume !== null ? Number(savedVolume) : 1;
  });
  const [repeatMode, setRepeatMode] = useState(0); // 0-3: none, all, one, shuffle
  const [shuffledIndices, setShuffledIndices] = useState([]);

  useEffect(() => {
    fetch('/api/tracks')
      .then(res => {
        if (!res.ok) throw new Error('Сетевой ответ был не в порядке');
        return res.json();
      })
      .then(data => setAllTracks(data))
      .catch(err => {
        console.error("Ошибка при получении треков:", err);
        setAllTracks([]);
        showToast('Не удалось загрузить треки');
      });
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetch('/api/playlists', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => res.ok ? res.json() : Promise.reject('Не удалось загрузить плейлисты'))
      .then(setPlaylists)
      .catch(error => { console.error(error); showToast('Не удалось загрузить плейлисты'); });
    }
  }, []);

  const handlePlaylistCreated = (newPlaylist) => setPlaylists(p => [...p, newPlaylist]);
  const handleTrackAddedToPlaylist = (updatedPlaylist) => {
    setPlaylists(p => p.map(pl => pl._id === updatedPlaylist._id ? updatedPlaylist : pl));
    if (selectedPlaylist?._id === updatedPlaylist._id) setSelectedPlaylist(updatedPlaylist);
  };
  const handlePlaylistSelect = (playlistId) => {
    if (playlistId) {
      // Берём полный плейлист с сервера, чтобы были все треки
      const token = localStorage.getItem('token');
      fetch(`/api/playlists/${playlistId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => res.ok ? res.json() : Promise.reject('Не удалось загрузить плейлист'))
      .then(playlist => {
        setSelectedPlaylist(playlist);
      })
      .catch(error => console.error(error));
    } else {
      setSelectedPlaylist(null);
    }
  };

  const handlePlaylistEdited = async (playlistId, newName) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`/api/playlists/${playlistId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ name: newName })
      });
      const updatedPlaylist = await response.json();
      if (!response.ok) throw new Error(updatedPlaylist.message);
      setPlaylists(playlists.map(p => p._id === playlistId ? updatedPlaylist : p));
      if (selectedPlaylist?._id === playlistId) setSelectedPlaylist(updatedPlaylist);
      showToast('Название плейлиста изменено');
    } catch (error) {
      showToast(error.message || 'Ошибка при изменении названия');
    }
  };

  const handlePlaylistDeleted = async (playlistId) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`/api/playlists/${playlistId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Не удалось удалить плейлист');
      setPlaylists(playlists.filter(p => p._id !== playlistId));
      if (selectedPlaylist?._id === playlistId) {
        setSelectedPlaylist(null);
      }
      showToast('Плейлист удален');
    } catch (error) {
      showToast(error.message || 'Ошибка при удалении плейлиста');
    }
  };
  const handleTrackUploaded = (newTrack) => {
    setAllTracks(currentTracks => [...currentTracks, newTrack]);
  };

  const handleTrackDeleted = async (trackId) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`/api/tracks/${trackId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Нквозможно удалить песню');
      setAllTracks(allTracks.filter(t => t._id !== trackId));
      showToast('Трек удален');
    } catch (error) {
      showToast(error.message || 'Ошибка при удалении трека');
    }
  };

   const handleTrackRemoved = async (trackId) => {
    if (!selectedPlaylist) return;
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`/api/playlists/${selectedPlaylist._id}/tracks/${trackId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Не удалось удалить трек из плейлиста');
      const updatedPlaylist = await response.json();
      
      setPlaylists(playlists.map(p => p._id === updatedPlaylist._id ? updatedPlaylist : p));
      setSelectedPlaylist(updatedPlaylist);
      showToast('Трек удален из плейлиста');
    } catch (error) {
      showToast(error.message || 'Не удалось удалить трек из плейлиста');
    }
  };

  const location = useLocation();
  const playlistMatch = useMatch('/playlist/:playlistId');

  useEffect(() => {
    if (playlistMatch?.params?.playlistId) {
      const token = localStorage.getItem('token');
      fetch(`/api/playlists/${playlistMatch.params.playlistId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => res.ok ? res.json() : Promise.reject('Не удалось загрузить плейлист'))
      .then(playlist => {
        setSelectedPlaylist(playlist);
      })
      .catch(error => console.error(error));
    }
  }, [playlistMatch?.params?.playlistId]);

  useEffect(() => {
    if (!location.pathname.startsWith('/playlist/')) {
      setSelectedPlaylist(null);
    }
  }, [location.pathname]);

  const tracksToDisplay = useMemo(
    () => (selectedPlaylist ? selectedPlaylist.tracks : allTracks) || [],
    [selectedPlaylist, allTracks]
  );
  const currentTrack = (allTracks || []).find(track => track._id === currentTrackId) || tracksToDisplay[currentTrackIndex];

  const selectTrack = (index) => {
    const track = tracksToDisplay[index];
    if (!track) return;
    setCurrentTrackId(track._id);
    setCurrentTrackIndex(index);
    setIsPlaying(true);
  };

  useEffect(() => {
    if (!currentTrackId) return;
    const index = tracksToDisplay.findIndex(track => track._id === currentTrackId);
    setCurrentTrackIndex(index !== -1 ? index : null);
  }, [tracksToDisplay, currentTrackId]);

  const handlePlayPause = () => {
    if (!currentTrackId && tracksToDisplay.length > 0) {
      selectTrack(0);
      return;
    }
    setIsPlaying(!isPlaying);
  };

  const handleNext = () => {
    if (tracksToDisplay.length > 0) {
      let nextIndex;
      if (repeatMode === 3) { // shuffle
        const availableIndices = shuffledIndices.filter((_, i) => i > currentTrackIndex || currentTrackIndex === null);
        if (availableIndices.length > 0) {
          nextIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
        } else {
          // закончились треки, пересчитываем
          const newShuffled = [...Array(tracksToDisplay.length).keys()].sort(() => Math.random() - 0.5);
          setShuffledIndices(newShuffled);
          nextIndex = newShuffled[0];
        }
      } else {
        nextIndex = currentTrackIndex !== null ? (currentTrackIndex + 1) % tracksToDisplay.length : 0;
      }
      selectTrack(nextIndex);
    }
  };

  const handlePrev = () => {
    if (tracksToDisplay.length > 0) {
      let prevIndex;
      if (repeatMode === 3) { // shuffle
        const availableIndices = shuffledIndices.filter((_, i) => i < currentTrackIndex);
        if (availableIndices.length > 0) {
          prevIndex = availableIndices[availableIndices.length - 1];
        } else {
          prevIndex = shuffledIndices[shuffledIndices.length - 1];
        }
      } else {
        prevIndex = currentTrackIndex !== null ? (currentTrackIndex - 1 + tracksToDisplay.length) % tracksToDisplay.length : 0;
      }
      selectTrack(prevIndex);
    }
  };

  const handleRepeatToggle = () => {
    const newMode = (repeatMode + 1) % 4;
    setRepeatMode(newMode);
    // инициализируем shuffle если переходим в режим 3
    if (newMode === 3 && tracksToDisplay.length > 0) {
      const newShuffled = [...Array(tracksToDisplay.length).keys()].sort(() => Math.random() - 0.5);
      setShuffledIndices(newShuffled);
    }
  };

  const handleAudioEnded = () => {
    if (repeatMode === 2 && audioRef.current) { // повтор трека
      audioRef.current.currentTime = 0;
      audioRef.current.play();
      return;
    }
    if (repeatMode === 1) { // повтор всех
      if (currentTrackIndex !== null && currentTrackIndex === tracksToDisplay.length - 1) {
        selectTrack(0); // с начала
      } else {
        handleNext();
      }
      return;
    }
    if (repeatMode === 3) { // shuffle
      handleNext();
      return;
    }
    handleNext(); // обычное воспроизведение
  };

  const onScrub = (value) => { if (audioRef.current) audioRef.current.currentTime = value; };

  useEffect(() => { if (audioRef.current) isPlaying ? audioRef.current.play() : audioRef.current.pause(); }, [isPlaying, currentTrackIndex]);
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
    localStorage.setItem('volume', volume);
  }, [volume, currentTrackIndex]);

  if (allTracks === null) {
  }

  return (
    <>
      <ToastManager />
      {currentTrack && <audio ref={audioRef} src={currentTrack.url} onEnded={handleAudioEnded} onTimeUpdate={() => setTrackProgress(audioRef.current.currentTime)} />}
      <Sidebar 
        playlists={playlists} 
        onPlaylistCreated={handlePlaylistCreated} 
        onPlaylistSelect={handlePlaylistSelect} 
        selectedPlaylistId={selectedPlaylist?._id}
        onPlaylistEdited={handlePlaylistEdited}
        onPlaylistDeleted={handlePlaylistDeleted}
      />
      
      <Routes>
        <Route path="/" element={<MainContent tracks={tracksToDisplay} playlists={playlists} currentTrackIndex={currentTrackIndex} onTrackSelect={selectTrack} onTrackAdded={handleTrackAddedToPlaylist} playlistTitle={selectedPlaylist?.name} onTrackRemoved={handleTrackRemoved} />} />
        <Route path="/playlist/:playlistId" element={<MainContent tracks={tracksToDisplay} playlists={playlists} currentTrackIndex={currentTrackIndex} onTrackSelect={selectTrack} onTrackAdded={handleTrackAddedToPlaylist} playlistTitle={selectedPlaylist?.name} onTrackRemoved={handleTrackRemoved} />} />
        <Route path="/search" element={<SearchPage allTracks={allTracks} onTrackSelect={selectTrack} />} />
        <Route 
          path="/songs" 
          element={
            <SongsPage 
              allTracks={allTracks} 
              onTrackSelect={selectTrack}
              currentTrackIndex={currentTrackIndex}
              playlists={playlists}
              onTrackAdded={handleTrackAddedToPlaylist}
              onTrackDeleted={handleTrackDeleted}
            />
          } 
        />
      <Route path="/upload" element={<UploadPage onTrackUploaded={handleTrackUploaded} />} />
      </Routes>

      <PlayerBar
        currentTrack={currentTrack}
        isPlaying={isPlaying}
        trackProgress={trackProgress}
        duration={currentTrack?.duration}
        onPlayPause={handlePlayPause}
        onNext={handleNext}
        onPrev={handlePrev}
        onScrub={onScrub}
        volume={volume}
        onVolumeChange={(e) => setVolume(Math.min(1, Math.max(0, parseFloat(e.target.value))))}
        repeatMode={repeatMode}
        onRepeatToggle={handleRepeatToggle}
      />
    </>
  );
}

export default Layout;