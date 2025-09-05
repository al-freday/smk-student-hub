
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getSourceData, updateSourceData } from "@/lib/data-manager";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle, MessageSquare, AlertTriangle, FileText } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

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

  // --- Data Pengguna & Kelas ---
  const [kelasBinaan, setKelasBinaan] = useState<string[]>([]);
  
  // --- Data Kasus ---
  const [pelanggaranDiKelas, setPelanggaranDiKelas] = useState<CatatanPelanggaran[]>([]);
  const [selectedCase, setSelectedCase] = useState<CatatanPelanggaran | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [catatanPembinaan, setCatatanPembinaan] = useState("");

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

  const handleOpenDialog = (kasus: CatatanPelanggaran) => {
    setSelectedCase(kasus);
    setCatatanPembinaan(kasus.catatanWaliKelas || "");
    setIsDialogOpen(true);
  };
  
  const handleStatusChange = (id: number, status: StatusLaporan) => {
    const allPelanggaran: CatatanPelanggaran[] = getSourceData('riwayatPelanggaran', []);
    const updatedRiwayat = allPelanggaran.map(item =>
      item.id === id ? { ...item, status: status } : item
    );
    updateSourceData('riwayatPelanggaran', updatedRiwayat);
    toast({ title: "Status Diperbarui", description: `Status laporan telah diubah menjadi "${status}".` });
    setIsDialogOpen(false);
    setSelectedCase(null);
  };

  const handleSaveCatatan = () => {
    if (!selectedCase) return;
    
    const allPelanggaran: CatatanPelanggaran[] = getSourceData('riwayatPelanggaran', []);
    const updatedRiwayat = allPelanggaran.map(item =>
      item.id === selectedCase.id ? { ...item, catatanWaliKelas: catatanPembinaan } : item
    );
    updateSourceData('riwayatPelanggaran', updatedRiwayat);
    
    toast({ title: "Catatan Disimpan", description: "Catatan pembinaan awal telah disimpan." });
    // Keep dialog open for further action
    // To update the state in the dialog
    setSelectedCase(prev => prev ? { ...prev, catatanWaliKelas: catatanPembinaan } : null);
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
                            <CardTitle className="text-lg">{p.namaSiswa}</CardTitle>
                            <CardDescription>{p.kelas} | {format(new Date(p.tanggal), "dd MMMM yyyy")}</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1 space-y-3">
                            <div>
                                <p className="text-sm font-semibold">Pelanggaran:</p>
                                <p className="text-sm text-muted-foreground">{p.pelanggaran} <Badge variant="destructive">{p.poin} Poin</Badge></p>
                            </div>
                             <div>
                                <p className="text-sm font-semibold">Pelapor:</p>
                                <p className="text-sm text-muted-foreground">{p.guruPelapor}</p>
                            </div>
                        </CardContent>
                        <DialogFooter className="p-6 pt-0">
                            <Button className="w-full" onClick={() => handleOpenDialog(p)}>
                                <FileText className="mr-2 h-4 w-4"/> Proses Kasus
                            </Button>
                        </DialogFooter>
                    </Card>
                ))
            ) : (
                <div className="col-span-full text-center h-48 flex flex-col justify-center items-center bg-secondary rounded-lg">
                    <CheckCircle className="h-12 w-12 text-green-500 mb-4"/>
                    <h3 className="text-lg font-semibold">Tidak Ada Laporan Baru</h3>
                    <p className="text-muted-foreground">Semua laporan pelanggaran di kelas Anda sudah ditangani.</p>
                </div>
            )}
        </CardContent>
      </Card>
      
      {/* Dialog Proses Kasus */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-2xl">
              <DialogHeader>
                  <DialogTitle>Detail Kasus & Tindak Lanjut</DialogTitle>
                  <DialogDescription>
                      Verifikasi, catat pembinaan, dan tentukan langkah selanjutnya untuk kasus ini.
                  </DialogDescription>
              </DialogHeader>
              {selectedCase && (
                <div className="grid gap-6 py-4">
                    {/* Bagian Detail Kasus */}
                    <div className="p-4 border rounded-lg bg-muted/50 space-y-3">
                        <h4 className="font-semibold">Ringkasan Laporan</h4>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                            <div><strong>Siswa:</strong> {selectedCase.namaSiswa}</div>
                            <div><strong>Kelas:</strong> {selectedCase.kelas}</div>
                            <div><strong>Tanggal:</strong> {format(new Date(selectedCase.tanggal), "dd MMMM yyyy")}</div>
                            <div><strong>Pelapor:</strong> {selectedCase.guruPelapor}</div>
                            <div className="col-span-2">
                                <strong>Pelanggaran:</strong> {selectedCase.pelanggaran} ({selectedCase.poin} poin)
                            </div>
                        </div>
                    </div>
                    
                    {/* Bagian Form Pembinaan */}
                    <div className="space-y-2">
                        <Label htmlFor="catatan-pembinaan" className="font-semibold">2. Panggil & Ajak Bicara Siswa: Catatan Pembinaan Awal</Label>
                        <Textarea 
                            id="catatan-pembinaan"
                            placeholder="Tulis ringkasan pembicaraan, analisis, dan komitmen siswa di sini..."
                            rows={5}
                            value={catatanPembinaan}
                            onChange={(e) => setCatatanPembinaan(e.target.value)}
                        />
                         <Button size="sm" variant="outline" onClick={handleSaveCatatan}>Simpan Catatan</Button>
                    </div>

                    {/* Bagian Aksi */}
                    <div className="space-y-2">
                         <Label className="font-semibold">3. Catat & Laporkan: Tentukan Status Akhir</Label>
                         <div className="flex flex-col sm:flex-row gap-2">
                             <Button className="flex-1" variant="secondary" onClick={() => handleStatusChange(selectedCase.id, 'Ditindaklanjuti Wali Kelas')}>
                                 <CheckCircle className="mr-2 h-4 w-4"/> Tandai Sudah Ditangani (Selesai di tingkat kelas)
                             </Button>
                              <Button className="flex-1" variant="destructive" onClick={() => handleStatusChange(selectedCase.id, 'Diteruskan ke BK')}>
                                 <MessageSquare className="mr-2 h-4 w-4"/> Teruskan ke BK (Kasus serius)
                             </Button>
                         </div>
                    </div>
                </div>
              )}
              <DialogFooter>
                  <DialogClose asChild>
                      <Button variant="outline">Tutup</Button>
                  </DialogClose>
              </DialogFooter>
          </DialogContent>
      </Dialog>
    </div>
  );
}

    