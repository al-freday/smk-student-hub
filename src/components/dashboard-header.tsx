
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
import { useEffect, useState } from "react";

const getRoleDisplayName = (role: string) => {
    switch (role) {
        case 'waliKelas': return 'Wali Kelas';
        case 'guruBk': return 'Guru BK';
        case 'guruMapel': return 'Guru Mapel';
        case 'guruPiket': return 'Guru Piket';
        case 'guruPendamping': return 'Guru Pendamping';
        case 'wakasek': return 'Wakasek Kesiswaan';
        case 'admin': return 'Administrator';
        default: return 'Pengguna';
    }
};

const getAvatarFallback = (role: string) => {
     switch (role) {
        case 'waliKelas': return 'WK';
        case 'guruBk': return 'BK';
        case 'guruMapel': return 'GM';
        case 'guruPiket': return 'GP';
        case 'guruPendamping': return 'GP';
        case 'wakasek': return 'WK';
        case 'admin': return 'AD';
        default: return 'U';
    }
}


export default function DashboardHeader() {
  const [userRole, setUserRole] = useState("");

  useEffect(() => {
    // Ambil peran dari localStorage saat komponen dimuat di client-side
    const role = localStorage.getItem('userRole') || 'wakasek';
    setUserRole(role);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('userRole');
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
                <AvatarImage src="https://placehold.co/40x40.png" alt="User" data-ai-hint="person avatar" />
                <AvatarFallback>{getAvatarFallback(userRole)}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>{getRoleDisplayName(userRole)}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profil</DropdownMenuItem>
             <Link href="/dashboard/pengaturan">
                <DropdownMenuItem>Pengaturan</DropdownMenuItem>
             </Link>
            <DropdownMenuSeparator />
             <Link href="/" onClick={handleLogout}>
              <DropdownMenuItem>Logout</DropdownMenuItem>
            </Link>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
