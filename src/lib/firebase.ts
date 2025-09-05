// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
// IMPORTANT: DO NOT MODIFY THIS OBJECT, IT IS POPULATED BY THE SYSTEM
const firebaseConfig = {
  apiKey: "API_KEY",
  authDomain: "AUTH_DOMAIN",
  projectId: "PROJECT_ID",
  storageBucket: "STORAGE_BUCKET",
  messagingSenderId: "MESSAGING_SENDER_ID",
  appId: "APP_ID",
};

// Initialize Firebase for client side
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// --- START OF FIX ---
// In a development environment like this, we connect to a local emulator.
// This bypasses the need for server-side security rules for now.
if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    try {
        connectFirestoreEmulator(db, 'localhost', 8080);
        console.log("Connected to local Firestore emulator.");
    } catch (error) {
        console.warn("Could not connect to Firestore emulator. It might already be connected.", error);
    }
} else {
    // For the deployed preview environment, we'll point to the hosted emulator proxy
     try {
        const host = process.env.NEXT_PUBLIC_FIRESTORE_EMULATOR_HOST || '127.0.0.1';
        const port = process.env.NEXT_PUBLIC_FIRESTORE_EMULATOR_PORT ? parseInt(process.env.NEXT_PUBLIC_FIRESTORE_EMULATOR_PORT, 10) : 8080;
        
        // This check prevents re-connecting on hot reloads
        // @ts-ignore
        if (!db._settings.host.includes('localhost') && !db._settings.host.includes('127.0.0.1')) {
           console.log(`Connecting to Firestore emulator at ${host}:${port}`);
           connectFirestoreEmulator(db, host, port);
        }
    } catch (error) {
        console.warn("Could not connect to hosted Firestore emulator.", error);
    }
}
// --- END OF FIX ---


export { app, db, auth };
