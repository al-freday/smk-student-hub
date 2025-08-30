
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
    "Fitriani", "Gunawan Perkasa", "Herlina Sari", "Indra Wijaya", "Joko Susilo", 
    "Kartika Putri", "Lina Marlina", "Muhammad Yusuf", "Nadia Puspita", "Olivia Rahman", 
    "Putri Amelia", "Rahmawati", "Siti Aisyah", "Tono Martono", "Umar Abdullah"
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
    { deskripsi: "Mencorat-coret meja, kursi, atau dinding.", poin: 15 },
    { deskripsi: "Merokok di lingkungan sekolah.", poin: 20 },
    { deskripsi: "Mengancam guru atau teman.", poin: 40 },
];
const PRESTASI_LIST = [
    { deskripsi: "Juara 1 Lomba Cerdas Cermat Tingkat Kabupaten", tingkat: "Kabupaten", jenis: "Akademik" },
    { deskripsi: "Juara 2 Lomba Futsal Antar Sekolah", tingkat: "Kabupaten", jenis: "Non-Akademik" },
    { deskripsi: "Mengikuti Olimpiade Sains Nasional", tingkat: "Nasional", jenis: "Akademik" },
    { deskripsi: "Peringkat 1 di Kelas", tingkat: "Sekolah", jenis: "Akademik" }
];

const DAFTAR_HARI = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
const SESI_PELAJARAN = ["I-II", "III-IV", "V-VI", "VII-VIII", "IX-X"];
const STATUS_KEHADIRAN = ['Hadir', 'Sakit', 'Izin', 'Alpa'];

// --- Helper Functions ---
const randomElement = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)];
const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

// --- Data Generation Functions ---

function generateSiswaData(totalSiswa = 120) {
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
    // Assign roles to specific teachers for consistency
    const waliKelas = GURU_NAMES.slice(0, 12).map((nama, i) => ({ id: i + 1, nama: nama, kelas: [KELAS_LIST[i].nama], password: `password${i + 1}` }));
    const guruBK = [
        { id: 101, nama: GURU_NAMES[12], tugasKelas: "Kelas X", password: "password101" },
        { id: 102, nama: GURU_NAMES[13], tugasKelas: "Kelas XI", password: "password102" },
        { id: 103, nama: GURU_NAMES[14], tugasKelas: "Kelas XII", password: "password103" },
    ];
    const guruMapel = GURU_NAMES.slice(0, 10).map((nama, i) => ({
        id: 201 + i,
        nama,
        password: `password${201+i}`,
        teachingAssignments: Array.from({ length: 5 }).map((_, j) => ({
            id: (201+i)*100+j,
            subject: randomElement(MATA_PELAJARAN),
            className: randomElement(KELAS_LIST).nama,
            day: DAFTAR_HARI[j + 1],
            session: randomElement(SESI_PELAJARAN)
        }))
    }));
    const guruPiket = GURU_NAMES.slice(15, 18).map((nama, i) => ({
        id: 301 + i,
        nama,
        password: `password${301+i}`,
        tanggalPiket: eachDayOfInterval({ start: subDays(new Date(), 30), end: new Date() })
            .filter(date => getDay(date) === (i + 1))
            .map(date => format(date, 'yyyy-MM-dd'))
    }));
    const guruPendamping = GURU_NAMES.slice(18, 20).map((nama, i) => {
        const siswaBinaan = siswaData.filter((_, idx) => idx % 2 === i).slice(0, 15).map(s => s.nama);
        return {
            id: 401 + i,
            nama,
            password: `password${401+i}`,
            kelas: [...new Set(siswaData.filter(s => siswaBinaan.includes(s.nama)).map(s => s.kelas))],
            siswaBinaan: siswaBinaan
        };
    });

    return {
        schoolInfo: {
            schoolName: "SMKN 2 Tana Toraja",
            headmasterName: "Bapak Drs. John Doe, M.Pd.",
            logo: "https://picsum.photos/200",
        },
        wali_kelas: waliKelas,
        guru_bk: guruBK,
        guru_mapel: guruMapel,
        guru_piket: guruPiket,
        guru_pendamping: guruPendamping,
    };
}

function generateRecords(siswaData: any[], teachersData: any, days = 30) {
    const pelanggaran = [];
    const prestasi = [];
    const kehadiran = [];
    const endDate = new Date();
    const startDate = subDays(endDate, days);
    const interval = eachDayOfInterval({ start: startDate, end: endDate });

    // Generate Attendance
    interval.forEach(date => {
        const dayOfWeek = getDay(date);
        if (dayOfWeek > 0 && dayOfWeek < 6) { // Monday to Friday
            siswaData.forEach(siswa => {
                SESI_PELAJARAN.forEach(sesi => {
                    const status = Math.random() < 0.95 ? 'Hadir' : randomElement(STATUS_KEHADIRAN.slice(1));
                    kehadiran.push({
                        id: `${siswa.nis}-${format(date, 'yyyy-MM-dd')}-${sesi}`,
                        nis: siswa.nis, nama: siswa.nama, kelas: siswa.kelas,
                        tanggal: format(date, 'yyyy-MM-dd'),
                        sesi: sesi,
                        mataPelajaran: randomElement(MATA_PELAJARAN),
                        status: status,
                        guruPencatat: randomElement(teachersData.guru_mapel).nama
                    });
                });
            });
        }
    });

    // Generate Violations with Workflow
    for (let i = 0; i < 50; i++) {
        const siswa = randomElement(siswaData);
        const rule = randomElement(PELANGGARAN_LIST);
        const date = randomElement(interval);
        const pelapor = randomElement([...teachersData.guru_mapel, ...teachersData.guru_piket, ...teachersData.guru_pendamping]).nama;
        
        // Simulate workflow progression
        let status: 'Dilaporkan' | 'Ditindaklanjuti Wali Kelas' | 'Diteruskan ke BK' | 'Selesai' = 'Dilaporkan';
        const chance = Math.random();
        if (chance > 0.3) status = 'Ditindaklanjuti Wali Kelas';
        if (chance > 0.6) status = 'Diteruskan ke BK';
        if (chance > 0.8) status = 'Selesai';
        
        pelanggaran.push({
            id: pelanggaran.length + 1,
            tanggal: format(date, 'yyyy-MM-dd'),
            nis: siswa.nis,
            namaSiswa: siswa.nama,
            kelas: siswa.kelas,
            pelanggaran: rule.deskripsi,
            poin: rule.poin,
            guruPelapor: pelapor,
            tindakanAwal: "Ditegur secara lisan.",
            status: status
        });
    }
    
    // Generate Achievements
     for (let i = 0; i < 20; i++) {
        const siswa = randomElement(siswaData);
        const achievement = randomElement(PRESTASI_LIST);
        const date = randomElement(interval);
        prestasi.push({
            id: prestasi.length + 1,
            tanggal: format(date, 'yyyy-MM-dd'),
            nis: siswa.nis, namaSiswa: siswa.nama, kelas: siswa.kelas,
            ...achievement
        });
     }

    return { pelanggaran, prestasi, kehadiran };
}

function generateTeacherLogs(teachersData: any) {
    // Simulate some reports being sent
    const waliKelasReportsStatus: { [key: string]: string } = {};
    teachersData.wali_kelas.slice(0, 5).forEach((guru: any) => {
        waliKelasReportsStatus[guru.id] = 'Terkirim';
    });
    teachersData.guru_bk.slice(0, 1).forEach((guru: any) => {
        waliKelasReportsStatus[guru.id] = 'Terkirim';
    });
    teachersData.guru_mapel.slice(0, 3).forEach((guru: any) => {
        waliKelasReportsStatus[guru.id] = 'Terkirim';
    });
    
    // Simulate assignment logs for notifications
    const assignmentLogData = [
        { id: 'log-1', timestamp: subDays(new Date(), 2).getTime(), user: teachersData.guru_piket[0].nama, role: 'Guru Piket', action: 'memperbarui detail penugasan.' },
        { id: 'log-2', timestamp: subDays(new Date(), 1).getTime(), user: teachersData.wali_kelas[3].nama, role: 'Wali Kelas', action: 'memperbarui detail penugasan.' }
    ];

    return { waliKelasReportsStatus, assignmentLogData };
}


// --- Main Export ---
let cachedData: any = null;

export const getAllSeedData = () => {
    if (cachedData) {
        return cachedData;
    }

    const siswaData = generateSiswaData();
    const teachersData = generateTeachersData(siswaData);
    const { pelanggaran, prestasi, kehadiran } = generateRecords(siswaData, teachersData);
    const { waliKelasReportsStatus, assignmentLogData } = generateTeacherLogs(teachersData);

    cachedData = {
        kelasData: KELAS_LIST,
        siswaData: siswaData,
        teachersData: teachersData,
        riwayatPelanggaran: pelanggaran,
        prestasiData: prestasi,
        kehadiranSiswaPerSesi: kehadiran,
        // Empty data for features not yet fully simulated
        teacherAttendanceData: [], 
        logBimbinganData: {},
        layananBimbinganData: [],
        rencanaIndividualData: [],
        // Data for simulated logs and reports
        assignmentLogData: assignmentLogData,
        waliKelasReportsStatus: waliKelasReportsStatus,
    };

    return cachedData;
};
