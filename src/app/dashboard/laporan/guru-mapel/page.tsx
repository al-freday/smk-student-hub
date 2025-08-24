
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Printer, Eye, Loader2, MoreHorizontal, CheckCircle, RefreshCw } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface GuruMapel {
  id: number;
  nama: string;
  mapel?: string;
}

type ReportStatus = 'Terkirim' | 'Diproses' | 'Diterima';

interface ReceivedReport {
  id: number;
  guru: string;
  mapel: string;
  tanggal: string;
  catatan: string;
  status: ReportStatus;
}

export default function LaporanGuruMapelPage() {
  const [receivedReports, setReceivedReports] = useState<ReceivedReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const { toast } = useToast();
  
  const reportStorageKey = 'guruMapelReportsStatus';

  useEffect(() => {
    const role = localStorage.getItem('userRole');
    setUserRole(role);

    if (role === 'wakasek_kesiswaan') {
        try {
          const savedTeachers = localStorage.getItem('teachersData');
          const savedStatuses = localStorage.getItem(reportStorageKey);
          const statuses = savedStatuses ? JSON.parse(savedStatuses) : {};

          if (savedTeachers) {
            const teachersData = JSON.parse(savedTeachers);
            const guruMapelList: GuruMapel[] = teachersData.guru_mapel || [];

            const reports = guruMapelList.map((guru, index) => ({
              id: guru.id,
              guru: guru.nama,
              mapel: guru.mapel || `Mapel ${index + 1}`,
              tanggal: format(new Date(new Date().setDate(new Date().getDate() - index)), "yyyy-MM-dd"),
              catatan: `Laporan rutin untuk mata pelajaran ${guru.mapel || `Mapel ${index + 1}`}.`,
              status: statuses[guru.id] || 'Terkirim',
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
            { id: 1, tanggal: "2024-07-22", mapel: "Matematika", guru: "Nama Guru Mapel", catatan: "Sebagian besar siswa sudah memahami materi aljabar.", status: 'Terkirim' },
            { id: 2, tanggal: "2024-07-22", mapel: "Bahasa Inggris", guru: "Nama Guru Mapel", catatan: "Perlu latihan conversation lebih intensif.", status: 'Terkirim' },
        ]);
        setIsLoading(false);
    }
  }, []);

  const handlePrint = () => {
    window.print();
  };
  
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
        description: `Laporan telah ditandai sebagai ${status}.`,
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

  const isWakasekView = userRole === 'wakasek_kesiswaan';

  return (
    <div className="flex-1 space-y-6">
      <div className="flex items-center justify-between print:hidden">
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
                ? "Berikut adalah daftar laporan yang telah diterima. Kelola status setiap laporan melalui menu Aksi."
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
                {isWakasekView && <TableHead>Status</TableHead>}
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
                          <TableCell>
                              <Badge variant={getStatusBadgeVariant(laporan.status)}>{laporan.status}</Badge>
                          </TableCell>
                      )}
                      {isWakasekView && (
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
                                        <Link href="/dashboard/laporan/guru-mapel"><Eye className="mr-2 h-4 w-4" />Lihat Detail</Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleStatusChange(laporan.id, 'Diproses')}>
                                        <RefreshCw className="mr-2 h-4 w-4" />
                                        Tandai Diproses
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleStatusChange(laporan.id, 'Diterima')}>
                                        <CheckCircle className="mr-2 h-4 w-4" />
                                        Tandai Diterima
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </TableCell>
                      )}
                    </TableRow>
                  ))
              ) : (
                <TableRow>
                    <TableCell colSpan={isWakasekView ? 6 : 4} className="h-24 text-center">
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
