
"use client";

import { useEffect, useState } from "react";
import { Activity, Users, UserCog, Loader2, ShieldAlert } from "lucide-react";
import StatCard from "@/components/stat-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getDashboardStats } from "@/lib/data";
import { useRouter } from "next/navigation";
import KehadiranLineChart from "@/components/kehadiran-line-chart";
import PelanggaranPieChart from "@/components/pelanggaran-pie-chart";
import SiswaPerKelasChart from "@/components/siswa-per-kelas-chart";
import WaliKelasDashboard from "@/components/wali-kelas-dashboard";
import { Button } from "@/components/ui/button";
import KonselingBkPage from "./konseling-bk/page";

const WakasekDashboard = () => {
    const [stats, setStats] = useState({
        totalSiswa: 0,
        totalGuru: 0,
        kehadiranHariIni: "0%",
        totalPelanggaran: 0,
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchStats = () => {
            const newStats = getDashboardStats();
            setStats(newStats);
            setIsLoading(false);
        };
        fetchStats();
        window.addEventListener('dataUpdated', fetchStats);
        return () => window.removeEventListener('dataUpdated', fetchStats);
    }, []);

    return (
        <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Total Siswa Aktif"
                    value={stats.totalSiswa.toLocaleString()}
                    icon={<Users className="h-4 w-4 text-muted-foreground" />}
                    description="Data dari Manajemen Siswa"
                    isLoading={isLoading}
                />
                <StatCard
                    title="Total Guru & Staf"
                    value={stats.totalGuru.toLocaleString()}
                    icon={<UserCog className="h-4 w-4 text-muted-foreground" />}
                    description="Jumlah seluruh pengguna terdaftar"
                    isLoading={isLoading}
                />
                <StatCard
                    title="Kehadiran Hari Ini"
                    value={stats.kehadiranHariIni}
                    icon={<Activity className="h-4 w-4 text-muted-foreground" />}
                    description="Rata-rata absensi per sesi"
                    isLoading={isLoading}
                />
                <StatCard
                    title="Total Pelanggaran"
                    value={stats.totalPelanggaran.toLocaleString()}
                    icon={<ShieldAlert className="h-4 w-4 text-muted-foreground" />}
                    description="Jumlah pelanggaran tercatat"
                    isLoading={isLoading}
                />
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Tren Kehadiran Siswa (30 Hari Terakhir)</CardTitle>
                        <CardDescription>Menampilkan persentase siswa yang hadir setiap hari.</CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <KehadiranLineChart />
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Proporsi Pelanggaran</CardTitle>
                        <CardDescription>Distribusi pelanggaran berdasarkan tingkatannya.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <PelanggaranPieChart />
                    </CardContent>
                </Card>
            </div>
             <Card>
                <CardHeader>
                    <CardTitle>Distribusi Siswa per Kelas</CardTitle>
                    <CardDescription>Menampilkan jumlah siswa di setiap kelas yang terdaftar.</CardDescription>
                </CardHeader>
                <CardContent className="pl-2">
                    <SiswaPerKelasChart />
                </CardContent>
            </Card>
        </>
    )
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
        case 'guru_bk':
            return <KonselingBkPage />;
        case 'admin':
            return <AdminDashboard />;
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
            <div className="flex-1 space-y-6 flex justify-center items-center h-[calc(100vh-8rem)]">
                 <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }
    
    return (
        <div className="flex-1 space-y-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">
                    {userRole === 'admin' ? 'Dasbor Admin' : 'Dasbor'}
                </h2>
            </div>
            
            {renderDashboardByRole(userRole)}
        </div>
    );
}

    