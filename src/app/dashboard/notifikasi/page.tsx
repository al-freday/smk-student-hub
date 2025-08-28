
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Bell, MessageSquareWarning, UserCog } from "lucide-react";
import { getSourceData } from "@/lib/data-manager";

interface AssignmentLog {
    id: string;
    timestamp: number;
    user: string;
    role: string;
    action: string;
}

interface Notification {
  id: string;
  title: string;
  description: string;
  time: string;
}

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
  
  const generateNotifications = () => {
      setIsLoading(true);
      const role = localStorage.getItem('userRole');
      setUserRole(role);

      // This page is now relevant for roles that can see assignment updates.
      // Primarily Wakasek Kesiswaan.
      if (role === 'wakasek_kesiswaan') {
        try {
          const assignmentLogs: AssignmentLog[] = getSourceData('assignmentLogData', []);
          
          const formattedNotifications = assignmentLogs.map(log => ({
              id: log.id,
              title: `Pembaruan Tugas ${log.role}`,
              description: `**${log.user}** ${log.action}`,
              time: formatTimeAgo(log.timestamp),
          }));

          setNotifications(formattedNotifications);
        } catch (error) {
          console.error("Gagal memuat data notifikasi:", error);
        } finally {
          setIsLoading(false);
        }
      } else {
          // Clear notifications for other roles as it's not relevant.
          setNotifications([]);
          setIsLoading(false);
      }
  };

  useEffect(() => {
    generateNotifications();
    window.addEventListener('dataUpdated', generateNotifications);
    return () => {
      window.removeEventListener('dataUpdated', generateNotifications);
    };
  }, []);
  
  const renderDescription = (description: string) => {
    const parts = description.split(/\*\*(.*?)\*\*/g).filter(Boolean);
    return parts.map((part, index) => {
        if (description.includes(`**${part}**`)) {
            return <strong key={index} className="font-semibold text-primary">{part}</strong>;
        }
        return part;
    });
  };

  return (
    <div className="flex-1 space-y-6">
       <div>
            <h2 className="text-3xl font-bold tracking-tight">Notifikasi</h2>
            <p className="text-muted-foreground">
                Lihat log aktivitas pembaruan penugasan guru.
            </p>
       </div>

      <Card>
        <CardHeader>
          <CardTitle>Aktivitas Penugasan Terbaru</CardTitle>
          <CardDescription>
            {userRole === 'wakasek_kesiswaan' 
              ? "Daftar ini menunjukkan guru yang telah memperbarui tugas mereka di Manajemen Guru."
              : "Tidak ada notifikasi yang relevan untuk peran Anda."
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-48">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="space-y-6">
              {notifications.length > 0 ? (
                notifications.map((notification) => (
                <div key={notification.id} className="flex items-start gap-4">
                  <div className="mt-1">
                    <UserCog className="h-5 w-5 text-muted-foreground"/>
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
                    <p className="mt-1 text-sm">Tidak ada pembaruan penugasan guru yang tercatat.</p>
                </div>
             )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

    