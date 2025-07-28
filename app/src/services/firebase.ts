import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { getAnalytics, Analytics, isSupported } from 'firebase/analytics';

// Your real Firebase configuration (replace with your actual config or use env vars)
const firebaseConfig = {
  apiKey: "AIzaSyC0ydQKuK9Y-oUhYrdE6LfzBgdq2EmQcTE",
  authDomain: "scanemon-16c6c.firebaseapp.com",
  projectId: "scanemon-16c6c",
  storageBucket: "scanemon-16c6c.appspot.com",
  messagingSenderId: "791340223853",
  appId: "1:791340223853:web:97426604a4410d377f5e64",
  measurementId: "G-CJBB77XS7J"
};

const app: FirebaseApp = initializeApp(firebaseConfig);
const auth: Auth = getAuth(app);
const db: Firestore = getFirestore(app);
const storage: FirebaseStorage = getStorage(app);

// Analytics is only available in browser environments
let analytics: Analytics | undefined = undefined;
if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}

export { auth, db, storage, analytics };
export default app; 