
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const dataLaporan = [
  { id: 1, tanggal: "2024-07-20", siswa: "Ahmad Budi", kelas: "X TKJ 1", catatan: "Siswa menunjukkan perkembangan positif dalam kegiatan ekstrakurikuler." },
  { id: 2, tanggal: "2024-07-21", siswa: "Citra Dewi", kelas: "XI AKL 2", catatan: "Membutuhkan bimbingan lebih lanjut dalam manajemen waktu." },
];

export default function LaporanGuruPendampingPage() {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex-1 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Laporan Guru Pendamping</h2>
          <p className="text-muted-foreground">
            Rekapitulasi laporan dari guru pendamping.
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
          <CardDescription>Berikut adalah catatan pendampingan siswa.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tanggal</TableHead>
                <TableHead>Nama Siswa</TableHead>
                <TableHead>Kelas</TableHead>
                <TableHead>Catatan Pendampingan</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dataLaporan.map((laporan) => (
                <TableRow key={laporan.id}>
                  <TableCell>{laporan.tanggal}</TableCell>
                  <TableCell>{laporan.siswa}</TableCell>
                  <TableCell>{laporan.kelas}</TableCell>
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
