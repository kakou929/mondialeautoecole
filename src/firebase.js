import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey:  "AIzaSyAfXmDpDYFRlD17VLJ5W3Jb29K4Y6TFpgI",
  authDomain: "mondiale-auto-ecole-31ee7.firebaseapp.com",
  projectId: "mondiale-auto-ecole-31ee7",
  storageBucket: "mondiale-auto-ecole-31ee7.firebasestorage.app",
  messagingSenderId: "869202212505",
  appId: "1:869202212505:web:8bc2e4bc96c72ecf71"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);



