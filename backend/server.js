const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const fs = require('fs');
const { parseFile } = require('music-metadata');
const authMiddleware = require('./middleware/auth.middleware');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const MONGO_URI = 'mongodb://music_app_user:alfasmusicplayer@ac-vycfqo8-shard-00-00.njkfdlw.mongodb.net:27017,ac-vycfqo8-shard-00-01.njkfdlw.mongodb.net:27017,ac-vycfqo8-shard-00-02.njkfdlw.mongodb.net:27017/?ssl=true&replicaSet=atlas-kd4kzf-shard-0&authSource=admin&appName=music';

mongoose.connect(MONGO_URI)
  .then(() => console.log('Успешное подключение к MongoDB'))
  .catch(err => console.error('Ошибка подключения к MongoDB:', err));

const trackSchema = new mongoose.Schema({
  title: String,
  artist: String,
  url: String,
  cover: String,
  plays: Number,
  duration: Number,
});
const Track = mongoose.model('Track', trackSchema);

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});
const User = mongoose.model('User', userSchema);

const playlistSchema = new mongoose.Schema({
  name: { type: String, required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  tracks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Track' }]
});
const Playlist = mongoose.model('Playlist', playlistSchema);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Сохраняем треки в public/music, обложки в public/images
    if (file.fieldname === 'cover') {
      cb(null, 'public/images');
    } else {
      cb(null, 'public/music');
    }
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname.replace(/\s/g, '_'));
  }
});
const upload = multer({ storage: storage });

const trackMetadataMap = {
  'bakr очи': { plays: 1234567, duration: 240 },
  'bakr ochi': { plays: 1234567, duration: 240 },
  'bakr - очи': { plays: 1234567, duration: 240 },
  // Добавляйте сюда другие известные треки, чтобы подставлять прослушивания и время автоматически
};

app.get('/api/tracks', async (req, res) => {
    try {
        const tracks = await Track.find();
        res.json(tracks);
    } catch (error) {
        res.status(500).json({ message: "Ошибка при получении треков", error });
    }
});

app.post('/api/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!password) return res.status(400).json({ message: "Пароль не может быть пустым" });
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'Пользователь с таким именем уже существует' });
    }
    const hashedPassword = await bcrypt.hash(password, 12);
    const newUser = new User({
      username,
      password: hashedPassword,
    });
    await newUser.save();
    res.status(201).json({ message: 'Пользователь успешно зарегистрирован' });
  } catch (error) {
    res.status(500).json({ message: 'Что-то пошло не так, попробуйте снова' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: 'Неверные учетные данные, попробуйте снова' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Неверные учетные данные, попробуйте снова' });
    }
    const token = jwt.sign(
      { userId: user.id },
      'очень секретный ключ который должен быть длинным и случайным',
      { expiresIn: '1h' }
    );
    res.json({ token, userId: user.id, username: user.username });
  } catch (error) {
    res.status(500).json({ message: 'Что-то пошло не так, попробуйте снова' });
  }
});

app.get('/api/playlists', authMiddleware, async (req, res) => {
  try {
    const playlists = await Playlist.find({ owner: req.user.userId }).populate('tracks');
    res.json(playlists);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при получении плейлистов' });
  }
});

app.get('/api/playlists/:playlistId', authMiddleware, async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.playlistId).populate('tracks');
    if (!playlist) return res.status(404).json({ message: 'Плейлист не найден' });
    if (playlist.owner.toString() !== req.user.userId) return res.status(403).json({ message: 'Доступ запрещен' });
    res.json(playlist);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при получении плейлиста' });
  }
});

app.post('/api/playlists', authMiddleware, async (req, res) => {
  try {
    const newPlaylist = new Playlist({
      name: req.body.name,
      owner: req.user.userId,
      tracks: []
    });
    await newPlaylist.save();
    res.status(201).json(newPlaylist);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при создании плейлиста' });
  }
});

app.post('/api/playlists/:playlistId/tracks', authMiddleware, async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.playlistId);
    if (!playlist) return res.status(404).json({ message: 'Плейлист не найден' });
    if (playlist.owner.toString() !== req.user.userId) return res.status(403).json({ message: 'Доступ запрещен' });
    if (!playlist.tracks.includes(req.body.trackId)) {
      playlist.tracks.push(req.body.trackId);
      await playlist.save();
    }
    const updatedPlaylist = await Playlist.findById(req.params.playlistId).populate('tracks');
    res.json(updatedPlaylist);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при добавлении трека в плейлист' });
  }
});

app.put('/api/playlists/:playlistId', authMiddleware, async (req, res) => {
  try {
    const { name } = req.body;
    const playlist = await Playlist.findOneAndUpdate(
      { _id: req.params.playlistId, owner: req.user.userId },
      { name: name },
      { new: true }
    ).populate('tracks');
    if (!playlist) {
      return res.status(404).json({ message: 'Плейлист не найден или у вас нет прав на его изменение' });
    }
    res.json(playlist);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при обновлении плейлиста' });
  }
});

app.delete('/api/playlists/:playlistId/tracks/:trackId', authMiddleware, async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.playlistId);
    if (!playlist) return res.status(404).json({ message: 'Плейлист не найден' });
    if (playlist.owner.toString() !== req.user.userId) return res.status(403).json({ message: 'Доступ запрещен' });
    
    playlist.tracks = playlist.tracks.filter(trackId => trackId.toString() !== req.params.trackId);
    await playlist.save();
    
    const updatedPlaylist = await Playlist.findById(req.params.playlistId).populate('tracks');
    res.json(updatedPlaylist);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при удалении трека из плейлиста' });
  }
});

app.delete('/api/playlists/:playlistId', authMiddleware, async (req, res) => {
  try {
    const playlist = await Playlist.findOneAndDelete({ 
      _id: req.params.playlistId, 
      owner: req.user.userId 
    });
    if (!playlist) {
      return res.status(404).json({ message: 'Плейлист не найден или у вас нет прав на его удаление' });
    }
    res.json({ message: 'Плейлист успешно удален' });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при удалении плейлиста' });
  }
});

app.post('/api/upload', authMiddleware, upload.fields([{ name: 'track', maxCount: 1 }, { name: 'cover', maxCount: 1 }]), async (req, res) => {
  try {
    let { title, artist } = req.body;
    const trackFile = req.files && req.files['track'] ? req.files['track'][0] : null;
    const coverFile = req.files && req.files['cover'] ? req.files['cover'][0] : null;
    if (!trackFile) return res.status(400).json({ message: 'Аудиофайл не найден' });
    const { filename, path: filePath } = trackFile;
    
    // Если название не заполнено, берём из имени файла
    if (!title || title.trim() === '') {
      title = filename.replace(/\.[^/.]+$/, '').replace(/^\d+-/, '').replace(/_/g, ' ');
    }
    
    // Извлекаем длительность из MP3 файла
    let duration = 0;
    try {
      const metadata = await parseFile(filePath);
      duration = Math.round(metadata.format.duration || 0);
    } catch (metadataError) {
      console.warn('Не удалось извлечь метаданные:', metadataError.message);
      // Продолжаем без длительности
    }
    
    // Генерируем уникальный trackId (MongoDB ObjectId)
    const trackId = new mongoose.Types.ObjectId();
    
    // Пробуем прочитать plays из тела формы (если пусто, ставим 0)
    const playsFromBody = parseInt(req.body.plays, 10);
    const playsValue = Number.isInteger(playsFromBody) && playsFromBody >= 0 ? playsFromBody : 0;

    // Создаём новый трек с автоматическими данными
    const newTrack = new Track({
      _id: trackId,
      title: title.trim(),
      artist: artist && artist.trim() ? artist.trim() : 'Unknown Artist',
      url: `/music/${filename}`,
      cover: coverFile ? `/images/${coverFile.filename}` : '/images/default-cover.jpg',
      plays: playsValue,
      duration: duration, // Автоматически извлечённая длительность
    });
    
    await newTrack.save();
    
    // Возвращаем трек с его ID
    res.status(201).json({
      _id: newTrack._id,
      title: newTrack.title,
      artist: newTrack.artist,
      url: newTrack.url,
      cover: newTrack.cover,
      plays: newTrack.plays,
      duration: newTrack.duration,
      message: 'Трек успешно загружен и обработан'
    });
  } catch (error) {
    console.error("Ошибка при загрузке файла:", error);
    res.status(500).json({ message: 'Ошибка при загрузке файла', error: error.message });
  }
});

app.get('/api/search', async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({ message: 'Поисковый запрос не может быть пустым' });
    }
    const tracks = await Track.find({
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { artist: { $regex: query, $options: 'i' } }
      ]
    });
    res.json(tracks);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка сервера во время поиска' });
  }
});

app.delete('/api/tracks/:trackId', authMiddleware, async (req, res) => {
  try {
    const { trackId } = req.params;

    const deletedTrack = await Track.findByIdAndDelete(trackId);

    if (!deletedTrack) {
      return res.status(404).json({ message: 'Трек не найден' });
    }

    res.json({ message: 'Трек успешно удален', trackId: deletedTrack._id });

  } catch (error) {
    res.status(500).json({ message: 'Ошибка при удалении трека' });
  }
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
  });
}

module.exports = app;