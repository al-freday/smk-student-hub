
"use client";

import { db } from './firebase';
import { ref, get, set, child, remove } from 'firebase/database';

const isServer = typeof window === 'undefined';

/**
 * Retrieves data from localStorage. Used for session-related info like user role.
 * @param key The key to retrieve from localStorage.
 * @param defaultValue The value to return if no data exists.
 * @returns The data from localStorage or the default value.
 */
export const getSourceData = (key: string, defaultValue: any): any => {
  if (isServer) {
    return defaultValue;
  }
  try {
    const localData = localStorage.getItem(key);
    if (localData === null) {
      return defaultValue;
    }
    return JSON.parse(localData);
  } catch (e) {
    console.error(`Failed to get/parse data for key "${key}" from localStorage.`, e);
    return defaultValue;
  }
};

/**
 * Updates data in localStorage and dispatches a local event for UI updates.
 * Used for session-related info.
 * @param key The key for the data.
 * @param data The data object to be saved locally.
 */
export const updateSourceData = (key: string, data: any): void => {
  if (isServer) {
    return;
  }
  try {
    const dataString = JSON.stringify(data);
    localStorage.setItem(key, dataString);
    window.dispatchEvent(new CustomEvent('dataUpdated', { detail: { key, value: data } }));
  } catch (error) {
    console.error(`Failed to save data to localStorage for key "${key}".`, error);
  }
};


// --- FIREBASE-CENTRIC FUNCTIONS ---

/**
 * Fetches a specific dataset directly from Firebase Realtime Database.
 * This is the primary function for loading application data.
 * @param path The path to the data in Firebase (e.g., 'teachersData').
 * @returns The data from Firebase, or null if it doesn't exist.
 */
export async function fetchDataFromFirebase(path: string) {
  try {
    const dbRef = ref(db);
    const snapshot = await get(child(dbRef, path));
    if (snapshot.exists()) {
      const data = snapshot.val();
      // Also cache the fetched data in localStorage for performance and offline access
      if (!isServer) {
        localStorage.setItem(path, JSON.stringify(data));
      }
      return data;
    } else {
      console.log(`No data available at path: ${path}`);
      if (!isServer) {
        localStorage.setItem(path, JSON.stringify(null));
      }
      return null;
    }
  } catch (error) {
    console.error(`Firebase Read Error for path "${path}":`, error);
    if (!isServer) {
      const cachedData = localStorage.getItem(path);
      if (cachedData) return JSON.parse(cachedData);
    }
    throw error;
  }
}

/**
 * Saves or updates a specific dataset in Firebase Realtime Database.
 * Also updates the local cache.
 * @param path The path to the data in Firebase (e.g., 'teachersData/wali_kelas').
 * @param data The data to save.
 */
export async function saveDataToFirebase(path: string, data: any) {
  try {
    const dbRef = ref(db, path);
    await set(dbRef, data);
    if (!isServer) {
      // Manually update the local cache for the root object if a sub-path is changed
      const rootPath = path.split('/')[0];
      const rootData = await fetchDataFromFirebase(rootPath);
      if (rootData) {
        updateSourceData(rootPath, rootData);
      } else {
         // If root data is complex, just update the specific path
         // This is a simplification; a more robust solution might merge data
         const existingData = getSourceData(rootPath, {});
         const pathParts = path.split('/');
         let current = existingData;
         for (let i = 1; i < pathParts.length - 1; i++) {
            current = current[pathParts[i]] = current[pathParts[i]] || {};
         }
         current[pathParts[pathParts.length-1]] = data;
         updateSourceData(rootPath, existingData);
      }
    }
  } catch (error) {
    console.error(`Firebase Write Error for path "${path}":`, error);
    throw error;
  }
}


/**
 * Removes data from a specific path in Firebase Realtime Database.
 * Also removes from local cache.
 * @param path The path to the data to remove.
 */
export async function removeDataFromFirebase(path: string) {
    try {
        const dbRef = ref(db, path);
        await remove(dbRef);
        if (!isServer) {
            localStorage.removeItem(path);
             window.dispatchEvent(new CustomEvent('dataUpdated', { detail: { key: path, value: null } }));
        }
    } catch (error) {
        console.error(`Firebase Remove Error for path "${path}":`, error);
        throw error;
    }
}
