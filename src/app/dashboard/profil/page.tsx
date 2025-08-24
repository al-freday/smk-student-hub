
"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Save, Upload, PlusCircle, Edit, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";


interface UserProfile {
  nip: string;
  nama: string;
  email: string;
  telepon: string;
  alamat: string;
  role: string;
  avatar: string;
  subjects: string[];
}

export default function ProfilPage() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [userProfile, setUserProfile] = useState<UserProfile>({
    nip: "",
    nama: "Pengguna",
    email: "",
    telepon: "",
    alamat: "",
    role: "Pengguna",
    avatar: "",
    subjects: [],
  });

  // State for subject CRUD
  const [isSubjectDialogOpen, setIsSubjectDialogOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<string | null>(null);
  const [subjectToDelete, setSubjectToDelete] = useState<string | null>(null);
  const [subjectName, setSubjectName] = useState("");

  const canHaveSubjects = userProfile.role === 'Guru Mata Pelajaran' || userProfile.role === 'Wakasek Kesiswaan';
  
  useEffect(() => {
    const savedUser = localStorage.getItem("currentUser");
    const userEmail = savedUser ? JSON.parse(savedUser).email : '';
    const savedProfile = localStorage.getItem(`userProfile_${userEmail}`);

    let initialProfile: UserProfile;

    if (savedProfile) {
      initialProfile = JSON.parse(savedProfile);
    } else if (savedUser) {
      const basicInfo = JSON.parse(savedUser);
      initialProfile = {
        nip: "",
        nama: basicInfo.nama || "Pengguna",
        email: basicInfo.email || "",
        telepon: "",
        alamat: "",
        role: basicInfo.role || "Pengguna",
        avatar: basicInfo.avatar || "",
        subjects: [],
      };
    } else {
      initialProfile = {
        nip: "",
        nama: "Pengguna",
        email: "user@schoolemail.com",
        telepon: "",
        alamat: "",
        role: "Pengguna",
        avatar: "",
        subjects: [],
      };
    }
    setUserProfile(initialProfile);
  }, []);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setUserProfile(prev => ({ ...prev, [id]: value }));
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUserProfile(prevState => ({
          ...prevState,
          avatar: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = () => {
      localStorage.setItem(`userProfile_${userProfile.email}`, JSON.stringify(userProfile));
      
      const currentUser = {
          nama: userProfile.nama,
          role: userProfile.role,
          email: userProfile.email,
          avatar: userProfile.avatar,
      };
      localStorage.setItem("currentUser", JSON.stringify(currentUser));
      window.dispatchEvent(new Event('storage')); // Memicu pembaruan header

      toast({
          title: "Profil Disimpan",
          description: "Perubahan biodata Anda telah berhasil disimpan.",
      });
  };

  const handleOpenSubjectDialog = (subject: string | null = null) => {
    setEditingSubject(subject);
    setSubjectName(subject || "");
    setIsSubjectDialogOpen(true);
  };

  const handleSaveSubject = () => {
    if (!subjectName.trim()) return;
    let updatedSubjects;
    if (editingSubject) {
      updatedSubjects = userProfile.subjects.map(s => s === editingSubject ? subjectName.trim() : s);
    } else {
      updatedSubjects = [...userProfile.subjects, subjectName.trim()];
    }
    setUserProfile(prev => ({ ...prev, subjects: updatedSubjects }));
    setIsSubjectDialogOpen(false);
  };

  const handleDeleteSubject = () => {
    if (subjectToDelete) {
      const updatedSubjects = userProfile.subjects.filter(s => s !== subjectToDelete);
      setUserProfile(prev => ({ ...prev, subjects: updatedSubjects }));
      setSubjectToDelete(null);
    }
  };


  return (
    <div className="flex-1 space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Profil Pengguna</h2>
        <p className="text-muted-foreground">
          Kelola biodata dan informasi pribadi Anda.
        </p>
      </div>

        <Card>
            <CardHeader>
              <CardTitle>Biodata Diri</CardTitle>
              <CardDescription>Lengkapi biodata Anda. Informasi ini akan digunakan di seluruh sistem.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-6">
                <Avatar className="h-24 w-24">
                   <AvatarImage src={userProfile.avatar} alt="Foto Profil" data-ai-hint="person avatar" />
                   <AvatarFallback>{userProfile.nama.split(' ').map(n => n[0]).join('').toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="nip">NIP / ID Guru</Label>
                            <Input id="nip" value={userProfile.nip} onChange={handleProfileChange} placeholder="Opsional: Contoh: 1990..." />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="role">Peran</Label>
                            <Input id="role" value={userProfile.role} disabled />
                        </div>
                    </div>
                    <div>
                        <Input type="file" id="avatar-upload" className="hidden" accept="image/png, image/jpeg" ref={fileInputRef} onChange={handleAvatarUpload}/>
                        <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                            <Upload className="mr-2 h-4 w-4" />
                            Unggah Foto
                        </Button>
                    </div>
                </div>
              </div>
               <Separator />
               <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                      <Label htmlFor="nama">Nama Lengkap</Label>
                      <Input id="nama" value={userProfile.nama} onChange={handleProfileChange} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" value={userProfile.email} onChange={handleProfileChange} />
                    </div>
               </div>
               <div className="space-y-2">
                    <Label htmlFor="telepon">Nomor Telepon</Label>
                    <Input id="telepon" type="tel" value={userProfile.telepon} onChange={handleProfileChange} placeholder="Contoh: 0812..." />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="alamat">Alamat</Label>
                    <Textarea id="alamat" value={userProfile.alamat} onChange={handleProfileChange} placeholder="Masukkan alamat lengkap Anda" />
                </div>
              <Button onClick={handleSaveProfile}>
                 <Save className="mr-2 h-4 w-4"/>
                 Simpan Profil
              </Button>
            </CardContent>
        </Card>

        {canHaveSubjects && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                  <CardTitle>Mata Pelajaran yang Diampu</CardTitle>
                  <CardDescription>Kelola daftar mata pelajaran yang Anda ajarkan. (Opsional)</CardDescription>
              </div>
              <Button onClick={() => handleOpenSubjectDialog()}>
                  <PlusCircle className="mr-2 h-4 w-4"/> Tambah Mapel
              </Button>
            </CardHeader>
            <CardContent>
                {userProfile.subjects.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                        {userProfile.subjects.map((subject, index) => (
                            <Badge key={index} variant="secondary" className="text-base py-1 pl-3 pr-1">
                                {subject}
                                <Button variant="ghost" size="icon" className="h-6 w-6 ml-1" onClick={() => handleOpenSubjectDialog(subject)}><Edit className="h-3 w-3"/></Button>
                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setSubjectToDelete(subject)}><Trash2 className="h-3 w-3 text-destructive"/></Button>
                            </Badge>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-muted-foreground">Belum ada mata pelajaran yang ditambahkan.</p>
                )}
            </CardContent>
          </Card>
        )}

        {/* Dialog for Subject CRUD */}
        <Dialog open={isSubjectDialogOpen} onOpenChange={setIsSubjectDialogOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{editingSubject ? 'Edit' : 'Tambah'} Mata Pelajaran</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <Label htmlFor="subjectName">Nama Mata Pelajaran</Label>
                    <Input id="subjectName" value={subjectName} onChange={e => setSubjectName(e.target.value)} placeholder="Contoh: Matematika"/>
                </div>
                <DialogFooter>
                    <DialogClose asChild><Button variant="outline">Batal</Button></DialogClose>
                    <Button onClick={handleSaveSubject}>Simpan</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

        {/* Alert Dialog for Deleting Subject */}
        <AlertDialog open={!!subjectToDelete} onOpenChange={() => setSubjectToDelete(null)}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
                    <AlertDialogDescription>Tindakan ini akan menghapus mata pelajaran dari daftar Anda.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Batal</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteSubject}>Hapus</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </div>
  );
}
