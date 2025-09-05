
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, MessageSquare, CheckCircle, Loader2, BookOpen, Users } from "lucide-react";
import { getSourceData, updateSourceData } from "@/lib/data-manager";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";

// --- Tipe Data ---
type StatusLaporan = 'Dilaporkan' | 'Ditindaklanjuti Wali Kelas' | 'Diteruskan ke BK' | 'Selesai';
interface CatatanPelanggaran { 
    id: number; 
    tanggal: string; 
    namaSiswa: string; 
    kelas: string; 
    pelanggaran: string; 
    poin: number; 
    status: StatusLaporan;
    guruPelapor: string;
    tindakanAwal?: string;
    catatanWaliKelas?: string; // Kolom baru untuk catatan pembinaan
}

export default function LaporanMasukPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);

  // --- Data Pengguna & Kelas ---
  const [currentUser, setCurrentUser] = useState<{ nama: string } | null>(null);
  const [kelasBinaan, setKelasBinaan] = useState<string[]>([]);
  
  // --- Data Terfilter ---
  const [pelanggaranDiKelas, setPelanggaranDiKelas] = useState<CatatanPelanggaran[]>([]);

  // --- State untuk Dialog ---
  const [selectedKasus, setSelectedKasus] = useState<CatatanPelanggaran | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
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
      setCurrentUser(user);

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
  
  const handleOpenDetail = (kasus: CatatanPelanggaran) => {
    setSelectedKasus(kasus);
    setCatatanPembinaan(kasus.catatanWaliKelas || "");
    setIsDetailOpen(true);
  };
  
  const handleSavePembinaan = () => {
    if (!selectedKasus) return;

    const allPelanggaran: CatatanPelanggaran[] = getSourceData('riwayatPelanggaran', []);
    const updatedRiwayat = allPelanggaran.map(item =>
      item.id === selectedKasus.id ? { ...item, catatanWaliKelas: catatanPembinaan, status: 'Ditindaklanjuti Wali Kelas' as StatusLaporan } : item
    );
    updateSourceData('riwayatPelanggaran', updatedRiwayat);
    toast({ title: "Catatan Disimpan", description: `Catatan pembinaan untuk ${selectedKasus.namaSiswa} telah disimpan.` });
    setIsDetailOpen(false);
    setSelectedKasus(null);
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
            {pelanggaranDiKelas.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {pelanggaranDiKelas.map(p => (
                        <Card key={p.id} className="flex flex-col">
                            <CardHeader>
                                <CardTitle className="text-lg">{p.namaSiswa}</CardTitle>
                                <CardDescription>{p.kelas} | Dilaporkan oleh {p.guruPelapor}</CardDescription>
                            </CardHeader>
                            <CardContent className="flex-1 space-y-2">
                                <p className="text-sm font-semibold">{p.pelanggaran} <Badge variant="destructive">{p.poin} Poin</Badge></p>
                                <p className="text-xs text-muted-foreground">Tanggal: {format(new Date(p.tanggal), "dd MMMM yyyy")}</p>
                                {p.tindakanAwal && <p className="text-xs italic text-muted-foreground">Tindakan Awal: "{p.tindakanAwal}"</p>}
                            </CardContent>
                            <CardFooter className="flex justify-between">
                                 <Button variant="outline" onClick={() => handleOpenDetail(p)}>Proses Kasus</Button>
                                 <DropdownMenu>
                                    <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal /></Button></DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        <DropdownMenuItem onClick={() => handleStatusChange(p.id, 'Diteruskan ke BK')}><MessageSquare className="mr-2 h-4 w-4" />Teruskan ke BK</DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="text-center h-48 flex flex-col justify-center items-center">
                    <CheckCircle className="h-12 w-12 text-green-500 mb-4"/>
                    <h3 className="text-lg font-semibold">Tidak Ada Laporan Baru</h3>
                    <p className="text-muted-foreground">Semua laporan pelanggaran di kelas Anda sudah ditangani.</p>
                </div>
            )}
        </CardContent>
      </Card>
      
       <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
          <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                  <DialogTitle>Detail Kasus & Pembinaan Awal</DialogTitle>
                  <DialogDescription>
                      Siswa: <span className="font-semibold text-primary">{selectedKasus?.namaSiswa} ({selectedKasus?.kelas})</span>
                  </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                  <div>
                      <h4 className="font-semibold text-sm">Detail Pelanggaran</h4>
                      <div className="text-sm p-3 bg-secondary rounded-md mt-1">
                          <p><strong>Pelanggaran:</strong> {selectedKasus?.pelanggaran} ({selectedKasus?.poin} poin)</p>
                          <p><strong>Tanggal:</strong> {selectedKasus && format(new Date(selectedKasus.tanggal), "dd MMMM yyyy")}</p>
                          <p><strong>Pelapor:</strong> {selectedKasus?.guruPelapor}</p>
                          {selectedKasus?.tindakanAwal && <p><strong>Tindakan Awal:</strong> {selectedKasus.tindakanAwal}</p>}
                      </div>
                  </div>
                  <Separator />
                  <div>
                    <Label htmlFor="catatan-pembinaan" className="font-semibold text-sm flex items-center gap-2 mb-2">
                        <Users className="h-4 w-4"/>
                        Catat Hasil Pembinaan Awal (Panggil & Bicara)
                    </Label>
                    <Textarea 
                        id="catatan-pembinaan"
                        placeholder="Tuliskan ringkasan pembicaraan, analisis, dan komitmen siswa di sini..."
                        rows={6}
                        value={catatanPembinaan}
                        onChange={(e) => setCatatanPembinaan(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                        Menyimpan catatan ini akan otomatis mengubah status kasus menjadi "Ditindaklanjuti Wali Kelas".
                    </p>
                  </div>
              </div>
              <DialogFooter>
                  <DialogClose asChild><Button variant="outline">Tutup</Button></DialogClose>
                  <Button onClick={handleSavePembinaan}>Simpan Hasil Pembinaan</Button>
              </DialogFooter>
          </DialogContent>
      </Dialog>
    </div>
  );
}
