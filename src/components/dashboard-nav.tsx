
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
  ClipboardCheck,
  HeartHandshake,
  UsersRound,
  Presentation,
  AreaChart,
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
  waliKelas: [], // Akan menggunakan struktur custom di bawah
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

const WaliKelasNav = ({pathname}: {pathname: string}) => (
  <SidebarMenu>
    <SidebarMenuItem>
      <Link href="/dashboard">
        <SidebarMenuButton tooltip="Dashboard" isActive={pathname === "/dashboard"}>
          <LayoutDashboard />
          <span className="group-data-[collapsible=icon]:hidden">Dashboard</span>
        </SidebarMenuButton>
      </Link>
    </SidebarMenuItem>

    <SidebarGroup>
      <SidebarGroupLabel>Menu Wali Kelas</SidebarGroupLabel>
      <SidebarMenuItem>
        <SidebarMenuButton tooltip="Administrasi" isActive={pathname.startsWith('/dashboard/laporan/wali-kelas')}>
          <BookUser />
          <span className="group-data-[collapsible=icon]:hidden">Administrasi & Perencanaan</span>
        </SidebarMenuButton>
        <SidebarMenuSub>
          <SidebarMenuSubItem>
            <Link href="/dashboard/laporan/wali-kelas"><SidebarMenuSubButton isActive={pathname.startsWith('/dashboard/laporan/wali-kelas')}>Administrasi Kelas</SidebarMenuSubButton></Link>
          </SidebarMenuSubItem>
        </SidebarMenuSub>
      </SidebarMenuItem>
      
      <SidebarMenuItem>
        <SidebarMenuButton tooltip="Disiplin" isActive={pathname.startsWith('/dashboard/tata-tertib')}>
          <ShieldAlert />
          <span className="group-data-[collapsible=icon]:hidden">Pembinaan Disiplin</span>
        </SidebarMenuButton>
         <SidebarMenuSub>
          <SidebarMenuSubItem>
            <Link href="/dashboard/tata-tertib"><SidebarMenuSubButton isActive={pathname.startsWith('/dashboard/tata-tertib')}>Catat Pelanggaran & Prestasi</SidebarMenuSubButton></Link>
          </SidebarMenuSubItem>
        </SidebarMenuSub>
      </SidebarMenuItem>

       <SidebarMenuItem>
        <SidebarMenuButton tooltip="Pembinaan Karakter">
          <HeartHandshake />
          <span className="group-data-[collapsible=icon]:hidden">Pembinaan Karakter</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
      
      <SidebarMenuItem>
        <SidebarMenuButton tooltip="Kesejahteraan Siswa">
          <Users />
          <span className="group-data-[collapsible=icon]:hidden">Kesejahteraan Siswa</span>
        </SidebarMenuButton>
      </SidebarMenuItem>

      <SidebarMenuItem>
        <SidebarMenuButton tooltip="Hubungan Ortu">
          <UsersRound />
          <span className="group-data-[collapsible=icon]:hidden">Hubungan Orang Tua</span>
        </SidebarMenuButton>
      </SidebarMenuItem>

      <SidebarMenuItem>
        <SidebarMenuButton tooltip="Pengawasan">
          <Presentation />
          <span className="group-data-[collapsible=icon]:hidden">Pengawasan & Evaluasi</span>
        </SidebarMenuButton>
      </SidebarMenuItem>

       <SidebarMenuItem>
        <SidebarMenuButton tooltip="Koordinasi">
          <ClipboardCheck />
          <span className="group-data-[collapsible=icon]:hidden">Koordinasi Internal</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
      
      <SidebarMenuItem>
        <SidebarMenuButton tooltip="Laporan" isActive={pathname.startsWith('/dashboard/laporan')}>
          <AreaChart />
          <span className="group-data-[collapsible=icon]:hidden">Laporan Program Kelas</span>
        </SidebarMenuButton>
         <SidebarMenuSub>
          <SidebarMenuSubItem>
            <Link href="/dashboard/laporan/wali-kelas"><SidebarMenuSubButton isActive={pathname.startsWith('/dashboard/laporan/wali-kelas')}>Kirim Laporan Bulanan</SidebarMenuSubButton></Link>
          </SidebarMenuSubItem>
        </SidebarMenuSub>
      </SidebarMenuItem>
    </SidebarGroup>
  </SidebarMenu>
);


export function DashboardNav({ isMobile = false }: { isMobile?: boolean }) {
  const pathname = usePathname();
  const [userRole, setUserRole] = useState<keyof typeof navItemsByRole>('wakasek');
  const [schoolInfo, setSchoolInfo] = useState({ name: "SMKN 2 Tana Toraja", logo: "" });
  
  useEffect(() => {
    const role = (localStorage.getItem('userRole') as keyof typeof navItemsByRole) || 'wakasek';
    setUserRole(role);

    const savedSchoolInfo = localStorage.getItem("schoolInfo");
    if (savedSchoolInfo) {
      const info = JSON.parse(savedSchoolInfo);
      setSchoolInfo({ name: info.schoolName, logo: info.logo });
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('userRole');
  };

  const navItems = navItemsByRole[userRole] || [];
  const containerClass = isMobile ? "flex flex-col h-full" : "";

  if (userRole === 'admin' && !isMobile) {
    return null; // Jangan render apapun untuk admin di sidebar utama
  }
  
  const renderNavItems = () => {
    if (userRole === 'waliKelas') {
      return <WaliKelasNav pathname={pathname} />;
    }

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
