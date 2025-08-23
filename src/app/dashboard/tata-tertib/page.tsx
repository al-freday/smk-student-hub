
"use client";

import { useState } from "react";
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

const daftarSiswa = [
    { id: 1, nis: "1234567890", nama: "Ahmad Budi", kelas: "X OT 1" },
    { id: 2, nis: "0987654321", nama: "Citra Dewi", kelas: "XI AKL" },
    { id: 3, nis: "1122334455", nama: "Eka Putra", kelas: "XII TKR" },
    { id: 4, nis: "1122334456", nama: "Fitriani", kelas: "XII TKJ 1" },
    { id: 5, nis: "1122334457", nama: "Gunawan", kelas: "XI OTKP 1" },
];

interface CatatanPelanggaran {
    id: number;
    siswa: string;
    kelas: string;
    pelanggaran: string;
    poin: number;
    tindakan: string;
    tanggal: string;
}

export default function TataTertibPage() {
  const { toast } = useToast();
  const [selectedSiswa, setSelectedSiswa] = useState("");
  const [selectedPelanggaran, setSelectedPelanggaran] = useState("");
  const [tindakan, setTindakan] = useState("");
  const [riwayat, setRiwayat] = useState<CatatanPelanggaran[]>([]);

  const getPoinFromDeskripsi = (deskripsi: string) => {
    for (const kategori of initialPelanggaran) {
        const item = kategori.items.find(i => i.deskripsi === deskripsi);
        if (item) return item.poin;
    }
    return 0;
  };

  const handleSimpan = () => {
    if (!selectedSiswa || !selectedPelanggaran || !tindakan) {
        toast({
            title: "Gagal Menyimpan",
            description: "Harap lengkapi semua kolom.",
            variant: "destructive",
        });
        return;
    }
    
    const siswa = daftarSiswa.find(s => s.nama === selectedSiswa);
    const poin = getPoinFromDeskripsi(selectedPelanggaran);

    const catatanBaru: CatatanPelanggaran = {
        id: riwayat.length + 1,
        siswa: selectedSiswa,
        kelas: siswa?.kelas || "N/A",
        pelanggaran: selectedPelanggaran,
        poin,
        tindakan,
        tanggal: format(new Date(), "yyyy-MM-dd"),
    };

    setRiwayat([catatanBaru, ...riwayat]);

    toast({
        title: "Berhasil Disimpan",
        description: `Pelanggaran untuk ${selectedSiswa} telah dicatat.`,
    });
    
    // Reset form
    setSelectedSiswa("");
    setSelectedPelanggaran("");
    setTindakan("");
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
            <Card>
                <CardHeader>
                    <CardTitle>Formulir Pencatatan</CardTitle>
                    <CardDescription>Pilih siswa, jenis pelanggaran, dan jelaskan tindakan yang diambil.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                     <div className="space-y-2">
                        <Label htmlFor="siswa">Pilih Siswa</Label>
                        <Select value={selectedSiswa} onValueChange={setSelectedSiswa}>
                            <SelectTrigger id="siswa">
                                <SelectValue placeholder="-- Nama Anak Wali --" />
                            </SelectTrigger>
                            <SelectContent>
                                {daftarSiswa.map(siswa => (
                                    <SelectItem key={siswa.id} value={siswa.nama}>{siswa.nama} ({siswa.kelas})</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                     </div>
                      <div className="space-y-2">
                        <Label htmlFor="pelanggaran">Pilih Jenis Pelanggaran</Label>
                        <Select value={selectedPelanggaran} onValueChange={setSelectedPelanggaran}>
                            <SelectTrigger id="pelanggaran">
                                <SelectValue placeholder="-- Jenis Pelanggaran --" />
                            </SelectTrigger>
                            <SelectContent>
                                {initialPelanggaran.map(kategori => (
                                    <SelectGroup key={kategori.kategori}>
                                        <SelectLabel>{kategori.kategori}</SelectLabel>
                                        {kategori.items.map(item => (
                                             <SelectItem key={item.deskripsi} value={item.deskripsi}>{item.deskripsi} ({item.poin} poin)</SelectItem>
                                        ))}
                                    </SelectGroup>
                                ))}
                            </SelectContent>
                        </Select>
                     </div>
                      <div className="space-y-2">
                        <Label htmlFor="tindakan">Tindakan yang Diambil</Label>
                        <Textarea 
                            id="tindakan" 
                            placeholder="Contoh: Diberikan teguran lisan dan diminta membuat surat pernyataan."
                            value={tindakan}
                            onChange={(e) => setTindakan(e.target.value)}
                        />
                     </div>
                     <Button onClick={handleSimpan}>Simpan Catatan</Button>
                </CardContent>
            </Card>

             <Card>
                <CardHeader>
                    <CardTitle>Riwayat Pencatatan Terbaru</CardTitle>
                    <CardDescription>Daftar pelanggaran yang baru saja Anda catat akan muncul di sini.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Siswa</TableHead>
                                <TableHead>Pelanggaran</TableHead>
                                <TableHead className="text-center">Poin</TableHead>
                                <TableHead>Tindakan</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {riwayat.length > 0 ? (
                                riwayat.map(item => (
                                    <TableRow key={item.id}>
                                        <TableCell className="font-medium">{item.siswa} <br/><span className="text-xs text-muted-foreground">{item.kelas}</span></TableCell>
                                        <TableCell>{item.pelanggaran}</TableCell>
                                        <TableCell className="text-center"><Badge variant="destructive">+{item.poin}</Badge></TableCell>
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

    