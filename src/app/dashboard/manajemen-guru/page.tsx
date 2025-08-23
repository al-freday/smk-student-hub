
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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

interface Guru {
  id: number;
  nama: string;
  mapel?: string;
  kelas?: string;
  hariPiket?: string;
}

type TeacherType = 'waliKelas' | 'guruBk' | 'guruMapel' | 'guruPiket' | 'guruPendamping';

const initialTeachers: { [key in TeacherType]: Guru[] } = {
    waliKelas: Array.from({ length: 16 }, (_, i) => ({ id: i + 1, nama: `Wali Kelas ${i + 1}`, kelas: `Kelas Binaan ${i + 1}` })),
    guruBk: Array.from({ length: 3 }, (_, i) => ({ id: i + 1, nama: `Guru BK ${i + 1}` })),
    guruMapel: Array.from({ length: 40 }, (_, i) => ({ id: i + 1, nama: `Guru Mapel ${i + 1}`, mapel: `Mapel ${i + 1}` })),
    guruPiket: Array.from({ length: 40 }, (_, i) => ({ id: i + 1, nama: `Guru Piket ${i + 1}`, hariPiket: "Senin" })),
    guruPendamping: Array.from({ length: 40 }, (_, i) => ({ id: i + 1, nama: `Guru Pendamping ${i + 1}` })),
};

export default function ManajemenGuruPage() {
    const { toast } = useToast();
    const [teachers, setTeachers] = useState<{ [key in TeacherType]: Guru[] }>(initialTeachers);
    const [activeTab, setActiveTab] = useState<TeacherType>('waliKelas');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingTeacher, setEditingTeacher] = useState<Guru | null>(null);
    const [teacherToDelete, setTeacherToDelete] = useState<Guru | null>(null);
    
    // Form state
    const [formData, setFormData] = useState<Partial<Guru>>({});

    useEffect(() => {
        // Load data from localStorage if available
        const savedTeachers = localStorage.getItem('teachersData');
        if (savedTeachers) {
            setTeachers(JSON.parse(savedTeachers));
        }
    }, []);

    const saveDataToLocalStorage = (data: typeof teachers) => {
        localStorage.setItem('teachersData', JSON.stringify(data));
    };
    
    const getRoleName = (tab: TeacherType) => {
        switch (tab) {
            case 'waliKelas': return 'Wali Kelas';
            case 'guruMapel': return 'Guru Mapel';
            case 'guruPiket': return 'Guru Piket';
            case 'guruBk': return 'Guru BK';
            case 'guruPendamping': return 'Guru Pendamping';
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
        setTeachers(updatedTeachers);
        saveDataToLocalStorage(updatedTeachers);
        
        toast({ title: "Sukses", description: `Data ${getRoleName(activeTab)} berhasil disimpan.` });
        setIsDialogOpen(false);
    };
    
    const handleDelete = () => {
        if (!teacherToDelete) return;
        
        const updatedList = teachers[activeTab].filter(t => t.id !== teacherToDelete.id);
        const updatedTeachers = { ...teachers, [activeTab]: updatedList };
        setTeachers(updatedTeachers);
        saveDataToLocalStorage(updatedTeachers);

        toast({ title: "Data Dihapus", description: `${teacherToDelete.nama} telah dihapus.` });
        setTeacherToDelete(null);
    };

    const renderFormFields = () => (
        <>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="nama" className="text-right">Nama</Label>
                <Input id="nama" value={formData.nama || ""} onChange={e => setFormData({ ...formData, nama: e.target.value })} className="col-span-3" />
            </div>
            {activeTab === 'waliKelas' && (
                 <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="kelas" className="text-right">Kelas Binaan</Label>
                    <Input id="kelas" value={formData.kelas || ""} onChange={e => setFormData({ ...formData, kelas: e.target.value })} className="col-span-3" />
                </div>
            )}
             {activeTab === 'guruMapel' && (
                 <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="mapel" className="text-right">Mata Pelajaran</Label>
                    <Input id="mapel" value={formData.mapel || ""} onChange={e => setFormData({ ...formData, mapel: e.target.value })} className="col-span-3" />
                </div>
            )}
             {activeTab === 'guruPiket' && (
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
                    Kelola data guru berdasarkan perannya. Data ini akan menjadi acuan untuk manajemen pengguna.
                </p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Daftar Guru</CardTitle>
                    <CardDescription>
                        Berikut adalah daftar guru yang terdaftar di sistem. Perubahan di sini akan memengaruhi data pengguna.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as TeacherType)}>
                        <TabsList className="grid w-full grid-cols-5">
                            <TabsTrigger value="waliKelas">Wali Kelas</TabsTrigger>
                            <TabsTrigger value="guruBk">Guru BK</TabsTrigger>
                            <TabsTrigger value="guruMapel">Guru Mapel</TabsTrigger>
                            <TabsTrigger value="guruPiket">Guru Piket</TabsTrigger>
                            <TabsTrigger value="guruPendamping">Pendamping</TabsTrigger>
                        </TabsList>

                        {Object.keys(teachers).map((key) => (
                            <TabsContent value={key} key={key} className="mt-4">
                                <div className="flex justify-end mb-4">
                                    <Button onClick={() => handleOpenDialog()}>
                                        <PlusCircle className="mr-2 h-4 w-4" />
                                        Tambah {getRoleName(key as TeacherType)}
                                    </Button>
                                </div>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Nama</TableHead>
                                            {key === 'waliKelas' && <TableHead>Kelas Binaan</TableHead>}
                                            {key === 'guruMapel' && <TableHead>Mata Pelajaran</TableHead>}
                                            {key === 'guruPiket' && <TableHead>Hari Piket</TableHead>}
                                            <TableHead className="text-right">Aksi</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {teachers[key as TeacherType].length > 0 ? (
                                            teachers[key as TeacherType].map((guru) => (
                                                <TableRow key={guru.id}>
                                                    <TableCell className="font-medium">{guru.nama}</TableCell>
                                                    {key === 'waliKelas' && <TableCell>{guru.kelas}</TableCell>}
                                                    {key === 'guruMapel' && <TableCell>{guru.mapel}</TableCell>}
                                                    {key === 'guruPiket' && <TableCell>{guru.hariPiket}</TableCell>}
                                                    <TableCell className="text-right">
                                                        <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(guru)}>
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" onClick={() => setTeacherToDelete(guru)}>
                                                            <Trash2 className="h-4 w-4 text-destructive" />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={3} className="h-24 text-center">
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

    