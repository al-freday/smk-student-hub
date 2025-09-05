
"use client";

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

let authReadyPromise: Promise<User | null>;
let resolveAuthReady: (user: User | null) => void;

const initializeAuth = () => {
  authReadyPromise = new Promise(resolve => {
    resolveAuthReady = resolve;
  });

  onAuthStateChanged(auth, user => {
    if (user) {
      resolveAuthReady(user);
    } else {
      signInAnonymously(auth).catch(error => {
        console.error("Firebase anonymous sign-in failed:", error);
        resolveAuthReady(null);
      });
    }
  });
};

initializeAuth();

export const ensureAuthenticated = (): Promise<User | null> => {
  return authReadyPromise;
};


export const signOutFromFirebase = async () => {
    try {
        await firebaseSignOut(auth);
        // Re-initialize auth promise for next login sequence
        initializeAuth(); 
    } catch (error) {
        console.error("Firebase sign-out failed:", error);
    }
};

export { app, db, auth };
