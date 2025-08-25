
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
import { Edit } from "lucide-react";
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

interface Kelas {
  id: number;
  nama: string;
}

interface Guru {
  id: number;
  nama: string;
  mapel?: string;
  kelas?: string;
  hariPiket?: string;
  tugasKelas?: string; // Untuk tugas Guru BK
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

export default function ManajemenGuruPage() {
  const { toast } = useToast();
  const [teachers, setTeachers] = useState<{ [key in TeacherRole]: Guru[] }>(initialTeachers);
  const [activeTab, setActiveTab] = useState<TeacherRole>('wali_kelas');
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Guru | null>(null);
  const [formData, setFormData] = useState<Partial<Guru>>({});
  const [availableGrades, setAvailableGrades] = useState<string[]>([]);

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
    
    // Load available grades from class data
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

    const handleStorageChange = (event: StorageEvent) => {
        if (event.key === 'teachersData') {
            loadDataFromStorage();
        }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
        window.removeEventListener('storage', handleStorageChange);
    };
  }, [toast]);

  const handleOpenDialog = (guru: Guru) => {
      setEditingTeacher(guru);
      setFormData(guru);
      setIsDialogOpen(true);
  };

  const handleSave = () => {
      if (!editingTeacher) return;

      const teachersData = getSourceData('teachersData', initialTeachers);
      const currentList: Guru[] = teachersData[activeTab];
      
      const updatedList = currentList.map((t: Guru) => 
          t.id === editingTeacher.id ? { ...t, ...formData } : t
      );

      const updatedTeachers = { ...teachersData, [activeTab]: updatedList };
      updateSourceData('teachersData', updatedTeachers);
      loadDataFromStorage(); 
      toast({ title: "Sukses", description: `Tugas untuk ${editingTeacher.nama} berhasil diperbarui.` });
      setIsDialogOpen(false);
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
          <Input
            id="kelas"
            value={formData.kelas || ''}
            onChange={(e) => setFormData({ ...formData, kelas: e.target.value })}
            className="col-span-3"
            placeholder="Contoh: X TKJ 1"
          />
        </div>
      )}
      {activeTab === 'guru_mapel' && (
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="mapel" className="text-right">Mata Pelajaran</Label>
          <Input
            id="mapel"
            value={formData.mapel || ''}
            onChange={(e) => setFormData({ ...formData, mapel: e.target.value })}
            className="col-span-3"
            placeholder="Contoh: Matematika - X TKJ 1"
          />
        </div>
      )}
      {activeTab === 'guru_piket' && (
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="hariPiket" className="text-right">Hari Piket</Label>
          <Input
            id="hariPiket"
            value={formData.hariPiket || ''}
            onChange={(e) => setFormData({ ...formData, hariPiket: e.target.value })}
            className="col-span-3"
            placeholder="Contoh: Senin"
          />
        </div>
      )}
       {activeTab === 'guru_bk' && (
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="tugasKelas" className="text-right">Tugas Pembinaan</Label>
           <Select
              value={formData.tugasKelas}
              onValueChange={(value) => setFormData({ ...formData, tugasKelas: value })}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Pilih tingkatan kelas" />
              </SelectTrigger>
              <SelectContent>
                {availableGrades.map((grade) => (
                  <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                ))}
              </SelectContent>
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
                                {key === 'guru_piket' && `Jadwal Piket: ${guru.hariPiket || '-'}`}
                                {key === 'guru_bk' && `Tugas Pembinaan: ${guru.tugasKelas || '-'}`}
                                {key === 'guru_pendamping' && `Penugasan Umum`}
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
          <DialogContent className="sm:max-w-[425px]">
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
