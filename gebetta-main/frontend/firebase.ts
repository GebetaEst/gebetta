import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBOR6P6mCqgH5nleU09l9iQEk2K9Nq9OeA",
  authDomain: "gebeta-9595d.firebaseapp.com",
  databaseURL: "https://gebeta-9595d-default-rtdb.firebaseio.com",
  projectId: "gebeta-9595d",
  storageBucket: "gebeta-9595d.firebasestorage.app",
  messagingSenderId: "403014276965",
  appId: "1:403014276965:android:aead282e171f1d260ff38c"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Realtime Database
export const database = getDatabase(app);

export default app;