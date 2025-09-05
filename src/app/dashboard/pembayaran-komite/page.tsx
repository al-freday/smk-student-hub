
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getSourceData, updateSourceData } from "@/lib/data-manager";
import { useToast } from "@/hooks/use-toast";
import { Loader2, DollarSign, Save, FileText, Users } from "lucide-react";
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
interface Pembayaran {
  [nis: string]: {
    [bulan: string]: boolean; // true jika lunas, false/undefined jika belum
  };
}
interface Riwayat {
    id: string;
    tanggal: string;
    nis: string;
    namaSiswa: string;
    kelas: string;
    bulan: string;
    dicatatOleh: string;
}

const daftarBulan = [
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
  "Januari", "Februari", "Maret", "April", "Mei", "Juni"
];

const NOMINAL_KOMITE_DEFAULT = 100000;

export default function PembayaranKomitePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);

  // Data
  const [kelasBinaan, setKelasBinaan] = useState<string[]>([]);
  const [selectedKelas, setSelectedKelas] = useState<string>("");
  const [siswaDiKelas, setSiswaDiKelas] = useState<Siswa[]>([]);
  const [statusPembayaran, setStatusPembayaran] = useState<Pembayaran>({});
  const [riwayatPembayaran, setRiwayatPembayaran] = useState<Riwayat[]>([]);
  const [currentUser, setCurrentUser] = useState<{ nama: string } | null>(null);
  const [nominalKomite, setNominalKomite] = useState<number>(NOMINAL_KOMITE_DEFAULT);
  
  const storageKeyNominal = useMemo(() => `nominalKomite_${selectedKelas}`, [selectedKelas]);

  const loadData = useCallback(() => {
    setIsLoading(true);
    try {
      const user = getSourceData('currentUser', null);
      if (!user || localStorage.getItem('userRole') !== 'wali_kelas') {
        toast({ title: "Akses Ditolak", variant: "destructive" });
        router.push('/dashboard');
        return;
      }
      setCurrentUser(user);

      const teachersData = getSourceData('teachersData', {});
      const waliKelasData = teachersData.wali_kelas?.find((wk: any) => wk.nama === user.nama);
      const binaan = waliKelasData?.kelas || [];
      setKelasBinaan(binaan);
      
      if (binaan.length > 0) {
        if (!selectedKelas) {
            setSelectedKelas(binaan[0]);
        }
      }
      
      setStatusPembayaran(getSourceData('pembayaranKomiteData', {}));
      setRiwayatPembayaran(getSourceData('riwayatPembayaranKomite', []));

    } catch (error) {
      console.error("Gagal memuat data:", error);
      toast({ title: "Gagal Memuat Data", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [router, toast, selectedKelas]);
  
  useEffect(() => {
    const savedNominal = getSourceData(storageKeyNominal, NOMINAL_KOMITE_DEFAULT);
    setNominalKomite(savedNominal);
  }, [storageKeyNominal]);

  useEffect(() => {
    loadData();
    window.addEventListener('dataUpdated', loadData);
    return () => window.removeEventListener('dataUpdated', loadData);
  }, [loadData]);

  useEffect(() => {
    if (selectedKelas) {
      const allSiswa: Siswa[] = getSourceData('siswaData', []);
      setSiswaDiKelas(allSiswa.filter(s => s.kelas === selectedKelas));
    } else {
      setSiswaDiKelas([]);
    }
  }, [selectedKelas]);
  
  const handleNominalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.valueAsNumber;
    if (!isNaN(value)) {
        setNominalKomite(value);
        updateSourceData(storageKeyNominal, value);
    }
  };

  const handlePaymentChange = (nis: string, bulan: string, lunas: boolean) => {
    setStatusPembayaran(prev => {
      const newStatus = JSON.parse(JSON.stringify(prev));
      if (!newStatus[nis]) {
        newStatus[nis] = {};
      }
      newStatus[nis][bulan] = lunas;
      return newStatus;
    });
  };
  
  const handleSaveChanges = () => {
    updateSourceData('pembayaranKomiteData', statusPembayaran);

    const siswaLookup = new Map(siswaDiKelas.map(s => [s.nis, s]));
    const newHistory: Riwayat[] = [];
    
    for (const nis in statusPembayaran) {
        const siswa = siswaLookup.get(nis);
        if (siswa) {
            for (const bulan in statusPembayaran[nis]) {
                if (statusPembayaran[nis][bulan]) { // if paid
                    const recordId = `${new Date().toISOString()}-${nis}-${bulan}`;
                     newHistory.push({
                        id: recordId,
                        tanggal: new Date().toISOString(),
                        nis: nis,
                        namaSiswa: siswa.nama,
                        kelas: siswa.kelas,
                        bulan: bulan,
                        dicatatOleh: currentUser?.nama || 'Wali Kelas',
                    });
                }
            }
        }
    }
    
    toast({
      title: "Perubahan Disimpan",
      description: "Status pembayaran komite telah berhasil diperbarui.",
    });
  };

  const totalTunggakan = useMemo(() => {
    let tunggakan = 0;
    siswaDiKelas.forEach(siswa => {
      const pembayaranSiswa = statusPembayaran[siswa.nis] || {};
      daftarBulan.forEach(bulan => {
        if (!pembayaranSiswa[bulan]) {
          tunggakan += nominalKomite;
        }
      });
    });
    return tunggakan;
  }, [siswaDiKelas, statusPembayaran, nominalKomite]);


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
            <h2 className="text-3xl font-bold tracking-tight">Pembayaran Komite</h2>
            <p className="text-muted-foreground">
              Kelola dan pantau status pembayaran komite untuk siswa binaan Anda.
            </p>
          </div>
          <div className="flex items-center gap-2">
             {kelasBinaan.length > 1 && (
                <Select value={selectedKelas} onValueChange={setSelectedKelas}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Pilih Kelas" />
                    </SelectTrigger>
                    <SelectContent>
                        {kelasBinaan.map(k => <SelectItem key={k} value={k}>{k}</SelectItem>)}
                    </SelectContent>
                </Select>
             )}
             <Button onClick={handleSaveChanges}><Save className="mr-2 h-4 w-4" /> Simpan Perubahan</Button>
          </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard title="Total Siswa" value={siswaDiKelas.length.toString()} icon={<Users/>} isLoading={isLoading} />
        <StatCard title="Total Tunggakan" value={`Rp ${totalTunggakan.toLocaleString('id-ID')}`} icon={<DollarSign/>} isNegative={totalTunggakan > 0} isLoading={isLoading} />
        <Card>
            <CardHeader><CardTitle>Informasi Iuran</CardTitle></CardHeader>
            <CardContent>
                <div className="space-y-2">
                    <Label htmlFor="nominal-komite">Nominal Iuran Komite per Bulan</Label>
                    <div className="flex items-center gap-2">
                        <span className="font-semibold">Rp</span>
                        <Input
                            id="nominal-komite"
                            type="number"
                            value={nominalKomite}
                            onChange={handleNominalChange}
                            className="w-full"
                            step="5000"
                        />
                    </div>
                </div>
            </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Pembayaran Komite Kelas {selectedKelas}</CardTitle>
          <CardDescription>
            Beri centang pada bulan yang sudah lunas. Perubahan akan tersimpan saat Anda menekan tombol 'Simpan'.
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table className="min-w-full">
            <TableHeader>
              <TableRow>
                <TableHead className="sticky left-0 bg-card z-10 w-1/4">Nama Siswa</TableHead>
                {daftarBulan.map(bulan => (
                  <TableHead key={bulan} className="text-center">{bulan}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {siswaDiKelas.map(siswa => (
                <TableRow key={siswa.id}>
                  <TableCell className="font-medium sticky left-0 bg-card z-10">{siswa.nama}</TableCell>
                  {daftarBulan.map(bulan => (
                    <TableCell key={bulan} className="text-center">
                      <Checkbox
                        checked={statusPembayaran[siswa.nis]?.[bulan] || false}
                        onCheckedChange={(checked) => handlePaymentChange(siswa.nis, bulan, !!checked)}
                        aria-label={`Status pembayaran ${siswa.nama} untuk bulan ${bulan}`}
                      />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
       <Card>
        <CardHeader>
          <CardTitle>Rekapan & Riwayat Pembayaran</CardTitle>
          <CardDescription>
            Menampilkan riwayat pembayaran yang telah dicatat (fitur dalam pengembangan).
          </CardDescription>
        </CardHeader>
        <CardContent>
            <div className="text-center text-muted-foreground p-8 border-2 border-dashed rounded-lg">
                <FileText className="mx-auto h-10 w-10 mb-4" />
                <p>Fitur riwayat pembayaran detail akan segera tersedia di sini.</p>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
