
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { LogIn, Settings, LogOut, Loader2 } from "lucide-react";
import Link from "next/link";
import { getSourceData, updateSourceData } from "@/lib/data-manager";

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

const createEmailFromName = (name: string, id: string) => {
    const namePart = name.toLowerCase().replace(/\s+/g, '.').replace(/[^a-z0-9.]/g, '');
    const idPart = id.split('-').pop();
    return `${namePart}${idPart}@schoolemail.com`;
};

export default function AdminDashboardPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    if (sessionStorage.getItem("admin_logged_in") !== "true") {
      router.push("/admin");
      return;
    }

    const loadUsers = async () => {
        setIsLoading(true);
        try {
          // In an admin context, we assume we can get data directly.
          // This part fails if not authenticated properly.
          const teachersData = getSourceData('teachersData', null);
          const users: User[] = [];
          if (teachersData) {
            const { schoolInfo, ...roles } = teachersData;
            Object.keys(roles).forEach(roleKey => {
                if (Array.isArray(roles[roleKey])) {
                  roles[roleKey].forEach((guru: any) => {
                    if (guru && guru.id !== undefined && guru.nama) {
                      const uniqueId = `${roleKey}-${guru.id}`;
                      users.push({
                        id: uniqueId,
                        nama: guru.nama,
                        roleKey: roleKey,
                        roleName: getRoleName(roleKey),
                      });
                    }
                  });
                }
            });
          }
          setAllUsers(users.sort((a,b) => a.nama.localeCompare(b.nama)));
        } catch (error) {
          console.error("Gagal memuat data pengguna:", error);
          toast({
            title: "Gagal Memuat",
            description: "Tidak dapat memuat data pengguna. Pastikan Anda memiliki koneksi.",
            variant: "destructive",
          });
        } finally {
            setIsLoading(false);
        }
    };

    loadUsers();
  }, [router, toast]);
  
  const handleImpersonate = () => {
    if (!selectedUser) {
        toast({ title: "Pilih Pengguna", description: "Silakan pilih pengguna untuk login.", variant: "destructive" });
        return;
    }
    const userToImpersonate = allUsers.find(u => u.id === selectedUser);
    if (userToImpersonate) {
        updateSourceData('userRole', userToImpersonate.roleKey);

        const userForSettings = {
            nama: userToImpersonate.nama,
            role: userToImpersonate.roleName,
            email: createEmailFromName(userToImpersonate.nama, userToImpersonate.id),
        };
        updateSourceData('currentUser', userForSettings);

        toast({
            title: "Login Berhasil",
            description: `Anda sekarang login sebagai ${userToImpersonate.nama} (${userToImpersonate.roleName}).`,
        });
        
        window.dispatchEvent(new Event('roleChanged'));
        
        router.push('/dashboard');
    }
  };
  
  const handleLogout = () => {
    sessionStorage.removeItem("admin_logged_in");
    localStorage.removeItem('currentUser');
    localStorage.removeItem('userRole');
    router.push("/");
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <Card className="w-full max-w-lg shadow-xl">
        <CardHeader>
          <CardTitle>Dasbor Administrator</CardTitle>
          <CardDescription>
            Pilih pengguna di bawah ini untuk melihat dasbor dari sudut pandang mereka (impersonasi).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-24">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="user-select">Pilih Pengguna untuk Login</Label>
                 <Select onValueChange={setSelectedUser} value={selectedUser ?? undefined}>
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
            </>
          )}
          
          <div className="flex justify-between items-center pt-4 border-t">
             <Button variant="outline" asChild>
                <Link href='/admin/pengaturan'>
                    <Settings className="mr-2 h-4 w-4" />
                    Pengaturan Global
                </Link>
            </Button>
            <Button variant="destructive" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
