
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2 } from "lucide-react";

interface User {
  id: number;
  nama: string;
  role: string;
}

interface Notification {
  id: number;
  user: string;
  role: string;
  time: string;
  avatarFallback: string;
}

const getRoleDisplayName = (roleKey: string) => {
    const roles: { [key: string]: string } = {
        waliKelas: 'Wali Kelas',
        guruBk: 'Guru BK',
        guruMapel: 'Guru Mapel',
        guruPiket: 'Guru Piket',
        guruPendamping: 'Guru Pendamping',
    };
    return roles[roleKey] || 'Guru';
};

const getAvatarFallbackFromName = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
};

export default function NotifikasiPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const role = localStorage.getItem('userRole');
    setUserRole(role);

    if (role === 'wakasek') {
      try {
        const savedTeachers = localStorage.getItem('teachersData');
        if (savedTeachers) {
          const teachersData = JSON.parse(savedTeachers);
          const allUsers: User[] = [];

          Object.keys(teachersData).forEach(roleKey => {
            teachersData[roleKey].forEach((guru: any) => {
              allUsers.push({
                id: guru.id + roleKey,
                nama: guru.nama,
                role: getRoleDisplayName(roleKey),
              });
            });
          });
          
          const generatedNotifications = allUsers.map((user, index) => ({
            id: user.id,
            user: user.nama,
            role: user.role,
            time: `${index + 2} menit yang lalu`,
            avatarFallback: getAvatarFallbackFromName(user.nama),
          }));
          
          setNotifications(generatedNotifications);
        }
      } catch (error) {
        console.error("Gagal memuat data notifikasi:", error);
      } finally {
        setIsLoading(false);
      }
    } else {
        // Tampilan default untuk peran selain wakasek
        setNotifications([
            { id: 1, user: "Admin", role: "Wakasek", time: "5 menit yang lalu", avatarFallback: "WK" },
            { id: 2, user: "Rekan Guru", role: "Guru", time: "10 menit yang lalu", avatarFallback: "RG" },
        ]);
        setIsLoading(false);
    }
  }, []);

  return (
    <div className="flex-1 space-y-6">
       <div>
            <h2 className="text-3xl font-bold tracking-tight">Notifikasi</h2>
            <p className="text-muted-foreground">
                Lihat semua pemberitahuan dan pembaruan penting.
            </p>
       </div>

      <Card>
        <CardHeader>
          <CardTitle>Pemberitahuan Terbaru</CardTitle>
          <CardDescription>
            {userRole === 'wakasek' 
              ? "Aktivitas login terbaru dari semua pengguna terdaftar."
              : "Aktivitas terbaru di sistem."
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
            <div className="space-y-4">
              {notifications.length > 0 ? (
                notifications.map((notification) => (
                <div key={notification.id} className="flex items-center gap-4">
                  <Avatar className="h-9 w-9">
                     <AvatarFallback>{notification.avatarFallback}</AvatarFallback>
                  </Avatar>
                  <div className="grid gap-1">
                    <p className="text-sm font-medium leading-none">
                      <span className="font-semibold">{notification.user}</span> ({notification.role}) baru saja login.
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {notification.time}
                    </p>
                  </div>
                </div>
              ))
             ) : (
                <div className="text-center text-sm text-muted-foreground py-10">
                    <p>Belum ada pengguna terdaftar di Manajemen Guru.</p>
                    <p>Tidak ada notifikasi untuk ditampilkan.</p>
                </div>
             )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
