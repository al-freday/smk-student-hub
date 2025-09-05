
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getSourceData } from "@/lib/data-manager";
import { useToast } from "@/hooks/use-toast";
import { Loader2, DollarSign, Users, Check, X } from "lucide-react";
import StatCard from "@/components/stat-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// --- Tipe Data ---
interface Siswa {
  id: number;
  nis: string;
  nama: string;
  kelas: string;
}
interface Kelas {
  id: number;
  nama: string;
}
interface Pembayaran {
  [nis: string]: {
    [bulan: string]: boolean;
  };
}

const daftarBulan = [
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
  "Januari", "Februari", "Maret", "April", "Mei", "Juni"
];

const NOMINAL_KOMITE_DEFAULT = 100000;

export default function RekapPembayaranKomitePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);

  // Data
  const [daftarKelas, setDaftarKelas] = useState<Kelas[]>([]);
  const [selectedKelas, setSelectedKelas] = useState<string>("Semua Kelas");
  const [siswa, setSiswa] = useState<Siswa[]>([]);
  const [statusPembayaran, setStatusPembayaran] = useState<Pembayaran>({});
  
  const loadData = useCallback(() => {
    setIsLoading(true);
    try {
      const userRole = localStorage.getItem('userRole');
      if (userRole !== 'tata_usaha' && userRole !== 'wakasek_kesiswaan') {
        toast({ title: "Akses Ditolak", variant: "destructive" });
        router.push('/dashboard');
        return;
      }
      
      const allKelas = getSourceData('kelasData', []);
      setDaftarKelas([{ id: 0, nama: "Semua Kelas" }, ...allKelas]);
      
      const allSiswa = getSourceData('siswaData', []);
      setSiswa(allSiswa);

      setStatusPembayaran(getSourceData('pembayaranKomiteData', {}));

    } catch (error) {
      console.error("Gagal memuat data:", error);
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
    if (selectedKelas === "Semua Kelas") {
      return siswa.sort((a, b) => a.kelas.localeCompare(b.kelas) || a.nama.localeCompare(b.nama));
    }
    return siswa.filter(s => s.kelas === selectedKelas).sort((a,b) => a.nama.localeCompare(b.nama));
  }, [selectedKelas, siswa]);

  const stats = useMemo(() => {
    let totalTerbayar = 0;
    let totalTunggakan = 0;
    
    filteredSiswa.forEach(s => {
      const nominal = getSourceData(`nominalKomite_${s.kelas}`, NOMINAL_KOMITE_DEFAULT);
      const pembayaranSiswa = statusPembayaran[s.nis] || {};
      daftarBulan.forEach(bulan => {
        if (pembayaranSiswa[bulan]) {
          totalTerbayar += nominal;
        } else {
          totalTunggakan += nominal;
        }
      });
    });

    return { totalTerbayar, totalTunggakan };
  }, [filteredSiswa, statusPembayaran]);


  if (isLoading) {
    return (
      <div className="flex-1 flex justify-center items-center h-[calc(100vh-8rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Rekapitulasi Pembayaran Komite</h2>
            <p className="text-muted-foreground">
              Pantau status pembayaran iuran komite dari semua kelas.
            </p>
          </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard title="Total Siswa" value={filteredSiswa.length.toString()} icon={<Users/>} isLoading={isLoading} />
        <StatCard title="Total Iuran Terbayar" value={`Rp ${stats.totalTerbayar.toLocaleString('id-ID')}`} icon={<DollarSign/>} isLoading={isLoading} />
        <StatCard title="Total Tunggakan" value={`Rp ${stats.totalTunggakan.toLocaleString('id-ID')}`} icon={<DollarSign/>} isNegative={stats.totalTunggakan > 0} isLoading={isLoading} />
      </div>

      <Card>
        <CardHeader>
           <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Daftar Pembayaran Komite</CardTitle>
              <CardDescription>
                Data ini hanya untuk dilihat dan tidak dapat diubah dari halaman ini. Perubahan dilakukan oleh Wali Kelas.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
                <Label htmlFor="kelas-filter">Filter Kelas</Label>
                <Select value={selectedKelas} onValueChange={setSelectedKelas}>
                    <SelectTrigger id="kelas-filter" className="w-[180px]">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {daftarKelas.map(k => <SelectItem key={k.id} value={k.nama}>{k.nama}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table className="min-w-full">
            <TableHeader>
              <TableRow>
                <TableHead className="sticky left-0 bg-card z-10 w-1/5">Nama Siswa</TableHead>
                <TableHead>Kelas</TableHead>
                {daftarBulan.map(bulan => (
                  <TableHead key={bulan} className="text-center">{bulan}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSiswa.map(s => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium sticky left-0 bg-card z-10">{s.nama}</TableCell>
                  <TableCell>{s.kelas}</TableCell>
                  {daftarBulan.map(bulan => (
                    <TableCell key={bulan} className="text-center">
                      {statusPembayaran[s.nis]?.[bulan] 
                        ? <Check className="h-5 w-5 text-green-500 mx-auto" /> 
                        : <X className="h-5 w-5 text-red-500 mx-auto" />}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
