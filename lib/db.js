import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

/**
 * On utilise 'global' pour maintenir la connexion lors du Hot Module Replacement (HMR) 
 * en mode développement.
 */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    // CORRECTION : On utilise directement 'cached.promise'
    // et non 'cached.mongoose.promise'
    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    // CORRECTION : On utilise 'cached.promise'
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null; // Reset en cas d'erreur
    throw e;
  }

  return cached.conn;
}

export default dbConnect;