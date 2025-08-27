
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusCircle, Edit, Trash2, BookMark, Loader2 } from "lucide-react";
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
import { useToast } from "@/hooks/use-toast";
import { getSourceData, updateSourceData } from "@/lib/data-manager";

interface MataPelajaran {
  id: number;
  kode: string;
  nama: string;
}

export default function MataPelajaranPage() {
  const { toast } = useToast();
  const [daftarMapel, setDaftarMapel] = useState<MataPelajaran[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Dialog & Form States
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMapel, setEditingMapel] = useState<MataPelajaran | null>(null);
  const [mapelToDelete, setMapelToDelete] = useState<MataPelajaran | null>(null);
  const [formData, setFormData] = useState<Partial<MataPelajaran>>({});

  const loadData = () => {
    setIsLoading(true);
    try {
      setDaftarMapel(getSourceData('mataPelajaranData', []));
    } catch (error) {
      toast({ title: "Gagal Memuat", description: "Tidak dapat memuat data mata pelajaran.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    
    const handleDataChange = (event: Event) => {
        const customEvent = event as CustomEvent;
        if(customEvent.detail.key === 'mataPelajaranData'){
            loadData();
        }
    };
    window.addEventListener('dataUpdated', handleDataChange);
    return () => window.removeEventListener('dataUpdated', handleDataChange);
  }, []);

  const handleOpenDialog = (mapel: MataPelajaran | null = null) => {
    setEditingMapel(mapel);
    setFormData(mapel || { kode: '', nama: '' });
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.nama || !formData.kode) {
      toast({ title: "Gagal", description: "Kode dan Nama Mata Pelajaran harus diisi.", variant: "destructive" });
      return;
    }
    
    const currentData = getSourceData('mataPelajaranData', []);
    let updatedData;

    if (editingMapel) {
      updatedData = currentData.map((m: MataPelajaran) => m.id === editingMapel.id ? { ...m, ...formData } : m);
    } else {
      const newMapel: MataPelajaran = {
        id: currentData.length > 0 ? Math.max(...currentData.map((m: MataPelajaran) => m.id)) + 1 : 1,
        ...formData,
      } as MataPelajaran;
      updatedData = [...currentData, newMapel];
    }
    
    updateSourceData('mataPelajaranData', updatedData);
    toast({ title: "Sukses", description: "Data mata pelajaran berhasil disimpan." });
    setIsDialogOpen(false);
  };

  const handleDelete = () => {
    if (!mapelToDelete) return;
    const currentData = getSourceData('mataPelajaranData', []);
    const updatedData = currentData.filter((m: MataPelajaran) => m.id !== mapelToDelete.id);
    updateSourceData('mataPelajaranData', updatedData);
    toast({ title: "Mata Pelajaran Dihapus", description: `"${mapelToDelete.nama}" telah dihapus.` });
    setMapelToDelete(null);
  };

  return (
    <div className="flex-1 space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Manajemen Mata Pelajaran</h2>
        <p className="text-muted-foreground">Kelola daftar mata pelajaran yang diajarkan di sekolah.</p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Daftar Mata Pelajaran</CardTitle>
            <CardDescription>Tambah, edit, atau hapus mata pelajaran dari daftar.</CardDescription>
          </div>
          <Button onClick={() => handleOpenDialog()}>
            <PlusCircle className="mr-2 h-4 w-4" /> Tambah Mata Pelajaran
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-48">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[150px]">Kode</TableHead>
                  <TableHead>Nama Mata Pelajaran</TableHead>
                  <TableHead className="text-right w-[120px]">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {daftarMapel.length > 0 ? (
                  daftarMapel.map((mapel) => (
                    <TableRow key={mapel.id}>
                      <TableCell className="font-medium">{mapel.kode}</TableCell>
                      <TableCell>{mapel.nama}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(mapel)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setMapelToDelete(mapel)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="h-24 text-center">
                      Belum ada data mata pelajaran. Silakan tambahkan.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Dialog Form */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingMapel ? 'Edit' : 'Tambah'} Mata Pelajaran</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="kode">Kode Mata Pelajaran</Label>
              <Input id="kode" value={formData.kode || ''} onChange={(e) => setFormData({ ...formData, kode: e.target.value.toUpperCase() })} placeholder="Contoh: MTK-01" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nama">Nama Mata Pelajaran</Label>
              <Input id="nama" value={formData.nama || ''} onChange={(e) => setFormData({ ...formData, nama: e.target.value })} placeholder="Contoh: Matematika Wajib" />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Batal</Button></DialogClose>
            <Button onClick={handleSave}>Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Alert Dialog Hapus */}
      <AlertDialog open={!!mapelToDelete} onOpenChange={() => setMapelToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
            <AlertDialogDescription>Tindakan ini akan menghapus mata pelajaran secara permanen. Data ini tidak dapat dipulihkan.</AlertDialogDescription>
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
