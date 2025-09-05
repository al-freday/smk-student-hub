
// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getDatabase, connectDatabaseEmulator } from "firebase/database";
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
  databaseURL: "DATABASE_URL"
};

// Dynamically construct the databaseURL if it's a placeholder
if (firebaseConfig.databaseURL === "DATABASE_URL" && firebaseConfig.projectId) {
  firebaseConfig.databaseURL = `https://${firebaseConfig.projectId}.firebaseio.com`;
}


// Initialize Firebase for client side
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

// Check if we are in a local development environment and connect to the emulator if needed.
if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname.includes('cloudworkstations.dev'))) {
    try {
        // A simple check to prevent multiple connections in HMR environments
        // @ts-ignore
        if (!db.emulator) {
            console.log("Connecting to local Realtime Database emulator.");
            connectDatabaseEmulator(db, 'localhost', 9000);
            // @ts-ignore
            db.emulator = true;
        }
    } catch (error) {
        console.warn("Could not connect to Realtime Database emulator. It might already be connected.", error);
    }
}


export { app, db, auth };
