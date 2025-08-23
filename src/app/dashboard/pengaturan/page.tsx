
"use client";

import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
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
import { Upload, Save } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";

interface Guru {
  id: number;
  nama: string;
  // Menambahkan properti opsional untuk berbagai jenis guru
  mapel?: string; // Untuk Guru Mapel
  kelas?: string; // Untuk Wali Kelas
  hariPiket?: string; // Untuk Guru Piket
}

type TeacherType = 'waliKelas' | 'guruBk' | 'guruMapel' | 'guruPiket' | 'guruPendamping';

export default function PengaturanPage() {
  const { toast } = useToast();
  const [schoolName, setSchoolName] = useState("SMKN 2 Tana Toraja");
  const [headmasterName, setHeadmasterName] = useState("Nama Kepala Sekolah");
  const [logo, setLogo] = useState("https://placehold.co/80x80.png");

  // State for Account Settings
  const [accountName, setAccountName] = useState("Wakasek Kesiswaan");
  const [accountEmail, setAccountEmail] = useState("wakasek@email.com");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");


  const [teachers, setTeachers] = useState<{ [key in TeacherType]: Guru[] }>({
    waliKelas: [{ id: 1, nama: "Drs. Budi Santoso", kelas: "X TKJ 1" }],
    guruBk: [{ id: 1, nama: "Siti Aminah, S.Pd." }],
    guruMapel: [{ id: 1, nama: "Eko Prasetyo, S.Kom.", mapel: "Dasar Desain Grafis" }],
    guruPiket: [{ id: 1, nama: "Joko Susilo, S.Pd.", hariPiket: "Senin" }],
    guruPendamping: [{ id: 1, nama: "Rina Kartika, S.Pd." }],
  });

  const [activeTab, setActiveTab] = useState<TeacherType>('waliKelas');
  
  const handleThemeChange = (newTheme: { [key: string]: string }) => {
    Object.entries(newTheme).forEach(([property, value]) => {
      document.documentElement.style.setProperty(property, value);
    });
    toast({
        title: "Tema Berhasil Diubah",
        description: "Tampilan aplikasi telah diperbarui.",
    });
  };
  
  const handleSaveChanges = (title: string, description: string) => {
      toast({
          title: title,
          description: description,
      });
  };

  const themes = {
    default: { "--primary": "231 48% 48%", "--accent": "266 44% 58%" },
    green: { "--primary": "142 76% 36%", "--accent": "142 63% 52%" },
    blue: { "--primary": "217 91% 60%", "--accent": "217 80% 75%" },
    orange: { "--primary": "25 95% 53%", "--accent": "25 90% 65%" },
  };

  return (
    <div className="flex-1 space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Pengaturan</h2>
        <p className="text-muted-foreground">
          Kelola pengaturan umum, guru, dan tampilan aplikasi.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Kolom Kiri: Informasi Sekolah & Tema */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informasi Sekolah</CardTitle>
              <CardDescription>
                Informasi ini dikelola oleh Wakasek Kesiswaan.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="school-name">Nama Sekolah</Label>
                <Input id="school-name" value={schoolName} disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="headmaster-name">Nama Kepala Sekolah</Label>
                <Input id="headmaster-name" value={headmasterName} disabled />
              </div>
              <div className="space-y-2">
                 <Label>Logo Sekolah</Label>
                 <div className="flex items-center gap-4">
                    <Avatar className="h-20 w-20 rounded-lg">
                       <AvatarImage src={logo} alt="Logo Sekolah" data-ai-hint="school building" />
                       <AvatarFallback>LOGO</AvatarFallback>
                    </Avatar>
                 </div>
              </div>
            </CardContent>
          </Card>
          
           <Card>
            <CardHeader>
              <CardTitle>Pengaturan Akun</CardTitle>
              <CardDescription>Ubah informasi login Anda.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="account-name">Nama Pengguna</Label>
                <Input id="account-name" value={accountName} onChange={(e) => setAccountName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="account-email">Email</Label>
                <Input id="account-email" type="email" value={accountEmail} onChange={(e) => setAccountEmail(e.target.value)} />
              </div>
               <div className="space-y-2">
                <Label htmlFor="current-password">Password Saat Ini</Label>
                <Input id="current-password" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="••••••••" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">Password Baru</Label>
                <Input id="new-password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="••••••••" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Konfirmasi Password Baru</Label>
                <Input id="confirm-password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" />
              </div>
              <Button onClick={() => handleSaveChanges("Pengaturan Akun Disimpan", "Perubahan informasi akun Anda telah berhasil disimpan.")}>
                 <Save className="mr-2 h-4 w-4"/>
                 Simpan Perubahan Akun
              </Button>
            </CardContent>
          </Card>


          <Card>
             <CardHeader>
              <CardTitle>Tema Aplikasi</CardTitle>
              <CardDescription>
                Pilih skema warna yang Anda sukai.
              </CardDescription>
            </CardHeader>
             <CardContent className="grid grid-cols-2 gap-4">
                <Button variant="outline" onClick={() => handleThemeChange(themes.default)}>Default</Button>
                <Button variant="outline" className="bg-green-600 text-white hover:bg-green-700" onClick={() => handleThemeChange(themes.green)}>Hijau</Button>
                <Button variant="outline" className="bg-blue-600 text-white hover:bg-blue-700" onClick={() => handleThemeChange(themes.blue)}>Biru</Button>
                <Button variant="outline" className="bg-orange-600 text-white hover:bg-orange-700" onClick={() => handleThemeChange(themes.orange)}>Oranye</Button>
             </CardContent>
          </Card>
        </div>

        {/* Kolom Kanan: Manajemen Guru */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Manajemen Guru</CardTitle>
              <CardDescription>
                Daftar guru berdasarkan perannya. Data ini dikelola oleh Wakasek.
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
      </div>
    </div>
  );
}
