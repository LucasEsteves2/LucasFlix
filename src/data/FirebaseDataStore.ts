import { ref, set, get, onValue } from 'firebase/database';
import { database } from '../firebaseConfig';
import { IDataStore } from './IDataStore';
import { LucasflixData } from './models';
import { getSeedData } from './seed';

/**
 * Firebase Realtime Database implementation of IDataStore
 */
export class FirebaseDataStore implements IDataStore {
  private dataRef = ref(database, 'lucasflix');

  /**
   * Load data from Firebase Realtime Database
   */
  async load(): Promise<LucasflixData> {
    try {
      const snapshot = await get(this.dataRef);
      
      if (snapshot.exists()) {
        const data = snapshot.val() as LucasflixData;
        
        // Garantir que arrays existam
        return {
          version: data.version || 1,
          people: data.people || [],
          sessions: data.sessions || [],
          dailyMovies: data.dailyMovies || [],
          votes: data.votes || [],
          shameWall: data.shameWall || []
        };
      } else {
        // No data exists, initialize with seed data
        const seedData = getSeedData();
        await this.save(seedData);
        return seedData;
      }
    } catch (error) {
      console.error('Error loading data from Firebase:', error);
      // Fallback to seed data on error
      return getSeedData();
    }
  }

  /**
   * Save data to Firebase Realtime Database
   */
  async save(data: LucasflixData): Promise<void> {
    try {
      await set(this.dataRef, data);
      console.log('Data saved to Firebase successfully');
    } catch (error) {
      console.error('Error saving data to Firebase:', error);
      throw error;
    }
  }

  /**
   * Reset to seed data
   */
  async resetToSeed(): Promise<LucasflixData> {
    const seedData = getSeedData();
    await this.save(seedData);
    return seedData;
  }

  /**
   * Listen to real-time changes in Firebase
   */
  subscribe(callback: (data: LucasflixData) => void): () => void {
    const unsubscribe = onValue(this.dataRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val() as LucasflixData;
        callback(data);
      }
    });

    return unsubscribe;
  }
}
