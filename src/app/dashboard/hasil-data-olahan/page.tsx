
"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getSourceData, updateSourceData } from "@/lib/data-manager";
import { useToast } from "@/hooks/use-toast";
import { Download, Users, Building, Loader2, Save, Trash2 } from "lucide-react";
import StatCard from "@/components/stat-card";
import { format } from "date-fns";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";


// Tipe Data
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

export default function HasilDataOlahanPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);


  // Data
  const [daftarSiswa, setDaftarSiswa] = useState<Siswa[]>([]);
  const [daftarKelas, setDaftarKelas] = useState<Kelas[]>([]);

  // Filter
  const [selectedKelas, setSelectedKelas] = useState("Semua Kelas");
  const [searchTerm, setSearchTerm] = useState("");

  const loadData = () => {
    setIsLoading(true);
    try {
      const userRole = localStorage.getItem('userRole');
      if (userRole !== 'tata_usaha') {
        toast({ title: "Akses Ditolak", variant: "destructive" });
        router.push('/dashboard');
        return;
      }
      setDaftarSiswa(getSourceData('siswaData', []));
      setDaftarKelas(getSourceData('kelasData', []));
    } catch (error) {
      toast({ title: "Gagal Memuat Data", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    window.addEventListener('dataUpdated', loadData);
    return () => window.removeEventListener('dataUpdated', loadData);
  }, []);

  const filteredSiswa = useMemo(() => {
    let siswa = daftarSiswa;
    if (selectedKelas !== "Semua Kelas") {
      siswa = siswa.filter(s => s.kelas === selectedKelas);
    }
    if (searchTerm) {
      siswa = siswa.filter(s =>
        s.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.nis.includes(searchTerm)
      );
    }
    return siswa.sort((a,b) => a.kelas.localeCompare(b.kelas) || a.nama.localeCompare(b.nama));
  }, [daftarSiswa, selectedKelas, searchTerm]);
  
  const handleExport = () => {
    const dataToExport = filteredSiswa;
    if (dataToExport.length === 0) {
        toast({ title: "Tidak Ada Data", description: "Tidak ada data untuk diekspor sesuai filter yang dipilih.", variant: "destructive" });
        return;
    }
    
    const headers = ['ID', 'NIS', 'Nama', 'Kelas'];
    const delimiter = ';';

    const formatCell = (value: any) => {
        const stringValue = String(value || '');
        if (stringValue.includes(delimiter) || stringValue.includes('"') || stringValue.includes('\n')) {
            return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
    };
    
    const csvRows = dataToExport.map(s => [s.id, s.nis, s.nama, s.kelas].map(formatCell).join(delimiter));
    const csvContent = [headers.join(delimiter), ...csvRows].join('\n');
    
    const bom = '\uFEFF';
    const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute('download', `data_induk_siswa_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast({ title: "Ekspor Berhasil", description: "Data siswa telah diunduh sebagai file CSV." });
  };

  const handleSave = () => {
    // Data disimpan secara otomatis, jadi ini hanya untuk konfirmasi UX
    toast({ title: "Data Disimpan", description: "Semua perubahan telah berhasil disimpan." });
  };

  const handleDeleteAll = () => {
    updateSourceData('siswaData', []); // Hapus semua data siswa
    setIsDeleteDialogOpen(false);
    toast({
      title: "Data Dihapus",
      description: "Semua data siswa telah berhasil dihapus dari sistem.",
      variant: "destructive"
    });
  };

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
          <h2 className="text-3xl font-bold tracking-tight">Hasil Data Olahan Induk Siswa</h2>
          <p className="text-muted-foreground">
            Lihat, filter, dan ekspor data siswa yang ada di sistem.
          </p>
        </div>
         <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={handleSave}><Save className="mr-2 h-4 w-4" /> Simpan Perubahan</Button>
            <Button variant="outline" onClick={handleExport}><Download className="mr-2 h-4 w-4" /> Ekspor Data</Button>
            <Button variant="destructive" onClick={() => setIsDeleteDialogOpen(true)}><Trash2 className="mr-2 h-4 w-4" /> Hapus Semua Data</Button>
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        <StatCard title="Total Siswa Terdaftar" value={daftarSiswa.length.toString()} icon={<Users />} isLoading={isLoading} />
        <StatCard title="Total Kelas" value={daftarKelas.length.toString()} icon={<Building />} isLoading={isLoading} />
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Daftar Siswa</CardTitle>
              <CardDescription>
                Menampilkan {filteredSiswa.length} dari {daftarSiswa.length} total siswa.
              </CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
              <Input
                placeholder="Cari nama atau NIS..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-48"
              />
              <Select value={selectedKelas} onValueChange={setSelectedKelas}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter Kelas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Semua Kelas">Semua Kelas</SelectItem>
                  {daftarKelas.sort((a,b) => a.nama.localeCompare(b.nama)).map(k => <SelectItem key={k.id} value={k.nama}>{k.nama}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>NIS</TableHead>
                  <TableHead>Nama Siswa</TableHead>
                  <TableHead>Kelas</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSiswa.length > 0 ? (
                  filteredSiswa.map(siswa => (
                    <TableRow key={siswa.id}>
                      <TableCell>{siswa.nis}</TableCell>
                      <TableCell className="font-medium">{siswa.nama}</TableCell>
                      <TableCell>{siswa.kelas}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="h-24 text-center">
                      Tidak ada data siswa yang cocok dengan filter.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
              <AlertDialogHeader>
                  <AlertDialogTitle>Apakah Anda Yakin?</AlertDialogTitle>
                  <AlertDialogDescription>
                      Tindakan ini akan menghapus **semua** data siswa secara permanen dari sistem. Tindakan ini tidak dapat dibatalkan.
                  </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                  <AlertDialogCancel>Batal</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteAll} className="bg-destructive hover:bg-destructive/90">
                      Ya, Hapus Semua
                  </AlertDialogAction>
              </AlertDialogFooter>
          </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
