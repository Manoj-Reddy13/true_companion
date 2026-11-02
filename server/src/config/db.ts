import mongoose from 'mongoose';
import { setMongoConnected, initLocalStore } from '../services/dataService.js';

export async function connectDB(): Promise<void> {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/true_companion';

  initLocalStore();

  try {
    console.log(`[Database] Attempting connection to MongoDB at: ${uri.replace(/\/\/[^@]*@/, '//***:***@')}`);
    
    // Connect with a 2.5 second timeout so startup is fast if local MongoDB isn't running
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2500,
    });

    setMongoConnected(true);
    console.log('✅ [Database] MongoDB successfully connected!');
  } catch (err: any) {
    setMongoConnected(false);
    console.warn('⚠️ [Database] Could not connect to MongoDB server:', err.message);
    console.log('ℹ️ [Database] Running in High-Reliability Standalone / Fallback Storage mode.');
    console.log('ℹ️ [Database] All data is safely stored in ./data/store.json.');
    console.log('ℹ️ [Database] To connect to MongoDB Atlas, set MONGODB_URI in server/.env');
  }
}
