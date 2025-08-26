
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
        return item ? JSON.parse(item) : defaultValue;
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
