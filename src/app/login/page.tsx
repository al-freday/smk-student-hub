
"use client";

import { useEffect, useState, useCallback } from 'react';
import { Icons } from '@/components/icons';
import { LoginForm } from '@/components/login-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Shield, Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getSourceData } from '@/lib/data-manager';

interface SchoolInfo {
  schoolName: string;
  logo: string;
}

interface User {
    id: string;
    nama: string;
    role: string;
    password?: string;
}

const getRoleName = (roleKey: string) => {
    const roles: { [key: string]: string } = {
        wali_kelas: 'Wali Kelas',
        guru_bk: 'Guru BK',
        guru_mapel: 'Guru Mapel',
        guru_piket: 'Guru Piket',
        guru_pendamping: 'Guru Pendamping',
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

  const loadInitialData = useCallback(() => {
      try {
          const savedData = getSourceData('teachersData', {});
          if (savedData.schoolInfo) {
              setSchoolInfo(savedData.schoolInfo);
          }

          const users: User[] = [];
          const { schoolInfo, ...roles } = savedData;
          
          users.push({
            id: 'wakasek_kesiswaan-0',
            nama: 'Wakasek Kesiswaan',
            role: 'Wakasek Kesiswaan',
            password: 'password123',
          });

          Object.keys(roles).forEach(roleKey => {
              if (Array.isArray(roles[roleKey])) {
                  roles[roleKey].forEach((guru: any) => {
                      if(guru && guru.id !== undefined && guru.nama) {
                          const uniqueId = `${roleKey}-${guru.id}`;
                          users.push({
                              id: uniqueId,
                              nama: guru.nama,
                              role: getRoleName(roleKey),
                              password: guru.password,
                          });
                      }
                  });
              }
          });
          setAllUsers(users.sort((a,b) => a.nama.localeCompare(b.nama)));
      } catch (e) {
          console.error("Failed to load initial data", e)
      } finally {
          setIsLoading(false);
      }
  }, []);

  useEffect(() => {
    loadInitialData();
    window.addEventListener('dataUpdated', loadInitialData);
    window.addEventListener('storage', loadInitialData); // Listen for changes from other tabs

    return () => {
        window.removeEventListener('dataUpdated', loadInitialData);
        window.removeEventListener('storage', loadInitialData);
    };
  }, [loadInitialData]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
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
                    <AvatarImage src={schoolInfo.logo} alt="School Logo" data-ai-hint="school building" />
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
        <div className="mt-6 text-center">
           <Link href="/admin">
                <Button variant="link" className="text-muted-foreground">
                    <Shield className="mr-2 h-4 w-4" />
                    Login sebagai Administrator
                </Button>
            </Link>
        </div>
      </div>
    </main>
  );
}
