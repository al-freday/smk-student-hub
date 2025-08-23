
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
import { useToast } from "@/hooks/use-toast";

interface Jadwal {
  id: number;
  hari: string;
  jam: string;
  kelas: string;
  mataPelajaran: string;
  guru: string;
}

const daftarHari = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
const daftarKelas = [
  "X OT 1", "X OT 2", "X OT 3", "X TKR", "X AKL", "X TM",
  "XI TAB 1", "XI TAB 2", "XI TKR", "XI AKL", "XI TM",
  "XII TAB 1", "XII TAB 2", "XII TKR", "XII AKL", "XII TM"
];
// Data ini seharusnya sinkron dengan Manajemen Guru
const daftarGuruDanMapel = [
    { guru: "Guru Mapel 1", mapel: "Matematika" },
    { guru: "Guru Mapel 2", mapel: "Bahasa Indonesia" },
    { guru: "Guru Mapel 3", mapel: "Bahasa Inggris" },
    { guru: "Guru Mapel 4", mapel: "Fisika" },
    { guru: "Guru Mapel 5", mapel: "Kimia" },
    { guru: "Guru Mapel 6", mapel: "Biologi" },
    { guru: "Guru Mapel 7", mapel: "Sejarah Indonesia" },
    { guru: "Guru Mapel 8", mapel: "Pendidikan Agama" },
    { guru: "Guru Mapel 9", mapel: "PPKn" },
    { guru: "Guru Mapel 10", mapel: "Seni Budaya" },
];


export default function JadwalPelajaranPage() {
  const { toast } = useToast();
  const [jadwal, setJadwal] = useState<Jadwal[]>([
    { id: 1, hari: "Senin", jam: "07:30 - 09:00", kelas: "X OT 1", mataPelajaran: "Matematika", guru: "Guru Mapel 1" },
    { id: 2, hari: "Senin", jam: "09:15 - 10:45", kelas: "X OT 1", mataPelajaran: "Bahasa Indonesia", guru: "Guru Mapel 2" },
    { id: 3, hari: "Selasa", jam: "10:00 - 11:30", kelas: "XI AKL", mataPelajaran: "Akuntansi Dasar", guru: "Guru Mapel 5" },
  ]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingJadwal, setEditingJadwal] = useState<Jadwal | null>(null);
  const [jadwalToDelete, setJadwalToDelete] = useState<Jadwal | null>(null);

  // Form states
  const [formData, setFormData] = useState<Partial<Jadwal>>({});

  const resetForm = () => {
    setFormData({});
    setEditingJadwal(null);
  };

  const handleOpenDialog = (jadwalItem: Jadwal | null = null) => {
    if (jadwalItem) {
      setEditingJadwal(jadwalItem);
      setFormData(jadwalItem);
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (formData.hari && formData.jam && formData.kelas && formData.mataPelajaran && formData.guru) {
      if (editingJadwal) {
        setJadwal(jadwal.map(j => j.id === editingJadwal.id ? { ...editingJadwal, ...formData } : j));
        toast({ title: "Sukses", description: "Jadwal berhasil diperbarui." });
      } else {
        const newJadwal: Jadwal = {
          id: jadwal.length > 0 ? Math.max(...jadwal.map(j => j.id)) + 1 : 1,
          ...formData,
        } as Jadwal;
        setJadwal([...jadwal, newJadwal]);
        toast({ title: "Sukses", description: "Jadwal baru berhasil ditambahkan." });
      }
      resetForm();
      setIsDialogOpen(false);
    } else {
      toast({ title: "Gagal", description: "Harap lengkapi semua kolom.", variant: "destructive" });
    }
  };

  const handleDelete = () => {
    if (jadwalToDelete) {
      setJadwal(jadwal.filter(j => j.id !== jadwalToDelete.id));
      toast({ title: "Dihapus", description: `Jadwal untuk kelas ${jadwalToDelete.kelas} telah dihapus.` });
      setJadwalToDelete(null);
    }
  };

  const jadwalByHari = daftarHari.map(hari => ({
    hari,
    jadwal: jadwal.filter(j => j.hari === hari).sort((a, b) => a.jam.localeCompare(b.jam)),
  }));

  return (
    <div className="flex-1 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Jadwal Pelajaran</h2>
          <p className="text-muted-foreground">Kelola jadwal pelajaran untuk setiap kelas.</p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Buat Jadwal Baru
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
        {jadwalByHari.map(({ hari, jadwal: jadwalHari }) => (
          <Card key={hari}>
            <CardHeader>
              <CardTitle>{hari}</CardTitle>
            </CardHeader>
            <CardContent>
              {jadwalHari.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Jam</TableHead>
                      <TableHead>Kelas</TableHead>
                      <TableHead>Mapel/Guru</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {jadwalHari.map((j) => (
                      <TableRow key={j.id}>
                        <TableCell>{j.jam}</TableCell>
                        <TableCell className="font-medium">{j.kelas}</TableCell>
                        <TableCell>
                            {j.mataPelajaran}
                            <div className="text-xs text-muted-foreground">{j.guru}</div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(j)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => setJadwalToDelete(j)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center text-sm text-muted-foreground py-8">Belum ada jadwal untuk hari ini.</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={(isOpen) => { setIsDialogOpen(isOpen); if (!isOpen) resetForm(); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingJadwal ? "Edit Jadwal" : "Buat Jadwal Baru"}</DialogTitle>
            <DialogDescription>
              Masukkan detail jadwal pelajaran. Klik simpan jika sudah selesai.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="hari">Hari</Label>
              <Select value={formData.hari} onValueChange={value => setFormData({ ...formData, hari: value })}>
                <SelectTrigger id="hari"><SelectValue placeholder="Pilih Hari" /></SelectTrigger>
                <SelectContent>{daftarHari.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="jam">Jam</Label>
              <Input id="jam" value={formData.jam || ""} onChange={(e) => setFormData({ ...formData, jam: e.target.value })} placeholder="Contoh: 07:30 - 09:00" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="kelas">Kelas</Label>
              <Select value={formData.kelas} onValueChange={value => setFormData({ ...formData, kelas: value })}>
                <SelectTrigger id="kelas"><SelectValue placeholder="Pilih Kelas" /></SelectTrigger>
                <SelectContent>{daftarKelas.map(k => <SelectItem key={k} value={k}>{k}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="mapel">Mata Pelajaran & Guru</Label>
              <Select value={formData.mataPelajaran} onValueChange={value => {
                  const selected = daftarGuruDanMapel.find(item => item.mapel === value);
                  setFormData({ ...formData, mataPelajaran: value, guru: selected?.guru });
              }}>
                <SelectTrigger id="mapel"><SelectValue placeholder="Pilih Mata Pelajaran" /></SelectTrigger>
                <SelectContent>
                  {daftarGuruDanMapel.map(item => <SelectItem key={item.mapel} value={item.mapel}>{item.mapel} ({item.guru})</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Batal</Button></DialogClose>
            <Button onClick={handleSave}>Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={!!jadwalToDelete} onOpenChange={() => setJadwalToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
            <AlertDialogDescription>Tindakan ini tidak dapat dibatalkan. Jadwal ini akan dihapus secara permanen.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Hapus</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );

    