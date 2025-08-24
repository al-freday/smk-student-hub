
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

const getRoleDisplayName = (role: string) => {
    switch (role) {
        case 'waliKelas': return 'Wali Kelas';
        case 'guruBk': return 'Guru BK';
        case 'guruMapel': return 'Guru Mata Pelajaran';
        case 'guruPiket': return 'Guru Piket';
        case 'guruPendamping': return 'Guru Pendamping';
        case 'wakasek': return 'Wakasek Kesiswaan';
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
                        title="Jumlah Kelas"
                        value={stats.totalKelas.toLocaleString()}
                        icon={<School className="h-4 w-4 text-muted-foreground" />}
                        description="Data dari Manajemen Kelas"
                        isLoading={isLoading}
                    />
                </Link>
                <Link href="/dashboard/manajemen-siswa/kehadiran-siswa">
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
                         <Link href="/dashboard/laporan">
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
        kelasBinaan: "",
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        const teachersData = JSON.parse(localStorage.getItem('teachersData') || '{}');
        const waliKelasData = teachersData.waliKelas?.find((wk: any) => wk.nama === currentUser.nama);

        if (waliKelasData) {
            const kelasBinaan = waliKelasData.kelas;
            const siswaData = JSON.parse(localStorage.getItem('siswaData') || '[]');
            const siswaDiKelas = siswaData.filter((s: any) => s.kelas === kelasBinaan);
            
            // Logika untuk menghitung statistik spesifik kelas
            const jumlahSiswa = siswaDiKelas.length;
            
            setStats({
                jumlahSiswa: jumlahSiswa,
                kehadiranRataRata: "97%", // Contoh statis, bisa dikembangkan
                totalPelanggaran: 15, // Contoh statis
                siswaBermasalah: 3, // Contoh statis
                kelasBinaan: kelasBinaan,
            });
        }
        setIsLoading(false);
    }, []);


    const studentsNeedingAttention = [
        { id: 1, name: "Ahmad Budi", class: stats.kelasBinaan, points: 45, reason: "Sering terlambat" },
        { id: 2, name: "Citra Dewi", class: stats.kelasBinaan, points: 30, reason: "Tidak mengerjakan PR 3x" },
        { id: 3, name: "Eka Putra", class: stats.kelasBinaan, points: 25, reason: "Absen tanpa keterangan" },
    ];

    return (
        <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Link href="/dashboard/laporan/wali-kelas">
                    <StatCard
                        title="Jumlah Siswa Kelas"
                        value={stats.jumlahSiswa.toString()}
                        icon={<Users className="h-4 w-4 text-muted-foreground" />}
                        description={`Kelas ${stats.kelasBinaan}`}
                        isLoading={isLoading}
                    />
                </Link>
                 <Link href="/dashboard/laporan/wali-kelas">
                    <StatCard
                        title="Kehadiran Rata-rata"
                        value={stats.kehadiranRataRata}
                        icon={<UserCheck className="h-4 w-4 text-muted-foreground" />}
                        description="Bulan ini"
                        isLoading={isLoading}
                    />
                </Link>
                 <Link href="/dashboard/laporan/wali-kelas">
                    <StatCard
                        title="Total Pelanggaran"
                        value={stats.totalPelanggaran.toString()}
                        icon={<ShieldAlert className="h-4 w-4 text-muted-foreground" />}
                        description="Bulan ini"
                        isNegative
                        isLoading={isLoading}
                    />
                </Link>
                 <Link href="/dashboard/laporan/wali-kelas">
                    <StatCard
                        title="Siswa Bermasalah"
                        value={stats.siswaBermasalah.toString()}
                        icon={<UserX className="h-4 w-4 text-muted-foreground" />}
                        description="Perlu perhatian khusus"
                        isNegative
                        isLoading={isLoading}
                    />
                </Link>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
                 <div className="lg:col-span-3">
                    <Card>
                        <CardHeader>
                            <CardTitle>Grafik Absensi Kelas (Minggu Ini)</CardTitle>
                            <CardDescription>Perbandingan kehadiran siswa di kelas Anda.</CardDescription>
                        </CardHeader>
                        <CardContent className="pl-2">
                            <AttendanceChart />
                        </CardContent>
                    </Card>
                 </div>
                 <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Pelanggaran Kelas</CardTitle>
                            <CardDescription>Distribusi pelanggaran di kelas Anda.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <InfractionsByCategoryChart />
                        </CardContent>
                    </Card>
                 </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-destructive" />
                        Siswa Perlu Perhatian
                    </CardTitle>
                    <CardDescription>Daftar siswa dengan poin pelanggaran tertinggi atau catatan khusus.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nama Siswa</TableHead>
                                <TableHead>Poin</TableHead>
                                <TableHead>Keterangan</TableHead>
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
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </>
    );
};

const GeneralUserDashboard = ({ role }: { role: string }) => {
    const quickLinks = {
        guruBk: {
            primary: { href: "/dashboard/laporan/guru-bk", label: "Buat Laporan BK", icon: FileText },
            secondary: [
                { href: "/dashboard/manajemen-siswa", label: "Lihat Data Siswa", icon: Users },
                { href: "/dashboard/tata-tertib", label: "Lihat Tata Tertib", icon: ShieldAlert },
            ]
        },
        guruMapel: {
            primary: { href: "/dashboard/laporan/guru-mapel", label: "Buat Laporan Mapel", icon: FileText },
            secondary: [
                { href: "/dashboard/jadwal-pelajaran", label: "Lihat Jadwal", icon: Calendar },
                { href: "/dashboard/tata-tertib", label: "Lihat Tata Tertib", icon: ShieldAlert },
            ]
        },
        guruPiket: {
            primary: { href: "/dashboard/laporan/guru-piket", label: "Buat Laporan Piket", icon: FileText },
            secondary: [
                 { href: "/dashboard/tata-tertib", label: "Lihat Tata Tertib", icon: ShieldAlert },
            ]
        },
        guruPendamping: {
            primary: { href: "/dashboard/laporan/guru-pendamping", label: "Buat Laporan Pendamping", icon: FileText },
            secondary: [
                 { href: "/dashboard/tata-tertib", label: "Lihat Tata Tertib", icon: ShieldAlert },
            ]
        },
    };

    const links = quickLinks[role as keyof typeof quickLinks] || quickLinks.guruPiket; // Default case

    return (
        <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <StatCard
                    title="Siswa Ditangani"
                    value="12"
                    icon={<Users className="h-4 w-4 text-muted-foreground" />}
                    description="Total siswa bimbingan Anda"
                />
                <StatCard
                    title="Laporan Dibuat"
                    value="5"
                    icon={<FileText className="h-4 w-4 text-muted-foreground" />}
                    description="Laporan bulan ini"
                />
                 <StatCard
                    title="Jadwal Anda"
                    value="3 Sesi"
                    icon={<Calendar className="h-4 w-4 text-muted-foreground" />}
                    description="Jadwal minggu ini"
                />
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Akses Cepat</CardTitle>
                    <CardDescription>Pintasan ke fitur yang paling sering Anda gunakan.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2">
                    <Link href={links.primary.href}>
                        <Button className="w-full justify-start text-base py-6 h-auto">
                            <links.primary.icon className="mr-4 h-5 w-5"/> {links.primary.label}
                        </Button>
                    </Link>
                    {links.secondary.map(link => (
                         <Link href={link.href} key={link.href}>
                            <Button variant="secondary" className="w-full justify-start text-base py-6 h-auto">
                                <link.icon className="mr-4 h-5 w-5"/> {link.label}
                            </Button>
                        </Link>
                    ))}
                </CardContent>
            </Card>
        </>
    );
};

const AdminDashboard = () => {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Dasbor Admin</CardTitle>
                <CardDescription>Selamat datang di panel kontrol administrator.</CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground mb-4">
                    Gunakan panel admin untuk mengelola pengguna, pengaturan global, dan memantau aktivitas sistem.
                </p>
                <div className="flex gap-4">
                    <Link href="/admin/dashboard" passHref>
                        <Button>Lanjutkan ke Panel Admin</Button>
                    </Link>
                </div>
            </CardContent>
        </Card>
    );
};


const renderDashboardByRole = (role: string) => {
    switch (role) {
        case 'wakasek':
            return <WakasekDashboard />;
        case 'waliKelas':
            return <WaliKelasDashboard />;
        case 'admin':
            return <AdminDashboard />;
        case 'guruBk':
        case 'guruMapel':
        case 'guruPiket':
        case 'guruPendamping':
            return <GeneralUserDashboard role={role} />;
        default:
             return <WakasekDashboard />; // Fallback default
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
