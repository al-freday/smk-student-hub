
"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Users, ShieldAlert, TrendingUp, CheckCircle, Loader2 } from "lucide-react";
import { getSourceData, updateSourceData } from "@/lib/data-manager";
import StatCard from "@/components/stat-card";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { id } from "date-fns/locale";

// --- Tipe Data ---
interface Siswa { id: number; nis: string; nama: string; kelas: string; }
interface CatatanPelanggaran { id: number; tanggal: string; nis: string; namaSiswa: string; kelas: string; pelanggaran: string; poin: number; status: string; }
interface SiswaDenganPoin extends Siswa { totalPoin: number; jumlahPelanggaran: number; }

export default function KonselingBkPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);

  // --- Data Pengguna & Tugas ---
  const [currentUser, setCurrentUser] = useState<{ nama: string } | null>(null);
  const [tingkatBinaan, setTingkatBinaan] = useState<string | null>(null);
  
  // --- Data Terfilter ---
  const [siswaBinaan, setSiswaBinaan] = useState<SiswaDenganPoin[]>([]);
  const [kasusMasuk, setKasusMasuk] = useState<CatatanPelanggaran[]>([]);
  const [stats, setStats] = useState({ totalSiswa: 0, kasusAktif: 0, siswaPoinTertinggi: "N/A" });

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
      const guruBkData = teachersData.guru_bk?.find((gbk: any) => gbk.nama === user.nama);
      const binaan = guruBkData?.tugasKelas || null; // e.g., "Kelas X"
      setTingkatBinaan(binaan);

      if (!binaan) {
        setIsLoading(false);
        return;
      }
      
      const allSiswa: Siswa[] = getSourceData('siswaData', []);
      const allPelanggaran: CatatanPelanggaran[] = getSourceData('riwayatPelanggaran', []);

      // Filter siswa berdasarkan tingkat binaan
      const siswaDiTingkat = allSiswa.filter(s => s.kelas.startsWith(binaan.split(' ')[1]));
      
      const siswaDenganPoin = siswaDiTingkat.map(siswa => {
          const pelanggaranSiswa = allPelanggaran.filter(p => p.nis === siswa.nis);
          const totalPoin = pelanggaranSiswa.reduce((sum, p) => sum + p.poin, 0);
          return { ...siswa, totalPoin, jumlahPelanggaran: pelanggaranSiswa.length };
      }).sort((a, b) => b.totalPoin - a.totalPoin);
      setSiswaBinaan(siswaDenganPoin);

      // Filter kasus yang diteruskan ke BK untuk tingkat binaan
      const kasusUntukBk = allPelanggaran
          .filter(p => p.status === 'Diteruskan ke BK' && p.kelas.startsWith(binaan.split(' ')[1]))
          .sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime());
      setKasusMasuk(kasusUntukBk);

      // --- Hitung Statistik ---
      setStats({
          totalSiswa: siswaDiTingkat.length,
          kasusAktif: kasusUntukBk.length,
          siswaPoinTertinggi: siswaDenganPoin[0] ? `${siswaDenganPoin[0].nama} (${siswaDenganPoin[0].totalPoin} poin)` : 'N/A',
      });

    } catch (error) {
      console.error("Gagal memuat data Guru BK:", error);
      toast({ title: "Gagal Memuat Data", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [router, toast]);

  useEffect(() => {
    loadData();
    window.addEventListener('dataUpdated', loadData);
    return () => window.removeEventListener('dataUpdated', loadData);
  }, [loadData]);
  
  const handleStatusChange = (id: number, status: string) => {
    const allPelanggaran: CatatanPelanggaran[] = getSourceData('riwayatPelanggaran', []);
    const updatedRiwayat = allPelanggaran.map(item =>
      item.id === id ? { ...item, status: status } : item
    );
    updateSourceData('riwayatPelanggaran', updatedRiwayat);
    toast({ title: "Status Kasus Diperbarui", description: `Kasus telah ditandai sebagai "${status}".` });
  };
  
  if (isLoading) {
    return (
      <div className="flex-1 flex justify-center items-center h-[calc(100vh-8rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!tingkatBinaan) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Penugasan Belum Diatur</CardTitle>
                <CardDescription>
                    Anda belum memiliki penugasan tingkat kelas binaan. Harap hubungi Wakasek Kesiswaan untuk mengatur penugasan Anda di menu Manajemen Guru.
                </CardDescription>
            </CardHeader>
        </Card>
    )
  }

  return (
    <div className="space-y-6">
       <div>
        <h2 className="text-3xl font-bold tracking-tight">Dasbor Bimbingan Konseling (BK)</h2>
        <p className="text-muted-foreground">
            Anda bertanggung jawab untuk pembinaan <span className="font-semibold text-primary">{tingkatBinaan}</span>.
        </p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard title="Total Siswa Binaan" value={stats.totalSiswa.toString()} icon={<Users />} isLoading={isLoading} />
        <StatCard title="Kasus Aktif (Diteruskan ke BK)" value={stats.kasusAktif.toString()} icon={<ShieldAlert />} isLoading={isLoading} />
        <StatCard title="Poin Pelanggaran Tertinggi" value={stats.siswaPoinTertinggi} icon={<TrendingUp />} isLoading={isLoading} />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <Card>
            <CardHeader>
                <CardTitle>Kasus Masuk</CardTitle>
                <CardDescription>Daftar pelanggaran yang diteruskan oleh Wali Kelas dan membutuhkan penanganan Anda.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader><TableRow><TableHead>Siswa</TableHead><TableHead>Pelanggaran</TableHead><TableHead className="text-right">Aksi</TableHead></TableRow></TableHeader>
                    <TableBody>
                        {kasusMasuk.length > 0 ? kasusMasuk.map(p => (
                             <TableRow key={p.id}>
                                <TableCell>
                                    <p className="font-medium">{p.namaSiswa}</p>
                                    <p className="text-xs text-muted-foreground">{p.kelas} | {format(new Date(p.tanggal), "dd MMM yy", { locale: id })}</p>
                                </TableCell>
                                <TableCell>
                                    <p>{p.pelanggaran} <Badge variant="destructive">{p.poin} Poin</Badge></p>
                                </TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal /></Button></DropdownMenuTrigger>
                                        <DropdownMenuContent>
                                            <DropdownMenuItem onClick={() => handleStatusChange(p.id, 'Selesai')}><CheckCircle className="mr-2 h-4 w-4" />Tandai Selesai</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        )) : (
                            <TableRow><TableCell colSpan={3} className="text-center h-24">Tidak ada kasus yang diteruskan.</TableCell></TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pemantauan Siswa Binaan</CardTitle>
            <CardDescription>Siswa diurutkan berdasarkan total poin pelanggaran tertinggi.</CardDescription>
          </CardHeader>
          <CardContent className="max-h-96 overflow-y-auto">
             <Table>
                <TableHeader><TableRow><TableHead>Nama Siswa</TableHead><TableHead>Kelas</TableHead><TableHead className="text-center">Total Poin</TableHead></TableRow></TableHeader>
                <TableBody>
                    {siswaBinaan.map(s => (
                        <TableRow key={s.id}>
                            <TableCell className="font-medium">{s.nama}</TableCell>
                            <TableCell>{s.kelas}</TableCell>
                            <TableCell className="text-center">
                                <Badge variant={s.totalPoin > 50 ? "destructive" : s.totalPoin > 20 ? "secondary" : "outline"}>
                                    {s.totalPoin}
                                </Badge>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
             </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

    