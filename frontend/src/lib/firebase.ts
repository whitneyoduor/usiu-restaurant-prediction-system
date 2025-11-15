import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCjHIBhQgglTFzb3-Lh9_4PTY4FfPVL8pY",
  authDomain: "fdpsns-web-439a1.firebaseapp.com",
  projectId: "fdpsns-web-439a1",
  storageBucket: "fdpsns-web-439a1.firebasestorage.app",
  messagingSenderId: "312400290282",
  appId: "1:312400290282:web:f0a5013e5c41e3e4149293",
  measurementId: "G-F0F2DCKVLC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
