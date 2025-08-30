import { db } from './firebase';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { initialKurikulumData } from './kurikulum-data';
import { initialEkskulData } from './ekskul-data';

const COLLECTION_NAME = 'appData';
const DOCUMENT_ID = 'main';

let localCache: any = null;
let isSubscribed = false;
let isFirstLoad = true;

/**
 * Initializes and subscribes to Firestore updates, keeping a local cache in sync.
 */
const subscribeToFirestore = () => {
  if (typeof window === 'undefined' || isSubscribed) {
    return;
  }
  isSubscribed = true;

  try {
    const docRef = doc(db, COLLECTION_NAME, DOCUMENT_ID);
    onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const firestoreData = docSnap.data();
        localCache = firestoreData;
        localStorage.setItem('appDataCache', JSON.stringify(firestoreData));
        // Dispatch event to notify components of potential updates
        window.dispatchEvent(new CustomEvent('dataUpdated', { detail: { source: 'firestore' } }));
      }
    }, (error) => {
      console.error("Firestore subscription error:", error);
      // If subscription fails, we rely on the cache
    });
  } catch (error) {
    console.error("Could not subscribe to Firestore:", error);
  }
};


/**
 * Fetches all application data, prioritizing Firestore, and handles one-time sync.
 */
const fetchAndSyncData = async () => {
    if (typeof window === 'undefined') return {};

    try {
        const docRef = doc(db, COLLECTION_NAME, DOCUMENT_ID);
        const docSnap = await getDoc(docRef);

        const localDataString = localStorage.getItem('appDataCache');
        const localData = localDataString ? JSON.parse(localDataString) : null;

        if (docSnap.exists()) {
            // Firestore has data, it's the source of truth.
            const firestoreData = docSnap.data();
            localCache = firestoreData;
            localStorage.setItem('appDataCache', JSON.stringify(firestoreData));
            return firestoreData;
        } else {
            // Firestore is empty. Check if local storage has data to push.
            if (localData && Object.keys(localData).length > 0) {
                console.log("Firestore is empty. Uploading data from local cache...");
                await setDoc(docRef, localData);
                localCache = localData;
                return localData;
            } else {
                // Both are empty, initialize with default data.
                console.log("Initializing Firestore with default data.");
                const defaultData = {
                    kurikulumData: initialKurikulumData,
                    ekskulData: initialEkskulData
                };
                await setDoc(docRef, defaultData);
                localCache = defaultData;
                localStorage.setItem('appDataCache', JSON.stringify(defaultData));
                return defaultData;
            }
        }
    } catch (error) {
        console.error("Error during initial data fetch and sync:", error);
        // Fallback to local cache if Firestore is unreachable
        const localDataString = localStorage.getItem('appDataCache');
        return localDataString ? JSON.parse(localDataString) : {};
    }
};

/**
 * Retrieves data. It will ensure data is loaded and synced on first call.
 * @param key The specific key for the data needed.
 * @param defaultValue The default value if no data is found anywhere.
 * @returns The requested data.
 */
export const getSourceData = async (key: string, defaultValue: any) => {
    if (isFirstLoad) {
        isFirstLoad = false;
        await fetchAndSyncData();
        subscribeToFirestore();
    }
    
    if (localCache === null) {
        const cacheString = localStorage.getItem('appDataCache');
        localCache = cacheString ? JSON.parse(cacheString) : {};
    }
    
    return localCache[key] ?? defaultValue;
};


/**
 * Updates data in both the local cache and Firestore.
 * @param key The key of the data to update.
 * @param data The new data to save.
 */
export const updateSourceData = async (key: string, data: any) => {
    if (typeof window === 'undefined') return;

    if (localCache === null) {
        // Ensure cache is loaded before updating
        await getSourceData('', null); 
    }

    // Optimistic UI update
    localCache[key] = data;
    localStorage.setItem('appDataCache', JSON.stringify(localCache));
    window.dispatchEvent(new CustomEvent('dataUpdated', { detail: { key, source: 'local' } }));

    // Asynchronously save the entire updated object to Firestore
    try {
        const docRef = doc(db, COLLECTION_NAME, DOCUMENT_ID);
        // Use set with merge option to be safer, or just set the whole object
        await setDoc(docRef, { [key]: data }, { merge: true });
    } catch (error) {
        console.error(`Error updating Firestore for key "${key}":`, error);
        toast({
            title: "Gagal Sinkronisasi",
            description: "Perubahan Anda disimpan secara lokal tetapi gagal disinkronkan ke server.",
            variant: "destructive",
        });
    }
};

// Helper for toast in data manager
const toast = (props: { title: string; description: string; variant?: "destructive" | "default" }) => {
    window.dispatchEvent(new CustomEvent('showToast', { detail: props }));
};
