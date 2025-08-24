
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Printer, Eye, Loader2, MoreHorizontal, CheckCircle, RefreshCw, MessageSquare } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";

type ReportStatus = 'Masuk' | 'Diproses' | 'Selesai';

interface ReceivedReport {
  id: number;
  pelapor: string;
  peranPelapor: string;
  siswa: string;
  tanggal: string;
  catatan: string;
  status: ReportStatus;
  tindakLanjut: string;
}

const getRoleName = (roleKey: string) => {
    const roles: { [key: string]: string } = {
        wali_kelas: 'Wali Kelas',
        guru_mapel: 'Guru Mapel',
        guru_piket: 'Guru Piket',
        guru_pendamping: 'Guru Pendamping',
    };
    return roles[roleKey] || 'Guru';
};

export default function LaporanGuruBkPage() {
  const [receivedReports, setReceivedReports] = useState<ReceivedReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  const reportStorageKey = 'guruBkIntegratedReports';

  useEffect(() => {
    const loadReports = () => {
        const savedReports = localStorage.getItem(reportStorageKey);
        if (savedReports) {
            setReceivedReports(JSON.parse(savedReports));
            setIsLoading(false);
            return;
        }

        try {
          const teachersData = JSON.parse(localStorage.getItem('teachersData') || '{}');
          const siswaData = JSON.parse(localStorage.getItem('siswaData') || '[]');
          
          let generatedReports: ReceivedReport[] = [];
          
          // Generate sample reports from various roles
          const waliKelas = teachersData.wali_kelas?.[0];
          if (waliKelas && siswaData[0]) {
              generatedReports.push({
                  id: 1, pelapor: waliKelas.nama, peranPelapor: getRoleName('wali_kelas'), siswa: siswaData[0].nama,
                  tanggal: format(new Date(), "yyyy-MM-dd"), catatan: "Siswa sering melamun di kelas.",
                  status: 'Masuk', tindakLanjut: ''
              });
          }

          const guruMapel = teachersData.guru_mapel?.[0];
           if (guruMapel && siswaData[1]) {
              generatedReports.push({
                  id: 2, pelapor: guruMapel.nama, peranPelapor: getRoleName('guru_mapel'), siswa: siswaData[1].nama,
                  tanggal: format(new Date(), "yyyy-MM-dd"), catatan: "Kesulitan mengikuti pelajaran Matematika.",
                  status: 'Masuk', tindakLanjut: ''
              });
          }

          setReceivedReports(generatedReports);
          localStorage.setItem(reportStorageKey, JSON.stringify(generatedReports));
        } catch (error) {
          console.error("Gagal memuat data laporan terintegrasi:", error);
        } finally {
          setIsLoading(false);
        }
    };
    loadReports();
  }, []);

  const handleStatusChange = (id: number, status: ReportStatus) => {
    const updatedReports = receivedReports.map(report =>
      report.id === id ? { ...report, status } : report
    );
    setReceivedReports(updatedReports);
    localStorage.setItem(reportStorageKey, JSON.stringify(updatedReports));
    toast({
        title: "Status Diperbarui",
        description: `Laporan telah ditandai sebagai ${status}.`,
    });
  };

  const handleTindakLanjutChange = (id: number, value: string) => {
     setReceivedReports(receivedReports.map(report =>
      report.id === id ? { ...report, tindakLanjut: value } : report
    ));
  };
  
  const handleSaveTindakLanjut = (id: number) => {
      localStorage.setItem(reportStorageKey, JSON.stringify(receivedReports));
      toast({ title: "Catatan Disimpan", description: "Catatan tindak lanjut telah disimpan." });
  };


  const getStatusBadgeVariant = (status: ReportStatus) => {
    switch (status) {
      case 'Selesai': return 'default';
      case 'Diproses': return 'secondary';
      case 'Masuk': return 'outline';
      default: return 'outline';
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

  return (
    <div className="flex-1 space-y-6">
      <div className="flex items-center justify-between print:hidden">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Pusat Layanan Konseling
          </h2>
          <p className="text-muted-foreground">
            Kelola laporan masuk, catat tindak lanjut, dan monitor perkembangan siswa.
          </p>
        </div>
      </div>
       <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare />
            Laporan Masuk & Tindak Lanjut
          </CardTitle>
          <CardDescription>
            Rekapitulasi laporan yang diterima dari berbagai sumber. Gunakan menu Aksi untuk mengubah status dan mencatat tindak lanjut.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Siswa & Pelapor</TableHead>
                <TableHead>Catatan Awal</TableHead>
                <TableHead>Catatan Tindak Lanjut</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {receivedReports.length > 0 ? (
                 receivedReports.map((laporan) => (
                    <TableRow key={laporan.id}>
                      <TableCell>
                        <p className="font-medium">{laporan.siswa}</p>
                        <p className="text-xs text-muted-foreground">
                            Oleh: {laporan.pelapor} ({laporan.peranPelapor})
                        </p>
                        <p className="text-xs text-muted-foreground">
                            Tgl: {laporan.tanggal}
                        </p>
                      </TableCell>
                      <TableCell className="max-w-xs">{laporan.catatan}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                            <Textarea 
                                placeholder="Tulis catatan di sini..."
                                value={laporan.tindakLanjut}
                                onChange={(e) => handleTindakLanjutChange(laporan.id, e.target.value)}
                                onBlur={() => handleSaveTindakLanjut(laporan.id)}
                                className="text-xs h-20"
                            />
                        </div>
                      </TableCell>
                      <TableCell>
                          <Badge variant={getStatusBadgeVariant(laporan.status)}>{laporan.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                         <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" className="h-8 w-8 p-0">
                                      <span className="sr-only">Buka menu</span>
                                      <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleStatusChange(laporan.id, 'Diproses')}>
                                      <RefreshCw className="mr-2 h-4 w-4" />
                                      Tandai Diproses
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleStatusChange(laporan.id, 'Selesai')}>
                                      <CheckCircle className="mr-2 h-4 w-4" />
                                      Tandai Selesai
                                  </DropdownMenuItem>
                              </DropdownMenuContent>
                          </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
              ) : (
                <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                        Belum ada laporan yang diterima.
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
