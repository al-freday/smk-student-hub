
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
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
import { Edit, Trash2, PlusCircle, Download, Upload, ArrowLeft, Building, Loader2 } from "lucide-react";
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
import { useRouter } from "next/navigation";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { fetchDataFromFirebase, saveDataToFirebase } from "@/lib/data-manager";

// --- Tipe Data ---
interface Guru {
  id: number;
  nama: string;
  mapel?: string;
  kelas?: string[];
  hariPiket?: string[];
  password?: string;
}

interface User extends Guru {
  email: string;
  role: string;
}

type TeacherRole = 'wali_kelas' | 'guru_bk' | 'guru_mapel' | 'guru_piket' | 'guru_pendamping';
type SpecialRole = 'wakasek_kesiswaan' | 'tata_usaha';
type AllRoles = TeacherRole | SpecialRole;

const teacherRoleOptions: { value: TeacherRole; label: string }[] = [
    { value: 'wali_kelas', label: 'Wali Kelas' },
    { value: 'guru_bk', label: 'Guru BK' },
    { value: 'guru_mapel', label: 'Guru Mapel' },
    { value: 'guru_piket', label: 'Guru Piket' },
    { value: 'guru_pendamping', label: 'Guru Pendamping' },
];

const specialRoleOptions: { value: SpecialRole; label: string }[] = [
    { value: 'wakasek_kesiswaan', label: 'Wakasek Kesiswaan' },
    { value: 'tata_usaha', label: 'Tata Usaha' },
];

const allRoleOptions = [...teacherRoleOptions, ...specialRoleOptions];

const getRoleName = (roleKey: AllRoles | string) => {
    const role = allRoleOptions.find(r => r.value === roleKey);
    return role ? role.label : 'Pengguna';
};

const getRoleKey = (roleName: string): AllRoles | null => {
    const role = allRoleOptions.find(r => r.label === roleName);
    return role ? role.value : null;
}

const createEmailFromName = (name: string, id: number | string) => {
    const namePart = name.toLowerCase().replace(/\s+/g, '.').replace(/[^a-z0-9.]/g, '');
    return `${namePart}${id}@schoolemail.com`;
};

const initialData: { [key in AllRoles]: Guru[] } = {
    wali_kelas: [], guru_bk: [], guru_mapel: [], guru_piket: [], guru_pendamping: [],
    wakasek_kesiswaan: [], tata_usaha: [],
};

export default function AdminManajemenPenggunaPage() {
  const router = useRouter();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [users, setUsers] = useState<{ [key in AllRoles]: User[] }>(initialData);
  const [isLoading, setIsLoading] = useState(true);

  const [activeTeacherTab, setActiveTeacherTab] = useState<TeacherRole>('wali_kelas');
  const [activeSpecialTab, setActiveSpecialTab] = useState<SpecialRole>('wakasek_kesiswaan');
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isDeleteAllDialogOpen, setIsDeleteAllDialogOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<User>>({});
  const [activeDialogRole, setActiveDialogRole] = useState<AllRoles>('wali_kelas');

  const loadDataFromFirebase = useCallback(async () => {
    setIsLoading(true);
    try {
        const teachersData = await fetchDataFromFirebase('teachersData') || { ...initialData };
        const usersData = { ...initialData } as { [key in AllRoles]: User[] };
        
        const { schoolInfo, ...roles } = teachersData;
        
        for (const roleKey in roles) {
            if (usersData.hasOwnProperty(roleKey)) {
                usersData[roleKey as AllRoles] = (roles[roleKey] || []).map((guru: Guru) => ({
                    ...guru,
                    role: getRoleName(roleKey),
                    email: createEmailFromName(guru.nama, guru.id),
                    password: guru.password || `password${guru.id}`,
                }));
            }
        }
        setUsers(usersData);
    } catch (error) {
        console.error("Failed to load teachers data from Firebase", error);
        toast({
            title: "Gagal Memuat Data",
            description: "Data pengguna tidak dapat dimuat dari server.",
            variant: "destructive"
        })
    } finally {
        setIsLoading(false);
    }
  }, [toast]);
  
  useEffect(() => {
    if (sessionStorage.getItem("admin_logged_in") !== "true") {
      router.push("/admin");
      return;
    }
    loadDataFromFirebase();
  }, [router, loadDataFromFirebase]);
  
  const handleOpenDialog = (role: AllRoles, user: User | null = null) => {
      setActiveDialogRole(role);
      setEditingUser(user);
      setFormData(user || {});
      setIsDialogOpen(true);
  };

  const handleSave = async () => {
      if (!formData.nama) {
          toast({ title: "Gagal", description: "Nama pengguna harus diisi.", variant: "destructive" });
          return;
      }

      const teachersData = await fetchDataFromFirebase('teachersData') || { ...initialData };
      const currentList: Guru[] = teachersData[activeDialogRole] || [];
      
      if (editingUser) {
          // Editing user
          const updatedList = currentList.map((t: Guru) => {
              if (t.id === editingUser.id) {
                  return { ...t, nama: formData.nama, password: formData.password || t.password };
              }
              return t;
          });
          await saveDataToFirebase(`teachersData/${activeDialogRole}`, updatedList);
      } else {
          // Adding new user
          const newId = currentList.length > 0 ? Math.max(...currentList.map((t: Guru) => t.id)) + 1 : 1;
          const newPassword = formData.password || `password${newId}`;
          const newUser: Guru = { id: newId, nama: formData.nama!, password: newPassword };
          const updatedList = [...currentList, newUser];
          await saveDataToFirebase(`teachersData/${activeDialogRole}`, updatedList);
      }

      await loadDataFromFirebase(); 
      toast({ title: "Sukses", description: "Data pengguna berhasil disimpan ke server." });
      setIsDialogOpen(false);
  };
  
  const handleDelete = async (role: AllRoles) => {
      if (!userToDelete) return;
      
      const teachersData = await fetchDataFromFirebase('teachersData') || initialData;
      const updatedList = (teachersData[role] || []).filter((t: Guru) => t.id !== userToDelete.id);
      
      await saveDataToFirebase(`teachersData/${role}`, updatedList);
      
      await loadDataFromFirebase(); 
      toast({ title: "Pengguna Dihapus", description: `${userToDelete.nama} telah dihapus.` });
      setUserToDelete(null);
  };
  
  const handleDeleteAll = async (role: AllRoles) => {
    await saveDataToFirebase(`teachersData/${role}`, []);
    
    await loadDataFromFirebase();
    toast({
      title: `Semua Pengguna Dihapus`,
      description: `Semua pengguna dari peran ${getRoleName(role)} telah dihapus.`,
      variant: "destructive"
    });
    setIsDeleteAllDialogOpen(false);
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // --- Render logic remains mostly the same, only data source and save handlers are changed ---
  return (
    <div className="flex-1 space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="flex items-center gap-4">
         <Button variant="outline" size="icon" onClick={() => router.push('/admin/pengaturan')}>
            <ArrowLeft />
        </Button>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Manajemen Pengguna</h2>
          <p className="text-muted-foreground">
            Tambah, edit, atau hapus data pengguna untuk setiap peran. Perubahan disimpan langsung ke server.
          </p>
        </div>
      </div>
        
      <Card>
        <CardHeader>
          <CardTitle>Daftar Pengguna Guru</CardTitle>
          <CardDescription>
            Gunakan tombol di setiap tab untuk menambah, mengubah, atau menghapus pengguna guru.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTeacherTab} onValueChange={(value) => setActiveTeacherTab(value as TeacherRole)}>
            <ScrollArea className="w-full whitespace-nowrap">
                <TabsList>
                {teacherRoleOptions.map(role => (
                    <TabsTrigger key={role.value} value={role.value}>{role.label}</TabsTrigger>
                ))}
                </TabsList>
                <ScrollBar orientation="horizontal" />
            </ScrollArea>

            <div className="flex flex-col sm:flex-row justify-between my-4 gap-2">
                <p className="text-sm text-muted-foreground self-center">
                    Mengelola pengguna untuk peran: <span className="font-semibold text-primary">{getRoleName(activeTeacherTab)}</span>
                </p>
                <div className="flex gap-2 flex-wrap justify-end">
                    <Button onClick={() => handleOpenDialog(activeTeacherTab)}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Tambah Pengguna
                    </Button>
                    <Button variant="destructive" onClick={() => setIsDeleteAllDialogOpen(true)}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Hapus Semua
                    </Button>
                </div>
            </div>
            
            {teacherRoleOptions.map(({ value: key }) => (
              <TabsContent value={key} key={key} className="mt-4">
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
                        {users[key].length > 0 ? (
                        users[key].map((user) => (
                            <TableRow key={user.id}>
                            <TableCell className="font-medium whitespace-nowrap">{user.nama}</TableCell>
                            <TableCell className="whitespace-nowrap">{user.email}</TableCell>
                            <TableCell className="whitespace-nowrap">{user.role}</TableCell>
                            <TableCell className="text-right whitespace-nowrap">
                                <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(key, user)}>
                                    <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => { setActiveDialogRole(key); setUserToDelete(user);}}>
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

       <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2"><Building /> Daftar Pengguna Khusus</CardTitle>
            <CardDescription>
                Kelola pengguna dengan peran administratif seperti Wakasek atau Tata Usaha.
            </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeSpecialTab} onValueChange={(value) => setActiveSpecialTab(value as SpecialRole)}>
            <TabsList>
            {specialRoleOptions.map(role => (
                <TabsTrigger key={role.value} value={role.value}>{role.label}</TabsTrigger>
            ))}
            </TabsList>

            <div className="flex flex-col sm:flex-row justify-between my-4 gap-2">
                <p className="text-sm text-muted-foreground self-center">
                    Mengelola pengguna untuk peran: <span className="font-semibold text-primary">{getRoleName(activeSpecialTab)}</span>
                </p>
                 <div className="flex gap-2 flex-wrap justify-end">
                    <Button onClick={() => handleOpenDialog(activeSpecialTab)}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Tambah Pengguna
                    </Button>
                </div>
            </div>
            
            {specialRoleOptions.map(({ value: key }) => (
              <TabsContent value={key} key={key} className="mt-4">
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
                        {users[key].length > 0 ? (
                        users[key].map((user) => (
                            <TableRow key={user.id}>
                            <TableCell className="font-medium whitespace-nowrap">{user.nama}</TableCell>
                            <TableCell className="whitespace-nowrap">{user.email}</TableCell>
                            <TableCell className="whitespace-nowrap">{user.role}</TableCell>
                            <TableCell className="text-right whitespace-nowrap">
                                <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(key, user)}>
                                    <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => { setActiveDialogRole(key); setUserToDelete(user);}}>
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
                      Lengkapi form untuk {editingUser ? 'mengubah' : 'menambahkan'} data ke peran <span className="font-semibold">{getRoleName(activeDialogRole)}</span>.
                  </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                 <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="nama" className="text-right">Nama</Label>
                    <Input id="nama" value={formData.nama || ''} onChange={(e) => setFormData({ ...formData, nama: e.target.value })} className="col-span-3"/>
                 </div>
                 <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="password" className="text-right">Password</Label>
                    <Input 
                        id="password" 
                        type="text"
                        value={formData.password || ''} 
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })} 
                        className="col-span-3"
                        placeholder={editingUser ? "Kosongkan jika tidak diubah" : "Otomatis jika kosong"}
                    />
                </div>
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
                     Tindakan ini tidak dapat dibatalkan. Ini akan menghapus data pengguna secara permanen dari server.
                  </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                  <AlertDialogCancel>Batal</AlertDialogCancel>
                  <AlertDialogAction onClick={() => handleDelete(activeDialogRole)}>Hapus</AlertDialogAction>
              </AlertDialogFooter>
          </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isDeleteAllDialogOpen} onOpenChange={setIsDeleteAllDialogOpen}>
          <AlertDialogContent>
              <AlertDialogHeader>
                  <AlertDialogTitle>Hapus Semua Pengguna?</AlertDialogTitle>
                  <AlertDialogDescription>
                     Anda akan menghapus semua pengguna dari peran <span className="font-semibold">{getRoleName(activeTeacherTab)}</span>. Tindakan ini tidak dapat dibatalkan.
                  </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                  <AlertDialogCancel>Batal</AlertDialogCancel>
                  <AlertDialogAction onClick={() => handleDeleteAll(activeTeacherTab)} className="bg-destructive hover:bg-destructive/90">Ya, Hapus Semua</AlertDialogAction>
              </AlertDialogFooter>
          </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
