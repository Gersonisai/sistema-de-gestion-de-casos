
// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// import { getFirestore } from "firebase/firestore"; // Uncomment if you use Firestore
// import { getAnalytics } from "firebase/analytics"; // Uncomment if you use Analytics

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBYHFVE8ct-qBnuBOWt250AP1pjTTqzMM4",
  authDomain: "apps-d34b2.firebaseapp.com",
  projectId: "apps-d34b2",
  storageBucket: "apps-d34b2.firebasestorage.app",
  messagingSenderId: "710137090898",
  appId: "1:710137090898:web:79ab38775b991db65fe08b",
  measurementId: "G-RFPL8PW0L1"
};

// Initialize Firebase
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

const auth = getAuth(app);
// const firestore = getFirestore(app); // Example if using Firestore
// const analytics = getAnalytics(app); // Example if using Analytics

export { app, auth };
