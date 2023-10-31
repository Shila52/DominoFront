import { initializeApp } from "firebase/app";

import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDyTBYa6vYwVMK_4ZbVrssScG_M648IHqw",
  authDomain: "aaass-45476.firebaseapp.com",
  databaseURL: "https://aaass-45476-default-rtdb.firebaseio.com",
  projectId: "aaass-45476",
  storageBucket: "aaass-45476.appspot.com",
  messagingSenderId: "247585851340",
  appId: "1:247585851340:web:b447992565ea9758fcff69",
  measurementId: "G-NFJ5TKJ995",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
auth.useDeviceLanguage();

const provider = new GoogleAuthProvider();
export { auth, provider };
