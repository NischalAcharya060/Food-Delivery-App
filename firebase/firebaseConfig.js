import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyB5vnZ33RJoy-rvqxx3JK-6x3v7vtcG_xc",
    authDomain: "food-delivery-app-33880.firebaseapp.com",
    projectId: "food-delivery-app-33880",
    storageBucket: "food-delivery-app-33880.appspot.com",
    messagingSenderId: "1038242660858",
    appId: "1:1038242660858:web:00231a932cf7479950e443"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
