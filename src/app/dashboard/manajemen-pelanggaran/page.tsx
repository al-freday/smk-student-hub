
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusCircle, User, ShieldAlert, BookMarked } from "lucide-react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { getSourceData, updateSourceData } from "@/lib/data-manager";
import { Loader2 } from "lucide-react";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserX, Shirt, Trash2, Speech, GraduationCap, WifiOff, School } from "lucide-react";

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

// Data Tata Tertib (disalin lokal untuk isolasi)
const tataTertibData = {
  kehadiran: {
    ringan: [
      { deskripsi: "Datang terlambat tanpa alasan.", poin: 5 },
      { deskripsi: "Tidur di kelas.", poin: 5 },
      { deskripsi: "Tidak membawa buku sesuai jadwal.", poin: 5 },
      { deskripsi: "Tidak membuat tugas sekolah.", poin: 5 },
      { deskripsi: "Tidak mengikuti jam tambahan remedial.", poin: 5 },
    ],
    sedang: [
      { deskripsi: "Pulang sebelum waktunya tanpa izin.", poin: 10 },
      { deskripsi: "Tidak mengikuti upacara bendera.", poin: 10 },
      { deskripsi: "Bolos pelajaran.", poin: 10 },
      { deskripsi: "Menitip absen palsu.", poin: 10 },
      { deskripsi: "Menggunakan alasan palsu untuk tidak masuk.", poin: 10 },
      { deskripsi: "Menghilang saat jam istirahat.", poin: 10 },
      { deskripsi: "Membuat keributan di kelas.", poin: 10 },
      { deskripsi: "Tidak mengikuti jadwal piket kelas.", poin: 10 },
      { deskripsi: "Membuat catatan kehadiran palsu.", poin: 10 },
      { deskripsi: "Mengabaikan panggilan guru.", poin: 10 },
    ],
    berat: [
      { deskripsi: "Tidak hadir tanpa keterangan (alpha) berulang.", poin: 20 },
      { deskripsi: "Tidak hadir saat kegiatan ekstrakurikuler wajib.", poin: 20 },
      { deskripsi: "Menolak hadir di kegiatan sekolah.", poin: 20 },
      { deskripsi: "Membolos saat praktek industri (PKL).", poin: 20 },
    ],
  },
  seragam: {
    ringan: [
      { deskripsi: "Tidak memakai seragam lengkap.", poin: 3 },
      { deskripsi: "Seragam kotor atau tidak rapi.", poin: 3 },
      { deskripsi: "Tidak memakai ikat pinggang sesuai ketentuan.", poin: 3 },
      { deskripsi: "Kaos kaki tidak sesuai aturan.", poin: 3 },
      { deskripsi: "Seragam tidak dimasukkan.", poin: 3 },
      { deskripsi: "Tidak memakai name tag.", poin: 3 },
    ],
    sedang: [
      { deskripsi: "Memakai atribut yang tidak sesuai.", poin: 10 },
      { deskripsi: "Memakai sepatu tidak sesuai aturan.", poin: 10 },
      { deskripsi: "Memakai jaket non-sekolah di kelas.", poin: 10 },
      { deskripsi: "Rambut gondrong (untuk siswa).", poin: 10 },
      { deskripsi: "Rambut dicat/bleaching.", poin: 10 },
      { deskripsi: "Memakai aksesoris berlebihan.", poin: 10 },
      { deskripsi: "Kuku panjang atau dicat.", poin: 10 },
      { deskripsi: "Memakai seragam olahraga di luar jam olahraga.", poin: 10 },
      { deskripsi: "Tidak memakai topi saat upacara (jika diwajibkan).", poin: 10 },
      { deskripsi: "Seragam tidak sesuai hari.", poin: 10 },
      { deskripsi: "Menggunakan make-up berlebihan.", poin: 10 },
    ],
    berat: [
      { deskripsi: "Celana dipendekkan atau dimodifikasi.", poin: 15 },
      { deskripsi: "Rok di atas lutut (untuk siswi).", poin: 15 },
      { deskripsi: "Memakai lensa kontak warna.", poin: 15 },
    ],
  },
  lingkungan: {
    ringan: [
      { deskripsi: "Membuang sampah sembarangan.", poin: 5 },
      { deskripsi: "Tidak menjaga kebersihan kelas.", poin: 5 },
      { deskripsi: "Mengotori kamar mandi.", poin: 5 },
      { deskripsi: "Mengotori papan tulis.", poin: 5 },
      { deskripsi: "Tidak mengikuti jadwal piket kelas/bengkel/lab.", poin: 5 },
    ],
    sedang: [
      { deskripsi: "Mencorat-coret meja, kursi, atau dinding.", poin: 15 },
      { deskripsi: "Membawa makanan/minuman ke dalam kelas.", poin: 15 },
      { deskripsi: "Menyimpan barang berbau busuk.", poin: 15 },
      { deskripsi: "Memindahkan peralatan kelas tanpa izin.", poin: 15 },
      { deskripsi: "Mematikan listrik/kipas/AC sembarangan.", poin: 15 },
      { deskripsi: "Tidak mengembalikan alat praktik ke tempatnya.", poin: 15 },
    ],
    berat: [
      { deskripsi: "Merusak fasilitas kelas.", poin: 30 },
      { deskripsi: "Merusak tanaman sekolah.", poin: 30 },
      { deskripsi: "Mengambil barang milik sekolah tanpa izin.", poin: 30 },
      { deskripsi: "Menggunakan peralatan bengkel tanpa izin.", poin: 30 },
      { deskripsi: "Membawa hewan peliharaan ke sekolah.", poin: 30 },
      { deskripsi: "Mengotori halaman sekolah dengan kendaraan.", poin: 30 },
    ],
  },
  etika: {
    ringan: [
      { deskripsi: "Berbicara kasar pada teman.", poin: 10 },
      { deskripsi: "Membuat keributan di perpustakaan.", poin: 10 },
      { deskripsi: "Memanggil guru dengan nama panggilan tidak sopan.", poin: 10 },
      { deskripsi: "Mengabaikan teguran guru.", poin: 10 },
      { deskripsi: "Memaki di grup kelas.", poin: 10 },
      { deskripsi: "Mencemooh prestasi teman.", poin: 10 },
    ],
    sedang: [
      { deskripsi: "Membentak guru/petugas sekolah.", poin: 20 },
      { deskripsi: "Menghina teman di depan umum.", poin: 20 },
      { deskripsi: "Memfitnah teman/guru.", poin: 20 },
      { deskripsi: "Memalak teman.", poin: 20 },
      { deskripsi: "Meniru tanda tangan guru/orangtua.", poin: 20 },
      { deskripsi: "Merokok di lingkungan sekolah.", poin: 20 },
      { deskripsi: "Membawa rokok atau korek api ke sekolah.", poin: 20 },
      { deskripsi: "Membuat hoaks terkait sekolah.", poin: 20 },
      { deskripsi: "Menghina fisik teman/guru.", poin: 20 },
      { deskripsi: "Membawa kendaraan tanpa SIM.", poin: 20 },
    ],
    berat: [
      { deskripsi: "Berbicara kasar pada guru.", poin: 40 },
      { deskripsi: "Bertengkar fisik di sekolah.", poin: 40 },
      { deskripsi: "Mengancam guru atau teman.", poin: 40 },
      { deskripsi: "Membawa senjata tajam tanpa izin.", poin: 40 },
      { deskripsi: "Mengintimidasi adik kelas (bullying).", poin: 40 },
      { deskripsi: "Berkelahi di luar sekolah membawa nama sekolah.", poin: 40 },
      { deskripsi: "Menghina agama/suku tertentu.", poin: 40 },
      { deskripsi: "Membawa minuman keras ke sekolah.", poin: 40 },
      { deskripsi: "Menggunakan narkoba.", poin: 40 },
    ],
  },
  akademik: {
    ringan: [
      { deskripsi: "Tidak mengumpulkan tugas.", poin: 5 },
      { deskripsi: "Tidak mengikuti ujian tanpa keterangan.", poin: 5 },
      { deskripsi: "Tidak memakai APD di bengkel/lab.", poin: 5 },
    ],
    sedang: [
      { deskripsi: "Menyontek saat ujian.", poin: 15 },
      { deskripsi: "Menggunakan HP saat ujian.", poin: 15 },
      { deskripsi: "Menjiplak tugas teman.", poin: 15 },
      { deskripsi: "Mengganggu jalannya ujian.", poin: 15 },
      { deskripsi: "Tidak membuat laporan praktik.", poin: 15 },
    ],
    berat: [
      { deskripsi: "Meminta atau membocorkan soal ujian.", poin: 20 },
      { deskripsi: "Menyuruh orang lain mengerjakan tugas.", poin: 20 },
      { deskripsi: "Memalsukan nilai atau tanda tangan.", poin: 20 },
      { deskripsi: "Memanipulasi data PKL.", poin: 20 },
      { deskripsi: "Menyalahgunakan alat bengkel/lab untuk pribadi.", poin: 20 },
    ],
  },
  teknologi: {
    ringan: [
      { deskripsi: "Menggunakan HP saat pelajaran tanpa izin.", poin: 5 },
      { deskripsi: "Bermain game di kelas.", poin: 5 },
      { deskripsi: "Menggunakan Wi-Fi sekolah untuk hal pribadi berlebihan.", poin: 5 },
    ],
    sedang: [
      { deskripsi: "Membuka situs terlarang di sekolah.", poin: 15 },
      { deskripsi: "Memotret guru tanpa izin.", poin: 15 },
      { deskripsi: "Membuat meme menghina guru.", poin: 15 },
      { deskripsi: "Menyebar gosip bohong online.", poin: 15 },
      { deskripsi: "Membajak akun media sosial teman.", poin: 15 },
    ],
    berat: [
      { deskripsi: "Menggunakan akun media sosial untuk menjelekkan sekolah.", poin: 20 },
      { deskripsi: "Membuat video bullying atau menyebar konten tidak pantas.", poin: 20 },
      { deskripsi: "Menyebar foto kelas tanpa izin.", poin: 20 },
      { deskripsi: "Mengirim pesan ancaman via grup.", poin: 20 },
      { deskripsi: "Membawa alat elektronik terlarang.", poin: 20 },
    ],
  },
  kegiatan: {
    ringan: [
      { deskripsi: "Tidak ikut kegiatan OSIS/Pramuka wajib.", poin: 10 },
      { deskripsi: "Mengabaikan aturan apel pagi.", poin: 10 },
      { deskripsi: "Tidak disiplin saat perkemahan/praktek luar.", poin: 10 },
    ],
    sedang: [
      { deskripsi: "Mengabaikan instruksi pembina upacara.", poin: 15 },
      { deskripsi: "Membuat gaduh saat acara resmi.", poin: 15 },
      { deskripsi: "Tidak hadir saat pembekalan PKL.", poin: 15 },
      { deskripsi: "Tidak mengembalikan perlengkapan kegiatan.", poin: 15 },
    ],
    berat: [
      { deskripsi: "Tidak ikut kegiatan PKL tanpa alasan.", poin: 30 },
      { deskripsi: "Membuat masalah saat study tour.", poin: 30 },
      { deskripsi: "Membuat kerusuhan saat pertandingan sekolah.", poin: 30 },
      { deskripsi: "Membawa senjata/bahan berbahaya saat kegiatan.", poin: 30 },
    ],
  },
  hukum: {
    berat: [
      { deskripsi: "Mengedarkan narkoba.", poin: 40 },
      { deskripsi: "Membawa senjata api.", poin: 40 },
      { deskripsi: "Menganiaya guru/teman.", poin: 40 },
      { deskripsi: "Mencuri barang di sekolah.", poin: 40 },
      { deskripsi: "Ikut tawuran antar sekolah.", poin: 40 },
      { deskripsi: "Merusak kendaraan guru/teman.", poin: 40 },
      { deskripsi: "Membakar fasilitas sekolah.", poin: 40 },
      { deskripsi: "Melakukan pelecehan seksual di sekolah.", poin: 40 },
      { deskripsi: "Melakukan perjudian di sekolah.", poin: 40 },
      { deskripsi: "Melakukan tindakan kriminal berat di luar sekolah membawa nama sekolah.", poin: 40 },
    ],
  },
};

type KategoriKey = keyof typeof tataTertibData;

const kategoriInfo: { [key in KategoriKey]: { icon: React.ElementType, title: string } } = {
  kehadiran: { icon: UserX, title: "Pelanggaran Kehadiran & Ketertiban" },
  seragam: { icon: Shirt, title: "Pelanggaran Seragam & Penampilan" },
  lingkungan: { icon: Trash2, title: "Pelanggaran Tata Tertib Kelas & Lingkungan" },
  etika: { icon: Speech, title: "Pelanggaran Etika & Perilaku" },
  akademik: { icon: GraduationCap, title: "Pelanggaran Akademik" },
  teknologi: { icon: WifiOff, title: "Pelanggaran Teknologi & Media Sosial" },
  kegiatan: { icon: School, title: "Pelanggaran Kegiatan Sekolah" },
  hukum: { icon: ShieldAlert, title: "Pelanggaran Berat Terkait Hukum" },
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

type StatusLaporan = 'Dilaporkan' | 'Ditindaklanjuti Wali Kelas' | 'Diteruskan ke BK' | 'Diteruskan ke Wakasek' | 'Selesai';

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
  status: StatusLaporan;
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
      status: 'Dilaporkan' as StatusLaporan,
    };

    updateSourceData('riwayatPelanggaran', [...currentRiwayat, newCatatan]);
    
    toast({ title: "Sukses", description: "Catatan pelanggaran berhasil disimpan." });
    setIsDialogOpen(false);
  };

  const getStatusBadgeVariant = (status: StatusLaporan) => {
    switch (status) {
        case 'Dilaporkan': return 'destructive';
        case 'Ditindaklanjuti Wali Kelas': return 'secondary';
        case 'Diteruskan ke BK': return 'default';
        case 'Diteruskan ke Wakasek': return 'outline';
        case 'Selesai': return 'outline';
        default: return 'outline';
    }
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
            <h2 className="text-3xl font-bold tracking-tight">Manajemen Pelanggaran Siswa</h2>
            <p className="text-muted-foreground">Catat dan pantau pelanggaran tata tertib siswa.</p>
          </div>
          <div className="flex w-full sm:w-auto gap-2">
              <Input 
                  placeholder="Cari (nama, kelas, pelanggaran)..." 
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="w-full sm:w-64"
              />
              <Button onClick={handleOpenDialog} className="whitespace-nowrap">
                  <PlusCircle className="mr-2 h-4 w-4"/>
                  Catat Baru
              </Button>
          </div>
      </div>

      <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2"><ShieldAlert />Daftar Pelanggaran</CardTitle>
            <CardDescription>Daftar semua pelanggaran yang tercatat di sekolah, diurutkan dari yang terbaru.</CardDescription>
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
                                    <Badge variant={getStatusBadgeVariant(catatan.status)}>{catatan.status}</Badge>
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
                    <Label className="flex items-center gap-2"><span className="font-bold">1.</span>Pilih Kelas</Label>
                    <Select value={selectedKelasForForm} onValueChange={(value) => { setSelectedKelasForForm(value); setSelectedNis(""); }}>
                        <SelectTrigger><SelectValue placeholder="Pilih kelas..." /></SelectTrigger>
                        <SelectContent>
                            {daftarKelas.map(kelas => (
                                <SelectItem key={kelas.id} value={kelas.nama}>{kelas.nama}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label className="flex items-center gap-2"><span className="font-bold">2.</span>Pilih Siswa</Label>
                    <Select value={selectedNis} onValueChange={setSelectedNis} disabled={!selectedKelasForForm}>
                         <SelectTrigger><SelectValue placeholder="Pilih siswa..." /></SelectTrigger>
                        <SelectContent>
                             {siswaDiKelasTerpilih.map(siswa => (
                                <SelectItem key={siswa.nis} value={siswa.nis}>{siswa.nama}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                
                <div className="space-y-2">
                     <Label className="flex items-center gap-2"><span className="font-bold">3.</span>Pilih Jenis Pelanggaran</Label>
                    <Select value={selectedKategori} onValueChange={(v: KategoriKey) => { setSelectedKategori(v); setSelectedRuleId(""); }}>
                        <SelectTrigger><SelectValue placeholder="Pilih kategori..." /></SelectTrigger>
                        <SelectContent>
                            {Object.entries(kategoriInfo).map(([key, { title }]) => (
                                <SelectItem key={key} value={key}>{title}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                     <Label className="flex items-center gap-2"><span className="font-bold">4.</span>Pilih Tingkat dan Deskripsi Pelanggaran</Label>
                    <Select value={selectedRuleId} onValueChange={setSelectedRuleId} disabled={!selectedKategori}>
                        <SelectTrigger><SelectValue placeholder="Pilih pelanggaran..." /></SelectTrigger>
                        <SelectContent className="max-h-60">
                           <SelectGroup>
                              <SelectLabel>Pelanggaran Tersedia</SelectLabel>
                              {pelanggaranDiKategori.map(rule => (
                                  <SelectItem key={rule.id} value={rule.id.toString()}>
                                      ({rule.tingkat.charAt(0).toUpperCase() + rule.tingkat.slice(1)}) {rule.deskripsi} - ({rule.poin} Poin)
                                  </SelectItem>
                              ))}
                           </SelectGroup>
                        </SelectContent>
                    </Select>
                </div>
                
                <div className="space-y-2">
                    <Label htmlFor="tindakan-awal">5. Tindakan Awal yang Dilakukan (Opsional)</Label>
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
