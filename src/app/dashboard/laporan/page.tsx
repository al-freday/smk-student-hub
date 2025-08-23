
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Download, FileCheck2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
  siswa: [],
  orang_tua: [],
};

interface ReportCounts {
  waliKelas: number;
  guruMapel: number;
  guruPendamping: number;
  guruPiket: number;
  guruBk: number;
}

export default function LaporanPage() {
  const { toast } = useToast();
  const [userRole, setUserRole] = useState<keyof typeof reportTypesByRole | null>(null);
  const [reportCounts, setReportCounts] = useState<ReportCounts>({
    waliKelas: 0,
    guruMapel: 0,
    guruPendamping: 0,
    guruPiket: 0,
    guruBk: 0,
  });

  useEffect(() => {
    const role = (localStorage.getItem('userRole') as keyof typeof reportTypesByRole) || 'wakasek';
    setUserRole(role);

    if (role === 'wakasek') {
      try {
        const savedTeachers = localStorage.getItem('teachersData');
        if (savedTeachers) {
          const teachersData = JSON.parse(savedTeachers);
          setReportCounts({
            waliKelas: teachersData.waliKelas?.length || 0,
            guruMapel: teachersData.guruMapel?.length || 0,
            guruPendamping: teachersData.guruPendamping?.length || 0,
            guruPiket: teachersData.guruPiket?.length || 0,
            guruBk: teachersData.guruBk?.length || 0,
          });
        }
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
  
  if (!userRole) {
    return (
      <div className="flex-1 space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Memuat Laporan...</h2>
          <p className="text-muted-foreground">Menyesuaikan laporan berdasarkan peran Anda.</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader><div className="h-6 w-3/4 bg-muted rounded"></div></CardHeader>
              <CardContent><div className="h-4 w-full bg-muted rounded mb-4"></div><div className="h-10 w-full bg-muted rounded"></div></CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const availableReports = reportTypesByRole[userRole] || [];

  return (
    <div className="flex-1 space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Pusat Laporan</h2>
        <p className="text-muted-foreground">
          {userRole === 'wakasek' 
            ? "Pantau, kelola, dan unduh semua laporan yang masuk dari para guru."
            : "Pilih jenis laporan yang ingin Anda lihat atau buat."
          }
        </p>
      </div>

      {userRole === 'wakasek' && (
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
                    <p className="text-2xl font-bold">{reportCounts.waliKelas}</p>
                    <p className="text-sm text-muted-foreground">Laporan Wali Kelas</p>
                </div>
                 <div className="p-4 bg-background rounded-lg shadow-sm">
                    <FileCheck2 className="mx-auto h-8 w-8 text-primary mb-2" />
                    <p className="text-2xl font-bold">{reportCounts.guruMapel}</p>
                    <p className="text-sm text-muted-foreground">Laporan Guru Mapel</p>
                </div>
                 <div className="p-4 bg-background rounded-lg shadow-sm">
                    <FileCheck2 className="mx-auto h-8 w-8 text-primary mb-2" />
                    <p className="text-2xl font-bold">{reportCounts.guruPendamping}</p>
                    <p className="text-sm text-muted-foreground">Laporan Pendamping</p>
                </div>
                 <div className="p-4 bg-background rounded-lg shadow-sm">
                    <FileCheck2 className="mx-auto h-8 w-8 text-primary mb-2" />
                    <p className="text-2xl font-bold">{reportCounts.guruPiket}</p>
                    <p className="text-sm text-muted-foreground">Laporan Guru Piket</p>
                </div>
                 <div className="p-4 bg-background rounded-lg shadow-sm">
                    <FileCheck2 className="mx-auto h-8 w-8 text-primary mb-2" />
                    <p className="text-2xl font-bold">{reportCounts.guruBk}</p>
                    <p className="text-sm text-muted-foreground">Laporan Guru BK</p>
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
                    {userRole === 'wakasek' ? 'Lihat Laporan' : 'Buka Laporan'}
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
