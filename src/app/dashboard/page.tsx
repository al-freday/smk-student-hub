
"use client";

import { useEffect, useState } from "react";
import { Activity, Users, School, ShieldAlert, UserCog, FileText, Calendar, UserCheck, UserX, AlertTriangle, Loader2, BookCopy, Handshake, Newspaper } from "lucide-react";
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
            
            const jumlahSiswa = siswaDiKelas.length;
            
            setStats({
                jumlahSiswa: jumlahSiswa,
                kehadiranRataRata: "97%", 
                totalPelanggaran: 15,
                siswaBermasalah: 3,
                kelasBinaan: kelasBinaan,
            });
        }
        setIsLoading(false);
    }, []);


    const studentsNeedingAttention = [
        { id: 1, name: "Siswa A", class: stats.kelasBinaan, points: 45, reason: "Sering terlambat" },
        { id: 2, name: "Siswa B", class: stats.kelasBinaan, points: 30, reason: "Tidak mengerjakan PR 3x" },
        { id: 3, name: "Siswa C", class: stats.kelasBinaan, points: 25, reason: "Absen tanpa keterangan" },
    ];

    return (
        <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                 <StatCard
                    title="Jumlah Siswa Kelas"
                    value={stats.jumlahSiswa.toString()}
                    icon={<Users className="h-4 w-4 text-muted-foreground" />}
                    description={`Kelas ${stats.kelasBinaan}`}
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

const GeneralUserDashboard = ({ role }: { role: string }) => {
    const quickLinks = {
        guru_bk: {
            primary: { href: "/dashboard/laporan/guru-bk", label: "Lihat Laporan & Kolaborasi", icon: Handshake },
            secondary: [
                { href: "/dashboard/tata-tertib", label: "Lihat Data Masalah Siswa", icon: ShieldAlert },
                { href: "/dashboard/manajemen-siswa", label: "Lihat Data Siswa", icon: Users },
            ]
        },
        guru_mapel: {
            primary: { href: "/dashboard/laporan/guru-mapel", label: "Buat Laporan Harian", icon: FileText },
            secondary: [
                { href: "/dashboard/jadwal-pelajaran", label: "Rencana Pembelajaran", icon: Calendar },
                { href: "/dashboard/tata-tertib", label: "Lihat Penilaian", icon: ShieldAlert },
            ]
        },
        guru_piket: {
            primary: { href: "/dashboard/laporan/guru-piket", label: "Buat Laporan Piket", icon: Newspaper },
            secondary: [
                 { href: "/dashboard/manajemen-siswa", label: "Cek Absensi & Disiplin", icon: UserCheck },
                 { href: "/dashboard/tata-tertib", label: "Lihat Tata Tertib", icon: ShieldAlert },
            ]
        },
        guru_pendamping: {
            primary: { href: "/dashboard/laporan/guru-pendamping", label: "Buat Laporan Pendampingan", icon: Handshake },
            secondary: [
                 { href: "/dashboard/manajemen-kelas", label: "Manajemen Kelas", icon: School },
                 { href: "/dashboard/tata-tertib", label: "Lihat Tata Tertib", icon: ShieldAlert },
            ]
        },
    };

    const links = quickLinks[role as keyof typeof quickLinks] || quickLinks.guru_piket;

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle>Akses Cepat</CardTitle>
                    <CardDescription>Pintasan ke fitur yang paling sering Anda gunakan.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
            return <GeneralUserDashboard role={role} />;
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
