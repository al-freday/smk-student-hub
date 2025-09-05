
// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getDatabase, connectDatabaseEmulator, Database } from "firebase/database";
import { getAuth, signInAnonymously, onAuthStateChanged, signOut as firebaseSignOut, User, Auth } from "firebase/auth";

// Your web app's Firebase configuration is automatically provided by the system.
// Do not manually edit this object.
const firebaseConfig = {
  apiKey: "API_KEY",
  authDomain: "PROJECT_ID.firebaseapp.com",
  projectId: "PROJECT_ID",
  storageBucket: "PROJECT_ID.appspot.com",
  messagingSenderId: "SENDER_ID",
  appId: "APP_ID",
  measurementId: "G-MEASUREMENT_ID",
  databaseURL: "https://PROJECT_ID.firebaseio.com"
};


// Initialize Firebase for client side
let app: FirebaseApp;
let auth: Auth;
let db: Database;

if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

auth = getAuth(app);
db = getDatabase(app);


// Check if we are in a local development environment and connect to the emulator if needed.
if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname.includes('cloudworkstations.dev'))) {
    try {
        // @ts-ignore - A simple check to prevent multiple connections in HMR environments
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

let firebaseUser: User | null = null;
let authReadyPromise: Promise<User | null>;

let resolveAuthReady: (user: User | null) => void;
authReadyPromise = new Promise(resolve => {
    resolveAuthReady = resolve;
});

onAuthStateChanged(auth, user => {
    firebaseUser = user;
    resolveAuthReady(user);
});

export const signInToFirebase = async () => {
    if (firebaseUser) {
        return firebaseUser;
    }
    try {
        const userCredential = await signInAnonymously(auth);
        return userCredential.user;
    } catch (error) {
        console.error("Firebase anonymous sign-in failed:", error);
        throw error;
    }
};

export const signOutFromFirebase = async () => {
    try {
        await firebaseSignOut(auth);
        firebaseUser = null;
        // Reset the promise for the next login
        authReadyPromise = new Promise(resolve => {
            resolveAuthReady = resolve;
        });
    } catch (error) {
        console.error("Firebase sign-out failed:", error);
    }
};

export { app, db, auth };
