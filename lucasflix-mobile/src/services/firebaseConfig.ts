import { initializeApp, getApps } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyDummy", // Você deve adicionar suas credenciais reais
  authDomain: "lucasflix.firebaseapp.com",
  databaseURL: 'https://lucasflix-default-rtdb.firebaseio.com/',
  projectId: "lucasflix",
  storageBucket: "lucasflix.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};

// Initialize Firebase only if not already initialized
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize Realtime Database and get a reference to the service
export const database = getDatabase(app);
