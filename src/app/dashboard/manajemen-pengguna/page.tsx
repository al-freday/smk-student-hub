
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
  
  useEffect(() => {
    loadDataFromStorage();
    
    // Add event listener to update user data when teacher data changes
    const handleStorageChange = () => {
        loadDataFromStorage();
    };
    
    window.addEventListener('storage', handleStorageChange);
    
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
            Untuk menambah, mengubah, atau menghapus pengguna, silakan lakukan melalui halaman Manajemen Guru.
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
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center">
                          Belum ada data pengguna. Tambahkan guru di halaman Manajemen Guru.
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
