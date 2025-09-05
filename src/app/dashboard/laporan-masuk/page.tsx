
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, MessageSquare, CheckCircle, Loader2 } from "lucide-react";
import { getSourceData, updateSourceData } from "@/lib/data-manager";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

// --- Tipe Data ---
type StatusLaporan = 'Dilaporkan' | 'Ditindaklanjuti Wali Kelas' | 'Diteruskan ke BK' | 'Selesai';
interface CatatanPelanggaran { id: number; tanggal: string; namaSiswa: string; kelas: string; pelanggaran: string; poin: number; status: StatusLaporan; }

export default function LaporanMasukPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);

  // --- Data Pengguna & Kelas ---
  const [currentUser, setCurrentUser] = useState<{ nama: string } | null>(null);
  const [kelasBinaan, setKelasBinaan] = useState<string[]>([]);
  
  // --- Data Terfilter ---
  const [pelanggaranDiKelas, setPelanggaranDiKelas] = useState<CatatanPelanggaran[]>([]);

  const loadData = useCallback(() => {
    setIsLoading(true);
    try {
      const user = getSourceData('currentUser', null);
      if (!user) {
        router.push('/');
        return;
      }
      const userRole = localStorage.getItem('userRole');
      if (userRole !== 'wali_kelas') {
         toast({ title: "Akses Ditolak", description: "Halaman ini hanya untuk Wali Kelas.", variant: "destructive" });
         router.push('/dashboard');
         return;
      }
      setCurrentUser(user);

      const teachersData = getSourceData('teachersData', {});
      const waliKelasData = teachersData.wali_kelas?.find((wk: any) => wk.nama === user.nama);
      const binaan = waliKelasData?.kelas || [];
      setKelasBinaan(binaan);

      const allPelanggaran: CatatanPelanggaran[] = getSourceData('riwayatPelanggaran', []);
      const pelanggaranBinaan = allPelanggaran
        .filter(p => binaan.includes(p.kelas) && p.status === 'Dilaporkan')
        .sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime());
      setPelanggaranDiKelas(pelanggaranBinaan);

    } catch (error) {
      console.error("Gagal memuat data Laporan Masuk:", error);
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
       <div>
        <h2 className="text-3xl font-bold tracking-tight">Laporan Pelanggaran Masuk</h2>
        <p className="text-muted-foreground">
            Tindak lanjuti semua laporan pelanggaran yang masuk untuk siswa di kelas binaan Anda: <span className="font-semibold text-primary">{kelasBinaan.join(', ')}</span>
        </p>
      </div>
      
      <Card>
        <CardHeader>
            <CardTitle>Daftar Laporan</CardTitle>
            <CardDescription>Gunakan menu Aksi untuk menindaklanjuti atau meneruskan laporan ke Guru BK.</CardDescription>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader><TableRow><TableHead>Siswa</TableHead><TableHead>Pelanggaran</TableHead><TableHead>Poin</TableHead><TableHead className="text-right">Aksi</TableHead></TableRow></TableHeader>
                <TableBody>
                    {pelanggaranDiKelas.length > 0 ? pelanggaranDiKelas.map(p => (
                         <TableRow key={p.id}>
                            <TableCell>
                                <p className="font-medium">{p.namaSiswa}</p>
                                <p className="text-xs text-muted-foreground">{p.kelas} | {format(new Date(p.tanggal), "dd MMM yyyy")}</p>
                            </TableCell>
                            <TableCell>
                                <p>{p.pelanggaran}</p>
                            </TableCell>
                            <TableCell><Badge variant="destructive">{p.poin} Poin</Badge></TableCell>
                            <TableCell className="text-right">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild><Button variant="outline" size="sm"><MoreHorizontal className="h-4 w-4 mr-2"/>Aksi</Button></DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        <DropdownMenuItem onClick={() => handleStatusChange(p.id, 'Ditindaklanjuti Wali Kelas')}><CheckCircle className="mr-2 h-4 w-4" />Tandai ditindaklanjuti</DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleStatusChange(p.id, 'Diteruskan ke BK')}><MessageSquare className="mr-2 h-4 w-4" />Teruskan ke BK</DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    )) : (
                        <TableRow><TableCell colSpan={4} className="text-center h-24">Tidak ada laporan pelanggaran baru yang perlu ditindaklanjuti.</TableCell></TableRow>
                    )}
                </TableBody>
            </Table>
        </CardContent>
      </Card>
    </div>
  );
}
