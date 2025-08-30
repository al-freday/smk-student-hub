
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  CalendarClock,
  LayoutDashboard,
  LogOut,
  Settings,
  FileText,
  Users,
  UserCog,
  User,
  UserCheck,
  Scale,
  ShieldAlert,
  Trophy,
  BookOpen,
  FileBarChart,
  ClipboardList,
  BookUser,
  Activity,
  Megaphone,
  BookMarked,
  BookCopy,
  FolderKanban,
  HeartHandshake,
  Contact,
  LineChart,
  ClipboardCheck,
  Briefcase,
  Folders,
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
} from "@/components/ui/sidebar";
import { Icons } from "./icons";
import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

const navItemsByRole = {
  wakasek_kesiswaan: [
    { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { type: 'divider', label: 'Data Induk' },
    { href: "/dashboard/manajemen-siswa", icon: Users, label: "Manajemen Siswa" },
    { href: "/dashboard/manajemen-guru", icon: UserCog, label: "Manajemen Guru" },
    { href: "/dashboard/manajemen-tata-tertib", icon: Scale, label: "Manajemen Tata Tertib" },
    { href: "/dashboard/mata-pelajaran", icon: BookMarked, label: "Mata Pelajaran" },
    { href: "/dashboard/jadwal-pelajaran", icon: CalendarClock, label: "Jadwal Pelajaran" },
    { href: "/dashboard/ekskul-prestasi", icon: Trophy, label: "Ekskul & Prestasi" },
    { type: 'divider', label: 'Aktivitas Harian' },
    { href: "/dashboard/kehadiran-siswa", icon: ClipboardList, label: "Kehadiran Siswa" },
    { href: "/dashboard/kehadiran-guru", icon: UserCheck, label: "Kehadiran Guru"},
    { href: "/dashboard/manajemen-pelanggaran", icon: ShieldAlert, label: "Manajemen Pelanggaran" },
    { type: 'divider', label: 'Laporan & Notifikasi' },
    { href: "/dashboard/laporan-pelanggaran", icon: FileBarChart, label: "Laporan Pelanggaran"},
    { href: "/dashboard/laporan-wakasek", icon: FileText, label: "Laporan Tugas Guru" },
    { href: "/dashboard/notifikasi", icon: Bell, label: "Notifikasi" },
  ],
  wali_kelas: [
    { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { type: 'divider', label: 'Manajemen Kelas' },
    { href: "/dashboard/administrasi-wali-kelas", icon: FolderKanban, label: "Administrasi Kelas" },
    { href: "/dashboard/kehadiran-siswa", icon: ClipboardList, label: "Input Kehadiran" },
    { href: "/dashboard/manajemen-pelanggaran", icon: ShieldAlert, label: "Lapor Pelanggaran" },
    { href: "/dashboard/laporan-tugas", icon: FileText, label: "Laporan Tugas" },
  ],
  guru_bk: [
    { href: "/dashboard", icon: HeartHandshake, label: "Dasbor BK" },
    { type: 'divider', label: 'Layanan BK' },
    { href: "/dashboard/pemantauan-siswa-bk", icon: LineChart, label: "Pemantauan Siswa" },
    { href: "/dashboard/layanan-bimbingan-bk", icon: ClipboardCheck, label: "Layanan Bimbingan" },
    { href: "/dashboard/rencana-individual-bk", icon: Briefcase, label: "Rencana Individual" },
    { href: "/dashboard/administrasi-bk", icon: Folders, label: "Administrasi BK" },
    { href: "/dashboard/lapor-pelanggaran", icon: ShieldAlert, label: "Lapor Pelanggaran" },
    { href: "/dashboard/laporan-tugas", icon: FileText, label: "Laporan Tugas" },
  ],
  guru_mapel: [
    { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/dashboard/administrasi-guru-mapel", icon: FolderKanban, label: "Administrasi Mapel" },
    { href: "/dashboard/jadwal-pelajaran", icon: CalendarClock, label: "Jadwal Mengajar" },
    { href: "/dashboard/kehadiran-siswa", icon: ClipboardList, label: "Input Kehadiran" },
    { href: "/dashboard/manajemen-pelanggaran", icon: ShieldAlert, label: "Lapor Pelanggaran" },
    { href: "/dashboard/laporan-tugas", icon: FileText, label: "Laporan Tugas" },
  ],
  guru_piket: [
    { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/dashboard/kehadiran-guru", icon: UserCheck, label: "Kehadiran Guru" },
    { href: "/dashboard/jadwal-pelajaran", icon: CalendarClock, label: "Jadwal Sekolah" },
    { href: "/dashboard/manajemen-pelanggaran", icon: ShieldAlert, label: "Lapor Pelanggaran" },
    { href: "/dashboard/laporan-tugas", icon: FileText, label: "Laporan Tugas" },
  ],
  guru_pendamping: [
    { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/dashboard/bimbingan-siswa", icon: Contact, label: "Bimbingan Siswa" },
    { href: "/dashboard/manajemen-pelanggaran", icon: ShieldAlert, label: "Lapor Pelanggaran" },
    { href: "/dashboard/ekskul-prestasi", icon: Trophy, label: "Catat Prestasi" },
    { href: "/dashboard/laporan-tugas", icon: FileText, label: "Laporan Tugas" },
  ],
  admin: [
    { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  ],
};


export function DashboardNav({ isMobile = false }: { isMobile?: boolean }) {
  const pathname = usePathname();
  const [userRole, setUserRole] = useState<keyof typeof navItemsByRole | null>(null);
  const [schoolInfo, setSchoolInfo] = useState({ schoolName: "SMK Student Hub", logo: "" });
  
  useEffect(() => {
    const role = (localStorage.getItem('userRole') as keyof typeof navItemsByRole) || 'wakasek_kesiswaan';
    setUserRole(role);

    const savedTeachers = localStorage.getItem('teachersData');
    if (savedTeachers) {
        const teachersData = JSON.parse(savedTeachers);
        if (teachersData.schoolInfo) {
            setSchoolInfo(teachersData.schoolInfo);
        }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('userRole');
    localStorage.removeItem('currentUser');
  };

  const containerClass = isMobile ? "flex flex-col h-full" : "";
  
  const renderNavItems = () => {
    let navItems = userRole ? (navItemsByRole[userRole as keyof typeof navItemsByRole] || []) : [];
    
    // Special case for admin to show link to admin panel
    if(userRole === 'admin') {
      return (
         <SidebarMenu>
            <SidebarMenuItem>
              <Link href="/admin/dashboard">
                <SidebarMenuButton tooltip="Admin Panel" isActive={pathname.startsWith("/admin")}>
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
        {navItems.map((item, index) => {
           if (item.type === 'divider') {
            return (
              <SidebarGroupLabel key={index} className="!h-auto mt-2">
                {item.label}
              </SidebarGroupLabel>
            );
          }
          if ('href' in item) {
             const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== "/dashboard");
            return (
              <SidebarMenuItem key={item.label}>
                <Link href={item.href}>
                  <SidebarMenuButton tooltip={item.label} isActive={isActive}>
                      <item.icon className="size-4" />
                      <span className="group-data-[collapsible=icon]:hidden">
                        {item.label}
                      </span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            )
          }
          return null;
        })}
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
           <span className="text-lg font.semibold whitespace-nowrap group-data-[collapsible=icon]:hidden">
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
