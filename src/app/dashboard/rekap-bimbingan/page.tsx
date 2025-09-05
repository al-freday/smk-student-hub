"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getSourceData } from "@/lib/data-manager";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Loader2, ArrowLeft, BookCopy, Gem, ShieldCheck } from "lucide-react";
import { Input } from "@/components/ui/input";

// Tipe Data
interface Siswa { id: number; nis: string; nama: string; kelas: string; }
interface Log {
  id: string;
  tanggal: string;
  nis: string;
  kategori: string;
  catatan: string;
  tipe: 'Akademik' | 'Kompetensi' | 'Karakter';
}

const getTipeIcon = (tipe: Log['tipe']) => {
    switch (tipe) {
        case 'Akademik': return <BookCopy className="h-4 w-4 text-blue-500" />;
        case 'Kompetensi': return <Gem className="h-4 w-4 text-yellow-500" />;
        case 'Karakter': return <ShieldCheck className="h-4 w-4 text-green-500" />;
        default: return null;
    }
};


export default function RekapBimbinganPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [allLogs, setAllLogs] = useState<Log[]>([]);
  const [siswaBinaan, setSiswaBinaan] = useState<Siswa[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const loadData = useCallback(() => {
    setIsLoading(true);
    try {
      const user = getSourceData('currentUser', null);
      if (!user) {
        router.push('/');
        return;
      }
      
      const teachersData = getSourceData('teachersData', {});
      const guruData = teachersData.guru_pendamping?.find((gp: any) => gp.nama === user.nama);
      const daftarNamaSiswaBinaan = guruData?.siswaBinaan || [];

      const allSiswa: Siswa[] = getSourceData('siswaData', []);
      setSiswaBinaan(allSiswa.filter(s => daftarNamaSiswaBinaan.includes(s.nama)));
      
      const logAkademik = getSourceData('logAkademikData', {});
      const logKompetensi = getSourceData('logKompetensiData', {});
      const logKarakter = getSourceData('logBimbinganData', {});

      const combinedLogs: Log[] = [];
      const nisBinaan = new Set(allSiswa.filter(s => daftarNamaSiswaBinaan.includes(s.nama)).map(s => s.nis));

      Object.entries(logAkademik).forEach(([nis, logs]: [string, any[]]) => {
          if (nisBinaan.has(nis)) logs.forEach(log => combinedLogs.push({ ...log, nis, tipe: 'Akademik' }));
      });
      Object.entries(logKompetensi).forEach(([nis, logs]: [string, any[]]) => {
          if (nisBinaan.has(nis)) logs.forEach(log => combinedLogs.push({ ...log, nis, tipe: 'Kompetensi' }));
      });
      Object.entries(logKarakter).forEach(([nis, logs]: [string, any[]]) => {
          if (nisBinaan.has(nis)) logs.forEach(log => combinedLogs.push({ ...log, nis, tipe: 'Karakter' }));
      });
      
      setAllLogs(combinedLogs.sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime()));

    } catch (error) {
      console.error("Gagal memuat data rekap:", error);
      toast({ title: "Gagal Memuat Data", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [router, toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);
  
  const filteredLogs = useMemo(() => {
    if (!searchTerm) return allLogs;
    const lowercasedFilter = searchTerm.toLowerCase();
    
    const siswaMap = new Map(siswaBinaan.map(s => [s.nis, s.nama]));
    
    return allLogs.filter(log => {
        const namaSiswa = siswaMap.get(log.nis)?.toLowerCase() || '';
        return (
            namaSiswa.includes(lowercasedFilter) ||
            log.catatan.toLowerCase().includes(lowercasedFilter) ||
            log.kategori.toLowerCase().includes(lowercasedFilter)
        );
    });
  }, [allLogs, searchTerm, siswaBinaan]);

  if (isLoading) {
    return (
      <div className="flex-1 flex justify-center items-center h-[calc(100vh-8rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.push('/dashboard/bimbingan-siswa')}>
            <ArrowLeft />
        </Button>
        <div>
            <h2 className="text-3xl font-bold tracking-tight">Rekapitulasi Bimbingan</h2>
            <p className="text-muted-foreground">
              Arsip semua catatan bimbingan untuk siswa pendampingan Anda.
            </p>
        </div>
      </div>
      
      <Card>
        <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <CardTitle>Riwayat Catatan Bimbingan</CardTitle>
                    <CardDescription>Daftar semua catatan yang telah Anda buat, diurutkan dari yang terbaru.</CardDescription>
                </div>
                <Input
                    placeholder="Cari nama siswa atau catatan..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full sm:w-64"
                />
            </div>
        </CardHeader>
        <CardContent>
           <Table>
              <TableHeader>
                <TableRow>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Siswa</TableHead>
                    <TableHead>Tipe</TableHead>
                    <TableHead>Kategori</TableHead>
                    <TableHead>Catatan</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                  {filteredLogs.length > 0 ? (
                    filteredLogs.map(log => {
                        const siswa = siswaBinaan.find(s => s.nis === log.nis);
                        return (
                             <TableRow key={log.id}>
                                <TableCell className="whitespace-nowrap">{format(new Date(log.tanggal), "dd MMM yyyy", { locale: id })}</TableCell>
                                <TableCell>
                                    <p className="font-medium">{siswa?.nama || 'N/A'}</p>
                                    <p className="text-xs text-muted-foreground">{siswa?.kelas || ''}</p>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        {getTipeIcon(log.tipe)}
                                        <span className="font-medium">{log.tipe}</span>
                                    </div>
                                </TableCell>
                                <TableCell>{log.kategori}</TableCell>
                                <TableCell><p className="line-clamp-2">{log.catatan}</p></TableCell>
                            </TableRow>
                        )
                    })
                  ) : (
                    <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">
                            Tidak ada catatan bimbingan yang ditemukan.
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
