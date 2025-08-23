
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const dataLaporan = [
  { id: 1, tanggal: "2024-07-22", hari: "Senin", guru: "Joko Susilo, S.Pd.", catatan: "Situasi sekolah kondusif. Ditemukan 2 siswa terlambat." },
  { id: 2, tanggal: "2024-07-23", hari: "Selasa", guru: "Rina Kartika, S.Pd.", catatan: "Aman, gerbang ditutup tepat waktu." },
];

export default function LaporanGuruPiketPage() {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex-1 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Laporan Guru Piket</h2>
          <p className="text-muted-foreground">
            Rekapitulasi laporan harian dari guru piket.
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
          <CardDescription>Berikut adalah catatan kejadian selama jam piket.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tanggal</TableHead>
                <TableHead>Hari</TableHead>
                <TableHead>Guru Piket</TableHead>
                <TableHead>Catatan Kejadian</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dataLaporan.map((laporan) => (
                <TableRow key={laporan.id}>
                  <TableCell>{laporan.tanggal}</TableCell>
                  <TableCell>{laporan.hari}</TableCell>
                  <TableCell>{laporan.guru}</TableCell>
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
