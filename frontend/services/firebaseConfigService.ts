import { initializeApp, FirebaseApp, getApps, deleteApp } from 'firebase/app';
import { getDatabase, Database } from 'firebase/database';

interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  databaseURL: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  sendDurationInSeconds?: string;
}

interface FirebaseConfigResponse {
  status: string;
  data: {
    firebaseConfig: FirebaseConfig;
  };
}

let cachedApp: FirebaseApp | null = null;
let cachedDatabase: Database | null = null;
let cachedConfig: FirebaseConfig | null = null;

export const fetchAndInitializeFirebase = async (
  token: string
): Promise<{ app: FirebaseApp; database: Database; config: FirebaseConfig }> => {
  try {
    // If already initialized with same config, return cached instances
    if (cachedApp && cachedDatabase && cachedConfig) {
      console.log('✅ Using cached Firebase instance');
      return { app: cachedApp, database: cachedDatabase, config: cachedConfig };
    }

    console.log('🔥 Fetching Firebase config from API...');
    
    const response = await fetch(
      'https://api.bahirandelivery.cloud/api/v1/config/getFirebaseConfig',
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch Firebase config: ${response.status}`);
    }

    const data: FirebaseConfigResponse = await response.json();
    const firebaseConfig = data.data.firebaseConfig;

    console.log('✅ Firebase config fetched successfully');
    console.log(`🕒 Location update interval: ${firebaseConfig.sendDurationInSeconds || 3} seconds`);

    // Delete existing Firebase apps if any
    const existingApps = getApps();
    if (existingApps.length > 0) {
      console.log('🔄 Removing existing Firebase instances...');
      await Promise.all(existingApps.map(app => deleteApp(app)));
    }

    // Initialize Firebase with the fetched config
    const app = initializeApp({
      apiKey: firebaseConfig.apiKey,
      authDomain: firebaseConfig.authDomain,
      databaseURL: firebaseConfig.databaseURL,
      projectId: firebaseConfig.projectId,
      storageBucket: firebaseConfig.storageBucket,
      messagingSenderId: firebaseConfig.messagingSenderId,
      appId: firebaseConfig.appId,
    });

    const database = getDatabase(app);

    // Cache the instances
    cachedApp = app;
    cachedDatabase = database;
    cachedConfig = firebaseConfig;

    console.log('✅ Firebase initialized successfully with dynamic config');

    return { app, database, config: firebaseConfig };
  } catch (error) {
    console.error('❌ Error fetching/initializing Firebase:', error);
    throw error;
  }
};

// Clear cache (useful for logout or config refresh)
export const clearFirebaseCache = async () => {
  if (cachedApp) {
    await deleteApp(cachedApp);
  }
  cachedApp = null;
  cachedDatabase = null;
  cachedConfig = null;
  console.log('🧹 Firebase cache cleared');
};

export const getCachedConfig = () => cachedConfig;

