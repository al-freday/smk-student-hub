
import { db } from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const COLLECTION_NAME = 'appData';
const DOCUMENT_ID = 'main';

/**
 * Fetches all application data from Firestore.
 * @returns The entire data object or null if not found.
 */
const fetchAllDataFromFirestore = async () => {
  try {
    const docRef = doc(db, COLLECTION_NAME, DOCUMENT_ID);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      console.log("No such document in Firestore! Initializing with empty object.");
      // If no document exists, create one to avoid future errors.
      await setDoc(docRef, {});
      return {};
    }
  } catch (error) {
    console.error("Error fetching data from Firestore:", error);
    return null; // Return null to indicate failure
  }
};

/**
 * Saves the entire application data object to Firestore.
 * @param allData The complete data object to save.
 */
const saveAllDataToFirestore = async (allData: any) => {
  try {
    const docRef = doc(db, COLLECTION_NAME, DOCUMENT_ID);
    await setDoc(docRef, allData);
  } catch (error) {
    console.error("Error saving data to Firestore:", error);
  }
};


/**
 * Retrieves data, prioritizing Firestore and falling back to localStorage.
 * @param key The specific key for the data needed.
 * @param defaultValue The default value if no data is found anywhere.
 * @returns The requested data.
 */
export const getSourceData = async (key: string, defaultValue: any) => {
    if (typeof window === 'undefined') {
        return defaultValue;
    }

    // Try to get fresh data from Firestore
    const firestoreData = await fetchAllDataFromFirestore();

    if (firestoreData) {
        // If Firestore fetch is successful, update localStorage with the fresh data
        localStorage.setItem('appDataCache', JSON.stringify(firestoreData));
        return firestoreData[key] || defaultValue;
    } else {
        // If Firestore fails (e.g., offline), fall back to the localStorage cache
        console.warn("Could not connect to Firestore. Falling back to local cache.");
        try {
            const cachedDataString = localStorage.getItem('appDataCache');
            if (cachedDataString) {
                const cachedData = JSON.parse(cachedDataString);
                return cachedData[key] || defaultValue;
            }
        } catch (error) {
            console.error("Error reading from localStorage cache:", error);
        }
    }

    // If both Firestore and cache fail, return the default value
    return defaultValue;
};


/**
 * Updates data in both Firestore and localStorage.
 * @param key The key of the data to update.
 * @param data The new data to save.
 */
export const updateSourceData = async (key: string, data: any) => {
    if (typeof window === 'undefined') {
        return;
    }

    try {
        // Get the current state from the cache to avoid a full Firestore read before write
        const cachedDataString = localStorage.getItem('appDataCache');
        const allData = cachedDataString ? JSON.parse(cachedDataString) : {};

        // Update the specific key
        allData[key] = data;
        
        // Asynchronously save the entire updated object to Firestore
        await saveAllDataToFirestore(allData);

        // Immediately update the local cache for UI responsiveness
        localStorage.setItem('appDataCache', JSON.stringify(allData));

        // Dispatch an event to notify components of the update
        window.dispatchEvent(new CustomEvent('dataUpdated', { detail: { key, data } }));

    } catch (error) {
        console.error(`Error updating source data for key "${key}":`, error);
    }
};
