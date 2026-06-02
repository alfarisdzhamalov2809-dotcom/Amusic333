# 📡 API Документация системы обработки треков

## Обзор

Полное API описание для системы автоматической обработки музыкальных треков с автоматическим извлечением метаданных, генерацией ID и сохранением всех параметров.

---

## 1. Загрузка трека (POST /api/upload)

**Описание:** Загружает MP3 файл, автоматически извлекает метаданные и сохраняет в базу данных.

### URL
```
POST http://localhost:5000/api/upload
```

### Заголовки
| Заголовок | Значение | Обязательный |
|-----------|----------|-------------|
| Authorization | Bearer {token} | ✅ Да |
| Content-Type | multipart/form-data | Автоматический |

### Параметры тела запроса

| Параметр | Тип | Обязательный | Описание |
|----------|-----|-------------|----------|
| track | File (MP3) | ✅ Да | Аудиофайл MP3 |
| title | String | ❌ Нет | Название трека (если пусто - из имени файла) |
| artist | String | ❌ Нет | Исполнитель (если пусто - "Unknown Artist") |

### Примеры запроса

#### С помощью cURL
```bash
curl -X POST http://localhost:5000/api/upload \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -F "track=@song.mp3" \
  -F "title=My Song" \
  -F "artist=Artist Name"
```

#### С помощью JavaScript Fetch
```javascript
const formData = new FormData();
formData.append('track', fileInput.files[0]);
formData.append('title', 'My Song');
formData.append('artist', 'Artist Name');

fetch('http://localhost:5000/api/upload', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
})
.then(response => response.json())
.then(data => console.log('Трек загружен:', data));
```

#### С помощью Axios
```javascript
const formData = new FormData();
formData.append('track', fileInput.files[0]);
formData.append('title', 'My Song');
formData.append('artist', 'Artist Name');

axios.post('http://localhost:5000/api/upload', formData, {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'multipart/form-data'
  }
})
.then(response => console.log('Трек загружен:', response.data));
```

### Ответ при успехе (201 Created)

```json
{
  "_id": "60f7b1f5e5c4e2a5b3c8d9e0",
  "title": "My Song",
  "artist": "Artist Name",
  "url": "http://localhost:5000/music/1625500149595-song.mp3",
  "cover": "http://localhost:5000/images/default-cover.jpg",
  "plays": 0,
  "duration": 243,
  "message": "Трек успешно загружен и обработан"
}
```

### Ответ при ошибке

#### 400 Bad Request - Файл не выбран
```json
{
  "message": "Файл не выбран"
}
```

#### 401 Unauthorized - Неверный токен
```json
{
  "message": "Требуется авторизация"
}
```

#### 500 Internal Server Error - Ошибка извлечения метаданных
```json
{
  "message": "Ошибка при загрузке файла",
  "error": "Cannot read property 'format' of undefined"
}
```

### Автоматическая обработка

Когда файл загружен, система автоматически:

1. **Извлекает длительность** из MP3 метаданных
   - Использует библиотеку `music-metadata`
   - Возвращает длительность в секундах
   - Если не удается - устанавливает 0

2. **Генерирует уникальный ID**
   - MongoDB ObjectId автоматически
   - Гарантированно уникален
   - Примеры: `60f7b1f5e5c4e2a5b3c8d9e0`

3. **Заполняет название**
   - Если `title` не передан - берет из имени файла
   - Удаляет расширение `.mp3`
   - Заменяет подчеркивания на пробелы
   - Удаляет временную метку: `1625500149595-`

4. **Заполняет исполнителя**
   - Если `artist` не передан - устанавливает "Unknown Artist"

5. **Сохраняет путь к файлу**
   - Формат: `http://localhost:5000/music/{timestamp}-{filename}`
   - Используется для потоковой передачи

6. **Устанавливает количество прослушиваний**
   - По умолчанию: 0
   - Может быть изменено позже через отдельный эндпоинт

---

## 2. Получение всех треков (GET /api/tracks)

**Описание:** Возвращает список всех загруженных треков.

### URL
```
GET http://localhost:5000/api/tracks
```

### Заголовки
| Заголовок | Значение | Обязательный |
|-----------|----------|-------------|
| Content-Type | application/json | Нет |

### Параметры
Нет параметров

### Примеры запроса

#### cURL
```bash
curl http://localhost:5000/api/tracks
```

#### JavaScript
```javascript
fetch('http://localhost:5000/api/tracks')
  .then(response => response.json())
  .then(tracks => console.log(tracks));
```

### Ответ при успехе (200 OK)

```json
[
  {
    "_id": "60f7b1f5e5c4e2a5b3c8d9e0",
    "title": "My Song",
    "artist": "Artist Name",
    "url": "http://localhost:5000/music/1625500149595-song.mp3",
    "cover": "http://localhost:5000/images/default-cover.jpg",
    "plays": 0,
    "duration": 243
  },
  {
    "_id": "60f7b1f5e5c4e2a5b3c8d9e1",
    "title": "Another Track",
    "artist": "Another Artist",
    "url": "http://localhost:5000/music/1625500250000-another.mp3",
    "cover": "http://localhost:5000/images/default-cover.jpg",
    "plays": 125,
    "duration": 198
  }
]
```

### Ответ при ошибке

#### 500 Internal Server Error
```json
{
  "message": "Ошибка при получении треков",
  "error": "Database connection failed"
}
```

---

## 3. Поиск треков (GET /api/search)

**Описание:** Ищет треки по названию или исполнителю.

### URL
```
GET http://localhost:5000/api/search?query={searchQuery}
```

### Параметры запроса

| Параметр | Тип | Обязательный | Описание |
|----------|-----|-------------|----------|
| query | String | ✅ Да | Поисковый запрос |

### Примеры запроса

#### cURL
```bash
curl "http://localhost:5000/api/search?query=My%20Song"
```

#### JavaScript
```javascript
const query = 'My Song';
fetch(`http://localhost:5000/api/search?query=${encodeURIComponent(query)}`)
  .then(response => response.json())
  .then(tracks => console.log('Результаты поиска:', tracks));
```

### Ответ при успехе (200 OK)

```json
[
  {
    "_id": "60f7b1f5e5c4e2a5b3c8d9e0",
    "title": "My Song",
    "artist": "Artist Name",
    "url": "http://localhost:5000/music/1625500149595-song.mp3",
    "cover": "http://localhost:5000/images/default-cover.jpg",
    "plays": 0,
    "duration": 243
  }
]
```

### Ответ при ошибке

#### 400 Bad Request - Пустой поиск
```json
{
  "message": "Поисковый запрос не может быть пустым"
}
```

---

## 4. Удаление трека (DELETE /api/tracks/{trackId})

**Описание:** Удаляет трек по ID.

### URL
```
DELETE http://localhost:5000/api/tracks/{trackId}
```

### Параметры пути

| Параметр | Тип | Описание |
|----------|-----|----------|
| trackId | String | ID трека (MongoDB ObjectId) |

### Заголовки
| Заголовок | Значение | Обязательный |
|-----------|----------|-------------|
| Authorization | Bearer {token} | ✅ Да |

### Примеры запроса

#### cURL
```bash
curl -X DELETE http://localhost:5000/api/tracks/60f7b1f5e5c4e2a5b3c8d9e0 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### JavaScript
```javascript
fetch('http://localhost:5000/api/tracks/60f7b1f5e5c4e2a5b3c8d9e0', {
  method: 'DELETE',
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
.then(response => response.json())
.then(data => console.log('Трек удален:', data));
```

### Ответ при успехе (200 OK)

```json
{
  "message": "Трек успешно удален",
  "trackId": "60f7b1f5e5c4e2a5b3c8d9e0"
}
```

### Ответ при ошибке

#### 404 Not Found - Трек не найден
```json
{
  "message": "Трек не найден"
}
```

#### 401 Unauthorized
```json
{
  "message": "Требуется авторизация"
}
```

---

## 5. Структура данных трека

### Схема MongoDB

```javascript
{
  "_id": ObjectId,           // Уникальный идентификатор (автоматический)
  "title": String,           // Название трека
  "artist": String,          // Исполнитель
  "url": String,             // Полный URL к MP3 файлу
  "cover": String,           // URL к обложке трека
  "plays": Number,           // Количество прослушиваний
  "duration": Number         // Длительность в секундах
}
```

### Пример документа

```javascript
{
  "_id": ObjectId("60f7b1f5e5c4e2a5b3c8d9e0"),
  "title": "My Awesome Song",
  "artist": "Cool Artist",
  "url": "http://localhost:5000/music/1625500149595-My_Awesome_Song.mp3",
  "cover": "http://localhost:5000/images/default-cover.jpg",
  "plays": 0,
  "duration": 243
}
```

---

## 6. Коды статуса ответов

| Код | Описание | Когда возникает |
|-----|---------|-----------------|
| 200 | OK | Успешный запрос (GET, DELETE) |
| 201 | Created | Трек успешно создан (POST /upload) |
| 400 | Bad Request | Ошибка в параметрах запроса |
| 401 | Unauthorized | Отсутствует или неверный токен |
| 404 | Not Found | Ресурс не найден |
| 500 | Internal Server Error | Ошибка сервера |

---

## 7. Обработка ошибок

### Типичные ошибки и решения

#### Ошибка: "Требуется авторизация"
**Причина:** Отсутствует или истекает токен  
**Решение:** Повторно авторизуйтесь и получите новый токен

#### Ошибка: "Файл не выбран"
**Причина:** Параметр `track` не отправлен  
**Решение:** Убедитесь, что передаете файл в параметре `track`

#### Ошибка: "Не удалось извлечь метаданные"
**Причина:** MP3 файл повреждён или в неподдерживаемом формате  
**Решение:** Переконвертируйте файл или используйте другой

#### Ошибка: "Трек не найден"
**Причина:** TrackId не существует в базе  
**Решение:** Проверьте ID трека и попробуйте снова

---

## 8. Примеры интеграции

### React компонент
```javascript
import React, { useState } from 'react';

function UploadTrack() {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');

  const handleUpload = async (e) => {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('track', file);
    formData.append('title', title);
    formData.append('artist', artist);

    try {
      const response = await fetch('http://localhost:5000/api/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      const data = await response.json();
      console.log('Трек загружен:', data);
      alert(`Трек "${data.title}" загружен! Длительность: ${data.duration}с`);
    } catch (error) {
      console.error('Ошибка:', error);
    }
  };

  return (
    <form onSubmit={handleUpload}>
      <input 
        type="file" 
        accept=".mp3"
        onChange={(e) => setFile(e.target.files[0])} 
      />
      <input 
        type="text" 
        placeholder="Название"
        onChange={(e) => setTitle(e.target.value)} 
      />
      <input 
        type="text" 
        placeholder="Исполнитель"
        onChange={(e) => setArtist(e.target.value)} 
      />
      <button type="submit">Загрузить</button>
    </form>
  );
}
```

### Node.js сервис
```javascript
const axios = require('axios');
const fs = require('fs');

async function uploadTrack(filePath, title, artist, token) {
  const formData = new FormData();
  formData.append('track', fs.createReadStream(filePath));
  formData.append('title', title);
  formData.append('artist', artist);

  const response = await axios.post(
    'http://localhost:5000/api/upload',
    formData,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        ...formData.getHeaders()
      }
    }
  );

  return response.data;
}

// Использование
uploadTrack('./song.mp3', 'My Song', 'Artist', 'TOKEN')
  .then(data => console.log('Успех:', data))
  .catch(err => console.error('Ошибка:', err));
```

---

## 9. Ограничения и лимиты

| Параметр | Значение | Примечание |
|----------|----------|-----------|
| Максимальный размер файла | 500 МБ | Configurabilе в multer |
| Поддерживаемые форматы | .mp3 | Можно расширить |
| Максимальная длина названия | 1000 символов | String в MongoDB |
| Максимальная длина пути | 2048 символов | Стандартное ограничение |

---

## 10. Версионирование API

Текущая версия: **v1.0.0**

**История версий:**
- v1.0.0 - Система автоматической обработки треков с извлечением метаданных
- v0.9.0 - Начальная версия без автоматического извлечения метаданных

---

## 11. Заключение

Это полное API для работы с музыкальными треками. Система автоматически:
- ✅ Извлекает длительность из MP3
- ✅ Генерирует уникальные ID
- ✅ Автоматически заполняет названия
- ✅ Сохраняет все метаданные

Для начала работы используйте примеры выше. 🚀
