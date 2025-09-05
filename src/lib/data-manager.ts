
"use client";

import { db, ensureAuthenticated } from './firebase';
import { ref, get, set, child } from 'firebase/database';

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

/**
 * Fetches a specific dataset directly from Firebase Realtime Database.
 * Ensures authentication is complete before fetching.
 * @param path The path to the data in Firebase (e.g., 'teachersData').
 * @returns The data from Firebase, or null if it doesn't exist.
 */
export async function fetchDataFromFirebase(path: string) {
  try {
    // Ensure we are authenticated before trying to fetch data
    const user = await ensureAuthenticated();
    if (!user) {
        throw new Error("Authentication failed. Cannot fetch data.");
    }
    
    const dbRef = ref(db);
    const snapshot = await get(child(dbRef, path));
    
    if (snapshot.exists()) {
      const data = snapshot.val();
      // Cache the fetched data in localStorage for performance
      if (!isServer) {
        updateSourceData(path, data);
      }
      return data;
    } else {
      console.log(`No data available at path: ${path}`);
      if (!isServer) {
        updateSourceData(path, null);
      }
      return null;
    }
  } catch (error) {
    console.error(`Firebase Read Error for path "${path}":`, error);
    // As a fallback, try to return data from cache if network fails
    if (!isServer) {
      return getSourceData(path, null);
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
    const user = await ensureAuthenticated(); // Ensure auth is ready
    if (!user) {
        throw new Error("Authentication failed. Cannot save data.");
    }

    const dbRef = ref(db, path);
    await set(dbRef, data);
    
    // After saving, re-fetch the root object to update the local cache correctly
    if (!isServer) {
      const rootPath = path.split('/')[0];
      await fetchDataFromFirebase(rootPath); // This re-fetches and updates cache
    }
  } catch (error) {
    console.error(`Firebase Write Error for path "${path}":`, error);
    throw error;
  }
}
