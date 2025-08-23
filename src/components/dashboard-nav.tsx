"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  BookUser,
  CalendarClock,
  ClipboardCheck,
  FileText,
  GanttChartSquare,
  LayoutDashboard,
  LogOut,
  Settings,
  ShieldAlert,
  Users,
  School,
  UserPlus,
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

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/dashboard/manajemen-kelas", icon: School, label: "Manajemen Kelas" },
  { href: "/dashboard/manajemen-siswa", icon: UserPlus, label: "Manajemen Siswa" },
  { href: "/dashboard/jadwal-pelajaran", icon: CalendarClock, label: "Jadwal Pelajaran" },
  { href: "/dashboard/kinerja-guru", icon: BookUser, label: "Kinerja Guru" },
  { href: "/dashboard/kinerja-siswa", icon: Users, label: "Kinerja Siswa" },
  { href: "/dashboard/tata-tertib", icon: ShieldAlert, label: "Tata Tertib" },
  { href: "/dashboard/laporan", icon: FileText, label: "Laporan" },
  { href: "/dashboard/supervisi", icon: GanttChartSquare, label: "Supervisi" },
  { href: "/dashboard/notifikasi", icon: Bell, label: "Notifikasi" },
];

export function DashboardNav({ isMobile = false }: { isMobile?: boolean }) {
  const pathname = usePathname();
  const containerClass = isMobile ? "flex flex-col h-full" : "";

  return (
    <div className={containerClass}>
      <SidebarHeader className="hidden md:flex">
         <Link href="/dashboard" className="flex items-center gap-2">
           <Icons.logo className="h-7 w-7 text-primary"/>
           <span className="text-lg font-semibold whitespace-nowrap group-data-[collapsible=icon]:hidden">
            SMK Student Hub
           </span>
         </Link>
      </SidebarHeader>

      <SidebarContent className="p-2 flex-1">
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.label}>
              <SidebarMenuButton asChild tooltip={item.label} isActive={pathname === item.href}>
                <Link href={item.href}>
                  <item.icon className="size-4" />
                  <span className="group-data-[collapsible=icon]:hidden">
                    {item.label}
                  </span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="p-2">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Pengaturan">
                <Link href="/dashboard/pengaturan">
                  <Settings className="size-4" />
                  <span className="group-data-[collapsible=icon]:hidden">Pengaturan</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <Separator className="my-1"/>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Logout">
                <Link href="/">
                  <LogOut className="size-4" />
                  <span className="group-data-[collapsible=icon]:hidden">Logout</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
      </SidebarFooter>
    </div>
  );
}
