
import { format, subDays, eachDayOfInterval, startOfDay, startOfMonth, endOfMonth, isWithinInterval } from "date-fns";
import { getSourceData } from "./data-manager";
import { tataTertibData } from "./tata-tertib-data";

// --- Tipe Data ---
interface Siswa { id: number; nis: string; nama: string; kelas: string; }
interface KehadiranPerSesi { tanggal: string; status: string; nis: string; kelas: string; }
interface CatatanPelanggaran { id: number; poin: number; pelanggaran: string; nis: string; status: string; }
interface Prestasi { nis: string; }
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
        const { schoolInfo, ...roles } = teachersData;
        Object.values(roles).forEach((roleArray: any) => {
            if (Array.isArray(roleArray)) {
                totalGuru += roleArray.length;
            }
        });
    }

    const riwayatPelanggaran: CatatanPelanggaran[] = getSourceData('riwayatPelanggaran', []);
    const totalPelanggaran = Array.isArray(riwayatPelanggaran) ? riwayatPelanggaran.length : 0;
    
    const laporanEskalasi = Array.isArray(riwayatPelanggaran)
        ? riwayatPelanggaran.filter(p => ['Diteruskan ke Wakasek', 'Diproses Wakasek'].includes(p.status)).length
        : 0;

    return {
        totalSiswa,
        totalGuru,
        totalPelanggaran,
        laporanEskalasi,
    };
};

/**
 * Menghitung jumlah siswa di setiap kelas.
 * @returns {Array<object>} Data untuk diagram batang jumlah siswa per kelas.
 */
export const getSiswaPerKelasData = () => {
    const allSiswa: Siswa[] = getSourceData('siswaData', []);
    const allKelas: any[] = getSourceData('kelasData', []);

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
    
    const allRules = Object.values(tataTertibData).flatMap(kategori =>
      Object.entries(kategori).flatMap(([tingkat, rules]) =>
        rules.map(rule => ({ ...rule, tingkat, kategori: Object.keys(tataTertibData).find(key => tataTertibData[key as keyof typeof tataTertibData] === kategori) }))
      )
    );

    riwayatPelanggaran.forEach(p => {
        const rule = allRules.find(r => r.deskripsi === p.pelanggaran);
        if (rule) {
            if (rule.tingkat === 'ringan') ringan++;
            else if (rule.tingkat === 'sedang') sedang++;
            else berat++;
        } else {
             if (p.poin <= 10) ringan++;
            else if (p.poin <= 20) sedang++;
            else berat++;
        }
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

/**
 * Mengambil dan mengolah semua data yang dibutuhkan untuk halaman Administrasi Wali Kelas.
 * @param selectedKelas Kelas yang dipilih untuk filtering data.
 * @returns {object} Objek berisi semua data yang telah diolah.
 */
export const getAdministrasiWaliKelasData = (selectedKelas: string) => {
    const currentUser = getSourceData('currentUser', null);
    if (!currentUser) return { currentUser: null, kelasBinaan: [] };
    
    const teachersData = getSourceData('teachersData', {});
    const waliKelasData = teachersData.wali_kelas?.find((wk: any) => wk.nama === currentUser.nama);
    const kelasBinaan = waliKelasData?.kelas || [];
    const filterKelas = selectedKelas ? [selectedKelas] : kelasBinaan.length > 0 ? [kelasBinaan[0]] : [];


    const allSiswa: Siswa[] = getSourceData('siswaData', []);
    const siswaBinaan = allSiswa.filter(s => filterKelas.includes(s.kelas));
    
    const allPelanggaran: any[] = getSourceData('riwayatPelanggaran', []);
    const allPrestasi: any[] = getSourceData('prestasiData', []);
    const allKehadiran: KehadiranPerSesi[] = getSourceData('kehadiranSiswaPerSesi', []);

    // Statistik
    const today = format(new Date(), "yyyy-MM-dd");
    const nisSiswaBinaan = new Set(siswaBinaan.map(s => s.nis));
    const kehadiranBinaanHariIni = allKehadiran.filter(k => k.tanggal === today && nisSiswaBinaan.has(k.nis));
    const hadirCount = kehadiranBinaanHariIni.filter(k => k.status === 'Hadir').length;
    const kehadiranRataRata = kehadiranBinaanHariIni.length > 0 ? `${((hadirCount / kehadiranBinaanHariIni.length) * 100).toFixed(0)}%` : "N/A";
    
    // Guru Mapel
    const guruMapelList = teachersData.guru_mapel || [];
    const guruDiKelas = new Map<string, string[]>();
    if (Array.isArray(guruMapelList)) {
        guruMapelList.forEach((guru: any) => {
            if (Array.isArray(guru.teachingAssignments)) {
                guru.teachingAssignments.forEach((assignment: any) => {
                    if (filterKelas.includes(assignment.className)) {
                        const currentGurus = guruDiKelas.get(assignment.subject) || [];
                        if (!currentGurus.includes(guru.nama)) {
                            guruDiKelas.set(assignment.subject, [...currentGurus, guru.nama]);
                        }
                    }
                });
            }
        });
    }

    // Rekap Kehadiran Bulanan
    const now = new Date();
    const interval = { start: startOfMonth(now), end: endOfMonth(now) };
    const rekapKehadiran = siswaBinaan.map(siswa => {
        const records = allKehadiran.filter(k => k.nis === siswa.nis && isWithinInterval(new Date(k.tanggal), interval));
        const totalRecords = records.length;
        const hadir = records.filter(k => k.status === 'Hadir').length;
        const sakit = records.filter(k => k.status === 'Sakit').length;
        const izin = records.filter(k => k.status === 'Izin').length;
        const alpa = records.filter(k => k.status === 'Alpa' || k.status === 'Bolos').length;
        return {
            nis: siswa.nis,
            nama: siswa.nama,
            hadir, sakit, izin, alpa,
            persentase: totalRecords > 0 ? (hadir / totalRecords) * 100 : 100,
        };
    });

    // Catatan Perilaku
    const catatanPelanggaran = allPelanggaran.filter(p => nisSiswaBinaan.has(p.nis)).map(p => ({ tanggal: p.tanggal, tipe: 'pelanggaran', deskripsi: p.pelanggaran, poin: p.poin, nama: p.namaSiswa }));
    const catatanPrestasi = allPrestasi.filter(p => nisSiswaBinaan.has(p.nis)).map(p => ({ tanggal: p.tanggal, tipe: 'prestasi', deskripsi: p.deskripsi, nama: p.namaSiswa }));
    const catatanPerilaku = [...catatanPelanggaran, ...catatanPrestasi].sort((a,b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime());
    
    // Rekap Poin
    const rekapPoin = siswaBinaan.map(siswa => {
        const totalPoin = allPelanggaran.filter(p => p.nis === siswa.nis).reduce((sum, c) => sum + (c.poin || 0), 0);
        const totalPrestasi = allPrestasi.filter(p => p.nis === siswa.nis).length;
        return { ...siswa, totalPoin, totalPrestasi };
    }).sort((a, b) => b.totalPoin - a.totalPoin);
    
    const siswaPoinTertinggi = rekapPoin[0] ? { nama: rekapPoin[0].nama, poin: rekapPoin[0].totalPoin } : { nama: "N/A", poin: 0 };
    
    return {
        currentUser,
        kelasBinaan,
        totalSiswa: siswaBinaan.length,
        kehadiranRataRata,
        siswaPoinTertinggi,
        siswa: siswaBinaan,
        guruMapel: guruDiKelas,
        rekapKehadiran,
        catatanPerilaku,
        rekapPoin,
    };
};
