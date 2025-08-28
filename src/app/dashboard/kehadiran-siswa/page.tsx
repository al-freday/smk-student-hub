
"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Save, UserCheck, UserX, Thermometer, MailQuestion, UserMinus, BookOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format, getDay } from "date-fns";
import { id } from "date-fns/locale";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { getSourceData, updateSourceData } from "@/lib/data-manager";
import { tataTertibData } from "@/lib/tata-tertib-data";

type KehadiranStatus = 'Hadir' | 'Sakit' | 'Izin' | 'Alpa' | 'Bolos';

interface Kehadiran {
  id: string; // Composite key: nis-tanggal-sesi
  nis: string;
  nama: string;
  kelas: string;
  tanggal: string;
  sesi: string; // Jam Ke-
  mataPelajaran: string;
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

interface Jadwal {
  id: number;
  hari: string;
  sesi: string;
  kelas: string;
  mataPelajaran: string;
  guru: string;
}

interface CatatanPelanggaran {
  id: number;
  tanggal: string;
  nis: string;
  namaSiswa: string;
  kelas: string;
  pelanggaran: string;
  poin: number;
  guruPelapor: string;
  tindakanAwal: string;
  status: 'Dilaporkan' | 'Ditindaklanjuti Wali Kelas' | 'Diteruskan ke BK' | 'Selesai';
}


const statusOptions: { value: KehadiranStatus; icon: React.ElementType }[] = [
    { value: 'Hadir', icon: UserCheck },
    { value: 'Sakit', icon: Thermometer },
    { value: 'Izin', icon: MailQuestion },
    { value: 'Alpa', icon: UserX },
    { value: 'Bolos', icon: UserMinus },
];

const daftarHari = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

export default function KehadiranSiswaPage() {
  const { toast } = useToast();
  const [allRecords, setAllRecords] = useState<Kehadiran[]>([]);
  const [daftarSiswa, setDaftarSiswa] = useState<Siswa[]>([]);
  const [daftarKelas, setDaftarKelas] = useState<Kelas[]>([]);
  const [jadwalPelajaran, setJadwalPelajaran] = useState<Jadwal[]>([]);
  const [currentUser, setCurrentUser] = useState<{ nama: string; role: string } | null>(null);

  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [selectedKelas, setSelectedKelas] = useState<string>("");
  const [selectedSesi, setSelectedSesi] = useState<string>("");

  const [attendanceState, setAttendanceState] = useState<Map<string, KehadiranStatus>>(new Map());

  const loadData = () => {
    setAllRecords(getSourceData('kehadiranSiswaPerSesi', []));
    setDaftarSiswa(getSourceData('siswaData', []));
    setDaftarKelas(getSourceData('kelasData', []));
    setCurrentUser(getSourceData('currentUser', null));

    const teachersData = getSourceData('teachersData', {});
    const guruMapelList = teachersData.guru_mapel || [];
    const generatedJadwal: Jadwal[] = [];
    if (Array.isArray(guruMapelList)) {
        guruMapelList.forEach((guru: any) => {
            if (Array.isArray(guru.teachingAssignments)) {
                guru.teachingAssignments.forEach((assignment: any) => {
                    generatedJadwal.push({
                        id: assignment.id,
                        hari: assignment.day,
                        sesi: assignment.session,
                        kelas: assignment.className,
                        mataPelajaran: assignment.subject,
                        guru: guru.nama,
                    });
                });
            }
        });
    }
    setJadwalPelajaran(generatedJadwal);
  };

  useEffect(() => {
    loadData();
    window.addEventListener('dataUpdated', loadData);
    return () => window.removeEventListener('dataUpdated', loadData);
  }, []);
  
  const jadwalHariIni = useMemo(() => {
    if (!selectedKelas || !selectedDate) return [];
    const hariTerpilih = daftarHari[getDay(new Date(selectedDate))];
    return jadwalPelajaran.filter(j => j.kelas === selectedKelas && j.hari === hariTerpilih);
  }, [selectedKelas, selectedDate, jadwalPelajaran]);

  useEffect(() => {
      setSelectedSesi("");
  }, [selectedKelas, selectedDate]);
  

  useEffect(() => {
    if (selectedKelas && selectedDate && selectedSesi) {
      const newAttendanceState = new Map<string, KehadiranStatus>();
      const studentsInClass = daftarSiswa.filter(s => s.kelas === selectedKelas);
      studentsInClass.forEach(siswa => {
        const record = allRecords.find(r => r.nis === siswa.nis && r.tanggal === selectedDate && r.sesi === selectedSesi);
        newAttendanceState.set(siswa.nis, record ? record.status : 'Hadir');
      });
      setAttendanceState(newAttendanceState);
    }
  }, [selectedKelas, selectedDate, selectedSesi, daftarSiswa, allRecords]);


  const handleStatusChange = (nis: string, status: KehadiranStatus) => {
    setAttendanceState(prev => new Map(prev).set(nis, status));
  };

  const handleSaveAttendance = () => {
    if (!selectedKelas || !selectedSesi) {
        toast({ title: "Gagal", description: "Silakan pilih kelas dan jam pelajaran.", variant: "destructive" });
        return;
    }
    
    const jadwalTerpilih = jadwalHariIni.find(j => j.sesi === selectedSesi);
    if (!jadwalTerpilih) {
        toast({ title: "Gagal", description: "Jadwal tidak valid.", variant: "destructive" });
        return;
    }

    const studentsInClass = daftarSiswa.filter(s => s.kelas === selectedKelas);
    const newRecordsForSession: Kehadiran[] = [];
    const newViolations: CatatanPelanggaran[] = [];
    const riwayatPelanggaran = getSourceData('riwayatPelanggaran', []);

    studentsInClass.forEach(siswa => {
        const status = attendanceState.get(siswa.nis) || 'Hadir';
        newRecordsForSession.push({
            id: `${siswa.nis}-${selectedDate}-${selectedSesi}`,
            nis: siswa.nis,
            nama: siswa.nama,
            kelas: siswa.kelas,
            tanggal: selectedDate,
            sesi: selectedSesi,
            mataPelajaran: jadwalTerpilih.mataPelajaran,
            status: status,
            guruPencatat: currentUser?.nama || 'Guru',
        });
        
        // --- LOGIKA OTOMATISASI PELANGGARAN ---
        if (status === 'Alpa' || status === 'Bolos') {
            const ruleDescription = status === 'Alpa' 
                ? "Tidak hadir tanpa keterangan (alpha) berulang." 
                : "Bolos pelajaran.";
            const rule = tataTertibData.kehadiran.sedang.find(r => r.deskripsi === ruleDescription) || tataTertibData.kehadiran.berat.find(r => r.deskripsi.includes("alpha"));

            if(rule){
                const newId = riwayatPelanggaran.length > 0 ? Math.max(...riwayatPelanggaran.map((p: CatatanPelanggaran) => p.id)) + 1 : 1;
                newViolations.push({
                    id: newId,
                    tanggal: selectedDate,
                    nis: siswa.nis,
                    namaSiswa: siswa.nama,
                    kelas: siswa.kelas,
                    pelanggaran: rule.deskripsi,
                    poin: rule.poin,
                    guruPelapor: currentUser?.nama || 'Sistem Absensi',
                    tindakanAwal: `Dicatat otomatis dari absensi mapel ${jadwalTerpilih.mataPelajaran}`,
                    status: 'Dilaporkan'
                });
            }
        }
    });

    const otherRecords = allRecords.filter(r => !(r.tanggal === selectedDate && r.kelas === selectedKelas && r.sesi === selectedSesi));
    const updatedRecords = [...otherRecords, ...newRecordsForSession];
    updateSourceData('kehadiranSiswaPerSesi', updatedRecords);

    if(newViolations.length > 0){
        const updatedViolations = [...riwayatPelanggaran, ...newViolations];
        updateSourceData('riwayatPelanggaran', updatedViolations);
        toast({
            title: "Absensi & Pelanggaran Disimpan",
            description: `${newViolations.length} pelanggaran absensi (Alpa/Bolos) telah dicatat secara otomatis.`,
        });
    } else {
        toast({
            title: "Kehadiran Disimpan",
            description: `Absensi kelas ${selectedKelas} pada jam ke-${selectedSesi} telah diperbarui.`,
        });
    }
  };

  const studentsToDisplay = useMemo(() => {
    if (!selectedKelas) return [];
    return daftarSiswa.filter(s => s.kelas === selectedKelas);
  }, [selectedKelas, daftarSiswa]);

  return (
    <div className="flex-1 space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Lembar Kehadiran Siswa Per Sesi</h2>
        <p className="text-muted-foreground">Isi dan kelola data kehadiran siswa berdasarkan jam pelajaran.</p>
      </div>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
             <div>
                <CardTitle>Pilih Kelas, Tanggal & Sesi</CardTitle>
                <CardDescription>Pilih detail sesi untuk mengisi atau melihat absensi.</CardDescription>
            </div>
             <div className="flex items-end gap-4 flex-wrap">
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
                <div className="space-y-2">
                    <Label htmlFor="filter-sesi">Jam Pelajaran</Label>
                    <Select value={selectedSesi} onValueChange={setSelectedSesi} disabled={jadwalHariIni.length === 0}>
                        <SelectTrigger id="filter-sesi" className="w-[240px]">
                            <SelectValue placeholder="Pilih Jam Pelajaran" />
                        </SelectTrigger>
                        <SelectContent>
                            {jadwalHariIni.map(j => (
                                <SelectItem key={j.id} value={j.sesi}>
                                    Jam ke-{j.sesi} ({j.mataPelajaran})
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <Button onClick={handleSaveAttendance}>
                    <Save className="mr-2 h-4 w-4" /> Simpan
                </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
            {selectedKelas && selectedSesi ? (
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
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                </Table>
            ) : (
                <div className="text-center text-muted-foreground py-10">
                    <BookOpen className="mx-auto h-12 w-12" />
                    <p className="mt-4 font-semibold">Silakan pilih kelas, tanggal, dan jam pelajaran.</p>
                    <p className="text-sm">
                        {jadwalHariIni.length === 0 && selectedKelas && selectedDate ? `Tidak ada jadwal pelajaran untuk kelas ${selectedKelas} pada hari ini.` : 'Pilih sesi untuk memulai absensi.'}
                    </p>
                </div>
            )}
        </CardContent>
      </Card>
    </div>
  );
}
