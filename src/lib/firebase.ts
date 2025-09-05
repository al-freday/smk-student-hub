
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

const initializeAuth = () => {
  authReadyPromise = new Promise(resolve => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      if (user) {
        resolve(user);
        unsubscribe();
      } else {
        // If not signed in, attempt anonymous sign-in
        signInAnonymously(auth).then(userCredential => {
          resolve(userCredential.user);
          unsubscribe();
        }).catch(error => {
          console.error("Firebase anonymous sign-in failed:", error);
          resolve(null); // Resolve with null on failure
          unsubscribe();
        });
      }
    });
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
