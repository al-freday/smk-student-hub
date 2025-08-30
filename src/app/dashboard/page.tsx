
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
import GuruMapelDashboard from "@/components/guru-mapel-dashboard";
import GuruPiketDashboard from "@/components/guru-piket-dashboard";
import GuruPendampingDashboard from "@/components/guru-pendamping-dashboard";

const getRoleDisplayName = (role: string) => {
    const roles: { [key: string]: string } = {
        wali_kelas: 'Wali Kelas',
        guru_bk: 'Guru BK',
        guru_mapel: 'Guru Mapel',
        guru_piket: 'Guru Piket',
        guru_pendamping: 'Guru Pendamping',
        wakasek_kesiswaan: 'Wakasek Kesiswaan',
        admin: 'Administrator'
    };
    return roles[role] || 'Pengguna';
};

const getWelcomeMessage = (role: string, name: string) => {
    switch (role) {
        case 'wakasek_kesiswaan':
            return `Selamat datang, ${name}. Anda dapat memantau seluruh aktivitas kesiswaan di sini.`;
        case 'wali_kelas':
            return `Selamat datang, ${name}. Dasbor ini menampilkan ringkasan dan tugas untuk kelas binaan Anda.`;
        case 'guru_bk':
            return `Selamat datang, ${name}. Fokus pada layanan responsif dan pemantauan siswa binaan Anda.`;
        case 'guru_mapel':
            return `Selamat datang, ${name}. Berikut adalah jadwal mengajar dan akses cepat tugas harian Anda.`;
        case 'guru_piket':
            return `Selamat datang, ${name}. Pantau kehadiran guru dan kelancaran KBM hari ini.`;
        case 'guru_pendamping':
            return `Selamat datang, ${name}. Kelola dan catat perkembangan setiap siswa binaan Anda.`;
        case 'admin':
            return `Anda sedang login sebagai Administrator. Gunakan panel admin untuk mengelola sistem.`;
        default:
            return `Selamat datang, ${name}.`;
    }
};

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
                <CardTitle>Panel Kontrol Administrator</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground mb-4">
                    Anda dapat kembali ke panel utama admin untuk mengelola pengguna dan pengaturan global.
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
        case 'guru_mapel':
            return <GuruMapelDashboard />;
        case 'guru_piket':
            return <GuruPiketDashboard />;
        case 'guru_pendamping':
            return <GuruPendampingDashboard />;
        case 'admin':
            return <AdminDashboard />;
        default:
             return <WakasekDashboard />; 
    }
}

export default function DashboardPage() {
    const router = useRouter();
    const [userRole, setUserRole] = useState("");
    const [userInfo, setUserInfo] = useState<{ name: string, role: string } | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    
    useEffect(() => {
        const role = localStorage.getItem('userRole');
        const user = localStorage.getItem('currentUser');

        if (!role || !user) {
            router.replace('/');
            return;
        }
        
        try {
            const parsedUser = JSON.parse(user);
            setUserInfo({ name: parsedUser.nama, role: parsedUser.role });
        } catch (e) {
            // Fallback if user data is malformed
            setUserInfo({ name: "Pengguna", role: getRoleDisplayName(role) });
        }

        setUserRole(role);
        setIsLoading(false);
    }, [router]);


    if (isLoading || !userInfo) {
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
                    Dasbor
                </h2>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>Selamat Datang, {userInfo.name}!</CardTitle>
                    <CardDescription>{getWelcomeMessage(userRole, userInfo.name)}</CardDescription>
                </CardHeader>
            </Card>

            {renderDashboardByRole(userRole)}
        </div>
    );
}
