/**
 * Firebase Configuration
 * SOLO se importa desde services/api.js
 * NUNCA importar directamente en componentes
 *
 * Para produccion: reemplazar con variables de entorno reales
 * process.env.NEXT_PUBLIC_FIREBASE_API_KEY, etc.
 */

import { initializeApp } from "firebase/app"
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDemoKey123456789",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "info-vet-demo.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "info-vet-demo",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "info-vet-demo.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123456789:web:abcdef123456",
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)

setPersistence(auth, browserLocalPersistence)
  .catch((error) => console.error("Error setting persistence:", error))

export default app
