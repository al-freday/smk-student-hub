
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Eye, Loader2, MoreHorizontal, CheckCircle, RefreshCw } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface WaliKelas {
  id: number;
  nama: string;
  kelas?: string;
}

type ReportStatus = 'Terkirim' | 'Diproses' | 'Diterima';

interface ReceivedReport {
  id: number;
  kelas: string;
  waliKelas: string;
  tanggal: string;
  status: ReportStatus;
}

export default function LaporanWaliKelasWakasekPage() {
  const [receivedReports, setReceivedReports] = useState<ReceivedReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  const reportStorageKey = 'waliKelasReportsStatus';

  useEffect(() => {
    // Simulasi pengambilan data dari localStorage, yang seharusnya diisi oleh halaman Manajemen Guru
    try {
      const savedTeachers = localStorage.getItem('teachersData');
      const savedStatuses = localStorage.getItem(reportStorageKey);
      const statuses = savedStatuses ? JSON.parse(savedStatuses) : {};

      if (savedTeachers) {
        const teachersData = JSON.parse(savedTeachers);
        const waliKelasList: WaliKelas[] = teachersData.waliKelas || [];

        const reports = waliKelasList.map((wali, index) => ({
          id: wali.id,
          kelas: wali.kelas || `Kelas ${index + 1}`,
          waliKelas: wali.nama,
          // Membuat tanggal pengiriman yang bervariasi untuk simulasi
          tanggal: format(new Date(new Date().setDate(new Date().getDate() - index)), "yyyy-MM-dd"),
          status: statuses[wali.id] || 'Terkirim',
        }));
        setReceivedReports(reports);
      }
    } catch (error) {
      console.error("Gagal memuat data wali kelas:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleStatusChange = (id: number, status: ReportStatus) => {
    const updatedReports = receivedReports.map(report =>
      report.id === id ? { ...report, status } : report
    );
    setReceivedReports(updatedReports);

    // Save updated status to localStorage
    const savedStatuses = localStorage.getItem(reportStorageKey);
    const statuses = savedStatuses ? JSON.parse(savedStatuses) : {};
    statuses[id] = status;
    localStorage.setItem(reportStorageKey, JSON.stringify(statuses));
    
    toast({
        title: "Status Diperbarui",
        description: `Laporan dari ${updatedReports.find(r => r.id === id)?.waliKelas} telah ditandai sebagai ${status}.`,
    });
  };

  const getStatusBadgeVariant = (status: ReportStatus) => {
    switch (status) {
      case 'Diterima':
        return 'default';
      case 'Diproses':
        return 'secondary';
      case 'Terkirim':
        return 'outline';
      default:
        return 'outline';
    }
  };

  return (
    <div className="flex-1 space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Laporan Wali Kelas</h2>
        <p className="text-muted-foreground">
          Daftar laporan bulanan yang telah dikirim oleh para wali kelas.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Laporan Masuk</CardTitle>
          <CardDescription>
            Berikut adalah daftar laporan yang telah diterima. Kelola status setiap laporan melalui menu Aksi.
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
                      <TableCell><Badge variant={getStatusBadgeVariant(report.status)}>{report.status}</Badge></TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                    <span className="sr-only">Buka menu</span>
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem asChild>
                                    <Link href="/dashboard/laporan/wali-kelas"><Eye className="mr-2 h-4 w-4" />Lihat Detail</Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleStatusChange(report.id, 'Diproses')}>
                                    <RefreshCw className="mr-2 h-4 w-4" />
                                    Tandai Diproses
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleStatusChange(report.id, 'Diterima')}>
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    Tandai Diterima
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
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
