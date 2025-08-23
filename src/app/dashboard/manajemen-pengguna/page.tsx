
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
import { Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

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
    const role = roleOptions.find(r => r.value === roleKey);
    return role ? role.label : 'Pengguna';
};


const createEmailFromName = (name: string, roleKey: string, id: number) => {
    const namePart = name.toLowerCase().replace(/\s+/g, '.').replace(/[^a-z0-9.]/g, '');
    const roleInitial = roleKey.replace('guru', '').charAt(0);
    return `${namePart}${id}@schoolemail.com`;
};

export default function ManajemenPenggunaPage() {
  const { toast } = useToast();
  const [users, setUsers] = useState<{ [key in TeacherType]: User[] }>({
        waliKelas: [], guruBk: [], guruMapel: [], guruPiket: [], guruPendamping: [],
  });
  const [activeTab, setActiveTab] = useState<TeacherType>('waliKelas');

  // This function loads data from localStorage, simulating a data fetch from a central source.
  const loadDataFromStorage = () => {
    try {
        const savedTeachers = localStorage.getItem('teachersData');
        if (savedTeachers) {
            const teachersData = JSON.parse(savedTeachers);
            const usersData = { waliKelas: [], guruBk: [], guruMapel: [], guruPiket: [], guruPendamping: [] };
            
            // Iterate over all teacher roles and create user accounts
            for (const roleKey in teachersData) {
                if (usersData.hasOwnProperty(roleKey)) {
                    usersData[roleKey as TeacherType] = teachersData[roleKey].map((guru: Guru) => ({
                        ...guru,
                        role: getRoleName(roleKey),
                        email: createEmailFromName(guru.nama, roleKey, guru.id),
                        password: "password123", // Default password for all users
                    }));
                }
            }
            setUsers(usersData);
        } else {
             // If no data in storage, initialize with empty arrays
            setUsers({ waliKelas: [], guruBk: [], guruMapel: [], guruPiket: [], guruPendamping: [] });
        }
    } catch (error) {
        console.error("Failed to parse teachers data from localStorage", error);
        toast({
            title: "Gagal Memuat Data",
            description: "Data guru tidak dapat dimuat. Coba muat ulang halaman.",
            variant: "destructive"
        })
    }
  };
  
  useEffect(() => {
    // Initial data load
    loadDataFromStorage();
    
    // This function handles updates if another tab changes the teacher data
    const handleStorageChange = (event: StorageEvent) => {
        if (event.key === 'teachersData') {
            loadDataFromStorage();
        }
    };
    
    // Listen for storage changes to keep data in sync
    window.addEventListener('storage', handleStorageChange);
    
    // Cleanup listener on component unmount
    return () => {
        window.removeEventListener('storage', handleStorageChange);
    };
  }, []);
  
  const handleShowPassword = (password: string) => {
    toast({
        title: "Password Pengguna",
        description: `Password untuk pengguna ini adalah: ${password}`,
    });
  };

  return (
    <div className="flex-1 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Manajemen Pengguna</h2>
          <p className="text-muted-foreground">
            Data pengguna ini dibuat secara otomatis dari halaman Manajemen Guru.
          </p>
        </div>
      </div>
        
      <Card>
        <CardHeader>
          <CardTitle>Daftar Pengguna</CardTitle>
          <CardDescription>
            Untuk menambah, mengubah, atau menghapus pengguna, silakan lakukan melalui halaman <Link href="/dashboard/manajemen-guru" className="underline text-primary">Manajemen Guru</Link>.
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
                             <Button variant="outline" size="sm" onClick={() => handleShowPassword(user.password || "")}>
                                <Eye className="mr-2 h-4 w-4" />
                                Lihat Password
                             </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center">
                          Belum ada data pengguna untuk peran ini. Tambahkan guru di halaman Manajemen Guru.
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
