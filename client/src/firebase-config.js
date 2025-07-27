import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from "firebase/storage"; 

const firebaseConfig = {
  apiKey: "AIzaSyB6S8O4-JptT-joDl21tjqhOYn8uLQ543U",
  authDomain: "my-app-d8e02.firebaseapp.com",
  projectId: "my-app-d8e02",
  storageBucket: "my-app-d8e02.firebasestorage.app",
  messagingSenderId: "596473812476",
  appId: "1:596473812476:web:3e863cc4f98560f1810e79",
  measurementId: "G-2G7V2MR65X"
};
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app); 
