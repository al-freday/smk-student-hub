
"use client";

import { useState, useEffect, useRef } from "react";
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
import { Edit, Trash2, PlusCircle, Eye, Download, Upload } from "lucide-react";
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
import { ArrowLeft } from "lucide-react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";


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

const getRoleKey = (roleName: string): TeacherRole | null => {
    const role = roleOptions.find(r => r.label === roleName);
    return role ? role.value : null;
}


const createEmailFromName = (name: string, id: number) => {
    const namePart = name.toLowerCase().replace(/\s+/g, '.').replace(/[^a-z0-9.]/g, '');
    return `${namePart}${id}@schoolemail.com`;
};

const initialTeachers: { [key in TeacherRole]: Guru[] } = {
    wali_kelas: [], guru_bk: [], guru_mapel: [], guru_piket: [], guru_pendamping: [],
};


export default function AdminManajemenPenggunaPage() {
  const router = useRouter();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [users, setUsers] = useState<{ [key in TeacherRole]: User[] }>({
        wali_kelas: [], guru_bk: [], guru_mapel: [], guru_piket: [], guru_pendamping: [],
  });
  const [activeTab, setActiveTab] = useState<TeacherRole>('wali_kelas');
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [formData, setFormData] = useState<Partial<User>>({});

  const loadDataFromStorage = () => {
    try {
        const savedData = localStorage.getItem('teachersData');
        const teachersData = savedData ? JSON.parse(savedData) : { ...initialTeachers };
        const usersData = { wali_kelas: [], guru_bk: [], guru_mapel: [], guru_piket: [], guru_pendamping: [] } as { [key in TeacherRole]: User[] };
        
        const { schoolInfo, ...roles } = teachersData;
        
        for (const roleKey in roles) {
            if (usersData.hasOwnProperty(roleKey)) {
                usersData[roleKey as TeacherRole] = (roles[roleKey] || []).map((guru: Guru) => ({
                    ...guru,
                    role: getRoleName(roleKey),
                    email: createEmailFromName(guru.nama, guru.id),
                    password: guru.password || `password${guru.id}`,
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
  }, [router, toast]);
  

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

      const savedData = localStorage.getItem('teachersData');
      const teachersData = savedData ? JSON.parse(savedData) : { ...initialTeachers };
      const currentList = teachersData[activeTab] || [];
      let updatedList;
      
      const newPassword = formData.password || `password${formData.id || Date.now()}`;

      if (editingUser) {
          updatedList = currentList.map((t: Guru) => t.id === editingUser.id ? { ...t, nama: formData.nama, password: newPassword } : t);
      } else {
          const newId = currentList.length > 0 ? Math.max(...currentList.map((t: Guru) => t.id)) + 1 : 1;
          const newUser = { id: newId, nama: formData.nama, password: `password${newId}` };
          updatedList = [...currentList, newUser];
      }

      const { schoolInfo, ...roles } = teachersData;
      const updatedTeachers = { ...roles, [activeTab]: updatedList };
      const finalDataToSave = { ...teachersData, ...updatedTeachers };
      localStorage.setItem('teachersData', JSON.stringify(finalDataToSave));
      
      loadDataFromStorage(); 
      toast({ title: "Sukses", description: "Data pengguna berhasil disimpan." });
      setIsDialogOpen(false);
  };

  const handleDelete = () => {
      if (!userToDelete) return;
      
      const savedData = localStorage.getItem('teachersData');
      const teachersData = savedData ? JSON.parse(savedData) : initialTeachers;
      const updatedList = (teachersData[activeTab] || []).filter((t: Guru) => t.id !== userToDelete.id);
      
      const { schoolInfo, ...roles } = teachersData;
      const updatedTeachers = { ...roles, [activeTab]: updatedList };
      const finalDataToSave = { ...teachersData, ...updatedTeachers };

      localStorage.setItem('teachersData', JSON.stringify(finalDataToSave));
      
      loadDataFromStorage(); 
      toast({ title: "Pengguna Dihapus", description: `${userToDelete.nama} telah dihapus.` });
      setUserToDelete(null);
  };
  
  const handleExportData = () => {
    const usersToExport = users[activeTab];
    if (!usersToExport || usersToExport.length === 0) {
        toast({ title: "Gagal", description: `Tidak ada data untuk diekspor di peran ${getRoleName(activeTab)}.`, variant: "destructive" });
        return;
    }
    
    const headers = ['id', 'nama', 'email', 'role', 'password'];
    
    const formatCsvCell = (value: any) => {
        const stringValue = String(value || '');
        // Jika nilai mengandung koma, kutip ganda, atau baris baru, bungkus dengan kutip ganda.
        if (/[",\n]/.test(stringValue)) {
            return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
    };

    const csvRows = usersToExport.map(user => [
        formatCsvCell(user.id),
        formatCsvCell(user.nama),
        formatCsvCell(user.email),
        formatCsvCell(user.role),
        formatCsvCell(user.password),
    ].join(','));

    // Baris pertama adalah instruksi untuk Excel, diikuti oleh header.
    const csvContent = [
        'sep=,',
        headers.join(','),
        ...csvRows
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute('download', `data_${activeTab}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({ title: "Ekspor Berhasil", description: `Data untuk ${getRoleName(activeTab)} telah diunduh.` });
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            let text = e.target?.result as string;
            // Abaikan baris 'sep=,' jika ada
            if (text.startsWith('sep=')) {
                text = text.substring(text.indexOf('\n') + 1);
            }

            const rows = text.split('\n').slice(1); // Lewati header
            if (rows.length === 0) {
                toast({ title: "Gagal Impor", description: "File CSV kosong atau tidak valid.", variant: "destructive" });
                return;
            }

            const savedData = localStorage.getItem('teachersData');
            const teachersData = savedData ? JSON.parse(savedData) : { ...initialTeachers };
            const { schoolInfo, ...roles } = teachersData;

            let importedCount = 0;
            let updatedCount = 0;

            rows.forEach(row => {
                if (!row.trim()) return;
                // Regex ini lebih baik untuk menangani kolom yang dikutip
                const columns = row.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g) || [];
                if (columns.length < 5) return;
                
                const [id, nama, email, roleName, password] = columns.map(field => field.trim().replace(/^"|"$/g, '').replace(/""/g, '"'));
                
                const roleKey = getRoleKey(roleName);
                if (!roleKey || !id || !nama || !password) return;

                const roleList: Guru[] = roles[roleKey] || [];
                const existingUserIndex = roleList.findIndex(u => u.id === parseInt(id));
                const userData = { id: parseInt(id), nama, password };

                if (existingUserIndex > -1) {
                    roleList[existingUserIndex] = { ...roleList[existingUserIndex], ...userData };
                    updatedCount++;
                } else {
                    roleList.push(userData);
                    importedCount++;
                }
                roles[roleKey] = roleList;
            });

            const finalDataToSave = { ...teachersData, ...roles };
            localStorage.setItem('teachersData', JSON.stringify(finalDataToSave));
            loadDataFromStorage();
            toast({ 
                title: "Impor Selesai", 
                description: `${importedCount} pengguna baru ditambahkan dan ${updatedCount} pengguna diperbarui.` 
            });

        } catch (error) {
            console.error("Error importing data:", error);
            toast({ title: "Error", description: "Gagal memproses file. Pastikan format CSV sudah benar.", variant: "destructive" });
        } finally {
            if(fileInputRef.current) fileInputRef.current.value = "";
        }
    };
    reader.readAsText(file);
  };


  return (
    <div className="flex-1 space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="flex items-center gap-4">
         <Button variant="outline" size="icon" onClick={() => router.push('/admin/pengaturan')}>
            <ArrowLeft />
        </Button>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Manajemen Pengguna</h2>
          <p className="text-muted-foreground">
            Tambah, edit, atau hapus data pengguna untuk setiap peran.
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

            <div className="flex flex-col sm:flex-row justify-between my-4 gap-2">
                <p className="text-sm text-muted-foreground self-center">
                    Mengelola pengguna untuk peran: <span className="font-semibold text-primary">{getRoleName(activeTab)}</span>
                </p>
                <div className="flex gap-2">
                    <input type="file" ref={fileInputRef} className="hidden" onChange={handleImportData} accept=".csv" />
                    <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                        <Upload className="mr-2 h-4 w-4" />
                        Impor Data
                    </Button>
                    <Button variant="outline" onClick={handleExportData}>
                        <Download className="mr-2 h-4 w-4" />
                        Ekspor Data
                    </Button>
                    <Button onClick={() => handleOpenDialog()}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Tambah Pengguna
                    </Button>
                </div>
            </div>
            
            {Object.keys(users).map((key) => (
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
                        {users[key as TeacherRole].length > 0 ? (
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
                      Lengkapi form di bawah untuk {editingUser ? 'mengubah' : 'menambahkan'} data pengguna ke peran <span className="font-semibold">{getRoleName(activeTab)}</span>.
                  </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                 <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="nama" className="text-right">Nama</Label>
                    <Input id="nama" value={formData.nama || ''} onChange={(e) => setFormData({ ...formData, nama: e.target.value })} className="col-span-3"/>
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

    

    

    

    