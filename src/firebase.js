import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAAPR5lCouek-o46yTWjw4JDp8kxeJy6mg",
    authDomain: "active-7719e.firebaseapp.com",
    projectId: "active-7719e",
    storageBucket: "active-7719e.firebasestorage.app",
    messagingSenderId: "1066670445604",
    appId: "1:1066670445604:web:2aad18364b17a112d0b4b1",
    measurementId: "G-E9M5YL076X"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);
