// lib/dbConnect.ts
import mongoose, { Mongoose } from 'mongoose';

const MONGODB_URI: string = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

// 1. Définition du type pour l'objet cached global
interface Cached {
  conn: Mongoose | null;
  promise: Promise<Mongoose> | null;
}

// 2. Assurez-vous que global a la propriété mongoose, et la typer
// Ceci est nécessaire pour éviter les reconnexions en mode développement (HMR)
let cached = global as unknown as { mongoose: Cached };

if (!cached.mongoose) {
  cached.mongoose = { conn: null, promise: null };
}

async function dbConnect(): Promise<Mongoose> {
  if (cached.mongoose.conn) {
    return cached.mongoose.conn;
  }

  if (!cached.mongoose.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.mongoose.promise = mongoose.connect(MONGODB_URI, opts);
  }

  try {
    cached.mongoose.conn = await cached.mongoose.promise;
  } catch (e) {
    cached.mongoose.promise = null; // En cas d'échec
    throw e;
  }

  return cached.mongoose.conn;
}

export default dbConnect;