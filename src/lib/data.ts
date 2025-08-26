
import { format } from "date-fns";

// Tipe data yang relevan
interface Guru { id: number; nama: string; }
interface Kelas { id: number; nama: string; jumlahSiswa: number; }
interface Siswa { id: number; nis: string; nama: string; kelas: string; }
interface Kehadiran { id: string; tanggal: string; status: string; }
interface CatatanSiswa { id: number; tanggal: string; tipe: 'pelanggaran' | 'prestasi'; }

// Fungsi untuk mendapatkan data dengan aman dari localStorage
const getDataFromLocalStorage = (key: string, defaultValue: any) => {
    if (typeof window === 'undefined') {
        return defaultValue;
    }
    try {
        const item = window.localStorage.getItem(key);
        // Pastikan item yang di-parse tidak null atau undefined sebelum mengembalikannya
        const parsedItem = item ? JSON.parse(item) : null;
        return parsedItem !== null ? parsedItem : defaultValue;
    } catch (error) {
        console.warn(`Error reading localStorage key “${key}”:`, error);
        return defaultValue;
    }
};

// Fungsi utama untuk mengambil semua statistik dasbor
export const getDashboardStats = () => {
    // 1. Total Siswa
    const allSiswa: Siswa[] = getDataFromLocalStorage('siswaData', []);
    const totalSiswa = Array.isArray(allSiswa) ? allSiswa.length : 0;

    // 2. Total Guru (menghitung semua peran)
    const teachersData = getDataFromLocalStorage('teachersData', {});
    let totalGuru = 0;
    if (teachersData && typeof teachersData === 'object' && !Array.isArray(teachersData)) {
        // Tambah 1 untuk Wakasek Kesiswaan yang mungkin tidak ada di daftar
        totalGuru = 1;
        Object.values(teachersData).forEach((roleArray: any) => {
            if (Array.isArray(roleArray)) {
                totalGuru += roleArray.length;
            }
        });
    }

    // 3. Jumlah Kelas
    const allKelas: Kelas[] = getDataFromLocalStorage('kelasData', []);
    const totalKelas = Array.isArray(allKelas) ? allKelas.length : 0;
    
    // 4. Kehadiran Hari Ini
    const riwayatKehadiran: Kehadiran[] = getDataFromLocalStorage('kehadiranSiswa', []);
    const today = format(new Date(), "yyyy-MM-dd");
    
    const kehadiranHariIni = Array.isArray(riwayatKehadiran) ? riwayatKehadiran.filter(k => k.tanggal === today) : [];
    const hadir = kehadiranHariIni.filter(k => k.status === 'Hadir').length;
    
    // Gunakan totalSiswa yang valid untuk perhitungan persentase
    const kehadiranPercentage = totalSiswa > 0 ? ((hadir / totalSiswa) * 100).toFixed(0) + "%" : "0%";

    // 5. Pelanggaran Hari Ini
    const riwayatCatatan: CatatanSiswa[] = getDataFromLocalStorage('riwayatCatatan', []);
    const pelanggaranHariIni = Array.isArray(riwayatCatatan) ? riwayatCatatan.filter(
        c => c.tanggal === today && c.tipe === 'pelanggaran'
    ).length : 0;

    return {
        totalSiswa,
        totalGuru,
        totalKelas,
        kehadiranHariIni: kehadiranPercentage,
        pelanggaranHariIni,
    };
};
