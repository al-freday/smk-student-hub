
"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, MoreHorizontal, Edit, Trash2, Upload } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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


interface Siswa {
  id: number;
  nis: string;
  nama: string;
  kelas: string;
}

const initialSiswa: Siswa[] = [
    { id: 1, nis: "1234567890", nama: "Ahmad Budi", kelas: "X OT 1" },
    { id: 2, nis: "0987654321", nama: "Citra Dewi", kelas: "XI AKL" },
    { id: 3, nis: "1122334455", nama: "Eka Putra", kelas: "XII TKR" },
];

const daftarKelas = [
  "X OT 1", "X OT 2", "X OT 3", "X TKR", "X AKL", "X TM",
  "XI TAB 1", "XI TAB 2", "XI TKR", "XI AKL", "XI TM",
  "XII TAB 1", "XII TAB 2", "XII TKR", "XII AKL", "XII TM"
];


export default function ManajemenSiswaPage() {
  const [siswa, setSiswa] = useState<Siswa[]>(initialSiswa);
  const [editingSiswa, setEditingSiswa] = useState<Siswa | null>(null);

  // Form states
  const [nis, setNis] = useState("");
  const [nama, setNama] = useState("");
  const [kelas, setKelas] = useState("");

  const [open, setOpen] = useState(false);

  const resetForm = () => {
    setNis("");
    setNama("");
    setKelas("");
    setEditingSiswa(null);
  };

  const handleOpenDialog = (siswaToEdit: Siswa | null = null) => {
    if (siswaToEdit) {
      setEditingSiswa(siswaToEdit);
      setNis(siswaToEdit.nis);
      setNama(siswaToEdit.nama);
      setKelas(siswaToEdit.kelas);
    } else {
      resetForm();
    }
    setOpen(true);
  };

  const handleSaveSiswa = () => {
    if (nis && nama && kelas) {
      if (editingSiswa) {
        // Update existing siswa
        setSiswa(
          siswa.map((s) =>
            s.id === editingSiswa.id ? { ...s, nis, nama, kelas } : s
          )
        );
      } else {
        // Add new siswa
        const newSiswa: Siswa = {
          id: siswa.length > 0 ? Math.max(...siswa.map((s) => s.id)) + 1 : 1,
          nis,
          nama,
          kelas,
        };
        setSiswa([...siswa, newSiswa]);
      }
      resetForm();
      setOpen(false);
    }
  };

  const handleDeleteSiswa = (id: number) => {
    setSiswa(siswa.filter((s) => s.id !== id));
  };
  
  const handleImport = () => {
    // Placeholder for excel import functionality
    alert("Fungsionalitas impor dari Excel akan segera tersedia.");
  };

  return (
    <div className="flex-1 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Manajemen Siswa</h2>
          <p className="text-muted-foreground">Kelola data siswa di sekolah.</p>
        </div>
        <div className="flex gap-2">
            <Button variant="outline" onClick={handleImport}>
              <Upload className="mr-2 h-4 w-4" />
              Impor dari Excel
            </Button>
            <Dialog open={open} onOpenChange={(isOpen) => { setOpen(isOpen); if (!isOpen) resetForm(); }}>
              <DialogTrigger asChild>
                <Button onClick={() => handleOpenDialog()}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Tambah Siswa
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>{editingSiswa ? "Edit Siswa" : "Tambah Siswa Baru"}</DialogTitle>
                  <DialogDescription>
                    {editingSiswa ? "Ubah informasi siswa." : "Masukkan informasi siswa yang akan ditambahkan."} Klik simpan jika sudah selesai.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="nis" className="text-right">
                      NIS
                    </Label>
                    <Input
                      id="nis"
                      value={nis}
                      onChange={(e) => setNis(e.target.value)}
                      className="col-span-3"
                      placeholder="Nomor Induk Siswa"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="nama" className="text-right">
                      Nama
                    </Label>
                    <Input
                      id="nama"
                      value={nama}
                      onChange={(e) => setNama(e.target.value)}
                      className="col-span-3"
                      placeholder="Nama Lengkap Siswa"
                    />
                  </div>
                   <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="kelas" className="text-right">
                      Kelas
                    </Label>
                     <Select onValueChange={setKelas} value={kelas}>
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Pilih Kelas" />
                        </SelectTrigger>
                        <SelectContent>
                          {daftarKelas.map(k => (
                            <SelectItem key={k} value={k}>{k}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Batal</Button>
                  </DialogClose>
                  <Button type="submit" onClick={handleSaveSiswa}>
                    Simpan
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Daftar Siswa</CardTitle>
          <CardDescription>
            Data siswa yang terdaftar akan ditampilkan di sini.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>NIS</TableHead>
                <TableHead>Nama Siswa</TableHead>
                <TableHead>Kelas</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {siswa.length > 0 ? (
                siswa.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell>{s.nis}</TableCell>
                    <TableCell className="font-medium">{s.nama}</TableCell>
                    <TableCell>{s.kelas}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Buka menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleOpenDialog(s)}>
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
                                  Tindakan ini tidak bisa dibatalkan. Ini akan menghapus data siswa secara permanen.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Batal</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteSiswa(s.id)}>Hapus</AlertDialogAction>
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
                  <TableCell colSpan={4} className="text-center h-24">
                    Belum ada data siswa.
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
