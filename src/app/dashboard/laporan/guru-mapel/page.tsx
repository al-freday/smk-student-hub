
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Printer, Eye, Loader2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";

interface GuruMapel {
  id: number;
  nama: string;
  mapel?: string;
}

interface ReceivedReport {
  id: number;
  guru: string;
  mapel: string;
  tanggal: string;
  catatan: string;
}

export default function LaporanGuruMapelPage() {
  const [receivedReports, setReceivedReports] = useState<ReceivedReport[]>([]);
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
            const guruMapelList: GuruMapel[] = teachersData.guruMapel || [];

            const reports = guruMapelList.map((guru, index) => ({
              id: guru.id,
              guru: guru.nama,
              mapel: guru.mapel || `Mapel ${index + 1}`,
              tanggal: format(new Date(new Date().setDate(new Date().getDate() - index)), "yyyy-MM-dd"),
              catatan: `Laporan rutin untuk mata pelajaran ${guru.mapel || `Mapel ${index + 1}`}.`,
            }));
            setReceivedReports(reports);
          }
        } catch (error) {
          console.error("Gagal memuat data guru mapel:", error);
        } finally {
          setIsLoading(false);
        }
    } else {
        // Data default untuk tampilan non-wakasek (tampilan asli)
         setReceivedReports([
            { id: 1, tanggal: "2024-07-22", mapel: "Matematika", guru: "Nama Guru Mapel", catatan: "Sebagian besar siswa sudah memahami materi aljabar." },
            { id: 2, tanggal: "2024-07-22", mapel: "Bahasa Inggris", guru: "Nama Guru Mapel", catatan: "Perlu latihan conversation lebih intensif." },
        ]);
        setIsLoading(false);
    }
  }, []);

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
      return (
         <div className="flex-1 space-y-6">
             <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <p className="ml-4 text-muted-foreground">Memuat data laporan...</p>
            </div>
         </div>
      );
  }

  const isWakasekView = userRole === 'wakasek';

  return (
    <div className="flex-1 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            {isWakasekView ? "Laporan Guru Mapel (Diterima)" : "Laporan Guru Mata Pelajaran"}
          </h2>
          <p className="text-muted-foreground">
            {isWakasekView 
                ? "Rekapitulasi laporan yang diterima dari semua guru mata pelajaran."
                : "Rekapitulasi laporan dari guru mata pelajaran."
            }
          </p>
        </div>
        <Button onClick={handlePrint}>
          <Printer className="mr-2 h-4 w-4" />
          Cetak Laporan
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Detail Laporan</CardTitle>
          <CardDescription>
            {isWakasekView
                ? "Berikut adalah daftar laporan yang telah diterima."
                : "Berikut adalah catatan perkembangan akademik siswa per mata pelajaran."
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tanggal</TableHead>
                {isWakasekView && <TableHead>Nama Guru</TableHead>}
                <TableHead>Mata Pelajaran</TableHead>
                <TableHead>Catatan</TableHead>
                {isWakasekView && <TableHead className="text-right">Aksi</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {receivedReports.length > 0 ? (
                 receivedReports.map((laporan) => (
                    <TableRow key={laporan.id}>
                      <TableCell>{laporan.tanggal}</TableCell>
                      {isWakasekView && <TableCell className="font-medium">{laporan.guru}</TableCell>}
                      <TableCell>{laporan.mapel}</TableCell>
                      <TableCell>{laporan.catatan}</TableCell>
                      {isWakasekView && (
                        <TableCell className="text-right">
                           <Button variant="outline" size="sm">
                                <Eye className="mr-2 h-4 w-4" />
                                Lihat Detail
                            </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  ))
              ) : (
                <TableRow>
                    <TableCell colSpan={isWakasekView ? 5 : 4} className="h-24 text-center">
                        {isWakasekView ? "Belum ada laporan yang diterima." : "Belum ada data laporan."}
                    </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
