"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, MoreHorizontal, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
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

interface Kelas {
  id: number;
  nama: string;
  jumlahSiswa: number;
}

export default function ManajemenKelasPage() {
  const [kelas, setKelas] = useState<Kelas[]>([
    { id: 1, nama: "X TKJ 1", jumlahSiswa: 32 },
    { id: 2, nama: "XI AKL 2", jumlahSiswa: 35 },
    { id: 3, nama: "XII TSM 3", jumlahSiswa: 30 },
  ]);
  const [namaKelas, setNamaKelas] = useState("");
  const [jumlahSiswa, setJumlahSiswa] = useState("");
  const [open, setOpen] = useState(false);

  const handleTambahKelas = () => {
    if (namaKelas && jumlahSiswa) {
      const newKelas: Kelas = {
        id: kelas.length > 0 ? Math.max(...kelas.map((k) => k.id)) + 1 : 1,
        nama: namaKelas,
        jumlahSiswa: parseInt(jumlahSiswa, 10),
      };
      setKelas([...kelas, newKelas]);
      setNamaKelas("");
      setJumlahSiswa("");
      setOpen(false); // Close the dialog
    }
  };

  return (
    <div className="flex-1 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Manajemen Kelas</h2>
          <p className="text-muted-foreground">
            Kelola data kelas dan jumlah siswa di setiap kelas.
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Tambah Kelas
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Tambah Kelas Baru</DialogTitle>
              <DialogDescription>
                Masukkan informasi kelas yang akan ditambahkan. Klik simpan jika
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
                  placeholder="Contoh: 32"
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Batal</Button>
              </DialogClose>
              <Button type="submit" onClick={handleTambahKelas}>
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
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            <span>Edit</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
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
    </div>
  );
}
