
"use client";

import { useState, useEffect } from "react";
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
import { Edit, Calendar as CalendarIcon } from "lucide-react";
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
import { getSourceData, updateSourceData } from "@/lib/data-manager";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { format } from "date-fns";

interface Kelas {
  id: number;
  nama: string;
}

interface Siswa {
  id: number;
  nama: string;
  kelas: string;
}

interface Guru {
  id: number;
  nama: string;
  mapel?: string;
  kelas?: string;
  hariPiket?: string[]; // Diubah menjadi array untuk multi-hari
  tanggalPiket?: string[]; // Array untuk tanggal spesifik
  tugasKelas?: string; 
  siswaBinaan?: string;
}

type TeacherRole = 'wali_kelas' | 'guru_bk' | 'guru_mapel' | 'guru_piket' | 'guru_pendamping';

const initialTeachers: { [key in TeacherRole]: Guru[] } = {
    wali_kelas: [], guru_bk: [], guru_mapel: [], guru_piket: [], guru_pendamping: [],
};

const roleOptions: { value: TeacherRole; label: string }[] = [
    { value: 'wali_kelas', label: 'Wali Kelas' },
    { value: 'guru_bk', label: 'Guru BK' },
    { value: 'guru_mapel', label: 'Guru Mapel' },
    { value: 'guru_piket', label: 'Guru Piket' },
    { value: 'guru_pendamping', label: 'Guru Pendamping' },
];

const daftarHariPiket = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat"];

export default function ManajemenGuruPage() {
  const { toast } = useToast();
  const [teachers, setTeachers] = useState<{ [key in TeacherRole]: Guru[] }>(initialTeachers);
  const [activeTab, setActiveTab] = useState<TeacherRole>('wali_kelas');
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Guru | null>(null);
  const [formData, setFormData] = useState<Partial<Guru>>({});
  
  const [availableKelas, setAvailableKelas] = useState<Kelas[]>([]);
  const [availableGrades, setAvailableGrades] = useState<string[]>([]);
  const [daftarSiswa, setDaftarSiswa] = useState<Siswa[]>([]);
  
  // State for multi-date picker
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);

  const loadDataFromStorage = () => {
    try {
        const teachersData = getSourceData('teachersData', initialTeachers);
        setTeachers(teachersData);
    } catch (error) {
        console.error("Failed to parse teachers data from localStorage", error);
        toast({
            title: "Gagal Memuat Data",
            description: "Data guru tidak dapat dimuat.",
            variant: "destructive"
        })
    }
  };
  
  useEffect(() => {
    loadDataFromStorage();
    
    const kelasData: Kelas[] = getSourceData('kelasData', []);
    setAvailableKelas(kelasData);
    if (kelasData.length > 0) {
        const grades = new Set<string>();
        kelasData.forEach(kelas => {
            if (kelas.nama.startsWith("X ")) grades.add("Kelas X");
            else if (kelas.nama.startsWith("XI ")) grades.add("Kelas XI");
            else if (kelas.nama.startsWith("XII ")) grades.add("Kelas XII");
        });
        setAvailableGrades(Array.from(grades).sort());
    }
    
    const siswaData: Siswa[] = getSourceData('siswaData', []);
    setDaftarSiswa(siswaData);

    const handleStorageChange = (event: StorageEvent) => {
        if (event.key === 'teachersData') loadDataFromStorage();
        if (event.key === 'siswaData') setDaftarSiswa(getSourceData('siswaData', []));
        if (event.key === 'kelasData') setAvailableKelas(getSourceData('kelasData', []));
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [toast]);

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

  const handleSave = () => {
      if (!editingTeacher) return;
      
      const dataToSave = { ...formData };
      if (activeTab === 'guru_piket') {
          dataToSave.tanggalPiket = selectedDates.map(d => format(d, 'yyyy-MM-dd'));
      }

      const teachersData = getSourceData('teachersData', initialTeachers);
      const currentList: Guru[] = teachersData[activeTab] || [];
      
      const updatedList = currentList.map((t: Guru) => 
          t.id === editingTeacher.id ? { ...t, ...dataToSave } : t
      );

      const updatedTeachers = { ...teachersData, [activeTab]: updatedList };
      updateSourceData('teachersData', updatedTeachers);
      loadDataFromStorage(); 
      toast({ title: "Sukses", description: `Tugas untuk ${editingTeacher.nama} berhasil diperbarui.` });
      setIsDialogOpen(false);
  };
  
  const handleHariPiketChange = (hari: string, checked: boolean) => {
      const currentHari = formData.hariPiket || [];
      if (checked) {
          setFormData({ ...formData, hariPiket: [...currentHari, hari] });
      } else {
          setFormData({ ...formData, hariPiket: currentHari.filter(h => h !== hari) });
      }
  };
  
  const formatPiketDetails = (guru: Guru) => {
      const hari = guru.hariPiket && guru.hariPiket.length > 0 ? `Hari: ${guru.hariPiket.join(', ')}` : '';
      const tanggal = guru.tanggalPiket && guru.tanggalPiket.length > 0 ? `Tanggal: ${guru.tanggalPiket.join(', ')}` : '';
      
      if (hari && tanggal) return `${hari} | ${tanggal}`;
      if (hari) return hari;
      if (tanggal) return tanggal;
      return '-';
  };

  const renderFormFields = () => (
    <>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="nama" className="text-right">Nama</Label>
        <Input id="nama" value={formData.nama || ''} disabled className="col-span-3" />
      </div>
      {activeTab === 'wali_kelas' && (
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="kelas" className="text-right">Kelas Binaan</Label>
           <Select value={formData.kelas} onValueChange={(value) => setFormData({ ...formData, kelas: value })}>
              <SelectTrigger className="col-span-3"><SelectValue placeholder="Pilih Kelas" /></SelectTrigger>
              <SelectContent>{availableKelas.map((k) => <SelectItem key={k.id} value={k.nama}>{k.nama}</SelectItem>)}</SelectContent>
            </Select>
        </div>
      )}
      {activeTab === 'guru_mapel' && (
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="mapel" className="text-right">Mata Pelajaran</Label>
          <Input id="mapel" value={formData.mapel || ''} onChange={(e) => setFormData({ ...formData, mapel: e.target.value })} className="col-span-3" placeholder="Contoh: Matematika - X TKJ 1" />
        </div>
      )}
      {activeTab === 'guru_piket' && (
        <>
            <div className="grid grid-cols-4 items-start gap-4">
                <Label className="text-right pt-2">Hari Piket Rutin</Label>
                <div className="col-span-3 space-y-2">
                    {daftarHariPiket.map(hari => (
                        <div key={hari} className="flex items-center space-x-2">
                            <Checkbox 
                                id={`hari-${hari}`} 
                                checked={formData.hariPiket?.includes(hari)}
                                onCheckedChange={(checked) => handleHariPiketChange(hari, !!checked)}
                            />
                            <label htmlFor={`hari-${hari}`} className="text-sm font-medium leading-none">{hari}</label>
                        </div>
                    ))}
                </div>
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Tanggal Piket Khusus</Label>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="outline" className="col-span-3 font-normal justify-start">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {selectedDates.length > 0 ? `${selectedDates.length} tanggal dipilih` : "Pilih tanggal"}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="multiple" selected={selectedDates} onSelect={(dates) => setSelectedDates(dates || [])} />
                    </PopoverContent>
                </Popover>
            </div>
        </>
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
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="siswaBinaan" className="text-right">Siswa Binaan</Label>
           <Select value={formData.siswaBinaan} onValueChange={(value) => setFormData({ ...formData, siswaBinaan: value })}>
              <SelectTrigger className="col-span-3"><SelectValue placeholder="Pilih siswa untuk dibimbing" /></SelectTrigger>
              <SelectContent>{daftarSiswa.map((siswa) => <SelectItem key={siswa.id} value={siswa.nama}>{siswa.nama} - {siswa.kelas}</SelectItem>)}</SelectContent>
            </Select>
        </div>
      )}
    </>
  );

  return (
    <div className="flex-1 space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Manajemen Guru</h2>
        <p className="text-muted-foreground">
          Kelola penugasan guru. Data guru diambil dari daftar pengguna yang diatur oleh Administrator.
        </p>
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
                        <TableHead className="text-right">Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {teachers[key as TeacherRole]?.length > 0 ? (
                        teachers[key as TeacherRole].map((guru) => (
                            <TableRow key={guru.id}>
                            <TableCell className="font-medium">{guru.nama}</TableCell>
                            <TableCell>
                                {key === 'wali_kelas' && `Kelas Binaan: ${guru.kelas || '-'}`}
                                {key === 'guru_mapel' && `Mengajar: ${guru.mapel || '-'}`}
                                {key === 'guru_piket' && formatPiketDetails(guru)}
                                {key === 'guru_bk' && `Tugas Pembinaan: ${guru.tugasKelas || '-'}`}
                                {key === 'guru_pendamping' && `Mendampingi: ${guru.siswaBinaan || '-'}`}
                            </TableCell>
                            <TableCell className="text-right">
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
          <DialogContent className="sm:max-w-md">
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
                  <Button onClick={handleSave}>Simpan</Button>
              </DialogFooter>
          </DialogContent>
      </Dialog>
    </div>
  );
}
