
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

const reportTypesByRole = {
  wakasek_kesiswaan: [
    { title: "Laporan Wali Kelas", href: "/dashboard/laporan/wali-kelas-wakasek", description: "Kumpulan laporan bulanan dari semua wali kelas." },
  ],
  wali_kelas: [],
  guru_bk: [],
  guru_mapel: [],
  guru_piket: [],
  guru_pendamping: [],
  siswa: [],
  orang_tua: [],
};

export default function LaporanPage() {
  const [userRole, setUserRole] = useState<keyof typeof reportTypesByRole | null>(null);
  
  useEffect(() => {
    const role = (localStorage.getItem('userRole') as keyof typeof reportTypesByRole) || null;
    setUserRole(role);
  }, []);

  const getPageTitle = () => {
    return "Laporan Penugasan Wakasek";
  };

  const getPageDescription = () => {
    if (userRole === 'wakasek_kesiswaan') return "Pantau, kelola, dan unduh semua laporan yang masuk dari para guru.";
    return "Pilih jenis laporan yang ingin Anda lihat atau buat.";
  };


  if (!userRole) {
    return (
      <div className="flex-1 space-y-6 flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const availableReports = reportTypesByRole[userRole] || [];

  return (
    <div className="flex-1 space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">{getPageTitle()}</h2>
        <p className="text-muted-foreground">{getPageDescription()}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {availableReports.length > 0 ? (
          availableReports.map((report) => (
            <Card key={report.title} className="flex flex-col">
              <CardHeader>
                <CardTitle>{report.title}</CardTitle>
                <CardDescription>{report.description}</CardDescription>
              </CardHeader>
              <CardContent className="mt-auto">
                <Link href={report.href} passHref>
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
