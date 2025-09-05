
"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { getSourceData } from "@/lib/data-manager";
import { format, getMonth, getYear } from "date-fns";
import { id } from 'date-fns/locale';
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft, Archive, Download } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";


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
const daftarBulan = Array.from({ length: 12 }, (_, i) => ({ value: i, label: new Date(0, i).toLocaleString('id-ID', { month: 'long' }) }));
const daftarTahun = [getYear(new Date()) - 1, getYear(new Date()), getYear(new Date()) + 1];

export default function RekapLaporanEskalasiPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [semuaPelanggaran, setSemuaPelanggaran] = useState<CatatanPelanggaran[]>([]);
  
  // State Filter
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("Semua");
  const [selectedMonth, setSelectedMonth] = useState<number>(getMonth(new Date()));
  const [selectedYear, setSelectedYear] = useState<number>(getYear(new Date()));


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
        const date = new Date(p.tanggal);
        const termMatch = searchTerm === "" || 
          p.namaSiswa.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.pelanggaran.toLowerCase().includes(searchTerm.toLowerCase());
        const statusMatch = statusFilter === "Semua" || p.status === statusFilter;
        const monthMatch = getMonth(date) === selectedMonth;
        const yearMatch = getYear(date) === selectedYear;
        return termMatch && statusMatch && monthMatch && yearMatch;
      })
      .sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime());
  }, [semuaPelanggaran, searchTerm, statusFilter, selectedMonth, selectedYear]);
  
  const getStatusBadgeVariant = (status: StatusLaporan) => {
    switch (status) {
      case 'Selesai': return 'default';
      case 'Diproses Wakasek': return 'secondary';
      case 'Diteruskan ke Wakasek': return 'outline';
      case 'Ditolak': return 'destructive';
      default: return 'outline';
    }
  };

  const handleDownload = () => {
    if (filteredData.length === 0) {
        toast({ title: "Tidak Ada Data", description: "Tidak ada data untuk diunduh sesuai filter yang dipilih.", variant: "destructive" });
        return;
    }
    
    const headers = ['ID', 'Tanggal', 'NIS', 'Nama Siswa', 'Kelas', 'Pelanggaran', 'Poin', 'Status'];
    const delimiter = ';';

    const formatCell = (value: any) => {
        const stringValue = String(value || '');
        if (stringValue.includes(delimiter) || stringValue.includes('"') || stringValue.includes('\n')) {
            return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
    };
    
    const csvRows = filteredData.map(p => 
        [p.id, p.tanggal, p.nis, p.namaSiswa, p.kelas, p.pelanggaran, p.poin, p.status].map(formatCell).join(delimiter)
    );

    const csvContent = [headers.join(delimiter), ...csvRows].join('\n');
    
    const bom = '\uFEFF';
    const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute('download', `rekap_eskalasi_${daftarBulan[selectedMonth].label}_${selectedYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast({ title: "Unduh Berhasil", description: "Laporan telah diunduh sebagai file CSV." });
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
                <div className="flex flex-col sm:flex-row items-start sm:items-end gap-2 w-full sm:w-auto">
                    <Input 
                        placeholder="Cari nama siswa..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full sm:w-auto"
                    />
                     <div className="grid grid-cols-2 sm:flex gap-2 w-full sm:w-auto">
                        <div className="space-y-1">
                            <Label htmlFor="filter-bulan" className="text-xs">Bulan</Label>
                            <Select value={String(selectedMonth)} onValueChange={v => setSelectedMonth(Number(v))}>
                                <SelectTrigger id="filter-bulan" className="w-full"><SelectValue /></SelectTrigger>
                                <SelectContent>{daftarBulan.map(b => <SelectItem key={b.value} value={String(b.value)}>{b.label}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                         <div className="space-y-1">
                            <Label htmlFor="filter-tahun" className="text-xs">Tahun</Label>
                            <Select value={String(selectedYear)} onValueChange={v => setSelectedYear(Number(v))}>
                                <SelectTrigger id="filter-tahun" className="w-full"><SelectValue /></SelectTrigger>
                                <SelectContent>{daftarTahun.map(t => <SelectItem key={t} value={String(t)}>{t}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="filter-status" className="text-xs">Status</Label>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger id="filter-status" className="w-full"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Semua">Semua Status</SelectItem>
                                    {statusOptions.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <Button onClick={handleDownload} variant="outline"><Download className="mr-2 h-4 w-4" /> Unduh</Button>
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
