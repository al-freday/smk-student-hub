
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye, Download, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
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

type TeacherRole = 'wakasek_kesiswaan';

const roleOptions: { value: TeacherRole; label: string }[] = [
    { value: 'wakasek_kesiswaan', label: 'Wakasek Kesiswaan' },
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

const initialTeachers: { [key in TeacherRole]?: Guru[] } & { schoolInfo?: any } = {
    wakasek_kesiswaan: [],
};


export default function AdminManajemenPenggunaPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  
  const loadDataFromStorage = () => {
    try {
        const savedData = localStorage.getItem('teachersData');
        const fullData = savedData ? JSON.parse(savedData) : initialTeachers;
        
        // Hardcoded wakasek user
        const wakasekUser: User = {
            id: 'wakasek_kesiswaan-0',
            nama: 'Wakasek Kesiswaan',
            email: 'wakasek@schoolemail.com',
            role: 'Wakasek Kesiswaan',
            password: 'password123',
        };

        setUsers([wakasekUser]);

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
  
  const handleExportData = () => {
    const headers = ['ID', 'Nama', 'Email', 'Role', 'Password'];
    const csvContent = [
        headers.join(','),
        ...users.map(user => [
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


  return (
    <div className="flex-1 space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="flex items-center gap-4">
         <Button variant="outline" size="icon" onClick={() => router.push('/admin/pengaturan')}>
            <ArrowLeft />
        </Button>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Manajemen Pengguna</h2>
          <p className="text-muted-foreground">
            Kelola data pengguna sistem. Saat ini hanya menampilkan pengguna Wakasek Kesiswaan.
          </p>
        </div>
      </div>
        
      <Card>
        <CardHeader>
          <CardTitle>Daftar Pengguna</CardTitle>
          <CardDescription>
             Berikut adalah pengguna default untuk sistem.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <div className="flex flex-col sm:flex-row justify-end mb-4 gap-2">
                <Button variant="outline" onClick={handleExportData}>
                    <Download className="mr-2 h-4 w-4" />
                    Export Data User
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
                    {users.length > 0 ? (
                    users.map((user) => (
                        <TableRow key={user.id}>
                        <TableCell className="font-medium whitespace-nowrap">{user.nama}</TableCell>
                        <TableCell className="whitespace-nowrap">{user.email}</TableCell>
                        <TableCell className="whitespace-nowrap">{user.role}</TableCell>
                        <TableCell className="text-right whitespace-nowrap">
                            <Button variant="outline" size="sm" onClick={() => handleShowPassword(user.password || "")} className="mr-2 mb-2 sm:mb-0">
                                <Eye className="mr-2 h-4 w-4" />
                                Password
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
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
