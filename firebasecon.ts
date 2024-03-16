// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDQ-K2yJbKmFr6i2_KW79t4x6gBhmGkR4w",
  authDomain: "pro-reactvotepokemon.firebaseapp.com",
  projectId: "pro-reactvotepokemon",
  storageBucket: "pro-reactvotepokemon.appspot.com",
  messagingSenderId: "591173169494",
  appId: "1:591173169494:web:867b71f5fea5f9a1bb26f7",
  measurementId: "G-XPS6K5KQ1X"
  
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const storage = getStorage(app)

