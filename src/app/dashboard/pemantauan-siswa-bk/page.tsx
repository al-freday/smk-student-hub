
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { getSourceData } from "@/lib/data-manager";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";

// --- Tipe Data ---
interface Siswa { id: number; nis: string; nama: string; kelas: string; }
interface CatatanPelanggaran { id: number; nis: string; poin: number; }
interface SiswaDenganPoin extends Siswa { totalPoin: number; jumlahPelanggaran: number; }

export default function PemantauanSiswaBkPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);

  // --- Data Pengguna & Tugas ---
  const [tingkatBinaan, setTingkatBinaan] = useState<string | null>(null);
  
  // --- Data Terfilter ---
  const [siswaBinaan, setSiswaBinaan] = useState<SiswaDenganPoin[]>([]);
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
      const guruBkData = teachersData.guru_bk?.find((gbk: any) => gbk.nama === user.nama);
      const binaan = guruBkData?.tugasKelas || null;
      setTingkatBinaan(binaan);

      if (!binaan) {
        setIsLoading(false);
        return;
      }
      
      const allSiswa: Siswa[] = getSourceData('siswaData', []);
      const allPelanggaran: CatatanPelanggaran[] = getSourceData('riwayatPelanggaran', []);

      const siswaDiTingkat = allSiswa.filter(s => s.kelas.startsWith(binaan.split(' ')[1]));
      
      const siswaDenganPoin = siswaDiTingkat.map(siswa => {
          const pelanggaranSiswa = allPelanggaran.filter(p => p.nis === siswa.nis);
          const totalPoin = pelanggaranSiswa.reduce((sum, p) => sum + p.poin, 0);
          return { ...siswa, totalPoin, jumlahPelanggaran: pelanggaranSiswa.length };
      }).sort((a, b) => b.totalPoin - a.totalPoin);
      setSiswaBinaan(siswaDenganPoin);

    } catch (error) {
      console.error("Gagal memuat data Pemantauan Siswa:", error);
      toast({ title: "Gagal Memuat Data", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [router, toast]);

  useEffect(() => {
    loadData();
    window.addEventListener('dataUpdated', loadData);
    return () => window.removeEventListener('dataUpdated', loadData);
  }, [loadData]);

  const filteredSiswa = useMemo(() => {
    return siswaBinaan.filter(siswa => 
      siswa.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      siswa.nis.includes(searchTerm)
    );
  }, [siswaBinaan, searchTerm]);

  if (isLoading) {
    return (
      <div className="flex-1 flex justify-center items-center h-[calc(100vh-8rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
       <div>
        <h2 className="text-3xl font-bold tracking-tight">Pemantauan Siswa Binaan</h2>
        <p className="text-muted-foreground">
            Rekapitulasi poin dan jumlah pelanggaran untuk semua siswa di <span className="font-semibold text-primary">{tingkatBinaan}</span>.
        </p>
      </div>
      
      <Card>
        <CardHeader>
            <div className="flex justify-between items-center">
                <div>
                    <CardTitle>Rekapitulasi Poin Siswa</CardTitle>
                    <CardDescription>Siswa diurutkan berdasarkan total poin pelanggaran tertinggi untuk pemantauan proaktif.</CardDescription>
                </div>
                <Input 
                    placeholder="Cari nama atau NIS..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full max-w-sm"
                />
            </div>
        </CardHeader>
        <CardContent>
           <Table>
              <TableHeader><TableRow><TableHead>Nama Siswa</TableHead><TableHead>Kelas</TableHead><TableHead className="text-center">Jumlah Pelanggaran</TableHead><TableHead className="text-center">Total Poin</TableHead></TableRow></TableHeader>
              <TableBody>
                  {filteredSiswa.length > 0 ? filteredSiswa.map(s => (
                      <TableRow key={s.id}>
                          <TableCell className="font-medium">{s.nama}</TableCell>
                          <TableCell>{s.kelas}</TableCell>
                          <TableCell className="text-center">{s.jumlahPelanggaran}</TableCell>
                          <TableCell className="text-center">
                              <Badge variant={s.totalPoin > 50 ? "destructive" : s.totalPoin > 20 ? "secondary" : "outline"}>
                                  {s.totalPoin}
                              </Badge>
                          </TableCell>
                      </TableRow>
                  )) : (
                    <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center">
                            Tidak ada siswa yang cocok dengan pencarian Anda.
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
