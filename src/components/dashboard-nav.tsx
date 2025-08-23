
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  CalendarClock,
  LayoutDashboard,
  LogOut,
  Settings,
  ShieldAlert,
  School,
  UserPlus,
  FileText,
  Users,
  UserCog,
} from "lucide-react";
import {
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarContent,
} from "@/components/ui/sidebar";
import { Icons } from "./icons";
import { Separator } from "./ui/separator";
import { useEffect, useState } from "react";

// Definisikan item menu untuk setiap peran
const navItemsByRole = {
  wakasek: [
    { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/dashboard/manajemen-kelas", icon: School, label: "Manajemen Kelas" },
    { href: "/dashboard/manajemen-siswa", icon: UserPlus, label: "Manajemen Siswa" },
    { href: "/dashboard/manajemen-guru", icon: UserCog, label: "Manajemen Guru" },
    { href: "/dashboard/jadwal-pelajaran", icon: CalendarClock, label: "Jadwal Pelajaran" },
    { href: "/dashboard/tata-tertib", icon: ShieldAlert, label: "Tata Tertib" },
    { href: "/dashboard/laporan", icon: FileText, label: "Laporan" },
    { href: "/dashboard/manajemen-pengguna", icon: Users, label: "Manajemen Pengguna" },
    { href: "/dashboard/notifikasi", icon: Bell, label: "Notifikasi" },
  ],
  admin: [], // Admin tidak memiliki menu navigasi di dasbor utama
  waliKelas: [
    { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/dashboard/manajemen-siswa", icon: UserPlus, label: "Manajemen Siswa" },
    { href: "/dashboard/laporan/wali-kelas", icon: FileText, label: "Laporan Wali Kelas" },
    { href: "/dashboard/tata-tertib", icon: ShieldAlert, label: "Tata Tertib" },
  ],
  guruBk: [
    { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/dashboard/manajemen-siswa", icon: UserPlus, label: "Manajemen Siswa" },
    { href: "/dashboard/laporan/guru-bk", icon: FileText, label: "Laporan Guru BK" },
    { href: "/dashboard/tata-tertib", icon: ShieldAlert, label: "Tata Tertib" },
  ],
  guruMapel: [
    { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/dashboard/jadwal-pelajaran", icon: CalendarClock, label: "Jadwal Pelajaran" },
    { href: "/dashboard/laporan/guru-mapel", icon: FileText, label: "Laporan Guru Mapel" },
  ],
  guruPiket: [
    { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/dashboard/laporan/guru-piket", icon: FileText, label: "Laporan Guru Piket" },
  ],
  guruPendamping: [
    { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/dashboard/laporan/guru-pendamping", icon: FileText, label: "Laporan Pendamping" },
  ],
};


export function DashboardNav({ isMobile = false }: { isMobile?: boolean }) {
  const pathname = usePathname();
  const [userRole, setUserRole] = useState<keyof typeof navItemsByRole>('wakasek');
  
  useEffect(() => {
    const role = (localStorage.getItem('userRole') as keyof typeof navItemsByRole) || 'wakasek';
    setUserRole(role);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('userRole');
  };

  const navItems = navItemsByRole[userRole] || [];
  const containerClass = isMobile ? "flex flex-col h-full" : "";

  if (userRole === 'admin' || navItems.length === 0) {
    return null; // Jangan render apapun untuk admin atau jika tidak ada item nav
  }

  return (
    <div className={containerClass}>
      <SidebarHeader className="hidden md:flex">
         <Link href="/dashboard" className="flex items-center gap-2">
           <Icons.logo className="h-7 w-7 text-primary"/>
           <span className="text-lg font-semibold whitespace-nowrap group-data-[collapsible=icon]:hidden">
            SMKN 2 Tana Toraja
           </span>
         </Link>
      </SidebarHeader>

      <SidebarContent className="p-2 flex-1">
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.label}>
              <Link href={item.href}>
                <SidebarMenuButton tooltip={item.label} isActive={pathname.startsWith(item.href) && (item.href !== "/dashboard" || pathname === "/dashboard")}>
                    <item.icon className="size-4" />
                    <span className="group-data-[collapsible=icon]:hidden">
                      {item.label}
                    </span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="p-2">
          <SidebarMenu>
            <SidebarMenuItem>
                <Link href="/dashboard/pengaturan">
                  <SidebarMenuButton tooltip="Pengaturan" isActive={pathname.startsWith('/dashboard/pengaturan')}>
                    <Settings className="size-4" />
                    <span className="group-data-[collapsible=icon]:hidden">Pengaturan</span>
                  </SidebarMenuButton>
                </Link>
            </SidebarMenuItem>
            <Separator className="my-1"/>
            <SidebarMenuItem>
              <Link href="/" onClick={handleLogout}>
                <SidebarMenuButton tooltip="Logout">
                  <LogOut className="size-4" />
                  <span className="group-data-[collapsible=icon]:hidden">Logout</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          </SidebarMenu>
      </SidebarFooter>
    </div>
  );
}
