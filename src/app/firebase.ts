import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// TODO: Remplacez cette configuration par celle de votre projet Firebase Console
// Allez sur https://console.firebase.google.com/
const firebaseConfig = {
    apiKey: "AIzaSyAgpZKOv_OWD-jb18HkKLXnok0KPQYUgQ4",
    authDomain: "store-3eefc.firebaseapp.com",
    projectId: "store-3eefc",
    storageBucket: "store-3eefc.firebasestorage.app",
    messagingSenderId: "614332583910",
    appId: "1:614332583910:web:c056b66fb812de6e73d027"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
