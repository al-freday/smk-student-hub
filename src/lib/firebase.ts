
// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getDatabase, Database } from "firebase/database";
import { getAuth, signInAnonymously, onAuthStateChanged, signOut as firebaseSignOut, User, Auth } from "firebase/auth";

// Your web app's Firebase configuration is automatically provided by the system.
const firebaseConfig = {
  apiKey: "API_KEY",
  authDomain: "PROJECT_ID.firebaseapp.com",
  projectId: "PROJECT_ID",
  storageBucket: "PROJECT_ID.appspot.com",
  messagingSenderId: "SENDER_ID",
  appId: "APP_ID",
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

let firebaseUser: User | null = null;

let resolveAuthReady: (user: User | null) => void;
let authReadyPromise = new Promise<User | null>(resolve => {
    resolveAuthReady = resolve;
});

onAuthStateChanged(auth, user => {
    firebaseUser = user;
    if (resolveAuthReady) {
        resolveAuthReady(user);
    }
});

export const signInToFirebase = async () => {
    // If we're already signed in, return the user immediately.
    if (firebaseUser) {
        return firebaseUser;
    }

    // Wait for the initial auth state check to complete.
    const user = await authReadyPromise;
    if (user) {
        return user;
    }

    // If still no user, then proceed with anonymous sign-in.
    try {
        const userCredential = await signInAnonymously(auth);
        firebaseUser = userCredential.user;
        return firebaseUser;
    } catch (error) {
        console.error("Firebase anonymous sign-in failed:", error);
        // Reset the promise on failure to allow retries
        authReadyPromise = new Promise(resolve => {
            resolveAuthReady = resolve;
        });
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
