
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Save, ArrowLeft } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface SchoolInfo {
  schoolName: string;
  headmasterName: string;
  logo: string;
}

export default function AdminPengaturanPage() {
  const router = useRouter();
  const { toast } = useToast();
  
  const [schoolInfo, setSchoolInfo] = useState<SchoolInfo>({
    schoolName: "SMKN 2 Tana Toraja",
    headmasterName: "Nama Kepala Sekolah",
    logo: "https://placehold.co/80x80.png",
  });
  
  useEffect(() => {
     // Verifikasi sesi admin
    if (sessionStorage.getItem("admin_logged_in") !== "true") {
      router.push("/admin");
      return;
    }
      
    // Muat data dari localStorage saat komponen dimuat
    const savedInfo = localStorage.getItem("schoolInfo");
    if (savedInfo) {
      setSchoolInfo(JSON.parse(savedInfo));
    }
  }, [router]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setSchoolInfo(prevState => ({
        ...prevState,
        [id]: value
    }));
  };
  
  const handleSaveChanges = () => {
      localStorage.setItem("schoolInfo", JSON.stringify(schoolInfo));
      toast({
          title: "Pengaturan Disimpan",
          description: "Informasi sekolah telah berhasil diperbarui.",
      });
  };

  const themes = {
    default: { "--primary": "231 48% 48%", "--accent": "266 44% 58%" },
    green: { "--primary": "142 76% 36%", "--accent": "142 63% 52%" },
    blue: { "--primary": "217 91% 60%", "--accent": "217 80% 75%" },
    orange: { "--primary": "25 95% 53%", "--accent": "25 90% 65%" },
  };
  
  const handleThemeChange = (newTheme: { [key: string]: string }) => {
    const themeString = JSON.stringify(newTheme);
    localStorage.setItem('appTheme', themeString);
    Object.entries(newTheme).forEach(([property, value]) => {
      document.documentElement.style.setProperty(property, value);
    });
    toast({
        title: "Tema Global Diubah",
        description: "Tampilan aplikasi untuk semua pengguna telah diperbarui.",
    });
  };

  return (
    <div className="flex-1 space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="flex items-center gap-4">
        <Link href="/admin/dashboard">
            <Button variant="outline" size="icon">
                <ArrowLeft />
            </Button>
        </Link>
        <div>
            <h2 className="text-3xl font-bold tracking-tight">Pengaturan Global</h2>
            <p className="text-muted-foreground">
            Kelola informasi dan tampilan aplikasi untuk semua pengguna.
            </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Informasi Sekolah</CardTitle>
              <CardDescription>
                Informasi ini akan ditampilkan di seluruh aplikasi.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="schoolName">Nama Sekolah</Label>
                <Input id="schoolName" value={schoolInfo.schoolName} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="headmasterName">Nama Kepala Sekolah</Label>
                <Input id="headmasterName" value={schoolInfo.headmasterName} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                 <Label htmlFor="logo">URL Logo Sekolah</Label>
                 <div className="flex items-center gap-4">
                    <Avatar className="h-20 w-20 rounded-lg">
                       <AvatarImage src={schoolInfo.logo} alt="Logo Sekolah" data-ai-hint="school building"/>
                       <AvatarFallback>LOGO</AvatarFallback>
                    </Avatar>
                    <Input id="logo" value={schoolInfo.logo} onChange={handleInputChange} placeholder="https://example.com/logo.png"/>
                 </div>
              </div>
               <Button onClick={handleSaveChanges}>
                 <Save className="mr-2 h-4 w-4"/>
                 Simpan Informasi
              </Button>
            </CardContent>
          </Card>
          
           <Card>
            <CardHeader>
              <CardTitle>Tema Aplikasi Global</CardTitle>
              <CardDescription>
                Pilih skema warna default untuk semua pengguna.
              </CardDescription>
            </CardHeader>
             <CardContent className="space-y-4">
                 <p className="text-sm text-muted-foreground">Perubahan tema di sini akan menjadi tampilan default untuk semua pengguna saat mereka login.</p>
                <div className="grid grid-cols-2 gap-4">
                    <Button variant="outline" onClick={() => handleThemeChange(themes.default)}>Default</Button>
                    <Button variant="outline" className="bg-green-600 text-white hover:bg-green-700" onClick={() => handleThemeChange(themes.green)}>Hijau</Button>
                    <Button variant="outline" className="bg-blue-600 text-white hover:bg-blue-700" onClick={() => handleThemeChange(themes.blue)}>Biru</Button>
                    <Button variant="outline" className="bg-orange-600 text-white hover:bg-orange-700" onClick={() => handleThemeChange(themes.orange)}>Oranye</Button>
                </div>
             </CardContent>
          </Card>
      </div>
    </div>
  );
}
