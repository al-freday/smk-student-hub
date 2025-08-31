
"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Printer, Download, BookOpen, Trophy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { getSourceData } from "@/lib/data-manager";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// --- Interface Definitions ---
interface Ekstrakurikuler {
  id: number;
  nama: string;
  kategori: string;
  pembina: string[];
}

interface Prestasi {
  id: number;
  tanggal: string;
  nis: string;
  namaSiswa: string;
  kelas: string;
  deskripsi: string;
  tingkat: 'Sekolah' | 'Kabupaten' | 'Provinsi' | 'Nasional' | 'Internasional';
  jenis: 'Akademik' | 'Non-Akademik';
}

const tingkatPrestasi = ['Semua Tingkat', 'Sekolah', 'Kabupaten', 'Provinsi', 'Nasional', 'Internasional'];
const jenisPrestasi = ['Semua Jenis', 'Akademik', 'Non-Akademik'];

export default function LaporanEkskulPrestasiPage() {
  const { toast } = useToast();
  
  // --- Data States ---
  const [daftarEkskul, setDaftarEkskul] = useState<Ekstrakurikuler[]>([]);
  const [daftarPrestasi, setDaftarPrestasi] = useState<Prestasi[]>([]);
  
  // --- Filter States ---
  const [filterTingkat, setFilterTingkat] = useState<string>("Semua Tingkat");
  const [filterJenis, setFilterJenis] = useState<string>("Semua Jenis");
  const [searchTerm, setSearchTerm] = useState<string>("");

  useEffect(() => {
    setDaftarEkskul(getSourceData('ekskulData', []));
    setDaftarPrestasi(getSourceData('prestasiData', []));
  }, []);

  const filteredPrestasi = useMemo(() => {
      let prestasi = daftarPrestasi;
      if (filterTingkat !== "Semua Tingkat") {
          prestasi = prestasi.filter(p => p.tingkat === filterTingkat);
      }
      if (filterJenis !== "Semua Jenis") {
          prestasi = prestasi.filter(p => p.jenis === filterJenis);
      }
      if (searchTerm) {
          prestasi = prestasi.filter(p => p.namaSiswa.toLowerCase().includes(searchTerm.toLowerCase()) || p.deskripsi.toLowerCase().includes(searchTerm.toLowerCase()));
      }
      return prestasi.sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime());
  }, [filterTingkat, filterJenis, searchTerm, daftarPrestasi]);

  const handlePrint = () => {
    window.print();
  };

  const handleExport = (type: 'ekskul' | 'prestasi') => {
      const delimiter = ';';
      let headers: string[] = [];
      let csvRows: string[] = [];
      let fileName = "";

      const formatCell = (value: any) => {
          const stringValue = String(value || '');
          if (stringValue.includes(delimiter) || stringValue.includes('"') || stringValue.includes('\n')) {
              return `"${stringValue.replace(/"/g, '""')}"`;
          }
          return stringValue;
      };

      if (type === 'ekskul') {
          headers = ['ID', 'Nama Ekskul', 'Kategori', 'Pembina'];
          csvRows = daftarEkskul.map(e => [e.id, e.nama, e.kategori, (e.pembina || []).join(', ')].map(formatCell).join(delimiter));
          fileName = `laporan_ekstrakurikuler_${format(new Date(), 'yyyy-MM-dd')}.csv`;
      } else {
          headers = ['Tanggal', 'NIS', 'Nama Siswa', 'Kelas', 'Deskripsi Prestasi', 'Jenis', 'Tingkat'];
          csvRows = filteredPrestasi.map(p => [p.tanggal, p.nis, p.namaSiswa, p.kelas, p.deskripsi, p.jenis, p.tingkat].map(formatCell).join(delimiter));
          fileName = `laporan_prestasi_${format(new Date(), 'yyyy-MM-dd')}.csv`;
      }
      
      const csvContent = [headers.join(delimiter), ...csvRows].join('\n');
      const bom = '\uFEFF';
      const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast({ title: "Ekspor Berhasil", description: `Laporan telah diunduh sebagai file CSV.` });
  };

  return (
    <div className="flex-1 space-y-6 report-container">
      <div className="flex items-center justify-between print:hidden">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Laporan Ekstrakurikuler & Prestasi</h2>
          <p className="text-muted-foreground">Analisis dan rekapitulasi data kegiatan non-akademik siswa.</p>
        </div>
        <Button onClick={handlePrint}><Printer className="mr-2 h-4 w-4" />Cetak Laporan</Button>
      </div>
      
      <Tabs defaultValue="prestasi" className="w-full">
        <TabsList className="print:hidden">
            <TabsTrigger value="prestasi"><Trophy className="mr-2 h-4 w-4"/>Laporan Prestasi Siswa</TabsTrigger>
            <TabsTrigger value="ekskul"><BookOpen className="mr-2 h-4 w-4"/>Laporan Ekstrakurikuler</TabsTrigger>
        </TabsList>

        <TabsContent value="prestasi">
            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <CardTitle>Rekapitulasi Prestasi Siswa</CardTitle>
                            <CardDescription>Daftar seluruh prestasi siswa yang telah dicatat, diurutkan dari yang terbaru.</CardDescription>
                        </div>
                        <div className="flex items-center gap-2 print:hidden">
                            <Button variant="outline" onClick={() => handleExport('prestasi')}><Download className="mr-2 h-4 w-4" />Unduh</Button>
                        </div>
                    </div>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 pt-4 print:hidden">
                        <Input 
                            placeholder="Cari (nama siswa, prestasi)..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full sm:w-48"
                        />
                        <div className="flex w-full sm:w-auto items-center gap-2">
                            <Label htmlFor="filter-jenis" className="whitespace-nowrap">Jenis:</Label>
                            <Select value={filterJenis} onValueChange={setFilterJenis}>
                                <SelectTrigger id="filter-jenis" className="w-full sm:w-auto"><SelectValue/></SelectTrigger>
                                <SelectContent>{jenisPrestasi.map(j => <SelectItem key={j} value={j}>{j}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                        <div className="flex w-full sm:w-auto items-center gap-2">
                            <Label htmlFor="filter-tingkat" className="whitespace-nowrap">Tingkat:</Label>
                            <Select value={filterTingkat} onValueChange={setFilterTingkat}>
                                <SelectTrigger id="filter-tingkat" className="w-full sm:w-auto"><SelectValue/></SelectTrigger>
                                <SelectContent>{tingkatPrestasi.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader><TableRow><TableHead>Tanggal</TableHead><TableHead>Nama Siswa</TableHead><TableHead>Prestasi</TableHead><TableHead>Tingkat</TableHead><TableHead>Jenis</TableHead></TableRow></TableHeader>
                        <TableBody>
                            {filteredPrestasi.length > 0 ? filteredPrestasi.map((p) => (
                                <TableRow key={p.id}>
                                    <TableCell>{format(new Date(p.tanggal), "dd/MM/yyyy")}</TableCell>
                                    <TableCell className="font-medium">{p.namaSiswa} <span className="text-muted-foreground">({p.kelas})</span></TableCell>
                                    <TableCell>{p.deskripsi}</TableCell>
                                    <TableCell><Badge>{p.tingkat}</Badge></TableCell>
                                    <TableCell><Badge variant="secondary">{p.jenis}</Badge></TableCell>
                                </TableRow>
                            )) : (<TableRow><TableCell colSpan={5} className="h-24 text-center">Tidak ada data prestasi untuk ditampilkan.</TableCell></TableRow>)}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </TabsContent>

        <TabsContent value="ekskul">
             <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <CardTitle>Daftar Ekstrakurikuler dan Pembina</CardTitle>
                            <CardDescription>Informasi mengenai semua kegiatan ekstrakurikuler yang tersedia di sekolah.</CardDescription>
                        </div>
                        <div className="flex items-center gap-2 print:hidden">
                            <Button variant="outline" onClick={() => handleExport('ekskul')}><Download className="mr-2 h-4 w-4" />Unduh</Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader><TableRow><TableHead>Nama Ekstrakurikuler</TableHead><TableHead>Kategori</TableHead><TableHead>Pembina Ditugaskan</TableHead></TableRow></TableHeader>
                        <TableBody>
                            {daftarEkskul.length > 0 ? daftarEkskul.map((e) => (
                                <TableRow key={e.id}>
                                    <TableCell className="font-medium">{e.nama}</TableCell>
                                    <TableCell>{e.kategori}</TableCell>
                                    <TableCell>{(e.pembina && e.pembina.length > 0) ? e.pembina.join(', ') : <span className="text-muted-foreground italic">Belum ada pembina</span>}</TableCell>
                                </TableRow>
                            )) : (<TableRow><TableCell colSpan={3} className="h-24 text-center">Tidak ada data ekstrakurikuler.</TableCell></TableRow>)}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
