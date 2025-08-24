
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Printer, UserCheck, PlusCircle, Send, Trash2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { getSourceData } from "@/lib/data-manager";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

// Data Types
interface GuruMapel {
  id: number;
  nama: string;
  mapel?: string;
}

interface TeacherAttendanceRecord {
  id: number;
  tanggal: string;
  namaGuru: string;
  mataPelajaran: string;
  status: 'Hadir' | 'Tidak Hadir' | 'Sakit' | 'Izin';
  keterangan: string;
  dicatatOleh: string;
}

const statusOptions: TeacherAttendanceRecord['status'][] = ['Hadir', 'Tidak Hadir', 'Sakit', 'Izin'];

export default function LaporanGuruPiketPage() {
  const { toast } = useToast();
  const [currentUser, setCurrentUser] = useState({ nama: "Guru Piket" });
  const [daftarGuruMapel, setDaftarGuruMapel] = useState<GuruMapel[]>([]);
  const [laporanHariIni, setLaporanHariIni] = useState<TeacherAttendanceRecord[]>([]);
  const [riwayatLaporan, setRiwayatLaporan] = useState<TeacherAttendanceRecord[]>([]);
  const [itemToDelete, setItemToDelete] = useState<TeacherAttendanceRecord | null>(null);

  // Form state
  const [selectedGuru, setSelectedGuru] = useState<GuruMapel | null>(null);
  const [statusKehadiran, setStatusKehadiran] = useState<TeacherAttendanceRecord['status']>('Hadir');
  const [keterangan, setKeterangan] = useState("");
  
  const attendanceStorageKey = 'teacherAttendanceData';

  useEffect(() => {
    const teachersData = getSourceData('teachersData', {});
    setDaftarGuruMapel(teachersData.guru_mapel || []);
    
    const user = getSourceData('currentUser', {});
    if(user.nama) setCurrentUser(user);

    const allRecords: TeacherAttendanceRecord[] = getSourceData(attendanceStorageKey, []);
    setRiwayatLaporan(allRecords);

    const today = format(new Date(), "yyyy-MM-dd");
    setLaporanHariIni(allRecords.filter(rec => rec.tanggal === today));
  }, []);

  const handleTambahCatatan = () => {
    if (!selectedGuru) {
      toast({ title: "Gagal", description: "Silakan pilih guru terlebih dahulu.", variant: "destructive" });
      return;
    }

    const newRecord: TeacherAttendanceRecord = {
      id: Date.now(),
      tanggal: format(new Date(), "yyyy-MM-dd"),
      namaGuru: selectedGuru.nama,
      mataPelajaran: selectedGuru.mapel || "N/A",
      status: statusKehadiran,
      keterangan: keterangan || "-",
      dicatatOleh: currentUser.nama,
    };
    
    const updatedRiwayat = [...riwayatLaporan, newRecord];
    setRiwayatLaporan(updatedRiwayat);
    localStorage.setItem(attendanceStorageKey, JSON.stringify(updatedRiwayat));
    
    // Perbarui laporan hari ini juga
    const today = format(new Date(), "yyyy-MM-dd");
    setLaporanHariIni(updatedRiwayat.filter(rec => rec.tanggal === today));

    toast({ title: "Sukses", description: `Kehadiran untuk ${selectedGuru.nama} telah dicatat.` });
    
    // Reset form
    setSelectedGuru(null);
    setStatusKehadiran('Hadir');
    setKeterangan("");
  };
  
  const handleDelete = () => {
      if (!itemToDelete) return;
      const updatedRiwayat = riwayatLaporan.filter(rec => rec.id !== itemToDelete.id);
      setRiwayatLaporan(updatedRiwayat);
      localStorage.setItem(attendanceStorageKey, JSON.stringify(updatedRiwayat));
      
      const today = format(new Date(), "yyyy-MM-dd");
      setLaporanHariIni(updatedRiwayat.filter(rec => rec.tanggal === today));
      
      toast({ title: "Dihapus", description: `Catatan untuk ${itemToDelete.namaGuru} telah dihapus.` });
      setItemToDelete(null);
  };


  const handlePrint = () => {
    window.print();
  };
  
  const handleSendReport = () => {
    toast({
      title: "Laporan Terkirim",
      description: "Laporan piket dan absensi guru hari ini telah dikirim ke Wakasek Kesiswaan.",
    });
  };

  return (
    <div className="flex-1 space-y-6">
      <div className="flex items-center justify-between print:hidden">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Laporan Guru Piket</h2>
          <p className="text-muted-foreground">Catat kehadiran guru mengajar dan laporkan kejadian penting selama piket.</p>
        </div>
        <div className="flex gap-2">
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" />
              Cetak
            </Button>
            <Button onClick={handleSendReport}>
              <Send className="mr-2 h-4 w-4" />
              Kirim Laporan ke Wakasek
            </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck />
            Pencatatan Kehadiran Guru Mengajar
          </CardTitle>
          <CardDescription>
            Pilih guru, status kehadiran, dan tambahkan keterangan jika perlu.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                 <div className="space-y-2 md:col-span-1">
                    <Label htmlFor="guru-select">Pilih Guru & Mata Pelajaran</Label>
                    <Select
                        onValueChange={(value) => {
                            const guru = daftarGuruMapel.find(g => g.id.toString() === value);
                            setSelectedGuru(guru || null);
                        }}
                        value={selectedGuru?.id.toString() || ""}
                    >
                        <SelectTrigger id="guru-select"><SelectValue placeholder="Pilih Guru..." /></SelectTrigger>
                        <SelectContent>
                        {daftarGuruMapel.map(guru => (
                            <SelectItem key={guru.id} value={guru.id.toString()}>
                                {guru.nama} ({guru.mapel})
                            </SelectItem>
                        ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="status-select">Status Kehadiran</Label>
                    <Select onValueChange={(value) => setStatusKehadiran(value as any)} value={statusKehadiran}>
                        <SelectTrigger id="status-select"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            {statusOptions.map(status => (
                                <SelectItem key={status} value={status}>{status}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="keterangan">Keterangan</Label>
                    <Input id="keterangan" value={keterangan} onChange={e => setKeterangan(e.target.value)} placeholder="Contoh: Digantikan oleh..." />
                </div>
                 <Button onClick={handleTambahCatatan}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Tambah Catatan
                </Button>
            </div>
          <Separator className="my-6"/>
           <div>
              <h3 className="text-lg font-medium mb-2">Laporan Kehadiran Hari Ini ({format(new Date(), "eeee, dd MMMM yyyy")})</h3>
               <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nama Guru</TableHead>
                      <TableHead>Mata Pelajaran</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Keterangan</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {laporanHariIni.length > 0 ? (
                      laporanHariIni.map((laporan) => (
                        <TableRow key={laporan.id}>
                          <TableCell className="font-medium">{laporan.namaGuru}</TableCell>
                          <TableCell>{laporan.mataPelajaran}</TableCell>
                          <TableCell>{laporan.status}</TableCell>
                          <TableCell>{laporan.keterangan}</TableCell>
                          <TableCell className="text-right">
                              <Button variant="ghost" size="icon" onClick={() => setItemToDelete(laporan)}>
                                  <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                          Belum ada catatan kehadiran guru untuk hari ini.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
          </div>
        </CardContent>
      </Card>
      
       <AlertDialog open={!!itemToDelete} onOpenChange={() => setItemToDelete(null)}>
          <AlertDialogContent>
              <AlertDialogHeader>
                  <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
                  <AlertDialogDescription>
                     Tindakan ini tidak dapat dibatalkan. Catatan kehadiran untuk <strong>{itemToDelete?.namaGuru}</strong> akan dihapus.
                  </AlertDialogDescription>
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

    