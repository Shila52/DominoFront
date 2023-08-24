import { initializeApp } from "firebase/app";

import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDxct_-uPjAI-Fl_5Bns1re_oFg8khR7rE",
  authDomain: "newone-e378f.firebaseapp.com",
  databaseURL: "https://newone-e378f-default-rtdb.firebaseio.com",
  projectId: "newone-e378f",
  storageBucket: "newone-e378f.appspot.com",
  messagingSenderId: "785873579144",
  appId: "1:785873579144:web:ac4f4313a938d2c361c33d",
  measurementId: "G-FHZS1L963L"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
export { auth, provider };
