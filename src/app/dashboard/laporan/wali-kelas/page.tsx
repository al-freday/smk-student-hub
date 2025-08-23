
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const dataLaporan = [
  { id: 1, tanggal: "2024-07-25", kelas: "X TKJ 1", waliKelas: "Drs. Budi Santoso", catatan: "Rapat orang tua murid akan diadakan minggu depan." },
  { id: 2, tanggal: "2024-07-25", kelas: "XI AKL 2", waliKelas: "Siti Aminah, S.Pd.", catatan: "Siswa an. Citra Dewi perlu perhatian khusus karena sering absen." },
];

export default function LaporanWaliKelasPage() {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex-1 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Laporan Wali Kelas</h2>
          <p className="text-muted-foreground">
            Rekapitulasi laporan dari wali kelas.
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
          <CardDescription>Berikut adalah catatan penting dari masing-masing wali kelas.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tanggal</TableHead>
                <TableHead>Kelas</TableHead>
                <TableHead>Wali Kelas</TableHead>
                <TableHead>Catatan</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dataLaporan.map((laporan) => (
                <TableRow key={laporan.id}>
                  <TableCell>{laporan.tanggal}</TableCell>
                  <TableCell>{laporan.kelas}</TableCell>
                  <TableCell>{laporan.waliKelas}</TableCell>
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
