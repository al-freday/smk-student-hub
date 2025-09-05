
"use client";

import { db } from './firebase';
import { ref, get, set } from "firebase/database";

const isServer = typeof window === 'undefined';

/**
 * Retrieves a node from Firebase Realtime Database.
 * If the node doesn't exist, it initializes it with a default value.
 * This is the primary function for fetching data.
 * @param key The key (path) to retrieve.
 * @param defaultValue The value to return and save if the node doesn't exist.
 * @returns A promise that resolves to the retrieved data or the default value.
 */
export const getSourceData = async (key: string, defaultValue: any): Promise<any> => {
  if (isServer) {
    console.warn(`[data-manager] Attempted to get "${key}" on the server. Returning default value.`);
    return defaultValue;
  }
  try {
    const dataRef = ref(db, key);
    const snapshot = await get(dataRef);
    if (snapshot.exists()) {
      return snapshot.val();
    } else {
      // Data doesn't exist, initialize it with the default value in the database.
      await set(dataRef, defaultValue);
      return defaultValue;
    }
  } catch (error) {
    console.error(`Error retrieving data for key "${key}" from Realtime Database. Returning default value.`, error);
    return defaultValue;
  }
};

/**
 * Updates or creates a node in Firebase Realtime Database.
 * This is the primary function for saving data.
 * @param key The key (path) for the data.
 * @param data The data object to be saved.
 * @returns A promise that resolves when the operation is complete.
 */
export const updateSourceData = async (key: string, data: any): Promise<void> => {
  if (isServer) {
    console.warn(`[data-manager] Attempted to update "${key}" on the server. Operation skipped.`);
    return;
  }
  try {
    const dataRef = ref(db, key);
    await set(dataRef, data);
    // Dispatch a custom event to notify other components of the data change
    window.dispatchEvent(new CustomEvent('dataUpdated', { detail: { key } }));
  } catch (error) {
    console.error(`Failed to save data to Realtime Database for key "${key}".`, error);
    // Optional: Add a user-facing error message here if needed
  }
};

/**
 * DEPRECATED: Synchronous data retrieval from localStorage.
 * This function should be avoided in new code in favor of the async getSourceData.
 * It is kept for legacy components that have not been refactored.
 * @param key The key to retrieve from localStorage.
 * @param defaultValue The value to return if the key doesn't exist in localStorage.
 * @returns The parsed data from localStorage or the default value.
 */
export const getSourceDataSync = (key: string, defaultValue: any): any => {
    if (isServer) return defaultValue;
    try {
        const localData = localStorage.getItem(key);
        // Ensure that if "undefined" is stored as a string, it's handled correctly.
        if (localData === "undefined" || localData === null) {
            return defaultValue;
        }
        return JSON.parse(localData);
    } catch (e) {
        console.error(`Failed to parse sync data for key "${key}" from localStorage.`, e);
        return defaultValue;
    }
}
