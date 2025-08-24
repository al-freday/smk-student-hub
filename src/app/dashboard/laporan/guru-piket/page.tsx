
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Printer, UserCheck, PlusCircle, Send } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

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

  // Form state
  const [selectedGuru, setSelectedGuru] = useState<GuruMapel | null>(null);
  const [statusKehadiran, setStatusKehadiran] = useState<TeacherAttendanceRecord['status']>('Hadir');
  const [keterangan, setKeterangan] = useState("");
  
  const attendanceStorageKey = 'teacherAttendanceData';

  useEffect(() => {
    // Muat data guru mapel dari localStorage
    try {
      const savedTeachers = localStorage.getItem('teachersData');
      if (savedTeachers) {
        const teachersData = JSON.parse(savedTeachers);
        setDaftarGuruMapel(teachersData.guru_mapel || []);
      }
      
      const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
      if(user.nama) setCurrentUser(user);

      const savedAttendance = localStorage.getItem(attendanceStorageKey);
      const allRecords: TeacherAttendanceRecord[] = savedAttendance ? JSON.parse(savedAttendance) : [];
      setRiwayatLaporan(allRecords);

      const today = format(new Date(), "yyyy-MM-dd");
      setLaporanHariIni(allRecords.filter(rec => rec.tanggal === today));

    } catch (error) {
      console.error("Gagal memuat data guru:", error);
      toast({
        title: "Gagal Memuat Data",
        description: "Tidak dapat memuat daftar guru dari penyimpanan.",
        variant: "destructive",
      });
    }
  }, [toast]);

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
    const updatedLaporanHariIni = [...laporanHariIni, newRecord];

    setRiwayatLaporan(updatedRiwayat);
    setLaporanHariIni(updatedLaporanHariIni);
    localStorage.setItem(attendanceStorageKey, JSON.stringify(updatedRiwayat));

    toast({ title: "Sukses", description: `Kehadiran untuk ${selectedGuru.nama} telah dicatat.` });
    
    // Reset form
    setSelectedGuru(null);
    setStatusKehadiran('Hadir');
    setKeterangan("");
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
                        value={selectedGuru?.id.toString()}
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
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
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
    </div>
  );
}

    