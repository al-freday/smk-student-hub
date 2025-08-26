
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
import { Edit, Trash2, PlusCircle, Eye, Download, ArrowLeft } from "lucide-react";
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
import { useRouter } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";


interface Guru {
  id: number | string;
  nama: string;
  mapel?: string;
  kelas?: string;
  hariPiket?: string;
  password?: string;
}

interface User extends Guru {
  email: string;
  role: string;
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


const createEmailFromName = (name: string, id: number | string) => {
    const namePart = name.toLowerCase().replace(/\s+/g, '.').replace(/[^a-z0-9.]/g, '');
    const idPart = String(id).split('-').pop();
    return `${namePart}${idPart}@schoolemail.com`;
};

const initialTeachers: { [key in TeacherRole]: Guru[] } & { schoolInfo?: any } = {
    wali_kelas: [], guru_bk: [], guru_mapel: [], guru_piket: [], guru_pendamping: [],
};


export default function AdminManajemenPenggunaPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [users, setUsers] = useState<{ [key in TeacherRole]: User[] }>({
        wali_kelas: [], guru_bk: [], guru_mapel: [], guru_piket: [], guru_pendamping: [],
  });
  const [activeTab, setActiveTab] = useState<TeacherRole>('wali_kelas');
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User & { originalRole: TeacherRole } | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [formData, setFormData] = useState<Partial<User & {role: TeacherRole}>>({});

  const loadDataFromStorage = () => {
    try {
        const fullData = getSourceData('teachersData', initialTeachers);
        const { schoolInfo, ...teachersData } = fullData;

        const usersData: { [key in TeacherRole]: User[] } = { wali_kelas: [], guru_bk: [], guru_mapel: [], guru_piket: [], guru_pendamping: [] };
        
        for (const roleKey in teachersData) {
            const typedRoleKey = roleKey as TeacherRole;
            if (usersData.hasOwnProperty(typedRoleKey) && Array.isArray(teachersData[typedRoleKey])) {
                usersData[typedRoleKey] = teachersData[typedRoleKey].map((guru: Guru) => ({
                    ...guru,
                    role: getRoleName(typedRoleKey),
                    email: createEmailFromName(guru.nama, guru.id),
                    password: guru.password || "password123", 
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
    if (sessionStorage.getItem("admin_logged_in") !== "true") {
      router.push("/admin");
      return;
    }
    loadDataFromStorage();
    
    const handleDataChange = () => {
        loadDataFromStorage();
    };
    
    window.addEventListener('storage', handleDataChange);
    window.addEventListener('dataUpdated', handleDataChange);
    
    return () => {
        window.removeEventListener('storage', handleDataChange);
        window.removeEventListener('dataUpdated', handleDataChange);
    };
  }, [router, toast]);
  

  const handleShowPassword = (password: string) => {
    toast({
        title: "Password Pengguna",
        description: `Password untuk pengguna ini adalah: ${password}`,
    });
  };

  const handleOpenDialog = (user: (User & {role: TeacherRole}) | null = null) => {
      if (user) {
        setEditingUser({ ...user, originalRole: user.role });
        setFormData(user);
      } else {
        setEditingUser(null);
        setFormData({role: activeTab, password: 'password123'});
      }
      setIsDialogOpen(true);
  };

  const handleSave = () => {
      const { role, ...guruData } = formData;
      if (!guruData.nama || !role || !guruData.password) {
          toast({ title: "Gagal", description: "Nama, peran, dan sandi pengguna harus diisi.", variant: "destructive" });
          return;
      }
      
      const fullData = getSourceData('teachersData', initialTeachers);
      const { schoolInfo, ...teachersData } = fullData;
      let updatedTeachers = { ...teachersData };

      if (editingUser && editingUser.originalRole !== role) {
         updatedTeachers[editingUser.originalRole] = (updatedTeachers[editingUser.originalRole] || []).filter((g: Guru) => g.id !== editingUser.id);
      } else if (editingUser) {
         // Jika peran tidak berubah, hapus dari list lama dulu untuk di-update
         updatedTeachers[editingUser.originalRole] = (updatedTeachers[editingUser.originalRole] || []).filter((g: Guru) => g.id !== editingUser.id);
      }


      let currentList: Guru[] = updatedTeachers[role] || [];
      const cleanGuruData = { id: guruData.id, nama: guruData.nama, password: guruData.password };
          
      if (editingUser) {
         currentList.push({ ...(editingUser as Omit<User, 'role'|'email'>), ...cleanGuruData });
      } else {
          const newId = `${role}-${Date.now()}`;
          currentList.push({ ...cleanGuruData, id: newId } as Guru);
      }
      
      updatedTeachers[role] = currentList;
      updateSourceData('teachersData', { ...updatedTeachers, schoolInfo });
      window.dispatchEvent(new Event('dataUpdated'));
      
      toast({ title: "Sukses", description: "Data pengguna berhasil disimpan." });
      setIsDialogOpen(false);
  };

  const handleDelete = () => {
      if (!userToDelete) return;
      
      const roleKey = roleOptions.find(opt => opt.label === userToDelete.role)?.value;
      if (!roleKey) return;

      const fullData = getSourceData('teachersData', initialTeachers);
      const { schoolInfo, ...teachersData } = fullData;

      if (!teachersData[roleKey]) return;

      const updatedList = teachersData[roleKey].filter((t: Guru) => t.id !== userToDelete.id);
      const updatedTeachers = { ...teachersData, [roleKey]: updatedList };

      updateSourceData('teachersData', { ...updatedTeachers, schoolInfo });
      window.dispatchEvent(new Event('dataUpdated'));

      toast({ title: "Pengguna Dihapus", description: `${userToDelete.nama} telah dihapus.` });
      setUserToDelete(null);
  };
  
  const handleExportData = () => {
    const fullData = getSourceData('teachersData', initialTeachers);
    const { schoolInfo, ...teachersData } = fullData;

    let allUsers: User[] = [];

    for (const roleKey in teachersData) {
        if(Array.isArray(teachersData[roleKey as TeacherRole])) {
            teachersData[roleKey as TeacherRole].forEach((guru: Guru) => {
                allUsers.push({
                    ...guru,
                    role: getRoleName(roleKey),
                    email: createEmailFromName(guru.nama, guru.id),
                    password: guru.password || "password123",
                });
            });
        }
    }

    const headers = ['ID', 'Nama', 'Email', 'Role', 'Password'];
    const csvContent = [
        headers.join(','),
        ...allUsers.map(user => [
            user.id,
            `"${user.nama}"`,
            user.email,
            user.role,
            user.password
        ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.href) URL.revokeObjectURL(link.href);
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
        <Label htmlFor="role" className="text-right">Peran</Label>
        <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value as TeacherRole })}>
            <SelectTrigger className="col-span-3"><SelectValue placeholder="Pilih Peran" /></SelectTrigger>
            <SelectContent>{roleOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="nama" className="text-right">Nama</Label>
        <Input id="nama" value={formData.nama || ''} onChange={(e) => setFormData({ ...formData, nama: e.target.value })} className="col-span-3"/>
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="password" className="text-right">Sandi</Label>
        <Input id="password" value={formData.password || ''} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="col-span-3"/>
      </div>
    </>
  );

  return (
    <div className="flex-1 space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="flex items-center gap-4">
         <Button variant="outline" size="icon" onClick={() => router.push('/admin/pengaturan')}>
            <ArrowLeft />
        </Button>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Manajemen Pengguna</h2>
          <p className="text-muted-foreground">
            Kelola data pengguna sistem. Data ini akan menjadi acuan untuk Manajemen Guru.
          </p>
        </div>
      </div>
        
      <Card>
        <CardHeader>
          <CardTitle>Daftar Pengguna</CardTitle>
          <CardDescription>
             Gunakan tombol di setiap tab untuk menambah, mengubah, atau menghapus pengguna. Password dibuat otomatis dan dapat dilihat.
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

            {Object.keys(users).map((key) => (
              <TabsContent value={key} key={key} className="mt-4">
                 <div className="flex flex-col sm:flex-row justify-end mb-4 gap-2">
                    <Button variant="outline" onClick={handleExportData}>
                        <Download className="mr-2 h-4 w-4" />
                        Export Data User
                    </Button>
                    <Button onClick={() => handleOpenDialog()}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Tambah {getRoleName(key as TeacherRole)}
                    </Button>
                </div>
                <div className="overflow-x-auto">
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
                        {users[key as TeacherRole]?.length > 0 ? (
                        users[key as TeacherRole].map((user) => (
                            <TableRow key={user.id}>
                            <TableCell className="font-medium whitespace-nowrap">{user.nama}</TableCell>
                            <TableCell className="whitespace-nowrap">{user.email}</TableCell>
                            <TableCell className="whitespace-nowrap">{user.role}</TableCell>
                            <TableCell className="text-right whitespace-nowrap">
                                <Button variant="outline" size="sm" onClick={() => handleShowPassword(user.password || "")} className="mr-2 mb-2 sm:mb-0">
                                    <Eye className="mr-2 h-4 w-4" />
                                    Password
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => handleOpenDialog({...user, role: key as TeacherRole})}>
                                    <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => setUserToDelete(user)}>
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
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
                </div>
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
                  <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
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
