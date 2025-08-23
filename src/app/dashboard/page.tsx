
"use client";

import { useEffect, useState } from "react";
import { Activity, Users, School, ShieldAlert, UserCog, FileText, Calendar, UserCheck, UserX, AlertTriangle } from "lucide-react";
import StatCard from "@/components/stat-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import AttendanceChart from "@/components/attendance-chart";
import InfractionsByCategoryChart from "@/components/infractions-by-category-chart";
import RecentReportsTable from "@/components/recent-reports-table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

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

const WaliKelasDashboard = () => {
    const studentsNeedingAttention = [
        { id: 1, name: "Ahmad Budi", class: "X OT 1", points: 45, reason: "Sering terlambat" },
        { id: 2, name: "Citra Dewi", class: "X OT 1", points: 30, reason: "Tidak mengerjakan PR 3x" },
        { id: 3, name: "Eka Putra", class: "X OT 1", points: 25, reason: "Absen tanpa keterangan" },
    ];

    return (
        <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Jumlah Siswa Kelas"
                    value="40"
                    icon={<Users className="h-4 w-4 text-muted-foreground" />}
                    description="Kelas X OT 1"
                />
                <StatCard
                    title="Kehadiran Rata-rata"
                    value="97%"
                    icon={<UserCheck className="h-4 w-4 text-muted-foreground" />}
                    description="Bulan ini"
                />
                <StatCard
                    title="Total Pelanggaran"
                    value="15"
                    icon={<ShieldAlert className="h-4 w-4 text-muted-foreground" />}
                    description="Bulan ini"
                    isNegative
                />
                 <StatCard
                    title="Siswa Bermasalah"
                    value="3"
                    icon={<UserX className="h-4 w-4 text-muted-foreground" />}
                    description="Perlu perhatian khusus"
                    isNegative
                />
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


const renderDashboardByRole = (role: string) => {
    switch (role) {
        case 'wakasek':
            return <WakasekDashboard />;
        case 'waliKelas':
            return <WaliKelasDashboard />;
        default:
            return <GeneralUserDashboard role={role} />;
    }
}

export default function DashboardPage() {
    const [userRole, setUserRole] = useState("");

    useEffect(() => {
        const role = localStorage.getItem('userRole') || 'wakasek';
        setUserRole(role);
    }, []);

    if (!userRole) {
        return (
            <div className="flex-1 space-y-6">
                <div className="space-y-2">
                    <h2 className="text-3xl font-bold tracking-tight">Memuat Dasbor...</h2>
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                    <Card><CardHeader><CardTitle className="h-5 w-3/4 bg-muted rounded"></CardTitle></CardHeader><CardContent><div className="h-8 w-1/2 bg-muted rounded"></div></CardContent></Card>
                    <Card><CardHeader><CardTitle className="h-5 w-3/4 bg-muted rounded"></CardTitle></CardHeader><CardContent><div className="h-8 w-1/2 bg-muted rounded"></div></CardContent></Card>
                    <Card><CardHeader><CardTitle className="h-5 w-3/4 bg-muted rounded"></CardTitle></CardHeader><CardContent><div className="h-8 w-1/2 bg-muted rounded"></div></CardContent></Card>
                    <Card><CardHeader><CardTitle className="h-5 w-3/4 bg-muted rounded"></CardTitle></CardHeader><CardContent><div className="h-8 w-1/2 bg-muted rounded"></div></CardContent></Card>
                    <Card><CardHeader><CardTitle className="h-5 w-3/4 bg-muted rounded"></CardTitle></CardHeader><CardContent><div className="h-8 w-1/2 bg-muted rounded"></div></CardContent></Card>
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

