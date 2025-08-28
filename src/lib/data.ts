
import { format, subDays, eachDayOfInterval, startOfDay } from "date-fns";
import { getSourceData } from "./data-manager";
import { tataTertibData } from "./tata-tertib-data";

// --- Tipe Data ---
interface Siswa { id: number; nis: string; nama: string; kelas: string; }
interface KehadiranPerSesi { tanggal: string; status: string; nis: string; kelas: string; }
interface CatatanPelanggaran { id: number; poin: number; pelanggaran: string; }
interface Kelas { id: number; nama: string; }

// --- Fungsi Utama ---

/**
 * Mengambil dan menghitung statistik kunci untuk ditampilkan di dasbor.
 * @returns {object} Objek berisi statistik kunci.
 */
export const getDashboardStats = () => {
    const allSiswa: Siswa[] = getSourceData('siswaData', []);
    const totalSiswa = Array.isArray(allSiswa) ? allSiswa.length : 0;

    const teachersData = getSourceData('teachersData', {});
    let totalGuru = 0;
    if (teachersData && typeof teachersData === 'object' && !Array.isArray(teachersData)) {
        totalGuru = 1; 
        const { schoolInfo, ...roles } = teachersData;
        Object.values(roles).forEach((roleArray: any) => {
            if (Array.isArray(roleArray)) {
                totalGuru += roleArray.length;
            }
        });
    }

    const kehadiranSiswaPerSesi: KehadiranPerSesi[] = getSourceData('kehadiranSiswaPerSesi', []);
    const today = format(new Date(), "yyyy-MM-dd");
    
    const recordsToday = Array.isArray(kehadiranSiswaPerSesi) 
        ? kehadiranSiswaPerSesi.filter(k => k.tanggal === today) 
        : [];
    
    const hadirToday = recordsToday.filter(k => k.status === 'Hadir').length;
    
    const kehadiranPercentage = recordsToday.length > 0 
        ? ((hadirToday / recordsToday.length) * 100).toFixed(0) + "%" 
        : "N/A";

    const riwayatPelanggaran: CatatanPelanggaran[] = getSourceData('riwayatPelanggaran', []);
    const totalPelanggaran = Array.isArray(riwayatPelanggaran) ? riwayatPelanggaran.length : 0;

    return {
        totalSiswa,
        totalGuru,
        kehadiranHariIni: kehadiranPercentage,
        totalPelanggaran,
    };
};

/**
 * Menghitung jumlah siswa di setiap kelas.
 * @returns {Array<object>} Data untuk diagram batang jumlah siswa per kelas.
 */
export const getSiswaPerKelasData = () => {
    const allSiswa: Siswa[] = getSourceData('siswaData', []);
    const allKelas: Kelas[] = getSourceData('kelasData', []);

    if (!Array.isArray(allSiswa) || !Array.isArray(allKelas)) return [];

    const sortedKelas = allKelas.sort((a, b) => a.nama.localeCompare(b.nama));
    
    return sortedKelas.map(kelas => {
        const jumlahSiswa = allSiswa.filter(siswa => siswa.kelas === kelas.nama).length;
        return {
            name: kelas.nama,
            total: jumlahSiswa,
        };
    });
};

/**
 * Menghitung statistik pelanggaran berdasarkan tingkatannya.
 * @returns {Array<object>} Data untuk diagram lingkaran proporsi pelanggaran.
 */
export const getPelanggaranStats = () => {
    const riwayatPelanggaran: CatatanPelanggaran[] = getSourceData('riwayatPelanggaran', []);
    if (!Array.isArray(riwayatPelanggaran)) return [];

    let ringan = 0, sedang = 0, berat = 0;

    riwayatPelanggaran.forEach(p => {
        if (p.poin <= 10) ringan++;
        else if (p.poin <= 20) sedang++;
        else berat++;
    });

    return [
        { name: 'Ringan', value: ringan, fill: 'hsl(var(--chart-2))' },
        { name: 'Sedang', value: sedang, fill: 'hsl(var(--chart-3))' },
        { name: 'Berat', value: berat, fill: 'hsl(var(--chart-1))' },
    ].filter(item => item.value > 0);
};

/**
 * Menghitung tren kehadiran selama 30 hari terakhir.
 * @param filterKelas Opsional, array nama kelas untuk memfilter data kehadiran.
 * @returns {Array<object>} Data untuk diagram garis tren kehadiran.
 */
export const getKehadiranTrenBulanan = (filterKelas?: string[]) => {
    let allRecords: KehadiranPerSesi[] = getSourceData('kehadiranSiswaPerSesi', []);
    
    if (filterKelas && filterKelas.length > 0) {
        allRecords = allRecords.filter(record => filterKelas.includes(record.kelas));
    }

    if (!Array.isArray(allRecords) || allRecords.length === 0) {
        return [];
    }
    
    const today = startOfDay(new Date());
    const last30Days = eachDayOfInterval({
        start: subDays(today, 29),
        end: today,
    });

    const attendanceByDay: { [key: string]: { hadir: number; total: number } } = {};

    last30Days.forEach(day => {
        const formattedDate = format(day, 'yyyy-MM-dd');
        attendanceByDay[formattedDate] = { hadir: 0, total: 0 };
    });

    allRecords.forEach(record => {
        if (attendanceByDay[record.tanggal]) {
            attendanceByDay[record.tanggal].total++;
            if (record.status === 'Hadir') {
                attendanceByDay[record.tanggal].hadir++;
            }
        }
    });
    
    return Object.keys(attendanceByDay).map(date => {
        const dayData = attendanceByDay[date];
        const percentage = dayData.total > 0 ? (dayData.hadir / dayData.total) * 100 : 0;
        return {
            date: format(new Date(date), 'dd/MM'),
            Hadir: parseFloat(percentage.toFixed(1)),
        };
    }).sort((a, b) => new Date(a.date.split('/').reverse().join('-')).getTime() - new Date(b.date.split('/').reverse().join('-')).getTime());
};
