
"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { getSourceData, updateSourceData } from "@/lib/data-manager";
import { Calendar as CalendarIcon, Edit, Trash2, PlusCircle } from "lucide-react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";

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

export default function KehadiranSiswaPage() {
  const { toast } = useToast();
  const [allRecords, setAllRecords] = useState<Kehadiran[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<Kehadiran[]>([]);
  const [daftarKelas, setDaftarKelas] = useState<Kelas[]>([]);
  const [daftarSiswa, setDaftarSiswa] = useState<Siswa[]>([]);

  // Filter states
  const [filterDate, setFilterDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [filterKelas, setFilterKelas] = useState<string>("semua");

  // Dialog states
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<Kehadiran | null>(null);
  const [recordToDelete, setRecordToDelete] = useState<Kehadiran | null>(null);

  // Form states
  const [formDate, setFormDate] = useState<Date | undefined>(new Date());
  const [formKelas, setFormKelas] = useState<string>("");
  const [formSelectedSiswa, setFormSelectedSiswa] = useState<string[]>([]);
  const [formStatus, setFormStatus] = useState<Kehadiran['status']>('Hadir');

  const siswaDiKelasTerpilih = useMemo(() => {
    if (!formKelas) return [];
    return daftarSiswa.filter(s => s.kelas === formKelas);
  }, [formKelas, daftarSiswa]);

  const loadData = () => {
    const records = getSourceData('kehadiranSiswa', []);
    const kelasData = getSourceData('kelasData', []);
    const siswaData = getSourceData('siswaData', []);
    setAllRecords(records);
    setDaftarKelas(kelasData);
    setDaftarSiswa(siswaData);
  };
  
  useEffect(() => {
    loadData();
    window.addEventListener('dataUpdated', loadData);
    return () => window.removeEventListener('dataUpdated', loadData);
  }, []);
  
  useEffect(() => {
    let results = allRecords.filter(r => r.tanggal === filterDate);
    if (filterKelas !== "semua") {
      results = results.filter(r => r.kelas === filterKelas);
    }
    setFilteredRecords(results.sort((a,b) => a.kelas.localeCompare(b.kelas) || a.nama.localeCompare(b.nama)));
  }, [filterDate, filterKelas, allRecords]);

  const getBadgeVariant = (status: Kehadiran['status']) => {
    switch (status) {
      case 'Hadir': return 'default';
      case 'Sakit': return 'secondary';
      case 'Izin': return 'secondary';
      case 'Alpa': return 'destructive';
      default: return 'outline';
    }
  };

  const handleOpenDialog = (record: Kehadiran | null = null) => {
    if (record) {
        setEditingRecord(record);
        setFormDate(new Date(record.tanggal));
        setFormKelas(record.kelas);
        setFormSelectedSiswa([record.nis]);
        setFormStatus(record.status);
    } else {
        setEditingRecord(null);
        setFormDate(new Date());
        setFormKelas("");
        setFormSelectedSiswa([]);
        setFormStatus('Hadir');
    }
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!formDate || !formStatus || (editingRecord ? false : (formSelectedSiswa.length === 0 || !formKelas))) {
        toast({ title: "Gagal", description: "Harap lengkapi semua kolom.", variant: "destructive" });
        return;
    }

    const tanggalFormatted = format(formDate, "yyyy-MM-dd");
    let updatedRecords = [...allRecords];

    if (editingRecord) {
        // Update existing record
        const index = updatedRecords.findIndex(r => r.id === editingRecord.id);
        if (index > -1) {
            updatedRecords[index].tanggal = tanggalFormatted;
            updatedRecords[index].status = formStatus;
        }
        toast({ title: "Kehadiran Diperbarui", description: `Data kehadiran untuk ${editingRecord.nama} telah diperbarui.` });
    } else {
        // Add new records
        formSelectedSiswa.forEach(nis => {
            const siswa = daftarSiswa.find(s => s.nis === nis);
            if (siswa) {
                const newRecord: Kehadiran = {
                    id: `${nis}-${tanggalFormatted}`,
                    nis: siswa.nis,
                    nama: siswa.nama,
                    kelas: siswa.kelas,
                    tanggal: tanggalFormatted,
                    status: formStatus,
                };
                // Remove existing record for the same student on the same day before adding new one
                updatedRecords = updatedRecords.filter(r => r.id !== newRecord.id);
                updatedRecords.push(newRecord);
            }
        });
        toast({ title: "Kehadiran Disimpan", description: `${formSelectedSiswa.length} catatan kehadiran telah disimpan.` });
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
              <CardTitle>Riwayat Kehadiran</CardTitle>
              <CardDescription>Gunakan filter untuk mencari data. Gunakan tombol aksi untuk mengelola catatan.</CardDescription>
            </div>
            <div className="flex items-center gap-2">
                <Input
                    type="date"
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                    className="w-fit"
                />
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
                <TableRow><TableCell colSpan={5} className="h-24 text-center">Tidak ada data kehadiran untuk filter yang dipilih.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader><DialogTitle>{editingRecord ? 'Edit' : 'Catat'} Kehadiran</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-4">
                 <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="tanggal-kehadiran" className="text-right">Tanggal</Label>
                    <Popover><PopoverTrigger asChild><Button variant={"outline"} className={cn("col-span-3 justify-start text-left font-normal",!formDate && "text-muted-foreground")}><CalendarIcon className="mr-2 h-4 w-4" />{formDate ? format(formDate, "PPP") : <span>Pilih tanggal</span>}</Button></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={formDate} onSelect={setFormDate} initialFocus /></PopoverContent></Popover>
                </div>
                 <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="kelas-form" className="text-right">Kelas</Label>
                     <Select value={formKelas} onValueChange={v => {setFormKelas(v); setFormSelectedSiswa([])}} disabled={!!editingRecord}>
                        <SelectTrigger id="kelas-form" className="col-span-3"><SelectValue placeholder="Pilih Kelas" /></SelectTrigger>
                        <SelectContent>{daftarKelas.map(k => <SelectItem key={k.id} value={k.nama}>{k.nama}</SelectItem>)}</SelectContent>
                    </Select>
                </div>
                {!editingRecord && (
                    <div className="grid grid-cols-4 items-start gap-4">
                        <Label className="text-right pt-2">Siswa</Label>
                        <ScrollArea className="col-span-3 h-48 rounded-md border">
                            <div className="p-4 space-y-2">
                            {siswaDiKelasTerpilih.length > 0 ? siswaDiKelasTerpilih.map(siswa => (
                                <div key={siswa.id} className="flex items-center space-x-2">
                                <Checkbox
                                    id={`siswa-${siswa.id}`}
                                    checked={formSelectedSiswa.includes(siswa.nis)}
                                    onCheckedChange={(checked) => {
                                        setFormSelectedSiswa(prev => checked ? [...prev, siswa.nis] : prev.filter(nis => nis !== siswa.nis));
                                    }}
                                />
                                <label htmlFor={`siswa-${siswa.id}`} className="text-sm font-medium leading-none">{siswa.nama}</label>
                                </div>
                            )) : <p className="text-sm text-muted-foreground">Pilih kelas untuk menampilkan siswa.</p>}
                            </div>
                        </ScrollArea>
                    </div>
                )}
                 <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="status-kehadiran" className="text-right">Status</Label>
                    <Select onValueChange={(value) => setFormStatus(value as Kehadiran['status'])} value={formStatus}><SelectTrigger className="col-span-3" id="status-kehadiran"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Hadir">Hadir</SelectItem><SelectItem value="Sakit">Sakit</SelectItem><SelectItem value="Izin">Izin</SelectItem><SelectItem value="Alpa">Alpa</SelectItem></SelectContent></Select>
                </div>
            </div>
            <DialogFooter>
                <DialogClose asChild><Button variant="outline">Batal</Button></DialogClose>
                <Button onClick={handleSave}>Simpan</Button>
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

    

    