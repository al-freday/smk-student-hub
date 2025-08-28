
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserCheck, ShieldAlert, CheckCircle, XCircle, ArrowRight, Loader2 } from "lucide-react";
import { getSourceData } from "@/lib/data-manager";
import { format, getDay } from "date-fns";
import StatCard from "./stat-card";

const daftarHari = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

export default function GuruPiketDashboard() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<{ nama: string } | null>(null);
  const [isPiketToday, setIsPiketToday] = useState(false);
  const [stats, setStats] = useState({ hadir: 0, absen: 0 });

  const loadData = useCallback(() => {
    setIsLoading(true);
    try {
      const user = getSourceData('currentUser', null);
      if (!user) {
        router.push('/');
        return;
      }
      setCurrentUser(user);
      
      const teachersData = getSourceData('teachersData', {});
      const guruPiketData = teachersData.guru_piket?.find((gp: any) => gp.nama === user.nama);
      const piketDates = guruPiketData?.tanggalPiket || [];
      const todayStr = format(new Date(), 'yyyy-MM-dd');
      setIsPiketToday(piketDates.includes(todayStr));

      // Calculate teacher attendance stats for today
      const attendanceRecords = getSourceData('teacherAttendanceData', []);
      const todayRecords = attendanceRecords.filter((r: any) => r.tanggal === todayStr);
      const hadirCount = todayRecords.filter((r: any) => r.status === 'Hadir').length;
      const absenCount = todayRecords.length - hadirCount;
      setStats({ hadir: hadirCount, absen: absenCount });

    } catch (error) {
      console.error("Gagal memuat data dasbor Guru Piket:", error);
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadData();
    window.addEventListener('dataUpdated', loadData);
    return () => window.removeEventListener('dataUpdated', loadData);
  }, [loadData]);

  if (isLoading) {
    return (
      <div className="flex-1 flex justify-center items-center h-[calc(100vh-8rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Dasbor Guru Piket</CardTitle>
          <CardDescription>
            Selamat datang, {currentUser?.nama}. Berikut adalah ringkasan tugas Anda untuk hari ini.
          </CardDescription>
        </CardHeader>
        <CardContent>
            {isPiketToday ? (
                <div className="flex items-center gap-4 p-4 bg-green-100 dark:bg-green-900/30 rounded-lg border border-green-200 dark:border-green-800">
                    <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400"/>
                    <div>
                        <h3 className="font-semibold text-green-800 dark:text-green-300">Anda Bertugas Piket Hari Ini</h3>
                        <p className="text-sm text-green-700 dark:text-green-400">Silakan pantau kehadiran guru dan kelancaran KBM.</p>
                    </div>
                </div>
            ) : (
                 <div className="flex items-center gap-4 p-4 bg-secondary rounded-lg">
                    <XCircle className="h-8 w-8 text-muted-foreground"/>
                    <div>
                        <h3 className="font-semibold">Tidak Ada Jadwal Piket</h3>
                        <p className="text-sm text-muted-foreground">Menurut jadwal, Anda tidak bertugas piket hari ini.</p>
                    </div>
                </div>
            )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-6">
            <StatCard title="Guru Hadir" value={stats.hadir.toString()} icon={<CheckCircle/>} description="Berdasarkan data absensi hari ini" isLoading={isLoading} />
            <StatCard title="Guru Tidak Hadir" value={stats.absen.toString()} icon={<XCircle/>} description="Sakit, Izin, atau Tanpa Keterangan" isNegative={stats.absen > 0} isLoading={isLoading} />
        </div>

        <Card className="md:col-span-2 bg-primary text-primary-foreground">
            <CardHeader>
                <CardTitle>Akses Cepat Tugas Piket</CardTitle>
                <CardDescription className="text-primary-foreground/80">Gunakan tautan ini untuk tugas utama Anda.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <Button variant="secondary" className="w-full justify-between text-base py-6" onClick={() => router.push('/dashboard/kehadiran-guru')}>
                    <span><UserCheck className="inline-block mr-2"/>Catat Kehadiran Guru</span>
                    <ArrowRight/>
                </Button>
                <Button variant="secondary" className="w-full justify-between text-base py-6" onClick={() => router.push('/dashboard/manajemen-pelanggaran')}>
                    <span><ShieldAlert className="inline-block mr-2"/>Lapor Pelanggaran Siswa</span>
                    <ArrowRight/>
                </Button>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
