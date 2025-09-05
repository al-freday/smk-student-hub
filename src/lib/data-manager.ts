
"use client";

import { db } from './firebase';
import { ref, get, set } from "firebase/database";

const isServer = typeof window === 'undefined';

/**
 * Retrieves a node from Firebase Realtime Database.
 * If the node doesn't exist, it initializes it with a default value.
 * @param key The key (path) to retrieve.
 * @param defaultValue The value to return and save if the node doesn't exist.
 * @returns The retrieved data or the default value.
 */
export const getSourceData = async (key: string, defaultValue: any): Promise<any> => {
  if (isServer) return defaultValue;
  try {
    const dataRef = ref(db, key);
    const snapshot = await get(dataRef);
    if (snapshot.exists()) {
      return snapshot.val();
    } else {
      // Data doesn't exist, initialize it with the default value
      await set(dataRef, defaultValue);
      return defaultValue;
    }
  } catch (error) {
    console.error(`Error retrieving data for key "${key}" from Realtime Database:`, error);
    // Fallback to localStorage if DB fails
    try {
        const localData = localStorage.getItem(key);
        return localData ? JSON.parse(localData) : defaultValue;
    } catch (localError) {
        return defaultValue;
    }
  }
};

/**
 * Updates or creates a node in Firebase Realtime Database.
 * @param key The key (path) for the data.
 * @param data The data object to be saved.
 */
export const updateSourceData = async (key: string, data: any): Promise<void> => {
  if (isServer) return;
  try {
    const dataRef = ref(db, key);
    await set(dataRef, data);
    // Dispatch a custom event to notify other components of the data change
    window.dispatchEvent(new CustomEvent('dataUpdated', { detail: { key } }));
  } catch (error) {
    console.error(`Failed to save data to Realtime Database for key "${key}":`, error);
     try {
        localStorage.setItem(key, JSON.stringify(data));
        window.dispatchEvent(new CustomEvent('dataUpdated', { detail: { key } }));
    } catch (localError) {
        console.error(`Failed to save data to localStorage for key "${key}":`, localError);
    }
  }
};


// Legacy sync function for components that haven't been updated.
// This is not recommended for new code.
export const getSourceDataSync = (key: string, defaultValue: any): any => {
    if (isServer) return defaultValue;
    try {
        const localData = localStorage.getItem(key);
        return localData ? JSON.parse(localData) : defaultValue;
    } catch (e) {
        return defaultValue;
    }
}
