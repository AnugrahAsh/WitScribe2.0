import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAPgqReM18w0DBjqllij8tZXtP0HNDKj_M",
  authDomain: "witscribe-6670b.firebaseapp.com",
  projectId: "witscribe-6670b",
  storageBucket: "witscribe-6670b.firebasestorage.app",
  messagingSenderId: "168231352000",
  appId: "1:168231352000:web:be648089a2050bdfd7df25",
  measurementId: "G-SZ840J1DL2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const analytics = getAnalytics(app);
export const db = getFirestore(app);
export default app; 