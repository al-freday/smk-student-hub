
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Printer, User, Box, Calendar, CheckCircle, TrendingUp, Users, ArrowRightLeft, FileText, DollarSign, Armchair } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

// Sample Data
const identitasSiswa = [
  { nis: "12345", nama: "Ahmad Budi", jk: "L", alamat: "Jl. Merdeka No. 1" },
  { nis: "12346", nama: "Citra Dewi", jk: "P", alamat: "Jl. Pahlawan No. 2" },
  { nis: "12347", nama: "Eka Putra", jk: "L", alamat: "Jl. Sudirman No. 3" },
];

const saranaKelas = [
    { no: 1, nama: "Meja Siswa", jumlah: 40, kondisi: "Baik" },
    { no: 2, nama: "Kursi Siswa", jumlah: 40, kondisi: "Baik" },
    { no: 3, nama: "Papan Tulis", jumlah: 1, kondisi: "Baik" },
    { no: 4, nama: "Spidol", jumlah: 12, kondisi: "Cukup" },
    { no: 5, nama: "Penghapus", jumlah: 2, kondisi: "Baik" },
    { no: 6, nama: "Stop Kontak", jumlah: 8, kondisi: "Baik" },
];

const rekapNilai = [
  { mapel: "Matematika", rataRata: 85.5 },
  { mapel: "Bahasa Indonesia", rataRata: 88.0 },
  { mapel: "Bahasa Inggris", rataRata: 82.3 },
  { mapel: "Dasar Otomotif", rataRata: 90.1 },
];

const jadwalPelajaran = [
    { hari: "Senin", jam: "07:30-09:00", mapel: "Matematika", guru: "Drs. Budi Santoso" },
    { hari: "Senin", jam: "09:00-10:30", mapel: "Bahasa Indonesia", guru: "Dewi Lestari, S.Pd." },
    { hari: "Selasa", jam: "08:15-09:45", mapel: "Dasar Otomotif", guru: "Eko Prasetyo, S.Kom." },
];

const jadwalPiket = [
    { hari: "Senin", siswa: ["Ahmad", "Budi", "Citra", "Dewi"] },
    { hari: "Selasa", siswa: ["Eka", "Fitri", "Gunawan", "Hana"] },
    { hari: "Rabu", siswa: ["Indra", "Joko", "Kartika", "Lina"] },
];

const strukturOrganisasi = {
    "Ketua Kelas": "Ahmad Budi",
    "Wakil Ketua Kelas": "Citra Dewi",
    "Sekretaris": "Fitriani",
    "Bendahara": "Gunawan"
};

const kehadiranSiswa = { totalSiswa: 40, hadir: 38, sakit: 1, izin: 1, alpa: 0 };

const catatanSiswa = [
    { nama: "Eka Putra", catatan: "Perlu bimbingan lebih pada mata pelajaran Bahasa Inggris." },
    { nama: "Ahmad Budi", catatan: "Menunjukkan minat tinggi pada kegiatan praktik." },
];

const mutasiSiswa = [
    { tanggal: "2024-07-01", nama: "Rahmat Hidayat", jenis: "Masuk", keterangan: "Pindahan dari SMKN 1 Makassar" },
];

const terimaRapor = [
    { nis: "12345", nama: "Ahmad Budi", tanggal: "2024-06-15", penerima: "Orang Tua" },
    { nis: "12346", nama: "Citra Dewi", tanggal: "2024-06-15", penerima: "Wali" },
];

const pembayaranKomite = [
    { nis: "12345", nama: "Ahmad Budi", status: "Lunas", tanggal: "2024-07-10" },
    { nis: "12346", nama: "Citra Dewi", status: "Belum Lunas", tanggal: "-" },
    { nis: "12347", nama: "Eka Putra", status: "Lunas", tanggal: "2024-07-11" },
];


export default function LaporanWaliKelasPage() {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex-1 space-y-6">
      <div className="flex items-center justify-between print:hidden">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Laporan Wali Kelas - X OT 1</h2>
          <p className="text-muted-foreground">
            Rekapitulasi lengkap data kelas binaan.
          </p>
        </div>
        <Button onClick={handlePrint}>
          <Printer className="mr-2 h-4 w-4" />
          Cetak Laporan
        </Button>
      </div>
      
      <Tabs defaultValue="dataSiswa">
        <TabsList className="grid w-full grid-cols-5 print:hidden">
          <TabsTrigger value="dataSiswa">Data Siswa</TabsTrigger>
          <TabsTrigger value="administrasi">Administrasi Kelas</TabsTrigger>
          <TabsTrigger value="akademik">Akademik</TabsTrigger>
          <TabsTrigger value="kehadiran">Kehadiran & Rapor</TabsTrigger>
          <TabsTrigger value="keuangan">Keuangan</TabsTrigger>
        </TabsList>

        {/* TAB: Data Siswa */}
        <TabsContent value="dataSiswa" className="space-y-6">
            <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><Users /> Identitas Anak Wali</CardTitle></CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader><TableRow><TableHead>NIS</TableHead><TableHead>Nama</TableHead><TableHead>L/P</TableHead><TableHead>Alamat</TableHead></TableRow></TableHeader>
                        <TableBody>{identitasSiswa.map(s => (<TableRow key={s.nis}><TableCell>{s.nis}</TableCell><TableCell>{s.nama}</TableCell><TableCell>{s.jk}</TableCell><TableCell>{s.alamat}</TableCell></TableRow>))}</TableBody>
                    </Table>
                </CardContent>
            </Card>
             <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><FileText /> Catatan Siswa</CardTitle></CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader><TableRow><TableHead>Nama Siswa</TableHead><TableHead>Catatan</TableHead></TableRow></TableHeader>
                        <TableBody>{catatanSiswa.map(c => (<TableRow key={c.nama}><TableCell className="font-medium">{c.nama}</TableCell><TableCell>{c.catatan}</TableCell></TableRow>))}</TableBody>
                    </Table>
                </CardContent>
            </Card>
            <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><ArrowRightLeft /> Daftar Mutasi Siswa</CardTitle></CardHeader>
                <CardContent>
                     <Table>
                        <TableHeader><TableRow><TableHead>Tanggal</TableHead><TableHead>Nama Siswa</TableHead><TableHead>Jenis Mutasi</TableHead><TableHead>Keterangan</TableHead></TableRow></TableHeader>
                        <TableBody>{mutasiSiswa.map(m => (<TableRow key={m.nama}><TableCell>{m.tanggal}</TableCell><TableCell>{m.nama}</TableCell><TableCell><Badge variant={m.jenis === 'Masuk' ? 'default' : 'destructive'}>{m.jenis}</Badge></TableCell><TableCell>{m.keterangan}</TableCell></TableRow>))}</TableBody>
                    </Table>
                </CardContent>
            </Card>
        </TabsContent>

        {/* TAB: Administrasi Kelas */}
        <TabsContent value="administrasi" className="space-y-6">
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader><CardTitle className="flex items-center gap-2"><Box /> Sarana Kelas</CardTitle></CardHeader>
                    <CardContent>
                         <Table>
                            <TableHeader><TableRow><TableHead>No</TableHead><TableHead>Nama Barang</TableHead><TableHead>Jumlah</TableHead><TableHead>Kondisi</TableHead></TableRow></TableHeader>
                            <TableBody>{saranaKelas.map(s => (<TableRow key={s.no}><TableCell>{s.no}</TableCell><TableCell>{s.nama}</TableCell><TableCell>{s.jumlah}</TableCell><TableCell>{s.kondisi}</TableCell></TableRow>))}</TableBody>
                        </Table>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader><CardTitle className="flex items-center gap-2"><Users /> Struktur Organisasi Kelas</CardTitle></CardHeader>
                    <CardContent>
                        <ul className="space-y-2 text-sm">
                            {Object.entries(strukturOrganisasi).map(([jabatan, nama]) => (
                                <li key={jabatan} className="flex justify-between">
                                    <span className="font-semibold">{jabatan}:</span>
                                    <span>{nama}</span>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            </div>
             <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><Calendar /> Jadwal Piket Kelas</CardTitle></CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {jadwalPiket.map(piket => (
                            <div key={piket.hari}>
                                <h4 className="font-semibold mb-2">{piket.hari}</h4>
                                <ul className="list-disc list-inside text-muted-foreground text-sm">
                                    {piket.siswa.map(s => <li key={s}>{s}</li>)}
                                </ul>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
             <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><Armchair /> Denah Tempat Duduk</CardTitle></CardHeader>
                <CardContent>
                    <p className="text-muted-foreground text-center">Fitur denah tempat duduk akan segera tersedia.</p>
                </CardContent>
            </Card>
        </TabsContent>

        {/* TAB: Akademik */}
        <TabsContent value="akademik" className="space-y-6">
            <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp /> Rekap Nilai Rata-Rata Guru Mapel</CardTitle></CardHeader>
                <CardContent>
                     <Table>
                        <TableHeader><TableRow><TableHead>Mata Pelajaran</TableHead><TableHead className="text-right">Nilai Rata-Rata Kelas</TableHead></TableRow></TableHeader>
                        <TableBody>{rekapNilai.map(n => (<TableRow key={n.mapel}><TableCell className="font-medium">{n.mapel}</TableCell><TableCell className="text-right">{n.rataRata.toFixed(1)}</TableCell></TableRow>))}</TableBody>
                    </Table>
                </CardContent>
            </Card>
            <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><Calendar /> Jadwal Pelajaran</CardTitle></CardHeader>
                <CardContent>
                     <Table>
                        <TableHeader><TableRow><TableHead>Hari</TableHead><TableHead>Jam</TableHead><TableHead>Mata Pelajaran</TableHead><TableHead>Guru</TableHead></TableRow></TableHeader>
                        <TableBody>{jadwalPelajaran.map((j, i) => (<TableRow key={i}><TableCell>{j.hari}</TableCell><TableCell>{j.jam}</TableCell><TableCell>{j.mapel}</TableCell><TableCell>{j.guru}</TableCell></TableRow>))}</TableBody>
                    </Table>
                </CardContent>
            </Card>
        </TabsContent>
        
         {/* TAB: Kehadiran & Rapor */}
        <TabsContent value="kehadiran" className="space-y-6">
            <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><CheckCircle /> Rekap Kehadiran Siswa (Bulanan)</CardTitle></CardHeader>
                <CardContent className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
                    <div className="p-4 bg-secondary rounded-lg"><p className="text-sm text-muted-foreground">Total Siswa</p><p className="text-2xl font-bold">{kehadiranSiswa.totalSiswa}</p></div>
                    <div className="p-4 bg-secondary rounded-lg"><p className="text-sm text-muted-foreground">Hadir</p><p className="text-2xl font-bold">{kehadiranSiswa.hadir}</p></div>
                    <div className="p-4 bg-secondary rounded-lg"><p className="text-sm text-muted-foreground">Sakit</p><p className="text-2xl font-bold">{kehadiranSiswa.sakit}</p></div>
                    <div className="p-4 bg-secondary rounded-lg"><p className="text-sm text-muted-foreground">Izin</p><p className="text-2xl font-bold">{kehadiranSiswa.izin}</p></div>
                    <div className="p-4 bg-destructive/20 rounded-lg"><p className="text-sm text-destructive">Alpa</p><p className="text-2xl font-bold text-destructive">{kehadiranSiswa.alpa}</p></div>
                </CardContent>
            </Card>
             <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><FileText /> Daftar Penerimaan Rapor</CardTitle></CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader><TableRow><TableHead>NIS</TableHead><TableHead>Nama Siswa</TableHead><TableHead>Tanggal Terima</TableHead><TableHead>Penerima</TableHead></TableRow></TableHeader>
                        <TableBody>{terimaRapor.map(r => (<TableRow key={r.nis}><TableCell>{r.nis}</TableCell><TableCell>{r.nama}</TableCell><TableCell>{r.tanggal}</TableCell><TableCell>{r.penerima}</TableCell></TableRow>))}</TableBody>
                    </Table>
                </CardContent>
            </Card>
        </TabsContent>

         {/* TAB: Keuangan */}
        <TabsContent value="keuangan" className="space-y-6">
            <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><DollarSign /> Daftar Pembayaran Komite</CardTitle></CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader><TableRow><TableHead>NIS</TableHead><TableHead>Nama Siswa</TableHead><TableHead>Status</TableHead><TableHead>Tanggal Bayar</TableHead></TableRow></TableHeader>
                        <TableBody>{pembayaranKomite.map(p => (<TableRow key={p.nis}><TableCell>{p.nis}</TableCell><TableCell>{p.nama}</TableCell><TableCell><Badge variant={p.status === 'Lunas' ? 'default' : 'destructive'}>{p.status}</Badge></TableCell><TableCell>{p.tanggal}</TableCell></TableRow>))}</TableBody>
                    </Table>
                </CardContent>
            </Card>
        </TabsContent>

      </Tabs>
    </div>
  );
}
