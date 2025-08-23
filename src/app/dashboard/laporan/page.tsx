
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useEffect, useState } from "react";

const reportTypesByRole = {
  wakasek: [
    { title: "Laporan Guru Pendamping", href: "/dashboard/laporan/guru-pendamping", description: "Rekapitulasi catatan pendampingan siswa." },
    { title: "Laporan Guru Mapel", href: "/dashboard/laporan/guru-mapel", description: "Catatan perkembangan akademik per mata pelajaran." },
    { title: "Laporan Guru Piket", href: "/dashboard/laporan/guru-piket", description: "Laporan harian dari guru yang bertugas piket." },
    { title: "Laporan Wali Kelas (Diterima)", href: "/dashboard/laporan/wali-kelas-wakasek", description: "Kumpulan laporan bulanan dari semua wali kelas." },
    { title: "Laporan Guru BK", href: "/dashboard/laporan/guru-bk", description: "Rekapitulasi sesi bimbingan dan konseling." },
  ],
  waliKelas: [
    { title: "Laporan Wali Kelas", href: "/dashboard/laporan/wali-kelas", description: "Buat dan kelola laporan lengkap untuk kelas Anda." },
  ],
  guruBk: [
    { title: "Laporan Guru BK", href: "/dashboard/laporan/guru-bk", description: "Catat dan lihat rekapitulasi sesi konseling." },
  ],
  guruMapel: [
    { title: "Laporan Guru Mapel", href: "/dashboard/laporan/guru-mapel", description: "Buat laporan perkembangan akademik siswa." },
  ],
  guruPiket: [
    { title: "Laporan Guru Piket", href: "/dashboard/laporan/guru-piket", description: "Isi laporan harian selama jam piket Anda." },
  ],
  guruPendamping: [
    { title: "Laporan Guru Pendamping", href: "/dashboard/laporan/guru-pendamping", description: "Buat catatan hasil pendampingan siswa." },
  ],
  // Peran siswa dan orang tua belum memiliki laporan
  siswa: [],
  orang_tua: [],
};


export default function LaporanPage() {
  const [userRole, setUserRole] = useState<keyof typeof reportTypesByRole | null>(null);

  useEffect(() => {
    // Ambil peran dari localStorage saat komponen dimuat di client-side
    // Default ke 'wakasek' jika tidak ada peran yang tersimpan
    const role = (localStorage.getItem('userRole') as keyof typeof reportTypesByRole) || 'wakasek';
    setUserRole(role);
  }, []);

  if (!userRole) {
    // Tampilkan loading state jika peran belum ter-load
    return (
        <div className="flex-1 space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Memuat Laporan...</h2>
                <p className="text-muted-foreground">
                    Menyesuaikan laporan berdasarkan peran Anda.
                </p>
            </div>
             <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card><CardHeader><div className="h-6 w-3/4 bg-muted rounded"></div></CardHeader><CardContent><div className="h-4 w-full bg-muted rounded mb-4"></div><div className="h-10 w-full bg-muted rounded"></div></CardContent></Card>
                <Card><CardHeader><div className="h-6 w-3/4 bg-muted rounded"></div></CardHeader><CardContent><div className="h-4 w-full bg-muted rounded mb-4"></div><div className="h-10 w-full bg-muted rounded"></div></CardContent></Card>
                <Card><CardHeader><div className="h-6 w-3/4 bg-muted rounded"></div></CardHeader><CardContent><div className="h-4 w-full bg-muted rounded mb-4"></div><div className="h-10 w-full bg-muted rounded"></div></CardContent></Card>
            </div>
        </div>
    );
  }

  const reportTypes = reportTypesByRole[userRole] || [];

  return (
    <div className="flex-1 space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Pusat Laporan</h2>
        <p className="text-muted-foreground">
          Pilih jenis laporan yang ingin Anda lihat atau buat. Tampilan ini disesuaikan berdasarkan peran Anda.
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {reportTypes.length > 0 ? (
          reportTypes.map((report) => (
            <Card key={report.title} className="flex flex-col">
              <CardHeader>
                <CardTitle>{report.title}</CardTitle>
                <CardDescription>{report.description}</CardDescription>
              </CardHeader>
              <CardContent className="mt-auto">
                <Link href={report.href} passHref>
                  <Button className="w-full">
                    Buka Laporan
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))
        ) : (
             <Card className="md:col-span-2 lg:col-span-3">
                <CardHeader>
                    <CardTitle>Tidak Ada Laporan Tersedia</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">Tidak ada jenis laporan yang tersedia untuk peran Anda saat ini.</p>
                </CardContent>
            </Card>
        )}
      </div>
    </div>
  );
}
