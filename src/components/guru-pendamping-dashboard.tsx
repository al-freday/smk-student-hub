
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, ShieldAlert, Trophy, Loader2, ArrowRight, Contact } from "lucide-react";
import { getSourceData } from "@/lib/data-manager";
import StatCard from "./stat-card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Badge } from "./ui/badge";

interface Siswa {
  id: number;
  nis: string;
  nama: string;
  kelas: string;
}

interface Catatan {
  tipe: 'pelanggaran' | 'prestasi';
  nis: string;
  poin?: number;
}

interface SiswaBinaan extends Siswa {
  totalPoin: number;
  totalPrestasi: number;
  catatanTerakhir: string;
}

export default function GuruPendampingDashboard() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<{ nama: string } | null>(null);
  const [siswaBinaan, setSiswaBinaan] = useState<SiswaBinaan[]>([]);
  const [stats, setStats] = useState({ totalSiswa: 0, totalPoin: 0, totalPrestasi: 0 });

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
      const guruData = teachersData.guru_pendamping?.find((gp: any) => gp.nama === user.nama);
      const daftarNamaSiswaBinaan = guruData?.siswaBinaan || [];

      const allSiswa: Siswa[] = getSourceData('siswaData', []);
      const siswaPendampingan = allSiswa.filter(s => daftarNamaSiswaBinaan.includes(s.nama));

      const pelanggaranData: any[] = getSourceData('riwayatPelanggaran', []);
      const prestasiData: any[] = getSourceData('prestasiData', []);

      const detailSiswaBinaan = siswaPendampingan.map(siswa => {
        const pelanggaranSiswa = pelanggaranData.filter(p => p.nis === siswa.nis);
        const prestasiSiswa = prestasiData.filter(p => p.nis === siswa.nis);
        
        const totalPoin = pelanggaranSiswa.reduce((sum, p) => sum + (p.poin || 0), 0);
        const totalPrestasi = prestasiSiswa.length;

        const catatanTerakhir = pelanggaranSiswa.length > 0
          ? `Pelanggaran: ${pelanggaranSiswa.sort((a,b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime())[0].pelanggaran}`
          : "Belum ada catatan pelanggaran.";

        return { ...siswa, totalPoin, totalPrestasi, catatanTerakhir };
      }).sort((a, b) => b.totalPoin - a.totalPoin);
      
      setSiswaBinaan(detailSiswaBinaan);

      setStats({
        totalSiswa: detailSiswaBinaan.length,
        totalPoin: detailSiswaBinaan.reduce((sum, s) => sum + s.totalPoin, 0),
        totalPrestasi: detailSiswaBinaan.reduce((sum, s) => sum + s.totalPrestasi, 0)
      });

    } catch (error) {
      console.error("Gagal memuat data dasbor Guru Pendamping:", error);
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
          <CardTitle>Dasbor Guru Pendamping</CardTitle>
          <CardDescription>
            Selamat datang, {currentUser?.nama}. Berikut adalah ringkasan siswa binaan Anda.
          </CardDescription>
        </CardHeader>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Siswa Binaan" value={stats.totalSiswa.toString()} icon={<Users/>} isLoading={isLoading} />
        <StatCard title="Total Poin Pelanggaran" value={stats.totalPoin.toString()} icon={<ShieldAlert/>} isNegative={stats.totalPoin > 0} isLoading={isLoading} />
        <StatCard title="Total Prestasi" value={stats.totalPrestasi.toString()} icon={<Trophy/>} isLoading={isLoading} />
        <Card className="md:col-span-2 lg:col-span-1 bg-primary text-primary-foreground flex flex-col justify-center">
            <CardHeader>
                <CardTitle>Ruang Kerja Anda</CardTitle>
            </CardHeader>
            <CardContent>
                <Button variant="secondary" className="w-full justify-between text-base" onClick={() => router.push('/dashboard/bimbingan-siswa')}>
                    <span><Contact className="inline-block mr-2"/>Kelola Bimbingan</span>
                    <ArrowRight/>
                </Button>
            </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
            <CardTitle>Pemantauan Siswa Binaan</CardTitle>
            <CardDescription>
                Daftar siswa diurutkan berdasarkan poin pelanggaran tertinggi untuk pemantauan proaktif.
            </CardDescription>
        </CardHeader>
        <CardContent>
            {siswaBinaan.length > 0 ? (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nama Siswa</TableHead>
                            <TableHead>Kelas</TableHead>
                            <TableHead className="text-center">Poin Pelanggaran</TableHead>
                            <TableHead className="text-center">Jumlah Prestasi</TableHead>
                            <TableHead>Catatan Terakhir</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {siswaBinaan.map(siswa => (
                            <TableRow key={siswa.id}>
                                <TableCell className="font-medium">{siswa.nama}</TableCell>
                                <TableCell>{siswa.kelas}</TableCell>
                                <TableCell className="text-center">
                                    <Badge variant={siswa.totalPoin > 0 ? "destructive" : "secondary"}>
                                        {siswa.totalPoin}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-center">{siswa.totalPrestasi}</TableCell>
                                <TableCell className="text-xs text-muted-foreground italic">
                                    {siswa.catatanTerakhir}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            ) : (
                <div className="text-center text-muted-foreground py-10">
                    <p>Anda belum memiliki siswa binaan. Hubungi Wakasek Kesiswaan untuk penugasan.</p>
                </div>
            )}
        </CardContent>
      </Card>
    </div>
  );
}
