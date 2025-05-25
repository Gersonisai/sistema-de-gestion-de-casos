
// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics"; // Included as per user's provided config

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDR62eEABEZ0U36W1FCQXR0fbUklQR6u7k",
  authDomain: "yasi-k-ari.firebaseapp.com",
  projectId: "yasi-k-ari",
  storageBucket: "yasi-k-ari.firebasestorage.app", // Using .firebasestorage.app as provided
  messagingSenderId: "620029138709",
  appId: "1:620029138709:web:7f20737faaee1e1ba3bb1c",
  measurementId: "G-4EEQWQLZYR"
};

// Initialize Firebase
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

const auth = getAuth(app);
// const analytics = getAnalytics(app); // You can uncomment this if you plan to use Firebase Analytics

export { app, auth };
