
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusCircle, Trash2, User, BookWarning, Search, ChevronsUpDown, Check, Info } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

// --- Interface Definitions ---
interface Siswa {
  id: number;
  nis: string;
  nama: string;
  kelas: string;
}

interface TataTertib {
  id: number;
  deskripsi: string;
  poin: number;
  kategori: string;
}

interface CatatanSiswa {
  id: number;
  tanggal: string;
  tipe: 'pelanggaran' | 'prestasi';
  nis: string;
  siswa: string;
  kelas: string;
  deskripsi: string;
  poin: number;
  dicatatOleh: string;
}

const getSourceData = (key: string, defaultValue: any) => {
    if (typeof window !== 'undefined') {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error(`Gagal memuat data dari localStorage: ${key}`, error);
        }
    }
    return defaultValue;
};

const updateSourceData = (key: string, data: any) => {
    if (typeof window !== 'undefined') {
        localStorage.setItem(key, JSON.stringify(data));
    }
};

export default function ManajemenPelanggaranPage() {
  const { toast } = useToast();
  
  // --- Data States ---
  const [daftarSiswa, setDaftarSiswa] = useState<Siswa[]>([]);
  const [daftarTataTertib, setDaftarTataTertib] = useState<TataTertib[]>([]);
  const [riwayatCatatan, setRiwayatCatatan] = useState<CatatanSiswa[]>([]);
  const [currentUser, setCurrentUser] = useState({ nama: "Wakasek" });

  // --- Dialog & Form States ---
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [catatanToDelete, setCatatanToDelete] = useState<CatatanSiswa | null>(null);
  
  // --- Form Data States ---
  const [selectedNis, setSelectedNis] = useState<string>("");
  const [selectedRuleId, setSelectedRuleId] = useState<number | null>(null);
  const [keterangan, setKeterangan] = useState("");

  useEffect(() => {
    const siswa = getSourceData('siswaData', []);
    const tataTertibData = getSourceData('tataTertibData', { Kerajinan: [], Kerapian: [], Perilaku: [] });
    const catatan = getSourceData('riwayatCatatan', []);
    const user = getSourceData('currentUser', { nama: "Wakasek" });

    setDaftarSiswa(siswa);
    setDaftarTataTertib(Object.values(tataTertibData).flat());
    setRiwayatCatatan(catatan);
    setCurrentUser(user);
  }, []);

  const poinSiswa = riwayatCatatan.reduce((acc, curr) => {
    if (curr.tipe === 'pelanggaran') {
        acc[curr.nis] = (acc[curr.nis] || 0) + curr.poin;
    }
    return acc;
  }, {} as Record<string, number>);

  const handleOpenDialog = () => {
    setSelectedNis("");
    setSelectedRuleId(null);
    setKeterangan("");
    setIsDialogOpen(true);
  };

  const handleSaveCatatan = () => {
    const siswa = daftarSiswa.find(s => s.nis === selectedNis);
    const aturan = daftarTataTertib.find(t => t.id === selectedRuleId);

    if (!siswa || !aturan) {
      toast({ title: "Gagal Menyimpan", description: "Harap pilih siswa dan jenis pelanggaran.", variant: "destructive" });
      return;
    }

    const newCatatan: CatatanSiswa = {
      id: riwayatCatatan.length > 0 ? Math.max(...riwayatCatatan.map(c => c.id)) + 1 : 1,
      tanggal: format(new Date(), "yyyy-MM-dd"),
      tipe: 'pelanggaran',
      nis: siswa.nis,
      siswa: siswa.nama,
      kelas: siswa.kelas,
      deskripsi: `${aturan.deskripsi}${keterangan ? ` (${keterangan})` : ''}`,
      poin: aturan.poin,
      dicatatOleh: currentUser.nama,
    };

    const updatedRiwayat = [...riwayatCatatan, newCatatan];
    setRiwayatCatatan(updatedRiwayat);
    updateSourceData('riwayatCatatan', updatedRiwayat);
    
    toast({ title: "Sukses", description: "Catatan pelanggaran berhasil disimpan." });
    setIsDialogOpen(false);
  };

  const handleDeleteCatatan = () => {
    if (!catatanToDelete) return;

    const updatedRiwayat = riwayatCatatan.filter(c => c.id !== catatanToDelete.id);
    setRiwayatCatatan(updatedRiwayat);
    updateSourceData('riwayatCatatan', updatedRiwayat);
    
    toast({ title: "Catatan Dihapus", description: `Catatan untuk ${catatanToDelete.siswa} telah dihapus.` });
    setCatatanToDelete(null);
  };

  return (
    <div className="flex-1 space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Manajemen Pelanggaran Siswa</h2>
        <p className="text-muted-foreground">Catat, pantau, dan kelola pelanggaran tata tertib siswa.</p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Riwayat Pelanggaran</CardTitle>
              <CardDescription>Daftar semua catatan pelanggaran yang telah dibuat.</CardDescription>
            </div>
            <Button onClick={handleOpenDialog}>
                <PlusCircle className="mr-2 h-4 w-4"/>
                Catat Pelanggaran Baru
            </Button>
        </CardHeader>
        <CardContent>
             <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Tanggal</TableHead>
                        <TableHead>Siswa</TableHead>
                        <TableHead>Kelas</TableHead>
                        <TableHead>Deskripsi Pelanggaran</TableHead>
                        <TableHead className="text-center">Poin</TableHead>
                        <TableHead>Dicatat Oleh</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {riwayatCatatan.filter(c => c.tipe === 'pelanggaran').length > 0 ? (
                        riwayatCatatan.filter(c => c.tipe === 'pelanggaran').map(catatan => (
                            <TableRow key={catatan.id}>
                                <TableCell>{catatan.tanggal}</TableCell>
                                <TableCell className="font-medium">
                                    {catatan.siswa}
                                    <Badge variant="secondary" className="ml-2">
                                        Total Poin: {poinSiswa[catatan.nis] || 0}
                                    </Badge>
                                </TableCell>
                                <TableCell>{catatan.kelas}</TableCell>
                                <TableCell>{catatan.deskripsi}</TableCell>
                                <TableCell className="text-center">
                                    <Badge variant="destructive">{catatan.poin}</Badge>
                                </TableCell>
                                <TableCell>{catatan.dicatatOleh}</TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="icon" onClick={() => setCatatanToDelete(catatan)}>
                                        <Trash2 className="h-4 w-4 text-destructive"/>
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={7} className="text-center h-24">Belum ada catatan pelanggaran.</TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </CardContent>
      </Card>
      
      {/* Dialog Pencatatan Pelanggaran */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
                <DialogTitle>Formulir Pencatatan Pelanggaran</DialogTitle>
            </DialogHeader>
            <div className="grid gap-6 py-4">
                <div className="space-y-2">
                    <Label className="flex items-center gap-2"><User/>Pilih Siswa</Label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" role="combobox" className="w-full justify-between">
                                {selectedNis ? daftarSiswa.find(s => s.nis === selectedNis)?.nama : "Cari dan pilih siswa..."}
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
                                            <CommandItem key={siswa.nis} value={siswa.nama} onSelect={() => setSelectedNis(siswa.nis)}>
                                                <Check className={cn("mr-2 h-4 w-4", selectedNis === siswa.nis ? "opacity-100" : "opacity-0")}/>
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
                    <Label className="flex items-center gap-2"><BookWarning/>Pilih Jenis Pelanggaran</Label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" role="combobox" className="w-full justify-between h-auto text-left">
                                <span className="flex-1 whitespace-normal">
                                    {selectedRuleId ? daftarTataTertib.find(r => r.id === selectedRuleId)?.deskripsi : "Cari dan pilih pelanggaran..."}
                                </span>
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50"/>
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[450px] p-0">
                             <Command>
                                <CommandInput placeholder="Ketik deskripsi pelanggaran..."/>
                                <CommandList>
                                    <CommandEmpty>Aturan tidak ditemukan.</CommandEmpty>
                                    <CommandGroup>
                                        {daftarTataTertib.map(rule => (
                                            <CommandItem key={rule.id} value={rule.deskripsi} onSelect={() => setSelectedRuleId(rule.id)}>
                                                <Check className={cn("mr-2 h-4 w-4", selectedRuleId === rule.id ? "opacity-100" : "opacity-0")}/>
                                                 {rule.deskripsi} <Badge variant="destructive" className="ml-auto">{rule.poin} Poin</Badge>
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                </CommandList>
                            </Command>
                        </PopoverContent>
                    </Popover>
                </div>
                <div className="space-y-2">
                    <Label className="flex items-center gap-2"><Info/>Keterangan Tambahan (Opsional)</Label>
                    <Textarea value={keterangan} onChange={e => setKeterangan(e.target.value)} placeholder="Contoh: Terlambat saat upacara bendera."/>
                </div>
            </div>
            <DialogFooter>
                <DialogClose asChild><Button variant="outline">Batal</Button></DialogClose>
                <Button onClick={handleSaveCatatan}>Simpan Catatan</Button>
            </DialogFooter>
          </DialogContent>
      </Dialog>
      
      {/* Alert Dialog Hapus */}
       <AlertDialog open={!!catatanToDelete} onOpenChange={() => setCatatanToDelete(null)}>
          <AlertDialogContent>
              <AlertDialogHeader>
                  <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
                  <AlertDialogDescription>Tindakan ini akan menghapus catatan pelanggaran secara permanen dari riwayat.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                  <AlertDialogCancel>Batal</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteCatatan}>Hapus</AlertDialogAction>
              </AlertDialogFooter>
          </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
