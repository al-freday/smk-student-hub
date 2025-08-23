
"use client";

import { useEffect, useState } from "react";
import { Activity, Users, School, ShieldAlert, UserCog, FileText, Calendar, UserCheck, UserX } from "lucide-react";
import StatCard from "@/components/stat-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import AttendanceChart from "@/components/attendance-chart";
import InfractionsByCategoryChart from "@/components/infractions-by-category-chart";
import RecentReportsTable from "@/components/recent-reports-table";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const getRoleDisplayName = (role: string) => {
    switch (role) {
        case 'waliKelas': return 'Wali Kelas';
        case 'guruBk': return 'Guru BK';
        case 'guruMapel': return 'Guru Mata Pelajaran';
        case 'guruPiket': return 'Guru Piket';
        case 'guruPendamping': return 'Guru Pendamping';
        case 'wakasek': return 'Wakasek Kesiswaan';
        default: return 'Pengguna';
    }
};

const WakasekDashboard = () => (
    <>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <StatCard
                title="Total Siswa Aktif"
                value="1,250"
                icon={<Users className="h-4 w-4 text-muted-foreground" />}
                description="+20.1% dari bulan lalu"
            />
            <StatCard
                title="Total Guru"
                value="75"
                icon={<UserCog className="h-4 w-4 text-muted-foreground" />}
                description="Data terkini"
            />
            <StatCard
                title="Jumlah Kelas"
                value="30"
                icon={<School className="h-4 w-4 text-muted-foreground" />}
                description="Tahun ajaran 2024/2025"
            />
            <StatCard
                title="Kehadiran Hari Ini"
                value="95.3%"
                icon={<Activity className="h-4 w-4 text-muted-foreground" />}
                description="+1.2% dari kemarin"
            />
            <StatCard
                title="Pelanggaran Hari Ini"
                value="12"
                icon={<ShieldAlert className="h-4 w-4 text-muted-foreground" />}
                description="+5 dari kemarin"
                isNegative={true}
            />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Laporan Terbaru</CardTitle>
                        <CardDescription>Daftar pelanggaran dan prestasi siswa yang baru saja dicatat.</CardDescription>
                    </CardHeader>
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
);

const GeneralUserDashboard = ({ role }: { role: string }) => (
    <>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <StatCard
                title="Siswa Bimbingan"
                value="12"
                icon={<Users className="h-4 w-4 text-muted-foreground" />}
                description="Total siswa yang Anda tangani"
            />
            <StatCard
                title="Laporan Dibuat"
                value="5"
                icon={<FileText className="h-4 w-4 text-muted-foreground" />}
                description="Laporan bulan ini"
            />
             <StatCard
                title="Jadwal Mengajar/Piket"
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
                {role === 'waliKelas' && (
                    <Link href="/dashboard/laporan/wali-kelas">
                        <Button className="w-full justify-start text-base py-6">
                            <FileText className="mr-4 h-5 w-5"/> Buat Laporan Wali Kelas
                        </Button>
                    </Link>
                )}
                 {role === 'guruBk' && (
                    <Link href="/dashboard/laporan/guru-bk">
                        <Button className="w-full justify-start text-base py-6">
                            <FileText className="mr-4 h-5 w-5"/> Buat Laporan BK
                        </Button>
                    </Link>
                )}
                 {role === 'guruMapel' && (
                    <Link href="/dashboard/laporan/guru-mapel">
                        <Button className="w-full justify-start text-base py-6">
                            <FileText className="mr-4 h-5 w-5"/> Buat Laporan Mapel
                        </Button>
                    </Link>
                )}
                 {role === 'guruPiket' && (
                    <Link href="/dashboard/laporan/guru-piket">
                        <Button className="w-full justify-start text-base py-6">
                            <FileText className="mr-4 h-5 w-5"/> Buat Laporan Piket
                        </Button>
                    </Link>
                )}
                 {role === 'guruPendamping' && (
                    <Link href="/dashboard/laporan/guru-pendamping">
                        <Button className="w-full justify-start text-base py-6">
                            <FileText className="mr-4 h-5 w-5"/> Buat Laporan Pendamping
                        </Button>
                    </Link>
                )}
                 {(role === 'waliKelas' || role === 'guruBk') && (
                    <Link href="/dashboard/manajemen-siswa">
                        <Button variant="secondary" className="w-full justify-start text-base py-6">
                            <Users className="mr-4 h-5 w-5"/> Lihat Data Siswa
                        </Button>
                    </Link>
                )}
                 <Link href="/dashboard/tata-tertib">
                    <Button variant="secondary" className="w-full justify-start text-base py-6">
                        <ShieldAlert className="mr-4 h-5 w-5"/> Lihat Tata Tertib
                    </Button>
                </Link>
            </CardContent>
        </Card>
    </>
);

export default function DashboardPage() {
    const [userRole, setUserRole] = useState("");

    useEffect(() => {
        const role = localStorage.getItem('userRole') || 'wakasek';
        setUserRole(role);
    }, []);

    if (!userRole) {
        return <div>Loading...</div>; // Atau tampilkan skeleton loader
    }
    
    return (
        <div className="flex-1 space-y-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Dashboard {getRoleDisplayName(userRole)}</h2>
            </div>
            
            {userRole === 'wakasek' ? <WakasekDashboard /> : <GeneralUserDashboard role={userRole} />}
        </div>
    );
}
