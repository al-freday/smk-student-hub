"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getSourceData, updateSourceData } from "@/lib/data-manager";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle, MessageSquare, AlertTriangle, FileText, Check, User, Phone, BookOpen, Lightbulb, Repeat, RotateCcw } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

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

interface ChecklistItem {
    id: string;
    label: string;
    checked: boolean;
}

const initialChecklist: ChecklistItem[] = [
    { id: 'verifikasi-valid', label: 'Pastikan laporan valid dan jelas sumbernya (guru piket, guru mapel, BK, dll.), bukan sekadar gosip kelas.', checked: false },
    { id: 'verifikasi-kronologi', label: 'Tanya kronologi kejadian dengan tenang, jangan langsung menghakimi atau marah.', checked: false },
    { id: 'panggil-pintu-pertama', label: 'Wali kelas harus jadi “pintu pertama” pembinaan.', checked: false },
    { id: 'panggil-empat-mata', label: 'Bicara empat mata dulu, biar siswa merasa aman buat cerita.', checked: false },
    { id: 'panggil-bedakan', label: 'Bedakan: pelanggaran karena sengaja atau karena ketidaktahuan.', checked: false },
    { id: 'catat-buku', label: 'Bikin catatan di buku tata tertib/administrasi wali kelas.', checked: false },
    { id: 'catat-koordinasi', label: 'Kalau kasus serius, koordinasi dengan guru BK dan Wakasek Kesiswaan.', checked: false },
    { id: 'ortu-wajib', label: 'Untuk pelanggaran berulang atau berat, wali kelas wajib menghubungi orang tua/wali murid.', checked: false },
    { id: 'ortu-solusi', label: 'Tujuannya bukan sekadar “ngadu”, tapi cari solusi bareng.', checked: false },
    { id: 'solusi-mendidik', label: 'Cari hukuman yang mendidik, bukan sekadar menghukum. Misalnya: kerja bakti, presentasi tentang aturan sekolah, atau bimbingan khusus.', checked: false },
    { id: 'solusi-komitmen', label: 'Ajak siswa bikin komitmen tertulis supaya lebih serius memperbaiki diri.', checked: false },
    { id: 'monitor-pantau', label: 'Setelah kasus selesai, wali kelas tetap memantau. Jangan sampai anak merasa ditinggalkan atau dicap nakal permanen.', checked: false },
    { id: 'monitor-positif', label: 'Dorong anak buat lebih aktif di kegiatan positif biar energinya tersalurkan.', checked: false },
];


export default function LaporanMasukPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);

  const [kelasBinaan, setKelasBinaan] = useState<string[]>([]);
  const [pelanggaranDiKelas, setPelanggaranDiKelas] = useState<CatatanPelanggaran[]>([]);
  const [checklist, setChecklist] = useState<ChecklistItem[]>(initialChecklist);

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

  const handleChecklistChange = (itemId: string, checked: boolean) => {
    setChecklist(prev => prev.map(item => item.id === itemId ? { ...item, checked } : item));
  };
  
  const resetChecklist = () => {
      setChecklist(initialChecklist);
      toast({ title: "Checklist Direset", description: "Anda dapat memulai penanganan untuk kasus baru." });
  }

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
                <TableHeader><TableRow><TableHead>Siswa & Tanggal</TableHead><TableHead>Detail Pelanggaran</TableHead><TableHead>Pelapor</TableHead><TableHead className="text-right">Aksi</TableHead></TableRow></TableHeader>
                <TableBody>
                     {pelanggaranDiKelas.length > 0 ? (
                        pelanggaranDiKelas.map(p => (
                           <TableRow key={p.id}>
                              <TableCell>
                                  <p className="font-medium">{p.namaSiswa}</p>
                                  <p className="text-xs text-muted-foreground">{p.kelas} | {format(new Date(p.tanggal), "dd MMM yyyy")}</p>
                              </TableCell>
                              <TableCell>
                                  <p>{p.pelanggaran}</p>
                                  <Badge variant="destructive">{p.poin} Poin</Badge>
                              </TableCell>
                               <TableCell>{p.guruPelapor}</TableCell>
                              <TableCell className="text-right">
                                  <Button className="mr-2" size="sm" variant="secondary" onClick={() => handleStatusChange(p.id, 'Ditindaklanjuti Wali Kelas')}>
                                     <CheckCircle className="mr-2 h-4 w-4"/> Tandai Ditangani
                                 </Button>
                                  <Button size="sm" variant="destructive" onClick={() => handleStatusChange(p.id, 'Diteruskan ke BK')}>
                                     <MessageSquare className="mr-2 h-4 w-4"/> Teruskan ke BK
                                 </Button>
                              </TableCell>
                          </TableRow>
                        ))
                     ) : (
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
                 <Button variant="outline" size="sm" onClick={resetChecklist}>
                    <RotateCcw className="mr-2 h-4 w-4"/>
                    Atur Ulang Checklist
                 </Button>
            </div>
        </CardHeader>
        <CardContent>
             <Accordion type="multiple" className="w-full space-y-2" defaultValue={['verifikasi']}>
                <AccordionItem value="verifikasi">
                    <AccordionTrigger className="font-semibold text-base p-3 bg-secondary rounded-md"><Check className="mr-2 h-5 w-5"/>Verifikasi Laporan</AccordionTrigger>
                    <AccordionContent className="p-4 space-y-2">
                        {checklist.filter(c => c.id.startsWith('verifikasi')).map(item => (
                            <div key={item.id} className="flex items-center space-x-2">
                                <Checkbox id={item.id} checked={item.checked} onCheckedChange={(checked) => handleChecklistChange(item.id, !!checked)} />
                                <Label htmlFor={item.id}>{item.label}</Label>
                            </div>
                        ))}
                    </AccordionContent>
                </AccordionItem>
                 <AccordionItem value="panggil">
                    <AccordionTrigger className="font-semibold text-base p-3 bg-secondary rounded-md"><User className="mr-2 h-5 w-5"/>Panggil & Ajak Bicara Siswa</AccordionTrigger>
                    <AccordionContent className="p-4 space-y-2">
                         {checklist.filter(c => c.id.startsWith('panggil')).map(item => (
                            <div key={item.id} className="flex items-center space-x-2">
                                <Checkbox id={item.id} checked={item.checked} onCheckedChange={(checked) => handleChecklistChange(item.id, !!checked)} />
                                <Label htmlFor={item.id}>{item.label}</Label>
                            </div>
                        ))}
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="catat">
                    <AccordionTrigger className="font-semibold text-base p-3 bg-secondary rounded-md"><BookOpen className="mr-2 h-5 w-5"/>Catat & Laporkan</AccordionTrigger>
                    <AccordionContent className="p-4 space-y-2">
                         {checklist.filter(c => c.id.startsWith('catat')).map(item => (
                            <div key={item.id} className="flex items-center space-x-2">
                                <Checkbox id={item.id} checked={item.checked} onCheckedChange={(checked) => handleChecklistChange(item.id, !!checked)} />
                                <Label htmlFor={item.id}>{item.label}</Label>
                            </div>
                        ))}
                    </AccordionContent>
                </AccordionItem>
                 <AccordionItem value="ortu">
                    <AccordionTrigger className="font-semibold text-base p-3 bg-secondary rounded-md"><Phone className="mr-2 h-5 w-5"/>Panggil Orang Tua (Bila Perlu)</AccordionTrigger>
                    <AccordionContent className="p-4 space-y-2">
                         {checklist.filter(c => c.id.startsWith('ortu')).map(item => (
                            <div key={item.id} className="flex items-center space-x-2">
                                <Checkbox id={item.id} checked={item.checked} onCheckedChange={(checked) => handleChecklistChange(item.id, !!checked)} />
                                <Label htmlFor={item.id}>{item.label}</Label>
                            </div>
                        ))}
                    </AccordionContent>
                </AccordionItem>
                 <AccordionItem value="solusi">
                    <AccordionTrigger className="font-semibold text-base p-3 bg-secondary rounded-md"><Lightbulb className="mr-2 h-5 w-5"/>Pembinaan & Solusi</AccordionTrigger>
                    <AccordionContent className="p-4 space-y-2">
                         {checklist.filter(c => c.id.startsWith('solusi')).map(item => (
                            <div key={item.id} className="flex items-center space-x-2">
                                <Checkbox id={item.id} checked={item.checked} onCheckedChange={(checked) => handleChecklistChange(item.id, !!checked)} />
                                <Label htmlFor={item.id}>{item.label}</Label>
                            </div>
                        ))}
                    </AccordionContent>
                </AccordionItem>
                 <AccordionItem value="monitoring">
                    <AccordionTrigger className="font-semibold text-base p-3 bg-secondary rounded-md"><Repeat className="mr-2 h-5 w-5"/>Monitoring</AccordionTrigger>
                    <AccordionContent className="p-4 space-y-2">
                         {checklist.filter(c => c.id.startsWith('monitor')).map(item => (
                            <div key={item.id} className="flex items-center space-x-2">
                                <Checkbox id={item.id} checked={item.checked} onCheckedChange={(checked) => handleChecklistChange(item.id, !!checked)} />
                                <Label htmlFor={item.id}>{item.label}</Label>
                            </div>
                        ))}
                    </AccordionContent>
                </AccordionItem>
             </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
