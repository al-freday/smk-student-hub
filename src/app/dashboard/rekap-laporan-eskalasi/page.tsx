
"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { getSourceData } from "@/lib/data-manager";
import { format } from "date-fns";
import { id } from 'date-fns/locale';
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft, Archive, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Tipe Data
type StatusLaporan = 'Diteruskan ke Wakasek' | 'Diproses Wakasek' | 'Selesai' | 'Ditolak';

interface CatatanPelanggaran { 
    id: number; 
    tanggal: string; 
    namaSiswa: string; 
    kelas: string; 
    pelanggaran: string; 
    poin: number; 
    status: StatusLaporan;
}

const statusOptions: StatusLaporan[] = ['Diteruskan ke Wakasek', 'Diproses Wakasek', 'Selesai', 'Ditolak'];

export default function RekapLaporanEskalasiPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [semuaPelanggaran, setSemuaPelanggaran] = useState<CatatanPelanggaran[]>([]);
  
  // State Filter
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("Semua");

  useEffect(() => {
    setIsLoading(true);
    try {
      const userRole = localStorage.getItem('userRole');
      if (userRole !== 'wakasek_kesiswaan') {
         router.push('/dashboard');
         return;
      }
      
      const allData: CatatanPelanggaran[] = getSourceData('riwayatPelanggaran', []);
      setSemuaPelanggaran(allData.filter(p => statusOptions.includes(p.status)));

    } catch (error) {
      toast({ title: "Gagal Memuat Data", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [router, toast]);

  const filteredData = useMemo(() => {
    return semuaPelanggaran
      .filter(p => {
        const termMatch = searchTerm === "" || 
          p.namaSiswa.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.pelanggaran.toLowerCase().includes(searchTerm.toLowerCase());
        const statusMatch = statusFilter === "Semua" || p.status === statusFilter;
        return termMatch && statusMatch;
      })
      .sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime());
  }, [semuaPelanggaran, searchTerm, statusFilter]);
  
  const getStatusBadgeVariant = (status: StatusLaporan) => {
    switch (status) {
      case 'Selesai': return 'default';
      case 'Diproses Wakasek': return 'secondary';
      case 'Diteruskan ke Wakasek': return 'outline';
      case 'Ditolak': return 'destructive';
      default: return 'outline';
    }
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
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.push('/dashboard/laporan-masuk-wakasek')}>
            <ArrowLeft />
        </Button>
        <div>
            <h2 className="text-3xl font-bold tracking-tight">Rekap & Arsip Laporan Eskalasi</h2>
            <p className="text-muted-foreground">
                Lihat semua riwayat laporan yang pernah ditangani di tingkat Wakasek.
            </p>
        </div>
      </div>
      
      <Card>
        <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <CardTitle className="flex items-center gap-2"><Archive /> Arsip Laporan</CardTitle>
                    <CardDescription>Gunakan filter untuk mencari data spesifik.</CardDescription>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                    <Input 
                        placeholder="Cari nama siswa..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full sm:w-auto"
                    />
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-full sm:w-[200px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Semua">Semua Status</SelectItem>
                            {statusOptions.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader><TableRow><TableHead>Tanggal</TableHead><TableHead>Siswa</TableHead><TableHead>Pelanggaran</TableHead><TableHead className="text-center">Poin</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
                <TableBody>
                    {filteredData.length > 0 ? filteredData.map(p => (
                         <TableRow key={p.id}>
                            <TableCell>{format(new Date(p.tanggal), "dd MMM yyyy", { locale: id })}</TableCell>
                            <TableCell><p className="font-medium">{p.namaSiswa}</p><p className="text-xs text-muted-foreground">{p.kelas}</p></TableCell>
                            <TableCell>{p.pelanggaran}</TableCell>
                            <TableCell className="text-center"><Badge variant="destructive">{p.poin}</Badge></TableCell>
                            <TableCell><Badge variant={getStatusBadgeVariant(p.status)}>{p.status}</Badge></TableCell>
                        </TableRow>
                    )) : (<TableRow><TableCell colSpan={5} className="text-center h-24">Tidak ada data yang cocok dengan filter Anda.</TableCell></TableRow>)}
                </TableBody>
            </Table>
        </CardContent>
      </Card>
    </div>
  );
}
