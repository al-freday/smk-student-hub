
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, MoreHorizontal, Edit, Trash2, Award, Star } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { getSourceData, updateSourceData } from "@/lib/data-manager";
import { ekskulData } from "@/lib/ekskulData";

interface Prestasi {
  id: number;
  nis: string;
  namaSiswa: string;
  kelas: string;
  tanggal: string;
  deskripsi: string;
  tingkat: 'Sekolah' | 'Kabupaten/Kota' | 'Provinsi' | 'Nasional' | 'Internasional';
}

interface Siswa {
    id: number;
    nis: string;
    nama: string;
    kelas: string;
}

export default function ManajemenEkskulPrestasiPage() {
  const { toast } = useToast();
  const [daftarEkskul, setDaftarEkskul] = useState(ekskulData);
  const [daftarPrestasi, setDaftarPrestasi] = useState<Prestasi[]>([]);
  const [daftarSiswa, setDaftarSiswa] = useState<Siswa[]>([]);

  // --- Dialog & Form States ---
  const [isEkskulDialogOpen, setIsEkskulDialogOpen] = useState(false);
  const [editingEkskul, setEditingEkskul] = useState<any>(null);
  const [ekskulToDelete, setEkskulToDelete] = useState<any>(null);
  const [ekskulFormData, setEkskulFormData] = useState<any>({});
  
  const [isPrestasiDialogOpen, setIsPrestasiDialogOpen] = useState(false);
  const [editingPrestasi, setEditingPrestasi] = useState<Prestasi | null>(null);
  const [prestasiToDelete, setPrestasiToDelete] = useState<Prestasi | null>(null);
  const [prestasiFormData, setPrestasiFormData] = useState<Partial<Prestasi>>({});
  
  useEffect(() => {
    // Memuat data dari localStorage saat komponen dimuat
    setDaftarPrestasi(getSourceData('prestasiData', []));
    setDaftarSiswa(getSourceData('siswaData', []));
  }, []);

  const resetEkskulForm = () => {
    setEkskulFormData({});
    setEditingEkskul(null);
  };
  
  const resetPrestasiForm = () => {
    setPrestasiFormData({});
    setEditingPrestasi(null);
  }

  const handleOpenEkskulDialog = (ekskul: any | null = null) => {
    resetEkskulForm();
    if (ekskul) {
      setEditingEkskul(ekskul);
      setEkskulFormData(ekskul);
    }
    setIsEkskulDialogOpen(true);
  };
  
  const handleOpenPrestasiDialog = (prestasi: Prestasi | null = null) => {
    resetPrestasiForm();
    if (prestasi) {
      setEditingPrestasi(prestasi);
      setPrestasiFormData(prestasi);
    }
    setIsPrestasiDialogOpen(true);
  }

  const handleSaveEkskul = () => {
    // Note: This only updates the state. No persistence for ekskul data yet.
    if (editingEkskul) {
      setDaftarEkskul(daftarEkskul.map(e => e.id === editingEkskul.id ? {...e, ...ekskulFormData} : e));
    } else {
      setDaftarEkskul([...daftarEkskul, { id: Date.now(), ...ekskulFormData }]);
    }
    setIsEkskulDialogOpen(false);
  };
  
  const handleSavePrestasi = () => {
      const siswa = daftarSiswa.find(s => s.nis === prestasiFormData.nis);
      if (siswa && prestasiFormData.deskripsi && prestasiFormData.tingkat) {
        let updatedPrestasi;
        const currentPrestasi = getSourceData('prestasiData', []);
        
        const newPrestasiData = {
          ...prestasiFormData,
          namaSiswa: siswa.nama,
          kelas: siswa.kelas,
          tanggal: new Date().toISOString().split('T')[0]
        };

        if (editingPrestasi) {
          updatedPrestasi = currentPrestasi.map((p: Prestasi) => p.id === editingPrestasi.id ? { ...p, ...newPrestasiData } : p);
        } else {
          const newId = currentPrestasi.length > 0 ? Math.max(...currentPrestasi.map((p: Prestasi) => p.id)) + 1 : 1;
          updatedPrestasi = [...currentPrestasi, { id: newId, ...newPrestasiData }];
        }
        updateSourceData('prestasiData', updatedPrestasi);
        setDaftarPrestasi(updatedPrestasi);
        setIsPrestasiDialogOpen(false);
        resetPrestasiForm();
        toast({ title: "Prestasi Disimpan", description: "Data prestasi siswa berhasil disimpan." });
      } else {
        toast({ title: "Gagal", description: "Harap lengkapi semua kolom.", variant: "destructive" });
      }
  };

  const handleDeleteEkskul = () => {
    if (!ekskulToDelete) return;
    setDaftarEkskul(daftarEkskul.filter(e => e.id !== ekskulToDelete.id));
    setEkskulToDelete(null);
  };
  
  const handleDeletePrestasi = () => {
    if (!prestasiToDelete) return;
    const currentPrestasi = getSourceData('prestasiData', []);
    const updatedPrestasi = currentPrestasi.filter((p: Prestasi) => p.id !== prestasiToDelete.id);
    updateSourceData('prestasiData', updatedPrestasi);
    setDaftarPrestasi(updatedPrestasi);
    setPrestasiToDelete(null);
    toast({ title: "Prestasi Dihapus", description: `Prestasi ${prestasiToDelete.deskripsi} telah dihapus.` });
  }

  return (
    <div className="flex-1 space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Manajemen Ekskul &amp; Prestasi</h2>
        <p className="text-muted-foreground">Kelola kegiatan ekstrakurikuler dan catat prestasi siswa.</p>
      </div>

      <Tabs defaultValue="prestasi">
        <TabsList>
          <TabsTrigger value="prestasi"><Star className="mr-2 h-4 w-4" /> Prestasi Siswa</TabsTrigger>
          <TabsTrigger value="ekskul"><Award className="mr-2 h-4 w-4" /> Ekstrakurikuler</TabsTrigger>
        </TabsList>
        
        {/* Tab Prestasi */}
        <TabsContent value="prestasi">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Daftar Prestasi Siswa</CardTitle>
                        <CardDescription>Catatan pencapaian siswa di berbagai bidang.</CardDescription>
                    </div>
                    <Button onClick={() => handleOpenPrestasiDialog()}>
                        <PlusCircle className="mr-2 h-4 w-4" /> Catat Prestasi
                    </Button>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader><TableRow><TableHead>Siswa</TableHead><TableHead>Prestasi</TableHead><TableHead>Tingkat</TableHead><TableHead className="text-right">Aksi</TableHead></TableRow></TableHeader>
                        <TableBody>
                            {daftarPrestasi.map(p => (
                                <TableRow key={p.id}>
                                    <TableCell>{p.namaSiswa} ({p.kelas})</TableCell>
                                    <TableCell>{p.deskripsi}</TableCell>
                                    <TableCell>{p.tingkat}</TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                            <DropdownMenuContent>
                                                <DropdownMenuItem onClick={() => handleOpenPrestasiDialog(p)}>Edit</DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => setPrestasiToDelete(p)} className="text-destructive">Hapus</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </TabsContent>
        
        {/* Tab Ekskul */}
        <TabsContent value="ekskul">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Daftar Ekstrakurikuler</CardTitle>
                    <CardDescription>Informasi kegiatan ekstrakurikuler yang tersedia di sekolah.</CardDescription>
                </div>
                 <Button onClick={() => handleOpenEkskulDialog()}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Tambah Ekskul
                </Button>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader><TableRow><TableHead>Nama Ekskul</TableHead><TableHead>Pembina</TableHead><TableHead>Jadwal</TableHead><TableHead className="text-right">Aksi</TableHead></TableRow></TableHeader>
                    <TableBody>
                        {daftarEkskul.map(e => (
                            <TableRow key={e.id}>
                                <TableCell>{e.nama}</TableCell>
                                <TableCell>{e.pembina}</TableCell>
                                <TableCell>{e.jadwal}</TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                        <DropdownMenuContent>
                                            <DropdownMenuItem onClick={() => handleOpenEkskulDialog(e)}>Edit</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => setEkskulToDelete(e)} className="text-destructive">Hapus</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
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
        <DialogContent><DialogHeader><DialogTitle>{editingEkskul ? "Edit" : "Tambah"} Ekskul</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="nama" className="text-right">Nama</Label><Input id="nama" value={ekskulFormData.nama || ""} onChange={e => setEkskulFormData({...ekskulFormData, nama: e.target.value})} className="col-span-3"/></div>
                <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="pembina" className="text-right">Pembina</Label><Input id="pembina" value={ekskulFormData.pembina || ""} onChange={e => setEkskulFormData({...ekskulFormData, pembina: e.target.value})} className="col-span-3"/></div>
                <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="jadwal" className="text-right">Jadwal</Label><Input id="jadwal" value={ekskulFormData.jadwal || ""} onChange={e => setEkskulFormData({...ekskulFormData, jadwal: e.target.value})} className="col-span-3"/></div>
            </div>
            <DialogFooter><DialogClose asChild><Button variant="outline">Batal</Button></DialogClose><Button onClick={handleSaveEkskul}>Simpan</Button></DialogFooter>
        </DialogContent>
      </Dialog>
      
       {/* Dialog Prestasi */}
      <Dialog open={isPrestasiDialogOpen} onOpenChange={setIsPrestasiDialogOpen}>
        <DialogContent><DialogHeader><DialogTitle>{editingPrestasi ? "Edit" : "Catat"} Prestasi</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="nis-prestasi" className="text-right">Siswa</Label>
                    <Select onValueChange={(v) => setPrestasiFormData({...prestasiFormData, nis: v})} value={prestasiFormData.nis}><SelectTrigger className="col-span-3"><SelectValue placeholder="Pilih Siswa" /></SelectTrigger><SelectContent>{daftarSiswa.map(s => <SelectItem key={s.nis} value={s.nis}>{s.nama} ({s.kelas})</SelectItem>)}</SelectContent></Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="deskripsi" className="text-right">Prestasi</Label><Input id="deskripsi" value={prestasiFormData.deskripsi || ""} onChange={e => setPrestasiFormData({...prestasiFormData, deskripsi: e.target.value})} className="col-span-3"/></div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="tingkat" className="text-right">Tingkat</Label>
                    <Select onValueChange={(v: Prestasi['tingkat']) => setPrestasiFormData({...prestasiFormData, tingkat: v})} value={prestasiFormData.tingkat}><SelectTrigger className="col-span-3"><SelectValue placeholder="Pilih Tingkat" /></SelectTrigger><SelectContent><SelectItem value="Sekolah">Sekolah</SelectItem><SelectItem value="Kabupaten/Kota">Kabupaten/Kota</SelectItem><SelectItem value="Provinsi">Provinsi</SelectItem><SelectItem value="Nasional">Nasional</SelectItem><SelectItem value="Internasional">Internasional</SelectItem></SelectContent></Select>
                </div>
            </div>
            <DialogFooter><DialogClose asChild><Button variant="outline">Batal</Button></DialogClose><Button onClick={handleSavePrestasi}>Simpan</Button></DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Alert Dialogs */}
      <AlertDialog open={!!ekskulToDelete} onOpenChange={() => setEkskulToDelete(null)}>
        <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Yakin ingin menghapus?</AlertDialogTitle><AlertDialogDescription>Tindakan ini akan menghapus data ekstrakurikuler.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Batal</AlertDialogCancel><AlertDialogAction onClick={handleDeleteEkskul}>Hapus</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
      </AlertDialog>
      <AlertDialog open={!!prestasiToDelete} onOpenChange={() => setPrestasiToDelete(null)}>
        <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Yakin ingin menghapus?</AlertDialogTitle><AlertDialogDescription>Tindakan ini akan menghapus data prestasi siswa.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Batal</AlertDialogCancel><AlertDialogAction onClick={handleDeletePrestasi}>Hapus</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
      </AlertDialog>

    </div>
  );
}
