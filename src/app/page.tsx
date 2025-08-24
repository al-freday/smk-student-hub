
"use client";

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Icons } from '@/components/icons';
import { LoginForm } from '@/components/login-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Shield } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface SchoolInfo {
  schoolName: string;
  logo: string;
}

export default function Home() {
  const [schoolInfo, setSchoolInfo] = useState<SchoolInfo>({
    schoolName: "SMK Student Hub",
    logo: "",
  });

  useEffect(() => {
    const savedInfo = localStorage.getItem("schoolInfo");
    if (savedInfo) {
      setSchoolInfo(JSON.parse(savedInfo));
    }
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-2xl border-primary/20">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
               {schoolInfo.logo ? (
                 <Avatar className="h-16 w-16">
                    <AvatarImage src={schoolInfo.logo} alt="School Logo" />
                    <AvatarFallback>S</AvatarFallback>
                 </Avatar>
               ) : (
                 <Icons.logo className="h-12 w-12 text-primary" />
               )}
            </div>
            <CardTitle className="text-3xl font-bold tracking-tight text-primary">{schoolInfo.schoolName}</CardTitle>
            <CardDescription>
              Sistem Manajemen Kesiswaan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm />
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
