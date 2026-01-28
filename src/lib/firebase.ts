import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDTg49NXgrXaAztlA_9i8ue1bve_DJ6KiY",
  authDomain: "agroguard-ai-e47e0.firebaseapp.com",
  projectId: "agroguard-ai-e47e0",
  storageBucket: "agroguard-ai-e47e0.firebasestorage.app",
  messagingSenderId: "268426361905",
  appId: "1:268426361905:web:e65272099e4a5cb0e0a910"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

// Configure auth settings for better stability
auth.settings = {
  appVerificationDisabledForTesting: false
};

// Add connection timeout and retry logic
const originalFetch = window.fetch;
window.fetch = async (...args) => {
  try {
    return await originalFetch(...args);
  } catch (error) {
    console.warn('Network request failed, retrying...', error);
    // Retry once after a short delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    return await originalFetch(...args);
  }
};

export default app;
