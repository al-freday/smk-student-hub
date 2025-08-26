
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Siren, Award, UserX, UserCheck, Bell, MessageSquareWarning } from "lucide-react";
import { getSourceData } from "@/lib/data-manager";
import { Badge } from "@/components/ui/badge";

type NotificationType = 'PELANGGARAN' | 'PRESTASI' | 'ABSENSI_SISWA' | 'ABSENSI_GURU';

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  timestamp: number;
  time: string;
}

const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
        case 'PELANGGARAN': return <Siren className="h-5 w-5 text-destructive" />;
        case 'PRESTASI': return <Award className="h-5 w-5 text-blue-500" />;
        case 'ABSENSI_SISWA': return <UserX className="h-5 w-5 text-orange-500" />;
        case 'ABSENSI_GURU': return <UserCheck className="h-5 w-5 text-teal-500" />;
        default: return <Bell className="h-5 w-5 text-muted-foreground" />;
    }
};

const formatTimeAgo = (timestamp: number) => {
    const now = new Date().getTime();
    const seconds = Math.floor((now - timestamp) / 1000);

    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " tahun lalu";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " bulan lalu";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " hari lalu";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " jam lalu";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " menit lalu";
    return "Baru saja";
};


export default function NotifikasiPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const role = localStorage.getItem('userRole');
    setUserRole(role);

    if (role === 'wakasek_kesiswaan') {
      try {
        const allNotifications: Notification[] = [];
        const now = new Date().getTime();

        // 1. Get Infractions and Achievements
        const riwayatCatatan = getSourceData('riwayatCatatan', []);
        riwayatCatatan.forEach((item: any, index: number) => {
            const timestamp = new Date(item.tanggal).getTime() + (riwayatCatatan.length - index) * 1000;
            allNotifications.push({
                id: `catatan-${item.id}`,
                type: item.tipe === 'pelanggaran' ? 'PELANGGARAN' : 'PRESTASI',
                title: item.tipe === 'pelanggaran' ? 'Pelanggaran Siswa' : 'Prestasi Siswa',
                description: `Siswa **${item.siswa} (${item.kelas})** tercatat ${item.tipe === 'pelanggaran' ? 'melakukan pelanggaran' : 'meraih prestasi'}: *${item.deskripsi}*.`,
                timestamp: timestamp,
                time: formatTimeAgo(timestamp),
            });
        });

        // 2. Get Student Absences (only non-hadir)
        const kehadiranSiswa = getSourceData('kehadiranSiswa', []);
        kehadiranSiswa.forEach((item: any, index: number) => {
            if (item.status !== 'Hadir') {
                const timestamp = new Date(item.tanggal).getTime() + (kehadiranSiswa.length - index) * 1000;
                allNotifications.push({
                    id: `absen-siswa-${item.id}`,
                    type: 'ABSENSI_SISWA',
                    title: `Absensi Siswa (${item.status})`,
                    description: `Siswa **${item.nama} (${item.kelas})** tercatat **${item.status}** pada tanggal ${item.tanggal}.`,
                    timestamp: timestamp,
                    time: formatTimeAgo(timestamp),
                });
            }
        });

        // 3. Get Teacher Absences (only non-hadir)
        const teacherAttendance = getSourceData('teacherAttendanceData', []);
        teacherAttendance.forEach((item: any, index: number) => {
             if (item.status !== 'Hadir') {
                const timestamp = new Date(item.tanggal).getTime() + (teacherAttendance.length - index) * 1000;
                allNotifications.push({
                    id: `absen-guru-${item.id}`,
                    type: 'ABSENSI_GURU',
                    title: `Kehadiran Guru (${item.status})`,
                    description: `Guru **${item.namaGuru}** tercatat **${item.status}**. Keterangan: *${item.keterangan}*.`,
                    timestamp: timestamp,
                    time: formatTimeAgo(timestamp),
                });
             }
        });
        
        // Sort all notifications by timestamp descending
        allNotifications.sort((a, b) => b.timestamp - a.timestamp);
        
        setNotifications(allNotifications);

      } catch (error) {
        console.error("Gagal memuat data notifikasi:", error);
      } finally {
        setIsLoading(false);
      }
    } else {
        // Fallback for other roles
        setNotifications([]);
        setIsLoading(false);
    }
  }, []);
  
  const renderDescription = (description: string) => {
    const parts = description.split(/\*\*(.*?)\*\*|\*(.*?)\*/g).filter(Boolean);
    return parts.map((part, index) => {
        if (description.includes(`**${part}**`)) {
            return <strong key={index} className="font-semibold text-primary">{part}</strong>;
        }
        if (description.includes(`*${part}*`)) {
            return <em key={index} className="italic">{part}</em>;
        }
        return part;
    });
  };

  return (
    <div className="flex-1 space-y-6">
       <div>
            <h2 className="text-3xl font-bold tracking-tight">Notifikasi</h2>
            <p className="text-muted-foreground">
                Lihat semua pembaruan penting terkait aktivitas kesiswaan.
            </p>
       </div>

      <Card>
        <CardHeader>
          <CardTitle>Aktivitas Terbaru</CardTitle>
          <CardDescription>
            {userRole === 'wakasek_kesiswaan' 
              ? "Rekapitulasi otomatis dari pelanggaran, prestasi, dan absensi."
              : "Tidak ada notifikasi untuk peran Anda."
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-48">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <p className="ml-4 text-muted-foreground">Memuat notifikasi...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {notifications.length > 0 ? (
                notifications.map((notification) => (
                <div key={notification.id} className="flex items-start gap-4">
                  <div className="mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="grid gap-1 flex-1">
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-medium leading-none">
                            {notification.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                            {notification.time}
                        </p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                       {renderDescription(notification.description)}
                    </p>
                  </div>
                </div>
              ))
             ) : (
                <div className="text-center text-muted-foreground py-10">
                    <MessageSquareWarning className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-semibold">Belum Ada Aktivitas</h3>
                    <p className="mt-1 text-sm">Tidak ada notifikasi baru untuk ditampilkan saat ini.</p>
                </div>
             )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
