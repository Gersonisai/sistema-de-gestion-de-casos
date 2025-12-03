import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// import { getAnalytics } from "firebase/analytics"; 

const firebaseConfig = {
  apiKey: "AIzaSyDR62eEABEZ0U36W1FCQXR0fbUklQR6u7k",
  authDomain: "yasi-k-ari.firebaseapp.com",
  projectId: "yasi-k-ari",
  storageBucket: "yasi-k-ari.appspot.com",
  messagingSenderId: "620029138709",
  appId: "1:620029138709:web:7f20737faaee1e1ba3bb1c",
  measurementId: "G-4EEQWQLZYR"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
// const analytics = getAnalytics(app);

export { app, auth, db };
