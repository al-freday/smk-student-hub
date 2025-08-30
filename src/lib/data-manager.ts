
import { getAllSeedData } from "./seed-data";

/**
 * Mengambil data dari localStorage.
 * @param key Kunci untuk data di localStorage.
 * @param defaultValue Nilai default jika data tidak ditemukan atau terjadi error.
 * @returns Data yang sudah di-parse dari JSON atau nilai default.
 */
export const getSourceData = (key: string, defaultValue: any) => {
    if (typeof window === 'undefined') {
        return defaultValue;
    }
    try {
        const item = window.localStorage.getItem(key);
        // If item doesn't exist, check if we should seed it.
        if (item === null) {
            const allData = getAllSeedData();
            if (key in allData) {
                const seedValue = allData[key as keyof typeof allData];
                // Save the seed data to localStorage for next time
                updateSourceData(key, seedValue);
                return seedValue;
            }
            return defaultValue;
        }
        return JSON.parse(item);
    } catch (error) {
        console.warn(`Error saat membaca localStorage kunci "${key}":`, error);
        return defaultValue;
    }
};

/**
 * Menyimpan data ke localStorage dan memicu event 'dataUpdated'.
 * @param key Kunci untuk menyimpan data di localStorage.
 * @param data Data yang akan disimpan (akan di-stringify).
 */
export const updateSourceData = (key: string, data: any) => {
    if (typeof window !== 'undefined') {
        try {
            window.localStorage.setItem(key, JSON.stringify(data));
            // Memicu event kustom untuk memberitahu komponen lain bahwa data telah diperbarui
            window.dispatchEvent(new CustomEvent('dataUpdated', { detail: { key, data } }));
        } catch (error) {
            console.error(`Error saat menyimpan ke localStorage kunci "${key}":`, error);
        }
    }
};

    