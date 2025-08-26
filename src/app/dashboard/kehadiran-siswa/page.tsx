
"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getSourceData, updateSourceData } from "@/lib/data-manager";
import { Edit, Trash2, PlusCircle } from "lucide-react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogClose, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

type KehadiranStatus = 'Hadir' | 'Sakit' | 'Izin' | 'Alpa';

interface Kehadiran {
  id: string;
  nis: string;
  nama: string;
  kelas: string;
  tanggal: string;
  status: KehadiranStatus;
}

interface Kelas {
    id: number;
    nama: string;
}

interface Siswa {
  id: number;
  nis: string;
  nama: string;
  kelas: string;
}

const statusOptions: KehadiranStatus[] = ['Hadir', 'Sakit', 'Izin', 'Alpa'];

export default function KehadiranSiswaPage() {
  const { toast } = useToast();
  const [allRecords, setAllRecords] = useState<Kehadiran[]>([]);
  const [daftarSiswa, setDaftarSiswa] = useState<Siswa[]>([]);
  const [daftarKelas, setDaftarKelas] = useState<Kelas[]>([]);
  
  const [filterDate, setFilterDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [filterKelas, setFilterKelas] = useState<string>("all");

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<Kehadiran | null>(null);
  const [recordToDelete, setRecordToDelete] = useState<Kehadiran | null>(null);

  const [formData, setFormData] = useState<Partial<Kehadiran>>({});

  const loadData = () => {
    setAllRecords(getSourceData('kehadiranSiswa', []));
    setDaftarSiswa(getSourceData('siswaData', []));
    setDaftarKelas(getSourceData('kelasData', []));
  };
  
  useEffect(() => {
    loadData();
    window.addEventListener('dataUpdated', loadData);
    return () => window.removeEventListener('dataUpdated', loadData);
  }, []);
  
  const filteredRecords = useMemo(() => {
    return allRecords
      .filter(r => {
        const dateMatch = filterDate ? r.tanggal === filterDate : true;
        const kelasMatch = filterKelas !== 'all' ? r.kelas === filterKelas : true;
        return dateMatch && kelasMatch;
      })
      .sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime());
  }, [allRecords, filterDate, filterKelas]);


  const getBadgeVariant = (status: KehadiranStatus) => {
    switch (status) {
      case 'Hadir': return 'default';
      case 'Sakit': return 'secondary';
      case 'Izin': return 'secondary';
      case 'Alpa': return 'destructive';
      default: return 'outline';
    }
  };

  const handleOpenDialog = (record: Kehadiran | null) => {
    if (record) {
      setEditingRecord(record);
      setFormData(record);
    } else {
      setEditingRecord(null);
      setFormData({
        tanggal: format(new Date(), 'yyyy-MM-dd'),
        status: 'Hadir',
      });
    }
    setIsDialogOpen(true);
  };
  
  const handleSiswaChange = (siswaId: string) => {
    const siswa = daftarSiswa.find(s => s.id.toString() === siswaId);
    if (siswa) {
      setFormData(prev => ({
        ...prev,
        nis: siswa.nis,
        nama: siswa.nama,
        kelas: siswa.kelas
      }));
    }
  };

  const handleSave = () => {
    if (!formData.nama || !formData.tanggal || !formData.status) {
      toast({ title: "Gagal", description: "Siswa, tanggal, dan status harus diisi.", variant: "destructive" });
      return;
    }

    let updatedRecords;
    if (editingRecord) {
      updatedRecords = allRecords.map(r => r.id === editingRecord.id ? { ...r, ...formData } : r);
      toast({ title: "Kehadiran Diperbarui", description: `Data untuk ${formData.nama} telah diperbarui.` });
    } else {
      const newRecord: Kehadiran = {
        id: `${formData.nis}-${formData.tanggal}`,
        nis: formData.nis!,
        nama: formData.nama!,
        kelas: formData.kelas!,
        tanggal: formData.tanggal!,
        status: formData.status!,
      };
      // Prevent duplicate entries for the same student on the same day
      updatedRecords = [...allRecords.filter(r => r.id !== newRecord.id), newRecord];
      toast({ title: "Kehadiran Disimpan", description: `Absensi untuk ${formData.nama} telah disimpan.` });
    }

    updateSourceData('kehadiranSiswa', updatedRecords);
    setAllRecords(updatedRecords);
    setIsDialogOpen(false);
  };

  const handleDelete = () => {
      if (!recordToDelete) return;
      const updatedRecords = allRecords.filter(r => r.id !== recordToDelete.id);
      updateSourceData('kehadiranSiswa', updatedRecords);
      setAllRecords(updatedRecords);
      toast({ title: "Catatan Dihapus", description: `Catatan untuk ${recordToDelete.nama} telah dihapus.` });
      setRecordToDelete(null);
  };

  return (
    <div className="flex-1 space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Manajemen Kehadiran Siswa</h2>
        <p className="text-muted-foreground">Kelola data master kehadiran siswa secara individual.</p>
      </div>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Riwayat Kehadiran</CardTitle>
              <CardDescription>Gunakan filter untuk mencari data. Gunakan tombol aksi untuk mengelola catatan.</CardDescription>
            </div>
             <div className="flex items-center gap-2">
                <Label htmlFor="filter-tanggal">Tanggal</Label>
                <Input
                    id="filter-tanggal"
                    type="date"
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                    className="w-fit"
                />
                <Label htmlFor="filter-kelas">Kelas</Label>
                <Select value={filterKelas} onValueChange={setFilterKelas}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Semua Kelas" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Semua Kelas</SelectItem>
                        {daftarKelas.map(k => <SelectItem key={k.id} value={k.nama}>{k.nama}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex justify-end mb-4">
            <Button onClick={() => handleOpenDialog(null)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Tambah Catatan Kehadiran
            </Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tanggal</TableHead>
                <TableHead>NIS</TableHead>
                <TableHead>Nama Siswa</TableHead>
                <TableHead>Kelas</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRecords.length > 0 ? (
                filteredRecords.map(record => (
                  <TableRow key={record.id}>
                    <TableCell>{record.tanggal}</TableCell>
                    <TableCell>{record.nis}</TableCell>
                    <TableCell className="font-medium">{record.nama}</TableCell>
                    <TableCell>{record.kelas}</TableCell>
                    <TableCell><Badge variant={getBadgeVariant(record.status)}>{record.status}</Badge></TableCell>
                    <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(record)}><Edit className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => setRecordToDelete(record)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                        Tidak ada data kehadiran yang cocok dengan filter.
                    </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {/* Dialog Tambah/Edit Kehadiran */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
                <DialogTitle>{editingRecord ? 'Edit' : 'Tambah'} Catatan Kehadiran</DialogTitle>
                <DialogDescription>
                   Isi detail kehadiran untuk satu siswa pada tanggal tertentu.
                </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                 <div className="space-y-2">
                    <Label htmlFor="siswa">Siswa</Label>
                    <Select
                      onValueChange={handleSiswaChange}
                      value={daftarSiswa.find(s => s.nis === formData.nis)?.id.toString()}
                      disabled={!!editingRecord}
                    >
                        <SelectTrigger id="siswa"><SelectValue placeholder="Pilih Siswa" /></SelectTrigger>
                        <SelectContent>
                          {daftarSiswa.map(s => <SelectItem key={s.id} value={s.id.toString()}>{s.nama} ({s.kelas})</SelectItem>)}
                        </SelectContent>
                    </Select>
                 </div>
                  <div className="space-y-2">
                    <Label htmlFor="tanggal">Tanggal</Label>
                    <Input id="tanggal" type="date" value={formData.tanggal || ''} onChange={(e) => setFormData({...formData, tanggal: e.target.value})} disabled={!!editingRecord} />
                 </div>
                 <div className="space-y-2">
                    <Label htmlFor="status">Status Kehadiran</Label>
                    <Select onValueChange={(value) => setFormData({...formData, status: value as KehadiranStatus})} value={formData.status}>
                        <SelectTrigger id="status"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {statusOptions.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
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
      
      {/* Dialog Konfirmasi Hapus */}
      <AlertDialog open={!!recordToDelete} onOpenChange={() => setRecordToDelete(null)}>
          <AlertDialogContent>
              <AlertDialogHeader><AlertDialogTitle>Yakin ingin menghapus?</AlertDialogTitle><AlertDialogDescription>Tindakan ini akan menghapus catatan kehadiran untuk {recordToDelete?.nama} pada tanggal {recordToDelete?.tanggal}.</AlertDialogDescription></AlertDialogHeader>
              <AlertDialogFooter><AlertDialogCancel>Batal</AlertDialogCancel><AlertDialogAction onClick={handleDelete}>Hapus</AlertDialogAction></AlertDialogFooter>
          </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
