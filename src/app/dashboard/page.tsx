
"use client";

import { useEffect, useState } from "react";
import { Activity, Users, School, UserCog, FileText, Loader2 } from "lucide-react";
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
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
                <Link href="/dashboard/kehadiran-siswa">
                    <StatCard
                        title="Kehadiran Hari Ini"
                        value={stats.kehadiranHariIni}
                        icon={<Activity className="h-4 w-4 text-muted-foreground" />}
                        description="Berdasarkan data absensi"
                        isLoading={isLoading}
                    />
                </Link>
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
                <h2 className="text-3xl font-bold tracking-tight">
                    {userRole === 'admin' ? 'Dasbor Admin' : 'Dasbor Wakasek Kesiswaan'}
                </h2>
            </div>
            
            {renderDashboardByRole(userRole)}
        </div>
    );
}
