
import { format, subDays, eachDayOfInterval, getDay, addDays } from 'date-fns';

// --- Data Dasar ---
const KELAS_LIST = [
    { id: 1, nama: "X TKJ 1" }, { id: 2, nama: "X TKJ 2" },
    { id: 3, nama: "X OT 1" }, { id: 4, nama: "X OT 2" },
    { id: 5, nama: "XI TKJ 1" }, { id: 6, nama: "XI TKJ 2" },
    { id: 7, nama: "XI OT 1" }, { id: 8, nama: "XI OT 2" },
    { id: 9, nama: "XII TKJ 1" }, { id: 10, nama: "XII TKJ 2" },
    { id: 11, nama: "XII OT 1" }, { id: 12, nama: "XII OT 2" },
];

const GURU_NAMES = [
    "Ahmad Dahlan", "Budi Santoso", "Citra Lestari", "Dewi Anggraini", "Eko Prasetyo",
    "Fitriani", "Gunawan", "Herlina", "Indra Wijaya", "Joko Susilo", "Kartika Sari",
    "Lina Marlina", "Muhammad Yusuf", "Nadia Putri", "Olivia", "Putri Amelia",
    "Rahmawati", "Siti Aisyah", "Tono", "Umar"
];

const SISWA_FIRST_NAMES = [
    "Adi", "Agus", "Ayu", "Bambang", "Bayu", "Cahya", "Citra", "Dedi", "Dian", "Eka",
    "Fajar", "Fitri", "Galih", "Gita", "Hadi", "Hana", "Indah", "Joko", "Kartika", "Lia",
    "Mega", "Nanda", "Putra", "Rina", "Sari", "Tia", "Wahyu", "Yani", "Zaki"
];
const SISWA_LAST_NAMES = [
    "Wijaya", "Kusuma", "Lestari", "Pratama", "Saputra", "Wati", "Nugroho", "Setiawan",
    "Hidayat", "Ramadhan", "Febrianti", "Maulana", "Gunawan"
];

const MATA_PELAJARAN = ["Matematika", "Bahasa Indonesia", "Bahasa Inggris", "Dasar-dasar Program Keahlian", "Informatika"];
const PELANGGARAN_LIST = [
    { deskripsi: "Datang terlambat tanpa alasan.", poin: 5 },
    { deskripsi: "Seragam tidak dimasukkan.", poin: 3 },
    { deskripsi: "Tidak membawa buku sesuai jadwal.", poin: 5 },
    { deskripsi: "Membuang sampah sembarangan.", poin: 5 },
    { deskripsi: "Bolos pelajaran.", poin: 10 },
];
const PRESTASI_LIST = [
    { deskripsi: "Juara 1 Lomba Cerdas Cermat Tingkat Kabupaten", tingkat: "Kabupaten", jenis: "Akademik" },
    { deskripsi: "Juara 2 Lomba Futsal Antar Sekolah", tingkat: "Kabupaten", jenis: "Non-Akademik" },
    { deskripsi: "Mengikuti Olimpiade Sains Nasional", tingkat: "Nasional", jenis: "Akademik" },
    { deskripsi: "Peringkat 1 di Kelas", tingkat: "Sekolah", jenis: "Akademik" }
];

const DAFTAR_HARI = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
const SESI_PELAJARAN = ["I-II", "III-IV", "V-VI", "VII-VIII", "IX-X"];
const STATUS_KEHADIRAN = ['Hadir', 'Sakit', 'Izin', 'Alpa', 'Bolos'];

// --- Helper Functions ---
const randomElement = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)];
const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const createEmailFromName = (name: string, id: number | string) => {
    const namePart = name.toLowerCase().replace(/\s+/g, '.').replace(/[^a-z0-9.]/g, '');
    const idPart = String(id).split('-').pop();
    return `${namePart}${idPart}@schoolemail.com`;
};

// --- Data Generation Functions ---

function generateSiswaData(totalSiswa = 100) {
    const siswa = [];
    for (let i = 1; i <= totalSiswa; i++) {
        siswa.push({
            id: i,
            nis: `2024${String(i).padStart(4, '0')}`,
            nama: `${randomElement(SISWA_FIRST_NAMES)} ${randomElement(SISWA_LAST_NAMES)}`,
            kelas: randomElement(KELAS_LIST).nama,
        });
    }
    return siswa;
}

function generateTeachersData(siswaData: any[]) {
    const teachers = {
        schoolInfo: {
            schoolName: "SMKN 2 Tana Toraja",
            headmasterName: "Bapak Kepala Sekolah",
            logo: "",
        },
        wali_kelas: KELAS_LIST.map((kelas, i) => ({ id: i + 1, nama: GURU_NAMES[i], kelas: [kelas.nama] })),
        guru_bk: [
            { id: 1, nama: GURU_NAMES[12], tugasKelas: "Kelas X" },
            { id: 2, nama: GURU_NAMES[13], tugasKelas: "Kelas XI" },
            { id: 3, nama: GURU_NAMES[14], tugasKelas: "Kelas XII" },
        ],
        guru_mapel: GURU_NAMES.slice(0, 10).map((nama, i) => ({
            id: i + 1,
            nama,
            teachingAssignments: KELAS_LIST.slice(0, 5).map((kelas, j) => ({
                id: i * 100 + j,
                subject: MATA_PELAJARAN[j % MATA_PELAJARAN.length],
                className: kelas.nama,
                day: DAFTAR_HARI[j + 1],
                session: SESI_PELAJARAN[i % SESI_PELAJARAN.length]
            })),
        })),
        guru_piket: GURU_NAMES.slice(15, 18).map((nama, i) => ({
            id: i + 1,
            nama,
            tanggalPiket: eachDayOfInterval({ start: subDays(new Date(), 30), end: new Date() })
                .filter(date => getDay(date) === (i + 1))
                .map(date => format(date, 'yyyy-MM-dd'))
        })),
        guru_pendamping: GURU_NAMES.slice(18, 20).map((nama, i) => {
            const siswaBinaan = siswaData.filter((_, idx) => idx % 2 === i).slice(0, 10).map(s => s.nama);
            return {
                id: i + 1,
                nama,
                kelas: [...new Set(siswaData.filter(s => siswaBinaan.includes(s.nama)).map(s => s.kelas))],
                siswaBinaan: siswaBinaan
            };
        }),
    };
    return teachers;
}

function generateRecords(siswaData: any[], days = 30) {
    const pelanggaran = [];
    const prestasi = [];
    const kehadiran = [];
    const endDate = new Date();
    const startDate = subDays(endDate, days);
    const interval = eachDayOfInterval({ start: startDate, end: endDate });

    for (const siswa of siswaData) {
        // Generate a few violations/achievements per student
        for (let i = 0; i < randomInt(0, 5); i++) {
            const date = randomElement(interval);
            if (Math.random() > 0.3) { // More violations than achievements
                const rule = randomElement(PELANGGARAN_LIST);
                pelanggaran.push({
                    id: pelanggaran.length + 1,
                    tanggal: format(date, 'yyyy-MM-dd'),
                    nis: siswa.nis,
                    namaSiswa: siswa.nama,
                    kelas: siswa.kelas,
                    pelanggaran: rule.deskripsi,
                    poin: rule.poin,
                    guruPelapor: randomElement(GURU_NAMES),
                    tindakanAwal: "Ditegur secara lisan",
                    status: randomElement(['Dilaporkan', 'Ditindaklanjuti Wali Kelas', 'Selesai'])
                });
            } else {
                const achievement = randomElement(PRESTASI_LIST);
                prestasi.push({
                    id: prestasi.length + 1,
                    tanggal: format(date, 'yyyy-MM-dd'),
                    nis: siswa.nis,
                    namaSiswa: siswa.nama,
                    kelas: siswa.kelas,
                    ...achievement
                });
            }
        }
        
        // Generate attendance for each school day
        interval.forEach(date => {
            const dayOfWeek = getDay(date);
            if (dayOfWeek > 0 && dayOfWeek < 6) { // Monday to Friday
                SESI_PELAJARAN.forEach(sesi => {
                    // 90% chance to be present
                    const status = Math.random() < 0.9 ? 'Hadir' : randomElement(STATUS_KEHADIRAN.slice(1));
                    kehadiran.push({
                        id: `${siswa.nis}-${format(date, 'yyyy-MM-dd')}-${sesi}`,
                        nis: siswa.nis,
                        nama: siswa.nama,
                        kelas: siswa.kelas,
                        tanggal: format(date, 'yyyy-MM-dd'),
                        sesi: sesi,
                        mataPelajaran: randomElement(MATA_PELAJARAN),
                        status: status,
                        guruPencatat: randomElement(GURU_NAMES.slice(0, 10))
                    });
                });
            }
        });
    }
    return { pelanggaran, prestasi, kehadiran };
}


// --- Main Export ---

let cachedData: any = null;

export const getAllSeedData = () => {
    if (cachedData) {
        return cachedData;
    }

    const siswaData = generateSiswaData();
    const teachersData = generateTeachersData(siswaData);
    const { pelanggaran, prestasi, kehadiran } = generateRecords(siswaData);
    
    // Simulate other logs
    const logBimbinganData = {};
    const layananBimbinganData = [];
    const rencanaIndividualData = [];
    const assignmentLogData = [];
    const waliKelasReportsStatus = {};

    cachedData = {
        kelasData: KELAS_LIST,
        siswaData: siswaData,
        teachersData: teachersData,
        riwayatPelanggaran: pelanggaran,
        prestasiData: prestasi,
        kehadiranSiswaPerSesi: kehadiran,
        teacherAttendanceData: [], // Can be expanded similarly
        logBimbinganData: logBimbinganData,
        layananBimbinganData: layananBimbinganData,
        rencanaIndividualData: rencanaIndividualData,
        assignmentLogData: assignmentLogData,
        waliKelasReportsStatus: waliKelasReportsStatus,
    };

    return cachedData;
};

    