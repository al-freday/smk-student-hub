"use client";

const isServer = typeof window === 'undefined';

/**
 * Retrieves data from localStorage synchronously.
 * This is the primary method for components to get initial state.
 * @param key The key to retrieve.
 * @param defaultValue The value to return if the key doesn't exist.
 * @returns The parsed data from localStorage or the default value.
 */
export const getSourceData = (key: string, defaultValue: any): any => {
  if (isServer) {
    return defaultValue;
  }
  try {
    const localData = localStorage.getItem(key);
    if (localData === "undefined" || localData === null) {
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
 * Updates data in localStorage and dispatches an event to notify components.
 * @param key The key for the data.
 * @param data The data object to be saved.
 */
export const updateSourceData = (key: string, data: any): void => {
  if (isServer) {
    return;
  }
  try {
    localStorage.setItem(key, JSON.stringify(data));
    window.dispatchEvent(new CustomEvent('dataUpdated', { detail: { key } }));
  } catch (error) {
    console.error(`Failed to save data to localStorage for key "${key}".`, error);
  }
};