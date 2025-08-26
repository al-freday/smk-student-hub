
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Printer, Eye, Loader2, MoreHorizontal, CheckCircle, RefreshCw, PlusCircle, Send, Trash2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { getSourceData, updateSourceData } from "@/lib/data-manager";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

// Tipe untuk Wakasek
interface GuruPendampingFromWakasek { id: number; nama: string; }
type ReportStatus = 'Terkirim' | 'Diproses' | 'Diterima';
interface ReceivedReport { id: number; guru: string; tanggal: string; catatan: string; status: ReportStatus; }

// Tipe untuk Guru Pendamping
interface Siswa { id: number; nama: string; kelas: string; }
interface CatatanBimbingan { id: number; siswa: string; tanggal: string; catatan: string; }

export default function LaporanGuruPendampingPage() {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // --- State untuk Wakasek View ---
  const [receivedReports, setReceivedReports] = useState<ReceivedReport[]>([]);
  const reportStatusStorageKey = 'guruPendampingReportsStatus';

  // --- State untuk Guru Pendamping View ---
  const [myStudents, setMyStudents] = useState<Siswa[]>([]);
  const [myNotes, setMyNotes] = useState<CatatanBimbingan[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string>("");
  const [noteContent, setNoteContent] = useState<string>("");
  const myNotesStorageKey = 'guruPendampingNotes';

  useEffect(() => {
    const role = localStorage.getItem('userRole');
    setUserRole(role);
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');

    if (role === 'wakasek_kesiswaan') {
        loadWakasekData();
    } else if (role === 'guru_pendamping') {
        loadGuruPendampingData(currentUser.nama);
    } else {
        setIsLoading(false);
    }
  }, []);

  // --- Logika Wakasek ---
  const loadWakasekData = () => {
    try {
      const teachersData = getSourceData('teachersData', {});
      const savedStatuses = getSourceData(reportStatusStorageKey, {});
      const guruPendampingList: GuruPendampingFromWakasek[] = teachersData.guru_pendamping || [];

      const reports = guruPendampingList.map((guru, index) => ({
        id: guru.id, guru: guru.nama,
        tanggal: format(new Date(new Date().setDate(new Date().getDate() - index)), "yyyy-MM-dd"),
        catatan: `Laporan pendampingan rutin oleh ${guru.nama}.`,
        status: savedStatuses[guru.id] || 'Terkirim',
      }));
      setReceivedReports(reports);
    } catch (error) { console.error("Gagal memuat data:", error); } 
    finally { setIsLoading(false); }
  };
  
  const handleStatusChange = (id: number, status: ReportStatus) => {
    const updatedReports = receivedReports.map(report => report.id === id ? { ...report, status } : report);
    setReceivedReports(updatedReports);
    const statuses = getSourceData(reportStatusStorageKey, {});
    statuses[id] = status;
    updateSourceData(reportStatusStorageKey, statuses);
    toast({ title: "Status Diperbarui", description: `Laporan telah ditandai sebagai ${status}.` });
  };

  const getStatusBadgeVariant = (status: ReportStatus) => {
    return status === 'Diterima' ? 'default' : status === 'Diproses' ? 'secondary' : 'outline';
  };

  // --- Logika Guru Pendamping ---
  const loadGuruPendampingData = (currentUserName: string) => {
    const teachersData = getSourceData('teachersData', {});
    const guruData = teachersData.guru_pendamping?.find((g: any) => g.nama === currentUserName);
    
    if (guruData && Array.isArray(guruData.siswaBinaan)) {
        const allSiswa = getSourceData('siswaData', []);
        const binaan = allSiswa.filter((s: Siswa) => guruData.siswaBinaan.includes(s.nama));
        setMyStudents(binaan);
    }
    setMyNotes(getSourceData(`${myNotesStorageKey}_${currentUserName}`, []));
    setIsLoading(false);
  };
  
  const handleAddNote = () => {
    if (!selectedStudent || !noteContent) {
        toast({ title: "Gagal", description: "Pilih siswa dan isi catatan terlebih dahulu.", variant: "destructive" });
        return;
    }
    const newNote: CatatanBimbingan = {
        id: Date.now(),
        siswa: selectedStudent,
        tanggal: format(new Date(), 'yyyy-MM-dd'),
        catatan: noteContent
    };
    const updatedNotes = [...myNotes, newNote];
    setMyNotes(updatedNotes);
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    updateSourceData(`${myNotesStorageKey}_${currentUser.nama}`, updatedNotes);
    toast({ title: "Catatan Ditambahkan", description: "Catatan bimbingan baru telah disimpan." });
    setSelectedStudent("");
    setNoteContent("");
  };

  const handleDeleteNote = (id: number) => {
      const updatedNotes = myNotes.filter(n => n.id !== id);
      setMyNotes(updatedNotes);
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      updateSourceData(`${myNotesStorageKey}_${currentUser.nama}`, updatedNotes);
      toast({ title: "Catatan Dihapus", description: "Catatan bimbingan telah dihapus." });
  };
  
   const handleSendReport = () => {
    toast({
      title: "Laporan Terkirim",
      description: "Laporan catatan bimbingan Anda telah dikirim ke Wakasek Kesiswaan.",
    });
  };

  if (isLoading) {
      return (
         <div className="flex-1 space-y-6 flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
         </div>
      );
  }

  // --- Render Guru Pendamping ---
  if (userRole === 'guru_pendamping') {
    return (
        <div className="flex-1 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Catatan Bimbingan & Pendampingan</h2>
                    <p className="text-muted-foreground">Rekapitulasi catatan personal untuk penanganan masalah dan pembinaan siswa.</p>
                </div>
                 <Button onClick={handleSendReport}>
                    <Send className="mr-2 h-4 w-4" />
                    Kirim Laporan
                </Button>
            </div>
            <div className="grid gap-6 lg:grid-cols-3">
                <Card className="lg:col-span-1">
                    <CardHeader><CardTitle>Tambah Catatan Baru</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                                <SelectTrigger><SelectValue placeholder="Pilih Siswa Binaan" /></SelectTrigger>
                                <SelectContent>
                                    {myStudents.map(s => <SelectItem key={s.id} value={s.nama}>{s.nama} ({s.kelas})</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Textarea placeholder="Tulis catatan perkembangan atau masalah siswa di sini..." value={noteContent} onChange={e => setNoteContent(e.target.value)} />
                        </div>
                        <Button className="w-full" onClick={handleAddNote}><PlusCircle className="mr-2 h-4 w-4" /> Tambah Catatan</Button>
                    </CardContent>
                </Card>
                <Card className="lg:col-span-2">
                    <CardHeader><CardTitle>Riwayat Catatan Personal</CardTitle></CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader><TableRow><TableHead>Tanggal</TableHead><TableHead>Nama Siswa</TableHead><TableHead>Catatan</TableHead><TableHead className="text-right">Aksi</TableHead></TableRow></TableHeader>
                            <TableBody>
                                {myNotes.length > 0 ? myNotes.map(note => (
                                    <TableRow key={note.id}>
                                        <TableCell>{note.tanggal}</TableCell>
                                        <TableCell className="font-medium">{note.siswa}</TableCell>
                                        <TableCell>{note.catatan}</TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="icon" onClick={() => handleDeleteNote(note.id)}>
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                )) : <TableRow><TableCell colSpan={4} className="h-24 text-center">Belum ada catatan.</TableCell></TableRow>}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
  }

  // --- Render Wakasek Kesiswaan ---
  return (
    <div className="flex-1 space-y-6">
      <div className="flex items-center justify-between print:hidden">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Laporan Guru Pendamping (Diterima)</h2>
          <p className="text-muted-foreground">Rekapitulasi laporan yang diterima dari semua guru pendamping.</p>
        </div>
        <Button onClick={() => window.print()}><Printer className="mr-2 h-4 w-4" />Cetak Laporan</Button>
      </div>
      <Card>
        <CardHeader><CardTitle>Detail Laporan</CardTitle><CardDescription>Berikut adalah daftar laporan pendampingan yang telah diterima. Kelola status setiap laporan melalui menu Aksi.</CardDescription></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Tanggal</TableHead><TableHead>Nama Guru Pendamping</TableHead><TableHead>Catatan Pendampingan</TableHead><TableHead>Status</TableHead><TableHead className="text-right print:hidden">Aksi</TableHead></TableRow></TableHeader>
            <TableBody>
               {receivedReports.length > 0 ? (
                 receivedReports.map((laporan) => (
                    <TableRow key={laporan.id}>
                      <TableCell>{laporan.tanggal}</TableCell><TableCell className="font-medium">{laporan.guru}</TableCell><TableCell>{laporan.catatan}</TableCell>
                      <TableCell><Badge variant={getStatusBadgeVariant(laporan.status)}>{laporan.status}</Badge></TableCell>
                      <TableCell className="text-right">
                         <DropdownMenu>
                            <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><span className="sr-only">Buka menu</span><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem asChild><Link href="/dashboard/laporan/guru-pendamping"><Eye className="mr-2 h-4 w-4" />Lihat Detail</Link></DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleStatusChange(laporan.id, 'Diproses')}><RefreshCw className="mr-2 h-4 w-4" />Tandai Diproses</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleStatusChange(laporan.id, 'Diterima')}><CheckCircle className="mr-2 h-4 w-4" />Tandai Diterima</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
              ) : (
                <TableRow><TableCell colSpan={5} className="h-24 text-center">Belum ada laporan yang diterima.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
