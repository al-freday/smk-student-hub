
"use client";

import { useEffect, useState } from "react";
import { Activity, Users, School, ShieldAlert, UserCog, FileText, Calendar, UserCheck, UserX, AlertTriangle, Loader2 } from "lucide-react";
import StatCard from "@/components/stat-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import AttendanceChart from "@/components/attendance-chart";
import InfractionsByCategoryChart from "@/components/infractions-by-category-chart";
import RecentReportsTable from "@/components/recent-reports-table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { getDashboardStats } from "@/lib/data";
import { useRouter } from "next/navigation";
import { getSourceData } from "@/lib/data-manager";

const getRoleDisplayName = (role: string) => {
    switch (role) {
        case 'wali_kelas': return 'Wali Kelas';
        case 'guru_bk': return 'Guru BK';
        case 'guru_mapel': return 'Guru Mata Pelajaran';
        case 'guru_piket': return 'Guru Piket';
        case 'guru_pendamping': return 'Guru Pendamping';
        case 'wakasek_kesiswaan': return 'Wakasek Kesiswaan';
        case 'admin': return 'Administrator';
        default: return 'Pengguna';
    }
};

const WakasekDashboard = () => {
    const [stats, setStats] = useState({
        totalSiswa: 0,
        totalGuru: 0,
        totalKelas: 0,
        kehadiranHariIni: "0%",
        pelanggaranHariIni: 0,
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchStats = () => {
            const newStats = getDashboardStats();
            setStats(newStats);
            setIsLoading(false);
        };
        fetchStats();
    }, []);

    return (
        <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                <Link href="/dashboard/manajemen-siswa">
                    <StatCard
                        title="Total Siswa Aktif"
                        value={stats.totalSiswa.toLocaleString()}
                        icon={<Users className="h-4 w-4 text-muted-foreground" />}
                        description="Data dari Manajemen Siswa"
                        isLoading={isLoading}
                    />
                </Link>
                 <Link href="/dashboard/manajemen-guru">
                    <StatCard
                        title="Total Guru"
                        value={stats.totalGuru.toLocaleString()}
                        icon={<UserCog className="h-4 w-4 text-muted-foreground" />}
                        description="Data dari Manajemen Guru"
                        isLoading={isLoading}
                    />
                </Link>
                <Link href="/dashboard/manajemen-kelas">
                    <StatCard
                        title="Total Kelas"
                        value={stats.totalKelas.toLocaleString()}
                        icon={<School className="h-4 w-4 text-muted-foreground" />}
                        description="Jumlah kelas terdaftar"
                        isLoading={isLoading}
                    />
                </Link>
                <Link href="/dashboard/kehadiran-siswa">
                    <StatCard
                        title="Kehadiran Hari Ini"
                        value={stats.kehadiranHariIni}
                        icon={<Activity className="h-4 w-4 text-muted-foreground" />}
                        description="Berdasarkan data absensi"
                        isLoading={isLoading}
                    />
                </Link>
                <Link href="/dashboard/tata-tertib">
                    <StatCard
                        title="Pelanggaran Hari Ini"
                        value={stats.pelanggaranHariIni.toLocaleString()}
                        icon={<ShieldAlert className="h-4 w-4 text-muted-foreground" />}
                        description="Data dari Tata Tertib"
                        isNegative={stats.pelanggaranHariIni > 0}
                        isLoading={isLoading}
                    />
                </Link>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2">
                    <Card>
                         <Link href="/dashboard/tata-tertib">
                            <CardHeader>
                                <CardTitle>Laporan Terbaru</CardTitle>
                                <CardDescription>Daftar pelanggaran dan prestasi siswa yang baru saja dicatat.</CardDescription>
                            </CardHeader>
                        </Link>
                        <CardContent>
                            <RecentReportsTable />
                        </CardContent>
                    </Card>
                </div>
                <div className="lg:col-span-1">
                    <Card>
                        <CardHeader>
                            <CardTitle>Pelanggaran Berdasarkan Kategori</CardTitle>
                            <CardDescription>Distribusi total pelanggaran siswa.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <InfractionsByCategoryChart />
                        </CardContent>
                    </Card>
                </div>
            </div>

            <div className="grid gap-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Grafik Absensi Siswa (Minggu Ini)</CardTitle>
                        <CardDescription>Perbandingan kehadiran siswa selama 5 hari terakhir.</CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <AttendanceChart />
                    </CardContent>
                </Card>
            </div>
        </>
    )
};

const WaliKelasDashboard = () => {
    const [stats, setStats] = useState({
        jumlahSiswa: 0,
        kehadiranRataRata: "0%",
        totalPelanggaran: 0,
        siswaBermasalah: 0,
        kelasBinaan: [],
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const currentUser = getSourceData('currentUser', {});
        const teachersData = getSourceData('teachersData', {});
        const waliKelasData = teachersData.wali_kelas?.find((wk: any) => wk.nama === currentUser.nama);

        if (waliKelasData && Array.isArray(waliKelasData.kelas)) {
            const kelasBinaan = waliKelasData.kelas;
            const siswaData = getSourceData('siswaData', []);
            const siswaDiKelas = siswaData.filter((s: any) => kelasBinaan.includes(s.kelas));
            
            const jumlahSiswa = siswaDiKelas.length;
            
            // Placeholder logic for stats
            const riwayatCatatan = getSourceData('riwayatCatatan', []);
            const pelanggaranDiKelas = riwayatCatatan.filter((r:any) => r.tipe === 'pelanggaran' && kelasBinaan.includes(r.kelas));
            
            setStats({
                jumlahSiswa: jumlahSiswa,
                kehadiranRataRata: "97%", // Placeholder
                totalPelanggaran: pelanggaranDiKelas.length,
                siswaBermasalah: 3, // Placeholder
                kelasBinaan: kelasBinaan,
            });
        }
        setIsLoading(false);
    }, []);


    const studentsNeedingAttention = [
        { id: 1, name: "Siswa A", class: stats.kelasBinaan[0] || '', points: 45, reason: "Sering terlambat" },
        { id: 2, name: "Siswa B", class: stats.kelasBinaan[0] || '', points: 30, reason: "Tidak mengerjakan PR 3x" },
        { id: 3, name: "Siswa C", class: stats.kelasBinaan[0] || '', points: 25, reason: "Absen tanpa keterangan" },
    ];

    return (
        <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                 <StatCard
                    title="Jumlah Siswa Binaan"
                    value={stats.jumlahSiswa.toString()}
                    icon={<Users className="h-4 w-4 text-muted-foreground" />}
                    description={`Di ${stats.kelasBinaan.length} kelas`}
                    isLoading={isLoading}
                />
                 <StatCard
                    title="Kehadiran Rata-rata"
                    value={stats.kehadiranRataRata}
                    icon={<UserCheck className="h-4 w-4 text-muted-foreground" />}
                    description="Bulan ini"
                    isLoading={isLoading}
                />
                 <StatCard
                    title="Total Pelanggaran"
                    value={stats.totalPelanggaran.toString()}
                    icon={<ShieldAlert className="h-4 w-4 text-muted-foreground" />}
                    description="Di kelas Anda bulan ini"
                    isNegative
                    isLoading={isLoading}
                />
                 <StatCard
                    title="Siswa Perlu Perhatian"
                    value={stats.siswaBermasalah.toString()}
                    icon={<UserX className="h-4 w-4 text-muted-foreground" />}
                    description="Membutuhkan bimbingan"
                    isNegative
                    isLoading={isLoading}
                />
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-destructive" />
                        Siswa Perlu Perhatian Khusus
                    </CardTitle>
                    <CardDescription>Daftar siswa dengan poin pelanggaran tertinggi atau catatan khusus di kelas Anda.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nama Siswa</TableHead>
                                <TableHead>Poin Pelanggaran</TableHead>
                                <TableHead>Keterangan</TableHead>
                                <TableHead className="text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {studentsNeedingAttention.map((student) => (
                                <TableRow key={student.id}>
                                    <TableCell className="font-medium">{student.name}</TableCell>
                                    <TableCell>
                                        <Badge variant="destructive">{student.points}</Badge>
                                    </TableCell>
                                    <TableCell>{student.reason}</TableCell>
                                     <TableCell className="text-right">
                                        <Link href="/dashboard/tata-tertib">
                                            <Button variant="outline" size="sm">Tindak Lanjut</Button>
                                        </Link>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </>
    );
};

const GeneralUserDashboard = () => {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Selamat Datang!</CardTitle>
                <CardDescription>Gunakan menu di sebelah kiri untuk mengakses fitur yang Anda butuhkan.</CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground mb-4">
                   Pilih menu Laporan untuk membuat atau melihat laporan, atau pilih menu lainnya sesuai dengan tugas Anda.
                </p>
                <div className="flex gap-4">
                    <Link href="/dashboard/laporan" passHref>
                        <Button>
                            <FileText className="mr-2 h-4 w-4" />
                            Buka Pusat Laporan
                        </Button>
                    </Link>
                     <Link href="/dashboard/jadwal-pelajaran" passHref>
                        <Button variant="secondary">
                             <Calendar className="mr-2 h-4 w-4" />
                            Lihat Jadwal
                        </Button>
                    </Link>
                </div>
            </CardContent>
        </Card>
    );
};

const AdminDashboard = () => {
    const router = useRouter();
    return (
        <Card>
            <CardHeader>
                <CardTitle>Dasbor Admin</CardTitle>
                <CardDescription>Selamat datang di panel kontrol administrator.</CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground mb-4">
                    Anda sedang login sebagai Admin. Anda dapat kembali ke panel utama admin untuk mengelola pengguna dan pengaturan global.
                </p>
                <div className="flex gap-4">
                    <Button onClick={() => router.push('/admin/dashboard')}>
                        Kembali ke Panel Admin
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};


const renderDashboardByRole = (role: string) => {
    switch (role) {
        case 'wakasek_kesiswaan':
            return <WakasekDashboard />;
        case 'wali_kelas':
            return <WaliKelasDashboard />;
        case 'admin':
            return <AdminDashboard />;
        case 'guru_bk':
        case 'guru_mapel':
        case 'guru_piket':
        case 'guru_pendamping':
            return <GeneralUserDashboard />;
        default:
             return <WakasekDashboard />; 
    }
}

export default function DashboardPage() {
    const router = useRouter();
    const [userRole, setUserRole] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    
    useEffect(() => {
        const role = localStorage.getItem('userRole');
        if (!role) {
            router.replace('/');
            return;
        }
        setUserRole(role);
        setIsLoading(false);
    }, [router]);


    if (isLoading) {
        return (
            <div className="flex-1 space-y-6">
                <div className="flex justify-center items-center h-screen">
                     <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            </div>
        );
    }
    
    return (
        <div className="flex-1 space-y-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Dasbor {getRoleDisplayName(userRole)}</h2>
            </div>
            
            {renderDashboardByRole(userRole)}
        </div>
    );
}
