
"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Save, Calendar as CalendarIcon, UserCheck, UserX, Thermometer, MailQuestion, UserMinus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { getSourceData, updateSourceData } from "@/lib/data-manager";

type KehadiranStatus = 'Hadir' | 'Sakit' | 'Izin' | 'Alpa' | 'Bolos';

interface Kehadiran {
  id: string; // Composite key: nis-tanggal
  nis: string;
  nama: string;
  kelas: string;
  tanggal: string;
  status: KehadiranStatus;
  guruPencatat: string;
}

interface Siswa {
  id: number;
  nis: string;
  nama: string;
  kelas: string;
}

interface Kelas {
  id: number;
  nama: string;
}

const statusOptions: { value: KehadiranStatus; icon: React.ElementType }[] = [
    { value: 'Hadir', icon: UserCheck },
    { value: 'Sakit', icon: Thermometer },
    { value: 'Izin', icon: MailQuestion },
    { value: 'Alpa', icon: UserX },
    { value: 'Bolos', icon: UserMinus },
];

export default function KehadiranSiswaPage() {
  const { toast } = useToast();
  const [allRecords, setAllRecords] = useState<Kehadiran[]>([]);
  const [daftarSiswa, setDaftarSiswa] = useState<Siswa[]>([]);
  const [daftarKelas, setDaftarKelas] = useState<Kelas[]>([]);
  const [currentUser, setCurrentUser] = useState<{ nama: string; role: string } | null>(null);

  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [selectedKelas, setSelectedKelas] = useState<string>("");

  // Map<nis, status>
  const [attendanceState, setAttendanceState] = useState<Map<string, KehadiranStatus>>(new Map());

  const loadData = () => {
    setAllRecords(getSourceData('kehadiranSiswa', []));
    setDaftarSiswa(getSourceData('siswaData', []));
    setDaftarKelas(getSourceData('kelasData', []));
    setCurrentUser(getSourceData('currentUser', null));
  };

  useEffect(() => {
    loadData();
    window.addEventListener('dataUpdated', loadData);
    return () => window.removeEventListener('dataUpdated', loadData);
  }, []);

  useEffect(() => {
    if (selectedKelas) {
      const newAttendanceState = new Map<string, KehadiranStatus>();
      const studentsInClass = daftarSiswa.filter(s => s.kelas === selectedKelas);
      studentsInClass.forEach(siswa => {
        const record = allRecords.find(r => r.nis === siswa.nis && r.tanggal === selectedDate);
        newAttendanceState.set(siswa.nis, record ? record.status : 'Hadir');
      });
      setAttendanceState(newAttendanceState);
    }
  }, [selectedKelas, selectedDate, daftarSiswa, allRecords]);


  const handleStatusChange = (nis: string, status: KehadiranStatus) => {
    setAttendanceState(prev => new Map(prev).set(nis, status));
  };

  const handleSaveAttendance = () => {
    if (!selectedKelas) {
        toast({ title: "Gagal", description: "Silakan pilih kelas terlebih dahulu.", variant: "destructive" });
        return;
    }

    const studentsInClass = daftarSiswa.filter(s => s.kelas === selectedKelas);
    const newRecordsForClass: Kehadiran[] = [];

    studentsInClass.forEach(siswa => {
        const status = attendanceState.get(siswa.nis) || 'Hadir';
        newRecordsForClass.push({
            id: `${siswa.nis}-${selectedDate}`,
            nis: siswa.nis,
            nama: siswa.nama,
            kelas: siswa.kelas,
            tanggal: selectedDate,
            status: status,
            guruPencatat: currentUser?.nama || 'Guru',
        });
    });

    // Hapus record lama untuk tanggal dan kelas yang sama, lalu tambahkan yang baru
    const otherRecords = allRecords.filter(r => !(r.tanggal === selectedDate && r.kelas === selectedKelas));
    const updatedRecords = [...otherRecords, ...newRecordsForClass];
    
    updateSourceData('kehadiranSiswa', updatedRecords);

    toast({
        title: "Kehadiran Disimpan",
        description: `Data absensi untuk kelas ${selectedKelas} pada tanggal ${selectedDate} telah diperbarui.`,
    });
  };

  const studentsToDisplay = useMemo(() => {
    if (!selectedKelas) return [];
    return daftarSiswa.filter(s => s.kelas === selectedKelas);
  }, [selectedKelas, daftarSiswa]);

  const isRecorded = useMemo(() => {
      return allRecords.some(r => r.kelas === selectedKelas && r.tanggal === selectedDate);
  }, [selectedKelas, selectedDate, allRecords]);
  
  const getBadgeVariant = (status: KehadiranStatus) => {
    switch(status) {
        case 'Hadir': return 'default';
        case 'Sakit': return 'secondary';
        case 'Izin': return 'secondary';
        case 'Alpa': return 'destructive';
        case 'Bolos': return 'destructive';
        default: return 'outline';
    }
  };


  return (
    <div className="flex-1 space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Lembar Kehadiran Siswa</h2>
        <p className="text-muted-foreground">Isi dan kelola data kehadiran harian siswa per kelas.</p>
      </div>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
             <div>
                <CardTitle>Pilih Kelas & Tanggal</CardTitle>
                <CardDescription>Pilih kelas dan tanggal untuk mengisi atau melihat absensi.</CardDescription>
            </div>
             <div className="flex items-end gap-4">
                <div className="space-y-2">
                    <Label htmlFor="filter-kelas">Kelas</Label>
                    <Select value={selectedKelas} onValueChange={setSelectedKelas}>
                        <SelectTrigger id="filter-kelas" className="w-[180px]">
                            <SelectValue placeholder="Pilih Kelas" />
                        </SelectTrigger>
                        <SelectContent>
                            {daftarKelas.map(k => <SelectItem key={k.id} value={k.nama}>{k.nama}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="filter-tanggal">Tanggal</Label>
                    <Input
                        id="filter-tanggal"
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="w-fit"
                    />
                </div>
                <Button onClick={handleSaveAttendance}>
                    <Save className="mr-2 h-4 w-4" /> Simpan
                </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
            {selectedKelas ? (
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
                        {studentsToDisplay.map((siswa, index) => (
                          <TableRow key={siswa.id}>
                            <TableCell>{index + 1}</TableCell>
                            <TableCell>{siswa.nis}</TableCell>
                            <TableCell className="font-medium">{siswa.nama}</TableCell>
                            <TableCell className="text-center">
                               {isRecorded ? (
                                    <Badge variant={getBadgeVariant(attendanceState.get(siswa.nis) || 'Hadir')}>
                                        {attendanceState.get(siswa.nis)}
                                    </Badge>
                               ) : (
                                    <RadioGroup
                                        value={attendanceState.get(siswa.nis) || 'Hadir'}
                                        onValueChange={(value) => handleStatusChange(siswa.nis, value as KehadiranStatus)}
                                        className="flex justify-center space-x-4"
                                    >
                                        {statusOptions.map(status => (
                                            <div key={status.value} className="flex items-center space-x-2">
                                                <RadioGroupItem value={status.value} id={`${siswa.nis}-${status.value}`} />
                                                <Label htmlFor={`${siswa.nis}-${status.value}`}>{status.value}</Label>
                                            </div>
                                        ))}
                                    </RadioGroup>
                               )}
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                </Table>
            ) : (
                <div className="text-center text-muted-foreground py-10">
                    <p>Silakan pilih kelas dan tanggal untuk memulai absensi.</p>
                </div>
            )}
        </CardContent>
      </Card>
    </div>
  );
}
