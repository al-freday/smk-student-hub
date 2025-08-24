
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
import { Edit, Trash2, PlusCircle, Eye, Download } from "lucide-react";
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
import { getSourceData, updateSourceData } from "@/lib/data-manager";

interface Guru {
  id: number;
  nama: string;
  mapel?: string;
  kelas?: string;
  hariPiket?: string;
}

interface User extends Guru {
  email: string;
  role: string;
  password?: string;
}

type TeacherRole = 'wali_kelas' | 'guru_bk' | 'guru_mapel' | 'guru_piket' | 'guru_pendamping';

const roleOptions: { value: TeacherRole; label: string }[] = [
    { value: 'wali_kelas', label: 'Wali Kelas' },
    { value: 'guru_bk', label: 'Guru BK' },
    { value: 'guru_mapel', label: 'Guru Mapel' },
    { value: 'guru_piket', label: 'Guru Piket' },
    { value: 'guru_pendamping', label: 'Guru Pendamping' },
];

const getRoleName = (roleKey: TeacherRole | string) => {
    const role = roleOptions.find(r => r.value === roleKey);
    return role ? role.label : 'Pengguna';
};


const createEmailFromName = (name: string, id: number) => {
    const namePart = name.toLowerCase().replace(/\s+/g, '.').replace(/[^a-z0-9.]/g, '');
    return `${namePart}${id}@schoolemail.com`;
};

const initialTeachers: { [key in TeacherRole]: Guru[] } = {
    wali_kelas: [], guru_bk: [], guru_mapel: [], guru_piket: [], guru_pendamping: [],
};


export default function ManajemenPenggunaPage() {
  const { toast } = useToast();
  const [users, setUsers] = useState<{ [key in TeacherRole]: User[] }>({
        wali_kelas: [], guru_bk: [], guru_mapel: [], guru_piket: [], guru_pendamping: [],
  });
  const [activeTab, setActiveTab] = useState<TeacherRole>('wali_kelas');
  const [userRole, setUserRole] = useState<string | null>(null);
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [formData, setFormData] = useState<Partial<User>>({});

  const loadDataFromStorage = () => {
    try {
        const teachersData = getSourceData('teachersData', initialTeachers);
        const usersData = { wali_kelas: [], guru_bk: [], guru_mapel: [], guru_piket: [], guru_pendamping: [] };
        
        for (const roleKey in teachersData) {
            if (usersData.hasOwnProperty(roleKey)) {
                usersData[roleKey as TeacherRole] = teachersData[roleKey].map((guru: Guru) => ({
                    ...guru,
                    role: getRoleName(roleKey),
                    email: createEmailFromName(guru.nama, guru.id),
                    password: "password123", 
                }));
            }
        }
        setUsers(usersData);
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
    const role = localStorage.getItem('userRole');
    setUserRole(role);
    loadDataFromStorage();
    
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
  
  const canEdit = userRole === 'wakasek_kesiswaan';

  const handleShowPassword = (password: string) => {
    toast({
        title: "Password Pengguna",
        description: `Password untuk pengguna ini adalah: ${password}`,
    });
  };

  const handleOpenDialog = (user: User | null = null) => {
      setEditingUser(user);
      setFormData(user || {});
      setIsDialogOpen(true);
  };

  const handleSave = () => {
      if (!formData.nama) {
          toast({ title: "Gagal", description: "Nama pengguna harus diisi.", variant: "destructive" });
          return;
      }

      const teachersData = getSourceData('teachersData', initialTeachers);
      const currentList = teachersData[activeTab];
      let updatedList;

      if (editingUser) {
          updatedList = currentList.map((t: Guru) => t.id === editingUser.id ? { ...t, ...formData } : t);
      } else {
          const newId = currentList.length > 0 ? Math.max(...currentList.map((t: Guru) => t.id)) + 1 : 1;
          const newUser = { id: newId, nama: formData.nama, kelas: formData.kelas, mapel: formData.mapel, hariPiket: formData.hariPiket };
          updatedList = [...currentList, newUser];
      }

      const updatedTeachers = { ...teachersData, [activeTab]: updatedList };
      updateSourceData('teachersData', updatedTeachers);
      loadDataFromStorage(); 
      toast({ title: "Sukses", description: "Data pengguna berhasil disimpan." });
      setIsDialogOpen(false);
  };

  const handleDelete = () => {
      if (!userToDelete) return;

      const teachersData = getSourceData('teachersData', initialTeachers);
      const updatedList = teachersData[activeTab].filter((t: Guru) => t.id !== userToDelete.id);
      const updatedTeachers = { ...teachersData, [activeTab]: updatedList };

      updateSourceData('teachersData', updatedTeachers);
      loadDataFromStorage(); 
      toast({ title: "Pengguna Dihapus", description: `${userToDelete.nama} telah dihapus.` });
      setUserToDelete(null);
  };
  
  const handleExportData = () => {
    const teachersData = getSourceData('teachersData', initialTeachers);
    let allUsers: User[] = [];

    for (const roleKey in teachersData) {
        teachersData[roleKey as TeacherRole].forEach((guru: Guru) => {
            allUsers.push({
                ...guru,
                role: getRoleName(roleKey),
                email: createEmailFromName(guru.nama, guru.id),
                password: "password123", // Password default
            });
        });
    }

    const headers = ['ID', 'Nama', 'Email', 'Role', 'Password', 'Kelas Binaan', 'Mapel', 'Hari Piket'];
    const csvContent = [
        headers.join(','),
        ...allUsers.map(user => [
            user.id,
            `"${user.nama}"`,
            user.email,
            user.role,
            user.password,
            user.kelas || '',
            user.mapel || '',
            user.hariPiket || ''
        ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.href) {
        URL.revokeObjectURL(link.href);
    }
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute('download', 'user_data.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({ title: "Ekspor Berhasil", description: "Data pengguna telah diunduh sebagai user_data.csv." });
  };

  const renderFormFields = () => (
    <>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="nama" className="text-right">
          Nama
        </Label>
        <Input
          id="nama"
          value={formData.nama || ''}
          onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
          className="col-span-3"
        />
      </div>
      {activeTab === 'wali_kelas' && (
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="kelas" className="text-right">
            Kelas Binaan
          </Label>
          <Input
            id="kelas"
            value={formData.kelas || ''}
            onChange={(e) => setFormData({ ...formData, kelas: e.target.value })}
            className="col-span-3"
          />
        </div>
      )}
      {activeTab === 'guru_mapel' && (
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="mapel" className="text-right">
            Mata Pelajaran
          </Label>
          <Input
            id="mapel"
            value={formData.mapel || ''}
            onChange={(e) => setFormData({ ...formData, mapel: e.target.value })}
            className="col-span-3"
          />
        </div>
      )}
      {activeTab === 'guru_piket' && (
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="hariPiket" className="text-right">
            Hari Piket
          </Label>
          <Input
            id="hariPiket"
            value={formData.hariPiket || ''}
            onChange={(e) => setFormData({ ...formData, hariPiket: e.target.value })}
            className="col-span-3"
          />
        </div>
      )}
    </>
  );

  return (
    <div className="flex-1 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Manajemen Pengguna</h2>
          <p className="text-muted-foreground">
            {canEdit ? "Kelola data pengguna sistem, termasuk pembuatan password otomatis." : "Lihat daftar pengguna yang terdaftar."}
          </p>
        </div>
      </div>
        
      <Card>
        <CardHeader>
          <CardTitle>Daftar Pengguna</CardTitle>
          <CardDescription>
            {canEdit 
              ? "Gunakan tombol di setiap tab untuk menambah, mengubah, atau menghapus pengguna. Password dibuat otomatis dan dapat dilihat."
              : "Data ini dikelola oleh Wakasek Kesiswaan."
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as TeacherRole)}>
            <TabsList className="grid w-full grid-cols-5">
              {roleOptions.map(role => (
                 <TabsTrigger key={role.value} value={role.value}>{role.label}</TabsTrigger>
              ))}
            </TabsList>

            {Object.keys(users).map((key) => (
              <TabsContent value={key} key={key} className="mt-4">
                 <div className="flex justify-end mb-4 gap-2">
                    {canEdit && (
                       <>
                        <Button variant="outline" onClick={handleExportData}>
                            <Download className="mr-2 h-4 w-4" />
                            Export Data User
                        </Button>
                        <Button onClick={() => handleOpenDialog()}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Tambah {getRoleName(key as TeacherRole)}
                        </Button>
                       </>
                    )}
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nama</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Peran</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users[key as TeacherRole].length > 0 ? (
                       users[key as TeacherRole].map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.nama}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>{user.role}</TableCell>
                          <TableCell className="text-right">
                             {canEdit && (
                                <>
                                  <Button variant="outline" size="sm" onClick={() => handleShowPassword(user.password || "")} className="mr-2">
                                      <Eye className="mr-2 h-4 w-4" />
                                      Password
                                  </Button>
                                  <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(user)}>
                                      <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button variant="ghost" size="icon" onClick={() => setUserToDelete(user)}>
                                      <Trash2 className="h-4 w-4 text-destructive" />
                                  </Button>
                                </>
                             )}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center">
                          Belum ada data pengguna untuk peran ini.
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
                  <DialogTitle>{editingUser ? 'Edit' : 'Tambah'} Pengguna</DialogTitle>
                  <DialogDescription>
                      Lengkapi form di bawah untuk {editingUser ? 'mengubah' : 'menambahkan'} data pengguna.
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

      <AlertDialog open={!!userToDelete} onOpenChange={() => setUserToDelete(null)}>
          <AlertDialogContent>
              <AlertDialogHeader>
                  <DialogTitle>Apakah Anda yakin?</DialogTitle>
                  <AlertDialogDescription>
                     Tindakan ini tidak dapat dibatalkan. Ini akan menghapus data pengguna secara permanen.
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
