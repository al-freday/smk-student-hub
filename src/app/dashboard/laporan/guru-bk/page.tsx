
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const dataLaporan = [
  { id: 1, tanggal: "2024-07-26", siswa: "Eka Putra", kelas: "XII TSM 3", jenis: "Konseling Karir", catatan: "Siswa berminat melanjutkan ke politeknik." },
  { id: 2, tanggal: "2024-07-27", siswa: "Ahmad Budi", kelas: "X TKJ 1", jenis: "Konseling Belajar", catatan: "Mengalami kesulitan pada mata pelajaran Fisika." },
];

export default function LaporanGuruBkPage() {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex-1 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Laporan Guru BK</h2>
          <p className="text-muted-foreground">
            Rekapitulasi laporan bimbingan dan konseling.
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
          <CardDescription>Berikut adalah rekapitulasi sesi bimbingan dan konseling.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tanggal</TableHead>
                <TableHead>Nama Siswa</TableHead>
                <TableHead>Kelas</TableHead>
                <TableHead>Jenis Konseling</TableHead>
                <TableHead>Catatan</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dataLaporan.map((laporan) => (
                <TableRow key={laporan.id}>
                  <TableCell>{laporan.tanggal}</TableCell>
                  <TableCell>{laporan.siswa}</TableCell>
                  <TableCell>{laporan.kelas}</TableCell>
                  <TableCell>{laporan.jenis}</TableCell>
                  <TableCell>{laporan.catatan}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
