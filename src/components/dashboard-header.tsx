
"use client";

import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Search } from "lucide-react";
import { DashboardNav } from "./dashboard-nav";
import { Icons } from "./icons";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

interface UserInfo {
    nama: string;
    role: string;
    email: string;
    avatar?: string;
}

const getAvatarFallbackFromName = (name: string = "") => {
    if (!name) return "U";
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
};

export default function DashboardHeader() {
  const router = useRouter();
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  
  const loadUserInfo = useCallback(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
        setUserInfo(JSON.parse(storedUser));
    }
  }, []);

  useEffect(() => {
    loadUserInfo();
    
    // Listen for storage changes to update the header in real-time
    const handleStorageChange = (event: StorageEvent) => {
        if (event.key === 'currentUser') {
            loadUserInfo();
        }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
        window.removeEventListener('storage', handleStorageChange);
    };
  }, [loadUserInfo]);

  const handleLogout = () => {
    localStorage.removeItem('userRole');
    localStorage.removeItem('currentUser');
    router.push('/');
  };

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 sm:px-6">
      <div className="md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0">
            <Link href="#" className="flex h-16 items-center border-b px-4">
               <Icons.logo className="h-6 w-6 mr-2" />
               <span className="font-semibold">SMKN 2 Tana Toraja</span>
            </Link>
            <DashboardNav isMobile={true} />
          </SheetContent>
        </Sheet>
      </div>

      <div className="flex w-full items-center gap-4 md:gap-2 lg:gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Cari siswa..."
            className="w-full rounded-lg bg-secondary pl-8 md:w-[200px] lg:w-[320px]"
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Avatar>
                <AvatarImage src={userInfo?.avatar} alt="User" data-ai-hint="person avatar" />
                <AvatarFallback>{getAvatarFallbackFromName(userInfo?.nama)}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>{userInfo?.nama || "Pengguna"}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <Link href="/dashboard/profil" passHref>
                <DropdownMenuItem>Profil</DropdownMenuItem>
            </Link>
             <Link href="/dashboard/pengaturan" passHref>
                <DropdownMenuItem>Pengaturan</DropdownMenuItem>
             </Link>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
