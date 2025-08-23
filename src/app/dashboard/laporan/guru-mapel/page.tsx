
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const dataLaporan = [
  { id: 1, tanggal: "2024-07-22", mapel: "Matematika", kelas: "X TKJ 1", catatan: "Sebagian besar siswa sudah memahami materi aljabar." },
  { id: 2, tanggal: "2024-07-22", mapel: "Bahasa Inggris", kelas: "XI AKL 2", catatan: "Perlu latihan conversation lebih intensif." },
];

export default function LaporanGuruMapelPage() {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex-1 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Laporan Guru Mata Pelajaran</h2>
          <p className="text-muted-foreground">
            Rekapitulasi laporan dari guru mata pelajaran.
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
          <CardDescription>Berikut adalah catatan perkembangan akademik siswa per mata pelajaran.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tanggal</TableHead>
                <TableHead>Mata Pelajaran</TableHead>
                <TableHead>Kelas</TableHead>
                <TableHead>Catatan</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dataLaporan.map((laporan) => (
                <TableRow key={laporan.id}>
                  <TableCell>{laporan.tanggal}</TableCell>
                  <TableCell>{laporan.mapel}</TableCell>
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
