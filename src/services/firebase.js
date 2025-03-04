// src/services/firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Your web app's Firebase configuration
// Replace these values with your actual Firebase project config
const firebaseConfig = {
    apiKey: "AIzaSyALjXkZiFZ_Fy143N_dzdaUbyDCtabBr7Y",
    authDomain: "parentload-ba995.firebaseapp.com",
    projectId: "parentload-ba995",
    storageBucket: "parentload-ba995.firebasestorage.app",
    messagingSenderId: "363935868004",
    appId: "1:363935868004:web:8802abceeca81cc10deb71",
    measurementId: "G-7T846QZH0J"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth };