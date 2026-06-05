import React, { useState, useEffect, useRef } from 'react';
import './PlayerBar.css';
import { 
  IoPlaySkipBack, 
  IoPlaySkipForward, 
  IoPlay, 
  IoPause, 
  IoRepeat,
  IoShuffle,
  IoVolumeHigh, 
  IoVolumeMute 
} from 'react-icons/io5';

const formatTime = (seconds) => {
  if (isNaN(seconds)) return '0:00';
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
};

function PlayerBar({ currentTrack, isPlaying, trackProgress, duration, onPlayPause, onNext, onPrev, onScrub, volume, onVolumeChange, repeatMode, onRepeatToggle }) {
  const [displayProgress, setDisplayProgress] = useState(trackProgress);
  const progressInputRef = useRef(null);
  const animationRef = useRef(null);
  const isScrubbing = useRef(false);

  // плавное движение ползунка
  useEffect(() => {
    if (!isScrubbing.current) {
      const updateProgress = () => {
        setDisplayProgress(trackProgress);
        animationRef.current = requestAnimationFrame(updateProgress);
      };
      animationRef.current = requestAnimationFrame(updateProgress);
    }
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [trackProgress]);

  const handleMouseDown = () => {
    isScrubbing.current = true;
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  };

  const handleMouseUp = () => {
    isScrubbing.current = false;
    const val = parseFloat(displayProgress) || 0;
    onScrub(val);
  };

  const handlePointerDown = () => handleMouseDown();
  const handlePointerUp = () => handleMouseUp();

  const handleScrubChange = (e) => {
    setDisplayProgress(e.target.value);
  };

  const getRepeatButtonInfo = () => {
    switch(repeatMode) {
      case 0:
        return { label: 'Повтор: выкл', className: 'repeat-btn' };
      case 1:
        return { label: 'Повтор всех', className: 'repeat-btn active' };
      case 2:
        return { label: 'Повтор трека', className: 'repeat-btn active repeat-one' };
      case 3:
        return { label: 'Случайный порядок', className: 'repeat-btn active shuffle' };
      default:
        return { label: 'Повтор: выкл', className: 'repeat-btn' };
    }
  };

  const repeatInfo = getRepeatButtonInfo();
  
  const getFullUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `https://amusic333-production.up.railway.app${url}`;
  };
  
  return (
    <footer className="player-bar">
      <div className="player-track-info">
        {currentTrack && (
          <>
            <img
              src={getFullUrl(currentTrack.cover)}
              alt="обложка трека"
              className="player-cover-art"
              onError={(e) => { e.target.src = 'https://res.cloudinary.com/ditexyjne/image/upload/v1780577006/images/default-cover.jpg'; }}
            />
            <div className="player-track-details">
              <h3>{currentTrack.title}</h3>
              <p>{currentTrack.artist}</p>
            </div>
          </>
        )}
      </div>

      <div className="player-controls-center">
        <div className="main-controls">
          <button onClick={onPrev}><IoPlaySkipBack /></button>
          <button onClick={onPlayPause} className="play-pause-btn">
            {isPlaying ? <IoPause /> : <IoPlay />}
          </button>
          <button onClick={onNext}><IoPlaySkipForward /></button>
        </div>
        <div className="progress-bar-container">
          <span>{formatTime(displayProgress)}</span>
          <input
            ref={progressInputRef}
            type="range"
            value={displayProgress}
            step="0.1"
            min="0"
            max={duration ? duration : 0}
            className="progress-bar"
            onChange={handleScrubChange}
              onMouseDown={handleMouseDown}
              onMouseUp={handleMouseUp}
              onTouchStart={handleMouseDown}
              onTouchEnd={handleMouseUp}
              onPointerDown={handlePointerDown}
              onPointerUp={handlePointerUp}
          />
          <span>{formatTime(duration)}</span>
        </div>
      </div>
      
      <div className="player-extra-controls">
        <button 
          className={repeatInfo.className} 
          onClick={onRepeatToggle} 
          title={repeatInfo.label}
        >
          {repeatMode === 3 ? (
            <IoShuffle />
          ) : (
            <div className="repeat-button-content">
              <IoRepeat />
              {repeatMode === 2 && <span className="repeat-one-badge">1</span>}
            </div>
          )}
          <span className="repeat-mode-label">{repeatInfo.label}</span>
        </button>
        {volume > 0 ? <IoVolumeHigh /> : <IoVolumeMute />}
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={onVolumeChange}
          className="volume-bar"
        />
      </div>
    </footer>
  );
}

export default PlayerBar;