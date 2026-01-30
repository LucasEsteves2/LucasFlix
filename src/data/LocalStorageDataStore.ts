import { IDataStore } from './IDataStore';
import { LucasflixData } from './models';
import { getSeedData } from './seed';

const STORAGE_KEY = 'lucasflix_data';

/**
 * LocalStorage implementation of IDataStore
 * This is the current MVP implementation
 */
export class LocalStorageDataStore implements IDataStore {
  async load(): Promise<LucasflixData> {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      
      if (!stored) {
        // First time - load seed data
        const seed = getSeedData();
        await this.save(seed);
        return seed;
      }
      
      const data = JSON.parse(stored) as LucasflixData;
      
      // Validate basic structure
      if (!data.version || !data.people || !Array.isArray(data.people)) {
        console.warn('Invalid data structure, resetting to seed');
        return this.resetToSeed();
      }
      
      return data;
    } catch (error) {
      console.error('Error loading from LocalStorage:', error);
      return this.resetToSeed();
    }
  }

  async save(data: LucasflixData): Promise<void> {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving to LocalStorage:', error);
      throw error;
    }
  }

  async resetToSeed(): Promise<LucasflixData> {
    const seed = getSeedData();
    await this.save(seed);
    return seed;
  }
}
