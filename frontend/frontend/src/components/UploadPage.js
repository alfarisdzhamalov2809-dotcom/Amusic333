import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import './UploadPage.css';

function UploadPage({ onTrackUploaded }) {
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [file, setFile] = useState(null);
  const [plays, setPlays] = useState('');
  const [coverFile, setCoverFile] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [extractedInfo, setExtractedInfo] = useState(null);
  const navigate = useNavigate(); 

  // Берём имя файла и сразу кладём его в форму
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    
    if (selectedFile) {
      // Убираем расширение, чтоб было просто название
      const fileName = selectedFile.name.replace(/\.[^/.]+$/, '');
      
      // Если поле пустое, подставляем название из файла
      if (!title || title === '') {
        setTitle(fileName);
      }
      
      // Запоминаем данные про файл
      setExtractedInfo({
        fileName: selectedFile.name,
        fileSize: (selectedFile.size / 1024 / 1024).toFixed(2), // в мегабайтах
        autoTitle: fileName,
      });
    }
  };

  const handleCoverChange = (e) => {
    const selected = e.target.files[0];
    setCoverFile(selected);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !title.trim()) {
      setMessage('Пожалуйста, выберите файл и введите название трека.');
      return;
    }

    const formData = new FormData();
    formData.append('track', file);
    formData.append('title', title);
    formData.append('artist', artist || 'Unknown Artist');
    // Количество прослушиваний — если пусто, отправляем 0
    const playsValue = plays && plays.toString().trim() !== '' ? parseInt(plays, 10) || 0 : 0;
    formData.append('plays', playsValue);
    // Опциональная обложка
    if (coverFile) {
      formData.append('cover', coverFile);
    }

    const token = localStorage.getItem('token');
    setMessage('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Ошибка при загрузке');
      }
      
      // Приводим данные от сервера к нужному виду
      const trackInfo = {
        ...data,
        durationFormatted: formatDuration(data.duration)
      };
      
      onTrackUploaded(trackInfo);

      setMessage(`✅ Трек "${data.title}" успешно загружен и обработан!\nДлительность: ${formatDuration(data.duration)} • ID: ${data._id}`);
      
      // Сбрасываем поля
      setTitle('');
      setArtist('');
      setFile(null);
      setExtractedInfo(null);
      
      // Через пару секунд уйдём на песни
      setTimeout(() => navigate('/songs'), 2000);

    } catch (error) {
      setMessage(`❌ Ошибка: ${error.message}`);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Приводим секунды к виду MM:SS
  const formatDuration = (seconds) => {
    if (!seconds || seconds === 0) return '—';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <main className="upload-page-main">
      <h2>Загрузить новый трек</h2>
      
      {/* Здесь показываем инфу из файла */}
      {extractedInfo && (
        <div className="extracted-info">
          <p><strong>📁 Файл:</strong> {extractedInfo.fileName}</p>
          <p><strong>💾 Размер:</strong> {extractedInfo.fileSize} МБ</p>
          <p><strong>🎵 Автоматическое название:</strong> {extractedInfo.autoTitle}</p>
          <p className="warning">
            ⚠️ Система автоматически определит длительность трека и присвоит уникальный ID
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="upload-form">
        <div className="form-group">
          <label htmlFor="title">Название трека *</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Название будет автоматически подставлено из файла"
          />
        </div>

        <div className="form-group">
          <label htmlFor="artist">Исполнитель</label>
          <input
            type="text"
            id="artist"
            value={artist}
            onChange={(e) => setArtist(e.target.value)}
            placeholder="Оставьте пусто, если не указано"
          />
        </div>

        <div className="form-group">
          <label htmlFor="track">Аудиофайл (MP3) *</label>
          <input
            type="file"
            id="track"
            accept=".mp3"
            onChange={handleFileChange}
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="plays">Количество прослушиваний</label>
          <input
            type="number"
            id="plays"
            min="0"
            value={plays}
            onChange={(e) => setPlays(e.target.value)}
            placeholder="Оставьте пустым для 0"
          />
        </div>

        <div className="form-group">
          <label htmlFor="cover">Обложка (изображение)</label>
          <input
            type="file"
            id="cover"
            accept="image/*"
            onChange={handleCoverChange}
            disabled={loading}
          />
        </div>

        <button type="submit" disabled={loading || !file}>
          {loading ? '⏳ Загрузка и обработка...' : '✨ Загрузить трек'}
        </button>

        {message && (
          <p className={`message ${message.startsWith('✅') ? 'success' : 'error'}`}>
            {message}
          </p>
        )}
      </form>
    </main>
  );
}

export default UploadPage;