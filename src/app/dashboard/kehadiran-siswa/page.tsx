
"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getSourceData, updateSourceData } from "@/lib/data-manager";
import { Edit, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogClose, DialogDescription } from "@/components/ui/dialog";
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

// Gabungan data siswa dengan rekap kehadiran mereka untuk bulan yang dipilih
interface RekapSiswa {
    siswa: Siswa;
    kehadiran: Kehadiran[]; // Semua catatan di bulan/tahun terpilih
}

export default function KehadiranSiswaPage() {
  const { toast } = useToast();
  const [allRecords, setAllRecords] = useState<Kehadiran[]>([]);
  const [daftarSiswa, setDaftarSiswa] = useState<Siswa[]>([]);
  const [daftarKelas, setDaftarKelas] = useState<Kelas[]>([]);
  const [schoolName, setSchoolName] = useState("Sekolah");
  
  // Filter states
  const [filterMonth, setFilterMonth] = useState<string>((new Date().getMonth() + 1).toString().padStart(2, '0'));
  const [filterYear, setFilterYear] = useState<string>(currentYear.toString());
  const [filterKelas, setFilterKelas] = useState<string>("");

  // Dialog states
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<Kehadiran | null>(null);
  const [recordToDelete, setRecordToDelete] = useState<Kehadiran | null>(null);

  // Form states
  const [formStatus, setFormStatus] = useState<Kehadiran['status']>('Hadir');

  const loadData = () => {
    setAllRecords(getSourceData('kehadiranSiswa', []));
    setDaftarSiswa(getSourceData('siswaData', []));
    setDaftarKelas(getSourceData('kelasData', []));
    
    const teachersData = getSourceData('teachersData', {});
    if (teachersData.schoolInfo && teachersData.schoolInfo.schoolName) {
        setSchoolName(teachersData.schoolInfo.schoolName);
    }
  };
  
  useEffect(() => {
    loadData();
    window.addEventListener('dataUpdated', loadData);
    return () => window.removeEventListener('dataUpdated', loadData);
  }, []);
  
  const rekapitulasiSiswaDiKelas = useMemo<RekapSiswa[]>(() => {
    if (!filterKelas) {
      return [];
    }
    
    const siswaDiKelas = daftarSiswa.filter(s => s.kelas === filterKelas);
    const yearMonth = `${filterYear}-${filterMonth}`;

    return siswaDiKelas.map(siswa => {
      const kehadiranSiswa = allRecords.filter(r => r.nis === siswa.nis && r.tanggal.startsWith(yearMonth));
      return {
        siswa: siswa,
        kehadiran: kehadiranSiswa.sort((a,b) => new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime()),
      };
    });
  }, [filterKelas, filterMonth, filterYear, daftarSiswa, allRecords]);


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
                    <SelectTrigger className="w-[180px]"><SelectValue placeholder="Pilih Kelas..." /></SelectTrigger>
                    <SelectContent>
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
                <TableHead>NIS</TableHead>
                <TableHead>Nama Siswa</TableHead>
                <TableHead>Rekap Kehadiran (Bulan Ini)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filterKelas && rekapitulasiSiswaDiKelas.length > 0 ? (
                rekapitulasiSiswaDiKelas.map(({ siswa, kehadiran }) => (
                  <TableRow key={siswa.id}>
                    <TableCell>{siswa.nis}</TableCell>
                    <TableCell className="font-medium">{siswa.nama}</TableCell>
                    <TableCell>
                      {kehadiran.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                            {kehadiran.map(rec => (
                                <div key={rec.id} className="flex items-center gap-2">
                                     <Badge variant={getBadgeVariant(rec.status)}>{rec.tanggal}</Badge>
                                     <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleOpenDialog(rec)}><Edit className="h-3 w-3" /></Button>
                                     <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setRecordToDelete(rec)}><Trash2 className="h-3 w-3 text-destructive" /></Button>
                                </div>
                            ))}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-xs">Belum ada data kehadiran bulan ini.</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                    <TableCell colSpan={3} className="h-24 text-center">
                        {filterKelas ? "Tidak ada siswa di kelas ini." : "Silakan pilih kelas untuk menampilkan data."}
                    </TableCell>
                </TableRow>
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
