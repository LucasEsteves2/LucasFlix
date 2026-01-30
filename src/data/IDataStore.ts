import { LucasflixData } from './models';

/**
 * Interface for data storage implementations.
 * This allows easy switching between LocalStorage and Firebase.
 */
export interface IDataStore {
  /**
   * Load all data from storage
   */
  load(): Promise<LucasflixData>;

  /**
   * Save all data to storage
   */
  save(data: LucasflixData): Promise<void>;

  /**
   * Reset to seed data
   */
  resetToSeed(): Promise<LucasflixData>;
}
