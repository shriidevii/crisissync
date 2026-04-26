import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyDWtFIHyM1bYVroa3UuQ-l7zf95atrRRAs",
  authDomain: "crisissync-4ebc9.firebaseapp.com",
  databaseURL: "https://crisissync-4ebc9-default-rtdb.firebaseio.com/",
  projectId: "crisissync-4ebc9",
  storageBucket: "crisissync-4ebc9.firebasestorage.app",
  messagingSenderId: "358842657335",
  appId: "1:358842657335:web:c75278c524be8eb2cc6db2"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);