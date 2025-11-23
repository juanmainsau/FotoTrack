// firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDxnL1WCmWk9tEaG66TO6Q4KN344yc5YTY",
  authDomain: "fototrack-5cdb5.firebaseapp.com",
  projectId: "fototrack-5cdb5",
  storageBucket: "fototrack-5cdb5.firebasestorage.app",
  messagingSenderId: "675748773228",
  appId: "1:675748773228:web:86fec94089146b71f08749"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
