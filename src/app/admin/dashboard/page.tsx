
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { LogIn, Settings, LogOut } from "lucide-react";
import Link from "next/link";

interface User {
  id: string;
  nama: string;
  roleKey: string;
  roleName: string;
}

const getRoleName = (roleKey: string) => {
    const roles: { [key: string]: string } = {
        wali_kelas: 'Wali Kelas',
        guru_bk: 'Guru BK',
        guru_mapel: 'Guru Mapel',
        guru_piket: 'Guru Piket',
        guru_pendamping: 'Guru Pendamping',
        wakasek_kesiswaan: 'Wakasek Kesiswaan',
    };
    return roles[roleKey] || 'Guru';
};

const createEmailFromName = (name: string, roleKey: string, id: string) => {
    const namePart = name.toLowerCase().replace(/\s+/g, '.').replace(/[^a-z0-9.]/g, '');
    const idPart = id.split('-').pop(); // Ambil bagian numerik dari ID
    return `${namePart}${idPart}@schoolemail.com`;
};

export default function AdminDashboardPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  useEffect(() => {
    if (sessionStorage.getItem("admin_logged_in") !== "true") {
      router.push("/admin");
      return;
    }

    try {
      const savedTeachers = localStorage.getItem('teachersData');
      if (savedTeachers) {
        const teachersData = JSON.parse(savedTeachers);
        const users: User[] = [];
        
        users.push({
            id: 'wakasek_kesiswaan-0', // ID unik untuk wakasek
            nama: 'Wakasek Kesiswaan',
            roleKey: 'wakasek_kesiswaan',
            roleName: 'Wakasek Kesiswaan'
        });

        Object.keys(teachersData).forEach(roleKey => {
          const formattedRoleKey = roleKey.replace(/([A-Z])/g, '_$1').toLowerCase();
          if (Array.isArray(teachersData[roleKey])) {
            teachersData[roleKey].forEach((guru: any) => {
              const uniqueId = `${formattedRoleKey}-${guru.id}`;
              users.push({
                id: uniqueId,
                nama: guru.nama,
                roleKey: formattedRoleKey,
                roleName: getRoleName(formattedRoleKey),
              });
            });
          }
        });
        setAllUsers(users);
      }
    } catch (error) {
      console.error("Gagal memuat data pengguna:", error);
      toast({
        title: "Gagal Memuat",
        description: "Tidak dapat memuat data pengguna dari penyimpanan.",
        variant: "destructive",
      });
    }
  }, [router, toast]);
  
  const handleImpersonate = () => {
    if (!selectedUser) {
        toast({ title: "Pilih Pengguna", description: "Silakan pilih pengguna untuk login.", variant: "destructive" });
        return;
    }
    const userToImpersonate = allUsers.find(u => u.id === selectedUser);
    if (userToImpersonate) {
        localStorage.setItem('userRole', userToImpersonate.roleKey);

        const userForSettings = {
            nama: userToImpersonate.nama,
            role: userToImpersonate.roleName,
            email: createEmailFromName(userToImpersonate.nama, userToImpersonate.roleKey, userToImpersonate.id),
        };
        localStorage.setItem('currentUser', JSON.stringify(userForSettings));

        toast({
            title: "Login Berhasil",
            description: `Anda sekarang login sebagai ${userToImpersonate.nama} (${userToImpersonate.roleName}).`,
        });
        
        // Memicu event kustom untuk memberitahu layout bahwa peran telah berubah
        window.dispatchEvent(new Event('roleChanged'));
        
        router.push('/dashboard');
    }
  };
  
  const handleLogout = () => {
    sessionStorage.removeItem("admin_logged_in");
    localStorage.removeItem('currentUser');
    localStorage.removeItem('userRole');
    router.push("/admin");
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <Card className="w-full max-w-lg shadow-xl">
        <CardHeader>
          <CardTitle>Dasbor Admin</CardTitle>
          <CardDescription>
            Pilih pengguna di bawah ini untuk melihat dasbor dari sudut pandang mereka.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="user-select">Pilih Pengguna untuk Login</Label>
             <Select onValueChange={setSelectedUser}>
              <SelectTrigger id="user-select">
                <SelectValue placeholder="Pilih nama pengguna..." />
              </SelectTrigger>
              <SelectContent>
                {allUsers.map(user => (
                   <SelectItem key={user.id} value={user.id}>
                    {user.nama} ({user.roleName})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
           <Button className="w-full" onClick={handleImpersonate}>
            <LogIn className="mr-2 h-4 w-4" />
            Login Sebagai Pengguna Terpilih
          </Button>
          
          <div className="flex justify-between items-center pt-4 border-t">
             <Button variant="outline" asChild>
                <Link href='/admin/pengaturan'>
                    <Settings className="mr-2 h-4 w-4" />
                    Pengaturan Global
                </Link>
            </Button>
            <Button variant="destructive" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout Admin
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
