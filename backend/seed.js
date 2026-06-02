const mongoose = require('mongoose');

const MONGO_URI = 'mongodb://music_app_user:alfasmusicplayer@ac-vycfqo8-shard-00-00.njkfdlw.mongodb.net:27017,ac-vycfqo8-shard-00-01.njkfdlw.mongodb.net:27017,ac-vycfqo8-shard-00-02.njkfdlw.mongodb.net:27017/?ssl=true&replicaSet=atlas-kd4kzf-shard-0&authSource=admin&appName=music';

const trackSchema = new mongoose.Schema({
  title: String, artist: String, url: String, cover: String, plays: Number , duration: Number ,
});
const Track = mongoose.model('Track', trackSchema);

const tracksToSeed = [
  {
    title: 'Big Jet Plane',
    artist: 'Angus & Julia Stone',
    url: 'http://localhost:5000/music/track1.mp3',
    cover: 'http://localhost:5000/images/cover1.jpg',
    plays: 492487295,
    duration: 239,
  },
  {
    title: 'sdp interlude',
    artist: 'Travis Scott',
    url: 'http://localhost:5000/music/track2.mp3',
    cover: 'http://localhost:5000/images/cover2.jpg',
    plays: 567194683,
    duration: 191,
  },
  {
    title: 'FE!N',
    artist: 'Travis Scott & Playboi Carti',
    url: 'http://localhost:5000/music/track3.mp3',
    cover: 'http://localhost:5000/images/cover3.jpg',
    plays: 1417316229,
    duration: 191,
  },
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Подключились к MongoDB для загрузки данных...');
    await Track.deleteMany({});
    console.log('Старые треки удалены.');
    await Track.insertMany(tracksToSeed);
    console.log('Новые треки успешно добавлены!');
  } catch (error) {
    console.error('Ошибка при загрузке данных:', error);
  } finally {
    mongoose.connection.close();
  }
};

seedDatabase();  