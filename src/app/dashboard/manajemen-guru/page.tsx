
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";

interface Guru {
  id: number;
  nama: string;
  mapel?: string; 
  kelas?: string;
  hariPiket?: string;
}

type TeacherType = 'waliKelas' | 'guruBk' | 'guruMapel' | 'guruPiket' | 'guruPendamping';

export default function ManajemenGuruPage() {
    const [teachers, setTeachers] = useState<{ [key in TeacherType]: Guru[] }>({
        waliKelas: [{ id: 1, nama: "Drs. Budi Santoso", kelas: "X TKJ 1" }],
        guruBk: [{ id: 1, nama: "Siti Aminah, S.Pd." }],
        guruMapel: [{ id: 1, nama: "Eko Prasetyo, S.Kom.", mapel: "Dasar Desain Grafis" }],
        guruPiket: [{ id: 1, nama: "Joko Susilo, S.Pd.", hariPiket: "Senin" }],
        guruPendamping: [{ id: 1, nama: "Rina Kartika, S.Pd." }],
      });
    
      const [activeTab, setActiveTab] = useState<TeacherType>('waliKelas');

    return (
        <div className="flex-1 space-y-6">
             <div>
                <h2 className="text-3xl font-bold tracking-tight">Manajemen Guru</h2>
                <p className="text-muted-foreground">
                    Lihat daftar guru berdasarkan perannya. Data ini terhubung dengan Manajemen Pengguna.
                </p>
            </div>
            <Card>
                <CardHeader>
                <CardTitle>Daftar Guru</CardTitle>
                <CardDescription>
                    Berikut adalah daftar guru yang terdaftar di sistem berdasarkan perannya. 
                    Untuk menambah atau mengubah data, silakan buka halaman Manajemen Pengguna.
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

                    {Object.keys(teachers).map((key) => (
                    <TabsContent value={key} key={key} className="mt-4">
                        <Table>
                        <TableHeader>
                            <TableRow>
                            <TableHead>Nama</TableHead>
                            {key === 'waliKelas' && <TableHead>Kelas Binaan</TableHead>}
                            {key === 'guruMapel' && <TableHead>Mata Pelajaran</TableHead>}
                            {key === 'guruPiket' && <TableHead>Hari Piket</TableHead>}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {teachers[key as TeacherType].length > 0 ? (
                            teachers[key as TeacherType].map((guru) => (
                                <TableRow key={guru.id}>
                                <TableCell className="font-medium">{guru.nama}</TableCell>
                                {key === 'waliKelas' && <TableCell>{guru.kelas}</TableCell>}
                                {key === 'guruMapel' && <TableCell>{guru.mapel}</TableCell>}
                                {key === 'guruPiket' && <TableCell>{guru.hariPiket}</TableCell>}
                                </TableRow>
                            ))
                            ) : (
                            <TableRow>
                                <TableCell colSpan={2} className="h-24 text-center">
                                Belum ada data.
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
