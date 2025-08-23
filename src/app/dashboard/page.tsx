import { Activity, FileText, ShieldAlert, Users } from "lucide-react";
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

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Total Siswa Aktif"
                    value="1,250"
                    icon={<Users className="h-4 w-4 text-muted-foreground" />}
                    description="+20.1% dari bulan lalu"
                />
                <StatCard
                    title="Kehadiran Hari Ini"
                    value="95.3%"
                    icon={<Activity className="h-4 w-4 text-muted-foreground" />}
                    description="+1.2% dari kemarin"
                />
                <StatCard
                    title="Pelanggaran Bulan Ini"
                    value="78"
                    icon={<ShieldAlert className="h-4 w-4 text-muted-foreground" />}
                    description="-5.4% dari bulan lalu"
                    isNegative
                />
                <StatCard
                    title="Laporan Masuk"
                    value="12"
                    icon={<FileText className="h-4 w-4 text-muted-foreground" />}
                    description="+3 laporan baru hari ini"
                />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Grafik Absensi Siswa (Minggu Ini)</CardTitle>
                        <CardDescription>Perbandingan kehadiran siswa selama 5 hari terakhir.</CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <AttendanceChart />
                    </CardContent>
                </Card>
                <Card className="col-span-4 lg:col-span-3">
                    <CardHeader>
                        <CardTitle>Pelanggaran Berdasarkan Kategori</CardTitle>
                        <CardDescription>Distribusi pelanggaran siswa bulan ini.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <InfractionsByCategoryChart />
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Laporan Terbaru</CardTitle>
                    <CardDescription>
                        Laporan pelanggaran dan prestasi yang baru saja masuk.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <RecentReportsTable />
                </CardContent>
            </Card>
        </div>
    );
}
