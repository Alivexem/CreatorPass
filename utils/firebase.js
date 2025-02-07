// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase, ref, push, onValue, query, orderByChild } from "firebase/database";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDghwsidPVclsmZ6hEPjGTvNyREjiGsx3c",
  authDomain: "creatorpass-494da.firebaseapp.com",
  projectId: "creatorpass-494da",
  databaseURL: "https://creatorpass-494da-default-rtdb.firebaseio.com/",
  storageBucket: "creatorpass-494da.firebasestorage.app",
  messagingSenderId: "513657654858",
  appId: "1:513657654858:web:7b51e0706ae1cff51e60b3",
  measurementId: "G-X3255RB5DW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export { database, ref, push, onValue, query, orderByChild, app };