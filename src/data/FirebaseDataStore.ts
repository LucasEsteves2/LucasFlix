import { IDataStore } from './IDataStore';
import { LucasflixData } from './models';
import { getSeedData } from './seed';

/**
 * Firebase implementation of IDataStore (STUB - NOT YET IMPLEMENTED)
 * 
 * TODO: Implement Firebase integration
 * 
 * Steps to implement:
 * 1. Install firebase: npm install firebase
 * 2. Import and initialize Firebase:
 *    import { initializeApp } from 'firebase/app';
 *    import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
 * 
 * 3. Initialize Firebase with your config:
 *    const firebaseConfig = { ... };
 *    const app = initializeApp(firebaseConfig);
 *    const db = getFirestore(app);
 * 
 * 4. In load(): Use getDoc(doc(db, 'lucasflix', 'data'))
 * 5. In save(): Use setDoc(doc(db, 'lucasflix', 'data'), data)
 * 6. Handle authentication if needed
 * 
 * The interface is identical to LocalStorageDataStore, so switching
 * implementations will be seamless in the app code.
 */
export class FirebaseDataStore implements IDataStore {
  // private db: Firestore; // Will be initialized in constructor
  
  constructor() {
    // TODO: Initialize Firebase here
    // this.db = getFirestore(app);
    throw new Error('FirebaseDataStore not yet implemented');
  }

  async load(): Promise<LucasflixData> {
    // TODO: Implement Firebase load
    // const docRef = doc(this.db, 'lucasflix', 'data');
    // const docSnap = await getDoc(docRef);
    // if (docSnap.exists()) {
    //   return docSnap.data() as LucasflixData;
    // } else {
    //   return this.resetToSeed();
    // }
    throw new Error('FirebaseDataStore not yet implemented');
  }

  async save(data: LucasflixData): Promise<void> {
    // TODO: Implement Firebase save
    // const docRef = doc(this.db, 'lucasflix', 'data');
    // await setDoc(docRef, data);
    throw new Error('FirebaseDataStore not yet implemented');
  }

  async resetToSeed(): Promise<LucasflixData> {
    const seed = getSeedData();
    await this.save(seed);
    return seed;
  }
}
