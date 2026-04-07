import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyApe8Vimbj2gMEmdQyPfvYiJh3kIJ-IAPg",
  authDomain: "dying-orchestra.firebaseapp.com",
  projectId: "dying-orchestra",
  storageBucket: "dying-orchestra.firebasestorage.app",
  messagingSenderId: "711769651624",
  appId: "1:711769651624:web:7fc9aeda2db15ba45c459d",
  measurementId: "G-M12B5RBPJM",
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const storage = getStorage(app);
