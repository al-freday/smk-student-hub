
"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Save, Calendar as CalendarIcon, UserCheck, UserX, Thermometer, MailQuestion, SkipForward, Clock4 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { getSourceData, updateSourceData } from "@/lib/data-manager";

type KehadiranStatus = 'Hadir' | 'Sakit' | 'Izin' | 'Alpa' | 'Bolos';

interface Kehadiran {
  id: string; // Composite key: nis-tanggal-sesi
  nis: string;
  nama: string;
  kelas: string;
  tanggal: string;
  sesi: string;
  status: KehadiranStatus;
  guruPencatat: string;
}

interface Siswa {
  id: number;
  nis: string;
  nama: string;
  kelas: string;
}

interface TeachingAssignment {
    id: number;
    subject: string;
    className: string;
    day: string;
    session: string;
}

interface JadwalMengajar {
    guru: string;
    mapel: string;
    kelas: string;
    hari: string;
    sesi: string;
}

const statusOptions: { value: KehadiranStatus; icon: React.ElementType }[] = [
    { value: 'Hadir', icon: UserCheck },
    { value: 'Sakit', icon: Thermometer },
    { value: 'Izin', icon: MailQuestion },
    { value: 'Alpa', icon: UserX },
    { value: 'Bolos', icon: SkipForward },
];

const getDayNameFromDate = (dateString: string) => {
    const date = new Date(dateString);
    const dayIndex = date.getDay();
    const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
    return days[dayIndex];
};


export default function KehadiranSiswaPage() {
  const { toast } = useToast();
  const [allRecords, setAllRecords] = useState<Kehadiran[]>([]);
  const [daftarSiswa, setDaftarSiswa] = useState<Siswa[]>([]);
  const [currentUser, setCurrentUser] = useState<{ nama: string; role: string } | null>(null);
  
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [jadwalHariIni, setJadwalHariIni] = useState<JadwalMengajar[]>([]);
  
  // Map<sesi-kelas, Map<nis, status>>
  const [attendanceState, setAttendanceState] = useState<Map<string, Map<string, KehadiranStatus>>>(new Map());

  const loadData = () => {
    setAllRecords(getSourceData('kehadiranSiswa', []));
    setDaftarSiswa(getSourceData('siswaData', []));
    setCurrentUser(getSourceData('currentUser', null));
  };
  
  useEffect(() => {
    loadData();
    window.addEventListener('dataUpdated', loadData);
    return () => window.removeEventListener('dataUpdated', loadData);
  }, []);

  useEffect(() => {
    if (!currentUser) return;
    
    const teachersData = getSourceData('teachersData', {});
    const guruMapel = teachersData.guru_mapel || [];
    const myAssignments: TeachingAssignment[] = guruMapel.find((g: any) => g.nama === currentUser.nama)?.teachingAssignments || [];
    
    const dayName = getDayNameFromDate(selectedDate);
    const filteredJadwal = myAssignments
        .filter(a => a.day === dayName)
        .map(a => ({
            guru: currentUser.nama,
            mapel: a.subject,
            kelas: a.className,
            hari: a.day,
            sesi: a.session,
        }))
        .sort((a,b) => a.sesi.localeCompare(b.sesi));

    setJadwalHariIni(filteredJadwal);
    
    // Initialize attendance state for today's schedule
    const newAttendanceState = new Map<string, Map<string, KehadiranStatus>>();
    filteredJadwal.forEach(jadwal => {
      const sessionKey = `${jadwal.sesi}-${jadwal.kelas}`;
      const sessionMap = new Map<string, KehadiranStatus>();
      const studentsInClass = daftarSiswa.filter(s => s.kelas === jadwal.kelas);

      studentsInClass.forEach(siswa => {
        const record = allRecords.find(r => r.nis === siswa.nis && r.tanggal === selectedDate && r.sesi === jadwal.sesi);
        sessionMap.set(siswa.nis, record ? record.status : 'Hadir');
      });
      newAttendanceState.set(sessionKey, sessionMap);
    });
    setAttendanceState(newAttendanceState);

  }, [selectedDate, currentUser, daftarSiswa, allRecords]);

  const handleStatusChange = (sessionKey: string, nis: string, status: KehadiranStatus) => {
    const newAttendanceState = new Map(attendanceState);
    const sessionMap = new Map(newAttendanceState.get(sessionKey));
    sessionMap.set(nis, status);
    newAttendanceState.set(sessionKey, sessionMap);
    setAttendanceState(newAttendanceState);
  };

  const handleSaveAttendance = (jadwal: JadwalMengajar) => {
    const sessionKey = `${jadwal.sesi}-${jadwal.kelas}`;
    const sessionAttendance = attendanceState.get(sessionKey);

    if (!sessionAttendance) {
      toast({ title: "Gagal", description: "Data absensi tidak ditemukan.", variant: "destructive" });
      return;
    }

    const studentsInClass = daftarSiswa.filter(s => s.kelas === jadwal.kelas);
    const newRecordsForSession: Kehadiran[] = [];

    studentsInClass.forEach(siswa => {
      const status = sessionAttendance.get(siswa.nis) || 'Hadir';
      newRecordsForSession.push({
        id: `${siswa.nis}-${selectedDate}-${jadwal.sesi}`,
        nis: siswa.nis,
        nama: siswa.nama,
        kelas: siswa.kelas,
        tanggal: selectedDate,
        sesi: jadwal.sesi,
        status: status,
        guruPencatat: currentUser?.nama || 'Guru',
      });
    });

    const otherRecords = allRecords.filter(r => !(r.tanggal === selectedDate && r.kelas === jadwal.kelas && r.sesi === jadwal.sesi));
    
    const updatedRecords = [...otherRecords, ...newRecordsForSession];
    updateSourceData('kehadiranSiswa', updatedRecords);
    
    toast({
      title: "Kehadiran Disimpan",
      description: `Data untuk kelas ${jadwal.kelas} sesi ${jadwal.sesi} telah disimpan.`,
    });
  };
  
  const getBadgeVariant = (status: KehadiranStatus) => {
    switch(status) {
        case 'Hadir': return 'default';
        case 'Sakit': return 'secondary';
        case 'Izin': return 'secondary';
        case 'Bolos': return 'outline';
        case 'Alpa': return 'destructive';
        default: return 'outline';
    }
  };

  const isSessionRecorded = (jadwal: JadwalMengajar) => {
    return allRecords.some(r => r.kelas === jadwal.kelas && r.tanggal === selectedDate && r.sesi === jadwal.sesi);
  };

  return (
    <div className="flex-1 space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Daftar Hadir Sesuai Jadwal</h2>
        <p className="text-muted-foreground">Pilih tanggal untuk melihat jadwal mengajar Anda dan mengisi absensi per sesi.</p>
      </div>
       <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
             <div>
                <CardTitle>Pilih Tanggal Absensi</CardTitle>
                <CardDescription>Jadwal mengajar Anda akan muncul di bawah.</CardDescription>
            </div>
             <div className="flex items-center gap-4">
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
            </div>
          </div>
        </CardHeader>
      </Card>

      {jadwalHariIni.length > 0 ? (
        jadwalHariIni.map(jadwal => {
            const sessionKey = `${jadwal.sesi}-${jadwal.kelas}`;
            const studentsInClass = daftarSiswa.filter(s => s.kelas === jadwal.kelas);
            const isRecorded = isSessionRecorded(jadwal);
            const sessionState = attendanceState.get(sessionKey);

            return (
              <Card key={sessionKey}>
                  <CardHeader>
                     <div className="flex justify-between items-start">
                        <div>
                            <CardTitle className="text-xl">{jadwal.mapel} - Kelas {jadwal.kelas}</CardTitle>
                            <CardDescription className="flex items-center gap-2 mt-1">
                                <Clock4 className="h-4 w-4" /> Jam Pelajaran Ke-{jadwal.sesi}
                            </CardDescription>
                        </div>
                        {!isRecorded && (
                            <Button onClick={() => handleSaveAttendance(jadwal)}>
                                <Save className="mr-2 h-4 w-4" /> Simpan Absensi Sesi Ini
                            </Button>
                        )}
                     </div>
                  </CardHeader>
                  <CardContent>
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
                            {studentsInClass.map((siswa, index) => (
                              <TableRow key={siswa.id}>
                                <TableCell>{index + 1}</TableCell>
                                <TableCell>{siswa.nis}</TableCell>
                                <TableCell className="font-medium">{siswa.nama}</TableCell>
                                <TableCell className="text-center">
                                   {isRecorded ? (
                                        <Badge variant={getBadgeVariant(sessionState?.get(siswa.nis) || 'Hadir')}>
                                            {sessionState?.get(siswa.nis)}
                                        </Badge>
                                   ) : (
                                        <RadioGroup
                                            value={sessionState?.get(siswa.nis) || 'Hadir'}
                                            onValueChange={(value) => handleStatusChange(sessionKey, siswa.nis, value as KehadiranStatus)}
                                            className="flex justify-center space-x-2 sm:space-x-4"
                                        >
                                            {statusOptions.map(status => (
                                                <div key={status.value} className="flex items-center space-x-2">
                                                    <RadioGroupItem value={status.value} id={`${siswa.nis}-${status.value}-${jadwal.sesi}`} />
                                                    <Label htmlFor={`${siswa.nis}-${status.value}-${jadwal.sesi}`}>{status.value}</Label>
                                                </div>
                                            ))}
                                        </RadioGroup>
                                   )}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                      </Table>
                  </CardContent>
              </Card>
            )
        })
      ) : (
        <Card>
            <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">Tidak ada jadwal mengajar untuk Anda pada tanggal yang dipilih.</p>
            </CardContent>
        </Card>
      )}
    </div>
  );
}
