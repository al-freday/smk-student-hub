
"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";

interface CatatanSiswa {
    id: number;
    siswa: string;
    kelas: string;
    deskripsi: string;
    poin: number;
    waliKelas: string; // Used as reporter
    tanggal: string;
    tipe: 'pelanggaran' | 'prestasi';
}

export default function RecentReportsTable() {
  const [reports, setReports] = useState<CatatanSiswa[]>([]);

  useEffect(() => {
    const savedRiwayat = localStorage.getItem('riwayatCatatan');
    if (savedRiwayat) {
      const allReports: CatatanSiswa[] = JSON.parse(savedRiwayat);
      // Sort by date descending and take the first 5
      const sortedReports = allReports
        .sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime())
        .slice(0, 5);
      setReports(sortedReports);
    }
  }, []);

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nama Siswa</TableHead>
          <TableHead className="hidden sm:table-cell">Kelas</TableHead>
          <TableHead>Keterangan</TableHead>
          <TableHead className="text-right">Poin</TableHead>
          <TableHead className="hidden md:table-cell">Pelapor</TableHead>
          <TableHead className="hidden lg:table-cell text-right">Tanggal</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {reports.length > 0 ? (
          reports.map((report) => (
            <TableRow key={report.id}>
              <TableCell>
                <div className="font-medium">{report.siswa}</div>
              </TableCell>
              <TableCell className="hidden sm:table-cell">{report.kelas}</TableCell>
              <TableCell>{report.deskripsi}</TableCell>
              <TableCell className="text-right">
                <Badge variant={report.tipe === 'pelanggaran' ? "destructive" : "default"}>
                  {report.poin > 0 ? `+${report.poin}` : report.poin}
                </Badge>
              </TableCell>
              <TableCell className="hidden md:table-cell">{report.waliKelas}</TableCell>
              <TableCell className="hidden lg:table-cell text-right">{report.tanggal}</TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={6} className="text-center h-24">
              Belum ada laporan yang tercatat.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
