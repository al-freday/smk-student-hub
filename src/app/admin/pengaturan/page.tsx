
"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Save, ArrowLeft, Upload, Users, Palette } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { getSourceData } from "@/lib/data-manager";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

interface SchoolInfo {
  schoolName: string;
  headmasterName: string;
  logo: string;
}

const themes: { [key: string]: { name: string, colors: { [key: string]: string } } } = {
    default: { name: "Default (Oranye & Biru)", colors: { "--primary": "25 95% 53%", "--accent": "217 91% 60%" } },
    green: { name: "Hutan (Hijau)", colors: { "--primary": "142 76% 36%", "--accent": "142 63% 52%" } },
    blue: { name: "Samudera (Biru)", colors: { "--primary": "217 91% 60%", "--accent": "217 80% 75%" } },
    purple: { name: "Lavender (Ungu)", colors: { "--primary": "262 83% 58%", "--accent": "250 70% 75%" } },
    pink: { name: "Fajar (Merah Muda)", colors: { "--primary": "340 82% 52%", "--accent": "340 70% 70%" } },
    teal: { name: "Toska", colors: { "--primary": "173 80% 40%", "--accent": "173 70% 60%" } },
};

const userRoles = [
    { key: "wakasek_kesiswaan", name: "Wakasek Kesiswaan" },
    { key: "wali_kelas", name: "Wali Kelas" },
    { key: "guru_bk", name: "Guru BK" },
    { key: "guru_mapel", name: "Guru Mapel" },
    { key: "guru_piket", name: "Guru Piket" },
    { key: "guru_pendamping", name: "Guru Pendamping" },
];

export default function AdminPengaturanPage() {
  const router = useRouter();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [schoolInfo, setSchoolInfo] = useState<SchoolInfo>({
    schoolName: "SMKN 2 Tana Toraja",
    headmasterName: "Nama Kepala Sekolah",
    logo: "",
  });
  
  const [totalUsers, setTotalUsers] = useState(0);
  const [selectedThemes, setSelectedThemes] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (sessionStorage.getItem("admin_logged_in") !== "true") {
      router.push("/admin");
      return;
    }
      
    const savedInfo = localStorage.getItem("schoolInfo");
    if (savedInfo) {
      setSchoolInfo(JSON.parse(savedInfo));
    }

    const teachersData = getSourceData('teachersData', {});
    let count = 0;
    if (teachersData && typeof teachersData === 'object') {
        Object.values(teachersData).forEach((roleArray: any) => {
            if (Array.isArray(roleArray)) {
                count += roleArray.length;
            }
        });
    }
    setTotalUsers(count);

    const loadedThemes: { [key: string]: string } = {};
    userRoles.forEach(role => {
        const theme = localStorage.getItem(`appTheme_${role.key}`);
        loadedThemes[role.key] = theme ? JSON.parse(theme).key : 'default';
    });
    setSelectedThemes(loadedThemes);

  }, [router]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setSchoolInfo(prevState => ({
        ...prevState,
        [id]: value
    }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSchoolInfo(prevState => ({
          ...prevState,
          logo: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleSaveChanges = () => {
      localStorage.setItem("schoolInfo", JSON.stringify(schoolInfo));
      toast({
          title: "Pengaturan Disimpan",
          description: "Informasi sekolah telah berhasil diperbarui.",
      });
  };

  const handleThemeChange = (roleKey: string, themeKey: string) => {
    const newSelectedThemes = { ...selectedThemes, [roleKey]: themeKey };
    setSelectedThemes(newSelectedThemes);

    const themeToSave = { key: themeKey, colors: themes[themeKey].colors };
    localStorage.setItem(`appTheme_${roleKey}`, JSON.stringify(themeToSave));
    
    toast({
        title: "Tema Diperbarui",
        description: `Tema untuk ${userRoles.find(r => r.key === roleKey)?.name} telah diubah.`,
    });

    // Optionally apply theme to current admin view if admin role is changed
    if (roleKey === 'admin' || roleKey === 'wakasek_kesiswaan') {
        Object.entries(themes[themeKey].colors).forEach(([property, value]) => {
            document.documentElement.style.setProperty(property, value);
        });
    }
  };

  return (
    <div className="flex-1 space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.push('/admin/dashboard')}>
            <ArrowLeft />
        </Button>
        <div>
            <h2 className="text-3xl font-bold tracking-tight">Pengaturan Global</h2>
            <p className="text-muted-foreground">
            Kelola informasi dan tampilan aplikasi untuk semua pengguna.
            </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
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
                 <Label htmlFor="logo">Logo Sekolah</Label>
                 <div className="flex items-center gap-4">
                    <Avatar className="h-20 w-20 rounded-lg">
                       <AvatarImage src={schoolInfo.logo} alt="Logo Sekolah" data-ai-hint="school building"/>
                       <AvatarFallback>LOGO</AvatarFallback>
                    </Avatar>
                    <Input
                        type="file"
                        id="logo-upload"
                        className="hidden"
                        accept="image/png, image/jpeg"
                        ref={fileInputRef}
                        onChange={handleLogoUpload}
                    />
                    <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                        <Upload className="mr-2 h-4 w-4" />
                        Unggah Logo
                    </Button>
                 </div>
              </div>
               <Button onClick={handleSaveChanges}>
                 <Save className="mr-2 h-4 w-4"/>
                 Simpan Informasi
              </Button>
            </CardContent>
          </Card>
          
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Palette /> Tema Aplikasi per Peran</CardTitle>
                <CardDescription>
                  Atur skema warna yang berbeda untuk setiap peran pengguna.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                  {userRoles.map((role) => (
                      <div key={role.key} className="flex items-center justify-between">
                         <div className="flex items-center gap-3">
                            <div className="flex -space-x-2">
                                <div className="h-6 w-6 rounded-full border-2 border-background" style={{ backgroundColor: `hsl(${themes[selectedThemes[role.key] || 'default'].colors['--primary']})` }} />
                                <div className="h-6 w-6 rounded-full border-2 border-background" style={{ backgroundColor: `hsl(${themes[selectedThemes[role.key] || 'default'].colors['--accent']})` }} />
                            </div>
                            <Label htmlFor={`theme-${role.key}`} className="font-medium">{role.name}</Label>
                         </div>
                         <Select 
                            value={selectedThemes[role.key] || 'default'}
                            onValueChange={(value) => handleThemeChange(role.key, value)}
                         >
                            <SelectTrigger id={`theme-${role.key}`} className="w-[180px]">
                                <SelectValue placeholder="Pilih Tema" />
                            </SelectTrigger>
                            <SelectContent>
                                {Object.entries(themes).map(([key, theme]) => (
                                    <SelectItem key={key} value={key}>{theme.name}</SelectItem>
                                ))}
                            </SelectContent>
                         </Select>
                      </div>
                  ))}
              </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Manajemen Pengguna</CardTitle>
                    <CardDescription>Kelola akun dan peran pengguna sistem.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                        <div className="flex items-center gap-4">
                            <Users className="h-8 w-8 text-primary"/>
                            <div>
                                <p className="text-2xl font-bold">{totalUsers}</p>
                                <p className="text-sm text-muted-foreground">Pengguna Terdaftar</p>
                            </div>
                        </div>
                         <Button onClick={() => router.push('/admin/pengaturan/pengguna')}>
                            Kelola Pengguna
                        </Button>
                    </div>
                </CardContent>
            </Card>
          </div>
      </div>
    </div>
  );
}
