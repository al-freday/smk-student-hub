
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { getSourceData, updateSourceData } from "@/lib/data-manager";
import { format } from "date-fns";
import { id } from 'date-fns/locale';
import { useToast } from "@/hooks/use-toast";
import { Loader2, Check, ArrowRight, FileSignature, Users, UserCheck, Phone, Handshake, Search, RefreshCw, Save } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


// --- Tipe Data ---
type StatusLaporan = 'Dilaporkan' | 'Ditindaklanjuti Wali Kelas' | 'Diteruskan ke BK' | 'Selesai' | 'Ditolak';
type KategoriPelanggaran = 'Sengaja' | 'Tidak Sengaja' | '';
type MetodePanggilanOrtu = 'Telepon' | 'Kunjungan Rumah' | 'Surat Panggilan' | '';
type TindakanPembinaan = 'Kerja Bakti' | 'Sanksi' | 'Denda' | 'Skorsing' | '';
type DurasiPemantauan = '1 Minggu' | '1 Bulan' | '';

interface DetailPenanganan {
  catatanPembicaraan?: string;
  kategoriPelanggaran?: KategoriPelanggaran;
  rekomendasiBK?: boolean;
  rekomendasiWakasek?: boolean;
  metodePanggilanOrtu?: MetodePanggilanOrtu;
  hasilPanggilanOrtu?: string;
  tindakanPembinaan?: TindakanPembinaan;
  komitmenSiswa?: string;
  durasiPemantauan?: DurasiPemantauan;
  hasilPemantauan?: string;
}

interface CatatanPelanggaran { 
    id: number; 
    tanggal: string; 
    namaSiswa: string; 
    kelas: string; 
    pelanggaran: string; 
    poin: number; 
    guruPelapor: string;
    status: StatusLaporan;
    penanganan?: DetailPenanganan;
}

const checklistStorageKey = 'laporanChecklistStatus';

export default function LaporanMasukPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("verifikasi");

  const [kelasBinaan, setKelasBinaan] = useState<string[]>([]);
  const [semuaPelanggaran, setSemuaPelanggaran] = useState<CatatanPelanggaran[]>([]);
  
  const [selectedPelanggaran, setSelectedPelanggaran] = useState<CatatanPelanggaran | null>(null);
  const [pelanggaranToTolak, setPelanggaranToTolak] = useState<CatatanPelanggaran | null>(null);
  const [formData, setFormData] = useState<DetailPenanganan>({});

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
      setSemuaPelanggaran(allPelanggaran);

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
  
  const pelanggaranDiKelas = semuaPelanggaran
    .filter(p => kelasBinaan.includes(p.kelas) && p.status === 'Dilaporkan')
    .sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime());

  const handleSelectKasus = (pelanggaran: CatatanPelanggaran) => {
    if (selectedPelanggaran?.id === pelanggaran.id) {
        setSelectedPelanggaran(null);
        setFormData({});
    } else {
        setSelectedPelanggaran(pelanggaran);
        setFormData(pelanggaran.penanganan || {});
        setActiveTab("verifikasi");
        toast({
            title: "Kasus Dipilih",
            description: `Anda sedang memproses kasus untuk ${pelanggaran.namaSiswa}.`,
        });
    }
  };

  const handleFormDataChange = (field: keyof DetailPenanganan, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  const savePenanganan = () => {
    if (!selectedPelanggaran) return;

    const updatedRiwayat = semuaPelanggaran.map(item =>
      item.id === selectedPelanggaran.id ? { ...item, penanganan: formData } : item
    );
    updateSourceData('riwayatPelanggaran', updatedRiwayat);
    toast({ title: "Progres Disimpan", description: "Perubahan pada alur kerja telah disimpan." });
  };
  
  const handleStatusChange = (id: number, status: StatusLaporan) => {
    const updatedRiwayat = semuaPelanggaran.map(item =>
      item.id === id ? { ...item, status: status, penanganan: formData } : item
    );
    updateSourceData('riwayatPelanggaran', updatedRiwayat);
    toast({ title: "Status Diperbarui", description: `Status laporan telah diubah menjadi "${status}".` });
    if (status === 'Ditolak' || status === 'Ditindaklanjuti Wali Kelas' || status === 'Diteruskan ke BK') {
        setSelectedPelanggaran(null);
        setFormData({});
    }
  };


  const handleTolakLaporan = () => {
    if (!pelanggaranToTolak) return;
    handleStatusChange(pelanggaranToTolak.id, 'Ditolak');
    setPelanggaranToTolak(null);
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
            <CardDescription>Pilih kasus dari daftar di bawah ini untuk memulai proses penanganan.</CardDescription>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader><TableRow><TableHead>Siswa</TableHead><TableHead>Pelanggaran</TableHead><TableHead>Pelapor</TableHead><TableHead className="text-right">Aksi</TableHead></TableRow></TableHeader>
                <TableBody>
                    {pelanggaranDiKelas.length > 0 ? pelanggaranDiKelas.map(p => (
                         <TableRow key={p.id} className={cn(selectedPelanggaran?.id === p.id && "bg-secondary hover:bg-secondary")}>
                            <TableCell><p className="font-medium">{p.namaSiswa}</p><p className="text-xs text-muted-foreground">{p.kelas} | {format(new Date(p.tanggal), "dd MMM yyyy", { locale: id })}</p></TableCell>
                            <TableCell><p>{p.pelanggaran}</p><Badge variant="destructive">{p.poin} Poin</Badge></TableCell>
                            <TableCell>{p.guruPelapor}</TableCell>
                            <TableCell className="text-right"><Button size="sm" variant={selectedPelanggaran?.id === p.id ? "default" : "outline"} onClick={() => handleSelectKasus(p)}>{selectedPelanggaran?.id === p.id ? <Check className="mr-2 h-4 w-4" /> : <ArrowRight className="mr-2 h-4 w-4" />} {selectedPelanggaran?.id === p.id ? 'Dipilih' : 'Pilih Kasus'}</Button></TableCell>
                        </TableRow>
                    )) : (<TableRow><TableCell colSpan={4} className="text-center h-24">Tidak ada laporan baru untuk kelas binaan Anda.</TableCell></TableRow>)}
                </TableBody>
            </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div><CardTitle>Alur Kerja Penanganan Laporan</CardTitle>{selectedPelanggaran ? (<CardDescription>Anda sedang memproses kasus untuk: <span className="font-semibold text-primary">{selectedPelanggaran.namaSiswa}</span></CardDescription>) : (<CardDescription>Pilih sebuah kasus dari tabel di atas untuk mengaktifkan alur kerja.</CardDescription>)}</div>
            <Button variant="outline" onClick={savePenanganan} disabled={!selectedPelanggaran}><Save className="mr-2 h-4 w-4" /> Simpan Progres</Button>
          </div>
        </CardHeader>
        <CardContent className="relative">
            <div className={cn(!selectedPelanggaran && "opacity-50 pointer-events-none")}>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-3 md:grid-cols-6"><TabsTrigger value="verifikasi">Verifikasi</TabsTrigger><TabsTrigger value="panggil">Panggil Siswa</TabsTrigger><TabsTrigger value="catat">Catat</TabsTrigger><TabsTrigger value="ortu">Panggil Ortu</TabsTrigger><TabsTrigger value="solusi">Pembinaan</TabsTrigger><TabsTrigger value="monitor">Monitoring</TabsTrigger></TabsList>
                  
                  {/* VERIFIKASI */}
                  <TabsContent value="verifikasi" className="pt-4"><div className="p-4 border rounded-lg space-y-4"><div className="flex items-center gap-3"><FileSignature className="h-5 w-5 text-primary"/><h3 className="font-semibold">Verifikasi Laporan</h3></div><p className="text-sm text-muted-foreground">Pastikan laporan valid dan jelas sumbernya sebelum melanjutkan.</p>{selectedPelanggaran && (<div className="text-sm p-3 bg-secondary rounded-md"><p><strong>Pelapor:</strong> {selectedPelanggaran.guruPelapor}</p><p><strong>Waktu Laporan:</strong> {format(new Date(selectedPelanggaran.tanggal), "EEEE, dd MMMM yyyy", { locale: id })}</p><p><strong>Poin Pelanggaran:</strong> <Badge variant="destructive">{selectedPelanggaran.poin}</Badge></p></div>)}<div className="flex items-start space-x-3"><p className="text-sm font-medium">1.</p><p className="text-sm text-muted-foreground leading-snug">Pastikan laporan valid dan jelas sumbernya (guru piket, guru mapel, BK, dll.), bukan sekadar gosip kelas.</p></div><div className="flex items-start space-x-3"><p className="text-sm font-medium">2.</p><p className="text-sm text-muted-foreground leading-snug">Tanya kronologi kejadian dengan tenang, jangan langsung menghakimi atau marah.</p></div><div className="flex justify-end gap-2 pt-4 border-t"><Button variant="destructive" onClick={() => setPelanggaranToTolak(selectedPelanggaran)}>Tolak Laporan (Tidak Valid)</Button><Button onClick={() => setActiveTab('panggil')}>Laporan Valid, Lanjutkan <ArrowRight className="ml-2 h-4 w-4" /></Button></div></div></TabsContent>
                  
                  {/* PANGGIL SISWA */}
                  <TabsContent value="panggil" className="pt-4"><div className="p-4 border rounded-lg space-y-4"><div className="flex items-center gap-3"><Users className="h-5 w-5 text-primary"/><h3 className="font-semibold">Panggil & Ajak Bicara Siswa</h3></div><p className="text-sm text-muted-foreground">Lakukan pembinaan awal sebagai wali kelas. Catat hasil pembicaraan sebagai bukti.</p><div className="space-y-2"><Label htmlFor="catatan-pembicaraan">1. Catatan Pembicaraan (Ringkasan)</Label><Textarea id="catatan-pembicaraan" placeholder="Tulis ringkasan pembicaraan, pengakuan siswa, atau komitmen yang dibuat..." value={formData.catatanPembicaraan || ''} onChange={(e) => handleFormDataChange('catatanPembicaraan', e.target.value)} /></div><div className="space-y-2"><Label>2. Kategori Pelanggaran</Label><RadioGroup value={formData.kategoriPelanggaran} onValueChange={(v: KategoriPelanggaran) => handleFormDataChange('kategoriPelanggaran', v)} className="flex gap-4"><div className="flex items-center space-x-2"><RadioGroupItem value="Sengaja" id="sengaja" /><Label htmlFor="sengaja">Sengaja</Label></div><div className="flex items-center space-x-2"><RadioGroupItem value="Tidak Sengaja" id="tidak-sengaja" /><Label htmlFor="tidak-sengaja">Tidak Sengaja/Lalai</Label></div></RadioGroup></div></div></TabsContent>
                  
                  {/* CATAT & LAPORKAN */}
                  <TabsContent value="catat" className="pt-4"><div className="p-4 border rounded-lg space-y-4"><div className="flex items-center gap-3"><UserCheck className="h-5 w-5 text-primary"/><h3 className="font-semibold">Catat & Eskalasi (Jika Perlu)</h3></div><p className="text-sm text-muted-foreground">Tandai kasus ini sebagai ditangani atau teruskan ke jenjang berikutnya jika kasusnya serius.</p><div className="flex items-start space-x-3"><Checkbox id="rekomendasi-bk" checked={formData.rekomendasiBK} onCheckedChange={v => handleFormDataChange('rekomendasiBK', v)} /><label htmlFor="rekomendasi-bk" className="text-sm font-medium leading-none">Sarankan Koordinasi ke Guru BK</label></div><div className="flex items-start space-x-3"><Checkbox id="rekomendasi-wakasek" checked={formData.rekomendasiWakasek} onCheckedChange={v => handleFormDataChange('rekomendasiWakasek', v)} /><label htmlFor="rekomendasi-wakasek" className="text-sm font-medium leading-none">Sarankan Koordinasi ke Wakasek Kesiswaan</label></div><div className="flex justify-end gap-2 pt-4 border-t"><Button variant="secondary" onClick={() => selectedPelanggaran && handleStatusChange(selectedPelanggaran.id, 'Ditindaklanjuti Wali Kelas')}>Tandai Selesai (Kasus Ringan)</Button><Button onClick={() => selectedPelanggaran && handleStatusChange(selectedPelanggaran.id, 'Diteruskan ke BK')}>Teruskan ke BK (Kasus Serius)</Button></div></div></TabsContent>
                  
                  {/* PANGGIL ORTU */}
                  <TabsContent value="ortu" className="pt-4"><div className="p-4 border rounded-lg space-y-4"><div className="flex items-center gap-3"><Phone className="h-5 w-5 text-primary"/><h3 className="font-semibold">Panggil Orang Tua (Bila Perlu)</h3></div><p className="text-sm text-muted-foreground">Untuk pelanggaran berat atau berulang, catat komunikasi Anda dengan orang tua/wali.</p><div className="space-y-2"><Label htmlFor="metode-panggilan">1. Metode Komunikasi</Label><Select value={formData.metodePanggilanOrtu} onValueChange={(v: MetodePanggilanOrtu) => handleFormDataChange('metodePanggilanOrtu', v)}><SelectTrigger id="metode-panggilan"><SelectValue placeholder="Pilih metode" /></SelectTrigger><SelectContent><SelectItem value="Telepon">Telepon</SelectItem><SelectItem value="Kunjungan Rumah">Kunjungan Rumah</SelectItem><SelectItem value="Surat Panggilan">Surat Panggilan Resmi</SelectItem></SelectContent></Select></div><div className="space-y-2"><Label htmlFor="hasil-panggilan">2. Hasil Komunikasi</Label><Textarea id="hasil-panggilan" placeholder="Contoh: Orang tua sepakat untuk lebih mengawasi anak di rumah..." value={formData.hasilPanggilanOrtu || ''} onChange={(e) => handleFormDataChange('hasilPanggilanOrtu', e.target.value)} /></div></div></TabsContent>
                  
                  {/* PEMBINAAN */}
                  <TabsContent value="solusi" className="pt-4"><div className="p-4 border rounded-lg space-y-4"><div className="flex items-center gap-3"><Handshake className="h-5 w-5 text-primary"/><h3 className="font-semibold">Pembinaan & Solusi</h3></div><p className="text-sm text-muted-foreground">Catat tindakan pembinaan yang diberikan dan komitmen dari siswa.</p><div className="space-y-2"><Label htmlFor="tindakan-pembinaan">1. Tindakan Pembinaan yang Diberikan</Label><Select value={formData.tindakanPembinaan} onValueChange={(v: TindakanPembinaan) => handleFormDataChange('tindakanPembinaan', v)}><SelectTrigger id="tindakan-pembinaan"><SelectValue placeholder="Pilih tindakan" /></SelectTrigger><SelectContent><SelectItem value="Kerja Bakti">Kerja Bakti</SelectItem><SelectItem value="Sanksi">Sanksi Edukatif</SelectItem><SelectItem value="Denda">Denda</SelectItem><SelectItem value="Skorsing">Skorsing</SelectItem></SelectContent></Select></div><div className="space-y-2"><Label htmlFor="komitmen-siswa">2. Perjanjian/Komitmen Tertulis Siswa</Label><Textarea id="komitmen-siswa" placeholder="Contoh: Saya berjanji tidak akan mengulangi perbuatan..." value={formData.komitmenSiswa || ''} onChange={(e) => handleFormDataChange('komitmenSiswa', e.target.value)} /></div></div></TabsContent>
                  
                  {/* MONITORING */}
                   <TabsContent value="monitor" className="pt-4"><div className="p-4 border rounded-lg space-y-4"><div className="flex items-center gap-3"><Search className="h-5 w-5 text-primary"/><h3 className="font-semibold">Monitoring</h3></div><p className="text-sm text-muted-foreground">Catat hasil pemantauan setelah pembinaan dilakukan.</p><div className="space-y-2"><Label htmlFor="durasi-pemantauan">1. Durasi Pemantauan</Label><Select value={formData.durasiPemantauan} onValueChange={(v: DurasiPemantauan) => handleFormDataChange('durasiPemantauan', v)}><SelectTrigger id="durasi-pemantauan"><SelectValue placeholder="Pilih durasi" /></SelectTrigger><SelectContent><SelectItem value="1 Minggu">1 Minggu</SelectItem><SelectItem value="1 Bulan">1 Bulan</SelectItem></SelectContent></Select></div><div className="space-y-2"><Label htmlFor="hasil-pemantauan">2. Hasil Pemantauan</Label><Textarea id="hasil-pemantauan" placeholder="Contoh: Siswa menunjukkan perbaikan perilaku, lebih disiplin..." value={formData.hasilPemantauan || ''} onChange={(e) => handleFormDataChange('hasilPemantauan', e.target.value)} /></div></div></TabsContent>
                </Tabs>
            </div>
            {!selectedPelanggaran && (<div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-b-lg"><p className="text-lg font-semibold text-muted-foreground">Pilih kasus di atas untuk memulai</p></div>)}
        </CardContent>
      </Card>
      
      <AlertDialog open={!!pelanggaranToTolak} onOpenChange={() => setPelanggaranToTolak(null)}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Tolak Laporan?</AlertDialogTitle><AlertDialogDescription>Anda yakin ingin menolak laporan untuk <span className="font-bold">{pelanggaranToTolak?.namaSiswa}</span>? Laporan ini akan ditandai sebagai "Ditolak" dan tidak akan diproses lebih lanjut.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Batal</AlertDialogCancel><AlertDialogAction onClick={handleTolakLaporan} className="bg-destructive hover:bg-destructive/90">Ya, Tolak Laporan</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
    </div>
  );
}

    