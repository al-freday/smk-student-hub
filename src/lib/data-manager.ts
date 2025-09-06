
"use client";

import { db, ensureAuthenticated } from './firebase';
import { ref, get, set, child } from 'firebase/database';

const isServer = typeof window === 'undefined';

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


export async function fetchDataFromFirebase(path: string) {
  try {
    await ensureAuthenticated(); 
    
    const dbRef = ref(db);
    const snapshot = await get(child(dbRef, path));
    
    if (snapshot.exists()) {
      const data = snapshot.val();
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
    if (!isServer) {
      return getSourceData(path, null);
    }
    throw error;
  }
}

export async function saveDataToFirebase(path: string, data: any) {
  try {
    await ensureAuthenticated();

    const dbRef = ref(db, path);
    await set(dbRef, data);
    
    if (!isServer) {
      const rootPath = path.split('/')[0];
      await fetchDataFromFirebase(rootPath);
    }
  } catch (error) {
    console.error(`Firebase Write Error for path "${path}":`, error);
    throw error;
  }
}
