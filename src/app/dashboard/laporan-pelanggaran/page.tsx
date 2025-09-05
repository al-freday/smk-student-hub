
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Printer, Download, User, TrendingDown, ShieldAlert, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { useState, useEffect, useMemo, useCallback } from "react";
import { getSourceData } from "@/lib/data-manager";

// --- Interface Definitions ---
interface Siswa {
  id: number;
  nis: string;
  nama: string;
  kelas: string;
}

interface CatatanPelanggaran {
  id: number | string;
  tanggal: string;
  nis: string;
  siswa: string;
  kelas: string;
  pelanggaran: string;
  poin: number;
}


export default function LaporanPelanggaranPage() {
  const { toast } = useToast();
  
  // --- Data States ---
  const [isLoading, setIsLoading] = useState(true);
  const [daftarSiswa, setDaftarSiswa] = useState<Siswa[]>([]);
  const [riwayatPelanggaran, setRiwayatPelanggaran] = useState<CatatanPelanggaran[]>([]);
  const [daftarKelas, setDaftarKelas] = useState<string[]>([]);
  
  // --- Filter States ---
  const [selectedKelas, setSelectedKelas] = useState<string>("Semua Kelas");
  const [searchTerm, setSearchTerm] = useState<string>("");

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
        const [siswaData, pelanggaranData] = await Promise.all([
            getSourceData('siswaData', []),
            getSourceData('riwayatPelanggaran', []),
        ]);

        const pelanggaranFormatted: CatatanPelanggaran[] = pelanggaranData.map((p: any) => ({
            ...p,
            id: `pelanggaran-${p.id}`,
            siswa: p.namaSiswa,
            pelanggaran: p.pelanggaran,
        }));

        setDaftarSiswa(siswaData);
        setRiwayatPelanggaran(pelanggaranFormatted);
        
        const kelasUnik = ["Semua Kelas", ...Array.from(new Set(siswaData.map((s: Siswa) => s.kelas)))];
        setDaftarKelas(kelasUnik.sort());
    } catch (error) {
        toast({ title: "Gagal memuat data", variant: "destructive" });
    } finally {
        setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredSiswa = useMemo(() => {
      let siswa = daftarSiswa;
      if (selectedKelas !== "Semua Kelas") {
          siswa = siswa.filter(s => s.kelas === selectedKelas);
      }
      if (searchTerm) {
          siswa = siswa.filter(s => s.nama.toLowerCase().includes(searchTerm.toLowerCase()));
      }
      return siswa;
  }, [selectedKelas, searchTerm, daftarSiswa]);

  const siswaDenganPoin = useMemo(() => {
    return filteredSiswa.map(siswa => {
      const catatanSiswa = riwayatPelanggaran.filter(c => c.nis === siswa.nis);
      const totalPoin = catatanSiswa
        .reduce((sum, c) => sum + c.poin!, 0);
      const totalPelanggaran = catatanSiswa.length;
      return { ...siswa, totalPoin, totalPelanggaran, catatanSiswa };
    }).sort((a, b) => b.totalPoin - a.totalPoin);
  }, [filteredSiswa, riwayatPelanggaran]);

  const summary = useMemo(() => {
      const totalPelanggaran = riwayatPelanggaran.length;
      const siswaMelanggar = new Set(riwayatPelanggaran.map(c => c.nis)).size;
      return { totalPelanggaran, siswaMelanggar };
  }, [riwayatPelanggaran]);

  const handlePrint = () => {
    window.print();
  };

  const handleExport = () => {
      const headers = ['NIS', 'Nama', 'Kelas', 'Total Poin', 'Jumlah Pelanggaran'];
      const delimiter = ';';

      const formatCell = (value: any) => {
          const stringValue = String(value || '');
          if (stringValue.includes(delimiter) || stringValue.includes('"') || stringValue.includes('\n')) {
              return `"${stringValue.replace(/"/g, '""')}"`;
          }
          return stringValue;
      };
      
      const csvRows = siswaDenganPoin.map(s => 
          [s.nis, s.nama, s.kelas, s.totalPoin, s.totalPelanggaran]
          .map(formatCell)
          .join(delimiter)
      );

      const csvContent = [
          headers.join(delimiter),
          ...csvRows
      ].join('\n');
      
      const bom = '\uFEFF';
      const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.href = url;
      link.setAttribute('download', `laporan_pelanggaran_${selectedKelas}_${format(new Date(), 'yyyy-MM-dd')}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({ title: "Ekspor Berhasil", description: "Laporan telah diunduh sebagai file CSV." });
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex justify-center items-center h-[calc(100vh-8rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 report-container">
      <div className="flex items-center justify-between print:hidden">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Laporan Pelanggaran Siswa</h2>
          <p className="text-muted-foreground">Analisis dan rekapitulasi data pelanggaran siswa untuk evaluasi.</p>
        </div>
        <div className="flex gap-2">
            <Button variant="outline" onClick={handleExport}><Download className="mr-2 h-4 w-4" />Unduh CSV</Button>
            <Button onClick={handlePrint}><Printer className="mr-2 h-4 w-4" />Cetak Laporan</Button>
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-3 print:hidden">
          <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total Siswa</CardTitle><User/></CardHeader>
              <CardContent><div className="text-2xl font-bold">{daftarSiswa.length}</div></CardContent>
          </Card>
          <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Siswa Melanggar</CardTitle><TrendingDown className="text-destructive"/></CardHeader>
              <CardContent><div className="text-2xl font-bold">{summary.siswaMelanggar}</div></CardContent>
          </Card>
          <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total Pelanggaran</CardTitle><ShieldAlert className="text-destructive"/></CardHeader>
              <CardContent><div className="text-2xl font-bold">{summary.totalPelanggaran}</div></CardContent>
          </Card>
      </div>

      <Card>
        <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <CardTitle>Rekapitulasi Poin Siswa</CardTitle>
                    <CardDescription>Daftar siswa diurutkan berdasarkan total poin pelanggaran tertinggi.</CardDescription>
                </div>
                 <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 print:hidden w-full sm:w-auto">
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <Label htmlFor="search-student" className="whitespace-nowrap">Cari Siswa:</Label>
                        <Input 
                            id="search-student"
                            placeholder="Ketik nama..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full sm:w-48"
                        />
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <Label htmlFor="filter-kelas">Filter Kelas:</Label>
                        <Select value={selectedKelas} onValueChange={setSelectedKelas}>
                            <SelectTrigger id="filter-kelas" className="w-full sm:w-[180px]"><SelectValue/></SelectTrigger>
                            <SelectContent>{daftarKelas.map(k => <SelectItem key={k} value={k}>{k}</SelectItem>)}</SelectContent>
                        </Select>
                    </div>
                 </div>
            </div>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Peringkat</TableHead>
                        <TableHead>NIS</TableHead>
                        <TableHead>Nama Siswa</TableHead>
                        <TableHead>Kelas</TableHead>
                        <TableHead className="text-center">Total Poin</TableHead>
                        <TableHead className="text-center">Jml. Pelanggaran</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {siswaDenganPoin.length > 0 ? siswaDenganPoin.map((s, index) => (
                        <TableRow key={s.id}>
                            <TableCell>{index + 1}</TableCell>
                            <TableCell>{s.nis}</TableCell>
                            <TableCell className="font-medium">{s.nama}</TableCell>
                            <TableCell>{s.kelas}</TableCell>
                            <TableCell className="text-center"><Badge variant={s.totalPoin > 0 ? "destructive" : "secondary"}>{s.totalPoin}</Badge></TableCell>
                            <TableCell className="text-center">{s.totalPelanggaran}</TableCell>
                        </TableRow>
                    )) : (
                        <TableRow><TableCell colSpan={6} className="h-24 text-center">Tidak ada data untuk ditampilkan sesuai filter.</TableCell></TableRow>
                    )}
                </TableBody>
            </Table>
        </CardContent>
      </Card>
    </div>
  );
}
