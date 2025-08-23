
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Eye } from "lucide-react";

const receivedReports = [
  { id: 1, kelas: "X OT 1", waliKelas: "Drs. Budi Santoso", tanggal: "2024-07-28", status: "Terkirim" },
  { id: 2, kelas: "XI AKL 2", waliKelas: "Dewi Lestari, S.Pd.", tanggal: "2024-07-27", status: "Terkirim" },
  { id: 3, kelas: "XII TKR 1", waliKelas: "Eko Prasetyo, S.Kom.", tanggal: "2024-07-26", status: "Terkirim" },
];

export default function LaporanWaliKelasWakasekPage() {
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
              {receivedReports.map((report) => (
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
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

    