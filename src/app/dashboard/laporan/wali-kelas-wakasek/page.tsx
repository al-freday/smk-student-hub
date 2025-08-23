
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Eye, Loader2 } from "lucide-react";
import { format } from "date-fns";

interface WaliKelas {
  id: number;
  nama: string;
  kelas?: string;
}

interface ReceivedReport {
  id: number;
  kelas: string;
  waliKelas: string;
  tanggal: string;
  status: "Terkirim";
}

export default function LaporanWaliKelasWakasekPage() {
  const [receivedReports, setReceivedReports] = useState<ReceivedReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulasi pengambilan data dari localStorage, yang seharusnya diisi oleh halaman Manajemen Guru
    try {
      const savedTeachers = localStorage.getItem('teachersData');
      if (savedTeachers) {
        const teachersData = JSON.parse(savedTeachers);
        const waliKelasList: WaliKelas[] = teachersData.waliKelas || [];

        const reports = waliKelasList.map((wali, index) => ({
          id: wali.id,
          kelas: wali.kelas || `Kelas ${index + 1}`,
          waliKelas: wali.nama,
          // Membuat tanggal pengiriman yang bervariasi untuk simulasi
          tanggal: format(new Date(new Date().setDate(new Date().getDate() - index)), "yyyy-MM-dd"),
          status: "Terkirim" as const,
        }));
        setReceivedReports(reports);
      }
    } catch (error) {
      console.error("Gagal memuat data wali kelas:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <div className="flex-1 space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Laporan Wali Kelas (Diterima)</h2>
        <p className="text-muted-foreground">
          Daftar laporan bulanan yang telah dikirim oleh para wali kelas.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Laporan Masuk</CardTitle>
          <CardDescription>
            Berikut adalah daftar laporan yang telah diterima. Klik "Lihat Detail" untuk meninjau laporan.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-48">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <p className="ml-4 text-muted-foreground">Memuat data laporan...</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kelas</TableHead>
                  <TableHead>Nama Wali Kelas</TableHead>
                  <TableHead>Tanggal Kirim</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {receivedReports.length > 0 ? (
                  receivedReports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell className="font-medium">{report.kelas}</TableCell>
                      <TableCell>{report.waliKelas}</TableCell>
                      <TableCell>{report.tanggal}</TableCell>
                      <TableCell><Badge>{report.status}</Badge></TableCell>
                      <TableCell className="text-right">
                        <Link href="/dashboard/laporan/wali-kelas">
                          <Button variant="outline" size="sm">
                            <Eye className="mr-2 h-4 w-4" />
                            Lihat Detail
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                   <TableRow>
                      <TableCell colSpan={5} className="text-center h-24">
                        Belum ada laporan yang diterima dari Wali Kelas.
                      </TableCell>
                    </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
