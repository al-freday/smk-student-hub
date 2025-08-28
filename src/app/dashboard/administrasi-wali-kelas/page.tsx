
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getAdministrasiWaliKelasData } from "@/lib/data";
import { Loader2, Users, CalendarClock, BookUser, FileText, Award, ShieldAlert, BarChart3, TrendingUp, TrendingDown, UserCheck } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import StatCard from "@/components/stat-card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

// --- Tipe Data ---
interface AdministrasiData {
  kelasBinaan: string[];
  totalSiswa: number;
  kehadiranRataRata: string;
  siswaPoinTertinggi: { nama: string; poin: number };
  siswa: any[];
  guruMapel: Map<string, string[]>;
  rekapKehadiran: any[];
  catatanPerilaku: any[];
  rekapPoin: any[];
}

export default function AdministrasiWaliKelasPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<AdministrasiData | null>(null);

  const loadData = useCallback(() => {
    setIsLoading(true);
    try {
      const result = getAdministrasiWaliKelasData();
      if (!result.currentUser) {
        router.push('/');
        return;
      }
      setData(result);
    } catch (error) {
        console.error("Gagal memuat data administrasi:", error);
    } finally {
        setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadData();
    window.addEventListener('dataUpdated', loadData);
    return () => window.removeEventListener('dataUpdated', loadData);
  }, [loadData]);

  if (isLoading || !data) {
    return (
      <div className="flex-1 flex justify-center items-center h-[calc(100vh-8rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Pusat Administrasi Wali Kelas</h2>
        <p className="text-muted-foreground">
          Kelola semua data dan dokumen untuk kelas binaan Anda: <span className="font-semibold text-primary">{data.kelasBinaan.join(', ')}</span>
        </p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-3">
          <StatCard title="Total Siswa" value={data.totalSiswa.toString()} icon={<Users />} isLoading={isLoading} />
          <StatCard title="Rata-rata Kehadiran" value={data.kehadiranRataRata} icon={<UserCheck />} isLoading={isLoading} />
          <StatCard title="Poin Pelanggaran Tertinggi" value={`${data.siswaPoinTertinggi.nama} (${data.siswaPoinTertinggi.poin})`} icon={<TrendingDown />} isLoading={isLoading} isNegative={data.siswaPoinTertinggi.poin > 0}/>
      </div>
      
      <Tabs defaultValue="data-induk" className="w-full">
        <ScrollArea className="w-full whitespace-nowrap">
          <TabsList>
            <TabsTrigger value="data-induk"><Users className="mr-2 h-4 w-4"/>Data Induk Kelas</TabsTrigger>
            <TabsTrigger value="kehadiran"><CalendarClock className="mr-2 h-4 w-4"/>Administrasi Kehadiran</TabsTrigger>
            <TabsTrigger value="pembelajaran"><BookUser className="mr-2 h-4 w-4"/>Administrasi Pembelajaran</TabsTrigger>
            <TabsTrigger value="disiplin"><ShieldAlert className="mr-2 h-4 w-4"/>Administrasi Disiplin</TabsTrigger>
            <TabsTrigger value="laporan"><FileText className="mr-2 h-4 w-4"/>Laporan & Evaluasi</TabsTrigger>
          </TabsList>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>

        {/* A. Data Induk Kelas */}
        <TabsContent value="data-induk">
            <Card>
                <CardHeader><CardTitle>A. Data Induk Siswa Kelas Binaan</CardTitle><CardDescription>Informasi dasar semua siswa di kelas Anda.</CardDescription></CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader><TableRow><TableHead>NIS</TableHead><TableHead>Nama Siswa</TableHead><TableHead>Kontak Darurat</TableHead></TableRow></TableHeader>
                    <TableBody>
                      {data.siswa.map((s: any) => (
                        <TableRow key={s.id}>
                          <TableCell>{s.nis}</TableCell>
                          <TableCell>{s.nama}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">Orang Tua/Wali (Segera)</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
            </Card>
        </TabsContent>

        {/* B. Administrasi Kehadiran */}
        <TabsContent value="kehadiran">
             <Card>
                <CardHeader><CardTitle>B. Rekapitulasi Kehadiran Bulanan</CardTitle><CardDescription>Persentase kehadiran setiap siswa selama sebulan terakhir.</CardDescription></CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader><TableRow><TableHead>Nama Siswa</TableHead><TableHead>Hadir</TableHead><TableHead>Sakit</TableHead><TableHead>Izin</TableHead><TableHead>Alpa</TableHead><TableHead>Total (%)</TableHead></TableRow></TableHeader>
                    <TableBody>
                      {data.rekapKehadiran.map((rekap: any) => (
                        <TableRow key={rekap.nis}>
                          <TableCell>{rekap.nama}</TableCell>
                          <TableCell>{rekap.hadir}</TableCell>
                          <TableCell>{rekap.sakit}</TableCell>
                          <TableCell>{rekap.izin}</TableCell>
                          <TableCell>{rekap.alpa}</TableCell>
                          <TableCell><Badge variant={rekap.persentase < 75 ? "destructive" : "default"}>{rekap.persentase.toFixed(1)}%</Badge></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
            </Card>
        </TabsContent>

        {/* C. Administrasi Pembelajaran */}
        <TabsContent value="pembelajaran">
            <Card>
                 <CardHeader><CardTitle>C. Daftar Guru Mata Pelajaran</CardTitle><CardDescription>Guru yang mengajar di kelas binaan Anda.</CardDescription></CardHeader>
                 <CardContent>
                    <Table>
                        <TableHeader><TableRow><TableHead>Mata Pelajaran</TableHead><TableHead>Guru Pengajar</TableHead></TableRow></TableHeader>
                        <TableBody>
                            {Array.from(data.guruMapel.entries()).map(([mapel, gurus]) => (
                                <TableRow key={mapel}>
                                    <TableCell>{mapel}</TableCell>
                                    <TableCell>{gurus.join(', ')}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                 </CardContent>
            </Card>
        </TabsContent>
        
        {/* D. Administrasi Disiplin */}
        <TabsContent value="disiplin">
             <Card>
                <CardHeader><CardTitle>D. Buku Catatan Perilaku dan Kejadian Penting</CardTitle><CardDescription>Riwayat pelanggaran dan prestasi siswa di kelas Anda.</CardDescription></CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader><TableRow><TableHead>Tanggal</TableHead><TableHead>Nama Siswa</TableHead><TableHead>Catatan</TableHead><TableHead className="text-center">Poin/Status</TableHead></TableRow></TableHeader>
                        <TableBody>
                            {data.catatanPerilaku.map((c: any, idx: number) => (
                                <TableRow key={idx}>
                                    <TableCell>{format(new Date(c.tanggal), "dd MMM yyyy", { locale: id })}</TableCell>
                                    <TableCell>{c.nama}</TableCell>
                                    <TableCell>{c.deskripsi}</TableCell>
                                    <TableCell className="text-center">
                                        {c.tipe === 'pelanggaran' ? <Badge variant="destructive">{c.poin}</Badge> : <Badge variant="secondary">Prestasi</Badge>}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
             </Card>
        </TabsContent>

        {/* F. Laporan & Evaluasi */}
        <TabsContent value="laporan">
             <Card>
                <CardHeader><CardTitle>F. Rekapitulasi Poin & Prestasi (Evaluasi Semester)</CardTitle><CardDescription>Akumulasi poin dan prestasi sebagai bahan evaluasi.</CardDescription></CardHeader>
                <CardContent>
                     <Table>
                        <TableHeader><TableRow><TableHead>Nama Siswa</TableHead><TableHead className="text-center">Total Poin Pelanggaran</TableHead><TableHead className="text-center">Jumlah Prestasi</TableHead></TableRow></TableHeader>
                        <TableBody>
                            {data.rekapPoin.map((s: any) => (
                                <TableRow key={s.id}>
                                    <TableCell>{s.nama}</TableCell>
                                    <TableCell className="text-center"><Badge variant={s.totalPoin > 0 ? "destructive" : "default"}>{s.totalPoin}</Badge></TableCell>
                                    <TableCell className="text-center">{s.totalPrestasi}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                     </Table>
                </CardContent>
             </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
