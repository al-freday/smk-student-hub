
"use client";

// This file is a mock data manager. In a real application, you would
// use a proper database like Firestore to manage your data. For this
// prototype, we are using localStorage to simulate a persistent data store.

const isServer = typeof window === 'undefined';

/**
 * Saves or updates data in localStorage.
 * Dispatches a custom event to notify other components of the update.
 * @param key The key under which the data is stored in localStorage.
 * @param data The data to be saved.
 */
export const updateSourceData = (key: string, data: any) => {
  if (isServer) return;
  try {
    const jsonData = JSON.stringify(data);
    localStorage.setItem(key, jsonData);
    // Dispatch a custom event to notify components of the update
    window.dispatchEvent(new CustomEvent('dataUpdated', { detail: { key } }));
  } catch (error) {
    console.error(`Failed to save data to localStorage for key "${key}":`, error);
  }
};

/**
 * Retrieves data from localStorage.
 * @param key The key of the data to retrieve.
 * @param defaultValue The value to return if the key doesn't exist in localStorage.
 * @returns The retrieved data or the default value.
 */
export const getSourceData = (key: string, defaultValue: any) => {
    if (isServer) return defaultValue;
    try {
        const item = localStorage.getItem(key);
        if (item === null) {
            // If data doesn't exist, seed it with the default value
            updateSourceData(key, defaultValue);
            return defaultValue;
        }
        return JSON.parse(item);
    } catch (error) {
        console.error(`Error retrieving data for key "${key}" from localStorage:`, error);
        // Seed with default value in case of parsing error
        updateSourceData(key, defaultValue);
        return defaultValue;
    }
};
