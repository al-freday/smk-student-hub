
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { PlusCircle, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getSourceData, updateSourceData } from "@/lib/data-manager";

interface Guru {
  id: number;
  nama: string;
  mapel?: string;
  kelas?: string;
  hariPiket?: string;
}

type TeacherType = 'wali_kelas' | 'guru_bk' | 'guru_mapel' | 'guru_piket' | 'guru_pendamping';

const initialTeachers: { [key in TeacherType]: Guru[] } = {
    wali_kelas: [],
    guru_bk: [],
    guru_mapel: [],
    guru_piket: [],
    guru_pendamping: [],
};

export default function ManajemenGuruPage() {
    const { toast } = useToast();
    const [teachers, setTeachers] = useState<{ [key in TeacherType]: Guru[] }>(initialTeachers);
    const [activeTab, setActiveTab] = useState<TeacherType>('wali_kelas');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingTeacher, setEditingTeacher] = useState<Guru | null>(null);
    const [teacherToDelete, setTeacherToDelete] = useState<Guru | null>(null);
    const [userRole, setUserRole] = useState<string | null>(null);
    
    const [formData, setFormData] = useState<Partial<Guru>>({});
    
    const loadData = () => {
        const savedTeachers = getSourceData('teachersData', initialTeachers);
        setTeachers(savedTeachers);
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
    
    const getRoleName = (tab: TeacherType) => {
        switch (tab) {
            case 'wali_kelas': return 'Wali Kelas';
            case 'guru_mapel': return 'Guru Mapel';
            case 'guru_piket': return 'Guru Piket';
            case 'guru_bk': return 'Guru BK';
            case 'guru_pendamping': return 'Guru Pendamping';
            default: return 'Guru';
        }
    };

    const handleOpenDialog = (teacher: Guru | null = null) => {
        setEditingTeacher(teacher);
        setFormData(teacher || {});
        setIsDialogOpen(true);
    };

    const handleSave = () => {
        if (!formData.nama) {
            toast({ title: "Gagal", description: "Nama guru harus diisi.", variant: "destructive" });
            return;
        }

        const currentList = teachers[activeTab];
        let updatedList;
        if (editingTeacher) {
            updatedList = currentList.map(t => t.id === editingTeacher.id ? { ...t, ...formData } : t);
        } else {
            const newId = currentList.length > 0 ? Math.max(...currentList.map(t => t.id)) + 1 : 1;
            updatedList = [...currentList, { ...formData, id: newId } as Guru];
        }
        
        const updatedTeachers = { ...teachers, [activeTab]: updatedList };
        saveData(updatedTeachers);
        
        toast({ title: "Sukses", description: `Data ${getRoleName(activeTab)} berhasil disimpan.` });
        setIsDialogOpen(false);
    };
    
    const handleDelete = () => {
        if (!teacherToDelete) return;
        
        const updatedList = teachers[activeTab].filter(t => t.id !== teacherToDelete.id);
        const updatedTeachers = { ...teachers, [activeTab]: updatedList };
        saveData(updatedTeachers);

        toast({ title: "Data Dihapus", description: `${teacherToDelete.nama} telah dihapus.` });
        setTeacherToDelete(null);
    };
    
    const canEdit = userRole === 'wakasek_kesiswaan';

    const renderFormFields = () => (
        <>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="nama" className="text-right">Nama</Label>
                <Input id="nama" value={formData.nama || ""} onChange={e => setFormData({ ...formData, nama: e.target.value })} className="col-span-3" />
            </div>
            {activeTab === 'wali_kelas' && (
                 <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="kelas" className="text-right">Kelas Binaan</Label>
                    <Input id="kelas" value={formData.kelas || ""} onChange={e => setFormData({ ...formData, kelas: e.target.value })} className="col-span-3" />
                </div>
            )}
             {activeTab === 'guru_mapel' && (
                 <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="mapel" className="text-right">Mata Pelajaran</Label>
                    <Input id="mapel" value={formData.mapel || ""} onChange={e => setFormData({ ...formData, mapel: e.target.value })} className="col-span-3" />
                </div>
            )}
             {activeTab === 'guru_piket' && (
                 <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="hariPiket" className="text-right">Hari Piket</Label>
                    <Input id="hariPiket" value={formData.hariPiket || ""} onChange={e => setFormData({ ...formData, hariPiket: e.target.value })} className="col-span-3" />
                </div>
            )}
        </>
    );

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
            <Card>
                <CardHeader>
                    <CardTitle>Daftar Guru</CardTitle>
                    <CardDescription>
                       {canEdit 
                            ? "Perubahan di sini akan memengaruhi data pengguna secara otomatis."
                            : "Data ini dikelola oleh Wakasek Kesiswaan."
                       }
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as TeacherType)}>
                        <TabsList className="grid w-full grid-cols-5">
                            <TabsTrigger value="wali_kelas">Wali Kelas</TabsTrigger>
                            <TabsTrigger value="guru_bk">Guru BK</TabsTrigger>
                            <TabsTrigger value="guru_mapel">Guru Mapel</TabsTrigger>
                            <TabsTrigger value="guru_piket">Guru Piket</TabsTrigger>
                            <TabsTrigger value="guru_pendamping">Pendamping</TabsTrigger>
                        </TabsList>

                        {Object.keys(teachers).map((key) => (
                            <TabsContent value={key} key={key} className="mt-4">
                                <div className="flex justify-end mb-4">
                                    {canEdit && (
                                        <Button onClick={() => handleOpenDialog()}>
                                            <PlusCircle className="mr-2 h-4 w-4" />
                                            Tambah {getRoleName(key as TeacherType)}
                                        </Button>
                                    )}
                                </div>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Nama</TableHead>
                                            {key === 'wali_kelas' && <TableHead>Kelas Binaan</TableHead>}
                                            {key === 'guru_mapel' && <TableHead>Mata Pelajaran</TableHead>}
                                            {key === 'guru_piket' && <TableHead>Hari Piket</TableHead>}
                                            {canEdit && <TableHead className="text-right">Aksi</TableHead>}
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {teachers[key as TeacherType].length > 0 ? (
                                            teachers[key as TeacherType].map((guru) => (
                                                <TableRow key={guru.id}>
                                                    <TableCell className="font-medium">{guru.nama}</TableCell>
                                                    {key === 'wali_kelas' && <TableCell>{guru.kelas}</TableCell>}
                                                    {key === 'guru_mapel' && <TableCell>{guru.mapel}</TableCell>}
                                                    {key === 'guru_piket' && <TableCell>{guru.hariPiket}</TableCell>}
                                                    {canEdit && (
                                                        <TableCell className="text-right">
                                                            <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(guru)}>
                                                                <Edit className="h-4 w-4" />
                                                            </Button>
                                                            <Button variant="ghost" size="icon" onClick={() => setTeacherToDelete(guru)}>
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
                            </TabsContent>
                        ))}
                    </Tabs>
                </CardContent>
            </Card>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>{editingTeacher ? 'Edit' : 'Tambah'} {getRoleName(activeTab)}</DialogTitle>
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
