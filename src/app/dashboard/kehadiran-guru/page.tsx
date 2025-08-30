
"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { format, getDay } from "date-fns";
import { getSourceData, updateSourceData } from "@/lib/data-manager";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save, History, PlusCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

// --- Interface Definitions ---
interface TeacherAttendanceRecord {
  id: string; // Composite key: guruId-tanggal-sesi
  tanggal: string;
  guruId: number | string;
  namaGuru: string;
  sesi: string;
  kelas: string;
  mataPelajaran: string;
  status: 'Hadir' | 'Tidak Hadir' | 'Sakit' | 'Izin';
  keterangan: string;
  dicatatOleh: string;
}

interface Jadwal {
  id: number;
  hari: string;
  sesi: string;
  kelas: string;
  mataPelajaran: string;
  guru: string;
  guruId: number | string;
}

const daftarHari = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

export default function KehadiranGuruPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("pencatatan");
  
  // --- Data States ---
  const [allRecords, setAllRecords] = useState<TeacherAttendanceRecord[]>([]);
  const [jadwalPelajaran, setJadwalPelajaran] = useState<Jadwal[]>([]);
  const [currentUser, setCurrentUser] = useState<{ nama: string; role: string } | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  
  // --- Filter and Form States ---
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [attendanceState, setAttendanceState] = useState<{ [key: string]: Partial<TeacherAttendanceRecord> }>({});
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(() => {
    setIsLoading(true);
    try {
        setAllRecords(getSourceData('teacherAttendanceData', []));
        setCurrentUser(getSourceData('currentUser', null));
        setUserRole(localStorage.getItem('userRole'));

        const teachersData = getSourceData('teachersData', {});
        const guruMapelList = teachersData.guru_mapel || [];
        const generatedJadwal: Jadwal[] = [];

        if (Array.isArray(guruMapelList)) {
            guruMapelList.forEach((guru: any) => {
                if (Array.isArray(guru.teachingAssignments)) {
                    guru.teachingAssignments.forEach((assignment: any) => {
                        generatedJadwal.push({
                            ...assignment,
                            guru: guru.nama,
                            guruId: guru.id,
                        });
                    });
                }
            });
        }
        setJadwalPelajaran(generatedJadwal);
    } catch (error) {
        console.error("Gagal memuat data:", error);
        toast({ title: "Gagal Memuat Data", variant: "destructive" });
    } finally {
        setIsLoading(false);
    }
  }, [toast]);
  
  useEffect(() => {
    loadData();
    window.addEventListener('dataUpdated', loadData);
    return () => window.removeEventListener('dataUpdated', loadData);
  }, [loadData]);
  
  const jadwalHariIni = useMemo(() => {
    if (!selectedDate) return [];
    const hariTerpilih = daftarHari[getDay(new Date(selectedDate))];
    return jadwalPelajaran
        .filter(j => j.hari === hariTerpilih)
        .sort((a,b) => a.sesi.localeCompare(b.sesi) || a.kelas.localeCompare(b.kelas));
  }, [selectedDate, jadwalPelajaran]);

  useEffect(() => {
    const newAttendanceState: { [key: string]: Partial<TeacherAttendanceRecord> } = {};
    jadwalHariIni.forEach(jadwal => {
        const recordId = `${jadwal.guruId}-${selectedDate}-${jadwal.sesi}`;
        const existingRecord = allRecords.find(r => r.id === recordId);
        newAttendanceState[recordId] = existingRecord || {
            status: 'Hadir',
            keterangan: '',
        };
    });
    setAttendanceState(newAttendanceState);
  }, [jadwalHariIni, selectedDate, allRecords]);
  
  const handleStateChange = (recordId: string, field: 'status' | 'keterangan', value: string) => {
    setAttendanceState(prev => ({
        ...prev,
        [recordId]: {
            ...prev[recordId],
            [field]: value,
        }
    }));
  };
  
  const handleSaveAttendance = () => {
    const newRecordsForDay: TeacherAttendanceRecord[] = [];
    
    jadwalHariIni.forEach(jadwal => {
        const recordId = `${jadwal.guruId}-${selectedDate}-${jadwal.sesi}`;
        const state = attendanceState[recordId];

        if (state) {
            newRecordsForDay.push({
                id: recordId,
                tanggal: selectedDate,
                guruId: jadwal.guruId,
                namaGuru: jadwal.guru,
                sesi: jadwal.sesi,
                kelas: jadwal.kelas,
                mataPelajaran: jadwal.mataPelajaran,
                status: state.status || 'Hadir',
                keterangan: state.status === 'Hadir' ? '' : state.keterangan || '',
                dicatatOleh: currentUser?.nama || "Guru",
            });
        }
    });

    const otherRecords = allRecords.filter(r => r.tanggal !== selectedDate);
    const updatedRecords = [...otherRecords, ...newRecordsForDay];
    
    updateSourceData('teacherAttendanceData', updatedRecords);
    toast({ title: "Kehadiran Disimpan", description: `Data kehadiran guru untuk tanggal ${selectedDate} telah diperbarui.` });
  };
  
  // For Riwayat Tab
  const filteredRecords = useMemo(() => {
    return allRecords.filter(r => r.tanggal === selectedDate).sort((a,b) => a.namaGuru.localeCompare(b.namaGuru));
  }, [selectedDate, allRecords]);

  const getBadgeVariant = (status: TeacherAttendanceRecord['status']) => {
    switch (status) {
      case 'Hadir': return 'default';
      case 'Tidak Hadir': return 'destructive';
      case 'Sakit': return 'secondary';
      case 'Izin': return 'secondary';
      default: return 'outline';
    }
  };

  if (isLoading) {
    return <div className="flex-1 flex justify-center items-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }
  
  const canRecordAttendance = ['guru_piket', 'guru_pendamping', 'wakasek_kesiswaan'].includes(userRole || '');

  return (
    <div className="flex-1 space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Manajemen Kehadiran Guru</h2>
        <p className="text-muted-foreground">Pantau dan kelola data kehadiran guru mengajar.</p>
      </div>
      
      <Tabs value={canRecordAttendance ? activeTab : "riwayat"} onValueChange={setActiveTab}>
        <div className="flex justify-between items-end">
          {canRecordAttendance && (
            <TabsList>
              <TabsTrigger value="pencatatan"><PlusCircle className="mr-2 h-4 w-4" />Pencatatan Kehadiran</TabsTrigger>
              <TabsTrigger value="riwayat"><History className="mr-2 h-4 w-4" />Riwayat Kehadiran</TabsTrigger>
            </TabsList>
          )}
          <div className="flex items-center gap-2">
              <Label htmlFor="filter-tanggal" className="text-sm font-medium">Tanggal:</Label>
              <Input
                  id="filter-tanggal"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-fit"
              />
          </div>
        </div>

        {/* TAB PENCATATAN (UNTUK GURU PIKET, PENDAMPING, WAKASEK) */}
        <TabsContent value="pencatatan">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Formulir Kehadiran Guru Mengajar</CardTitle>
                    <CardDescription>
                      Daftar ini dibuat otomatis dari jadwal. Tandai status dan beri keterangan jika guru tidak hadir.
                    </CardDescription>
                  </div>
                  <Button onClick={handleSaveAttendance}><Save className="mr-2 h-4 w-4"/> Simpan Kehadiran</Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Guru & Jadwal</TableHead>
                    <TableHead className="w-[180px]">Status</TableHead>
                    <TableHead>Keterangan (jika tidak hadir)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {jadwalHariIni.length > 0 ? (
                    jadwalHariIni.map((jadwal) => {
                       const recordId = `${jadwal.guruId}-${selectedDate}-${jadwal.sesi}`;
                       const state = attendanceState[recordId];
                       const isHadir = state?.status === 'Hadir';

                       return (
                          <TableRow key={jadwal.id}>
                            <TableCell>
                                <p className="font-medium">{jadwal.guru}</p>
                                <p className="text-xs text-muted-foreground">
                                    Jam ke-{jadwal.sesi} • {jadwal.kelas} • {jadwal.mataPelajaran}
                                </p>
                            </TableCell>
                            <TableCell>
                                <Select 
                                    value={state?.status || 'Hadir'} 
                                    onValueChange={(value) => handleStateChange(recordId, 'status', value)}
                                >
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Hadir">Hadir</SelectItem>
                                        <SelectItem value="Tidak Hadir">Tidak Hadir</SelectItem>
                                        <SelectItem value="Sakit">Sakit</SelectItem>
                                        <SelectItem value="Izin">Izin</SelectItem>
                                    </SelectContent>
                                </Select>
                            </TableCell>
                            <TableCell>
                                <Textarea 
                                    placeholder="Contoh: Ada tugas luar..."
                                    value={state?.keterangan || ''}
                                    onChange={(e) => handleStateChange(recordId, 'keterangan', e.target.value)}
                                    disabled={isHadir}
                                    className={isHadir ? 'bg-muted/50' : ''}
                                />
                            </TableCell>
                          </TableRow>
                       )
                    })
                  ) : (
                     <TableRow>
                        <TableCell colSpan={3} className="h-24 text-center">
                            Tidak ada jadwal mengajar untuk tanggal yang dipilih.
                        </TableCell>
                     </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* TAB RIWAYAT (UNTUK SEMUA) */}
        <TabsContent value="riwayat">
           <Card>
            <CardHeader>
              <CardTitle>Riwayat Kehadiran Guru</CardTitle>
              <CardDescription>Data kehadiran guru yang telah dicatat.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama Guru</TableHead>
                    <TableHead>Jadwal</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Keterangan</TableHead>
                    <TableHead>Dicatat Oleh</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecords.length > 0 ? (
                    filteredRecords.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell className="font-medium">{record.namaGuru}</TableCell>
                        <TableCell>Jam ke-{record.sesi} • {record.mataPelajaran}</TableCell>
                        <TableCell><Badge variant={getBadgeVariant(record.status)}>{record.status}</Badge></TableCell>
                        <TableCell>{record.keterangan}</TableCell>
                        <TableCell>{record.dicatatOleh}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow><TableCell colSpan={5} className="h-24 text-center">Tidak ada data kehadiran untuk tanggal yang dipilih.</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
