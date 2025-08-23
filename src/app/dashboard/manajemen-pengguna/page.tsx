
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
import { Eye } from "lucide-react";

interface Guru {
  id: number;
  nama: string;
}

interface User extends Guru {
  email: string;
  role: string;
}

type TeacherType = 'waliKelas' | 'guruBk' | 'guruMapel' | 'guruPiket' | 'guruPendamping';


const getRoleName = (tab: TeacherType | string) => {
    switch (tab) {
        case 'waliKelas': return 'Wali Kelas';
        case 'guruMapel': return 'Guru Mapel';
        case 'guruPiket': return 'Guru Piket';
        case 'guruBk': return 'Guru BK';
        case 'guruPendamping': return 'Guru Pendamping';
        default: return 'Pengguna';
    }
};

const createEmailFromName = (name: string, roleKey: string, id: number) => {
    const namePart = name.toLowerCase().replace(/\s/g, '.').replace(/[^a-z0-9.]/g, '');
    return `${namePart}${id}@email.com`;
}

export default function ManajemenPenggunaPage() {
  const [users, setUsers] = useState<{ [key in TeacherType]: User[] }>({
        waliKelas: [],
        guruBk: [],
        guruMapel: [],
        guruPiket: [],
        guruPendamping: [],
  });

  const [activeTab, setActiveTab] = useState<TeacherType>('waliKelas');

  useEffect(() => {
    // Load teacher data from localStorage and transform it into user data
    const savedTeachers = localStorage.getItem('teachersData');
    if (savedTeachers) {
        const teachersData = JSON.parse(savedTeachers);
        const usersData = {
            waliKelas: [],
            guruBk: [],
            guruMapel: [],
            guruPiket: [],
            guruPendamping: [],
        };
        
        for (const roleKey in teachersData) {
            usersData[roleKey as TeacherType] = teachersData[roleKey].map((guru: Guru) => ({
                ...guru,
                role: getRoleName(roleKey),
                email: createEmailFromName(guru.nama, roleKey, guru.id),
            }));
        }
        setUsers(usersData);
    }
  }, []);

  return (
    <div className="flex-1 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Manajemen Pengguna</h2>
          <p className="text-muted-foreground">
            Lihat akun pengguna untuk setiap peran. Data ini bersumber dari Manajemen Guru.
          </p>
        </div>
      </div>
        
      <Card>
        <CardHeader>
          <CardTitle>Daftar Pengguna</CardTitle>
          <CardDescription>
            Data pengguna ini dibuat secara otomatis dari halaman Manajemen Guru. Untuk mengubah data, silakan kembali ke halaman tersebut.
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

            {Object.keys(users).map((key) => (
              <TabsContent value={key} key={key} className="mt-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nama</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Peran</TableHead>
                      <TableHead className="text-right">Password</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users[key as TeacherType].length > 0 ? (
                       users[key as TeacherType].map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.nama}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>{user.role}</TableCell>
                          <TableCell className="text-right text-muted-foreground flex items-center justify-end gap-2">
                            <Eye className="h-4 w-4"/>
                            <span>••••••••</span>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center">
                          Belum ada data pengguna. Silakan tambahkan di Manajemen Guru.
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

    