
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Edit, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { getSourceData, updateSourceData } from "@/lib/data-manager";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";

// --- Data Structures ---
interface Siswa {
  id: number;
  // Identitas Pribadi
  nis: string;
  nisn?: string;
  nama: string;
  namaPanggilan?: string;
  jk?: 'Laki-laki' | 'Perempuan';
  tempatLahir?: string;
  tanggalLahir?: string;
  agama?: string;
  kewarganegaraan?: string;
  alamat?: string;
  telepon?: string;
  email?: string;
  golDarah?: string;
  tinggiBadan?: number;
  beratBadan?: number;
  anakKe?: number;
  dariBersaudara?: number;
  hobi?: string;
  // Pendidikan Sebelumnya
  asalSekolah?: string;
  noIjazah?: string;
  // Data Orang Tua/Wali
  namaAyah?: string;
  pekerjaanAyah?: string;
  namaIbu?: string;
  pekerjaanIbu?: string;
  alamatOrtu?: string;
  teleponOrtu?: string;
  namaWali?: string;
  pekerjaanWali?: string;
  // Data Akademik
  jurusan?: string;
  kelas: string;
  // Data Kesehatan
  riwayatPenyakit?: string;
}

interface Kelas {
    id: number;
    nama: string;
}

const SISWA_STORAGE_KEY = 'siswaData';

export default function DataIndukSiswaPage() {
  const { toast } = useToast();
  const [allSiswa, setAllSiswa] = useState<Siswa[]>([]);
  const [filteredSiswa, setFilteredSiswa] = useState<Siswa[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [daftarKelas, setDaftarKelas] = useState<Kelas[]>([]);

  // Dialog states
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSiswa, setEditingSiswa] = useState<Siswa | null>(null);
  const [siswaToDelete, setSiswaToDelete] = useState<Siswa | null>(null);
  const [formData, setFormData] = useState<Partial<Siswa>>({});

  useEffect(() => {
    const siswaData = getSourceData(SISWA_STORAGE_KEY, []);
    const kelasData = getSourceData('kelasData', []);
    setAllSiswa(siswaData);
    setFilteredSiswa(siswaData);
    setDaftarKelas(kelasData);
  }, []);
  
  useEffect(() => {
    const results = allSiswa.filter(s =>
      s.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.nis.includes(searchTerm) ||
      s.kelas.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredSiswa(results);
  }, [searchTerm, allSiswa]);

  const handleOpenDialog = (siswa: Siswa | null = null) => {
    setEditingSiswa(siswa);
    setFormData(siswa || { jk: 'Laki-laki' });
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.nis || !formData.nama || !formData.kelas) {
      toast({ title: "Gagal", description: "NIS, Nama Lengkap, dan Kelas harus diisi.", variant: "destructive" });
      return;
    }

    let updatedSiswaList;
    if (editingSiswa) {
      updatedSiswaList = allSiswa.map(s => s.id === editingSiswa.id ? { ...s, ...formData } : s);
    } else {
      const newId = allSiswa.length > 0 ? Math.max(...allSiswa.map(s => s.id)) + 1 : 1;
      updatedSiswaList = [...allSiswa, { ...formData, id: newId } as Siswa];
    }
    setAllSiswa(updatedSiswaList);
    updateSourceData(SISWA_STORAGE_KEY, updatedSiswaList);
    toast({ title: "Sukses", description: "Data siswa berhasil disimpan." });
    setIsDialogOpen(false);
  };

  const handleDelete = () => {
    if (!siswaToDelete) return;
    const updatedSiswaList = allSiswa.filter(s => s.id !== siswaToDelete.id);
    setAllSiswa(updatedSiswaList);
    updateSourceData(SISWA_STORAGE_KEY, updatedSiswaList);
    toast({ title: "Dihapus", description: `Data siswa ${siswaToDelete.nama} telah dihapus.` });
    setSiswaToDelete(null);
  };

  const renderDialogContent = () => (
    <Tabs defaultValue="identitas">
        <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="identitas">Identitas</TabsTrigger>
            <TabsTrigger value="ortu">Orang Tua/Wali</TabsTrigger>
            <TabsTrigger value="akademik">Akademik</TabsTrigger>
            <TabsTrigger value="lainnya">Lain-lain</TabsTrigger>
        </TabsList>
        <ScrollArea className="h-[500px] p-1">
             <div className="p-4">
                <TabsContent value="identitas" className="space-y-4 mt-0">
                    <h3 className="font-semibold">1. Identitas Pribadi Siswa</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1"><Label htmlFor="nis">NIS*</Label><Input id="nis" value={formData.nis || ""} onChange={e => setFormData({...formData, nis: e.target.value})} /></div>
                        <div className="space-y-1"><Label htmlFor="nisn">NISN</Label><Input id="nisn" value={formData.nisn || ""} onChange={e => setFormData({...formData, nisn: e.target.value})} /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1"><Label htmlFor="nama">Nama Lengkap*</Label><Input id="nama" value={formData.nama || ""} onChange={e => setFormData({...formData, nama: e.target.value})} /></div>
                        <div className="space-y-1"><Label htmlFor="namaPanggilan">Nama Panggilan</Label><Input id="namaPanggilan" value={formData.namaPanggilan || ""} onChange={e => setFormData({...formData, namaPanggilan: e.target.value})} /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                         <div className="space-y-1"><Label htmlFor="jk">Jenis Kelamin</Label><Select value={formData.jk || ""} onValueChange={value => setFormData({...formData, jk: value as any})}><SelectTrigger id="jk"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Laki-laki">Laki-laki</SelectItem><SelectItem value="Perempuan">Perempuan</SelectItem></SelectContent></Select></div>
                        <div className="space-y-1"><Label htmlFor="agama">Agama</Label><Input id="agama" value={formData.agama || ""} onChange={e => setFormData({...formData, agama: e.target.value})} /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1"><Label htmlFor="tempatLahir">Tempat Lahir</Label><Input id="tempatLahir" value={formData.tempatLahir || ""} onChange={e => setFormData({...formData, tempatLahir: e.target.value})} /></div>
                        <div className="space-y-1"><Label htmlFor="tanggalLahir">Tanggal Lahir</Label><Input id="tanggalLahir" type="date" value={formData.tanggalLahir || ""} onChange={e => setFormData({...formData, tanggalLahir: e.target.value})} /></div>
                    </div>
                     <div className="space-y-1"><Label htmlFor="alamat">Alamat Lengkap</Label><Textarea id="alamat" value={formData.alamat || ""} onChange={e => setFormData({...formData, alamat: e.target.value})} /></div>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1"><Label htmlFor="telepon">No. Telepon/HP</Label><Input id="telepon" value={formData.telepon || ""} onChange={e => setFormData({...formData, telepon: e.target.value})} /></div>
                        <div className="space-y-1"><Label htmlFor="email">Email</Label><Input id="email" type="email" value={formData.email || ""} onChange={e => setFormData({...formData, email: e.target.value})} /></div>
                    </div>
                </TabsContent>
                <TabsContent value="ortu" className="space-y-4 mt-0">
                    <h3 className="font-semibold">2. Data Orang Tua / Wali</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1"><Label htmlFor="namaAyah">Nama Ayah</Label><Input id="namaAyah" value={formData.namaAyah || ""} onChange={e => setFormData({...formData, namaAyah: e.target.value})} /></div>
                        <div className="space-y-1"><Label htmlFor="pekerjaanAyah">Pekerjaan Ayah</Label><Input id="pekerjaanAyah" value={formData.pekerjaanAyah || ""} onChange={e => setFormData({...formData, pekerjaanAyah: e.target.value})} /></div>
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1"><Label htmlFor="namaIbu">Nama Ibu</Label><Input id="namaIbu" value={formData.namaIbu || ""} onChange={e => setFormData({...formData, namaIbu: e.target.value})} /></div>
                        <div className="space-y-1"><Label htmlFor="pekerjaanIbu">Pekerjaan Ibu</Label><Input id="pekerjaanIbu" value={formData.pekerjaanIbu || ""} onChange={e => setFormData({...formData, pekerjaanIbu: e.target.value})} /></div>
                    </div>
                    <div className="space-y-1"><Label htmlFor="alamatOrtu">Alamat Orang Tua</Label><Textarea id="alamatOrtu" value={formData.alamatOrtu || ""} onChange={e => setFormData({...formData, alamatOrtu: e.target.value})} /></div>
                    <div className="space-y-1"><Label htmlFor="teleponOrtu">No. Telepon Orang Tua</Label><Input id="teleponOrtu" value={formData.teleponOrtu || ""} onChange={e => setFormData({...formData, teleponOrtu: e.target.value})} /></div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1"><Label htmlFor="namaWali">Nama Wali (jika ada)</Label><Input id="namaWali" value={formData.namaWali || ""} onChange={e => setFormData({...formData, namaWali: e.target.value})} /></div>
                        <div className="space-y-1"><Label htmlFor="pekerjaanWali">Pekerjaan Wali</Label><Input id="pekerjaanWali" value={formData.pekerjaanWali || ""} onChange={e => setFormData({...formData, pekerjaanWali: e.target.value})} /></div>
                    </div>
                </TabsContent>
                <TabsContent value="akademik" className="space-y-4 mt-0">
                    <h3 className="font-semibold">3. Data Akademik & Riwayat</h3>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1"><Label htmlFor="jurusan">Jurusan/Program Keahlian</Label><Input id="jurusan" value={formData.jurusan || ""} onChange={e => setFormData({...formData, jurusan: e.target.value})} /></div>
                        <div className="space-y-1"><Label htmlFor="kelas">Kelas*</Label><Select value={formData.kelas || ""} onValueChange={value => setFormData({...formData, kelas: value})}><SelectTrigger id="kelas"><SelectValue placeholder="Pilih Kelas" /></SelectTrigger><SelectContent>{daftarKelas.map(k => <SelectItem key={k.id} value={k.nama}>{k.nama}</SelectItem>)}</SelectContent></Select></div>
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1"><Label htmlFor="asalSekolah">Asal Sekolah (SMP/MTs)</Label><Input id="asalSekolah" value={formData.asalSekolah || ""} onChange={e => setFormData({...formData, asalSekolah: e.target.value})} /></div>
                        <div className="space-y-1"><Label htmlFor="noIjazah">No. Ijazah/SKHUN</Label><Input id="noIjazah" value={formData.noIjazah || ""} onChange={e => setFormData({...formData, noIjazah: e.target.value})} /></div>
                    </div>
                </TabsContent>
                <TabsContent value="lainnya" className="space-y-4 mt-0">
                    <h3 className="font-semibold">4. Data Kesehatan & Lainnya</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1"><Label htmlFor="golDarah">Golongan Darah</Label><Input id="golDarah" value={formData.golDarah || ""} onChange={e => setFormData({...formData, golDarah: e.target.value})} /></div>
                        <div className="space-y-1"><Label htmlFor="riwayatPenyakit">Riwayat Penyakit/Alergi</Label><Input id="riwayatPenyakit" value={formData.riwayatPenyakit || ""} onChange={e => setFormData({...formData, riwayatPenyakit: e.target.value})} /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1"><Label htmlFor="tinggiBadan">Tinggi Badan (cm)</Label><Input id="tinggiBadan" type="number" value={formData.tinggiBadan || ""} onChange={e => setFormData({...formData, tinggiBadan: parseInt(e.target.value)})} /></div>
                        <div className="space-y-1"><Label htmlFor="beratBadan">Berat Badan (kg)</Label><Input id="beratBadan" type="number" value={formData.beratBadan || ""} onChange={e => setFormData({...formData, beratBadan: parseInt(e.target.value)})} /></div>
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1"><Label htmlFor="anakKe">Anak Ke-</Label><Input id="anakKe" type="number" value={formData.anakKe || ""} onChange={e => setFormData({...formData, anakKe: parseInt(e.target.value)})} /></div>
                        <div className="space-y-1"><Label htmlFor="dariBersaudara">Dari Bersaudara</Label><Input id="dariBersaudara" type="number" value={formData.dariBersaudara || ""} onChange={e => setFormData({...formData, dariBersaudara: parseInt(e.target.value)})} /></div>
                    </div>
                    <div className="space-y-1"><Label htmlFor="hobi">Hobi/Minat Khusus</Label><Input id="hobi" value={formData.hobi || ""} onChange={e => setFormData({...formData, hobi: e.target.value})} /></div>
                </TabsContent>
             </div>
        </ScrollArea>
    </Tabs>
  );

  return (
    <div className="flex-1 space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Manajemen Data Induk Siswa</h2>
        <p className="text-muted-foreground">Kelola semua data siswa yang terdaftar di sekolah.</p>
      </div>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Daftar Siswa</CardTitle>
              <CardDescription>Cari, tambah, ubah, atau hapus data siswa.</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => handleOpenDialog()}><PlusCircle className="mr-2 h-4 w-4" /> Tambah Siswa</Button>
            </div>
          </div>
           <div className="mt-4">
              <Input
                placeholder="Cari berdasarkan nama, NIS, atau kelas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>NIS</TableHead>
                <TableHead>Nama Siswa</TableHead>
                <TableHead>Kelas</TableHead>
                <TableHead>L/P</TableHead>
                <TableHead>Telepon</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSiswa.length > 0 ? (
                filteredSiswa.map((siswa) => (
                  <TableRow key={siswa.id}>
                    <TableCell>{siswa.nis}</TableCell>
                    <TableCell className="font-medium">{siswa.nama}</TableCell>
                    <TableCell>{siswa.kelas}</TableCell>
                    <TableCell>{siswa.jk || '-'}</TableCell>
                    <TableCell>{siswa.telepon || '-'}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(siswa)}><Edit className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => setSiswaToDelete(siswa)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow><TableCell colSpan={6} className="h-24 text-center">Tidak ada data siswa yang ditemukan.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader><DialogTitle>{editingSiswa ? "Edit Data Siswa" : "Tambah Siswa Baru"}</DialogTitle></DialogHeader>
            {renderDialogContent()}
            <DialogFooter><DialogClose asChild><Button variant="outline">Batal</Button></DialogClose><Button onClick={handleSave}>Simpan</Button></DialogFooter>
          </DialogContent>
      </Dialog>

      <AlertDialog open={!!siswaToDelete} onOpenChange={() => setSiswaToDelete(null)}>
          <AlertDialogContent>
              <AlertDialogHeader><AlertDialogTitle>Yakin ingin menghapus?</AlertDialogTitle><AlertDialogDescription>Tindakan ini akan menghapus data siswa {siswaToDelete?.nama} secara permanen.</AlertDialogDescription></AlertDialogHeader>
              <AlertDialogFooter><AlertDialogCancel>Batal</AlertDialogCancel><AlertDialogAction onClick={handleDelete}>Hapus</AlertDialogAction></AlertDialogFooter>
          </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

    