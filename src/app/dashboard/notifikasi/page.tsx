
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Notification {
  id: number;
  user: string;
  role: string;
  time: string;
  avatarFallback: string;
}

const notifications: Notification[] = [
  { id: 1, user: "Siti Aminah, S.Pd.", role: "Guru Mapel", time: "2 menit yang lalu", avatarFallback: "SA" },
  { id: 2, user: "Admin", role: "Wakasek", time: "5 menit yang lalu", avatarFallback: "WK" },
  { id: 3, user: "Budi Santoso (Orang Tua)", role: "Orang Tua", time: "10 menit yang lalu", avatarFallback: "BS" },
  { id: 4, user: "Ahmad Budi", role: "Siswa", time: "11 menit yang lalu", avatarFallback: "AB" },
  { id: 5, user: "Joko Susilo, S.Pd.", role: "Guru BK", time: "20 menit yang lalu", avatarFallback: "JS" },
];

export default function NotifikasiPage() {
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
            Aktivitas login terbaru dari semua pengguna.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {notifications.map((notification) => (
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
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
