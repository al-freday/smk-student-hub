
"use client";

// --- Tipe Data Awal ---
const initialTeachersData = {
    schoolInfo: {
        schoolName: "SMKN 2 Tana Toraja",
        headmasterName: "Nama Kepala Sekolah",
        logo: ""
    },
    wakasek_kesiswaan: [{ id: 1, nama: "Andi Wijaya" }],
    tata_usaha: [{ id: 1, nama: "Budi Setiawan" }],
    wali_kelas: [
        { id: 1, nama: "Citra Dewi", kelas: ["X TKJ 1", "X TKJ 2"] },
        { id: 2, nama: "Doni Hermawan", kelas: ["XI OT 1"] }
    ],
    guru_bk: [
        { id: 1, nama: "Eka Fitriani", tugasKelas: "Kelas X" },
        { id: 2, nama: "Fajar Nugroho", tugasKelas: "Kelas XI" }
    ],
    guru_mapel: [
        { id: 1, nama: "Gita Lestari" },
        { id: 2, nama: "Hendra Gunawan" }
    ],
    guru_piket: [{ id: 1, nama: "Indah Permata" }],
    guru_pendamping: [{ id: 1, nama: "Joko Susilo" }]
};

const initialSiswaData = [
    { id: 1, nis: "24001", nama: "Ahmad Dahlan", kelas: "X TKJ 1" },
    { id: 2, nis: "24002", nama: "Budi Santoso", kelas: "X TKJ 1" },
    { id: 3, nis: "24003", nama: "Citra Lestari", kelas: "X TKJ 2" },
    { id: 4, nis: "23001", nama: "Eko Prasetyo", kelas: "XI OT 1" }
];

const initialKelasData = [
    { id: 1, nama: "X TKJ 1" },
    { id: 2, nama: "X TKJ 2" },
    { id: 3, nama: "XI OT 1" }
];


// --- Fungsi Manajemen Data ---

const isServer = typeof window === 'undefined';

/**
 * Mengambil data dari localStorage. Jika tidak ada, inisialisasi dengan data default.
 * @param {string} key Kunci data di localStorage.
 * @param {any} defaultValue Nilai default jika tidak ada data.
 * @returns {any} Data yang telah di-parse.
 */
export const getSourceData = (key: string, defaultValue: any): any => {
  if (isServer) {
    return defaultValue;
  }
  try {
    let localData = localStorage.getItem(key);
    if (localData === null) {
      // Inisialisasi data awal jika belum ada di localStorage
      if (key === 'teachersData') {
        localStorage.setItem(key, JSON.stringify(initialTeachersData));
        localData = JSON.stringify(initialTeachersData);
      } else if (key === 'siswaData') {
         localStorage.setItem(key, JSON.stringify(initialSiswaData));
         localData = JSON.stringify(initialSiswaData);
      } else if (key === 'kelasData') {
          localStorage.setItem(key, JSON.stringify(initialKelasData));
          localData = JSON.stringify(initialKelasData);
      } else {
        localStorage.setItem(key, JSON.stringify(defaultValue));
        localData = JSON.stringify(defaultValue);
      }
    }
    return JSON.parse(localData);
  } catch (e) {
    console.error(`Gagal mengambil/parse data untuk kunci "${key}" dari localStorage.`, e);
    return defaultValue;
  }
};

/**
 * Menyimpan data ke localStorage dan memicu event untuk pembaruan UI.
 * @param {string} key Kunci data di localStorage.
 * @param {any} data Data yang akan disimpan.
 */
export const updateSourceData = (key: string, data: any): void => {
  if (isServer) {
    return;
  }
  try {
    const dataString = JSON.stringify(data);
    localStorage.setItem(key, dataString);
    // Kirim event kustom untuk memberitahu komponen lain bahwa data telah diperbarui
    window.dispatchEvent(new CustomEvent('dataUpdated', { detail: { key, value: data } }));
  } catch (error) {
    console.error(`Gagal menyimpan data ke localStorage untuk kunci "${key}".`, error);
  }
};
