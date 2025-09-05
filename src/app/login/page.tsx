
"use client";

import { useEffect, useState, useCallback } from 'react';
import { Icons } from '@/components/icons';
import { LoginForm } from '@/components/login-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { fetchDataFromFirebase } from '@/lib/data-manager';

interface SchoolInfo {
  schoolName: string;
  logo: string;
}

interface User {
    id: string;
    nama: string;
    role: string;
    roleKey: string;
    password?: string;
}

const getRoleName = (roleKey: string) => {
    const roles: { [key: string]: string } = {
        wali_kelas: 'Wali Kelas',
        guru_bk: 'Guru BK',
        guru_mapel: 'Guru Mapel',
        guru_piket: 'Guru Piket',
        guru_pendamping: 'Guru Pendamping',
        wakasek_kesiswaan: 'Wakasek Kesiswaan',
        tata_usaha: 'Tata Usaha',
    };
    return roles[roleKey] || 'Guru';
};

export default function LoginPage() {
  const [schoolInfo, setSchoolInfo] = useState<SchoolInfo>({
    schoolName: "SMK Student Hub",
    logo: "",
  });
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState("Menghubungkan ke server...");

  const loadInitialData = useCallback(async () => {
      setIsLoading(true);
      try {
          setLoadingMessage("Mengautentikasi koneksi...");
          // This call now correctly waits for auth before proceeding.
          const teachersData = await fetchDataFromFirebase('teachersData'); 
          
          setLoadingMessage("Memuat data pengguna...");
          if (teachersData && teachersData.schoolInfo) {
              setSchoolInfo(teachersData.schoolInfo);
          }

          const users: User[] = [];
          if (teachersData) {
            const { schoolInfo, ...roles } = teachersData;
            Object.keys(roles).forEach(roleKey => {
                const roleArray = roles[roleKey as keyof typeof roles];
                if (Array.isArray(roleArray)) {
                    roleArray.forEach((guru: any) => {
                        if(guru && guru.id !== undefined && guru.nama) {
                            const uniqueId = `${roleKey}-${guru.id}`;
                            const roleName = getRoleName(roleKey);
                            users.push({
                                id: uniqueId,
                                nama: guru.nama,
                                role: roleName,
                                roleKey: roleKey,
                                password: guru.password,
                            });
                        }
                    });
                }
            });
          }
          setAllUsers(users.sort((a,b) => a.nama.localeCompare(b.nama)));
      } catch (e) {
          console.error("Failed to load initial data from Firebase", e);
          setLoadingMessage("Gagal memuat data. Periksa koneksi Anda.");
      } finally {
          setIsLoading(false);
      }
  }, []);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="mt-2 text-muted-foreground">{loadingMessage}</p>
      </div>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-2xl border-primary/20">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
               {schoolInfo.logo ? (
                 <Avatar className="h-16 w-16">
                    <AvatarImage src={schoolInfo.logo} alt="School Logo" data-ai-hint="school building"/>
                    <AvatarFallback>S</AvatarFallback>
                 </Avatar>
               ) : (
                 <Icons.logo className="h-12 w-12 text-primary" />
               )}
            </div>
            <CardTitle className="text-3xl font.bold tracking-tight text-primary">{schoolInfo.schoolName}</CardTitle>
            <CardDescription>
              Sistem Manajemen Kesiswaan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm allUsers={allUsers} />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
