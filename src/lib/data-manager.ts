
"use client";

const isServer = typeof window === 'undefined';

const seedInitialData = () => {
  const siswaData = [
    { id: 1, nis: "24001", nama: "Siswa 1 X TKR", kelas: "X TKR" },
    { id: 2, nis: "24002", nama: "Siswa 2 X TKR", kelas: "X TKR" },
    { id: 3, nis: "24003", nama: "Siswa 3 X TKR", kelas: "X TKR" },
    { id: 4, nis: "24004", nama: "Siswa 4 X TKR", kelas: "X TKR" },
    { id: 5, nis: "24005", nama: "Siswa 5 X TKR", kelas: "X TKR" },
    { id: 6, nis: "23001", nama: "Siswa 1 XI TKR", kelas: "XI TKR" },
    { id: 7, nis: "23002", nama: "Siswa 2 XI TKR", kelas: "XI TKR" },
    { id: 8, nis: "22001", nama: "Siswa 1 XII TKR", kelas: "XII TKR" },
    { id: 9, nis: "22002", nama: "Hasanudin", kelas: "XII MM 1" },
  ];
  updateSourceData('siswaData', siswaData);

  const kelasData = [
    { id: 1, nama: "X TKR" },
    { id: 2, nama: "XI TKR" },
    { id: 3, nama: "XII TKR" },
     { id: 4, nama: "XII MM 1" },
  ];
  updateSourceData('kelasData', kelasData);
  
  const teachersData = {
    schoolInfo: {
        schoolName: "SMKN 2 Tana Toraja",
        headmasterName: "Nama Kepala Sekolah",
        logo: "https://iili.io/KAqSZhb.png"
    },
    wakasek_kesiswaan: [{ id: 1, nama: "Andi Wijaya", password: "password1" }],
    tata_usaha: [{ id: 1, nama: "Budi Setiawan", password: "password1" }],
    wali_kelas: [
        { id: 1, nama: "Citra Dewi", kelas: ["X TKR"], password: "password1" },
        { id: 2, nama: "Doni Hermawan", kelas: ["XI TKR"], password: "password1" }
    ],
    guru_bk: [
        { id: 1, nama: "Eka Fitriani", tugasKelas: "Kelas X", password: "password1" },
        { id: 2, nama: "Fajar Nugroho", tugasKelas: "Kelas XI", password: "password1" }
    ],
    guru_mapel: [
        { id: 1, nama: "Gita Lestari", password: "password1", teachingAssignments: [] },
        { id: 2, nama: "Hendra Gunawan", password: "password1", teachingAssignments: [] }
    ],
    guru_piket: [{ id: 1, nama: "Indah Permata", password: "password1", tanggalPiket: [] }],
    guru_pendamping: [{ id: 1, nama: "Joko Susilo", password: "password1", siswaBinaan: [] }]
  };
  updateSourceData('teachersData', teachersData);
  
  updateSourceData('riwayatPelanggaran', []);
  updateSourceData('prestasiData', []);
  updateSourceData('kehadiranSiswaPerSesi', []);
  updateSourceData('teacherAttendanceData', []);
  updateSourceData('logAkademikData', []);
  updateSourceData('logKompetensiData', []);
  updateSourceData('logBimbinganData', []);
  updateSourceData('layananBimbinganData', []);
  updateSourceData('rencanaIndividualData', []);
  updateSourceData('assignmentLogData', []);
  updateSourceData('waliKelasReportsStatus', {});
  updateSourceData('pklData', {});
  updateSourceData('pembayaranKomiteData', {});
  updateSourceData('riwayatPembayaranKomite', []);
  updateSourceData('arsipSuratData', []);
  updateSourceData('tataTertibData', {});
  updateSourceData('kurikulumData', {});
  updateSourceData('themeSettings', {});
};


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
      localStorage.setItem(key, JSON.stringify(defaultValue));
      localData = JSON.stringify(defaultValue);
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
    window.dispatchEvent(new CustomEvent('dataUpdated', { detail: { key, value: data } }));
  } catch (error) {
    console.error(`Gagal menyimpan data ke localStorage untuk kunci "${key}".`, error);
  }
};


const initializeData = () => {
  if (isServer) return;
  if (!localStorage.getItem('app_initialized')) {
    seedInitialData();
    localStorage.setItem('app_initialized', 'true');
    console.log("Data awal telah diinisialisasi ke localStorage.");
  }
};

initializeData();
