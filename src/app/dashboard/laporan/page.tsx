
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
  const [userRole, setUserRole] = useState<keyof typeof reportTypesByRole>('wakasek');

  useEffect(() => {
    const role = (localStorage.getItem('userRole') as keyof typeof reportTypesByRole) || 'wakasek';
    setUserRole(role);
  }, []);

  const reportTypes = reportTypesByRole[userRole] || [];

  return (
    <div className="flex-1 space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Pusat Laporan</h2>
        <p className="text-muted-foreground">
          Pilih jenis laporan yang ingin Anda lihat atau cetak.
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {reportTypes.map((report) => (
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
        ))}
      </div>
    </div>
  );
}

    