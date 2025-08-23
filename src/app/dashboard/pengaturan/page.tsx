
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
import { MoreHorizontal, Edit, Trash2, PlusCircle, Upload, Save } from "lucide-react";
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
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Guru | null>(null);
  const [activeTab, setActiveTab] = useState<TeacherType>('waliKelas');
  
  // Form states
  const [namaGuru, setNamaGuru] = useState("");
  const [detail, setDetail] = useState(""); // Bisa untuk kelas, mapel, atau hari piket


  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target && typeof e.target.result === 'string') {
          setLogo(e.target.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };
  
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

  const resetForm = () => {
    setNamaGuru("");
    setDetail("");
    setEditingTeacher(null);
  };
  
  const handleOpenDialog = (teacherToEdit: Guru | null = null) => {
    if (teacherToEdit) {
      setEditingTeacher(teacherToEdit);
      setNamaGuru(teacherToEdit.nama);
      switch(activeTab) {
        case 'waliKelas': setDetail(teacherToEdit.kelas || ""); break;
        case 'guruMapel': setDetail(teacherToEdit.mapel || ""); break;
        case 'guruPiket': setDetail(teacherToEdit.hariPiket || ""); break;
        default: setDetail("");
      }
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleSaveTeacher = () => {
    if (!namaGuru) return;
    
    const teacherList = teachers[activeTab];
    const newTeacherData: Guru = {
        id: editingTeacher ? editingTeacher.id : (teacherList.length > 0 ? Math.max(...teacherList.map(t => t.id)) + 1 : 1),
        nama: namaGuru,
        ...(activeTab === 'waliKelas' && { kelas: detail }),
        ...(activeTab === 'guruMapel' && { mapel: detail }),
        ...(activeTab === 'guruPiket' && { hariPiket: detail }),
    };

    let updatedList;
    if (editingTeacher) {
      updatedList = teacherList.map(t => t.id === editingTeacher.id ? newTeacherData : t);
    } else {
      updatedList = [...teacherList, newTeacherData];
    }

    setTeachers(prev => ({ ...prev, [activeTab]: updatedList }));
    resetForm();
    setIsDialogOpen(false);
  };

  const handleDeleteTeacher = (id: number) => {
    setTeachers(prev => ({
      ...prev,
      [activeTab]: prev[activeTab].filter(t => t.id !== id)
    }));
  };

  const getDialogDetails = () => {
    switch (activeTab) {
      case 'waliKelas': return { title: 'Wali Kelas', label: 'Kelas Binaan', placeholder: 'Contoh: X TKJ 1' };
      case 'guruMapel': return { title: 'Guru Mapel', label: 'Mata Pelajaran', placeholder: 'Contoh: Matematika' };
      case 'guruPiket': return { title: 'Guru Piket', label: 'Hari Piket', placeholder: 'Contoh: Senin' };
      case 'guruBk': return { title: 'Guru BK', label: null, placeholder: '' };
      case 'guruPendamping': return { title: 'Guru Pendamping', label: null, placeholder: '' };
      default: return { title: 'Guru', label: null, placeholder: '' };
    }
  };
  
  const { title, label, placeholder } = getDialogDetails();

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
                Ubah detail dasar mengenai sekolah Anda.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="school-name">Nama Sekolah</Label>
                <Input id="school-name" value={schoolName} onChange={(e) => setSchoolName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="headmaster-name">Nama Kepala Sekolah</Label>
                <Input id="headmaster-name" value={headmasterName} onChange={(e) => setHeadmasterName(e.target.value)} />
              </div>
              <div className="space-y-2">
                 <Label>Logo Sekolah</Label>
                 <div className="flex items-center gap-4">
                    <Avatar className="h-20 w-20 rounded-lg">
                       <AvatarImage src={logo} alt="Logo Sekolah" data-ai-hint="school building" />
                       <AvatarFallback>LOGO</AvatarFallback>
                    </Avatar>
                     <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                        <Upload className="mr-2 h-4 w-4"/>
                        Ganti Logo
                    </Button>
                    <Input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleLogoChange}/>
                 </div>
              </div>
               <Button onClick={() => handleSaveChanges("Informasi Sekolah Disimpan", "Perubahan informasi sekolah telah berhasil disimpan.")}>
                    <Save className="mr-2 h-4 w-4"/>
                    Simpan Perubahan
               </Button>
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
                Kelola daftar guru berdasarkan perannya masing-masing.
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
                      <div className="flex justify-end mb-4">
                        <Dialog open={isDialogOpen} onOpenChange={(isOpen) => { setIsDialogOpen(isOpen); if (!isOpen) resetForm(); }}>
                              <DialogTrigger asChild>
                                <Button onClick={() => handleOpenDialog()}>
                                  <PlusCircle className="mr-2 h-4 w-4" />
                                  Tambah {getDialogDetails().title}
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                  <DialogTitle>{editingTeacher ? 'Edit' : 'Tambah'} {title}</DialogTitle>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                  <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="nama-guru" className="text-right">Nama</Label>
                                    <Input id="nama-guru" value={namaGuru} onChange={(e) => setNamaGuru(e.target.value)} className="col-span-3" placeholder="Nama lengkap guru" />
                                  </div>
                                  {label && (
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="detail-guru" className="text-right">{label}</Label>
                                        <Input id="detail-guru" value={detail} onChange={(e) => setDetail(e.target.value)} className="col-span-3" placeholder={placeholder} />
                                    </div>
                                  )}
                                </div>
                                <DialogFooter>
                                  <DialogClose asChild><Button variant="outline">Batal</Button></DialogClose>
                                  <Button onClick={handleSaveTeacher}>Simpan</Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                      </div>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nama</TableHead>
                          {key === 'waliKelas' && <TableHead>Kelas Binaan</TableHead>}
                          {key === 'guruMapel' && <TableHead>Mata Pelajaran</TableHead>}
                          {key === 'guruPiket' && <TableHead>Hari Piket</TableHead>}
                          <TableHead className="text-right">Aksi</TableHead>
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
                              <TableCell className="text-right">
                                 <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem onClick={() => handleOpenDialog(guru)}><Edit className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem>
                                      <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteTeacher(guru.id)}><Trash2 className="mr-2 h-4 w-4" /> Hapus</DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={3} className="h-24 text-center">
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

    