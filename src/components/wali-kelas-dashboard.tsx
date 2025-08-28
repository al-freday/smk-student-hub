
"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Users, ShieldAlert, Activity, UserCheck, MessageSquare, CheckCircle, Loader2 } from "lucide-react";
import { getSourceData, updateSourceData } from "@/lib/data-manager";
import StatCard from "./stat-card";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import KehadiranLineChart from "./kehadiran-line-chart";

// --- Tipe Data ---
interface Siswa { id: number; nis: string; nama: string; kelas: string; }
type StatusLaporan = 'Dilaporkan' | 'Ditindaklanjuti Wali Kelas' | 'Diteruskan ke BK' | 'Diteruskan ke Wakasek' | 'Selesai';
interface CatatanPelanggaran { id: number; tanggal: string; namaSiswa: string; kelas: string; pelanggaran: string; poin: number; status: StatusLaporan; }
interface Kehadiran { tanggal: string; nis: string; status: string; }

export default function WaliKelasDashboard() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);

  // --- Data Pengguna & Kelas ---
  const [currentUser, setCurrentUser] = useState<{ nama: string } | null>(null);
  const [kelasBinaan, setKelasBinaan] = useState<string[]>([]);
  
  // --- Data Terfilter ---
  const [siswaDiKelas, setSiswaDiKelas] = useState<Siswa[]>([]);
  const [pelanggaranDiKelas, setPelanggaranDiKelas] = useState<CatatanPelanggaran[]>([]);
  const [stats, setStats] = useState({ totalSiswa: 0, totalPelanggaran: 0, kehadiranHariIni: "N/A" });

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
      const waliKelasData = teachersData.wali_kelas?.find((wk: any) => wk.nama === user.nama);
      const binaan = waliKelasData?.kelas || [];
      setKelasBinaan(binaan);

      const allSiswa: Siswa[] = getSourceData('siswaData', []);
      const siswaBinaan = allSiswa.filter(s => binaan.includes(s.kelas));
      setSiswaDiKelas(siswaBinaan);

      const allPelanggaran: CatatanPelanggaran[] = getSourceData('riwayatPelanggaran', []);
      const pelanggaranBinaan = allPelanggaran
        .filter(p => binaan.includes(p.kelas) && p.status === 'Dilaporkan')
        .sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime());
      setPelanggaranDiKelas(pelanggaranBinaan);

      // --- Hitung Statistik ---
      const today = format(new Date(), "yyyy-MM-dd");
      const allKehadiran: Kehadiran[] = getSourceData('kehadiranSiswaPerSesi', []);
      const nisSiswaBinaan = new Set(siswaBinaan.map(s => s.nis));
      
      const kehadiranBinaanHariIni = allKehadiran.filter(k => k.tanggal === today && nisSiswaBinaan.has(k.nis));
      const hadirCount = kehadiranBinaanHariIni.filter(k => k.status === 'Hadir').length;
      const kehadiranPersen = kehadiranBinaanHariIni.length > 0 ? `${((hadirCount / kehadiranBinaanHariIni.length) * 100).toFixed(0)}%` : "N/A";
      const totalPelanggaranBinaan = getSourceData('riwayatPelanggaran', []).filter((p: CatatanPelanggaran) => binaan.includes(p.kelas)).length;

      setStats({
        totalSiswa: siswaBinaan.length,
        totalPelanggaran: totalPelanggaranBinaan,
        kehadiranHariIni: kehadiranPersen,
      });

    } catch (error) {
      console.error("Gagal memuat data Wali Kelas:", error);
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
  
  const handleStatusChange = (id: number, status: StatusLaporan) => {
    const allPelanggaran: CatatanPelanggaran[] = getSourceData('riwayatPelanggaran', []);
    const updatedRiwayat = allPelanggaran.map(item =>
      item.id === id ? { ...item, status: status } : item
    );
    updateSourceData('riwayatPelanggaran', updatedRiwayat);
    toast({ title: "Status Diperbarui", description: `Status laporan telah diubah menjadi "${status}".` });
  };

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
            <CardTitle>Dasbor Wali Kelas</CardTitle>
            <CardDescription>
                Selamat datang, {currentUser?.nama}. Anda adalah wali kelas untuk: <span className="font-semibold text-primary">{kelasBinaan.join(', ')}</span>
            </CardDescription>
        </CardHeader>
      </Card>
      
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard title="Jumlah Siswa" value={stats.totalSiswa.toString()} icon={<Users />} isLoading={isLoading} />
        <StatCard title="Total Pelanggaran" value={stats.totalPelanggaran.toString()} icon={<ShieldAlert />} isLoading={isLoading} />
        <StatCard title="Kehadiran Hari Ini" value={stats.kehadiranHariIni} icon={<Activity />} isLoading={isLoading} />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <Card className="lg:col-span-2">
            <CardHeader>
                <CardTitle>Laporan Pelanggaran Baru (Perlu Ditindaklanjuti)</CardTitle>
                <CardDescription>Tindak lanjuti laporan yang masuk untuk siswa binaan Anda.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader><TableRow><TableHead>Siswa</TableHead><TableHead>Pelanggaran</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Aksi</TableHead></TableRow></TableHeader>
                    <TableBody>
                        {pelanggaranDiKelas.length > 0 ? pelanggaranDiKelas.slice(0, 5).map(p => (
                             <TableRow key={p.id}>
                                <TableCell>
                                    <p className="font-medium">{p.namaSiswa}</p>
                                    <p className="text-xs text-muted-foreground">{format(new Date(p.tanggal), "dd/MM/yy")}</p>
                                </TableCell>
                                <TableCell>
                                    <p>{p.pelanggaran}</p>
                                    <Badge variant="destructive">{p.poin} Poin</Badge>
                                </TableCell>
                                <TableCell><Badge variant={p.status === 'Dilaporkan' ? 'destructive' : 'secondary'}>{p.status}</Badge></TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal /></Button></DropdownMenuTrigger>
                                        <DropdownMenuContent>
                                            <DropdownMenuItem onClick={() => handleStatusChange(p.id, 'Ditindaklanjuti Wali Kelas')}><UserCheck className="mr-2 h-4 w-4" />Tandai ditindaklanjuti</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleStatusChange(p.id, 'Diteruskan ke BK')}><MessageSquare className="mr-2 h-4 w-4" />Teruskan ke BK</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        )) : (
                            <TableRow><TableCell colSpan={4} className="text-center h-24">Tidak ada laporan pelanggaran baru di kelas Anda.</TableCell></TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Daftar Siswa Binaan</CardTitle>
            <CardDescription>Total {siswaDiKelas.length} siswa.</CardDescription>
          </CardHeader>
          <CardContent className="max-h-80 overflow-y-auto">
             <Table>
                <TableHeader><TableRow><TableHead>NIS</TableHead><TableHead>Nama</TableHead></TableRow></TableHeader>
                <TableBody>
                    {siswaDiKelas.map(s => (
                        <TableRow key={s.id}><TableCell>{s.nis}</TableCell><TableCell>{s.nama}</TableCell></TableRow>
                    ))}
                </TableBody>
             </Table>
          </CardContent>
        </Card>
      </div>

       <Card>
            <CardHeader>
                <CardTitle>Tren Kehadiran Kelas Anda</CardTitle>
                <CardDescription>Grafik kehadiran siswa binaan selama 30 hari terakhir.</CardDescription>
            </CardHeader>
            <CardContent>
                <KehadiranLineChart filterKelas={kelasBinaan} />
            </CardContent>
        </Card>
    </div>
  );
}
