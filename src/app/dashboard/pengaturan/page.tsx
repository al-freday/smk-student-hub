
"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";

export default function PengaturanPage() {
  const { toast } = useToast();
  const [schoolName] = useState("SMKN 2 Tana Toraja");
  const [headmasterName] = useState("Nama Kepala Sekolah");
  const [logo] = useState("https://placehold.co/80x80.png");

  // State for Account Settings
  const [accountName, setAccountName] = useState("Wakasek Kesiswaan");
  const [accountEmail, setAccountEmail] = useState("wakasek@email.com");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

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
          Kelola pengaturan akun dan tampilan aplikasi.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
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
