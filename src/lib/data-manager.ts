
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
export const getSourceData = (key: string, defaultValue: any): any => {
  if (isServer) {
    // On the server, we can't reliably use this pattern. Return default.
    return defaultValue;
  }
  
  // For client-side components, we switch to a synchronous localStorage approach
  // to avoid forcing all components to become async. This simplifies state management
  // across the app but assumes data is primarily managed on the client.
  try {
    const localData = localStorage.getItem(key);
    if (localData === "undefined" || localData === null) {
      // If not in localStorage, set it with the default value for next time.
      localStorage.setItem(key, JSON.stringify(defaultValue));
      return defaultValue;
    }
    return JSON.parse(localData);
  } catch (e) {
    console.error(`Failed to get/parse data for key "${key}" from localStorage.`, e);
    return defaultValue;
  }
};

/**
 * Updates or creates a node in localStorage and dispatches an event.
 * @param key The key (path) for the data.
 * @param data The data object to be saved.
 */
export const updateSourceData = (key: string, data: any): void => {
  if (isServer) {
    console.warn(`[data-manager] Attempted to update "${key}" on the server. Operation skipped.`);
    return;
  }
  try {
    localStorage.setItem(key, JSON.stringify(data));
    // Dispatch a custom event to notify other components of the data change
    window.dispatchEvent(new CustomEvent('dataUpdated', { detail: { key } }));
  } catch (error) {
    console.error(`Failed to save data to localStorage for key "${key}".`, error);
  }
};

// DEPRECATED but kept for compatibility if any component still uses it.
export const getSourceDataSync = (key: string, defaultValue: any): any => {
    return getSourceData(key, defaultValue);
}
