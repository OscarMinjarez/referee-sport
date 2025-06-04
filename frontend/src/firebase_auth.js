import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyASXMthAffvlp21nMDxsXlES-G9pLu3abE",
    authDomain: "referee-sport.firebaseapp.com",
    projectId: "referee-sport",
    storageBucket: "referee-sport.firebasestorage.app",
    messagingSenderId: "377183266180",
    appId: "1:377183266180:web:542a501fc4810359e9a9d1"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);