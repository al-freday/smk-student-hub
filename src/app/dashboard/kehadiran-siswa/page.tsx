
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { getSourceData } from "@/lib/data-manager";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";

interface Kehadiran {
  id: string;
  nis: string;
  nama: string;
  kelas: string;
  tanggal: string;
  status: 'Hadir' | 'Sakit' | 'Izin' | 'Alpa';
}

interface Kelas {
    id: number;
    nama: string;
}

export default function KehadiranSiswaPage() {
  const [allRecords, setAllRecords] = useState<Kehadiran[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<Kehadiran[]>([]);
  const [filterDate, setFilterDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [filterKelas, setFilterKelas] = useState<string>("semua");
  const [daftarKelas, setDaftarKelas] = useState<Kelas[]>([]);

  useEffect(() => {
    const records = getSourceData('kehadiranSiswa', []);
    const kelasData = getSourceData('kelasData', []);
    setAllRecords(records);
    setDaftarKelas(kelasData);
  }, []);
  
  useEffect(() => {
    let results = allRecords.filter(r => r.tanggal === filterDate);
    if (filterKelas !== "semua") {
      results = results.filter(r => r.kelas === filterKelas);
    }
    setFilteredRecords(results);
  }, [filterDate, filterKelas, allRecords]);

  const getBadgeVariant = (status: Kehadiran['status']) => {
    switch (status) {
      case 'Hadir': return 'default';
      case 'Sakit': return 'secondary';
      case 'Izin': return 'secondary';
      case 'Alpa': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <div className="flex-1 space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Manajemen Kehadiran Siswa</h2>
        <p className="text-muted-foreground">Pantau dan kelola data kehadiran siswa harian.</p>
      </div>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Riwayat Kehadiran</CardTitle>
              <CardDescription>Data kehadiran siswa yang dicatat oleh Wali Kelas.</CardDescription>
            </div>
            <div className="flex items-center gap-2">
                <Input
                    type="date"
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                    className="w-fit"
                />
                <Select value={filterKelas} onValueChange={setFilterKelas}>
                    <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="semua">Semua Kelas</SelectItem>
                        {daftarKelas.map(k => <SelectItem key={k.id} value={k.nama}>{k.nama}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>NIS</TableHead>
                <TableHead>Nama Siswa</TableHead>
                <TableHead>Kelas</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRecords.length > 0 ? (
                filteredRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>{record.nis}</TableCell>
                    <TableCell className="font-medium">{record.nama}</TableCell>
                    <TableCell>{record.kelas}</TableCell>
                    <TableCell><Badge variant={getBadgeVariant(record.status)}>{record.status}</Badge></TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow><TableCell colSpan={4} className="h-24 text-center">Tidak ada data kehadiran untuk filter yang dipilih.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

    