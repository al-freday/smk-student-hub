
"use client";

import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getDatabase, Database } from "firebase/database";
import { getAuth, signInAnonymously, onAuthStateChanged, signOut as firebaseSignOut, User, Auth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "API_KEY",
  authDomain: "PROJECT_ID.firebaseapp.com",
  projectId: "PROJECT_ID",
  storageBucket: "PROJECT_ID.appspot.com",
  messagingSenderId: "SENDER_ID",
  appId: "APP_ID",
  databaseURL: "https://PROJECT_ID.firebaseio.com"
};

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

let authReadyPromise: Promise<User | null> | null = null;

const initializeAuth = (): Promise<User | null> => {
  if (authReadyPromise) {
    return authReadyPromise;
  }

  authReadyPromise = new Promise((resolve, reject) => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        resolve(user);
      } else {
        signInAnonymously(auth)
          .then((userCredential) => {
            resolve(userCredential.user);
          })
          .catch(error => {
            console.error("Firebase anonymous sign-in failed:", error);
            reject(error);
          });
      }
    }, (error) => {
      console.error("Auth state change error:", error);
      reject(error);
    });
  });

  return authReadyPromise;
};

export const ensureAuthenticated = (): Promise<User | null> => {
  return initializeAuth();
};

export const signOutFromFirebase = async () => {
    try {
        await firebaseSignOut(auth);
        authReadyPromise = null; // Reset promise so it can be re-initialized on next login
    } catch (error) {
        console.error("Firebase sign-out failed:", error);
    }
};

export { app, db, auth };
