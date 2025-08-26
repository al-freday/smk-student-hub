
"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltipContent,
} from "@/components/ui/chart";

interface Siswa {
  id: number;
  nis: string;
  nama: string;
  kelas: string;
}

interface Kelas {
  nama: string;
  jumlahSiswa: number;
}

const chartConfig = {
  jumlahSiswa: {
    label: "Jumlah Siswa",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

export default function ManajemenKelasPage() {
  const [kelas, setKelas] = useState<Kelas[]>([]);

  useEffect(() => {
    const savedSiswa = localStorage.getItem('siswaData');
    if (savedSiswa) {
      try {
        const siswaData: Siswa[] = JSON.parse(savedSiswa);
        const kelasMap = new Map<string, number>();

        siswaData.forEach(siswa => {
          if (siswa.kelas) {
            kelasMap.set(siswa.kelas, (kelasMap.get(siswa.kelas) || 0) + 1);
          }
        });

        const aggregatedKelas: Kelas[] = Array.from(kelasMap.entries()).map(([nama, jumlahSiswa]) => ({
          nama,
          jumlahSiswa,
        }));

        setKelas(aggregatedKelas);
      } catch (error) {
        console.error("Gagal memproses data siswa:", error);
      }
    }
  }, []);
  
  const sortedChartData = useMemo(() => {
    return [...kelas].sort((a, b) => a.jumlahSiswa - b.jumlahSiswa);
  }, [kelas]);

  return (
    <div className="flex-1 space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Manajemen Kelas</h2>
        <p className="text-muted-foreground">
          Rekapitulasi dan visualisasi jumlah siswa per kelas berdasarkan data dari Manajemen Siswa.
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Diagram Jumlah Siswa per Kelas</CardTitle>
          <CardDescription>Visualisasi distribusi siswa di setiap kelas, diurutkan dari yang paling sedikit.</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="min-h-[200px] w-full h-80">
            <BarChart accessibilityLayer data={sortedChartData} layout="vertical" margin={{ left: 20, right: 20 }}>
              <CartesianGrid horizontal={false} />
              <YAxis
                dataKey="nama"
                type="category"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                className="text-xs"
                interval={0}
              />
              <XAxis dataKey="jumlahSiswa" type="number" hide />
              <Tooltip cursor={{ fill: "hsl(var(--muted))" }} content={<ChartTooltipContent />} />
              <Bar dataKey="jumlahSiswa" fill="var(--color-jumlahSiswa)" radius={4} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Kelas</CardTitle>
          <CardDescription>
            Berikut adalah daftar kelas yang terdaftar di sistem beserta jumlah siswanya.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Kelas</TableHead>
                <TableHead className="text-center">Jumlah Siswa</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {kelas.length > 0 ? (
                kelas.sort((a,b) => a.nama.localeCompare(b.nama)).map((k) => (
                  <TableRow key={k.nama}>
                    <TableCell className="font-medium">{k.nama}</TableCell>
                    <TableCell className="text-center">{k.jumlahSiswa}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={2} className="text-center h-24">
                    Belum ada data siswa untuk direkapitulasi.
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
