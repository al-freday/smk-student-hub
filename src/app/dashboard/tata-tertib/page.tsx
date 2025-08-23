
"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const initialPelanggaran = [
    {
        kategori: "Disiplin Kehadiran",
        items: [
            { deskripsi: "Terlambat masuk sekolah (≤10 menit).", poin: 5 },
            { deskripsi: "Terlambat masuk sekolah (>10 menit).", poin: 10 },
            { deskripsi: "Tidak masuk tanpa keterangan (1 hari).", poin: 15 },
            { deskripsi: "Membolos jam pelajaran.", poin: 20 },
        ],
    },
    {
        kategori: "Kerapian & Seragam",
        items: [
            { deskripsi: "Tidak memakai seragam sesuai jadwal.", poin: 5 },
            { deskripsi: "Rambut gondrong (putra).", poin: 10 },
            { deskripsi: "Rambut dicat/diwarnai.", poin: 10 },
        ],
    },
    {
        kategori: "Sikap & Perilaku",
        items: [
            { deskripsi: "Tidak hormat kepada guru.", poin: 25 },
            { deskripsi: "Menggunakan bahasa kasar.", poin: 15 },
            { deskripsi: "Membuat keributan di kelas.", poin: 10 },
            { deskripsi: "Bullying (verbal).", poin: 50 },
        ],
    },
     {
        kategori: "Kriminalitas",
        items: [
            { deskripsi: "Mencuri barang teman.", poin: 75 },
            { deskripsi: "Merusak properti sekolah dengan sengaja.", poin: 80 },
            { deskripsi: "Membawa senjata tajam.", poin: 100 },
        ],
    },
];

// Data ini seharusnya diambil dari sumber global/API, untuk simulasi kita definisikan di sini
const daftarKelas = [
  "X OT 1", "X OT 2", "X OT 3", "X TKR", "X AKL", "X TM",
  "XI TAB 1", "XI TAB 2", "XI TKR", "XI AKL", "XI TM",
  "XII TAB 1", "XII TAB 2", "XII TKR", "XII AKL", "XII TM"
];

const daftarSiswa = daftarKelas.flatMap((kelas, classIndex) => 
    Array.from({ length: 40 }, (_, i) => ({
        id: (classIndex * 40) + i + 1,
        nis: `24${((classIndex * 40) + i + 1).toString().padStart(4, '0')}`,
        nama: `Siswa ${i + 1} ${kelas}`,
        kelas: kelas
    }))
);

const daftarWaliKelas = daftarKelas.map((kelas, i) => ({
    kelas: kelas,
    wali: `Wali Kelas ${i + 1}`
}));

interface CatatanSiswa {
    id: number;
    siswa: string;
    kelas: string;
    waliKelas: string;
    deskripsi: string;
    poin: number;
    tindakan: string;
    tanggal: string;
    tipe: 'pelanggaran' | 'prestasi';
}

export default function TataTertibPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("pelanggaran");
  
  // State untuk form pelanggaran
  const [selectedSiswaPelanggaran, setSelectedSiswaPelanggaran] = useState("");
  const [selectedPelanggaran, setSelectedPelanggaran] = useState("");
  const [tindakanPelanggaran, setTindakanPelanggaran] = useState("");
  
  // State untuk form prestasi
  const [selectedSiswaPrestasi, setSelectedSiswaPrestasi] = useState("");
  const [jenisPrestasi, setJenisPrestasi] = useState("");
  const [tingkatPrestasi, setTingkatPrestasi] = useState("");
  const [deskripsiPrestasi, setDeskripsiPrestasi] = useState("");
  const [poinPrestasi, setPoinPrestasi] = useState(0);

  const [riwayat, setRiwayat] = useState<CatatanSiswa[]>([]);

  const waliKelasTerpilih = useMemo(() => {
    const siswaNama = activeTab === 'pelanggaran' ? selectedSiswaPelanggaran : selectedSiswaPrestasi;
    if (!siswaNama) return "N/A";
    const siswa = daftarSiswa.find(s => s.nama === siswaNama);
    if (!siswa) return "N/A";
    const wali = daftarWaliKelas.find(w => w.kelas === siswa.kelas);
    return wali ? wali.wali : "N/A";
  }, [selectedSiswaPelanggaran, selectedSiswaPrestasi, activeTab]);

  const getPoinFromDeskripsi = (deskripsi: string) => {
    for (const kategori of initialPelanggaran) {
        const item = kategori.items.find(i => i.deskripsi === deskripsi);
        if (item) return item.poin;
    }
    return 0;
  };

  const handleSimpanPelanggaran = () => {
    if (!selectedSiswaPelanggaran || !selectedPelanggaran || !tindakanPelanggaran) {
        toast({ title: "Gagal", description: "Harap lengkapi semua kolom.", variant: "destructive" });
        return;
    }
    const siswa = daftarSiswa.find(s => s.nama === selectedSiswaPelanggaran);
    if (!siswa) return;
    const poin = getPoinFromDeskripsi(selectedPelanggaran);

    const catatanBaru: CatatanSiswa = {
        id: riwayat.length + 1,
        siswa: siswa.nama,
        kelas: siswa.kelas,
        waliKelas: waliKelasTerpilih,
        deskripsi: selectedPelanggaran,
        poin: poin,
        tindakan: tindakanPelanggaran,
        tanggal: format(new Date(), "yyyy-MM-dd"),
        tipe: 'pelanggaran',
    };
    setRiwayat([catatanBaru, ...riwayat]);
    toast({ title: "Pelanggaran Dicatat", description: `Pelanggaran untuk ${siswa.nama} telah disimpan.` });
    setSelectedSiswaPelanggaran("");
    setSelectedPelanggaran("");
    setTindakanPelanggaran("");
  };

  const handleSimpanPrestasi = () => {
    if (!selectedSiswaPrestasi || !jenisPrestasi || !deskripsiPrestasi || poinPrestasi <= 0) {
        toast({ title: "Gagal", description: "Harap lengkapi semua kolom dan pastikan poin lebih dari 0.", variant: "destructive" });
        return;
    }
     const siswa = daftarSiswa.find(s => s.nama === selectedSiswaPrestasi);
    if (!siswa) return;

    const catatanBaru: CatatanSiswa = {
        id: riwayat.length + 1,
        siswa: siswa.nama,
        kelas: siswa.kelas,
        waliKelas: waliKelasTerpilih,
        deskripsi: `${jenisPrestasi} (${tingkatPrestasi}): ${deskripsiPrestasi}`,
        poin: -Math.abs(poinPrestasi), // Poin prestasi bersifat negatif (pengurang)
        tindakan: "Diberikan apresiasi",
        tanggal: format(new Date(), "yyyy-MM-dd"),
        tipe: 'prestasi',
    };
    setRiwayat([catatanBaru, ...riwayat]);
    toast({ title: "Prestasi Dicatat", description: `Prestasi untuk ${siswa.nama} telah disimpan.` });
    setSelectedSiswaPrestasi("");
    setJenisPrestasi("");
    setTingkatPrestasi("");
    setDeskripsiPrestasi("");
    setPoinPrestasi(0);
  };


  return (
    <div className="flex-1 space-y-6">
        <div>
            <h2 className="text-3xl font-bold tracking-tight">Catat Pelanggaran & Prestasi</h2>
            <p className="text-muted-foreground">
                Gunakan formulir ini untuk mencatat pelanggaran atau prestasi siswa.
            </p>
        </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="pelanggaran">Catat Pelanggaran</TabsTrigger>
                    <TabsTrigger value="prestasi">Catat Prestasi</TabsTrigger>
                </TabsList>
                <TabsContent value="pelanggaran">
                    <Card>
                        <CardHeader>
                            <CardTitle>Formulir Pencatatan Pelanggaran</CardTitle>
                            <CardDescription>Pilih siswa, jenis pelanggaran, dan jelaskan tindakan yang diambil.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="siswa-pelanggaran">Pilih Siswa</Label>
                                    <Select value={selectedSiswaPelanggaran} onValueChange={setSelectedSiswaPelanggaran}>
                                        <SelectTrigger id="siswa-pelanggaran"><SelectValue placeholder="-- Nama Siswa --" /></SelectTrigger>
                                        <SelectContent>{daftarSiswa.map(siswa => (<SelectItem key={siswa.id} value={siswa.nama}>{siswa.nama} ({siswa.kelas})</SelectItem>))}</SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="wali-kelas">Wali Kelas</Label>
                                    <Input id="wali-kelas" value={waliKelasTerpilih} disabled />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="pelanggaran">Pilih Jenis Pelanggaran</Label>
                                <Select value={selectedPelanggaran} onValueChange={setSelectedPelanggaran}>
                                    <SelectTrigger id="pelanggaran"><SelectValue placeholder="-- Jenis Pelanggaran --" /></SelectTrigger>
                                    <SelectContent>
                                        {initialPelanggaran.map(kategori => (
                                            <SelectGroup key={kategori.kategori}>
                                                <SelectLabel>{kategori.kategori}</SelectLabel>
                                                {kategori.items.map(item => (<SelectItem key={item.deskripsi} value={item.deskripsi}>{item.deskripsi} ({item.poin} poin)</SelectItem>))}
                                            </SelectGroup>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="tindakan-pelanggaran">Tindakan yang Diambil</Label>
                                <Textarea id="tindakan-pelanggaran" placeholder="Contoh: Diberikan teguran lisan dan diminta membuat surat pernyataan." value={tindakanPelanggaran} onChange={(e) => setTindakanPelanggaran(e.target.value)} />
                            </div>
                            <Button onClick={handleSimpanPelanggaran}>Simpan Catatan Pelanggaran</Button>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="prestasi">
                     <Card>
                        <CardHeader>
                            <CardTitle>Formulir Pencatatan Prestasi</CardTitle>
                            <CardDescription>Catat pencapaian positif siswa untuk memberikan apresiasi.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                           <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="siswa-prestasi">Pilih Siswa</Label>
                                    <Select value={selectedSiswaPrestasi} onValueChange={setSelectedSiswaPrestasi}>
                                        <SelectTrigger id="siswa-prestasi"><SelectValue placeholder="-- Nama Siswa --" /></SelectTrigger>
                                        <SelectContent>{daftarSiswa.map(siswa => (<SelectItem key={siswa.id} value={siswa.nama}>{siswa.nama} ({siswa.kelas})</SelectItem>))}</SelectContent>
                                    </Select>
                                </div>
                                 <div className="space-y-2">
                                    <Label htmlFor="wali-kelas-prestasi">Wali Kelas</Label>
                                    <Input id="wali-kelas-prestasi" value={waliKelasTerpilih} disabled />
                                </div>
                            </div>
                             <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="jenis-prestasi">Jenis Prestasi</Label>
                                    <Select value={jenisPrestasi} onValueChange={setJenisPrestasi}>
                                        <SelectTrigger id="jenis-prestasi"><SelectValue placeholder="Pilih Jenis" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Akademik">Akademik</SelectItem>
                                            <SelectItem value="Olahraga">Olahraga</SelectItem>
                                            <SelectItem value="Seni">Seni</SelectItem>
                                            <SelectItem value="Ekskul">Ekskul</SelectItem>
                                            <SelectItem value="Lainnya">Lainnya</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="tingkat-prestasi">Tingkat</Label>
                                    <Select value={tingkatPrestasi} onValueChange={setTingkatPrestasi}>
                                        <SelectTrigger id="tingkat-prestasi"><SelectValue placeholder="Pilih Tingkat" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Sekolah">Sekolah</SelectItem>
                                            <SelectItem value="Kabupaten/Kota">Kabupaten/Kota</SelectItem>
                                            <SelectItem value="Provinsi">Provinsi</SelectItem>
                                            <SelectItem value="Nasional">Nasional</SelectItem>
                                            <SelectItem value="Internasional">Internasional</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="deskripsi-prestasi">Deskripsi Prestasi</Label>
                                <Textarea id="deskripsi-prestasi" placeholder="Contoh: Juara 1 Lomba Cerdas Cermat Fisika" value={deskripsiPrestasi} onChange={(e) => setDeskripsiPrestasi(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="poin-prestasi">Poin Apresiasi</Label>
                                <Input id="poin-prestasi" type="number" value={poinPrestasi} onChange={(e) => setPoinPrestasi(parseInt(e.target.value) || 0)} placeholder="Contoh: 20"/>
                            </div>
                            <Button onClick={handleSimpanPrestasi}>Simpan Catatan Prestasi</Button>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
             <Card>
                <CardHeader>
                    <CardTitle>Riwayat Pencatatan Terbaru</CardTitle>
                    <CardDescription>Daftar pelanggaran dan prestasi yang baru saja Anda catat.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Siswa</TableHead>
                                <TableHead>Deskripsi</TableHead>
                                <TableHead className="text-center">Poin</TableHead>
                                <TableHead>Tindakan/Apresiasi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {riwayat.length > 0 ? (
                                riwayat.map(item => (
                                    <TableRow key={item.id}>
                                        <TableCell className="font-medium">{item.siswa} <br/><span className="text-xs text-muted-foreground">{item.kelas}</span></TableCell>
                                        <TableCell>{item.deskripsi}</TableCell>
                                        <TableCell className="text-center">
                                            <Badge variant={item.tipe === 'pelanggaran' ? 'destructive' : 'default'}>
                                               {item.tipe === 'pelanggaran' ? `+${item.poin}` : item.poin}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{item.tindakan}</TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center h-24">Belum ada data tercatat.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
             </Card>

        </div>

        <div className="lg:col-span-1 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Referensi Tata Tertib</CardTitle>
                    <CardDescription>Gunakan daftar ini sebagai panduan.</CardDescription>
                </CardHeader>
                <CardContent>
                     <Accordion type="single" collapsible className="w-full">
                        {initialPelanggaran.map((kategori, index) => (
                        <AccordionItem value={`item-${index + 1}`} key={index}>
                            <AccordionTrigger className="font-semibold text-left">{kategori.kategori}</AccordionTrigger>
                            <AccordionContent>
                                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                                    {kategori.items.map((item, itemIndex) => (
                                        <li key={itemIndex}>{item.deskripsi} <Badge variant="secondary">{item.poin} poin</Badge></li>
                                    ))}
                                </ul>
                            </AccordionContent>
                        </AccordionItem>
                        ))}
                    </Accordion>
                </CardContent>
            </Card>
        </div>

      </div>
    </div>
  );
}
