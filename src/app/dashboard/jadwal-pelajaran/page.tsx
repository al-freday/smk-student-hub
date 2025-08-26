
"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Edit, Trash2, User, Shield, UserCog, Save, RefreshCw } from "lucide-react";
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

const getGradeLevel = (className: string) => {
    if (className.startsWith("X ")) return "Kelas X";
    if (className.startsWith("XI ")) return "Kelas XI";
    if (className.startsWith("XII ")) return "Kelas XII";
    return null;
};

const JADWAL_STORAGE_KEY = 'jadwalPelajaranData';

export default function JadwalPelajaranPage() {
  const { toast } = useToast();
  const [jadwal, setJadwal] = useState<Jadwal[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingJadwal, setEditingJadwal] = useState<Jadwal | null>(null);
  const [jadwalToDelete, setJadwalToDelete] = useState<Jadwal | null>(null);
  
  const [formData, setFormData] = useState<Partial<Jadwal>>({});
  const [waliKelasMap, setWaliKelasMap] = useState<{ [key: string]: string }>({});
  const [guruPiketMap, setGuruPiketMap] = useState<{ [key: string]: string[] }>({});
  const [guruBkMap, setGuruBkMap] = useState<{ [key: string]: string[] }>({});

  const loadData = () => {
    const savedJadwal = localStorage.getItem(JADWAL_STORAGE_KEY);
    setJadwal(savedJadwal ? JSON.parse(savedJadwal) : []);
    
    const savedTeachers = localStorage.getItem('teachersData');
    const teachersData = savedTeachers ? JSON.parse(savedTeachers) : {};
    
    const waliKelasList = teachersData.wali_kelas || [];
    const newWaliKelasMap: { [key: string]: string } = {};
    if (Array.isArray(waliKelasList)) {
        waliKelasList.forEach((wali: any) => {
            if (Array.isArray(wali.kelas)) {
                wali.kelas.forEach((kelas: string) => {
                    newWaliKelasMap[kelas] = wali.nama;
                });
            }
        });
    }
    setWaliKelasMap(newWaliKelasMap);

    const guruPiketList = teachersData.guru_piket || [];
    const newGuruPiketMap: { [key: string]: string[] } = {};
    if (Array.isArray(guruPiketList)) {
        guruPiketList.forEach((guru: any) => {
            if (Array.isArray(guru.hariPiket)) {
                guru.hariPiket.forEach((hari: string) => {
                    if (!newGuruPiketMap[hari]) {
                        newGuruPiketMap[hari] = [];
                    }
                    newGuruPiketMap[hari].push(guru.nama);
                });
            }
        });
    }
    setGuruPiketMap(newGuruPiketMap);
    
    const guruBkList = teachersData.guru_bk || [];
    const newGuruBkMap: { [key: string]: string[] } = {};
    if (Array.isArray(guruBkList)) {
        guruBkList.forEach((guru: any) => {
            if (guru.tugasKelas) {
                if (!newGuruBkMap[guru.tugasKelas]) {
                    newGuruBkMap[guru.tugasKelas] = [];
                }
                newGuruBkMap[guru.tugasKelas].push(guru.nama);
            }
        });
    }
    setGuruBkMap(newGuruBkMap);
    toast({ title: "Data Dimuat", description: "Data jadwal terbaru telah dimuat." });
  };
  
  useEffect(() => {
    loadData();
  }, []);
  
  const handleSaveChanges = () => {
    localStorage.setItem(JADWAL_STORAGE_KEY, JSON.stringify(jadwal));
    toast({
        title: "Perubahan Disimpan",
        description: "Semua perubahan pada jadwal pelajaran telah disimpan.",
    });
  };

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

  const handleSaveDialog = () => {
    if (formData.hari && formData.sesi && formData.kelas && formData.mataPelajaran && formData.guru) {
      if (editingJadwal) {
        setJadwal(jadwal.map(j => j.id === editingJadwal.id ? { ...editingJadwal, ...formData } as Jadwal : j));
        toast({ title: "Jadwal Diperbarui", description: "Jangan lupa simpan perubahan." });
      } else {
        const newJadwal: Jadwal = {
          id: jadwal.length > 0 ? Math.max(...jadwal.map(j => j.id)) + 1 : 1,
          ...formData,
        } as Jadwal;
        setJadwal([...jadwal, newJadwal]);
        toast({ title: "Jadwal Ditambahkan", description: "Jangan lupa simpan perubahan." });
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
      toast({ title: "Jadwal Dihapus", description: `Jadwal telah dihapus dari sesi ini.` });
      setJadwalToDelete(null);
    }
  };

  const jadwalByHari = daftarHari.map(hari => ({
    hari,
    jadwal: jadwal.filter(j => j.hari === hari),
    piket: guruPiketMap[hari] || [],
  }));

  return (
    <div className="flex-1 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Jadwal Pelajaran</h2>
          <p className="text-muted-foreground">Kelola jadwal pelajaran untuk setiap kelas.</p>
        </div>
        <div className="flex gap-2">
            <Button onClick={handleSaveChanges}><Save className="mr-2 h-4 w-4"/>Simpan Perubahan</Button>
            <Button variant="outline" onClick={loadData}><RefreshCw className="mr-2 h-4 w-4"/>Muat Ulang Data</Button>
        </div>
      </div>
       <div className="flex justify-end">
            <Button onClick={() => handleOpenDialog()}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Buat Jadwal Baru
            </Button>
       </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {jadwalByHari.map(({ hari, jadwal: jadwalHari, piket }) => (
          <Card key={hari}>
            <CardHeader>
              <CardTitle>{hari}</CardTitle>
              <CardDescription className="flex items-center gap-1.5 pt-1">
                 <Shield className="h-4 w-4" />
                 Guru Piket: {piket.length > 0 ? piket.join(', ') : 'Belum Ditentukan'}
              </CardDescription>
            </CardHeader>
            <CardContent>
                <Accordion type="multiple" className="w-full">
                  {daftarKelas.map(kelas => {
                    const jadwalKelas = jadwalHari.filter(j => j.kelas === kelas).sort((a,b) => a.sesi.localeCompare(b.sesi));
                    const waliKelas = waliKelasMap[kelas] || "Belum Ditentukan";
                    const gradeLevel = getGradeLevel(kelas);
                    const guruBk = gradeLevel ? guruBkMap[gradeLevel]?.join(', ') || "Belum Ditentukan" : "Belum Ditentukan";
                    
                    return (
                      <AccordionItem value={`${hari}-${kelas}`} key={`${hari}-${kelas}`}>
                        <AccordionTrigger>
                           <div>
                                <span className="font-semibold">{kelas}</span>
                                <div className="text-xs text-muted-foreground font-normal flex flex-col sm:flex-row sm:gap-4 items-start text-left">
                                    <p className="flex items-center gap-1.5"><User className="h-3 w-3" />Wali Kelas: {waliKelas}</p>
                                    <p className="flex items-center gap-1.5"><UserCog className="h-3 w-3" />Guru BK: {guruBk}</p>
                                </div>
                           </div>
                        </AccordionTrigger>
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
            <Button onClick={handleSaveDialog}>Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={!!jadwalToDelete} onOpenChange={() => setJadwalToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
            <AlertDialogDescription>Tindakan ini akan menghapus jadwal secara permanen setelah Anda menyimpan perubahan.</AlertDialogDescription>
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
