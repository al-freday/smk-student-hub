
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, ShieldAlert, Trophy, Loader2, ArrowRight } from "lucide-react";
import { getSourceData } from "@/lib/data-manager";
import StatCard from "./stat-card";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

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
      });
      
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
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Total Siswa Binaan" value={stats.totalSiswa.toString()} icon={<Users/>} isLoading={isLoading} />
        <StatCard title="Total Poin Pelanggaran" value={stats.totalPoin.toString()} icon={<ShieldAlert/>} isNegative={stats.totalPoin > 0} isLoading={isLoading} />
        <StatCard title="Total Prestasi" value={stats.totalPrestasi.toString()} icon={<Trophy/>} isLoading={isLoading} />
      </div>

      <Card>
        <CardHeader>
            <CardTitle>Pemantauan Siswa Binaan</CardTitle>
            <CardDescription>
                Fokus pada perkembangan setiap siswa yang menjadi tanggung jawab Anda.
            </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {siswaBinaan.length > 0 ? (
                siswaBinaan.map(siswa => (
                    <Card key={siswa.id} className="hover:bg-muted/50 transition-colors">
                        <CardHeader className="flex flex-row items-center gap-4">
                           <Avatar>
                                <AvatarFallback>{siswa.nama.split(' ').map(n=>n[0]).join('')}</AvatarFallback>
                           </Avatar>
                           <div>
                                <p className="font-semibold">{siswa.nama}</p>
                                <p className="text-sm text-muted-foreground">{siswa.kelas}</p>
                           </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-around text-center">
                                <div>
                                    <p className="text-2xl font-bold">{siswa.totalPoin}</p>
                                    <p className="text-xs text-muted-foreground">Poin Pelanggaran</p>
                                </div>
                                <div>
                                    <p className="text-2xl font-bold">{siswa.totalPrestasi}</p>
                                    <p className="text-xs text-muted-foreground">Prestasi</p>
                                </div>
                            </div>
                            <p className="text-xs text-muted-foreground italic text-center p-2 bg-secondary rounded-md">
                                {siswa.catatanTerakhir}
                            </p>
                            <div className="flex gap-2">
                                <Button size="sm" variant="outline" className="w-full" onClick={() => router.push('/dashboard/manajemen-pelanggaran')}>
                                    <ShieldAlert className="mr-2 h-4 w-4"/> Lapor
                                </Button>
                                <Button size="sm" variant="outline" className="w-full" onClick={() => router.push('/dashboard/ekskul-prestasi')}>
                                    <Trophy className="mr-2 h-4 w-4"/> Catat Prestasi
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))
            ) : (
                <div className="md:col-span-2 lg:col-span-3 text-center text-muted-foreground py-10">
                    <p>Anda belum memiliki siswa binaan. Hubungi Wakasek Kesiswaan untuk penugasan.</p>
                </div>
            )}
        </CardContent>
      </Card>
    </div>
  );
}
