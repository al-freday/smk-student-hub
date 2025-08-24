
"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Save, Upload } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";

interface UserProfile {
  nip: string;
  nama: string;
  email: string;
  telepon: string;
  alamat: string;
  role: string;
  avatar: string;
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
  });
  
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
    </div>
  );
}

    