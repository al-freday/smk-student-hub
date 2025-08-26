
/**
 * @fileoverview Manajer Data Terpusat
 * 
 * File ini bertanggung jawab untuk mengelola pengambilan dan penyimpanan data
 * dari localStorage, memastikan bahwa data "sumber" yang ditetapkan oleh Wakasek
 * tetap terlindungi dan menjadi acuan bagi pengguna lain.
 */

/**
 * Mengambil data dari localStorage.
 * Fungsi ini memastikan bahwa semua pengguna membaca dari data "sumber" yang sama.
 * 
 * @param key Kunci untuk data di localStorage.
 * @param defaultValue Nilai default jika tidak ada data yang ditemukan.
 * @returns Data yang telah di-parse dari localStorage atau nilai default.
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
 * Memperbarui data "sumber" di localStorage.
 * 
 * @param key Kunci untuk data di localStorage.
 * @param data Data yang akan disimpan.
 */
export const updateSourceData = (key: string, data: any) => {
     if (typeof window === 'undefined') {
        return;
    }
    try {
        const serializedData = JSON.stringify(data);
        window.localStorage.setItem(key, serializedData);
    } catch (error) {
        console.error(`Error saat menulis ke localStorage kunci "${key}":`, error);
    }
};
