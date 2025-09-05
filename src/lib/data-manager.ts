
import { db } from './firebase';
import { collection, doc, getDoc, getDocs, setDoc, writeBatch } from "firebase/firestore";
import { initialKurikulumData } from './kurikulum-data';
import { tataTertibData } from './tata-tertib-data';
import { pklData } from './pklData';

// Kunci untuk dokumen tunggal di koleksi 'singleDocs'
const SINGLE_DOCS_COLLECTION = 'singleDocs';

const seedInitialData = async () => {
  console.log("Seeding initial data to Firestore...");
  const batch = writeBatch(db);

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
  const siswaDocRef = doc(db, SINGLE_DOCS_COLLECTION, 'siswaData');
  batch.set(siswaDocRef, { data: siswaData });

  const kelasData = [
    { id: 1, nama: "X TKJ 1" },
    { id: 2, nama: "X TKJ 2" },
    { id: 3, nama: "XI OT 1" },
    { id: 4, nama: "XII MM 1" },
  ];
  const kelasDocRef = doc(db, SINGLE_DOCS_COLLECTION, 'kelasData');
  batch.set(kelasDocRef, { data: kelasData });
  
  const teachersData = {
    schoolInfo: { schoolName: "SMKN 2 Tana Toraja", headmasterName: "Nama Kepala Sekolah", logo: "https://placehold.co/200x200/2563eb/ffffff?text=LOGO" },
    wali_kelas: [{ id: 1, nama: "Andi Pratama", kelas: ["X TKJ 1", "X TKJ 2"], password: "password1" }],
    guru_bk: [{ id: 1, nama: "Siti Aminah", tugasKelas: "Kelas X", password: "password1" }],
    guru_mapel: [{ id: 1, nama: "Rahmat Hidayat", teachingAssignments: [], password: "password1" }],
    guru_piket: [{ id: 1, nama: "Indah Permata", tanggalPiket: [], password: "password1" }],
    guru_pendamping: [{ id: 1, nama: "Joko Susilo", kelas: [], siswaBinaan: [], password: "password1" }],
  };
  const teachersDocRef = doc(db, SINGLE_DOCS_COLLECTION, 'teachersData');
  batch.set(teachersDocRef, { data: teachersData });

  const riwayatPelanggaran = [
    {
      id: 1,
      tanggal: "2024-05-10",
      nis: "24001",
      namaSiswa: "Ahmad Dahlan",
      kelas: "X TKJ 1",
      pelanggaran: "Datang terlambat tanpa alasan.",
      poin: 5,
      guruPelapor: "Indah Permata",
      tindakanAwal: "Diberi teguran lisan.",
      status: 'Dilaporkan'
    }
  ];
  const pelanggaranDocRef = doc(db, SINGLE_DOCS_COLLECTION, 'riwayatPelanggaran');
  batch.set(pelanggaranDocRef, { data: riwayatPelanggaran });
  
  // Data transaksional dan lainnya
  batch.set(doc(db, SINGLE_DOCS_COLLECTION, 'prestasiData'), { data: [] });
  batch.set(doc(db, SINGLE_DOCS_COLLECTION, 'kehadiranSiswaPerSesi'), { data: [] });
  batch.set(doc(db, SINGLE_DOCS_COLLECTION, 'teacherAttendanceData'), { data: [] });
  batch.set(doc(db, SINGLE_DOCS_COLLECTION, 'logBimbinganData'), { data: {} });
  batch.set(doc(db, SINGLE_DOCS_COLLECTION, 'layananBimbinganData'), { data: [] });
  batch.set(doc(db, SINGLE_DOCS_COLLECTION, 'rencanaIndividualData'), { data: [] });
  batch.set(doc(db, SINGLE_DOCS_COLLECTION, 'assignmentLogData'), { data: [] });
  batch.set(doc(db, SINGLE_DOCS_COLLECTION, 'waliKelasReportsStatus'), { data: {} });
  batch.set(doc(db, SINGLE_DOCS_COLLECTION, 'kurikulumData'), { data: initialKurikulumData });
  batch.set(doc(db, SINGLE_DOCS_COLLECTION, 'tataTertibData'), { data: tataTertibData });
  batch.set(doc(db, SINGLE_DOCS_COLLECTION, 'pklData'), { data: pklData });

  await batch.commit();
  // Tandai bahwa seeding telah selesai
  localStorage.setItem('firestore_seeded', 'true');
  console.log("Seeding complete.");
};


/**
 * Mengambil data dari Firestore. Data sekarang diambil dari server.
 * @param key Kunci dokumen yang ingin diambil dari koleksi 'singleDocs'.
 * @param defaultValue Nilai default jika data tidak ditemukan.
 * @returns Data yang diminta atau nilai default.
 */
export const getSourceData = (key: string, defaultValue: any) => {
  // Sementara tetap gunakan localStorage untuk data sesi seperti currentUser dan userRole
  if (key === 'currentUser' || key === 'userRole' || key.startsWith('appTheme_') || key.startsWith('nominalKomite_')) {
    if (typeof window !== 'undefined') {
      const savedData = localStorage.getItem(key);
      try {
        return savedData ? JSON.parse(savedData) : defaultValue;
      } catch (e) {
        return defaultValue;
      }
    }
    return defaultValue;
  }

  // Untuk data lain, kita akan mencoba mengambil dari cache sementara atau state management di masa depan.
  // Untuk saat ini, fungsi ini tidak akan mengambil dari Firestore secara langsung karena perlu async.
  // Komponen akan bertanggung jawab untuk mengambil datanya sendiri.
  // Fungsi ini akan mengembalikan data dari localStorage sebagai fallback selama transisi.
  if (typeof window !== 'undefined') {
    const savedData = localStorage.getItem(key);
    try {
      return savedData ? JSON.parse(savedData) : defaultValue;
    } catch (e) {
      return defaultValue;
    }
  }

  return defaultValue;
};


/**
 * Menyimpan atau memperbarui data di Firestore.
 * @param key Kunci dokumen yang ingin disimpan di koleksi 'singleDocs'.
 * @param data Data yang akan disimpan.
 */
export const updateSourceData = (key: string, data: any) => {
   // Tetap gunakan localStorage untuk data sesi
  if (key === 'currentUser' || key === 'userRole' || key.startsWith('appTheme_') || key.startsWith('nominalKomite_')) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, JSON.stringify(data));
      // Event ini penting untuk memberi tahu komponen lain tentang pembaruan.
      window.dispatchEvent(new CustomEvent('dataUpdated', { detail: { key, isLocal: true } }));
    }
    return;
  }

  // Simulasikan penyimpanan ke localStorage dan beritahu komponen untuk refetch
   if (typeof window !== 'undefined') {
      localStorage.setItem(key, JSON.stringify(data));
      console.warn(`Data untuk kunci '${key}' disimpan ke localStorage, bukan Firestore. Implementasi Firestore penuh diperlukan.`);
      window.dispatchEvent(new CustomEvent('dataUpdated', { detail: { key, isLocal: false } }));
  }
};


// Fungsi inisialisasi untuk memeriksa apakah seeding diperlukan
const initializeData = async () => {
  if (typeof window !== 'undefined') {
    const isSeeded = localStorage.getItem('firestore_seeded');
    if (!isSeeded) {
      // Cek apakah koleksi sudah ada di Firestore untuk menghindari penimpaan
      const docRef = doc(db, SINGLE_DOCS_COLLECTION, 'siswaData');
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        await seedInitialData();
      } else {
        console.log("Data already exists in Firestore. Skipping seed.");
        localStorage.setItem('firestore_seeded', 'true');
      }
    }
  }
};

// Panggil inisialisasi
initializeData();
