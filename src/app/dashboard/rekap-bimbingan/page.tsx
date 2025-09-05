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
import { Loader2, ArrowLeft, BookCopy, Gem, ShieldCheck, UserSearch } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";


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
  const [selectedNis, setSelectedNis] = useState<string>("");

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
      const siswaPendampingan = allSiswa.filter(s => daftarNamaSiswaBinaan.includes(s.nama));
      setSiswaBinaan(siswaPendampingan.sort((a,b) => a.nama.localeCompare(b.nama)));
      
      const logAkademik = getSourceData('logAkademikData', {});
      const logKompetensi = getSourceData('logKompetensiData', {});
      const logKarakter = getSourceData('logBimbinganData', {});

      const combinedLogs: Log[] = [];
      const nisBinaan = new Set(siswaPendampingan.map(s => s.nis));

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
    if (!selectedNis) return [];
    return allLogs.filter(log => log.nis === selectedNis);
  }, [allLogs, selectedNis]);

  const selectedSiswa = useMemo(() => {
    return siswaBinaan.find(s => s.nis === selectedNis);
  }, [siswaBinaan, selectedNis]);

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
                    <CardDescription>Pilih seorang siswa untuk melihat riwayat bimbingannya.</CardDescription>
                </div>
                <div className="flex items-end gap-2 w-full sm:w-auto">
                    <div className="flex-1">
                        <Label htmlFor="siswa-select">Pilih Siswa</Label>
                        <Select value={selectedNis} onValueChange={setSelectedNis}>
                            <SelectTrigger id="siswa-select" className="w-full sm:w-[250px]">
                                <SelectValue placeholder="Pilih siswa binaan..." />
                            </SelectTrigger>
                            <SelectContent>
                                {siswaBinaan.map(siswa => (
                                    <SelectItem key={siswa.nis} value={siswa.nis}>{siswa.nama} ({siswa.kelas})</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>
        </CardHeader>
        <CardContent>
           {selectedNis ? (
             <Table>
               <TableHeader>
                 <TableRow>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Tipe Bimbingan</TableHead>
                    <TableHead>Kategori</TableHead>
                    <TableHead>Catatan</TableHead>
                 </TableRow>
               </TableHeader>
               <TableBody>
                   {filteredLogs.length > 0 ? (
                     filteredLogs.map(log => (
                        <TableRow key={log.id}>
                            <TableCell className="whitespace-nowrap">{format(new Date(log.tanggal), "dd MMM yyyy", { locale: id })}</TableCell>
                            <TableCell>
                                <div className="flex items-center gap-2">
                                    {getTipeIcon(log.tipe)}
                                    <span className="font-medium">{log.tipe}</span>
                                </div>
                            </TableCell>
                            <TableCell>{log.kategori}</TableCell>
                            <TableCell>{log.catatan}</TableCell>
                        </TableRow>
                     ))
                   ) : (
                     <TableRow>
                         <TableCell colSpan={4} className="h-24 text-center">
                             Tidak ada catatan bimbingan yang ditemukan untuk siswa ini.
                         </TableCell>
                     </TableRow>
                   )}
               </TableBody>
             </Table>
           ) : (
             <div className="text-center text-muted-foreground py-10">
                <UserSearch className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-semibold">Pilih Siswa</h3>
                <p className="mt-1 text-sm">Silakan pilih seorang siswa dari daftar di atas untuk melihat rekap bimbingannya.</p>
            </div>
           )}
        </CardContent>
      </Card>
    </div>
  );
}
