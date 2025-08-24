
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
  BookOpenCheck,
  MessageSquareHeart,
  UserRoundCog,
  Handshake,
  Newspaper,
  BookCopy,
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
  guru_bk: [
    { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/dashboard/laporan/guru-bk", icon: FileText, label: "Laporan & Konseling" },
    { href: "/dashboard/tata-tertib", icon: ShieldAlert, label: "Data Pelanggaran" },
    { href: "/dashboard/manajemen-siswa", icon: Users, label: "Data Siswa" },
  ],
  guru_mapel: [
    { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/dashboard/laporan/guru-mapel", icon: FileText, label: "Laporan Mapel" },
    { href: "/dashboard/jadwal-pelajaran", icon: CalendarClock, label: "Jadwal Mengajar" },
    { href: "/dashboard/tata-tertib", icon: ShieldAlert, label: "Tata Tertib" },
  ],
  guru_pendamping: [
    { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/dashboard/laporan/guru-pendamping", icon: Handshake, label: "Laporan Pendampingan" },
    { href: "/dashboard/tata-tertib", icon: ShieldAlert, label: "Tata Tertib" },
  ],
  guru_piket: [
    { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/dashboard/laporan/guru-piket", icon: Newspaper, label: "Laporan Piket" },
    { href: "/dashboard/tata-tertib", icon: ShieldAlert, label: "Tata Tertib" },
  ]
};

const WaliKelasNav = ({pathname}: {pathname: string}) => (
  <SidebarMenu>
    <SidebarMenuItem>
      <Link href="/dashboard"><SidebarMenuButton tooltip="Dashboard" isActive={pathname === "/dashboard"}><LayoutDashboard /><span>Dashboard</span></SidebarMenuButton></Link>
    </SidebarMenuItem>
    <SidebarGroup>
        <SidebarGroupLabel>Tugas Wali Kelas</SidebarGroupLabel>
        <SidebarMenuItem>
            <Link href="/dashboard/laporan/wali-kelas"><SidebarMenuButton tooltip="Administrasi Kelas" isActive={pathname.startsWith('/dashboard/laporan/wali-kelas')}><BookUser /><span>Administrasi Kelas</span></SidebarMenuButton></Link>
        </SidebarMenuItem>
        <SidebarMenuItem>
            <Link href="/dashboard/tata-tertib"><SidebarMenuButton tooltip="Pembinaan Disiplin" isActive={pathname.startsWith('/dashboard/tata-tertib')}><ShieldAlert /><span>Pembinaan Disiplin</span></SidebarMenuButton></Link>
        </SidebarMenuItem>
        <SidebarMenuItem>
            <SidebarMenuButton tooltip="Pembinaan Karakter"><HeartHandshake /><span>Pembinaan Karakter</span></SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
            <SidebarMenuButton tooltip="Kesejahteraan Siswa"><Users /><span>Kesejahteraan Siswa</span></SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
            <SidebarMenuButton tooltip="Hubungan Orang Tua"><UsersRound /><span>Hubungan Orang Tua</span></SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
            <SidebarMenuButton tooltip="Pengawasan & Evaluasi"><Presentation /><span>Pengawasan & Evaluasi</span></SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
            <SidebarMenuButton tooltip="Koordinasi Internal"><ClipboardCheck /><span>Koordinasi Internal</span></SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
            <Link href="/dashboard/laporan/wali-kelas"><SidebarMenuButton tooltip="Laporan Kelas"><AreaChart /><span>Laporan Kelas</span></SidebarMenuButton></Link>
        </SidebarMenuItem>
    </SidebarGroup>
  </SidebarMenu>
);

export function DashboardNav({ isMobile = false }: { isMobile?: boolean }) {
  const pathname = usePathname();
  const [userRole, setUserRole] = useState<keyof typeof navItemsByRole | 'wali_kelas' | null>(null);
  const [schoolInfo, setSchoolInfo] = useState({ name: "SMK Student Hub", logo: "" });
  
  useEffect(() => {
    const role = (localStorage.getItem('userRole') as keyof typeof navItemsByRole | 'wali_kelas') || null;
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

    if (userRole === 'wali_kelas') {
      return <WaliKelasNav pathname={pathname} />;
    }

    const navItems = navItemsByRole[userRole as keyof typeof navItemsByRole] || [];

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
