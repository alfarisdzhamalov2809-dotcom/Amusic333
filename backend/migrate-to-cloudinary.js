const fs = require('fs').promises;
const path = require('path');
const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
require('dotenv').config();

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://music_app_user:alfasmusicplayer@ac-vycfqo8-shard-00-00.njkfdlw.mongodb.net:27017,ac-vycfqo8-shard-00-01.njkfdlw.mongodb.net:27017,ac-vycfqo8-shard-00-02.njkfdlw.mongodb.net:27017/?ssl=true&replicaSet=atlas-kd4kzf-shard-0&authSource=admin&appName=music';
const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || 'ditexyjne';
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY || '471584287953543';
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET || 'pDSUa1VNBcFmu-nd23LfuQ8pbpU';

cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
});

const musicDir = path.join(__dirname, 'public', 'music');
const imageDir = path.join(__dirname, 'public', 'images');

const trackSchema = new mongoose.Schema({
  title: String,
  artist: String,
  url: String,
  cover: String,
  plays: Number,
  duration: Number,
});

const Track = mongoose.model('Track', trackSchema);

const isCloudinaryUrl = (value) => typeof value === 'string' && /cloudinary\.com/.test(value);

const extractLocalName = (value) => {
  if (!value || typeof value !== 'string') return null;

  try {
    const url = new URL(value);
    return path.basename(url.pathname);
  } catch {
    if (value.includes('/')) {
      return path.basename(value);
    }
    return value;
  }
};

const fileExists = async (filePath) => {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
};

const uploadToCloudinary = async (localPath, folder, resourceType, publicId) => {
  const fileName = path.basename(localPath);
  console.log(`  → Uploading ${fileName} to Cloudinary folder=${folder} resource_type=${resourceType}`);
  const result = await cloudinary.uploader.upload(localPath, {
    folder,
    resource_type: resourceType,
    public_id: publicId,
    overwrite: true,
  });
  return result;
};

const normalizeLocalPath = (localName, type) => {
  if (!localName) return null;
  if (type === 'audio') {
    return path.join(musicDir, localName);
  }
  return path.join(imageDir, localName);
};

const getResourceType = (type) => (type === 'audio' ? 'video' : 'image');

async function migrate() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('✅ Connected to MongoDB');

    const tracks = await Track.find({
      $or: [
        { url: { $not: /cloudinary\.com/ } },
        { cover: { $not: /cloudinary\.com/ } },
      ],
    });

    if (!tracks.length) {
      console.log('✅ No tracks found that require Cloudinary migration.');
      process.exit(0);
    }

    console.log(`Found ${tracks.length} tracks to migrate.`);

    let migratedCount = 0;
    const updates = [];

    for (const track of tracks) {
      const update = {};
      console.log(`\nTrack: ${track.title || track._id}`);

      if (!isCloudinaryUrl(track.url)) {
        const localName = extractLocalName(track.url);
        const localPath = normalizeLocalPath(localName, 'audio');
        if (await fileExists(localPath)) {
          const publicId = `music/${path.parse(localName).name}-${track._id}`;
          const result = await uploadToCloudinary(localPath, 'music', getResourceType('audio'), publicId);
          update.url = result.secure_url;
        } else {
          console.warn(`  ⚠️ Audio file not found locally: ${localPath}`);
        }
      }

      if (track.cover && !isCloudinaryUrl(track.cover)) {
        const localName = extractLocalName(track.cover);
        const localPath = normalizeLocalPath(localName, 'image');
        if (await fileExists(localPath)) {
          const publicId = `images/${path.parse(localName).name}-${track._id}`;
          const result = await uploadToCloudinary(localPath, 'images', getResourceType('image'), publicId);
          update.cover = result.secure_url;
        } else {
          console.warn(`  ⚠️ Cover file not found locally: ${localPath}`);
        }
      }

      if (Object.keys(update).length > 0) {
        await Track.updateOne({ _id: track._id }, { $set: update });
        migratedCount += 1;
        console.log('  ✅ Updated MongoDB document with Cloudinary URLs.');
      } else {
        console.log('  ℹ️ Skipped: already using Cloudinary URLs or no local files available.');
      }
    }

    console.log(`\nMigration finished. Documents updated: ${migratedCount}/${tracks.length}`);
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrate();
