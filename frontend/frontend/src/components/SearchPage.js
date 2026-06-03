import React, { useState } from 'react';
import './SearchPage.css';
import { apiUrl } from '../api';

function SearchPage({ allTracks, onTrackSelect }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [message, setMessage] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    setMessage('');
    setResults([]);

    if (!searchTerm) return;

    try {
      const response = await fetch(apiUrl(`/api/search?query=${encodeURIComponent(searchTerm)}`));
      if (!response.ok) {
        throw new Error('Ошибка сети при выполнении поиска');
      }
      const data = await response.json();
      
      if (data.length === 0) {
        setMessage('Ничего не найдено');
      } else {
        setResults(data);
      }

    } catch (error) {
      setMessage('Произошла ошибка при поиске');
      console.error(error);
    }
  };

  const handleTrackClick = (trackId) => {
    const trackIndex = allTracks.findIndex(track => track._id === trackId);
    if (trackIndex !== -1) {
      onTrackSelect(trackIndex);
    }
  };

  return (
    <main className="search-page-main">
      <form onSubmit={handleSearch} className="search-bar-container">
        <input
          type="text"
          placeholder="Что хотите послушать?"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <button type="submit" className="search-button">Найти</button>
      </form>

      <div className="search-results">
        {message && <p className="search-message">{message}</p>}
        {results.map(track => (
          <div key={track._id} className="search-result-item" onClick={() => handleTrackClick(track._id)}>
            <img src={track.cover} alt="Обложка трека" className="search-result-cover" />
            <div className="search-result-details">
              <span className="search-result-title">{track.title}</span>
              <span className="search-result-artist">{track.artist}</span>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}

export default SearchPage;