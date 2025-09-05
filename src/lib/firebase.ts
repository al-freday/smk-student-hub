
// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getDatabase, Database } from "firebase/database";
import { getAuth, signInAnonymously, onAuthStateChanged, signOut as firebaseSignOut, User, Auth } from "firebase/auth";

// Your web app's Firebase configuration is automatically provided by the system.
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
  databaseURL: "https://YOUR_PROJECT_ID.firebaseio.com",
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
    // Wait for initial auth state to be resolved
    await authReadyPromise;
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

// Ensure auth is ready before exporting db
export const getDb = async () => {
    await authReadyPromise;
    return db;
}

export { app, db, auth };
