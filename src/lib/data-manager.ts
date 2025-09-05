
"use client";

import { db } from './firebase';
import { doc, getDoc, setDoc, collection, getDocs } from "firebase/firestore";

const isServer = typeof window === 'undefined';
const COLLECTION_NAME = 'app_data';

/**
 * Updates or creates a document in a specific Firestore collection.
 * This function now handles all server-side data persistence.
 * @param key The document ID in Firestore.
 * @param data The data object to be saved.
 */
export const updateSourceData = async (key: string, data: any): Promise<void> => {
  if (isServer) return;
  try {
    const docRef = doc(db, COLLECTION_NAME, key);
    await setDoc(docRef, { data: JSON.stringify(data) });
  } catch (error) {
    console.error(`Failed to save data to Firestore for key "${key}":`, error);
  }
};

/**
 * Retrieves a document from a specific Firestore collection.
 * If the document doesn't exist, it initializes it with a default value.
 * @param key The document ID to retrieve.
 * @param defaultValue The value to return and save if the document doesn't exist.
 * @returns The retrieved data or the default value.
 */
export const getSourceData = async (key: string, defaultValue: any): Promise<any> => {
    if (isServer) return defaultValue;
    try {
        const docRef = doc(db, COLLECTION_NAME, key);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const serverData = docSnap.data();
            // Handle potential empty data field from Firestore
            if (serverData && serverData.data) {
                return JSON.parse(serverData.data);
            }
            return defaultValue; // Return default if data field is missing
        } else {
            // Document doesn't exist, so we initialize it with the default value
            await updateSourceData(key, defaultValue);
            return defaultValue;
        }
    } catch (error) {
        console.error(`Error retrieving data for key "${key}" from Firestore:`, error);
        // Fallback to default value in case of an error
        return defaultValue;
    }
};

/**
 * Loads all data required for the application initialization.
 * This is useful for fetching multiple documents at once on app load.
 */
export const loadAllInitialData = async () => {
    if (isServer) return {};
    const data: { [key: string]: any } = {};
    try {
        const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
        querySnapshot.forEach((doc) => {
            const serverData = doc.data();
            if (serverData && serverData.data) {
                data[doc.id] = JSON.parse(serverData.data);
            }
        });
        return data;
    } catch (error) {
        console.error("Failed to load all initial data from Firestore:", error);
        return {};
    }
};

