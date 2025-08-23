
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
        return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
        console.warn(`Error reading localStorage key “${key}”:`, error);
        return defaultValue;
    }
};

// Fungsi utama untuk mengambil semua statistik dasbor
export const getDashboardStats = () => {
    // 1. Total Siswa
    const allSiswa: Siswa[] = getDataFromLocalStorage('siswaData', []);
    const totalSiswa = allSiswa.length;

    // 2. Total Guru (hanya Guru BK dan Guru Mapel)
    const teachersData = getDataFromLocalStorage('teachersData', {});
    let totalGuru = 0;
    if (teachersData && typeof teachersData === 'object' && 'guruBk' in teachersData && 'guruMapel' in teachersData) {
        const guruBkCount = Array.isArray(teachersData.guruBk) ? teachersData.guruBk.length : 0;
        const guruMapelCount = Array.isArray(teachersData.guruMapel) ? teachersData.guruMapel.length : 0;
        totalGuru = guruBkCount + guruMapelCount;
    }

    // 3. Jumlah Kelas
    const allKelas: Kelas[] = getDataFromLocalStorage('kelasData', []);
    const totalKelas = allKelas.length;
    
    // 4. Kehadiran Hari Ini
    const riwayatKehadiran: Kehadiran[] = getDataFromLocalStorage('kehadiranSiswa', []);
    const today = format(new Date(), "yyyy-MM-dd");
    const kehadiranHariIni = riwayatKehadiran.filter(k => k.tanggal === today);
    const hadir = kehadiranHariIni.filter(k => k.status === 'Hadir').length;
    const kehadiranPercentage = totalSiswa > 0 ? ((hadir / totalSiswa) * 100).toFixed(1) + "%" : "0%";

    // 5. Pelanggaran Hari Ini
    const riwayatCatatan: CatatanSiswa[] = getDataFromLocalStorage('riwayatCatatan', []);
    const pelanggaranHariIni = riwayatCatatan.filter(
        c => c.tanggal === today && c.tipe === 'pelanggaran'
    ).length;

    return {
        totalSiswa,
        totalGuru,
        totalKelas,
        kehadiranHariIni: kehadiranPercentage,
        pelanggaranHariIni,
    };
};
