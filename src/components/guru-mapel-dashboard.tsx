
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ClipboardList, ShieldAlert, CalendarClock, Loader2, ArrowRight } from "lucide-react";
import { getSourceData } from "@/lib/data-manager";
import { format, getDay } from "date-fns";

interface Jadwal {
  id: number;
  hari: string;
  sesi: string;
  kelas: string;
  mataPelajaran: string;
  guru: string;
}

const daftarHari = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

export default function GuruMapelDashboard() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<{ nama: string } | null>(null);
  const [jadwalHariIni, setJadwalHariIni] = useState<Jadwal[]>([]);

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
      const guruMapelList = teachersData.guru_mapel || [];
      const generatedJadwal: Jadwal[] = [];
      
      if (Array.isArray(guruMapelList)) {
        guruMapelList.forEach((guru: any) => {
          if (guru.nama === user.nama && Array.isArray(guru.teachingAssignments)) {
            guru.teachingAssignments.forEach((assignment: any) => {
              generatedJadwal.push({
                ...assignment,
                guru: guru.nama,
              });
            });
          }
        });
      }

      const hariIni = daftarHari[getDay(new Date())];
      const jadwal = generatedJadwal
        .filter(j => j.hari === hariIni)
        .sort((a, b) => a.sesi.localeCompare(b.sesi));
      setJadwalHariIni(jadwal);

    } catch (error) {
      console.error("Gagal memuat data dasbor Guru Mapel:", error);
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
          <CardTitle>Dasbor Guru Mata Pelajaran</CardTitle>
          <CardDescription>
            Selamat datang, {currentUser?.nama}. Berikut adalah jadwal mengajar Anda untuk hari ini, {format(new Date(), "eeee, dd MMMM yyyy")}.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="flex flex-col">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><CalendarClock/> Jadwal Mengajar Hari Ini</CardTitle>
                <CardDescription>Daftar kelas yang akan Anda ajar hari ini.</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
                 {jadwalHariIni.length > 0 ? (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Jam Ke-</TableHead>
                                <TableHead>Kelas</TableHead>
                                <TableHead>Mata Pelajaran</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {jadwalHariIni.map(j => (
                                <TableRow key={j.id}>
                                    <TableCell className="font-medium">{j.sesi}</TableCell>
                                    <TableCell>{j.kelas}</TableCell>
                                    <TableCell>{j.mataPelajaran}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                 ) : (
                    <div className="flex items-center justify-center h-full text-center text-muted-foreground">
                        <p>Tidak ada jadwal mengajar untuk Anda hari ini.</p>
                    </div>
                 )}
            </CardContent>
        </Card>

        <div className="space-y-6">
            <Card className="bg-primary text-primary-foreground">
                <CardHeader>
                    <CardTitle>Akses Cepat</CardTitle>
                    <CardDescription className="text-primary-foreground/80">Gunakan tautan ini untuk tugas harian Anda.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Button variant="secondary" className="w-full justify-between" onClick={() => router.push('/dashboard/kehadiran-siswa')}>
                        <span><ClipboardList className="inline-block mr-2"/>Input Kehadiran Siswa</span>
                        <ArrowRight/>
                    </Button>
                    <Button variant="secondary" className="w-full justify-between" onClick={() => router.push('/dashboard/manajemen-pelanggaran')}>
                        <span><ShieldAlert className="inline-block mr-2"/>Lapor Pelanggaran Siswa</span>
                        <ArrowRight/>
                    </Button>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}

    