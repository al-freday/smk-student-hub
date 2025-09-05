
import { initialKurikulumData } from './kurikulum-data';
import { tataTertibData } from './tata-tertib-data';
import { pklData } from './pklData';

const seedInitialData = () => {
  // Data Master: Siswa, Kelas, Guru
  const siswaData = [
    { id: 1, nis: "24001", nama: "Ahmad Dahlan", kelas: "X TKJ 1" },
    { id: 2, nis: "24002", nama: "Budi Santoso", kelas: "X TKJ 1" },
    { id: 3, nis: "24003", nama: "Citra Lestari", kelas: "X TKJ 2" },
    { id: 4, nis: "24004", nama: "Dewi Anggraini", kelas: "X TKJ 2" },
    { id: 5, nis: "23001", nama: "Eko Prasetyo", kelas: "XI OT 1" },
    { id: 6, nis: "23002", nama: "Fitriani", kelas: "XI OT 1" },
    { id: 7, nis: "22001", nama: "Guntur Wijaya", kelas: "XII MM 1" },
    { id: 8, nis: "22002", nama: "Hasanudin", kelas: "XII MM 1" },
  ];
  updateSourceData('siswaData', siswaData);

  const kelasData = [
    { id: 1, nama: "X TKJ 1" },
    { id: 2, nama: "X TKJ 2" },
    { id: 3, nama: "XI OT 1" },
    { id: 4, nama: "XII MM 1" },
  ];
  updateSourceData('kelasData', kelasData);
  
  const teachersData = {
    schoolInfo: { schoolName: "SMKN 2 Tana Toraja", headmasterName: "Nama Kepala Sekolah", logo: "https://placehold.co/200x200/2563eb/ffffff?text=LOGO" },
    wali_kelas: [{ id: 1, nama: "Andi Pratama", kelas: ["X TKJ 1", "X TKJ 2"], password: "password1" }],
    guru_bk: [{ id: 1, nama: "Siti Aminah", tugasKelas: "Kelas X", password: "password1" }],
    guru_mapel: [{ id: 1, nama: "Rahmat Hidayat", teachingAssignments: [], password: "password1" }],
    guru_piket: [{ id: 1, nama: "Indah Permata", tanggalPiket: [], password: "password1" }],
    guru_pendamping: [{ id: 1, nama: "Joko Susilo", kelas: [], siswaBinaan: [], password: "password1" }],
  };
  updateSourceData('teachersData', teachersData);

  // Data Transaksional (dibuat kosong)
  updateSourceData('riwayatPelanggaran', []);
  updateSourceData('prestasiData', []);
  updateSourceData('kehadiranSiswaPerSesi', []);
  updateSourceData('teacherAttendanceData', []);
  updateSourceData('logBimbinganData', {});
  updateSourceData('layananBimbinganData', []);
  updateSourceData('rencanaIndividualData', []);
  updateSourceData('assignmentLogData', []);
  updateSourceData('waliKelasReportsStatus', {});
};


const initializeData = () => {
  if (typeof window !== 'undefined') {
    
    // Pengecekan untuk data yang mungkin belum ada
    const requiredKeys = [
        'siswaData', 'kelasData', 'teachersData', 'riwayatPelanggaran', 
        'prestasiData', 'kurikulumData', 'kehadiranSiswaPerSesi',
        'teacherAttendanceData', 'logBimbinganData', 'layananBimbinganData', 
        'rencanaIndividualData', 'assignmentLogData', 'waliKelasReportsStatus',
        'tataTertibData', 'pklData'
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
    
    // Inisialisasi data kurikulum dan tata tertib jika belum ada
    if (localStorage.getItem('kurikulumData') === null) {
        localStorage.setItem('kurikulumData', JSON.stringify(initialKurikulumData));
    }
    if (localStorage.getItem('tataTertibData') === null) {
        localStorage.setItem('tataTertibData', JSON.stringify(tataTertibData));
    }
     if (localStorage.getItem('pklData') === null) {
        localStorage.setItem('pklData', JSON.stringify(pklData));
    }
  }
};

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

// Panggil inisialisasi saat script dimuat
initializeData();

    