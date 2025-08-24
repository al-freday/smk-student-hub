
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
  User,
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
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

const navItemsByRole = {
  wakasek_kesiswaan: [
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
  admin: [],
   wali_kelas: [
    { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/dashboard/manajemen-siswa", icon: UserPlus, label: "Manajemen Siswa" },
    { href: "/dashboard/tata-tertib", icon: ShieldAlert, label: "Tata Tertib" },
    { href: "/dashboard/laporan", icon: FileText, label: "Laporan" },
  ],
  guru_bk: [
    { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/dashboard/tata-tertib", icon: ShieldAlert, label: "Tata Tertib" },
    { href: "/dashboard/laporan", icon: FileText, label: "Laporan" },
  ],
  guru_mapel: [
    { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/dashboard/jadwal-pelajaran", icon: CalendarClock, label: "Jadwal Pelajaran" },
    { href: "/dashboard/laporan", icon: FileText, label: "Laporan" },
  ],
  guru_pendamping: [
    { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/dashboard/laporan", icon: FileText, label: "Laporan" },
  ],
  guru_piket: [
    { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/dashboard/laporan", icon: FileText, label: "Laporan" },
  ]
};


export function DashboardNav({ isMobile = false }: { isMobile?: boolean }) {
  const pathname = usePathname();
  const [userRole, setUserRole] = useState<keyof typeof navItemsByRole | null>(null);
  const [schoolInfo, setSchoolInfo] = useState({ name: "SMK Student Hub", logo: "" });
  
  useEffect(() => {
    const role = (localStorage.getItem('userRole') as keyof typeof navItemsByRole) || null;
    setUserRole(role);

    const savedSchoolInfo = localStorage.getItem("schoolInfo");
    if (savedSchoolInfo) {
      const info = JSON.parse(savedSchoolInfo);
      setSchoolInfo({ name: info.schoolName, logo: info.logo });
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('userRole');
    localStorage.removeItem('currentUser');
  };

  const containerClass = isMobile ? "flex flex-col h-full" : "";

  if (userRole === 'admin' && !isMobile) {
    return null;
  }
  
  const renderNavItems = () => {
    if (!userRole) return null;
    
    const navItems = navItemsByRole[userRole] || [];

    if (navItems.length === 0) return null;

    return (
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
    );
  };

  return (
    <div className={containerClass}>
      <SidebarHeader className="hidden md:flex">
         <Link href="/dashboard" className="flex items-center gap-2">
           {schoolInfo.logo ? (
             <Avatar className="h-8 w-8">
                <AvatarImage src={schoolInfo.logo} alt="School Logo" />
                <AvatarFallback>S</AvatarFallback>
             </Avatar>
           ) : (
             <Icons.logo className="h-7 w-7 text-primary"/>
           )}
           <span className="text-lg font-semibold whitespace-nowrap group-data-[collapsible=icon]:hidden">
            {schoolInfo.name}
           </span>
         </Link>
      </SidebarHeader>

      <SidebarContent className="p-2 flex-1">
        {renderNavItems()}
      </SidebarContent>

      <SidebarFooter className="p-2">
          <SidebarMenu>
            <SidebarMenuItem>
                <Link href="/dashboard/profil">
                  <SidebarMenuButton tooltip="Profil" isActive={pathname.startsWith('/dashboard/profil')}>
                    <User className="size-4" />
                    <span className="group-data-[collapsible=icon]:hidden">Profil</span>
                  </SidebarMenuButton>
                </Link>
            </SidebarMenuItem>
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
