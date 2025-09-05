
"use client";

import { db } from './firebase';
import { ref, get, set, child, remove } from 'firebase/database';

const isServer = typeof window === 'undefined';

/**
 * Retrieves data from Firebase Realtime Database. Uses localStorage as a cache for performance.
 * @param key The key to retrieve from Firebase (e.g., 'teachersData').
 * @param defaultValue The value to return if no data exists.
 * @returns The data from Firebase or the default value.
 */
export const getSourceData = (key: string, defaultValue: any): any => {
  if (isServer) {
    return defaultValue;
  }
  // This function will now primarily be a passthrough for local cache.
  // The main data fetching will be more explicit.
  try {
    const localData = localStorage.getItem(key);
    if (localData === null) {
      localStorage.setItem(key, JSON.stringify(defaultValue));
      return defaultValue;
    }
    return JSON.parse(localData);
  } catch (e) {
    console.error(`Failed to get/parse cached data for key "${key}" from localStorage.`, e);
    return defaultValue;
  }
};

/**
 * Updates data in localStorage and dispatches a local event for UI updates.
 * This is now mainly for caching session data or non-persistent state.
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

// --- NEW FIREBASE-CENTRIC FUNCTIONS ---

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
      return snapshot.val();
    } else {
      console.log(`No data available at path: ${path}`);
      return null;
    }
  } catch (error) {
    console.error(`Firebase Read Error for path "${path}":`, error);
    throw error;
  }
}

/**
 * Saves or updates a specific dataset in Firebase Realtime Database.
 * This is the primary function for all data mutations.
 * @param path The path to the data in Firebase (e.g., 'teachersData/wali_kelas').
 * @param data The data to save.
 */
export async function saveDataToFirebase(path: string, data: any) {
  try {
    const dbRef = ref(db, path);
    await set(dbRef, data);
  } catch (error) {
    console.error(`Firebase Write Error for path "${path}":`, error);
    throw error;
  }
}

/**
 * Removes data from a specific path in Firebase Realtime Database.
 * @param path The path to the data to remove.
 */
export async function removeDataFromFirebase(path: string) {
    try {
        const dbRef = ref(db, path);
        await remove(dbRef);
    } catch (error) {
        console.error(`Firebase Remove Error for path "${path}":`, error);
        throw error;
    }
}
