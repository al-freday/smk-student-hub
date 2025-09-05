
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

// --- Tipe Data ---
type StatusLaporan = 'Dilaporkan' | 'Ditindaklanjuti Wali Kelas' | 'Diteruskan ke BK' | 'Diproses BK' | 'Diteruskan ke Wakasek' | 'Diproses Wakasek' | 'Selesai' | 'Ditolak';

interface DetailPenanganan {
  kronologiKejadian?: string;
  catatanPembicaraan?: string;
  kategoriPelanggaran?: string;
  rekomendasiWakasek?: boolean;
  metodePanggilanOrtu?: string;
  hasilPanggilanOrtu?: string;
  tindakanPembinaan?: string;
  komitmenSiswa?: string;
  durasiPemantauan?: string;
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

export default function LaporanMasukWakasekPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("verifikasi");

  const [semuaPelanggaran, setSemuaPelanggaran] = useState<CatatanPelanggaran[]>([]);
  const [selectedPelanggaran, setSelectedPelanggaran] = useState<CatatanPelanggaran | null>(null);
  const [formData, setFormData] = useState<DetailPenanganan>({});

  const loadData = useCallback(() => {
    setIsLoading(true);
    try {
      const userRole = localStorage.getItem('userRole');
      if (userRole !== 'wakasek_kesiswaan') {
         toast({ title: "Akses Ditolak", description: "Halaman ini hanya untuk Wakasek Kesiswaan.", variant: "destructive" });
         router.push('/dashboard');
         return;
      }
      
      const allPelanggaran: CatatanPelanggaran[] = getSourceData('riwayatPelanggaran', []);
      setSemuaPelanggaran(allPelanggaran);

    } catch (error) {
      console.error("Gagal memuat data Laporan Masuk Wakasek:", error);
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
    .filter(p => ['Diteruskan ke Wakasek', 'Diproses Wakasek'].includes(p.status))
    .sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime());

  const handleSelectKasus = (pelanggaran: CatatanPelanggaran) => {
    if (selectedPelanggaran?.id === pelanggaran.id) {
        setSelectedPelanggaran(null);
        setFormData({});
    } else {
        setSelectedPelanggaran(pelanggaran);
        setFormData(pelanggaran.penanganan || {});
        setActiveTab("verifikasi");
        
        if(pelanggaran.status === 'Diteruskan ke Wakasek') {
            handleStatusChange(pelanggaran.id, 'Diproses Wakasek', false);
        }

        toast({
            title: "Kasus Dipilih",
            description: `Anda sedang memproses kasus ${pelanggaran.namaSiswa}. Status diperbarui menjadi "Diproses Wakasek".`,
        });
    }
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
        <h2 className="text-3xl font-bold tracking-tight">Laporan Eskalasi (Wakasek)</h2>
        <p className="text-muted-foreground">
            Tindak lanjuti laporan kasus berat yang diteruskan oleh Guru BK.
        </p>
      </div>
      
      <Card>
        <CardHeader>
            <CardTitle>Daftar Laporan Eskalasi</CardTitle>
            <CardDescription>Pilih kasus dari daftar di bawah ini untuk penanganan akhir.</CardDescription>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader><TableRow><TableHead>Siswa</TableHead><TableHead>Pelanggaran</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Aksi</TableHead></TableRow></TableHeader>
                <TableBody>
                    {pelanggaranMasuk.length > 0 ? pelanggaranMasuk.map(p => (
                         <TableRow key={p.id} className={cn(selectedPelanggaran?.id === p.id && "bg-secondary hover:bg-secondary")}>
                            <TableCell><p className="font-medium">{p.namaSiswa}</p><p className="text-xs text-muted-foreground">{p.kelas} | {format(new Date(p.tanggal), "dd MMMM yyyy", { locale: id })}</p></TableCell>
                            <TableCell><p>{p.pelanggaran}</p><Badge variant="destructive">{p.poin} Poin</Badge></TableCell>
                            <TableCell><Badge variant={p.status === 'Diproses Wakasek' ? 'default' : 'secondary'}>{p.status}</Badge></TableCell>
                            <TableCell className="text-right"><Button size="sm" variant={selectedPelanggaran?.id === p.id ? "default" : "outline"} onClick={() => handleSelectKasus(p)}>{selectedPelanggaran?.id === p.id ? <Check className="mr-2 h-4 w-4" /> : <ArrowRight className="mr-2 h-4 w-4" />} {selectedPelanggaran?.id === p.id ? 'Dipilih' : 'Pilih Kasus'}</Button></TableCell>
                        </TableRow>
                    )) : (<TableRow><TableCell colSpan={4} className="text-center h-24">Tidak ada laporan yang dieskalasi ke Anda saat ini.</TableCell></TableRow>)}
                </TableBody>
            </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div><CardTitle>Alur Kerja Penanganan Akhir</CardTitle>{selectedPelanggaran ? (<CardDescription>Anda sedang memproses kasus untuk: <span className="font-semibold text-primary">{selectedPelanggaran.namaSiswa}</span></CardDescription>) : (<CardDescription>Pilih sebuah kasus dari tabel di atas untuk mengaktifkan alur kerja.</CardDescription>)}</div>
        </CardHeader>
        <CardContent className="relative">
            <div className={cn(!selectedPelanggaran && "opacity-50 pointer-events-none")}>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="verifikasi">A. Verifikasi Akhir</TabsTrigger>
                    <TabsTrigger value="keputusan">B. Keputusan & Sanksi Final</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="verifikasi" className="pt-4">
                    <div className="p-4 border rounded-lg space-y-4">
                      <div className="flex items-center gap-3"><FileSignature className="h-5 w-5 text-primary"/><h3 className="font-semibold">Verifikasi Laporan dari Wali Kelas & Guru BK</h3></div>
                      <p className="text-sm text-muted-foreground">Periksa kembali seluruh data yang telah dikumpulkan oleh Wali Kelas dan Guru BK.</p>
                      
                       <div className="space-y-2">
                          <Label>Catatan Kronologi Kejadian (dari Wali Kelas)</Label>
                          <Textarea readOnly value={selectedPelanggaran?.penanganan?.kronologiKejadian || 'Tidak ada catatan.'} />
                      </div>
                      <div className="space-y-2">
                          <Label>Catatan Sesi Konseling (oleh Guru BK)</Label>
                          <Textarea readOnly value={selectedPelanggaran?.penanganan?.catatanPembicaraan || 'Tidak ada catatan.'} />
                      </div>

                      <div className="flex justify-end items-center pt-4 border-t">
                        <Button onClick={() => setActiveTab('keputusan')}>Data Lengkap, Lanjutkan ke Keputusan <ArrowRight className="ml-2 h-4 w-4" /></Button>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="keputusan" className="pt-4">
                    <div className="p-4 border rounded-lg space-y-4">
                      <div className="flex items-center gap-3"><UserCheck className="h-5 w-5 text-primary"/><h3 className="font-semibold">Keputusan Final & Tindak Lanjut</h3></div>
                      <p className="text-sm text-muted-foreground">Berikan keputusan akhir untuk kasus ini. Setelah ditandai selesai, kasus akan ditutup.</p>
                      <div className="space-y-2">
                          <Label htmlFor="tindakan-final">Catatan Keputusan / Sanksi Final</Label>
                          <Textarea id="tindakan-final" placeholder="Contoh: Diberikan sanksi skorsing selama 3 hari dan wajib lapor ke Guru BK setiap minggu..." rows={4} />
                      </div>
                      <div className="flex justify-end items-center pt-4 border-t gap-2">
                        <Button variant="secondary" onClick={() => selectedPelanggaran && handleStatusChange(selectedPelanggaran.id, 'Selesai')}>
                            Tandai Kasus Selesai
                        </Button>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
            </div>
            {!selectedPelanggaran && (<div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-b-lg"><p className="text-lg font-semibold text-muted-foreground">Pilih kasus di atas untuk memulai</p></div>)}
        </CardContent>
      </Card>
    </div>
  );
}
