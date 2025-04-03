import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

// Your Firebase configuration (already provided)
const firebaseConfig = {
  apiKey: "AIzaSyDXicpJUF4B7pogGQ7ATTNFJRDwXwWJyjk",
  authDomain: "referee-sports-3a40c.firebaseapp.com",
  databaseURL: "https://referee-sports-3a40c-default-rtdb.firebaseio.com",
  projectId: "referee-sports-3a40c",
  storageBucket: "referee-sports-3a40c.appspot.com",
  messagingSenderId: "300220435345",
  appId: "1:300220435345:web:f27ca60c9fe08017eae830",
  measurementId: "G-EXNK5HWSJ9"
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Realtime Database
const db = getDatabase(app);

export { db };
