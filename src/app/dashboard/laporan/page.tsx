
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Download, FileCheck2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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

interface ReportCounts {
  wali_kelas: number;
}

export default function LaporanPage() {
  const { toast } = useToast();
  const [userRole, setUserRole] = useState<keyof typeof reportTypesByRole | null>(null);
  const [reportCounts, setReportCounts] = useState<ReportCounts>({
    wali_kelas: 0,
  });

  useEffect(() => {
    const role = (localStorage.getItem('userRole') as keyof typeof reportTypesByRole) || null;
    setUserRole(role);

    if (role === 'wakasek_kesiswaan') {
      try {
        const savedData = localStorage.getItem('teachersData');
        const teachersData = savedData ? JSON.parse(savedData) : {};

        setReportCounts({
            wali_kelas: teachersData.wali_kelas?.length || 0,
        });
      } catch (error) {
        console.error("Gagal memuat data rekapitulasi:", error);
      }
    }
  }, []);

  const handleDownloadRekap = () => {
    toast({
      title: "Rekapitulasi Diunduh",
      description: "File rekapitulasi semua laporan sedang disiapkan.",
    });
  };
  
  const getPageTitle = () => {
    return "Pusat Laporan";
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

      {userRole === 'wakasek_kesiswaan' && (
        <Card className="bg-secondary/50 border-primary/20">
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <span>Rekapitulasi Laporan Masuk</span>
                     <Button onClick={handleDownloadRekap}>
                        <Download className="mr-2 h-4 w-4" />
                        Unduh Rekapitulasi
                    </Button>
                </CardTitle>
                <CardDescription>Ringkasan jumlah laporan yang telah dikirim oleh setiap peran guru.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-3 lg:grid-cols-5 text-center">
                <div className="p-4 bg-background rounded-lg shadow-sm">
                    <FileCheck2 className="mx-auto h-8 w-8 text-primary mb-2" />
                    <p className="text-2xl font-bold">{reportCounts.wali_kelas}</p>
                    <p className="text-sm text-muted-foreground">Laporan Wali Kelas</p>
                </div>
            </CardContent>
        </Card>
      )}

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
