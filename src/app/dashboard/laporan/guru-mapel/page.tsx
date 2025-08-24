
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Printer, Eye, Loader2, MoreHorizontal, CheckCircle, RefreshCw, UserCheck, BookOpen } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

// --- Tipe Data untuk Laporan (Wakasek View) ---
interface GuruMapelFromWakasek { id: number; nama: string; mapel?: string; }
type ReportStatus = 'Terkirim' | 'Diproses' | 'Diterima';
interface ReceivedReport { id: number; guru: string; mapel: string; tanggal: string; catatan: string; status: ReportStatus; }

// --- Tipe Data untuk Manajemen Guru Mapel ---
interface Siswa { id: number; nis: string; nama: string; kelas: string; }
interface NilaiSiswa { nilaiHarian: string; nilaiUjian: string; catatanMateri: string; }
interface AbsenSiswa { status: 'Hadir' | 'Sakit' | 'Izin' | 'Alpa'; }

export default function LaporanGuruMapelPage() {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // --- State untuk Wakasek View ---
  const [receivedReports, setReceivedReports] = useState<ReceivedReport[]>([]);
  const reportStatusStorageKey = 'guruMapelReportsStatus';

  // --- State untuk Guru Mapel View ---
  const [myTeachingAssignments, setMyTeachingAssignments] = useState<GuruMapelFromWakasek[]>([]);
  const [allSiswa, setAllSiswa] = useState<Siswa[]>([]);

  // --- State untuk Dialog Nilai & Absen ---
  const [isNilaiDialogOpen, setIsNilaiDialogOpen] = useState(false);
  const [selectedSiswa, setSelectedSiswa] = useState<Siswa | null>(null);
  const [selectedAssignment, setSelectedAssignment] = useState<GuruMapelFromWakasek | null>(null);
  const [nilaiFormData, setNilaiFormData] = useState<Partial<NilaiSiswa>>({});
  const [absenFormData, setAbsenFormData] = useState<Partial<AbsenSiswa>>({});

  useEffect(() => {
    const role = localStorage.getItem('userRole');
    setUserRole(role);
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');

    if (role === 'wakasek_kesiswaan') {
        loadWakasekData();
    } else if (role === 'guru_mapel') {
        loadGuruMapelData(currentUser.nama);
        const siswaData = localStorage.getItem('siswaData');
        if (siswaData) setAllSiswa(JSON.parse(siswaData));
    } else {
        setIsLoading(false);
    }
  }, []);

  // --- Logika untuk Wakasek View ---
  const loadWakasekData = () => {
    try {
      const savedTeachers = localStorage.getItem('teachersData');
      const savedStatuses = localStorage.getItem(reportStatusStorageKey);
      const statuses = savedStatuses ? JSON.parse(savedStatuses) : {};
      if (savedTeachers) {
        const teachersData = JSON.parse(savedTeachers);
        const guruMapelList: GuruMapelFromWakasek[] = teachersData.guru_mapel || [];
        const reports = guruMapelList.map((guru, index) => ({
          id: guru.id, guru: guru.nama, mapel: guru.mapel || `Mapel ${index + 1}`,
          tanggal: format(new Date(new Date().setDate(new Date().getDate() - index)), "yyyy-MM-dd"),
          catatan: `Laporan rutin untuk mata pelajaran ${guru.mapel || `Mapel ${index + 1}`}.`,
          status: statuses[guru.id] || 'Terkirim',
        }));
        setReceivedReports(reports);
      }
    } catch (error) { console.error("Gagal memuat data guru mapel:", error); } 
    finally { setIsLoading(false); }
  };

  const handleStatusChange = (id: number, status: ReportStatus) => {
    const updatedReports = receivedReports.map(report => report.id === id ? { ...report, status } : report);
    setReceivedReports(updatedReports);
    const savedStatuses = localStorage.getItem(reportStatusStorageKey);
    const statuses = savedStatuses ? JSON.parse(savedStatuses) : {};
    statuses[id] = status;
    localStorage.setItem(reportStatusStorageKey, JSON.stringify(statuses));
    toast({ title: "Status Diperbarui", description: `Laporan telah ditandai sebagai ${status}.` });
  };

  const getStatusBadgeVariant = (status: ReportStatus) => {
    switch (status) {
      case 'Diterima': return 'default';
      case 'Diproses': return 'secondary';
      default: return 'outline';
    }
  };

  // --- Logika untuk Guru Mapel View ---
  const loadGuruMapelData = (currentUserName: string) => {
    try {
        const savedTeachers = localStorage.getItem('teachersData');
        if (savedTeachers) {
            const teachersData = JSON.parse(savedTeachers);
            const assignments = teachersData.guru_mapel?.filter((guru: GuruMapelFromWakasek) => guru.nama === currentUserName);
            setMyTeachingAssignments(assignments || []);
        }
    } catch (error) {
        console.error("Gagal memuat data pengajaran:", error);
    }
    setIsLoading(false);
  };
  
  const handleOpenNilaiDialog = (siswa: Siswa, assignment: GuruMapelFromWakasek) => {
    setSelectedSiswa(siswa);
    setSelectedAssignment(assignment);
    const nilaiKey = `nilai_${assignment.id}_${siswa.id}`;
    const absenKey = `absen_${assignment.id}_${siswa.id}`;
    const savedNilai = localStorage.getItem(nilaiKey);
    const savedAbsen = localStorage.getItem(absenKey);
    setNilaiFormData(savedNilai ? JSON.parse(savedNilai) : {});
    setAbsenFormData(savedAbsen ? JSON.parse(savedAbsen) : {});
    setIsNilaiDialogOpen(true);
  };

  const handleSaveNilai = () => {
    if (!selectedSiswa || !selectedAssignment) return;
    const nilaiKey = `nilai_${selectedAssignment.id}_${selectedSiswa.id}`;
    const absenKey = `absen_${selectedAssignment.id}_${selectedSiswa.id}`;
    localStorage.setItem(nilaiKey, JSON.stringify(nilaiFormData));
    localStorage.setItem(absenKey, JSON.stringify(absenFormData));
    toast({ title: "Data Disimpan", description: `Nilai dan absen untuk ${selectedSiswa.nama} telah disimpan.` });
    setIsNilaiDialogOpen(false);
  };

  if (isLoading) {
    return (
      <div className="flex-1 space-y-6 flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="ml-4 text-muted-foreground">Memuat data...</p>
      </div>
    );
  }

  // --- Render Tampilan Guru Mapel ---
  if (userRole === 'guru_mapel') {
    return (
      <div className="flex-1 space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Penilaian & Laporan</h2>
          <p className="text-muted-foreground">Kelola nilai dan absensi siswa pada kelas dan mata pelajaran yang Anda ajar.</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Daftar Tugas Mengajar Anda</CardTitle>
            <CardDescription>Data ini diatur oleh Wakasek Kesiswaan. Pilih kelas untuk mulai menginput nilai.</CardDescription>
          </CardHeader>
          <CardContent>
            {myTeachingAssignments.length > 0 ? (
                <Accordion type="single" collapsible className="w-full">
                    {myTeachingAssignments.map((assignment) => {
                        const siswaDiKelas = allSiswa.filter(s => s.kelas === assignment.mapel?.split(" - ")[1]);
                        const assignmentLabel = `${assignment.mapel}`;
                        return (
                             <AccordionItem value={`item-${assignment.id}`} key={assignment.id}>
                                <AccordionTrigger>
                                    <span className="font-semibold text-lg">{assignmentLabel}</span>
                                </AccordionTrigger>
                                <AccordionContent>
                                    <Table>
                                        <TableHeader><TableRow><TableHead>NIS</TableHead><TableHead>Nama Siswa</TableHead><TableHead className="text-right">Aksi</TableHead></TableRow></TableHeader>
                                        <TableBody>
                                            {siswaDiKelas.map(siswa => (
                                                <TableRow key={siswa.id}>
                                                    <TableCell>{siswa.nis}</TableCell>
                                                    <TableCell className="font-medium">{siswa.nama}</TableCell>
                                                    <TableCell className="text-right">
                                                        <Button variant="outline" size="sm" onClick={() => handleOpenNilaiDialog(siswa, assignment)}>
                                                            <BookOpen className="mr-2 h-4 w-4" /> Input Nilai & Absen
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </AccordionContent>
                            </AccordionItem>
                        )
                    })}
                </Accordion>
            ) : (
                <div className="text-center text-muted-foreground py-10">
                    <p>Anda belum memiliki tugas mengajar yang ditetapkan.</p>
                    <p>Silakan hubungi Wakasek Kesiswaan.</p>
                </div>
            )}
          </CardContent>
        </Card>
        
         <Dialog open={isNilaiDialogOpen} onOpenChange={setIsNilaiDialogOpen}>
          <DialogContent>
            <DialogHeader>
                <DialogTitle>Input Nilai & Absen untuk {selectedSiswa?.nama}</DialogTitle>
                <DialogDescription>Mapel: {selectedAssignment?.mapel}</DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-4">
                <div>
                    <h4 className="font-semibold mb-2">Penilaian</h4>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2"><Label htmlFor="nilai-harian">Nilai Harian</Label><Input id="nilai-harian" value={nilaiFormData.nilaiHarian || ""} onChange={e => setNilaiFormData(prev => ({...prev, nilaiHarian: e.target.value}))} placeholder="Rata-rata tugas, kuis"/></div>
                        <div className="space-y-2"><Label htmlFor="nilai-ujian">Nilai Ujian</Label><Input id="nilai-ujian" value={nilaiFormData.nilaiUjian || ""} onChange={e => setNilaiFormData(prev => ({...prev, nilaiUjian: e.target.value}))} placeholder="UTS, UAS"/></div>
                    </div>
                     <div className="space-y-2 mt-4"><Label htmlFor="catatan-materi">Catatan per Materi</Label><Textarea id="catatan-materi" value={nilaiFormData.catatanMateri || ""} onChange={e => setNilaiFormData(prev => ({...prev, catatanMateri: e.target.value}))} placeholder="Contoh: Sangat baik pada materi A, perlu peningkatan di materi B."/></div>
                </div>
                <div>
                    <h4 className="font-semibold mb-2">Absensi</h4>
                     <div className="space-y-2"><Label htmlFor="absen">Status Kehadiran Hari Ini</Label>
                        <Select onValueChange={value => setAbsenFormData(prev => ({...prev, status: value as any}))} value={absenFormData.status}>
                            <SelectTrigger id="absen"><SelectValue placeholder="Pilih Status" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Hadir">Hadir</SelectItem>
                                <SelectItem value="Sakit">Sakit</SelectItem>
                                <SelectItem value="Izin">Izin</SelectItem>
                                <SelectItem value="Alpa">Alpa</SelectItem>
                            </SelectContent>
                        </Select>
                     </div>
                </div>
            </div>
            <DialogFooter>
              <DialogClose asChild><Button variant="outline">Batal</Button></DialogClose>
              <Button onClick={handleSaveNilai}>Simpan Data</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </div>
    );
  }

  // --- Render Tampilan Wakasek Kesiswaan & Lainnya ---
  return (
    <div className="flex-1 space-y-6">
      <div className="flex items-center justify-between print:hidden">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Laporan Guru Mapel (Diterima)</h2>
          <p className="text-muted-foreground">Rekapitulasi laporan yang diterima dari semua guru mata pelajaran.</p>
        </div>
        <Button onClick={() => window.print()}><Printer className="mr-2 h-4 w-4" />Cetak Laporan</Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Detail Laporan</CardTitle>
          <CardDescription>Berikut adalah daftar laporan yang telah diterima. Kelola status setiap laporan melalui menu Aksi.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tanggal</TableHead><TableHead>Nama Guru</TableHead><TableHead>Mata Pelajaran</TableHead><TableHead>Catatan</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {receivedReports.length > 0 ? (
                 receivedReports.map((laporan) => (
                    <TableRow key={laporan.id}>
                      <TableCell>{laporan.tanggal}</TableCell><TableCell className="font-medium">{laporan.guru}</TableCell><TableCell>{laporan.mapel}</TableCell><TableCell>{laporan.catatan}</TableCell>
                      <TableCell><Badge variant={getStatusBadgeVariant(laporan.status)}>{laporan.status}</Badge></TableCell>
                      <TableCell className="text-right">
                         <DropdownMenu>
                            <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><span className="sr-only">Buka menu</span><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem asChild><Link href="/dashboard/laporan/guru-mapel"><Eye className="mr-2 h-4 w-4" />Lihat Detail</Link></DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleStatusChange(laporan.id, 'Diproses')}><RefreshCw className="mr-2 h-4 w-4" />Tandai Diproses</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleStatusChange(laporan.id, 'Diterima')}><CheckCircle className="mr-2 h-4 w-4" />Tandai Diterima</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
              ) : (
                <TableRow><TableCell colSpan={6} className="h-24 text-center">Belum ada laporan yang diterima.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

    