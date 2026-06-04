const mongoose = require('mongoose');

const MONGO_URI = 'mongodb://music_app_user:alfasmusicplayer@ac-vycfqo8-shard-00-00.njkfdlw.mongodb.net:27017,ac-vycfqo8-shard-00-01.njkfdlw.mongodb.net:27017,ac-vycfqo8-shard-00-02.njkfdlw.mongodb.net:27017/?ssl=true&replicaSet=atlas-kd4kzf-shard-0&authSource=admin&appName=music';

const trackSchema = new mongoose.Schema({
  title: String,
  artist: String,
  url: String,
  cover: String,
  plays: Number,
  duration: Number,
});

const Track = mongoose.model('Track', trackSchema);

async function updateUrls() {
  try {
    console.log('Подключение к MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Успешное подключение к MongoDB\n');

    console.log('Поиск треков с localhost:5000...');
    const oldTracks = await Track.find({ 
      $or: [
        { url: { $regex: 'localhost:5000' } },
        { cover: { $regex: 'localhost:5000' } }
      ]
    });

    console.log(`Найдено ${oldTracks.length} треков для обновления\n`);

    if (oldTracks.length > 0) {
      console.log('Примеры старых URL:');
      oldTracks.slice(0, 3).forEach(track => {
        console.log(`  - Трек: "${track.title}"`);
        if (track.url.includes('localhost:5000')) {
          console.log(`    URL: ${track.url}`);
        }
        if (track.cover && track.cover.includes('localhost:5000')) {
          console.log(`    Cover: ${track.cover}`);
        }
      });
      console.log('');

      console.log('Выполняю замену localhost:5000 → https://amusic333-production.up.railway.app...\n');
      
      const result = await Track.updateMany(
        { 
          $or: [
            { url: { $regex: 'localhost:5000' } },
            { cover: { $regex: 'localhost:5000' } }
          ]
        },
        [
          {
            $set: {
              url: {
                $replaceAll: {
                  input: "$url",
                  find: "http://localhost:5000",
                  replacement: "https://amusic333-production.up.railway.app"
                }
              },
              cover: {
                $replaceAll: {
                  input: "$cover",
                  find: "http://localhost:5000",
                  replacement: "https://amusic333-production.up.railway.app"
                }
              }
            }
          }
        ]
      );

      console.log('📊 Результаты обновления:');
      console.log(`  ✅ Обновлено документов: ${result.modifiedCount}`);
      console.log(`  📌 Найдено документов: ${result.matchedCount}`);
      console.log(`  📝 Подтверждено: ${result.acknowledged ? 'да' : 'нет'}\n`);

      console.log('Проверка обновленных треков:');
      const updatedTracks = await Track.find({ 
        $or: [
          { url: { $regex: 'railway.app' } },
          { cover: { $regex: 'railway.app' } }
        ]
      }).limit(3);

      updatedTracks.forEach(track => {
        console.log(`  ✅ Трек: "${track.title}"`);
        if (track.url.includes('railway.app')) {
          console.log(`     URL: ${track.url}`);
        }
        if (track.cover && track.cover.includes('railway.app')) {
          console.log(`     Cover: ${track.cover}`);
        }
      });
    } else {
      console.log('⚠️  Треков с localhost:5000 не найдено');
    }

    await mongoose.connection.close();
    console.log('\n✅ Отключение от MongoDB завершено');
    process.exit(0);
  } catch (error) {
    console.error('❌ Ошибка:', error);
    process.exit(1);
  }
}

updateUrls();
