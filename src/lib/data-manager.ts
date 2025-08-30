import { initialKurikulumData } from './kurikulum-data';
import { initialEkskulData } from './ekskul-data';
import { seedInitialData } from './seed-data';

const initializeData = () => {
  if (typeof window !== 'undefined') {
    
    // Pengecekan untuk data yang mungkin belum ada
    const requiredKeys = [
        'siswaData', 'kelasData', 'teachersData', 'riwayatPelanggaran', 
        'prestasiData', 'ekskulData', 'kurikulumData', 'kehadiranSiswaPerSesi',
        'teacherAttendanceData', 'logBimbinganData', 'layananBimbinganData', 
        'rencanaIndividualData', 'assignmentLogData', 'waliKelasReportsStatus'
    ];

    let needsSeeding = false;
    requiredKeys.forEach(key => {
        if (localStorage.getItem(key) === null) {
            needsSeeding = true;
        }
    });
    
    // Hanya seed data jika salah satu kunci utama tidak ada
    if (needsSeeding) {
        console.log("Seeding initial data to localStorage...");
        seedInitialData();
    }
    
    // Inisialisasi data kurikulum dan ekskul jika belum ada
    if (localStorage.getItem('kurikulumData') === null) {
        localStorage.setItem('kurikulumData', JSON.stringify(initialKurikulumData));
    }
    if (localStorage.getItem('ekskulData') === null) {
        localStorage.setItem('ekskulData', JSON.stringify(initialEkskulData));
    }
  }
};

// Panggil inisialisasi saat script dimuat
initializeData();

/**
 * Mengambil data dari localStorage.
 * @param key Kunci data yang ingin diambil.
 * @param defaultValue Nilai default jika data tidak ditemukan.
 * @returns Data yang diminta atau nilai default.
 */
export const getSourceData = (key: string, defaultValue: any) => {
  if (typeof window === 'undefined') {
    return defaultValue;
  }
  
  const savedData = localStorage.getItem(key);
  try {
    return savedData ? JSON.parse(savedData) : defaultValue;
  } catch (error) {
    console.error(`Error parsing JSON from localStorage for key "${key}":`, error);
    return defaultValue;
  }
};

/**
 * Menyimpan atau memperbarui data di localStorage.
 * @param key Kunci data yang ingin disimpan.
 * @param data Data yang akan disimpan.
 */
export const updateSourceData = (key: string, data: any) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(key, JSON.stringify(data));
    // Memicu event kustom untuk memberitahu komponen lain tentang pembaruan data
    window.dispatchEvent(new CustomEvent('dataUpdated', { detail: { key } }));
  }
};
