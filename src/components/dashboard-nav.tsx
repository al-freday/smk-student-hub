
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
  BookUser,
  Handshake,
  HeartHandshake,
  ClipboardList,
  UserCheck,
  FileSignature,
  MessageSquare,
  SendToBack,
  TrafficCone,
  Siren,
  FolderKanban,
  FileHeart,
  MessagesSquare,
  Database,
  CalendarCheck,
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
import { getSourceData } from "@/lib/data-manager";

const navItemsByRole = {
  wakasek_kesiswaan: [
    { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/dashboard/data-induk-siswa", icon: Database, label: "Data Induk Siswa" },
    { href: "/dashboard/kehadiran-siswa", icon: CalendarCheck, label: "Kehadiran Siswa" },
    { href: "/dashboard/manajemen-guru", icon: UserCog, label: "Manajemen Guru" },
    { href: "/dashboard/jadwal-pelajaran", icon: CalendarClock, label: "Jadwal Pelajaran" },
    { href: "/dashboard/tata-tertib", icon: ShieldAlert, label: "Tata Tertib" },
    { href: "/dashboard/laporan", icon: FileText, label: "Laporan" },
    { href: "/dashboard/notifikasi", icon: Bell, label: "Notifikasi" },
  ],
  admin: [
    { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  ],
   wali_kelas: [
    { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/dashboard/kehadiran-siswa", icon: CalendarCheck, label: "Kehadiran Siswa" },
    { href: "/dashboard/laporan/wali-kelas", icon: BookUser, label: "Laporan Administrasi" },
    { href: "/dashboard/tata-tertib", icon: ShieldAlert, label: "Pembinaan Disiplin" },
  ],
  guru_bk: [
    { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/dashboard/laporan/guru-bk", icon: MessageSquare, label: "Layanan Konseling" },
    { href: "/dashboard/laporan/guru-bk/rekap", icon: SendToBack, label: "Rekap Program" },
  ],
  guru_mapel: [
    { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/dashboard/laporan/guru-mapel", icon: FileSignature, label: "Penilaian & Laporan" },
    { href: "/dashboard/jadwal-pelajaran", icon: CalendarClock, label: "Jadwal Mengajar" },
  ],
  guru_pendamping: [
    { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/dashboard/tata-tertib", icon: HeartHandshake, label: "Pembinaan Karakter" },
    { href: "/dashboard/laporan/guru-pendamping", icon: FileHeart, label: "Catatan Bimbingan" },
  ],
  guru_piket: [
    { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/dashboard/laporan/guru-piket", icon: Siren, label: "Laporan Piket Harian" },
    { href: "/dashboard/kehadiran-guru", icon: UserCheck, label: "Kehadiran Guru" },
  ]
};


export function DashboardNav({ isMobile = false }: { isMobile?: boolean }) {
  const pathname = usePathname();
  const [userRole, setUserRole] = useState<keyof typeof navItemsByRole | null>(null);
  const [schoolInfo, setSchoolInfo] = useState({ schoolName: "SMK Student Hub", logo: "" });
  
  useEffect(() => {
    const role = (localStorage.getItem('userRole') as keyof typeof navItemsByRole) || null;
    setUserRole(role);

    const teachersData = getSourceData('teachersData', {});
    if (teachersData.schoolInfo) {
      setSchoolInfo(teachersData.schoolInfo);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('userRole');
    localStorage.removeItem('currentUser');
  };

  const containerClass = isMobile ? "flex flex-col h-full" : "";
  
  const renderNavItems = () => {
    const navItems = userRole ? (navItemsByRole[userRole] || []) : [];
    if (navItems.length === 0 && userRole !== 'admin') return null;
    
    // Special case for admin to show link to admin panel
    if(userRole === 'admin') {
      return (
         <SidebarMenu>
            <SidebarMenuItem>
              <Link href="/admin/dashboard">
                <SidebarMenuButton tooltip="Admin Panel" isActive={pathname === "/admin/dashboard"}>
                  <LayoutDashboard className="size-4" />
                  <span className="group-data-[collapsible=icon]:hidden">Admin Panel</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
         </SidebarMenu>
      )
    }

    return (
      <SidebarMenu>
        {navItems.map((item) => (
          'href' in item ? (
            <SidebarMenuItem key={item.label}>
              <Link href={item.href}>
                <SidebarMenuButton tooltip={item.label} isActive={pathname === item.href || (pathname.startsWith(item.href) && item.href !== "/dashboard")}>
                    <item.icon className="size-4" />
                    <span className="group-data-[collapsible=icon]:hidden">
                      {item.label}
                    </span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ) : null
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
            {schoolInfo.schoolName}
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
