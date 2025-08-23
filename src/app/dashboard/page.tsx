
import { Activity, Users, School, ShieldAlert, UserCog } from "lucide-react";
import StatCard from "@/components/stat-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import AttendanceChart from "@/components/attendance-chart";
import InfractionsByCategoryChart from "@/components/infractions-by-category-chart";
import RecentReportsTable from "@/components/recent-reports-table";

export default function DashboardPage() {
    return (
        <div className="flex-1 space-y-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Dashboard Wakasek</h2>
            </div>

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
        </div>
    );
}
