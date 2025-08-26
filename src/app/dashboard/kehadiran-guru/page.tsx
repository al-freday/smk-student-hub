
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { getSourceData } from "@/lib/data-manager";

interface TeacherAttendanceRecord {
  id: number;
  tanggal: string;
  namaGuru: string;
  mataPelajaran: string;
  status: 'Hadir' | 'Tidak Hadir' | 'Sakit' | 'Izin';
  keterangan: string;
  dicatatOleh: string;
}

export default function KehadiranGuruPage() {
  const [allRecords, setAllRecords] = useState<TeacherAttendanceRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<TeacherAttendanceRecord[]>([]);
  const [filterDate, setFilterDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));

  useEffect(() => {
    const records = getSourceData('teacherAttendanceData', []);
    setAllRecords(records);
  }, []);
  
  useEffect(() => {
    const results = allRecords.filter(r => r.tanggal === filterDate);
    setFilteredRecords(results);
  }, [filterDate, allRecords]);

  const getBadgeVariant = (status: TeacherAttendanceRecord['status']) => {
    switch (status) {
      case 'Hadir': return 'default';
      case 'Tidak Hadir': return 'destructive';
      case 'Sakit': return 'secondary';
      case 'Izin': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <div className="flex-1 space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Manajemen Kehadiran Guru</h2>
        <p className="text-muted-foreground">Pantau dan kelola data kehadiran guru mengajar.</p>
      </div>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Riwayat Kehadiran Guru</CardTitle>
              <CardDescription>Data kehadiran guru yang dicatat oleh Guru Piket.</CardDescription>
            </div>
            <div className="flex items-center gap-2">
                <label htmlFor="filter-tanggal" className="text-sm font-medium">Filter Tanggal:</label>
                <Input
                    id="filter-tanggal"
                    type="date"
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                    className="w-fit"
                />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Guru</TableHead>
                <TableHead>Mata Pelajaran</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Keterangan</TableHead>
                <TableHead>Dicatat Oleh</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRecords.length > 0 ? (
                filteredRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">{record.namaGuru}</TableCell>
                    <TableCell>{record.mataPelajaran}</TableCell>
                    <TableCell><Badge variant={getBadgeVariant(record.status)}>{record.status}</Badge></TableCell>
                    <TableCell>{record.keterangan}</TableCell>
                    <TableCell>{record.dicatatOleh}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow><TableCell colSpan={5} className="h-24 text-center">Tidak ada data kehadiran untuk tanggal yang dipilih.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
