
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusCircle, Edit, Trash2, Users, School, AlertTriangle, UserCog } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getSourceData, updateSourceData } from "@/lib/data-manager";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface Guru {
  id: number;
  nama: string;
  mapel?: string;
  kelas?: string;
  hariPiket?: string;
}

interface Kelas {
    id: number;
    nama: string;
}

type TeacherType = 'wali_kelas' | 'guru_bk' | 'guru_mapel' | 'guru_piket' | 'guru_pendamping';

const initialTeachers: { [key in TeacherType]: Guru[] } = {
    wali_kelas: [], guru_bk: [], guru_mapel: [], guru_piket: [], guru_pendamping: [],
};

const roleOptions: { value: TeacherType; label: string }[] = [
    { value: 'wali_kelas', label: 'Wali Kelas' },
    { value: 'guru_bk', label: 'Guru BK' },
    { value: 'guru_mapel', label: 'Guru Mapel' },
    { value: 'guru_piket', label: 'Guru Piket' },
    { value: 'guru_pendamping', label: 'Guru Pendamping' },
];

export default function ManajemenGuruPage() {
    const { toast } = useToast();
    const [teachers, setTeachers] = useState<{ [key in TeacherType]: Guru[] }>(initialTeachers);
    const [kelas, setKelas] = useState<Kelas[]>([]);
    
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingTeacher, setEditingTeacher] = useState<(Guru & { role: TeacherType }) | null>(null);
    const [teacherToDelete, setTeacherToDelete] = useState<(Guru & { role: TeacherType }) | null>(null);
    const [userRole, setUserRole] = useState<string | null>(null);
    
    const [formData, setFormData] = useState<Partial<Guru> & { role?: TeacherType }>({});
    
    const loadData = () => {
        const savedTeachers = getSourceData('teachersData', initialTeachers);
        const savedKelas = getSourceData('kelasData', []);
        setTeachers(savedTeachers);
        setKelas(savedKelas);
    };

    useEffect(() => {
        const role = localStorage.getItem('userRole');
        setUserRole(role);
        loadData();
    }, []);

    const saveData = (data: typeof teachers) => {
        updateSourceData('teachersData', data);
        setTeachers(data);
    };
    
    const handleOpenDialog = (teacher: (Guru & { role: TeacherType }) | null = null) => {
        setEditingTeacher(teacher);
        setFormData(teacher || { role: 'wali_kelas' });
        setIsDialogOpen(true);
    };
    
    const handleOpenDeleteDialog = (guru: Guru, role: TeacherType) => {
        setTeacherToDelete({ ...guru, role });
    };

    const handleSave = () => {
        const { role, ...guruData } = formData;
        if (!guruData.nama || !role) {
            toast({ title: "Gagal", description: "Nama dan peran guru harus diisi.", variant: "destructive" });
            return;
        }

        const currentList = teachers[role];
        let updatedList;
        if (editingTeacher && editingTeacher.role === role) {
            updatedList = currentList.map(t => t.id === editingTeacher.id ? { ...t, ...guruData } : t);
            const updatedTeachers = { ...teachers, [role]: updatedList };
            saveData(updatedTeachers);
        } else {
            const newId = Date.now();
            updatedList = [...currentList, { ...guruData, id: newId } as Guru];
            let updatedTeachers = { ...teachers, [role]: updatedList };

            if (editingTeacher && editingTeacher.role !== role) {
                const oldList = teachers[editingTeacher.role].filter(t => t.id !== editingTeacher.id);
                updatedTeachers = { ...updatedTeachers, [editingTeacher.role]: oldList };
            }
            saveData(updatedTeachers);
        }
        
        toast({ title: "Sukses", description: `Data guru berhasil disimpan.` });
        setIsDialogOpen(false);
    };
    
    const handleDelete = () => {
        if (!teacherToDelete) return;
        
        const updatedList = teachers[teacherToDelete.role].filter(t => t.id !== teacherToDelete.id);
        const updatedTeachers = { ...teachers, [teacherToDelete.role]: updatedList };
        saveData(updatedTeachers);

        toast({ title: "Data Dihapus", description: `${teacherToDelete.nama} telah dihapus.` });
        setTeacherToDelete(null);
    };
    
    const canEdit = userRole === 'wakasek_kesiswaan';
    const totalGuru = Object.values(teachers).reduce((acc, curr) => acc + curr.length, 0);
    const totalWaliKelas = teachers.wali_kelas.length;
    const totalKelas = kelas.length;
    const isWaliKelasSynced = totalWaliKelas === totalKelas;

    return (
        <div className="flex-1 space-y-6">
             <div>
                <h2 className="text-3xl font-bold tracking-tight">Manajemen Guru</h2>
                <p className="text-muted-foreground">
                    {canEdit
                        ? "Kelola data guru. Perubahan di sini akan menjadi acuan untuk semua pengguna."
                        : "Lihat data guru yang telah diatur oleh administrator."
                    }
                </p>
            </div>
            
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Guru</CardTitle>
                        <UserCog className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalGuru}</div>
                        <p className="text-xs text-muted-foreground">Jumlah semua guru terdaftar</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Wali Kelas Terdaftar</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalWaliKelas}</div>
                        <p className="text-xs text-muted-foreground">dari {totalKelas} kelas yang ada</p>
                    </CardContent>
                </Card>
                 <Card className={!isWaliKelasSynced ? "border-destructive" : ""}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Status Sinkronisasi</CardTitle>
                        <School className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${!isWaliKelasSynced ? "text-destructive" : ""}`}>
                            {isWaliKelasSynced ? "Sinkron" : "Tidak Sinkron"}
                        </div>
                        <p className={`text-xs ${!isWaliKelasSynced ? "text-destructive" : "text-muted-foreground"}`}>
                           {isWaliKelasSynced 
                               ? "Jumlah wali kelas sesuai jumlah kelas." 
                               : "Jumlah wali kelas tidak sama dengan jumlah kelas."
                           }
                        </p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Daftar Guru</CardTitle>
                            <CardDescription>
                               {canEdit 
                                    ? "Perubahan di sini akan memengaruhi data pengguna secara otomatis."
                                    : "Data ini dikelola oleh Wakasek Kesiswaan."
                               }
                            </CardDescription>
                        </div>
                         {canEdit && (
                            <Button onClick={() => handleOpenDialog()}>
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Tambah Guru
                            </Button>
                        )}
                    </div>
                </CardHeader>
                <CardContent>
                    {roleOptions.map(role => (
                        <div key={role.value} className="mb-6">
                            <h3 className="text-lg font-semibold mb-2">{role.label} ({teachers[role.value].length})</h3>
                             <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Nama</TableHead>
                                        {role.value === 'wali_kelas' && <TableHead>Kelas Binaan</TableHead>}
                                        {role.value === 'guru_mapel' && <TableHead>Mata Pelajaran</TableHead>}
                                        {role.value === 'guru_piket' && <TableHead>Hari Piket</TableHead>}
                                        {canEdit && <TableHead className="text-right">Aksi</TableHead>}
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {teachers[role.value].length > 0 ? (
                                        teachers[role.value].map((guru) => (
                                            <TableRow key={guru.id}>
                                                <TableCell className="font-medium">{guru.nama}</TableCell>
                                                {role.value === 'wali_kelas' && <TableCell>{guru.kelas}</TableCell>}
                                                {role.value === 'guru_mapel' && <TableCell>{guru.mapel}</TableCell>}
                                                {role.value === 'guru_piket' && <TableCell>{guru.hariPiket}</TableCell>}
                                                {canEdit && (
                                                    <TableCell className="text-right">
                                                        <Button variant="ghost" size="icon" onClick={() => handleOpenDialog({ ...guru, role: role.value })}>
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" onClick={() => handleOpenDeleteDialog(guru, role.value)}>
                                                            <Trash2 className="h-4 w-4 text-destructive" />
                                                        </Button>
                                                    </TableCell>
                                                )}
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={canEdit ? 3 : 2} className="h-24 text-center">
                                                Belum ada data.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    ))}
                </CardContent>
            </Card>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>{editingTeacher ? 'Edit' : 'Tambah'} Guru</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="role" className="text-right">Peran</Label>
                             <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value as TeacherType })}>
                                <SelectTrigger className="col-span-3"><SelectValue placeholder="Pilih Peran" /></SelectTrigger>
                                <SelectContent>
                                    {roleOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="nama" className="text-right">Nama</Label>
                            <Input id="nama" value={formData.nama || ""} onChange={e => setFormData({ ...formData, nama: e.target.value })} className="col-span-3" />
                        </div>
                        {formData.role === 'wali_kelas' && (
                             <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="kelas" className="text-right">Kelas Binaan</Label>
                                <Input id="kelas" value={formData.kelas || ""} onChange={e => setFormData({ ...formData, kelas: e.target.value })} className="col-span-3" />
                            </div>
                        )}
                         {formData.role === 'guru_mapel' && (
                             <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="mapel" className="text-right">Mata Pelajaran</Label>
                                <Input id="mapel" value={formData.mapel || ""} onChange={e => setFormData({ ...formData, mapel: e.target.value })} className="col-span-3" />
                            </div>
                        )}
                         {formData.role === 'guru_piket' && (
                             <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="hariPiket" className="text-right">Hari Piket</Label>
                                <Input id="hariPiket" value={formData.hariPiket || ""} onChange={e => setFormData({ ...formData, hariPiket: e.target.value })} className="col-span-3" />
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <DialogClose asChild><Button variant="outline">Batal</Button></DialogClose>
                        <Button onClick={handleSave}>Simpan</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <AlertDialog open={!!teacherToDelete} onOpenChange={() => setTeacherToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
                        <AlertDialogDescription>
                           Tindakan ini tidak dapat dibatalkan. Ini akan menghapus data guru secara permanen.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete}>Hapus</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
