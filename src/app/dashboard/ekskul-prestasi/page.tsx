
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Edit, Trash2, BookOpen, Trophy, ChevronsUpDown, Check } from "lucide-react";
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { getSourceData, updateSourceData } from "@/lib/data-manager";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { id } from "date-fns/locale";

// --- Interface Definitions ---
interface Ekstrakurikuler {
  id: number;
  nama: string;
  kategori: string;
  pembina: string[];
}

interface Prestasi {
  id: number;
  tanggal: string;
  nis: string;
  namaSiswa: string;
  kelas: string;
  deskripsi: string;
  tingkat: 'Sekolah' | 'Kabupaten' | 'Provinsi' | 'Nasional' | 'Internasional';
  jenis: 'Akademik' | 'Non-Akademik';
}

interface Guru {
  id: number | string;
  nama: string;
}

interface Siswa {
  id: number;
  nis: string;
  nama: string;
  kelas: string;
}

const KATEGORI_EKSKUL = ["Kepemimpinan dan Kesiswaan", "Olahraga", "Seni dan Budaya", "Kerohanian", "Kejuruan/Bidang Tertentu", "Kegiatan Lain"];
const TINGKAT_PRESTASI = ['Sekolah', 'Kabupaten', 'Provinsi', 'Nasional', 'Internasional'];
const JENIS_PRESTASI = ['Akademik', 'Non-Akademik'];

export default function EkskulPrestasiPage() {
  const { toast } = useToast();

  // --- Data States ---
  const [daftarEkskul, setDaftarEkskul] = useState<Ekstrakurikuler[]>([]);
  const [daftarPrestasi, setDaftarPrestasi] = useState<Prestasi[]>([]);
  const [daftarGuru, setDaftarGuru] = useState<Guru[]>([]);
  const [daftarSiswa, setDaftarSiswa] = useState<Siswa[]>([]);
  
  // --- Dialog & Form States ---
  const [isEkskulDialogOpen, setIsEkskulDialogOpen] = useState(false);
  const [ekskulFormData, setEkskulFormData] = useState<Partial<Ekstrakurikuler>>({});
  const [editingEkskul, setEditingEkskul] = useState<Ekstrakurikuler | null>(null);
  const [ekskulToDelete, setEkskulToDelete] = useState<Ekstrakurikuler | null>(null);
  
  const [isPrestasiDialogOpen, setIsPrestasiDialogOpen] = useState(false);
  const [prestasiFormData, setPrestasiFormData] = useState<Partial<Prestasi>>({ tanggal: format(new Date(), 'yyyy-MM-dd') });
  const [editingPrestasi, setEditingPrestasi] = useState<Prestasi | null>(null);
  const [prestasiToDelete, setPrestasiToDelete] = useState<Prestasi | null>(null);
  const [popoverOpen, setPopoverOpen] = useState(false);

  const loadData = useCallback(() => {
    setDaftarEkskul(getSourceData('ekskulData', []));
    setDaftarPrestasi(getSourceData('prestasiData', []).sort((a: Prestasi, b: Prestasi) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime()));
    setDaftarSiswa(getSourceData('siswaData', []));

    const teachersData = getSourceData('teachersData', {});
    const { schoolInfo, ...roles } = teachersData;
    const allTeachers: Guru[] = [];
    Object.values(roles).forEach((role: any) => {
        if (Array.isArray(role)) {
            allTeachers.push(...role);
        }
    });
    // Remove duplicates based on ID, prioritizing first occurrence
    const uniqueTeachers = Array.from(new Map(allTeachers.map(item => [item['id'], item])).values());
    setDaftarGuru(uniqueTeachers);
  }, []);

  useEffect(() => {
    loadData();
    window.addEventListener('dataUpdated', loadData);
    return () => window.removeEventListener('dataUpdated', loadData);
  }, [loadData]);

  // --- Ekskul Handlers ---
  const handleOpenEkskulDialog = (ekskul: Ekstrakurikuler | null = null) => {
    setEditingEkskul(ekskul);
    setEkskulFormData(ekskul || { pembina: [] });
    setIsEkskulDialogOpen(true);
  };

  const handleSaveEkskul = () => {
    if (!ekskulFormData.nama || !ekskulFormData.kategori) {
      toast({ title: "Gagal", description: "Nama dan kategori ekskul harus diisi.", variant: "destructive" });
      return;
    }
    const currentData = getSourceData('ekskulData', []);
    let updatedData;
    if (editingEkskul) {
      updatedData = currentData.map((e: Ekstrakurikuler) => e.id === editingEkskul.id ? { ...e, ...ekskulFormData } : e);
    } else {
      const newId = currentData.length > 0 ? Math.max(...currentData.map((e: Ekstrakurikuler) => e.id)) + 1 : 1;
      updatedData = [...currentData, { ...ekskulFormData, id: newId }];
    }
    updateSourceData('ekskulData', updatedData);
    toast({ title: "Sukses", description: "Data ekstrakurikuler berhasil disimpan." });
    setIsEkskulDialogOpen(false);
  };

  const handleDeleteEkskul = () => {
    if (!ekskulToDelete) return;
    const updatedData = daftarEkskul.filter(e => e.id !== ekskulToDelete.id);
    updateSourceData('ekskulData', updatedData);
    toast({ title: "Dihapus", description: `Ekstrakurikuler ${ekskulToDelete.nama} telah dihapus.` });
    setEkskulToDelete(null);
  };

  // --- Prestasi Handlers ---
  const handleOpenPrestasiDialog = (prestasi: Prestasi | null = null) => {
    setEditingPrestasi(prestasi);
    setPrestasiFormData(prestasi || { tanggal: format(new Date(), 'yyyy-MM-dd') });
    setIsPrestasiDialogOpen(true);
  };

  const handleSavePrestasi = () => {
    const { tanggal, nis, deskripsi, tingkat, jenis } = prestasiFormData;
    if (!tanggal || !nis || !deskripsi || !tingkat || !jenis) {
      toast({ title: "Gagal", description: "Semua kolom prestasi harus diisi.", variant: "destructive" });
      return;
    }
    const siswa = daftarSiswa.find(s => s.nis === nis);
    if (!siswa) {
      toast({ title: "Gagal", description: "Siswa tidak ditemukan.", variant: "destructive" });
      return;
    }

    const currentData = getSourceData('prestasiData', []);
    let updatedData;
    const prestasiRecord = {
      ...prestasiFormData,
      namaSiswa: siswa.nama,
      kelas: siswa.kelas
    };

    if (editingPrestasi) {
      updatedData = currentData.map((p: Prestasi) => p.id === editingPrestasi.id ? { ...p, ...prestasiRecord } : p);
    } else {
      const newId = currentData.length > 0 ? Math.max(...currentData.map((p: Prestasi) => p.id)) + 1 : 1;
      updatedData = [...currentData, { ...prestasiRecord, id: newId }];
    }
    updateSourceData('prestasiData', updatedData);
    toast({ title: "Sukses", description: "Data prestasi siswa berhasil disimpan." });
    setIsPrestasiDialogOpen(false);
  };

  const handleDeletePrestasi = () => {
    if (!prestasiToDelete) return;
    const updatedData = daftarPrestasi.filter(p => p.id !== prestasiToDelete.id);
    updateSourceData('prestasiData', updatedData);
    toast({ title: "Dihapus", description: "Catatan prestasi telah dihapus." });
    setPrestasiToDelete(null);
  };

  return (
    <div className="flex-1 space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Manajemen Ekskul & Prestasi</h2>
        <p className="text-muted-foreground">Kelola kegiatan ekstrakurikuler dan catat prestasi siswa.</p>
      </div>

      <Tabs defaultValue="prestasi" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="prestasi"><Trophy className="mr-2 h-4 w-4"/>Manajemen Prestasi</TabsTrigger>
          <TabsTrigger value="ekskul"><BookOpen className="mr-2 h-4 w-4"/>Manajemen Ekstrakurikuler</TabsTrigger>
        </TabsList>
        
        <TabsContent value="prestasi" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row justify-between items-center">
              <div>
                <CardTitle>Daftar Prestasi Siswa</CardTitle>
                <CardDescription>Catat dan kelola pencapaian akademik maupun non-akademik siswa.</CardDescription>
              </div>
              <Button onClick={() => handleOpenPrestasiDialog()}>
                <PlusCircle className="mr-2 h-4 w-4"/>Catat Prestasi
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow><TableHead>Tanggal</TableHead><TableHead>Nama Siswa</TableHead><TableHead>Prestasi</TableHead><TableHead>Tingkat</TableHead><TableHead className="text-right">Aksi</TableHead></TableRow></TableHeader>
                <TableBody>
                  {daftarPrestasi.map(p => (
                    <TableRow key={p.id}>
                      <TableCell>{format(new Date(p.tanggal), "dd MMM yyyy", { locale: id })}</TableCell>
                      <TableCell className="font-medium">{p.namaSiswa} <span className="text-xs text-muted-foreground">({p.kelas})</span></TableCell>
                      <TableCell>{p.deskripsi}</TableCell>
                      <TableCell>{p.tingkat}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleOpenPrestasiDialog(p)}><Edit className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => setPrestasiToDelete(p)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ekskul" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row justify-between items-center">
              <div>
                <CardTitle>Daftar Ekstrakurikuler</CardTitle>
                <CardDescription>Kelola daftar ekskul yang tersedia di sekolah dan tentukan pembinanya.</CardDescription>
              </div>
              <Button onClick={() => handleOpenEkskulDialog()}>
                <PlusCircle className="mr-2 h-4 w-4"/>Tambah Ekskul
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow><TableHead>Nama Ekskul</TableHead><TableHead>Kategori</TableHead><TableHead>Pembina</TableHead><TableHead className="text-right">Aksi</TableHead></TableRow></TableHeader>
                <TableBody>
                  {daftarEkskul.map(e => (
                    <TableRow key={e.id}>
                      <TableCell className="font-medium">{e.nama}</TableCell>
                      <TableCell>{e.kategori}</TableCell>
                      <TableCell>{e.pembina.join(', ') || <span className="text-muted-foreground italic">Belum ada</span>}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleOpenEkskulDialog(e)}><Edit className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => setEkskulToDelete(e)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog Ekskul */}
      <Dialog open={isEkskulDialogOpen} onOpenChange={setIsEkskulDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editingEkskul ? 'Edit' : 'Tambah'} Ekstrakurikuler</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="nama">Nama Ekstrakurikuler</Label>
              <Input id="nama" value={ekskulFormData.nama || ''} onChange={e => setEkskulFormData({...ekskulFormData, nama: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="kategori">Kategori</Label>
              <Select value={ekskulFormData.kategori} onValueChange={(v) => setEkskulFormData({...ekskulFormData, kategori: v})}>
                <SelectTrigger><SelectValue placeholder="Pilih Kategori"/></SelectTrigger>
                <SelectContent>{KATEGORI_EKSKUL.map(k => <SelectItem key={k} value={k}>{k}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Pembina</Label>
               <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                <PopoverTrigger asChild>
                    <Button variant="outline" role="combobox" aria-expanded={popoverOpen} className="w-full justify-between">
                        {ekskulFormData.pembina && ekskulFormData.pembina.length > 0 ? ekskulFormData.pembina.join(', ') : "Pilih Pembina..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50"/>
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                    <Command>
                        <CommandInput placeholder="Cari guru..."/>
                        <CommandList>
                            <CommandEmpty>Guru tidak ditemukan.</CommandEmpty>
                            <CommandGroup>
                                {daftarGuru.map(guru => (
                                    <CommandItem
                                        key={guru.id}
                                        value={guru.nama}
                                        onSelect={(currentValue) => {
                                          setEkskulFormData(prev => {
                                              const currentPembina = prev.pembina || [];
                                              const guruName = daftarGuru.find(g => g.nama.toLowerCase() === currentValue)?.nama;
                                              if (!guruName) return prev;

                                              const newPembina = currentPembina.includes(guruName)
                                                  ? currentPembina.filter(p => p !== guruName)
                                                  : [...currentPembina, guruName];
                                              return {...prev, pembina: newPembina};
                                          });
                                        }}
                                    >
                                        <Check className={cn("mr-2 h-4 w-4", ekskulFormData.pembina?.includes(guru.nama) ? "opacity-100" : "opacity-0")}/>
                                        {guru.nama}
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Batal</Button></DialogClose>
            <Button onClick={handleSaveEkskul}>Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Dialog Prestasi */}
      <Dialog open={isPrestasiDialogOpen} onOpenChange={setIsPrestasiDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editingPrestasi ? 'Edit' : 'Catat'} Prestasi Siswa</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="tanggal">Tanggal</Label>
              <Input id="tanggal" type="date" value={prestasiFormData.tanggal || ''} onChange={e => setPrestasiFormData({...prestasiFormData, tanggal: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>Siswa</Label>
              <Select value={prestasiFormData.nis} onValueChange={v => setPrestasiFormData({...prestasiFormData, nis: v})}>
                <SelectTrigger><SelectValue placeholder="Pilih Siswa"/></SelectTrigger>
                <SelectContent>{daftarSiswa.map(s => <SelectItem key={s.nis} value={s.nis}>{s.nama} ({s.kelas})</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="deskripsi">Deskripsi Prestasi</Label>
              <Input id="deskripsi" placeholder="Contoh: Juara 1 LKS Web Design" value={prestasiFormData.deskripsi || ''} onChange={e => setPrestasiFormData({...prestasiFormData, deskripsi: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Jenis</Label>
                    <Select value={prestasiFormData.jenis} onValueChange={(v: any) => setPrestasiFormData({...prestasiFormData, jenis: v})}>
                        <SelectTrigger><SelectValue placeholder="Pilih Jenis"/></SelectTrigger>
                        <SelectContent>{JENIS_PRESTASI.map(j => <SelectItem key={j} value={j}>{j}</SelectItem>)}</SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label>Tingkat</Label>
                     <Select value={prestasiFormData.tingkat} onValueChange={(v: any) => setPrestasiFormData({...prestasiFormData, tingkat: v})}>
                        <SelectTrigger><SelectValue placeholder="Pilih Tingkat"/></SelectTrigger>
                        <SelectContent>{TINGKAT_PRESTASI.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                    </Select>
                </div>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Batal</Button></DialogClose>
            <Button onClick={handleSavePrestasi}>Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Alert Dialogs */}
      <AlertDialog open={!!ekskulToDelete} onOpenChange={() => setEkskulToDelete(null)}>
          <AlertDialogContent>
              <AlertDialogHeader><AlertDialogTitle>Yakin ingin menghapus?</AlertDialogTitle><AlertDialogDescription>Tindakan ini akan menghapus data ekskul secara permanen.</AlertDialogDescription></AlertDialogHeader>
              <AlertDialogFooter><AlertDialogCancel>Batal</AlertDialogCancel><AlertDialogAction onClick={handleDeleteEkskul}>Hapus</AlertDialogAction></AlertDialogFooter>
          </AlertDialogContent>
      </AlertDialog>
      <AlertDialog open={!!prestasiToDelete} onOpenChange={() => setPrestasiToDelete(null)}>
          <AlertDialogContent>
              <AlertDialogHeader><AlertDialogTitle>Yakin ingin menghapus?</AlertDialogTitle><AlertDialogDescription>Tindakan ini akan menghapus catatan prestasi ini secara permanen.</AlertDialogDescription></AlertDialogHeader>
              <AlertDialogFooter><AlertDialogCancel>Batal</AlertDialogCancel><AlertDialogAction onClick={handleDeletePrestasi}>Hapus</AlertDialogAction></AlertDialogFooter>
          </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
