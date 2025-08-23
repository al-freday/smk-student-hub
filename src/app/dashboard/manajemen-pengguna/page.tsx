
"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { MoreHorizontal, Edit, Trash2, PlusCircle, Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";


interface User {
  id: number;
  nama: string;
  email: string;
  role: string;
}

type UserRole = 'waliKelas' | 'guruBk' | 'guruMapel' | 'guruPiket' | 'guruPendamping';

const initialUsers: { [key in UserRole]: User[] } = {
    waliKelas: [
        { id: 1, nama: "Drs. Budi Santoso", email: "budi.s@email.com", role: "Wali Kelas" },
        { id: 2, nama: "Dewi Lestari, S.Pd.", email: "dewi.l@email.com", role: "Wali Kelas" },
    ],
    guruBk: [
        { id: 1, nama: "Siti Aminah, S.Pd.", email: "siti.a@email.com", role: "Guru BK" },
        { id: 2, nama: "Dr. Bambang Wijaya", email: "bambang.w@email.com", role: "Guru BK" },
    ],
    guruMapel: [
        { id: 1, nama: "Eko Prasetyo, S.Kom.", email: "eko.p@email.com", role: "Guru Mapel" },
        { id: 2, nama: "Anita Sari, M.Pd.", email: "anita.s@email.com", role: "Guru Mapel" },
    ],
    guruPiket: [
        { id: 1, nama: "Joko Susilo, S.Pd.", email: "joko.s@email.com", role: "Guru Piket" },
        { id: 2, nama: "Endang Mulyani, S.Ag.", email: "endang.m@email.com", role: "Guru Piket" },
    ],
    guruPendamping: [
        { id: 1, nama: "Rina Kartika, S.Pd.", email: "rina.k@email.com", role: "Guru Pendamping" },
        { id: 2, nama: "Agus Setiawan, S.Psi.", email: "agus.s@email.com", role: "Guru Pendamping" },
    ],
};

export default function ManajemenPenggunaPage() {
  const [users, setUsers] = useState(initialUsers);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<UserRole>('waliKelas');
  
  // Form states
  const [nama, setNama] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const resetForm = () => {
    setNama("");
    setEmail("");
    setPassword("");
    setEditingUser(null);
    setShowPassword(false);
  };
  
  const handleOpenDialog = (userToEdit: User | null = null) => {
    if (userToEdit) {
      setEditingUser(userToEdit);
      setNama(userToEdit.nama);
      setEmail(userToEdit.email);
      setPassword(""); // Password should not be pre-filled
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleSaveUser = () => {
    if (!nama || !email || (!editingUser && !password)) {
        alert("Nama, email, dan password harus diisi untuk pengguna baru.");
        return;
    };
    
    const userList = users[activeTab];
    const roleName = getRoleName(activeTab);

    const newUserData: User = {
        id: editingUser ? editingUser.id : (userList.length > 0 ? Math.max(...userList.map(u => u.id)) + 1 : 1),
        nama,
        email,
        role: roleName,
    };

    let updatedList;
    if (editingUser) {
      updatedList = userList.map(u => u.id === editingUser.id ? newUserData : u);
    } else {
      updatedList = [...userList, newUserData];
    }

    setUsers(prev => ({ ...prev, [activeTab]: updatedList }));
    resetForm();
    setIsDialogOpen(false);
  };

  const handleDeleteUser = (id: number) => {
    setUsers(prev => ({
      ...prev,
      [activeTab]: prev[activeTab].filter(u => u.id !== id)
    }));
  };

  const getRoleName = (tab: UserRole) => {
    switch (tab) {
      case 'waliKelas': return 'Wali Kelas';
      case 'guruMapel': return 'Guru Mapel';
      case 'guruPiket': return 'Guru Piket';
      case 'guruBk': return 'Guru BK';
      case 'guruPendamping': return 'Guru Pendamping';
      default: return 'Pengguna';
    }
  };

  return (
    <div className="flex-1 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Manajemen Pengguna</h2>
          <p className="text-muted-foreground">
            Kelola akun pengguna untuk setiap peran di sekolah.
          </p>
        </div>
      </div>
        
      <Card>
        <CardHeader>
          <CardTitle>Daftar Pengguna</CardTitle>
          <CardDescription>
            Kelola daftar pengguna berdasarkan perannya masing-masing.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as UserRole)}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="waliKelas">Wali Kelas</TabsTrigger>
              <TabsTrigger value="guruBk">Guru BK</TabsTrigger>
              <TabsTrigger value="guruMapel">Guru Mapel</TabsTrigger>
              <TabsTrigger value="guruPiket">Guru Piket</TabsTrigger>
              <TabsTrigger value="guruPendamping">Pendamping</TabsTrigger>
            </TabsList>

            {Object.keys(users).map((key) => (
              <TabsContent value={key} key={key} className="mt-4">
                  <div className="flex justify-end mb-4">
                    <Dialog open={isDialogOpen} onOpenChange={(isOpen) => { setIsDialogOpen(isOpen); if (!isOpen) resetForm(); }}>
                          <DialogTrigger asChild>
                            <Button onClick={() => handleOpenDialog()}>
                              <PlusCircle className="mr-2 h-4 w-4" />
                              Tambah {getRoleName(activeTab)}
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                              <DialogTitle>{editingUser ? 'Edit' : 'Tambah'} {getRoleName(activeTab)}</DialogTitle>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="nama" className="text-right">Nama</Label>
                                <Input id="nama" value={nama} onChange={(e) => setNama(e.target.value)} className="col-span-3" placeholder="Nama lengkap pengguna" />
                              </div>
                               <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="email" className="text-right">Email</Label>
                                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="col-span-3" placeholder="email@example.com" />
                              </div>
                               <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="password" className="text-right">Password</Label>
                                <div className="col-span-3 relative">
                                    <Input 
                                        id="password" 
                                        type={showPassword ? "text" : "password"} 
                                        value={password} 
                                        onChange={(e) => setPassword(e.target.value)} 
                                        className="pr-10"
                                        placeholder={editingUser ? "Isi untuk ganti password" : "••••••••"} 
                                    />
                                    <Button 
                                        type="button"
                                        variant="ghost" 
                                        size="icon" 
                                        className="absolute inset-y-0 right-0 h-full px-3"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        <span className="sr-only">{showPassword ? "Sembunyikan password" : "Tampilkan password"}</span>
                                    </Button>
                                </div>
                              </div>
                            </div>
                            <DialogFooter>
                              <DialogClose asChild><Button variant="outline">Batal</Button></DialogClose>
                              <Button onClick={handleSaveUser}>Simpan</Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
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
                    {users[key as UserRole].length > 0 ? (
                       users[key as UserRole].map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.nama}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>{user.role}</TableCell>
                          <TableCell className="text-right">
                             <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleOpenDialog(user)}><Edit className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem>
                                   <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive">
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            <span>Hapus</span>
                                            </DropdownMenuItem>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                            <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                Tindakan ini tidak bisa dibatalkan. Ini akan menghapus data pengguna secara permanen.
                                            </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                            <AlertDialogCancel>Batal</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleDeleteUser(user.id)}>Hapus</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </DropdownMenuContent>
                              </DropdownMenu>
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
    </div>
  );
}
