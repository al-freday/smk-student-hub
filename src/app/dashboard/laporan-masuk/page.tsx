
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
import { Loader2, Check, ArrowRight, FileSignature, Users, UserCheck, Phone, Handshake, Search, RefreshCw } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";


// --- Tipe Data ---
type StatusLaporan = 'Dilaporkan' | 'Ditindaklanjuti Wali Kelas' | 'Diteruskan ke BK' | 'Selesai' | 'Ditolak';
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

const checklistStorageKey = 'laporanChecklistStatus';

export default function LaporanMasukPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("verifikasi");

  const [kelasBinaan, setKelasBinaan] = useState<string[]>([]);
  const [pelanggaranDiKelas, setPelanggaranDiKelas] = useState<CatatanPelanggaran[]>([]);
  
  const [selectedPelanggaranId, setSelectedPelanggaranId] = useState<number | null>(null);
  const [checkedItems, setCheckedItems] = useState<Record<number, Record<string, boolean>>>({});
  const [pelanggaranToTolak, setPelanggaranToTolak] = useState<CatatanPelanggaran | null>(null);

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

      setCheckedItems(getSourceData(checklistStorageKey, {}));

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

  const handleSelectKasus = (pelanggaranId: number) => {
    if (selectedPelanggaranId === pelanggaranId) {
        setSelectedPelanggaranId(null); // Batalkan pilihan jika mengklik yang sama
    } else {
        setSelectedPelanggaranId(pelanggaranId);
        toast({
            title: "Kasus Dipilih",
            description: `Checklist penanganan untuk ${pelanggaranDiKelas.find(p => p.id === pelanggaranId)?.namaSiswa} kini aktif.`,
        });
    }
  };

  const handleCheckChange = (itemId: string) => {
    if (!selectedPelanggaranId) return;

    const newCheckedItems = { ...checkedItems };
    if (!newCheckedItems[selectedPelanggaranId]) {
      newCheckedItems[selectedPelanggaranId] = {};
    }
    newCheckedItems[selectedPelanggaranId][itemId] = !newCheckedItems[selectedPelanggaranId][itemId];
    
    setCheckedItems(newCheckedItems);
    updateSourceData(checklistStorageKey, newCheckedItems);
  };
  
  const resetChecklistForSelected = () => {
    if (!selectedPelanggaranId) return;
    const newCheckedItems = { ...checkedItems };
    delete newCheckedItems[selectedPelanggaranId];
    setCheckedItems(newCheckedItems);
    updateSourceData(checklistStorageKey, newCheckedItems);
    toast({ title: "Checklist Direset", description: "Anda dapat memulai ulang checklist untuk kasus ini." });
  };

  const handleTolakLaporan = () => {
    if (!pelanggaranToTolak) return;
    handleStatusChange(pelanggaranToTolak.id, 'Ditolak');
    setPelanggaranToTolak(null);
  };

  const currentCheckedState = selectedPelanggaranId ? (checkedItems[selectedPelanggaranId] || {}) : {};
  const selectedPelanggaran = pelanggaranDiKelas.find(p => p.id === selectedPelanggaranId);


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
            <CardDescription>Pilih kasus dari daftar di bawah ini untuk memulai proses penanganan pada checklist.</CardDescription>
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
                         <TableRow key={p.id} className={cn(selectedPelanggaranId === p.id && "bg-secondary hover:bg-secondary")}>
                            <TableCell>
                                <p className="font-medium">{p.namaSiswa}</p>
                                <p className="text-xs text-muted-foreground">{p.kelas} | {format(new Date(p.tanggal), "dd MMM yyyy", { locale: id })}</p>
                            </TableCell>
                            <TableCell>
                                <p>{p.pelanggaran}</p>
                                <Badge variant="destructive">{p.poin} Poin</Badge>
                            </TableCell>
                            <TableCell>{p.guruPelapor}</TableCell>
                            <TableCell className="text-right">
                                <Button size="sm" variant={selectedPelanggaranId === p.id ? "default" : "outline"} onClick={() => handleSelectKasus(p.id)}>
                                    {selectedPelanggaranId === p.id ? <Check className="mr-2 h-4 w-4" /> : <ArrowRight className="mr-2 h-4 w-4" />}
                                    {selectedPelanggaranId === p.id ? 'Dipilih' : 'Pilih Kasus'}
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
              {selectedPelanggaran ? (
                <CardDescription>
                    Anda sedang memproses kasus untuk: <span className="font-semibold text-primary">{selectedPelanggaran.namaSiswa}</span>
                </CardDescription>
              ) : (
                <CardDescription>Pilih sebuah kasus dari tabel di atas untuk mengaktifkan checklist.</CardDescription>
              )}
            </div>
            <Button variant="outline" onClick={resetChecklistForSelected} disabled={!selectedPelanggaranId}><RefreshCw className="mr-2 h-4 w-4" /> Atur Ulang Checklist</Button>
          </div>
        </CardHeader>
        <CardContent className="relative">
            <div className={cn(!selectedPelanggaranId && "opacity-50 pointer-events-none")}>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-3 md:grid-cols-6">
                    <TabsTrigger value="verifikasi">Verifikasi</TabsTrigger>
                    <TabsTrigger value="panggil">Panggil Siswa</TabsTrigger>
                    <TabsTrigger value="catat">Catat & Lapor</TabsTrigger>
                    <TabsTrigger value="ortu">Panggil Ortu</TabsTrigger>
                    <TabsTrigger value="solusi">Pembinaan</TabsTrigger>
                    <TabsTrigger value="monitor">Monitoring</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="verifikasi" className="pt-4">
                    <div className="p-4 border rounded-lg space-y-4">
                        <div className="flex items-center gap-3"><FileSignature className="h-5 w-5 text-primary"/><h3 className="font-semibold">Verifikasi Laporan</h3></div>
                        
                        {selectedPelanggaran && (
                            <div className="text-sm p-3 bg-secondary rounded-md">
                                <p><strong>Pelapor:</strong> {selectedPelanggaran.guruPelapor}</p>
                                <p><strong>Waktu Laporan:</strong> {format(new Date(selectedPelanggaran.tanggal), "EEEE, dd MMMM yyyy", { locale: id })}</p>
                                <p><strong>Poin Pelanggaran:</strong> <Badge variant="destructive">{selectedPelanggaran.poin}</Badge></p>
                            </div>
                        )}

                        <div className="flex items-start space-x-3"><Checkbox id="verifikasi-valid" checked={currentCheckedState["verifikasi-valid"]} onCheckedChange={() => handleCheckChange("verifikasi-valid")} /><label htmlFor="verifikasi-valid" className="text-sm text-muted-foreground leading-snug">Pastikan laporan valid dan jelas sumbernya (guru piket, guru mapel, BK, dll.), bukan sekadar gosip kelas.</label></div>
                        <div className="flex items-start space-x-3"><Checkbox id="verifikasi-kronologi" checked={currentCheckedState["verifikasi-kronologi"]} onCheckedChange={() => handleCheckChange("verifikasi-kronologi")} /><label htmlFor="verifikasi-kronologi" className="text-sm text-muted-foreground leading-snug">Tanya kronologi kejadian dengan tenang, jangan langsung menghakimi atau marah.</label></div>

                         <div className="flex justify-end gap-2 pt-4 border-t">
                            <Button variant="destructive" onClick={() => setPelanggaranToTolak(selectedPelanggaran)}>Tolak Laporan (Tidak Valid)</Button>
                            <Button onClick={() => setActiveTab('panggil')} disabled={!currentCheckedState["verifikasi-valid"] || !currentCheckedState["verifikasi-kronologi"]}>
                                Laporan Valid, Lanjutkan <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="panggil" className="pt-4">
                     <div className="p-4 border rounded-lg space-y-4">
                        <div className="flex items-center gap-3"><Users className="h-5 w-5 text-primary"/><h3 className="font-semibold">Panggil & Ajak Bicara Siswa</h3></div>
                        <div className="flex items-start space-x-3"><Checkbox id="panggil-siswa" checked={currentCheckedState["panggil-siswa"]} onCheckedChange={() => handleCheckChange("panggil-siswa")} /><label htmlFor="panggil-siswa" className="text-sm text-muted-foreground leading-snug">Wali kelas harus jadi “pintu pertama” pembinaan. Bicara empat mata dulu, biar siswa merasa aman buat cerita.</label></div>
                        <div className="flex items-start space-x-3"><Checkbox id="panggil-analisis" checked={currentCheckedState["panggil-analisis"]} onCheckedChange={() => handleCheckChange("panggil-analisis")} /><label htmlFor="panggil-analisis" className="text-sm text-muted-foreground leading-snug">Bedakan: pelanggaran karena sengaja atau karena ketidaktahuan.</label></div>
                     </div>
                  </TabsContent>
                   <TabsContent value="catat" className="pt-4">
                     <div className="p-4 border rounded-lg space-y-4">
                        <div className="flex items-center gap-3"><UserCheck className="h-5 w-5 text-primary"/><h3 className="font-semibold">Catat & Laporkan</h3></div>
                        <div className="flex items-start space-x-3"><Checkbox id="catat-kejadian" checked={currentCheckedState["catat-kejadian"]} onCheckedChange={() => handleCheckChange("catat-kejadian")} /><label htmlFor="catat-kejadian" className="text-sm text-muted-foreground leading-snug">Bikin catatan di buku tata tertib/administrasi wali kelas.</label></div>
                        <div className="flex items-start space-x-3"><Checkbox id="catat-koordinasi" checked={currentCheckedState["catat-koordinasi"]} onCheckedChange={() => handleCheckChange("catat-koordinasi")} /><label htmlFor="catat-koordinasi" className="text-sm text-muted-foreground leading-snug">Kalau kasus serius, koordinasi dengan guru BK dan Wakasek Kesiswaan.</label></div>
                     </div>
                  </TabsContent>
                  <TabsContent value="ortu" className="pt-4">
                     <div className="p-4 border rounded-lg space-y-4">
                        <div className="flex items-center gap-3"><Phone className="h-5 w-5 text-primary"/><h3 className="font-semibold">Panggil Orang Tua (Bila Perlu)</h3></div>
                        <div className="flex items-start space-x-3"><Checkbox id="hubungi-ortu" checked={currentCheckedState["hubungi-ortu"]} onCheckedChange={() => handleCheckChange("hubungi-ortu")} /><label htmlFor="hubungi-ortu" className="text-sm text-muted-foreground leading-snug">Untuk pelanggaran berulang atau berat, wali kelas wajib menghubungi orang tua/wali murid.</label></div>
                        <div className="flex items-start space-x-3"><Checkbox id="solusi-bersama" checked={currentCheckedState["solusi-bersama"]} onCheckedChange={() => handleCheckChange("solusi-bersama")} /><label htmlFor="solusi-bersama" className="text-sm text-muted-foreground leading-snug">Tujuannya bukan sekadar “ngadu”, tapi cari solusi bareng.</label></div>
                     </div>
                  </TabsContent>
                  <TabsContent value="solusi" className="pt-4">
                     <div className="p-4 border rounded-lg space-y-4">
                        <div className="flex items-center gap-3"><Handshake className="h-5 w-5 text-primary"/><h3 className="font-semibold">Pembinaan & Solusi</h3></div>
                        <div className="flex items-start space-x-3"><Checkbox id="pembinaan-edukatif" checked={currentCheckedState["pembinaan-edukatif"]} onCheckedChange={() => handleCheckChange("pembinaan-edukatif")} /><label htmlFor="pembinaan-edukatif" className="text-sm text-muted-foreground leading-snug">Cari hukuman yang mendidik, bukan sekadar menghukum. Misalnya: kerja bakti, presentasi tentang aturan sekolah, atau bimbingan khusus.</label></div>
                        <div className="flex items-start space-x-3"><Checkbox id="pembinaan-komitmen" checked={currentCheckedState["pembinaan-komitmen"]} onCheckedChange={() => handleCheckChange("pembinaan-komitmen")} /><label htmlFor="pembinaan-komitmen" className="text-sm text-muted-foreground leading-snug">Ajak siswa bikin komitmen tertulis supaya lebih serius memperbaiki diri.</label></div>
                     </div>
                  </TabsContent>
                   <TabsContent value="monitor" className="pt-4">
                     <div className="p-4 border rounded-lg space-y-4">
                        <div className="flex items-center gap-3"><Search className="h-5 w-5 text-primary"/><h3 className="font-semibold">Monitoring</h3></div>
                        <div className="flex items-start space-x-3"><Checkbox id="monitoring-followup" checked={currentCheckedState["monitoring-followup"]} onCheckedChange={() => handleCheckChange("monitoring-followup")} /><label htmlFor="monitoring-followup" className="text-sm text-muted-foreground leading-snug">Setelah kasus selesai, wali kelas tetap memantau. Jangan sampai anak merasa ditinggalkan atau dicap nakal permanen.</label></div>
                        <div className="flex items-start space-x-3"><Checkbox id="monitoring-kegiatan" checked={currentCheckedState["monitoring-kegiatan"]} onCheckedChange={() => handleCheckChange("monitoring-kegiatan")} /><label htmlFor="monitoring-kegiatan" className="text-sm text-muted-foreground leading-snug">Dorong anak buat lebih aktif di kegiatan positif biar energinya tersalurkan.</label></div>
                     </div>
                  </TabsContent>
                </Tabs>
            </div>
            {!selectedPelanggaranId && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-b-lg">
                    <p className="text-lg font-semibold text-muted-foreground">Pilih kasus di atas untuk memulai</p>
                </div>
            )}
        </CardContent>
      </Card>
      
      <AlertDialog open={!!pelanggaranToTolak} onOpenChange={() => setPelanggaranToTolak(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tolak Laporan?</AlertDialogTitle>
            <AlertDialogDescription>
              Anda yakin ingin menolak laporan untuk <span className="font-bold">{pelanggaranToTolak?.namaSiswa}</span>? Laporan ini akan ditandai sebagai "Ditolak" dan tidak akan diproses lebih lanjut.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleTolakLaporan} className="bg-destructive hover:bg-destructive/90">Ya, Tolak Laporan</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
