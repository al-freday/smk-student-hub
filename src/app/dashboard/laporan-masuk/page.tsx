
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getSourceData, updateSourceData } from "@/lib/data-manager";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle, MessageSquare, User, Calendar, ShieldAlert } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

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
    catatanWaliKelas?: string;
}

export default function LaporanMasukPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);

  const [kelasBinaan, setKelasBinaan] = useState<string[]>([]);
  const [pelanggaranDiKelas, setPelanggaranDiKelas] = useState<CatatanPelanggaran[]>([]);
  
  const [selectedCase, setSelectedCase] = useState<CatatanPelanggaran | null>(null);
  const [notes, setNotes] = useState("");

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

  const handleOpenDialog = (kasus: CatatanPelanggaran) => {
    setSelectedCase(kasus);
    setNotes(kasus.catatanWaliKelas || "");
  };

  const handleSaveNotes = () => {
    if (!selectedCase) return;
    
    const allPelanggaran: CatatanPelanggaran[] = getSourceData('riwayatPelanggaran', []);
    const updatedRiwayat = allPelanggaran.map(item =>
      item.id === selectedCase.id ? { ...item, catatanWaliKelas: notes } : item
    );
    updateSourceData('riwayatPelanggaran', updatedRiwayat);
    
    // Also update the state for immediate UI feedback
    setPelanggaranDiKelas(prev => prev.map(p => p.id === selectedCase.id ? {...p, catatanWaliKelas: notes} : p));

    toast({ title: "Catatan Disimpan", description: "Catatan pembinaan awal Anda telah disimpan." });
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
        <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
             {pelanggaranDiKelas.length > 0 ? (
                pelanggaranDiKelas.map(p => (
                   <Card key={p.id} className="flex flex-col">
                       <CardHeader>
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle className="text-lg">{p.namaSiswa}</CardTitle>
                                    <CardDescription>{p.kelas}</CardDescription>
                                </div>
                                <Badge variant="destructive">{p.poin} Poin</Badge>
                            </div>
                       </CardHeader>
                       <CardContent className="flex-1 space-y-2">
                           <p className="font-semibold text-sm">{p.pelanggaran}</p>
                           <p className="text-xs text-muted-foreground">Dilaporkan oleh: {p.guruPelapor}</p>
                           <p className="text-xs text-muted-foreground">Tanggal: {format(new Date(p.tanggal), "dd MMMM yyyy")}</p>
                       </CardContent>
                       <CardFooter>
                           <Dialog onOpenChange={(open) => !open && setSelectedCase(null)}>
                               <DialogTrigger asChild>
                                   <Button className="w-full" onClick={() => handleOpenDialog(p)}>Proses Kasus</Button>
                               </DialogTrigger>
                           </Dialog>
                       </CardFooter>
                   </Card>
                ))
             ) : (
                <div className="col-span-full text-center text-muted-foreground py-10">
                    Tidak ada laporan baru untuk kelas binaan Anda.
                </div>
             )}
        </CardContent>
      </Card>

      {selectedCase && (
        <Dialog open={!!selectedCase} onOpenChange={(open) => !open && setSelectedCase(null)}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Proses Kasus: {selectedCase.namaSiswa}</DialogTitle>
                    <DialogDescription>
                        Lakukan pembinaan awal dan tentukan tindak lanjut untuk kasus ini.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto pr-4">
                    <div className="p-4 bg-secondary rounded-lg space-y-2">
                        <h4 className="font-semibold flex items-center gap-2"><ShieldAlert /> Detail Pelanggaran</h4>
                        <p><strong>Pelanggaran:</strong> {selectedCase.pelanggaran} ({selectedCase.poin} poin)</p>
                        <p><strong>Tanggal:</strong> {format(new Date(selectedCase.tanggal), "EEEE, dd MMMM yyyy", { locale: 'id' })}</p>
                        <p><strong>Pelapor:</strong> {selectedCase.guruPelapor}</p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="catatan-pembinaan" className="font-semibold">Catat Hasil Pembinaan Awal (Panggil & Ajak Bicara Siswa)</Label>
                        <Textarea 
                            id="catatan-pembinaan"
                            placeholder="Tuliskan ringkasan pembicaraan, analisis, dan komitmen siswa di sini..."
                            rows={6}
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />
                        <div className="flex justify-end">
                            <Button size="sm" variant="outline" onClick={handleSaveNotes}>Simpan Catatan</Button>
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <div className="w-full flex justify-between">
                        <Button variant="secondary" onClick={() => { handleStatusChange(selectedCase.id, 'Ditindaklanjuti Wali Kelas'); setSelectedCase(null); }}>
                            <CheckCircle className="mr-2 h-4 w-4"/> Tandai Sudah Ditangani
                        </Button>
                        <Button variant="destructive" onClick={() => { handleStatusChange(selectedCase.id, 'Diteruskan ke BK'); setSelectedCase(null); }}>
                            <MessageSquare className="mr-2 h-4 w-4"/> Teruskan ke BK
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
      )}

    </div>
  );
}
