
import { updateSourceData } from './data-manager';

export const seedInitialData = () => {
  const siswaData = [
    { id: 1, nis: "24001", nama: "Siswa 1 X TKR", kelas: "X TKR" },
    { id: 2, nis: "24002", nama: "Siswa 2 X TKR", kelas: "X TKR" },
    { id: 3, nis: "24003", nama: "Siswa 3 X TKR", kelas: "X TKR" },
    { id: 4, nis: "24004", nama: "Siswa 4 X TKR", kelas: "X TKR" },
    { id: 5, nis: "24005", nama: "Siswa 5 X TKR", kelas: "X TKR" },
    { id: 6, nis: "23001", nama: "Siswa 1 XI TKR", kelas: "XI TKR" },
    { id: 7, nis: "23002", nama: "Siswa 2 XI TKR", kelas: "XI TKR" },
    { id: 8, nis: "22001", nama: "Siswa 1 XII TKR", kelas: "XII TKR" },
  ];
  updateSourceData('siswaData', siswaData);

  const kelasData = [
    { id: 1, nama: "X TKR" },
    { id: 2, nama: "XI TKR" },
    { id: 3, nama: "XII TKR" },
  ];
  updateSourceData('kelasData', kelasData);
  
  const teachersData = {
    schoolInfo: {
        schoolName: "SMKN 2 Tana Toraja",
        headmasterName: "Nama Kepala Sekolah",
        logo: ""
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
  
  // Initialize other data stores as empty arrays
  updateSourceData('riwayatPelanggaran', []);
  updateSourceData('prestasiData', []);
  updateSourceData('kehadiranSiswaPerSesi', []);
  updateSourceData('teacherAttendanceData', []);
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
