
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

let authReadyPromise: Promise<User | null>;
let resolveAuthReady: (user: User | null) => void;

const initializeAuthPromise = () => {
  authReadyPromise = new Promise(resolve => {
    resolveAuthReady = resolve;
  });
};

initializeAuthPromise(); // Initialize for the first time

onAuthStateChanged(auth, user => {
    firebaseUser = user;
    if (resolveAuthReady) {
        resolveAuthReady(user);
    }
});

export const signInToFirebase = async () => {
    if (firebaseUser) {
        return firebaseUser;
    }

    const user = await authReadyPromise;
    if (user) {
        return user;
    }

    try {
        const userCredential = await signInAnonymously(auth);
        firebaseUser = userCredential.user;
        return firebaseUser;
    } catch (error) {
        console.error("Firebase anonymous sign-in failed:", error);
        initializeAuthPromise(); // Reset promise on failure
        throw error;
    }
};

export const signOutFromFirebase = async () => {
    try {
        await firebaseSignOut(auth);
        firebaseUser = null;
        initializeAuthPromise(); // Reset promise for the next login
    } catch (error) {
        console.error("Firebase sign-out failed:", error);
    }
};

export { app, db, auth };
