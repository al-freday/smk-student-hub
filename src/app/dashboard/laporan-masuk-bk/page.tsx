
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
import { Loader2, Check, ArrowRight, FileSignature, Users, Phone, Handshake, Search, Save, UserCheck } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";

// --- Tipe Data ---
type StatusLaporan = 'Dilaporkan' | 'Ditindaklanjuti Wali Kelas' | 'Diteruskan ke BK' | 'Diproses BK' | 'Diteruskan ke Wakasek' | 'Selesai' | 'Ditolak';
type KategoriPelanggaran = 'Sengaja' | 'Tidak Sengaja' | '';
type MetodePanggilanOrtu = 'Telepon' | 'Kunjungan Rumah' | 'Surat Panggilan' | '';
type TindakanPembinaan = 'Kerja Bakti' | 'Sanksi' | 'Denda' | 'Skorsing' | '';
type DurasiPemantauan = '1 Minggu' | '1 Bulan' | '';

interface DetailPenanganan {
  kronologiKejadian?: string;
  catatanPembicaraan?: string;
  kategoriPelanggaran?: KategoriPelanggaran;
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
    tindakanAwal: string;
    status: StatusLaporan;
    penanganan?: DetailPenanganan;
}

export default function LaporanMasukBkPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("verifikasi");

  const [tingkatBinaan, setTingkatBinaan] = useState<string | null>(null);
  const [semuaPelanggaran, setSemuaPelanggaran] = useState<CatatanPelanggaran[]>([]);
  
  const [selectedPelanggaran, setSelectedPelanggaran] = useState<CatatanPelanggaran | null>(null);
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
      if (userRole !== 'guru_bk') {
         toast({ title: "Akses Ditolak", description: "Halaman ini hanya untuk Guru BK.", variant: "destructive" });
         router.push('/dashboard');
         return;
      }

      const teachersData = getSourceData('teachersData', {});
      const guruBkData = teachersData.guru_bk?.find((gbk: any) => gbk.nama === user.nama);
      const binaan = guruBkData?.tugasKelas || null;
      setTingkatBinaan(binaan);
      
      const allPelanggaran: CatatanPelanggaran[] = getSourceData('riwayatPelanggaran', []);
      setSemuaPelanggaran(allPelanggaran);

    } catch (error) {
      console.error("Gagal memuat data Laporan Masuk BK:", error);
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
  
  const pelanggaranMasuk = semuaPelanggaran
    .filter(p => tingkatBinaan && p.kelas.startsWith(tingkatBinaan.split(' ')[1]) && ['Diteruskan ke BK', 'Diproses BK'].includes(p.status))
    .sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime());

  const handleSelectKasus = (pelanggaran: CatatanPelanggaran) => {
    if (selectedPelanggaran?.id === pelanggaran.id) {
        setSelectedPelanggaran(null);
        setFormData({});
    } else {
        setSelectedPelanggaran(pelanggaran);
        setFormData(pelanggaran.penanganan || {});
        setActiveTab("verifikasi");
        
        // Automatically change status to "Diproses BK" when a case is selected for the first time
        if(pelanggaran.status === 'Diteruskan ke BK') {
            handleStatusChange(pelanggaran.id, 'Diproses BK', false); // Don't reset selection
        }

        toast({
            title: "Kasus Dipilih",
            description: `Anda sedang memproses kasus ${pelanggaran.namaSiswa}. Status diperbarui menjadi "Diproses BK".`,
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
  
  const handleStatusChange = (id: number, status: StatusLaporan, resetSelection: boolean = true) => {
    const updatedRiwayat = semuaPelanggaran.map(item =>
      item.id === id ? { ...item, status: status, penanganan: formData } : item
    );
    updateSourceData('riwayatPelanggaran', updatedRiwayat);
    toast({ title: "Status Diperbarui", description: `Status laporan telah diubah menjadi "${status}".` });
    if (resetSelection) {
        setSelectedPelanggaran(null);
        setFormData({});
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
       <div>
        <h2 className="text-3xl font-bold tracking-tight">Laporan Masuk (Guru BK)</h2>
        <p className="text-muted-foreground">
            Tindak lanjuti laporan yang diteruskan oleh Wali Kelas untuk siswa binaan Anda di <span className="font-semibold text-primary">{tingkatBinaan}</span>.
        </p>
      </div>
      
      <Card>
        <CardHeader>
            <CardTitle>Daftar Laporan Perlu Penanganan Lanjutan</CardTitle>
            <CardDescription>Pilih kasus dari daftar di bawah ini untuk memulai proses penanganan oleh BK.</CardDescription>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader><TableRow><TableHead>Siswa</TableHead><TableHead>Pelanggaran</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Aksi</TableHead></TableRow></TableHeader>
                <TableBody>
                    {pelanggaranMasuk.length > 0 ? pelanggaranMasuk.map(p => (
                         <TableRow key={p.id} className={cn(selectedPelanggaran?.id === p.id && "bg-secondary hover:bg-secondary")}>
                            <TableCell><p className="font-medium">{p.namaSiswa}</p><p className="text-xs text-muted-foreground">{p.kelas} | {format(new Date(p.tanggal), "dd MMMM yyyy", { locale: id })}</p></TableCell>
                            <TableCell><p>{p.pelanggaran}</p><Badge variant="destructive">{p.poin} Poin</Badge></TableCell>
                            <TableCell><Badge variant={p.status === 'Diproses BK' ? 'default' : 'secondary'}>{p.status}</Badge></TableCell>
                            <TableCell className="text-right"><Button size="sm" variant={selectedPelanggaran?.id === p.id ? "default" : "outline"} onClick={() => handleSelectKasus(p)}>{selectedPelanggaran?.id === p.id ? <Check className="mr-2 h-4 w-4" /> : <ArrowRight className="mr-2 h-4 w-4" />} {selectedPelanggaran?.id === p.id ? 'Dipilih' : 'Pilih Kasus'}</Button></TableCell>
                        </TableRow>
                    )) : (<TableRow><TableCell colSpan={4} className="text-center h-24">Tidak ada laporan yang diteruskan ke Anda saat ini.</TableCell></TableRow>)}
                </TableBody>
            </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div><CardTitle>Alur Kerja Penanganan Laporan BK</CardTitle>{selectedPelanggaran ? (<CardDescription>Anda sedang memproses kasus untuk: <span className="font-semibold text-primary">{selectedPelanggaran.namaSiswa}</span></CardDescription>) : (<CardDescription>Pilih sebuah kasus dari tabel di atas untuk mengaktifkan alur kerja.</CardDescription>)}</div>
          </div>
        </CardHeader>
        <CardContent className="relative">
            <div className={cn(!selectedPelanggaran && "opacity-50 pointer-events-none")}>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-3 md:grid-cols-6">
                    <TabsTrigger value="verifikasi">A. Verifikasi</TabsTrigger>
                    <TabsTrigger value="panggil">B. Panggil Siswa</TabsTrigger>
                    <TabsTrigger value="solusi">C. Pembinaan</TabsTrigger>
                    <TabsTrigger value="ortu">D. Panggil Ortu</TabsTrigger>
                    <TabsTrigger value="monitor">E. Monitoring</TabsTrigger>
                    <TabsTrigger value="catat">F. Catat & Selesaikan</TabsTrigger>
                  </TabsList>
                  
                  {/* VERIFIKASI */}
                  <TabsContent value="verifikasi" className="pt-4">
                    <div className="p-4 border rounded-lg space-y-4">
                      <div className="flex items-center gap-3"><FileSignature className="h-5 w-5 text-primary"/><h3 className="font-semibold">Verifikasi Laporan dari Wali Kelas</h3></div>
                      <p className="text-sm text-muted-foreground">Periksa kembali data yang telah dikumpulkan oleh Wali Kelas.</p>
                      
                       <div className="space-y-2">
                          <Label htmlFor="kronologi-kejadian">Catatan Kronologi Kejadian (dari Wali Kelas)</Label>
                          <Textarea id="kronologi-kejadian" readOnly value={selectedPelanggaran?.penanganan?.kronologiKejadian || 'Tidak ada catatan.'} />
                      </div>
                      <div className="space-y-2">
                          <Label>Kategori Pelanggaran (dari Wali Kelas)</Label>
                          <Input readOnly value={selectedPelanggaran?.penanganan?.kategoriPelanggaran || 'Belum ditentukan.'}/>
                      </div>

                      <div className="flex justify-between items-center pt-4 border-t">
                        <Button variant="outline" onClick={savePenanganan} disabled={!selectedPelanggaran}><Save className="mr-2 h-4 w-4" /> Simpan Progres</Button>
                        <Button onClick={() => setActiveTab('panggil')}>Data Valid, Lanjutkan <ArrowRight className="ml-2 h-4 w-4" /></Button>
                      </div>
                    </div>
                  </TabsContent>
                  
                  {/* PANGGIL SISWA */}
                  <TabsContent value="panggil" className="pt-4"><div className="p-4 border rounded-lg space-y-4"><div className="flex items-center gap-3"><Users className="h-5 w-5 text-primary"/><h3 className="font-semibold">Konseling Individual</h3></div><p className="text-sm text-muted-foreground">Lakukan sesi konseling mendalam untuk memahami akar masalah.</p><div className="space-y-2"><Label htmlFor="catatan-pembicaraan">Catatan Sesi Konseling (oleh Guru BK)</Label><Textarea id="catatan-pembicaraan" placeholder="Tuliskan hasil sesi konseling, temuan, dan rencana intervensi..." value={formData.catatanPembicaraan || ''} onChange={(e) => handleFormDataChange('catatanPembicaraan', e.target.value)} /></div><div className="flex justify-between items-center pt-4 border-t"><Button variant="outline" onClick={savePenanganan} disabled={!selectedPelanggaran}><Save className="mr-2 h-4 w-4" /> Simpan Progres</Button></div></div></TabsContent>

                  {/* PEMBINAAN */}
                  <TabsContent value="solusi" className="pt-4"><div className="p-4 border rounded-lg space-y-4"><div className="flex items-center gap-3"><Handshake className="h-5 w-5 text-primary"/><h3 className="font-semibold">Rencana Intervensi & Solusi</h3></div><p className="text-sm text-muted-foreground">Tentukan tindakan pembinaan lanjutan atau intervensi khusus.</p><div className="space-y-2"><Label htmlFor="tindakan-pembinaan">Tindakan Pembinaan Lanjutan</Label><Select value={formData.tindakanPembinaan} onValueChange={(v: TindakanPembinaan) => handleFormDataChange('tindakanPembinaan', v)}><SelectTrigger id="tindakan-pembinaan"><SelectValue placeholder="Pilih tindakan" /></SelectTrigger><SelectContent><SelectItem value="Kerja Bakti">Kerja Bakti</SelectItem><SelectItem value="Sanksi">Sanksi Edukatif</SelectItem><SelectItem value="Denda">Denda</SelectItem><SelectItem value="Skorsing">Skorsing</SelectItem></SelectContent></Select></div><div className="space-y-2"><Label htmlFor="komitmen-siswa">Perjanjian/Komitmen Tertulis Siswa (Baru)</Label><Textarea id="komitmen-siswa" placeholder="Jika ada komitmen baru yang dibuat bersama BK..." value={formData.komitmenSiswa || ''} onChange={(e) => handleFormDataChange('komitmenSiswa', e.target.value)} /></div><div className="flex justify-between items-center pt-4 border-t"><Button variant="outline" onClick={savePenanganan} disabled={!selectedPelanggaran}><Save className="mr-2 h-4 w-4" /> Simpan Progres</Button></div></div></TabsContent>
                  
                  {/* PANGGIL ORTU */}
                  <TabsContent value="ortu" className="pt-4"><div className="p-4 border rounded-lg space-y-4"><div className="flex items-center gap-3"><Phone className="h-5 w-5 text-primary"/><h3 className="font-semibold">Koordinasi dengan Orang Tua</h3></div><p className="text-sm text-muted-foreground">Lakukan komunikasi lanjutan dengan orang tua jika diperlukan.</p><div className="space-y-2"><Label htmlFor="metode-panggilan">Metode Komunikasi</Label><Select value={formData.metodePanggilanOrtu} onValueChange={(v: MetodePanggilanOrtu) => handleFormDataChange('metodePanggilanOrtu', v)}><SelectTrigger id="metode-panggilan"><SelectValue placeholder="Pilih metode" /></SelectTrigger><SelectContent><SelectItem value="Telepon">Telepon</SelectItem><SelectItem value="Kunjungan Rumah">Kunjungan Rumah</SelectItem><SelectItem value="Surat Panggilan">Surat Panggilan Resmi</SelectItem></SelectContent></Select></div><div className="space-y-2"><Label htmlFor="hasil-panggilan">Hasil Komunikasi</Label><Textarea id="hasil-panggilan" placeholder="Contoh: Orang tua sepakat untuk lebih mengawasi anak di rumah..." value={formData.hasilPanggilanOrtu || ''} onChange={(e) => handleFormDataChange('hasilPanggilanOrtu', e.target.value)} /></div><div className="flex justify-between items-center pt-4 border-t"><Button variant="outline" onClick={savePenanganan} disabled={!selectedPelanggaran}><Save className="mr-2 h-4 w-4" /> Simpan Progres</Button></div></div></TabsContent>
                  
                  {/* MONITORING */}
                   <TabsContent value="monitor" className="pt-4"><div className="p-4 border rounded-lg space-y-4"><div className="flex items-center gap-3"><Search className="h-5 w-5 text-primary"/><h3 className="font-semibold">Monitoring Perilaku</h3></div><p className="text-sm text-muted-foreground">Pantau perkembangan siswa setelah intervensi.</p><div className="space-y-2"><Label htmlFor="durasi-pemantauan">Durasi Pemantauan</Label><Select value={formData.durasiPemantauan} onValueChange={(v: DurasiPemantauan) => handleFormDataChange('durasiPemantauan', v)}><SelectTrigger id="durasi-pemantauan"><SelectValue placeholder="Pilih durasi" /></SelectTrigger><SelectContent><SelectItem value="1 Minggu">1 Minggu</SelectItem><SelectItem value="1 Bulan">1 Bulan</SelectItem></SelectContent></Select></div><div className="space-y-2"><Label htmlFor="hasil-pemantauan">Hasil Pemantauan</Label><Textarea id="hasil-pemantauan" placeholder="Contoh: Siswa menunjukkan perbaikan perilaku, lebih disiplin..." value={formData.hasilPemantauan || ''} onChange={(e) => handleFormDataChange('hasilPemantauan', e.target.value)} /></div><div className="flex justify-between items-center pt-4 border-t"><Button variant="outline" onClick={savePenanganan} disabled={!selectedPelanggaran}><Save className="mr-2 h-4 w-4" /> Simpan Progres</Button></div></div></TabsContent>
                  
                  {/* CATAT & SELESAIKAN */}
                  <TabsContent value="catat" className="pt-4"><div className="p-4 border rounded-lg space-y-4"><div className="flex items-center gap-3"><UserCheck className="h-5 w-5 text-primary"/><h3 className="font-semibold">Tutup atau Eskalasi Kasus</h3></div><p className="text-sm text-muted-foreground">Tandai kasus ini sebagai selesai atau teruskan ke Wakasek Kesiswaan jika kasusnya sangat serius.</p><div className="flex items-start space-x-3"><Checkbox id="rekomendasi-wakasek" checked={formData.rekomendasiWakasek} onCheckedChange={v => handleFormDataChange('rekomendasiWakasek', v)} /><label htmlFor="rekomendasi-wakasek" className="text-sm font-medium leading-none">Sarankan Koordinasi ke Wakasek Kesiswaan</label></div><div className="flex justify-between items-center pt-4 border-t"><Button variant="outline" onClick={savePenanganan} disabled={!selectedPelanggaran}><Save className="mr-2 h-4 w-4" /> Simpan Progres</Button><div className="flex gap-2"><Button variant="secondary" onClick={() => selectedPelanggaran && handleStatusChange(selectedPelanggaran.id, 'Selesai')}>Tandai Kasus Selesai</Button><Button onClick={() => selectedPelanggaran && handleStatusChange(selectedPelanggaran.id, 'Diteruskan ke Wakasek')}>Teruskan ke Wakasek (Kasus Berat)</Button></div></div></div></TabsContent>
                </Tabs>
            </div>
            {!selectedPelanggaran && (<div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-b-lg"><p className="text-lg font-semibold text-muted-foreground">Pilih kasus di atas untuk memulai</p></div>)}
        </CardContent>
      </Card>
      
    </div>
  );
}
