
import { format, subDays, eachDayOfInterval, getDay, addDays } from 'date-fns';
import { initialKurikulumData } from './kurikulum-data';
import { initialEkskulData } from './ekskul-data';

// --- Data Dasar Kosong ---
const KELAS_LIST = [
    { id: 1, nama: "X TKJ 1" }, { id: 2, nama: "X TKJ 2" },
    { id: 3, nama: "X OT 1" }, { id: 4, nama: "X OT 2" },
    { id: 5, nama: "XI TKJ 1" }, { id: 6, nama: "XI TKJ 2" },
    { id: 7, nama: "XI OT 1" }, { id: 8, nama: "XI OT 2" },
    { id: 9, nama: "XII TKJ 1" }, { id: 10, nama: "XII TKJ 2" },
    { id: 11, nama: "XII OT 1" }, { id: 12, nama: "XII OT 2" },
];

const initialTeachersData = {
    schoolInfo: {
        schoolName: "SMKN 2 Tana Toraja",
        headmasterName: "Nama Kepala Sekolah",
        logo: "",
    },
    wali_kelas: [],
    guru_bk: [],
    guru_mapel: [],
    guru_piket: [],
    guru_pendamping: [],
};


// --- Main Export ---
let cachedData: any = null;

export const getAllSeedData = () => {
    if (cachedData) {
        return cachedData;
    }

    cachedData = {
        // Data master
        kelasData: KELAS_LIST,
        kurikulumData: initialKurikulumData,
        ekskulData: initialEkskulData,
        
        // Data pengguna (kosong, diisi oleh Admin)
        siswaData: [],
        teachersData: initialTeachersData,

        // Data transaksional (kosong)
        riwayatPelanggaran: [],
        prestasiData: [],
        kehadiranSiswaPerSesi: [],
        teacherAttendanceData: [], 
        logBimbinganData: {},
        layananBimbinganData: [],
        rencanaIndividualData: [],
        assignmentLogData: [],
        waliKelasReportsStatus: {},
    };

    return cachedData;
};
