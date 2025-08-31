
"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Save, UserCheck, UserX, Thermometer, MailQuestion, UserMinus, BookOpen, CalendarSearch, ListChecks, CalendarDays } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format, getDay, getDaysInMonth, getYear, getMonth, startOfWeek, addDays, subDays } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { getSourceData, updateSourceData } from "@/lib/data-manager";
import { tataTertibData } from "@/lib/tata-tertib-data";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

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

interface RecapData {
    nama: string;
    hadir: number;
    sakit: number;
    izin: number;
    alpa: number;
    persentase: number;
}

const statusOptions: { value: KehadiranStatus; icon: React.ElementType; color: string }[] = [
    { value: 'Hadir', icon: UserCheck, color: "border-green-500" },
    { value: 'Sakit', icon: Thermometer, color: "border-yellow-500" },
    { value: 'Izin', icon: MailQuestion, color: "border-yellow-500" },
    { value: 'Alpa', icon: UserX, color: "border-red-500" },
    { value: 'Bolos', icon: UserMinus, color: "border-red-500" },
];

const dayNameToIndex: { [key: string]: number } = { "Minggu": 0, "Senin": 1, "Selasa": 2, "Rabu": 3, "Kamis": 4, "Jumat": 5, "Sabtu": 6 };
const daftarHari = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat"];
const daftarBulan = Array.from({ length: 12 }, (_, i) => ({ value: i, label: new Date(0, i).toLocaleString('id-ID', { month: 'long' }) }));
const daftarTahun = [getYear(new Date()) - 1, getYear(new Date()), getYear(new Date()) + 1];

export default function KehadiranSiswaPage() {
  const { toast } = useToast();
  const [allRecords, setAllRecords] = useState<Kehadiran[]>([]);
  const [daftarSiswa, setDaftarSiswa] = useState<Siswa[]>([]);
  const [daftarKelas, setDaftarKelas] = useState<Kelas[]>([]);
  const [jadwalPelajaran, setJadwalPelajaran] = useState<Jadwal[]>([]);
  const [currentUser, setCurrentUser] = useState<{ nama: string; role: string } | null>(null);

  // --- State untuk Pencatatan Harian ---
  const [selectedDayName, setSelectedDayName] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedKelas, setSelectedKelas] = useState<string>("");
  const [selectedSesi, setSelectedSesi] = useState<string>("");
  const [attendanceState, setAttendanceState] = useState<Map<string, KehadiranStatus>>(new Map());
  
  // --- State untuk Rekap Bulanan ---
  const [selectedBulan, setSelectedBulan] = useState<number>(getMonth(new Date()));
  const [selectedTahun, setSelectedTahun] = useState<number>(getYear(new Date()));
  const [recapData, setRecapData] = useState<RecapData[]>([]);

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
    if (!selectedKelas || !selectedDayName) return [];
    return jadwalPelajaran.filter(j => j.kelas === selectedKelas && j.hari === selectedDayName);
  }, [selectedKelas, selectedDayName, jadwalPelajaran]);
  
  const handleDayChange = useCallback((dayName: string) => {
    setSelectedDayName(dayName);
    setSelectedSesi("");
    
    const today = new Date();
    const todayDayIndex = getDay(today); // Minggu = 0, Senin = 1
    const targetDayIndex = dayNameToIndex[dayName];
    
    // Hitung perbedaan hari dari hari ini ke hari target
    const dayDifference = targetDayIndex - todayDayIndex;
    
    // Tambahkan atau kurangi hari dari tanggal hari ini
    const targetDate = addDays(today, dayDifference);
    
    setSelectedDate(format(targetDate, "yyyy-MM-dd"));
  }, []);

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

  // Efek untuk menghitung rekap bulanan
  useEffect(() => {
    if (!selectedKelas) {
        setRecapData([]);
        return;
    }
    const siswaDiKelas = daftarSiswa.filter(s => s.kelas === selectedKelas);
    const jadwalDiKelas = jadwalPelajaran.filter(j => j.kelas === selectedKelas);
    const totalHariEfektif = getDaysInMonth(new Date(selectedTahun, selectedBulan));
    
    // Asumsi sederhana: 10 sesi per hari, 5 hari kerja seminggu
    const totalSesiBulanIni = jadwalDiKelas.length * 4; // Sangat kasar, butuh kalender akademik untuk akurat

    const newRecapData = siswaDiKelas.map(siswa => {
        const recordsBulanIni = allRecords.filter(r => 
            r.nis === siswa.nis &&
            getMonth(new Date(r.tanggal)) === selectedBulan &&
            getYear(new Date(r.tanggal)) === selectedTahun
        );
        
        const hadir = recordsBulanIni.filter(r => r.status === 'Hadir').length;
        const sakit = recordsBulanIni.filter(r => r.status === 'Sakit').length;
        const izin = recordsBulanIni.filter(r => r.status === 'Izin').length;
        const alpa = recordsBulanIni.filter(r => r.status === 'Alpa' || r.status === 'Bolos').length;
        const totalDicatat = hadir + sakit + izin + alpa;
        
        // Persentase dihitung dari total sesi yang tercatat untuk siswa tsb
        const persentase = totalDicatat > 0 ? (hadir / totalDicatat) * 100 : 0;
        
        return { nama: siswa.nama, hadir, sakit, izin, alpa, persentase };
    });
    setRecapData(newRecapData);

  }, [selectedKelas, selectedBulan, selectedTahun, allRecords, daftarSiswa, jadwalPelajaran]);


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
        <h2 className="text-3xl font-bold tracking-tight">Kehadiran Siswa</h2>
        <p className="text-muted-foreground">Catat kehadiran harian atau lihat rekapitulasi bulanan.</p>
      </div>

      <Tabs defaultValue="pencatatan" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="pencatatan"><ListChecks className="mr-2 h-4 w-4" /> Pencatatan Harian</TabsTrigger>
            <TabsTrigger value="rekap"><CalendarSearch className="mr-2 h-4 w-4" /> Rekap Bulanan</TabsTrigger>
        </TabsList>
        
        {/* TAB PENCATATAN HARIAN */}
        <TabsContent value="pencatatan" className="space-y-6">
            <Card>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                     <div>
                        <CardTitle>Panel Kontrol Absensi</CardTitle>
                        <CardDescription>Pilih kelas, hari, dan sesi untuk memulai absensi.</CardDescription>
                    </div>
                     <div className="flex items-end gap-4 flex-wrap">
                        <div className="space-y-1">
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
                        <div className="space-y-1">
                            <Label htmlFor="filter-hari">Hari</Label>
                            <Select value={selectedDayName} onValueChange={handleDayChange}>
                                <SelectTrigger id="filter-hari" className="w-[150px]">
                                    <SelectValue placeholder="Pilih Hari" />
                                </SelectTrigger>
                                <SelectContent>
                                    {daftarHari.map(hari => <SelectItem key={hari} value={hari}>{hari}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1">
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
                  {selectedDate && <p className="text-sm text-muted-foreground pt-2">Absensi untuk tanggal: <span className="font-semibold text-primary">{format(new Date(selectedDate), "EEEE, dd MMMM yyyy")}</span></p>}
                </CardHeader>
            </Card>

            {selectedKelas && selectedSesi ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {studentsToDisplay.map((siswa) => {
                    const status = attendanceState.get(siswa.nis) || 'Hadir';
                    const statusInfo = statusOptions.find(opt => opt.value === status);
                    return (
                    <Card key={siswa.id} className={cn("transition-all border-2", statusInfo?.color)}>
                        <CardContent className="p-3 flex flex-col items-center text-center gap-3">
                            <div className="flex-1">
                                <p className="font-semibold text-sm leading-tight">{siswa.nama}</p>
                                <p className="text-xs text-muted-foreground">{siswa.nis}</p>
                            </div>
                            <Select value={status} onValueChange={(value: KehadiranStatus) => handleStatusChange(siswa.nis, value)}>
                                <SelectTrigger className="h-9">
                                <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                {statusOptions.map(opt => (
                                    <SelectItem key={opt.value} value={opt.value}>
                                    <div className="flex items-center gap-2">
                                        <opt.icon className="h-4 w-4" />
                                        <span>{opt.value}</span>
                                    </div>
                                    </SelectItem>
                                ))}
                                </SelectContent>
                            </Select>
                        </CardContent>
                    </Card>
                    )
                })}
                </div>
            ) : (
                <Card>
                    <CardContent className="p-10 text-center text-muted-foreground">
                        <BookOpen className="mx-auto h-12 w-12" />
                        <p className="mt-4 font-semibold">Silakan pilih kelas, hari, dan jam pelajaran untuk memulai.</p>
                        <p className="text-sm">
                            {jadwalHariIni.length === 0 && selectedKelas && selectedDayName ? `Tidak ada jadwal pelajaran untuk kelas ${selectedKelas} pada hari ${selectedDayName}.` : 'Daftar siswa akan muncul di sini setelah Anda memilih sesi.'}
                        </p>
                    </CardContent>
                </Card>
            )}
        </TabsContent>

        {/* TAB REKAP BULANAN */}
        <TabsContent value="rekap">
            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                         <div>
                            <CardTitle>Rekapitulasi Kehadiran Bulanan</CardTitle>
                            <CardDescription>Lihat ringkasan kehadiran siswa untuk periode yang dipilih.</CardDescription>
                        </div>
                        <div className="flex items-end gap-2 flex-wrap">
                            <div className="space-y-1">
                                <Label htmlFor="recap-kelas">Kelas</Label>
                                <Select value={selectedKelas} onValueChange={setSelectedKelas}>
                                    <SelectTrigger id="recap-kelas" className="w-[180px]"><SelectValue placeholder="Pilih Kelas" /></SelectTrigger>
                                    <SelectContent>{daftarKelas.map(k => <SelectItem key={k.id} value={k.nama}>{k.nama}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                             <div className="space-y-1">
                                <Label htmlFor="recap-bulan">Bulan</Label>
                                <Select value={String(selectedBulan)} onValueChange={v => setSelectedBulan(Number(v))}>
                                    <SelectTrigger id="recap-bulan" className="w-[150px]"><SelectValue /></SelectTrigger>
                                    <SelectContent>{daftarBulan.map(b => <SelectItem key={b.value} value={String(b.value)}>{b.label}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="recap-tahun">Tahun</Label>
                                <Select value={String(selectedTahun)} onValueChange={v => setSelectedTahun(Number(v))}>
                                    <SelectTrigger id="recap-tahun" className="w-[120px]"><SelectValue /></SelectTrigger>
                                    <SelectContent>{daftarTahun.map(t => <SelectItem key={t} value={String(t)}>{t}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {selectedKelas ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nama Siswa</TableHead>
                                    <TableHead className="text-center">Hadir</TableHead>
                                    <TableHead className="text-center">Sakit</TableHead>
                                    <TableHead className="text-center">Izin</TableHead>
                                    <TableHead className="text-center">Alpa/Bolos</TableHead>
                                    <TableHead className="text-center">Kehadiran (%)</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {recapData.length > 0 ? recapData.map(siswa => (
                                    <TableRow key={siswa.nama}>
                                        <TableCell className="font-medium">{siswa.nama}</TableCell>
                                        <TableCell className="text-center">{siswa.hadir}</TableCell>
                                        <TableCell className="text-center">{siswa.sakit}</TableCell>
                                        <TableCell className="text-center">{siswa.izin}</TableCell>
                                        <TableCell className="text-center">{siswa.alpa}</TableCell>
                                        <TableCell className="text-center"><Badge variant={siswa.persentase < 75 ? "destructive" : "default"}>{siswa.persentase.toFixed(1)}%</Badge></TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-24 text-center">Tidak ada data kehadiran tercatat untuk periode ini.</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    ) : (
                         <div className="p-10 text-center text-muted-foreground">
                            <p>Silakan pilih kelas untuk melihat rekapitulasi.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

    
