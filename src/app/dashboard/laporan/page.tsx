
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useEffect, useState } from "react";

const reportTypesByRole = {
  wakasek: [
    { title: "Laporan Guru Pendamping", href: "/dashboard/laporan/guru-pendamping" },
    { title: "Laporan Guru Mapel", href: "/dashboard/laporan/guru-mapel" },
    { title: "Laporan Guru Piket", href: "/dashboard/laporan/guru-piket" },
    { title: "Laporan Wali Kelas", href: "/dashboard/laporan/wali-kelas-wakasek" },
    { title: "Laporan Guru BK", href: "/dashboard/laporan/guru-bk" },
  ],
  waliKelas: [
    { title: "Laporan Wali Kelas", href: "/dashboard/laporan/wali-kelas" },
  ],
  guruBk: [
    { title: "Laporan Guru BK", href: "/dashboard/laporan/guru-bk" },
  ],
  guruMapel: [
    { title: "Laporan Guru Mapel", href: "/dashboard/laporan/guru-mapel" },
  ],
  guruPiket: [
    { title: "Laporan Guru Piket", href: "/dashboard/laporan/guru-piket" },
  ],
  guruPendamping: [
    { title: "Laporan Guru Pendamping", href: "/dashboard/laporan/guru-pendamping" },
  ],
};


export default function LaporanPage() {
  const [userRole, setUserRole] = useState<keyof typeof reportTypesByRole | null>(null);

  useEffect(() => {
    // Ambil peran dari localStorage saat komponen dimuat di client-side
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
                <Card><CardHeader><div className="h-6 w-3/4 bg-muted rounded"></div></CardHeader><CardContent><div className="h-10 w-full bg-muted rounded"></div></CardContent></Card>
                <Card><CardHeader><div className="h-6 w-3/4 bg-muted rounded"></div></CardHeader><CardContent><div className="h-10 w-full bg-muted rounded"></div></CardContent></Card>
                <Card><CardHeader><div className="h-6 w-3/4 bg-muted rounded"></div></CardHeader><CardContent><div className="h-10 w-full bg-muted rounded"></div></CardContent></Card>
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
            <Card key={report.title}>
              <CardHeader>
                <CardTitle>{report.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <Link href={report.href}>
                  <Button className="w-full">
                    Lihat Laporan
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))
        ) : (
             <Card className="md:col-span-2 lg:col-span-3">
                <CardHeader>
                    <CardTitle>Tidak Ada Laporan</CardTitle>
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
