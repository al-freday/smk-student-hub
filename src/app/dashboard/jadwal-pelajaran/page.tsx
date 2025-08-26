
"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Edit, Trash2 } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
  sesi: string;
  kelas: string;
  mataPelajaran: string;
  guru: string;
}

const daftarHari = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat"];

const daftarKelas = [
  "X OT 1", "X OT 2", "X OT 3", "X TKR", "X AKL", "X TM",
  "XI TAB 1", "XI TAB 2", "XI TKR", "XI AKL", "XI TM",
  "XII TAB 1", "XII TAB 2", "XII TKR", "XII AKL", "XII TM"
];

const daftarGuruDanMapel = Array.from({ length: 40 }, (_, i) => ({ 
    guru: `Guru Mapel ${i + 1}`, 
    mapel: `Mapel ${i + 1}` 
}));

const sesiPelajaran = [
    { id: "I", label: "Sesi I" }, { id: "II", label: "Sesi II" },
    { id: "III", label: "Sesi III" }, { id: "IV", label: "Sesi IV" },
    { id: "V", label: "Sesi V" }, { id: "VI", label: "Sesi VI" },
    { id: "VII", label: "Sesi VII" }, { id: "VIII", label: "Sesi VIII" },
    { id: "IX", label: "Sesi IX" }, { id: "X", label: "Sesi X" },
];

export default function JadwalPelajaranPage() {
  const { toast } = useToast();
  const [jadwal, setJadwal] = useState<Jadwal[]>([
    { id: 1, hari: "Senin", sesi: "I", kelas: "X OT 1", mataPelajaran: "Mapel 1", guru: "Guru Mapel 1" },
    { id: 2, hari: "Senin", sesi: "II", kelas: "X OT 1", mataPelajaran: "Mapel 2", guru: "Guru Mapel 2" },
    { id: 3, hari: "Selasa", sesi: "III", kelas: "XI AKL", mataPelajaran: "Mapel 5", guru: "Guru Mapel 5" },
  ]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingJadwal, setEditingJadwal] = useState<Jadwal | null>(null);
  const [jadwalToDelete, setJadwalToDelete] = useState<Jadwal | null>(null);
  
  const [formData, setFormData] = useState<Partial<Jadwal>>({});

  const resetForm = () => {
    setFormData({});
    setEditingJadwal(null);
  };

  const handleOpenDialog = (jadwalItem: Jadwal | null = null, defaultValues: Partial<Jadwal> = {}) => {
    if (jadwalItem) {
      setEditingJadwal(jadwalItem);
      setFormData(jadwalItem);
    } else {
      resetForm();
      setFormData(defaultValues);
    }
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (formData.hari && formData.sesi && formData.kelas && formData.mataPelajaran && formData.guru) {
      if (editingJadwal) {
        setJadwal(jadwal.map(j => j.id === editingJadwal.id ? { ...editingJadwal, ...formData } as Jadwal : j));
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
      toast({ title: "Dihapus", description: `Jadwal telah dihapus.` });
      setJadwalToDelete(null);
    }
  };

  const jadwalByHari = daftarHari.map(hari => ({
    hari,
    jadwal: jadwal.filter(j => j.hari === hari),
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

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {jadwalByHari.map(({ hari, jadwal: jadwalHari }) => (
          <Card key={hari}>
            <CardHeader>
              <CardTitle>{hari}</CardTitle>
            </CardHeader>
            <CardContent>
                <Accordion type="multiple" className="w-full">
                  {daftarKelas.map(kelas => {
                    const jadwalKelas = jadwalHari.filter(j => j.kelas === kelas).sort((a,b) => a.sesi.localeCompare(b.sesi));
                    
                    return (
                      <AccordionItem value={`${hari}-${kelas}`} key={`${hari}-${kelas}`}>
                        <AccordionTrigger>{kelas}</AccordionTrigger>
                        <AccordionContent>
                            <div className="flex justify-end mb-2">
                                <Button variant="outline" size="sm" onClick={() => handleOpenDialog(null, { hari, kelas })}>
                                    <PlusCircle className="mr-2 h-4 w-4" />
                                    Tambah Jadwal
                                </Button>
                            </div>
                          {jadwalKelas.length > 0 ? (
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Jam Ke-</TableHead>
                                  <TableHead>Mata Pelajaran</TableHead>
                                  <TableHead>Guru</TableHead>
                                  <TableHead className="text-right">Aksi</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {jadwalKelas.map((j) => (
                                  <TableRow key={j.id}>
                                    <TableCell className="font-medium text-center">{j.sesi}</TableCell>
                                    <TableCell>{j.mataPelajaran}</TableCell>
                                    <TableCell>{j.guru}</TableCell>
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
                            <div className="text-center text-sm text-muted-foreground py-4">
                                <p>Belum ada jadwal untuk kelas ini.</p>
                            </div>
                           )}
                        </AccordionContent>
                      </AccordionItem>
                    );
                  })}
                </Accordion>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={(isOpen) => { setIsDialogOpen(isOpen); if (!isOpen) resetForm(); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingJadwal ? "Edit Jadwal" : "Buat Jadwal Baru"}</DialogTitle>
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
              <Label htmlFor="kelas">Kelas</Label>
              <Select value={formData.kelas} onValueChange={value => setFormData({ ...formData, kelas: value })}>
                <SelectTrigger id="kelas"><SelectValue placeholder="Pilih Kelas" /></SelectTrigger>
                <SelectContent>{daftarKelas.map(k => <SelectItem key={k} value={k}>{k}</SelectItem>)}</SelectContent>
              </Select>
            </div>
             <div className="space-y-2">
                <Label htmlFor="jam">Sesi Jam Pelajaran</Label>
                <Select value={formData.sesi} onValueChange={value => setFormData({ ...formData, sesi: value })}>
                    <SelectTrigger id="jam"><SelectValue placeholder="Pilih Sesi" /></SelectTrigger>
                    <SelectContent>
                        {sesiPelajaran.map(sesi => (
                            <SelectItem key={sesi.id} value={sesi.id}>
                                {sesi.label} ({sesi.id})
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="mapel">Mata Pelajaran & Guru</Label>
              <Select onValueChange={value => {
                  const selected = daftarGuruDanMapel.find(item => item.mapel === value);
                  setFormData({ ...formData, mataPelajaran: value, guru: selected?.guru });
              }} value={formData.mataPelajaran}>
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
}
