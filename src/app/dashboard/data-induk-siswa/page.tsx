
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Edit, Trash2, Download, Upload } from "lucide-react";
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

interface Siswa {
  id: number;
  nis: string;
  nama: string;
  kelas: string;
  jk?: 'L' | 'P';
  alamat?: string;
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
    setFormData(siswa || {});
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.nis || !formData.nama || !formData.kelas) {
      toast({ title: "Gagal", description: "NIS, Nama, dan Kelas harus diisi.", variant: "destructive" });
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
                <TableHead>Alamat</TableHead>
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
                    <TableCell>{siswa.alamat || '-'}</TableCell>
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
          <DialogContent>
            <DialogHeader><DialogTitle>{editingSiswa ? "Edit Data Siswa" : "Tambah Siswa Baru"}</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="nis" className="text-right">NIS</Label><Input id="nis" value={formData.nis || ""} onChange={e => setFormData({...formData, nis: e.target.value})} className="col-span-3" /></div>
              <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="nama" className="text-right">Nama</Label><Input id="nama" value={formData.nama || ""} onChange={e => setFormData({...formData, nama: e.target.value})} className="col-span-3" /></div>
              <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="kelas" className="text-right">Kelas</Label><Select value={formData.kelas || ""} onValueChange={value => setFormData({...formData, kelas: value})}><SelectTrigger className="col-span-3"><SelectValue placeholder="Pilih Kelas" /></SelectTrigger><SelectContent>{daftarKelas.map(k => <SelectItem key={k.id} value={k.nama}>{k.nama}</SelectItem>)}</SelectContent></Select></div>
              <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="jk" className="text-right">L/P</Label><Select value={formData.jk || ""} onValueChange={value => setFormData({...formData, jk: value as any})}><SelectTrigger className="col-span-3"><SelectValue placeholder="Pilih Jenis Kelamin" /></SelectTrigger><SelectContent><SelectItem value="L">Laki-laki</SelectItem><SelectItem value="P">Perempuan</SelectItem></SelectContent></Select></div>
              <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="alamat" className="text-right">Alamat</Label><Input id="alamat" value={formData.alamat || ""} onChange={e => setFormData({...formData, alamat: e.target.value})} className="col-span-3" /></div>
            </div>
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

    