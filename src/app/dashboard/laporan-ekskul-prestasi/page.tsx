
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Printer, Download, Award, Trophy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect, useMemo } from "react";
import { getSourceData } from "@/lib/data-manager";
import { ekskulData } from "@/lib/ekskulData";

// --- Interface Definitions ---
interface Siswa {
  id: number;
  nis: string;
  nama: string;
  kelas: string;
}

interface Prestasi {
  id: number;
  nis: string;
  namaSiswa: string;
  kelas: string;
  deskripsi: string;
  tingkat: string;
}

export default function LaporanEkskulPrestasiPage() {
  const { toast } = useToast();
  
  // --- Data States ---
  const [daftarSiswa, setDaftarSiswa] = useState<Siswa[]>([]);
  const [daftarPrestasi, setDaftarPrestasi] = useState<Prestasi[]>([]);
  const [daftarEkskul, setDaftarEkskul] = useState(ekskulData);
  const [daftarKelas, setDaftarKelas] = useState<string[]>([]);
  
  // --- Filter States ---
  const [selectedKelas, setSelectedKelas] = useState<string>("Semua Kelas");

  useEffect(() => {
    const siswaData = getSourceData('siswaData', []);
    const prestasiData = getSourceData('prestasiData', []);

    setDaftarSiswa(siswaData);
    setDaftarPrestasi(prestasiData);
    
    const kelasUnik = ["Semua Kelas", ...Array.from(new Set(siswaData.map((s: Siswa) => s.kelas)))];
    setDaftarKelas(kelasUnik.sort());
  }, []);

  const filteredPrestasi = useMemo(() => {
    if (selectedKelas === "Semua Kelas") {
      return daftarPrestasi;
    }
    return daftarPrestasi.filter(p => p.kelas === selectedKelas);
  }, [selectedKelas, daftarPrestasi]);

  const handlePrint = () => {
    window.print();
  };

  const handleExport = (type: 'prestasi' | 'ekskul') => {
    let headers: string[] = [];
    let rows: any[][] = [];
    let filename = "";

    if (type === 'prestasi') {
        headers = ['NIS', 'Nama Siswa', 'Kelas', 'Prestasi', 'Tingkat'];
        rows = filteredPrestasi.map(p => [p.nis, p.namaSiswa, p.kelas, p.deskripsi, p.tingkat]);
        filename = `laporan_prestasi_${selectedKelas}.csv`;
    } else {
        headers = ['Nama Ekskul', 'Pembina', 'Jadwal'];
        rows = daftarEkskul.map(e => [e.nama, e.pembina, e.jadwal]);
        filename = `daftar_ekskul.csv`;
    }

    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({ title: "Ekspor Berhasil", description: `Data telah diunduh sebagai ${filename}.` });
  };

  return (
    <div className="flex-1 space-y-6 report-container">
      <div className="flex items-center justify-between print:hidden">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Laporan Ekskul &amp; Prestasi</h2>
          <p className="text-muted-foreground">Rekapitulasi data ekstrakurikuler dan prestasi siswa.</p>
        </div>
        <Button onClick={handlePrint}><Printer className="mr-2 h-4 w-4" />Cetak Laporan</Button>
      </div>
      
      <Card>
        <CardHeader>
            <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2"><Trophy/> Laporan Prestasi Siswa</CardTitle>
                <Button variant="outline" onClick={() => handleExport('prestasi')}><Download className="mr-2 h-4 w-4"/>Unduh CSV</Button>
            </div>
            <CardDescription>
                <Select value={selectedKelas} onValueChange={setSelectedKelas}>
                    <SelectTrigger className="w-[280px] mt-2 print:hidden"><SelectValue/></SelectTrigger>
                    <SelectContent>{daftarKelas.map(k => <SelectItem key={k} value={k}>{k}</SelectItem>)}</SelectContent>
                </Select>
            </CardDescription>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader><TableRow><TableHead>Siswa</TableHead><TableHead>Deskripsi Prestasi</TableHead><TableHead>Tingkat</TableHead></TableRow></TableHeader>
                <TableBody>
                    {filteredPrestasi.length > 0 ? filteredPrestasi.map(p => (
                        <TableRow key={p.id}>
                            <TableCell>{p.namaSiswa} ({p.kelas})</TableCell>
                            <TableCell>{p.deskripsi}</TableCell>
                            <TableCell><Badge variant="secondary">{p.tingkat}</Badge></TableCell>
                        </TableRow>
                    )) : (<TableRow><TableCell colSpan={3} className="text-center h-24">Tidak ada data prestasi untuk filter ini.</TableCell></TableRow>)}
                </TableBody>
            </Table>
        </CardContent>
      </Card>
      
      <Card className="page-break">
        <CardHeader>
            <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2"><Award/> Daftar Ekstrakurikuler Sekolah</CardTitle>
                <Button variant="outline" onClick={() => handleExport('ekskul')}><Download className="mr-2 h-4 w-4"/>Unduh CSV</Button>
            </div>
            <CardDescription>Informasi kegiatan ekstrakurikuler yang tersedia di sekolah.</CardDescription>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader><TableRow><TableHead>Nama Ekskul</TableHead><TableHead>Pembina</TableHead><TableHead>Jadwal</TableHead></TableRow></TableHeader>
                <TableBody>
                    {daftarEkskul.map(e => (
                        <TableRow key={e.id}>
                            <TableCell>{e.nama}</TableCell>
                            <TableCell>{e.pembina}</TableCell>
                            <TableCell>{e.jadwal}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </CardContent>
      </Card>
    </div>
  );
}
