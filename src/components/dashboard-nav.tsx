
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
  Building,
  Briefcase,
  FileSignature,
  BookCopy,
  BadgeHelp,
  MessageSquare,
  ClipboardCheck,
  TrafficCone,
  Siren
} from "lucide-react";
import {
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
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
    { 
      label: "Perencanaan & Administrasi", 
      icon: BookUser, 
      subItems: [
        { href: "/dashboard/laporan/wali-kelas", label: "Administrasi Kelas" },
        { href: "/dashboard/manajemen-siswa", label: "Biodata Siswa" },
      ] 
    },
    { 
      label: "Pembinaan Disiplin", 
      icon: ShieldAlert, 
      subItems: [
        { href: "/dashboard/tata-tertib", label: "Catat Pelanggaran" },
      ] 
    },
    { 
      label: "Karakter & Kesiswaan", 
      icon: Users, 
      subItems: [
        { href: "/dashboard/tata-tertib", label: "Catat Prestasi" },
      ] 
    },
    { 
      label: "Kesejahteraan Siswa", 
      icon: HeartHandshake, 
      subItems: [
        { href: "/dashboard/laporan/wali-kelas", label: "Catatan Bantuan Siswa" },
      ] 
    },
    { 
      label: "Hubungan Orang Tua", 
      icon: Handshake, 
      subItems: [
        { href: "/dashboard/laporan/wali-kelas", label: "Laporan ke Orang Tua" },
      ] 
    },
    { 
      label: "Pengawasan & Laporan", 
      icon: ClipboardList, 
      subItems: [
        { href: "/dashboard/laporan/wali-kelas", label: "Laporan Bulanan" },
      ] 
    },
  ],
  guru_bk: [
    { href: "/dashboard/tata-tertib", icon: BadgeHelp, label: "Data Masalah Siswa" },
    { href: "/dashboard/laporan/guru-bk", icon: MessageSquare, label: "Layanan Konseling" },
    { href: "/dashboard/laporan", icon: Handshake, label: "Kolaborasi & Laporan" },
  ],
  guru_mapel: [
    { href: "/dashboard/jadwal-pelajaran", icon: CalendarClock, label: "Jadwal & Rencana" },
    { href: "/dashboard/manajemen-siswa", icon: UserCheck, label: "Aktivitas & Absensi" },
    { href: "/dashboard/laporan/guru-mapel", icon: FileSignature, label: "Penilaian & Laporan" },
  ],
  guru_pendamping: [
    { href: "/dashboard/laporan/wali-kelas", icon: BookCopy, label: "Administrasi Kelas" },
    { href: "/dashboard/laporan/guru-pendamping", icon: HeartHandshake, label: "Pendampingan & Kolaborasi" },
  ],
  guru_piket: [
    { href: "/dashboard/tata-tertib", icon: TrafficCone, label: "Disiplin & Ketertiban" },
    { href: "/dashboard/laporan/guru-piket", icon: Siren, label: "Laporan Piket Harian" },
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

    if (userRole === 'wali_kelas') {
      return (
        <SidebarMenu>
          <SidebarMenuItem>
            <Link href="/dashboard">
              <SidebarMenuButton tooltip="Dashboard" isActive={pathname === "/dashboard"}>
                <LayoutDashboard className="size-4" />
                <span className="group-data-[collapsible=icon]:hidden">Dashboard</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
          {navItems.map((item) => (
            <SidebarGroup key={item.label}>
              <SidebarGroupLabel className="flex items-center gap-2">
                <item.icon className="size-4" />
                <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
              </SidebarGroupLabel>
              <SidebarMenuSub>
                {item.subItems?.map(subItem => (
                  <SidebarMenuSubItem key={subItem.label}>
                    <Link href={subItem.href}>
                      <SidebarMenuSubButton isActive={pathname === subItem.href}>
                        {subItem.label}
                      </SidebarMenuSubButton>
                    </Link>
                  </SidebarMenuSubItem>
                ))}
              </SidebarMenuSub>
            </SidebarGroup>
          ))}
        </SidebarMenu>
      );
    }
    
    return (
      <SidebarMenu>
        {navItems.map((item) => (
          'href' in item ? (
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
