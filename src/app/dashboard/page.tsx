
"use client";

import { useEffect, useState } from "react";
import { Activity, Users, UserCog, Loader2 } from "lucide-react";
import StatCard from "@/components/stat-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import AttendanceChart from "@/components/attendance-chart";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getDashboardStats } from "@/lib/data";
import { useRouter } from "next/navigation";

const WakasekDashboard = () => {
    const [stats, setStats] = useState({
        totalSiswa: 0,
        totalGuru: 0,
        kehadiranHariIni: "0%",
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchStats = () => {
            const newStats = getDashboardStats();
            setStats(newStats);
            setIsLoading(false);
        };
        fetchStats();
        // Listener untuk memperbarui statistik jika data berubah di tab lain
        window.addEventListener('dataUpdated', fetchStats);
        return () => window.removeEventListener('dataUpdated', fetchStats);
    }, []);

    return (
        <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Link href="/dashboard/manajemen-siswa" passHref>
                    <StatCard
                        title="Total Siswa Aktif"
                        value={stats.totalSiswa.toLocaleString()}
                        icon={<Users className="h-4 w-4 text-muted-foreground" />}
                        description="Data dari Manajemen Siswa"
                        isLoading={isLoading}
                    />
                </Link>
                 <Link href="/dashboard/manajemen-guru" passHref>
                    <StatCard
                        title="Total Guru & Staf"
                        value={stats.totalGuru.toLocaleString()}
                        icon={<UserCog className="h-4 w-4 text-muted-foreground" />}
                        description="Jumlah seluruh pengguna terdaftar"
                        isLoading={isLoading}
                    />
                </Link>
                <Link href="/dashboard/kehadiran-siswa" passHref>
                    <StatCard
                        title="Rata-Rata Kehadiran Hari Ini"
                        value={stats.kehadiranHariIni}
                        icon={<Activity className="h-4 w-4 text-muted-foreground" />}
                        description="Berdasarkan absensi per jam pelajaran"
                        isLoading={isLoading}
                    />
                </Link>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Grafik Rata-Rata Kehadiran Siswa (5 Hari Terakhir)</CardTitle>
                    <CardDescription>Menampilkan persentase siswa yang hadir berdasarkan data absensi per sesi.</CardDescription>
                </CardHeader>
                <CardContent className="pl-2">
                    <AttendanceChart />
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
        case 'admin':
            return <AdminDashboard />;
        default:
             // Default ke dashboard Wakasek untuk peran lain agar tidak kosong
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
            // Jika tidak ada peran, kembali ke halaman login
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
                    {userRole === 'admin' ? 'Dasbor Admin' : 'Dasbor Kesiswaan'}
                </h2>
            </div>
            
            {renderDashboardByRole(userRole)}
        </div>
    );
}
