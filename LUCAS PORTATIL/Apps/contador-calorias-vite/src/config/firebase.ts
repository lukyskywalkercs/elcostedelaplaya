import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  // Aquí necesitarías añadir tu configuración de Firebase
  apiKey: "TU_API_KEY",
  authDomain: "tu-app.firebaseapp.com",
  projectId: "tu-app",
  storageBucket: "tu-app.appspot.com",
  messagingSenderId: "tu-id",
  appId: "tu-app-id"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app); 