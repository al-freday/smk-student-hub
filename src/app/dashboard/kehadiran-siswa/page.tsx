
"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, Calendar as CalendarIcon, UserCheck, UserX, Thermometer, MailQuestion } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";


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

interface AttendanceSummary {
    hadir: number;
    sakit: number;
    izin: number;
    alpa: number;
}

const statusOptions: KehadiranStatus[] = ['Hadir', 'Sakit', 'Izin', 'Alpa'];

export default function KehadiranSiswaPage() {
  const { toast } = useToast();
  const [allRecords, setAllRecords] = useState<Kehadiran[]>([]);
  const [daftarSiswa, setDaftarSiswa] = useState<Siswa[]>([]);
  const [daftarKelas, setDaftarKelas] = useState<Kelas[]>([]);
  const [schoolName, setSchoolName] = useState("SMK Student Hub");
  
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [selectedKelas, setSelectedKelas] = useState<string>("");

  const [attendanceState, setAttendanceState] = useState<Map<string, KehadiranStatus>>(new Map());
  
  const dataExistsForSelection = useMemo(() => {
    if (!selectedKelas || !selectedDate) return false;
    return allRecords.some(r => r.kelas === selectedKelas && r.tanggal === selectedDate);
  }, [allRecords, selectedKelas, selectedDate]);


  const loadData = () => {
    const savedKehadiran = localStorage.getItem('kehadiranSiswa');
    const savedSiswa = localStorage.getItem('siswaData');
    const savedKelas = localStorage.getItem('kelasData');
    const savedTeachers = localStorage.getItem('teachersData');

    setAllRecords(savedKehadiran ? JSON.parse(savedKehadiran) : []);
    setDaftarSiswa(savedSiswa ? JSON.parse(savedSiswa) : []);
    setDaftarKelas(savedKelas ? JSON.parse(savedKelas) : []);
    
    if (savedTeachers) {
      const teachersData = JSON.parse(savedTeachers);
      if (teachersData.schoolInfo && teachersData.schoolInfo.schoolName) {
        setSchoolName(teachersData.schoolInfo.schoolName);
      }
    }
  };
  
  useEffect(() => {
    loadData();
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

  const attendanceSummary: AttendanceSummary = useMemo(() => {
    const summary: AttendanceSummary = { hadir: 0, sakit: 0, izin: 0, alpa: 0 };
    studentsInSelectedClass.forEach(siswa => {
        const status = attendanceState.get(siswa.nis);
        switch (status) {
            case 'Hadir': summary.hadir++; break;
            case 'Sakit': summary.sakit++; break;
            case 'Izin': summary.izin++; break;
            case 'Alpa': summary.alpa++; break;
        }
    });
    return summary;
  }, [attendanceState, studentsInSelectedClass]);


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

    const newRecordsForDay: Kehadiran[] = [];
    studentsInSelectedClass.forEach(siswa => {
      const status = attendanceState.get(siswa.nis) || 'Hadir';
      newRecordsForDay.push({
        id: `${siswa.nis}-${selectedDate}`,
        nis: siswa.nis,
        nama: siswa.nama,
        kelas: siswa.kelas,
        tanggal: selectedDate,
        status: status,
      });
    });

    const otherRecords = allRecords.filter(r => !(r.tanggal === selectedDate && r.kelas === selectedKelas));
    
    const updatedRecords = [...otherRecords, ...newRecordsForDay];
    
    localStorage.setItem('kehadiranSiswa', JSON.stringify(updatedRecords));
    setAllRecords(updatedRecords); // Update state lokal untuk memicu re-render
    
    toast({
      title: "Kehadiran Disimpan",
      description: `Data kehadiran untuk kelas ${selectedKelas} pada tanggal ${selectedDate} telah disimpan.`,
    });
  };
  
  const getBadgeVariant = (status: KehadiranStatus) => {
    switch(status) {
        case 'Hadir': return 'default';
        case 'Sakit': return 'secondary';
        case 'Izin': return 'secondary';
        case 'Alpa': return 'destructive';
        default: return 'outline';
    }
  };

  return (
    <div className="flex-1 space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Daftar Hadir Siswa {schoolName}</h2>
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
            {!dataExistsForSelection && (
                <Button onClick={handleSaveAttendance} disabled={!selectedKelas}>
                    <Save className="mr-2 h-4 w-4" />
                    Simpan Kehadiran
                </Button>
            )}
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
                        <TableCell className="text-center">
                           {dataExistsForSelection ? (
                                <Badge variant={getBadgeVariant(attendanceState.get(siswa.nis) || 'Hadir')}>
                                    {attendanceState.get(siswa.nis)}
                                </Badge>
                           ) : (
                                <RadioGroup
                                    value={attendanceState.get(siswa.nis) || 'Hadir'}
                                    onValueChange={(value) => handleStatusChange(siswa.nis, value as KehadiranStatus)}
                                    className="flex justify-center space-x-2 sm:space-x-4"
                                >
                                    {statusOptions.map(status => (
                                    <div key={status} className="flex items-center space-x-2">
                                        <RadioGroupItem value={status} id={`${siswa.nis}-${status}`} />
                                        <Label htmlFor={`${siswa.nis}-${status}`}>{status}</Label>
                                    </div>
                                    ))}
                                </RadioGroup>
                           )}
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
      
       {selectedKelas && studentsInSelectedClass.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Rekapitulasi Kehadiran</CardTitle>
              <CardDescription>
                Ringkasan kehadiran untuk kelas {selectedKelas} pada tanggal {selectedDate}.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-4">
                <div className="p-4 bg-secondary rounded-lg flex items-center gap-4">
                    <UserCheck className="h-8 w-8 text-green-500"/>
                    <div>
                        <p className="text-2xl font-bold">{attendanceSummary.hadir}</p>
                        <p className="text-sm text-muted-foreground">Hadir</p>
                    </div>
                </div>
                 <div className="p-4 bg-secondary rounded-lg flex items-center gap-4">
                    <Thermometer className="h-8 w-8 text-blue-500"/>
                    <div>
                        <p className="text-2xl font-bold">{attendanceSummary.sakit}</p>
                        <p className="text-sm text-muted-foreground">Sakit</p>
                    </div>
                </div>
                 <div className="p-4 bg-secondary rounded-lg flex items-center gap-4">
                    <MailQuestion className="h-8 w-8 text-yellow-500"/>
                    <div>
                        <p className="text-2xl font-bold">{attendanceSummary.izin}</p>
                        <p className="text-sm text-muted-foreground">Izin</p>
                    </div>
                </div>
                 <div className="p-4 bg-secondary rounded-lg flex items-center gap-4">
                    <UserX className="h-8 w-8 text-destructive"/>
                    <div>
                        <p className="text-2xl font-bold">{attendanceSummary.alpa}</p>
                        <p className="text-sm text-muted-foreground">Alpa</p>
                    </div>
                </div>
            </CardContent>
          </Card>
      )}

    </div>
  );
}
