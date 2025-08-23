
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface Kehadiran {
  id: string;
  nis: string;
  nama: string;
  kelas: string;
  tanggal: string;
  status: 'Hadir' | 'Sakit' | 'Izin' | 'Alpa';
}

export default function KehadiranSiswaPage() {
  const [riwayatKehadiran, setRiwayatKehadiran] = useState<Kehadiran[]>([]);

  useEffect(() => {
    const data = localStorage.getItem("kehadiranSiswa");
    if (data) {
      setRiwayatKehadiran(JSON.parse(data));
    }
  }, []);

  const getBadgeVariant = (status: Kehadiran['status']) => {
    switch (status) {
      case 'Hadir':
        return 'default';
      case 'Sakit':
        return 'secondary';
      case 'Izin':
        return 'secondary';
      case 'Alpa':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus catatan kehadiran ini?")) {
      const updatedRiwayat = riwayatKehadiran.filter(item => item.id !== id);
      setRiwayatKehadiran(updatedRiwayat);
      localStorage.setItem("kehadiranSiswa", JSON.stringify(updatedRiwayat));
    }
  };

  return (
    <div className="flex-1 space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Riwayat Kehadiran Siswa</h2>
        <p className="text-muted-foreground">
          Daftar lengkap semua catatan kehadiran yang telah diinput.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Data Kehadiran</CardTitle>
          <CardDescription>
            Berikut adalah riwayat kehadiran siswa yang tercatat di sistem.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tanggal</TableHead>
                <TableHead>NIS</TableHead>
                <TableHead>Nama Siswa</TableHead>
                <TableHead>Kelas</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {riwayatKehadiran.length > 0 ? (
                riwayatKehadiran.sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime()).map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.tanggal}</TableCell>
                    <TableCell>{item.nis}</TableCell>
                    <TableCell className="font-medium">{item.nama}</TableCell>
                    <TableCell>{item.kelas}</TableCell>
                    <TableCell>
                      <Badge variant={getBadgeVariant(item.status)}>{item.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center h-24">
                    Belum ada data kehadiran.
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
