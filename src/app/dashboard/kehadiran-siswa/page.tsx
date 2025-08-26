
"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getSourceData, updateSourceData } from "@/lib/data-manager";
import { Save, CalendarIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

type KehadiranStatus = 'Hadir' | 'Sakit' | 'Izin' | 'Alpa';

interface Kehadiran {
  id: string; // Composite key: nis-tanggal
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
  
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [selectedKelas, setSelectedKelas] = useState<string>("");

  const [attendanceState, setAttendanceState] = useState<Map<string, KehadiranStatus>>(new Map());

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
  
  const studentsInSelectedClass = useMemo(() => {
    if (!selectedKelas) return [];
    return daftarSiswa.filter(s => s.kelas === selectedKelas);
  }, [selectedKelas, daftarSiswa]);

  useEffect(() => {
    const newAttendanceState = new Map<string, KehadiranStatus>();
    studentsInSelectedClass.forEach(siswa => {
      const record = allRecords.find(r => r.nis === siswa.nis && r.tanggal === selectedDate);
      newAttendanceState.set(siswa.nis, record ? record.status : 'Hadir');
    });
    setAttendanceState(newAttendanceState);
  }, [selectedDate, selectedKelas, studentsInSelectedClass, allRecords]);

  const handleStatusChange = (nis: string, status: KehadiranStatus) => {
    const newAttendanceState = new Map(attendanceState);
    newAttendanceState.set(nis, status);
    setAttendanceState(newAttendanceState);
  };

  const handleSaveAttendance = () => {
    if (!selectedKelas) {
      toast({
        title: "Gagal Menyimpan",
        description: "Silakan pilih kelas terlebih dahulu.",
        variant: "destructive"
      });
      return;
    }

    const newRecords: Kehadiran[] = [];
    studentsInSelectedClass.forEach(siswa => {
      const status = attendanceState.get(siswa.nis) || 'Hadir';
      newRecords.push({
        id: `${siswa.nis}-${selectedDate}`,
        nis: siswa.nis,
        nama: siswa.nama,
        kelas: siswa.kelas,
        tanggal: selectedDate,
        status: status,
      });
    });

    const updatedRecords = [
      ...allRecords.filter(r => !newRecords.some(nr => nr.id === r.id)),
      ...newRecords
    ];
    
    updateSourceData('kehadiranSiswa', updatedRecords);
    setAllRecords(updatedRecords);
    
    toast({
      title: "Kehadiran Disimpan",
      description: `Data kehadiran untuk kelas ${selectedKelas} pada tanggal ${selectedDate} telah disimpan.`,
    });
  };

  return (
    <div className="flex-1 space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Manajemen Kehadiran Siswa</h2>
        <p className="text-muted-foreground">Pilih tanggal dan kelas untuk mencatat absensi harian siswa.</p>
      </div>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Lembar Absensi Digital</CardTitle>
              <CardDescription>
                {selectedKelas ? `Menampilkan daftar siswa untuk kelas ${selectedKelas}` : "Pilih kelas untuk menampilkan daftar siswa."}
              </CardDescription>
            </div>
             <div className="flex items-center gap-4">
                <div className="space-y-2">
                    <Label htmlFor="filter-tanggal">Tanggal Absensi</Label>
                    <Input
                        id="filter-tanggal"
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="w-fit"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="filter-kelas">Pilih Kelas</Label>
                    <Select value={selectedKelas} onValueChange={setSelectedKelas}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Pilih Kelas" />
                        </SelectTrigger>
                        <SelectContent>
                            {daftarKelas.map(k => <SelectItem key={k.id} value={k.nama}>{k.nama}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-4">
             <div className="flex items-center gap-2 text-muted-foreground">
                <CalendarIcon className="h-5 w-5"/>
                <span className="font-medium text-lg">{format(new Date(selectedDate), "eeee, dd MMMM yyyy")}</span>
            </div>
            <Button onClick={handleSaveAttendance} disabled={!selectedKelas}>
              <Save className="mr-2 h-4 w-4" />
              Simpan Kehadiran
            </Button>
          </div>
          <div className="border rounded-md">
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead className="w-[50px]">No.</TableHead>
                    <TableHead>NIS</TableHead>
                    <TableHead>Nama Siswa</TableHead>
                    <TableHead className="text-center">Status Kehadiran</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {studentsInSelectedClass.length > 0 ? (
                    studentsInSelectedClass.map((siswa, index) => (
                    <TableRow key={siswa.id}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>{siswa.nis}</TableCell>
                        <TableCell className="font-medium">{siswa.nama}</TableCell>
                        <TableCell>
                            <RadioGroup
                                value={attendanceState.get(siswa.nis) || 'Hadir'}
                                onValueChange={(value) => handleStatusChange(siswa.nis, value as KehadiranStatus)}
                                className="flex justify-center space-x-4"
                            >
                                {statusOptions.map(status => (
                                <div key={status} className="flex items-center space-x-2">
                                    <RadioGroupItem value={status} id={`${siswa.nis}-${status}`} />
                                    <Label htmlFor={`${siswa.nis}-${status}`}>{status}</Label>
                                </div>
                                ))}
                            </RadioGroup>
                        </TableCell>
                    </TableRow>
                    ))
                ) : (
                    <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center">
                            {selectedKelas ? "Tidak ada siswa di kelas ini." : "Silakan pilih kelas terlebih dahulu."}
                        </TableCell>
                    </TableRow>
                )}
                </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
