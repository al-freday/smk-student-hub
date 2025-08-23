import { Activity, Users } from "lucide-react";
import StatCard from "@/components/stat-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import AttendanceChart from "@/components/attendance-chart";

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
