
"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
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
import { Edit, Calendar as CalendarIcon, Download, Printer, PlusCircle, Trash2, Users, BookUser, Shield, Clock, Upload } from "lucide-react";
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
import { id } from "date-fns/locale";
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
  kelas?: string[]; // Untuk Wali Kelas & Guru Pendamping (Kelas Binaan)
  tanggalPiket?: string[];
  tugasKelas?: string; 
  siswaBinaan?: string[]; // Untuk Guru Pendamping (Siswa Binaan)
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [teachers, setTeachers] = useState<{ [key in TeacherRole]: Guru[] }>(initialTeachersState);
  const [activeTab, setActiveTab] = useState<TeacherRole>('wali_kelas');
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Guru | null>(null);
  const [formData, setFormData] = useState<Partial<Guru>>({});
  
  const [availableKelas, setAvailableKelas] = useState<Kelas[]>([]);
  const [availableGrades, setAvailableGrades] = useState<string[]>([]);
  const [daftarSiswa, setDaftarSiswa] = useState<Siswa[]>([]);
  const [availableSubjects, setAvailableSubjects] = useState<string[]>([]);
  
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  
  const [currentAssignment, setCurrentAssignment] = useState<Partial<TeachingAssignment>>({});

  const loadData = useCallback(() => {
    try {
        const teachersDataFromAdmin = getSourceData('teachersData', {});
        const { schoolInfo, ...roles } = teachersDataFromAdmin;

        const newState = { ...initialTeachersState };

        for (const roleKey of roleOptions.map(r => r.value)) {
            const usersInRole = roles[roleKey] || [];
            
            newState[roleKey] = usersInRole.map((user: any) => ({
                ...user,
                ...(roles[roleKey].find((t: Guru) => t.id === user.id) || {}),
            }));
        }
        
        setTeachers(newState);
    } catch (error) {
        console.error("Gagal memuat data guru:", error);
        toast({ title: "Gagal Memuat", description: "Tidak dapat memuat data guru.", variant: "destructive" });
    }
  }, [toast]);

  const loadDependencies = useCallback(() => {
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
    
    const kurikulumData = getSourceData('kurikulumData', {});
    const subjects: string[] = [];
    if (kurikulumData && typeof kurikulumData === 'object') {
        Object.values(kurikulumData).forEach((tingkatan: any) => {
            if (tingkatan.kelompok && Array.isArray(tingkatan.kelompok)) {
                tingkatan.kelompok.forEach((kelompok: any) => {
                    if (kelompok.subjects && Array.isArray(kelompok.subjects)) {
                        kelompok.subjects.forEach((subject: any) => {
                            if (subject && subject.nama) {
                                subjects.push(subject.nama);
                            }
                        });
                    }
                });
            }
        });
    }
    setAvailableSubjects([...new Set(subjects)].sort());
  }, []);

  useEffect(() => {
    loadData();
    loadDependencies();

    const handleDataUpdated = () => {
      loadData();
      loadDependencies();
    };

    window.addEventListener('dataUpdated', handleDataUpdated);
    return () => {
      window.removeEventListener('dataUpdated', handleDataUpdated);
    };
  }, [loadData, loadDependencies]);


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
      
      let dataToSave = { ...formData };
      if (activeTab === 'guru_piket') {
          dataToSave.tanggalPiket = selectedDates.map(d => format(d, 'yyyy-MM-dd'));
      }
      
      // Saat menyimpan, pastikan siswaBinaan hanya berisi siswa dari kelas binaan yang terpilih
      if (activeTab === 'guru_pendamping') {
          const kelasBinaan = dataToSave.kelas || [];
          const siswaValid = daftarSiswa.filter(s => kelasBinaan.includes(s.kelas)).map(s => s.nama);
          dataToSave.siswaBinaan = (dataToSave.siswaBinaan || []).filter(namaSiswa => siswaValid.includes(namaSiswa));
      }

      const currentFullData = getSourceData('teachersData', {});
      const { schoolInfo, ...roles } = currentFullData;

      const updatedRoleList = (roles[activeTab] || []).map((t: Guru) =>
        t.id === editingTeacher.id ? { ...t, ...dataToSave } : t
      );
      
      const updatedData = {
          ...currentFullData,
          [activeTab]: updatedRoleList
      };

      updateSourceData('teachersData', updatedData);
      
      toast({ title: "Tugas Diperbarui", description: `Tugas untuk ${editingTeacher.nama} telah berhasil disimpan.` });
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
  
  const handleExportData = (role: TeacherRole) => {
    const usersInRole = teachers[role] || [];
    if (usersInRole.length === 0) {
        toast({ title: "Tidak Ada Data", description: `Tidak ada data guru untuk peran ${getRoleName(role)}.`, variant: "destructive" });
        return;
    }
    
    const delimiter = ';';
    let headers: string[] = [];
    let csvRows: string[] = [];

    const formatCell = (value: any) => {
        const stringValue = String(value || '');
        if (stringValue.includes(delimiter) || stringValue.includes('"') || stringValue.includes('\n')) {
            return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
    };

    switch (role) {
        case 'wali_kelas':
            headers = ['id', 'nama', 'kelas_binaan'];
            csvRows = usersInRole.map(user =>
                [user.id, user.nama, (user.kelas || []).join(';')].map(formatCell).join(delimiter)
            );
            break;
        case 'guru_bk':
            headers = ['id', 'nama', 'binaan_tingkat_kelas'];
            csvRows = usersInRole.map(user =>
                [user.id, user.nama, user.tugasKelas || ''].map(formatCell).join(delimiter)
            );
            break;
        case 'guru_piket':
            headers = ['id', 'nama', 'tanggal_piket'];
            csvRows = usersInRole.map(user =>
                [user.id, user.nama, (user.tanggalPiket || []).join(';')].map(formatCell).join(delimiter)
            );
            break;
        case 'guru_pendamping':
            headers = ['id', 'nama', 'siswa_binaan'];
            csvRows = usersInRole.map(user =>
                [user.id, user.nama, (user.siswaBinaan || []).join(';')].map(formatCell).join(delimiter)
            );
            break;
        case 'guru_mapel':
            headers = ['id', 'nama', 'mapel', 'kelas', 'hari', 'sesi'];
            const rows: string[][] = [];
            usersInRole.forEach(user => {
                if (user.teachingAssignments && user.teachingAssignments.length > 0) {
                    user.teachingAssignments.forEach(t => {
                        rows.push([user.id.toString(), user.nama, t.subject, t.className, t.day, t.session]);
                    });
                } else {
                    rows.push([user.id.toString(), user.nama, '', '', '', '']);
                }
            });
            csvRows = rows.map(row => row.map(formatCell).join(delimiter));
            break;
    }

    const csvContent = [headers.join(delimiter), ...csvRows].join('\n');
    const bom = '\uFEFF';
    const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute('download', `penugasan_${role}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast({ title: "Ekspor Berhasil", description: `Data penugasan ${getRoleName(role)} telah diunduh.` });
  };
  
  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>, role: TeacherRole) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
          try {
              const text = e.target?.result as string;
              const delimiter = text.includes(';') ? ';' : ',';
              const rows = text.split('\n').slice(1);
              if (rows.length === 0) {
                  toast({ title: "File Kosong", variant: "destructive" });
                  return;
              }

              const currentFullData = getSourceData('teachersData', {});
              const { schoolInfo, ...rolesData } = currentFullData;
              const roleList: Guru[] = rolesData[role] || [];
              let updatedCount = 0;

              const cleanField = (field: string) => field.trim().replace(/^"|"$/g, '').replace(/""/g, '"');

              if (role === 'guru_mapel') {
                   const assignmentsByUser = rows
                      .map(r => r.split(delimiter).map(cleanField))
                      .reduce((acc, cols) => {
                        const [id, _, subject, className, day, session] = cols;
                        if(id && subject && className && day && session) {
                           if (!acc[id]) acc[id] = [];
                           const newId = Date.now() + Math.random();
                           acc[id].push({ id: newId, subject, className, day, session });
                        }
                        return acc;
                      }, {} as Record<string, TeachingAssignment[]>);
                      
                   roleList.forEach(user => {
                       if(assignmentsByUser[user.id.toString()]){
                           user.teachingAssignments = assignmentsByUser[user.id.toString()];
                           updatedCount++;
                       }
                   });
              } else {
                  rows.forEach(row => {
                      if (!row.trim()) return;
                      const columns = row.split(delimiter).map(cleanField);
                      const id = columns[0];
                      const data = columns[2] || '';
                      
                      const userIndex = roleList.findIndex(u => u.id.toString() === id);

                      if (userIndex > -1) {
                          updatedCount++;
                          switch (role) {
                              case 'wali_kelas':
                                  roleList[userIndex].kelas = data ? data.split(';') : [];
                                  break;
                              case 'guru_bk':
                                  roleList[userIndex].tugasKelas = data || '';
                                  break;
                              case 'guru_piket':
                                  roleList[userIndex].tanggalPiket = data ? data.split(';') : [];
                                  break;
                              case 'guru_pendamping':
                                  roleList[userIndex].siswaBinaan = data ? data.split(';') : [];
                                  break;
                          }
                      }
                  });
              }
              
              rolesData[role] = roleList;
              updateSourceData('teachersData', { ...currentFullData, ...rolesData });
              loadData();
              toast({ title: "Impor Selesai", description: `${updatedCount} data penugasan untuk ${getRoleName(role)} telah diperbarui.` });

          } catch (error) {
              console.error("Error importing data:", error);
              toast({ title: "Error", description: "Gagal memproses file. Pastikan format CSV sesuai.", variant: "destructive" });
          } finally {
              if (fileInputRef.current) fileInputRef.current.value = "";
          }
      };
      reader.readAsText(file);
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

  const handleSelectKelasForPendamping = (namaKelas: string, isChecked: boolean) => {
      const siswaDiKelas = siswaByKelas[namaKelas]?.map(s => s.nama) || [];
      let currentSiswaBinaan = Array.isArray(formData.siswaBinaan) ? formData.siswaBinaan : [];
      
      if (isChecked) {
          const newSiswaToAdd = siswaDiKelas.filter(s => !currentSiswaBinaan.includes(s));
          currentSiswaBinaan = [...currentSiswaBinaan, ...newSiswaToAdd];
      } else {
          currentSiswaBinaan = currentSiswaBinaan.filter(s => !siswaDiKelas.includes(s));
      }
      
      setFormData({ ...formData, siswaBinaan: currentSiswaBinaan });
  };

  const kelasBinaanTerpilihUntukPendamping = useMemo(() => formData.kelas || [], [formData.kelas]);
  
  const siswaDisaringDanDikelompokkan = useMemo(() => {
    return daftarSiswa
      .filter(siswa => kelasBinaanTerpilihUntukPendamping.includes(siswa.kelas))
      .reduce((acc, siswa) => {
        if (!acc[siswa.kelas]) {
          acc[siswa.kelas] = [];
        }
        acc[siswa.kelas].push(siswa);
        return acc;
      }, {} as { [key: string]: Siswa[] });
  }, [kelasBinaanTerpilihUntukPendamping, daftarSiswa]);


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
                        <Select value={currentAssignment.subject} onValueChange={value => setCurrentAssignment({...currentAssignment, subject: value})}>
                           <SelectTrigger id="subject"><SelectValue placeholder="Pilih Mata Pelajaran" /></SelectTrigger>
                           <SelectContent>
                               {availableSubjects.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                           </SelectContent>
                        </Select>
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
        <div className="grid grid-cols-4 items-start gap-4">
            <Label className="text-right pt-2">Pilih Tanggal</Label>
            <div className="col-span-3 space-y-2">
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="outline" className={cn("w-full font-normal justify-start text-left", !selectedDates?.length && "text-muted-foreground")}>
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {selectedDates.length > 0 ? `${selectedDates.length} tanggal dipilih` : "Buka kalender"}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="multiple" selected={selectedDates} onSelect={(dates) => setSelectedDates(dates || [])} />
                    </PopoverContent>
                </Popover>
                {selectedDates.length > 0 && (
                    <ScrollArea className="h-32 w-full rounded-md border p-2">
                        <div className="flex flex-col gap-1">
                            {selectedDates.sort((a,b) => a.getTime() - b.getTime()).map((date, index) => (
                                <div key={index} className="text-sm p-1 rounded-sm bg-muted">
                                    {format(date, "EEEE, dd MMMM yyyy", { locale: id })}
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                )}
            </div>
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
        <div className="space-y-6">
            <div className="space-y-2">
                <Label className="font-semibold">1. Pilih Kelas Binaan</Label>
                <ScrollArea className="h-32 rounded-md border p-4">
                    <div className="space-y-2">
                        {availableKelas.map((k) => (
                            <div key={k.id} className="flex items-center space-x-2">
                                <Checkbox
                                    id={`kelas-binaan-${k.id}`}
                                    checked={Array.isArray(formData.kelas) && formData.kelas.includes(k.nama)}
                                    onCheckedChange={(checked) => handleKelasBinaanChange(k.nama, !!checked)}
                                />
                                <label htmlFor={`kelas-binaan-${k.id}`} className="text-sm font-medium leading-none">
                                    {k.nama}
                                </label>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </div>
            <div className="space-y-2">
              <Label className="font-semibold">2. Pilih Siswa Binaan</Label>
                <ScrollArea className="h-52 rounded-md border">
                    {kelasBinaanTerpilihUntukPendamping.length > 0 ? (
                     <Accordion type="multiple" className="w-full">
                        {Object.keys(siswaDisaringDanDikelompokkan).sort().map(namaKelas => {
                            const siswaDiKelas = siswaDisaringDanDikelompokkan[namaKelas] || [];
                            const siswaBinaan = Array.isArray(formData.siswaBinaan) ? formData.siswaBinaan : [];
                            const selectedSiswaInClass = siswaDiKelas.filter(s => siswaBinaan.includes(s.nama));
                            const isAllSelected = siswaDiKelas.length > 0 && selectedSiswaInClass.length === siswaDiKelas.length;

                            return (
                                <AccordionItem value={namaKelas} key={namaKelas}>
                                    <AccordionTrigger className="px-4 py-2 bg-muted/50">
                                       <div className="flex items-center gap-3 w-full">
                                            <Checkbox
                                                id={`kelas-check-${namaKelas}`}
                                                checked={isAllSelected}
                                                onCheckedChange={(checked) => handleSelectKelasForPendamping(namaKelas, !!checked)}
                                                onClick={(e) => e.stopPropagation()} 
                                            />
                                            <label htmlFor={`kelas-check-${namaKelas}`} className="flex-1 text-left">{namaKelas}</label>
                                       </div>
                                    </AccordionTrigger>
                                    <AccordionContent>
                                        <div className="p-4 space-y-2">
                                            {siswaDiKelas.map(siswa => (
                                                <div key={siswa.id} className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id={`siswa-${siswa.id}`}
                                                        checked={siswaBinaan.includes(siswa.nama)}
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
                            );
                        })}
                     </Accordion>
                     ) : (
                        <div className="p-4 text-center text-sm text-muted-foreground">
                            Pilih setidaknya satu kelas binaan untuk menampilkan daftar siswa.
                        </div>
                     )}
                </ScrollArea>
            </div>
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
                <div className="flex justify-end gap-2 mb-4 print:hidden">
                    <input type="file" ref={fileInputRef} className="hidden" onChange={(e) => handleImportData(e, key as TeacherRole)} accept=".csv" />
                    <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                        <Upload className="mr-2 h-4 w-4" />
                        Impor Tugas
                    </Button>
                    <Button variant="outline" onClick={() => handleExportData(key as TeacherRole)}>
                        <Download className="mr-2 h-4 w-4" />
                        Ekspor Tugas
                    </Button>
                </div>
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
