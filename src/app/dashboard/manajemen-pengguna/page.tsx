
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, PlusCircle, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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

type TeacherType = 'waliKelas' | 'guruBk' | 'guruMapel' | 'guruPiket' | 'guruPendamping';

const roleOptions: { value: TeacherType; label: string }[] = [
    { value: 'waliKelas', label: 'Wali Kelas' },
    { value: 'guruBk', label: 'Guru BK' },
    { value: 'guruMapel', label: 'Guru Mapel' },
    { value: 'guruPiket', label: 'Guru Piket' },
    { value: 'guruPendamping', label: 'Guru Pendamping' },
];

const getRoleName = (roleKey: TeacherType | string) => {
    return roleOptions.find(r => r.value === roleKey)?.label || 'Pengguna';
};

const createEmailFromName = (name: string, roleKey: string, id: number) => {
    const namePart = name.toLowerCase().replace(/\s/g, '.').replace(/[^a-z0-9.]/g, '');
    return `${namePart}${id}@email.com`;
};

export default function ManajemenPenggunaPage() {
  const { toast } = useToast();
  const [users, setUsers] = useState<{ [key in TeacherType]: User[] }>({
        waliKelas: [], guruBk: [], guruMapel: [], guruPiket: [], guruPendamping: [],
  });
  const [activeTab, setActiveTab] = useState<TeacherType>('waliKelas');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [formData, setFormData] = useState<Partial<User>>({});

  const loadDataFromStorage = () => {
    const savedTeachers = localStorage.getItem('teachersData');
    if (savedTeachers) {
        const teachersData = JSON.parse(savedTeachers);
        const usersData = { waliKelas: [], guruBk: [], guruMapel: [], guruPiket: [], guruPendamping: [] };
        
        for (const roleKey in teachersData) {
            if (usersData.hasOwnProperty(roleKey)) {
                usersData[roleKey as TeacherType] = teachersData[roleKey].map((guru: Guru) => ({
                    ...guru,
                    role: getRoleName(roleKey),
                    email: createEmailFromName(guru.nama, roleKey, guru.id),
                    password: "password123",
                }));
            }
        }
        setUsers(usersData);
    }
  };
  
  const saveDataToStorage = (updatedUsers: typeof users) => {
      const teachersData = { waliKelas: [], guruBk: [], guruMapel: [], guruPiket: [], guruPendamping: [] };
      for (const roleKey in updatedUsers) {
          if (teachersData.hasOwnProperty(roleKey)) {
               teachersData[roleKey as TeacherType] = updatedUsers[roleKey as TeacherType].map(({ role, email, password, ...guru }) => guru);
          }
      }
      localStorage.setItem('teachersData', JSON.stringify(teachersData));
      loadDataFromStorage();
  };


  useEffect(() => {
    loadDataFromStorage();
  }, []);
  
  const handleShowPassword = (password: string) => {
    toast({
        title: "Password Pengguna",
        description: `Password untuk pengguna ini adalah: ${password}`,
    });
  };

  const handleOpenDialog = (user: User | null = null) => {
    setEditingUser(user);
    setFormData(user ? { ...user, role: roleOptions.find(r => r.label === user.role)?.value } : { role: activeTab });
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.nama || !formData.role) {
        toast({ title: "Gagal", description: "Nama dan Peran harus diisi.", variant: "destructive" });
        return;
    }

    const targetRole = formData.role as TeacherType;
    const allUsersExceptCurrent = { ...users };
    Object.keys(allUsersExceptCurrent).forEach(key => {
        allUsersExceptCurrent[key as TeacherType] = allUsersExceptCurrent[key as TeacherType].filter(u => u.id !== formData.id);
    });

    let updatedList;
    if (editingUser) { // Editing existing user
        updatedList = allUsersExceptCurrent[targetRole].map(u => u.id === editingUser.id ? { ...u, ...formData, email: createEmailFromName(formData.nama!, targetRole, u.id), role: getRoleName(targetRole) } as User : u);
        // If role changed, add to new list, otherwise update in place
        if (targetRole !== roleOptions.find(r => r.label === editingUser.role)?.value) {
             updatedList = [...allUsersExceptCurrent[targetRole], { ...editingUser, ...formData, email: createEmailFromName(formData.nama!, targetRole, editingUser.id), role: getRoleName(targetRole) } as User];
        } else {
            updatedList = users[targetRole].map(u => u.id === editingUser.id ? { ...u, ...formData, email: createEmailFromName(formData.nama!, targetRole, u.id), role: getRoleName(targetRole) } as User : u);
        }
    } else { // Adding new user
        const allUserIds = Object.values(users).flat().map(u => u.id);
        const newId = allUserIds.length > 0 ? Math.max(...allUserIds) + 1 : 1;
        const newUser: User = {
            ...formData,
            id: newId,
            nama: formData.nama,
            role: getRoleName(targetRole),
            email: createEmailFromName(formData.nama, targetRole, newId),
            password: "password123",
        };
        updatedList = [...users[targetRole], newUser];
    }
    
    const updatedUsers = { ...allUsersExceptCurrent, [targetRole]: updatedList };
    saveDataToStorage(updatedUsers);
    toast({ title: "Sukses", description: `Data pengguna berhasil disimpan.` });
    setIsDialogOpen(false);
  };
  
  const handleDelete = () => {
    if (!userToDelete) return;
    const roleKey = roleOptions.find(r => r.label === userToDelete.role)?.value as TeacherType;
    if (!roleKey) return;
    
    const updatedList = users[roleKey].filter(u => u.id !== userToDelete.id);
    const updatedUsers = { ...users, [roleKey]: updatedList };
    saveDataToStorage(updatedUsers);
    
    toast({ title: "Data Dihapus", description: `${userToDelete.nama} telah dihapus.` });
    setUserToDelete(null);
  };


  return (
    <div className="flex-1 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Manajemen Pengguna</h2>
          <p className="text-muted-foreground">
            Kelola akun pengguna untuk setiap peran. Data ini bersumber dari Manajemen Guru.
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Tambah Pengguna
        </Button>
      </div>
        
      <Card>
        <CardHeader>
          <CardTitle>Daftar Pengguna</CardTitle>
          <CardDescription>
            Data pengguna ini dibuat secara otomatis dari halaman Manajemen Guru.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as TeacherType)}>
            <TabsList className="grid w-full grid-cols-5">
              {roleOptions.map(role => (
                 <TabsTrigger key={role.value} value={role.value}>{role.label}</TabsTrigger>
              ))}
            </TabsList>

            {Object.keys(users).map((key) => (
              <TabsContent value={key} key={key} className="mt-4">
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
                    {users[key as TeacherType].length > 0 ? (
                       users[key as TeacherType].map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.nama}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>{user.role}</TableCell>
                          <TableCell className="text-right">
                             <Button variant="ghost" size="icon" onClick={() => handleShowPassword(user.password || "")}>
                                <Eye className="h-4 w-4" />
                             </Button>
                             <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(user)}>
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
                          Belum ada data pengguna.
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
          <DialogContent className="sm:max-w-md">
              <DialogHeader>
                  <DialogTitle>{editingUser ? "Edit Pengguna" : "Tambah Pengguna Baru"}</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                      <Label htmlFor="nama">Nama</Label>
                      <Input id="nama" value={formData.nama || ""} onChange={e => setFormData({ ...formData, nama: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                      <Label htmlFor="role">Peran</Label>
                      <Select value={formData.role} onValueChange={value => setFormData({ ...formData, role: value as TeacherType })}>
                          <SelectTrigger id="role"><SelectValue placeholder="Pilih Peran" /></SelectTrigger>
                          <SelectContent>{roleOptions.map(r => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}</SelectContent>
                      </Select>
                  </div>
                   {formData.role === 'waliKelas' && <div className="space-y-2"><Label htmlFor="kelas">Kelas</Label><Input id="kelas" value={formData.kelas || ""} onChange={e => setFormData({...formData, kelas: e.target.value})} placeholder="Contoh: X OT 1"/></div>}
                   {formData.role === 'guruMapel' && <div className="space-y-2"><Label htmlFor="mapel">Mapel</Label><Input id="mapel" value={formData.mapel || ""} onChange={e => setFormData({...formData, mapel: e.target.value})} placeholder="Contoh: Matematika"/></div>}
                   {formData.role === 'guruPiket' && <div className="space-y-2"><Label htmlFor="hariPiket">Hari Piket</Label><Input id="hariPiket" value={formData.hariPiket || ""} onChange={e => setFormData({...formData, hariPiket: e.target.value})} placeholder="Contoh: Senin"/></div>}
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
                <AlertDialogDescription>Tindakan ini tidak dapat dibatalkan. Ini akan menghapus data pengguna dan guru secara permanen.</AlertDialogDescription>
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
