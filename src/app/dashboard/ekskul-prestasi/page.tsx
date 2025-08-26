
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusCircle, Edit, Trash2, Save, RefreshCw, Trophy, BookOpen } from "lucide-react";
import {
  Dialog,
  DialogContent,
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
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { ChevronsUpDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { getSourceData, updateSourceData } from "@/lib/data-manager";

// --- Interface Definitions ---
interface Siswa {
  id: number;
  nis: string;
  nama: string;
  kelas: string;
}

interface Ekskul {
  id: number;
  nama: string;
  pembina: string;
}

interface Prestasi {
  id: number;
  nis: string;
  namaSiswa: string;
  kelas: string;
  tanggal: string;
  deskripsi: string;
  tingkat: 'Sekolah' | 'Kabupaten' | 'Provinsi' | 'Nasional' | 'Internasional';
}

export default function EkskulPrestasiPage() {
  const { toast } = useToast();
  
  // Data States
  const [daftarEkskul, setDaftarEkskul] = useState<Ekskul[]>([]);
  const [daftarPrestasi, setDaftarPrestasi] = useState<Prestasi[]>([]);
  const [daftarSiswa, setDaftarSiswa] = useState<Siswa[]>([]);

  // Dialog & Form States
  const [isEkskulDialogOpen, setIsEkskulDialogOpen] = useState(false);
  const [editingEkskul, setEditingEkskul] = useState<Ekskul | null>(null);
  const [ekskulToDelete, setEkskulToDelete] = useState<Ekskul | null>(null);
  const [ekskulFormData, setEkskulFormData] = useState<Partial<Ekskul>>({});

  const [isPrestasiDialogOpen, setIsPrestasiDialogOpen] = useState(false);
  const [editingPrestasi, setEditingPrestasi] = useState<Prestasi | null>(null);
  const [prestasiToDelete, setPrestasiToDelete] = useState<Prestasi | null>(null);
  const [prestasiFormData, setPrestasiFormData] = useState<Partial<Prestasi>>({});
  const [selectedNis, setSelectedNis] = useState<string>("");

  const loadData = () => {
    setDaftarEkskul(getSourceData('ekskulData', []));
    setDaftarPrestasi(getSourceData('prestasiData', []));
    setDaftarSiswa(getSourceData('siswaData', []));
    toast({ title: "Data Dimuat", description: "Data ekskul dan prestasi telah dimuat." });
  };

  useEffect(() => {
    loadData();
    
    const handleDataChange = () => loadData();
    window.addEventListener('dataUpdated', handleDataChange);

    return () => {
      window.removeEventListener('dataUpdated', handleDataChange);
    };
  }, []);

  const handleSaveChanges = () => {
    updateSourceData('ekskulData', daftarEkskul);
    updateSourceData('prestasiData', daftarPrestasi);
    toast({ title: "Perubahan Disimpan", description: "Data ekskul dan prestasi telah disimpan." });
  };
  
  // --- EKSKUL HANDLERS ---
  const handleOpenEkskulDialog = (ekskul: Ekskul | null = null) => {
    setEditingEkskul(ekskul);
    setEkskulFormData(ekskul || {});
    setIsEkskulDialogOpen(true);
  };

  const handleSaveEkskul = () => {
    if (!ekskulFormData.nama || !ekskulFormData.pembina) {
        toast({ title: "Gagal", description: "Harap lengkapi semua kolom.", variant: "destructive" });
        return;
    }
    let updatedEkskul;
    if (editingEkskul) {
        updatedEkskul = daftarEkskul.map(e => e.id === editingEkskul.id ? { ...e, ...ekskulFormData } : e);
    } else {
        const newEkskul = { id: Date.now(), ...ekskulFormData } as Ekskul;
        updatedEkskul = [...daftarEkskul, newEkskul];
    }
    setDaftarEkskul(updatedEkskul);
    toast({ title: "Sukses", description: "Data ekskul diperbarui. Simpan perubahan untuk konfirmasi." });
    setIsEkskulDialogOpen(false);
  };
  
  const handleDeleteEkskul = () => {
      if (!ekskulToDelete) return;
      setDaftarEkskul(daftarEkskul.filter(e => e.id !== ekskulToDelete.id));
      toast({ title: "Ekskul Dihapus", description: `${ekskulToDelete.nama} dihapus dari sesi ini.` });
      setEkskulToDelete(null);
  };

  // --- PRESTASI HANDLERS ---
  const handleOpenPrestasiDialog = (prestasi: Prestasi | null = null) => {
    setEditingPrestasi(prestasi);
    setPrestasiFormData(prestasi || { tanggal: format(new Date(), 'yyyy-MM-dd') });
    setSelectedNis(prestasi?.nis || "");
    setIsPrestasiDialogOpen(true);
  };

  const handleSavePrestasi = () => {
    const siswa = daftarSiswa.find(s => s.nis === selectedNis);
    if (!siswa || !prestasiFormData.deskripsi || !prestasiFormData.tingkat || !prestasiFormData.tanggal) {
        toast({ title: "Gagal", description: "Harap lengkapi semua data prestasi.", variant: "destructive" });
        return;
    }
    
    const prestasiData: Omit<Prestasi, 'id'> = {
        nis: siswa.nis,
        namaSiswa: siswa.nama,
        kelas: siswa.kelas,
        tanggal: prestasiFormData.tanggal,
        deskripsi: prestasiFormData.deskripsi,
        tingkat: prestasiFormData.tingkat
    };

    let updatedPrestasi;
    if (editingPrestasi) {
        updatedPrestasi = daftarPrestasi.map(p => p.id === editingPrestasi.id ? { ...p, ...prestasiData } : p);
    } else {
        updatedPrestasi = [...daftarPrestasi, { id: Date.now(), ...prestasiData }];
    }
    setDaftarPrestasi(updatedPrestasi);
    toast({ title: "Sukses", description: "Data prestasi disimpan. Jangan lupa simpan perubahan." });
    setIsPrestasiDialogOpen(false);
  };

  const handleDeletePrestasi = () => {
    if (!prestasiToDelete) return;
    setDaftarPrestasi(daftarPrestasi.filter(p => p.id !== prestasiToDelete.id));
    toast({ title: "Prestasi Dihapus", description: `Catatan prestasi untuk ${prestasiToDelete.namaSiswa} telah dihapus.` });
    setPrestasiToDelete(null);
  };

  return (
    <div className="flex-1 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Manajemen Ekskul & Prestasi</h2>
          <p className="text-muted-foreground">Kelola kegiatan ekstrakurikuler dan catat prestasi siswa.</p>
        </div>
        <div className="flex gap-2">
            <Button onClick={handleSaveChanges}><Save className="mr-2 h-4 w-4"/>Simpan Perubahan</Button>
            <Button variant="outline" onClick={loadData}><RefreshCw className="mr-2 h-4 w-4"/>Muat Ulang Data</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* --- EKSKUL CARD --- */}
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="flex items-center gap-2"><BookOpen/> Ekstrakurikuler</CardTitle>
                    <CardDescription>Daftar ekskul yang tersedia.</CardDescription>
                </div>
                <Button size="sm" onClick={() => handleOpenEkskulDialog()}><PlusCircle className="mr-2 h-4 w-4" />Tambah</Button>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader><TableRow><TableHead>Nama Ekskul</TableHead><TableHead>Pembina</TableHead><TableHead className="text-right">Aksi</TableHead></TableRow></TableHeader>
                    <TableBody>
                        {daftarEkskul.length > 0 ? daftarEkskul.map(e => (
                            <TableRow key={e.id}>
                                <TableCell className="font-medium">{e.nama}</TableCell>
                                <TableCell>{e.pembina}</TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="icon" onClick={() => handleOpenEkskulDialog(e)}><Edit className="h-4 w-4" /></Button>
                                    <Button variant="ghost" size="icon" onClick={() => setEkskulToDelete(e)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                                </TableCell>
                            </TableRow>
                        )) : <TableRow><TableCell colSpan={3} className="text-center h-24">Belum ada data ekskul.</TableCell></TableRow>}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>

        {/* --- PRESTASI CARD --- */}
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="flex items-center gap-2"><Trophy/> Prestasi Siswa</CardTitle>
                    <CardDescription>Catatan prestasi akademik dan non-akademik.</CardDescription>
                </div>
                <Button size="sm" onClick={() => handleOpenPrestasiDialog()}><PlusCircle className="mr-2 h-4 w-4" />Tambah</Button>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader><TableRow><TableHead>Siswa</TableHead><TableHead>Prestasi</TableHead><TableHead>Tingkat</TableHead><TableHead className="text-right">Aksi</TableHead></TableRow></TableHeader>
                    <TableBody>
                        {daftarPrestasi.length > 0 ? daftarPrestasi.map(p => (
                            <TableRow key={p.id}>
                                <TableCell className="font-medium">{p.namaSiswa} <span className="text-muted-foreground">({p.kelas})</span></TableCell>
                                <TableCell>{p.deskripsi}</TableCell>
                                <TableCell>{p.tingkat}</TableCell>
                                <TableCell className="text-right">
                                     <Button variant="ghost" size="icon" onClick={() => handleOpenPrestasiDialog(p)}><Edit className="h-4 w-4" /></Button>
                                    <Button variant="ghost" size="icon" onClick={() => setPrestasiToDelete(p)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                                </TableCell>
                            </TableRow>
                        )) : <TableRow><TableCell colSpan={4} className="text-center h-24">Belum ada catatan prestasi.</TableCell></TableRow>}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
      </div>

      {/* Dialogs */}
      <Dialog open={isEkskulDialogOpen} onOpenChange={setIsEkskulDialogOpen}>
        <DialogContent className="sm:max-w-md">
            <DialogHeader><DialogTitle>{editingEkskul ? 'Edit' : 'Tambah'} Ekskul</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-4">
                <div className="space-y-2"><Label htmlFor="nama-ekskul">Nama Ekskul</Label><Input id="nama-ekskul" value={ekskulFormData.nama || ''} onChange={e => setEkskulFormData({...ekskulFormData, nama: e.target.value})}/></div>
                <div className="space-y-2"><Label htmlFor="pembina">Nama Pembina</Label><Input id="pembina" value={ekskulFormData.pembina || ''} onChange={e => setEkskulFormData({...ekskulFormData, pembina: e.target.value})}/></div>
            </div>
            <DialogFooter><DialogClose asChild><Button variant="outline">Batal</Button></DialogClose><Button onClick={handleSaveEkskul}>Simpan</Button></DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={isPrestasiDialogOpen} onOpenChange={setIsPrestasiDialogOpen}>
        <DialogContent className="sm:max-w-lg">
            <DialogHeader><DialogTitle>{editingPrestasi ? 'Edit' : 'Tambah'} Prestasi</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-4">
                <div className="space-y-2">
                    <Label>Siswa</Label>
                    <Popover>
                        <PopoverTrigger asChild><Button variant="outline" role="combobox" className="w-full justify-between">{selectedNis ? daftarSiswa.find(s => s.nis === selectedNis)?.nama : "Pilih siswa..."}<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50"/></Button></PopoverTrigger>
                        <PopoverContent className="w-[450px] p-0"><Command><CommandInput placeholder="Cari nama siswa..."/><CommandList><CommandEmpty>Siswa tidak ditemukan.</CommandEmpty><CommandGroup>{daftarSiswa.map(s => (<CommandItem key={s.nis} value={s.nama} onSelect={() => setSelectedNis(s.nis)}><Check className={cn("mr-2 h-4 w-4", selectedNis === s.nis ? "opacity-100" : "opacity-0")}/>{s.nama} ({s.kelas})</CommandItem>))}</CommandGroup></CommandList></Command></PopoverContent>
                    </Popover>
                </div>
                <div className="space-y-2"><Label htmlFor="deskripsi-prestasi">Deskripsi Prestasi</Label><Textarea id="deskripsi-prestasi" value={prestasiFormData.deskripsi || ''} onChange={e => setPrestasiFormData({...prestasiFormData, deskripsi: e.target.value})} placeholder="Contoh: Juara 1 Lomba Cerdas Cermat"/></div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2"><Label htmlFor="tingkat">Tingkat</Label><Input id="tingkat" value={prestasiFormData.tingkat || ''} onChange={e => setPrestasiFormData({...prestasiFormData, tingkat: e.target.value as any})} placeholder="Sekolah, Kabupaten, dll." /></div>
                    <div className="space-y-2"><Label htmlFor="tanggal">Tanggal</Label><Input id="tanggal" type="date" value={prestasiFormData.tanggal || ''} onChange={e => setPrestasiFormData({...prestasiFormData, tanggal: e.target.value})}/></div>
                </div>
            </div>
            <DialogFooter><DialogClose asChild><Button variant="outline">Batal</Button></DialogClose><Button onClick={handleSavePrestasi}>Simpan</Button></DialogFooter>
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={!!ekskulToDelete} onOpenChange={() => setEkskulToDelete(null)}>
        <AlertDialogContent>
            <AlertDialogHeader><AlertDialogTitle>Yakin ingin menghapus?</AlertDialogTitle><AlertDialogDescription>Tindakan ini akan menghapus ekskul {ekskulToDelete?.nama}.</AlertDialogDescription></AlertDialogHeader>
            <AlertDialogFooter><AlertDialogCancel>Batal</AlertDialogCancel><AlertDialogAction onClick={handleDeleteEkskul}>Hapus</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <AlertDialog open={!!prestasiToDelete} onOpenChange={() => setPrestasiToDelete(null)}>
        <AlertDialogContent>
            <AlertDialogHeader><AlertDialogTitle>Yakin ingin menghapus?</AlertDialogTitle><AlertDialogDescription>Tindakan ini akan menghapus catatan prestasi untuk {prestasiToDelete?.namaSiswa}.</AlertDialogDescription></AlertDialogHeader>
            <AlertDialogFooter><AlertDialogCancel>Batal</AlertDialogCancel><AlertDialogAction onClick={handleDeletePrestasi}>Hapus</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
