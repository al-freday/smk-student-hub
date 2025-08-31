
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusCircle, User, ShieldAlert, BookMarked, TrendingDown, School, AlertTriangle, Building } from "lucide-react";
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
import { tataTertibData } from "@/lib/tata-tertib-data";
import StatCard from "@/components/stat-card";

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

type KategoriKey = keyof typeof tataTertibData;

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

const flattenTataTertib = () => {
    const allRules: { id: number, deskripsi: string, poin: number, kategori: KategoriKey, tingkat: string }[] = [];
    let idCounter = 1;
    for (const kategori in tataTertibData) {
        for (const tingkat in tataTertibData[kategori as KategoriKey]) {
            // @ts-ignore
            tataTertibData[kategori as KategoriKey][tingkat].forEach(rule => {
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

  const loadData = useCallback(() => {
    const user = getSourceData('currentUser', null);
    const role = typeof window !== 'undefined' ? localStorage.getItem('userRole') : null;
    
    setCurrentUser(user);
    setUserRole(role);
    setDaftarSiswa(getSourceData('siswaData', []));
    setDaftarKelas(getSourceData('kelasData', []));
    
    const pelanggaranData = getSourceData('riwayatPelanggaran', []);
    
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

    setDaftarTataTertib(flattenTataTertib());

  }, []);
  
  useEffect(() => {
    loadData();
    window.addEventListener('dataUpdated', loadData);
    return () => window.removeEventListener('dataUpdated', loadData);
  }, [loadData]);
  
  const handleOpenDialog = () => {
    setSelectedKelasForForm("");
    setSelectedNis("");
    setSelectedKategori("");
    setSelectedRuleId("");
    setTindakanAwal("");
    setIsDialogOpen(true);
  };

  const handleSaveCatatan = () => {
    const siswa = daftarSiswa.find(s => s.nis === selectedNis);
    const aturan = daftarTataTertib.find(t => t.id.toString() === selectedRuleId);

    if (!siswa || !aturan) {
      toast({ title: "Gagal Menyimpan", description: "Harap lengkapi semua pilihan formulir.", variant: "destructive" });
      return;
    }
    
    const currentRiwayat: any[] = getSourceData('riwayatPelanggaran', []);
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

    updateSourceData('riwayatPelanggaran', [...currentRiwayat, newCatatan]);
    
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
        jenisTerbanyak: "N/A",
        pelanggaranBulanIni: 0,
      };
    }

    // Kelas terbanyak
    const pelanggaranPerKelas = riwayatPelanggaran.reduce((acc, p) => {
      acc[p.kelas] = (acc[p.kelas] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const kelasTerbanyak = Object.keys(pelanggaranPerKelas).reduce((a, b) => pelanggaranPerKelas[a] > pelanggaranPerKelas[b] ? a : b, "N/A");

    // Siswa poin tertinggi
    const poinPerSiswa = riwayatPelanggaran.reduce((acc, p) => {
      acc[p.namaSiswa] = (acc[p.namaSiswa] || 0) + p.poin;
      return acc;
    }, {} as Record<string, number>);
    const siswaTeratasNama = Object.keys(poinPerSiswa).reduce((a, b) => poinPerSiswa[a] > poinPerSiswa[b] ? a : b, "N/A");
    const siswaTeratas = `${siswaTeratasNama} (${poinPerSiswa[siswaTeratasNama]} poin)`;

    // Jenis pelanggaran terbanyak
    let ringan = 0, sedang = 0, berat = 0;
    riwayatPelanggaran.forEach(p => {
        if (p.poin <= 10) ringan++;
        else if (p.poin <= 20) sedang++;
        else berat++;
    });
    const jenisTerbanyak = Math.max(ringan, sedang, berat) === ringan ? "Ringan" : Math.max(ringan, sedang, berat) === sedang ? "Sedang" : "Berat";

    // Pelanggaran bulan ini
    const awalBulan = startOfMonth(new Date());
    const pelanggaranBulanIni = riwayatPelanggaran.filter(p => isAfter(new Date(p.tanggal), awalBulan)).length;

    return { kelasTerbanyak, siswaTeratas, jenisTerbanyak, pelanggaranBulanIni };
  }, [riwayatPelanggaran]);

  if (!userRole) {
    return (
      <div className="flex-1 space-y-6 flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Dasbor Pelanggaran Siswa</h2>
            <p className="text-muted-foreground">Analisis dan catat pelanggaran tata tertib siswa.</p>
          </div>
          <Button onClick={handleOpenDialog} className="w-full sm:w-auto">
              <PlusCircle className="mr-2 h-4 w-4"/>
              Catat Pelanggaran Baru
          </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Pelanggaran Terbanyak" value={stats.kelasTerbanyak} icon={<Building/>} description="Kelas dengan rekor pelanggaran tertinggi." isLoading={false}/>
        <StatCard title="Poin Tertinggi" value={stats.siswaTeratas} icon={<TrendingDown/>} description="Siswa dengan akumulasi poin tertinggi." isLoading={false}/>
        <StatCard title="Jenis Dominan" value={stats.jenisTerbanyak} icon={<AlertTriangle/>} description="Tingkat pelanggaran yang paling sering terjadi." isLoading={false}/>
        <StatCard title="Pelanggaran Bulan Ini" value={stats.pelanggaranBulanIni.toString()} icon={<ShieldAlert/>} description="Total catatan pelanggaran bulan ini." isLoading={false}/>
      </div>

      <Card>
        <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <CardTitle className="flex items-center gap-2">Riwayat Pelanggaran Terbaru</CardTitle>
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
             <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Siswa</TableHead>
                        <TableHead>Detail Pelanggaran</TableHead>
                        <TableHead>Pelapor & Tindakan Awal</TableHead>
                        <TableHead className="text-center">Status</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredData.length > 0 ? (
                        filteredData.map((catatan) => (
                            <TableRow key={catatan.id}>
                                <TableCell>
                                    <p className="font-medium">{catatan.namaSiswa}</p>
                                    <p className="text-xs text-muted-foreground">{catatan.kelas} | {format(new Date(catatan.tanggal), "dd/MM/yyyy")}</p>
                                </TableCell>
                                <TableCell>
                                    <p>{catatan.pelanggaran}</p>
                                    <Badge variant="destructive">{catatan.poin} Poin</Badge>
                                </TableCell>
                                <TableCell>
                                    <p className="font-medium">{catatan.guruPelapor}</p>
                                    <p className="text-xs text-muted-foreground">{catatan.tindakanAwal || "-"}</p>
                                </TableCell>
                                <TableCell className="text-center">
                                    <Badge variant='secondary'>{catatan.status}</Badge>
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={4} className="text-center h-24">
                                Tidak ada data pelanggaran untuk ditampilkan.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
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
                    <div className="grid grid-cols-2 gap-2">
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


    