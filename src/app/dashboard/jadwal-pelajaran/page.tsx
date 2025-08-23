
"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, MoreHorizontal, Edit, Trash2 } from "lucide-react";
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

interface Jadwal {
  id: number;
  hari: string;
  jam: string;
  kelas: string;
  mataPelajaran: string;
  guru: string;
}

export default function JadwalPelajaranPage() {
  const [jadwal, setJadwal] = useState<Jadwal[]>([
    { id: 1, hari: "Senin", jam: "07:30 - 09:00", kelas: "X TKJ 1", mataPelajaran: "Matematika", guru: "Drs. Budi Santoso" },
    { id: 2, hari: "Selasa", jam: "10:00 - 11:30", kelas: "XI AKL 2", mataPelajaran: "Akuntansi Dasar", guru: "Siti Aminah, S.Pd." },
  ]);
  const [open, setOpen] = useState(false);

  // Form states
  const [hari, setHari] = useState("");
  const [jam, setJam] = useState("");
  const [kelas, setKelas] = useState("");
  const [mataPelajaran, setMataPelajaran] = useState("");
  const [guru, setGuru] = useState("");

  const handleTambahJadwal = () => {
    if (hari && jam && kelas && mataPelajaran && guru) {
      const newJadwal: Jadwal = {
        id: jadwal.length > 0 ? Math.max(...jadwal.map(j => j.id)) + 1 : 1,
        hari,
        jam,
        kelas,
        mataPelajaran,
        guru,
      };
      setJadwal([...jadwal, newJadwal]);
      // Reset form
      setHari("");
      setJam("");
      setKelas("");
      setMataPelajaran("");
      setGuru("");
      setOpen(false); // Close dialog
    }
  };

  return (
    <div className="flex-1 space-y-6">
        <div className="flex items-center justify-between">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Jadwal Pelajaran</h2>
                <p className="text-muted-foreground">Kelola jadwal pelajaran untuk setiap kelas.</p>
            </div>
             <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Buat Jadwal Baru
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Buat Jadwal Baru</DialogTitle>
                  <DialogDescription>
                    Masukkan detail jadwal pelajaran. Klik simpan jika sudah selesai.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="hari" className="text-right">
                      Hari
                    </Label>
                    <Select onValueChange={setHari} value={hari}>
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Pilih Hari" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Senin">Senin</SelectItem>
                        <SelectItem value="Selasa">Selasa</SelectItem>
                        <SelectItem value="Rabu">Rabu</SelectItem>
                        <SelectItem value="Kamis">Kamis</SelectItem>
                        <SelectItem value="Jumat">Jumat</SelectItem>
                        <SelectItem value="Sabtu">Sabtu</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                   <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="jam" className="text-right">
                      Jam
                    </Label>
                    <Input
                      id="jam"
                      value={jam}
                      onChange={(e) => setJam(e.target.value)}
                      className="col-span-3"
                      placeholder="Contoh: 07:30 - 09:00"
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
                        <SelectItem value="X TKJ 1">X TKJ 1</SelectItem>
                        <SelectItem value="XI AKL 2">XI AKL 2</SelectItem>
                        <SelectItem value="XII TSM 3">XII TSM 3</SelectItem>
                        <SelectItem value="X OTKP 1">X OTKP 1</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                   <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="mapel" className="text-right">
                      Mata Pelajaran
                    </Label>
                    <Input
                      id="mapel"
                      value={mataPelajaran}
                      onChange={(e) => setMataPelajaran(e.target.value)}
                      className="col-span-3"
                      placeholder="Contoh: Matematika"
                    />
                  </div>
                   <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="guru" className="text-right">
                      Guru
                    </Label>
                    <Input
                      id="guru"
                      value={guru}
                      onChange={(e) => setGuru(e.target.value)}
                      className="col-span-3"
                      placeholder="Nama Lengkap Guru"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Batal</Button>
                  </DialogClose>
                  <Button type="submit" onClick={handleTambahJadwal}>
                    Simpan
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Daftar Jadwal</CardTitle>
          <CardDescription>
            Jadwal pelajaran yang sudah diinput akan ditampilkan di sini.
          </CardDescription>
        </CardHeader>
        <CardContent>
           <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Hari</TableHead>
                <TableHead>Jam</TableHead>
                <TableHead>Kelas</TableHead>
                <TableHead>Mata Pelajaran</TableHead>
                <TableHead>Guru</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jadwal.length > 0 ? (
                jadwal.map((j) => (
                  <TableRow key={j.id}>
                    <TableCell className="font-medium">{j.hari}</TableCell>
                    <TableCell>{j.jam}</TableCell>
                    <TableCell>{j.kelas}</TableCell>
                    <TableCell>{j.mataPelajaran}</TableCell>
                    <TableCell>{j.guru}</TableCell>
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
                  <TableCell colSpan={6} className="text-center h-24">
                    Belum ada data jadwal pelajaran.
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
