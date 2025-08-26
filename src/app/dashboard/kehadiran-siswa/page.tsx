
"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getSourceData } from "@/lib/data-manager";
import { Edit, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

interface Kehadiran {
  id: string;
  nis: string;
  nama: string;
  kelas: string;
  tanggal: string;
  status: 'Hadir' | 'Sakit' | 'Izin' | 'Alpa';
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

const months = [
    { value: "01", label: "Januari" }, { value: "02", label: "Februari" },
    { value: "03", label: "Maret" }, { value: "04", label: "April" },
    { value: "05", label: "Mei" }, { value: "06", label: "Juni" },
    { value: "07", label: "Juli" }, { value: "08", label: "Agustus" },
    { value: "09", label: "September" }, { value: "10", label: "Oktober" },
    { value: "11", label: "November" }, { value: "12", label: "Desember" }
];

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 5 }, (_, i) => (currentYear - i).toString());

export default function KehadiranSiswaPage() {
  const { toast } = useToast();
  const [allRecords, setAllRecords] = useState<Kehadiran[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<Kehadiran[]>([]);
  const [daftarKelas, setDaftarKelas] = useState<Kelas[]>([]);
  const [schoolName, setSchoolName] = useState("Sekolah");
  
  // Filter states
  const [filterMonth, setFilterMonth] = useState<string>((new Date().getMonth() + 1).toString().padStart(2, '0'));
  const [filterYear, setFilterYear] = useState<string>(currentYear.toString());
  const [filterKelas, setFilterKelas] = useState<string>("semua");

  // Dialog states
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<Kehadiran | null>(null);
  const [recordToDelete, setRecordToDelete] = useState<Kehadiran | null>(null);

  // Form states
  const [formStatus, setFormStatus] = useState<Kehadiran['status']>('Hadir');

  const loadData = () => {
    const records = getSourceData('kehadiranSiswa', []);
    const kelasData = getSourceData('kelasData', []);
    const teachersData = getSourceData('teachersData', {});
    
    setAllRecords(records);
    setDaftarKelas(kelasData);
    
    if (teachersData.schoolInfo && teachersData.schoolInfo.schoolName) {
        setSchoolName(teachersData.schoolInfo.schoolName);
    }
  };
  
  useEffect(() => {
    loadData();
    window.addEventListener('dataUpdated', loadData);
    return () => window.removeEventListener('dataUpdated', loadData);
  }, []);
  
  useEffect(() => {
    const yearMonth = `${filterYear}-${filterMonth}`;
    let results = allRecords.filter(r => r.tanggal.startsWith(yearMonth));
    if (filterKelas !== "semua") {
      results = results.filter(r => r.kelas === filterKelas);
    }
    setFilteredRecords(results.sort((a,b) => new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime() || a.nama.localeCompare(b.nama)));
  }, [filterMonth, filterYear, filterKelas, allRecords]);

  const getBadgeVariant = (status: Kehadiran['status']) => {
    switch (status) {
      case 'Hadir': return 'default';
      case 'Sakit': return 'secondary';
      case 'Izin': return 'secondary';
      case 'Alpa': return 'destructive';
      default: return 'outline';
    }
  };

  const handleOpenDialog = (record: Kehadiran) => {
    setEditingRecord(record);
    setFormStatus(record.status);
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!editingRecord) return;

    const updatedRecords = allRecords.map(r => r.id === editingRecord.id ? { ...r, status: formStatus } : r);
    
    updateSourceData('kehadiranSiswa', updatedRecords);
    setAllRecords(updatedRecords);
    toast({ title: "Kehadiran Diperbarui", description: `Data kehadiran untuk ${editingRecord.nama} telah diperbarui.` });
    setIsDialogOpen(false);
  };
  
  const handleDelete = () => {
      if (!recordToDelete) return;
      const updatedRecords = allRecords.filter(r => r.id !== recordToDelete.id);
      updateSourceData('kehadiranSiswa', updatedRecords);
      setAllRecords(updatedRecords);
      toast({ title: "Catatan Dihapus", description: `Catatan kehadiran untuk ${recordToDelete.nama} telah dihapus.` });
      setRecordToDelete(null);
  };

  return (
    <div className="flex-1 space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Manajemen Kehadiran Siswa</h2>
        <p className="text-muted-foreground">Catat, lihat, dan kelola data kehadiran siswa harian.</p>
      </div>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Catatan Kehadiran {schoolName}</CardTitle>
              <CardDescription>Gunakan filter untuk mencari data. Gunakan tombol aksi untuk mengelola catatan.</CardDescription>
            </div>
            <div className="flex items-center gap-2">
                 <Select value={filterMonth} onValueChange={setFilterMonth}>
                    <SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger>
                    <SelectContent>{months.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}</SelectContent>
                </Select>
                 <Select value={filterYear} onValueChange={setFilterYear}>
                    <SelectTrigger className="w-[100px]"><SelectValue /></SelectTrigger>
                    <SelectContent>{years.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent>
                </Select>
                <Select value={filterKelas} onValueChange={setFilterKelas}>
                    <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="semua">Semua Kelas</SelectItem>
                        {daftarKelas.map(k => <SelectItem key={k.id} value={k.nama}>{k.nama}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
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
                filteredRecords.map((record) => (
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
                <TableRow><TableCell colSpan={6} className="h-24 text-center">Tidak ada data kehadiran untuk filter yang dipilih.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
                <DialogTitle>Edit Kehadiran</DialogTitle>
                <DialogDescription>
                    Ubah status kehadiran untuk {editingRecord?.nama} pada tanggal {editingRecord?.tanggal}.
                </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                 <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="status-kehadiran" className="text-right">Status</label>
                    <Select onValueChange={(value) => setFormStatus(value as Kehadiran['status'])} value={formStatus}>
                        <SelectTrigger className="col-span-3" id="status-kehadiran"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Hadir">Hadir</SelectItem>
                            <SelectItem value="Sakit">Sakit</SelectItem>
                            <SelectItem value="Izin">Izin</SelectItem>
                            <SelectItem value="Alpa">Alpa</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <DialogFooter>
                <DialogClose asChild><Button variant="outline">Batal</Button></DialogClose>
                <Button onClick={handleSave}>Simpan Perubahan</Button>
            </DialogFooter>
          </DialogContent>
      </Dialog>
      
      <AlertDialog open={!!recordToDelete} onOpenChange={() => setRecordToDelete(null)}>
          <AlertDialogContent>
              <AlertDialogHeader><AlertDialogTitle>Yakin ingin menghapus?</AlertDialogTitle><AlertDialogDescription>Tindakan ini akan menghapus catatan kehadiran untuk {recordToDelete?.nama} pada tanggal {recordToDelete?.tanggal}.</AlertDialogDescription></AlertDialogHeader>
              <AlertDialogFooter><AlertDialogCancel>Batal</AlertDialogCancel><AlertDialogAction onClick={handleDelete}>Hapus</AlertDialogAction></AlertDialogFooter>
          </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
