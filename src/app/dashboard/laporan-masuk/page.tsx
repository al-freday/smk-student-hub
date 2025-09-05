
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { getSourceData, updateSourceData } from "@/lib/data-manager";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle, MessageSquare, RefreshCw, FileSignature, Users, UserCheck, Phone, Handshake, Search } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";

// --- Tipe Data ---
type StatusLaporan = 'Dilaporkan' | 'Ditindaklanjuti Wali Kelas' | 'Diteruskan ke BK' | 'Selesai';
interface CatatanPelanggaran { 
    id: number; 
    tanggal: string; 
    namaSiswa: string; 
    kelas: string; 
    pelanggaran: string; 
    poin: number; 
    guruPelapor: string;
    status: StatusLaporan;
}

const checklistItems = [
    { id: "verifikasi-valid", label: "Pastikan laporan valid dan jelas sumbernya." },
    { id: "verifikasi-kronologi", label: "Tanya kronologi kejadian dengan tenang." },
    { id: "panggil-siswa", label: "Bicara empat mata dengan siswa." },
    { id: "panggil-analisis", label: "Analisis apakah pelanggaran disengaja atau tidak." },
    { id: "catat-kejadian", label: "Buat catatan ringkas kejadian." },
    { id: "catat-koordinasi", label: "Koordinasi dengan Guru BK jika kasusnya serius." },
    { id: "hubungi-ortu", label: "Hubungi orang tua/wali jika perlu." },
    { id: "solusi-bersama", label: "Cari solusi bersama orang tua." },
    { id: "pembinaan-edukatif", label: "Tentukan tindakan pembinaan yang mendidik." },
    { id: "pembinaan-komitmen", label: "Ajak siswa membuat komitmen perbaikan." },
    { id: "monitoring-followup", label: "Lakukan follow-up berkala terhadap siswa." },
    { id: "monitoring-kegiatan", label: "Arahkan siswa ke kegiatan positif." },
];


export default function LaporanMasukPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);

  const [kelasBinaan, setKelasBinaan] = useState<string[]>([]);
  const [pelanggaranDiKelas, setPelanggaranDiKelas] = useState<CatatanPelanggaran[]>([]);
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  const handleCheckChange = (id: string) => {
    setCheckedItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const resetChecklist = () => {
      setCheckedItems({});
      toast({ title: "Checklist Direset", description: "Anda dapat memulai checklist baru untuk kasus berikutnya." });
  };

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
            <CardTitle>Daftar Laporan Perlu Diverifikasi</CardTitle>
            <CardDescription>Berikut adalah {pelanggaranDiKelas.length} laporan baru yang membutuhkan tindakan Anda.</CardDescription>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Siswa</TableHead>
                        <TableHead>Pelanggaran</TableHead>
                        <TableHead>Pelapor</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {pelanggaranDiKelas.length > 0 ? pelanggaranDiKelas.map(p => (
                         <TableRow key={p.id}>
                            <TableCell>
                                <p className="font-medium">{p.namaSiswa}</p>
                                <p className="text-xs text-muted-foreground">{p.kelas} | {format(new Date(p.tanggal), "dd/MM/yy")}</p>
                            </TableCell>
                            <TableCell>
                                <p>{p.pelanggaran}</p>
                                <Badge variant="destructive">{p.poin} Poin</Badge>
                            </TableCell>
                            <TableCell>{p.guruPelapor}</TableCell>
                            <TableCell className="text-right">
                                <Button variant="secondary" size="sm" onClick={() => handleStatusChange(p.id, 'Ditindaklanjuti Wali Kelas')}>
                                    <CheckCircle className="mr-2 h-4 w-4"/> Tandai Sudah Ditangani
                                </Button>
                                <Button variant="destructive" size="sm" className="ml-2" onClick={() => handleStatusChange(p.id, 'Diteruskan ke BK')}>
                                    <MessageSquare className="mr-2 h-4 w-4"/> Teruskan ke BK
                                </Button>
                            </TableCell>
                        </TableRow>
                    )) : (
                        <TableRow><TableCell colSpan={4} className="text-center h-24">Tidak ada laporan baru untuk kelas binaan Anda.</TableCell></TableRow>
                    )}
                </TableBody>
            </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Alur Kerja Penanganan Laporan</CardTitle>
              <CardDescription>Gunakan panduan ini sebagai checklist saat menangani setiap kasus.</CardDescription>
            </div>
            <Button variant="outline" onClick={resetChecklist}><RefreshCw className="mr-2 h-4 w-4" /> Atur Ulang Checklist</Button>
          </div>
        </CardHeader>
        <CardContent>
            <Accordion type="multiple" className="w-full space-y-2">
                <AccordionItem value="verifikasi" className="border rounded-lg">
                    <AccordionTrigger className="p-4 hover:no-underline"><div className="flex items-center gap-3"><FileSignature className="h-5 w-5"/>Verifikasi Laporan</div></AccordionTrigger>
                    <AccordionContent className="p-4 pt-0 space-y-2">
                        <div className="flex items-start space-x-3"><Checkbox id="verifikasi-valid" checked={checkedItems["verifikasi-valid"]} onCheckedChange={() => handleCheckChange("verifikasi-valid")} /><label htmlFor="verifikasi-valid" className="text-sm text-muted-foreground leading-snug">Pastikan laporan valid dan jelas sumbernya (guru piket, guru mapel, BK, dll.), bukan sekadar gosip kelas.</label></div>
                        <div className="flex items-start space-x-3"><Checkbox id="verifikasi-kronologi" checked={checkedItems["verifikasi-kronologi"]} onCheckedChange={() => handleCheckChange("verifikasi-kronologi")} /><label htmlFor="verifikasi-kronologi" className="text-sm text-muted-foreground leading-snug">Tanya kronologi kejadian dengan tenang, jangan langsung menghakimi atau marah.</label></div>
                    </AccordionContent>
                </AccordionItem>
                 <AccordionItem value="panggil" className="border rounded-lg">
                    <AccordionTrigger className="p-4 hover:no-underline"><div className="flex items-center gap-3"><Users className="h-5 w-5"/>Panggil & Ajak Bicara Siswa</div></AccordionTrigger>
                    <AccordionContent className="p-4 pt-0 space-y-2">
                        <div className="flex items-start space-x-3"><Checkbox id="panggil-siswa" checked={checkedItems["panggil-siswa"]} onCheckedChange={() => handleCheckChange("panggil-siswa")} /><label htmlFor="panggil-siswa" className="text-sm text-muted-foreground leading-snug">Wali kelas harus jadi “pintu pertama” pembinaan. Bicara empat mata dulu, biar siswa merasa aman buat cerita.</label></div>
                        <div className="flex items-start space-x-3"><Checkbox id="panggil-analisis" checked={checkedItems["panggil-analisis"]} onCheckedChange={() => handleCheckChange("panggil-analisis")} /><label htmlFor="panggil-analisis" className="text-sm text-muted-foreground leading-snug">Bedakan: pelanggaran karena sengaja atau karena ketidaktahuan.</label></div>
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="catat" className="border rounded-lg">
                    <AccordionTrigger className="p-4 hover:no-underline"><div className="flex items-center gap-3"><UserCheck className="h-5 w-5"/>Catat & Laporkan</div></AccordionTrigger>
                    <AccordionContent className="p-4 pt-0 space-y-2">
                        <div className="flex items-start space-x-3"><Checkbox id="catat-kejadian" checked={checkedItems["catat-kejadian"]} onCheckedChange={() => handleCheckChange("catat-kejadian")} /><label htmlFor="catat-kejadian" className="text-sm text-muted-foreground leading-snug">Bikin catatan di buku tata tertib/administrasi wali kelas.</label></div>
                        <div className="flex items-start space-x-3"><Checkbox id="catat-koordinasi" checked={checkedItems["catat-koordinasi"]} onCheckedChange={() => handleCheckChange("catat-koordinasi")} /><label htmlFor="catat-koordinasi" className="text-sm text-muted-foreground leading-snug">Kalau kasus serius, koordinasi dengan guru BK dan Wakasek Kesiswaan.</label></div>
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="ortu" className="border rounded-lg">
                    <AccordionTrigger className="p-4 hover:no-underline"><div className="flex items-center gap-3"><Phone className="h-5 w-5"/>Panggil Orang Tua (Bila Perlu)</div></AccordionTrigger>
                    <AccordionContent className="p-4 pt-0 space-y-2">
                        <div className="flex items-start space-x-3"><Checkbox id="hubungi-ortu" checked={checkedItems["hubungi-ortu"]} onCheckedChange={() => handleCheckChange("hubungi-ortu")} /><label htmlFor="hubungi-ortu" className="text-sm text-muted-foreground leading-snug">Untuk pelanggaran berulang atau berat, wali kelas wajib menghubungi orang tua/wali murid.</label></div>
                        <div className="flex items-start space-x-3"><Checkbox id="solusi-bersama" checked={checkedItems["solusi-bersama"]} onCheckedChange={() => handleCheckChange("solusi-bersama")} /><label htmlFor="solusi-bersama" className="text-sm text-muted-foreground leading-snug">Tujuannya bukan sekadar “ngadu”, tapi cari solusi bareng.</label></div>
                    </AccordionContent>
                </AccordionItem>
                 <AccordionItem value="solusi" className="border rounded-lg">
                    <AccordionTrigger className="p-4 hover:no-underline"><div className="flex items-center gap-3"><Handshake className="h-5 w-5"/>Pembinaan & Solusi</div></AccordionTrigger>
                    <AccordionContent className="p-4 pt-0 space-y-2">
                        <div className="flex items-start space-x-3"><Checkbox id="pembinaan-edukatif" checked={checkedItems["pembinaan-edukatif"]} onCheckedChange={() => handleCheckChange("pembinaan-edukatif")} /><label htmlFor="pembinaan-edukatif" className="text-sm text-muted-foreground leading-snug">Cari hukuman yang mendidik, bukan sekadar menghukum. Misalnya: kerja bakti, presentasi tentang aturan sekolah, atau bimbingan khusus.</label></div>
                        <div className="flex items-start space-x-3"><Checkbox id="pembinaan-komitmen" checked={checkedItems["pembinaan-komitmen"]} onCheckedChange={() => handleCheckChange("pembinaan-komitmen")} /><label htmlFor="pembinaan-komitmen" className="text-sm text-muted-foreground leading-snug">Ajak siswa bikin komitmen tertulis supaya lebih serius memperbaiki diri.</label></div>
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="monitor" className="border rounded-lg">
                    <AccordionTrigger className="p-4 hover:no-underline"><div className="flex items-center gap-3"><Search className="h-5 w-5"/>Monitoring</div></AccordionTrigger>
                    <AccordionContent className="p-4 pt-0 space-y-2">
                         <div className="flex items-start space-x-3"><Checkbox id="monitoring-followup" checked={checkedItems["monitoring-followup"]} onCheckedChange={() => handleCheckChange("monitoring-followup")} /><label htmlFor="monitoring-followup" className="text-sm text-muted-foreground leading-snug">Setelah kasus selesai, wali kelas tetap memantau. Jangan sampai anak merasa ditinggalkan atau dicap nakal permanen.</label></div>
                        <div className="flex items-start space-x-3"><Checkbox id="monitoring-kegiatan" checked={checkedItems["monitoring-kegiatan"]} onCheckedChange={() => handleCheckChange("monitoring-kegiatan")} /><label htmlFor="monitoring-kegiatan" className="text-sm text-muted-foreground leading-snug">Dorong anak buat lebih aktif di kegiatan positif biar energinya tersalurkan.</label></div>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
