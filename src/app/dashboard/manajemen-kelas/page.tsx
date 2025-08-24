
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MoreHorizontal, Edit, Trash2, PlusCircle, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";


interface Kelas {
  id: number;
  nama: string;
}

interface Siswa {
    id: number;
    kelas: string;
}

const initialKelas: Omit<Kelas, 'id'>[] = [
  { nama: "X OT 1" }, { nama: "X OT 2" }, { nama: "X OT 3" },
  { nama: "X TKR" }, { nama: "X AKL" }, { nama: "X TM" },
  { nama: "XI TAB 1" }, { nama: "XI TAB 2" }, { nama: "XI TKR" },
  { nama: "XI AKL" }, { nama: "XI TM" }, { nama: "XII TAB 1" },
  { nama: "XII TAB 2" }, { nama: "XII TKR" }, { nama: "XII AKL" },
  { nama: "XII TM" },
];

export default function ManajemenKelasPage() {
  const [kelas, setKelas] = useState<Kelas[]>([]);
  const [siswa, setSiswa] = useState<Siswa[]>([]);
  const [editingKelas, setEditingKelas] = useState<Kelas | null>(null);
  
  const [namaKelas, setNamaKelas] = useState("");
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [kelasToDelete, setKelasToDelete] = useState<Kelas | null>(null);

  useEffect(() => {
    const savedKelas = localStorage.getItem('kelasData');
    if (savedKelas) {
      setKelas(JSON.parse(savedKelas));
    } else {
      const formattedInitialKelas = initialKelas.map((k, index) => ({ ...k, id: index + 1 }));
      setKelas(formattedInitialKelas);
      localStorage.setItem('kelasData', JSON.stringify(formattedInitialKelas));
    }
    
    const savedSiswa = localStorage.getItem('siswaData');
    if(savedSiswa) {
        setSiswa(JSON.parse(savedSiswa));
    }
  }, []);

  const saveDataToLocalStorage = (data: Kelas[]) => {
    localStorage.setItem('kelasData', JSON.stringify(data));
  };

  const getJumlahSiswaByKelas = (namaKelas: string) => {
    return siswa.filter(s => s.kelas === namaKelas).length;
  };

  const resetForm = () => {
    setNamaKelas("");
    setEditingKelas(null);
  };

  const handleOpenDialog = (kelasToEdit: Kelas | null = null) => {
    if (kelasToEdit) {
      setEditingKelas(kelasToEdit);
      setNamaKelas(kelasToEdit.nama);
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleSaveKelas = () => {
    if (namaKelas) {
        let updatedKelas;
      if (editingKelas) {
        updatedKelas = kelas.map((k) =>
            k.id === editingKelas.id
              ? { ...k, nama: namaKelas }
              : k
          );
      } else {
        const newKelas: Kelas = {
          id: kelas.length > 0 ? Math.max(...kelas.map((k) => k.id)) + 1 : 1,
          nama: namaKelas,
        };
        updatedKelas = [...kelas, newKelas];
      }
      setKelas(updatedKelas);
      saveDataToLocalStorage(updatedKelas);
      resetForm();
      setIsDialogOpen(false);
    }
  };

  const handleDeleteKelas = () => {
    if (!kelasToDelete) return;
    const updatedKelas = kelas.filter((k) => k.id !== kelasToDelete.id);
    setKelas(updatedKelas);
    saveDataToLocalStorage(updatedKelas);
    setKelasToDelete(null);
  };


  return (
    <div className="flex-1 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Manajemen Kelas</h2>
          <p className="text-muted-foreground">
            Daftar kelas yang tersedia di sekolah. Jumlah siswa dihitung otomatis dari data Manajemen Siswa.
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(isOpen) => { setIsDialogOpen(isOpen); if (!isOpen) resetForm(); }}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Tambah Kelas
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{editingKelas ? "Edit Kelas" : "Tambah Kelas Baru"}</DialogTitle>
              <DialogDescription>
                 {editingKelas ? "Ubah nama kelas." : "Masukkan nama kelas yang akan ditambahkan."} Klik simpan jika
                sudah selesai.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="nama-kelas" className="text-right">
                  Nama Kelas
                </Label>
                <Input
                  id="nama-kelas"
                  value={namaKelas}
                  onChange={(e) => setNamaKelas(e.target.value)}
                  className="col-span-3"
                  placeholder="Contoh: X TKJ 1"
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Batal</Button>
              </DialogClose>
              <Button type="submit" onClick={handleSaveKelas}>
                Simpan
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Kelas</CardTitle>
          <CardDescription>
            Berikut adalah daftar kelas yang terdaftar di sistem.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Kelas</TableHead>
                <TableHead className="text-center flex items-center justify-center gap-2"><Users className="h-4 w-4"/>Jumlah Siswa</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {kelas.length > 0 ? (
                kelas.map((k) => (
                  <TableRow key={k.id}>
                    <TableCell className="font-medium">{k.nama}</TableCell>
                    <TableCell className="text-center">{getJumlahSiswaByKelas(k.nama)}</TableCell>
                    <TableCell className="text-right">
                       <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Buka menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleOpenDialog(k)}>
                            <Edit className="mr-2 h-4 w-4" />
                            <span>Edit</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => setKelasToDelete(k)} className="text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            <span>Hapus</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="text-center h-24">
                    Belum ada data kelas.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AlertDialog open={!!kelasToDelete} onOpenChange={() => setKelasToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak bisa dibatalkan. Ini akan menghapus data kelas secara permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteKelas}>Hapus</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
