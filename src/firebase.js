// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase } from "firebase/database";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyBVhOanqAHb2nvL6sTM_UoBkCMqDffvdxQ",
    authDomain: "bit-buddy-f6a64.firebaseapp.com",
    databaseURL: "https://bit-buddy-f6a64-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "bit-buddy-f6a64",
    storageBucket: "bit-buddy-f6a64.firebasestorage.app",
    messagingSenderId: "363918521619",
    appId: "1:363918521619:web:52e511d1ca708c6fa996e6",
    measurementId: "G-CZG92P861D"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const db = getDatabase(app);