
import { db } from './firebase';
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { initialKurikulumData } from './kurikulum-data';
import { tataTertibData } from './tata-tertib-data';
import { pklData } from './pklData';

// Kunci untuk dokumen tunggal di koleksi 'singleDocs'
const SINGLE_DOCS_COLLECTION = 'singleDocs';

// Helper function to get a document from Firestore
const getFirestoreDoc = async (docId: string) => {
  const docRef = doc(db, SINGLE_DOCS_COLLECTION, docId);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return docSnap.data().data; // Data is stored in a 'data' field
  }
  return null;
};

// Helper function to set a document in Firestore
const setFirestoreDoc = async (docId: string, data: any) => {
  const docRef = doc(db, SINGLE_DOCS_COLLECTION, docId);
  await setDoc(docRef, { data });
};

// Seeding function (can be triggered manually if needed, but we'll rely on defaults)
const seedInitialData = async () => {
  console.log("Seeding initial data to Firestore...");
  
  // This is a simplified seed, in a real app you might want more robust checks
  await setFirestoreDoc('siswaData', [
    { id: 1, nis: "24001", nama: "Ahmad Dahlan", kelas: "X TKJ 1" },
    { id: 2, nis: "24002", nama: "Budi Santoso", kelas: "X TKJ 1" },
  ]);
  await setFirestoreDoc('kelasData', [
    { id: 1, nama: "X TKJ 1" }, { id: 2, nama: "X TKJ 2" },
  ]);
  await setFirestoreDoc('teachersData', {
     schoolInfo: { schoolName: "SMKN 2 Tana Toraja", headmasterName: "Nama Kepala Sekolah", logo: "" },
     wali_kelas: [{ id: 1, nama: "Andi Pratama", kelas: ["X TKJ 1", "X TKJ 2"], password: "password1" }],
     guru_bk: [{ id: 1, nama: "Siti Aminah", tugasKelas: "Kelas X", password: "password1" }],
     guru_mapel: [{ id: 1, nama: "Rahmat Hidayat", teachingAssignments: [], password: "password1" }],
     guru_piket: [{ id: 1, nama: "Indah Permata", tanggalPiket: [], password: "password1" }],
     guru_pendamping: [{ id: 1, nama: "Joko Susilo", kelas: [], siswaBinaan: [], password: "password1" }],
     tata_usaha: [{ id: 1, nama: "Admin TU", password: "password123"}],
  });
  await setFirestoreDoc('kurikulumData', initialKurikulumData);
  await setFirestoreDoc('tataTertibData', tataTertibData);
  await setFirestoreDoc('pklData', pklData);
  // ... seed other data if needed
  
  console.log("Seeding complete.");
  return true;
};


/**
 * Fetches data from Firestore. Falls back to default values and can seed if the database is empty.
 * @param key The document ID in the 'singleDocs' collection.
 * @param defaultValue The default value to return if the document doesn't exist.
 * @returns The data from Firestore or the default value.
 */
export const getSourceData = async (key: string, defaultValue: any) => {
  try {
    let data = await getFirestoreDoc(key);
    if (data === null) {
      console.warn(`Data for key "${key}" not found in Firestore. Returning default value.`);
      // Optional: Seed data if a key piece of data is missing, e.g., teachersData
      if (key === 'teachersData') {
          console.log(`Core data missing, attempting to seed database...`);
          await seedInitialData();
          data = await getFirestoreDoc(key); // Re-fetch after seeding
          if(data === null) return defaultValue; // If still null, return default
      } else {
         return defaultValue;
      }
    }
    return data;
  } catch (error) {
    console.error(`Error fetching data for key "${key}" from Firestore:`, error);
    return defaultValue;
  }
};

/**
 * Saves or updates data in Firestore.
 * @param key The document ID in the 'singleDocs' collection to save data to.
 * @param data The data to be saved.
 */
export const updateSourceData = async (key: string, data: any) => {
   try {
     await setFirestoreDoc(key, data);
     // Dispatch a custom event to notify components of the update
     window.dispatchEvent(new CustomEvent('dataUpdated', { detail: { key } }));
   } catch (error) {
     console.error(`Failed to save data to Firestore for key "${key}":`, error);
   }
};
