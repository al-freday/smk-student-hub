
"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusCircle, Edit, Trash2, MoreHorizontal, User, Check, ChevronsUpDown, BookOpen, Trophy } from "lucide-react";
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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { getSourceData, updateSourceData } from "@/lib/data-manager";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { initialEkskulData } from "@/lib/ekskul-data";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

// --- Interface Definitions ---
interface Siswa {
  id: number;
  nis: string;
  nama: string;
  kelas: string;
}

interface Guru {
  id: string; // uniqueId, e.g., "wali_kelas-1"
  nama: string;
}

interface Kelas {
  id: number;
  nama: string;
}

interface Ekstrakurikuler {
  id: number;
  nama: string;
  kategori: string;
  pembina: string[];
  anggota: string[]; // NIS siswa
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
  guruPendamping?: string;
}

const kategoriEkskul = [
    "Kepemimpinan dan Kesiswaan",
    "Olahraga",
    "Seni dan Budaya",
    "Kerohanian",
    "Kejuruan/Bidang Tertentu",
    "Kegiatan Lain",
];

const tingkatPrestasi = ['Sekolah', 'Kabupaten', 'Provinsi', 'Nasional', 'Internasional'];
const jenisPrestasi = ['Akademik', 'Non-Akademik'];

export default function EkskulPrestasiPage() {
  const { toast } = useToast();

  // --- Data States ---
  const [daftarEkskul, setDaftarEkskul] = useState<Ekstrakurikuler[]>([]);
  const [daftarPrestasi, setDaftarPrestasi] = useState<Prestasi[]>([]);
  const [daftarGuru, setDaftarGuru] = useState<Guru[]>([]);
  const [daftarSiswa, setDaftarSiswa] = useState<Siswa[]>([]);
  const [daftarKelas, setDaftarKelas] = useState<Kelas[]>([]);

  // --- Dialog & Form States ---
  const [isEkskulDialogOpen, setIsEkskulDialogOpen] = useState(false);
  const [editingEkskul, setEditingEkskul] = useState<Ekstrakurikuler | null>(null);
  const [ekskulToDelete, setEkskulToDelete] = useState<Ekstrakurikuler | null>(null);
  const [ekskulFormData, setEkskulFormData] = useState<Partial<Ekstrakurikuler>>({ pembina: [], anggota: [] });
  const [selectedKelasAnggota, setSelectedKelasAnggota] = useState<string>("");
  
  const [isPrestasiDialogOpen, setIsPrestasiDialogOpen] = useState(false);
  const [editingPrestasi, setEditingPrestasi] = useState<Prestasi | null>(null);
  const [prestasiToDelete, setPrestasiToDelete] = useState<Prestasi | null>(null);
  const [prestasiFormData, setPrestasiFormData] = useState<Partial<Prestasi>>({});
  const [isPembinaPopoverOpen, setIsPembinaPopoverOpen] = useState(false);

  const loadData = useCallback(() => {
    let ekskulData = getSourceData('ekskulData', null);
    
    if (!ekskulData || !Array.isArray(ekskulData) || ekskulData.some((e: any) => typeof e.id === 'undefined')) {
        ekskulData = initialEkskulData;
        updateSourceData('ekskulData', ekskulData);
    }
    setDaftarEkskul(ekskulData.map((e: any) => ({ ...e, anggota: e.anggota || [] }))); // Ensure anggota array exists
    
    setDaftarPrestasi(getSourceData('prestasiData', []));
    setDaftarSiswa(getSourceData('siswaData', []));
    setDaftarKelas(getSourceData('kelasData', []));
    
    const teachersData = getSourceData('teachersData', {});
    const allGurus: Guru[] = [];
    if(teachersData){
        const { schoolInfo, ...roles } = teachersData;
        Object.keys(roles).forEach(roleKey => {
            if(Array.isArray(roles[roleKey])) {
                roles[roleKey].forEach((guru: any) => {
                    allGurus.push({
                        id: `${roleKey}-${guru.id}`,
                        nama: guru.nama
                    });
                });
            }
        });
    }
    setDaftarGuru(allGurus);
  }, []);

  useEffect(() => {
    loadData();
    window.addEventListener('dataUpdated', loadData);
    return () => window.removeEventListener('dataUpdated', loadData);
  }, [loadData]);

  // --- Ekskul Handlers ---
  const handleOpenEkskulDialog = (ekskul: Ekstrakurikuler | null = null) => {
    setEditingEkskul(ekskul);
    setEkskulFormData(ekskul || { nama: "", kategori: "", pembina: [], anggota: [] });
    setSelectedKelasAnggota("");
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
      const newId = currentData.length > 0 ? Math.max(...currentData.map((e: Ekstrakurikuler) => e.id)) + 1 : Date.now();
      updatedData = [...currentData, { ...ekskulFormData, id: newId, anggota: ekskulFormData.anggota || [] }];
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
    setPrestasiFormData(prestasi || { tanggal: format(new Date(), "yyyy-MM-dd") });
    setIsPrestasiDialogOpen(true);
  };
  
  const handleSavePrestasi = () => {
    if (!prestasiFormData.nis || !prestasiFormData.deskripsi || !prestasiFormData.tingkat || !prestasiFormData.jenis) {
        toast({ title: "Gagal", description: "Semua field harus diisi.", variant: "destructive" });
        return;
    }
    
    const siswaTerpilih = daftarSiswa.find(s => s.nis === prestasiFormData.nis);
    if (!siswaTerpilih) {
        toast({ title: "Gagal", description: "Siswa tidak valid.", variant: "destructive" });
        return;
    }

    const dataToSave = {
        ...prestasiFormData,
        namaSiswa: siswaTerpilih.nama,
        kelas: siswaTerpilih.kelas,
    };

    const currentData = getSourceData('prestasiData', []);
    let updatedData;
    if (editingPrestasi) {
      updatedData = currentData.map((p: Prestasi) => p.id === editingPrestasi.id ? { ...p, ...dataToSave } : p);
    } else {
      const newId = currentData.length > 0 ? Math.max(...currentData.map((p: Prestasi) => p.id)) + 1 : 1;
      updatedData = [...currentData, { ...dataToSave, id: newId }];
    }
    updateSourceData('prestasiData', updatedData);
    toast({ title: "Sukses", description: "Data prestasi siswa berhasil disimpan." });
    setIsPrestasiDialogOpen(false);
  };

  const handleDeletePrestasi = () => {
    if (!prestasiToDelete) return;
    const updatedData = daftarPrestasi.filter(p => p.id !== prestasiToDelete.id);
    updateSourceData('prestasiData', updatedData);
    toast({ title: "Dihapus", description: `Prestasi ${prestasiToDelete.namaSiswa} telah dihapus.` });
    setPrestasiToDelete(null);
  };

  const siswaDiKelas = useMemo(() => {
    if (!selectedKelasAnggota) return [];
    return daftarSiswa.filter(s => s.kelas === selectedKelasAnggota);
  }, [selectedKelasAnggota, daftarSiswa]);

  return (
    <div className="flex-1 space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Manajemen Ekskul &amp; Prestasi</h2>
        <p className="text-muted-foreground">Kelola kegiatan ekstrakurikuler dan catat prestasi siswa.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* --- EKSKUL CARD --- */}
        <Card>
          <CardHeader className="flex flex-row justify-between items-center">
            <div>
                <CardTitle className="flex items-center gap-2"><BookOpen/> Manajemen Ekstrakurikuler</CardTitle>
                <CardDescription>Tambah, edit, atau hapus data ekskul.</CardDescription>
            </div>
            <Button onClick={() => handleOpenEkskulDialog()}><PlusCircle className="mr-2 h-4 w-4"/> Tambah</Button>
          </CardHeader>
          <CardContent>
            {daftarEkskul.length > 0 ? (
                <Accordion type="single" collapsible className="w-full">
                    {daftarEkskul.map(e => (
                        <AccordionItem value={String(e.id)} key={e.id} className="border-b">
                            <div className="flex items-center pr-4">
                                <AccordionTrigger className="hover:no-underline flex-1">
                                    <div className="flex-1 text-left">
                                        <p className="font-medium">{e.nama}</p>
                                        <p className="text-xs text-muted-foreground">{e.kategori}</p>
                                    </div>
                                    <div className="flex items-center gap-4 pr-4">
                                         <Badge variant="secondary">{Array.isArray(e.pembina) ? e.pembina.length : 0} Pembina</Badge>
                                        <Badge variant="outline">{Array.isArray(e.anggota) ? e.anggota.length : 0} Anggota</Badge>
                                    </div>
                                </AccordionTrigger>
                                <div onClick={(event) => event.stopPropagation()}>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4"/></Button></DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => handleOpenEkskulDialog(e)}><Edit className="mr-2 h-4 w-4"/>Edit</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => setEkskulToDelete(e)} className="text-destructive"><Trash2 className="mr-2 h-4 w-4"/>Hapus</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>
                            <AccordionContent>
                                <div className="space-y-2 pt-2">
                                    <h4 className="font-semibold text-sm">Pembina:</h4>
                                    <p className="text-sm text-muted-foreground">{(e.pembina && e.pembina.length > 0) ? e.pembina.join(', ') : 'Belum ada pembina'}</p>
                                    <h4 className="font-semibold text-sm mt-2">Anggota:</h4>
                                    <p className="text-sm text-muted-foreground">
                                        {(e.anggota && e.anggota.length > 0) ? e.anggota.map(nis => daftarSiswa.find(s => s.nis === nis)?.nama || 'Siswa tidak ditemukan').join(', ') : 'Belum ada anggota'}
                                    </p>
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            ) : (
                <div className="text-center h-24 flex items-center justify-center">Belum ada data ekskul.</div>
            )}
          </CardContent>
        </Card>

        {/* --- PRESTASI CARD --- */}
        <Card>
          <CardHeader className="flex flex-row justify-between items-center">
            <div>
                <CardTitle className="flex items-center gap-2"><Trophy/> Manajemen Prestasi Siswa</CardTitle>
                <CardDescription>Catat pencapaian akademik dan non-akademik.</CardDescription>
            </div>
             <Button onClick={() => handleOpenPrestasiDialog()}><PlusCircle className="mr-2 h-4 w-4"/> Catat Prestasi</Button>
          </CardHeader>
          <CardContent>
             <Table>
                <TableHeader><TableRow><TableHead>Nama Siswa</TableHead><TableHead>Prestasi</TableHead><TableHead className="text-right">Aksi</TableHead></TableRow></TableHeader>
                <TableBody>
                    {daftarPrestasi.length > 0 ? daftarPrestasi.map(p => (
                        <TableRow key={p.id}>
                            <TableCell>
                                <p className="font-medium">{p.namaSiswa}</p>
                                <p className="text-xs text-muted-foreground">{p.kelas} | {format(new Date(p.tanggal), "dd/MM/yy")}</p>
                            </TableCell>
                            <TableCell>
                                <p>{p.deskripsi}</p>
                                <div className="flex gap-1 mt-1 flex-wrap">
                                    <Badge variant="secondary">{p.jenis}</Badge>
                                    <Badge>{p.tingkat}</Badge>
                                    {p.guruPendamping && <Badge variant="outline">{p.guruPendamping}</Badge>}
                                </div>
                            </TableCell>
                            <TableCell className="text-right">
                                <DropdownMenu>
                                <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4"/></Button></DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => handleOpenPrestasiDialog(p)}><Edit className="mr-2 h-4 w-4"/>Edit</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setPrestasiToDelete(p)} className="text-destructive"><Trash2 className="mr-2 h-4 w-4"/>Hapus</DropdownMenuItem>
                                </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    )) : (
                        <TableRow key="no-data-prestasi"><TableCell colSpan={3} className="text-center h-24">Belum ada data prestasi.</TableCell></TableRow>
                    )}
                </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Dialog Ekskul */}
      <Dialog open={isEkskulDialogOpen} onOpenChange={setIsEkskulDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
            <DialogHeader><DialogTitle>{editingEkskul ? 'Edit' : 'Tambah'} Ekstrakurikuler</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-4">
                <div className="space-y-2">
                    <Label htmlFor="nama-ekskul">Nama Ekstrakurikuler</Label>
                    <Input id="nama-ekskul" value={ekskulFormData.nama || ''} onChange={(e) => setEkskulFormData({...ekskulFormData, nama: e.target.value})} />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="kategori-ekskul">Kategori</Label>
                    <Select value={ekskulFormData.kategori} onValueChange={(v) => setEkskulFormData({...ekskulFormData, kategori: v})}>
                        <SelectTrigger id="kategori-ekskul"><SelectValue placeholder="Pilih Kategori"/></SelectTrigger>
                        <SelectContent>{kategoriEkskul.map(k => <SelectItem key={k} value={k}>{k}</SelectItem>)}</SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label>Pilih Pembina</Label>
                    <Popover open={isPembinaPopoverOpen} onOpenChange={setIsPembinaPopoverOpen}>
                        <PopoverTrigger asChild>
                            <Button variant="outline" role="combobox" className="w-full justify-between h-auto min-h-10">
                                <span className="flex flex-wrap gap-1">
                                    {ekskulFormData.pembina?.length ? ekskulFormData.pembina.map(p => <Badge key={p}>{p}</Badge>) : "Pilih pembina..."}
                                </span>
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50"/>
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0">
                            <Command>
                                <CommandInput placeholder="Cari nama guru..."/>
                                <CommandList>
                                    <CommandEmpty>Guru tidak ditemukan.</CommandEmpty>
                                    <CommandGroup>
                                        {daftarGuru.map(guru => (
                                            <CommandItem
                                                key={guru.id}
                                                value={guru.nama}
                                                onSelect={() => {
                                                    const isSelected = ekskulFormData.pembina?.includes(guru.nama);
                                                    setEkskulFormData(prev => {
                                                        const prevPembina = prev.pembina || [];
                                                        if (isSelected) {
                                                            return { ...prev, pembina: prevPembina.filter(p => p !== guru.nama) };
                                                        } else {
                                                            return { ...prev, pembina: [...prevPembina, guru.nama] };
                                                        }
                                                    });
                                                    setIsPembinaPopoverOpen(false);
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
                <div className="space-y-2">
                    <Label>Pilih Anggota Siswa</Label>
                    <div className="grid grid-cols-2 gap-4">
                        <Select value={selectedKelasAnggota} onValueChange={setSelectedKelasAnggota}>
                            <SelectTrigger><SelectValue placeholder="Pilih Kelas Dulu"/></SelectTrigger>
                            <SelectContent>
                                {daftarKelas.map(k => <SelectItem key={k.id} value={k.nama}>{k.nama}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" role="combobox" className="w-full justify-between h-auto min-h-10" disabled={!selectedKelasAnggota}>
                                    <span className="flex flex-wrap gap-1">
                                        {ekskulFormData.anggota?.length ? `${ekskulFormData.anggota.length} siswa terpilih` : "Pilih anggota..."}
                                    </span>
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50"/>
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-full p-0">
                                <Command>
                                    <CommandInput placeholder="Cari nama siswa..."/>
                                    <CommandList>
                                        <CommandEmpty>Siswa tidak ditemukan.</CommandEmpty>
                                        <CommandGroup>
                                            {siswaDiKelas.map(siswa => (
                                                <CommandItem
                                                    key={siswa.nis}
                                                    value={siswa.nama}
                                                    onSelect={() => {
                                                        const isSelected = ekskulFormData.anggota?.includes(siswa.nis);
                                                        setEkskulFormData(prev => {
                                                            const prevAnggota = prev.anggota || [];
                                                            if (isSelected) {
                                                                return { ...prev, anggota: prevAnggota.filter(nis => nis !== siswa.nis) };
                                                            } else {
                                                                return { ...prev, anggota: [...prevAnggota, siswa.nis] };
                                                            }
                                                        });
                                                    }}
                                                >
                                                    <Check className={cn("mr-2 h-4 w-4", ekskulFormData.anggota?.includes(siswa.nis) ? "opacity-100" : "opacity-0")}/>
                                                    {siswa.nama}
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                    </div>
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
        <DialogContent className="sm:max-w-lg">
            <DialogHeader><DialogTitle>{editingPrestasi ? 'Edit' : 'Catat'} Prestasi Siswa</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-4">
                 <div className="space-y-2">
                    <Label>Pilih Siswa</Label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" role="combobox" className="w-full justify-between">
                                {prestasiFormData.nis ? daftarSiswa.find(s => s.nis === prestasiFormData.nis)?.nama : "Cari dan pilih siswa..."}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50"/>
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[450px] p-0">
                            <Command>
                                <CommandInput placeholder="Ketik nama siswa..."/>
                                <CommandList>
                                    <CommandEmpty>Siswa tidak ditemukan.</CommandEmpty>
                                    <CommandGroup>
                                        {daftarSiswa.map(siswa => (
                                            <CommandItem key={siswa.nis} value={siswa.nama} onSelect={() => setPrestasiFormData({...prestasiFormData, nis: siswa.nis})}>
                                                <Check className={cn("mr-2 h-4 w-4", prestasiFormData.nis === siswa.nis ? "opacity-100" : "opacity-0")}/>
                                                {siswa.nama} ({siswa.kelas})
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                </CommandList>
                            </Command>
                        </PopoverContent>
                    </Popover>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="deskripsi-prestasi">Deskripsi Prestasi</Label>
                    <Textarea id="deskripsi-prestasi" value={prestasiFormData.deskripsi || ''} onChange={e => setPrestasiFormData({...prestasiFormData, deskripsi: e.target.value})} placeholder="Contoh: Juara 1 Lomba Cerdas Cermat"/>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="jenis-prestasi">Jenis Prestasi</Label>
                        <Select value={prestasiFormData.jenis} onValueChange={(v: 'Akademik' | 'Non-Akademik') => setPrestasiFormData({...prestasiFormData, jenis: v})}>
                            <SelectTrigger id="jenis-prestasi"><SelectValue placeholder="Pilih Jenis"/></SelectTrigger>
                            <SelectContent>{jenisPrestasi.map(j => <SelectItem key={j} value={j}>{j}</SelectItem>)}</SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="tingkat-prestasi">Tingkat</Label>
                        <Select value={prestasiFormData.tingkat} onValueChange={(v) => setPrestasiFormData({...prestasiFormData, tingkat: v as any})}>
                            <SelectTrigger id="tingkat-prestasi"><SelectValue placeholder="Pilih Tingkat"/></SelectTrigger>
                            <SelectContent>{tingkatPrestasi.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                        </Select>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="tanggal-prestasi">Tanggal Pencapaian</Label>
                        <Input id="tanggal-prestasi" type="date" value={prestasiFormData.tanggal || ''} onChange={e => setPrestasiFormData({...prestasiFormData, tanggal: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="guru-pendamping">Guru Pendamping (Opsional)</Label>
                        <Select value={prestasiFormData.guruPendamping} onValueChange={(v) => setPrestasiFormData({...prestasiFormData, guruPendamping: v})}>
                            <SelectTrigger id="guru-pendamping"><SelectValue placeholder="Pilih Guru"/></SelectTrigger>
                            <SelectContent>{daftarGuru.map(g => <SelectItem key={g.id} value={g.nama}>{g.nama}</SelectItem>)}</SelectContent>
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
      
      {/* Alert Dialogs for Deletion */}
      <AlertDialog open={!!ekskulToDelete} onOpenChange={() => setEkskulToDelete(null)}>
        <AlertDialogContent>
            <AlertDialogHeader><AlertDialogTitle>Yakin ingin menghapus?</AlertDialogTitle><AlertDialogDescription>Tindakan ini akan menghapus ekskul "{ekskulToDelete?.nama}" secara permanen.</AlertDialogDescription></AlertDialogHeader>
            <AlertDialogFooter><AlertDialogCancel>Batal</Button></AlertDialogCancel><AlertDialogAction onClick={handleDeleteEkskul}>Hapus</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
       <AlertDialog open={!!prestasiToDelete} onOpenChange={() => setPrestasiToDelete(null)}>
        <AlertDialogContent>
            <AlertDialogHeader><AlertDialogTitle>Yakin ingin menghapus?</AlertDialogTitle><AlertDialogDescription>Tindakan ini akan menghapus data prestasi milik {prestasiToDelete?.namaSiswa}.</AlertDialogDescription></AlertDialogHeader>
            <AlertDialogFooter><AlertDialogCancel>Batal</Button></AlertDialogCancel><AlertDialogAction onClick={handleDeletePrestasi}>Hapus</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}
