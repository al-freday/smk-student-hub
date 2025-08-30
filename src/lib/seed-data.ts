
// src/lib/seed-data.ts

import { updateSourceData } from './data-manager';

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
    schoolInfo: { schoolName: "SMKN 2 Tana Toraja", headmasterName: "Nama Kepala Sekolah", logo: "" },
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

export { seedInitialData };
