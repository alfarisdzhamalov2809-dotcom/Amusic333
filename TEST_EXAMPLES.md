# 🧪 Примеры тестирования системы обработки треков

## 1. Тестирование через cURL (Командная строка)

### Подготовка
```bash
# Сначала получите токен аутентификации
curl -X POST http://localhost:5000/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "password123"
  }'

# Скопируйте полученный token
# Пример ответа:
# {
#   "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
#   "userId": "60f7b1f5e5c4e2a5b3c8d9e0",
#   "username": "testuser"
# }
```

### Загрузка трека с полной информацией
```bash
curl -X POST http://localhost:5000/api/upload \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -F "track=@/path/to/song.mp3" \
  -F "title=My Awesome Song" \
  -F "artist=Song Artist"
```

### Загрузка трека с автоматическим заполнением названия
```bash
curl -X POST http://localhost:5000/api/upload \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -F "track=@/path/to/My_Cool_Track.mp3"

# Название автоматически будет "My Cool Track"
```

---

## 2. Тестирование через Postman

### Шаг 1: Создание запроса POST
1. Откройте Postman
2. Выберите метод **POST**
3. Введите URL: `http://localhost:5000/api/upload`

### Шаг 2: Настройка заголовков
1. Перейдите на вкладку **Headers**
2. Добавьте:
   - Key: `Authorization`
   - Value: `Bearer YOUR_TOKEN_HERE`

### Шаг 3: Загрузка файла
1. Перейдите на вкладку **Body**
2. Выберите **form-data**
3. Добавьте параметры:

| Key | Type | Value |
|-----|------|-------|
| track | file | Выберите MP3 файл |
| title | text | My Song Title |
| artist | text | Artist Name |

### Шаг 4: Отправка
Нажмите **Send**

**Ожидаемый ответ (200 OK):**
```json
{
  "_id": "60f7b1f5e5c4e2a5b3c8d9e0",
  "title": "My Song Title",
  "artist": "Artist Name",
  "url": "http://localhost:5000/music/1625500149595-song.mp3",
  "cover": "http://localhost:5000/images/default-cover.jpg",
  "plays": 0,
  "duration": 243,
  "message": "Трек успешно загружен и обработан"
}
```

---

## 3. Тестирование в браузере (через фронтенд)

### Процесс:
1. Откройте приложение в браузере
2. Авторизуйтесь
3. Перейдите на страницу **"Загрузить новый трек"**
4. Выберите MP3 файл
5. Наблюдайте автоматическое заполнение названия
6. Нажмите **"✨ Загрузить трек"**
7. Дождитесь сообщения об успехе
8. Проверьте появление трека в списке **"Все песни"**

---

## 4. Проверка результатов

### Получение всех треков
```bash
curl http://localhost:5000/api/tracks
```

**Ответ:**
```json
[
  {
    "_id": "60f7b1f5e5c4e2a5b3c8d9e0",
    "title": "My Song Title",
    "artist": "Artist Name",
    "url": "http://localhost:5000/music/1625500149595-song.mp3",
    "cover": "http://localhost:5000/images/default-cover.jpg",
    "plays": 0,
    "duration": 243
  }
]
```

### Поиск конкретного трека
```bash
curl "http://localhost:5000/api/search?query=My%20Song"
```

---

## 5. Тестовые файлы

### Способ создания тестового MP3
```bash
# Linux/Mac: Создание коротко MP3 файла
ffmpeg -f lavfi -i sine=f=440:d=5 -b:a 128k test_song.mp3

# Windows: Используйте online конвертеры или загрузите готовый файл
```

### Минимальный тестовый трек
- Формат: MP3
- Длительность: от 3 до 300 секунд
- Битрейт: 128 kbps или выше
- Размер: 1-50 МБ

---

## 6. Проверка метаданных

### Просмотр извлеченных метаданных
```bash
# После загрузки треска, проверьте API ответ
curl http://localhost:5000/api/tracks | jq '.[] | {title, duration, plays}'
```

**Ожидаемый результат:**
```json
{
  "title": "My Song Title",
  "duration": 243,
  "plays": 0
}
```

---

## 7. Тестирование различных сценариев

### ✅ Сценарий 1: Полные данные
- Файл: `track.mp3`
- Название: "My Song"
- Исполнитель: "Artist"

**Результат:** Все поля заполнены, длительность извлечена ✓

### ✅ Сценарий 2: Только файл
- Файл: `My_Cool_Song.mp3`
- Название: (пусто)
- Исполнитель: (пусто)

**Результат:**
- Название: "My Cool Song" (из имени файла)
- Исполнитель: "Unknown Artist"
- Длительность: извлечена ✓

### ✅ Сценарий 3: Файл без расширения в названии
- Файл: `song-name` (без .mp3)

**Результат:** Ошибка или без названия

### ❌ Сценарий 4: Неверный формат
- Файл: `document.pdf`

**Результат:** Ошибка валидации

### ❌ Сценарий 5: Без токена аутентификации
- Заголовок Authorization: (отсутствует)

**Результат:** Ошибка 401 Unauthorized

---

## 8. Отладка проблем

### Проблема: "Не удалось извлечь метаданные"
```bash
# Проверьте MP3 файл
ffprobe -v error -show_format -show_streams test.mp3

# Должны увидеть информацию о длительности (duration)
```

### Проблема: Файл не сохраняется
```bash
# Проверьте права доступа к папке
ls -la backend/public/music/

# Должны быть права на запись (drwxr-xr-x)
```

### Проблема: Длительность 0
```bash
# Переконвертируйте MP3 с явным указанием длительности
ffmpeg -i input.mp3 -c copy -metadata duration=240 output.mp3
```

---

## 9. Мониторинг в реальном времени

### Просмотр логов сервера
```bash
# Если server.js запущен в терминале, вы увидите:
# Трек успешно загружен и обработан
# Добавлены данные о длительности: 243
```

### Просмотр сохраненных файлов
```bash
# Windows
dir backend\public\music\

# Linux/Mac
ls -la backend/public/music/
```

### Проверка в MongoDB
```javascript
// Подключитесь к MongoDB и выполните
db.tracks.find().pretty()

// Должны увидеть загруженные треки с полными данными
```

---

## 10. Примеры для разработчиков

### Node.js script для тестирования
```javascript
const fetch = require('node-fetch');
const FormData = require('form-data');
const fs = require('fs');

async function uploadTrack(filePath, title, artist, token) {
  const form = new FormData();
  form.append('track', fs.createReadStream(filePath));
  form.append('title', title);
  form.append('artist', artist);

  const response = await fetch('http://localhost:5000/api/upload', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      ...form.getHeaders()
    },
    body: form
  });

  const data = await response.json();
  console.log('Track uploaded:', data);
  return data;
}

// Использование
uploadTrack('./test.mp3', 'My Song', 'Artist', 'YOUR_TOKEN');
```

### Python script для тестирования
```python
import requests

def upload_track(file_path, title, artist, token):
    url = 'http://localhost:5000/api/upload'
    headers = {'Authorization': f'Bearer {token}'}
    
    with open(file_path, 'rb') as f:
        files = {'track': f}
        data = {'title': title, 'artist': artist}
        response = requests.post(url, headers=headers, files=files, data=data)
    
    return response.json()

# Использование
result = upload_track('test.mp3', 'My Song', 'Artist', 'YOUR_TOKEN')
print(result)
```

---

## 11. Проверочный список

Перед тестированием убедитесь:
- ✅ Backend запущен на `http://localhost:5000`
- ✅ Frontend запущен на `http://localhost:3000`
- ✅ MongoDB подключена и работает
- ✅ Папка `backend/public/music/` создана и доступна
- ✅ MP3 файл имеет правильный формат
- ✅ Имеется действительный токен авторизации
- ✅ Библиотека `music-metadata` установлена

---

## 12. Ожидаемые результаты

### При успешной загрузке трека:
```
✅ Статус: 201 Created
✅ Длительность: автоматически определена
✅ ID: сгенерирован MongoDB
✅ Название: заполнено (вручную или из файла)
✅ Файл: сохранен в backend/public/music/
✅ Данные: добавлены в MongoDB
✅ Фронтенд: показывает сообщение об успехе
✅ Список песен: содержит новый трек со всеми метаданными
```

---

Удачи с тестированием! 🎉
