
"use client";

import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getDatabase, Database } from "firebase/database";
import { getAuth, signInAnonymously, onAuthStateChanged, User, Auth } from "firebase/auth";

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
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        unsubscribe();
        resolve(user);
      } else {
        signInAnonymously(auth)
          .then((userCredential) => {
             // User is signed in, we don't need to resolve here as the listener will trigger again
          })
          .catch(error => {
            console.error("Firebase anonymous sign-in failed:", error);
            unsubscribe();
            reject(error);
          });
      }
    }, (error) => {
      console.error("Auth state change error:", error);
      unsubscribe();
      reject(error);
    });
  });

  return authReadyPromise;
};

export const ensureAuthenticated = (): Promise<User | null> => {
  return initializeAuth();
};

export { app, db, auth };
