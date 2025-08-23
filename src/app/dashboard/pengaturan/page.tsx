
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";

export default function PengaturanPage() {
  const { toast } = useToast();
  // State untuk data sekolah (read-only)
  const [schoolName, setSchoolName] = useState("SMKN 2 Tana Toraja");
  const [headmasterName, setHeadmasterName] = useState("Nama Kepala Sekolah");
  const [logo, setLogo] = useState("https://placehold.co/80x80.png");

  // State untuk Pengaturan Akun (bisa diubah pengguna)
  const [accountName, setAccountName] = useState("Wakasek Kesiswaan");
  const [accountEmail, setAccountEmail] = useState("wakasek@email.com");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  useEffect(() => {
    // Muat informasi sekolah dari localStorage
    const savedInfo = localStorage.getItem("schoolInfo");
    if (savedInfo) {
      const { schoolName, headmasterName, logo } = JSON.parse(savedInfo);
      setSchoolName(schoolName);
      setHeadmasterName(headmasterName);
      setLogo(logo);
    }
  }, []);

  const handleSaveChanges = (title: string, description: string) => {
      toast({
          title: title,
          description: description,
      });
  };

  return (
    <div className="flex-1 space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Pengaturan</h2>
        <p className="text-muted-foreground">
          Kelola pengaturan akun dan tampilan aplikasi.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informasi Sekolah</CardTitle>
              <CardDescription>
                Informasi ini dikelola oleh Administrator.
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
              <CardTitle>Tema Aplikasi</CardTitle>
              <CardDescription>
                Tema default diatur oleh Administrator.
              </CardDescription>
            </CardHeader>
             <CardContent>
                <p className="text-sm text-muted-foreground">Tema aplikasi saat ini mengikuti pengaturan global.</p>
             </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
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
        </div>
      </div>
    </div>
  );
}
