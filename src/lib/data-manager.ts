
"use client";

import { db } from './firebase';
import { ref, get, set } from 'firebase/database';

const isServer = typeof window === 'undefined';

/**
 * Retrieves data from localStorage. This is the primary method for components to get initial state.
 * Realtime Database synchronization should be handled within components/pages after initial load.
 * @param key The key to retrieve from localStorage.
 * @param defaultValue The value to return if the key doesn't exist.
 * @returns The parsed data from localStorage or the default value.
 */
export const getSourceData = (key: string, defaultValue: any): any => {
  if (isServer) {
    return defaultValue;
  }
  try {
    const localData = localStorage.getItem(key);
    // If no local data, set it from the default value
    if (localData === null) {
      localStorage.setItem(key, JSON.stringify(defaultValue));
      return defaultValue;
    }
    // Handle cases where "undefined" is stored as a string
    if (localData === "undefined") {
        return defaultValue;
    }
    return JSON.parse(localData);
  } catch (e) {
    console.error(`Failed to get/parse data for key "${key}" from localStorage.`, e);
    return defaultValue;
  }
};

/**
 * Updates data in localStorage and dispatches an event for other components to update.
 * @param key The key for the data.
 * @param data The data object to be saved.
 */
export const updateSourceData = (key: string, data: any): void => {
  if (isServer) {
    return;
  }
  try {
    const dataString = JSON.stringify(data);
    localStorage.setItem(key, dataString);
    // Dispatch a custom event to notify other parts of the app that data has changed.
    window.dispatchEvent(new CustomEvent('dataUpdated', { detail: { key, value: data } }));
  } catch (error) {
    console.error(`Failed to save data to localStorage for key "${key}".`, error);
  }
};

/**
 * Saves a specific dataset to both localStorage and Firebase Realtime Database.
 * This should be called on explicit user actions, like clicking a "Save" button.
 * @param key The key for the data (e.g., 'siswaData', 'teachersData').
 * @param data The data to save.
 */
export async function saveDataToFirebase(key: string, data: any) {
  if (isServer) return;
  
  // First, update local storage for immediate UI feedback
  updateSourceData(key, data);

  // Then, try to save to Firebase
  try {
    const dbRef = ref(db, key);
    await set(dbRef, data);
  } catch (error) {
    console.error(`Firebase Write Error for key "${key}":`, error);
    // Optionally, notify the user that cloud sync failed but local changes are saved.
  }
}

/**
 * Fetches all data from Firebase and synchronizes it with localStorage.
 * This should be called once after a successful login to ensure the user has the latest data.
 */
export async function syncAllDataFromFirebase() {
    if (isServer) return;
    try {
        const snapshot = await get(ref(db));
        if (snapshot.exists()) {
            const allData = snapshot.val();
            for (const key in allData) {
                // Update local storage without triggering a new Firebase write
                localStorage.setItem(key, JSON.stringify(allData[key]));
            }
            // Dispatch a general event to let the whole app know data has been synced
            window.dispatchEvent(new CustomEvent('dataUpdated', { detail: { all: true } }));
            console.log("All data successfully synced from Firebase.");
        }
    } catch (error) {
        console.error("Failed to sync all data from Firebase:", error);
    }
}
