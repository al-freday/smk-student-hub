
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Edit, Trash2, Save, RefreshCw, Trophy, BookOpen, X, UserPlus, Users } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { initialEkskulData } from "@/lib/ekskul-data";

// --- Interface Definitions ---
interface Siswa {
  id: number;
  nis: string;
  nama: string;
  kelas: string;
}

interface EkskulItem {
  id: number;
  nama: string;
  pembina: string[];
}

interface EkskulKategori {
  nama: string;
  items: EkskulItem[];
}

interface Prestasi {
  id: number;
  siswa: { nis: string, nama: string, kelas: string }[];
  tanggal: string;
  deskripsi: string;
  tingkat: 'Sekolah' | 'Kabupaten' | 'Provinsi' | 'Nasional' | 'Internasional';
}

export default function EkskulPrestasiPage() {
  const { toast } = useToast();
  
  // Data States
  const [daftarEkskul, setDaftarEkskul] = useState<EkskulKategori[]>([]);
  const [daftarPrestasi, setDaftarPrestasi] = useState<Prestasi[]>([]);
  const [daftarSiswa, setDaftarSiswa] = useState<Siswa[]>([]);
  const [daftarGuru, setDaftarGuru] = useState<string[]>([]);


  // Dialog & Form States
  const [isEkskulDialogOpen, setIsEkskulDialogOpen] = useState(false);
  const [editingEkskul, setEditingEkskul] = useState<{ item: EkskulItem, kategori: string } | null>(null);
  const [ekskulToDelete, setEkskulToDelete] = useState<{ item: EkskulItem, kategori: string } | null>(null);
  const [ekskulFormData, setEkskulFormData] = useState<{ nama?: string, pembina?: string[], kategori?: string }>({});

  const [isPrestasiDialogOpen, setIsPrestasiDialogOpen] = useState(false);
  const [editingPrestasi, setEditingPrestasi] = useState<Prestasi | null>(null);
  const [prestasiToDelete, setPrestasiToDelete] = useState<Prestasi | null>(null);
  const [prestasiFormData, setPrestasiFormData] = useState<Partial<Prestasi>>({ siswa: [] });
  const [selectedSiswa, setSelectedSiswa] = useState<Siswa[]>([]);

  const loadData = () => {
    const savedEkskul = getSourceData('ekskulData', null);
    if (savedEkskul) {
        setDaftarEkskul(savedEkskul);
    } else {
        setDaftarEkskul(initialEkskulData);
        updateSourceData('ekskulData', initialEkskulData);
    }
    setDaftarPrestasi(getSourceData('prestasiData', []));
    setDaftarSiswa(getSourceData('siswaData', []));
    
    // Load teacher data
    const teachersData = getSourceData('teachersData', {});
    const { schoolInfo, ...roles } = teachersData;
    const allTeacherNames = new Set<string>();
    Object.values(roles).forEach((roleArray: any) => {
      if (Array.isArray(roleArray)) {
        roleArray.forEach((teacher: { nama: string }) => {
          if (teacher.nama) {
            allTeacherNames.add(teacher.nama);
          }
        });
      }
    });
    setDaftarGuru(Array.from(allTeacherNames).sort());
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
  const handleOpenEkskulDialog = (ekskul: EkskulItem | null = null, kategori: string | null = null) => {
    if (ekskul && kategori) {
        setEditingEkskul({ item: ekskul, kategori: kategori });
        setEkskulFormData({ ...ekskul, kategori: kategori });
    } else {
        setEditingEkskul(null);
        setEkskulFormData({ nama: '', pembina: [], kategori: '' });
    }
    setIsEkskulDialogOpen(true);
  };
  
  const handleSelectPembina = (pembinaName: string) => {
    setEkskulFormData(prev => {
        const currentPembina = prev.pembina || [];
        if (!currentPembina.includes(pembinaName)) {
            return { ...prev, pembina: [...currentPembina, pembinaName] };
        }
        return prev;
    });
  };

  const handleRemovePembina = (pembinaToRemove: string) => {
    setEkskulFormData(prev => ({
        ...prev,
        pembina: prev.pembina?.filter(p => p !== pembinaToRemove),
    }));
  };

  const handleSaveEkskul = () => {
    const { nama, pembina, kategori } = ekskulFormData;
    if (!nama || !pembina || pembina.length === 0 || !kategori) {
        toast({ title: "Gagal", description: "Nama, kategori, dan minimal satu pembina harus diisi.", variant: "destructive" });
        return;
    }

    const updatedEkskul = daftarEkskul.map(kat => ({...kat, items: [...kat.items]}));

    if (editingEkskul) {
        // Find old category and remove item
        const oldKat = updatedEkskul.find(k => k.nama === editingEkskul.kategori);
        if (oldKat) {
            oldKat.items = oldKat.items.filter(item => item.id !== editingEkskul.item.id);
        }
        // Find new category and add/update item
        const newKat = updatedEkskul.find(k => k.nama === kategori);
        if (newKat) {
            newKat.items.push({ ...editingEkskul.item, nama, pembina });
        }
    } else {
        // Add new item
        const targetKat = updatedEkskul.find(k => k.nama === kategori);
        if (targetKat) {
            targetKat.items.push({ id: Date.now(), nama, pembina });
        }
    }

    setDaftarEkskul(updatedEkskul);
    toast({ title: "Sukses", description: "Data ekskul diperbarui. Simpan perubahan untuk konfirmasi." });
    setIsEkskulDialogOpen(false);
  };
  
  const handleDeleteEkskul = () => {
      if (!ekskulToDelete) return;
      const { item, kategori } = ekskulToDelete;

      const updatedEkskul = daftarEkskul.map(kat => {
          if (kat.nama === kategori) {
              return { ...kat, items: kat.items.filter(i => i.id !== item.id) };
          }
          return kat;
      });
      
      setDaftarEkskul(updatedEkskul);
      toast({ title: "Ekskul Dihapus", description: `${item.nama} dihapus dari sesi ini.` });
      setEkskulToDelete(null);
  };

  // --- PRESTASI HANDLERS ---
  const handleOpenPrestasiDialog = (prestasi: Prestasi | null = null) => {
    setEditingPrestasi(prestasi);
    if (prestasi) {
      setPrestasiFormData({ ...prestasi });
      setSelectedSiswa(prestasi.siswa.map(s => daftarSiswa.find(ds => ds.nis === s.nis)).filter(Boolean) as Siswa[]);
    } else {
      setPrestasiFormData({ tanggal: format(new Date(), 'yyyy-MM-dd'), siswa: [] });
      setSelectedSiswa([]);
    }
    setIsPrestasiDialogOpen(true);
  };

  const handleSelectSiswa = (siswa: Siswa) => {
    if (!selectedSiswa.some(s => s.nis === siswa.nis)) {
      setSelectedSiswa([...selectedSiswa, siswa]);
    }
  };
  
  const handleRemoveSiswa = (nis: string) => {
    setSelectedSiswa(selectedSiswa.filter(s => s.nis !== nis));
  };

  const handleSavePrestasi = () => {
    if (selectedSiswa.length === 0 || !prestasiFormData.deskripsi || !prestasiFormData.tingkat || !prestasiFormData.tanggal) {
        toast({ title: "Gagal", description: "Harap lengkapi semua data prestasi, termasuk memilih minimal satu siswa.", variant: "destructive" });
        return;
    }
    
    const siswaDataForPrestasi = selectedSiswa.map(s => ({ nis: s.nis, nama: s.nama, kelas: s.kelas }));

    const prestasiData: Omit<Prestasi, 'id'> = {
        siswa: siswaDataForPrestasi,
        tanggal: prestasiFormData.tanggal!,
        deskripsi: prestasiFormData.deskripsi!,
        tingkat: prestasiFormData.tingkat!
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
    toast({ title: "Prestasi Dihapus", description: `Catatan prestasi telah dihapus.` });
    setPrestasiToDelete(null);
  };

  return (
    <div className="flex-1 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Manajemen Ekskul &amp; Prestasi</h2>
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
                    <CardDescription>Daftar ekskul yang tersedia berdasarkan kategori.</CardDescription>
                </div>
                <Button size="sm" onClick={() => handleOpenEkskulDialog()}><PlusCircle className="mr-2 h-4 w-4" />Tambah</Button>
            </CardHeader>
            <CardContent>
                <Accordion type="multiple" className="w-full">
                    {daftarEkskul.map(kategori => (
                        <AccordionItem value={kategori.nama} key={kategori.nama}>
                            <AccordionTrigger>{kategori.nama}</AccordionTrigger>
                            <AccordionContent>
                                {kategori.items.length > 0 ? (
                                    <ul className="space-y-2">
                                        {kategori.items.map(item => (
                                            <li key={item.id} className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50 group">
                                                <div>
                                                    <p className="font-medium">{item.nama}</p>
                                                    <p className="text-xs text-muted-foreground">Pembina: {item.pembina.join(', ')}</p>
                                                </div>
                                                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Button variant="ghost" size="icon" onClick={() => handleOpenEkskulDialog(item, kategori.nama)}><Edit className="h-4 w-4" /></Button>
                                                    <Button variant="ghost" size="icon" onClick={() => setEkskulToDelete({item, kategori: kategori.nama})}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-sm text-center text-muted-foreground py-4">Belum ada ekskul di kategori ini.</p>
                                )}
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
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
                 <ScrollArea className="h-[400px]">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b">
                                <th className="text-left p-2 font-medium text-muted-foreground">Siswa</th>
                                <th className="text-left p-2 font-medium text-muted-foreground">Prestasi</th>
                                <th className="text-left p-2 font-medium text-muted-foreground">Tingkat</th>
                                <th className="text-right p-2 font-medium text-muted-foreground">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {daftarPrestasi.length > 0 ? daftarPrestasi.map(p => (
                                <tr key={p.id} className="border-b">
                                    <td className="p-2 font-medium align-top">{p.siswa.map(s => s.nama).join(', ')}</td>
                                    <td className="p-2 text-muted-foreground align-top">{p.deskripsi}</td>
                                    <td className="p-2 align-top"><Badge variant="secondary">{p.tingkat}</Badge></td>
                                    <td className="text-right p-2 align-top">
                                        <Button variant="ghost" size="icon" onClick={() => handleOpenPrestasiDialog(p)}><Edit className="h-4 w-4" /></Button>
                                        <Button variant="ghost" size="icon" onClick={() => setPrestasiToDelete(p)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                                    </td>
                                </tr>
                            )) : <tr><td colSpan={4} className="text-center h-24 text-muted-foreground">Belum ada catatan prestasi.</td></tr>}
                        </tbody>
                    </table>
                 </ScrollArea>
            </CardContent>
        </Card>
      </div>

      {/* Dialogs */}
      <Dialog open={isEkskulDialogOpen} onOpenChange={setIsEkskulDialogOpen}>
        <DialogContent className="sm:max-w-lg">
            <DialogHeader><DialogTitle>{editingEkskul ? 'Edit' : 'Tambah'} Ekskul</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-4">
                <div className="space-y-2">
                    <Label htmlFor="nama-ekskul">Nama Ekskul</Label>
                    <Input id="nama-ekskul" value={ekskulFormData.nama || ''} onChange={e => setEkskulFormData({...ekskulFormData, nama: e.target.value})}/>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="kategori-ekskul">Kategori</Label>
                    <Select value={ekskulFormData.kategori} onValueChange={(value) => setEkskulFormData({...ekskulFormData, kategori: value})}>
                        <SelectTrigger id="kategori-ekskul"><SelectValue placeholder="Pilih Kategori" /></SelectTrigger>
                        <SelectContent>
                            {daftarEkskul.map(kat => <SelectItem key={kat.nama} value={kat.nama}>{kat.nama}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="pembina">Nama Pembina</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                          <Button variant="outline" role="combobox" className="w-full justify-between">
                              Pilih pembina...
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50"/>
                          </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[450px] p-0">
                          <Command>
                              <CommandInput placeholder="Cari nama guru..."/>
                              <CommandList>
                                  <CommandEmpty>Guru tidak ditemukan.</CommandEmpty>
                                  <CommandGroup>
                                      {daftarGuru.map(guru => (
                                          <CommandItem key={guru} value={guru} onSelect={() => handleSelectPembina(guru)}>
                                              <UserPlus className="mr-2 h-4 w-4"/>
                                              {guru}
                                          </CommandItem>
                                      ))}
                                  </CommandGroup>
                              </CommandList>
                          </Command>
                      </PopoverContent>
                    </Popover>
                    <div className="mt-2 space-y-2">
                        {ekskulFormData.pembina?.map(p => (
                            <div key={p} className="flex items-center justify-between rounded-md bg-secondary p-2">
                                <span className="text-sm">{p}</span>
                                <Button size="sm" variant="ghost" onClick={() => handleRemovePembina(p)}><X className="h-4 w-4"/></Button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <DialogFooter><DialogClose asChild><Button variant="outline">Batal</Button></DialogClose><Button onClick={handleSaveEkskul}>Simpan</Button></DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={isPrestasiDialogOpen} onOpenChange={setIsPrestasiDialogOpen}>
        <DialogContent className="sm:max-w-lg">
            <DialogHeader><DialogTitle>{editingPrestasi ? 'Edit' : 'Tambah'} Prestasi</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-4">
                <div className="space-y-2">
                    <Label className="flex items-center gap-2"><Users /> Siswa Berprestasi (Bisa lebih dari satu)</Label>
                     <Popover>
                        <PopoverTrigger asChild><Button variant="outline" role="combobox" className="w-full justify-between">Pilih siswa...<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50"/></Button></PopoverTrigger>
                        <PopoverContent className="w-[450px] p-0"><Command><CommandInput placeholder="Cari nama siswa..."/><CommandList><CommandEmpty>Siswa tidak ditemukan.</CommandEmpty><CommandGroup>{daftarSiswa.map(s => (<CommandItem key={s.nis} value={s.nama} onSelect={() => handleSelectSiswa(s)}>{s.nama} ({s.kelas})</CommandItem>))}</CommandGroup></CommandList></Command></PopoverContent>
                    </Popover>
                    <ScrollArea className="h-32 mt-2 rounded-md border">
                        <div className="p-2 space-y-2">
                            {selectedSiswa.map(s => (
                                <div key={s.nis} className="flex items-center justify-between rounded-md bg-secondary p-2">
                                    <span className="text-sm">{s.nama} ({s.kelas})</span>
                                    <Button size="sm" variant="ghost" onClick={() => handleRemoveSiswa(s.nis)}><X className="h-4 w-4"/></Button>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                </div>
                <div className="space-y-2"><Label htmlFor="deskripsi-prestasi">Deskripsi Prestasi</Label><Textarea id="deskripsi-prestasi" value={prestasiFormData.deskripsi || ''} onChange={e => setPrestasiFormData({...prestasiFormData, deskripsi: e.target.value})} placeholder="Contoh: Juara 1 Lomba Cerdas Cermat"/></div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="tingkat">Tingkat</Label>
                        <Select onValueChange={(value) => setPrestasiFormData({...prestasiFormData, tingkat: value as any})} value={prestasiFormData.tingkat}>
                            <SelectTrigger id="tingkat"><SelectValue placeholder="Pilih Tingkat" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Sekolah">Sekolah</SelectItem>
                                <SelectItem value="Kabupaten">Kabupaten</SelectItem>
                                <SelectItem value="Provinsi">Provinsi</SelectItem>
                                <SelectItem value="Nasional">Nasional</SelectItem>
                                <SelectItem value="Internasional">Internasional</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2"><Label htmlFor="tanggal">Tanggal</Label><Input id="tanggal" type="date" value={prestasiFormData.tanggal || ''} onChange={e => setPrestasiFormData({...prestasiFormData, tanggal: e.target.value})}/></div>
                </div>
            </div>
            <DialogFooter><DialogClose asChild><Button variant="outline">Batal</Button></DialogClose><Button onClick={handleSavePrestasi}>Simpan</Button></DialogFooter>
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={!!ekskulToDelete} onOpenChange={() => setEkskulToDelete(null)}>
        <AlertDialogContent>
            <AlertDialogHeader><AlertDialogTitle>Yakin ingin menghapus?</AlertDialogTitle><AlertDialogDescription>Tindakan ini akan menghapus ekskul {ekskulToDelete?.item.nama}.</AlertDialogDescription></AlertDialogHeader>
            <AlertDialogFooter><AlertDialogCancel>Batal</AlertDialogCancel><AlertDialogAction onClick={handleDeleteEkskul}>Hapus</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <AlertDialog open={!!prestasiToDelete} onOpenChange={() => setPrestasiToDelete(null)}>
        <AlertDialogContent>
            <AlertDialogHeader><AlertDialogTitle>Yakin ingin menghapus?</AlertDialogTitle><AlertDialogDescription>Tindakan ini akan menghapus catatan prestasi ini.</AlertDialogDescription></AlertDialogHeader>
            <AlertDialogFooter><AlertDialogCancel>Batal</AlertDialogCancel><AlertDialogAction onClick={handleDeletePrestasi}>Hapus</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

    