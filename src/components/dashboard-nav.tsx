
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
  FileBarChart,
  ClipboardList,
  BookMarked,
  HeartHandshake,
  Contact,
  LineChart,
  ClipboardCheck,
  Briefcase,
  Folders,
  Award,
  Inbox,
  DollarSign,
  FileSignature,
  Archive,
  Database,
  FileUp,
} from "lucide-react";
import {
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarContent,
  SidebarGroupLabel,
} from "@/components/ui/sidebar";
import { Icons } from "./icons";
import { useEffect, useState, useCallback } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { getSourceData } from "@/lib/data-manager";

const navItemsByRole = {
  wakasek_kesiswaan: [
    { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { type: 'divider', label: 'Data Induk' },
    { href: "/dashboard/manajemen-siswa", icon: Users, label: "Manajemen Siswa" },
    { href: "/dashboard/manajemen-guru", icon: UserCog, label: "Manajemen Guru" },
    { href: "/dashboard/manajemen-tata-tertib", icon: Scale, label: "Manajemen Tata Tertib" },
    { href: "/dashboard/mata-pelajaran", icon: BookMarked, label: "Mata Pelajaran" },
    { href: "/dashboard/jadwal-pelajaran", icon: CalendarClock, label: "Jadwal Pelajaran" },
    { type: 'divider', label: 'Aktivitas Harian' },
    { href: "/dashboard/kehadiran-siswa", icon: ClipboardList, label: "Kehadiran Siswa" },
    { href: "/dashboard/kehadiran-guru", icon: UserCheck, label: "Kehadiran Guru"},
    { href: "/dashboard/manajemen-pelanggaran", icon: ShieldAlert, label: "Manajemen Pelanggaran" },
    { href: "/dashboard/laporan-masuk-wakasek", icon: Inbox, label: "Laporan Eskalasi" },
    { type: 'divider', label: 'Laporan & Notifikasi' },
    { href: "/dashboard/laporan-pelanggaran", icon: FileBarChart, label: "Laporan Pelanggaran"},
    { href: "/dashboard/laporan-wakasek", icon: FileText, label: "Laporan Tugas Guru" },
    { href: "/dashboard/rekap-laporan-eskalasi", icon: Archive, label: "Rekap Laporan Eskalasi" },
    { href: "/dashboard/notifikasi", icon: Bell, label: "Notifikasi" },
  ],
  wali_kelas: [
    { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/dashboard/laporan-masuk", icon: Inbox, label: "Laporan Masuk" },
    { href: "/dashboard/surat", icon: FileSignature, label: "Surat" },
    { type: 'divider', label: 'Manajemen Kelas' },
    { href: "/dashboard/administrasi-wali-kelas", icon: Folders, label: "Administrasi Kelas" },
    { href: "/dashboard/kehadiran-siswa", icon: ClipboardList, label: "Input Kehadiran" },
    { href: "/dashboard/pembayaran-komite", icon: DollarSign, label: "Pembayaran Komite" },
    { href: "/dashboard/manajemen-pelanggaran", icon: ShieldAlert, label: "Manajemen Pelanggaran" },
    { href: "/dashboard/laporan-tugas", icon: FileText, label: "Laporan Tugas" },
  ],
  guru_bk: [
    { href: "/dashboard", icon: HeartHandshake, label: "Dasbor BK" },
    { href: "/dashboard/laporan-masuk-bk", icon: Inbox, label: "Laporan Masuk BK" },
    { type: 'divider', label: 'Layanan BK' },
    { href: "/dashboard/pemantauan-siswa-bk", icon: LineChart, label: "Pemantauan Siswa" },
    { href: "/dashboard/layanan-bimbingan-bk", icon: ClipboardCheck, label: "Layanan Bimbingan" },
    { href: "/dashboard/rencana-individual-bk", icon: Briefcase, label: "Rencana Individual" },
    { href: "/dashboard/administrasi-bk", icon: Folders, label: "Administrasi BK" },
    { href: "/dashboard/manajemen-pelanggaran", icon: ShieldAlert, label: "Manajemen Pelanggaran" },
    { href: "/dashboard/laporan-tugas", icon: FileText, label: "Laporan Tugas" },
  ],
  guru_mapel: [
    { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/dashboard/administrasi-guru-mapel", icon: Folders, label: "Administrasi Mapel" },
    { href: "/dashboard/jadwal-pelajaran", icon: CalendarClock, label: "Jadwal Mengajar" },
    { href: "/dashboard/kehadiran-siswa", icon: ClipboardList, label: "Input Kehadiran" },
    { href: "/dashboard/manajemen-pelanggaran", icon: ShieldAlert, label: "Manajemen Pelanggaran" },
    { href: "/dashboard/laporan-tugas", icon: FileText, label: "Laporan Tugas" },
  ],
  guru_piket: [
    { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/dashboard/kehadiran-guru", icon: UserCheck, label: "Kehadiran Guru" },
    { href: "/dashboard/jadwal-pelajaran", icon: CalendarClock, label: "Jadwal Sekolah" },
    { href: "/dashboard/manajemen-pelanggaran", icon: ShieldAlert, label: "Manajemen Pelanggaran" },
    { href: "/dashboard/laporan-tugas", icon: FileText, label: "Laporan Tugas" },
  ],
  guru_pendamping: [
    { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/dashboard/bimbingan-siswa", icon: Contact, label: "Bimbingan Siswa" },
    { href: "/dashboard/rekap-bimbingan", icon: Archive, label: "Rekap Bimbingan" },
    { href: "/dashboard/manajemen-pelanggaran", icon: ShieldAlert, label: "Manajemen Pelanggaran" },
    { href: "/dashboard/laporan-tugas", icon: FileText, label: "Laporan Tugas" },
  ],
  tata_usaha: [
    { href: "/dashboard", icon: FileUp, label: "Unggah Data Induk" },
    { href: "/dashboard/hasil-data-olahan", icon: Database, label: "Hasil Data Olahan" },
  ],
  admin: [
    { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  ],
};


export function DashboardNav({ isMobile = false }: { isMobile?: boolean }) {
  const pathname = usePathname();
  const [userRole, setUserRole] = useState<keyof typeof navItemsByRole | null>(null);
  const [schoolInfo, setSchoolInfo] = useState({ schoolName: "SMK Student Hub", logo: "" });
  
  const loadData = useCallback(() => {
    const role = (localStorage.getItem('userRole') as keyof typeof navItemsByRole) || 'wakasek_kesiswaan';
    setUserRole(role);

    const savedTeachersData = getSourceData('teachersData', {});
    if (savedTeachersData && savedTeachersData.schoolInfo) {
        setSchoolInfo(savedTeachersData.schoolInfo);
    }
  }, []);

  useEffect(() => {
    loadData();
    window.addEventListener('dataUpdated', loadData);
    window.addEventListener('storage', loadData);

    return () => {
        window.removeEventListener('dataUpdated', loadData);
        window.removeEventListener('storage', loadData);
    };
  }, [loadData]);

  const handleLogout = () => {
    localStorage.removeItem('userRole');
    localStorage.removeItem('currentUser');
  };

  const containerClass = isMobile ? "flex flex-col h-full" : "";
  
  const renderNavItems = () => {
    let navItems = userRole ? (navItemsByRole[userRole as keyof typeof navItemsByRole] || []) : [];
    
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
