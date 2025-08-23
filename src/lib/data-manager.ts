
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
 * Fungsi ini HANYA boleh dipanggil oleh pengguna dengan peran 'wakasek' atau admin
 * untuk memastikan integritas data.
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

/**
 * Menambahkan item baru ke dalam kumpulan data yang ada tanpa menimpa.
 * Fungsi ini aman untuk digunakan oleh pengguna non-wakasek untuk menambahkan data
 * seperti laporan atau catatan baru.
 * 
 * @param key Kunci untuk data di localStorage.
 * @param newItem Item baru yang akan ditambahkan.
 */
export const appendToDataSource = (key: string, newItem: any) => {
    if (typeof window === 'undefined') {
        return;
    }
    try {
        const existingData = getSourceData(key, []);
        if (Array.isArray(existingData)) {
            // Pastikan item baru memiliki ID unik jika belum ada
            if (!newItem.id) {
                 newItem.id = Date.now();
            }
            const updatedData = [...existingData, newItem];
            updateSourceData(key, updatedData);
        }
    } catch (error) {
        console.error(`Gagal menambahkan data ke localStorage kunci "${key}":`, error);
    }
};

    