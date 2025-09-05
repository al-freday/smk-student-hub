
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
import { Loader2, ArrowLeft, Archive, Download, Printer, FileSignature } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

// Tipe Data
type StatusLaporan = 'Diteruskan ke Wakasek' | 'Diproses Wakasek' | 'Selesai' | 'Ditolak';

interface CatatanPelanggaran { 
    id: number; 
    nis: string;
    tanggal: string; 
    namaSiswa: string; 
    kelas: string; 
    pelanggaran: string; 
    poin: number; 
    status: StatusLaporan;
}
interface Siswa { id: number; nis: string; nama: string; kelas: string; }
interface SchoolInfo { schoolName: string; headmasterName: string; logo: string; }

const statusOptions: StatusLaporan[] = ['Diteruskan ke Wakasek', 'Diproses Wakasek', 'Selesai', 'Ditolak'];
const daftarBulan = Array.from({ length: 12 }, (_, i) => ({ value: i, label: new Date(0, i).toLocaleString('id-ID', { month: 'long' }) }));
const daftarTahun = [getYear(new Date()) - 1, getYear(new Date()), getYear(new Date()) + 1];

// --- TEMPLATE SURAT ---

const SuratRekomendasiTemplate = ({ data, schoolInfo, tipe }: { data: any, schoolInfo: SchoolInfo | null, tipe: 'Mutasi' | 'Pindah Sekolah' }) => {
    const isMutasi = tipe === 'Mutasi';
    const perihal = isMutasi ? "Rekomendasi Mutasi Siswa" : "Pemberitahuan dan Rekomendasi Pindah Sekolah";
    const tujuan = isMutasi ? "Yth. Bapak/Ibu Operator Sekolah" : `Yth. Bapak/Ibu Orang Tua/Wali dari siswa an. ${data.siswa.nama}`;

    return (
        <div className="printable-letter font-serif text-black bg-white p-8">
            <div className="flex items-center gap-4 mb-4 border-b-2 border-black pb-4">
                 {schoolInfo?.logo && <img src={schoolInfo.logo} alt="Logo" className="h-20 w-20 object-contain" />}
                 <div className="text-center flex-1">
                     <h2 className="text-xl font-bold uppercase">PEMERINTAH PROVINSI SULAWESI SELATAN</h2>
                     <h3 className="text-2xl font-bold uppercase">DINAS PENDIDIKAN</h3>
                     <h4 className="text-3xl font-bold uppercase">{schoolInfo?.schoolName}</h4>
                     <p className="text-xs">Alamat: Jl. Poros Rantepao - Palopo, Kab. Toraja Utara, Sulawesi Selatan</p>
                 </div>
            </div>
            <p className="text-right mb-6">{schoolInfo?.schoolName}, {format(new Date(), "d MMMM yyyy", { locale: id })}</p>
            <table>
                <tbody>
                    <tr><td>Nomor</td><td className="px-2">: .../.../...</td></tr>
                    <tr><td>Lampiran</td><td className="px-2">: 1 (satu) Berkas</td></tr>
                    <tr><td>Perihal</td><td className="px-2">: <strong>{perihal}</strong></td></tr>
                </tbody>
            </table>
            <p className="mt-6 mb-4">{tujuan}<br/>di Tempat</p>
            <p className="mb-4">Dengan hormat,</p>
            <p className="mb-4 text-justify indent-8">
                Berdasarkan hasil rapat dewan guru dan tim kesiswaan serta memperhatikan rekam jejak pembinaan yang telah dilakukan terhadap siswa berikut:
            </p>
            <table className="w-full my-4 ml-8">
                 <tbody>
                    <tr><td className="w-1/4">Nama</td><td>: {data.siswa.nama}</td></tr>
                    <tr><td>NIS</td><td>: {data.siswa.nis}</td></tr>
                    <tr><td>Kelas</td><td>: {data.siswa.kelas}</td></tr>
                </tbody>
            </table>
            <p className="mb-4 text-justify indent-8">
                Ditemukan bahwa siswa yang bersangkutan telah berulang kali melakukan pelanggaran tata tertib sekolah yang tergolong dalam kategori berat dan telah melalui berbagai tahap pembinaan oleh wali kelas dan guru BK tanpa menunjukkan perubahan perilaku yang signifikan.
            </p>
             <p className="mb-4 text-justify indent-8">
                Maka, demi menjaga lingkungan belajar yang kondusif bagi seluruh siswa dan untuk kebaikan perkembangan siswa yang bersangkutan di lingkungan baru yang mungkin lebih sesuai, dengan ini kami memberikan rekomendasi sebagai berikut:
            </p>
            <div className="p-4 border my-4 bg-gray-50">
                <h3 className="font-bold text-center mb-2">REKOMENDASI</h3>
                <p className="italic text-justify">"{data.rekomendasi}"</p>
            </div>
            <p className="mb-6 text-justify indent-8">
                Demikian surat ini kami sampaikan untuk dapat ditindaklanjuti sebagaimana mestinya. Atas perhatian dan kerjasamanya, kami ucapkan terima kasih.
            </p>
             <div className="mt-12 flex justify-between text-center">
                <div>
                    <p className="mb-20">Hormat kami,<br/>Wakasek Kesiswaan</p>
                    <p className="font-bold underline">{data.wakasek}</p>
                </div>
                <div>
                     <p className="mb-20">Mengetahui,<br/>Kepala Sekolah</p>
                    <p className="font-bold underline">{schoolInfo?.headmasterName}</p>
                    <p>NIP. ............................</p>
                </div>
            </div>
        </div>
    );
};


export default function RekapLaporanEskalasiPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [semuaPelanggaran, setSemuaPelanggaran] = useState<CatatanPelanggaran[]>([]);
  const [currentUser, setCurrentUser] = useState<{ nama: string } | null>(null);
  const [schoolInfo, setSchoolInfo] = useState<SchoolInfo | null>(null);
  
  // State Filter & Form
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("Semua");
  const [selectedMonth, setSelectedMonth] = useState<number>(getMonth(new Date()));
  const [selectedYear, setSelectedYear] = useState<number>(getYear(new Date()));
  
  // State Surat
  const [activeTab, setActiveTab] = useState("arsip");
  const [selectedSiswa, setSelectedSiswa] = useState<Siswa | null>(null);
  const [tipeSurat, setTipeSurat] = useState<'Mutasi' | 'Pindah Sekolah' | ''>('');
  const [rekomendasi, setRekomendasi] = useState('');
  const [previewData, setPreviewData] = useState<any>(null);


  useEffect(() => {
    setIsLoading(true);
    try {
      const userRole = localStorage.getItem('userRole');
      const user = getSourceData('currentUser', null);
      if (userRole !== 'wakasek_kesiswaan') {
         router.push('/dashboard');
         return;
      }
      setCurrentUser(user);
      
      const allData: CatatanPelanggaran[] = getSourceData('riwayatPelanggaran', []);
      setSemuaPelanggaran(allData);

      const teachersData = getSourceData('teachersData', {});
      setSchoolInfo(teachersData.schoolInfo || null);

    } catch (error) {
      toast({ title: "Gagal Memuat Data", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [router, toast]);

  const filteredData = useMemo(() => {
    return semuaPelanggaran
      .filter(p => {
        const isEskalasi = statusOptions.includes(p.status);
        const date = new Date(p.tanggal);
        const termMatch = searchTerm === "" || 
          p.namaSiswa.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.pelanggaran.toLowerCase().includes(searchTerm.toLowerCase());
        const statusMatch = statusFilter === "Semua" || p.status === statusFilter;
        const monthMatch = getMonth(date) === selectedMonth;
        const yearMatch = getYear(date) === selectedYear;
        return isEskalasi && termMatch && statusMatch && monthMatch && yearMatch;
      })
      .sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime());
  }, [semuaPelanggaran, searchTerm, statusFilter, selectedMonth, selectedYear]);
  
  const siswaEskalasi = useMemo(() => {
      const siswaSet = new Map<string, Siswa>();
      semuaPelanggaran.forEach(p => {
          if (statusOptions.includes(p.status) && !siswaSet.has(p.nis)) {
              siswaSet.set(p.nis, { id: p.id, nis: p.nis, nama: p.namaSiswa, kelas: p.kelas });
          }
      });
      return Array.from(siswaSet.values()).sort((a, b) => a.nama.localeCompare(b.nama));
  }, [semuaPelanggaran]);

  const handleBuatSurat = () => {
    if (!selectedSiswa || !tipeSurat || !rekomendasi) {
        toast({ title: "Gagal", description: "Harap pilih siswa, tipe surat, dan isi rekomendasi.", variant: "destructive" });
        return;
    }
    setPreviewData({
        siswa: selectedSiswa,
        rekomendasi,
        wakasek: currentUser?.nama,
    });
  };

  const handlePrint = () => {
      toast({ title: "Mencetak...", description: "Silakan periksa dialog cetak browser Anda." });
      setTimeout(() => window.print(), 500);
  };
  
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
      <div className="flex items-center gap-4 print:hidden">
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
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 print:hidden">
            <TabsTrigger value="arsip"><Archive className="mr-2 h-4 w-4" /> Arsip Laporan</TabsTrigger>
            <TabsTrigger value="surat"><FileSignature className="mr-2 h-4 w-4" /> Surat Rekomendasi</TabsTrigger>
        </TabsList>

        <TabsContent value="arsip">
          <Card>
            <CardHeader className="print:hidden">
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
        </TabsContent>

        <TabsContent value="surat">
            <Card>
                <CardHeader>
                    <CardTitle>Buat Surat Rekomendasi</CardTitle>
                    <CardDescription>Pilih siswa dan jenis surat untuk membuat dokumen resmi.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label>Pilih Siswa (dengan Kasus Eskalasi)</Label>
                            <Select onValueChange={(nis) => setSelectedSiswa(siswaEskalasi.find(s => s.nis === nis) || null)}>
                                <SelectTrigger><SelectValue placeholder="Pilih siswa..." /></SelectTrigger>
                                <SelectContent>
                                    {siswaEskalasi.map(s => <SelectItem key={s.nis} value={s.nis}>{s.nama} ({s.kelas})</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Jenis Surat</Label>
                            <Select onValueChange={(v: 'Mutasi' | 'Pindah Sekolah') => setTipeSurat(v)}>
                                <SelectTrigger><SelectValue placeholder="Pilih jenis surat..." /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Mutasi">Disarankan Mutasi (Internal)</SelectItem>
                                    <SelectItem value="Pindah Sekolah">Disarankan Pindah Sekolah (Eksternal)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="rekomendasi">Isi Rekomendasi Final</Label>
                        <Textarea id="rekomendasi" value={rekomendasi} onChange={(e) => setRekomendasi(e.target.value)} placeholder="Tuliskan rekomendasi akhir dari sekolah, misalnya: 'Siswa direkomendasikan untuk dimutasi ke program keahlian lain yang lebih sesuai dengan minat dan perilakunya.'"/>
                    </div>
                    <Button onClick={handleBuatSurat}>Buat Surat</Button>
                </CardContent>
            </Card>
            
            {previewData && (
                <div className="mt-6">
                    <div className="flex justify-between items-center mb-4 print:hidden">
                        <h3 className="font-semibold">Pratinjau Surat</h3>
                        <Button onClick={handlePrint}><Printer className="mr-2 h-4 w-4" /> Cetak Surat</Button>
                    </div>
                    <div id="print-area">
                        <SuratRekomendasiTemplate data={previewData} schoolInfo={schoolInfo} tipe={tipeSurat!} />
                    </div>
                </div>
            )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
