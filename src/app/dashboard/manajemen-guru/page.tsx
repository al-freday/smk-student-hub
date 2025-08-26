
"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Calendar as CalendarIcon, Download, Printer, PlusCircle, Trash2, Save, RefreshCw, Users, BookUser, Shield, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { getSourceData, updateSourceData } from "@/lib/data-manager";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";


interface Kelas {
  id: number;
  nama: string;
}

interface Siswa {
  id: number;
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

interface Guru {
  id: number | string;
  nama: string;
  teachingAssignments?: TeachingAssignment[];
  kelas?: string[];
  tanggalPiket?: string[];
  tugasKelas?: string; 
  siswaBinaan?: string[];
}

type TeacherRole = 'wali_kelas' | 'guru_bk' | 'guru_mapel' | 'guru_piket' | 'guru_pendamping';

const initialTeachersState: { [key in TeacherRole]: Guru[] } = {
    wali_kelas: [], guru_bk: [], guru_mapel: [], guru_piket: [], guru_pendamping: [],
};

const roleOptions: { value: TeacherRole; label: string }[] = [
    { value: 'wali_kelas', label: 'Wali Kelas' },
    { value: 'guru_bk', label: 'Guru BK' },
    { value: 'guru_mapel', label: 'Guru Mapel' },
    { value: 'guru_piket', label: 'Guru Piket' },
    { value: 'guru_pendamping', label: 'Guru Pendamping' },
];

const getRoleName = (roleKey: string) => {
    return roleOptions.find(r => r.value === roleKey)?.label || 'Guru';
};

const daftarHari = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat"];

const sesiPelajaran = [ "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];

export default function ManajemenGuruPage() {
  const { toast } = useToast();
  const [teachers, setTeachers] = useState<{ [key in TeacherRole]: Guru[] }>(initialTeachersState);
  const [activeTab, setActiveTab] = useState<TeacherRole>('wali_kelas');
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Guru | null>(null);
  const [formData, setFormData] = useState<Partial<Guru>>({});
  
  const [availableKelas, setAvailableKelas] = useState<Kelas[]>([]);
  const [availableGrades, setAvailableGrades] = useState<string[]>([]);
  const [daftarSiswa, setDaftarSiswa] = useState<Siswa[]>([]);
  
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  
  const [currentAssignment, setCurrentAssignment] = useState<Partial<TeachingAssignment>>({});

  const loadData = () => {
    try {
        const teachersDataFromAdmin = getSourceData('teachersData', {});
        const { schoolInfo, ...roles } = teachersDataFromAdmin;

        const newState = { ...initialTeachersState };

        for (const roleKey of roleOptions.map(r => r.value)) {
            const usersInRole = roles[roleKey] || [];
            
            const existingAssignments = teachers[roleKey] || [];
            const assignmentsMap = new Map(existingAssignments.map(t => [t.id, t]));

            newState[roleKey] = usersInRole.map((user: any) => {
                const existingData = assignmentsMap.get(user.id);
                return {
                    ...user,
                    ...(existingData || {}),
                };
            });
        }
        
        setTeachers(newState);
        toast({ title: "Data Dimuat", description: "Data guru terbaru telah dimuat dari sumber utama." });
    } catch (error) {
        console.error("Gagal memuat data guru:", error);
        toast({ title: "Gagal Memuat", description: "Tidak dapat memuat data guru.", variant: "destructive" });
    }
  };
  

  useEffect(() => {
    loadData();
    setAvailableKelas(getSourceData('kelasData', []));
    setDaftarSiswa(getSourceData('siswaData', []));

    const kelasData: Kelas[] = getSourceData('kelasData', []);
    if (kelasData.length > 0) {
        const grades = new Set<string>();
        kelasData.forEach(kelas => {
            if (kelas.nama.startsWith("X ")) grades.add("Kelas X");
            else if (kelas.nama.startsWith("XI ")) grades.add("Kelas XI");
            else if (kelas.nama.startsWith("XII ")) grades.add("Kelas XII");
        });
        setAvailableGrades(Array.from(grades).sort());
    }

     window.addEventListener('dataUpdated', loadData);
     return () => {
       window.removeEventListener('dataUpdated', loadData);
     };
  }, []);
  
  const handleSaveChanges = () => {
    const currentFullData = getSourceData('teachersData', {});
    const updatedData = { ...currentFullData, ...teachers };
    updateSourceData('teachersData', updatedData);
    toast({
        title: "Perubahan Disimpan",
        description: "Semua perubahan pada penugasan guru telah disimpan.",
    });
  };

  const handleOpenDialog = (guru: Guru) => {
      setEditingTeacher(guru);
      setFormData(guru);
      
      if (guru.tanggalPiket) {
          setSelectedDates(guru.tanggalPiket.map(d => new Date(d)));
      } else {
          setSelectedDates([]);
      }
      setIsDialogOpen(true);
  };

  const handleSaveDialog = () => {
      if (!editingTeacher) return;
      
      const dataToSave = { ...formData };
      if (activeTab === 'guru_piket') {
          dataToSave.tanggalPiket = selectedDates.map(d => format(d, 'yyyy-MM-dd'));
      }

      const updatedTeachersByRole = teachers[activeTab].map(t =>
        t.id === editingTeacher.id ? { ...t, ...dataToSave } : t
      );
      
      setTeachers(prev => ({...prev, [activeTab]: updatedTeachersByRole}));
      
      toast({ title: "Tugas Diperbarui", description: `Tugas untuk ${editingTeacher.nama} telah diubah. Simpan perubahan untuk menjadikannya permanen.` });
      setIsDialogOpen(false);
  };
  
  const handleKelasBinaanChange = (namaKelas: string, checked: boolean) => {
      const currentKelas = formData.kelas || [];
      if (checked) {
          setFormData({ ...formData, kelas: [...currentKelas, namaKelas] });
      } else {
          setFormData({ ...formData, kelas: currentKelas.filter(k => k !== namaKelas) });
      }
  };

  const handleSiswaBinaanChange = (siswaNama: string, checked: boolean) => {
      const currentSiswa = Array.isArray(formData.siswaBinaan) ? formData.siswaBinaan : [];
      if (checked) {
          setFormData({ ...formData, siswaBinaan: [...currentSiswa, siswaNama] });
      } else {
          setFormData({ ...formData, siswaBinaan: currentSiswa.filter(s => s !== siswaNama) });
      }
  };
  
  const handleAddAssignment = () => {
    if (!currentAssignment.subject || !currentAssignment.className || !currentAssignment.day || !currentAssignment.session) {
        toast({ title: "Gagal", description: "Harap lengkapi semua detail tugas mengajar.", variant: "destructive" });
        return;
    }
    const newAssignment = { ...currentAssignment, id: Date.now() } as TeachingAssignment;
    const existingAssignments = formData.teachingAssignments || [];
    setFormData({ ...formData, teachingAssignments: [...existingAssignments, newAssignment] });
    setCurrentAssignment({}); 
  };

  const handleDeleteAssignment = (assignmentId: number) => {
    const updatedAssignments = formData.teachingAssignments?.filter(a => a.id !== assignmentId);
    setFormData({ ...formData, teachingAssignments: updatedAssignments });
  };


  const formatPiketDetails = (guru: Guru) => {
      const tanggalPiketArray = Array.isArray(guru.tanggalPiket) ? guru.tanggalPiket : [];
      const tanggal = tanggalPiketArray.length > 0 ? `Tanggal: ${tanggalPiketArray.map(d => format(new Date(d), 'dd/MM/yy')).join(', ')}` : '';
      
      if (tanggal) return tanggal;
      return '-';
  };
  
  const getTugasDetailComponent = (guru: Guru, role: TeacherRole) => {
      switch(role) {
          case 'wali_kelas': 
              const kelasBinaan = Array.isArray(guru.kelas) ? guru.kelas : [];
              if (kelasBinaan.length === 0) return <span className="text-muted-foreground">-</span>;
              return (
                  <div className="flex flex-wrap gap-1">
                      {kelasBinaan.map((k, index) => <Badge key={`${k}-${index}`} variant="secondary">{k}</Badge>)}
                  </div>
              );
          case 'guru_mapel': 
              const assignmentCount = guru.teachingAssignments?.length || 0;
              if (assignmentCount === 0) return <span className="text-muted-foreground">-</span>;
              return (
                 <div className="flex items-center gap-2">
                     <Clock className="h-4 w-4 text-muted-foreground" />
                     <span>{assignmentCount} Sesi Mengajar/Minggu</span>
                 </div>
              );
          case 'guru_piket': 
               const tglPiket = Array.isArray(guru.tanggalPiket) ? guru.tanggalPiket : [];
               if (tglPiket.length === 0) return <span className="text-muted-foreground">-</span>;
               return (
                  <div className="flex flex-col gap-1">
                      {tglPiket.length > 0 && <Badge variant="outline">Tugas pada: {tglPiket.length} tanggal</Badge>}
                  </div>
               );
          case 'guru_bk': 
              if (!guru.tugasKelas) return <span className="text-muted-foreground">-</span>;
              return (
                  <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>Binaan {guru.tugasKelas}</span>
                  </div>
              );
          case 'guru_pendamping': 
              const siswaBinaanCount = Array.isArray(guru.siswaBinaan) ? guru.siswaBinaan.length : 0;
              if (siswaBinaanCount === 0) return <span className="text-muted-foreground">-</span>;
              return (
                  <div className="flex items-center gap-2">
                      <BookUser className="h-4 w-4 text-muted-foreground" />
                      <span>{siswaBinaanCount} Siswa Binaan</span>
                  </div>
              );
          default: return <span className="text-muted-foreground">-</span>;
      }
  };


  const getTugasDetailForExport = (guru: Guru, role: TeacherRole): string => {
      switch(role) {
          case 'wali_kelas': 
              const kelasBinaan = Array.isArray(guru.kelas) ? guru.kelas : [];
              return `Kelas Binaan: ${kelasBinaan.join(', ') || '-'}`;
          case 'guru_mapel': 
              const assignmentCount = guru.teachingAssignments?.length || 0;
              return assignmentCount > 0 ? `Mengajar di ${assignmentCount} kelas/sesi` : 'Belum ada tugas mengajar';
          case 'guru_piket': 
              return formatPiketDetails(guru);
          case 'guru_bk': 
              return `Tugas Pembinaan: ${guru.tugasKelas || '-'}`;
          case 'guru_pendamping': 
              const siswaBinaan = Array.isArray(guru.siswaBinaan) ? guru.siswaBinaan : [];
              return `Mendampingi: ${siswaBinaan.join(', ') || '-'}`;
          default: return '-';
      }
  };
  
  const handleExportData = () => {
    let allUsers: { Nama: string, Peran: string, "Detail Tugas": string }[] = [];

    for (const roleKey in teachers) {
        const typedRoleKey = roleKey as TeacherRole;
        if (Array.isArray(teachers[typedRoleKey])) {
            teachers[typedRoleKey].forEach((guru: Guru) => {
                allUsers.push({
                    "Nama": guru.nama,
                    "Peran": getRoleName(typedRoleKey),
                    "Detail Tugas": getTugasDetailForExport(guru, typedRoleKey),
                });
            });
        }
    }

    const headers = ['Nama', 'Peran', 'Detail Tugas'];
    const csvContent = [
        headers.join(','),
        ...allUsers.map(user => 
            headers.map(header => `"${user[header as keyof typeof user]}"`).join(',')
        )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute('download', 'penugasan_guru.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({ title: "Ekspor Berhasil", description: "Data penugasan guru telah diunduh." });
  };

  const handlePrint = () => {
      window.print();
  };

  const siswaByKelas = useMemo(() => {
    return daftarSiswa.reduce((acc, siswa) => {
      const kelas = siswa.kelas;
      if (!acc[kelas]) {
        acc[kelas] = [];
      }
      acc[kelas].push(siswa);
      return acc;
    }, {} as { [key: string]: Siswa[] });
  }, [daftarSiswa]);


  const renderFormFields = () => (
    <>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="nama" className="text-right">Nama</Label>
        <Input id="nama" value={formData.nama || ''} disabled className="col-span-3" />
      </div>
      {activeTab === 'wali_kelas' && (
        <div className="grid grid-cols-4 items-start gap-4">
            <Label className="text-right pt-2">Kelas Binaan</Label>
            <ScrollArea className="col-span-3 h-48 rounded-md border p-4">
                <div className="space-y-2">
                    {availableKelas.map((k) => (
                         <div key={k.id} className="flex items-center space-x-2">
                            <Checkbox
                                id={`kelas-${k.id}`}
                                checked={Array.isArray(formData.kelas) && formData.kelas.includes(k.nama)}
                                onCheckedChange={(checked) => handleKelasBinaanChange(k.nama, !!checked)}
                            />
                            <label htmlFor={`kelas-${k.id}`} className="text-sm font-medium leading-none">
                                {k.nama}
                            </label>
                        </div>
                    ))}
                </div>
            </ScrollArea>
        </div>
      )}
      {activeTab === 'guru_mapel' && (
        <div className="space-y-6">
            <div>
                <Label>Daftar Tugas Mengajar</Label>
                <ScrollArea className="h-40 mt-2 rounded-md border p-2">
                    {formData.teachingAssignments && formData.teachingAssignments.length > 0 ? (
                        formData.teachingAssignments.map(a => (
                            <div key={a.id} className="flex items-center justify-between text-sm p-2 rounded-md hover:bg-muted">
                                <div>
                                    <p className="font-medium">{a.subject} - {a.className}</p>
                                    <p className="text-xs text-muted-foreground">{a.day}, Sesi {a.session}</p>
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => handleDeleteAssignment(a.id)}>
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-sm text-muted-foreground pt-4">Belum ada tugas mengajar yang ditambahkan.</p>
                    )}
                </ScrollArea>
            </div>
            <Separator />
            <div>
                <h4 className="font-medium mb-2">Tambah Tugas Baru</h4>
                <div className="space-y-4 rounded-md border p-4">
                    <div className="space-y-2">
                        <Label htmlFor="subject">Mata Pelajaran</Label>
                        <Input id="subject" value={currentAssignment.subject || ''} onChange={e => setCurrentAssignment({...currentAssignment, subject: e.target.value})} placeholder="Contoh: Matematika" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="className">Kelas</Label>
                             <Select value={currentAssignment.className} onValueChange={value => setCurrentAssignment({...currentAssignment, className: value})}>
                                <SelectTrigger id="className"><SelectValue placeholder="Pilih" /></SelectTrigger>
                                <SelectContent>{availableKelas.map(k => <SelectItem key={k.id} value={k.nama}>{k.nama}</SelectItem>)}</SelectContent>
                             </Select>
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="day">Hari</Label>
                             <Select value={currentAssignment.day} onValueChange={value => setCurrentAssignment({...currentAssignment, day: value})}>
                                <SelectTrigger id="day"><SelectValue placeholder="Pilih" /></SelectTrigger>
                                <SelectContent>{daftarHari.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}</SelectContent>
                             </Select>
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="session">Jam Ke-</Label>
                              <Select value={currentAssignment.session} onValueChange={value => setCurrentAssignment({...currentAssignment, session: value})}>
                                <SelectTrigger id="session"><SelectValue placeholder="Pilih" /></SelectTrigger>
                                <SelectContent>{sesiPelajaran.map((s, i) => <SelectItem key={`${s}-${i}`} value={s}>{s}</SelectItem>)}</SelectContent>
                             </Select>
                        </div>
                    </div>
                     <Button size="sm" onClick={handleAddAssignment} className="w-full">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Tambahkan ke Daftar
                    </Button>
                </div>
            </div>
        </div>
      )}
      {activeTab === 'guru_piket' && (
        <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Pilih Tanggal Piket</Label>
            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("col-span-3 font-normal justify-start text-left", !selectedDates?.length && "text-muted-foreground")}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedDates.length > 0 ? `${selectedDates.length} tanggal dipilih` : "Pilih tanggal"}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="multiple" selected={selectedDates} onSelect={setSelectedDates} />
                </PopoverContent>
            </Popover>
        </div>
      )}
       {activeTab === 'guru_bk' && (
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="tugasKelas" className="text-right">Tugas Pembinaan</Label>
           <Select value={formData.tugasKelas} onValueChange={(value) => setFormData({ ...formData, tugasKelas: value })}>
              <SelectTrigger className="col-span-3"><SelectValue placeholder="Pilih tingkatan kelas" /></SelectTrigger>
              <SelectContent>{availableGrades.map((grade) => <SelectItem key={grade} value={grade}>{grade}</SelectItem>)}</SelectContent>
            </Select>
        </div>
      )}
       {activeTab === 'guru_pendamping' && (
        <div className="grid grid-cols-4 items-start gap-4">
          <Label htmlFor="siswaBinaan" className="text-right pt-2">Siswa Binaan</Label>
            <ScrollArea className="col-span-3 h-64 rounded-md border">
                 <Accordion type="multiple" className="w-full">
                    {Object.keys(siswaByKelas).sort().map(namaKelas => (
                        <AccordionItem value={namaKelas} key={namaKelas}>
                            <AccordionTrigger className="px-4 py-2 bg-muted/50">
                                {namaKelas}
                            </AccordionTrigger>
                            <AccordionContent>
                                <div className="p-4 space-y-2">
                                    {siswaByKelas[namaKelas].map(siswa => (
                                        <div key={siswa.id} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={`siswa-${siswa.id}`}
                                                checked={(Array.isArray(formData.siswaBinaan) ? formData.siswaBinaan : []).includes(siswa.nama)}
                                                onCheckedChange={(checked) => handleSiswaBinaanChange(siswa.nama, !!checked)}
                                            />
                                            <label htmlFor={`siswa-${siswa.id}`} className="text-sm font-medium leading-none">
                                                {siswa.nama}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                 </Accordion>
            </ScrollArea>
        </div>
      )}
    </>
  );

  return (
    <div className="flex-1 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between print:hidden">
        <div>
            <h2 className="text-3xl font-bold tracking-tight">Manajemen Guru</h2>
            <p className="text-muted-foreground">
            Kelola penugasan guru. Data guru diambil dari daftar pengguna yang diatur oleh Administrator.
            </p>
        </div>
        <div className="flex gap-2 mt-4 sm:mt-0">
            <Button onClick={handleSaveChanges}><Save className="mr-2 h-4 w-4"/>Simpan Perubahan</Button>
            <Button variant="outline" onClick={loadData}><RefreshCw className="mr-2 h-4 w-4"/>Muat Ulang Data</Button>
        </div>
      </div>
      <div className="flex justify-end gap-2 print:hidden">
            <Button variant="outline" onClick={handleExportData}>
                <Download className="mr-2 h-4 w-4" />
                Download Excel
            </Button>
            <Button variant="outline" onClick={handlePrint}>
                <Printer className="mr-2 h-4 w-4" />
                Cetak
            </Button>
      </div>
        
      <Card>
        <CardHeader>
          <CardTitle>Daftar & Penugasan Guru</CardTitle>
          <CardDescription>
            Gunakan tombol Aksi untuk menetapkan atau mengubah tugas spesifik untuk setiap guru.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as TeacherRole)}>
            <ScrollArea className="w-full whitespace-nowrap">
                <TabsList>
                {roleOptions.map(role => (
                    <TabsTrigger key={role.value} value={role.value}>{role.label}</TabsTrigger>
                ))}
                </TabsList>
                <ScrollBar orientation="horizontal" />
            </ScrollArea>

            {Object.keys(teachers).map((key) => (
              <TabsContent value={key} key={key} className="mt-4">
                <div className="overflow-x-auto">
                    <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead>Nama</TableHead>
                        <TableHead>Detail Tugas</TableHead>
                        <TableHead className="text-right print:hidden">Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {teachers[key as TeacherRole]?.length > 0 ? (
                        teachers[key as TeacherRole].map((guru) => (
                            <TableRow key={guru.id}>
                            <TableCell className="font-medium">{guru.nama}</TableCell>
                            <TableCell>
                                {getTugasDetailComponent(guru, key as TeacherRole)}
                            </TableCell>
                            <TableCell className="text-right print:hidden">
                                <Button variant="outline" size="sm" onClick={() => handleOpenDialog(guru)}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Atur Tugas
                                </Button>
                            </TableCell>
                            </TableRow>
                        ))
                        ) : (
                        <TableRow>
                            <TableCell colSpan={3} className="h-24 text-center">
                            Belum ada pengguna yang ditambahkan untuk peran ini oleh Admin.
                            </TableCell>
                        </TableRow>
                        )}
                    </TableBody>
                    </Table>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className={activeTab === 'guru_mapel' || activeTab === 'guru_pendamping' ? "sm:max-w-2xl" : "sm:max-w-md"}>
              <DialogHeader>
                  <DialogTitle>Atur Penugasan Guru</DialogTitle>
                  <DialogDescription>
                      Lengkapi detail penugasan untuk {editingTeacher?.nama}.
                  </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                 {renderFormFields()}
              </div>
              <DialogFooter>
                  <DialogClose asChild><Button variant="outline">Batal</Button></DialogClose>
                  <Button onClick={handleSaveDialog}>Simpan Perubahan</Button>
              </DialogFooter>
          </DialogContent>
      </Dialog>
    </div>
  );
}
