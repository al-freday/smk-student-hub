
"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MoreHorizontal, Edit, Trash2, PlusCircle } from "lucide-react";
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";


interface Kelas {
  id: number;
  nama: string;
  jumlahSiswa: number;
}

const initialKelas: Kelas[] = [
  { id: 1, nama: "X OT 1", jumlahSiswa: 40 },
  { id: 2, nama: "X OT 2", jumlahSiswa: 40 },
  { id: 3, nama: "X OT 3", jumlahSiswa: 40 },
  { id: 4, nama: "X TKR", jumlahSiswa: 40 },
  { id: 5, nama: "X AKL", jumlahSiswa: 40 },
  { id: 6, nama: "X TM", jumlahSiswa: 40 },
  { id: 7, nama: "XI TAB 1", jumlahSiswa: 40 },
  { id: 8, nama: "XI TAB 2", jumlahSiswa: 40 },
  { id: 9, nama: "XI TKR", jumlahSiswa: 40 },
  { id: 10, nama: "XI AKL", jumlahSiswa: 40 },
  { id: 11, nama: "XI TM", jumlahSiswa: 40 },
  { id: 12, nama: "XII TAB 1", jumlahSiswa: 40 },
  { id: 13, nama: "XII TAB 2", jumlahSiswa: 40 },
  { id: 14, nama: "XII TKR", jumlahSiswa: 40 },
  { id: 15, nama: "XII AKL", jumlahSiswa: 40 },
  { id: 16, nama: "XII TM", jumlahSiswa: 40 },
];

export default function ManajemenKelasPage() {
  const [kelas, setKelas] = useState<Kelas[]>(initialKelas);
  const [editingKelas, setEditingKelas] = useState<Kelas | null>(null);
  
  // Form states for adding/editing
  const [namaKelas, setNamaKelas] = useState("");
  const [jumlahSiswa, setJumlahSiswa] = useState("");
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const resetForm = () => {
    setNamaKelas("");
    setJumlahSiswa("");
    setEditingKelas(null);
  };

  const handleOpenDialog = (kelasToEdit: Kelas | null = null) => {
    if (kelasToEdit) {
      setEditingKelas(kelasToEdit);
      setNamaKelas(kelasToEdit.nama);
      setJumlahSiswa(kelasToEdit.jumlahSiswa.toString());
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleSaveKelas = () => {
    if (namaKelas && jumlahSiswa) {
      if (editingKelas) {
        // Update existing kelas
        setKelas(
          kelas.map((k) =>
            k.id === editingKelas.id
              ? { ...k, nama: namaKelas, jumlahSiswa: parseInt(jumlahSiswa, 10) }
              : k
          )
        );
      } else {
        // Add new kelas
        const newKelas: Kelas = {
          id: kelas.length > 0 ? Math.max(...kelas.map((k) => k.id)) + 1 : 1,
          nama: namaKelas,
          jumlahSiswa: parseInt(jumlahSiswa, 10),
        };
        setKelas([...kelas, newKelas]);
      }
      resetForm();
      setIsDialogOpen(false);
    }
  };

  const handleDeleteKelas = (id: number) => {
    setKelas(kelas.filter((k) => k.id !== id));
  };


  return (
    <div className="flex-1 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Manajemen Kelas</h2>
          <p className="text-muted-foreground">
            Daftar kelas yang tersedia di sekolah.
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
                 {editingKelas ? "Ubah informasi kelas." : "Masukkan informasi kelas yang akan ditambahkan."} Klik simpan jika
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
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="jumlah-siswa" className="text-right">
                  Jumlah Siswa
                </Label>
                <Input
                  id="jumlah-siswa"
                  type="number"
                  value={jumlahSiswa}
                  onChange={(e) => setJumlahSiswa(e.target.value)}
                  className="col-span-3"
                  placeholder="Contoh: 40"
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
                <TableHead className="text-center">Jumlah Siswa</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {kelas.length > 0 ? (
                kelas.map((k) => (
                  <TableRow key={k.id}>
                    <TableCell className="font-medium">{k.nama}</TableCell>
                    <TableCell className="text-center">{k.jumlahSiswa}</TableCell>
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
                          <AlertDialog>
                              <AlertDialogTrigger asChild>
                                 <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive">
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  <span>Hapus</span>
                                </DropdownMenuItem>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Tindakan ini tidak bisa dibatalkan. Ini akan menghapus data kelas secara permanen.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Batal</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDeleteKelas(k.id)}>Hapus</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
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
    </div>
  );
}
