
import { format, subDays, eachDayOfInterval } from "date-fns";
import { getSourceData } from "./data-manager";

// --- Tipe Data ---
interface Siswa { id: number; nis: string; nama: string; kelas: string; }
interface KehadiranPerSesi { tanggal: string; status: string; }

// --- Fungsi Utama ---

/**
 * Mengambil dan menghitung statistik kunci untuk ditampilkan di dasbor.
 * @returns {object} Objek berisi statistik total siswa, guru, dan kehadiran hari ini.
 */
export const getDashboardStats = () => {
    // 1. Total Siswa
    const allSiswa: Siswa[] = getSourceData('siswaData', []);
    const totalSiswa = Array.isArray(allSiswa) ? allSiswa.length : 0;

    // 2. Total Guru & Staf (menghitung semua peran)
    const teachersData = getSourceData('teachersData', {});
    let totalGuru = 0;
    if (teachersData && typeof teachersData === 'object' && !Array.isArray(teachersData)) {
        // Tambah 1 untuk Wakasek Kesiswaan
        totalGuru = 1; 
        const { schoolInfo, ...roles } = teachersData;
        Object.values(roles).forEach((roleArray: any) => {
            if (Array.isArray(roleArray)) {
                totalGuru += roleArray.length;
            }
        });
    }

    // 3. Rata-rata Kehadiran Hari Ini (berdasarkan data per sesi)
    const kehadiranSiswaPerSesi: KehadiranPerSesi[] = getSourceData('kehadiranSiswaPerSesi', []);
    const today = format(new Date(), "yyyy-MM-dd");
    
    const recordsToday = Array.isArray(kehadiranSiswaPerSesi) 
        ? kehadiranSiswaPerSesi.filter(k => k.tanggal === today) 
        : [];
    
    const hadirToday = recordsToday.filter(k => k.status === 'Hadir').length;
    
    const kehadiranPercentage = recordsToday.length > 0 
        ? ((hadirToday / recordsToday.length) * 100).toFixed(0) + "%" 
        : "N/A";

    return {
        totalSiswa,
        totalGuru,
        kehadiranHariIni: kehadiranPercentage,
    };
};


/**
 * Mengambil dan memproses data kehadiran siswa untuk ditampilkan di grafik.
 * @returns {Array<object>} Array data yang diformat untuk diagram batang.
 */
export const getAttendanceChartData = () => {
    const allRecords: KehadiranPerSesi[] = getSourceData('kehadiranSiswaPerSesi', []);
    if (!Array.isArray(allRecords) || allRecords.length === 0) {
        return [];
    }
    
    const today = new Date();
    const last5Days = eachDayOfInterval({
        start: subDays(today, 4),
        end: today,
    });

    const attendanceByDay: { [key: string]: { hadir: number; total: number } } = {};

    // Inisialisasi semua hari dalam rentang
    last5Days.forEach(day => {
        const formattedDate = format(day, 'yyyy-MM-dd');
        attendanceByDay[formattedDate] = { hadir: 0, total: 0 };
    });

    // Proses data kehadiran
    allRecords.forEach(record => {
        if (attendanceByDay[record.tanggal]) {
            attendanceByDay[record.tanggal].total++;
            if (record.status === 'Hadir') {
                attendanceByDay[record.tanggal].hadir++;
            }
        }
    });
    
    // Format data untuk grafik
    const formattedData = Object.keys(attendanceByDay).map(date => {
        const dayData = attendanceByDay[date];
        const percentage = dayData.total > 0 ? (dayData.hadir / dayData.total) * 100 : 0;
        return {
            tanggal: date,
            persentaseHadir: parseFloat(percentage.toFixed(1)),
        };
    }).sort((a, b) => new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime());

    return formattedData;
};
