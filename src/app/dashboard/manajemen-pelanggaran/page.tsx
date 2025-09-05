
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusCircle, User, ShieldAlert, BookMarked, TrendingDown, School, AlertTriangle, Building, FileWarning } from "lucide-react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { format, startOfMonth, isAfter } from "date-fns";
import { Input } from "@/components/ui/input";
import { getSourceData, updateSourceData } from "@/lib/data-manager";
import { Loader2 } from "lucide-react";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { tataTertibData as initialTataTertibData } from "@/lib/tata-tertib-data";
import StatCard from "@/components/stat-card";
import PelanggaranPieChart from "@/components/pelanggaran-pie-chart";
import { Separator } from "@/components/ui/separator";

// --- Interface Definitions ---
interface Siswa {
  id: number;
  nis: string;
  nama: string;
  kelas: string;
}

interface Kelas {
    id: number;
    nama: string;
}

type TataTertib = typeof initialTataTertibData;
type KategoriKey = keyof TataTertib;

const kategoriInfo: { [key in KategoriKey]: { title: string } } = {
  kehadiran: { title: "Pelanggaran Kehadiran & Ketertiban" },
  seragam: { title: "Pelanggaran Seragam & Penampilan" },
  lingkungan: { title: "Pelanggaran Tata Tertib Kelas & Lingkungan" },
  etika: { title: "Pelanggaran Etika & Perilaku" },
  akademik: { title: "Pelanggaran Akademik" },
  teknologi: { title: "Pelanggaran Teknologi & Media Sosial" },
  kegiatan: { title: "Pelanggaran Kegiatan Sekolah" },
  hukum: { title: "Pelanggaran Berat Terkait Hukum" },
};

const flattenTataTertib = (data: TataTertib) => {
    const allRules: { id: number, deskripsi: string, poin: number, kategori: KategoriKey, tingkat: string }[] = [];
    let idCounter = 1;
    for (const kategori in data) {
        for (const tingkat in data[kategori as KategoriKey]) {
            // @ts-ignore
            data[kategori as KategoriKey][tingkat].forEach(rule => {
                allRules.push({ ...rule, id: idCounter++, kategori: kategori as KategoriKey, tingkat });
            });
        }
    }
    return allRules;
};

interface CatatanPelanggaran {
  id: string; 
  originalId: number; 
  tanggal: string;
  nis: string;
  namaSiswa: string;
  kelas: string;
  pelanggaran: string;
  poin: number;
  guruPelapor: string;
  tindakanAwal: string;
  status: 'Dilaporkan' | 'Ditindaklanjuti Wali Kelas' | 'Diteruskan ke BK' | 'Selesai';
}


export default function ManajemenPelanggaranPage() {
  const { toast } = useToast();
  
  // --- Data States ---
  const [isLoading, setIsLoading] = useState(true);
  const [daftarSiswa, setDaftarSiswa] = useState<Siswa[]>([]);
  const [daftarKelas, setDaftarKelas] = useState<Kelas[]>([]);
  const [daftarTataTertib, setDaftarTataTertib] = useState<{ id: number; deskripsi: string; poin: number; kategori: KategoriKey; tingkat: string; }[]>([]);
  const [riwayatPelanggaran, setRiwayatPelanggaran] = useState<CatatanPelanggaran[]>([]);
  const [currentUser, setCurrentUser] = useState<{ nama: string; role: string } | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  
  // --- Filter State ---
  const [filter, setFilter] = useState("");

  // --- Dialog & Form States ---
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // --- Form Data States ---
  const [selectedKelasForForm, setSelectedKelasForForm] = useState<string>("");
  const [selectedNis, setSelectedNis] = useState<string>("");
  const [selectedKategori, setSelectedKategori] = useState<KategoriKey | "">("");
  const [selectedRuleId, setSelectedRuleId] = useState<string>("");
  const [tindakanAwal, setTindakanAwal] = useState("");

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
        const user = await getSourceData('currentUser', null);
        const role = localStorage.getItem('userRole');
        
        setCurrentUser(user);
        setUserRole(role);
        
        const [siswaData, kelasData, pelanggaranData, tataTertib] = await Promise.all([
            getSourceData('siswaData', []),
            getSourceData('kelasData', []),
            getSourceData('riwayatPelanggaran', []),
            getSourceData('tataTertibData', initialTataTertibData),
        ]);

        setDaftarSiswa(siswaData);
        setDaftarKelas(kelasData);

        if (Array.isArray(pelanggaranData)) {
            const pelanggaranFormatted: CatatanPelanggaran[] = pelanggaranData.map((p, index) => ({
                ...p,
                id: `pelanggaran-${p.id}-${p.tanggal}-${index}`,
                originalId: p.id,
            }));
            setRiwayatPelanggaran(pelanggaranFormatted);
        } else {
            setRiwayatPelanggaran([]);
        }

        setDaftarTataTertib(flattenTataTertib(tataTertib));
    } catch (error) {
        toast({ title: "Gagal memuat data", variant: "destructive"});
        console.error(error);
    } finally {
        setIsLoading(false);
    }
  }, [toast]);
  
  useEffect(() => {
    loadData();
  }, [loadData]);
  
  const handleOpenDialog = () => {
    setSelectedKelasForForm("");
    setSelectedNis("");
    setSelectedKategori("");
    setSelectedRuleId("");
    setTindakanAwal("");
    setIsDialogOpen(true);
  };

  const handleSaveCatatan = async () => {
    const siswa = daftarSiswa.find(s => s.nis === selectedNis);
    const aturan = daftarTataTertib.find(t => t.id.toString() === selectedRuleId);

    if (!siswa || !aturan) {
      toast({ title: "Gagal Menyimpan", description: "Harap lengkapi semua pilihan formulir.", variant: "destructive" });
      return;
    }
    
    const currentRiwayat: any[] = await getSourceData('riwayatPelanggaran', []);
    const newCatatan = {
      id: currentRiwayat.length > 0 ? Math.max(...currentRiwayat.map((c: any) => c.id)) + 1 : 1,
      tanggal: format(new Date(), "yyyy-MM-dd"),
      nis: siswa.nis,
      namaSiswa: siswa.nama,
      kelas: siswa.kelas,
      pelanggaran: aturan.deskripsi,
      poin: aturan.poin,
      guruPelapor: currentUser?.nama || "Guru",
      tindakanAwal: tindakanAwal,
      status: 'Dilaporkan' as const,
    };

    await updateSourceData('riwayatPelanggaran', [...currentRiwayat, newCatatan]);
    await loadData(); // Reload data
    
    toast({ title: "Sukses", description: "Catatan pelanggaran berhasil disimpan." });
    setIsDialogOpen(false);
  };
  
  const filteredData = useMemo(() => {
    let data = riwayatPelanggaran;
    
    if (filter) {
        data = data.filter(item => 
            item.namaSiswa.toLowerCase().includes(filter.toLowerCase()) ||
            item.kelas.toLowerCase().includes(filter.toLowerCase()) ||
            item.pelanggaran.toLowerCase().includes(filter.toLowerCase())
        );
    }

    return data.sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime());
  }, [riwayatPelanggaran, filter]);
  
  const siswaDiKelasTerpilih = useMemo(() => {
      if (!selectedKelasForForm) return [];
      return daftarSiswa.filter(s => s.kelas === selectedKelasForForm);
  }, [selectedKelasForForm, daftarSiswa]);

  const pelanggaranDiKategori = useMemo(() => {
      if (!selectedKategori) return [];
      return daftarTataTertib.filter(p => p.kategori === selectedKategori);
  }, [selectedKategori, daftarTataTertib]);
  
  const stats = useMemo(() => {
    if (riwayatPelanggaran.length === 0) {
      return {
        kelasTerbanyak: "N/A",
        siswaTeratas: "N/A",
      };
    }

    const pelanggaranPerKelas = riwayatPelanggaran.reduce((acc, p) => {
      acc[p.kelas] = (acc[p.kelas] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const kelasTerbanyak = Object.keys(pelanggaranPerKelas).length > 0 ? Object.keys(pelanggaranPerKelas).reduce((a, b) => pelanggaranPerKelas[a] > pelanggaranPerKelas[b] ? a : b, "N/A") : "N/A";

    const poinPerSiswa = riwayatPelanggaran.reduce((acc, p) => {
      acc[p.namaSiswa] = (acc[p.namaSiswa] || 0) + p.poin;
      return acc;
    }, {} as Record<string, number>);
    const siswaTeratasNama = Object.keys(poinPerSiswa).length > 0 ? Object.keys(poinPerSiswa).reduce((a, b) => poinPerSiswa[a] > poinPerSiswa[b] ? a : b, "N/A") : "N/A";
    const siswaTeratas = siswaTeratasNama !== "N/A" ? `${siswaTeratasNama} (${poinPerSiswa[siswaTeratasNama]} poin)` : "N/A";

    return { kelasTerbanyak, siswaTeratas };
  }, [riwayatPelanggaran]);

  if (isLoading) {
    return (
      <div className="flex-1 space-y-6 flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6">
      {/* --- SECTION 1: HEADER & AKSI UTAMA --- */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Manajemen Pelanggaran Siswa</h2>
            <p className="text-muted-foreground">Catat, pantau, dan analisis pelanggaran tata tertib siswa.</p>
          </div>
          <Button onClick={handleOpenDialog} className="w-full sm:w-auto">
              <PlusCircle className="mr-2 h-4 w-4"/>
              Catat Pelanggaran Baru
          </Button>
      </div>

      {/* --- SECTION 2: DASBOR STATISTIK UTAMA --- */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Dasbor Analisis Pelanggaran</CardTitle>
          <CardDescription>Ringkasan data pelanggaran siswa secara keseluruhan.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Kolom Kiri: Statistik Utama */}
            <div className="lg:col-span-1 space-y-4">
                <div className="p-4 bg-secondary rounded-lg">
                    <div className="flex items-center gap-3">
                        <Building className="h-8 w-8 text-primary"/>
                        <div>
                            <p className="text-sm text-muted-foreground">Kelas Pelanggaran Terbanyak</p>
                            <p className="text-xl font-bold">{stats.kelasTerbanyak}</p>
                        </div>
                    </div>
                </div>
                 <div className="p-4 bg-secondary rounded-lg">
                    <div className="flex items-center gap-3">
                        <TrendingDown className="h-8 w-8 text-destructive"/>
                        <div>
                            <p className="text-sm text-muted-foreground">Siswa Poin Tertinggi</p>
                            <p className="text-xl font-bold">{stats.siswaTeratas}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Kolom Kanan: Grafik Distribusi */}
            <div className="lg:col-span-2">
              <h4 className="font-semibold mb-2 text-center">Distribusi Tingkat Pelanggaran</h4>
              <div className="h-64 flex items-center justify-center">
                 {riwayatPelanggaran.length > 0 ? (
                    <PelanggaranPieChart />
                 ) : (
                    <div className="text-center text-muted-foreground">
                        <FileWarning className="mx-auto h-10 w-10" />
                        <p>Data belum cukup untuk menampilkan grafik.</p>
                    </div>
                 )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* --- SECTION 3: RIWAYAT PELANGGARAN LENGKAP --- */}
      <Card>
        <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <CardTitle>Riwayat Pelanggaran Terbaru</CardTitle>
                    <CardDescription>Daftar semua pelanggaran yang tercatat, diurutkan dari yang terbaru.</CardDescription>
                </div>
                 <Input 
                  placeholder="Cari (nama, kelas, pelanggaran)..." 
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="w-full sm:w-64"
                />
            </div>
        </CardHeader>
        <CardContent>
             <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Siswa</TableHead>
                            <TableHead>Detail Pelanggaran</TableHead>
                            <TableHead>Pelapor & Tindakan Awal</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredData.length > 0 ? (
                            filteredData.map((catatan) => (
                                <TableRow key={catatan.id}>
                                    <TableCell className="whitespace-nowrap">
                                        <p className="font-medium">{catatan.namaSiswa}</p>
                                        <p className="text-xs text-muted-foreground">{catatan.kelas} | {format(new Date(catatan.tanggal), "dd/MM/yyyy")}</p>
                                    </TableCell>
                                    <TableCell>
                                        <p>{catatan.pelanggaran}</p>
                                        <Badge variant="destructive">{catatan.poin} Poin</Badge>
                                    </TableCell>
                                    <TableCell className="whitespace-nowrap">
                                        <p className="font-medium">{catatan.guruPelapor}</p>
                                        <p className="text-xs text-muted-foreground">{catatan.tindakanAwal || "-"}</p>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={3} className="text-center h-24">
                                    Tidak ada data pelanggaran untuk ditampilkan.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
             </div>
        </CardContent>
      </Card>
      
      {/* Dialog Pencatatan Pelanggaran */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
                <DialogTitle>Formulir Pencatatan Pelanggaran</DialogTitle>
            </DialogHeader>
            <div className="grid gap-6 py-4">
                <div className="space-y-2">
                    <Label className="font-semibold">1. Pilih Kelas & Siswa</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <Select value={selectedKelasForForm} onValueChange={(value) => { setSelectedKelasForForm(value); setSelectedNis(""); }}>
                          <SelectTrigger><SelectValue placeholder="Pilih kelas..." /></SelectTrigger>
                          <SelectContent>
                              {daftarKelas.map(kelas => (
                                  <SelectItem key={kelas.id} value={kelas.nama}>{kelas.nama}</SelectItem>
                              ))}
                          </SelectContent>
                      </Select>
                      <Select value={selectedNis} onValueChange={setSelectedNis} disabled={!selectedKelasForForm}>
                           <SelectTrigger><SelectValue placeholder="Pilih siswa..." /></SelectTrigger>
                          <SelectContent>
                               {siswaDiKelasTerpilih.map(siswa => (
                                  <SelectItem key={siswa.nis} value={siswa.nis}>{siswa.nama}</SelectItem>
                              ))}
                          </SelectContent>
                      </Select>
                    </div>
                </div>
                
                 <div className="space-y-2">
                    <Label className="font-semibold">2. Pilih Kategori Pelanggaran</Label>
                    <Select value={selectedKategori} onValueChange={(v) => { setSelectedKategori(v as KategoriKey); setSelectedRuleId(""); }}>
                        <SelectTrigger><SelectValue placeholder="Pilih kategori..." /></SelectTrigger>
                        <SelectContent>
                            {Object.entries(kategoriInfo).map(([key, { title }]) => (
                                <SelectItem key={key} value={key}>{title}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label className="font-semibold">3. Pilih Deskripsi Pelanggaran</Label>
                    <Select value={selectedRuleId} onValueChange={setSelectedRuleId} disabled={!selectedKategori}>
                        <SelectTrigger><SelectValue placeholder="Pilih pelanggaran spesifik..." /></SelectTrigger>
                        <SelectContent className="max-h-60">
                           <SelectGroup>
                              {pelanggaranDiKategori.map(rule => (
                                  <SelectItem key={rule.id} value={rule.id.toString()}>
                                      ({rule.tingkat}) {rule.deskripsi} - ({rule.poin} Poin)
                                  </SelectItem>
                              ))}
                           </SelectGroup>
                        </SelectContent>
                    </Select>
                </div>
                
                <div className="space-y-2">
                    <Label htmlFor="tindakan-awal" className="font-semibold">4. Tindakan Awal (Opsional)</Label>
                    <Textarea 
                        id="tindakan-awal" 
                        placeholder="Contoh: Diberi teguran lisan, diminta push-up, dll."
                        value={tindakanAwal}
                        onChange={(e) => setTindakanAwal(e.target.value)}
                    />
                </div>
            </div>
            <DialogFooter>
                <DialogClose asChild><Button variant="outline">Batal</Button></DialogClose>
                <Button onClick={handleSaveCatatan}>Simpan Catatan</Button>
            </DialogFooter>
          </DialogContent>
      </Dialog>
    </div>
  );
}
