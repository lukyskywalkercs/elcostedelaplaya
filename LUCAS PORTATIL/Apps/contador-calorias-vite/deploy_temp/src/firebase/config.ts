import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBjGQU_66J8yS_QK6Wz_PgTqbQKtxXBSyE",
  authDomain: "contador-calorias-app.firebaseapp.com",
  projectId: "contador-calorias-app",
  storageBucket: "contador-calorias-app.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdef123456"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app); 